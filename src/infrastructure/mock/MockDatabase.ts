import {
  User,
  Organization,
  Shop,
  OrganizationMember,
  ShopStaff,
  AuditLog,
  Invitation,
  Product,
  InventoryItem,
  Sale,
  SaleItem,
  Invoice,
  PlatformAdmin,
  Subscription
} from '../../core/types';

export const mockDb = {
  users: [] as User[],
  organizations: [] as Organization[],
  shops: [] as Shop[],
  organizationMembers: [] as OrganizationMember[],
  shopStaff: [] as ShopStaff[],
  auditLogs: [] as AuditLog[],
  invitations: [] as Invitation[],
  products: [] as Product[],
  inventory: [] as InventoryItem[],
  sales: [] as Sale[],
  saleItems: [] as SaleItem[],
  invoices: [] as Invoice[],
  platformAdmins: [] as PlatformAdmin[],
  subscriptions: [] as Subscription[],
};

export const resetMockDatabase = () => {
  mockDb.users = [];
  mockDb.organizations = [];
  mockDb.shops = [];
  mockDb.organizationMembers = [];
  mockDb.shopStaff = [];
  mockDb.auditLogs = [];
  mockDb.invitations = [];
  mockDb.products = [];
  mockDb.inventory = [];
  mockDb.sales = [];
  mockDb.saleItems = [];
  mockDb.invoices = [];
  mockDb.platformAdmins = [];
  mockDb.subscriptions = [];
};

// Helper for generating mock IDs
export const generateId = () => Math.random().toString(36).substr(2, 9);
export const generateDate = () => new Date().toISOString();

let isSeeded = false;

export const seedMockData = () => {
  if (isSeeded) return;
  isSeeded = true;
  
  // Owner 1
  const owner1: User = { id: 'u1', phone: '111111', createdAt: generateDate() };
  // Owner 2
  const owner2: User = { id: 'u2', phone: '222222', createdAt: generateDate() };
  // Member (belongs to Org 1)
  const member1: User = { id: 'u3', phone: '333333', createdAt: generateDate() };
  
  mockDb.users.push(owner1, owner2, member1);
  
  // Add u1 as a Platform Admin
  mockDb.platformAdmins.push({ userId: 'u1' });

  // 2 Distinct Organizations
  const org1: Organization = { id: 'org1', name: 'Organisation 1', planTier: 'starter', ownerId: 'u1', settings: {}, createdAt: generateDate() };
  const org2: Organization = { id: 'org2', name: 'Organisation 2', planTier: 'starter', ownerId: 'u2', settings: {}, createdAt: generateDate() };
  
  mockDb.organizations.push(org1, org2);

  // Org 1 has 2 shops
  const shop1A: Shop = { id: 's1A', organizationId: 'org1', name: 'Boutique Alpha', address: '123 Rue de la République, 75001 Paris', phone: '+33 1 23 45 67 89', logoUrl: 'https://via.placeholder.com/150x50?text=Boutika', createdAt: generateDate() };
  const shop1B: Shop = { id: 's1B', organizationId: 'org1', name: 'Boutique Beta', address: '456 Avenue Jean Jaurès, 69007 Lyon', phone: '+33 4 56 78 90 12', createdAt: generateDate() };
  
  mockDb.shops.push(shop1A, shop1B);

  // Assign member1 to Org 1 as 'member'
  const orgMember1: OrganizationMember = { id: 'om1', organizationId: 'org1', userId: 'u3', role: 'member', invitedAt: generateDate(), joinedAt: generateDate() };
  mockDb.organizationMembers.push(orgMember1);

  // Assign member1 only to Shop 1A via shop_staff
  const staff1: ShopStaff = { id: 'ss1', shopId: 's1A', userId: 'u3' };
  mockDb.shopStaff.push(staff1);

  // Seed today's sales for Boutique Alpha (org1 / s1A) for Dashboard metrics demo
  const now = new Date();
  const todayMorning   = new Date(now); todayMorning.setHours(9,  12, 0, 0);
  const todayNoon      = new Date(now); todayNoon.setHours(12, 45, 0, 0);
  const todayAfternoon = new Date(now); todayAfternoon.setHours(15, 3, 0, 0);

  const sale1: Sale = { id: 'sale1', organizationId: 'org1', shopId: 's1A', total: 47.50, status: 'closed', createdAt: todayMorning.toISOString() };
  const sale2: Sale = { id: 'sale2', organizationId: 'org1', shopId: 's1A', total: 129.00, status: 'closed', createdAt: todayNoon.toISOString() };
  const sale3: Sale = { id: 'sale3', organizationId: 'org1', shopId: 's1A', total: 85.00, status: 'closed', createdAt: todayAfternoon.toISOString() };
  mockDb.sales.push(sale1, sale2, sale3);

  // Mock Products
  const prod1: Product = { id: 'TS-001', organizationId: 'org1', name: 'T-Shirt Basique Coton', category: 'Vêtements', price: 24.99, customFields: { taille: 'M', couleur: 'Blanc' }, status: 'active', createdAt: generateDate() };
  const prod2: Product = { id: 'CF-ETH-02', organizationId: 'org1', name: 'Café Éthiopie Moka', category: 'Alimentaire', price: 18.50, customFields: { unité: '250g', mouture: 'Grain' }, status: 'active', createdAt: generateDate() };
  const prod3: Product = { id: 'AC-GOU-01', organizationId: 'org1', name: 'Gourde Inox Isotherme', category: 'Accessoires', price: 32.00, customFields: { capacité: '750ml' }, status: 'active', createdAt: generateDate() };
  mockDb.products.push(prod1, prod2, prod3);

  // Mock Inventory for Shop 1A
  mockDb.inventory.push({ id: 'inv1', shopId: 's1A', productId: 'TS-001', quantity: 45, lowStockThreshold: 10, updatedAt: generateDate() });
  mockDb.inventory.push({ id: 'inv2', shopId: 's1A', productId: 'CF-ETH-02', quantity: 8, lowStockThreshold: 10, updatedAt: generateDate() });
  mockDb.inventory.push({ id: 'inv3', shopId: 's1A', productId: 'AC-GOU-01', quantity: 0, lowStockThreshold: 5, updatedAt: generateDate() });
};
