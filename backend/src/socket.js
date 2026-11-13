const { Server } = require('socket.io');

let io = null;
let connectedClients = new Set();

function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: '*', 
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    connectedClients.add(socket.id);
    console.log(`[Socket.io]  Client connected: ${socket.id} (Total active: ${connectedClients.size})`);

    socket.emit('connection_established', {
      status: 'connected',
      socketId: socket.id,
      timestamp: new Date().toISOString()
    });

    
    socket.on('client_ping', (data) => {
      console.log(`[Socket.io]  Ping received from ${socket.id}:`, data);
      socket.emit('server_pong', {
        message: 'Pong! Server is active.',
        timestamp: new Date().toISOString()
      });
    });

    socket.on('disconnect', (reason) => {
      connectedClients.delete(socket.id);
      console.log(`[Socket.io]  Client disconnected: ${socket.id} (Reason: ${reason}, Total active: ${connectedClients.size})`);
    });
  });

  return io;
}

function broadcastLead(lead) {
  if (!io) {
    console.warn('[Socket.io] Cannot broadcast lead: Socket.io is not initialized yet.');
    return false;
  }

  console.log(`[Socket.io] Broadcasting 'new_lead' to ${connectedClients.size} client(s):`, {
    leadId: lead.id,
    name: lead.fullName,
    email: lead.email,
    createdTime: lead.createdTime
  });

  io.emit('new_lead', lead);
  return true;
}


function getConnectedClientsCount() {
  return connectedClients.size;
}

module.exports = {
  initSocket,
  broadcastLead,
  getConnectedClientsCount,
  getIo: () => io
};
