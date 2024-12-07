const User = require('../models/user.model');
const ApiKey = require('../models/api.key.model');
const bcrypt = require('bcrypt');
const { ADMIN_EMAIL, ADMIN_PASSWORD, SALT } = require('../../config/env');
const { ADMIN } = require('../constants/roles.constant');
const { encrypt } = require('../utils/encrypt.decrypt');
const { CMC_API_KEY } = require('../../config/env');
const logger = require('log4js').getLogger('admin.seeders');

const addAdmin = async () => {
  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, Number(SALT));
  const admin = await User.findOneAndUpdate(
    { email: ADMIN_EMAIL },
    {
      name: 'Test Admin',
      email: ADMIN_EMAIL,
      password: hashedPassword,
      emailVerified: true,
      userType: ADMIN,
    },
    {
      upsert: true,
    }
  );
  logger.info('Admin details added');
};

const addApiKey = async () => {
  const keys = [
    {
      apiKey: CMC_API_KEY,
      platform: 'CoinsMarketCap',
    },
  ];

  for (const key of keys) {
    const encryptedKey = await encrypt(key.apiKey);
    const exists = await ApiKey.findOne({ platform: key.platform });
    if (!exists) {
      await ApiKey.create({
        platform: key.platform,
        apiKey: encryptedKey,
      });
    }
  }

  logger.info('Api Keys Added');
};
(async () => {
  await addAdmin();
  await addApiKey();
})();
