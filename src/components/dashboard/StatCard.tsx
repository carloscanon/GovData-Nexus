import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import styles from './StatCard.module.css';

interface StatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  trend: number;
  trendLabel: string;
  color: string;
}

export default function StatCard({ title, value, icon: Icon, trend, trendLabel, color }: StatCardProps) {
  const isPositive = trend > 0;

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.iconBox} style={{ backgroundColor: `${color}10`, color }}>
          <Icon size={24} />
        </div>
        <div className={styles.trend}>
          {isPositive ? <TrendingUp size={16} color="#10b981" /> : <TrendingDown size={16} color="#ef4444" />}
          <span style={{ color: isPositive ? '#10b981' : '#ef4444' }}>
            {Math.abs(trend)}%
          </span>
        </div>
      </div>
      <div className={styles.body}>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.value}>{value}</p>
        <p className={styles.label}>{trendLabel}</p>
      </div>
    </div>
  );
}
