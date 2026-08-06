import { resetMockDatabase } from '../../infrastructure/mock/MockDatabase';
import { getSupabaseAdmin } from '../../infrastructure/supabase/client';

export const resetDatabase = async () => {
  const dataProvider = import.meta.env.VITE_DATA_PROVIDER || 'mock';

  if (dataProvider === 'supabase') {
    const supabaseAdmin = getSupabaseAdmin();
    // Truncate tables to ensure test isolation
    const tables = [
      'audit_logs',
      'invoices',
      'sale_items',
      'sales',
      'inventory',
      'products',
      'invitations',
      'shop_staff',
      'shops',
      'organization_members',
      'subscriptions',
      'organizations',
      'platform_admins',
      'users'
    ];
    
    // We might need to run a raw SQL query or delete rows one by one.
    // Supabase RPC for truncating is best. Assuming a 'truncate_tables' function exists.
    // Otherwise, we delete all rows from each table if RLS allows (service role bypasses RLS).
    
    for (const table of tables) {
      await supabaseAdmin.from(table).delete().neq('id', 'dummy_value_that_does_not_exist');
    }
  } else {
    resetMockDatabase();
  }
};
