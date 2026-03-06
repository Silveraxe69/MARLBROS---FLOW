let io = null;

// Initialize Socket.io
function initializeSocket(socketIo) {
  io = socketIo;

  io.on('connection', (socket) => {
    console.log(`✅ Client connected: ${socket.id}`);

    // Handle client joining specific channels
    socket.on('join_bus', (busId) => {
      socket.join(`bus_${busId}`);
      console.log(`Client ${socket.id} joined bus_${busId}`);
    });

    socket.on('join_stop', (stopId) => {
      socket.join(`stop_${stopId}`);
      console.log(`Client ${socket.id} joined stop_${stopId}`);
    });

    socket.on('join_route', (routeId) => {
      socket.join(`route_${routeId}`);
      console.log(`Client ${socket.id} joined route_${routeId}`);
    });

    // Handle passenger location updates
    socket.on('passenger_location', (data) => {
      console.log('Passenger location update:', data);
      // Broadcast to admin dashboard
      io.to('admin').emit('passenger_location_update', data);
    });

    // Handle admin joining
    socket.on('join_admin', () => {
      socket.join('admin');
      console.log(`Admin client ${socket.id} joined admin channel`);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`❌ Client disconnected: ${socket.id}`);
    });
  });

  return io;
}

// Emit bus location update
function emitBusLocationUpdate(busId, locationData) {
  if (io) {
    io.emit('bus_location_update', {
      bus_id: busId,
      ...locationData
    });

    // Also emit to specific bus channel
    io.to(`bus_${busId}`).emit('location_update', locationData);
  }
}

// Emit bus ETA update
function emitBusETAUpdate(busId, etaData) {
  if (io) {
    io.emit('bus_eta_update', {
      bus_id: busId,
      ...etaData
    });

    // Emit to specific stop channels
    etaData.forEach(eta => {
      io.to(`stop_${eta.stop_id}`).emit('eta_update', {
        bus_id: busId,
        ...eta
      });
    });
  }
}

// Emit crowd status update
function emitCrowdUpdate(busId, crowdData) {
  if (io) {
    io.emit('crowd_update', {
      bus_id: busId,
      ...crowdData
    });

    io.to(`bus_${busId}`).emit('crowd_update', crowdData);
  }
}

// Emit stop arrival notification
function emitStopArrival(stopId, busId, arrivalData) {
  if (io) {
    io.to(`stop_${stopId}`).emit('bus_arrival', {
      stop_id: stopId,
      bus_id: busId,
      ...arrivalData
    });
  }
}

// Get connected clients count
function getConnectedClientsCount() {
  if (io) {
    return io.engine.clientsCount;
  }
  return 0;
}

module.exports = {
  initializeSocket,
  emitBusLocationUpdate,
  emitBusETAUpdate,
  emitCrowdUpdate,
  emitStopArrival,
  getConnectedClientsCount
};
