const { Router } = require('express');
const UserController = require('../controllers/user.controller');
const { authToken } = require('../middlewares/auth.middleware');

class UserRoute {
  constructor() {
    this.path = '/api/user/';
    this.router = Router();
    this.userController = new UserController();
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.get(
      `${this.path}getUserDetail`,
      authToken,
      this.userController.getUserDetail.bind(this.userController)
    );

    this.router.put(
      `${this.path}changePassword`,
      authToken,
      this.userController.changePassword.bind(this.userController)
    );

    this.router.put(
      `${this.path}editProfileEmail`,
      authToken,
      this.userController.editProfileEmail.bind(this.userController)
    );

    this.router.put(
      `${this.path}editProfileName`,
      authToken,
      this.userController.editProfileName.bind(this.userController)
    );

    this.router.delete(
      `${this.path}deleteProfile`,
      authToken,
      this.userController.deleteProfile.bind(this.userController)
    );

    this.router.get(
      `${this.path}getChatSetting`,
      authToken,
      this.userController.getChatSetting.bind(this.userController)
    );

    this.router.put(
      `${this.path}updateChatSetting`,
      authToken,
      this.userController.updateChatSetting.bind(this.userController)
    );
  }
}

module.exports = UserRoute;
