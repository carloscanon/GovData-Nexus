'use client';

import React, { useState } from 'react';
import { usePlatform, Tenant } from '@/contexts/PlatformContext';
import { Search, Plus, Edit, Trash2, Ban, CheckCircle, UserCheck, DollarSign, Globe, HardDrive, Users, FileText, X, AlertTriangle, Package } from 'lucide-react';
import { useRouter } from 'next/navigation';
import UnifiedModal from '@/components/UnifiedModal';

const ALL_MODULES = ['catalog', 'quality', 'workflows', 'security', 'team', 'maturity'];
const EMPTY_FORM = { name: '', domain: '', nit: '', email: '', phone: '', address: '', city: '', plan: 'Starter' as Tenant['plan'] };

export default function CompaniesManagementPage() {
  const router = useRouter();
  const { tenants, currentTenant, setCurrentTenant, addTenant, updateTenant, deleteTenant, toggleTenantStatus, updateTenantModules, plans } = usePlatform();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlanFilter, setSelectedPlanFilter] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [modulesEditTenant, setModulesEditTenant] = useState<Tenant | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const filtered = tenants.filter(t => {
    const s = searchTerm.toLowerCase();
    const matchSearch = t.name.toLowerCase().includes(s) || t.domain.toLowerCase().includes(s) || (t.nit || '').includes(s);
    const matchPlan = selectedPlanFilter ? t.plan === selectedPlanFilter : true;
    return matchSearch && matchPlan;
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.domain) return;
    setIsSaving(true);
    try {
      await addTenant(form);
      setIsCreateOpen(false);
      setForm({ ...EMPTY_FORM });
      showToast(`Empresa "${form.name}" registrada con éxito.`);
    } catch (e) {
      showToast('Error al registrar la empresa.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTenant) return;
    setIsSaving(true);
    try {
      await updateTenant(editingTenant.id, { ...form });
      setEditingTenant(null);
      showToast('Empresa actualizada correctamente.');
    } catch (e) {
      showToast('Error al actualizar la empresa.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const openEdit = (t: Tenant) => {
    setForm({ name: t.name, domain: t.domain, nit: t.nit || '', email: t.email || '', phone: t.phone || '', address: t.address || '', city: t.city || '', plan: t.plan });
    setEditingTenant(t);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTenant(id);
      setDeleteConfirmId(null);
      showToast('Empresa eliminada.', 'error');
    } catch (e) {
      showToast('Error al eliminar la empresa.', 'error');
    }
  };

  const handleToggle = async (t: Tenant) => {
    try {
      await toggleTenantStatus(t.id);
      showToast(`Empresa ${t.status === 'active' ? 'suspendida' : 'activada'}.`);
    } catch (e) {
      showToast('Error al cambiar estado.', 'error');
    }
  };

  const handleImpersonate = (t: Tenant) => {
    setCurrentTenant(t);
    showToast(`Impersonando: ${t.name}. Redirigiendo...`);
    setTimeout(() => router.push('/'), 1000);
  };

  const toggleModule = async (tenantId: string, mod: string, currentModules: string[]) => {
    const updated = currentModules.includes(mod)
      ? currentModules.filter(m => m !== mod)
      : [...currentModules, mod];
    try {
      await updateTenantModules(tenantId, updated);
    } catch (e) {
      showToast('Error al actualizar módulos.', 'error');
    }
  };

  const planBadge = (plan: string) =>
    plan === 'Enterprise' ? 'sa-badge-blue' : plan === 'Professional' ? 'sa-badge-green' : 'sa-badge-amber';

  const FormFields = () => (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
      <div className="sa-form-group">
        <label className="sa-label" style={{ color: 'var(--modal-text-color, #1e293b)' }}>Nombre de la Empresa *</label>
        <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Ej. Bancolombia" className="sa-input" style={{ background: '#fff', color: '#000' }} />
      </div>
      <div className="sa-form-group">
        <label className="sa-label" style={{ color: 'var(--modal-text-color, #1e293b)' }}>Dominio Personalizado *</label>
        <input required value={form.domain} onChange={e => setForm({ ...form, domain: e.target.value })} placeholder="empresa.govdata.com" className="sa-input" style={{ background: '#fff', color: '#000' }} />
      </div>
      <div className="sa-form-group">
        <label className="sa-label" style={{ color: 'var(--modal-text-color, #1e293b)' }}>NIT</label>
        <input value={form.nit} onChange={e => setForm({ ...form, nit: e.target.value })} placeholder="900.123.456-1" className="sa-input" style={{ background: '#fff', color: '#000' }} />
      </div>
      <div className="sa-form-group">
        <label className="sa-label" style={{ color: 'var(--modal-text-color, #1e293b)' }}>Email de Contacto</label>
        <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="admin@empresa.com" className="sa-input" style={{ background: '#fff', color: '#000' }} />
      </div>
      <div className="sa-form-group">
        <label className="sa-label" style={{ color: 'var(--modal-text-color, #1e293b)' }}>Teléfono</label>
        <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+57 300 000 0000" className="sa-input" style={{ background: '#fff', color: '#000' }} />
      </div>
      <div className="sa-form-group">
        <label className="sa-label" style={{ color: 'var(--modal-text-color, #1e293b)' }}>Plan SaaS</label>
        <select value={form.plan} onChange={e => setForm({ ...form, plan: e.target.value as Tenant['plan'] })} className="sa-select" style={{ background: '#fff', color: '#000' }}>
          <option value="Starter">Starter ($29/mes)</option>
          <option value="Professional">Professional ($99/mes)</option>
          <option value="Enterprise">Enterprise ($499/mes)</option>
        </select>
      </div>
      <div className="sa-form-group">
        <label className="sa-label" style={{ color: 'var(--modal-text-color, #1e293b)' }}>Ciudad</label>
        <input value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} placeholder="Bogotá" className="sa-input" style={{ background: '#fff', color: '#000' }} />
      </div>
      <div className="sa-form-group">
        <label className="sa-label" style={{ color: 'var(--modal-text-color, #1e293b)' }}>Dirección</label>
        <input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="Av. El Dorado #68-20" className="sa-input" style={{ background: '#fff', color: '#000' }} />
      </div>
    </div>
  );

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 9999, padding: '1rem 1.5rem', borderRadius: '14px', fontWeight: 600, fontSize: '0.875rem', background: toast.type === 'success' ? 'linear-gradient(135deg,#10b981,#059669)' : 'linear-gradient(135deg,#ef4444,#dc2626)', color: '#fff', boxShadow: '0 8px 24px rgba(0,0,0,0.4)', animation: 'modalFadeIn 0.3s ease' }}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="sa-title-area" style={{ borderBottom: '1px solid var(--sa-border)', paddingBottom: '16px', marginBottom: '8px' }}>
        <div>
          <h1 className="sa-title">Gestión de Empresas</h1>
          <p className="sa-subtitle">{tenants.length} tenants registrados · {tenants.filter(t => t.status === 'active').length} activos</p>
        </div>
        <button onClick={() => { setForm({ ...EMPTY_FORM }); setIsCreateOpen(true); }} className="sa-btn sa-btn-primary">
          <Plus style={{ width: 18, height: 18 }} />
          <span>Registrar Empresa</span>
        </button>
      </div>

      {/* Filters */}
      <div className="sa-filter-bar">
        <div className="sa-search-wrapper" style={{ gridColumn: 'span 2' }}>
          <Search className="sa-search-icon" style={{ width: 18, height: 18 }} />
          <input type="text" placeholder="Buscar por nombre, dominio o NIT..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="sa-search-input" />
        </div>
        <select value={selectedPlanFilter} onChange={e => setSelectedPlanFilter(e.target.value)} className="sa-select">
          <option value="">Todos los Planes</option>
          <option value="Starter">Starter</option>
          <option value="Professional">Professional</option>
          <option value="Enterprise">Enterprise</option>
        </select>
      </div>

      {/* Tenant Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {filtered.length === 0 && (
          <div className="sa-card" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
            <Building2 style={{ width: 48, height: 48, margin: '0 auto 1rem', opacity: 0.3 }} />
            <p style={{ fontSize: '1rem', fontWeight: 600 }}>No se encontraron empresas</p>
          </div>
        )}
        {filtered.map(t => (
          <div key={t.id} className="sa-card" style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', opacity: t.status === 'suspended' ? 0.7 : 1 }}>
            {/* Identity */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', minWidth: 240 }}>
              <div className="sa-brand-logo" style={{ width: 52, height: 52, fontSize: '1.4rem', fontWeight: 800, color: '#fff', flexShrink: 0 }}>{t.name.charAt(0)}</div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 800, fontSize: '1.05rem', color: '#fff' }}>{t.name}</span>
                  <span className={`sa-badge ${planBadge(t.plan)}`}>{t.plan}</span>
                  {t.status === 'suspended' && <span className="sa-badge sa-badge-red">Suspendido</span>}
                </div>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.25rem', fontSize: '0.75rem', color: '#64748b', flexWrap: 'wrap' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Globe style={{ width: 12, height: 12 }} />{t.domain}</span>
                  {t.nit && <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><FileText style={{ width: 12, height: 12 }} />NIT: {t.nit}</span>}
                  {t.createdAt && <span>Alta: {t.createdAt}</span>}
                </div>
              </div>
            </div>

            {/* Stats */}
            {(() => {
              const planDef = plans.find(p => p.name === t.plan);
              const maxUsersDisp = planDef ? (planDef.maxUsers >= 9999 ? '∞' : planDef.maxUsers) : 'N/A';
              const storageDisp = planDef ? `${planDef.storageGb}GB` : 'N/A';
              const priceDisp = planDef ? `$${planDef.priceMonthly}` : t.monthlyCost;
              return (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 90px)', gap: '0.75rem', background: '#050b14', borderRadius: '12px', padding: '0.75rem 1rem', border: '1px solid #16223f' }}>
                  <div>
                    <div style={{ fontSize: '0.6rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>Usuarios</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem', fontWeight: 600, color: '#f1f5f9', marginTop: '0.2rem' }}>
                      <Users style={{ width: 14, height: 14, color: '#3b82f6' }} />
                      {maxUsersDisp}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.6rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>Storage</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem', fontWeight: 600, color: '#f1f5f9', marginTop: '0.2rem' }}>
                      <HardDrive style={{ width: 14, height: 14, color: '#6366f1' }} />
                      {storageDisp}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.6rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>MRR</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem', fontWeight: 700, color: '#10b981', marginTop: '0.2rem' }}>
                      <DollarSign style={{ width: 14, height: 14 }} />{priceDisp}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
              <button onClick={() => handleImpersonate(t)} className="sa-btn sa-btn-primary" style={{ padding: '0.5rem 0.875rem', fontSize: '0.8rem' }}>
                <UserCheck style={{ width: 16, height: 16 }} /><span>Impersonar</span>
              </button>
              <button onClick={() => setModulesEditTenant(t)} className="sa-btn sa-btn-secondary" style={{ padding: '0.5rem' }} title="Gestionar Módulos">
                <Package style={{ width: 16, height: 16 }} />
              </button>
              <button onClick={() => openEdit(t)} className="sa-btn sa-btn-secondary" style={{ padding: '0.5rem' }} title="Editar">
                <Edit style={{ width: 16, height: 16 }} />
              </button>
              <button onClick={() => handleToggle(t)} className="sa-btn sa-btn-secondary" style={{ padding: '0.5rem', color: t.status === 'active' ? '#f59e0b' : '#10b981' }} title={t.status === 'active' ? 'Suspender' : 'Activar'}>
                {t.status === 'active' ? <Ban style={{ width: 16, height: 16 }} /> : <CheckCircle style={{ width: 16, height: 16 }} />}
              </button>
              <button onClick={() => setDeleteConfirmId(t.id)} className="sa-btn sa-btn-danger" style={{ padding: '0.5rem' }} title="Eliminar">
                <Trash2 style={{ width: 16, height: 16 }} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* CREATE MODAL */}
      <UnifiedModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Registrar Nueva Empresa"
        subtitle="Agrega una nueva empresa para iniciar la provisión del servicio SaaS."
        type="formulario"
        confirmLabel={isSaving ? 'Registrando...' : 'Registrar Empresa'}
        onConfirm={() => {
          const btn = document.getElementById('create-submit-btn');
          if (btn) btn.click();
        }}
      >
        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {FormFields()}
          <button id="create-submit-btn" type="submit" style={{ display: 'none' }} />
        </form>
      </UnifiedModal>

      {/* EDIT MODAL */}
      <UnifiedModal
        isOpen={!!editingTenant}
        onClose={() => setEditingTenant(null)}
        title={`Editar: ${editingTenant?.name || ''}`}
        subtitle="Modifica la información básica y plan de suscripción del tenant."
        type="formulario"
        confirmLabel={isSaving ? 'Guardando...' : 'Guardar Cambios'}
        onConfirm={() => {
          const btn = document.getElementById('edit-submit-btn');
          if (btn) btn.click();
        }}
      >
        <form onSubmit={handleEdit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {FormFields()}
          <button id="edit-submit-btn" type="submit" style={{ display: 'none' }} />
        </form>
      </UnifiedModal>

      {/* DELETE CONFIRM */}
      <UnifiedModal
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        title="¿Eliminar Empresa?"
        subtitle="Esta acción es irreversible y purgará su base de datos."
        type="confirmacion"
        confirmLabel="Sí, eliminar"
        cancelLabel="Cancelar"
        confirmBtnType="danger"
        onConfirm={() => deleteConfirmId && handleDelete(deleteConfirmId)}
      >
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', color: '#1e293b' }}>
          <AlertTriangle size={36} color="#ef4444" style={{ flexShrink: 0 }} />
          <p style={{ margin: 0, fontSize: '0.9rem' }}>
            Se eliminarán de forma permanente todos los usuarios, activos de información, configuraciones y registros asociados a esta empresa.
          </p>
        </div>
      </UnifiedModal>

      {/* MODULES MODAL */}
      <UnifiedModal
        isOpen={!!modulesEditTenant}
        onClose={() => setModulesEditTenant(null)}
        title={`Módulos — ${modulesEditTenant?.name || ''}`}
        subtitle="Activa o desactiva los módulos disponibles para este tenant de manera selectiva."
        type="formulario"
        confirmLabel="Listo"
        onConfirm={() => setModulesEditTenant(null)}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', padding: '8px 0' }}>
          {ALL_MODULES.map(mod => {
            if (!modulesEditTenant) return null;
            const tenant = tenants.find(t => t.id === modulesEditTenant.id)!;
            const active = tenant.modules.includes(mod);
            return (
              <button
                key={mod}
                onClick={() => {
                  toggleModule(modulesEditTenant.id, mod, tenant.modules);
                  setModulesEditTenant({ ...modulesEditTenant, modules: active ? modulesEditTenant.modules.filter(m => m !== mod) : [...modulesEditTenant.modules, mod] });
                }}
                style={{ 
                  padding: '12px 16px', 
                  borderRadius: '12px', 
                  border: `1px solid ${active ? 'var(--sa-primary)' : 'rgba(0,0,0,0.1)'}`, 
                  background: active ? 'rgba(37,99,235,0.05)' : '#ffffff', 
                  color: active ? 'var(--sa-primary)' : '#475569', 
                  fontWeight: 600, 
                  fontSize: '0.85rem', 
                  textTransform: 'capitalize', 
                  cursor: 'pointer', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  transition: 'all 0.2s',
                  textAlign: 'left'
                }}
              >
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: active ? 'var(--sa-primary)' : '#cbd5e1' }} />
                {mod}
                {active && <span style={{ marginLeft: 'auto', fontSize: '0.65rem', color: '#10b981' }}>✓ Activo</span>}
              </button>
            );
          })}
        </div>
      </UnifiedModal>

    </div>
  );
}

function Building2({ style }: { style?: React.CSSProperties }) {
  return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}><rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/></svg>;
}
