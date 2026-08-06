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
  Subscription,
} from './types';

// Pagination/filtering options can be expanded later
export interface QueryOptions {
  limit?: number;
  offset?: number;
}

export interface AuthRepository {
  registerWithEmail(name: string, email: string): Promise<{ id: string, email: string } | null>;
  requestEmailOtp(email: string): Promise<{ success: boolean; error?: string }>;
  verifyEmailOtp(email: string, otp: string): Promise<{ id: string } | null>;
  requestAdminOtp(email: string): Promise<boolean>;
  verifyAdminOtp(email: string, otp: string): Promise<{ id: string } | null>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<{ id: string, email?: string } | null>;
  onAuthStateChange(callback: (userId: string | null) => void): () => void;
}

export interface UserRepository {
  findById(id: string): Promise<User | null>;
  findByPhone(phone: string): Promise<User | null>;
  create(user: Omit<User, 'id' | 'createdAt'> & { id?: string }): Promise<User>;
}

export interface OrganizationRepository {
  findById(id: string): Promise<Organization | null>;
  findAll(): Promise<Organization[]>;
  create(org: Omit<Organization, 'id' | 'createdAt'>): Promise<Organization>;
  createViaRpc(name: string): Promise<Organization>;
  update(id: string, updates: Partial<Organization>): Promise<Organization>;
  delete(id: string): Promise<void>;
}

export interface ShopRepository {
  findById(organizationId: string, id: string): Promise<Shop | null>;
  findAllByOrganization(organizationId: string): Promise<Shop[]>;
  create(shop: Omit<Shop, 'id' | 'createdAt'>): Promise<Shop>;
}

export interface OrganizationMemberRepository {
  findByUserId(userId: string): Promise<OrganizationMember[]>;
  findByOrganization(organizationId: string): Promise<OrganizationMember[]>;
  create(member: Omit<OrganizationMember, 'id' | 'invitedAt'>): Promise<OrganizationMember>;
}

export interface ShopStaffRepository {
  findByUserId(userId: string): Promise<ShopStaff[]>;
  findByShop(organizationId: string, shopId: string): Promise<ShopStaff[]>;
  create(staff: Omit<ShopStaff, 'id'>): Promise<ShopStaff>;
}

export interface AuditLogRepository {
  findAllByOrganization(organizationId: string, options?: QueryOptions): Promise<AuditLog[]>;
  findAll?(): Promise<AuditLog[]>;
  create(log: Omit<AuditLog, 'id' | 'createdAt'>): Promise<AuditLog>;
}

export interface InvitationRepository {
  findById(organizationId: string, id: string): Promise<Invitation | null>;
  findAllByOrganization(organizationId: string): Promise<Invitation[]>;
  create(invitation: Omit<Invitation, 'id' | 'createdAt'>): Promise<Invitation>;
  updateStatus(organizationId: string, id: string, status: Invitation['status']): Promise<Invitation>;
}

export interface ProductRepository {
  findById(organizationId: string, id: string): Promise<Product | null>;
  findAllByOrganization(organizationId: string): Promise<Product[]>;
  create(product: Omit<Product, 'id' | 'createdAt'>): Promise<Product>;
  update(organizationId: string, id: string, updates: Partial<Product>): Promise<Product>;
}

export interface InventoryRepository {
  findByProduct(organizationId: string, shopId: string, productId: string): Promise<InventoryItem | null>;
  findAllByShop(organizationId: string, shopId: string): Promise<InventoryItem[]>;
  upsert(item: Omit<InventoryItem, 'id' | 'updatedAt'>): Promise<InventoryItem>;
}

export interface SaleRepository {
  findById(organizationId: string, shopId: string, id: string): Promise<Sale | null>;
  findAllByShop(organizationId: string, shopId: string): Promise<Sale[]>;
  findRecent(organizationId: string, shopId: string, limit: number): Promise<Sale[]>;
  create(sale: Omit<Sale, 'id' | 'createdAt'>): Promise<Sale>;
  update(organizationId: string, shopId: string, id: string, updates: Partial<Sale>): Promise<Sale>;
}

export interface SaleItemRepository {
  findAllBySale(organizationId: string, shopId: string, saleId: string): Promise<SaleItem[]>;
  create(item: Omit<SaleItem, 'id'>): Promise<SaleItem>;
}

export interface InvoiceRepository {
  findById(organizationId: string, shopId: string, id: string): Promise<Invoice | null>;
  findBySale(organizationId: string, shopId: string, saleId: string): Promise<Invoice | null>;
  create(invoice: Omit<Invoice, 'id' | 'issuedAt'>): Promise<Invoice>;
}

export interface PlatformAdminRepository {
  findByUserId(userId: string): Promise<PlatformAdmin | null>;
}

export interface SubscriptionRepository {
  findByOrganization(organizationId: string): Promise<Subscription | null>;
  findAll(): Promise<Subscription[]>;
  create(subscription: Omit<Subscription, 'id' | 'createdAt'>): Promise<Subscription>;
  update(organizationId: string, id: string, updates: Partial<Subscription>): Promise<Subscription>;
}
