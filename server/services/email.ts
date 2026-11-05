import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

interface SendOtpOptions {
  to: string;
  name?: string;
  code: string;
  type: 'VERIFICATION' | 'PASSWORD_RESET';
  expiryMinutes?: number;
}

interface SendShareLinkOptions {
  to: string;
  friendName?: string;
  senderName: string;
  linkUrl: string;
  customMessage?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private isSmtpConfigured: boolean = false;
  private resendApiKey: string | null = null;

  constructor() {
    this.init();
  }

  public init(): void {
    this.resendApiKey = process.env.RESEND_API_KEY ? process.env.RESEND_API_KEY.trim() : null;

    const host = process.env.SMTP_HOST?.trim();
    const port = parseInt(process.env.SMTP_PORT || '587', 10);
    const user = process.env.SMTP_USER?.trim();
    const pass = process.env.SMTP_PASS?.trim().replace(/\s+/g, '');
    const service = process.env.SMTP_SERVICE?.trim();

    if (this.resendApiKey) {
      console.log('✅ Resend Email API connected successfully.');
    }

    if (service === 'gmail' || host?.includes('gmail')) {
      if (user && pass) {
        try {
          this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: { user, pass },
          });
          this.isSmtpConfigured = true;
          console.log(`✅ Gmail SMTP Email service configured successfully for ${user}.`);
        } catch (err) {
          console.warn('⚠️ Failed to initialize Gmail SMTP transport:', err);
        }
      }
    } else if (host && user && pass) {
      try {
        this.transporter = nodemailer.createTransport({
          host,
          port,
          secure: port === 465,
          auth: { user, pass },
        });
        this.isSmtpConfigured = true;
        console.log(`✅ SMTP Email service configured successfully (${host}:${port}).`);
      } catch (err) {
        console.warn('⚠️ Failed to initialize SMTP transport:', err);
      }
    }

    if (!this.resendApiKey && !this.isSmtpConfigured) {
      console.log('ℹ️ No active email API/SMTP configured. EmailService running in Development Console mode.');
    }
  }

  public isReady(): boolean {
    return Boolean(this.resendApiKey || this.isSmtpConfigured);
  }

  public getProviderStatus(): { ready: boolean; provider: string } {
    if (this.isSmtpConfigured) return { ready: true, provider: 'Gmail SMTP' };
    if (this.resendApiKey) return { ready: true, provider: 'Resend API' };
    return { ready: false, provider: 'Development Console (Log only)' };
  }

  private async dispatchHtmlEmail(options: {
    to: string;
    subject: string;
    html: string;
    textFallback?: string;
  }): Promise<{ delivered: boolean; devMode: boolean; error?: string }> {
    const { to, subject, html, textFallback } = options;
    const fromAddress = process.env.SMTP_FROM || process.env.EMAIL_FROM || 'SplitSmart AI <harsh2007joshi@gmail.com>';

    if (this.isSmtpConfigured && this.transporter) {
      try {
        await this.transporter.sendMail({
          from: fromAddress,
          to,
          subject,
          html,
          text: textFallback,
        });
        console.log(`✉️ Email successfully dispatched to ${to} via Gmail SMTP.`);
        return { delivered: true, devMode: false };
      } catch (err: any) {
        console.warn(`⚠️ Failed to send email via SMTP to ${to} (trying fallback):`, err.message);
      }
    }

    if (this.resendApiKey) {
      try {
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: process.env.RESEND_FROM || 'SplitSmart AI <onboarding@resend.dev>',
            to: [to],
            subject,
            html,
            text: textFallback,
          }),
        });

        if (response.ok) {
          console.log(`✉️ Email successfully dispatched to ${to} via Resend API.`);
          return { delivered: true, devMode: false };
        } else {
          const errBody = await response.text();
          console.warn(`⚠️ Resend API returned error for ${to}:`, errBody);
        }
      } catch (err: any) {
        console.warn('⚠️ Resend API fetch failed:', err.message);
      }
    }

    console.log('\n============================================================');
    console.log(`📨 [DEV EMAIL DISPATCH - CONSOLE FALLBACK]`);
    console.log(`📬 To: ${to}`);
    console.log(`📋 Subject: ${subject}`);
    if (textFallback) console.log(`📄 Summary: ${textFallback}`);
    console.log('============================================================\n');

    return { delivered: true, devMode: true };
  }

  public async sendOtp(options: SendOtpOptions): Promise<{ delivered: boolean; devMode: boolean; message: string }> {
    const { to, name = 'there', code, type, expiryMinutes = 10 } = options;
    const subject = type === 'VERIFICATION'
      ? `Verify your SplitSmart AI email [Code: ${code}]`
      : `SplitSmart AI Password Reset Code: ${code}`;

    const title = type === 'VERIFICATION' ? 'Verify Your Email Address' : 'Reset Your Password';
    const description = type === 'VERIFICATION'
      ? 'Thank you for joining SplitSmart AI. Use the 6-digit verification code below to confirm your account and start splitting expenses smarter.'
      : 'We received a request to reset your SplitSmart AI password. Enter this one-time security code to set a new password.';

    const htmlContent = `
      <div style="font-family: 'Segoe UI', Helvetica, Arial, sans-serif; max-width: 540px; margin: 0 auto; background: #F1F9FF; padding: 32px 24px; border-radius: 24px; border: 1px solid #D8E9FA;">
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="display: inline-block; background: linear-gradient(135deg, #1685F8, #0E6FD8); padding: 12px 18px; border-radius: 16px; color: #FFFFFF; font-weight: 800; font-size: 20px; letter-spacing: -0.5px; box-shadow: 0 8px 20px -4px rgba(22, 133, 248, 0.4);">
            ⚡ SplitSmart AI
          </div>
          <p style="color: #64748B; font-size: 13px; margin-top: 8px;">PayPal AI Hackathon Edition</p>
        </div>

        <div style="background: #FFFFFF; border-radius: 20px; padding: 32px 28px; box-shadow: 0 10px 30px -10px rgba(16, 39, 74, 0.08); border: 1px solid #D8E9FA; text-align: center;">
          <h2 style="color: #10274A; font-size: 22px; font-weight: 700; margin-top: 0; margin-bottom: 12px;">${title}</h2>
          <p style="color: #64748B; font-size: 15px; line-height: 1.5; margin-bottom: 24px;">Hi ${name}, ${description}</p>

          <div style="background: #F1F9FF; border: 2px dashed #BFE9FF; border-radius: 16px; padding: 18px; margin: 24px 0;">
            <div style="font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #1685F8; font-family: monospace;">
              ${code}
            </div>
            <p style="margin: 6px 0 0; font-size: 13px; color: #64748B;">Expires in ${expiryMinutes} minutes</p>
          </div>

          <p style="color: #EF4444; font-size: 13px; font-weight: 500; margin-top: 18px;">
            ⚠️ If you did not request this code, please ignore this email. Never share this code with anyone.
          </p>
        </div>

        <div style="text-align: center; margin-top: 24px; color: #64748B; font-size: 12px;">
          <p>© 2026 SplitSmart AI. Split Expenses. Smarter Together.</p>
        </div>
      </div>
    `;

    const result = await this.dispatchHtmlEmail({
      to,
      subject,
      html: htmlContent,
      textFallback: `Your verification code is: ${code} (expires in ${expiryMinutes} minutes)`,
    });

    return {
      delivered: result.delivered,
      devMode: result.devMode,
      message: result.devMode
        ? `Development Mode: OTP for ${to} is [${code}] (Check server logs)`
        : `Verification code successfully sent to ${to}`,
    };
  }

  public async sendGroupInvitation(options: {
    to: string;
    memberName: string;
    inviterName: string;
    groupName: string;
    joinUrl: string;
  }): Promise<{ delivered: boolean; devMode: boolean; message: string }> {
    const { to, memberName, inviterName, groupName, joinUrl } = options;
    const subject = `🌴 ${inviterName} invited you to join "${groupName}" on SplitSmart AI`;

    const htmlContent = `
      <div style="font-family: 'Segoe UI', Helvetica, Arial, sans-serif; max-width: 540px; margin: 0 auto; background: #F1F9FF; padding: 32px 24px; border-radius: 24px; border: 1px solid #D8E9FA;">
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="display: inline-block; background: linear-gradient(135deg, #1685F8, #0E6FD8); padding: 12px 18px; border-radius: 16px; color: #FFFFFF; font-weight: 800; font-size: 20px; box-shadow: 0 8px 20px -4px rgba(22, 133, 248, 0.4);">
            ⚡ SplitSmart AI
          </div>
          <p style="color: #64748B; font-size: 13px; margin-top: 8px;">Shared Trip & Expense Circle</p>
        </div>

        <div style="background: #FFFFFF; border-radius: 20px; padding: 32px 28px; box-shadow: 0 10px 30px -10px rgba(16, 39, 74, 0.08); border: 1px solid #D8E9FA; text-align: center;">
          <h2 style="color: #10274A; font-size: 22px; font-weight: 700; margin-top: 0;">You're Invited! 🎉</h2>
          <p style="color: #64748B; font-size: 15px; line-height: 1.6; margin: 16px 0 24px;">
            Hi <strong>${memberName}</strong>,<br/>
            <strong>${inviterName}</strong> added you to the shared trip circle <strong>"${groupName}"</strong> on SplitSmart AI.
          </p>

          <div style="background: #E9F5FE; border-radius: 16px; padding: 16px; margin: 20px 0; border: 1px solid #BFE9FF;">
            <p style="color: #1685F8; font-size: 13px; font-weight: 600; margin: 0;">
              ✨ You can now view balances, log expenses from your own device, and settle up with PayPal!
            </p>
          </div>

          <div style="margin: 28px 0 16px;">
            <a href="${joinUrl}" style="background: linear-gradient(135deg, #1685F8, #0E6FD8); color: #FFFFFF; padding: 14px 28px; border-radius: 16px; text-decoration: none; font-weight: 700; font-size: 15px; display: inline-block; box-shadow: 0 8px 20px -4px rgba(22, 133, 248, 0.5);">
              Join Trip & Add Expenses →
            </a>
          </div>

          <p style="color: #64748B; font-size: 12px; margin-top: 16px;">
            Or open this direct link in any browser:<br/>
            <a href="${joinUrl}" style="color: #1685F8; word-break: break-all; font-weight: 600;">${joinUrl}</a>
          </p>
        </div>

        <div style="text-align: center; margin-top: 24px; color: #64748B; font-size: 12px;">
          <p>© 2026 SplitSmart AI • Split Expenses. Smarter Together.</p>
        </div>
      </div>
    `;

    const result = await this.dispatchHtmlEmail({
      to,
      subject,
      html: htmlContent,
      textFallback: `${inviterName} invited you to "${groupName}" on SplitSmart AI. Open: ${joinUrl}`,
    });

    return {
      delivered: result.delivered,
      devMode: result.devMode,
      message: result.error
        ? `${result.error}`
        : result.devMode
        ? `Development Mode: Invitation link for ${to} is [${joinUrl}] (Logged in server console)`
        : `Invitation successfully emailed to ${to}`,
    };
  }

  public async sendShareLink(options: SendShareLinkOptions): Promise<{ delivered: boolean; devMode: boolean; message: string }> {
    const { to, friendName = 'Friend', senderName, linkUrl, customMessage } = options;
    const subject = `🚀 ${senderName} shared SplitSmart AI with you!`;

    const htmlContent = `
      <div style="font-family: 'Segoe UI', Helvetica, Arial, sans-serif; max-width: 540px; margin: 0 auto; background: #F1F9FF; padding: 32px 24px; border-radius: 24px; border: 1px solid #D8E9FA;">
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="display: inline-block; background: linear-gradient(135deg, #1685F8, #0E6FD8); padding: 12px 18px; border-radius: 16px; color: #FFFFFF; font-weight: 800; font-size: 20px; box-shadow: 0 8px 20px -4px rgba(22, 133, 248, 0.4);">
            ⚡ SplitSmart AI
          </div>
          <p style="color: #64748B; font-size: 13px; margin-top: 8px;">Instant Shared Link</p>
        </div>

        <div style="background: #FFFFFF; border-radius: 20px; padding: 32px 28px; box-shadow: 0 10px 30px -10px rgba(16, 39, 74, 0.08); border: 1px solid #D8E9FA; text-align: center;">
          <h2 style="color: #10274A; font-size: 22px; font-weight: 700; margin-top: 0;">Here's your link! 🎉</h2>
          <p style="color: #64748B; font-size: 15px; line-height: 1.6; margin: 16px 0 24px;">
            Hi <strong>${friendName}</strong>,<br/>
            <strong>${senderName}</strong> wants you to check out <strong>SplitSmart AI</strong>.
            ${customMessage ? `<br/><br/><em>"${customMessage}"</em>` : ''}
          </p>

          <div style="margin: 28px 0 20px;">
            <a href="${linkUrl}" style="background: linear-gradient(135deg, #1685F8, #0E6FD8); color: #FFFFFF; padding: 14px 28px; border-radius: 16px; text-decoration: none; font-weight: 700; font-size: 15px; display: inline-block; box-shadow: 0 8px 20px -4px rgba(22, 133, 248, 0.5);">
              Open SplitSmart AI Now →
            </a>
          </div>

          <p style="color: #64748B; font-size: 12px; margin-top: 16px;">
            Or copy and open this direct link in any browser:<br/>
            <a href="${linkUrl}" style="color: #1685F8; word-break: break-all; font-weight: 600;">${linkUrl}</a>
          </p>
        </div>

        <div style="text-align: center; margin-top: 24px; color: #64748B; font-size: 12px;">
          <p>© 2026 SplitSmart AI • Split Expenses. Smarter Together.</p>
        </div>
      </div>
    `;

    const result = await this.dispatchHtmlEmail({
      to,
      subject,
      html: htmlContent,
      textFallback: `${senderName} shared a link with you: ${linkUrl}`,
    });

    return {
      delivered: result.delivered,
      devMode: result.devMode,
      message: result.error
        ? `${result.error}`
        : result.devMode
        ? `Link for ${to} is [${linkUrl}] (Dev console mode)`
        : `Link successfully delivered to ${to}`,
    };
  }
}

export const emailService = new EmailService();
