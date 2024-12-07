const { Router } = require('express');
const ChatController = require('../controllers/chat.controller');
const { authToken } = require('../middlewares/auth.middleware');

class ChatRoute {
  constructor() {
    this.path = '/api/chat/';
    this.router = Router();
    this.chatController = new ChatController();
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.get(
      `${this.path}getAllRoom`,
      authToken,
      this.chatController.getAllRoom.bind(this.chatController)
    );

    this.router.get(
      `${this.path}getAllMessage`,
      authToken,
      this.chatController.getAllMessage.bind(this.chatController)
    );

    this.router.put(
      `${this.path}changeRoomName`,
      authToken,
      this.chatController.changeRoomName.bind(this.chatController)
    );

    this.router.delete(
      `${this.path}deleteRoom`,
      authToken,
      this.chatController.deleteRoom.bind(this.chatController)
    );
  }
}
module.exports = ChatRoute;
