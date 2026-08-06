import {
  UserRepository,
  OrganizationRepository,
  ShopRepository,
  AuthRepository
} from '../../core/repositories';
import {
  User,
  Organization,
  Shop
} from '../../core/types';
import { supabase } from './client';

export class SupabaseAuthRepository implements AuthRepository {
  async registerWithEmail(name: string, email: string): Promise<{ id: string, email: string } | null> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password: email,
      options: {
        data: { name }
      }
    });
    
    if (error || !data.user) {
      console.error('Supabase registerWithEmail Error:', error?.message);
      return null;
    }
    
    return { id: data.user.id, email: data.user.email! };
  }

  async requestEmailOtp(email: string): Promise<boolean> {
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) {
      console.error('Supabase requestEmailOtp Error:', error.message);
      return false;
    }
    return true;
  }

  async verifyEmailOtp(email: string, otp: string): Promise<{ id: string } | null> {
    const { data, error } = await supabase.auth.verifyOtp({ email, token: otp, type: 'email' });
    if (error || !data.user) {
      console.error('Supabase verifyEmailOtp Error:', error?.message);
      return null;
    }
    return { id: data.user.id };
  }

  async requestAdminOtp(email: string): Promise<boolean> {
    if (email !== 'koudjomawugnayajohnson@gmail.com') return false;
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) {
      console.error('Supabase requestAdminOtp Error:', error.message);
      return false;
    }
    return true;
  }

  async verifyAdminOtp(email: string, otp: string): Promise<{ id: string } | null> {
    if (email !== 'koudjomawugnayajohnson@gmail.com') return null;
    const { data, error } = await supabase.auth.verifyOtp({ email, token: otp, type: 'email' });
    if (error || !data.user) {
      console.error('Supabase verifyAdminOtp Error:', error?.message);
      return null;
    }
    return { id: data.user.id };
  }

  async logout(): Promise<void> {
    await supabase.auth.signOut();
  }

  async getCurrentUser(): Promise<{ id: string, email?: string } | null> {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.user ? { id: session.user.id, email: session.user.email } : null;
  }

  onAuthStateChange(callback: (userId: string | null) => void): () => void {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      callback(session?.user?.id || null);
    });
    return () => subscription.unsubscribe();
  }
}

export class SupabaseUserRepository implements UserRepository {
  async findById(id: string): Promise<User | null> {
    const { data, error } = await supabase.from('users').select('*').eq('id', id).single();
    if (error || !data) return null;
    return {
      id: data.id,
      phone: data.phone,
      email: data.email,
      name: data.name,
      createdAt: data.created_at
    };
  }

  async findByPhone(phone: string): Promise<User | null> {
    const { data, error } = await supabase.from('users').select('*').eq('phone', phone).single();
    if (error || !data) return null;
    return {
      id: data.id,
      phone: data.phone,
      email: data.email,
      name: data.name,
      createdAt: data.created_at
    };
  }

  async create(user: Omit<User, 'id' | 'createdAt'> & { id?: string }): Promise<User> {
    const insertData: any = { phone: user.phone, name: user.name, email: user.email };
    if (user.id) insertData.id = user.id;

    const { data, error } = await supabase.from('users').insert(insertData).select().single();
    if (error) throw new Error(error.message);
    return {
      id: data.id,
      phone: data.phone,
      email: data.email,
      name: data.name,
      createdAt: data.created_at
    };
  }
}

export class SupabaseOrganizationRepository implements OrganizationRepository {
  async findById(id: string): Promise<Organization | null> {
    const { data, error } = await supabase.from('organizations').select('*').eq('id', id).single();
    if (error || !data) return null;
    return {
      id: data.id,
      name: data.name,
      ownerId: data.owner_id,
      planTier: data.plan_tier,
      settings: data.settings,
      createdAt: data.created_at
    };
  }

  async findAll(): Promise<Organization[]> {
    const { data, error } = await supabase.from('organizations').select('*');
    if (error) throw new Error(error.message);
    return data.map(d => ({
      id: d.id,
      name: d.name,
      ownerId: d.owner_id,
      planTier: d.plan_tier,
      settings: d.settings,
      createdAt: d.created_at
    }));
  }

  async create(org: Omit<Organization, 'id' | 'createdAt'>): Promise<Organization> {
    const { data, error } = await supabase.from('organizations').insert({
      name: org.name,
      owner_id: org.ownerId,
      plan_tier: org.planTier,
      settings: org.settings
    }).select().single();
    if (error) throw new Error(error.message);
    return {
      id: data.id,
      name: data.name,
      ownerId: data.owner_id,
      planTier: data.plan_tier,
      settings: data.settings,
      createdAt: data.created_at
    };
  }

  async createViaRpc(name: string): Promise<Organization> {
    const { data, error } = await supabase.rpc('create_organization', { org_name: name });
    if (error) throw new Error(error.message);
    
    // We assume the RPC returns the created organization object or its ID
    // If it returns just the ID, we might need to fetch it.
    // For now we assume it returns the object matching the type.
    if (!data) throw new Error('No data returned from RPC');
    
    return {
      id: data.id,
      name: data.name,
      ownerId: data.owner_id,
      planTier: data.plan_tier,
      settings: data.settings,
      createdAt: data.created_at
    };
  }

  async update(id: string, updates: Partial<Organization>): Promise<Organization> {
    const updateData: any = {};
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.planTier !== undefined) updateData.plan_tier = updates.planTier;
    if (updates.settings !== undefined) updateData.settings = updates.settings;

    const { data, error } = await supabase.from('organizations').update(updateData).eq('id', id).select().single();
    if (error) throw new Error(error.message);
    return {
      id: data.id,
      name: data.name,
      ownerId: data.owner_id,
      planTier: data.plan_tier,
      settings: data.settings,
      createdAt: data.created_at
    };
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('organizations').delete().eq('id', id);
    if (error) throw new Error(error.message);
  }
}

export class SupabaseShopRepository implements ShopRepository {
  async findById(organizationId: string, id: string): Promise<Shop | null> {
    const { data, error } = await supabase.from('shops').select('*').eq('id', id).eq('organization_id', organizationId).single();
    if (error || !data) return null;
    return {
      id: data.id,
      organizationId: data.organization_id,
      name: data.name,
      address: data.address,
      createdAt: data.created_at
    };
  }

  async findAllByOrganization(organizationId: string): Promise<Shop[]> {
    const { data, error } = await supabase.from('shops').select('*').eq('organization_id', organizationId);
    if (error) throw new Error(error.message);
    return data.map(d => ({
      id: d.id,
      organizationId: d.organization_id,
      name: d.name,
      address: d.address,
      createdAt: d.created_at
    }));
  }

  async create(shop: Omit<Shop, 'id' | 'createdAt'>): Promise<Shop> {
    const { data, error } = await supabase.from('shops').insert({
      organization_id: shop.organizationId,
      name: shop.name,
      address: shop.address
    }).select().single();
    if (error) throw new Error(error.message);
    return {
      id: data.id,
      organizationId: data.organization_id,
      name: data.name,
      address: data.address,
      createdAt: data.created_at
    };
  }
}

// ... I will add other repositories in chunks
