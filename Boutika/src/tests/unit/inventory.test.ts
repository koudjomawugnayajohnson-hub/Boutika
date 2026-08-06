import { describe, it, expect, beforeEach } from 'vitest';
import { getRepositories } from '../../infrastructure/config';
import { resetDatabase } from '../utils/resetDatabase';
import { mockDb } from '../../infrastructure/mock/MockDatabase';

describe('Inventory Module (InventoryRepository)', () => {
  beforeEach(async () => {
    await resetDatabase();
    // Add a mock shop to satisfy verifyShopAccess
    mockDb.shops.push({ id: 'shop-1', organizationId: 'org-1', name: 'Test Shop' } as any);
  });

  it('should upsert inventory', async () => {
    const repos = getRepositories();
    const shopId = 'shop-1';
    const prodId = 'prod-1';

    // Insert
    let inv = await repos.inventory.upsert({ shopId, productId: prodId, quantity: 10, lowStockThreshold: 5 });
    expect(inv.quantity).toBe(10);
    expect(inv.lowStockThreshold).toBe(5);

    // Update
    inv = await repos.inventory.upsert({ shopId, productId: prodId, quantity: 20 });
    expect(inv.quantity).toBe(20);
    expect(inv.lowStockThreshold).toBe(5); // should remain 5 if not provided

    // Verify list
    const all = await repos.inventory.findAllByShop('org-1', shopId); // orgId is ignored in mock
    expect(all.length).toBe(1);
    expect(all[0].quantity).toBe(20);
  });
});
