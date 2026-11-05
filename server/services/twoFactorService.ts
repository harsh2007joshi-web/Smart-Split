
export interface TwoFactorSendResponse {
  success: boolean;
  sessionId?: string;
  otp?: string;
  devMode: boolean;
  message: string;
}

export interface TwoFactorVerifyResponse {
  success: boolean;
  message: string;
}

class TwoFactorService {
  private apiKey: string | undefined;
  private baseUrl = 'https://2factor.in/API/V1';

  constructor() {
    this.apiKey = process.env.TWOFACTOR_API_KEY;
    if (this.apiKey) {
      console.log('📱 2Factor.in SMS Gateway API Key configured.');
    } else {
      console.log('ℹ️ TWOFACTOR_API_KEY not configured. Running 2Factor.in SMS in Development Console Mode.');
    }
  }

  private formatPhoneNumber(phone: string): string {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return cleaned;
    }
    if (cleaned.length === 12 && cleaned.startsWith('91')) {
      return cleaned.substring(2);
    }
    return cleaned;
  }

  public async sendOtp(phone: string, customOtp?: string): Promise<TwoFactorSendResponse> {
    const formattedPhone = this.formatPhoneNumber(phone);
    const otp = customOtp || Math.floor(100000 + Math.random() * 900000).toString();

    if (this.apiKey && this.apiKey !== 'your_2factor_api_key_here') {
      try {

        const url = `${this.baseUrl}/${this.apiKey}/SMS/${formattedPhone}/${otp}/SplitSmartAI`;
        const res = await fetch(url, { method: 'GET' });
        const data = await res.json();

        if (data.Status === 'Success') {
          console.log(`📱 [2FACTOR.IN] OTP dispatched to ${formattedPhone}. Session: ${data.Details}`);
          return {
            success: true,
            sessionId: data.Details,
            otp,
            devMode: false,
            message: `OTP sent via SMS to ${formattedPhone}`,
          };
        } else {
          console.warn(`⚠️ 2Factor.in error (${data.Details}), falling back to dev mode:`, data);
        }
      } catch (err: any) {
        console.warn('⚠️ 2Factor.in network request failed, falling back to dev console:', err.message);
      }
    }

    console.log('\n============================================================');
    console.log(`📱 [2FACTOR.IN SMS GATEWAY DEV MODE]`);
    console.log(`📞 Recipient Phone: +91 ${formattedPhone}`);
    console.log(`🔑 SMS OTP Code: >>> [ ${otp} ] <<<`);
    console.log(`💬 Message: "Your SplitSmart AI phone verification code is ${otp}. Valid for 10 minutes."`);
    console.log('============================================================\n');

    return {
      success: true,
      sessionId: `2F_SESSION_${Date.now()}`,
      otp,
      devMode: true,
      message: `Development Mode: SMS OTP for +91 ${formattedPhone} is [${otp}] (See server console)`,
    };
  }

  public async verifyOtp(sessionId: string, enteredOtp: string, expectedOtp?: string): Promise<TwoFactorVerifyResponse> {
    if (this.apiKey && this.apiKey !== 'your_2factor_api_key_here' && sessionId && !sessionId.startsWith('2F_SESSION_')) {
      try {

        const url = `${this.baseUrl}/${this.apiKey}/SMS/VERIFY/${sessionId}/${enteredOtp.trim()}`;
        const res = await fetch(url, { method: 'GET' });
        const data = await res.json();

        if (data.Status === 'Success' && data.Details === 'OTP Matched') {
          return { success: true, message: 'Phone number verified successfully via 2Factor.in!' };
        } else {
          return { success: false, message: data.Details || 'Invalid OTP code entered.' };
        }
      } catch (err: any) {
        console.warn('2Factor verify network failed, checking local fallback:', err.message);
      }
    }

    if (expectedOtp && enteredOtp.trim() === expectedOtp.trim()) {
      return { success: true, message: 'Phone number verified successfully!' };
    }

    return { success: false, message: 'Incorrect OTP entered. Please check and try again.' };
  }
}

export const twoFactorService = new TwoFactorService();
