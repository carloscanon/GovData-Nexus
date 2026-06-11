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

const ICON_MAP: Record<string, any> = {
  Briefcase: Briefcase,
  BookOpen: BookOpen,
  Database: Database,
  Activity: Activity
};

export default function Simulator() {
  const { currentTenant } = usePlatform();
  const [activeTab, setActiveTab] = useState<'participant' | 'admin' | 'superadmin'>('participant');
  
  const [modules, setModules] = useState<any[]>([]);
  const [steps, setSteps] = useState<any[]>([]);
  const [activeSession, setActiveSession] = useState<string>('');
  
  const [hasCertificate, setHasCertificate] = useState(false);
  const [userRole, setUserRole] = useState('');
  const [userEmail, setUserEmail] = useState('');
  
  const [validations, setValidations] = useState<Record<string, any>>({});
  const [isValidating, setIsValidating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const [adminData, setAdminData] = useState<any[]>([]);
  const [superAdminData, setSuperAdminData] = useState<any[]>([]);

  useEffect(() => {
    const role = localStorage.getItem('govdata_role') || '';
    setUserRole(role);
    const email = localStorage.getItem('govdata_user_email') || '';
    setUserEmail(email);
  }, []);

  const fetchConfig = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const { data: mData, error: mError } = await supabase.from('simulator_modules').select('*').order('order_index');
      if (mError) throw mError;
      
      const { data: sData, error: sError } = await supabase.from('simulator_steps').select('*');
      if (sError) throw sError;

      if (mData) {
        setModules(mData);
        if (mData.length > 0) setActiveSession(mData[0].id);
      }
      if (sData) setSteps(sData);
    } catch (err: any) {
      console.error("Error fetching simulator config:", err);
      setErrorMsg(err.message || "Error al conectar con la base de datos.");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch Modules & Steps
  useEffect(() => {
    fetchConfig();
  }, []);

  const loadAdminData = async () => {
    try {
      if (activeTab === 'superadmin') {
        // Superadmin: view average progress across ALL tenants
        const { data: allProgress } = await supabase.from('simulator_user_step_progress')
          .select('tenant_id, step_key, user_email')
          .eq('completed', true);
        const { data: tenants } = await supabase.from('tenants').select('id, name');
        
        if (tenants && allProgress) {
          const stats = tenants.map(t => {
            const tenantProgs = allProgress.filter(p => p.tenant_id === t.id);
            // Count unique users in tenant
            const users = new Set(tenantProgs.map(p => p.user_email));
            
            // Expected completions per user = steps.length (9 steps total)
            const totalStepsCount = steps.length || 9;
            const totalPossible = users.size > 0 ? users.size * totalStepsCount : totalStepsCount;
            const progress = Math.round((tenantProgs.length / totalPossible) * 100);
            
            return {
              id: t.id,
              name: t.name,
              usersCount: users.size,
              progress: isNaN(progress) ? 0 : progress,
              rawProgress: tenantProgs
            };
          });
          setSuperAdminData(stats);
        }
      } 
      else if (activeTab === 'admin' && currentTenant) {
        // Admin: view breakdown per user inside current tenant
        const { data: progress } = await supabase.from('simulator_user_step_progress')
          .select('user_email, step_key')
          .eq('tenant_id', currentTenant.id)
          .eq('completed', true);
          
        if (progress) {
          // Group by user
          const usersMap: Record<string, string[]> = {};
          progress.forEach(p => {
            if (!usersMap[p.user_email]) usersMap[p.user_email] = [];
            usersMap[p.user_email].push(p.step_key);
          });
          
          const stats = Object.keys(usersMap).map(email => {
            const totalStepsCount = steps.length || 9;
            const progressPct = Math.round((usersMap[email].length / totalStepsCount) * 100);
            
            // Calculate badges dynamically based on completed steps of each module
            const badges = modules.filter(m => {
              const modSteps = steps.filter(s => s.module_id === m.id);
              if (modSteps.length === 0) return false;
              return modSteps.every(s => usersMap[email].includes(s.key_name));
            }).map(m => m.id);

            return {
              email,
              progress: isNaN(progressPct) ? 0 : progressPct,
              badges
            };
          });
          setAdminData(stats);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (activeTab === 'admin' || activeTab === 'superadmin') {
      loadAdminData();
    }
  }, [activeTab, currentTenant]);

  const validateCondition = (records: any[], condition: any) => {
    if (!condition || Object.keys(condition).length === 0) return records.length;
    
    let validCount = 0;
    records.forEach(r => {
      let isOk = true;
      
      // Roles logic
      if (condition.requires_roles) {
        // Handled specially below since it checks aggregated rows, not individual rows
      }
      
      // Fields exist
      if (condition.requires_fields) {
        condition.requires_fields.forEach((f: string) => {
          if (!r[f] || String(r[f]).trim() === '') isOk = false;
        });
      }
      
      // Exact Match
      if (condition.status) {
        if (!condition.status.includes(r.status)) isOk = false;
      }

      if (isOk) validCount++;
    });
    
    return validCount;
  };

  const checkProgress = useCallback(async () => {
    if (!currentTenant?.id || !activeSession || !userEmail) return;
    setIsValidating(true);
    try {
      // Check if this session is already certified for THIS USER
      const { data: certData } = await supabase
        .from('simulator_user_progress')
        .select('id')
        .eq('tenant_id', currentTenant.id)
        .eq('user_email', userEmail)
        .eq('module_id', activeSession)
        .limit(1);

      const sessionSteps = steps.filter(s => s.module_id === activeSession);
      const v: Record<string, any> = {};

      if (certData && certData.length > 0) {
        setHasCertificate(true);
        sessionSteps.forEach(s => v[s.key_name] = true);
        setValidations(v);
        setIsValidating(false);
        return;
      } else {
        setHasCertificate(false);
      }

      let allStepsValid = true;

      // Dynamic Validation
      for (const step of sessionSteps) {
        if (!step.check_table) {
          v[step.key_name] = false;
          allStepsValid = false;
          continue;
        }

        const { data: records } = await supabase
          .from(step.check_table)
          .select('*')
          .eq('tenant_id', currentTenant.id);

        if (!records) {
          v[step.key_name] = false;
          allStepsValid = false;
          continue;
        }

        // Special logic for "roles" aggregation
        if (step.check_condition?.requires_roles) {
          const roleTypes = records.map(m => m.role?.toLowerCase() || '');
          let hasAll = true;
          step.check_condition.requires_roles.forEach((reqR: string) => {
            if (!roleTypes.some(rt => rt.includes(reqR.toLowerCase()))) hasAll = false;
          });
          v[step.key_name] = hasAll && records.length >= step.min_count;
        } else {
          // Standard validation
          const validRecords = validateCondition(records, step.check_condition);
          v[step.key_name] = validRecords >= step.min_count;
        }

        if (!v[step.key_name]) {
          allStepsValid = false;
        }
      }

      setValidations(v);

      // Upsert each step's completion status to DB
      for (const step of sessionSteps) {
        await supabase.from('simulator_user_step_progress').upsert({
          tenant_id: currentTenant.id,
          user_email: userEmail,
          step_key: step.key_name,
          module_id: activeSession,
          completed: !!v[step.key_name]
        }, { onConflict: 'tenant_id,user_email,step_key' });
      }

      if (allStepsValid && sessionSteps.length > 0) {
        await supabase.from('simulator_user_progress').insert([{ 
          tenant_id: currentTenant.id, 
          user_email: userEmail,
          module_id: activeSession 
        }]);
        setHasCertificate(true);
      }

    } catch (err) {
      console.error(err);
    } finally {
      setIsValidating(false);
    }
  }, [currentTenant?.id, activeSession, steps, userEmail]);

  const exportCertificate = async () => {
    if (!currentTenant) return;
    
    const { data: cdoData } = await supabase.from('team_members').select('name').eq('tenant_id', currentTenant.id).or('role.ilike.%cdo%,role.ilike.%ciso%,role.ilike.%auditor%').limit(1);
    const signatureName = cdoData && cdoData.length > 0 ? cdoData[0].name : 'CDO Global';

    let certName = localStorage.getItem('govdata_user_name') || 'Estudiante';
    if (userEmail) {
      const { data: userData } = await supabase.from('tenant_users').select('alias, name').eq('tenant_id', currentTenant.id).eq('email', userEmail).single();
      if (userData?.alias) certName = userData.alias;
      else if (userData?.name) certName = userData.name;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const dateStr = new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });
    const sessionObj = modules.find(s => s.id === activeSession);
    
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
            <h2>${sessionObj?.badge_name || 'CDO Master'}</h2>
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

  const activeS = modules.find(s => s.id === activeSession);
  const sessionSteps = steps.filter(s => s.module_id === activeSession);
  
  const totalChecks = sessionSteps.length || 1;
  const completedChecks = sessionSteps.filter(c => validations[c.key_name]).length || 0;
  const progressPercent = Math.round((completedChecks / totalChecks) * 100);

  if (isLoading) {
    return (
      <div className={styles.container} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', gap: '16px' }}>
        <RefreshCw size={40} className="animate-spin" style={{ color: '#4f46e5' }} />
        <p style={{ fontWeight: 600, color: '#64748b' }}>Cargando entorno de simulación...</p>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className={styles.container} style={{ padding: '40px', textAlign: 'center' }}>
        <h2 style={{ color: '#ef4444', marginBottom: '16px' }}>Error de Conexión</h2>
        <p style={{ marginBottom: '24px', color: '#64748b' }}>{errorMsg}</p>
        <button onClick={fetchConfig} style={{ background: '#4f46e5', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
          Reintentar Cargar
        </button>
      </div>
    );
  }

  if (modules.length === 0) {
    return (
      <div className={styles.container} style={{ padding: '40px', textAlign: 'center' }}>
        <h2 style={{ marginBottom: '16px' }}>No hay módulos disponibles</h2>
        <p style={{ marginBottom: '24px', color: '#64748b' }}>No se encontraron sesiones del simulador configuradas en la base de datos.</p>
        <button onClick={fetchConfig} style={{ background: '#4f46e5', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
          Actualizar
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1><GraduationCap size={40} color="#4f46e5" /> GovData Academy (CDO Simulator)</h1>
            <p>Aplica tus conocimientos y gana insignias de manera progresiva.</p>
          </div>
          <div style={{ display: 'flex', gap: '10px', background: '#f1f5f9', padding: '6px', borderRadius: '12px' }}>
            <button 
              onClick={() => setActiveTab('participant')}
              style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 600, background: activeTab === 'participant' ? '#4f46e5' : 'transparent', color: activeTab === 'participant' ? 'white' : '#64748b' }}
            >
              Mi Ruta
            </button>
            
            {(userRole === 'admin' || userRole === 'owner' || userRole === 'superadmin') && (
              <button 
                onClick={() => setActiveTab('admin')}
                style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 600, background: activeTab === 'admin' ? '#4f46e5' : 'transparent', color: activeTab === 'admin' ? 'white' : '#64748b' }}
              >
                Monitoreo Empresa
              </button>
            )}

            {userRole === 'superadmin' && (
              <button 
                onClick={() => setActiveTab('superadmin')}
                style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 600, background: activeTab === 'superadmin' ? '#4f46e5' : 'transparent', color: activeTab === 'superadmin' ? 'white' : '#64748b' }}
              >
                Monitoreo Global (Todas)
              </button>
            )}
          </div>
        </div>
      </header>

      {activeTab === 'participant' && (
        <>
          <div className={styles.casesGrid}>
            {modules.map(s => {
              const Icon = ICON_MAP[s.icon] || Briefcase;
              const isActive = activeSession === s.id;
              return (
                <div key={s.id} className={`${styles.caseCard} ${isActive ? styles.active : ''}`} onClick={() => setActiveSession(s.id)}>
                  <div className={styles.caseBadge}>{isActive ? 'Sesión Activa' : 'Disponible'}</div>
                  <h3 className={styles.caseTitle}><Icon size={24} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'text-bottom' }} /> {s.title}</h3>
                  <p className={styles.caseDesc} style={{ marginBottom: '10px' }}>{s.description}</p>
                  <div style={{ display: 'inline-block', background: '#e0e7ff', color: '#4f46e5', padding: '4px 12px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 600 }}>
                    Insignia: {s.badge_name}
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
              {sessionSteps.map(chk => {
                const isOk = validations[chk.key_name];
                return (
                  <div key={chk.id} className={`${styles.checkItem} ${isOk ? styles.completed : ''}`}>
                    <div className={`${styles.checkIcon} ${isOk ? styles.completedIcon : styles.pendingIcon}`}>
                      {isOk ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                    </div>
                    <div className={styles.checkContent}>
                      <h4 className={styles.checkTitle}>{chk.title}</h4>
                      <p className={styles.checkDesc}>{chk.description}</p>
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
                <p className={styles.certDesc}>Has completado todos los requisitos de esta sesión. Ahora eres oficialmente un <strong>{activeS?.badge_name}</strong>.</p>
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
            <h2>Tablero de Monitoreo: Usuarios de {currentTenant?.name}</h2>
            <button onClick={loadAdminData} className={styles.primaryBtn} style={{ padding: '8px 16px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <RefreshCw size={16}/> Actualizar Datos
            </button>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                <th style={{ padding: '16px' }}>Usuario (Email)</th>
                <th style={{ padding: '16px' }}>Progreso en Plataforma</th>
                <th style={{ padding: '16px' }}>Insignias (Módulos Aprobados)</th>
              </tr>
            </thead>
            <tbody>
              {adminData.map(t => (
                <tr key={t.email} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '16px', fontWeight: 600 }}>{t.email}</td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '150px', height: '8px', background: '#e2e8f0', borderRadius: '4px' }}>
                        <div style={{ width: `${t.progress}%`, height: '100%', background: t.progress === 100 ? '#10b981' : '#4f46e5', borderRadius: '4px' }}></div>
                      </div>
                      <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#64748b' }}>{t.progress}%</span>
                    </div>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {modules.map((s, i) => {
                        const hasB = t.badges.includes(s.id);
                        return (
                          <div key={s.id} title={s.badge_name} style={{ width: '32px', height: '32px', borderRadius: '50%', background: hasB ? '#10b981' : '#f1f5f9', color: hasB ? 'white' : '#cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 'bold' }}>
                            {i + 1}
                          </div>
                        );
                      })}
                    </div>
                  </td>
                </tr>
              ))}
              {adminData.length === 0 && (
                <tr><td colSpan={3} style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>No hay datos de participación en esta empresa.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'superadmin' && (
        <div style={{ background: 'white', padding: '30px', borderRadius: '24px', border: '1px solid #e2e8f0', marginTop: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2>Visión Global: Organizaciones (Superadmin)</h2>
            <button onClick={loadAdminData} className={styles.primaryBtn} style={{ padding: '8px 16px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <RefreshCw size={16}/> Actualizar Datos
            </button>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                <th style={{ padding: '16px' }}>Empresa</th>
                <th style={{ padding: '16px' }}>Usuarios Activos</th>
                <th style={{ padding: '16px' }}>Progreso Promedio</th>
              </tr>
            </thead>
            <tbody>
              {superAdminData.map(t => (
                <tr key={t.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '16px', fontWeight: 600 }}>{t.name}</td>
                  <td style={{ padding: '16px', color: '#64748b' }}>{t.usersCount} usuarios simulando</td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '150px', height: '8px', background: '#e2e8f0', borderRadius: '4px' }}>
                        <div style={{ width: `${t.progress}%`, height: '100%', background: t.progress === 100 ? '#10b981' : '#4f46e5', borderRadius: '4px' }}></div>
                      </div>
                      <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#64748b' }}>{t.progress}%</span>
                    </div>
                  </td>
                </tr>
              ))}
              {superAdminData.length === 0 && (
                <tr><td colSpan={3} style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>No hay empresas con datos registrados.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
}
