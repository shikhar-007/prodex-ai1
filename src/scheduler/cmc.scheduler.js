const axios = require('axios');
const CryptoIdentity = require('../models/identity.model');
const ProjectDetails = require('../models/project.details.model');
const CryptoMarketData = require('../models/market.model');
const TVL = require('../models/tvl.model');
//const { CMC_API_KEY } = require('../../config/env');
const { getApiKey } = require('../utils/apiKey.helper');
const { normalizeUrl } = require('../utils/scheduler.helper');

async function getCryptoRanks() {
  const BASE_URL = 'https://pro-api.coinmarketcap.com/v1/cryptocurrency/map';
  const CMC_API_KEY = await getApiKey({ platform: 'CoinsMarketCap' });

  try {
    const response = await axios.get(BASE_URL, {
      headers: {
        'X-CMC_PRO_API_KEY': CMC_API_KEY,
      },
      params: {
        listing_status: 'active',
        start: 1,
        limit: 1500,
        sort: 'cmc_rank',
        aux: 'platform,first_historical_data,last_historical_data,is_active',
      },
    });

    const cryptoData = response.data.data;

    const bulkOperations = cryptoData.map((data) => {
      const updateFields = {
        rank: data.rank,
        name: data.name,
        symbol: data.symbol,
        cmcSlug: data.slug,
        isActive: data.is_active === 1,
        firstHistoricalData: new Date(data.first_historical_data),
        lastHistoricalData: new Date(data.last_historical_data),
        platformName: data.platform ? data.platform.name : null,
        tokenAddress: data.platform?.token_address
          ? data.platform.token_address.toLowerCase()
          : null,
      };

      return {
        updateOne: {
          filter: { coinMarketCapId: data.id },
          update: { $set: updateFields },
          upsert: true,
        },
      };
    });

    const result = await CryptoIdentity.bulkWrite(bulkOperations);

    console.log(
      `Bulk operation complete: ${result.matchedCount} matched, ${result.modifiedCount} modified, ${result.upsertedCount} upserted.`
    );
  } catch (error) {
    console.error('Error fetching data from CoinMarketCap:', error);
  }
}

async function getCryptoMetaData() {
  try {
    const CMC_API_KEY = await getApiKey({ platform: 'CoinsMarketCap' });
    const BASE_URL = 'https://pro-api.coinmarketcap.com/v2/cryptocurrency/info';
    const cryptoIds = await CryptoIdentity.find().distinct('coinMarketCapId');
    if (cryptoIds.length === 0) {
      console.log('No cryptocurrencies found in the database');
      return;
    }

    const chunkArray = (array, size) => {
      const chunks = [];
      for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size));
      }
      return chunks;
    };

    const cryptoIdChunks = chunkArray(cryptoIds, 500);

    for (const chunk of cryptoIdChunks) {
      const response = await axios.get(BASE_URL, {
        headers: {
          'X-CMC_PRO_API_KEY': CMC_API_KEY,
        },
        params: {
          id: chunk.join(','),
          skip_invalid: true,
          aux: 'urls,logo,description,tags,platform,date_added,notice,status',
        },
      });

      const cryptoData = response.data.data;

      const bulkOps = [];

      for (const coinMarketCapId in cryptoData) {
        const data = cryptoData[coinMarketCapId];

        const cryptoIdentity = await CryptoIdentity.findOne({
          coinMarketCapId: parseInt(coinMarketCapId),
        });

        if (!cryptoIdentity) {
          console.log(
            `CryptoIdentity not found for coinMarketCapId ${coinMarketCapId}`
          );
          continue;
        }

        cryptoIdentity.url = await normalizeUrl(data?.urls?.website[0]);
        await cryptoIdentity.save();

        const updateFields = {
          name: data.name,
          logo: data.logo || null,
          description: data.description || 'No description available',
          website: data.urls.website || [],
          twitter: data.urls.twitter || [],
          messageBoard: data.urls.message_board || [],
          chat: data.urls.chat || [],
          facebook: data.urls.facebook || [],
          explorer: data.urls.explorer || [],
          reddit: data.urls.reddit || [],
          technicalDoc: data.urls.technical_doc || [],
          sourceCode: data.urls.source_code || [],
          announcement: data.urls.announcement || [],
          dateLaunched: data.date_added ? new Date(data.date_added) : null,
        };

        bulkOps.push({
          updateOne: {
            filter: { projectId: cryptoIdentity._id },
            update: { $set: updateFields },
            upsert: true,
          },
        });
      }

      if (bulkOps.length > 0) {
        const result = await ProjectDetails.bulkWrite(bulkOps);
        console.log(
          `Bulk operation complete: ${result.matchedCount} matched, ${result.modifiedCount} modified, ${result.upsertedCount} upserted.`
        );
      }
    }

    console.log('Cryptocurrency metadata updated in the database');
  } catch (error) {
    console.error('Error fetching or updating data from CoinMarketCap:', error);
  }
}

