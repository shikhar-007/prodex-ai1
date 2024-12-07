const Room = require('../../models/room.model');
const ChatMessage = require('../../models/chat.message.model');
const logger = require('log4js').getLogger('chat.handler.js');

async function joinPreviousChatRoom({ socket }) {
  try {
    const { user } = socket;
    const rooms = await Room.find({
      userId: user._id,
    }).lean();

    if (rooms.length > 0) {
      rooms.forEach((room) => {
        socket.join(room._id.toString());
      });
      logger.info(`User ${user._id} joined ${rooms.length} room(s).`);
    } else {
      logger.info(`User ${user._id} has no rooms to join`);
    }
  } catch (err) {
    logger.error(`Error in joinPreviousChatRoom: ${err.message}`);
  }
}

async function addMessageToDatabase({ roomId, message, sender }) {
  try {
    await ChatMessage.create({
      roomId,
      sender,
      message,
    });
  } catch (err) {
    logger.error(`Error adding message to database: ${err.message}`);
  }
}

module.exports = { joinPreviousChatRoom, addMessageToDatabase };
