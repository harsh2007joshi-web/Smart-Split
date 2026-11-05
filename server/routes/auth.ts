import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db, StoredUser } from '../db/database';
import { emailService } from '../services/email';
import { twoFactorService } from '../services/twoFactorService';
import { JWT_SECRET, AuthenticatedRequest, authenticateToken } from '../middleware/auth';

const router = Router();

function generateUserToken(user: StoredUser, rememberMe: boolean = false): string {
  const expiresIn = rememberMe ? '30d' : '7d';
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        phoneNumber: user.phoneNumber,
        gender: user.gender,
        avatarUrl: user.avatarUrl,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified,
      },
    },
    JWT_SECRET,
    { expiresIn }
  );
}

router.post('/send-phone-otp', async (req: Request, res: Response): Promise<void> => {
  try {
    const { phone } = req.body;
    if (!phone) {
      res.status(400).json({ error: 'Mobile phone number is required.' });
      return;
    }

    const smsRes = await twoFactorService.sendOtp(phone);
    if (!smsRes.success) {
      res.status(500).json({ error: 'Failed to dispatch SMS OTP.' });
      return;
    }

    db.savePhoneOtp(phone, smsRes.otp || '', smsRes.sessionId || '');

    res.json({
      success: true,
      message: smsRes.message,
      sessionId: smsRes.sessionId,
      devMode: smsRes.devMode,
    });
  } catch (err: any) {
    console.error('Send phone OTP error:', err);
    res.status(500).json({ error: 'Internal error sending SMS.' });
  }
});

router.post('/verify-phone-otp', async (req: Request, res: Response): Promise<void> => {
  try {
    const { phone, otp, sessionId } = req.body;
    if (!phone || !otp) {
      res.status(400).json({ error: 'Phone number and 6-digit OTP code are required.' });
      return;
    }

    const localCheck = db.verifyPhoneOtpLocally(phone, otp);
    if (localCheck.success) {
      res.json({ success: true, message: 'Phone number successfully verified!' });
      return;
    }

    const verifyRes = await twoFactorService.verifyOtp(sessionId, otp);
    if (verifyRes.success) {
      res.json({ success: true, message: verifyRes.message });
    } else {
      res.status(400).json({ error: verifyRes.message || 'Incorrect OTP code.' });
    }
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to verify phone OTP.' });
  }
});

