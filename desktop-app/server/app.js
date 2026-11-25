
import express from 'express';
import deviceRoutes from './src/routes/device.routes.js';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Akonva server is running'
  });
});

// Debug-only device listing; disabled unless explicitly enabled
if (process.env.ENABLE_DEBUG_API === 'true') {
  app.use('/api/devices', deviceRoutes);
}

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: Date.now()
  });
});

export default app;
