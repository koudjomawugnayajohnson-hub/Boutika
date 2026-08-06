import {
  InvitationRepository,
  InventoryRepository,
  SaleRepository,
  SaleItemRepository,
  InvoiceRepository,
  PlatformAdminRepository,
  SubscriptionRepository,
  AuthRepository
} from '../../core/repositories';
import {
  Invitation, InventoryItem, Sale, SaleItem, Invoice,
  PlatformAdmin, Subscription
} from '../../core/types';
import { mockDb, generateId, generateDate } from './MockDatabase';

export class MockInvitationRepository implements InvitationRepository {
  async findById(organizationId: string, id: string): Promise<Invitation | null> {
    return mockDb.invitations.find(i => i.id === id && i.organizationId === organizationId) || null;
  }
  async findAllByOrganization(organizationId: string): Promise<Invitation[]> {
    return mockDb.invitations.filter(i => i.organizationId === organizationId);
  }
  async create(invitation: Omit<Invitation, 'id' | 'createdAt'>): Promise<Invitation> {
    const newInv: Invitation = { ...invitation, id: generateId(), createdAt: generateDate() };
    mockDb.invitations.push(newInv);
    return newInv;
  }
  async updateStatus(organizationId: string, id: string, status: Invitation['status']): Promise<Invitation> {
    const idx = mockDb.invitations.findIndex(i => i.id === id && i.organizationId === organizationId);
    if (idx === -1) throw new Error('Invitation not found in this organization');
    mockDb.invitations[idx].status = status;
    return mockDb.invitations[idx];
  }
}

export class MockInventoryRepository implements InventoryRepository {
  private verifyShopAccess(organizationId: string, shopId: string) {
    const shop = mockDb.shops.find(s => s.id === shopId && s.organizationId === organizationId);
    if (!shop) throw new Error('Shop not found in this organization');
  }

  async findByProduct(organizationId: string, shopId: string, productId: string): Promise<InventoryItem | null> {
    this.verifyShopAccess(organizationId, shopId);
    return mockDb.inventory.find(i => i.shopId === shopId && i.productId === productId) || null;
  }
  async findAllByShop(organizationId: string, shopId: string): Promise<InventoryItem[]> {
    this.verifyShopAccess(organizationId, shopId);
    return mockDb.inventory.filter(i => i.shopId === shopId);
  }
  async upsert(item: Omit<InventoryItem, 'id' | 'updatedAt'>): Promise<InventoryItem> {
    const idx = mockDb.inventory.findIndex(i => i.shopId === item.shopId && i.productId === item.productId);
    const updatedAt = generateDate();
    if (idx !== -1) {
      mockDb.inventory[idx] = { ...mockDb.inventory[idx], ...item, updatedAt };
      return mockDb.inventory[idx];
    } else {
      const newItem: InventoryItem = { ...item, id: generateId(), updatedAt };
      mockDb.inventory.push(newItem);
      return newItem;
    }
  }
}

