'use client';

import React from 'react';
import { 
  BarChart3, 
  Target, 
  TrendingUp, 
  ChevronRight,
  Zap,
  Shield,
  Search,
  Users
} from 'lucide-react';
import styles from './maturity.module.css';

const dimensions = [
  { id: 1, name: 'Estrategia', score: 85, icon: Target },
  { id: 2, name: 'Organización', score: 70, icon: Users },
  { id: 3, name: 'Calidad', score: 65, icon: TrendingUp },
  { id: 4, name: 'Arquitectura', score: 60, icon: BarChart3 },
  { id: 5, name: 'Seguridad', score: 80, icon: Shield },
];

export default function Maturity() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <h1>Madurez de Gobierno</h1>
          <p>Evaluación continua de las capacidades de gobierno de datos de la organización.</p>
        </div>
      </header>

      <div className={styles.scoreBanner}>
        <div className={styles.bannerInfo}>
          <div className={styles.globalScore}>
            <span>Nivel de Madurez Global</span>
            <h2>64%</h2>
            <div className={styles.levelBadge}>Nivel 3: Definido</div>
          </div>
          <div className={styles.benchmark}>
            <p>Estás un 15% por encima del promedio de la industria en el sector financiero.</p>
            <button className={styles.roadmapBtn}>Ver Roadmap 90 Días</button>
          </div>
        </div>
      </div>

      <div className={styles.dimensionsGrid}>
        {dimensions.map(dim => (
          <div key={dim.id} className={styles.dimCard}>
            <div className={styles.dimIcon}>
              <dim.icon size={24} />
            </div>
            <div className={styles.dimContent}>
              <h3>{dim.name}</h3>
              <div className={styles.progressRow}>
                <div className={styles.barContainer}>
                  <div className={styles.bar} style={{ width: `${dim.score}%` }}></div>
                </div>
                <span>{dim.score}%</span>
              </div>
            </div>
            <ChevronRight size={20} className={styles.arrow} />
          </div>
        ))}
      </div>

      <div className={styles.actionsSection}>
        <h3>Acciones Recomendadas para Subir de Nivel</h3>
        <div className={styles.actionsList}>
          <div className={styles.actionItem}>
            <Zap size={20} />
            <div className={styles.actionText}>
              <h4>Automatizar Calidad en Ventas</h4>
              <p>Implementar reglas automáticas en el Maestro de Clientes para subir 5% en Calidad.</p>
            </div>
          </div>
          <div className={styles.actionItem}>
            <Users size={20} />
            <div className={styles.actionText}>
              <h4>Asignar Stewards en Finanzas</h4>
              <p>Faltan 2 responsables en el dominio financiero para completar la Organización.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
