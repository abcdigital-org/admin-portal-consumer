'use strict';

const axios = require('axios');

const defaultHeaders = {
  Accept: 'application/json',
  'Content-Type': 'application/json',
};

const buildUrl = (baseUrl, path) => {
  if (!baseUrl) {
    throw new Error('Admin portal catalog client requires a baseUrl');
  }
  const trimmedBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  return `${trimmedBase}${path}`;
};

const getProducts = async (baseUrl) => {
  const url = buildUrl(baseUrl, '/products');
  const response = await axios.get(url, { headers: defaultHeaders });
  return response.data;
};

const getProduct = async (baseUrl, productId) => {
  const url = buildUrl(baseUrl, `/products/${productId}`);
  try {
    const response = await axios.get(url, { headers: defaultHeaders });
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return null;
    }
    throw error;
  }
};

module.exports = {
  getProducts,
  getProduct,
};
