const schedule = require('node-schedule');

require('../seeders/admin.seeders');
const {
  getProtocols,
  getChainTvl,
  getDailyFeesAndRevenue,
} = require('./defillama.schedular');
const {
  getCryptoRanks,
  getCryptoMetaData,
  getCryptoMarketData,
} = require('./cmc.scheduler');
const logger = require('log4js').getLogger('schedular.index.js');

async function scheduleJob() {
  schedule.scheduleJob('*/10 * * * *', async () => {
    logger.info('Running CryptoMarketData cron job');
    try {
      await getCryptoMarketData();
      logger.info('CryptoMarketData cron job completed successfully');
    } catch (error) {
      logger.error(`Error in CryptoMarketData cron job: ${error.message}`);
    }
  });

  schedule.scheduleJob('0 * * * *', async () => {
    logger.info('Running CryptoMetaData and CryptoRanks cron jobs');
    try {
      await getCryptoRanks();
      logger.info('CryptoRanks cron job completed successfully');
      await getCryptoMetaData();
      logger.info('CryptoMetaData cron job completed successfully');
    } catch (error) {
      logger.error(`Error in midnight cron jobs: ${error.message}`);
    }
  });

  schedule.scheduleJob('*/10 * * * *', async () => {
    logger.info('Running DeFiLlama cron jobs');
    try {
      await getProtocols();
      logger.info('getProtocols cron job completed successfully');
      await getChainTvl();
      logger.info('getChainTvl cron job completed successfully');
      await getDailyFeesAndRevenue();
      logger.info('getDailyFeesAndRevenue cron job completed successfully');
    } catch (error) {
      logger.error(`Error in DeFiLlama cron jobs: ${error.message}`);
    }
  });
}

module.exports = { scheduleJob };
