'use client';

import React from 'react';
import { X, CheckCircle2, AlertTriangle, XCircle, BarChart3, Database, Download } from 'lucide-react';
import styles from './ExecutionSummaryModal.module.css';

interface ExecutionSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDownload: () => void;
  stats: any;
  results: any[];
  assetName: string;
}

export default function ExecutionSummaryModal({ isOpen, onClose, onDownload, stats, results, assetName }: ExecutionSummaryModalProps) {
  if (!isOpen) return null;

  const totalAnalyzed = results.reduce((acc, curr) => acc + (curr.total || 0), 0);
  const totalIssues = results.reduce((acc, curr) => acc + (curr.affected || 0), 0);
  const globalHealth = totalAnalyzed > 0 ? (((totalAnalyzed - totalIssues) / totalAnalyzed) * 100).toFixed(1) : '0.0';

  const getHealthColor = (val: number) => {
    if (val >= 95) return styles.success;
    if (val >= 80) return styles.warning;
    return styles.danger;
  };

  const getIcon = (pct: number) => {
    if (pct >= 95) return <CheckCircle2 size={24} />;
    if (pct >= 80) return <AlertTriangle size={24} />;
    return <XCircle size={24} />;
  };

  const getIconClass = (pct: number) => {
    if (pct >= 95) return styles.good;
    if (pct >= 80) return styles.warn;
    return styles.bad;
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <header className={styles.header}>
          <div className={styles.titleIcon}>
            <BarChart3 size={24} color="white" />
          </div>
          <div className={styles.headerContent}>
            <h2>Resumen de Ejecución: {assetName || 'Entorno DEMO'}</h2>
            <p>Se ha completado el análisis de calidad de datos. Revisa los resultados a continuación.</p>
          </div>
          <button onClick={onClose} className={styles.closeBtn}><X size={20} /></button>
        </header>

        <div className={styles.content}>
          <div className={styles.kpiGrid}>
            <div className={styles.kpiCard}>
              <span className={styles.kpiLabel}><Database size={16} /> Registros Evaluados</span>
              <span className={styles.kpiValue}>{totalAnalyzed.toLocaleString()}</span>
            </div>
            <div className={styles.kpiCard}>
              <span className={styles.kpiLabel}><AlertTriangle size={16} /> Incidentes Detectados</span>
              <span className={`${styles.kpiValue} ${totalIssues > 0 ? styles.danger : styles.success}`}>
                {totalIssues.toLocaleString()}
              </span>
            </div>
            <div className={styles.kpiCard}>
              <span className={styles.kpiLabel}><CheckCircle2 size={16} /> Salud Global</span>
              <span className={`${styles.kpiValue} ${getHealthColor(Number(globalHealth))}`}>
                {globalHealth}%
              </span>
            </div>
          </div>

          <div>
            <h3 className={styles.sectionTitle}>Detalle por Regla Aplicada</h3>
            <div className={styles.resultsList}>
              {results.length === 0 ? (
                <p>No hay resultados detallados para mostrar.</p>
              ) : (
                results.map((res, idx) => {
                  const pctNum = parseFloat(res.pct);
                  return (
                    <div key={idx} className={styles.resultItem}>
                      <div className={`${styles.resultIcon} ${getIconClass(pctNum)}`}>
                        {getIcon(pctNum)}
                      </div>
                      <div className={styles.resultDetails}>
                        <div className={styles.resultName}>{res.name}</div>
                        <div className={styles.resultMetrics}>
                          {res.fieldError ? (
                            <div className={styles.errorMsg} style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '4px', fontStyle: 'italic' }}>
                              {res.status}
                            </div>
                          ) : (
                            <>
                              <div className={styles.metricBadge}>
                                Evaluados: <span>{res.total}</span>
                              </div>
                              <div className={styles.metricBadge}>
                                Cumplen: <span>{res.compliant}</span>
                              </div>
                              <div className={styles.metricBadge} style={{ color: res.affected > 0 ? '#ef4444' : 'inherit' }}>
                                Fallan: <span>{res.affected}</span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                      <div className={`${styles.resultPct} ${getHealthColor(pctNum)}`}>
                        {res.pct}%
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <footer className={styles.footer}>
          <button onClick={onDownload} className={styles.btnDownload}>
            <Download size={18} /> Descargar Reporte (Excel)
          </button>
          <button onClick={onClose} className={styles.btnPrimary}>
            Continuar al Dashboard
          </button>
        </footer>
      </div>
    </div>
  );
}
