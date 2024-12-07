const log4js = require('log4js');
const logConfig = require('./config/logConfig');
const App = require('./src/app');

const start = async () => {
  log4js.configure(logConfig);
  const app = new App();
  app.start();
};

start();
