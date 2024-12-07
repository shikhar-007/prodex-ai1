const ApiKey = require('../models/api.key.model');
const { decrypt } = require('../utils/encrypt.decrypt');

const getApiKey = async ({ platform }) => {
  console.log('Im in api key');
  const key = await ApiKey.findOne({ platform });

  if (!key) {
    throw new Error('API key not found for the specified platform');
  }

  const decryptedKey = await decrypt(key.apiKey);
  return decryptedKey;
};

module.exports = { getApiKey };
