const mongoose = require('mongoose');

const chatSettingsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    conversationTags: {
      type: Boolean,
      default: false,
    },
    displayChatHistory: {
      type: Boolean,
      default: true,
    },
    clearChatHistory: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const ChatSetting = mongoose.model('ChatSetting', chatSettingsSchema);

module.exports = ChatSetting;
