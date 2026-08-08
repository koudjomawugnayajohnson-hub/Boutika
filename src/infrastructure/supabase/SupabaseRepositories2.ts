import {
  OrganizationMemberRepository,
  ShopStaffRepository,
  AuditLogRepository,
  InvitationRepository,
  ProductRepository,
  QueryOptions
} from '../../core/repositories';
import {
  OrganizationMember,
  ShopStaff,
  AuditLog,
  Invitation,
  Product
} from '../../core/types';
import { supabase } from './client';

export class SupabaseOrganizationMemberRepository implements OrganizationMemberRepository {
  async findByUserId(userId: string): Promise<OrganizationMember[]> {
    const { data, error } = await supabase.from('organization_members').select('*').eq('user_id', userId);
    if (error) throw new Error(error.message);
    return data.map(d => ({
      id: d.id,
      organizationId: d.organization_id,
      userId: d.user_id,
      role: d.role,
      invitedAt: d.invited_at
    }));
  }

  async findByOrganization(organizationId: string): Promise<OrganizationMember[]> {
    const { data, error } = await supabase.from('organization_members').select('*').eq('organization_id', organizationId);
    if (error) throw new Error(error.message);
    return data.map(d => ({
      id: d.id,
      organizationId: d.organization_id,
      userId: d.user_id,
      role: d.role,
      invitedAt: d.invited_at
    }));
  }

  async create(member: Omit<OrganizationMember, 'id' | 'invitedAt'>): Promise<OrganizationMember> {
    const { data, error } = await supabase.from('organization_members').insert({
      organization_id: member.organizationId,
      user_id: member.userId,
      role: member.role
    }).select().single();
    if (error) throw new Error(error.message);
    return {
      id: data.id,
      organizationId: data.organization_id,
      userId: data.user_id,
      role: data.role,
      invitedAt: data.invited_at
    };
  }
}

export class SupabaseShopStaffRepository implements ShopStaffRepository {
  async findByUserId(userId: string): Promise<ShopStaff[]> {
    const { data, error } = await supabase.from('shop_staff').select('*').eq('user_id', userId);
    if (error) throw new Error(error.message);
    return data.map(d => ({
      id: d.id,
      shopId: d.shop_id,
      userId: d.user_id
    }));
  }

  async findByShop(organizationId: string, shopId: string): Promise<ShopStaff[]> {
    // Note: organizationId is not strictly needed for querying if shop_id is globally unique, but we pass it anyway.
    const { data, error } = await supabase.from('shop_staff').select('*').eq('shop_id', shopId);
    if (error) throw new Error(error.message);
    return data.map(d => ({
      id: d.id,
      shopId: d.shop_id,
      userId: d.user_id
    }));
  }

  async create(staff: Omit<ShopStaff, 'id'>): Promise<ShopStaff> {
    const { data, error } = await supabase.from('shop_staff').insert({
      shop_id: staff.shopId,
      user_id: staff.userId
    }).select().single();
    if (error) throw new Error(error.message);
    return {
      id: data.id,
      shopId: data.shop_id,
      userId: data.user_id
    };
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('shop_staff').delete().eq('id', id);
    if (error) throw new Error(error.message);
  }
}

export class SupabaseAuditLogRepository implements AuditLogRepository {
  async findAllByOrganization(organizationId: string, options?: QueryOptions): Promise<AuditLog[]> {
    let query = supabase.from('audit_logs').select('*').eq('organization_id', organizationId).order('created_at', { ascending: false });
    if (options?.limit) query = query.limit(options.limit);
    if (options?.offset) query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data.map(d => ({
      id: d.id,
      organizationId: d.organization_id,
      action: d.action,
      entityType: d.entity_type,
      entityId: d.entity_id,
      userId: d.user_id,
      details: d.details,
      createdAt: d.created_at
    }));
  }

  async findAll(): Promise<AuditLog[]> {
    const { data, error } = await supabase.from('audit_logs').select('*').order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data.map(d => ({
      id: d.id,
      organizationId: d.organization_id,
      action: d.action,
      entityType: d.entity_type,
      entityId: d.entity_id,
      userId: d.user_id,
      details: d.details,
      createdAt: d.created_at
    }));
  }

  async create(log: Omit<AuditLog, 'id' | 'createdAt'>): Promise<AuditLog> {
    const { data, error } = await supabase.from('audit_logs').insert({
      organization_id: log.organizationId,
      action: log.action,
      entity_type: log.entityType,
      entity_id: log.entityId,
      user_id: log.userId,
      details: log.details
    }).select().single();
    if (error) throw new Error(error.message);
    return {
      id: data.id,
      organizationId: data.organization_id,
      action: data.action,
      entityType: data.entity_type,
      entityId: data.entity_id,
      userId: data.user_id,
      details: data.details,
      createdAt: data.created_at
    };
  }
}

