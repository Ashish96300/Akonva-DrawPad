import express from 'express';
import * as sessionService from '../services/session.service.js';

const router = express.Router();

// GET /api/sessions/stats
router.get('/stats', (req, res) => {
  try {
    const stats = sessionService.getStats();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// GET /api/sessions
router.get('/', (req, res) => {
  try {
    const sessions = sessionService.getAllSessions();
    
    // Don't expose pairing codes in list
    const sanitized = sessions.map(s => ({
      sessionId: s.sessionId,
      desktopId: s.desktopId,
      mobileId: s.mobileId,
      status: s.status,
      createdAt: s.createdAt,
      hasMobile: s.mobileId !== null
    }));
    
    res.json({
      success: true,
      data: sanitized
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;