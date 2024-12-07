const mongoose = require('mongoose');

const breakdownSchema = new mongoose.Schema(
  {
    key: { type: String, required: true },
    value: { type: Object, required: true },
  },
  { _id: false }
);

const feesAndRevenueSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CryptoIdentity',
      required: true,
    },
    name: { type: String },
    total24h: { type: Number },
    total48hto24h: { type: Number },
    total7d: { type: Number },
    total14dto7d: { type: Number },
    total60dto30d: { type: Number },
    total30d: { type: Number },
    total1y: { type: Number },
    totalAllTime: { type: Number },
    average1y: { type: Number, default: null },
    change_1d: { type: Number },
    change_7d: { type: Number },
    change_1m: { type: Number },
    change_7dover7d: { type: Number },
    change_30dover30d: { type: Number },
    breakdown24h: {
      type: [breakdownSchema],
      default: [],
    },
    dataType: {
      type: String,
      enum: ['dailyFees', 'dailyRevenue'],
      required: true,
    },
  },
  { timestamps: true }
);

const FeesAndRevenue = mongoose.model('FeesAndRevenue', feesAndRevenueSchema);

module.exports = FeesAndRevenue;
