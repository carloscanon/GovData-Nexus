'use client';

import React from 'react';
import { 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ArrowUpRight,
  FileText,
  User,
  MoreHorizontal
} from 'lucide-react';
import styles from './workflows.module.css';

const requests = [
  { id: 'REQ-001', title: 'Acceso a Maestro Clientes', requester: 'Ana G. (Ventas)', type: 'Acceso', status: 'Pendiente', priority: 'Alta', date: 'Hace 30 min' },
  { id: 'REQ-002', title: 'Nueva Fuente: Shopify API', requester: 'Luis M. (Marketing)', type: 'Integración', status: 'En Proceso', priority: 'Media', date: 'Hace 2h' },
  { id: 'REQ-003', title: 'Cambio de KPI: Margen Neto', requester: 'Sofia R. (Finanzas)', type: 'Definición', status: 'Aprobado', priority: 'Alta', date: 'Hace 1 día' },
  { id: 'REQ-004', title: 'Excepción de Política: Retención', requester: 'Auditoría Interna', type: 'Excepción', status: 'Pendiente', priority: 'Crítica', date: 'Ayer' },
];

export default function Workflows() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <h1>Flujos de Aprobación</h1>
          <p>Gestione las solicitudes de acceso, cambios y excepciones de datos.</p>
        </div>
      </header>

      <div className={styles.tabs}>
        <button className={`${styles.tab} ${styles.active}`}>Pendientes (2)</button>
        <button className={styles.tab}>Mis Solicitudes</button>
        <button className={styles.tab}>Historial</button>
      </div>

      <div className={styles.grid}>
        {requests.map(req => (
          <div key={req.id} className={styles.card}>
            <div className={styles.cardHeader}>
              <span className={`${styles.badge} ${styles[req.type.toLowerCase()]}`}>{req.type}</span>
              <span className={styles.id}>{req.id}</span>
            </div>
            <h3 className={styles.cardTitle}>{req.title}</h3>
            <div className={styles.cardMeta}>
              <div className={styles.metaItem}>
                <User size={14} />
                <span>{req.requester}</span>
              </div>
              <div className={styles.metaItem}>
                <Clock size={14} />
                <span>{req.date}</span>
              </div>
            </div>
            <div className={styles.cardFooter}>
              <div className={`${styles.status} ${styles[req.status.toLowerCase().replace(' ', '')]}`}>
                {req.status === 'Pendiente' ? <Clock size={14} /> : 
                 req.status === 'Aprobado' ? <CheckCircle2 size={14} /> : 
                 <ArrowUpRight size={14} />}
                {req.status}
              </div>
              <div className={styles.actions}>
                <button className={styles.approveBtn}>Aprobar</button>
                <button className={styles.rejectBtn}>Rechazar</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
