import { supabase } from '@/lib/supabase';

/**
 * Checks whether a user has access to a given module (route slug).
 * Returns true if the user is a superadmin or role manager, or if any of
 * the user’s assigned roles include the requested module.
 */
export async function hasAccess(userId: string, module: string): Promise<boolean> {
  // Fast path: superadmin or role manager
  const { data: userInfo, error: userErr } = await supabase
    .from('tenant_users')
    .select('is_superadmin, is_role_manager')
    .eq('user_id', userId)
    .single();
  if (userErr) {
    console.error('RBAC user lookup error', userErr);
    return false;
  }
  if (userInfo?.is_superadmin || userInfo?.is_role_manager) return true;

  // Get all role IDs assigned to the user
  const { data: userRoles, error: roleErr } = await supabase
    .from('user_roles')
    .select('role_id')
    .eq('user_id', userId);
  if (roleErr) {
    console.error('RBAC role fetch error', roleErr);
    return false;
  }
  if (!userRoles?.length) return false;

  const roleIds = userRoles.map((r: any) => r.role_id);

  // Does any of these roles contain the requested module?
  const { count } = await supabase
    .from('role_modules')
    .select('module', { count: 'exact', head: true })
    .in('role_id', roleIds)
    .eq('module', module);

  return (count ?? 0) > 0;
}

/**
 * Helper to retrieve a user's role list (used for UI displays).
 */
export async function getUserRoles(userId: string) {
  const { data: roles, error } = await supabase
    .from('user_roles')
    .select('role_id, roles!inner(name)') // join to roles table
    .eq('user_id', userId);
  if (error) {
    console.error('RBAC getUserRoles error', error);
    return [];
  }
  return roles.map((r: any) => ({ id: r.role_id, name: r.roles.name }));
}
