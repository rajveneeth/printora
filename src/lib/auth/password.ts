import { pbkdf2Sync, randomBytes, timingSafeEqual } from 'node:crypto';

const keyLength = 64;
const iterations = 210_000;
const digest = 'sha512';

export const hashPassword = (password: string): string => {
  const salt = randomBytes(16).toString('hex');
  const hash = pbkdf2Sync(password, salt, iterations, keyLength, digest).toString('hex');
  return `${iterations}:${salt}:${hash}`;
};

export const verifyPassword = (password: string, storedHash: string): boolean => {
  const [storedIterations, salt, hash] = storedHash.split(':');
  const parsedIterations = Number(storedIterations);
  if (!Number.isInteger(parsedIterations) || !salt || !hash) {
    return false;
  }
  const candidate = pbkdf2Sync(password, salt, parsedIterations, keyLength, digest);
  const stored = Buffer.from(hash, 'hex');
  return stored.length === candidate.length && timingSafeEqual(stored, candidate);
};
