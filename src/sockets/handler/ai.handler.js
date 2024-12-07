const axios = require('axios');

const getAiResponse = async ({ message }) => {
  try {
    const response = await axios.post(
      'https://1e14-125-63-73-50.ngrok-free.app/query/',
      {
        user_query: message,
      }
    );

    const data = response.data;

    if (data && data.response) {
      return { message: data.response };
    } else {
      return {
        message: 'Sorry, I could not fetch the information you requested.',
      };
    }
  } catch (error) {
    console.error('Error fetching data from API:', error);
    return {
      message: 'Sorry, there was an error processing your request.',
    };
  }
};

module.exports = { getAiResponse };
