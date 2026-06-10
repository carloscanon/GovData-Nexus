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
  Database
} from 'lucide-react';
import { usePlatform } from '@/contexts/PlatformContext';
import { supabase } from '@/lib/supabase';
import styles from './simulator.module.css';

const ICON_MAP: Record<string, any> = {
  Briefcase: Briefcase,
  ShieldAlert: ShieldAlert,
  Database: Database
};

export default function Simulator() {
  const { currentTenant } = usePlatform();
  const [cases, setCases] = useState<any[]>([]);
  const [activeCase, setActiveCase] = useState<string | null>(null);
  const [hasCertificate, setHasCertificate] = useState(false);
  
  const [validations, setValidations] = useState({
    dama: false,
    roles: false,
    raci: false
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
        setValidations({ dama: true, roles: true, raci: true });
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
        .select('roleType')
        .eq('tenant_id', currentTenant.id);
      
      let hasRoles = false;
      if (membersData) {
        const roleTypes = membersData.map(m => m.roleType?.toLowerCase());
        const hasOwner = roleTypes.includes('data owner');
        const hasSteward = roleTypes.includes('data steward');
        const hasCustodian = roleTypes.includes('data custodian');
        const hasCdoOrAuditor = roleTypes.includes('cdo') || roleTypes.includes('ciso') || roleTypes.includes('auditor');
        
        hasRoles = hasOwner && hasSteward && hasCustodian && hasCdoOrAuditor;
      }

      // 3. Check RACI
      const { data: raciData } = await supabase
        .from('team_raci_matrix')
        .select('id')
        .eq('tenant_id', currentTenant.id);
      
      // RACI should have at least 5 processes configured
      const hasRaci = (raciData?.length ?? 0) >= 5;

      setValidations({
        dama: hasDama,
        roles: hasRoles,
        raci: hasRaci
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
              <p className={styles.checkDesc}>Configura la matriz RACI de operaciones. Debes editarla, parametrizar los responsables y guardarla en base de datos.</p>
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
            <button style={{ background: 'white', color: '#4f46e5', padding: '12px 24px', borderRadius: '12px', fontWeight: 800, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', margin: '0 auto' }}>
              Exportar Certificado Digital <ArrowRight size={18} />
            </button>
          </motion.div>
        )}

      </div>
    </div>
  );
}
