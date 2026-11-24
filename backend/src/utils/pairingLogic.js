import { randomInt } from 'crypto';

export const CODE_LENGTH = 6;

// Cryptographically secure 6-digit code (100000–999999)
const generatePairingCode = () => String(randomInt(10 ** (CODE_LENGTH - 1), 10 ** CODE_LENGTH));

export default generatePairingCode;
