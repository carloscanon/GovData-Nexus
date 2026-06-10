'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  GraduationCap, 
  CheckCircle2, 
  Circle, 
  Award, 
  Briefcase, 
  ShieldAlert,
  ArrowRight,
  RefreshCw,
  Database,
  Network
} from 'lucide-react';
import { usePlatform } from '@/contexts/PlatformContext';
import { supabase } from '@/lib/supabase';
import styles from './simulator.module.css';

const ICON_MAP: Record<string, any> = {
  Briefcase: Briefcase,
  ShieldAlert: ShieldAlert,
  Database: Database,
  Network: Network
};

export default function Simulator() {
  const { currentTenant } = usePlatform();
  const [cases, setCases] = useState<any[]>([]);
  const [activeCase, setActiveCase] = useState<string | null>(null);
  const [hasCertificate, setHasCertificate] = useState(false);
  
  const [validations, setValidations] = useState({
    dama: false,
    roles: false,
    raci: false,
    missingRoles: [] as string[],
    missingRaci: 0
  });
  const [isValidating, setIsValidating] = useState(false);

  // Load cases from Supabase
  useEffect(() => {
    async function loadCases() {
      try {
        const { data } = await supabase.from('simulator_cases').select('*').order('id', { ascending: true });
        if (data && data.length > 0) {
          setCases(data);
          setActiveCase(data[0].id);
        }
      } catch (err) {
        console.error('Error loading cases', err);
      }
    }
    loadCases();
  }, []);

  const checkProgress = useCallback(async () => {
    if (!currentTenant?.id || !activeCase) return;
    setIsValidating(true);
    try {
      // 0. Check if already certified
      const { data: certData } = await supabase
        .from('simulator_certificates')
        .select('id')
        .eq('tenant_id', currentTenant.id)
        .eq('case_id', activeCase)
        .limit(1);

      if (certData && certData.length > 0) {
        setHasCertificate(true);
        setValidations({ dama: true, roles: true, raci: true, missingRoles: [], missingRaci: 0 });
        setIsValidating(false);
        return;
      } else {
        setHasCertificate(false);
      }

      // 1. Check DAMA Assessment
      const { data: damaData } = await supabase
        .from('maturity_assessments')
        .select('id')
        .eq('tenant_id', currentTenant.id)
        .limit(1);
      
      const hasDama = (damaData?.length ?? 0) > 0;

      // 2. Check Roles (Needs Data Owner, Data Steward, Data Custodian, CDO/CISO/Auditor)
      const { data: membersData } = await supabase
        .from('team_members')
        .select('role')
        .eq('tenant_id', currentTenant.id);
      
      let hasRoles = false;
      let missingRoles: string[] = ['Data Owner', 'Data Steward', 'Data Custodian', 'CDO o Auditor'];

      if (membersData && membersData.length > 0) {
        const roleTypes = membersData.map(m => m.role?.toLowerCase() || '');
        const hasOwner = roleTypes.includes('data owner');
        const hasSteward = roleTypes.includes('data steward');
        const hasCustodian = roleTypes.includes('data custodian');
        const hasCdoOrAuditor = roleTypes.includes('cdo') || roleTypes.includes('ciso') || roleTypes.includes('auditor');
        
        missingRoles = [];
        if (!hasOwner) missingRoles.push('Data Owner');
        if (!hasSteward) missingRoles.push('Data Steward');
        if (!hasCustodian) missingRoles.push('Data Custodian');
        if (!hasCdoOrAuditor) missingRoles.push('CDO o Auditor');

        hasRoles = missingRoles.length === 0;
      }

      // 3. Check RACI
      const { data: raciData } = await supabase
        .from('team_raci_matrix')
        .select('id')
        .eq('tenant_id', currentTenant.id);
      
      // RACI should have at least 5 processes configured
      const raciCount = raciData?.length ?? 0;
      const hasRaci = raciCount >= 5;
      const missingRaci = hasRaci ? 0 : 5 - raciCount;

      setValidations({
        dama: hasDama,
        roles: hasRoles,
        raci: hasRaci,
        missingRoles: missingRoles,
        missingRaci: missingRaci
      });

      // Si todo está ok, insertar certificado en base de datos
      if (hasDama && hasRoles && hasRaci) {
        await supabase.from('simulator_certificates').insert([{
          tenant_id: currentTenant.id,
          case_id: activeCase
        }]);
        setHasCertificate(true);
      }

    } catch (err) {
      console.error('Error validating simulator progress', err);
    } finally {
      setIsValidating(false);
    }
  }, [currentTenant?.id, activeCase]);

  const exportCertificate = async () => {
    if (!currentTenant || !selectedCase) return;
    
    // Fetch CDO Signature
    const { data: cdoData } = await supabase.from('team_members')
      .select('name')
      .eq('tenant_id', currentTenant.id)
      .or('role.ilike.%cdo%,role.ilike.%ciso%,role.ilike.%auditor%')
      .limit(1);
    const signatureName = cdoData && cdoData.length > 0 ? cdoData[0].name : 'CDO Global';

    // Fetch User Alias
    const userEmail = localStorage.getItem('govdata_user_email');
    let certName = localStorage.getItem('govdata_user_name') || 'Estudiante';
    
    if (userEmail) {
      const { data: userData } = await supabase.from('tenant_users')
        .select('alias, name')
        .eq('tenant_id', currentTenant.id)
        .eq('email', userEmail)
        .single();
        
      if (userData?.alias) {
        certName = userData.alias;
      } else if (userData?.name) {
        certName = userData.name;
      }
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const dateStr = new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });
    
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
            @media print {
              body { background: white; padding: 0; align-items: flex-start; }
              .certificate { box-shadow: none; border: 4px solid #4f46e5; padding: 40px; margin: 0 auto; }
            }
          </style>
        </head>
        <body>
          <div class="certificate">
            <h1>Certificado de Aprobación</h1>
            <h2>GovData Nexus - Simulator</h2>
            <p>Se otorga el presente reconocimiento a:</p>
            <div class="tenant-name">${certName}</div>
            <p style="margin-top: 0; color: #4f46e5; font-weight: bold;">Representando a: ${currentTenant.name}</p>
            <p>Por haber completado satisfactoriamente los requerimientos técnicos y estratégicos de Gobierno de Datos en el escenario:</p>
            <h3 style="color:#1e293b; font-size: 1.5rem;">${selectedCase.title}</h3>
            <p style="font-size: 1rem;">Demostrando competencia en diagnóstico de madurez, estructuración de roles y parametrización de la matriz operativa RACI.</p>
            <div class="seal">CERTIFIED</div>
            <div class="footer">
              <div style="text-align: left;">
                <p style="font-size:1rem; margin:0; padding:0;">Fecha de Emisión:</p>
                <strong style="color: #1e293b">${dateStr}</strong>
              </div>
              <div class="signature">Firma: ${signatureName}<br/><span style="font-size: 0.8rem; color: #94a3b8;">Chief Data Officer</span></div>
            </div>
          </div>
          <script>
            setTimeout(() => {
              window.print();
            }, 500);
          </script>
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

  const selectedCase = cases.find(c => c.id === activeCase);
  const progressPercent = Math.round(
    ((validations.dama ? 1 : 0) + (validations.roles ? 1 : 0) + (validations.raci ? 1 : 0)) / 3 * 100
  );

  if (cases.length === 0) {
    return <div className={styles.container}>Cargando casos...</div>;
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1><GraduationCap size={40} color="#4f46e5" /> Simulador de CDO</h1>
        <p>Aplica tus conocimientos en escenarios reales y deja que GovData Nexus valide tu trabajo.</p>
      </header>

      {/* Case Selector */}
      <div className={styles.casesGrid}>
        {cases.map(c => {
          const Icon = ICON_MAP[c.icon] || Briefcase;
          const isActive = activeCase === c.id;
          return (
            <div 
              key={c.id} 
              className={`${styles.caseCard} ${isActive ? styles.active : ''}`}
              onClick={() => setActiveCase(c.id)}
            >
              <div className={styles.caseBadge}>{isActive ? 'Caso Activo' : 'Caso Disponible'}</div>
              <h3 className={styles.caseTitle}><Icon size={24} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'text-bottom' }} /> {c.title}</h3>
              <p className={styles.caseDesc}>{c.description}</p>
            </div>
          );
        })}
      </div>

      {/* Validation Panel */}
      <div className={styles.validationSection}>
        <div className={styles.validationHeader}>
          <h2 className={styles.validationTitle}>Progreso de la Certificación</h2>
          <div className={styles.progressCircle}>
            <button 
              onClick={checkProgress} 
              disabled={isValidating}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <RefreshCw size={20} className={isValidating ? 'animate-spin' : ''} />
              {isValidating ? 'Validando...' : 'Revalidar'}
            </button>
            <span className={styles.progressText}>{progressPercent}% Completado</span>
          </div>
        </div>

        <div className={styles.checkList}>
          {/* DAMA Check */}
          <div className={`${styles.checkItem} ${validations.dama ? styles.completed : ''}`}>
            <div className={`${styles.checkIcon} ${validations.dama ? styles.completedIcon : styles.pendingIcon}`}>
              {validations.dama ? <CheckCircle2 size={24} /> : <Circle size={24} />}
            </div>
            <div className={styles.checkContent}>
              <h4 className={styles.checkTitle}>1. Diagnóstico DAMA Inicial</h4>
              <p className={styles.checkDesc}>Realiza la evaluación de 100 preguntas en el módulo de Madurez para tener un punto de partida justificable.</p>
              <span className={`${styles.checkStatus} ${validations.dama ? styles.statusCompleted : styles.statusPending}`}>
                {validations.dama ? 'Completado' : 'Pendiente: Ir a Madurez DAMA'}
              </span>
            </div>
          </div>

          {/* Roles Check */}
          <div className={`${styles.checkItem} ${validations.roles ? styles.completed : ''}`}>
            <div className={`${styles.checkIcon} ${validations.roles ? styles.completedIcon : styles.pendingIcon}`}>
              {validations.roles ? <CheckCircle2 size={24} /> : <Circle size={24} />}
            </div>
            <div className={styles.checkContent}>
              <h4 className={styles.checkTitle}>2. Estructuración del Equipo Base</h4>
              <p className={styles.checkDesc}>Diseña tu red de gobierno en "Roles y Equipo". Necesitas tener asignados al menos a: Data Owner, Data Steward, Data Custodian y un CDO/CISO/Auditor.</p>
              
              {!validations.roles && validations.missingRoles.length > 0 && (
                <div style={{ background: '#fff1f2', border: '1px solid #fecdd3', padding: '12px', borderRadius: '8px', marginBottom: '12px', fontSize: '0.9rem', color: '#be123c' }}>
                  <strong>Faltan por asignar:</strong> {validations.missingRoles.join(', ')}
                </div>
              )}

              <span className={`${styles.checkStatus} ${validations.roles ? styles.statusCompleted : styles.statusPending}`}>
                {validations.roles ? 'Completado' : 'Pendiente: Faltan roles críticos'}
              </span>
            </div>
          </div>

          {/* RACI Check */}
          <div className={`${styles.checkItem} ${validations.raci ? styles.completed : ''}`}>
            <div className={`${styles.checkIcon} ${validations.raci ? styles.completedIcon : styles.pendingIcon}`}>
              {validations.raci ? <CheckCircle2 size={24} /> : <Circle size={24} />}
            </div>
            <div className={styles.checkContent}>
              <h4 className={styles.checkTitle}>3. Parametrización de Matriz RACI</h4>
              <p className={styles.checkDesc}>Configura la matriz RACI de operaciones. Debes editarla, parametrizar los responsables y guardarla en base de datos (mínimo 5 procesos).</p>
              
              {!validations.raci && validations.missingRaci > 0 && (
                <div style={{ background: '#fff1f2', border: '1px solid #fecdd3', padding: '12px', borderRadius: '8px', marginBottom: '12px', fontSize: '0.9rem', color: '#be123c' }}>
                  <strong>Te faltan:</strong> {validations.missingRaci} proceso(s) por parametrizar en el RACI.
                </div>
              )}

              <span className={`${styles.checkStatus} ${validations.raci ? styles.statusCompleted : styles.statusPending}`}>
                {validations.raci ? 'Completado' : 'Pendiente: Configurar RACI'}
              </span>
            </div>
          </div>
        </div>

        {/* Certificate / Success */}
        {hasCertificate && (
          <motion.div 
            className={styles.certificateBox}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Award size={64} style={{ marginBottom: '16px' }} />
            <h2 className={styles.certTitle}>¡Práctica Aprobada!</h2>
            <p className={styles.certDesc}>
              Has completado satisfactoriamente los requerimientos críticos para el <strong>{selectedCase?.title}</strong>. 
              La plataforma ha validado tu red de gobierno, tu matriz operativa y tu diagnóstico base.
            </p>
            <button 
              onClick={exportCertificate}
              style={{ background: 'white', color: '#4f46e5', padding: '12px 24px', borderRadius: '12px', fontWeight: 800, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', margin: '0 auto' }}
            >
              Exportar Certificado Digital <ArrowRight size={18} />
            </button>
          </motion.div>
        )}

      </div>
    </div>
  );
}
