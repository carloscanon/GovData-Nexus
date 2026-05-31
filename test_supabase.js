const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://vojsoqmhqorysapimutp.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvanNvcW1ocW9yeXNhcGltdXRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3MDQ0NDEsImV4cCI6MjA5NDI4MDQ0MX0.UOrXo-87DNp2vXjS6lEnEGFfTeUVOyTEvN4ozZs4bXk');

async function main() {
    const { data: currentTenantList } = await supabase.from('tenants').select('id').limit(1);
    let currentTenantId = 'a9b3d0bc-5232-44df-9118-2041dbcb4a08';
    if (currentTenantList && currentTenantList.length > 0) currentTenantId = currentTenantList[0].id;

    console.log("Using Tenant:", currentTenantId);

    const res = await supabase.from('workflow_requests').insert([{
        tenant_id: currentTenantId,
        title: '[Roadmap M1] Implementación de Estándar: Documentación de Base Legal de Tratamiento (RAT)',
        description: 'Ticket de seguimiento para la socialización y adopción técnica del estándar STD-GDPR-01.',
        category: 'Catalogo',
        priority: 'Alta',
        status: 'Pendiente',
        current_step: 'Pendiente de asignación',
        sla: 'Finales de Septiembre',
        sla_status: 'Ok'
    }]).select();

    console.log(JSON.stringify(res, null, 2));
}

main();
