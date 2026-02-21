
import { generatePairingCode, generateSessionId } from '../utils/codeGenerator.js';
import { SESSION_STATUS } from '../configs/constants.js';
// In-memory storage
const sessions = new Map();     
const pairingCodes = new Map();   


// Create a new session for desktop

export const createSession = (desktopId) => {
  const sessionId = generateSessionId();
  let pairingCode = generatePairingCode();
  
  while (pairingCodes.has(pairingCode)) {
  pairingCode = generatePairingCode();
}

  const session = {
    sessionId,
    desktopId,
    mobileId: null,
    pairingCode,
    status: SESSION_STATUS.WAITING_FOR_MOBILE,
    createdAt: Date.now(),
    codeExpiresAt: Date.now() + (5 * 60 * 1000), // 5 minutes from now
    canvasDimensions: {
      width: null,
      height: null
    }
  };

  // Store session
  sessions.set(sessionId, session);
  
  // Store pairing code mapping (for quick lookup)

  pairingCodes.set(pairingCode, sessionId);

  console.log(`Session created: ${sessionId}, Pairing code: ${pairingCode}`);

  return session;
};


//  Get session by sessionId

export const getSessionById = (sessionId) => {
  return sessions.get(sessionId) || null;
};

// Get session by pairing code

export const getSessionByCode = (code) => {
  const sessionId = pairingCodes.get(code);
  if (!sessionId) return null;
  
   const session = sessions.get(sessionId);
  if (!session) return null;

  // Check expiration
  if (Date.now() > session.codeExpiresAt) {
    pairingCodes.delete(code);
    sessions.delete(sessionId);
    return null;
  }

  return session;
};


//  Get all sessions

export const getAllSessions = () => {
  return Array.from(sessions.values());
};


// Get session stats

export const getStats = () => {
  const allSessions = getAllSessions();
  
  return {
    total: allSessions.length,
    waiting: allSessions.filter(s => s.status === SESSION_STATUS.WAITING_FOR_MOBILE).length,
    paired: allSessions.filter(s => s.status === SESSION_STATUS.PAIRED).length
  };
};