import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class EncryptionService {
  private readonly logger = new Logger(EncryptionService.name);
  private readonly algorithm = 'aes-256-cbc';
  private key: Buffer;

  constructor(private configService: ConfigService) {
    const keyString = this.configService.get<string>('ENCRYPTION_KEY');
    if (keyString) {
      // Ensure key is 32 bytes (256 bits)
      if (keyString.length === 64) {
        this.key = Buffer.from(keyString, 'hex');
      } else {
        this.key = crypto.scryptSync(keyString, 'salt', 32);
      }
    } else {
      this.logger.warn(
        'ENCRYPTION_KEY not set. Using random key (data will be lost on restart).',
      );
      this.key = crypto.randomBytes(32);
    }
  }

  encrypt(text: string): string {
    if (!text) return text;

    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    // Return IV + Encrypted data
    return `${iv.toString('hex')}:${encrypted}`;
  }

  decrypt(text: string): string {
    if (!text) return text;

    try {
      const [ivHex, encryptedHex] = text.split(':');
      if (!ivHex || !encryptedHex) return text;

      const iv = Buffer.from(ivHex, 'hex');
      const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);

      let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      this.logger.error(`Decryption failed: ${error.message}`);
      return text; // Return original if decryption fails (might not be encrypted)
    }
  }

  encryptObject(obj: any): any {
    if (!obj) return obj;

    const encrypted = {};
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        encrypted[key] = this.encrypt(value);
      } else if (typeof value === 'object' && value !== null) {
        encrypted[key] = this.encryptObject(value);
      } else {
        encrypted[key] = value;
      }
    }
    return encrypted;
  }

  decryptObject(obj: any): any {
    if (!obj) return obj;

    const decrypted = {};
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        decrypted[key] = this.decrypt(value);
      } else if (typeof value === 'object' && value !== null) {
        decrypted[key] = this.decryptObject(value);
      } else {
        decrypted[key] = value;
      }
    }
    return decrypted;
  }
}
