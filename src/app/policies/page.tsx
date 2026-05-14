'use client';

import React from 'react';
import { 
  FileText, 
  Download, 
  Eye, 
  History, 
  ShieldCheck,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import styles from './policies.module.css';

const policies = [
  { id: 1, title: 'Política de Calidad de Datos', version: 'v2.4', status: 'Vigente', date: '2026-01-15', author: 'Gobierno de Datos' },
  { id: 2, title: 'Seguridad de la Información', version: 'v3.1', status: 'Vigente', date: '2025-11-20', author: 'Seguridad TI' },
  { id: 3, title: 'Manual de Habeas Data', version: 'v1.2', status: 'En Revisión', date: '2026-04-05', author: 'Legal' },
  { id: 4, title: 'Estándar de Nomenclatura', version: 'v2.0', status: 'Vencida', date: '2024-12-10', author: 'Arquitectura' },
  { id: 5, title: 'Política de Retención de Datos', version: 'v1.5', status: 'Vigente', date: '2026-02-28', author: 'Cumplimiento' },
];

export default function Policies() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <h1>Políticas y Estándares</h1>
          <p>Repositorio oficial de lineamientos, normas y procedimientos de datos.</p>
        </div>
      </header>

      <div className={styles.statsRow}>
        <div className={styles.miniStat}>
          <span className={styles.statVal}>12</span>
          <span className={styles.statLabel}>Políticas Vigentes</span>
        </div>
        <div className={styles.miniStat}>
          <span className={styles.statVal}>2</span>
          <span className={styles.statLabel}>En Revisión</span>
        </div>
        <div className={styles.miniStat}>
          <span className={styles.statVal}>1</span>
          <span className={styles.statLabel}>Vencidas</span>
        </div>
      </div>

      <div className={styles.list}>
        {policies.map(policy => (
          <div key={policy.id} className={styles.policyCard}>
            <div className={styles.iconWrapper}>
              <FileText size={24} />
            </div>
            <div className={styles.policyMain}>
              <div className={styles.policyHeader}>
                <h3>{policy.title}</h3>
                <span className={styles.version}>{policy.version}</span>
              </div>
              <div className={styles.policyMeta}>
                <span>{policy.author}</span>
                <span>•</span>
                <span>Actualizado el {policy.date}</span>
              </div>
            </div>
            <div className={styles.policyStatus}>
              <span className={`${styles.statusBadge} ${styles[policy.status.toLowerCase().replace(' ', '')]}`}>
                {policy.status === 'Vigente' ? <CheckCircle size={14} /> : 
                 policy.status === 'En Revisión' ? <History size={14} /> : 
                 <AlertCircle size={14} />}
                {policy.status}
              </span>
            </div>
            <div className={styles.policyActions}>
              <button className={styles.iconBtn}><Eye size={18} /></button>
              <button className={styles.iconBtn}><Download size={18} /></button>
              <button className={styles.historyBtn}>Historial</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
