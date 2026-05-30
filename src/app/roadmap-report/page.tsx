'use client';

import React, { useEffect, useState } from 'react';
import { usePlatform } from '@/contexts/PlatformContext';
import { supabase } from '@/lib/supabase';
import { Printer, Database } from 'lucide-react';
import styles from './report.module.css';

export default function RoadmapReport() {
  const { currentTenant } = usePlatform();
  const [loading, setLoading] = useState(true);
  const [tasksByPhase, setTasksByPhase] = useState<Record<string, any[]>>({});
  const [maturityScore, setMaturityScore] = useState(0);

  useEffect(() => {
    if (!currentTenant?.id) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const [
          { data: maturity },
          { data: workflows }
        ] = await Promise.all([
          supabase.from('maturity_assessments').select('score').eq('tenant_id', currentTenant.id).order('assessment_date', { ascending: false }).limit(1),
          supabase.from('workflow_requests').select('*').eq('tenant_id', currentTenant.id).eq('category', 'Roadmap Iniciativa')
        ]);

        if (maturity && maturity.length > 0) {
          setMaturityScore(maturity[0].score);
        }

        const grouped = {
          'Fase 1': [],
          'Fase 2': [],
          'Fase 3': []
        } as Record<string, any[]>;

        if (workflows) {
          workflows.forEach(w => {
            const phase = w.current_step || 'Fase 1';
            if (!grouped[phase]) grouped[phase] = [];
            grouped[phase].push(w);
          });
        }

        setTasksByPhase(grouped);
      } catch (e) {
        console.error('Error fetching roadmap:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentTenant?.id]);

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Generando reporte...</div>;
  }

  const dateStr = new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className={styles.container}>
      <header className={styles.printHeader}>
        <div className={styles.logo}>
          <Database size={32} color="#4f46e5" />
          GovData Nexus
        </div>
        <div className={styles.docTitle}>
          <h1>Plan Estratégico de 90 Días</h1>
          <p>Generado el {dateStr}</p>
        </div>
      </header>

      <section className={styles.introSection}>
        <h2>Resumen Ejecutivo</h2>
        <p>
          Este documento detalla las iniciativas estratégicas generadas a partir de la Evaluación de Madurez Inicial. 
          Su organización ha obtenido un puntaje de madurez base del <strong>{maturityScore}%</strong>. 
          Las siguientes tareas han sido inyectadas en la Mesa de Servicio (Workflows) para su gestión, seguimiento y cumplimiento obligatorio durante los próximos 90 días.
        </p>
      </section>

      {['Fase 1', 'Fase 2', 'Fase 3'].map((phase, idx) => {
        const tasks = tasksByPhase[phase] || [];
        if (tasks.length === 0) return null;

        return (
          <div key={idx} className={styles.phaseContainer}>
            <div className={styles.phaseHeader}>
              <span className={styles.phaseTitle}>{phase} - Prioridad {idx === 0 ? 'Alta (Mes 1)' : idx === 1 ? 'Media (Mes 2)' : 'Media-Baja (Mes 3)'}</span>
              <span style={{ fontSize: '0.9rem', color: '#64748b' }}>{tasks.length} Tareas</span>
            </div>
            
            <table className={styles.taskTable}>
              <thead>
                <tr>
                  <th style={{ width: '45%' }}>Iniciativa</th>
                  <th style={{ width: '25%' }}>Rol Responsable</th>
                  <th style={{ width: '15%' }}>Estado Actual</th>
                  <th style={{ width: '15%' }}>Fecha Creación</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr key={task.id}>
                    <td>
                      <span className={styles.taskTitle}>{task.title.replace(`[Roadmap ${phase}] `, '')}</span>
                      <span className={styles.taskDesc}>{task.description}</span>
                    </td>
                    <td>{task.assigned_to || 'Sin asignar'}</td>
                    <td>
                      <span className={`${styles.statusBadge} ${styles['status-' + (task.status === 'En Progreso' ? 'Progreso' : task.status)] || styles['status-Pendiente']}`}>
                        {task.status}
                      </span>
                    </td>
                    <td>{new Date(task.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })}

      <button className={styles.printButton} onClick={() => window.print()}>
        <Printer size={20} />
        Imprimir / Guardar PDF
      </button>
    </div>
  );
}
