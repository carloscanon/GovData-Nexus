import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { supabase } from '@/lib/supabase';

// GET /api/roles – list all roles with their modules
export async function GET() {
  const session = await getServerSession();
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });

  // Superadmin check – assume role manager flag also allowed
  const { data: userInfo } = await supabase
    .from('tenant_users')
    .select('is_superadmin, is_role_manager')
    .eq('user_id', session.user.id)
    .single();
  if (!userInfo?.is_superadmin && !userInfo?.is_role_manager) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { data: roles, error } = await supabase
    .from('roles')
    .select('id, name, description');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Attach modules for each role
  const roleIds = roles.map(r => r.id);
  const { data: modules, error: modErr } = await supabase
    .from('role_modules')
    .select('role_id, module')
    .in('role_id', roleIds);
  if (modErr) return NextResponse.json({ error: modErr.message }, { status: 500 });

  const rolesWithModules = roles.map(r => ({
    ...r,
    modules: modules.filter(m => m.role_id === r.id).map(m => m.module),
  }));

  return NextResponse.json(rolesWithModules);
}

// POST /api/roles – create a new role
export async function POST(req: Request) {
  const session = await getServerSession();
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });

  const { data: userInfo } = await supabase
    .from('tenant_users')
    .select('is_superadmin, is_role_manager')
    .eq('user_id', session.user.id)
    .single();
  if (!userInfo?.is_superadmin && !userInfo?.is_role_manager) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { name, description, modules } = await req.json();
  if (!name || !Array.isArray(modules)) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  // Insert role (tenant_id derived from session, assume stored in userInfo)
  const tenantId = session.user.tenant_id; // adjust if stored elsewhere
  const { data: role, error } = await supabase
    .from('roles')
    .insert({ name, description, tenant_id: tenantId })
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Insert role‑module mappings
  const roleModules = modules.map((m: string) => ({ role_id: role.id, module: m }));
  const { error: modErr } = await supabase.from('role_modules').insert(roleModules);
  if (modErr) return NextResponse.json({ error: modErr.message }, { status: 500 });

  return NextResponse.json({ ...role, modules });
}
