import { describe, it, expect, beforeEach } from 'vitest';
import { getRepositories } from '../../infrastructure/config';
import { resetDatabase } from '../utils/resetDatabase';

describe('Catalog Module (ProductRepository)', () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it('should create and retrieve a product', async () => {
    const repos = getRepositories();
    const orgId = 'org-1';

    const product = await repos.products.create({
      organizationId: orgId,
      name: 'Test Product',
      category: 'Electronics',
      price: 99.99,
      status: 'active',
      customFields: {}
    });

    expect(product.id).toBeDefined();
    expect(product.createdAt).toBeDefined();

    const fetched = await repos.products.findById(orgId, product.id);
    expect(fetched).toEqual(product);
  });

  it('should list only active products by default if filtered', async () => {
    const repos = getRepositories();
    const orgId = 'org-1';

    await repos.products.create({ organizationId: orgId, name: 'P1', category: 'C', price: 10, status: 'active', customFields: {} });
    await repos.products.create({ organizationId: orgId, name: 'P2', category: 'C', price: 10, status: 'archived', customFields: {} });

    const all = await repos.products.findAllByOrganization(orgId);
    expect(all.length).toBe(2);
    expect(all.filter(p => p.status === 'active').length).toBe(1);
  });
});
