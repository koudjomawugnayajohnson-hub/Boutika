import { describe, it, expect, beforeEach } from 'vitest';
import { getRepositories } from '../../infrastructure/config';
import { resetDatabase } from '../utils/resetDatabase';
import { mockDb } from '../../infrastructure/mock/MockDatabase';

describe('Sales Module (SaleRepository)', () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it('should create a sale and trigger first_sale_created audit log', async () => {
    const repos = getRepositories();
    const orgId = 'org-1';

    const sale = await repos.sales.create({
      organizationId: orgId,
      shopId: 'shop-1',
      total: 100,
      status: 'closed',
      createdBy: 'user-1'
    });

    expect(sale.id).toBeDefined();

    // Verify first_sale_created was logged
    const logs = mockDb.auditLogs.filter(l => l.action === 'first_sale_created');
    expect(logs.length).toBe(1);
    expect(logs[0].organizationId).toBe(orgId);
  });
});