async function getCryptoMarketData() {
  const CMC_API_KEY = await getApiKey({ platform: 'CoinsMarketCap' });
  const BASE_URL =
    'https://pro-api.coinmarketcap.com/v2/cryptocurrency/quotes/latest';
  const cryptoIds = await CryptoIdentity.find().distinct('coinMarketCapId');

  if (cryptoIds.length === 0) {
    console.log('No cryptocurrencies found in the database');
    return;
  }

  const chunkArray = (array, size) => {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  };

  const cryptoIdChunks = chunkArray(cryptoIds, 500);

  for (const chunk of cryptoIdChunks) {
    try {
      const response = await axios.get(BASE_URL, {
        headers: {
          'X-CMC_PRO_API_KEY': CMC_API_KEY,
        },
        params: {
          id: chunk.join(','),
          skip_invalid: true,
          aux: 'num_market_pairs,cmc_rank,date_added,max_supply,circulating_supply,total_supply,market_cap_by_total_supply,volume_7d,volume_30d,is_active',
        },
      });

      const cryptoData = response.data.data;

      const cmcBulkOps = [];
      const defiBulkOps = [];

      for (const coinMarketCapId in cryptoData) {
        const data = cryptoData[coinMarketCapId];

        const cryptoIdentity = await CryptoIdentity.findOne({
          coinMarketCapId: parseInt(coinMarketCapId),
        });

        if (!cryptoIdentity) {
          console.log(
            `CryptoIdentity not found for coinMarketCapId ${coinMarketCapId}`
          );
          continue;
        }

        const marketData = {
          projectId: cryptoIdentity._id,
          name: data.name,
          numMarketPairs: data.num_market_pairs,
          dateAdded: data.date_added ? new Date(data.date_added) : null,
          maxSupply: data.max_supply,
          circulatingSupply: data.circulating_supply,
          totalSupply: data.total_supply,
          infiniteSupply: data.infinite_supply || false,
          selfReportedCirculatingSupply:
            data.self_reported_circulating_supply || null,
          selfReportedMarketCap: data.self_reported_market_cap || null,
          price: data.quote?.USD?.price,
          volume24h: data.quote?.USD?.volume_24h,
          volume7d: data.quote?.USD?.volume_7d,
          volume30d: data.quote?.USD?.volume_30d,
          volumeChange24h: data.quote?.USD?.volume_change_24h,
          percentChange1h: data.quote?.USD?.percent_change_1h,
          percentChange24: data.quote?.USD?.percent_change_24h,
          percentChange7d: data.quote?.USD?.percent_change_7d,
          percentChange30d: data.quote?.USD?.percent_change_30d,
          percentChange60d: data.quote?.USD?.percent_change_60d,
          percentChange90d: data.quote?.USD?.percent_change_90d,
          marketCap: data.quote?.USD?.market_cap,
          marketCapDominance: data.quote?.USD?.market_cap_dominance,
          fullyDilutedMarketCap: data.quote?.USD?.fully_diluted_market_cap,
          marketCapByTotalSupply: data.quote?.USD?.market_cap_by_total_supply,
          quoteLastUpdated: data.quote?.USD?.last_updated
            ? new Date(data.quote.USD.last_updated)
            : null,
        };

        if (data?.tvl_ratio || data.quote?.USD?.tvl) {
          const tvlData = {
            name: data.name,
            projectId: cryptoIdentity._id,
            tvlRatio: data.tvl_ratio || null,
            tvl: data.quote?.USD?.tvl || null,
          };

          defiBulkOps.push({
            updateOne: {
              filter: { projectId: cryptoIdentity._id },
              update: { $set: tvlData },
              upsert: true,
            },
          });
        }
        cmcBulkOps.push({
          updateOne: {
            filter: { projectId: cryptoIdentity._id },
            update: { $set: marketData },
            upsert: true,
          },
        });
      }

      if (cmcBulkOps.length > 0 || defiBulkOps.length > 0) {
        const resultPromises = [];

        if (cmcBulkOps.length > 0) {
          resultPromises.push(CryptoMarketData.bulkWrite(cmcBulkOps));
        }

        if (defiBulkOps.length > 0) {
          resultPromises.push(TVL.bulkWrite(defiBulkOps));
        }

        const results = await Promise.all(resultPromises);

        if (results[0]) {
          console.log(
            `CryptoMarketData bulk operation complete: ${results[0].matchedCount} matched, ${results[0].modifiedCount} modified, ${results[0].upsertedCount} upserted.`
          );
        }
        if (results[1]) {
          console.log(
            `TVL bulk operation complete: ${results[1].matchedCount} matched, ${results[1].modifiedCount} modified, ${results[1].upsertedCount} upserted.`
          );
        }
      }
    } catch (error) {
      console.error('Error fetching data from CoinMarketCap for chunk:', error);
    }
  }

  console.log('Cryptocurrency market data saved or updated in the database');
}

module.exports = { getCryptoRanks, getCryptoMetaData, getCryptoMarketData };
