const Room = require('../../models/room.model');
const logger = require('log4js').getLogger('chat.handler.js');

const createPrivateRoom = async ({ socket, data }) => {
  try {
    const userId = socket.user._id;
    const room = await Room.create({ userId, roomName: data.message });

    logger.info(
      `Room created successfully with ID: ${room._id.toString()} for user: ${userId}`
    );

    return room._id.toString();
  } catch (error) {
    console.error(`Error in createPrivateRoom: ${error.message}`);
    throw new Error('Could not retrieve or create room');
  }
};

module.exports = { createPrivateRoom };
