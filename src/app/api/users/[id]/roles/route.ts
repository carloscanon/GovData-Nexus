import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { supabase } from '@/lib/supabase';

// GET /api/users/[id]/roles – list roles assigned to a user
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession();
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });

  // Ensure caller is superadmin or role manager
  const { data: userInfo } = await supabase
    .from('tenant_users')
    .select('is_superadmin, is_role_manager')
    .eq('user_id', session.user.id)
    .single();
  if (!userInfo?.is_superadmin && !userInfo?.is_role_manager) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const userId = (await params).id;
  const { data, error } = await supabase
    .from('user_roles')
    .select('role_id, roles!inner(name, description)')
    .eq('user_id', userId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const roles = data.map((r: any) => ({ id: r.role_id, name: r.roles.name, description: r.roles.description }));
  return NextResponse.json(roles);
}

// POST /api/users/[id]/roles – assign a set of roles to a user (replace existing)
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
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

  const userId = (await params).id;
  const { roleIds } = await request.json(); // expect array of role UUIDs
  if (!Array.isArray(roleIds)) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  // Remove existing assignments
  await supabase.from('user_roles').delete().eq('user_id', userId);

  // Insert new assignments
  const assignments = roleIds.map((rid: string) => ({ user_id: userId, role_id: rid }));
  const { error } = await supabase.from('user_roles').insert(assignments);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}

// DELETE /api/users/[id]/roles/:roleId – remove a specific role from a user
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
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

  const { id: userId } = await params;
  const { searchParams } = new URL(request.url);
  const roleId = searchParams.get('roleId');
  if (!roleId) return NextResponse.json({ error: 'Missing roleId parameter' }, { status: 400 });
  const { error } = await supabase.from('user_roles').delete().eq('user_id', userId).eq('role_id', roleId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
