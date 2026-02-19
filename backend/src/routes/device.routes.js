import express from 'express';
import { getDevices ,getDeviceStats } from '../controller/deviceRegistration.controller.js';

const router = express.Router();

router.get('/stats' ,getDeviceStats);

router.get('/' ,getDevices);


export default router;