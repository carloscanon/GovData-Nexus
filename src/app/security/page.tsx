'use client';

import React from 'react';
import { 
  ShieldAlert, 
  Lock, 
  Eye, 
  UserCheck, 
  AlertOctagon,
  CheckCircle,
  FileWarning
} from 'lucide-react';
import styles from './security.module.css';

const risks = [
  { id: 1, title: 'Exposición de Datos PII', asset: 'Leads Marketing', severity: 'Alto', status: 'Mitigando', date: '2026-05-10' },
  { id: 2, title: 'Accesos Excesivos', asset: 'Oracle DB Finanzas', severity: 'Medio', status: 'Abierto', date: '2026-05-12' },
  { id: 3, title: 'Política Vencida', asset: 'Seguridad Información', severity: 'Bajo', status: 'En Revisión', date: '2026-05-08' },
];

export default function Security() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <h1>Seguridad y Riesgos</h1>
          <p>Monitoreo de cumplimiento normativo y protección de activos sensibles.</p>
        </div>
      </header>

      <div className={styles.topGrid}>
        <div className={styles.riskCard}>
          <div className={styles.cardTitle}>
            <ShieldAlert className={styles.riskIcon} />
            <h3>Mapa de Calor de Riesgos</h3>
          </div>
          <div className={styles.heatmap}>
            <div className={styles.grid}>
              <div className={`${styles.cell} ${styles.critical}`}>1</div>
              <div className={`${styles.cell} ${styles.high}`}>3</div>
              <div className={`${styles.cell} ${styles.high}`}>2</div>
              <div className={`${styles.cell} ${styles.medium}`}>5</div>
              <div className={`${styles.cell} ${styles.low}`}>8</div>
              <div className={`${styles.cell} ${styles.low}`}>12</div>
            </div>
            <div className={styles.heatmapLabels}>
              <span>Impacto →</span>
              <span>Probabilidad ↑</span>
            </div>
          </div>
        </div>

        <div className={styles.complianceCard}>
          <div className={styles.cardTitle}>
            <CheckCircle className={styles.successIcon} />
            <h3>Cumplimiento Normativo</h3>
          </div>
          <div className={styles.complianceList}>
            <div className={styles.compItem}>
              <span>Habeas Data (Ley 1581)</span>
              <div className={styles.compStatus} style={{ width: '95%' }}></div>
              <span>95%</span>
            </div>
            <div className={styles.compItem}>
              <span>ISO 27001</span>
              <div className={styles.compStatus} style={{ width: '82%' }}></div>
              <span>82%</span>
            </div>
            <div className={styles.compItem}>
              <span>GDPR (Global)</span>
              <div className={styles.compStatus} style={{ width: '70%' }}></div>
              <span>70%</span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.sectionTitle}>
        <h2>Riesgos Identificados</h2>
      </div>

      <div className={styles.listContainer}>
        {risks.map(risk => (
          <div key={risk.id} className={styles.riskItem}>
            <div className={`${styles.severityIndicator} ${styles[risk.severity.toLowerCase()]}`}></div>
            <div className={styles.riskMain}>
              <div className={styles.riskHeader}>
                <h4>{risk.title}</h4>
                <span className={styles.riskDate}>{risk.date}</span>
              </div>
              <div className={styles.riskDetails}>
                <span><Lock size={14} /> {risk.asset}</span>
                <span>•</span>
                <span>{risk.status}</span>
              </div>
            </div>
            <button className={styles.mitigateBtn}>Ver Detalles</button>
          </div>
        ))}
      </div>
    </div>
  );
}
