'use client';

import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Info,
  Loader2
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as ReTooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { supabase } from '@/lib/supabase';
import styles from './quality.module.css';

interface QualityMetric {
  id: string;
  dimension: string;
  score: number;
  status: string;
}

const dataBySystem = [
  { name: 'SAP ERP', score: 94 },
  { name: 'Salesforce', score: 82 },
  { name: 'Oracle DB', score: 88 },
  { name: 'Data Lake', score: 91 },
  { name: 'Legacy App', score: 65 },
];

export default function Quality() {
  const [dimensions, setDimensions] = useState<QualityMetric[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
  }, []);

  async function fetchMetrics() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('quality_metrics')
        .select('*');

      if (error) throw error;
      setDimensions(data || []);
    } catch (error) {
      console.error('Error fetching quality metrics:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <h1>Salud de los Datos</h1>
          <p>Monitoreo en tiempo real de las dimensiones de calidad por sistema y dominio.</p>
        </div>
        <button onClick={fetchMetrics} className={styles.refreshBtn}>
          {loading ? <Loader2 size={18} className={styles.spin} /> : 'Refrescar Datos'}
        </button>
      </header>

      {loading ? (
        <div className={styles.loadingState}>
          <Loader2 size={40} className={styles.spin} />
          <p>Cargando métricas de calidad...</p>
        </div>
      ) : (
        <>
          <div className={styles.statsGrid}>
            {dimensions.map(dim => (
              <div key={dim.id} className={styles.dimCard}>
                <div className={styles.dimHeader}>
                  <span className={styles.dimName}>{dim.dimension}</span>
                  <span className={`${styles.dimStatus} ${styles[dim.status.toLowerCase()] || styles.riesgo}`}>{dim.status}</span>
                </div>
                <div className={styles.dimValue}>{dim.score}%</div>
                <div className={styles.dimTrack}>
                  <div className={styles.dimFill} style={{ 
                    width: `${dim.score}%`,
                    backgroundColor: dim.score > 90 ? '#10b981' : dim.score > 80 ? '#f59e0b' : '#ef4444'
                  }}></div>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.chartsRow}>
            <div className={styles.chartCard}>
              <div className={styles.chartHeader}>
                <h3>Calidad por Sistema Fuente</h3>
                <p>% de registros válidos</p>
              </div>
              <div className={styles.chartBody}>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dataBySystem}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                    <ReTooltip cursor={{fill: '#f1f5f9'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: 'var(--shadow-lg)' }} />
                    <Bar dataKey="score" radius={[6, 6, 0, 0]} barSize={40}>
                      {dataBySystem.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.score > 80 ? 'var(--primary)' : '#ef4444'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className={styles.rulesCard}>
              <div className={styles.chartHeader}>
                <h3>Reglas de Calidad Fallidas</h3>
                <p>Principales inconsistencias detectadas</p>
              </div>
              <div className={styles.rulesList}>
                <div className={styles.ruleItem}>
                  <div className={styles.ruleIcon}><AlertTriangle size={18} /></div>
                  <div className={styles.ruleInfo}>
                    <h4>Nulos en Email de Contacto</h4>
                    <p>Salesforce • 452 registros afectados</p>
                  </div>
                </div>
                <div className={styles.ruleItem}>
                  <div className={styles.ruleIcon}><XCircle size={18} /></div>
                  <div className={styles.ruleInfo}>
                    <h4>Formato de Documento Inválido</h4>
                    <p>SAP ERP • 1,204 registros afectados</p>
                  </div>
                </div>
                <div className={styles.ruleItem}>
                  <div className={styles.ruleIcon}><Info size={18} /></div>
                  <div className={styles.ruleInfo}>
                    <h4>Desfase en Fecha de Carga</h4>
                    <p>Data Lake • Retraso de 24h</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
