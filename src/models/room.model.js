const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    roomName: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);
roomSchema.virtual('chatMessages', {
  ref: 'ChatMessage',
  localField: '_id',
  foreignField: 'roomId',
});

roomSchema.set('toObject', { virtuals: true });
roomSchema.set('toJSON', { virtuals: true });
roomSchema.index({ userId: 1 });
const Room = mongoose.model('Rooms', roomSchema);
module.exports = Room;
