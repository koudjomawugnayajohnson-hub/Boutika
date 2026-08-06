import {
  UserRepository,
  OrganizationRepository,
  ShopRepository,
  OrganizationMemberRepository,
  ShopStaffRepository,
  AuditLogRepository,
  InvitationRepository,
  ProductRepository,
  InventoryRepository,
  SaleRepository,
  SaleItemRepository,
  InvoiceRepository,
  PlatformAdminRepository,
  SubscriptionRepository,
  QueryOptions
} from '../../core/repositories';
import {
  User, Organization, Shop, OrganizationMember, ShopStaff, AuditLog,
  Invitation, Product, InventoryItem, Sale, SaleItem, Invoice,
  PlatformAdmin, Subscription
} from '../../core/types';
import { mockDb, generateId, generateDate } from './MockDatabase';

export class MockUserRepository implements UserRepository {
  async findById(id: string): Promise<User | null> {
    return mockDb.users.find(u => u.id === id) || null;
  }
  async findByPhone(phone: string): Promise<User | null> {
    return mockDb.users.find(u => u.phone === phone) || null;
  }
  async create(user: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    const newUser: User = { ...user, id: generateId(), createdAt: generateDate() };
    mockDb.users.push(newUser);
    return newUser;
  }
}

export class MockOrganizationRepository implements OrganizationRepository {
  async findById(id: string): Promise<Organization | null> {
    const org = mockDb.organizations.find(o => o.id === id);
    return org || null;
  }
  async findAll(): Promise<Organization[]> {
    return mockDb.organizations;
  }
  async create(org: Omit<Organization, 'id' | 'createdAt'>): Promise<Organization> {
    const newOrg: Organization = { ...org, id: generateId(), createdAt: generateDate() };
    mockDb.organizations.push(newOrg);
    return newOrg;
  }
  async update(id: string, updates: Partial<Organization>): Promise<Organization> {
    const idx = mockDb.organizations.findIndex(o => o.id === id);
    if (idx === -1) throw new Error('Organization not found');
    mockDb.organizations[idx] = { ...mockDb.organizations[idx], ...updates };
    return mockDb.organizations[idx];
  }
  async delete(id: string): Promise<void> {
    const idx = mockDb.organizations.findIndex(o => o.id === id);
    if (idx !== -1) {
      mockDb.organizations.splice(idx, 1);
      // Optional: also delete related shops, products, etc.
    }
  }
}

export class MockShopRepository implements ShopRepository {
  async findById(organizationId: string, id: string): Promise<Shop | null> {
    return mockDb.shops.find(s => s.id === id && s.organizationId === organizationId) || null;
  }
  async findAllByOrganization(organizationId: string): Promise<Shop[]> {
    return mockDb.shops.filter(s => s.organizationId === organizationId);
  }
  async create(shop: Omit<Shop, 'id' | 'createdAt'>): Promise<Shop> {
    const org = mockDb.organizations.find(o => o.id === shop.organizationId);
    if (!org) throw new Error('Organization not found');
    
    const existingShops = mockDb.shops.filter(s => s.organizationId === shop.organizationId);
    
    // Check active subscription
    const activeSub = mockDb.subscriptions.find(s => s.organizationId === shop.organizationId && s.status === 'active');
    const tier = activeSub ? activeSub.tier : org.planTier;

    let limit = 1; // Default 'starter'
    if (tier === 'pro') limit = 3;
    if (tier === 'enterprise') limit = Infinity;
    
    if (existingShops.length >= limit) {
      throw new Error(`Shop limit reached for ${tier} plan (${limit} max)`);
    }

    const newShop: Shop = { ...shop, id: generateId(), createdAt: generateDate() };
    mockDb.shops.push(newShop);

    // Log activation event (Lot D)
    mockDb.auditLogs.push({
      id: generateId(),
      organizationId: newShop.organizationId,
      action: 'shop_created',
      entityType: 'shop',
      entityId: newShop.id,
      createdAt: generateDate(),
    });

    return newShop;
  }
}

export class MockOrganizationMemberRepository implements OrganizationMemberRepository {
  async findByUserId(userId: string): Promise<OrganizationMember[]> {
    return mockDb.organizationMembers.filter(m => m.userId === userId);
  }
  async findByOrganization(organizationId: string): Promise<OrganizationMember[]> {
    return mockDb.organizationMembers.filter(m => m.organizationId === organizationId);
  }
  async create(member: Omit<OrganizationMember, 'id' | 'invitedAt'>): Promise<OrganizationMember> {
    const newMember: OrganizationMember = { ...member, id: generateId(), invitedAt: generateDate() };
    mockDb.organizationMembers.push(newMember);
    return newMember;
  }
}

export class MockShopStaffRepository implements ShopStaffRepository {
  async findByUserId(userId: string): Promise<ShopStaff[]> {
    return mockDb.shopStaff.filter(s => s.userId === userId);
  }
  async findByShop(organizationId: string, shopId: string): Promise<ShopStaff[]> {
    // Need to verify shop belongs to org first (isolation)
    const shop = mockDb.shops.find(s => s.id === shopId && s.organizationId === organizationId);
    if (!shop) return [];
    return mockDb.shopStaff.filter(s => s.shopId === shopId);
  }
  async create(staff: Omit<ShopStaff, 'id'>): Promise<ShopStaff> {
    const newStaff: ShopStaff = { ...staff, id: generateId() };
    mockDb.shopStaff.push(newStaff);
    return newStaff;
  }
}

export class MockAuditLogRepository implements AuditLogRepository {
  async findAllByOrganization(organizationId: string, options?: QueryOptions): Promise<AuditLog[]> {
    return mockDb.auditLogs.filter(l => l.organizationId === organizationId);
  }
  async findAll(): Promise<AuditLog[]> {
    return mockDb.auditLogs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  async create(log: Omit<AuditLog, 'id' | 'createdAt'>): Promise<AuditLog> {
    const newLog: AuditLog = { ...log, id: generateId(), createdAt: generateDate() };
    mockDb.auditLogs.push(newLog);
    return newLog;
  }
}

export class MockProductRepository implements ProductRepository {
  async findById(organizationId: string, id: string): Promise<Product | null> {
    return mockDb.products.find(p => p.id === id && p.organizationId === organizationId) || null;
  }
  async findAllByOrganization(organizationId: string): Promise<Product[]> {
    return mockDb.products.filter(p => p.organizationId === organizationId);
  }
  async create(product: Omit<Product, 'id' | 'createdAt'>): Promise<Product> {
    const newProduct: Product = { ...product, id: generateId(), createdAt: generateDate() };
    mockDb.products.push(newProduct);
    return newProduct;
  }
  async update(organizationId: string, id: string, updates: Partial<Product>): Promise<Product> {
    const idx = mockDb.products.findIndex(p => p.id === id && p.organizationId === organizationId);
    if (idx === -1) throw new Error('Product not found in this organization');
    mockDb.products[idx] = { ...mockDb.products[idx], ...updates };
    return mockDb.products[idx];
  }
}

// ... other repositories will be added in another file or same file.
