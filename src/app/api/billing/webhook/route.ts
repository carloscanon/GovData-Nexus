import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const { type, data } = payload;

    console.log(`[Stripe Webhook] Evento recibido: ${type}`);

    if (!type || !data || !data.object) {
      return NextResponse.json({ success: false, error: 'Payload inválido' }, { status: 400 });
    }

    const subscription = data.object;
    const tenantId = subscription.metadata?.tenant_id || 'demo-tenant-id';
    const plan = subscription.metadata?.plan || 'Starter';

    switch (type) {
      case 'invoice.paid':
        console.log(`[Stripe Billing] Factura cobrada con éxito para el Tenant: ${tenantId}`);
        // Aquí se actualizaría la fecha de vencimiento y estado de pago en base de datos.
        break;

      case 'subscription.updated':
        console.log(`[Stripe Billing] Suscripción actualizada para Tenant: ${tenantId} al plan ${plan}`);
        // Aquí se actualizarían los límites de usuario, storage, etc.
        break;

      case 'subscription.canceled':
        console.log(`[Stripe Billing] Suscripción CANCELADA para el Tenant: ${tenantId}`);
        // Aquí se cambiaría el status de la empresa a 'suspended' o 'cancelled'.
        break;

      default:
        console.log(`[Stripe Billing] Evento no procesado: ${type}`);
    }

    return NextResponse.json({
      success: true,
      message: `Webhook procesado con éxito para el evento ${type}`
    });

  } catch (error: any) {
    console.error('[Stripe Webhook Error] Error al procesar webhook:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
