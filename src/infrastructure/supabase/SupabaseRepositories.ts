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
  async signUpWithPhone(phone: string, pin: string): Promise<{ id: string } | null> {
    const { data, error } = await supabase.auth.signUp({
      phone,
      password: pin,
    });
    
    if (error || !data.user) {
      console.error('Supabase signUpWithPhone Error:', error?.message);
      // Throw error to be caught and displayed in the UI
      throw new Error(error?.message || "Erreur lors de l'inscription");
    }
    
    return { id: data.user.id };
  }

  async signInWithPhone(phone: string, pin: string): Promise<{ id: string } | null> {
    const { data, error } = await supabase.auth.signInWithPassword({
      phone,
      password: pin,
    });
    
    if (error || !data.user) {
      console.error('Supabase signInWithPhone Error:', error?.message);
      throw new Error(error?.message || 'Numéro de téléphone ou PIN incorrect');
    }
    
    return { id: data.user.id };
  }

  async signInAdminWithEmail(email: string, pin: string): Promise<{ id: string } | null> {
    if (email !== 'koudjomawugnayajohnson@gmail.com') return null;
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: pin,
    });
    
    if (error || !data.user) {
      console.error('Supabase signInAdminWithEmail Error:', error?.message);
      throw new Error(error?.message || 'Email ou PIN incorrect');
    }
    
    return { id: data.user.id };
  }

  async logout(): Promise<void> {
    await supabase.auth.signOut();
  }

  async getCurrentUser(): Promise<{ id: string, email?: string, phone?: string } | null> {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.user ? { id: session.user.id, email: session.user.email, phone: session.user.phone } : null;
  }

  onAuthStateChange(callback: (event: string, userId: string | null) => void): () => void {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      callback(event, session?.user?.id || null);
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
