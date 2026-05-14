'use client';

import React from 'react';
import { 
  Users, 
  UserPlus, 
  Shield, 
  Mail, 
  MoreVertical,
  Briefcase,
  Globe
} from 'lucide-react';
import styles from './team.module.css';

const members = [
  { id: 1, name: 'Carlos Director', role: 'CDO', area: 'Corporativo', status: 'Activo', email: 'carlos@empresa.com' },
  { id: 2, name: 'Ana Garcia', role: 'Data Steward', area: 'Ventas', status: 'Activo', email: 'ana@empresa.com' },
  { id: 3, name: 'Luis Martinez', role: 'Data Owner', area: 'Marketing', status: 'Activo', email: 'luis@empresa.com' },
  { id: 4, name: 'Sofia Rodriguez', role: 'Data Custodian', area: 'TI', status: 'Activo', email: 'sofia@empresa.com' },
  { id: 5, name: 'Elena Gomez', role: 'Auditor', area: 'Riesgo', status: 'Fuera', email: 'elena@empresa.com' },
];

export default function Team() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <h1>Roles y Responsables</h1>
          <p>Gestión del equipo de gobierno y asignación de responsabilidades por dominio.</p>
        </div>
        <button className={styles.addBtn}>
          <UserPlus size={18} />
          Invitar Miembro
        </button>
      </header>

      <div className={styles.orgStats}>
        <div className={styles.statCard}>
          <Briefcase size={20} />
          <div>
            <h4>8 Dominios</h4>
            <p>Con dueños asignados</p>
          </div>
        </div>
        <div className={styles.statCard}>
          <Shield size={20} />
          <div>
            <h4>12 Stewards</h4>
            <p>Operativos hoy</p>
          </div>
        </div>
        <div className={styles.statCard}>
          <Globe size={20} />
          <div>
            <h4>5 Países</h4>
            <p>Estructura regional</p>
          </div>
        </div>
      </div>

      <div className={styles.grid}>
        {members.map(member => (
          <div key={member.id} className={styles.memberCard}>
            <div className={styles.memberHeader}>
              <div className={styles.avatar}>{member.name.split(' ').map(n => n[0]).join('')}</div>
              <button className={styles.moreBtn}><MoreVertical size={18} /></button>
            </div>
            <div className={styles.memberBody}>
              <h3>{member.name}</h3>
              <span className={styles.roleBadge}>{member.role}</span>
              <div className={styles.memberInfo}>
                <div className={styles.infoItem}>
                  <Briefcase size={14} />
                  <span>{member.area}</span>
                </div>
                <div className={styles.infoItem}>
                  <Mail size={14} />
                  <span>{member.email}</span>
                </div>
              </div>
            </div>
            <div className={styles.memberFooter}>
              <div className={`${styles.status} ${member.status === 'Activo' ? styles.active : styles.away}`}>
                {member.status}
              </div>
              <button className={styles.profileBtn}>Ver Perfil</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
