'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  GraduationCap, 
  CheckCircle2, 
  Circle, 
  Award, 
  Briefcase, 
  ArrowRight,
  RefreshCw,
  Database,
  Activity,
  BookOpen
} from 'lucide-react';
import { usePlatform } from '@/contexts/PlatformContext';
import { supabase } from '@/lib/supabase';
import styles from './simulator.module.css';

const SESSIONS = [
  {
    id: 'session_1',
    title: 'Sesión 1: Fundamentos',
    badge: 'Arquitecto de Gobierno',
    icon: Briefcase,
    desc: 'Diagnóstico DAMA, Roles (Owner, Steward, CDO), RACI.',
    checks: [
      { key: 'dama', title: 'Diagnóstico DAMA Inicial', desc: 'Realiza la evaluación de madurez.' },
      { key: 'roles', title: 'Estructura del Equipo Base', desc: 'Asigna Data Owner, Steward, Custodian y CDO.' },
      { key: 'raci', title: 'Matriz RACI Operativa', desc: 'Configura mínimo 5 procesos en la matriz RACI.' }
    ]
  },
  {
    id: 'session_2',
    title: 'Sesión 2: Framework',
    badge: 'Policy Maker',
    icon: BookOpen,
    desc: 'Políticas, Dominios y Estructura de dominio.',
    checks: [
      { key: 'policies', title: 'Políticas de Datos', desc: 'Crea al menos 1 política de gobierno de datos.' },
      { key: 'domains', title: 'Dominios Definidos', desc: 'Crea al menos 1 dominio de datos en el Catálogo.' }
    ]
  },
  {
    id: 'session_3',
    title: 'Sesión 3: Calidad y Metadatos',
    badge: 'Quality Champion',
    icon: Database,
    desc: 'Gestión de activos, diccionario y reglas de calidad.',
    checks: [
      { key: 'metadata', title: 'Diccionario de Datos', desc: 'Documenta al menos 2 activos en el Catálogo.' },
      { key: 'quality', title: 'Reglas de Calidad', desc: 'Configura al menos 1 regla de calidad.' }
    ]
  },
  {
    id: 'session_4',
    title: 'Sesión 4: Operación',
    badge: 'CDO Master',
    icon: Activity,
    desc: 'Flujos de trabajo, incidentes y seguridad continua.',
    checks: [
      { key: 'workflows', title: 'Flujos de Trabajo', desc: 'Genera al menos 1 flujo de trabajo (workflow).' },
      { key: 'security', title: 'Seguridad', desc: 'Registra al menos 1 control o incidente de seguridad.' }
    ]
  }
];