router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, phoneNumber, password, confirmPassword, agreeTerms, otpMethod = 'PHONE' } = req.body;

    if (!name || !email || !password || !confirmPassword) {
      res.status(400).json({ error: 'Please fill in all required fields.' });
      return;
    }

    if (!phoneNumber || !phoneNumber.toString().trim()) {
      res.status(400).json({ error: 'Mobile phone number is mandatory to create an account.' });
      return;
    }

    const cleanPhone = phoneNumber.toString().trim().replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      res.status(400).json({ error: 'Please enter a valid 10-digit mobile phone number.' });
      return;
    }

    if (password !== confirmPassword) {
      res.status(400).json({ error: 'Passwords do not match.' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters long.' });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ error: 'Please enter a valid email address.' });
      return;
    }

    const existingUser = db.findUserByEmail(email);
    if (existingUser) {
      res.status(409).json({ error: 'An account with this email address already exists. Please log in.' });
      return;
    }

    const existingPhoneUser = db.findUserByPhone(cleanPhone);
    if (existingPhoneUser) {
      res.status(409).json({ error: 'An account with this mobile phone number already exists. Please log in.' });
      return;
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);

    const newUser = db.createUser({
      name: name.trim(),
      email: email.trim(),
      phoneNumber: phoneNumber?.trim(),
      isPhoneVerified: false,
      passwordHash,
      isEmailVerified: false,
    });

    let phoneDispatch: any = null;
    let emailResult: any = null;

    if (phoneNumber && phoneNumber.trim()) {
      try {
        const smsRes = await Promise.race([
          twoFactorService.sendOtp(phoneNumber.trim()),
          new Promise<any>((resolve) =>
            setTimeout(
              () =>
                resolve({
                  success: true,
                  devMode: true,
                  otp: Math.floor(100000 + Math.random() * 900000).toString(),
                  message: 'Dev fallback OTP',
                }),
              2500
            )
          ),
        ]);
        phoneDispatch = smsRes;
        if (smsRes?.otp) {
          db.savePhoneOtp(phoneNumber.trim(), smsRes.otp, smsRes.sessionId || '');
        }
      } catch (smsErr) {
        console.warn('SMS dispatch warning (proceeding with registration):', smsErr);
      }
    }

    let code = '';
    try {
      code = db.createVerificationOtp(newUser.id, newUser.email);
      emailResult = await emailService.sendOtp({
        to: newUser.email,
        name: newUser.name,
        code,
        type: 'VERIFICATION',
        expiryMinutes: 15,
      });
    } catch (emailErr) {
      console.warn('Email dispatch warning (proceeding with registration):', emailErr);
    }

    const signupToken = jwt.sign(
      {
        userId: newUser.id,
        name: newUser.name,
        username: newUser.username,
        email: newUser.email,
        phoneNumber: newUser.phoneNumber,
        passwordHash: newUser.passwordHash,
        otpCode: code,
      },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(201).json({
      message: phoneNumber
        ? 'Account created successfully! 6-digit OTP code sent to your email.'
        : 'Account created successfully. A verification code has been sent to your email.',
      userId: newUser.id,
      username: newUser.username,
      email: newUser.email,
      phoneNumber: newUser.phoneNumber,
      signupToken,
      requiresVerification: true,
      emailDispatch: emailResult,
      phoneDispatch,
    });
  } catch (err: any) {
    console.error('Registration error:', err);
    res.status(500).json({ error: err.message || 'Internal server error during registration.' });
  }
});

router.post('/verify-email', async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, code, email, signupToken } = req.body;

    if (!code || (!userId && !email && !signupToken)) {
      res.status(400).json({ error: 'Verification code is required.' });
      return;
    }

    let decodedSignup: any = null;
    if (signupToken) {
      try {
        decodedSignup = jwt.verify(signupToken, JWT_SECRET) as any;
      } catch (tokenErr) {
        console.warn('Signup token verification note:', tokenErr);
      }
    }

    const targetUserId = userId || decodedSignup?.userId;
    const targetEmail = (email || decodedSignup?.email || '').trim().toLowerCase();

    let user = targetUserId ? db.findUserById(targetUserId) : undefined;
    if (!user && targetEmail) {
      user = db.findUserByEmail(targetEmail);
    }

    // Reconstruct user if missing from cold lambda container
    if (!user && decodedSignup) {
      user = db.createUser({
        id: decodedSignup.userId,
        name: decodedSignup.name,
        username: decodedSignup.username,
        email: decodedSignup.email,
        phoneNumber: decodedSignup.phoneNumber,
        passwordHash: decodedSignup.passwordHash,
        isEmailVerified: false,
        isPhoneVerified: false,
      });
      if (decodedSignup.otpCode) {
        db.saveVerificationOtp(user.id, user.email, decodedSignup.otpCode);
      }
    }

    if (!user) {
      res.status(404).json({ error: 'User not found. Please try registering again.' });
      return;
    }

    const trimmedCode = String(code).trim();
    let isCodeValid = false;

    if (decodedSignup && decodedSignup.otpCode && decodedSignup.otpCode.trim() === trimmedCode) {
      isCodeValid = true;
    } else {
      const verificationResult = db.verifyEmailOtp(user.id, trimmedCode);
      if (verificationResult.success) {
        isCodeValid = true;
      } else if (user.phoneNumber) {
        const phoneCheck = db.verifyPhoneOtpLocally(user.phoneNumber, trimmedCode);
        if (phoneCheck.success) {
          isCodeValid = true;
        }
      }
    }

    if (!isCodeValid) {
      res.status(400).json({ error: 'Incorrect verification code. Please check your email and try again.' });
      return;
    }

    db.updateUser(user.id, { isEmailVerified: true, isPhoneVerified: true });
    user.isEmailVerified = true;
    user.isPhoneVerified = true;

    db.syncUserWithGroups(user);
    const token = generateUserToken(user, true);

    res.json({
      message: 'Email verified successfully!',
      token,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        gender: user.gender,
        phoneNumber: user.phoneNumber,
        avatarUrl: user.avatarUrl,
        isEmailVerified: user.isEmailVerified,
      },
    });
  } catch (err: any) {
    console.error('Verification error:', err);
    res.status(500).json({ error: err.message || 'Verification failed.' });
  }
});

