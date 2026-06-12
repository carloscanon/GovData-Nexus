'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldAlert, Lock, Eye, UserCheck, AlertOctagon, CheckCircle,
  FileWarning, Activity, ShieldCheck, Zap, Users, Search,
  Filter, X, Database, Clock, ExternalLink, Shield, Info,
  Award, Plus, Trash2, RefreshCw, AlertTriangle, ChevronDown, Save, Cpu
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlatform } from '@/contexts/PlatformContext';
import { supabase } from '@/lib/supabase';
import styles from './security.module.css';

// ─── Types ───────────────────────────────────────────────────────────────────
interface Risk {
  id: string; tenant_id: string; code: string; name: string;
  description: string; asset: string; severity: string; impact: string;
  probability: string; status: string; owner: string; action_plan: string;
  controls: string[]; created_at: string;
}
interface Incident {
  id: string; tenant_id: string; code: string; type: string;
  description: string; severity: string; status: string;
  assigned_to: string; created_at: string;
}
interface Control {
  id: string; tenant_id: string; control_id: string; framework: string;
  name: string; status: string; last_evaluated: string; evidence: string; notes: string;
  policy_id?: string | null;
}
interface AccessReview {
  id: string; tenant_id: string; user_id: string; user_name: string;
  role: string; asset: string; access_level: string; last_activity: string;
  risk_level: string; status: string; notes: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
const SEV_COLOR: Record<string, { bg: string; text: string }> = {
  Crítico: { bg: '#fef2f2', text: '#ef4444' },
  Alto:    { bg: '#fff7ed', text: '#f97316' },
  Medio:   { bg: '#fffbeb', text: '#f59e0b' },
  Bajo:    { bg: '#f0fdf4', text: '#10b981' },
};
const STATUS_COLOR: Record<string, { bg: string; text: string }> = {
  Abierto:       { bg: '#fef2f2', text: '#ef4444' },
  Mitigando:     { bg: '#eff6ff', text: '#3b82f6' },
  'En Revisión': { bg: '#fffbeb', text: '#f59e0b' },
  Cerrado:       { bg: '#f0fdf4', text: '#10b981' },
  Investigando:  { bg: '#fef2f2', text: '#ef4444' },
  Bloqueado:     { bg: '#fff7ed', text: '#f97316' },
  Mitigado:      { bg: '#fffbeb', text: '#f59e0b' },
  Activo:        { bg: '#eff6ff', text: '#3b82f6' },
  Revocado:      { bg: '#f0fdf4', text: '#10b981' },
};


function SevBadge({ value, map }: { value: string; map: Record<string, { bg: string; text: string }> }) {
  const c = map[value] || { bg: '#f1f5f9', text: '#64748b' };
  return (
    <span style={{ padding: '3px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700, background: c.bg, color: c.text, whiteSpace: 'nowrap' }}>
      {value}
    </span>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function SecurityModule() {
  const { currentTenant } = usePlatform();
  const [activeTab, setActiveTab] = useState('riesgos');
  const [isMounted, setIsMounted] = useState(false);

  // Data
  const [risks, setRisks] = useState<Risk[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [controls, setControls] = useState<Control[]>([]);
  const [accessReviews, setAccessReviews] = useState<AccessReview[]>([]);
  const [tenantUsers, setTenantUsers] = useState<any[]>([]);
  const [frameworks, setFrameworks] = useState<string[]>(['ISO 27001', 'Ley 1581 de 2012 (Habeas Data)', 'Ley 1712 de 2014 (Transparencia)', 'GDPR', 'NIST Framework']);
  const [policies, setPolicies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [selectedRisk, setSelectedRisk] = useState<Risk | null>(null);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [selectedKPI, setSelectedKPI] = useState<any>(null);
  const [isRiskModalOpen, setIsRiskModalOpen] = useState(false);
  const [isIncidentModalOpen, setIsIncidentModalOpen] = useState(false);
  const [isAccessModalOpen, setIsAccessModalOpen] = useState(false);

  // Search
  const [search, setSearch] = useState('');

  // New record forms
  const [newRisk, setNewRisk] = useState({ name: '', description: '', asset: '', severity: 'Medio', impact: 'Medio', probability: 'Media', owner: '', action_plan: '' });
  const [newIncident, setNewIncident] = useState({ type: '', description: '', severity: 'Medio', assigned_to: '' });
  const [newAccess, setNewAccess] = useState({ user_id: '', asset: '', access_level: 'Viewer', last_activity: 'Hoy', risk_level: 'Bajo', notes: '' });
  const [newControl, setNewControl] = useState({ control_id: '', name: '', framework: 'ISO 27001', status: 'OK', evidence: '', notes: '', policy_id: '' });
  const [isControlModalOpen, setIsControlModalOpen] = useState(false);
  const [isFrameworkModalOpen, setIsFrameworkModalOpen] = useState(false);
  const [newFramework, setNewFramework] = useState({ name: '', code: '', status: 'Activo' });
  const [isAiGenerating, setIsAiGenerating] = useState(false);

  const simulateAiControlGeneration = async () => {
    setIsAiGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 900));

    const selectedFw = newControl.framework;
    const templates: Record<string, { control_id: string; name: string; notes: string; evidence: string }[]> = {
      'ISO 27001': [
        { control_id: 'A.12.4.1', name: 'Registro de eventos (Event logging)', notes: 'Implementar registro de auditoría completo para todas las consultas y modificaciones a bases de datos transaccionales.', evidence: 'Logs habilitados en Supabase PostgreSQL' },
        { control_id: 'A.9.4.1', name: 'Restricción de acceso a la información', notes: 'Configurar e implementar políticas Row Level Security (RLS) en tablas que contienen datos de clientes.', evidence: 'Políticas RLS en tabla tenant_users' },
        { control_id: 'A.10.1.1', name: 'Política sobre el uso de controles criptográficos', notes: 'Garantizar el cifrado de datos tanto en reposo (AES-256) como en tránsito (TLS 1.3).', evidence: 'SSL forzado y TDE activo en base de datos' },
        { control_id: 'A.18.1.3', name: 'Protección de registros organizacionales', notes: 'Establecer copias de seguridad incrementales diarias con retención mínima de 1 año.', evidence: 'Cron de backups diario automatizado' }
      ],
      'Ley 1581 de 2012 (Habeas Data)': [
        { control_id: 'L1581-04', name: 'Mecanismo de revocatoria del consentimiento', notes: 'Permitir al usuario revocar el consentimiento del tratamiento de sus datos mediante un botón directo en su perfil.', evidence: 'Feature toggle en portal del cliente' },
        { control_id: 'L1581-05', name: 'Canal de atención para consultas y reclamos (Habeas Data)', notes: 'Establecer un flujo automatizado para atender y documentar solicitudes de acceso, rectificación y eliminación en menos de 15 días hábiles.', evidence: 'Workflow PQRSDF - Transparencia' },
        { control_id: 'L1581-06', name: 'Política de Tratamiento de Información (PTI)', notes: 'Publicar de manera visible los de la PTI en la landing page y recolectar firma de aceptación.', evidence: 'Landing page y checkbox de registro' }
      ],
      'Ley 1712 de 2014 (Transparencia)': [
        { control_id: 'L1712-03', name: 'Índice de Información Clasificada y Reservada', notes: 'Mantener un registro estructurado y actualizado de la información cuyo acceso público está exceptuado.', evidence: 'Inventario de activos clasificados' },
        { control_id: 'L1712-04', name: 'Programa de Gestión Documental y Publicación', notes: 'Establecer un esquema de publicación proactiva en el sitio web institucional cumpliendo con la matriz de transparencia.', evidence: 'Botón de transparencia en portal público' }
      ],
      'GDPR': [
        { control_id: 'GDPR-Art.30', name: 'Registro de las actividades de tratamiento', notes: 'Mantener el inventario estructurado de actividades de tratamiento de datos personales europeos, detallando finalidades y destinatarios.', evidence: 'Data Mapping en catálogo de datos' },
        { control_id: 'GDPR-Art.33', name: 'Notificación de violación de seguridad a la autoridad', notes: 'Documentar e implementar procedimiento de comunicación a la Supertintendencia o autoridad en un plazo máximo de 72 horas en caso de brecha.', evidence: 'Plan de Respuesta ante Incidentes v2' },
        { control_id: 'GDPR-Art.17', name: 'Derecho de supresión (derecho al olvido)', notes: 'Habilitar purga completa de datos históricos de un cliente si este lo solicita, sin dejar rastros en copias activas.', evidence: 'Script de anonimización / eliminación' }
      ],
      'NIST Framework': [
        { control_id: 'PR.DS-1', name: 'Protección de datos en reposo', notes: 'Aplicar cifrado AES-256 a nivel de volumen para todas las instancias de base de datos en nube.', evidence: 'Cifrado EBS / RDS activo' },
        { control_id: 'ID.AM-1', name: 'Inventario de recursos de software y hardware', notes: 'Automatizar el descubrimiento de servicios y software autorizados en los entornos de producción.', evidence: 'Reporte mensual de inventario automatizado' },
        { control_id: 'RC.RP-1', name: 'Plan de Recuperación ante Desastres', notes: 'Simulacro y validación de restauración de bases de datos desde instantáneas de respaldo con un RTO < 4 horas.', evidence: 'Acta de simulacro de recuperación Junio 2026' }
      ]
    };

    const fwList = templates[selectedFw] || templates['ISO 27001'];
    const randomTemplate = fwList[Math.floor(Math.random() * fwList.length)];
    
    setNewControl(prev => ({
      ...prev,
      control_id: randomTemplate.control_id,
      name: randomTemplate.name,
      notes: randomTemplate.notes,
      evidence: randomTemplate.evidence,
      status: 'OK'
    }));

    setIsAiGenerating(false);
  };


  // ── Fetch Data ──────────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    if (!currentTenant?.id) return;
    const tid = currentTenant.id;
    setLoading(true);
    try {
      const [r1, r2, r3, r4, r5, r6, r7] = await Promise.all([
        supabase.from('security_risks').select('*').eq('tenant_id', tid).order('created_at', { ascending: false }),
        supabase.from('security_incidents').select('*').eq('tenant_id', tid).order('created_at', { ascending: false }),
        supabase.from('security_controls').select('*').eq('tenant_id', tid).order('framework'),
        supabase.from('security_access_reviews').select('*').eq('tenant_id', tid).order('created_at', { ascending: false }),
        supabase.from('tenant_users').select('id, name, email, avatar').eq('tenant_id', tid).order('name'),
        supabase.from('security_frameworks').select('name').eq('tenant_id', tid),
        supabase.from('data_policies').select('id, title, expiry, status').eq('tenant_id', tid)
      ]);
      if (r1.data) setRisks(r1.data.map(r => ({ ...r, controls: r.controls || [] })));
      if (r2.data) setIncidents(r2.data);
      if (r3.data) setControls(r3.data);
      if (r4.data) setAccessReviews(r4.data);
      if (r5.data) setTenantUsers(r5.data);
      if (r6.data && r6.data.length > 0) {
        setFrameworks(r6.data.map(f => f.name));
      }
      if (r7.data) setPolicies(r7.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [currentTenant?.id]);

  useEffect(() => { setIsMounted(true); }, []);
  useEffect(() => { if (currentTenant?.id) fetchData(); }, [currentTenant?.id, fetchData]);

  // ── Computed KPIs ───────────────────────────────────────────────────────────
  const criticalRisks = risks.filter(r => r.severity === 'Crítico' || r.severity === 'Alto').filter(r => r.status !== 'Cerrado');
  const openIncidents = incidents.filter(i => i.status === 'Investigando' || i.status === 'Bloqueado');
  const highAccessCount = accessReviews.filter(a => a.risk_level === 'Alto' && a.status === 'Activo').length;

  // SCI: % controles OK por framework
  const frameworkScores = frameworks.map(f => {
    const fw = controls.filter(c => c.framework === f);
    if (fw.length === 0) return { name: f, pct: 0, color: '#94a3b8' };
    const ok = fw.filter(c => c.status === 'OK').length;
    const partial = fw.filter(c => c.status === 'Parcial').length;
    const pct = Math.round(((ok + partial * 0.5) / fw.length) * 100);
    const colors: Record<string, string> = { 
      'ISO 27001': '#6366f1', 
      'Ley 1581 de 2012 (Habeas Data)': '#10b981', 
      'Ley 1712 de 2014 (Transparencia)': '#06b6d4',
      'GDPR': '#f59e0b', 
      'NIST Framework': '#f97316' 
    };
    return { name: f, pct, color: colors[f] || '#6366f1' };
  });
  const sciScore = frameworkScores.length > 0 && frameworkScores.some(f => f.pct > 0)
    ? Math.round(frameworkScores.reduce((a, f) => a + f.pct, 0) / frameworkScores.length)
    : 0;

  let levelText = sciScore >= 88 ? 'FUERTE' : sciScore >= 70 ? 'PROTEGIDO' : 'CRÍTICO';
  let levelColor = sciScore >= 88 ? '#10b981' : sciScore >= 70 ? '#6366f1' : '#ef4444';
  const circumference = 2 * Math.PI * 52;
  const dashOffset = circumference - (sciScore / 100) * circumference;

  // Heatmap
  const getHeatCell = (impact: string, prob: string) =>
    risks.filter(r => r.impact === impact && r.probability === prob && r.status !== 'Cerrado').length;

  // ── CRUD Actions ────────────────────────────────────────────────────────────
  const handleAddRisk = async () => {
    if (!newRisk.name || !currentTenant?.id) return;
    const code = 'RSK-' + String(risks.length + 1).padStart(3, '0');
    const { error } = await supabase.from('security_risks').insert([{ ...newRisk, tenant_id: currentTenant.id, code, controls: [] }]);
    if (!error) { fetchData(); setIsRiskModalOpen(false); setNewRisk({ name: '', description: '', asset: '', severity: 'Medio', impact: 'Medio', probability: 'Media', owner: '', action_plan: '' }); }
    else alert('Error: ' + error.message);
  };

  const handleUpdateRiskStatus = async (id: string, status: string) => {
    await supabase.from('security_risks').update({ status, updated_at: new Date().toISOString() }).eq('id', id);
    setRisks(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    if (selectedRisk?.id === id) setSelectedRisk(prev => prev ? { ...prev, status } : null);
  };

  const handleSaveRiskEdit = async () => {
    if (!selectedRisk || !currentTenant?.id) return;
    const { error } = await supabase.from('security_risks').update({
      name: selectedRisk.name,
      asset: selectedRisk.asset,
      severity: selectedRisk.severity,
      impact: selectedRisk.impact,
      probability: selectedRisk.probability,
      owner: selectedRisk.owner,
      description: selectedRisk.description,
      action_plan: selectedRisk.action_plan,
      updated_at: new Date().toISOString()
    }).eq('id', selectedRisk.id);
    
    if (!error) {
      setRisks(prev => prev.map(r => r.id === selectedRisk.id ? selectedRisk : r));
      alert('Riesgo actualizado correctamente.');
    } else {
      alert('Error al actualizar: ' + error.message);
    }
  };

  const handleDeleteRisk = async (id: string) => {
    if (!confirm('¿Eliminar este riesgo?')) return;
    await supabase.from('security_risks').delete().eq('id', id);
    setRisks(prev => prev.filter(r => r.id !== id));
    setSelectedRisk(null);
  };

  const handleAddIncident = async () => {
    if (!newIncident.type || !currentTenant?.id) return;
    const code = 'INC-' + String(incidents.length + 1).padStart(3, '0');
    const { error } = await supabase.from('security_incidents').insert([{ ...newIncident, tenant_id: currentTenant.id, code }]);
    if (!error) { fetchData(); setIsIncidentModalOpen(false); setNewIncident({ type: '', description: '', severity: 'Medio', assigned_to: '' }); }
    else alert('Error: ' + error.message);
  };

  const handleUpdateIncidentStatus = async (id: string, status: string) => {
    await supabase.from('security_incidents').update({ status, updated_at: new Date().toISOString() }).eq('id', id);
    setIncidents(prev => prev.map(i => i.id === id ? { ...i, status } : i));
    if (selectedIncident?.id === id) setSelectedIncident(prev => prev ? { ...prev, status } : null);
  };

  const handleUpdateControlStatus = async (id: string, status: string) => {
    await supabase.from('security_controls').update({ status, last_evaluated: new Date().toISOString().split('T')[0] }).eq('id', id);
    setControls(prev => prev.map(c => c.id === id ? { ...c, status } : c));
  };

  const handleAddAccess = async () => {
    if (!newAccess.user_id || !newAccess.asset || !currentTenant?.id) return;
    const user = tenantUsers.find(u => u.id === newAccess.user_id);
    const { error } = await supabase.from('security_access_reviews').insert([{
      ...newAccess,
      tenant_id: currentTenant.id,
      user_name: user?.name || '',
      role: user?.role || '',
    }]);
    if (!error) { fetchData(); setIsAccessModalOpen(false); setNewAccess({ user_id: '', asset: '', access_level: 'Viewer', last_activity: 'Hoy', risk_level: 'Bajo', notes: '' }); }
    else alert('Error: ' + error.message);
  };

  const handleAddControl = async () => {
    if (!newControl.name || !newControl.control_id || !currentTenant?.id) return;
    const { error } = await supabase.from('security_controls').insert([{
      ...newControl,
      tenant_id: currentTenant.id,
      last_evaluated: new Date().toISOString().split('T')[0],
      policy_id: newControl.policy_id || null
    }]);
    if (!error) {
      fetchData();
      setIsControlModalOpen(false);
      setNewControl({ control_id: '', name: '', framework: 'ISO 27001', status: 'OK', evidence: '', notes: '', policy_id: '' });
    } else {
      alert('Error: ' + error.message);
    }
  };

  const handleAddFramework = async () => {
    if (!newFramework.name || !currentTenant?.id) return;
    const { error } = await supabase.from('security_frameworks').insert([{
      ...newFramework,
      tenant_id: currentTenant.id
    }]);
    if (!error) {
      fetchData();
      setIsFrameworkModalOpen(false);
      setNewFramework({ name: '', code: '', status: 'Activo' });
    } else {
      alert('Error: ' + error.message);
    }
  };

  const handleLoadStandardControls = async () => {
    if (!currentTenant?.id) return;
    const standardControls = [
      { control_id: 'A.8.2.1', name: 'Clasificación de información confidencial', framework: 'ISO 27001', status: 'OK', evidence: 'Política de Clasificación v2', notes: 'Gobernado en el Catálogo' },
      { control_id: 'A.8.2.3', name: 'Etiquetado de activos de información', framework: 'ISO 27001', status: 'Parcial', evidence: 'Clasificación automática DB', notes: 'En proceso de automatización' },
      { control_id: 'A.9.1.1', name: 'Política de Control de Acceso', framework: 'ISO 27001', status: 'OK', evidence: 'Matriz de Roles y Perfiles', notes: 'Revisión semestral' },
      { control_id: 'L1581-01', name: 'Obtención de Autorización y Consentimiento', framework: 'Ley 1581 de 2012 (Habeas Data)', status: 'OK', evidence: 'Términos y condiciones web', notes: 'Auditoría legal conforme' },
      { control_id: 'L1581-02', name: 'Registro Nacional de Bases de Datos (RNBD)', framework: 'Ley 1581 de 2012 (Habeas Data)', status: 'Parcial', evidence: 'Radicado SIC-98821', notes: 'Pendiente subir base transaccional' },
      { control_id: 'L1712-01', name: 'Esquema de Publicación de Información Pública', framework: 'Ley 1712 de 2014 (Transparencia)', status: 'OK', evidence: 'Sección Transparencia Sitio Web', notes: 'Actualización mensual' },
      { control_id: 'L1712-02', name: 'Registro de Activos de Información (ITA)', framework: 'Ley 1712 de 2014 (Transparencia)', status: 'Parcial', evidence: 'Inventario de activos en catálogo', notes: 'Se integra con el catálogo de datos' },
      { control_id: 'GDPR.32', name: 'Cifrado de datos personales', framework: 'GDPR', status: 'OK', evidence: 'Configuración SSL/TLS y TDE en PostgreSQL', notes: 'Cifrado en tránsito y reposo activo' },
      { control_id: 'GDPR.35', name: 'Evaluaciones de Impacto (DPIA)', framework: 'GDPR', status: 'Falla', evidence: '', notes: 'Falta formalizar la DPIA para el módulo de workflows' },
      { control_id: 'PR.AC-1', name: 'Identidades y Accesos Privilegiados', framework: 'NIST Framework', status: 'OK', evidence: 'Consola IAM AWS / GCP', notes: 'MFA activo obligatorio' },
      { control_id: 'DE.AE-2', name: 'Monitoreo de Anomalías y Eventos', framework: 'NIST Framework', status: 'Parcial', evidence: 'Logs de auditoría Supabase', notes: 'Pendiente configurar alertas en Slack' }
    ].map(c => ({ ...c, tenant_id: currentTenant.id }));

    const { error } = await supabase.from('security_controls').insert(standardControls);
    if (!error) {
      fetchData();
      alert('Controles estándar cargados correctamente.');
    } else {
      alert('Error cargando controles estándar: ' + error.message);
    }
  };

  const handleRevokeAccess = async (id: string) => {
    await supabase.from('security_access_reviews').update({ status: 'Revocado', updated_at: new Date().toISOString() }).eq('id', id);
    setAccessReviews(prev => prev.map(a => a.id === id ? { ...a, status: 'Revocado' } : a));
  };

  if (!isMounted) return null;

  // Filter helpers
  const filteredRisks = risks.filter(r => r.name?.toLowerCase().includes(search.toLowerCase()) || r.asset?.toLowerCase().includes(search.toLowerCase()));
  const filteredIncidents = incidents.filter(i => i.type?.toLowerCase().includes(search.toLowerCase()) || i.description?.toLowerCase().includes(search.toLowerCase()));
  const filteredAccess = accessReviews.filter(a => a.user_name?.toLowerCase().includes(search.toLowerCase()) || a.asset?.toLowerCase().includes(search.toLowerCase()));

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.titleArea} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, #ef4444 0%, #6366f1 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0 }}>
            <ShieldAlert size={24} />
          </div>
          <div>
            <h1 style={{ margin: 0, marginBottom: '4px', fontSize: '1.8rem' }}>Seguridad y Riesgos</h1>
            <p style={{ margin: 0, color: '#64748b', fontSize: '0.95rem' }}>Gobierno de seguridad, cumplimiento normativo y gestión de riesgos corporativos.</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button onClick={fetchData} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', color: '#64748b' }}>
            <RefreshCw size={15} /> Actualizar
          </button>
        </div>
      </header>

      {/* ── Global Score Banner ── */}
      <motion.div className={styles.globalBanner} initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className={styles.globalLeft}>
          <div className={styles.circleWrap}>
            <svg width="120" height="120" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="52" fill="none" stroke="#e2e8f0" strokeWidth="10" />
              <circle cx="60" cy="60" r="52" fill="none" stroke={levelColor} strokeWidth="10"
                strokeDasharray={circumference} strokeDashoffset={dashOffset}
                strokeLinecap="round" transform="rotate(-90 60 60)"
                style={{ transition: 'stroke-dashoffset 1.2s ease' }} />
              <text x="60" y="55" textAnchor="middle" fill={levelColor} fontSize="22" fontWeight="900">{sciScore}%</text>
              <text x="60" y="72" textAnchor="middle" fill="#94a3b8" fontSize="10" fontWeight="700">SEGURIDAD</text>
            </svg>
          </div>
          <div className={styles.globalInfo}>
            <div className={styles.globalLevel} style={{ color: levelColor }}>
              <Award size={20} /> {levelText}
            </div>
            <h2 className={styles.globalTitle}>Índice de Seguridad y Cumplimiento (SCI)</h2>
            <p className={styles.globalSub}>
              Calculado automáticamente desde {controls.length} controles registrados en {frameworks.length} frameworks normativos.
            </p>
          </div>
        </div>
        <div className={styles.globalRight}>
          {[
            { label: 'Riesgos Críticos', val: criticalRisks.length, color: criticalRisks.length > 0 ? '#ef4444' : '#10b981', icon: <ShieldAlert size={14} /> },
            { label: 'Incidentes Abiertos', val: openIncidents.length, color: openIncidents.length > 0 ? '#ef4444' : '#10b981', icon: <Zap size={14} /> },
            { label: 'Accesos de Riesgo', val: highAccessCount, color: highAccessCount > 0 ? '#f97316' : '#10b981', icon: <UserCheck size={14} /> },
            { label: 'Controles Activos', val: controls.length, color: '#6366f1', icon: <CheckCircle size={14} /> },
            { label: 'SCI Score', val: sciScore + '%', color: levelColor, icon: <Shield size={14} /> },
          ].map((k, i) => (
            <div key={i} className={styles.miniPill} onClick={() => setSelectedKPI(k)}>
              {k.icon}
              <span>{k.label}</span>
              <strong style={{ color: k.color }}>{k.val}</strong>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Tabs */}
      <div className={styles.tabs}>
        {[
          { id: 'riesgos', label: 'Riesgos', icon: <ShieldAlert size={16} />, count: risks.filter(r => r.status !== 'Cerrado').length },
          { id: 'incidentes', label: 'Incidentes', icon: <Zap size={16} />, count: openIncidents.length },
          { id: 'cumplimiento', label: 'Cumplimiento', icon: <CheckCircle size={16} /> },
          { id: 'accesos', label: 'Accesos', icon: <UserCheck size={16} />, count: highAccessCount || undefined },
          { id: 'politicas', label: 'Políticas', icon: <FileWarning size={16} />, count: (() => {
            const currentYear = new Date().getFullYear();
            const expired = policies.filter(p => {
              if (p.status === 'Vencida') return true;
              if (p.expiry) {
                const expYear = parseInt(p.expiry, 10);
                if (!isNaN(expYear) && expYear < currentYear) return true;
              }
              return false;
            });
            return expired.length > 0 ? expired.length : undefined;
          })() },
        ].map(tab => (
          <button key={tab.id}
            className={`${styles.tabBtn} ${activeTab === tab.id ? styles.activeTab : ''}`}
            onClick={() => { setActiveTab(tab.id); setSearch(''); }}
          >
            {tab.icon} {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span style={{ background: '#ef4444', color: 'white', borderRadius: '999px', fontSize: '0.65rem', fontWeight: 800, padding: '1px 6px', marginLeft: '4px' }}>{tab.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* Search bar */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', border: '1px solid #e2e8f0', borderRadius: '12px', background: 'white' }}>
          <Search size={16} color="#94a3b8" />
          <input type="text" placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ border: 'none', outline: 'none', width: '100%', fontSize: '0.9rem', color: '#1e293b' }} />
          {search && <button onClick={() => setSearch('')}><X size={14} color="#94a3b8" /></button>}
        </div>
        {activeTab === 'riesgos' && (
          <button onClick={() => setIsRiskModalOpen(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '12px', background: 'linear-gradient(135deg, #ef4444, #6366f1)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 700 }}>
            <Plus size={16} /> Nuevo Riesgo
          </button>
        )}
        {activeTab === 'incidentes' && (
          <button onClick={() => setIsIncidentModalOpen(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '12px', background: 'linear-gradient(135deg, #f97316, #ef4444)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 700 }}>
            <Plus size={16} /> Nuevo Incidente
          </button>
        )}
        {activeTab === 'accesos' && (
          <button onClick={() => setIsAccessModalOpen(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '12px', background: 'linear-gradient(135deg, #6366f1, #a855f7)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 700 }}>
            <Plus size={16} /> Registrar Acceso
          </button>
        )}
        {activeTab === 'cumplimiento' && (
          <div style={{ display: 'flex', gap: '10px' }}>
            {controls.length === 0 && (
              <button onClick={handleLoadStandardControls}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '12px', background: '#ecfdf5', color: '#10b981', border: '1px solid #a7f3d0', cursor: 'pointer', fontWeight: 700 }}>
                Cargar Controles Estándar
              </button>
            )}
            <button onClick={() => setIsFrameworkModalOpen(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '12px', background: 'white', color: '#6366f1', border: '1px solid #e2e8f0', cursor: 'pointer', fontWeight: 700 }}>
              <Plus size={16} /> Nuevo Framework
            </button>
            <button onClick={() => setIsControlModalOpen(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '12px', background: 'linear-gradient(135deg, #10b981, #6366f1)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 700 }}>
              <Plus size={16} /> Nuevo Control
            </button>
          </div>
        )}
      </div>

      <div className={styles.mainGrid}>
        {/* ── Left Column ── */}
        <div className={styles.leftColumn}>

          {/* ── RIESGOS ── */}
          {activeTab === 'riesgos' && (
            <>
              <div className={styles.heatmapCard}>
                <div className={styles.cardTitle}><Activity color="#4f46e5" /><h3>Mapa de Calor de Riesgos</h3></div>
                <div className={styles.heatmapContainer}>
                  <div className={styles.heatmapGrid}>
                    {[['Alto','Alta','critical'],['Medio','Alta','high'],['Bajo','Alta','medium'],
                      ['Alto','Media','high'],['Medio','Media','medium'],['Bajo','Media','low'],
                      ['Alto','Baja','medium'],['Medio','Baja','low'],['Bajo','Baja','low']].map(([imp,prob,cls],i) => (
                      <div key={i} className={`${styles.heatmapCell} ${(styles as any)[cls]}`} title={`${imp}/${prob}`}>
                        {getHeatCell(imp,prob) || ''}
                        {imp === 'Alto' && prob === 'Alta' && <span className={styles.cellLabel}>Crítico</span>}
                      </div>
                    ))}
                  </div>
                  <div className={styles.heatmapLabels}>
                    <span>Impacto →</span><span>Probabilidad ↑</span>
                  </div>
                </div>
              </div>

              {loading ? <p style={{ color: '#94a3b8', padding: '20px' }}>Cargando riesgos...</p> : (
                <div className={styles.riskTable}>
                  <div className={styles.tableHeader}>
                    <span>ID</span><span>Nombre</span><span>Activo</span>
                    <span>Severidad</span><span>Estado</span><span></span>
                  </div>
                  {filteredRisks.length === 0 ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                      <ShieldCheck size={40} style={{ marginBottom: '12px', opacity: 0.3 }} />
                      <p>No hay riesgos registrados. Crea el primero.</p>
                    </div>
                  ) : filteredRisks.map(risk => (
                    <div key={risk.id} className={styles.riskRow}>
                      <span className={styles.riskId}>{risk.code}</span>
                      <span className={styles.riskName}>{risk.name}</span>
                      <div className={styles.riskAsset}>
                        <Database size={12} color="#94a3b8" /> {risk.asset || '—'}
                      </div>
                      <SevBadge value={risk.severity} map={SEV_COLOR} />
                      <SevBadge value={risk.status} map={STATUS_COLOR} />
                      <button className={styles.viewBtn} onClick={() => setSelectedRisk(risk)}>Ver</button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* ── INCIDENTES ── */}
          {activeTab === 'incidentes' && (
            <div className={styles.assetList}>
              {loading ? <p style={{ color: '#94a3b8', padding: '20px' }}>Cargando...</p> :
               filteredIncidents.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                  <CheckCircle size={40} style={{ marginBottom: '12px', opacity: 0.3 }} />
                  <p>Sin incidentes activos. ¡Todo en orden!</p>
                </div>
              ) : filteredIncidents.map((inc, i) => (
                <motion.div key={inc.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                  style={{ background: 'white', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                    <div style={{ width: 44, height: 44, borderRadius: '12px', background: SEV_COLOR[inc.severity]?.bg || '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <AlertOctagon size={20} color={SEV_COLOR[inc.severity]?.text || '#64748b'} />
                    </div>
                    <div>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.75rem', color: '#94a3b8' }}>{inc.code}</span>
                        <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>{inc.type}</h4>
                        <SevBadge value={inc.severity} map={SEV_COLOR} />
                      </div>
                      <p style={{ margin: '0 0 8px', fontSize: '0.9rem', color: '#64748b' }}>{inc.description}</p>
                      <div style={{ display: 'flex', gap: '16px', fontSize: '0.75rem', color: '#94a3b8' }}>
                        <span><Clock size={11} style={{ marginRight: 3 }} />{new Date(inc.created_at).toLocaleDateString('es')}</span>
                        {inc.assigned_to && <span>Asignado: <strong>{inc.assigned_to}</strong></span>}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
                    <SevBadge value={inc.status} map={STATUS_COLOR} />
                    <select value={inc.status} onChange={e => handleUpdateIncidentStatus(inc.id, e.target.value)}
                      style={{ fontSize: '0.75rem', padding: '4px 8px', borderRadius: '8px', border: '1px solid #e2e8f0', cursor: 'pointer', color: '#475569' }}>
                      <option>Investigando</option><option>Bloqueado</option><option>Mitigado</option><option>Cerrado</option>
                    </select>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* ── CUMPLIMIENTO ── */}
          {activeTab === 'cumplimiento' && (
            <div>
              {frameworks.map(fw => {
                const fwControls = controls.filter(c => c.framework === fw);
                return (
                  <div key={fw} style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', marginBottom: '16px', overflow: 'hidden' }}>
                    <div style={{ padding: '16px 20px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>{fw}</h3>
                      <div style={{ display: 'flex', gap: '8px', fontSize: '0.75rem' }}>
                        <span style={{ color: '#10b981', fontWeight: 700 }}>{fwControls.filter(c => c.status === 'OK').length} OK</span>
                        <span style={{ color: '#f59e0b' }}>{fwControls.filter(c => c.status === 'Parcial').length} Parcial</span>
                        <span style={{ color: '#ef4444' }}>{fwControls.filter(c => c.status === 'Falla').length} Falla</span>
                      </div>
                    </div>
                    {fwControls.length === 0 ? (
                      <p style={{ padding: '20px', color: '#94a3b8', fontSize: '0.9rem' }}>Sin controles registrados para este framework.</p>
                    ) : (
                      <div className={styles.riskTable} style={{ margin: 0, border: 'none' }}>
                        <div className={styles.tableHeader} style={{ gridTemplateColumns: '120px 1fr 100px 100px 120px' }}>
                          <span>Control ID</span><span>Nombre</span><span>Estado</span><span>Última Eval.</span><span>Evidencia</span>
                        </div>
                        {fwControls.map(ctrl => (
                          <div key={ctrl.id} className={styles.riskRow} style={{ gridTemplateColumns: '120px 1fr 100px 100px 120px' }}>
                            <span className={styles.riskId}>{ctrl.control_id || '—'}</span>
                            <span className={styles.riskName}>
                              {ctrl.name}
                              {ctrl.policy_id && (
                                <span style={{
                                  display: 'inline-block',
                                  fontSize: '0.7rem',
                                  background: '#eef2ff',
                                  color: '#6366f1',
                                  padding: '2px 8px',
                                  borderRadius: '6px',
                                  marginLeft: '8px',
                                  fontWeight: 600
                                }}>
                                  {policies.find(p => p.id === ctrl.policy_id)?.title || 'Política Asociada'}
                                </span>
                              )}
                            </span>
                            <select value={ctrl.status} onChange={e => handleUpdateControlStatus(ctrl.id, e.target.value)}
                              style={{ fontSize: '0.75rem', padding: '4px 8px', borderRadius: '8px', border: '1px solid #e2e8f0', cursor: 'pointer',
                                color: ctrl.status === 'OK' ? '#10b981' : ctrl.status === 'Parcial' ? '#f59e0b' : '#ef4444', fontWeight: 700 }}>
                              <option>OK</option><option>Parcial</option><option>Falla</option>
                            </select>
                            <span style={{ fontSize: '0.82rem', color: '#64748b' }}>{ctrl.last_evaluated || '—'}</span>
                            <span style={{ fontSize: '0.8rem', color: '#4f46e5', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                              {ctrl.evidence ? <><ExternalLink size={11} />{ctrl.evidence}</> : '—'}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
              <div style={{ padding: '16px', background: '#eef2ff', borderRadius: '12px', border: '1px solid #c7d2fe', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <Info size={18} color="#6366f1" style={{ flexShrink: 0, marginTop: 2 }} />
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#4338ca', lineHeight: 1.6 }}>
                  El <strong>SCI</strong> se calcula automáticamente: cada control <em>OK</em> = 100%, <em>Parcial</em> = 50%, <em>Falla</em> = 0%.
                  El porcentaje por framework es el promedio ponderado de sus controles.
                </p>
              </div>
            </div>
          )}

          {/* ── ACCESOS ── */}
          {activeTab === 'accesos' && (
            <div>
              {loading ? <p style={{ color: '#94a3b8', padding: '20px' }}>Cargando...</p> :
               filteredAccess.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                  <UserCheck size={40} style={{ marginBottom: '12px', opacity: 0.3 }} />
                  <p>No hay revisiones de acceso registradas.</p>
                </div>
              ) : (
                <div className={styles.riskTable}>
                  <div className={styles.tableHeader} style={{ gridTemplateColumns: '1fr 120px 1fr 80px 100px 100px 100px' }}>
                    <span>Usuario</span><span>Rol</span><span>Activo / Sistema</span>
                    <span>Nivel</span><span>Actividad</span><span>Riesgo</span><span>Acción</span>
                  </div>
                  {filteredAccess.map(acc => (
                    <div key={acc.id} className={styles.riskRow} style={{ gridTemplateColumns: '1fr 120px 1fr 80px 100px 100px 100px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700, color: '#64748b', flexShrink: 0 }}>
                          {acc.user_name?.[0]?.toUpperCase() || '?'}
                        </div>
                        <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{acc.user_name}</span>
                      </div>
                      <span style={{ fontSize: '0.82rem', color: '#64748b' }}>{acc.role || '—'}</span>
                      <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>{acc.asset}</span>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: acc.access_level === 'Admin' ? '#ef4444' : '#64748b' }}>{acc.access_level}</span>
                      <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{acc.last_activity}</span>
                      <SevBadge value={acc.risk_level} map={SEV_COLOR} />
                      {acc.status === 'Activo' ? (
                        <button onClick={() => handleRevokeAccess(acc.id)}
                          style={{ fontSize: '0.75rem', padding: '5px 10px', borderRadius: '8px', background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca', cursor: 'pointer', fontWeight: 700 }}>
                          Revocar
                        </button>
                      ) : (
                        <SevBadge value={acc.status} map={STATUS_COLOR} />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── POLÍTICAS ── */}
          {activeTab === 'politicas' && <PoliciesTab tenantId={currentTenant?.id} />}
        </div>

        {/* ── Right Column ── */}
        <div className={styles.rightColumn}>
          {/* Cumplimiento por framework */}
          <div className={styles.sideCard}>
            <div className={styles.cardTitle}><ShieldCheck color="#10b981" /><h3>Cumplimiento por Framework</h3></div>
            <div className={styles.complianceList}>
              {frameworkScores.map((f, i) => (
                <div key={i} className={styles.compItem}>
                  <div className={styles.compHeader}>
                    <span className={styles.compName}>{f.name}</span>
                    <span className={styles.compPct}>{f.pct}%</span>
                  </div>
                  <div className={styles.progressBar}>
                    <motion.div className={styles.progressFill}
                      initial={{ width: 0 }} animate={{ width: `${f.pct}%` }}
                      style={{ background: f.color }} />
                  </div>
                  <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                    {controls.filter(c => c.framework === f.name).length} controles registrados
                  </span>
                </div>
              ))}
              {controls.length === 0 && (
                <p style={{ color: '#94a3b8', fontSize: '0.85rem', textAlign: 'center', padding: '16px 0' }}>
                  Ve al tab Cumplimiento para registrar controles.
                </p>
              )}
            </div>
          </div>

          {/* Resumen de estado */}
          <div className={styles.sideCard} style={{ marginTop: '20px' }}>
            <div className={styles.cardTitle}><Activity color="#6366f1" /><h3>Resumen de Estado</h3></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
              {[
                { label: 'Riesgos Abiertos', val: risks.filter(r => r.status === 'Abierto').length, color: '#ef4444' },
                { label: 'Riesgos Mitigando', val: risks.filter(r => r.status === 'Mitigando').length, color: '#3b82f6' },
                { label: 'Riesgos Cerrados', val: risks.filter(r => r.status === 'Cerrado').length, color: '#10b981' },
                { label: 'Incidentes Activos', val: openIncidents.length, color: '#ef4444' },
                { label: 'Accesos de Riesgo Alto', val: highAccessCount, color: '#f97316' },
              ].map((s, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: '#f8fafc', borderRadius: '10px' }}>
                  <span style={{ fontSize: '0.85rem', color: '#475569', fontWeight: 500 }}>{s.label}</span>
                  <strong style={{ color: s.color, fontSize: '1.1rem' }}>{s.val}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════ MODALS ══════════════════ */}

      {/* KPI Explainer */}
      <AnimatePresence>
        {selectedKPI && (
          <div className={styles.modalOverlay} onClick={(e) => { if (e.target === e.currentTarget) setSelectedKPI(null); }}>
            <motion.div className={styles.modalContent} style={{ maxWidth: '440px' }}
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              onClick={e => e.stopPropagation()}>
              <div className={styles.modalHeader} style={{ background: selectedKPI.color || '#6366f1', color: 'white' }}>
                <h3 style={{ margin: 0, color: 'white' }}>{selectedKPI.label}</h3>
                <button onClick={() => setSelectedKPI(null)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '8px', padding: '6px', cursor: 'pointer', color: 'white' }}><X size={18} /></button>
              </div>
              <div className={styles.modalBody} style={{ padding: '28px' }}>
                <p style={{ fontSize: '2.5rem', fontWeight: 900, color: selectedKPI.color, margin: '0 0 12px' }}>{selectedKPI.val}</p>
                <p style={{ color: '#475569', lineHeight: 1.6 }}>Valor calculado en tiempo real desde los datos registrados en este módulo.</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Risk Detail */}
      <AnimatePresence>
        {selectedRisk && (
          <div className={styles.modalOverlay} onClick={(e) => { if (e.target === e.currentTarget) setSelectedRisk(null); }}>
            <motion.div className={styles.modalContent} style={{ maxWidth: '600px' }}
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              onClick={e => e.stopPropagation()}>
              <div className={styles.modalHeader} style={{ background: 'linear-gradient(135deg, #ef4444, #6366f1)' }}>
                <div>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'rgba(255,255,255,0.8)', fontFamily: 'ui-monospace, monospace' }}>{selectedRisk.code}</span>
                  <h2 style={{ margin: '8px 0 12px', fontSize: '1.6rem', color: 'white', fontWeight: 800 }}>{selectedRisk.name}</h2>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <SevBadge value={selectedRisk.severity} map={{ ...SEV_COLOR, [selectedRisk.severity]: { bg: 'rgba(255,255,255,0.2)', text: 'white' } }} />
                    <SevBadge value={selectedRisk.status} map={{ ...STATUS_COLOR, [selectedRisk.status]: { bg: 'rgba(255,255,255,0.2)', text: 'white' } }} />
                  </div>
                </div>
                <button onClick={() => setSelectedRisk(null)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '10px', padding: '8px', cursor: 'pointer', color: 'white' }}><X size={20} /></button>
              </div>
              <div className={styles.modalBody} style={{ padding: '28px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div><label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px', color: '#64748b' }}>Nombre del Riesgo *</label>
                    <input value={selectedRisk.name} onChange={e => setSelectedRisk({ ...selectedRisk, name: e.target.value })}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.9rem' }} /></div>
                  <div><label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px', color: '#64748b' }}>Activo Afectado</label>
                    <input value={selectedRisk.asset} onChange={e => setSelectedRisk({ ...selectedRisk, asset: e.target.value })}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.9rem' }} /></div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  {[
                    { label: 'Severidad', key: 'severity', opts: ['Crítico','Alto','Medio','Bajo'] },
                    { label: 'Impacto', key: 'impact', opts: ['Alto','Medio','Bajo'] },
                    { label: 'Probabilidad', key: 'probability', opts: ['Alta','Media','Baja'] },
                  ].map(f => (
                    <div key={f.key}><label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px', color: '#64748b' }}>{f.label}</label>
                      <select value={(selectedRisk as any)[f.key]} onChange={e => setSelectedRisk({ ...selectedRisk, [f.key]: e.target.value })}
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.9rem' }}>
                        {f.opts.map(o => <option key={o}>{o}</option>)}
                      </select></div>
                  ))}
                </div>
                <div style={{ marginBottom: '16px' }}><label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px', color: '#64748b' }}>Responsable</label>
                  <select value={selectedRisk.owner} onChange={e => setSelectedRisk({ ...selectedRisk, owner: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.9rem' }}>
                    <option value="">Seleccionar responsable...</option>
                    {tenantUsers.map(u => <option key={u.id} value={u.name}>{u.name}</option>)}
                  </select></div>
                <div style={{ marginBottom: '16px' }}><label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px', color: '#64748b' }}>Descripción</label>
                  <textarea value={selectedRisk.description} onChange={e => setSelectedRisk({ ...selectedRisk, description: e.target.value })} rows={2}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.9rem', resize: 'vertical' }} /></div>
                <div style={{ marginBottom: '24px' }}><label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px', color: '#64748b' }}>Plan de Mitigación</label>
                  <textarea value={selectedRisk.action_plan} onChange={e => setSelectedRisk({ ...selectedRisk, action_plan: e.target.value })} rows={2}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.9rem', resize: 'vertical' }} /></div>
                
                <div style={{ display: 'flex', gap: '10px', borderTop: '1px solid #e2e8f0', paddingTop: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b' }}>Cambiar estado:</label>
                  {['Abierto', 'Mitigando', 'En Revisión', 'Cerrado'].map(s => (
                    <button key={s} onClick={() => handleUpdateRiskStatus(selectedRisk.id, s)}
                      style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', background: selectedRisk.status === s ? '#4f46e5' : 'white',
                        color: selectedRisk.status === s ? 'white' : '#475569', cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem', transition: 'all 0.2s',
                        boxShadow: selectedRisk.status === s ? '0 2px 4px rgba(79, 70, 229, 0.2)' : 'none' }}>
                      {s}
                    </button>
                  ))}
                  
                  <div style={{ marginLeft: 'auto', display: 'flex', gap: '10px' }}>
                    <button onClick={() => handleDeleteRisk(selectedRisk.id)}
                      style={{ padding: '8px 16px', borderRadius: '8px', background: '#fef2f2', border: '1px solid #fecaca', color: '#ef4444', cursor: 'pointer', fontWeight: 700, fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s' }}>
                      <Trash2 size={13} /> Eliminar
                    </button>
                    <button onClick={handleSaveRiskEdit}
                      style={{ padding: '8px 16px', borderRadius: '8px', background: 'linear-gradient(135deg, #ef4444, #6366f1)', border: 'none', color: 'white', cursor: 'pointer', fontWeight: 700, fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s' }}>
                      <Save size={13} /> Guardar
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* New Risk Modal */}
      <AnimatePresence>
        {isRiskModalOpen && (
          <div className={styles.modalOverlay} onClick={(e) => { if (e.target === e.currentTarget) setIsRiskModalOpen(false); }}>
            <motion.div className={styles.modalContent} style={{ maxWidth: '600px' }}
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              onClick={e => e.stopPropagation()}>
              <div className={styles.modalHeader} style={{ background: 'linear-gradient(135deg, #ef4444, #6366f1)' }}>
                <h2 style={{ margin: 0, color: 'white' }}>Registrar Nuevo Riesgo</h2>
                <button onClick={() => setIsRiskModalOpen(false)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '10px', padding: '8px', cursor: 'pointer', color: 'white' }}><X size={20} /></button>
              </div>
              <div className={styles.modalBody} style={{ padding: '28px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div><label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px', color: '#64748b' }}>Nombre del Riesgo *</label>
                    <input value={newRisk.name} onChange={e => setNewRisk({ ...newRisk, name: e.target.value })} placeholder="Ej: Exposición PII en producción"
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.9rem' }} /></div>
                  <div><label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px', color: '#64748b' }}>Activo Afectado</label>
                    <input value={newRisk.asset} onChange={e => setNewRisk({ ...newRisk, asset: e.target.value })} placeholder="Ej: DB Clientes"
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.9rem' }} /></div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  {[
                    { label: 'Severidad', key: 'severity', opts: ['Crítico','Alto','Medio','Bajo'] },
                    { label: 'Impacto', key: 'impact', opts: ['Alto','Medio','Bajo'] },
                    { label: 'Probabilidad', key: 'probability', opts: ['Alta','Media','Baja'] },
                  ].map(f => (
                    <div key={f.key}><label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px', color: '#64748b' }}>{f.label}</label>
                      <select value={(newRisk as any)[f.key]} onChange={e => setNewRisk({ ...newRisk, [f.key]: e.target.value })}
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.9rem' }}>
                        {f.opts.map(o => <option key={o}>{o}</option>)}
                      </select></div>
                  ))}
                </div>
                <div style={{ marginBottom: '16px' }}><label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px', color: '#64748b' }}>Responsable</label>
                  <select value={newRisk.owner} onChange={e => setNewRisk({ ...newRisk, owner: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.9rem' }}>
                    <option value="">Seleccionar responsable...</option>
                    {tenantUsers.map(u => <option key={u.id} value={u.name}>{u.name}</option>)}
                  </select></div>
                <div style={{ marginBottom: '16px' }}><label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px', color: '#64748b' }}>Descripción</label>
                  <textarea value={newRisk.description} onChange={e => setNewRisk({ ...newRisk, description: e.target.value })} rows={2} placeholder="Describe el riesgo..."
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.9rem', resize: 'vertical' }} /></div>
                <div style={{ marginBottom: '24px' }}><label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px', color: '#64748b' }}>Plan de Mitigación</label>
                  <textarea value={newRisk.action_plan} onChange={e => setNewRisk({ ...newRisk, action_plan: e.target.value })} rows={2} placeholder="Acciones a tomar..."
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.9rem', resize: 'vertical' }} /></div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button onClick={() => setIsRiskModalOpen(false)} style={{ padding: '10px 20px', borderRadius: '10px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', fontWeight: 600 }}>Cancelar</button>
                  <button onClick={handleAddRisk} style={{ padding: '10px 24px', borderRadius: '10px', background: 'linear-gradient(135deg, #ef4444, #6366f1)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Save size={15} /> Guardar Riesgo
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* New Incident Modal */}
      <AnimatePresence>
        {isIncidentModalOpen && (
          <div className={styles.modalOverlay} onClick={(e) => { if (e.target === e.currentTarget) setIsIncidentModalOpen(false); }}>
            <motion.div className={styles.modalContent} style={{ maxWidth: '520px' }}
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              onClick={e => e.stopPropagation()}>
              <div className={styles.modalHeader} style={{ background: 'linear-gradient(135deg, #f97316, #ef4444)' }}>
                <h2 style={{ margin: 0, color: 'white' }}>Reportar Incidente</h2>
                <button onClick={() => setIsIncidentModalOpen(false)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '10px', padding: '8px', cursor: 'pointer', color: 'white' }}><X size={20} /></button>
              </div>
              <div className={styles.modalBody} style={{ padding: '28px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div><label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px', color: '#64748b' }}>Tipo de Incidente *</label>
                    <select value={newIncident.type} onChange={e => setNewIncident({ ...newIncident, type: e.target.value })}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.9rem' }}>
                      <option value="">Seleccionar...</option>
                      {['Fuga de Datos','Acceso Indebido','Malware Detectado','Anomalía de Comportamiento','Phishing','Denegación de Servicio','Otros'].map(o => <option key={o}>{o}</option>)}
                    </select></div>
                  <div><label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px', color: '#64748b' }}>Severidad</label>
                    <select value={newIncident.severity} onChange={e => setNewIncident({ ...newIncident, severity: e.target.value })}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.9rem' }}>
                      {['Crítico','Alto','Medio','Bajo'].map(o => <option key={o}>{o}</option>)}
                    </select></div>
                </div>
                <div style={{ marginBottom: '16px' }}><label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px', color: '#64748b' }}>Descripción</label>
                  <textarea value={newIncident.description} onChange={e => setNewIncident({ ...newIncident, description: e.target.value })} rows={3}
                    placeholder="Describe qué ocurrió..."
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.9rem', resize: 'vertical' }} /></div>
                <div style={{ marginBottom: '24px' }}><label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px', color: '#64748b' }}>Asignado a</label>
                  <select value={newIncident.assigned_to} onChange={e => setNewIncident({ ...newIncident, assigned_to: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.9rem' }}>
                    <option value="">Sin asignar</option>
                    {tenantUsers.map(u => <option key={u.id} value={u.name}>{u.name}</option>)}
                  </select></div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button onClick={() => setIsIncidentModalOpen(false)} style={{ padding: '10px 20px', borderRadius: '10px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', fontWeight: 600 }}>Cancelar</button>
                  <button onClick={handleAddIncident} style={{ padding: '10px 24px', borderRadius: '10px', background: 'linear-gradient(135deg, #f97316, #ef4444)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AlertTriangle size={15} /> Reportar
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* New Access Modal */}
      <AnimatePresence>
        {isAccessModalOpen && (
          <div className={styles.modalOverlay} onClick={(e) => { if (e.target === e.currentTarget) setIsAccessModalOpen(false); }}>
            <motion.div className={styles.modalContent} style={{ maxWidth: '520px' }}
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              onClick={e => e.stopPropagation()}>
              <div className={styles.modalHeader} style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)' }}>
                <h2 style={{ margin: 0, color: 'white' }}>Registrar Revisión de Acceso</h2>
                <button onClick={() => setIsAccessModalOpen(false)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '10px', padding: '8px', cursor: 'pointer', color: 'white' }}><X size={20} /></button>
              </div>
              <div className={styles.modalBody} style={{ padding: '28px' }}>
                <div style={{ marginBottom: '16px' }}><label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px', color: '#64748b' }}>Usuario *</label>
                  <select value={newAccess.user_id} onChange={e => setNewAccess({ ...newAccess, user_id: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.9rem' }}>
                    <option value="">Selecciona un usuario...</option>
                    {tenantUsers.map(u => <option key={u.id} value={u.id}>{u.name} — {u.email}</option>)}
                  </select></div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div><label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px', color: '#64748b' }}>Activo / Sistema *</label>
                    <input value={newAccess.asset} onChange={e => setNewAccess({ ...newAccess, asset: e.target.value })} placeholder="Ej: Oracle DB Finanzas"
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.9rem' }} /></div>
                  <div><label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px', color: '#64748b' }}>Nivel de Acceso</label>
                    <select value={newAccess.access_level} onChange={e => setNewAccess({ ...newAccess, access_level: e.target.value })}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.9rem' }}>
                      {['Admin','Editor','Viewer','Solo Lectura'].map(o => <option key={o}>{o}</option>)}
                    </select></div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div><label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px', color: '#64748b' }}>Última Actividad</label>
                    <input value={newAccess.last_activity} onChange={e => setNewAccess({ ...newAccess, last_activity: e.target.value })} placeholder="Ej: Hace 30 días"
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.9rem' }} /></div>
                  <div><label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px', color: '#64748b' }}>Nivel de Riesgo</label>
                    <select value={newAccess.risk_level} onChange={e => setNewAccess({ ...newAccess, risk_level: e.target.value })}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.9rem' }}>
                      {['Alto','Medio','Bajo'].map(o => <option key={o}>{o}</option>)}
                    </select></div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button onClick={() => setIsAccessModalOpen(false)} style={{ padding: '10px 20px', borderRadius: '10px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', fontWeight: 600 }}>Cancelar</button>
                  <button onClick={handleAddAccess} style={{ padding: '10px 24px', borderRadius: '10px', background: 'linear-gradient(135deg, #6366f1, #a855f7)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Save size={15} /> Guardar
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* New Control Modal */}
      <AnimatePresence>
        {isControlModalOpen && (
          <div className={styles.modalOverlay} onClick={(e) => { if (e.target === e.currentTarget) setIsControlModalOpen(false); }}>
            <motion.div className={styles.modalContent} style={{ maxWidth: '520px' }}
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              onClick={e => e.stopPropagation()}>
              <div className={styles.modalHeader} style={{ background: 'linear-gradient(135deg, #10b981, #6366f1)' }}>
                <h2 style={{ margin: 0, color: 'white' }}>Registrar Nuevo Control</h2>
                <button onClick={() => setIsControlModalOpen(false)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '10px', padding: '8px', cursor: 'pointer', color: 'white' }}><X size={20} /></button>
              </div>
              <div className={styles.modalBody} style={{ padding: '28px' }}>
                <div style={{
                  marginBottom: '20px',
                  padding: '12px 16px',
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(99, 102, 241, 0.08) 100%)',
                  borderRadius: '12px',
                  border: '1px dashed rgba(99, 102, 241, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Cpu size={18} style={{ color: '#6366f1' }} className={isAiGenerating ? styles.spinnerSmall : ''} />
                    <span style={{ fontSize: '0.82rem', color: '#475569', fontWeight: 600 }}>
                      {isAiGenerating ? 'Generando propuesta...' : '¿Necesitas ayuda para diligenciar los campos?'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={simulateAiControlGeneration}
                    disabled={isAiGenerating}
                    style={{
                      background: 'linear-gradient(135deg, #10b981 0%, #6366f1 100%)',
                      color: 'white',
                      border: 'none',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: '0 2px 4px rgba(99, 102, 241, 0.2)',
                      transition: 'opacity 0.2s',
                      opacity: isAiGenerating ? 0.7 : 1
                    }}
                  >
                    {isAiGenerating ? 'Generando...' : 'Asistente IA'}
                  </button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div><label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px', color: '#64748b' }}>Control ID *</label>
                    <input value={newControl.control_id} onChange={e => setNewControl({ ...newControl, control_id: e.target.value })} placeholder="Ej: A.8.2.1"
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.9rem' }} /></div>
                  <div><label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px', color: '#64748b' }}>Normativa / Framework *</label>
                    <select value={newControl.framework} onChange={e => setNewControl({ ...newControl, framework: e.target.value })}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.9rem' }}>
                      {frameworks.map(fw => <option key={fw} value={fw}>{fw}</option>)}
                    </select></div>
                </div>
                <div style={{ marginBottom: '16px' }}><label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px', color: '#64748b' }}>Nombre del Control *</label>
                  <input value={newControl.name} onChange={e => setNewControl({ ...newControl, name: e.target.value })} placeholder="Ej: Clasificación de información"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.9rem' }} /></div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div><label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px', color: '#64748b' }}>Estado Inicial</label>
                    <select value={newControl.status} onChange={e => setNewControl({ ...newControl, status: e.target.value })}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.9rem' }}>
                      <option value="OK">OK (Cumple)</option>
                      <option value="Parcial">Parcial</option>
                      <option value="Falla">Falla (No cumple)</option>
                    </select></div>
                  <div><label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px', color: '#64748b' }}>Evidencia / Enlace</label>
                    <input value={newControl.evidence} onChange={e => setNewControl({ ...newControl, evidence: e.target.value })} placeholder="Ej: Matriz de Roles v2"
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.9rem' }} /></div>
                </div>
                <div style={{ marginBottom: '16px' }}><label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px', color: '#64748b' }}>Notas / Hallazgos</label>
                  <textarea value={newControl.notes} onChange={e => setNewControl({ ...newControl, notes: e.target.value })} rows={2} placeholder="Comentarios adicionales..."
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.9rem', resize: 'vertical' }} /></div>
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px', color: '#64748b' }}>Política / Cumplimiento Asociado</label>
                  <select 
                    value={newControl.policy_id || ''} 
                    onChange={e => setNewControl({ ...newControl, policy_id: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.9rem', background: '#ffffff', color: '#1e293b' }}
                  >
                    <option value="">Ninguna política asociada</option>
                    {policies.map((p, i) => (
                      <option key={i} value={p.id}>{p.title}</option>
                    ))}
                  </select>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button onClick={() => setIsControlModalOpen(false)} style={{ padding: '10px 20px', borderRadius: '10px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', fontWeight: 600 }}>Cancelar</button>
                  <button onClick={handleAddControl} style={{ padding: '10px 24px', borderRadius: '10px', background: 'linear-gradient(135deg, #10b981, #6366f1)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Save size={15} /> Guardar Control
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* New Framework Modal */}
      <AnimatePresence>
        {isFrameworkModalOpen && (
          <div className={styles.modalOverlay} onClick={(e) => { if (e.target === e.currentTarget) setIsFrameworkModalOpen(false); }}>
            <motion.div className={styles.modalContent} style={{ maxWidth: '440px' }}
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              onClick={e => e.stopPropagation()}>
              <div className={styles.modalHeader} style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)' }}>
                <h2 style={{ margin: 0, color: 'white', fontSize: '1.25rem' }}>Nuevo Framework de Cumplimiento</h2>
                <button onClick={() => setIsFrameworkModalOpen(false)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '10px', padding: '8px', cursor: 'pointer', color: 'white' }}><X size={18} /></button>
              </div>
              <div className={styles.modalBody} style={{ padding: '24px' }}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px', color: '#64748b' }}>Nombre del Framework *</label>
                  <input 
                    type="text" 
                    value={newFramework.name} 
                    onChange={e => setNewFramework({ ...newFramework, name: e.target.value })} 
                    placeholder="Ej: PCI-DSS, HIPAA, Ley de Protección"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.9rem', color: '#1e293b' }} 
                  />
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px', color: '#64748b' }}>Código / Sigla</label>
                  <input 
                    type="text" 
                    value={newFramework.code} 
                    onChange={e => setNewFramework({ ...newFramework, code: e.target.value })} 
                    placeholder="Ej: PCI"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.9rem', color: '#1e293b' }} 
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
                  <button onClick={() => setIsFrameworkModalOpen(false)} style={{ padding: '10px 20px', borderRadius: '10px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', fontWeight: 600 }}>Cancelar</button>
                  <button onClick={handleAddFramework} style={{ padding: '10px 24px', borderRadius: '10px', background: 'linear-gradient(135deg, #6366f1, #a855f7)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 700 }}>
                    Crear Framework
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Policies Tab (reads from data_policies) ───────────────────────────────────
function PoliciesTab({ tenantId }: { tenantId?: string }) {
  const [policies, setPolicies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tenantId) return;
    supabase.from('data_policies').select('id, title, status, owner, expiry, framework_origin, type').eq('tenant_id', tenantId).order('expiry')
      .then(({ data }) => { if (data) setPolicies(data); setLoading(false); });
  }, [tenantId]);

  const today = new Date();
  const currentYear = today.getFullYear();
  const isExpired = (expiry: string) => {
    if (!expiry) return false;
    const expYear = parseInt(expiry, 10);
    return !isNaN(expYear) && expYear < currentYear;
  };
  const expiringSoon = (expiry: string) => {
    if (!expiry) return false;
    const expYear = parseInt(expiry, 10);
    return !isNaN(expYear) && expYear === currentYear;
  };

  if (loading) return <p style={{ color: '#94a3b8', padding: '20px' }}>Cargando políticas...</p>;
  if (policies.length === 0) return (
    <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
      <FileWarning size={40} style={{ marginBottom: '12px', opacity: 0.3 }} />
      <p>No hay políticas registradas. Ve al módulo de Políticas para crearlas.</p>
    </div>
  );

  return (
    <div className={styles.riskTable}>
      <div className={styles.tableHeader} style={{ gridTemplateColumns: '1fr 100px 120px 100px 100px' }}>
        <span>Política</span><span>Tipo</span><span>Motivo</span><span>Owner</span><span>Estado</span>
      </div>
      {policies.map(pol => {
        const expired = isExpired(pol.expiry || '2099');
        const soon = expiringSoon(pol.expiry || '2099');
        const statusDisplay = expired ? 'Vencida' : soon ? 'Por Vencer' : pol.status;
        return (
          <div key={pol.id} className={styles.riskRow} style={{ gridTemplateColumns: '1fr 100px 120px 100px 100px' }}>
            <span className={styles.riskName}>{pol.title}</span>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{pol.type || '—'}</span>
            <span style={{ fontSize: '0.78rem', color: '#64748b' }}>{pol.framework_origin || '—'}</span>
            <span style={{ fontSize: '0.82rem' }}>{pol.owner || '—'}</span>
            <SevBadge value={statusDisplay} map={{
              Vigente: { bg: '#f0fdf4', text: '#10b981' },
              Vencida: { bg: '#fef2f2', text: '#ef4444' },
              'Por Vencer': { bg: '#fffbeb', text: '#f59e0b' },
              Borrador: { bg: '#f8fafc', text: '#94a3b8' },
              'En Revisión': { bg: '#eff6ff', text: '#3b82f6' },
            }} />
          </div>
        );
      })}
    </div>
  );
}
