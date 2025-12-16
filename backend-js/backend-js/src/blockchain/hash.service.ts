import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class HashService {
  /**
   * Generate SHA-256 hash of a record
   * @param data Object or string to hash
   * @returns Hex string of the hash
   */
  generateHash(data: any): string {
    const content = typeof data === 'string' ? data : JSON.stringify(data);
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  /**
   * Verify if data matches a hash
   * @param data Data to verify
   * @param hash Expected hash
   */
  verifyHash(data: any, hash: string): boolean {
    const calculatedHash = this.generateHash(data);
    return calculatedHash === hash;
  }
}
