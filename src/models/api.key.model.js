const mongoose = require('mongoose');

const apiKeySchema = new mongoose.Schema({
  apiKey: {
    type: String,
    required: true,
    unique: true,
  },

  platform: {
    type: String,
    required: true,
    unique: true,
  },
});

const ApiKey = mongoose.model('ApiKey', apiKeySchema);
module.exports = ApiKey;
