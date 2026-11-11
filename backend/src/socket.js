const { Server } = require('socket.io');

let io = null;
let connectedClients = new Set();

/**
 * Initializes Socket.io with CORS configuration and logs connection events.
 */
function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: '*', // Allow all origins for mobile / web app clients
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    connectedClients.add(socket.id);
    console.log(`[Socket.io] 🟢 Client connected: ${socket.id} (Total active: ${connectedClients.size})`);

    // Send welcome confirmation with server time
    socket.emit('connection_established', {
      status: 'connected',
      socketId: socket.id,
      timestamp: new Date().toISOString()
    });

    // Handle manual ping / test from mobile client
    socket.on('client_ping', (data) => {
      console.log(`[Socket.io] 🏓 Ping received from ${socket.id}:`, data);
      socket.emit('server_pong', {
        message: 'Pong! Server is active.',
        timestamp: new Date().toISOString()
      });
    });

    socket.on('disconnect', (reason) => {
      connectedClients.delete(socket.id);
      console.log(`[Socket.io] 🔴 Client disconnected: ${socket.id} (Reason: ${reason}, Total active: ${connectedClients.size})`);
    });
  });

  return io;
}

/**
 * Broadcasts a normalized lead to all connected Socket.io clients.
 */
function broadcastLead(lead) {
  if (!io) {
    console.warn('[Socket.io] ⚠️ Cannot broadcast lead: Socket.io is not initialized yet.');
    return false;
  }

  console.log(`[Socket.io] ⚡ Broadcasting 'new_lead' to ${connectedClients.size} client(s):`, {
    leadId: lead.id,
    name: lead.fullName,
    email: lead.email,
    createdTime: lead.createdTime
  });

  io.emit('new_lead', lead);
  return true;
}

/**
 * Returns current count of connected clients.
 */
function getConnectedClientsCount() {
  return connectedClients.size;
}

module.exports = {
  initSocket,
  broadcastLead,
  getConnectedClientsCount,
  getIo: () => io
};
