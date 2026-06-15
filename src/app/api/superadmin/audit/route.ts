import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET: Fetch central audit executive stats, connections, logs, and alerts
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const tenantId = searchParams.get('tenant_id');

    // 1. Fetch Audit settings
    const { data: settings } = await supabase
      .from('saas_audit_settings')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(1);

    const activeSettings = settings && settings.length > 0 ? settings[0] : { retention_days: 8 };

    // 2. Fetch connections, logs, and alerts
    let queryCon = supabase.from('saas_connections').select('*').order('login_time', { ascending: false });
    let queryLogs = supabase.from('saas_audit_logs').select('*').order('created_at', { ascending: false });
    let queryAlerts = supabase.from('saas_audit_alerts').select('*').order('created_at', { ascending: false });

    if (tenantId && tenantId !== 'all') {
      queryCon = queryCon.eq('tenant_id', tenantId);
      queryLogs = queryLogs.eq('tenant_id', tenantId);
      queryAlerts = queryAlerts.eq('tenant_id', tenantId);
    }

    const [rCon, rLogs, rAlerts, rTenants] = await Promise.all([
      queryCon,
      queryLogs,
      queryAlerts,
      supabase.from('tenants').select('id, name')
    ]);

    const connections = rCon.data || [];
    const logs = rLogs.data || [];
    const alerts = rAlerts.data || [];
    const tenants = rTenants.data || [];

    // Calculate executive KPIs
    const activeSessions = connections.filter(c => c.status === 'Activa');
    const suspiciousConnections = connections.filter(c => c.is_suspicious);
    
    // Connections today (last 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const connectionsToday = connections.filter(c => c.login_time >= oneDayAgo);
    
    // Connected today distinct users count
    const uniqueUsersToday = new Set(connectionsToday.map(c => c.user_email)).size;
    const uniqueUsersActive7d = new Set(connections.map(c => c.user_email)).size;

    // Company ranking by activity logs
    const companyActivityMap: Record<string, number> = {};
    logs.forEach(log => {
      const tenantName = tenants.find(t => t.id === log.tenant_id)?.name || 'Desconocido';
      companyActivityMap[tenantName] = (companyActivityMap[tenantName] || 0) + 1;
    });
    
    const companyRankings = Object.entries(companyActivityMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    return NextResponse.json({
      success: true,
      data: {
        settings: activeSettings,
        connections,
        logs,
        alerts,
        tenants,
        stats: {
          activeSessionsCount: activeSessions.length,
          connectedTodayUsers: uniqueUsersToday,
          active7dUsers: uniqueUsersActive7d,
          totalAlertsCount: alerts.length,
          unresolvedAlertsCount: alerts.filter(a => a.status === 'Abierta').length,
          suspiciousAccessCount: suspiciousConnections.length,
          companyRankings
        }
      }
    });
  } catch (error: any) {
    console.error('Audit API fetch failed:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST: Save configurations, trigger purges, or force session close
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, settings, sessionId, alertId } = body;

    // Action 1: Save retention settings
    if (action === 'save_settings') {
      const { data, error } = await supabase
        .from('saas_audit_settings')
        .upsert({
          config_key: 'global', // constraint UNIQUE
          retention_days: settings.retention_days,
          updated_at: new Date().toISOString(),
          updated_by: 'admin@govdata.com'
        }, { onConflict: 'config_key' }) // Try upserting using unique key
        .select();

      if (error) {
        // Handle if config_key constraint error or similar by updating directly
        const { data: altData, error: altErr } = await supabase
          .from('saas_audit_settings')
          .insert({
            retention_days: settings.retention_days,
            updated_at: new Date().toISOString(),
            updated_by: 'admin@govdata.com'
          })
          .select();
        if (altErr) throw altErr;
        return NextResponse.json({ success: true, data: altData });
      }

      return NextResponse.json({ success: true, data });
    }

    // Action 2: Force termination of a connection session
    if (action === 'terminate_session') {
      const { data, error } = await supabase
        .from('saas_connections')
        .update({
          status: 'Forzada',
          logout_time: new Date().toISOString()
        })
        .eq('id', sessionId)
        .select();

      if (error) throw error;
      return NextResponse.json({ success: true, data });
    }

    // Action 2b: Bulk terminate connection sessions
    if (action === 'terminate_sessions') {
      const { sessionIds } = body;
      if (!Array.isArray(sessionIds) || sessionIds.length === 0) {
        return NextResponse.json({ success: false, error: 'Lista de IDs no válida' }, { status: 400 });
      }
      const { data, error } = await supabase
        .from('saas_connections')
        .update({
          status: 'Forzada',
          logout_time: new Date().toISOString()
        })
        .in('id', sessionIds)
        .select();

      if (error) throw error;
      return NextResponse.json({ success: true, data });
    }

    // Action 3: Resolve security alert
    if (action === 'resolve_alert') {
      const { data, error } = await supabase
        .from('saas_audit_alerts')
        .update({ status: 'Resuelta' })
        .eq('id', alertId)
        .select();

      if (error) throw error;
      return NextResponse.json({ success: true, data });
    }

    // Action 4: Force daily purge manually
    if (action === 'trigger_manual_purge') {
      // Execute the pg function using an update to trigger it
      const { data: setRow } = await supabase.from('saas_audit_settings').select('*').limit(1);
      if (setRow && setRow.length > 0) {
        const { error } = await supabase
          .from('saas_audit_settings')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', setRow[0].id);
        if (error) throw error;
      }
      return NextResponse.json({ success: true, message: 'Purga manual ejecutada exitosamente.' });
    }

    return NextResponse.json({ success: false, error: 'Acción no válida' }, { status: 400 });
  } catch (error: any) {
    console.error('Audit API write failed:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
