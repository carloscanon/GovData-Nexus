'use client';

import React, { useState } from 'react';
import { TENANT_MODULES, ModuleDefinition } from '@/lib/moduleRegistry';
import { Package, Zap, FlaskConical } from 'lucide-react';

const STATUS_STYLES: Record<string, { bg: string; color: string; border: string; label: string; Icon: React.ElementType }> = {
  stable: { bg: 'rgba(16,185,129,0.08)', color: '#10b981', border: 'rgba(16,185,129,0.25)', label: 'Stable', Icon: Package },
  beta:   { bg: 'rgba(139,92,246,0.08)', color: '#8b5cf6', border: 'rgba(139,92,246,0.25)', label: 'Beta',   Icon: FlaskConical },
  alpha:  { bg: 'rgba(245,158,11,0.08)', color: '#f59e0b', border: 'rgba(245,158,11,0.25)', label: 'Alpha',  Icon: Zap },
};

// Simulated enabledCount per module (would come from DB in a real app)
const ENABLED_COUNTS: Record<string, number> = {
  launchpad: 32, journey: 12, appstore: 28, 'command-center': 29,
  normativas: 18, metadata: 21, catalog: 24, quality: 18,
  policies: 16, team: 27, committees: 11, workflows: 15,
  maturity: 14, simulator: 9,
};

export default function ModulesPage() {
  const [search, setSearch] = useState('');

  const filtered = TENANT_MODULES.filter(m =>
    m.label.toLowerCase().includes(search.toLowerCase()) ||
    m.description.toLowerCase().includes(search.toLowerCase()) ||
    m.key.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: '2rem', fontFamily: 'Inter, sans-serif', color: '#cbd5e1' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.4rem' }}>
          Catálogo de Módulos
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.2rem' }}>
          {TENANT_MODULES.length} módulos disponibles — se actualiza automáticamente al registrar nuevos módulos en el sistema.
        </p>

        <div style={{ position: 'relative', maxWidth: '400px' }}>
          <input
            type="text"
            placeholder="Buscar módulo…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%', padding: '10px 16px 10px 40px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '10px', color: '#f8fafc',
              outline: 'none', fontSize: '0.9rem',
              boxSizing: 'border-box'
            }}
          />
          <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#475569', pointerEvents: 'none' }}>🔍</span>
        </div>
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {filtered.map((mod: ModuleDefinition) => {
          const statusKey = mod.status ?? 'stable';
          const s = STATUS_STYLES[statusKey];
          const enabledCount = ENABLED_COUNTS[mod.key] ?? 0;

          return (
            <div
              key={mod.key}
              style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '16px',
                padding: '24px',
                display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                transition: 'all 0.2s',
                cursor: 'default'
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.border = '1px solid rgba(59,130,246,0.3)';
                (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.2)';
                (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.border = '1px solid rgba(255,255,255,0.06)';
                (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                (e.currentTarget as HTMLElement).style.transform = 'none';
              }}
            >
              <div>
                {/* Status Badge */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: '5px',
                    padding: '3px 10px', borderRadius: '20px',
                    background: s.bg, color: s.color, border: `1px solid ${s.border}`,
                    fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em'
                  }}>
                    <s.Icon size={11} />
                    {s.label}
                  </span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc' }}>
                    {mod.basePrice ?? '—'}
                  </span>
                </div>

                {/* Title */}
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc', marginBottom: '8px' }}>
                  {mod.label}
                </h3>
                <p style={{ fontSize: '0.83rem', color: '#64748b', lineHeight: 1.5, marginBottom: '20px' }}>
                  {mod.description}
                </p>
              </div>

              {/* Footer */}
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.78rem', color: '#475569', fontWeight: 500 }}>
                  <strong style={{ color: '#94a3b8' }}>{enabledCount}</strong> empresas activas
                </span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button style={{
                    padding: '5px 12px', borderRadius: '7px', fontSize: '0.78rem', fontWeight: 600,
                    border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#94a3b8', cursor: 'pointer'
                  }}>
                    Configurar
                  </button>
                  <button style={{
                    padding: '5px 12px', borderRadius: '7px', fontSize: '0.78rem', fontWeight: 700,
                    border: 'none', background: 'linear-gradient(135deg, #3b82f6, #6366f1)', color: '#fff', cursor: 'pointer'
                  }}>
                    Administrar
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#475569' }}>
          <Package size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
          <p>No se encontraron módulos para &quot;{search}&quot;</p>
        </div>
      )}
    </div>
  );
}
