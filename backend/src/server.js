require('dotenv').config();
const http = require('http');
const express = require('express');
const cors = require('cors');
const { initSocket, getConnectedClientsCount } = require('./socket');
const webhookRoutes = require('./routes/webhook');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for all incoming connections
app.use(cors());

// Parse incoming JSON and urlencoded request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple request logger
app.use((req, res, next) => {
  console.log(`[HTTP] ${req.method} ${req.originalUrl}`);
  next();
});

// Root welcome route
app.get('/', (req, res) => {
  res.json({
    name: 'Meta Lead Ads Real-Time Webhook Server',
    version: '1.0.0',
    status: 'Running',
    activeSockets: getConnectedClientsCount(),
    endpoints: {
      webhookVerification: 'GET /webhook',
      webhookReceiver: 'POST /webhook',
      testLeadSimulation: 'POST /api/test-lead',
      healthCheck: 'GET /api/health'
    }
  });
});

// Attach Webhook & API routes
app.use(webhookRoutes);

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io
initSocket(server);

// Start server
server.listen(PORT, () => {
  console.log('====================================================');
  console.log(`🚀 Meta Lead Ads Webhook Server is live on port ${PORT}`);
  console.log(`📡 WebSocket URL: ws://localhost:${PORT}`);
  console.log(`🔗 Webhook GET URL:  http://localhost:${PORT}/webhook`);
  console.log(`🔗 Webhook POST URL: http://localhost:${PORT}/webhook`);
  console.log(`🧪 Test Lead URL:   POST http://localhost:${PORT}/api/test-lead`);
  console.log('====================================================');
});

// Graceful termination handling
process.on('SIGINT', () => {
  console.log('\n[Server] Shutting down gracefully...');
  server.close(() => {
    console.log('[Server] Closed all connections.');
    process.exit(0);
  });
});
