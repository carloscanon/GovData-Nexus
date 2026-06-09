import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { supabase } from '@/lib/supabaseClient';

// GET /api/roles/[id] – fetch a role with its modules
export async function GET(request: Request, { params }: { params: { id: string } }) {
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

  const roleId = params.id;
  const { data: role, error } = await supabase
    .from('roles')
    .select('id, name, description')
    .eq('id', roleId)
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: modules, error: modErr } = await supabase
    .from('role_modules')
    .select('module')
    .eq('role_id', roleId);
  if (modErr) return NextResponse.json({ error: modErr.message }, { status: 500 });

  return NextResponse.json({ ...role, modules: modules.map(m => m.module) });
}

// PUT /api/roles/[id] – update role name/description and its module list
export async function PUT(request: Request, { params }: { params: { id: string } }) {
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

  const roleId = params.id;
  const { name, description, modules } = await request.json();
  if (!name || !Array.isArray(modules)) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const { error: updErr } = await supabase
    .from('roles')
    .update({ name, description })
    .eq('id', roleId);
  if (updErr) return NextResponse.json({ error: updErr.message }, { status: 500 });

  // Replace module mappings – delete existing then insert new
  await supabase.from('role_modules').delete().eq('role_id', roleId);
  const roleModules = modules.map((m: string) => ({ role_id: roleId, module: m }));
  const { error: modErr } = await supabase.from('role_modules').insert(roleModules);
  if (modErr) return NextResponse.json({ error: modErr.message }, { status: 500 });

  return NextResponse.json({ success: true });
}

// DELETE /api/roles/[id] – remove role and cascade delete mappings
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
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

  const roleId = params.id;
  // Delete role – foreign keys cascade to role_modules and user_roles
  const { error } = await supabase.from('roles').delete().eq('id', roleId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
