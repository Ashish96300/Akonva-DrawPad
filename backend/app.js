
import express from 'express';
import deviceRoutes from './src/routes/device.routes.js';
import sessionRoutes from './src/routes/session.routes.js'

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'DrawPad Server is running'
  });
});

app.use('/api/devices', deviceRoutes);
app.use('/api/sessions', sessionRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: Date.now()
  });
});

export default app;