export class MockSaleRepository implements SaleRepository {
  async findById(organizationId: string, shopId: string, id: string): Promise<Sale | null> {
    return mockDb.sales.find(s => s.id === id && s.shopId === shopId && s.organizationId === organizationId) || null;
  }
  async findAllByShop(organizationId: string, shopId: string): Promise<Sale[]> {
    return mockDb.sales.filter(s => s.shopId === shopId && s.organizationId === organizationId);
  }
  async findRecent(organizationId: string, shopId: string, limit: number): Promise<Sale[]> {
    return mockDb.sales
      .filter(s => s.shopId === shopId && s.organizationId === organizationId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }
  async create(sale: Omit<Sale, 'id' | 'createdAt'>): Promise<Sale> {
    const newSale: Sale = { ...sale, id: generateId(), createdAt: generateDate() };
    
    // Check if it's the first sale for this organization
    const orgSales = mockDb.sales.filter(s => s.organizationId === sale.organizationId);
    if (orgSales.length === 0) {
      mockDb.auditLogs.push({
        id: generateId(),
        organizationId: sale.organizationId,
        userId: sale.createdBy,
        action: 'first_sale_created',
        entityType: 'sale',
        entityId: newSale.id,
        createdAt: generateDate(),
      });
    }
    
    mockDb.sales.push(newSale);
    return newSale;
  }
  async update(organizationId: string, shopId: string, id: string, updates: Partial<Sale>): Promise<Sale> {
    const idx = mockDb.sales.findIndex(s => s.id === id && s.shopId === shopId && s.organizationId === organizationId);
    if (idx === -1) throw new Error('Sale not found');
    mockDb.sales[idx] = { ...mockDb.sales[idx], ...updates };
    return mockDb.sales[idx];
  }
}

export class MockSaleItemRepository implements SaleItemRepository {
  async findAllBySale(organizationId: string, shopId: string, saleId: string): Promise<SaleItem[]> {
    // Verify sale belongs to this org/shop
    const sale = mockDb.sales.find(s => s.id === saleId && s.shopId === shopId && s.organizationId === organizationId);
    if (!sale) throw new Error('Sale not found');
    return mockDb.saleItems.filter(si => si.saleId === saleId);
  }
  async create(item: Omit<SaleItem, 'id'>): Promise<SaleItem> {
    const newItem: SaleItem = { ...item, id: generateId() };
    mockDb.saleItems.push(newItem);
    return newItem;
  }
}

export class MockInvoiceRepository implements InvoiceRepository {
  async findById(organizationId: string, shopId: string, id: string): Promise<Invoice | null> {
    return mockDb.invoices.find(i => i.id === id && i.shopId === shopId && i.organizationId === organizationId) || null;
  }
  async findBySale(organizationId: string, shopId: string, saleId: string): Promise<Invoice | null> {
    return mockDb.invoices.find(i => i.saleId === saleId && i.shopId === shopId && i.organizationId === organizationId) || null;
  }
  async create(invoice: Omit<Invoice, 'id' | 'issuedAt'>): Promise<Invoice> {
    const newInvoice: Invoice = { ...invoice, id: generateId(), issuedAt: generateDate() };
    mockDb.invoices.push(newInvoice);
    return newInvoice;
  }
}

export class MockPlatformAdminRepository implements PlatformAdminRepository {
  async findByUserId(userId: string): Promise<PlatformAdmin | null> {
    return mockDb.platformAdmins.find(pa => pa.userId === userId) || null;
  }
}

export class MockSubscriptionRepository implements SubscriptionRepository {
  async findByOrganization(organizationId: string): Promise<Subscription | null> {
    return mockDb.subscriptions.find(s => s.organizationId === organizationId) || null;
  }
  async findAll(): Promise<Subscription[]> {
    return mockDb.subscriptions;
  }
  async create(subscription: Omit<Subscription, 'id' | 'createdAt'>): Promise<Subscription> {
    const newSub: Subscription = { ...subscription, id: generateId(), createdAt: generateDate() };
    mockDb.subscriptions.push(newSub);
    return newSub;
  }
  async update(organizationId: string, id: string, updates: Partial<Subscription>): Promise<Subscription> {
    const idx = mockDb.subscriptions.findIndex(s => s.id === id && s.organizationId === organizationId);
    if (idx === -1) throw new Error('Subscription not found');
    mockDb.subscriptions[idx] = { ...mockDb.subscriptions[idx], ...updates };
    return mockDb.subscriptions[idx];
  }
}

export class MockAuthRepository implements AuthRepository {
  async registerWithEmail(name: string, email: string): Promise<{ id: string, email: string } | null> {
    console.log(`[MOCK AUTH] Registered with email ${email}`);
    let user = mockDb.users.find(u => u.email === email);
    if (!user) {
      user = { id: Math.random().toString(36).substr(2, 9), email, name, createdAt: new Date().toISOString() };
      mockDb.users.push(user);
    }
    return { id: user.id, email: user.email! };
  }

  async requestEmailOtp(email: string): Promise<boolean> {
    return true;
  }

  async verifyEmailOtp(email: string, otp: string): Promise<{ id: string } | null> {
    let user = mockDb.users.find(u => u.email === email);
    return user ? { id: user.id } : null;
  }

  async requestPhoneOtp(phone: string): Promise<boolean> {
    console.log(`[MOCK AUTH] Phone OTP requested for ${phone}`);
    return true;
  }
  
  async verifyPhoneOtp(phone: string, otp: string): Promise<{ id: string } | null> {
    if (otp !== '123456') return null;
    let user = mockDb.users.find(u => u.phone === phone);
    if (!user) {
      user = { id: Math.random().toString(36).substr(2, 9), phone, createdAt: new Date().toISOString() };
      mockDb.users.push(user);
    }
    return { id: user.id }; 
  }

  async requestAdminOtp(email: string): Promise<boolean> {
    if (email !== 'koudjomawugnayajohnson@gmail.com') return false;
    console.log(`[MOCK AUTH] Admin OTP requested for ${email}`);
    return true;
  }

  async verifyAdminOtp(email: string, otp: string): Promise<{ id: string } | null> {
    if (email !== 'koudjomawugnayajohnson@gmail.com' || otp !== '123456') return null;
    const admin = mockDb.platformAdmins[0]; 
    return admin ? { id: admin.userId } : null;
  }

  async logout(): Promise<void> {
    console.log(`[MOCK AUTH] Logged out`);
  }

  async getCurrentUser(): Promise<{ id: string } | null> {
    return null;
  }
}
