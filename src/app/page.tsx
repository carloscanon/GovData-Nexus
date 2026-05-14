'use client';

import React from 'react';
import { 
  Database, 
  Activity, 
  ShieldAlert, 
  CheckCircle2, 
  TrendingUp, 
  AlertTriangle,
  Clock,
  ArrowRight
} from 'lucide-react';
import StatCard from '@/components/dashboard/StatCard';
import styles from './page.module.css';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

const data = [
  { name: 'Ene', calidad: 78, madurez: 45 },
  { name: 'Feb', calidad: 82, madurez: 48 },
  { name: 'Mar', calidad: 80, madurez: 52 },
  { name: 'Abr', calidad: 85, madurez: 55 },
  { name: 'May', calidad: 88, madurez: 60 },
  { name: 'Jun', calidad: 92, madurez: 64 },
];

export default function Dashboard() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerTitle}>
          <h1>Panel Ejecutivo de Gobierno</h1>
          <p>Bienvenido, Carlos. Aquí está el estado actual del ecosistema de datos.</p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.secondaryBtn}>
            <Clock size={18} />
            Última actualización: Hoy, 10:45 AM
          </button>
          <button className={styles.primaryBtn}>
            Generar Reporte PDF
          </button>
        </div>
      </header>

      <div className={styles.statsGrid}>
        <StatCard 
          title="Madurez Global" 
          value="64%" 
          icon={TrendingUp} 
          trend={12} 
          trendLabel="Incremento vs Q1 2026"
          color="#003366"
        />
        <StatCard 
          title="Calidad Promedio" 
          value="92.4%" 
          icon={Activity} 
          trend={4.2} 
          trendLabel="Mejora en áreas críticas"
          color="#2e7d32"
        />
        <StatCard 
          title="Activos Catalogados" 
          value="1,284" 
          icon={Database} 
          trend={25} 
          trendLabel="Nuevas fuentes integradas"
          color="#3b82f6"
        />
        <StatCard 
          title="Riesgos Críticos" 
          value="12" 
          icon={ShieldAlert} 
          trend={-15} 
          trendLabel="Mitigados este mes"
          color="#ef4444"
        />
      </div>

      <div className={styles.mainGrid}>
        <div className={styles.chartCard}>
          <div className={styles.cardHeader}>
            <div>
              <h3>Evolución de Calidad y Madurez</h3>
              <p>Tendencia semestral del gobierno de datos</p>
            </div>
            <div className={styles.legend}>
              <span className={styles.legendItem}><i style={{ backgroundColor: 'var(--primary)' }}></i> Calidad</span>
              <span className={styles.legendItem}><i style={{ backgroundColor: 'var(--secondary)' }}></i> Madurez</span>
            </div>
          </div>
          <div className={styles.chartWrapper}>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorCalidad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: 'var(--shadow-lg)' }}
                />
                <Area type="monotone" dataKey="calidad" stroke="var(--primary)" fillOpacity={1} fill="url(#colorCalidad)" strokeWidth={3} />
                <Area type="monotone" dataKey="madurez" stroke="var(--secondary)" fill="transparent" strokeWidth={3} strokeDasharray="5 5" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={styles.sideCard}>
          <div className={styles.cardHeader}>
            <h3>Incidentes Recientes</h3>
            <button className={styles.textBtn}>Ver todos <ArrowRight size={14} /></button>
          </div>
          <div className={styles.incidentList}>
            <div className={styles.incidentItem}>
              <div className={`${styles.statusDot} ${styles.red}`}></div>
              <div className={styles.incidentInfo}>
                <h4>Nulos en Maestro Clientes</h4>
                <p>SAP ERP • Crítico • Hace 2h</p>
              </div>
              <AlertTriangle size={18} className={styles.alertIcon} />
            </div>
            <div className={styles.incidentItem}>
              <div className={`${styles.statusDot} ${styles.yellow}`}></div>
              <div className={styles.incidentInfo}>
                <h4>Duplicados en Ventas Q2</h4>
                <p>Salesforce • Medio • Hace 5h</p>
              </div>
            </div>
            <div className={styles.incidentItem}>
              <div className={`${styles.statusDot} ${styles.green}`}></div>
              <div className={styles.incidentInfo}>
                <h4>Formato inconsistente RUT</h4>
                <p>SQL Server • Resuelto • Ayer</p>
              </div>
              <CheckCircle2 size={18} className={styles.successIcon} />
            </div>
          </div>
          <div className={styles.cardFooter}>
            <div className={styles.progressLabel}>
              <span>Resolución de incidentes</span>
              <span>85%</span>
            </div>
            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: '85%' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
