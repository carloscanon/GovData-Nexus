'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Search, 
  Database, 
  Cloud, 
  ShieldCheck, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  Network,
  Server
} from 'lucide-react';
import styles from './AutoScanModal.module.css';

interface AutoScanModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SOURCES = [
  { id: 'aws', name: 'AWS S3 / Redshift', icon: Cloud, color: '#FF9900' },
  { id: 'azure', name: 'Azure Data Lake', icon: Cloud, color: '#0089D6' },
  { id: 'sql', name: 'SQL Server Prod', icon: Database, color: '#CC2927' },
  { id: 'oracle', name: 'Oracle ERP', icon: Server, color: '#F80000' },
];

export default function AutoScanModal({ isOpen, onClose }: AutoScanModalProps) {
  const [step, setStep] = useState<'source' | 'scanning' | 'results'>('source');
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const startScan = (id: string) => {
    setSelectedSource(id);
    setStep('scanning');
    setProgress(0);
  };

  useEffect(() => {
    if (step === 'scanning') {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => setStep('results'), 500);
            return 100;
          }
          return prev + 2;
        });
      }, 50);
      return () => clearInterval(interval);
    }
  }, [step]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className={styles.overlay}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={styles.modal}
          >
            <header className={styles.header}>
              <div>
                <h2>Escaneo Automático</h2>
                <p>Descubre nuevos activos de datos mediante IA y conectores nativos.</p>
              </div>
              <button onClick={onClose} className={styles.closeBtn}><X size={20} /></button>
            </header>

            <div className={styles.content}>
              {step === 'source' && (
                <div className={styles.sourceGrid}>
                  {SOURCES.map(src => (
                    <button 
                      key={src.id} 
                      className={styles.sourceCard}
                      onClick={() => startScan(src.id)}
                    >
                      <div className={styles.sourceIcon} style={{ backgroundColor: src.color + '15', color: src.color }}>
                        <src.icon size={24} />
                      </div>
                      <div className={styles.sourceInfo}>
                        <h4>{src.name}</h4>
                        <span>Conector v2.1</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {step === 'scanning' && (
                <div className={styles.scanningView}>
                  <div className={styles.loaderWrapper}>
                    <Loader2 size={48} className={styles.spin} />
                    <div className={styles.progressRing}>
                      <span>{progress}%</span>
                    </div>
                  </div>
                  <h3>Analizando Estructuras...</h3>
                  <p>Nexus AI está mapeando tablas, relaciones y detectando datos sensibles en {selectedSource}.</p>
                  <div className={styles.progressBar}>
                    <div className={styles.progressFill} style={{ width: `${progress}%` }} />
                  </div>
                  <div className={styles.log}>
                    <p>› Conectando a instancia...</p>
                    {progress > 30 && <p>› Leyendo metadatos de información técnica...</p>}
                    {progress > 60 && <p>› Aplicando algoritmos de detección de PII...</p>}
                    {progress > 85 && <p>› Clasificando activos encontrados...</p>}
                  </div>
                </div>
              )}

              {step === 'results' && (
                <div className={styles.resultsView}>
                  <div className={styles.resultHeader}>
                    <CheckCircle2 size={40} color="#10b981" />
                    <h3>¡Escaneo Completado!</h3>
                    <p>Se han identificado 4 nuevos activos potenciales.</p>
                  </div>
                  <div className={styles.resultList}>
                    <div className={styles.resultItem}>
                      <div className={styles.resInfo}>
                        <strong>TBL_NOMINA_2024</strong>
                        <span>Contiene datos sensibles (Salarios, IDs)</span>
                      </div>
                      <button className={styles.importBtn}>Importar</button>
                    </div>
                    <div className={styles.resultItem}>
                      <div className={styles.resInfo}>
                        <strong>VW_CLIENTES_ACTIVOS</strong>
                        <span>Relacionado con Maestro de Clientes</span>
                      </div>
                      <button className={styles.importBtn}>Importar</button>
                    </div>
                  </div>
                  <button className={styles.finishBtn} onClick={onClose}>Finalizar y Ver Catálogo</button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
