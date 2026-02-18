import { randomBytes } from 'crypto';

export function generateToken(size: number = 32): string {
  return randomBytes(size).toString('hex');
}
