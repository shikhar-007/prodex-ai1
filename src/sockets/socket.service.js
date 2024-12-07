const { Server } = require('socket.io');
const { socketAuth } = require('../middlewares/auth.middleware');
const { createPrivateRoom } = require('./handler/room.handler');
const {
  joinPreviousChatRoom,
  addMessageToDatabase,
} = require('./handler/chat.handler');
const { getAiResponse } = require('./handler/ai.handler');
const { setUserStatus } = require('./handler/user.handler');
const { INACTIVE, ACTIVE } = require('../constants/status.constant');
const { SOCKET_EVENTS } = require('../constants/socket.constant');
const logger = require('log4js').getLogger('socket.service.js');

class WebSocket {
  initialize(app) {
    this.io = new Server(app, {
      cors: { origin: '*', methods: '*' },
    });
    this.setupSocket();
  }

  async joinPreviousChatRoomIo({ socket }) {
    await joinPreviousChatRoom({ socket });
  }

  async createPrivateRoomIo({ socket, data }) {
    const roomId = await createPrivateRoom({ socket, data });
    socket.join(roomId);
    socket.emit(SOCKET_EVENTS.ROOM_CREATED, { roomId });
  }

  async sendQueryMessage({ socket, roomId, message }) {
    const [aiResponse, userMessage] = await Promise.all([
      getAiResponse({ message }),
      addMessageToDatabase({ roomId, message, sender: 'User' }),
    ]);
    this.io.to(roomId).emit(SOCKET_EVENTS.QUERY_RESPONSE, aiResponse);
    await addMessageToDatabase({
      roomId,
      message: aiResponse.message,
      sender: 'AI',
    });
  }

  setupSocket() {
    this.io.use(socketAuth);
    this.io.on('connection', async (socket) => {
      logger.info(`User connected: ${socket.user._id} ✅`);
      await this.joinPreviousChatRoomIo({ socket });
      await setUserStatus({ socket }, ACTIVE);

      socket.on(SOCKET_EVENTS.ROOM_CREATE, async (data) => {
        await this.createPrivateRoomIo({
          socket,
          data,
        });
      });

      socket.on(SOCKET_EVENTS.QUERY_SEND, async (data) => {
        await this.sendQueryMessage({
          socket,
          roomId: data.roomId,
          message: data.message,
        });
      });

      socket.on('disconnect', async () => {
        await setUserStatus({ socket }, INACTIVE);
        logger.info(`User disconnected: ${socket.user._id}`);
      });

      socket.on('error', (err) => {
        logger.error(`Socket error 🚩: ${socket.user._id} - ${err.message}`);
      });
    });

    this.io.on('connect_error', (err) => {
      logger.error(err.message);
    });

    logger.info(
      'Socket.IO server is up and running, waiting for connections...'
    );
  }
}

module.exports = WebSocket;
