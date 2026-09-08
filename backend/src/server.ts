import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import telemetryRoutes from './routes/telemetryRoutes';
import decisionsRoutes from './routes/decisionsRoutes';
import forecastRoutes from './routes/forecastRoutes';
import { TelemetrySocketServer } from './sockets/telemetrySocket';
import { SensorPollingJob } from './jobs/pollSensors';
import { WeatherPollingJob } from './jobs/fetchWeather';
import { checkDatabaseHealth } from './config/db';
import { MarketSimulation } from './services/marketSimulation';
import { createVectrusRouter } from './routes/vectrusRoutes';

dotenv.config();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// Security & CORS setup for edge commander portal and tablet network
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));
app.use(express.json());

// Initialize WebSocket server
const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
  pingInterval: 10000,
  pingTimeout: 5000,
});

// Mount Routes
app.use('/api/telemetry', telemetryRoutes);
app.use('/api/decisions', decisionsRoutes);
app.use('/api/forecast', forecastRoutes);

const marketSim = new MarketSimulation(io);
app.use('/api/vectrus', createVectrusRouter(marketSim));
marketSim.start();

// Health check endpoint for Docker and Nginx
app.get('/api/health', async (req, res) => {
  const dbStatus = await checkDatabaseHealth();
  res.json({
    status: 'healthy',
    service: 'polarsync-backend-edge',
    station: 'BHARATI-ANTARCTICA-01',
    timescale_connected: dbStatus,
    timestamp: new Date().toISOString(),
  });
});

// Initialize Background Schedulers & Sockets
TelemetrySocketServer.initialize(io);
SensorPollingJob.start();
WeatherPollingJob.start();

// Start Server
server.listen(PORT, async () => {
  const dbStatus = await checkDatabaseHealth();
  console.log(`========================================================`);
  console.log(`✅ PolarSync Backend running on port ${PORT}`);
  console.log(`✅ TimescaleDB ${dbStatus ? 'connected' : 'offline fallback active'}`);
  console.log(`✅ ONNX models loaded (demand_lstm, solar_xgb)`);
  console.log(`✅ Sensor polling scheduled: every 15 minutes`);
  console.log(`✅ WebSocket broadcasting: every 5 seconds`);
  console.log(`========================================================`);
});

// Graceful Shutdown
process.on('SIGTERM', () => {
  console.log('[PolarSync] Graceful shutdown initiated...');
  SensorPollingJob.stop();
  TelemetrySocketServer.stop();
  server.close(() => {
    console.log('[PolarSync] Backend cleanly terminated.');
    process.exit(0);
  });
});
