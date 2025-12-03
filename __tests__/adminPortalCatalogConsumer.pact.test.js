'use strict';

const path = require('path');
const { PactV4, MatchersV3 } = require('@pact-foundation/pact');
const AdminPortalService = require('../src/adminPortalService');
const catalogAdminClient = require('../src/catalogAdminClient');

const pactConfig = {
  consumer: 'AdminPortal',
  provider: 'CatalogService',
  logLevel: 'info',
  log: path.resolve(__dirname, '..', 'logs', 'admin-portal-catalog.log'),
  dir: path.resolve(__dirname, '..', 'pacts'),
};

const productMatcher = {
  id: MatchersV3.integer(1),
  name: MatchersV3.like('Coffee Machine'),
  description: MatchersV3.like('Freshly brewed coffee every morning'),
  price: MatchersV3.decimal(199.99),
  inStock: MatchersV3.boolean(true),
};

describe('Admin Portal -> Catalog pact', () => {
  const pact = new PactV4(pactConfig);

  it('lists products with status metadata for administrators', async () => {
    await pact
      .addInteraction()
      .given('products exist')
      .uponReceiving('a request for the administrative product listing')
      .withRequest('GET', '/products', (builder) => {
        builder.headers({ 'Accept': 'application/json' });
      })
      .willRespondWith(200, (builder) => {
        builder
          .headers({ 'Content-Type': 'application/json; charset=utf-8' })
          .jsonBody(MatchersV3.eachLike(productMatcher, 2));
      })
      .executeTest(async (mockServer) => {
        const service = new AdminPortalService({
          catalogClient: catalogAdminClient,
          catalogBaseUrl: mockServer.url,
        });

        const products = await service.listProductsForAdmin();
        expect(products.length).toBeGreaterThanOrEqual(2);
        expect(products[0]).toEqual(
          expect.objectContaining({
            id: expect.any(Number),
            status: 'ACTIVE',
            inStock: true,
          })
        );
      });
  });

  it('retrieves a product for editing with derived status', async () => {
    await pact
      .addInteraction()
      .given('product with ID 2 exists')
      .uponReceiving('an administrative request to edit a product')
      .withRequest('GET', '/products/2', (builder) => {
        builder.headers({ 'Accept': 'application/json' });
      })
      .willRespondWith(200, (builder) => {
        builder
          .headers({ 'Content-Type': 'application/json; charset=utf-8' })
          .jsonBody({
            id: MatchersV3.integer(2),
            name: MatchersV3.like('Wireless Headphones'),
            description: MatchersV3.like('Noise cancelling over-ear headphones'),
            price: MatchersV3.decimal(3249.5),
            inStock: MatchersV3.boolean(true),
          });
      })
      .executeTest(async (mockServer) => {
        const service = new AdminPortalService({
          catalogClient: catalogAdminClient,
          catalogBaseUrl: mockServer.url,
        });

        const product = await service.getProductForEditing(2);
        expect(product).toEqual(
          expect.objectContaining({
            id: 2,
            status: 'ACTIVE',
            inStock: true,
          })
        );
      });
  });

  it('returns null when an administrator opens a missing product', async () => {
    await pact
      .addInteraction()
      .given('product with ID 999 does not exist')
      .uponReceiving('an administrative request to edit a missing product')
      .withRequest('GET', '/products/999', (builder) => {
        builder.headers({ 'Accept': 'application/json' });
      })
      .willRespondWith(404, (builder) => {
        builder
          .headers({ 'Content-Type': 'application/json; charset=utf-8' })
          .jsonBody(MatchersV3.like({ message: 'Product not found' }));
      })
      .executeTest(async (mockServer) => {
        const service = new AdminPortalService({
          catalogClient: catalogAdminClient,
          catalogBaseUrl: mockServer.url,
        });

        const product = await service.getProductForEditing(999);
        expect(product).toBeNull();
      });
  });
});
