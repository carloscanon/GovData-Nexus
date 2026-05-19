'use client';

import React, { useState } from 'react';
import { usePlatform, SaaSPlan } from '@/contexts/PlatformContext';
import { Plus, Edit, X, Save, Check, Users, HardDrive, Zap, Shield, BookOpen, GitBranch, Star, BarChart2 } from 'lucide-react';

const ALL_MODULES = [
  { id: 'catalog', label: 'Catálogo de Datos', icon: <BookOpen style={{ width: 16, height: 16 }} /> },
  { id: 'quality', label: 'Calidad de Datos', icon: <Check style={{ width: 16, height: 16 }} /> },
  { id: 'workflows', label: 'Flujos de Trabajo', icon: <GitBranch style={{ width: 16, height: 16 }} /> },
  { id: 'security', label: 'Seguridad y RLS', icon: <Shield style={{ width: 16, height: 16 }} /> },
  { id: 'team', label: 'Equipo y Roles', icon: <Users style={{ width: 16, height: 16 }} /> },
  { id: 'maturity', label: 'Madurez de Datos', icon: <BarChart2 style={{ width: 16, height: 16 }} /> },
];

export default function SaaSPlanesPage() {
  const { plans, updatePlan } = usePlatform();
  const [editingPlan, setEditingPlan] = useState<SaaSPlan | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan) return;
    updatePlan(editingPlan.id, editingPlan);
    setEditingPlan(null);
    showToast(`Plan "${editingPlan.name}" actualizado con éxito.`);
  };

  const toggleModule = (mod: string) => {
    if (!editingPlan) return;
    const mods = editingPlan.modules.includes(mod)
      ? editingPlan.modules.filter(m => m !== mod)
      : [...editingPlan.modules, mod];
    setEditingPlan({ ...editingPlan, modules: mods });
  };

  const planColor = (name: string) =>
    name === 'Enterprise' ? '#2563eb' : name === 'Professional' ? '#059669' : '#b45309';

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 9999, padding: '1rem 1.5rem', borderRadius: '14px', fontWeight: 600, fontSize: '0.875rem', background: 'linear-gradient(135deg,#10b981,#059669)', color: '#fff', boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}>
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="sa-title-area">
        <div>
          <h1 className="sa-title">Gestión de Planes SaaS</h1>
          <p className="sa-subtitle">Configura precios, límites y módulos disponibles por plan.</p>
        </div>
      </div>

      {/* Plans Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
        {plans.map(plan => (
          <div key={plan.id} className="sa-card" style={{ borderColor: planColor(plan.name), minHeight: 520, position: 'relative' }}>
            {plan.name === 'Enterprise' && (
              <div style={{ position: 'absolute', top: '-1px', left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(90deg,#2563eb,#6366f1)', color: '#fff', fontSize: '0.65rem', fontWeight: 800, padding: '0.25rem 1rem', borderRadius: '0 0 10px 10px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                ⭐ Popular
              </div>
            )}

            {/* Plan Header */}
            <div className="sa-card-header">
              <div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', margin: 0 }}>{plan.name}</h3>
                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>ID: {plan.id}</span>
              </div>
              <span className={`sa-badge ${plan.active ? 'sa-badge-green' : 'sa-badge-red'}`}>{plan.active ? 'Activo' : 'Inactivo'}</span>
            </div>

            {/* Price */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
                <span style={{ fontSize: '2.25rem', fontWeight: 900, color: '#fff' }}>
                  {plan.name === 'Enterprise' ? 'Custom' : `$${plan.priceMonthly}`}
                </span>
                {plan.name !== 'Enterprise' && <span style={{ color: '#64748b', fontSize: '0.875rem' }}>/mes</span>}
              </div>
              <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
                Anual: ${plan.priceAnnually}/año · Ahorro ${(plan.priceMonthly * 12 - plan.priceAnnually)}
              </span>
            </div>

            {/* Limits */}
            <div style={{ borderTop: '1px solid #16223f', paddingTop: '1.25rem', marginBottom: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <h4 style={{ fontSize: '0.65rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 0.5rem' }}>Límites y Acceso</h4>
              {[
                { label: 'Usuarios', value: plan.maxUsers === 9999 ? 'Ilimitado' : plan.maxUsers, icon: <Users style={{ width: 14, height: 14, color: '#3b82f6' }} /> },
                { label: 'Escaneos/mes', value: plan.maxScans === 9999 ? 'Ilimitado' : plan.maxScans, icon: <Zap style={{ width: 14, height: 14, color: '#6366f1' }} /> },
                { label: 'Almacenamiento', value: `${plan.storageGb} GB`, icon: <HardDrive style={{ width: 14, height: 14, color: '#10b981' }} /> },
                { label: 'Soporte Prioritario', value: plan.prioritySupport ? 'Sí (24/7 SLA)' : 'Estándar' },
                { label: 'Acceso API', value: plan.apiAccess ? 'Habilitado' : 'No incluido' },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
                  <span style={{ color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    {item.icon}{item.label}
                  </span>
                  <span style={{ fontWeight: 600, color: '#fff' }}>{item.value}</span>
                </div>
              ))}
            </div>

            {/* Modules */}
            <div style={{ borderTop: '1px solid #16223f', paddingTop: '1.25rem', marginBottom: '1.5rem' }}>
              <h4 style={{ fontSize: '0.65rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 0.75rem' }}>Módulos Incluidos</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {plan.modules.map(mod => (
                  <span key={mod} className="sa-badge sa-badge-blue" style={{ textTransform: 'capitalize', fontSize: '0.7rem' }}>{mod}</span>
                ))}
              </div>
            </div>

            <button onClick={() => setEditingPlan({ ...plan })} className="sa-btn sa-btn-secondary" style={{ width: '100%', marginTop: 'auto' }}>
              <Edit style={{ width: 16, height: 16 }} />
              <span>Editar Plan</span>
            </button>
          </div>
        ))}
      </div>

      {/* EDIT PLAN MODAL */}
      {editingPlan && (
        <div className="sa-modal-overlay" onClick={() => setEditingPlan(null)}>
          <div className="sa-modal" style={{ maxWidth: 640 }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 className="sa-modal-title" style={{ marginBottom: 0 }}>Editar Plan: {editingPlan.name}</h3>
              <button onClick={() => setEditingPlan(null)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                <X style={{ width: 22, height: 22 }} />
              </button>
            </div>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Pricing */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="sa-form-group">
                  <label className="sa-label">Precio Mensual (USD)</label>
                  <input type="number" value={editingPlan.priceMonthly} onChange={e => setEditingPlan({ ...editingPlan, priceMonthly: Number(e.target.value) })} className="sa-input" min={0} />
                </div>
                <div className="sa-form-group">
                  <label className="sa-label">Precio Anual (USD)</label>
                  <input type="number" value={editingPlan.priceAnnually} onChange={e => setEditingPlan({ ...editingPlan, priceAnnually: Number(e.target.value) })} className="sa-input" min={0} />
                </div>
              </div>

              {/* Limits */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div className="sa-form-group">
                  <label className="sa-label">Máx. Usuarios</label>
                  <input type="number" value={editingPlan.maxUsers === 9999 ? '' : editingPlan.maxUsers} placeholder="9999 = ilimitado" onChange={e => setEditingPlan({ ...editingPlan, maxUsers: e.target.value === '' ? 9999 : Number(e.target.value) })} className="sa-input" min={1} />
                </div>
                <div className="sa-form-group">
                  <label className="sa-label">Máx. Escaneos/mes</label>
                  <input type="number" value={editingPlan.maxScans === 9999 ? '' : editingPlan.maxScans} placeholder="9999 = ilimitado" onChange={e => setEditingPlan({ ...editingPlan, maxScans: e.target.value === '' ? 9999 : Number(e.target.value) })} className="sa-input" min={1} />
                </div>
                <div className="sa-form-group">
                  <label className="sa-label">Almacenamiento (GB)</label>
                  <input type="number" value={editingPlan.storageGb} onChange={e => setEditingPlan({ ...editingPlan, storageGb: Number(e.target.value) })} className="sa-input" min={1} />
                </div>
              </div>

              {/* Toggles */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {[
                  { key: 'prioritySupport', label: 'Soporte Prioritario 24/7' },
                  { key: 'apiAccess', label: 'Acceso a APIs REST' },
                  { key: 'active', label: 'Plan Activo (visible)' },
                ].map(toggle => (
                  <label key={toggle.key} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', background: '#050b14', border: '1px solid #16223f', borderRadius: '12px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={(editingPlan as any)[toggle.key]}
                      onChange={e => setEditingPlan({ ...editingPlan, [toggle.key]: e.target.checked } as SaaSPlan)}
                      style={{ width: 18, height: 18, accentColor: '#3b82f6', cursor: 'pointer' }}
                    />
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#cbd5e1' }}>{toggle.label}</span>
                  </label>
                ))}
              </div>

              {/* Modules */}
              <div>
                <label className="sa-label" style={{ display: 'block', marginBottom: '0.75rem' }}>Módulos Incluidos en el Plan</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  {ALL_MODULES.map(mod => {
                    const active = editingPlan.modules.includes(mod.id);
                    return (
                      <button
                        key={mod.id}
                        type="button"
                        onClick={() => toggleModule(mod.id)}
                        style={{ padding: '0.75rem 1rem', borderRadius: '12px', border: `1px solid ${active ? '#2563eb' : '#16223f'}`, background: active ? 'rgba(37,99,235,0.1)' : '#050b14', color: active ? '#3b82f6' : '#64748b', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s' }}
                      >
                        {mod.icon}
                        {mod.label}
                        {active && <span style={{ marginLeft: 'auto', color: '#10b981', fontSize: '0.65rem' }}>✓</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="sa-modal-footer">
                <button type="button" onClick={() => setEditingPlan(null)} className="sa-btn sa-btn-secondary">Cancelar</button>
                <button type="submit" className="sa-btn sa-btn-primary">
                  <Save style={{ width: 16, height: 16 }} />
                  <span>Guardar Plan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
