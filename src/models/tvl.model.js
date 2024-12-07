const mongoose = require('mongoose');

const tvlSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CryptoIdentity',
      required: true,
    },
    name: { type: String },
    tvlRatio: { type: Number, default: null },
    tvl: { type: Number, default: null },
    tvlDefillama: { type: Number },
    chainTvls: [
      {
        key: { type: String },
        value: { type: Number },
        _id: false,
      },
    ],
    change1h: { type: Number, default: 0 },
    change1d: { type: Number, default: 0 },
    change7d: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

const TVL = mongoose.model('TVL', tvlSchema);
module.exports = TVL;
