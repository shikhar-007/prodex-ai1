const UserService = require('../services/user.service');
const {
  validateChangePassword,
  validateEditProfileEmail,
  validateUpdateChatSetting,
  validateEditProfileName,
} = require('../validators/user.validator');
const { HttpException } = require('../error/HttpException');
const errorType = require('../error/errorCodes');

class UserController {
  constructor() {
    this.userService = new UserService();
  }

  async getUserDetail(req, res) {
    res.status(200).json({
      success: true,
      data: req.user,
      message: 'Password Changed Success',
    });
  }

  async changePassword(req, res) {
    const { error } = validateChangePassword(req.body);
    if (error) {
      throw new HttpException(
        errorType.BAD_REQUEST.status,
        error.details[0].message
      );
    }
    await this.userService.changePassword(req.body, req.user);
    res.status(200).json({
      success: true,
      message: 'Password Changed Success',
    });
  }

  async editProfileEmail(req, res) {
    const { error } = validateEditProfileEmail(req.body);
    if (error) {
      throw new HttpException(
        errorType.BAD_REQUEST.status,
        error.details[0].message
      );
    }
    const data = await this.userService.editProfileEmail(req.body, req.user);
    res.status(200).json({
      success: true,
      message: data.message,
      data: data.user,
    });
  }

  async editProfileName(req, res) {
    const { error } = validateEditProfileName(req.body);
    if (error) {
      throw new HttpException(
        errorType.BAD_REQUEST.status,
        error.details[0].message
      );
    }
    const data = await this.userService.editProfileName(req.body, req.user);
    res.status(200).json({
      success: true,
      message: data.message,
      data: data.user,
    });
  }

  async deleteProfile(req, res) {
    const data = await this.userService.deleteProfile(req.user);
    res.status(200).json({
      success: true,
      message: data.message,
    });
  }

  async getChatSetting(req, res) {
    const data = await this.userService.getChatSetting(req.user);
    res.status(200).json({
      success: true,
      data: data.data,
      message: data.message,
    });
  }

  async updateChatSetting(req, res) {
    const { error } = validateUpdateChatSetting(req.body);
    if (error) {
      throw new HttpException(
        errorType.BAD_REQUEST.status,
        error.details[0].message
      );
    }
    const data = await this.userService.updateChatSetting(req.body, req.user);
    res.status(200).json({
      success: true,
      message: data.message,
      data: data.setting,
    });
  }
}

module.exports = UserController;
