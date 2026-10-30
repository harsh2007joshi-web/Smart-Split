import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db, StoredUser } from '../db/database';
import { emailService } from '../services/email';
import { twoFactorService } from '../services/twoFactorService';
import { JWT_SECRET, AuthenticatedRequest, authenticateToken } from '../middleware/auth';

const router = Router();

// Helper to generate JWT
function generateUserToken(user: StoredUser, rememberMe: boolean = false): string {
  const expiresIn = rememberMe ? '30d' : '7d';
  return jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn });
}

// 0. SEND 2FACTOR.IN PHONE OTP (SMS)
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

    // Persist OTP locally as fallback
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

// 0.1 VERIFY 2FACTOR.IN PHONE OTP
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

    // Try online 2factor.in verification
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

// 1. REGISTER
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, phoneNumber, password, confirmPassword, agreeTerms, otpMethod = 'PHONE' } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ error: 'Please fill in all required fields.' });
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

    let phoneDispatch = null;
    let emailResult = null;

    // Send 2Factor.in Phone SMS OTP if phone provided
    if (phoneNumber && phoneNumber.trim()) {
      const smsRes = await twoFactorService.sendOtp(phoneNumber.trim());
      phoneDispatch = smsRes;
      if (smsRes.otp) {
        db.savePhoneOtp(phoneNumber.trim(), smsRes.otp, smsRes.sessionId || '');
      }
    }

    // Always generate and dispatch email verification code as well
    const code = db.createVerificationOtp(newUser.id, newUser.email);
    emailResult = await emailService.sendOtp({
      to: newUser.email,
      name: newUser.name,
      code,
      type: 'VERIFICATION',
      expiryMinutes: 15,
    });

    res.status(201).json({
      message: phoneNumber
        ? 'Account created successfully! 6-digit OTP code sent via 2Factor.in SMS and email.'
        : 'Account created successfully. A verification code has been sent to your email.',
      userId: newUser.id,
      email: newUser.email,
      phoneNumber: newUser.phoneNumber,
      requiresVerification: true,
      emailDispatch: emailResult,
      phoneDispatch,
    });
  } catch (err: any) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Internal server error during registration.' });
  }
});

// 2. VERIFY EMAIL OR PHONE OTP
router.post('/verify-email', async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, code } = req.body;

    if (!userId || !code) {
      res.status(400).json({ error: 'User ID and verification code are required.' });
      return;
    }

    const user = db.findUserById(userId);
    if (!user) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }

    // Check email OTP first
    let verificationResult = db.verifyEmailOtp(userId, code);

    // If not matched, check if it matches phone OTP via 2factor.in
    if (!verificationResult.success && user.phoneNumber) {
      const phoneCheck = db.verifyPhoneOtpLocally(user.phoneNumber, code);
      if (phoneCheck.success) {
        db.updateUser(userId, { isEmailVerified: true, isPhoneVerified: true });
        verificationResult = { success: true, message: 'Phone number verified via 2Factor.in!' };
      }
    }

    if (!verificationResult.success) {
      res.status(400).json({ error: verificationResult.message });
      return;
    }

    db.syncUserWithGroups(user);
    const token = generateUserToken(user, true);

    res.json({
      message: 'Email verified successfully!',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        isEmailVerified: user.isEmailVerified,
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Verification failed.' });
  }
});

// 3. RESEND VERIFICATION OTP
router.post('/resend-verification', async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.body;
    const user = db.findUserById(userId);
    if (!user) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }

    const code = db.createVerificationOtp(user.id, user.email);
    const emailResult = await emailService.sendOtp({
      to: user.email,
      name: user.name,
      code,
      type: 'VERIFICATION',
      expiryMinutes: 15,
    });

    res.json({
      message: `A new verification code was sent to ${user.email}`,
      emailDispatch: emailResult,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to resend code.' });
  }
});

// 4. LOGIN
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, rememberMe } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required.' });
      return;
    }

    const user = db.findUserByEmail(email);
    if (!user) {
      // Generic error message for security
      res.status(401).json({ error: 'Invalid email or password. Please try again.' });
      return;
    }

    const passwordMatch = bcrypt.compareSync(password, user.passwordHash);
    if (!passwordMatch) {
      res.status(401).json({ error: 'Invalid email or password. Please try again.' });
      return;
    }

    if (!user.isEmailVerified) {
      // Send a fresh OTP if unverified
      const code = db.createVerificationOtp(user.id, user.email);
      await emailService.sendOtp({
        to: user.email,
        name: user.name,
        code,
        type: 'VERIFICATION',
        expiryMinutes: 15,
      });

      res.status(403).json({
        error: 'Please verify your email address to log in.',
        requiresVerification: true,
        userId: user.id,
        email: user.email,
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
        email: user.email,
        avatarUrl: user.avatarUrl,
        isEmailVerified: user.isEmailVerified,
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Login process error.' });
  }
});

// 5. FORGOT PASSWORD - REQUEST OTP (Supports Email OR Phone via 2factor.in)
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

    // Create challenge
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

// 6. VERIFY RESET OTP
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

// 7. RESET PASSWORD WITH TOKEN
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

// 8. GET CURRENT USER
router.get('/me', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  const user = req.user!;
  res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
      isEmailVerified: user.isEmailVerified,
      createdAt: user.createdAt,
    },
  });
});

// 9. INSTANT DEMO LOGIN (For judges & hackathon evaluation)
router.post('/demo-login', (req: Request, res: Response): void => {
  const user = db.findUserByEmail('rahul@example.com') || db.getRawData().users[0];
  if (!user) {
    res.status(404).json({ error: 'Demo user not found. Please reset demo data.' });
    return;
  }
  const token = generateUserToken(user, true);
  res.json({
    message: 'Logged in as Demo User (Rahul Sharma)',
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
      isEmailVerified: user.isEmailVerified,
    },
  });
});

// 10. RESET DEMO DATA
router.post('/reset-demo', (req: Request, res: Response): void => {
  db.resetDemoData();
  res.json({ message: 'Demo database has been successfully reset to initial hackathon state.' });
});

export default router;
