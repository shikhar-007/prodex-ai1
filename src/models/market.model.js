const mongoose = require('mongoose');

const cryptoMarketDataSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CryptoIdentity',
      required: true,
    },
    name: {
      type: String,
    },

    numMarketPairs: { type: Number },
    dateAdded: { type: Date },
    maxSupply: { type: Number },
    circulatingSupply: { type: Number },
    totalSupply: { type: Number },
    infiniteSupply: { type: Boolean },
    selfReportedCirculatingSupply: { type: Number, default: null },
    selfReportedMarketCap: { type: Number, default: null },
    price: { type: Number },
    volume24h: { type: Number },
    volume7d: { type: Number },
    volume30d: { type: Number },
    volumeChange24h: { type: Number },
    percentChange1h: { type: Number },
    percentChange24h: { type: Number },
    percentChange7d: { type: Number },
    percentChange30d: { type: Number },
    percentChange60d: { type: Number },
    percentChange90d: { type: Number },
    marketCap: { type: Number },
    marketCapDominance: { type: Number },
    fullyDilutedMarketCap: { type: Number },
    marketCapByTotalSupply: { type: Number },
    quoteLastUpdated: { type: Date },
  },
  {
    timestamps: true,
  }
);

const CryptoMarketData = mongoose.model(
  'CryptoMarketData',
  cryptoMarketDataSchema
);

module.exports = CryptoMarketData;
