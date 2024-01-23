import { randomBytes } from 'crypto';

export const generatePAT = (): string => {
    const token = randomBytes(32).toString('hex');
    return token;
}

