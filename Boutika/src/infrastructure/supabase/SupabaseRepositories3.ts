import {
  InventoryRepository,
  SaleRepository,
  SaleItemRepository,
  InvoiceRepository,
  PlatformAdminRepository,
  SubscriptionRepository
} from '../../core/repositories';
import {
  InventoryItem,
  Sale,
  SaleItem,
  Invoice,
  PlatformAdmin,
  Subscription
} from '../../core/types';
import { supabase } from './client';

export class SupabaseInventoryRepository implements InventoryRepository {
  async findByProduct(organizationId: string, shopId: string, productId: string): Promise<InventoryItem | null> {
    const { data, error } = await supabase.from('inventory').select('*')
      .eq('shop_id', shopId)
      .eq('product_id', productId)
      .single();
    if (error || !data) return null;
    return {
      id: data.id,
      organizationId, // passed down or queried if we stored it in table
      shopId: data.shop_id,
      productId: data.product_id,
      quantity: data.quantity,
      updatedAt: data.updated_at
    };
  }

  async findAllByShop(organizationId: string, shopId: string): Promise<InventoryItem[]> {
    const { data, error } = await supabase.from('inventory').select('*').eq('shop_id', shopId);
    if (error) throw new Error(error.message);
    return data.map(d => ({
      id: d.id,
      organizationId,
      shopId: d.shop_id,
      productId: d.product_id,
      quantity: d.quantity,
      updatedAt: d.updated_at
    }));
  }

  async upsert(item: Omit<InventoryItem, 'id' | 'updatedAt'>): Promise<InventoryItem> {
    const { data, error } = await supabase.from('inventory').upsert({
      shop_id: item.shopId,
      product_id: item.productId,
      quantity: item.quantity
    }, { onConflict: 'shop_id,product_id' }).select().single();
    if (error) throw new Error(error.message);
    return {
      id: data.id,
      organizationId: item.organizationId,
      shopId: data.shop_id,
      productId: data.product_id,
      quantity: data.quantity,
      updatedAt: data.updated_at
    };
  }
}

export class SupabaseSaleRepository implements SaleRepository {
  async findById(organizationId: string, shopId: string, id: string): Promise<Sale | null> {
    const { data, error } = await supabase.from('sales').select('*').eq('id', id).eq('shop_id', shopId).single();
    if (error || !data) return null;
    return {
      id: data.id,
      organizationId,
      shopId: data.shop_id,
      cashierId: data.cashier_id,
      totalAmount: data.total_amount,
      paymentMethod: data.payment_method,
      status: data.status,
      createdAt: data.created_at
    };
  }

  async findAllByShop(organizationId: string, shopId: string): Promise<Sale[]> {
    const { data, error } = await supabase.from('sales').select('*').eq('shop_id', shopId);
    if (error) throw new Error(error.message);
    return data.map(d => ({
      id: d.id,
      organizationId,
      shopId: d.shop_id,
      cashierId: d.cashier_id,
      totalAmount: d.total_amount,
      paymentMethod: d.payment_method,
      status: d.status,
      createdAt: d.created_at
    }));
  }

  async findRecent(organizationId: string, shopId: string, limit: number): Promise<Sale[]> {
    const { data, error } = await supabase.from('sales').select('*')
      .eq('shop_id', shopId)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw new Error(error.message);
    return data.map(d => ({
      id: d.id,
      organizationId,
      shopId: d.shop_id,
      cashierId: d.cashier_id,
      totalAmount: d.total_amount,
      paymentMethod: d.payment_method,
      status: d.status,
      createdAt: d.created_at
    }));
  }

  async create(sale: Omit<Sale, 'id' | 'createdAt'>): Promise<Sale> {
    const { data, error } = await supabase.from('sales').insert({
      shop_id: sale.shopId,
      cashier_id: sale.cashierId,
      total_amount: sale.totalAmount,
      payment_method: sale.paymentMethod,
      status: sale.status
    }).select().single();
    if (error) throw new Error(error.message);
    return {
      id: data.id,
      organizationId: sale.organizationId,
      shopId: data.shop_id,
      cashierId: data.cashier_id,
      totalAmount: data.total_amount,
      paymentMethod: data.payment_method,
      status: data.status,
      createdAt: data.created_at
    };
  }

  async update(organizationId: string, shopId: string, id: string, updates: Partial<Sale>): Promise<Sale> {
    const updateData: any = {};
    if (updates.status !== undefined) updateData.status = updates.status;

    const { data, error } = await supabase.from('sales').update(updateData).eq('id', id).eq('shop_id', shopId).select().single();
    if (error) throw new Error(error.message);
    return {
      id: data.id,
      organizationId,
      shopId: data.shop_id,
      cashierId: data.cashier_id,
      totalAmount: data.total_amount,
      paymentMethod: data.payment_method,
      status: data.status,
      createdAt: data.created_at
    };
  }
}

export class SupabaseSaleItemRepository implements SaleItemRepository {
  async findAllBySale(organizationId: string, shopId: string, saleId: string): Promise<SaleItem[]> {
    const { data, error } = await supabase.from('sale_items').select('*').eq('sale_id', saleId);
    if (error) throw new Error(error.message);
    return data.map(d => ({
      id: d.id,
      saleId: d.sale_id,
      productId: d.product_id,
      quantity: d.quantity,
      unitPrice: d.unit_price,
      subtotal: d.subtotal
    }));
  }