router.post('/resend-verification', async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, email, signupToken } = req.body;
    let decodedSignup: any = null;
    if (signupToken) {
      try {
        decodedSignup = jwt.verify(signupToken, JWT_SECRET) as any;
      } catch {}
    }

    const targetUserId = userId || decodedSignup?.userId;
    const targetEmail = (email || decodedSignup?.email || '').trim().toLowerCase();

    let user = targetUserId ? db.findUserById(targetUserId) : undefined;
    if (!user && targetEmail) {
      user = db.findUserByEmail(targetEmail);
    }

    if (!user && decodedSignup) {
      user = db.createUser({
        id: decodedSignup.userId,
        name: decodedSignup.name,
        username: decodedSignup.username,
        email: decodedSignup.email,
        phoneNumber: decodedSignup.phoneNumber,
        passwordHash: decodedSignup.passwordHash,
        isEmailVerified: false,
        isPhoneVerified: false,
      });
    }

    if (!user) {
      res.status(404).json({ error: 'User not found. Please try registering again.' });
      return;
    }

    const code = db.createVerificationOtp(user.id, user.email);
    const newSignupToken = jwt.sign(
      {
        userId: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        phoneNumber: user.phoneNumber,
        passwordHash: user.passwordHash,
        otpCode: code,
      },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    let emailResult: any = null;
    try {
      emailResult = await emailService.sendOtp({
        to: user.email,
        name: user.name,
        code,
        type: 'VERIFICATION',
        expiryMinutes: 15,
      });
    } catch (e) {
      console.warn('Resend email warning:', e);
    }

    res.json({
      message: `A new verification code was sent to ${user.email}`,
      emailDispatch: emailResult,
      signupToken: newSignupToken,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to resend code.' });
  }
});

router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, rememberMe } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required.' });
      return;
    }

    const user = db.findUserByEmail(email);
    if (!user) {
      res.status(401).json({ error: 'Invalid email or password. Please try again.' });
      return;
    }

    const passwordMatch = bcrypt.compareSync(password, user.passwordHash);
    if (!passwordMatch) {
      res.status(401).json({ error: 'Invalid email or password. Please try again.' });
      return;
    }

    if (!user.isEmailVerified) {
      const code = db.createVerificationOtp(user.id, user.email);
      const signupToken = jwt.sign(
        {
          userId: user.id,
          name: user.name,
          username: user.username,
          email: user.email,
          phoneNumber: user.phoneNumber,
          passwordHash: user.passwordHash,
          otpCode: code,
        },
        JWT_SECRET,
        { expiresIn: '1h' }
      );

      try {
        await emailService.sendOtp({
          to: user.email,
          name: user.name,
          code,
          type: 'VERIFICATION',
          expiryMinutes: 15,
        });
      } catch (e) {
        console.warn('Login verification email warning:', e);
      }

      res.status(403).json({
        error: 'Please verify your email address to log in.',
        requiresVerification: true,
        userId: user.id,
        email: user.email,
        signupToken,
      });
      return;
    }

    db.syncUserWithGroups(user);
    const token = generateUserToken(user, !!rememberMe);

    res.json({
      message: 'Login successful.',
      token,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        gender: user.gender,
        avatarUrl: user.avatarUrl,
        isEmailVerified: user.isEmailVerified,
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Login process error.' });
  }
});

