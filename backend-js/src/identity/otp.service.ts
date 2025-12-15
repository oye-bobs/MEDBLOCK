import { Injectable, Logger } from '@nestjs/common';

interface OtpRecord {
  otp: string;
  email: string;
  registrationData: any;
  expiresAt: Date;
  attempts: number;
}

@Injectable()
export class OtpService {
  private readonly logger = new Logger(OtpService.name);
  private otpStore = new Map<string, OtpRecord>();
  private readonly OTP_EXPIRY_MINUTES = 5;
  private readonly MAX_ATTEMPTS = 3;

  /**
   * Generate a 6-digit OTP
   */
  generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Store OTP for an email with registration data
   */
  storeOtp(email: string, registrationData: any): string {
    const otp = this.generateOtp();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + this.OTP_EXPIRY_MINUTES);

    this.otpStore.set(email.toLowerCase(), {
      otp,
      email: email.toLowerCase(),
      registrationData,
      expiresAt,
      attempts: 0,
    });

    this.logger.log(
      `OTP generated for ${email}, expires at ${expiresAt.toISOString()}`,
    );
    return otp;
  }

  /**
   * Verify OTP for an email
   */
  verifyOtp(
    email: string,
    otp: string,
  ): { valid: boolean; registrationData?: any; error?: string } {
    const normalizedEmail = email.toLowerCase();
    const record = this.otpStore.get(normalizedEmail);

    if (!record) {
      this.logger.warn(`No OTP found for ${email}`);
      return { valid: false, error: 'No OTP request found for this email' };
    }

    // Check expiration
    if (new Date() > record.expiresAt) {
      this.otpStore.delete(normalizedEmail);
      this.logger.warn(`OTP expired for ${email}`);
      return {
        valid: false,
        error: 'OTP has expired. Please request a new one.',
      };
    }

    // Check attempts
    if (record.attempts >= this.MAX_ATTEMPTS) {
      this.otpStore.delete(normalizedEmail);
      this.logger.warn(`Max attempts reached for ${email}`);
      return {
        valid: false,
        error:
          'Maximum verification attempts exceeded. Please request a new OTP.',
      };
    }

    // Verify OTP
    if (record.otp !== otp) {
      record.attempts++;
      this.logger.warn(
        `Invalid OTP attempt ${record.attempts}/${this.MAX_ATTEMPTS} for ${email}`,
      );
      return {
        valid: false,
        error: `Invalid OTP. ${this.MAX_ATTEMPTS - record.attempts} attempts remaining.`,
      };
    }

    // Success - return registration data and clean up
    const registrationData = record.registrationData;
    this.otpStore.delete(normalizedEmail);
    this.logger.log(`OTP verified successfully for ${email}`);
    return { valid: true, registrationData };
  }

  /**
   * Clean up expired OTPs periodically
   */
  cleanupExpiredOtps() {
    const now = new Date();
    let cleaned = 0;

    for (const [email, record] of this.otpStore.entries()) {
      if (now > record.expiresAt) {
        this.otpStore.delete(email);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      this.logger.log(`Cleaned up ${cleaned} expired OTPs`);
    }
  }

  /**
   * Get remaining time for OTP
   */
  getRemainingTime(email: string): number | null {
    const record = this.otpStore.get(email.toLowerCase());
    if (!record) return null;

    const remaining = record.expiresAt.getTime() - new Date().getTime();
    return remaining > 0 ? remaining : 0;
  }
}
