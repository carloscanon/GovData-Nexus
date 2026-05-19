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
  PieChart, 
  Pie, 
  Cell,
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
import { 
  Sparkles, 
  Zap, 
  ShieldCheck, 
  Globe, 
  Layers, 
  Info,
  ChevronRight
} from 'lucide-react';

const areaData = [
  { name: 'Ventas', value: 400, color: '#3b82f6' },
  { name: 'IT', value: 300, color: '#10b981' },
  { name: 'Finanzas', value: 300, color: '#f59e0b' },
  { name: 'RRHH', value: 200, color: '#6366f1' },
];

const data = [
  { name: 'Ene', calidad: 78, madurez: 45 },
  { name: 'Feb', calidad: 82, madurez: 48 },
  { name: 'Mar', calidad: 80, madurez: 52 },
  { name: 'Abr', calidad: 85, madurez: 55 },
  { name: 'May', calidad: 88, madurez: 60 },
  { name: 'Jun', calidad: 92, madurez: 64 },
];

export default function Dashboard() {
  const [userName, setUserName] = React.useState('Carlos');

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedName = localStorage.getItem('govdata_user_name');
      if (savedName) setUserName(savedName);
    }
  }, []);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerTitle}>
          <h1>Executive Command Center</h1>
          <p>Bienvenido, {userName}. Visualización consolidada del ecosistema de datos.</p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.secondaryBtn}>
            <Clock size={18} />
            Sincronizado: 10:45 AM
          </button>
          <button className={styles.primaryBtn}>
            Reporte Ejecutivo
          </button>
        </div>
      </header>

      <div className={styles.statsGrid}>
        <StatCard 
          title="Madurez Global" 
          value="64%" 
          icon={TrendingUp} 
          trend={12} 
          trendLabel="Incremento vs Q1"
          color="#003366"
        />
        <StatCard 
          title="Calidad Promedio" 
          value="92.4%" 
          icon={Activity} 
          trend={4.2} 
          trendLabel="Meta: 95%"
          color="#10b981"
        />
        <StatCard 
          title="Compliance Score" 
          value="88%" 
          icon={ShieldCheck} 
          trend={2.5} 
          trendLabel="Riesgos mitigados"
          color="#3b82f6"
        />
        <StatCard 
          title="Incidentes Activos" 
          value="12" 
          icon={ShieldAlert} 
          trend={-15} 
          trendLabel="Tendencia a la baja"
          color="#ef4444"
        />
      </div>

      <div className={styles.mainGrid}>
        <div className={styles.chartCard}>
          <div className={styles.cardHeader}>
            <div>
              <h3>Evolución de Calidad vs Madurez</h3>
              <p>Desempeño del programa de gobierno 2024</p>
            </div>
            <div className={styles.legend}>
              <div className={styles.legendItem}><i style={{ backgroundColor: '#3b82f6' }}></i> Calidad</div>
              <div className={styles.legendItem}><i style={{ backgroundColor: '#64748b' }}></i> Madurez</div>
            </div>
          </div>
          <div className={styles.chartWrapper}>
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorQual" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                <Area type="monotone" dataKey="calidad" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorQual)" />
                <Area type="monotone" dataKey="madurez" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" fill="transparent" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={styles.sideCard}>
          <div className={styles.cardHeader}>
            <h3>Distribución de Activos</h3>
            <p>Por área de negocio</p>
          </div>
          <div className={styles.chartWrapper}>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={areaData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {areaData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className={styles.incidentList}>
              {areaData.map(area => (
                <div key={area.name} className={styles.incidentItem}>
                  <div className={styles.statusDot} style={{ backgroundColor: area.color }}></div>
                  <div className={styles.incidentInfo}>
                    <h4>{area.name}</h4>
                    <p>{(area.value / 12).toFixed(1)}% del total</p>
                  </div>
                  <ChevronRight size={14} color="#94a3b8" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className={styles.bottomGrid}>
        <div className={styles.chartCard}>
          <div className={styles.cardHeader}>
            <h3>Incidentes Activos</h3>
          </div>
          <div className={styles.incidentList}>
            <div className={styles.incidentItem}>
              <div className={`${styles.statusDot} ${styles.red}`}></div>
              <div className={styles.incidentInfo}>
                <h4>Fuga detectada: PII en Logs</h4>
                <p>Azure Storage • Crítico</p>
              </div>
              <AlertTriangle size={18} className={styles.alertIcon} />
            </div>
            <div className={styles.incidentItem}>
              <div className={`${styles.statusDot} ${styles.yellow}`}></div>
              <div className={styles.incidentInfo}>
                <h4>Calidad: Nulos en RUT</h4>
                <p>SQL Server • Medio</p>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.chartCard}>
          <div className={styles.cardHeader}>
            <h3>Certificación de Datos</h3>
          </div>
          <div className={styles.incidentList}>
            <div className={styles.incidentItem}>
              <CheckCircle2 size={20} color="#10b981" />
              <div className={styles.incidentInfo}>
                <h4>Maestro Clientes</h4>
                <p>Certificado por Auditoría</p>
              </div>
            </div>
            <div className={styles.incidentItem}>
              <Clock size={20} color="#f59e0b" />
              <div className={styles.incidentInfo}>
                <h4>Ventas 2023</h4>
                <p>En proceso de revisión</p>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.chartCard}>
          <div className={styles.cardHeader}>
            <h3>Nexus AI Insights</h3>
            <Sparkles size={20} color="#3b82f6" />
          </div>
          <div className={styles.aiLog}>
            <div className={styles.logItem}>
              <Zap size={14} />
              <span>Optimización: Sugeridas 12 nuevas etiquetas para el catálogo.</span>
            </div>
            <div className={styles.logItem}>
              <ShieldCheck size={14} />
              <span>Seguridad: Detectado acceso inusual en Financiero.</span>
            </div>
            <div className={styles.logItem}>
              <Globe size={14} />
              <span>Linaje: Mapeadas 4 nuevas relaciones entre SAP y Salesforce.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