export class SupabaseInvitationRepository implements InvitationRepository {
  async findById(organizationId: string, id: string): Promise<Invitation | null> {
    const { data, error } = await supabase.from('invitations').select('*').eq('id', id).eq('organization_id', organizationId).single();
    if (error || !data) return null;
    return {
      id: data.id,
      organizationId: data.organization_id,
      inviterId: data.inviter_id,
      name: data.name,
      phone: data.phone,
      role: data.role,
      status: data.status,
      createdAt: data.created_at
    };
  }

  async findAllByOrganization(organizationId: string): Promise<Invitation[]> {
    const { data, error } = await supabase.from('invitations').select('*').eq('organization_id', organizationId);
    if (error) throw new Error(error.message);
    return data.map(d => ({
      id: d.id,
      organizationId: d.organization_id,
      inviterId: d.inviter_id,
      name: d.name,
      phone: d.phone,
      role: d.role,
      status: d.status,
      createdAt: d.created_at
    }));
  }

  async create(invitation: Omit<Invitation, 'id' | 'createdAt'>): Promise<Invitation> {
    const { data, error } = await supabase.from('invitations').insert({
      organization_id: invitation.organizationId,
      inviter_id: invitation.inviterId,
      name: invitation.name,
      phone: invitation.phone,
      role: invitation.role,
      status: invitation.status
    }).select().single();
    if (error) throw new Error(error.message);
    return {
      id: data.id,
      organizationId: data.organization_id,
      inviterId: data.inviter_id,
      name: data.name,
      phone: data.phone,
      role: data.role,
      status: data.status,
      createdAt: data.created_at
    };
  }

  async updateStatus(organizationId: string, id: string, status: Invitation['status']): Promise<Invitation> {
    const { data, error } = await supabase.from('invitations').update({ status }).eq('id', id).eq('organization_id', organizationId).select().single();
    if (error) throw new Error(error.message);
    return {
      id: data.id,
      organizationId: data.organization_id,
      inviterId: data.inviter_id,
      name: data.name,
      phone: data.phone,
      role: data.role,
      status: data.status,
      createdAt: data.created_at
    };
  }
}

export class SupabaseProductRepository implements ProductRepository {
  async findById(organizationId: string, id: string): Promise<Product | null> {
    const { data, error } = await supabase.from('products').select('*').eq('id', id).eq('organization_id', organizationId).single();
    if (error || !data) return null;
    return {
      id: data.id,
      organizationId: data.organization_id,
      name: data.name,
      description: data.description,
      barcode: data.barcode,
      category: data.category,
      price: data.price,
      cost: data.cost,
      lowStockThreshold: data.low_stock_threshold,
      status: data.status || 'active',
      createdAt: data.created_at
    };
  }

  async findAllByOrganization(organizationId: string): Promise<Product[]> {
    const { data, error } = await supabase.from('products').select('*').eq('organization_id', organizationId);
    if (error) throw new Error(error.message);
    return data.map(d => ({
      id: d.id,
      organizationId: d.organization_id,
      name: d.name,
      description: d.description,
      barcode: d.barcode,
      category: d.category,
      price: d.price,
      cost: d.cost,
      lowStockThreshold: d.low_stock_threshold,
      status: d.status || 'active',
      createdAt: d.created_at
    }));
  }

  async create(product: Omit<Product, 'id' | 'createdAt'>): Promise<Product> {
    const { data, error } = await supabase.from('products').insert({
      organization_id: product.organizationId,
      name: product.name,
      description: product.description,
      barcode: product.barcode,
      category: product.category,
      price: product.price,
      cost: product.cost,
      low_stock_threshold: product.lowStockThreshold
    }).select().single();
    if (error) throw new Error(error.message);
    return {
      id: data.id,
      organizationId: data.organization_id,
      name: data.name,
      description: data.description,
      barcode: data.barcode,
      category: data.category,
      price: data.price,
      cost: data.cost,
      lowStockThreshold: data.low_stock_threshold,
      status: data.status || 'active',
      createdAt: data.created_at
    };
  }

  async update(organizationId: string, id: string, updates: Partial<Product>): Promise<Product> {
    const updateData: any = {};
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.barcode !== undefined) updateData.barcode = updates.barcode;
    if (updates.category !== undefined) updateData.category = updates.category;
    if (updates.price !== undefined) updateData.price = updates.price;
    if (updates.cost !== undefined) updateData.cost = updates.cost;
    if (updates.lowStockThreshold !== undefined) updateData.low_stock_threshold = updates.lowStockThreshold;

    const { data, error } = await supabase.from('products').update(updateData).eq('id', id).eq('organization_id', organizationId).select().single();
    if (error) throw new Error(error.message);
    return {
      id: data.id,
      organizationId: data.organization_id,
      name: data.name,
      description: data.description,
      barcode: data.barcode,
      category: data.category,
      price: data.price,
      cost: data.cost,
      lowStockThreshold: data.low_stock_threshold,
      status: data.status || 'active',
      createdAt: data.created_at
    };
  }
}
