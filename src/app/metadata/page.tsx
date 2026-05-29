'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Brain, Database, Search, ShieldAlert, Network, BookOpen, 
  Plus, RefreshCw, ChevronDown, ArrowDown, Activity, Key, EyeOff
} from 'lucide-react';
import styles from './page.module.css';
import { usePlatform } from '@/contexts/PlatformContext';

export default function MetadataPage() {
  const { currentTenant } = usePlatform();
  const [activeTab, setActiveTab] = useState('scanner');
  const [isScanning, setIsScanning] = useState(false);

  // KPIs
  const kpis = [
    { label: 'Activos Descubiertos', value: '12,450', icon: Database, color: 'blue' },
    { label: 'Columnas Clasificadas', value: '88%', icon: Brain, color: 'purple' },
    { label: 'PII Detectado', value: '2,340', icon: ShieldAlert, color: 'red' },
    { label: 'Lineage Completo', value: '71%', icon: Network, color: 'green' },
  ];

  const handleScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      alert('Escaneo completado. Se descubrieron 45 nuevas tablas y se clasificaron 120 columnas (30 PII).');
    }, 2000);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <div className={styles.iconCircle}>
            <Brain size={24} />
          </div>
          <div>
            <h1>Metadata Intelligence</h1>
            <p>Descubre, clasifica y conecta toda la información de {currentTenant?.name || 'tu organización'} de forma automática.</p>
          </div>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.secondaryBtn} onClick={handleScan} disabled={isScanning}>
            <RefreshCw size={18} className={isScanning ? 'animate-spin' : ''} />
            {isScanning ? 'Escaneando...' : 'Escanear Fuentes'}
          </button>
          <button className={styles.primaryBtn}>
            <Plus size={18} /> Conectar Fuente
          </button>
        </div>
      </header>

      {/* KPIs */}
      <div className={styles.kpiGrid}>
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div key={idx} className={styles.kpiCard}>
              <div className={`${styles.kpiIcon} ${styles[kpi.color]}`}>
                <Icon size={28} />
              </div>
              <div className={styles.kpiInfo}>
                <h3>{kpi.label}</h3>
                <div className={styles.kpiValue}>{kpi.value}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        <button className={`${styles.tab} ${activeTab === 'scanner' ? styles.active : ''}`} onClick={() => setActiveTab('scanner')}>
          <Search size={18} /> Scanner & Descubrimiento
        </button>
        <button className={`${styles.tab} ${activeTab === 'classification' ? styles.active : ''}`} onClick={() => setActiveTab('classification')}>
          <ShieldAlert size={18} /> Clasificación IA
        </button>
        <button className={`${styles.tab} ${activeTab === 'lineage' ? styles.active : ''}`} onClick={() => setActiveTab('lineage')}>
          <Network size={18} /> Data Lineage
        </button>
        <button className={`${styles.tab} ${activeTab === 'glossary' ? styles.active : ''}`} onClick={() => setActiveTab('glossary')}>
          <BookOpen size={18} /> Glosario de Negocio
        </button>
      </div>

      {/* Tab Content */}
      <motion.div 
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === 'scanner' && (
          <div className={styles.contentGrid}>
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h3>Fuentes Conectadas y Activos Descubiertos</h3>
              </div>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Activo (Tabla/Vista)</th>
                    <th>Fuente</th>
                    <th>Columnas</th>
                    <th>Último Escaneo</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>CLIENTES</strong></td>
                    <td>Oracle ERP (Finanzas)</td>
                    <td>45</td>
                    <td>Hace 10 min</td>
                    <td><span className={`${styles.badge} ${styles.active}`}>Sincronizado</span></td>
                  </tr>
                  <tr>
                    <td><strong>TRANSACCIONES</strong></td>
                    <td>PostgreSQL (Core)</td>
                    <td>12</td>
                    <td>Hace 1 hora</td>
                    <td><span className={`${styles.badge} ${styles.active}`}>Sincronizado</span></td>
                  </tr>
                  <tr>
                    <td><strong>empleados_hist_2023.csv</strong></td>
                    <td>Data Lake (S3)</td>
                    <td>8</td>
                    <td>Hace 2 días</td>
                    <td><span className={`${styles.badge} ${styles.standard}`}>Archivado</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h3>Scanner Logs</h3>
              </div>
              <div style={{ fontSize: '0.85rem', color: '#64748b', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <p><strong>10:45 AM</strong> - [Oracle ERP] Conexión exitosa.</p>
                <p><strong>10:46 AM</strong> - [Oracle ERP] 15 tablas detectadas en esquema HR.</p>
                <p><strong>10:46 AM</strong> - [AI Classifier] 3 columnas marcadas como PII (EMAIL, SSN, PHONE).</p>
                <p><strong>10:47 AM</strong> - [Catálogo] Actualización de activos finalizada.</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'classification' && (
          <div className={styles.contentGrid} style={{ gridTemplateColumns: '1fr' }}>
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h3>Clasificación Automática de Columnas</h3>
                <button className={styles.secondaryBtn}>Re-Clasificar Todo</button>
              </div>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Columna</th>
                    <th>Activo</th>
                    <th>Tipo Dato Detectado</th>
                    <th>Clasificación IA</th>
                    <th>Confianza</th>
                    <th>Acción Auto</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>correo_electronico</strong></td>
                    <td>CLIENTES</td>
                    <td>VARCHAR(255)</td>
                    <td><span className={`${styles.badge} ${styles.pii}`}><EyeOff size={12} style={{display:'inline', marginRight:'4px'}}/> PII Sensible</span></td>
                    <td>99%</td>
                    <td>Regla Calidad: Email Regex</td>
                  </tr>
                  <tr>
                    <td><strong>numero_tarjeta</strong></td>
                    <td>PAGOS</td>
                    <td>VARCHAR(16)</td>
                    <td><span className={`${styles.badge} ${styles.financial}`}><Key size={12} style={{display:'inline', marginRight:'4px'}}/> Financiero PCI</span></td>
                    <td>98%</td>
                    <td>Alerta Seguridad: Encriptación requerida</td>
                  </tr>
                  <tr>
                    <td><strong>fecha_nacimiento</strong></td>
                    <td>CLIENTES</td>
                    <td>DATE</td>
                    <td><span className={`${styles.badge} ${styles.pii}`}><EyeOff size={12} style={{display:'inline', marginRight:'4px'}}/> PII Moderado</span></td>
                    <td>95%</td>
                    <td>Regla Calidad: Not Null</td>
                  </tr>
                  <tr>
                    <td><strong>estado_civil</strong></td>
                    <td>EMPLEADOS</td>
                    <td>VARCHAR(20)</td>
                    <td><span className={`${styles.badge} ${styles.standard}`}>Estándar</span></td>
                    <td>85%</td>
                    <td>Sugerencia: Crear diccionario</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'lineage' && (
          <div className={styles.contentGrid} style={{ gridTemplateColumns: '1fr' }}>
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h3>Data Lineage (Trazabilidad)</h3>
                <div className={styles.headerActions}>
                  <select className={styles.secondaryBtn} style={{ padding: '8px' }}>
                    <option>Buscar activo...</option>
                    <option>CLIENTES.correo_electronico</option>
                  </select>
                </div>
              </div>
              <div style={{ padding: '24px', background: '#f8fafc', borderRadius: '12px', display: 'flex', justifyContent: 'center' }}>
                <div className={styles.lineageFlow} style={{ width: '400px' }}>
                  <div className={styles.lineageNode}>
                    <div>
                      <h4>Oracle ERP (Fuente)</h4>
                      <p>CRM_DB.USERS.EMAIL</p>
                    </div>
                    <Database size={20} color="#3b82f6" />
                  </div>
                  <div className={styles.arrowDown}><ArrowDown size={20} /></div>
                  <div className={styles.lineageNode}>
                    <div>
                      <h4>Data Lake (Procesamiento ETL)</h4>
                      <p>S3://raw/users/data.parquet</p>
                    </div>
                    <RefreshCw size={20} color="#8b5cf6" />
                  </div>
                  <div className={styles.arrowDown}><ArrowDown size={20} /></div>
                  <div className={styles.lineageNode}>
                    <div>
                      <h4>Catálogo / PowerBI (Consumo)</h4>
                      <p>Dataset: Dim_Clientes.Email</p>
                    </div>
                    <Activity size={20} color="#10b981" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'glossary' && (
          <div className={styles.contentGrid}>
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h3>Diccionario de Términos</h3>
                <button className={styles.primaryBtn} style={{ padding: '6px 12px', fontSize: '0.85rem' }}>+ Nuevo Término</button>
              </div>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Término</th>
                    <th>Definición Negocio</th>
                    <th>Dominio</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Cliente Activo</strong></td>
                    <td>Usuario que ha realizado al menos 1 transacción en los últimos 90 días.</td>
                    <td>Ventas</td>
                  </tr>
                  <tr>
                    <td><strong>Churn Rate</strong></td>
                    <td>Porcentaje de clientes que dejan de usar el servicio en un periodo.</td>
                    <td>Marketing</td>
                  </tr>
                  <tr>
                    <td><strong>PII</strong></td>
                    <td>Información Personal Identificable (Cédula, Email, Teléfono).</td>
                    <td>Legal/Compliance</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

      </motion.div>
    </div>
  );
}
