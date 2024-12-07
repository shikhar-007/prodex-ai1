const mongoose = require('mongoose');

const loginHistorySchema = new mongoose.Schema({
  time: { type: Date, default: Date.now },
  device: { type: String, required: true, trim: true },
  ip: { type: String, required: true, trim: true },
  location: { type: String, required: true, trim: true },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
});

const LoginHistory = mongoose.model('LoginHistory', loginHistorySchema);

module.exports = LoginHistory;
