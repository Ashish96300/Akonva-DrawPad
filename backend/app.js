
import express from 'express';
// import deviceRoutes from './routes/deviceRoutes.js';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'DrawPad Server is running'
  });
});

// app.use('/api/devices', deviceRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: Date.now()
  });
});

export default app;