'use client';

import React from 'react';
import { LucideIcon, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import styles from './StatCard.module.css';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: number;
  trendLabel?: string;
  color?: string;
}

export default function StatCard({ title, value, icon: Icon, trend, trendLabel, color = 'var(--primary)' }: StatCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.iconContainer} style={{ backgroundColor: `${color}15`, color: color }}>
          <Icon size={20} />
        </div>
        {trend !== undefined && (
          <div className={`${styles.trend} ${trend >= 0 ? styles.positive : styles.negative}`}>
            {trend >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            <span>{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
      <div className={styles.body}>
        <h3 className={styles.value}>{value}</h3>
        <p className={styles.title}>{title}</p>
        {trendLabel && <p className={styles.trendLabel}>{trendLabel}</p>}
      </div>
    </div>
  );
}
