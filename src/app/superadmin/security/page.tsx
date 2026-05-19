'use client';

import React from 'react';
import { Shield, Lock, Key, Terminal } from 'lucide-react';

export default function SaaSSecurityPage() {
  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div>
        <h1 className="sa-title">Seguridad y RLS</h1>
        <p className="sa-subtitle">Garantiza el aislamiento absoluto de los datos de tus clientes usando Row Level Security (RLS) en PostgreSQL.</p>
      </div>

      {/* RLS Explanation Card */}
      <div className="sa-card-panel" style={{ position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div className="sa-widget-icon-container">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 800, color: '#ffffff' }}>Aislamiento a Nivel de Base de Datos (Tenant Isolation)</h3>
              <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b', marginTop: '0.15rem' }}>Tus consultas filtran automáticamente por el ID del tenant mediante políticas RLS en Supabase.</p>
            </div>
          </div>
          <span className="sa-badge sa-badge-green">
            Activo & Forzado
          </span>
        </div>

        {/* Code Block for RLS */}
        <div style={{ backgroundColor: '#050b14', border: '1px solid #16223f', borderRadius: '12px', padding: '1.25rem', fontFamily: 'monospace', fontSize: '0.85rem', color: '#cbd5e1', position: 'relative', overflowX: 'auto' }}>
          <div style={{ position: 'absolute', top: '1rem', right: '1rem', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.65rem', color: '#64748b', backgroundColor: '#090f1d', padding: '0.25rem 0.5rem', borderRadius: '4px', border: '1px solid #16223f' }}>
            <Terminal className="w-3.5 h-3.5" />
            <span>PostgreSQL</span>
          </div>
          <p style={{ color: '#64748b', marginBottom: '0.5rem' }}>-- 1. Crear política de aislamiento Multi-Tenant para catálogo</p>
          <p><span style={{ color: '#3b82f6' }}>CREATE POLICY</span> <span style={{ color: '#10b981' }}>"Isolation Policy catalog"</span></p>
          <p><span style={{ color: '#3b82f6' }}>ON</span> public.catalog_assets</p>
          <p><span style={{ color: '#3b82f6' }}>FOR ALL</span></p>
          <p><span style={{ color: '#3b82f6' }}>USING</span> (</p>
          <p style={{ paddingLeft: '1.5rem' }}>tenant_id = (auth.jwt() -&gt; <span style={{ color: '#fbbf24' }}>'app_metadata'</span> -&gt;&gt; <span style={{ color: '#fbbf24' }}>'tenant_id'</span>)::uuid</p>
          <p>);</p>
        </div>
      </div>

      {/* Security controls & actions */}
      <div className="sa-card-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
        <div className="sa-card" style={{ minHeight: '220px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <Lock className="w-5 h-5 text-indigo-400" />
              <h4 style={{ margin: 0, fontWeight: 700, color: '#ffffff' }}>Llaves de API Globales</h4>
            </div>
            <p style={{ fontSize: '0.875rem', color: '#94a3b8', lineHeight: 1.5 }}>
              Las llaves de API permiten a tus clientes integrar GovData Nexus con sus propios flujos CI/CD y automatizaciones.
            </p>
          </div>
          <button className="sa-btn sa-btn-secondary" style={{ width: '100%', marginTop: '1.5rem' }}>
            Administrar Llaves de API
          </button>
        </div>

        <div className="sa-card" style={{ minHeight: '220px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <Key className="w-5 h-5 text-emerald-400" />
              <h4 style={{ margin: 0, fontWeight: 700, color: '#ffffff' }}>SSO & Autenticación SAML</h4>
            </div>
            <p style={{ fontSize: '0.875rem', color: '#94a3b8', lineHeight: 1.5 }}>
              Habilita Single Sign-On (SSO) para que tus clientes Enterprise puedan autenticarse usando Okta, Azure AD o Auth0.
            </p>
          </div>
          <button className="sa-btn sa-btn-secondary" style={{ width: '100%', marginTop: '1.5rem' }}>
            Configurar SSO / IDP
          </button>
        </div>
      </div>
    </div>
  );
}
