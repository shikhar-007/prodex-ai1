require('express-async-errors');
const { catchUnhandledError } = require('./error/uncaughtException');
const cors = require('cors');
const express = require('express');
const { errorMiddleware } = require('./middlewares/error.middleware');
const { PORT, MONGODB_CONNECTION_STRING } = require('../config/env');
const routes = require('./routes/index');
const logger = require('log4js').getLogger('app');
const { default: mongoose } = require('mongoose');
const { scheduleJob } = require('./scheduler/index');
const http = require('http');
const WebSocket = require('./sockets/socket.service');
require('../src/jobs/worker');

class App {
  constructor() {
    this.app = express();
    this.port = PORT;
    this.routes = routes;
    catchUnhandledError();
    this.connectToDatabase();
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.httpServer = http.createServer(this.app);
    this.initializeWebChatSocket();
    this.initializeErrorMiddleware();
    scheduleJob();
  }

  start() {
    this.httpServer.listen(this.port, () => {
      logger.info('=================================');
      logger.info(`🚀 App listening on port ${this.port}`);
      logger.info('=================================');
    });
  }

  connectToDatabase() {
    mongoose
      .connect(MONGODB_CONNECTION_STRING)
      .then(() => {
        logger.info('Database connection successful ✅');
      })
      .catch((err) => {
        logger.error('Database connection error >> ' + err);
      });
  }

  initializeMiddlewares() {
    this.app.use(cors({ origin: '*' }));
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
  }

  initializeRoutes() {
    this.routes.forEach((route) => {
      this.app.use('/', route.router);
    });
    this.app.get('/healthcheck', (req, res) => {
      res.json({ message: 'hello from prodex-user-service' });
    });
  }

  initializeWebChatSocket() {
    new WebSocket().initialize(this.httpServer);
  }

  initializeErrorMiddleware() {
    this.app.use(errorMiddleware);
  }
}

module.exports = App;
