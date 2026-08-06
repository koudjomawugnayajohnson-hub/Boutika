import {
  AuthRepository,
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
  SubscriptionRepository
} from '../core/repositories';

import {
  MockUserRepository,
  MockOrganizationRepository,
  MockShopRepository,
  MockOrganizationMemberRepository,
  MockShopStaffRepository,
  MockAuditLogRepository,
  MockProductRepository
} from './mock/MockRepositories';

import {
  MockInvitationRepository,
  MockInventoryRepository,
  MockSaleRepository,
  MockSaleItemRepository,
  MockInvoiceRepository,
  MockPlatformAdminRepository,
  MockSubscriptionRepository,
  MockAuthRepository
} from './mock/MockRepositories2';
import { MockMailerService } from './mock/MockServices';
import {
  SupabaseAuthRepository,
  SupabaseUserRepository,
  SupabaseOrganizationRepository,
  SupabaseShopRepository,
  SupabaseOrganizationMemberRepository,
  SupabaseShopStaffRepository,
  SupabaseAuditLogRepository,
  SupabaseInvitationRepository,
  SupabaseProductRepository,
  SupabaseInventoryRepository,
  SupabaseSaleRepository,
  SupabaseSaleItemRepository,
  SupabaseInvoiceRepository,
  SupabasePlatformAdminRepository,
  SupabaseSubscriptionRepository
} from './supabase';

export interface RepositoryProvider {
  auth: AuthRepository;
  users: UserRepository;
  organizations: OrganizationRepository;
  shops: ShopRepository;
  organizationMembers: OrganizationMemberRepository;
  shopStaff: ShopStaffRepository;
  auditLogs: AuditLogRepository;
  invitations: InvitationRepository;
  products: ProductRepository;
  inventory: InventoryRepository;
  sales: SaleRepository;
  saleItems: SaleItemRepository;
  invoices: InvoiceRepository;
  platformAdmins: PlatformAdminRepository;
  subscriptions: SubscriptionRepository;
}

// In a real app, you might use import.meta.env.VITE_DATA_PROVIDER
const dataProvider = import.meta.env.VITE_DATA_PROVIDER || 'supabase';

let repositories: RepositoryProvider;

if (dataProvider === 'mock') {
  repositories = {
    auth: new MockAuthRepository(),
    users: new MockUserRepository(),
    organizations: new MockOrganizationRepository(),
    shops: new MockShopRepository(),
    organizationMembers: new MockOrganizationMemberRepository(),
    shopStaff: new MockShopStaffRepository(),
    auditLogs: new MockAuditLogRepository(),
    invitations: new MockInvitationRepository(),
    products: new MockProductRepository(),
    inventory: new MockInventoryRepository(),
    sales: new MockSaleRepository(),
    saleItems: new MockSaleItemRepository(),
    invoices: new MockInvoiceRepository(),
    platformAdmins: new MockPlatformAdminRepository(),
    subscriptions: new MockSubscriptionRepository(),
  };
} else if (dataProvider === 'supabase') {
  repositories = {
    auth: new SupabaseAuthRepository(),
    users: new SupabaseUserRepository(),
    organizations: new SupabaseOrganizationRepository(),
    shops: new SupabaseShopRepository(),
    organizationMembers: new SupabaseOrganizationMemberRepository(),
    shopStaff: new SupabaseShopStaffRepository(),
    auditLogs: new SupabaseAuditLogRepository(),
    invitations: new SupabaseInvitationRepository(),
    products: new SupabaseProductRepository(),
    inventory: new SupabaseInventoryRepository(),
    sales: new SupabaseSaleRepository(),
    saleItems: new SupabaseSaleItemRepository(),
    invoices: new SupabaseInvoiceRepository(),
    platformAdmins: new SupabasePlatformAdminRepository(),
    subscriptions: new SupabaseSubscriptionRepository(),
  };
} else {
  throw new Error(`Data provider ${dataProvider} not supported yet.`);
}

export const getRepositories = () => repositories;

let servicesInstance: any = null;

export const getServices = () => {
  if (!servicesInstance) {
    servicesInstance = {
      mailer: new MockMailerService()
    };
  }
  return servicesInstance;
};
