import { NextResponse } from 'next/server';

// Mock DB Persistence in memory or local storage (if running client/server next.js context)
export async function POST(req: Request) {
  try {
    const { name, domain, plan, nit, email, phone, address } = await req.json();

    if (!name || !domain) {
      return NextResponse.json({ success: false, error: 'Nombre y Dominio son requeridos.' }, { status: 400 });
    }

    console.log(`[SaaS Core] Iniciando flujo de aprovisionamiento para el nuevo Tenant: ${name}`);

    // 1. Definir límites del plan
    let maxUsers = 10;
    let maxScans = 100;
    let storageGb = 5;
    let activeModules = ['catalog'];

    if (plan === 'Professional') {
      maxUsers = 100;
      maxScans = 500;
      storageGb = 20;
      activeModules = ['catalog', 'quality', 'team'];
    } else if (plan === 'Enterprise') {
      maxUsers = 9999;
      maxScans = 9999;
      storageGb = 500;
      activeModules = ['catalog', 'quality', 'workflows', 'security', 'team', 'maturity'];
    }

    // 2. Generación automática de IDs y datos estructurados
    const tenantId = `tenant-${Math.random().toString(36).substr(2, 9)}`;
    const subscriptionId = `sub-${Math.random().toString(36).substr(2, 9)}`;

    // Estructura de aprovisionamiento conforme a la especificación
    const provisionResult = {
      tenant: {
        id: tenantId,
        name,
        domain,
        nit: nit || '900.000.000-0',
        status: 'active',
        created_at: new Date().toISOString()
      },
      subscription: {
        id: subscriptionId,
        plan,
        status: 'trial',
        trial_end: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 días Trial
        price_monthly: plan === 'Enterprise' ? 499 : plan === 'Professional' ? 99 : 29
      },
      limits: {
        max_users: maxUsers,
        max_scans: maxScans,
        storage_gb: storageGb
      },
      modules: activeModules,
      admin_user: {
        id: `usr-admin-${Math.random().toString(36).substr(2, 9)}`,
        email: email || `admin@${domain}`,
        role: 'tenant_admin'
      }
    };

    console.log(`[SaaS Core] Tenant ${name} aprovisionado con éxito. ID: ${tenantId}`);

    return NextResponse.json({
      success: true,
      message: 'Empresa y recursos SaaS aprovisionados correctamente.',
      data: provisionResult
    });

  } catch (error: any) {
    console.error('[SaaS Core Error] Error al crear tenant:', error);
    return NextResponse.json({ success: false, error: error.message || 'Error del servidor.' }, { status: 500 });
  }
}
