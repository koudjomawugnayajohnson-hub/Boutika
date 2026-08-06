export type Role = 'owner' | 'admin' | 'member';
export type PlanTier = 'starter' | 'pro' | 'enterprise';

export interface User {
  id: string;
  phone: string;
  createdAt: string; // ISO date string
}

export interface Organization {
  id: string;
  name: string;
  planTier: PlanTier;
  ownerId: string;
  settings: Record<string, any>;
  createdAt: string;
}

export interface Shop {
  id: string;
  organizationId: string;
  name: string;
  address?: string;
  phone?: string;
  logoUrl?: string;
  createdAt: string;
}

export interface OrganizationMember {
  id: string;
  organizationId: string;
  userId: string;
  role: Role;
  invitedAt: string;
  joinedAt?: string;
}

export interface ShopStaff {
  id: string;
  shopId: string;
  userId: string;
}

export interface AuditLog {
  id: string;
  organizationId: string;
  userId?: string;
  action: string;
  entityType?: string;
  entityId?: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export type InvitationStatus = 'pending' | 'accepted' | 'expired';

export interface Invitation {
  id: string;
  organizationId: string;
  phoneOrEmail: string;
  role: 'admin' | 'member';
  shopIds: string[];
  invitedBy: string;
  status: InvitationStatus;
  createdAt: string;
}

export type ProductStatus = 'active' | 'archived';

export interface Product {
  id: string;
  organizationId: string;
  name: string;
  category?: string;
  price: number;
  imageUrl?: string;
  customFields: Record<string, any>;
  status: ProductStatus;
  createdAt: string;
}

export interface InventoryItem {
  id: string;
  shopId: string;
  productId: string;
  quantity: number;
  lowStockThreshold: number;
  updatedAt: string;
}

export type SaleStatus = 'in_progress' | 'closed' | 'cancelled';
export type PaymentMethod = 'cash' | 'card' | 'mobile_money';

export interface Sale {
  id: string;
  shopId: string;
  organizationId: string;
  status: SaleStatus;
  total?: number;
  paymentMethod?: PaymentMethod;
  createdBy?: string;
  customerName?: string;
  createdAt: string;
}

export interface SaleItem {
  id: string;
  saleId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
}

export type InvoiceStatus = 'issued' | 'cancelled';

export interface Invoice {
  id: string;
  organizationId: string;
  shopId: string;
  saleId: string;
  pdfUrl?: string;
  status: InvoiceStatus;
  issuedAt: string;
}

export interface PlatformAdmin {
  id: string;
  userId: string;
  createdAt: string;
}

export type BillingPeriod = 'monthly' | 'annual';
export type SubscriptionStatus = 'trialing' | 'pending_activation' | 'active' | 'past_due' | 'canceled';
export type SubPaymentMethod = 'mobile_money' | 'cash';

export interface Subscription {
  id: string;
  organizationId: string;
  planTier: PlanTier;
  billingPeriod: BillingPeriod;
  status: SubscriptionStatus;
  paymentMethod?: SubPaymentMethod;
  mobileMoneyRef?: string;
  paymentReference?: string;
  activatedBy?: string;
  activatedAt?: string;
  rejectionNote?: string;
  renewalDate?: string;
  createdAt: string;
}