  async create(item: Omit<SaleItem, 'id'>): Promise<SaleItem> {
    const { data, error } = await supabase.from('sale_items').insert({
      sale_id: item.saleId,
      product_id: item.productId,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      subtotal: item.subtotal
    }).select().single();
    if (error) throw new Error(error.message);
    return {
      id: data.id,
      saleId: data.sale_id,
      productId: data.product_id,
      quantity: data.quantity,
      unitPrice: data.unit_price,
      subtotal: data.subtotal
    };
  }
}

export class SupabaseInvoiceRepository implements InvoiceRepository {
  async findById(organizationId: string, shopId: string, id: string): Promise<Invoice | null> {
    const { data, error } = await supabase.from('invoices').select('*').eq('id', id).eq('shop_id', shopId).single();
    if (error || !data) return null;
    return {
      id: data.id,
      organizationId,
      shopId: data.shop_id,
      saleId: data.sale_id,
      invoiceNumber: data.invoice_number,
      customerName: data.customer_name,
      customerPhone: data.customer_phone,
      issuedAt: data.issued_at
    };
  }

  async findBySale(organizationId: string, shopId: string, saleId: string): Promise<Invoice | null> {
    const { data, error } = await supabase.from('invoices').select('*').eq('sale_id', saleId).single();
    if (error || !data) return null;
    return {
      id: data.id,
      organizationId,
      shopId: data.shop_id,
      saleId: data.sale_id,
      invoiceNumber: data.invoice_number,
      customerName: data.customer_name,
      customerPhone: data.customer_phone,
      issuedAt: data.issued_at
    };
  }

  async create(invoice: Omit<Invoice, 'id' | 'issuedAt'>): Promise<Invoice> {
    const { data, error } = await supabase.from('invoices').insert({
      shop_id: invoice.shopId,
      sale_id: invoice.saleId,
      invoice_number: invoice.invoiceNumber,
      customer_name: invoice.customerName,
      customer_phone: invoice.customerPhone
    }).select().single();
    if (error) throw new Error(error.message);
    return {
      id: data.id,
      organizationId: invoice.organizationId,
      shopId: data.shop_id,
      saleId: data.sale_id,
      invoiceNumber: data.invoice_number,
      customerName: data.customer_name,
      customerPhone: data.customer_phone,
      issuedAt: data.issued_at
    };
  }
}

export class SupabasePlatformAdminRepository implements PlatformAdminRepository {
  async findByUserId(userId: string): Promise<PlatformAdmin | null> {
    const { data, error } = await supabase.from('platform_admins').select('*').eq('user_id', userId).single();
    if (error || !data) return null;
    return {
      userId: data.user_id,
      role: data.role
    };
  }
}

export class SupabaseSubscriptionRepository implements SubscriptionRepository {
  async findByOrganization(organizationId: string): Promise<Subscription | null> {
    const { data, error } = await supabase.from('subscriptions').select('*').eq('organization_id', organizationId).single();
    if (error || !data) return null;
    return {
      id: data.id,
      organizationId: data.organization_id,
      planTier: data.plan_tier,
      status: data.status,
      billingPeriod: data.billing_period,
      startDate: data.start_date,
      endDate: data.end_date,
      createdAt: data.created_at
    };
  }

  async findAll(): Promise<Subscription[]> {
    const { data, error } = await supabase.from('subscriptions').select('*');
    if (error) throw new Error(error.message);
    return data.map(d => ({
      id: d.id,
      organizationId: d.organization_id,
      planTier: d.plan_tier,
      status: d.status,
      billingPeriod: d.billing_period,
      startDate: d.start_date,
      endDate: d.end_date,
      createdAt: d.created_at
    }));
  }

  async create(subscription: Omit<Subscription, 'id' | 'createdAt'>): Promise<Subscription> {
    const { data, error } = await supabase.from('subscriptions').insert({
      organization_id: subscription.organizationId,
      plan_tier: subscription.planTier,
      status: subscription.status,
      billing_period: subscription.billingPeriod,
      start_date: subscription.startDate,
      end_date: subscription.endDate
    }).select().single();
    if (error) throw new Error(error.message);
    return {
      id: data.id,
      organizationId: data.organization_id,
      planTier: data.plan_tier,
      status: data.status,
      billingPeriod: data.billing_period,
      startDate: data.start_date,
      endDate: data.end_date,
      createdAt: data.created_at
    };
  }

  async update(organizationId: string, id: string, updates: Partial<Subscription>): Promise<Subscription> {
    const updateData: any = {};
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.planTier !== undefined) updateData.plan_tier = updates.planTier;
    if (updates.billingPeriod !== undefined) updateData.billing_period = updates.billingPeriod;
    if (updates.startDate !== undefined) updateData.start_date = updates.startDate;
    if (updates.endDate !== undefined) updateData.end_date = updates.endDate;

    const { data, error } = await supabase.from('subscriptions').update(updateData).eq('id', id).eq('organization_id', organizationId).select().single();
    if (error) throw new Error(error.message);
    return {
      id: data.id,
      organizationId: data.organization_id,
      planTier: data.plan_tier,
      status: data.status,
      billingPeriod: data.billing_period,
      startDate: data.start_date,
      endDate: data.end_date,
      createdAt: data.created_at
    };
  }
}
