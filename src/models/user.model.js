const mongoose = require('mongoose');
const { JWT_SECRET_KEY, JWT_EXPIRY } = require('../../config/env');
const jwt = require('jsonwebtoken');
const {
  ADMIN,
  CONTENT_MANAGER,
  API_MANAGER,
  USER,
} = require('../constants/roles.constant');
const {
  BLOCK,
  SUSPEND,
  ACTIVE,
  INACTIVE,
} = require('../constants/status.constant');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
    },
    email: {
      type: String,
      trim: true,
      required: true,
      unique: true,
    },
    userType: {
      type: [String],
      enum: [USER, ADMIN, CONTENT_MANAGER, API_MANAGER],
      default: [USER],
    },
    password: {
      type: String,
      required: true,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    totpFlag: {
      type: Boolean,
      default: false,
    },
    secretKey2fa: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: [BLOCK, SUSPEND, ACTIVE, INACTIVE],
      default: INACTIVE,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        delete ret.password;
        delete ret.secretKey2fa;
      },
    },
  }
);

userSchema.virtual('loginHistory', {
  ref: 'LoginHistory',
  localField: '_id',
  foreignField: 'userId',
});

userSchema.virtual('roomJoined', {
  ref: 'Rooms',
  localField: '_id',
  foreignField: 'userId',
});

userSchema.methods.generateAuthToken = async function () {
  const user = this;
  const token = jwt.sign({ _id: user._id.toString() }, JWT_SECRET_KEY, {
    expiresIn: JWT_EXPIRY,
  });
  return token;
};

userSchema.index({ email: 1 }, { unique: true });
const User = mongoose.model('User', userSchema);

module.exports = User;
