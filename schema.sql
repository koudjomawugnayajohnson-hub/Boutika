-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- USERS (Custom profiles for auth.users)
create table if not exists public.users (
  id uuid references auth.users not null primary key,
  phone text,
  email text,
  name text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ORGANIZATIONS
create table if not exists public.organizations (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  plan_tier text not null default 'starter',
  owner_id uuid references public.users(id) not null,
  settings jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- SHOPS
create table if not exists public.shops (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid references public.organizations(id) not null,
  name text not null,
  address text,
  phone text,
  logo_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ORGANIZATION_MEMBERS
create table if not exists public.organization_members (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid references public.organizations(id) not null,
  user_id uuid references public.users(id) not null,
  role text not null default 'member',
  invited_at timestamp with time zone default timezone('utc'::text, now()) not null,
  joined_at timestamp with time zone,
  status text default 'pending'
);

-- SHOP_STAFF
create table if not exists public.shop_staff (
  id uuid default uuid_generate_v4() primary key,
  shop_id uuid references public.shops(id) not null,
  user_id uuid references public.users(id) not null
);

-- AUDIT_LOGS
create table if not exists public.audit_logs (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid references public.organizations(id) not null,
  user_id uuid references public.users(id),
  action text not null,
  entity_type text,
  entity_id text,
  metadata jsonb,
  details jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- INVITATIONS
create table if not exists public.invitations (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid references public.organizations(id) not null,
  phone_or_email text,
  name text,
  phone text,
  role text not null,
  shop_ids text[],
  invited_by uuid references public.users(id),
  inviter_id uuid references public.users(id),
  status text not null default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- PRODUCTS
create table if not exists public.products (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid references public.organizations(id) not null,
  name text not null,
  description text,
  barcode text,
  category text,
  price numeric not null,
  cost numeric,
  low_stock_threshold integer,
  image_url text,
  custom_fields jsonb,
  status text not null default 'active',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- INVENTORY_ITEMS
create table if not exists public.inventory_items (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid references public.organizations(id),
  shop_id uuid references public.shops(id) not null,
  product_id uuid references public.products(id) not null,
  quantity integer not null default 0,
  low_stock_threshold integer,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- SALES
create table if not exists public.sales (
  id uuid default uuid_generate_v4() primary key,
  shop_id uuid references public.shops(id) not null,
  organization_id uuid references public.organizations(id) not null,
  status text not null default 'in_progress',
  total numeric default 0,
  total_amount numeric default 0,
  payment_method text,
  created_by uuid references public.users(id),
  cashier_id uuid references public.users(id),
  customer_name text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- SALE_ITEMS
create table if not exists public.sale_items (
  id uuid default uuid_generate_v4() primary key,
  sale_id uuid references public.sales(id) not null,
  product_id uuid references public.products(id) not null,
  quantity integer not null,
  unit_price numeric not null,
  subtotal numeric
);

-- INVOICES
create table if not exists public.invoices (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid references public.organizations(id) not null,
  shop_id uuid references public.shops(id) not null,
  sale_id uuid references public.sales(id) not null,
  invoice_number text,
  customer_name text,
  customer_phone text,
  pdf_url text,
  status text default 'issued',
  issued_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- PLATFORM_ADMINS
create table if not exists public.platform_admins (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) not null,
  role text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- SUBSCRIPTIONS
create table if not exists public.subscriptions (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid references public.organizations(id) not null,
  plan_tier text not null,
  billing_period text not null,
  status text not null,
  payment_method text,
  mobile_money_ref text,
  payment_reference text,
  activated_by uuid references public.users(id),
  activated_at timestamp with time zone,
  rejection_note text,
  renewal_date timestamp with time zone,
  start_date timestamp with time zone,
  end_date timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up Row Level Security (RLS)
-- First, enable RLS on all tables
alter table public.users enable row level security;
alter table public.organizations enable row level security;
alter table public.shops enable row level security;
alter table public.organization_members enable row level security;
alter table public.shop_staff enable row level security;
alter table public.audit_logs enable row level security;
alter table public.invitations enable row level security;
alter table public.products enable row level security;
alter table public.inventory_items enable row level security;
alter table public.sales enable row level security;
alter table public.sale_items enable row level security;
alter table public.invoices enable row level security;
alter table public.platform_admins enable row level security;
alter table public.subscriptions enable row level security;

-- FOR DEVELOPMENT: Create a policy that allows all authenticated users full access
-- WARNING: These policies should be tightened for production.
create policy "Allow all access to authenticated users" on public.users for all using (auth.role() = 'authenticated');
create policy "Allow all access to authenticated users" on public.organizations for all using (auth.role() = 'authenticated');
create policy "Allow all access to authenticated users" on public.shops for all using (auth.role() = 'authenticated');
create policy "Allow all access to authenticated users" on public.organization_members for all using (auth.role() = 'authenticated');
create policy "Allow all access to authenticated users" on public.shop_staff for all using (auth.role() = 'authenticated');
create policy "Allow all access to authenticated users" on public.audit_logs for all using (auth.role() = 'authenticated');
create policy "Allow all access to authenticated users" on public.invitations for all using (auth.role() = 'authenticated');
create policy "Allow all access to authenticated users" on public.products for all using (auth.role() = 'authenticated');
create policy "Allow all access to authenticated users" on public.inventory_items for all using (auth.role() = 'authenticated');
create policy "Allow all access to authenticated users" on public.sales for all using (auth.role() = 'authenticated');
create policy "Allow all access to authenticated users" on public.sale_items for all using (auth.role() = 'authenticated');
create policy "Allow all access to authenticated users" on public.invoices for all using (auth.role() = 'authenticated');
create policy "Allow all access to authenticated users" on public.platform_admins for all using (auth.role() = 'authenticated');
create policy "Allow all access to authenticated users" on public.subscriptions for all using (auth.role() = 'authenticated');

-- Create trigger to automatically create user profile when a new auth user signs up
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.users (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

-- Note: you might need to drop the existing trigger first if you run this again
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
