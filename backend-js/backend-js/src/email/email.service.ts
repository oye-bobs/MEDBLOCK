import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
@Injectable()
export class EmailService {
    private readonly logger = new Logger(EmailService.name);

    constructor(private configService: ConfigService) {}

    async sendOtpEmail(email: string, otp: string, fullName?: string): Promise<boolean> {
        const brevoApiKey = this.configService.get<string>('BREVO_API_KEY');
        const fromEmail = this.configService.get<string>('BREVO_FROM', 'MEDBLOCK <noreply@medblock.com>'); // Default if BREVO_FROM is not set

        if (!brevoApiKey) {
            this.logger.warn('Brevo API key not configured. Email not sent. Logging OTP for development.');
            this.logger.log(`[DEV MODE] OTP for ${email}: ${otp}`);
            return false;
        }

        const subject = 'MEDBLOCK - Email Verification Code';
        const text = `Your MEDBLOCK verification code is: ${otp}\n\nThis code is valid for 5 minutes.\n\nIf you didn't request this code, please ignore this email.`;
        const html = `
<!DOCTYPE html>
<html>
<head></head>
<body>
    <div style="font-family:Segoe UI,Tahoma,Geneva,Verdana,sans-serif;background-color:#f4f4f4;margin:0;padding:0;">
        <div style="max-width:600px;margin:40px auto;background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
            <div style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:white;padding:30px;text-align:center;">
                <h1 style="margin:0;font-size:28px;">🏥 MEDBLOCK</h1>
                <p style="margin:10px 0 0 0;opacity:0.9;">Healthcare Identity Verification</p>
            </div>
            <div style="padding:40px 30px;">
                <h2 style="color:#333;margin-top:0;">Email Verification</h2>
                <p style="color:#666;font-size:14px;line-height:1.6;">${fullName ? `Hello ${fullName},` : 'Hello,'}</p>
                <p style="color:#666;font-size:14px;line-height:1.6;">Thank you for registering with MEDBLOCK. To complete your registration, please use the following One-Time Password (OTP):</p>
                <div style="background-color:#f8f9fa;border:2px dashed #667eea;border-radius:8px;padding:20px;text-align:center;margin:30px 0;">
                    <div style="color:#666;font-size:14px;margin-bottom:10px;">Your OTP Code</div>
                    <div style="font-size:36px;font-weight:bold;color:#667eea;letter-spacing:8px;font-family:'Courier New',monospace;">${otp}</div>
                </div>
                <div style="background-color:#fff3cd;border-left:4px solid #ffc107;padding:15px;margin:20px 0;color:#856404;">
                    <strong>⚠️ Important:</strong>
                    <ul style="margin:10px 0;padding-left:20px;">
                        <li>This OTP is valid for <strong>5 minutes</strong></li>
                        <li>Do not share this code with anyone</li>
                        <li>MEDBLOCK will never ask for your OTP via phone or email</li>
                    </ul>
                </div>
                <p style="color:#666;font-size:14px;line-height:1.6;">If you didn't request this verification code, please ignore this email or contact our support team if you have concerns.</p>
            </div>
            <div style="background-color:#f8f9fa;padding:20px;text-align:center;color:#999;font-size:12px;">
                <p>© ${new Date().getFullYear()} MEDBLOCK - Decentralized Healthcare Identity Platform</p>
                <p>This is an automated message, please do not reply to this email.</p>
            </div>
        </div>
    </div>
</body>
</html>`;

        try {
            const senderEmail = fromEmail.match(/<(.+?)>/)?.[1] || fromEmail;
            const senderName = fromEmail.replace(/<.*?>/, '').trim() || 'MEDBLOCK';

            const res = await fetch('https://api.brevo.com/v3/smtp/email', {
                method: 'POST',
                headers: {
                    'api-key': brevoApiKey,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    sender: { email: senderEmail, name: senderName },
                    to: [{ email }],
                    subject,
                    htmlContent: html,
                    textContent: text
                })
            });

            if (res.ok) {
                this.logger.log(`OTP email sent via Brevo API to ${email}`);
                return true;
            }
            const body = await res.text();
            this.logger.error(`Brevo API failed for ${email}: ${res.status} ${body}`);
        } catch (err: any) {
            this.logger.error(`Brevo API error for ${email}: ${err.message}`);
        }

        this.logger.warn('Email not sent. Logging OTP for development.');
        this.logger.log(`[DEV MODE] OTP for ${email}: ${otp}`);
        return false;
    }
}
