const { BLOCK, SUSPEND } = require('../../constants/status.constant');
const logger = require('log4js').getLogger('user.status.handler.js');

const setUserStatus = async ({ socket }, status) => {
  try {
    const user = socket.user;

    if (user && user.status !== BLOCK && user.status !== SUSPEND) {
      user.status = status;
      await user.save();
      logger.info(`User ${user._id} status updated to ${status}`);
    } else {
      logger.warn(
        `User ${user._id} has blocked or suspended status. Status update skipped.`
      );
    }
  } catch (error) {
    logger.error(
      `Error updating user ${socket.user._id} status: ${error.message}`
    );
  }
};

module.exports = { setUserStatus };
