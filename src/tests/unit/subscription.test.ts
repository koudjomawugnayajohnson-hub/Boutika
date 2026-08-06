import { describe, it, expect, beforeEach } from 'vitest';
import { getRepositories } from '../../infrastructure/config';
import { resetDatabase } from '../utils/resetDatabase';
import { mockDb } from '../../infrastructure/mock/MockDatabase';

describe('Subscription Module (Shop Limits)', () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it('starter plan enforces 1 shop limit', async () => {
    const repos = getRepositories();
    const org = await repos.organizations.create({
      name: 'Starter Org',
      planTier: 'starter',
      ownerId: 'u1',
      settings: {}
    });

    // Create 1st shop (Should succeed)
    await repos.shops.create({
      organizationId: org.id,
      name: 'Shop 1',
      address: 'Add 1',
      phone: '123'
    });

    // Create 2nd shop (Should fail)
    await expect(repos.shops.create({
      organizationId: org.id,
      name: 'Shop 2',
      address: 'Add 2',
      phone: '456'
    })).rejects.toThrow(/Shop limit reached/);
  });

  it('pro plan enforces 3 shop limit', async () => {
    const repos = getRepositories();
    const org = await repos.organizations.create({
      name: 'Pro Org',
      planTier: 'pro',
      ownerId: 'u1',
      settings: {}
    });

    // Create 3 shops (Should succeed)
    for (let i = 1; i <= 3; i++) {
      await repos.shops.create({
        organizationId: org.id,
        name: `Shop ${i}`,
        address: `Add ${i}`,
        phone: '123'
      });
    }

    // Create 4th shop (Should fail)
    await expect(repos.shops.create({
      organizationId: org.id,
      name: 'Shop 4',
      address: 'Add 4',
      phone: '456'
    })).rejects.toThrow(/Shop limit reached/);
  });

  it('upgrading subscription updates the limit', async () => {
    const repos = getRepositories();
    const org = await repos.organizations.create({
      name: 'Upgrade Org',
      planTier: 'starter',
      ownerId: 'u1',
      settings: {}
    });

    // 1st shop OK
    await repos.shops.create({ organizationId: org.id, name: 'S1', address: '', phone: '' });

    // 2nd fails
    await expect(repos.shops.create({ organizationId: org.id, name: 'S2', address: '', phone: '' }))
      .rejects.toThrow(/Shop limit reached/);

    // Add Pro subscription manually to DB for mock
    mockDb.subscriptions.push({
      id: 'sub-1',
      organizationId: org.id,
      tier: 'pro',
      billingCycle: 'monthly',
      status: 'active',
      startDate: new Date(),
      createdAt: new Date(),
    });

    // 2nd should now succeed
    await repos.shops.create({ organizationId: org.id, name: 'S2', address: '', phone: '' });
  });
});