export default function Simulator() {
  const { currentTenant } = usePlatform();
  const [activeTab, setActiveTab] = useState<'participant' | 'admin'>('participant');
  const [activeSession, setActiveSession] = useState<string>('session_1');
  const [hasCertificate, setHasCertificate] = useState(false);
  const [userRole, setUserRole] = useState('');
  
  const [validations, setValidations] = useState<Record<string, any>>({});
  const [isValidating, setIsValidating] = useState(false);
  const [adminData, setAdminData] = useState<any[]>([]);

  useEffect(() => {
    const role = localStorage.getItem('govdata_role') || '';
    setUserRole(role);
  }, []);

  const loadAdminData = async () => {
    try {
      const { data: certs } = await supabase.from('simulator_certificates').select('tenant_id, case_id');
      const { data: tenants } = await supabase.from('tenants').select('id, name');
      
      if (certs && tenants) {
        const stats = tenants.map(t => {
          const tCerts = certs.filter(c => c.tenant_id === t.id).map(c => c.case_id);
          return {
            id: t.id,
            name: t.name,
            progress: Math.round((tCerts.length / 4) * 100),
            badges: tCerts
          };
        });
        setAdminData(stats);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (activeTab === 'admin') {
      loadAdminData();
    }
  }, [activeTab]);

  const checkProgress = useCallback(async () => {
    if (!currentTenant?.id || !activeSession) return;
    setIsValidating(true);
    try {
      // Check if this session is already certified
      const { data: certData } = await supabase
        .from('simulator_certificates')
        .select('id')
        .eq('tenant_id', currentTenant.id)
        .eq('case_id', activeSession)
        .limit(1);

      if (certData && certData.length > 0) {
        setHasCertificate(true);
        if (activeSession === 'session_1') setValidations({ dama: true, roles: true, raci: true, missingRoles: [], missingRaci: 0 });
        if (activeSession === 'session_2') setValidations({ policies: true, domains: true });
        if (activeSession === 'session_3') setValidations({ metadata: true, quality: true });
        if (activeSession === 'session_4') setValidations({ workflows: true, security: true });
        setIsValidating(false);
        return;
      } else {
        setHasCertificate(false);
      }

      let sessionValid = false;
      const v: Record<string, any> = {};

      if (activeSession === 'session_1') {
        const { data: dama } = await supabase.from('maturity_assessments').select('id').eq('tenant_id', currentTenant.id).limit(1);
        v.dama = (dama?.length ?? 0) > 0;

        const { data: members } = await supabase.from('team_members').select('role').eq('tenant_id', currentTenant.id);
        const roleTypes = (members || []).map(m => m.role?.toLowerCase() || '');
        v.roles = roleTypes.includes('data owner') && roleTypes.includes('data steward') && roleTypes.includes('data custodian') && (roleTypes.includes('cdo') || roleTypes.includes('ciso') || roleTypes.includes('auditor'));
        
        const { data: raci } = await supabase.from('team_raci_matrix').select('id').eq('tenant_id', currentTenant.id);
        v.raci = (raci?.length ?? 0) >= 5;

        sessionValid = v.dama && v.roles && v.raci;
      } 
      else if (activeSession === 'session_2') {
        const { data: policies } = await supabase.from('policies').select('id').eq('tenant_id', currentTenant.id).limit(1);
        v.policies = (policies?.length ?? 0) > 0;

        const { data: domains } = await supabase.from('data_domains').select('id').eq('tenant_id', currentTenant.id).limit(1);
        v.domains = (domains?.length ?? 0) > 0;

        sessionValid = v.policies && v.domains;
      }
      else if (activeSession === 'session_3') {
        const { data: assets } = await supabase.from('data_assets').select('id').eq('tenant_id', currentTenant.id).limit(2);
        v.metadata = (assets?.length ?? 0) >= 2;

        const { data: rules } = await supabase.from('data_quality_rules').select('id').eq('tenant_id', currentTenant.id).limit(1);
        v.quality = (rules?.length ?? 0) > 0;

        sessionValid = v.metadata && v.quality;
      }
      else if (activeSession === 'session_4') {
        const { data: wf } = await supabase.from('workflows').select('id').eq('tenant_id', currentTenant.id).limit(1);
        v.workflows = (wf?.length ?? 0) > 0;

        const { data: sec } = await supabase.from('security_controls').select('id').eq('tenant_id', currentTenant.id).limit(1);
        v.security = (sec?.length ?? 0) > 0;

        sessionValid = v.workflows && v.security;
      }

      setValidations(v);

      if (sessionValid) {
        await supabase.from('simulator_certificates').insert([{ tenant_id: currentTenant.id, case_id: activeSession }]);
        setHasCertificate(true);
      }

    } catch (err) {
      console.error(err);
    } finally {
      setIsValidating(false);
    }
  }, [currentTenant?.id, activeSession]);

  const exportCertificate = async () => {
    if (!currentTenant) return;
    
    const { data: cdoData } = await supabase.from('team_members').select('name').eq('tenant_id', currentTenant.id).or('role.ilike.%cdo%,role.ilike.%ciso%,role.ilike.%auditor%').limit(1);
    const signatureName = cdoData && cdoData.length > 0 ? cdoData[0].name : 'CDO Global';

    const userEmail = localStorage.getItem('govdata_user_email');
    let certName = localStorage.getItem('govdata_user_name') || 'Estudiante';
    
    if (userEmail) {
      const { data: userData } = await supabase.from('tenant_users').select('alias, name').eq('tenant_id', currentTenant.id).eq('email', userEmail).single();
      if (userData?.alias) certName = userData.alias;
      else if (userData?.name) certName = userData.name;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const dateStr = new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });
    const sessionObj = SESSIONS.find(s => s.id === activeSession);
    
    const html = `
      <html>
        <head>
          <title>Certificado - ${currentTenant.name}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 40px; background: #f8fafc; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
            .certificate { background: white; padding: 60px; border-radius: 20px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); text-align: center; max-width: 800px; border: 8px solid #4f46e5; position: relative; width: 100%; }
            .certificate::before { content: ''; position: absolute; top: 10px; left: 10px; right: 10px; bottom: 10px; border: 2px solid #e2e8f0; border-radius: 10px; pointer-events: none; }
            h1 { color: #1e293b; font-size: 3rem; margin-bottom: 10px; letter-spacing: 2px; text-transform: uppercase; }
            h2 { color: #4f46e5; font-size: 1.8rem; margin-bottom: 40px; }
            p { color: #64748b; font-size: 1.2rem; line-height: 1.6; margin-bottom: 20px; }
            .tenant-name { font-size: 2.5rem; color: #0f172a; font-weight: bold; margin: 20px 0; border-bottom: 2px solid #4f46e5; display: inline-block; padding-bottom: 10px; }
            .footer { margin-top: 60px; display: flex; justify-content: space-between; align-items: flex-end; color: #94a3b8; }
            .signature { border-top: 2px solid #cbd5e1; padding-top: 10px; font-weight: bold; color: #1e293b; width: 200px; margin-top: 20px; }
            .seal { width: 100px; height: 100px; background: #4f46e5; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 1.2rem; transform: rotate(-15deg); margin: 0 auto; margin-top: 40px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            @media print { body { background: white; padding: 0; align-items: flex-start; } .certificate { box-shadow: none; border: 4px solid #4f46e5; padding: 40px; margin: 0 auto; } }
          </style>
        </head>
        <body>
          <div class="certificate">
            <h1>Insignia Obtenida</h1>
            <h2>${sessionObj?.badge || 'CDO Master'}</h2>
            <p>Se otorga el presente reconocimiento a:</p>
            <div class="tenant-name">${certName}</div>
            <p style="margin-top: 0; color: #4f46e5; font-weight: bold;">Representando a: ${currentTenant.name}</p>
            <p>Por haber completado satisfactoriamente los requerimientos de la sesión:</p>
            <h3 style="color:#1e293b; font-size: 1.5rem;">${sessionObj?.title}</h3>
            <div class="seal">BADGE</div>
            <div class="footer">
              <div style="text-align: left;"><p style="font-size:1rem; margin:0; padding:0;">Fecha de Emisión:</p><strong style="color: #1e293b">${dateStr}</strong></div>
              <div class="signature">Firma: ${signatureName}<br/><span style="font-size: 0.8rem; color: #94a3b8;">Chief Data Officer</span></div>
            </div>
          </div>
          <script>setTimeout(() => { window.print(); }, 500);</script>
        </body>
      </html>
    `;
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  };

  useEffect(() => {
    checkProgress();
  }, [checkProgress]);

  const activeS = SESSIONS.find(s => s.id === activeSession);
  const totalChecks = activeS?.checks.length || 1;
  const completedChecks = activeS?.checks.filter(c => validations[c.key]).length || 0;
  const progressPercent = Math.round((completedChecks / totalChecks) * 100);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1><GraduationCap size={40} color="#4f46e5" /> GovData Academy (CDO Simulator)</h1>
            <p>Aplica tus conocimientos en 4 sesiones prácticas. Gana insignias en cada paso de tu camino.</p>
          </div>
          {(userRole === 'admin' || userRole === 'superadmin') && (
            <div style={{ display: 'flex', gap: '10px', background: '#f1f5f9', padding: '6px', borderRadius: '12px' }}>
              <button 
                onClick={() => setActiveTab('participant')}
                style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 600, background: activeTab === 'participant' ? '#4f46e5' : 'transparent', color: activeTab === 'participant' ? 'white' : '#64748b' }}
              >
                Mi Ruta
              </button>
              <button 
                onClick={() => setActiveTab('admin')}
                style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 600, background: activeTab === 'admin' ? '#4f46e5' : 'transparent', color: activeTab === 'admin' ? 'white' : '#64748b' }}
              >
                Monitoreo Global
              </button>
            </div>
          )}
        </div>
      </header>

      {activeTab === 'participant' && (
        <>
          <div className={styles.casesGrid}>
            {SESSIONS.map(s => {
              const Icon = s.icon;
              const isActive = activeSession === s.id;
              return (
                <div key={s.id} className={`${styles.caseCard} ${isActive ? styles.active : ''}`} onClick={() => setActiveSession(s.id)}>
                  <div className={styles.caseBadge}>{isActive ? 'Sesión Activa' : 'Disponible'}</div>
                  <h3 className={styles.caseTitle}><Icon size={24} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'text-bottom' }} /> {s.title}</h3>
                  <p className={styles.caseDesc} style={{ marginBottom: '10px' }}>{s.desc}</p>
                  <div style={{ display: 'inline-block', background: '#e0e7ff', color: '#4f46e5', padding: '4px 12px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 600 }}>
                    Insignia: {s.badge}
                  </div>
                </div>
              );
            })}
          </div>

          <div className={styles.validationSection}>
            <div className={styles.validationHeader}>
              <h2 className={styles.validationTitle}>Validación de {activeS?.title}</h2>
              <div className={styles.progressCircle}>
                <button onClick={checkProgress} disabled={isValidating} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <RefreshCw size={20} className={isValidating ? 'animate-spin' : ''} />
                  {isValidating ? 'Validando...' : 'Revalidar'}
                </button>
                <span className={styles.progressText}>{progressPercent}% Completado</span>
              </div>
            </div>

            <div className={styles.checkList}>
              {activeS?.checks.map(chk => {
                const isOk = validations[chk.key];
                return (
                  <div key={chk.key} className={`${styles.checkItem} ${isOk ? styles.completed : ''}`}>
                    <div className={`${styles.checkIcon} ${isOk ? styles.completedIcon : styles.pendingIcon}`}>
                      {isOk ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                    </div>
                    <div className={styles.checkContent}>
                      <h4 className={styles.checkTitle}>{chk.title}</h4>
                      <p className={styles.checkDesc}>{chk.desc}</p>
                      <span className={`${styles.checkStatus} ${isOk ? styles.statusCompleted : styles.statusPending}`}>
                        {isOk ? 'Requisito Cumplido' : 'Pendiente de Configuración'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {hasCertificate && (
              <motion.div className={styles.certificateBox} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <Award size={64} style={{ marginBottom: '16px' }} color="#4f46e5" />
                <h2 className={styles.certTitle}>¡Insignia Desbloqueada!</h2>
                <p className={styles.certDesc}>Has completado todos los requisitos de esta sesión. Ahora eres oficialmente un <strong>{activeS?.badge}</strong>.</p>
                <button onClick={exportCertificate} style={{ background: 'white', color: '#4f46e5', padding: '12px 24px', borderRadius: '12px', fontWeight: 800, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', margin: '0 auto' }}>
                  Descargar Insignia PDF <ArrowRight size={18} />
                </button>
              </motion.div>
            )}
          </div>
        </>
      )}

      {activeTab === 'admin' && (
        <div style={{ background: 'white', padding: '30px', borderRadius: '24px', border: '1px solid #e2e8f0', marginTop: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2>Tablero de Monitoreo de Participantes</h2>
            <button onClick={loadAdminData} className={styles.primaryBtn} style={{ padding: '8px 16px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <RefreshCw size={16}/> Actualizar Datos
            </button>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                <th style={{ padding: '16px' }}>Empresa / Participante</th>
                <th style={{ padding: '16px' }}>Progreso Global</th>
                <th style={{ padding: '16px' }}>Sesiones Aprobadas</th>
              </tr>
            </thead>
            <tbody>
              {adminData.map(t => (
                <tr key={t.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '16px', fontWeight: 600 }}>{t.name}</td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '150px', height: '8px', background: '#e2e8f0', borderRadius: '4px' }}>
                        <div style={{ width: \`\${t.progress}%\`, height: '100%', background: t.progress === 100 ? '#10b981' : '#4f46e5', borderRadius: '4px' }}></div>
                      </div>
                      <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#64748b' }}>{t.progress}%</span>
                    </div>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {SESSIONS.map((s, i) => {
                        const hasB = t.badges.includes(s.id);
                        return (
                          <div key={s.id} title={s.badge} style={{ width: '32px', height: '32px', borderRadius: '50%', background: hasB ? '#10b981' : '#f1f5f9', color: hasB ? 'white' : '#cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 'bold' }}>
                            {i + 1}
                          </div>
                        );
                      })}
                    </div>
                  </td>
                </tr>
              ))}
              {adminData.length === 0 && (
                <tr><td colSpan={3} style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>No hay datos de participantes aún.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
