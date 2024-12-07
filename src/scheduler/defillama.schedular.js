const axios = require('axios');
const CryptoIdentity = require('../models/identity.model');
const TVL = require('../models/tvl.model');
const FeesAndRevenue = require('../models/fee.revenue.model');
const {
  normalizeUrl,
  extractTokenAddress,
} = require('../utils/scheduler.helper');
const FEES_URL =
  'https://api.llama.fi/overview/fees?excludeTotalDataChart=true&excludeTotalDataChartBreakdown=true&dataType=dailyFees';
const REVENUE_URL =
  'https://api.llama.fi/overview/fees?excludeTotalDataChart=true&excludeTotalDataChartBreakdown=true&dataType=dailyRevenue';

async function getChainTvl() {
  const url = 'https://api.llama.fi/v2/chains';
  try {
    const chainsResponse = await axios.get(url);
    const chains = chainsResponse.data;
    const bulkOps = [];

    for (const chain of chains) {
      if (chain?.cmcId && !isNaN(chain?.cmcId)) {
        const cryptoIdentity = await CryptoIdentity.findOne({
          coinMarketCapId: chain.cmcId,
        });

        if (!cryptoIdentity) {
          continue;
        }

        const updatedData = {
          name: cryptoIdentity.name,
          tvlDefillama: chain.tvl,
        };

        bulkOps.push({
          updateOne: {
            filter: { projectId: cryptoIdentity._id },
            update: { $set: updatedData },
            upsert: true,
          },
        });
      }
    }

    if (bulkOps.length > 0) {
      const result = await TVL.bulkWrite(bulkOps);
      console.log(
        `Bulk operation complete for chains: ${result.matchedCount} matched, ${result.modifiedCount} modified, ${result.upsertedCount} upserted.`
      );
    } else {
      console.log('No protocols were updated.');
    }
  } catch (error) {
    console.error('Error fetching or updating data:', error);
  }
}

async function getProtocols() {
  const urlProtocols = 'https://api.llama.fi/protocols';
  const protocolsResponse = await axios.get(urlProtocols);
  const protocols = protocolsResponse.data;

  const bulkOps = [];

  for (const protocol of protocols) {
    let cryptoIdentity = null;

    if (protocol?.cmcId && !isNaN(protocol?.cmcId)) {
      cryptoIdentity = await CryptoIdentity.findOne({
        coinMarketCapId: Number(protocol?.cmcId),
      });
    }

    if (!cryptoIdentity && protocol?.address && protocol?.address.length > 0) {
      const address = await extractTokenAddress(protocol?.address);
      cryptoIdentity = await CryptoIdentity.findOne({ tokenAddress: address });
    }

    if (!cryptoIdentity && protocol?.url && protocol?.url.length > 0) {
      const modifiedUrl = await normalizeUrl(protocol?.url);
      cryptoIdentity = await CryptoIdentity.findOne({ url: modifiedUrl });
    }

    if (!cryptoIdentity) {
      continue;
    }

    const chainTvls = protocol.chainTvls
      ? Object.entries(protocol.chainTvls).map(([key, value]) => ({
          key,
          value,
        }))
      : [];

    const updatedData = {
      name: cryptoIdentity.name,
      tvlDefillama: protocol.tvl,
      chainTvls: chainTvls,
      change1h: protocol.change_1h,
      change1d: protocol.change_1d,
      change7d: protocol.change7d,
    };

    bulkOps.push({
      updateOne: {
        filter: { projectId: cryptoIdentity._id },
        update: { $set: updatedData },
        upsert: true,
      },
    });

    cryptoIdentity.defillamaSlug = protocol.slug;
    await cryptoIdentity.save();
  }

  if (bulkOps.length > 0) {
    const result = await TVL.bulkWrite(bulkOps);
    console.log(
      `Bulk operation complete for protocols: ${result.matchedCount} matched, ${result.modifiedCount} modified, ${result.upsertedCount} upserted.`
    );
  } else {
    console.log('No matching protocols found. No updates were performed.');
  }
}

async function updateFeesOrRevenue(url, dataType) {
  try {
    const response = await axios.get(url);
    const protocols = response.data.protocols;

    const bulkOps = [];

    for (const protocol of protocols) {
      const cryptoIdentity = await CryptoIdentity.findOne({
        defillamaSlug: protocol.slug,
      });

      if (!cryptoIdentity) continue;

      const fieldsToCheck = [
        protocol.total24h,
        protocol.total48hto24h,
        protocol.total7d,
        protocol.total14dto7d,
        protocol.total30d,
        protocol.total60dto30d,
        protocol.total1y,
        protocol.totalAllTime,
        protocol.change_1d,
        protocol.change_7d,
        protocol.change_1m,
        protocol.change_7dover7d,
        protocol.change_30dover30d,
      ];

      const hasData = fieldsToCheck.some((field) => field !== undefined);

      if (!hasData) continue;

      const updateData = {
        projectId: cryptoIdentity._id,
        name: cryptoIdentity.name,
        total24h: protocol.total24h || null,
        total48hto24h: protocol.total48hto24h || null,
        total7d: protocol.total7d || null,
        total14dto7d: protocol.total14dto7d || null,
        total30d: protocol.total30d || null,
        total60dto30d: protocol.total60dto30d || null,
        total1y: protocol.total1y || null,
        totalAllTime: protocol.totalAllTime || null,
        change_1d: protocol.change_1d || null,
        change_7d: protocol.change_7d || null,
        change_1m: protocol.change_1m || null,
        change_7dover7d: protocol.change_7dover7d || null,
        change_30dover30d: protocol.change_30dover30d || null,
        breakdown24h: protocol.breakdown24h
          ? Object.entries(protocol.breakdown24h).map(([key, value]) => ({
              key,
              value,
            }))
          : [],
        dataType,
      };

      bulkOps.push({
        updateOne: {
          filter: { projectId: cryptoIdentity._id, dataType },
          update: { $set: updateData },
          upsert: true,
        },
      });
    }

    if (bulkOps.length > 0) {
      const result = await FeesAndRevenue.bulkWrite(bulkOps);
      console.log(
        `Bulk update (${dataType}) complete: ${result.matchedCount} matched, ${result.modifiedCount} modified, ${result.upsertedCount} upserted.`
      );
    } else {
      console.log(`No matching data found for ${dataType} updates.`);
    }
  } catch (error) {
    console.error(`Error updating ${dataType}:`, error);
  }
}

async function getDailyFeesAndRevenue() {
  await Promise.all([
    updateFeesOrRevenue(FEES_URL, 'dailyFees'),
    updateFeesOrRevenue(REVENUE_URL, 'dailyRevenue'),
  ]);
}

module.exports = {
  getProtocols,
  getChainTvl,
  getDailyFeesAndRevenue,
};
