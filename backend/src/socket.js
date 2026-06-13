const socketio = require('socket.io');
const mongoose = require('mongoose');

// Quick inline schema for Chat Message persistence
const chatMessageSchema = new mongoose.Schema({
  itineraryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Itinerary', required: true },
  sender: { type: String, required: true },
  senderId: { type: String, required: true },
  text: { type: String, required: true },
  time: { type: String, required: true }
});
const ChatMessage = mongoose.models.ChatMessage || mongoose.model('ChatMessage', chatMessageSchema);

let io;

const initSocket = (server) => {
  io = socketio(server, {
    cors: {
      origin: '*', 
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.log(`New WebSocket connection: ${socket.id}`);

    socket.on('joinRoom', async ({ itineraryId }) => {
      socket.join(itineraryId);
      console.log(`Socket ${socket.id} joined room ${itineraryId}`);
      
      // Send chat history when user joins
      try {
        const history = await ChatMessage.find({ itineraryId }).sort({ _id: 1 });
        socket.emit('chatHistory', history);
      } catch (err) {
        console.error('Failed to fetch chat history', err);
      }
    });

    socket.on('chatMessage', async (msg) => {
      try {
        // Save to DB
        const newMsg = await ChatMessage.create({
          itineraryId: msg.itineraryId,
          sender: msg.sender,
          senderId: msg.senderId,
          text: msg.text,
          time: msg.time
        });
        // Broadcast to everyone in the room
        io.to(msg.itineraryId).emit('message', newMsg);
      } catch (err) {
        console.error('Failed to save chat message', err);
      }
    });

    socket.on('shareDocument', async (data) => {
      try {
        const Itinerary = mongoose.model('Itinerary');
        await Itinerary.findByIdAndUpdate(data.itineraryId, {
          $push: { documents: data.document }
        });
        io.to(data.itineraryId).emit('document', data.document);
      } catch (err) {
        console.error('Failed to save document', err);
      }
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });

  return io;
};

const getIo = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};

module.exports = { initSocket, getIo, ChatMessage };
