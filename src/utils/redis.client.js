const Redis = require('ioredis');
const logger = require('log4js').getLogger('redis_service');
const { REDIS_HOST, REDIS_PORT } = require('../../config/env');

class RedisClient {
  constructor() {
    this.client = new Redis({
      host: REDIS_HOST,
      port: REDIS_PORT,
    });

    this.setupEventListeners();
  }

  setupEventListeners() {
    this.client.on('ready', () => {
      logger.info('Redis is ready ✅');
    });

    this.client.on('connect', () => {
      logger.info('Redis connection established ✅');
    });

    this.client.on('reconnecting', () => {
      logger.info('Redis reconnecting ⏳');
    });

    this.client.on('error', (error) => {
      logger.error('Redis error occurred 🚩', error);
    });

    this.client.on('end', () => {
      logger.error('Redis connection ended 💔');
    });
  }

  static getInstance() {
    if (!RedisClient.instance) {
      RedisClient.instance = new RedisClient();
    }
    return RedisClient.instance;
  }

  getClient() {
    return this.client;
  }
}

module.exports = RedisClient.getInstance();
