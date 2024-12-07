const normalizeUrl = async (url) => {
  if (typeof url !== 'string' || url.trim() === '') {
    return null;
  }

  url = url.trim();

  if (!url.endsWith('/')) {
    url = `${url}/`;
  }

  if (!url.startsWith('https://www.')) {
    if (url.startsWith('http://')) {
      url = url.replace('http://', 'https://www.');
    } else if (url.startsWith('https://')) {
      url = url.replace('https://', 'https://www.');
    } else {
      url = `https://www.${url}`;
    }
  }

  return url;
};

function extractTokenAddress(address) {
  const parts = address.split(':');
  return (parts.length > 1 ? parts[1] : parts[0]).toLowerCase();
}

module.exports = { normalizeUrl, extractTokenAddress };
