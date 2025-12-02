'use strict';

class AdminPortalService {
  constructor({ catalogClient, catalogBaseUrl }) {
    if (!catalogClient) {
      throw new Error('AdminPortalService requires a catalogClient');
    }
    if (!catalogBaseUrl) {
      throw new Error('AdminPortalService requires a catalogBaseUrl');
    }
    this.catalogClient = catalogClient;
    this.catalogBaseUrl = catalogBaseUrl;
  }

  async listProductsForAdmin() {
    const products = await this.catalogClient.getProducts(this.catalogBaseUrl);
    return products.map((product) => this.#mapProduct(product));
  }

  async getProductForEditing(productId) {
    const product = await this.catalogClient.getProduct(this.catalogBaseUrl, productId);
    if (!product) {
      return null;
    }
    return this.#mapProduct(product);
  }

  #mapProduct(product) {
    return {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      status: product.inStock ? 'ACTIVE' : 'OUT_OF_STOCK',
      inStock: Boolean(product.inStock),
    };
  }
}

module.exports = AdminPortalService;