router.post('/forgot-password', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, phone } = req.body;
    const targetIdentifier = (email || phone || '').trim();

    if (!targetIdentifier) {
      res.status(400).json({ error: 'Please enter your registered email address or mobile phone number.' });
      return;
    }

    const isPhone = /^\+?\d{10,13}$/.test(targetIdentifier.replace(/\s+/g, ''));
    let user = isPhone
      ? db.findUserByPhone(targetIdentifier)
      : db.findUserByEmail(targetIdentifier);

    const { challengeId, otp } = db.createPasswordResetChallenge(user ? user.email : targetIdentifier);

    let phoneDispatch = null;
    let emailDispatch = null;

    if (isPhone || (user && user.phoneNumber)) {
      const ph = isPhone ? targetIdentifier : user!.phoneNumber!;
      phoneDispatch = await twoFactorService.sendOtp(ph, otp);
      db.savePhoneOtp(ph, otp, challengeId);
    }

    if (user) {
      emailDispatch = await emailService.sendOtp({
        to: user.email,
        name: user.name,
        code: otp,
        type: 'PASSWORD_RESET',
        expiryMinutes: 10,
      });
    }

    res.json({
      message: isPhone
        ? 'A 6-digit password recovery code has been sent via 2Factor.in SMS to your phone.'
        : 'If an account exists with this credential, a 6-digit recovery code has been dispatched.',
      challengeId,
      phoneDispatch,
      emailDispatch,
    });
  } catch (err) {
    res.status(500).json({ error: 'Password recovery error.' });
  }
});

router.post('/verify-reset-otp', async (req: Request, res: Response): Promise<void> => {
  try {
    const { challengeId, otp } = req.body;

    if (!challengeId || !otp) {
      res.status(400).json({ error: 'Challenge ID and 6-digit OTP code are required.' });
      return;
    }

    const result = db.verifyResetOtp(challengeId, otp);
    if (!result.success) {
      res.status(400).json({ error: result.message });
      return;
    }

    res.json({
      message: 'OTP verified successfully.',
      resetToken: result.resetToken,
    });
  } catch (err) {
    res.status(500).json({ error: 'OTP verification failed.' });
  }
});

router.post('/reset-password', async (req: Request, res: Response): Promise<void> => {
  try {
    const { resetToken, newPassword, confirmPassword } = req.body;

    if (!resetToken || !newPassword) {
      res.status(400).json({ error: 'Reset token and new password are required.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      res.status(400).json({ error: 'Passwords do not match.' });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters long.' });
      return;
    }

    const salt = bcrypt.genSaltSync(10);
    const newHash = bcrypt.hashSync(newPassword, salt);

    const result = db.completePasswordReset(resetToken, newHash);
    if (!result.success) {
      res.status(400).json({ error: result.message });
      return;
    }

    res.json({
      message: 'Your password has been reset successfully. You can now log in with your new credentials.',
    });
  } catch (err) {
    res.status(500).json({ error: 'Password reset execution error.' });
  }
});

router.get('/me', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  const user = req.user!;
  res.json({
    user: {
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      gender: user.gender,
      avatarUrl: user.avatarUrl,
      isEmailVerified: user.isEmailVerified,
      createdAt: user.createdAt,
    },
  });
});

router.post('/demo-login', (_req: Request, res: Response): void => {
  res.status(403).json({ error: 'Demo login has been disabled.' });
});

router.post('/reset-demo', (_req: Request, res: Response): void => {
  res.status(403).json({ error: 'Demo reset has been disabled.' });
});

export default router;
