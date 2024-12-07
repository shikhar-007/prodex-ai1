const ChatService = require('../services/chat.service');
const { HttpException } = require('../error/HttpException');
const errorType = require('../error/errorCodes');
const {
  validateChangeRoomName,
  validateDeleteRoom,
} = require('../validators/chat.validator');

class ChatController {
  constructor() {
    this.chatService = new ChatService();
  }

  async getAllRoom(req, res) {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const data = await this.chatService.getAllRoom({ page, limit }, req.user);
    res.status(200).json({
      success: true,
      data: data.data,
      message: data.message,
    });
  }

  async getAllMessage(req, res) {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const data = await this.chatService.getAllMessage(
      { page, limit },
      req.query.roomId,
      req.user
    );
    res.status(200).json({
      success: true,
      data: data.data,
      message: data.message,
    });
  }

  async changeRoomName(req, res) {
    const { error } = validateChangeRoomName(req.body);
    if (error) {
      throw new HttpException(
        errorType.BAD_REQUEST.status,
        error.details[0].message
      );
    }
    const data = await this.chatService.changeRoomName(req.body, req.user);
    res.status(200).json({
      success: true,
      message: data.message,
    });
  }

  async deleteRoom(req, res) {
    const { error } = validateDeleteRoom(req.body);
    if (error) {
      throw new HttpException(
        errorType.BAD_REQUEST.status,
        error.details[0].message
      );
    }
    const data = await this.chatService.deleteRoom(req.body.roomId, req.user);
    res.status(200).json({
      success: true,
      message: data.message,
    });
  }
}
module.exports = ChatController;
