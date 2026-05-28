'use client';

import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  Globe, 
  Shield, 
  Bell, 
  Database, 
  Key, 
  Check, 
  Save,
  Cloud,
  Mail,
  Hash,
  MessageSquare,
  Lock,
  Building2,
  Cpu,
  RefreshCw,
  HardDrive,
  UserCheck,
  ShieldCheck,
  Key as KeyIcon,
  UserPlus,
  XCircle,
  Edit,
  Trash2,
  ShieldAlert,
  Eye,
  EyeOff,
  Palette,
  Camera,
  BarChart3,
  Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlatform } from '@/contexts/PlatformContext';
import { supabase } from '@/lib/supabase';
import styles from './settings.module.css';

type SettingsTab = 'platform' | 'governance' | 'security' | 'users' | 'notifications' | 'integrations' | 'branding';

export default function Settings() {
  const { 
    brandColors, 
    setBrandColors, 
    currentTenant, 
    updateTenant,
    cardBg,
    setCardBg,
    cardBorderColor,
    setCardBorderColor,
    cardBorderRadius,
    setCardBorderRadius,
    cardBorderWidth,
    setCardBorderWidth
  } = usePlatform();
  const [activeTab, setActiveTab] = useState<SettingsTab>('branding');
  const [isSaving, setIsSaving] = useState(false);

  const [selectedDashboardLayout, setSelectedDashboardLayout] = useState<'classic' | 'moneed'>('classic');
  const [selectedDashboardType, setSelectedDashboardType] = useState<'executive' | 'technical' | 'collaborative'>('executive');
  const [isSavingDashboard, setIsSavingDashboard] = useState(false);

  useEffect(() => {
    if (currentTenant?.dashboardType) {
      setSelectedDashboardType(currentTenant.dashboardType);
    }
    if (typeof window !== 'undefined') {
      const hasReset = localStorage.getItem('govdata_layout_reset_v2');
      if (!hasReset) {
        setSelectedDashboardLayout('classic');
      } else {
        const savedLayout = localStorage.getItem('govdata_dashboard_layout');
        if (savedLayout === 'classic' || savedLayout === 'moneed') {
          setSelectedDashboardLayout(savedLayout as 'classic' | 'moneed');
        }
      }
    }
  }, [currentTenant?.id, currentTenant?.dashboardType]);

  const handleDashboardChange = (type: 'executive' | 'technical' | 'collaborative') => {
    setSelectedDashboardType(type);
  };

  const saveDashboardSelection = async () => {
    if (!currentTenant) return;
    setIsSavingDashboard(true);
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('govdata_dashboard_layout', selectedDashboardLayout);
      }
      await updateTenant(currentTenant.id, { dashboardType: selectedDashboardType });
      alert('✅ Configuración de tableros guardada exitosamente.');
    } catch (e: any) {
      console.error(e);
      alert('❌ Error al guardar la configuración.');
    } finally {
      setIsSavingDashboard(false);
    }
  };

  // Define available roles based on company subscription plan
  const getRolesForPlan = () => {
    const planName = currentTenant?.plan || 'Starter';
    const plan = planName.toLowerCase();
    
    const allRoles = [
      { value: 'viewer', label: 'Lector (Solo Consulta)' },
      { value: 'editor', label: 'Editor (Catálogo y Calidad)' },
      { value: 'admin', label: 'Administrador (Control Total)' },
      { value: 'steward', label: 'Data Steward (Gobierno de Datos)' }
    ];

    if (plan === 'starter') {
      return allRoles.filter(r => ['viewer', 'editor'].includes(r.value));
    } else if (plan === 'professional') {
      return allRoles.filter(r => ['viewer', 'editor', 'admin'].includes(r.value));
    } else {
      return allRoles; // Enterprise has access to all roles
    }
  };

  const roleLabels: { [key: string]: string } = {
    admin: 'Administrador',
    editor: 'Editor',
    viewer: 'Lector',
    steward: 'Data Steward'
  };
  
  // Access Management States
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);

  // Load users from Supabase
  useEffect(() => {
    if (!currentTenant) return;

    // Supabase requires a valid UUID. If we are using a local fallback ID (like '1'), skip query.
    const isUUID = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(currentTenant.id);
    
    if (!isUUID) {
      setUsers([]);
      return;
    }

    const fetchUsers = async () => {
      try {
        const { data, error } = await supabase
          .from('tenant_users')
          .select('*')
          .eq('tenant_id', currentTenant.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (data && data.length > 0) {
          setUsers(data.map(u => ({
            id: u.id,
            name: u.name,
            email: u.email,
            role: u.role,
            status: u.status,
            avatar: u.avatar,
            lastAccess: u.last_access ? new Date(u.last_access).toLocaleString() : 'Nunca'
          })));
        } else {
          setUsers([]);
        }
      } catch (e: any) {
        console.error('Error fetching tenant users:', e.message || e.details || e);
      }
    };

    fetchUsers();
  }, [currentTenant?.id]);

  const [inviteForm, setInviteForm] = useState({ name: '', email: '', role: 'editor', password: '', avatar: '' });
  const [showInvitePassword, setShowInvitePassword] = useState(false);
  const [isInviting, setIsInviting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'invite' | 'edit') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'invite') setInviteForm({...inviteForm, avatar: reader.result as string});
        else setEditForm({...editForm, avatar: reader.result as string});
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateUser = async () => {
    if (!inviteForm.name || !inviteForm.email || !inviteForm.password) {
      alert('Por favor completa todos los campos requeridos (Nombre, Email, Contraseña).');
      return;
    }

    if (!currentTenant) return;
    setIsInviting(true);
    
    try {
      const { data, error } = await supabase.from('tenant_users').insert({
        tenant_id: currentTenant.id,
        name: inviteForm.name,
        email: inviteForm.email,
        password: inviteForm.password,
        role: inviteForm.role,
        status: 'Activo',
        avatar: inviteForm.avatar || null
      }).select().single();

      if (error) throw error;

      const newUser = {
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role,
        status: data.status,
        avatar: data.avatar,
        lastAccess: 'Nunca (Creado manualmente)'
      };

      setUsers([newUser, ...users]);
      setIsInviteModalOpen(false);
      setInviteForm({ name: '', email: '', role: 'editor', password: '', avatar: '' });
      alert(`✅ Usuario ${newUser.name} creado exitosamente.`);
    } catch (e: any) {
      console.error('Error creating user:', e);
      alert(`❌ Hubo un error al crear el usuario. Detalle: ${e.message || e.details || 'Verifica que el correo no esté duplicado.'}`);
    } finally {
      setIsInviting(false);
    }
  };

  const handleDeleteUser = async (id: string | number) => {
    if (confirm('¿Estás seguro de eliminar este usuario?')) {
      try {
        const { error } = await supabase.from('tenant_users').delete().eq('id', id);
        if (error) throw error;
        setUsers(users.filter(u => u.id !== id));
      } catch (e) {
        console.error('Error deleting user:', e);
        alert('❌ Error al eliminar el usuario.');
      }
    }
  };

  const [editForm, setEditForm] = useState({ name: '', email: '', role: '', status: '', avatar: '' });

  const handleEditUser = (user: any) => {
    setSelectedUser(user);
    const allowed = getRolesForPlan();
    const isAllowed = allowed.some(r => r.value === user.role);
    setEditForm({
      name: user.name,
      email: user.email,
      role: isAllowed ? user.role : (allowed[0]?.value || 'viewer'),
      status: user.status,
      avatar: user.avatar || ''
    });
    setIsEditUserModalOpen(true);
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;
    setIsUpdating(true);
    try {
      const updates = {
        name: editForm.name,
        email: editForm.email,
        role: editForm.role,
        status: editForm.status,
        avatar: editForm.avatar || null
      };

      const { error } = await supabase.from('tenant_users').update(updates).eq('id', selectedUser.id);
      if (error) throw error;

      setUsers(users.map(u => u.id === selectedUser.id ? { ...u, ...updates } : u));
      setIsEditUserModalOpen(false);
      alert('✅ Usuario actualizado correctamente.');
    } catch (e) {
      console.error('Error updating user:', e);
      alert('❌ Error al actualizar el usuario.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      alert('Configuración guardada exitosamente.');
    }, 1500);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Configuración del Sistema</h1>
        <p>Administra los parámetros globales, seguridad e integraciones de GovData Nexus.</p>
      </header>

      <div className={styles.layout}>
        {/* Sidebar Navigation */}
        <aside className={styles.settingsNav}>
          <button 
            className={`${styles.navItem} ${activeTab === 'branding' ? styles.activeNavItem : ''}`}
            onClick={() => setActiveTab('branding')}
          >
            <Palette size={20} /> Personalización
          </button>
          <button 
            className={`${styles.navItem} ${activeTab === 'platform' ? styles.activeNavItem : ''}`}
            onClick={() => setActiveTab('platform')}
          >
            <Globe size={20} /> Plataforma
          </button>
          <button 
            className={`${styles.navItem} ${activeTab === 'governance' ? styles.activeNavItem : ''}`}
            onClick={() => setActiveTab('governance')}
          >
            <Database size={20} /> Gobierno de Datos
          </button>
          <button 
            className={`${styles.navItem} ${activeTab === 'security' ? styles.activeNavItem : ''}`}
            onClick={() => setActiveTab('security')}
          >
            <Shield size={20} /> Seguridad y RLS
          </button>
          <button 
            className={`${styles.navItem} ${activeTab === 'users' ? styles.activeNavItem : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <UserCheck size={20} /> Gestión de Accesos
          </button>
          <button 
            className={`${styles.navItem} ${activeTab === 'notifications' ? styles.activeNavItem : ''}`}
            onClick={() => setActiveTab('notifications')}
          >
            <Bell size={20} /> Notificaciones
          </button>
          <button 
            className={`${styles.navItem} ${activeTab === 'integrations' ? styles.activeNavItem : ''}`}
            onClick={() => setActiveTab('integrations')}
          >
            <Key size={20} /> API e Integraciones
          </button>
        </aside>

        {/* Central Content Panel */}
        <main className={styles.settingsPanel}>
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'branding' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className={styles.panelHeader}>
                <h2>Personalización y Branding</h2>
                <p>Configura la identidad visual de GovData Nexus para tu organización.</p>
              </div>

              <div className={styles.section}>
                <h3>Colores Corporativos</h3>
                <div className={styles.colorGrid}>
                  <div className={styles.colorField}>
                    <label>Color Primario (Botones, Navegación)</label>
                    <div className={styles.colorPickerWrapper}>
                      <input 
                        type="color" 
                        value={brandColors.primary} 
                        onChange={e => setBrandColors({...brandColors, primary: e.target.value})}
                      />
                      <input 
                        type="text" 
                        value={brandColors.primary}
                        onChange={e => setBrandColors({...brandColors, primary: e.target.value})}
                        className={styles.input}
                      />
                    </div>
                  </div>
                  <div className={styles.colorField}>
                    <label>Color Secundario (Éxitos, Badges)</label>
                    <div className={styles.colorPickerWrapper}>
                      <input 
                        type="color" 
                        value={brandColors.secondary} 
                        onChange={e => setBrandColors({...brandColors, secondary: e.target.value})}
                      />
                      <input 
                        type="text" 
                        value={brandColors.secondary}
                        onChange={e => setBrandColors({...brandColors, secondary: e.target.value})}
                        className={styles.input}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.section}>
                <h3>Interfaz y Temas</h3>
                <div className={styles.themeGrid}>
                  <div 
                    className={`${styles.themeCard} ${brandColors.theme === 'light' ? styles.activeTheme : ''}`}
                    onClick={() => setBrandColors({...brandColors, theme: 'light'})}
                  >
                    <div className={styles.themePreview} style={{ background: '#f8fafc' }}>
                       <div style={{ width: '20px', height: '100%', background: '#fff', borderRight: '1px solid #e2e8f0' }} />
                    </div>
                    <span>Light Mode</span>
                  </div>
                  <div 
                    className={`${styles.themeCard} ${brandColors.theme === 'dark' ? styles.activeTheme : ''}`}
                    onClick={() => setBrandColors({...brandColors, theme: 'dark'})}
                  >
                    <div className={styles.themePreview} style={{ background: '#0f172a' }}>
                       <div style={{ width: '20px', height: '100%', background: '#1e293b' }} />
                    </div>
                    <span>Dark Mode (High Contrast)</span>
                  </div>
                  <div 
                    className={`${styles.themeCard} ${brandColors.theme === 'slate' ? styles.activeTheme : ''}`}
                    onClick={() => setBrandColors({...brandColors, theme: 'slate'})}
                  >
                    <div className={styles.themePreview} style={{ background: '#f1f5f9' }}>
                       <div style={{ width: '20px', height: '100%', background: '#1e3a8a' }} />
                    </div>
                    <span>Corporate Slate</span>
                  </div>
                </div>
              </div>

              <div className={styles.section}>
                <h3>Estilo Consistente de Tarjetas (Cards)</h3>
                <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.85rem', marginBottom: '20px' }}>
                  Ajusta los colores y bordes de las tarjetas para que todos los componentes luzcan consistentes en tu panel.
                </p>
                <div className={styles.colorGrid} style={{ marginBottom: '20px' }}>
                  <div className={styles.colorField}>
                    <label>Fondo de Tarjeta</label>
                    <div className={styles.colorPickerWrapper}>
                      <input 
                        type="color" 
                        value={cardBg} 
                        onChange={e => setCardBg(e.target.value)}
                      />
                      <input 
                        type="text" 
                        value={cardBg}
                        onChange={e => setCardBg(e.target.value)}
                        className={styles.input}
                      />
                    </div>
                  </div>
                  <div className={styles.colorField}>
                    <label>Color del Borde</label>
                    <div className={styles.colorPickerWrapper}>
                      <input 
                        type="color" 
                        value={cardBorderColor} 
                        onChange={e => setCardBorderColor(e.target.value)}
                      />
                      <input 
                        type="text" 
                        value={cardBorderColor}
                        onChange={e => setCardBorderColor(e.target.value)}
                        className={styles.input}
                      />
                    </div>
                  </div>
                </div>

                <div className={styles.colorGrid}>
                  <div className={styles.colorField}>
                    <label>Grosor del Borde</label>
                    <select 
                      value={cardBorderWidth} 
                      onChange={e => setCardBorderWidth(e.target.value)}
                      className={styles.select}
                      style={{ background: '#1e293b', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#fff', borderRadius: '8px', padding: '8px' }}
                    >
                      <option value="0px">0px (Sin Borde)</option>
                      <option value="1px">1px (Delgado)</option>
                      <option value="2px">2px (Mediano)</option>
                      <option value="3px">3px (Grueso)</option>
                    </select>
                  </div>
                  <div className={styles.colorField}>
                    <label>Redondeado de Bordes (Border Radius)</label>
                    <select 
                      value={cardBorderRadius} 
                      onChange={e => setCardBorderRadius(e.target.value)}
                      className={styles.select}
                      style={{ background: '#1e293b', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#fff', borderRadius: '8px', padding: '8px' }}
                    >
                      <option value="0px">0px (Recto)</option>
                      <option value="8px">8px (Suave)</option>
                      <option value="16px">16px (Intermedio)</option>
                      <option value="24px">24px (Redondeado Premium)</option>
                      <option value="32px">32px (Extra Redondeado)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className={styles.footer}>
                <button className={styles.saveBtn} onClick={() => {
                  setBrandColors(brandColors);
                  alert('✅ Identidad visual actualizada. Los cambios se aplicarán en toda la plataforma.');
                }}>Aplicar Branding</button>
              </div>
            </motion.div>
          )}

          {activeTab === 'platform' && (
              <>
                <div className={styles.panelHeader}>
                  <h2>General y Plataforma</h2>
                  <p>Configura la identidad y comportamiento base de tu instancia.</p>
                </div>
                <div className={styles.section}>
                  <div className={styles.field}>
                    <label>Nombre de la Organización</label>
                    <input type="text" className={styles.input} defaultValue={currentTenant?.name || "GovData Enterprise Corp"} />
                  </div>
                  <div className={styles.field}>
                    <label>Idioma Predeterminado</label>
                    <select className={styles.select}>
                      <option>Español (Latinoamérica)</option>
                      <option>English (US)</option>
                      <option>Português (Brasil)</option>
                    </select>
                  </div>
                  <div className={styles.field}>
                    <label>Zona Horaria</label>
                    <select className={styles.select}>
                      <option>(GMT-06:00) Central Time (Mexico City)</option>
                      <option>(GMT-05:00) Eastern Time (New York)</option>
                      <option>(GMT+01:00) Central European Time (Madrid)</option>
                    </select>
                  </div>
                </div>

                <div className={styles.section}>
                  <h3>Diseño de Dashboard Organizacional</h3>
                  <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.85rem', marginBottom: '20px' }}>
                    Selecciona la plantilla principal del panel de control de tu organización.
                  </p>

                  <div className={styles.themeGrid} style={{ marginBottom: '24px' }}>
                    <div 
                      className={`${styles.themeCard} ${selectedDashboardLayout === 'moneed' ? styles.activeTheme : ''}`}
                      onClick={() => setSelectedDashboardLayout('moneed')}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className={styles.themePreview} style={{ background: 'linear-gradient(135deg, #f3f4f6 0%, #e2e8f0 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                         <Palette size={32} style={{ color: '#2563eb' }} />
                      </div>
                      <span style={{ fontWeight: '800', fontSize: '0.95rem', display: 'block', marginTop: '8px' }}>Tablero Rediseñado (Moneed)</span>
                      <small style={{ color: 'rgba(255, 255, 255, 0.4)', display: 'block', fontSize: '0.75rem', textAlign: 'center', padding: '0 8px', marginTop: '4px' }}>
                        Diseño ejecutivo ultra limpio de tarjetas blancas sobre fondo gris con widgets parametrizables.
                      </small>
                    </div>

                    <div 
                      className={`${styles.themeCard} ${selectedDashboardLayout === 'classic' ? styles.activeTheme : ''}`}
                      onClick={() => setSelectedDashboardLayout('classic')}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className={styles.themePreview} style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #10b981 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                         <Database size={32} style={{ color: '#10b981' }} />
                      </div>
                      <span style={{ fontWeight: '800', fontSize: '0.95rem', display: 'block', marginTop: '8px' }}>Tablero Clásico Inicial</span>
                      <small style={{ color: 'rgba(255, 255, 255, 0.4)', display: 'block', fontSize: '0.75rem', textAlign: 'center', padding: '0 8px', marginTop: '4px' }}>
                        Diseño organizativo tradicional con 3 paneles intercambiables (Ejecutivo, Técnico y Colaborativo).
                      </small>
                    </div>
                  </div>

                  {selectedDashboardLayout === 'classic' && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }} 
                      animate={{ opacity: 1, height: 'auto' }}
                      style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '20px', marginTop: '20px' }}
                    >
                      <h4 style={{ fontSize: '0.9rem', fontWeight: '800', marginBottom: '12px' }}>Sub-Vista Clásica Predeterminada</h4>
                      <div className={styles.themeGrid}>
                        <div 
                          className={`${styles.themeCard} ${selectedDashboardType === 'executive' ? styles.activeTheme : ''}`}
                          onClick={() => handleDashboardChange('executive')}
                          style={{ cursor: 'pointer' }}
                        >
                          <div className={styles.themePreview} style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                             <BarChart3 size={32} style={{ color: '#60a5fa' }} />
                          </div>
                          <span style={{ fontWeight: '700', fontSize: '0.9rem', display: 'block', marginTop: '8px' }}>Ejecutivo / Negocios</span>
                        </div>

                        <div 
                          className={`${styles.themeCard} ${selectedDashboardType === 'technical' ? styles.activeTheme : ''}`}
                          onClick={() => handleDashboardChange('technical')}
                          style={{ cursor: 'pointer' }}
                        >
                          <div className={styles.themePreview} style={{ background: 'linear-gradient(135deg, #090f1d 0%, #14532d 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                             <Cpu size={32} style={{ color: '#a3e635' }} />
                          </div>
                          <span style={{ fontWeight: '700', fontSize: '0.9rem', display: 'block', marginTop: '8px' }}>Técnico / Operativo</span>
                        </div>

                        <div 
                          className={`${styles.themeCard} ${selectedDashboardType === 'collaborative' ? styles.activeTheme : ''}`}
                          onClick={() => handleDashboardChange('collaborative')}
                          style={{ cursor: 'pointer' }}
                        >
                          <div className={styles.themePreview} style={{ background: 'linear-gradient(135deg, #fef3c7 0%, #d97706 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                             <Users size={32} style={{ color: '#78350f' }} />
                          </div>
                          <span style={{ fontWeight: '700', fontSize: '0.9rem', display: 'block', marginTop: '8px' }}>Colaborativo / Equipo</span>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
                    <button 
                      className={styles.saveBtn} 
                      onClick={saveDashboardSelection}
                      disabled={isSavingDashboard}
                    >
                      {isSavingDashboard ? 'Guardando...' : 'Guardar Dashboard'}
                    </button>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'governance' && (
              <>
                <div className={styles.panelHeader}>
                  <h2>Parámetros de Gobierno</h2>
                  <p>Define los umbrales y dominios para la operación de datos.</p>
                </div>
                <div className={styles.section}>
                  <div className={styles.field}>
                    <label>Umbral Crítico de Calidad (%)</label>
                    <input type="number" className={styles.input} defaultValue={85} />
                  </div>
                </div>
              </>
            )}

            {activeTab === 'security' && (
              <>
                <div className={styles.panelHeader}>
                  <h2>Seguridad y Cumplimiento</h2>
                  <p>Controla el acceso y las políticas de protección de información.</p>
                </div>
                <div className={styles.section}>
                  <div className={styles.toggleField}>
                    <div className={styles.toggleInfo}>
                      <h4>Enmascaramiento Dinámico (PII)</h4>
                      <p>Ocultar automáticamente datos sensibles en el catálogo.</p>
                    </div>
                    <input type="checkbox" defaultChecked />
                  </div>
                </div>
              </>
            )}

            {activeTab === 'users' && (
              <>
                <div className={styles.panelHeader}>
                  <h2>Gestión de Accesos</h2>
                  <p>Administra los usuarios con permiso de ingreso a la plataforma.</p>
                </div>
                <div className={styles.section}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                     <h3>Usuarios Activos</h3>
                      <button className={styles.primaryBtn} onClick={() => {
                        const allowed = getRolesForPlan();
                        setInviteForm({
                          name: '',
                          email: '',
                          role: allowed[0]?.value || 'viewer',
                          password: '',
                          avatar: ''
                        });
                        setIsInviteModalOpen(true);
                      }}>
                         <UserPlus size={16} /> Crear Usuario
                      </button>
                  </div>
                  <table className={styles.userTable}>
                     <thead>
                        <tr>
                           <th>Usuario</th>
                           <th>Rol Sistema</th>
                           <th>Último Acceso</th>
                           <th>Estado</th>
                           <th>Acciones</th>
                        </tr>
                     </thead>
                     <tbody>
                        {users.map(user => (
                          <tr key={user.id}>
                             <td>
                               <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                 <div className={styles.tableAvatar}>
                                   {user.avatar ? (
                                     <img src={user.avatar} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                   ) : (
                                     user.name.charAt(0).toUpperCase()
                                   )}
                                 </div>
                                 <div>
                                   <div style={{ fontWeight: 600 }}>{user.name}</div>
                                   <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{user.email}</div>
                                 </div>
                               </div>
                             </td>
                              <td>
                                <span className={styles.roleBadge}>{roleLabels[user.role] || user.role}</span>
                              </td>
                             <td>{user.lastAccess}</td>
                             <td>{user.status}</td>
                             <td>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                   <button className={styles.iconBtn} onClick={() => handleEditUser(user)} title="Editar">
                                     <Edit size={14} />
                                   </button>
                                   <button className={`${styles.iconBtn} ${styles.delete}`} onClick={() => handleDeleteUser(user.id)} title="Eliminar">
                                     <Trash2 size={14} color="#ef4444" />
                                   </button>
                                </div>
                             </td>
                          </tr>
                        ))}
                     </tbody>
                  </table>
                </div>
              </>
            )}

            {activeTab === 'notifications' && (
              <>
                <div className={styles.panelHeader}>
                  <h2>Canales de Comunicación</h2>
                  <p>Configura dónde y cuándo recibir alertas del sistema.</p>
                </div>
                <div className={styles.section}>
                  <div className={styles.toggleField}>
                    <div className={styles.toggleInfo}>
                      <h4>Alertas por Email</h4>
                      <p>Enviar resumen diario de calidad e incidentes.</p>
                    </div>
                    <input type="checkbox" defaultChecked />
                  </div>
                </div>
              </>
            )}

            {activeTab === 'integrations' && (
              <>
                <div className={styles.panelHeader}>
                  <h2>API e Integraciones Externas</h2>
                  <p>Conecta GovData Nexus con tu ecosistema tecnológico para automatizar alertas y flujos.</p>
                </div>
                <div className={styles.section}>
                  <h3>Servidores y Notificaciones</h3>
                  <div className={styles.integrationGrid}>
                    <div className={styles.integrationCard}>
                      <div className={styles.integrationIcon} style={{ background: '#4a154b', color: 'white' }}>
                        <MessageSquare size={24} />
                      </div>
                      <strong>Slack Webhook</strong>
                      <span className={`${styles.statusTag} ${styles.statusConnected}`}>Conectado</span>
                      <button className={styles.iconBtn} title="Configurar API"><SettingsIcon size={14} /></button>
                    </div>

                    <div className={styles.integrationCard}>
                      <div className={styles.integrationIcon} style={{ background: '#3ecf8e', color: 'white' }}>
                        <Database size={24} />
                      </div>
                      <strong>Supabase DB</strong>
                      <span className={`${styles.statusTag} ${styles.statusConnected}`}>Sincronizado</span>
                      <button className={styles.iconBtn} title="Configurar API"><SettingsIcon size={14} /></button>
                    </div>

                    <div className={styles.integrationCard}>
                      <div className={styles.integrationIcon} style={{ background: '#0070f3', color: 'white' }}>
                        <Cloud size={24} />
                      </div>
                      <strong>Azure AD</strong>
                      <span className={`${styles.statusTag} ${styles.statusDisconnected}`}>Desconectado</span>
                      <button className={styles.primaryBtn} style={{ padding: '4px 12px', fontSize: '0.8rem' }}>Conectar</button>
                    </div>
                  </div>
                </div>

                <div className={styles.section}>
                  <h3>Sistemas Fuente (ERP/CRM)</h3>
                  <div className={styles.integrationGrid}>
                    <div className={styles.integrationCard}>
                      <div className={styles.integrationIcon} style={{ background: '#008fd3', color: 'white' }}>
                        <Building2 size={24} />
                      </div>
                      <strong>SAP S/4HANA</strong>
                      <span className={`${styles.statusTag} ${styles.statusConnected}`}>Activo</span>
                    </div>

                    <div className={styles.integrationCard}>
                      <div className={styles.integrationIcon} style={{ background: '#00a1e0', color: 'white' }}>
                        <Cloud size={24} />
                      </div>
                      <strong>Salesforce</strong>
                      <span className={`${styles.statusTag} ${styles.statusDisconnected}`}>Pendiente</span>
                      <button className={styles.primaryBtn} style={{ padding: '4px 12px', fontSize: '0.8rem' }}>Configurar</button>
                    </div>
                  </div>
                </div>
              </>
            )}

            <div className={styles.footer}>
              <button className={styles.saveBtn} onClick={handleSave} disabled={isSaving}>
                {isSaving ? <RefreshCw size={18} className={styles.spinning} /> : <Save size={18} />} Guardar Cambios
              </button>
            </div>
          </motion.div>
        </main>
      </div>

      {/* Modal: Crear Usuario */}
      <AnimatePresence>
        {isInviteModalOpen && (
          <div className={styles.modalOverlay} onClick={() => setIsInviteModalOpen(false)}>
            <motion.div 
              className={styles.modalContent}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={e => e.stopPropagation()}
            >
              <div className={styles.modalHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ padding: '12px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '16px' }}>
                    <UserPlus size={28} color="var(--primary)" />
                  </div>
                  <div>
                    <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>Crear Nuevo Usuario</h2>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>Define los accesos y credenciales del nuevo integrante.</p>
                  </div>
                </div>
                <button className={styles.closeBtn} onClick={() => setIsInviteModalOpen(false)}><XCircle size={28} /></button>
              </div>

              <div className={styles.modalBody}>
                <div className={styles.userPreviewCard}>
                  <div style={{ position: 'relative' }}>
                    <div className={styles.avatarCircle} style={{ overflow: 'hidden' }}>
                      {inviteForm.avatar ? (
                        <img src={inviteForm.avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        inviteForm.name ? inviteForm.name.charAt(0).toUpperCase() : '?'
                      )}
                    </div>
                    <label className={styles.avatarUploadBtn}>
                      <Camera size={16} />
                      <input 
                        type="file" 
                        hidden 
                        accept="image/*" 
                        onChange={(e) => handleAvatarChange(e, 'invite')} 
                      />
                    </label>
                  </div>
                  <div className={styles.previewInfo}>
                    <h4>{inviteForm.name || 'Nombre del Usuario'}</h4>
                    <p>{inviteForm.email || 'correo@ejemplo.com'} • <span style={{ textTransform: 'capitalize' }}>{inviteForm.role}</span></p>
                  </div>
                </div>

                <div className={styles.formGrid}>
                  <div className={styles.field}>
                    <label>Nombre Completo</label>
                    <input 
                      type="text" 
                      className={styles.input} 
                      placeholder="Ej: Juan Pérez"
                      value={inviteForm.name} 
                      onChange={e => setInviteForm({...inviteForm, name: e.target.value})} 
                    />
                  </div>
                  <div className={styles.field}>
                    <label>Email Corporativo</label>
                    <input 
                      type="email" 
                      className={styles.input} 
                      placeholder="juan@empresa.com"
                      value={inviteForm.email} 
                      onChange={e => setInviteForm({...inviteForm, email: e.target.value})} 
                    />
                  </div>
                  <div className={styles.field}>
                    <label>Rol de Sistema</label>
                    <select 
                      className={styles.input}
                      value={inviteForm.role}
                      onChange={e => setInviteForm({...inviteForm, role: e.target.value})}
                    >
                      {getRolesForPlan().map(role => (
                        <option key={role.value} value={role.value}>
                          {role.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className={styles.field}>
                    <label>Contraseña Temporal</label>
                    <div style={{ position: 'relative' }}>
                      <input 
                        type={showInvitePassword ? "text" : "password"} 
                        className={styles.input} 
                        value={inviteForm.password} 
                        onChange={e => setInviteForm({...inviteForm, password: e.target.value})} 
                      />
                      <button 
                        className={styles.eyeBtn}
                        onClick={() => setShowInvitePassword(!showInvitePassword)}
                        type="button"
                      >
                        {showInvitePassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className={styles.modalActions}>
                  <button className={styles.secondaryBtn} onClick={() => setIsInviteModalOpen(false)}>Cancelar</button>
                  <button className={styles.primaryBtn} onClick={handleCreateUser} disabled={isInviting}>
                    {isInviting ? <RefreshCw size={20} className={styles.spinning} /> : <UserCheck size={20} />}
                    {isInviting ? 'Procesando...' : 'Crear Usuario'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Editar Usuario */}
      <AnimatePresence>
        {isEditUserModalOpen && selectedUser && (
          <div className={styles.modalOverlay} onClick={() => setIsEditUserModalOpen(false)}>
            <motion.div 
              className={styles.modalContent}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={e => e.stopPropagation()}
            >
              <div className={styles.modalHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ padding: '12px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '16px' }}>
                    <Edit size={28} color="var(--primary)" />
                  </div>
                  <div>
                    <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>Editar Perfil</h2>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>Actualiza la información y permisos de {selectedUser.name}.</p>
                  </div>
                </div>
                <button className={styles.closeBtn} onClick={() => setIsEditUserModalOpen(false)}><XCircle size={28} /></button>
              </div>

              <div className={styles.modalBody}>
                <div className={styles.userPreviewCard}>
                  <div style={{ position: 'relative' }}>
                    <div className={styles.avatarCircle} style={{ overflow: 'hidden', background: '#f59e0b' }}>
                      {editForm.avatar ? (
                        <img src={editForm.avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        editForm.name ? editForm.name.charAt(0).toUpperCase() : '?'
                      )}
                    </div>
                    <label className={styles.avatarUploadBtn}>
                      <Camera size={16} />
                      <input 
                        type="file" 
                        hidden 
                        accept="image/*" 
                        onChange={(e) => handleAvatarChange(e, 'edit')} 
                      />
                    </label>
                  </div>
                  <div className={styles.previewInfo}>
                    <h4>{editForm.name}</h4>
                    <p>{editForm.email} • <span style={{ textTransform: 'capitalize' }}>{editForm.role}</span></p>
                  </div>
                </div>

                <div className={styles.formGrid}>
                  <div className={styles.field}>
                    <label>Nombre Completo</label>
                    <input 
                      type="text" 
                      className={styles.input} 
                      value={editForm.name} 
                      onChange={e => setEditForm({...editForm, name: e.target.value})} 
                    />
                  </div>
                  <div className={styles.field}>
                    <label>Correo Electrónico</label>
                    <input 
                      type="email" 
                      className={styles.input} 
                      value={editForm.email} 
                      onChange={e => setEditForm({...editForm, email: e.target.value})} 
                    />
                  </div>
                  <div className={styles.field}>
                    <label>Rol Asignado</label>
                    <select 
                      className={styles.input}
                      value={editForm.role}
                      onChange={e => setEditForm({...editForm, role: e.target.value})}
                    >
                      {getRolesForPlan().map(role => (
                        <option key={role.value} value={role.value}>
                          {role.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className={styles.field}>
                    <label>Estado de Cuenta</label>
                    <select 
                      className={styles.input}
                      value={editForm.status}
                      onChange={e => setEditForm({...editForm, status: e.target.value})}
                    >
                      <option value="Activo">Activo</option>
                      <option value="Inactivo">Inactivo</option>
                      <option value="Suspendido">Suspendido</option>
                    </select>
                  </div>
                </div>

                <div className={styles.modalActions}>
                  <button className={styles.secondaryBtn} onClick={() => setIsEditUserModalOpen(false)} disabled={isUpdating}>Cancelar</button>
                  <button className={styles.saveBtn} onClick={handleUpdateUser} disabled={isUpdating}>
                    {isUpdating ? <RefreshCw size={20} className={styles.spinning} /> : <Save size={20} />} 
                    {isUpdating ? 'Guardando...' : 'Guardar Cambios'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
