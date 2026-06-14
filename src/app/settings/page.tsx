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
  Users,
  AlertTriangle,
  Info,
  Award,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlatform, DEFAULT_MODAL_CONFIG, MODAL_TEMPLATES, ModalConfig } from '@/contexts/PlatformContext';
import { supabase } from '@/lib/supabase';
import styles from './settings.module.css';
import UnifiedModal from '@/components/UnifiedModal';

type SettingsTab = 'platform' | 'governance' | 'security' | 'users' | 'roles' | 'notifications' | 'integrations' | 'branding' | 'modals';

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
    setCardBorderWidth,
    dashboardChartType,
    setDashboardChartType,
    dashboardChartColors,
    setDashboardChartColors,
    pieChartType,
    setPieChartType,
    dashboardFont,
    setDashboardFont,
    dashboardTextColor,
    setDashboardTextColor,
    dashboardTitleColor,
    setDashboardTitleColor,
    dashboardTextScale,
    setDashboardTextScale,
    dashboardContent,
    setDashboardContent,
    modalBg,
    setModalBg,
    modalFont,
    setModalFont,
    modalTextColor,
    setModalTextColor,
    modalBlur,
    setModalBlur,
    modalConfig,
    saveModalConfig,
    logoUrl,
    setLogoUrl,
    logoWidth,
    setLogoWidth,
    transformationVideoUrl,
    setTransformationVideoUrl,
    transformationVideoAspect,
    setTransformationVideoAspect
  } = usePlatform();
  const [activeTab, setActiveTab] = useState<SettingsTab>('branding');
  const [isSaving, setIsSaving] = useState(false);

  const [selectedDashboardLayout, setSelectedDashboardLayout] = useState<'classic' | 'moneed'>('classic');
  const [selectedDashboardType, setSelectedDashboardType] = useState<'executive' | 'technical' | 'collaborative'>('executive');
  const [isSavingDashboard, setIsSavingDashboard] = useState(false);

  const [localModalConfig, setLocalModalConfig] = useState<ModalConfig>(DEFAULT_MODAL_CONFIG);
  const [previewType, setPreviewType] = useState<'informativa' | 'confirmacion' | 'formulario'>('formulario');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isTestingInteractive, setIsTestingInteractive] = useState(false);

  useEffect(() => {
    if (modalConfig) {
      setLocalModalConfig(modalConfig);
    }
  }, [modalConfig]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const role = localStorage.getItem('govdata_role');
      if (role && role !== 'admin' && role !== 'superadmin') {
        window.location.href = '/';
      }
    }
  }, []);

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
            alias: u.alias,
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

  const [roles, setRoles] = useState<any[]>([]);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  // Granular module permissions: { [moduleKey]: { view, create, edit, delete } }
  type ModulePerms = { view: boolean; create: boolean; edit: boolean; delete: boolean };
  type RolePerms = { [key: string]: ModulePerms };

  const AVAILABLE_MODULES = [
    { key: 'metadata', label: 'Metadata Intelligence', icon: '🧠' },
    { key: 'catalog', label: 'Catálogo de Datos', icon: '📂' },
    { key: 'quality', label: 'Calidad de Datos', icon: '✅' },
    { key: 'security', label: 'Seguridad y Riesgos', icon: '🔐' },
    { key: 'team', label: 'Roles y Equipo', icon: '👥' },
    { key: 'workflows', label: 'Workflows', icon: '⚡' },
    { key: 'maturity', label: 'Madurez', icon: '📊' },
    { key: 'policies', label: 'Políticas', icon: '📋' },
    { key: 'journey', label: 'Journey CDO', icon: '🎓' },
  ];

  const PERMISSION_LABELS: { key: keyof ModulePerms; label: string; color: string }[] = [
    { key: 'view', label: 'Ver', color: '#3b82f6' },
    { key: 'create', label: 'Crear', color: '#10b981' },
    { key: 'edit', label: 'Editar', color: '#f59e0b' },
    { key: 'delete', label: 'Eliminar', color: '#ef4444' },
  ];

  const emptyPerms = (): RolePerms => {
    const p: RolePerms = {};
    AVAILABLE_MODULES.forEach(m => { p[m.key] = { view: false, create: false, edit: false, delete: false }; });
    return p;
  };

  // Convert flat modules[] to granular RolePerms (legacy compatibility)
  const modulesToPerms = (modules: string[]): RolePerms => {
    const p = emptyPerms();
    modules.forEach(mod => {
      if (p[mod]) { p[mod].view = true; p[mod].create = true; p[mod].edit = true; p[mod].delete = false; }
    });
    return p;
  };

  // Flatten granular perms back to simple module key list (modules with at least view access)
  const permsToModules = (perms: RolePerms): string[] =>
    Object.entries(perms).filter(([, v]) => v.view || v.create || v.edit || v.delete).map(([k]) => k);

  const [newRole, setNewRole] = useState<{ name: string; description: string; perms: RolePerms }>({ name: '', description: '', perms: emptyPerms() });
  const [isEditRoleModalOpen, setIsEditRoleModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<{ id: string; name: string; description: string; perms: RolePerms } | null>(null);

  // Fetch roles with their modules from Supabase
  useEffect(() => {
    if (!currentTenant) return;
    const fetchRoles = async () => {
      // Validate if currentTenant.id is a valid UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const isValidUuid = uuidRegex.test(currentTenant.id);

      try {
        let query = supabase.from('roles').select('*');
        
        if (isValidUuid) {
          query = query.eq('tenant_id', currentTenant.id);
        } else {
          // If it is a mock string ID (like "1"), query globally or return default starter roles
          query = query.is('tenant_id', null);
        }

        const { data: rolesData, error: rolesError } = await query.order('created_at', { ascending: false });
        if (rolesError) throw rolesError;

        if (rolesData && rolesData.length > 0) {
          // Fetch module mappings for all roles of this tenant
          const roleIds = rolesData.map((r: any) => r.id);
          const { data: modulesData, error: modulesError } = await supabase
            .from('role_modules')
            .select('role_id, module')
            .in('role_id', roleIds);
          
          if (modulesError) throw modulesError;

          // Merge modules list into roles structure
          const combined = rolesData.map((r: any) => ({
            ...r,
            modules: modulesData ? modulesData.filter((m: any) => m.role_id === r.id).map((m: any) => m.module) : []
          }));
          setRoles(combined);
        } else {
          setRoles([]);
        }
      } catch (e: any) {
        console.error('Error fetching roles:', e.message || e.details || e);
      }
    };
    fetchRoles();
  }, [currentTenant?.id]);

  const [inviteForm, setInviteForm] = useState({ name: '', alias: '', email: '', role: 'editor', password: '', avatar: '' });
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
        alias: inviteForm.alias,
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
      setInviteForm({ name: '', alias: '', email: '', role: 'editor', password: '', avatar: '' });
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

  const [editForm, setEditForm] = useState({ name: '', alias: '', email: '', role: '', status: '', avatar: '' });

  const handleEditUser = (user: any) => {
    setSelectedUser(user);
    const allowed = getRolesForPlan();
    const isAllowed = allowed.some(r => r.value === user.role) || roles.some(r => r.name === user.role);
    setEditForm({
      name: user.name,
      alias: user.alias || '',
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
        alias: editForm.alias,
        email: editForm.email,
        role: editForm.role,
        status: editForm.status,
        avatar: editForm.avatar || null
      };

      const { error } = await supabase.from('tenant_users').update(updates).eq('id', selectedUser.id);
      if (error) throw error;

      // Sync with localStorage and dispatch event if editing current logged-in user
      const currentUserEmail = typeof window !== 'undefined' ? localStorage.getItem('govdata_user_email') : null;
      const isCurrentUser = !!(currentUserEmail && updates.email && currentUserEmail.toLowerCase().trim() === updates.email.toLowerCase().trim());
      if (isCurrentUser) {
        if (updates.avatar) {
          localStorage.setItem('govdata_avatar_url', updates.avatar);
        } else {
          localStorage.removeItem('govdata_avatar_url');
        }
        if (updates.name) {
          localStorage.setItem('govdata_user_name', updates.name);
        }
        window.dispatchEvent(new CustomEvent('govdata_user_updated', {
          detail: { avatar: updates.avatar, name: updates.name }
        }));
      }

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
      <header className={styles.header} style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0 }}>
          <SettingsIcon size={24} />
        </div>
        <div>
          <h1 style={{ margin: 0, marginBottom: '4px', fontSize: '1.8rem' }}>Configuración del Sistema</h1>
          <p style={{ margin: 0, color: '#64748b', fontSize: '0.95rem' }}>Administra los parámetros globales, seguridad e integraciones de GovData Nexus.</p>
        </div>
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
            className={`${styles.navItem} ${activeTab === 'modals' ? styles.activeNavItem : ''}`}
            onClick={() => setActiveTab('modals')}
          >
            <Palette size={20} /> Ajustes de Modales
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
            className={`${styles.navItem} ${activeTab === 'roles' ? styles.activeNavItem : ''}`}
            onClick={() => setActiveTab('roles')}
          >
            <KeyIcon size={20} /> Roles y Permisos
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
                <h3>Logo de la Plataforma</h3>
                <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.85rem', marginBottom: '20px' }}>
                  Configura la imagen del logotipo superior (enlace o subiendo un archivo) y su tamaño de visualización en la barra lateral.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                  <div className={styles.colorField}>
                    <label>URL del Logo</label>
                    <input 
                      type="text" 
                      value={logoUrl} 
                      onChange={e => setLogoUrl(e.target.value)}
                      className={styles.input}
                      placeholder="Ej. /logo.png o https://ejemplo.com/mi-logo.png"
                      style={{ background: '#1e293b', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#fff', borderRadius: '8px', padding: '10px', width: '100%' }}
                    />
                  </div>
                  <div className={styles.colorField}>
                    <label>Subir Archivo de Imagen</label>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setLogoUrl(reader.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      style={{ background: '#1e293b', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#fff', borderRadius: '8px', padding: '8px', width: '100%' }}
                    />
                  </div>
                  <div className={styles.colorField}>
                    <label>Tamaño / Ancho de Visualización</label>
                    <select 
                      value={logoWidth} 
                      onChange={e => setLogoWidth(e.target.value)}
                      className={styles.select}
                      style={{ background: '#1e293b', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#fff', borderRadius: '8px', padding: '10px', width: '100%' }}
                    >
                      <option value="40px">40px (Icono compacto)</option>
                      <option value="80px">80px (Pequeño)</option>
                      <option value="120px">120px (Mediano)</option>
                      <option value="180px">180px (Largo Corporativo - Por defecto)</option>
                      <option value="240px">240px (Extra Grande)</option>
                    </select>
                  </div>
                </div>
                {logoUrl !== '/logo.png' && (
                  <button 
                    onClick={() => { setLogoUrl('/logo.png'); setLogoWidth('180px'); }}
                    style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '6px 12px', borderRadius: '8px', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 700 }}
                  >
                    Restaurar Logo Predeterminado
                  </button>
                )}
              </div>

              <div className={styles.section}>
                <h3>Configuración del Simulador (Video / Avatar CDO)</h3>
                <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.85rem', marginBottom: '20px' }}>
                  Sube o vincula un video explicativo tipo YouTube Short o video MP4 para el tutor interactivo que aparecerá en el simulador.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '16px' }}>
                  <div className={styles.colorField}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px', display: 'block' }}>Enlace de Video (YouTube Short, MP4, etc.):</label>
                    <input 
                      type="text" 
                      value={transformationVideoUrl} 
                      onChange={e => setTransformationVideoUrl(e.target.value)}
                      className={styles.input}
                      placeholder="Ej. https://www.youtube.com/shorts/abcd123 o https://www.w3schools.com/html/mov_bbb.mp4"
                      style={{ background: '#1e293b', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#fff', borderRadius: '8px', padding: '10px', width: '100%' }}
                    />
                  </div>
                  <div className={styles.colorField}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px', display: 'block' }}>Relación de Aspecto (Aspect Ratio):</label>
                    <select 
                      value={transformationVideoAspect} 
                      onChange={e => setTransformationVideoAspect(e.target.value)}
                      className={styles.select}
                      style={{ background: '#1e293b', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#fff', borderRadius: '8px', padding: '10px', width: '100%' }}
                    >
                      <option value="16:9">16:9 (Horizontal / Clásico)</option>
                      <option value="9:16">9:16 (Vertical / YouTube Short)</option>
                    </select>
                  </div>
                </div>
                <p style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '0.78rem', margin: 0 }}>
                  💡 Si se deja vacío, el simulador se mantendrá en su visualización clásica de mentor sin video lateral.
                </p>
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

              <div className={styles.section}>
                <h3>Estilo de Ventanas Emergentes (Modals)</h3>
                <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.85rem', marginBottom: '20px' }}>
                  Ajusta la apariencia de las ventanas de diálogo (ej. edición de flujos, asignación de roles).
                </p>

                <div className={styles.themeGrid} style={{ marginBottom: '24px' }}>
                  <div 
                    className={`${styles.themeCard} ${modalBg === '#ffffff' && modalBlur === '0px' ? styles.activeTheme : ''}`}
                    onClick={() => {
                      setModalBg('#ffffff');
                      setModalBlur('0px');
                      setModalTextColor('#0f172a');
                    }}
                  >
                    <div className={styles.themePreview} style={{ background: '#e2e8f0' }}>
                       <div style={{ width: '60%', height: '60%', background: '#ffffff', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                    </div>
                    <span>Clásico (Blanco Sólido)</span>
                  </div>

                  <div 
                    className={`${styles.themeCard} ${modalBg === 'rgba(15, 23, 42, 0.85)' ? styles.activeTheme : ''}`}
                    onClick={() => {
                      setModalBg('rgba(15, 23, 42, 0.85)');
                      setModalBlur('24px');
                      setModalTextColor('#ffffff');
                    }}
                  >
                    <div className={styles.themePreview} style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #a855f7 100%)' }}>
                       <div style={{ width: '60%', height: '60%', background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)' }} />
                    </div>
                    <span>Premium (Dark Glass)</span>
                  </div>

                  <div 
                    className={`${styles.themeCard} ${modalBg === 'rgba(255, 255, 255, 0.85)' ? styles.activeTheme : ''}`}
                    onClick={() => {
                      setModalBg('rgba(255, 255, 255, 0.85)');
                      setModalBlur('24px');
                      setModalTextColor('#0f172a');
                    }}
                  >
                    <div className={styles.themePreview} style={{ background: 'linear-gradient(135deg, #38bdf8 0%, #3b82f6 100%)' }}>
                       <div style={{ width: '60%', height: '60%', background: 'rgba(255, 255, 255, 0.5)', backdropFilter: 'blur(4px)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.4)' }} />
                    </div>
                    <span>Translúcido (Light Glass)</span>
                  </div>
                </div>

                <h4 style={{ fontSize: '0.9rem', fontWeight: '800', marginBottom: '12px', marginTop: '16px' }}>Ajustes Avanzados de Modal</h4>

                <div className={styles.colorGrid} style={{ marginBottom: '20px' }}>
                  <div className={styles.colorField}>
                    <label>Fondo de Ventana (Color/Opacidad)</label>
                    <div className={styles.colorPickerWrapper}>
                      <input 
                        type="color" 
                        value={modalBg.startsWith('#') ? modalBg : (modalBg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/) ? '#' + modalBg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)!.slice(1,4).map(x=>parseInt(x).toString(16).padStart(2,'0')).join('') : '#0f172a')} 
                        onChange={e => setModalBg(e.target.value)}
                      />
                      <input 
                        type="text" 
                        value={modalBg}
                        onChange={e => setModalBg(e.target.value)}
                        className={styles.input}
                        placeholder="Ej. rgba(15, 23, 42, 0.85)"
                      />
                    </div>
                  </div>
                  <div className={styles.colorField}>
                    <label>Nivel de Difuminado (Blur - Glassmorphism)</label>
                    <select 
                      value={modalBlur} 
                      onChange={e => setModalBlur(e.target.value)}
                      className={styles.select}
                      style={{ background: '#1e293b', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#fff', borderRadius: '8px', padding: '8px' }}
                    >
                      <option value="0px">Sin desenfoque (Sólido)</option>
                      <option value="10px">10px (Suave)</option>
                      <option value="20px">20px (Intermedio)</option>
                      <option value="32px">32px (Fuerte / Premium)</option>
                      <option value="64px">64px (Extremo)</option>
                    </select>
                  </div>
                </div>

                <div className={styles.colorGrid}>
                  <div className={styles.colorField}>
                    <label>Tipografía de la Ventana</label>
                    <select 
                      value={modalFont} 
                      onChange={e => setModalFont(e.target.value)}
                      className={styles.select}
                      style={{ background: '#1e293b', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#fff', borderRadius: '8px', padding: '8px' }}
                    >
                      <option value="inherit">Heredar del Sistema</option>
                      <option value="'Inter', sans-serif">Inter</option>
                      <option value="'Roboto', sans-serif">Roboto</option>
                      <option value="'Poppins', sans-serif">Poppins</option>
                      <option value="'Outfit', sans-serif">Outfit</option>
                    </select>
                  </div>
                  <div className={styles.colorField}>
                    <label>Color de Texto</label>
                    <div className={styles.colorPickerWrapper}>
                      <input 
                        type="color" 
                        value={modalTextColor.startsWith('#') ? modalTextColor : '#ffffff'} 
                        onChange={e => setModalTextColor(e.target.value)}
                      />
                      <input 
                        type="text" 
                        value={modalTextColor}
                        onChange={e => setModalTextColor(e.target.value)}
                        className={styles.input}
                      />
                    </div>
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

          {activeTab === 'modals' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className={styles.panelHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Estandarización y Ajustes de Modales</h2>
                  <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '4px 0 0 0' }}>Diseña el comportamiento, animaciones, bordes y cabecera de las ventanas modales de tu organización.</p>
                </div>
                <button 
                  onClick={() => setIsTestingInteractive(true)} 
                  style={{
                    background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)',
                    color: 'white',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(79, 70, 229, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'transform 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  ✨ Probar Interactiva
                </button>
              </div>

              {/* UX Templates Bar */}
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '16px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '12px' }}>
                  Plantillas de Diseño UX Recomendadas
                </span>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {[
                    { key: 'corporate', label: 'Corporativa Oficial', desc: 'Fondo índigo, bordes amplios' },
                    { key: 'minimalist', label: 'Minimalista Clásica', desc: 'Bordes finos, contraste sobrio' },
                    { key: 'critical', label: 'Acción Crítica', desc: 'Alerta roja, foco en peligro' },
                    { key: 'form', label: 'Formulario Amplio', desc: 'Cabecera azul, ancho de 700px' },
                    { key: 'notification', label: 'Notificación Rápida', desc: 'Verde éxito, sin pie de página' }
                  ].map(t => (
                    <button
                      key={t.key}
                      onClick={() => {
                        setLocalModalConfig(MODAL_TEMPLATES[t.key]);
                        alert(`Plantilla "${t.label}" cargada temporalmente. No olvides guardarla.`);
                      }}
                      style={{
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                        padding: '10px 16px',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        textAlign: 'left',
                        flex: '1 1 180px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.borderColor = '#4f46e5';
                        e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.05)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.borderColor = '#e2e8f0';
                        e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.02)';
                      }}
                    >
                      <strong style={{ display: 'block', fontSize: '0.85rem', color: '#1e293b' }}>{t.label}</strong>
                      <span style={{ fontSize: '0.72rem', color: '#64748b' }}>{t.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Main Grid: Control Form vs Device Live Preview */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '32px', alignItems: 'start' }}>
                {/* Left Column - Controls Form */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxHeight: '70vh', overflowY: 'auto', paddingRight: '10px' }}>
                  
                  {/* General Container Style */}
                  <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: '20px', borderRadius: '16px' }}>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1e293b', marginTop: 0, marginBottom: '16px', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                      1. Estructura y Contenedor
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Ancho de Modal</label>
                        <input 
                          type="text" 
                          className={styles.input} 
                          value={localModalConfig.width} 
                          onChange={e => setLocalModalConfig({ ...localModalConfig, width: e.target.value })} 
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Radio de Bordes</label>
                        <input 
                          type="text" 
                          className={styles.input} 
                          value={localModalConfig.borderRadius} 
                          onChange={e => setLocalModalConfig({ ...localModalConfig, borderRadius: e.target.value })} 
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Color de Fondo</label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <input 
                            type="color" 
                            value={localModalConfig.bg.startsWith('#') ? localModalConfig.bg : '#ffffff'} 
                            onChange={e => setLocalModalConfig({ ...localModalConfig, bg: e.target.value })} 
                            style={{ width: '38px', height: '38px', padding: 0, border: 'none', cursor: 'pointer', borderRadius: '6px' }}
                          />
                          <input 
                            type="text" 
                            className={styles.input} 
                            value={localModalConfig.bg} 
                            onChange={e => setLocalModalConfig({ ...localModalConfig, bg: e.target.value })} 
                          />
                        </div>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Opacidad del Contenedor</label>
                        <input 
                          type="range" 
                          min="0.5" 
                          max="1" 
                          step="0.05"
                          style={{ width: '100%', marginTop: '12px' }}
                          value={localModalConfig.opacity} 
                          onChange={e => setLocalModalConfig({ ...localModalConfig, opacity: Number(e.target.value) })} 
                        />
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{(localModalConfig.opacity * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Borders Customization */}
                  <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: '20px', borderRadius: '16px' }}>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1e293b', marginTop: 0, marginBottom: '16px', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                      2. Estilo de Bordes
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Grosor de Borde</label>
                        <input 
                          type="text" 
                          className={styles.input} 
                          value={localModalConfig.borderWidth} 
                          onChange={e => setLocalModalConfig({ ...localModalConfig, borderWidth: e.target.value })} 
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Tipo de Borde</label>
                        <select 
                          className={styles.select} 
                          value={localModalConfig.borderStyle} 
                          onChange={e => setLocalModalConfig({ ...localModalConfig, borderStyle: e.target.value })}
                        >
                          <option value="solid">Sólido</option>
                          <option value="dashed">Segmentado (Dashed)</option>
                          <option value="dotted">Punteado (Dotted)</option>
                          <option value="double">Doble</option>
                          <option value="none">Sin Borde</option>
                        </select>
                      </div>
                      <div style={{ gridColumn: 'span 2' }}>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Color de Borde</label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <input 
                            type="color" 
                            value={localModalConfig.borderColor.startsWith('#') ? localModalConfig.borderColor : '#cbd5e1'} 
                            onChange={e => setLocalModalConfig({ ...localModalConfig, borderColor: e.target.value })} 
                            style={{ width: '38px', height: '38px', padding: 0, border: 'none', cursor: 'pointer', borderRadius: '6px' }}
                          />
                          <input 
                            type="text" 
                            className={styles.input} 
                            value={localModalConfig.borderColor} 
                            onChange={e => setLocalModalConfig({ ...localModalConfig, borderColor: e.target.value })} 
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Header Customization */}
                  <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: '20px', borderRadius: '16px' }}>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1e293b', marginTop: 0, marginBottom: '16px', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                      3. Encabezado de Modal
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ display: 'flex', gap: '20px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', cursor: 'pointer' }}>
                          <input 
                            type="checkbox" 
                            checked={localModalConfig.showHeader} 
                            onChange={e => setLocalModalConfig({ ...localModalConfig, showHeader: e.target.checked })} 
                          />
                          Mostrar Cabecera
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', cursor: 'pointer' }}>
                          <input 
                            type="checkbox" 
                            checked={localModalConfig.showIcon} 
                            onChange={e => setLocalModalConfig({ ...localModalConfig, showIcon: e.target.checked })} 
                          />
                          Mostrar Icono
                        </label>
                      </div>
                      {localModalConfig.showHeader && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '8px' }}>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Color Fondo Cabecera</label>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <input 
                                type="color" 
                                value={localModalConfig.headerBg.startsWith('#') ? localModalConfig.headerBg : '#4f46e5'} 
                                onChange={e => setLocalModalConfig({ ...localModalConfig, headerBg: e.target.value })} 
                                style={{ width: '38px', height: '38px', padding: 0, border: 'none', cursor: 'pointer', borderRadius: '6px' }}
                              />
                              <input 
                                type="text" 
                                className={styles.input} 
                                value={localModalConfig.headerBg} 
                                onChange={e => setLocalModalConfig({ ...localModalConfig, headerBg: e.target.value })} 
                              />
                            </div>
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Color Texto Cabecera</label>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <input 
                                type="color" 
                                value={localModalConfig.headerTextColor.startsWith('#') ? localModalConfig.headerTextColor : '#ffffff'} 
                                onChange={e => setLocalModalConfig({ ...localModalConfig, headerTextColor: e.target.value })} 
                                style={{ width: '38px', height: '38px', padding: 0, border: 'none', cursor: 'pointer', borderRadius: '6px' }}
                              />
                              <input 
                                type="text" 
                                className={styles.input} 
                                value={localModalConfig.headerTextColor} 
                                onChange={e => setLocalModalConfig({ ...localModalConfig, headerTextColor: e.target.value })} 
                              />
                            </div>
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Alineación Título</label>
                            <select 
                              className={styles.select} 
                              value={localModalConfig.headerAlignment} 
                              onChange={e => setLocalModalConfig({ ...localModalConfig, headerAlignment: e.target.value })}
                            >
                              <option value="left">Izquierda</option>
                              <option value="center">Centro</option>
                              <option value="right">Derecha</option>
                            </select>
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Tamaño Fuente Título</label>
                            <input 
                              type="text" 
                              className={styles.input} 
                              value={localModalConfig.headerFontSize} 
                              onChange={e => setLocalModalConfig({ ...localModalConfig, headerFontSize: e.target.value })} 
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Content Customization */}
                  <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: '20px', borderRadius: '16px' }}>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1e293b', marginTop: 0, marginBottom: '16px', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                      4. Cuerpo y Contenido
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Tipografía</label>
                        <input 
                          type="text" 
                          className={styles.input} 
                          value={localModalConfig.contentFontFamily} 
                          onChange={e => setLocalModalConfig({ ...localModalConfig, contentFontFamily: e.target.value })} 
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Tamaño Fuente</label>
                        <input 
                          type="text" 
                          className={styles.input} 
                          value={localModalConfig.contentFontSize} 
                          onChange={e => setLocalModalConfig({ ...localModalConfig, contentFontSize: e.target.value })} 
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Espaciado Interno (Padding)</label>
                        <input 
                          type="text" 
                          className={styles.input} 
                          value={localModalConfig.contentPadding} 
                          onChange={e => setLocalModalConfig({ ...localModalConfig, contentPadding: e.target.value })} 
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Color Texto</label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <input 
                            type="color" 
                            value={localModalConfig.contentTextColor.startsWith('#') ? localModalConfig.contentTextColor : '#1e293b'} 
                            onChange={e => setLocalModalConfig({ ...localModalConfig, contentTextColor: e.target.value })} 
                            style={{ width: '38px', height: '38px', padding: 0, border: 'none', cursor: 'pointer', borderRadius: '6px' }}
                          />
                          <input 
                            type="text" 
                            className={styles.input} 
                            value={localModalConfig.contentTextColor} 
                            onChange={e => setLocalModalConfig({ ...localModalConfig, contentTextColor: e.target.value })} 
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Overlay & Dismiss */}
                  <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: '20px', borderRadius: '16px' }}>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1e293b', marginTop: 0, marginBottom: '16px', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                      5. Fondo (Overlay) y Cerrado
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Color del Fondo Overlay</label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <input 
                            type="color" 
                            value={localModalConfig.overlayBg.startsWith('#') ? localModalConfig.overlayBg : '#0f172a'} 
                            onChange={e => setLocalModalConfig({ ...localModalConfig, overlayBg: e.target.value })} 
                            style={{ width: '38px', height: '38px', padding: 0, border: 'none', cursor: 'pointer', borderRadius: '6px' }}
                          />
                          <input 
                            type="text" 
                            className={styles.input} 
                            value={localModalConfig.overlayBg} 
                            onChange={e => setLocalModalConfig({ ...localModalConfig, overlayBg: e.target.value })} 
                          />
                        </div>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Nivel de Transparencia (Opacidad)</label>
                        <input 
                          type="range" 
                          min="0" 
                          max="1" 
                          step="0.05"
                          style={{ width: '100%', marginTop: '12px' }}
                          value={localModalConfig.overlayOpacity} 
                          onChange={e => setLocalModalConfig({ ...localModalConfig, overlayOpacity: Number(e.target.value) })} 
                        />
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{(localModalConfig.overlayOpacity * 100).toFixed(0)}%</span>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Efecto Desenfoque (Blur)</label>
                        <input 
                          type="text" 
                          placeholder="Ej: 4px" 
                          className={styles.input} 
                          value={localModalConfig.overlayBlur} 
                          onChange={e => setLocalModalConfig({ ...localModalConfig, overlayBlur: e.target.value })} 
                        />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '16px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', cursor: 'pointer' }}>
                          <input 
                            type="checkbox" 
                            checked={localModalConfig.overlayClickClose} 
                            onChange={e => setLocalModalConfig({ ...localModalConfig, overlayClickClose: e.target.checked })} 
                          />
                          Cerrar al hacer click fuera
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', cursor: 'pointer' }}>
                          <input 
                            type="checkbox" 
                            checked={localModalConfig.closeOnEsc} 
                            onChange={e => setLocalModalConfig({ ...localModalConfig, closeOnEsc: e.target.checked })} 
                          />
                          Cerrar con tecla ESC
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Layout & Behavior */}
                  <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: '20px', borderRadius: '16px' }}>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1e293b', marginTop: 0, marginBottom: '16px', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                      6. Comportamiento y Disposición
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Disposición Física</label>
                        <select 
                          className={styles.select} 
                          value={localModalConfig.layoutType} 
                          onChange={e => setLocalModalConfig({ ...localModalConfig, layoutType: e.target.value as any })}
                        >
                          <option value="centered">Centrado Clásico (Centered)</option>
                          <option value="lateral">Panel Lateral Desplizable (Right Drawer)</option>
                          <option value="fullscreen">Pantalla Completa (Fullscreen)</option>
                        </select>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', cursor: 'pointer' }}>
                          <input 
                            type="checkbox" 
                            checked={localModalConfig.isDraggable} 
                            onChange={e => setLocalModalConfig({ ...localModalConfig, isDraggable: e.target.checked })} 
                          />
                          Habilitar Arrastre (Drag & Drop)
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Button Styles */}
                  <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: '20px', borderRadius: '16px' }}>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1e293b', marginTop: 0, marginBottom: '16px', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                      7. Personalización de Botones
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Radio de Borde (Border Radius)</label>
                        <input 
                          type="text" 
                          placeholder="Ej: 12px o 9999px" 
                          className={styles.input} 
                          value={localModalConfig.btnBorderRadius || '12px'} 
                          onChange={e => setLocalModalConfig({ ...localModalConfig, btnBorderRadius: e.target.value })} 
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Tamaño de Botón</label>
                        <select 
                          className={styles.select} 
                          value={localModalConfig.btnSize || 'md'} 
                          onChange={e => setLocalModalConfig({ ...localModalConfig, btnSize: e.target.value as any })}
                        >
                          <option value="sm">Pequeño (Small)</option>
                          <option value="md">Medio (Medium)</option>
                          <option value="lg">Grande (Large)</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Botón Principal: Fondo</label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <input 
                            type="color" 
                            style={{ width: '40px', height: '38px', padding: '0', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer' }}
                            value={localModalConfig.btnPrimaryBg.startsWith('#') ? localModalConfig.btnPrimaryBg : '#4f46e5'} 
                            onChange={e => setLocalModalConfig({ ...localModalConfig, btnPrimaryBg: e.target.value })} 
                          />
                          <input 
                            type="text" 
                            className={styles.input} 
                            style={{ flex: 1 }}
                            value={localModalConfig.btnPrimaryBg} 
                            onChange={e => setLocalModalConfig({ ...localModalConfig, btnPrimaryBg: e.target.value })} 
                          />
                        </div>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Botón Principal: Texto</label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <input 
                            type="color" 
                            style={{ width: '40px', height: '38px', padding: '0', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer' }}
                            value={localModalConfig.btnPrimaryText.startsWith('#') ? localModalConfig.btnPrimaryText : '#ffffff'} 
                            onChange={e => setLocalModalConfig({ ...localModalConfig, btnPrimaryText: e.target.value })} 
                          />
                          <input 
                            type="text" 
                            className={styles.input} 
                            style={{ flex: 1 }}
                            value={localModalConfig.btnPrimaryText} 
                            onChange={e => setLocalModalConfig({ ...localModalConfig, btnPrimaryText: e.target.value })} 
                          />
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Botón Secundario: Fondo</label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <input 
                            type="color" 
                            style={{ width: '40px', height: '38px', padding: '0', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer' }}
                            value={localModalConfig.btnSecondaryBg.startsWith('#') ? localModalConfig.btnSecondaryBg : '#f1f5f9'} 
                            onChange={e => setLocalModalConfig({ ...localModalConfig, btnSecondaryBg: e.target.value })} 
                          />
                          <input 
                            type="text" 
                            className={styles.input} 
                            style={{ flex: 1 }}
                            value={localModalConfig.btnSecondaryBg} 
                            onChange={e => setLocalModalConfig({ ...localModalConfig, btnSecondaryBg: e.target.value })} 
                          />
                        </div>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Botón Secundario: Texto</label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <input 
                            type="color" 
                            style={{ width: '40px', height: '38px', padding: '0', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer' }}
                            value={localModalConfig.btnSecondaryText.startsWith('#') ? localModalConfig.btnSecondaryText : '#475569'} 
                            onChange={e => setLocalModalConfig({ ...localModalConfig, btnSecondaryText: e.target.value })} 
                          />
                          <input 
                            type="text" 
                            className={styles.input} 
                            style={{ flex: 1 }}
                            value={localModalConfig.btnSecondaryText} 
                            onChange={e => setLocalModalConfig({ ...localModalConfig, btnSecondaryText: e.target.value })} 
                          />
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Botón Peligro (Danger): Fondo</label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <input 
                            type="color" 
                            style={{ width: '40px', height: '38px', padding: '0', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer' }}
                            value={localModalConfig.btnDangerBg.startsWith('#') ? localModalConfig.btnDangerBg : '#ef4444'} 
                            onChange={e => setLocalModalConfig({ ...localModalConfig, btnDangerBg: e.target.value })} 
                          />
                          <input 
                            type="text" 
                            className={styles.input} 
                            style={{ flex: 1 }}
                            value={localModalConfig.btnDangerBg} 
                            onChange={e => setLocalModalConfig({ ...localModalConfig, btnDangerBg: e.target.value })} 
                          />
                        </div>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Botón Peligro (Danger): Texto</label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <input 
                            type="color" 
                            style={{ width: '40px', height: '38px', padding: '0', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer' }}
                            value={localModalConfig.btnDangerText.startsWith('#') ? localModalConfig.btnDangerText : '#ffffff'} 
                            onChange={e => setLocalModalConfig({ ...localModalConfig, btnDangerText: e.target.value })} 
                          />
                          <input 
                            type="text" 
                            className={styles.input} 
                            style={{ flex: 1 }}
                            value={localModalConfig.btnDangerText} 
                            onChange={e => setLocalModalConfig({ ...localModalConfig, btnDangerText: e.target.value })} 
                          />
                        </div>
                      </div>
                    </div>

                    <div style={{ marginTop: '10px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', cursor: 'pointer' }}>
                        <input 
                          type="checkbox" 
                          checked={localModalConfig.btnIconography} 
                          onChange={e => setLocalModalConfig({ ...localModalConfig, btnIconography: e.target.checked })} 
                        />
                        Habilitar Iconografía en Botones (Ej. Icono de guardar/eliminar)
                      </label>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div style={{ display: 'flex', gap: '12px', marginTop: '10px', marginBottom: '30px' }}>
                    <button 
                      onClick={async () => {
                        setIsSaving(true);
                        try {
                          await saveModalConfig(localModalConfig);
                          alert('✅ Configuración de modales guardada en base de datos para tu empresa exitosamente.');
                        } catch (e) {
                          alert('❌ Error al guardar en base de datos.');
                        } finally {
                          setIsSaving(false);
                        }
                      }}
                      disabled={isSaving}
                      style={{
                        flex: 1,
                        background: '#4f46e5',
                        color: 'white',
                        border: 'none',
                        padding: '14px 28px',
                        borderRadius: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        boxShadow: '0 4px 14px rgba(79, 70, 229, 0.3)',
                        transition: 'opacity 0.2s'
                      }}
                    >
                      {isSaving ? 'Guardando...' : 'Guardar Configuración por Empresa'}
                    </button>
                    <button 
                      onClick={() => {
                        setLocalModalConfig(DEFAULT_MODAL_CONFIG);
                        alert('Valores restablecidos temporalmente. Haz click en Guardar para persistir.');
                      }}
                      style={{
                        background: '#ffffff',
                        color: '#475569',
                        border: '1px solid #cbd5e1',
                        padding: '14px 20px',
                        borderRadius: '12px',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      Restablecer a Valores Base
                    </button>
                  </div>

                </div>

                {/* Right Column - Simulated Device Preview */}
                <div style={{ position: 'sticky', top: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: '20px', borderRadius: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>
                        Previsualización en Tiempo Real
                      </h3>
                      {/* Device Toggles */}
                      <div style={{ display: 'flex', gap: '4px', background: '#f1f5f9', padding: '4px', borderRadius: '8px' }}>
                        {(['desktop', 'tablet', 'mobile'] as const).map(d => (
                          <button
                            key={d}
                            onClick={() => setPreviewDevice(d)}
                            style={{
                              background: previewDevice === d ? '#ffffff' : 'transparent',
                              border: 'none',
                              padding: '6px 12px',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              textTransform: 'capitalize',
                              color: previewDevice === d ? '#4f46e5' : '#64748b',
                              boxShadow: previewDevice === d ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                            }}
                          >
                            {d}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Modal Type Selector */}
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                      {(['informativa', 'confirmacion', 'formulario'] as const).map(t => (
                        <button
                          key={t}
                          onClick={() => setPreviewType(t)}
                          style={{
                            flex: 1,
                            background: previewType === t ? '#eef2ff' : 'transparent',
                            border: `1px solid ${previewType === t ? '#4f46e5' : '#e2e8f0'}`,
                            padding: '8px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            textTransform: 'capitalize',
                            color: previewType === t ? '#4f46e5' : '#475569',
                          }}
                        >
                          {t}
                        </button>
                      ))}
                    </div>

                    {/* Simulated Screen Wrap */}
                    <div 
                      style={{
                        background: '#0f172a',
                        borderRadius: '16px',
                        padding: '24px 16px',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        minHeight: '380px',
                        border: '4px solid #334155',
                        position: 'relative',
                        overflow: 'hidden',
                        transition: 'width 0.3s ease'
                      }}
                    >
                      {/* Inline Modal Card (Simulation using local settings) */}
                      <div
                        style={{
                          width: previewDevice === 'mobile' ? '280px' : previewDevice === 'tablet' ? '380px' : '90%',
                          background: localModalConfig.bg,
                          opacity: localModalConfig.opacity,
                          borderRadius: localModalConfig.borderRadius,
                          borderWidth: localModalConfig.borderWidth,
                          borderColor: localModalConfig.borderColor,
                          borderStyle: localModalConfig.borderStyle,
                          boxShadow: localModalConfig.shadow,
                          display: 'flex',
                          flexDirection: 'column',
                          fontFamily: localModalConfig.contentFontFamily,
                          color: localModalConfig.contentTextColor,
                          fontSize: '0.85rem',
                          overflow: 'hidden'
                        }}
                      >
                        {/* Header */}
                        {localModalConfig.showHeader && (
                          <div 
                            style={{ 
                              padding: '12px 16px', 
                              background: localModalConfig.headerBg, 
                              color: localModalConfig.headerTextColor,
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              {localModalConfig.showIcon && (
                                <div style={{ padding: '6px', background: 'rgba(255, 255, 255, 0.2)', borderRadius: '6px', display: 'flex', color: localModalConfig.headerTextColor }}>
                                  {previewType === 'confirmacion' ? <AlertTriangle size={16} /> : previewType === 'formulario' ? <Info size={16} /> : <Award size={16} />}
                                </div>
                              )}
                              <strong style={{ color: localModalConfig.headerTextColor, fontSize: '0.9rem' }}>
                                {previewType === 'confirmacion' ? '¿Confirmar Operación?' : previewType === 'formulario' ? 'Ficha de Activo' : 'Detalle de Módulo'}
                              </strong>
                            </div>
                            <X size={14} style={{ opacity: 0.8 }} />
                          </div>
                        )}

                        {/* Body */}
                        <div style={{ padding: '16px', fontSize: '0.8rem', color: localModalConfig.contentTextColor }}>
                          {previewType === 'confirmacion' && (
                            <p style={{ margin: 0, lineHeight: 1.4 }}>¿Estás seguro de que deseas eliminar permanentemente este registro del catálogo de metadatos corporativos? Esta acción no se puede deshacer.</p>
                          )}
                          {previewType === 'formulario' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              <div>
                                <label style={{ display: 'block', fontWeight: 700, marginBottom: '2px', fontSize: '0.75rem' }}>Nombre del Activo</label>
                                <input type="text" readOnly value="db_transactions_2026" style={{ width: '100%', padding: '6px', fontSize: '0.75rem', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
                              </div>
                              <div>
                                <label style={{ display: 'block', fontWeight: 700, marginBottom: '2px', fontSize: '0.75rem' }}>Clasificación</label>
                                <select disabled style={{ width: '100%', padding: '6px', fontSize: '0.75rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}><option>Confidencial - PII</option></select>
                              </div>
                            </div>
                          )}
                          {previewType === 'informativa' && (
                            <p style={{ margin: 0, lineHeight: 1.4 }}>El marco de gobierno DAMA-DMBOK establece que toda política de seguridad de datos debe ser auditada al menos una vez al año por un Steward calificado.</p>
                          )}
                        </div>

                        {/* Footer */}
                        {localModalConfig.showFooter && (
                          <div 
                            style={{ 
                              padding: '10px 16px', 
                              background: '#f8fafc', 
                              borderTop: '1px solid #cbd5e1', 
                              display: 'flex', 
                              justifyContent: localModalConfig.footerAlign === 'center' ? 'center' : localModalConfig.footerAlign === 'left' ? 'flex-start' : 'flex-end', 
                              gap: '8px' 
                            }}
                          >
                            {previewType === 'confirmacion' && (
                              <button style={{ padding: '4px 10px', fontSize: '0.75rem', fontWeight: 600, background: localModalConfig.btnSecondaryBg, color: localModalConfig.btnSecondaryText, border: '1px solid #cbd5e1', borderRadius: localModalConfig.btnBorderRadius }}>
                                Cancelar
                              </button>
                            )}
                            <button 
                              style={{ 
                                padding: '4px 10px', 
                                fontSize: '0.75rem', 
                                fontWeight: 600, 
                                background: previewType === 'confirmacion' ? localModalConfig.btnDangerBg : localModalConfig.btnPrimaryBg, 
                                color: previewType === 'confirmacion' ? localModalConfig.btnDangerText : localModalConfig.btnPrimaryText,
                                border: 'none',
                                borderRadius: localModalConfig.btnBorderRadius 
                              }}
                            >
                               {previewType === 'confirmacion' ? 'Eliminar' : 'Guardar'}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Render the actual Interactive Pop-up Modal when testing */}
              <UnifiedModal
                isOpen={isTestingInteractive}
                onClose={() => setIsTestingInteractive(false)}
                title={previewType === 'confirmacion' ? 'Prueba Interactiva: Confirmar' : previewType === 'formulario' ? 'Prueba Interactiva: Formulario' : 'Prueba Interactiva: Informativa'}
                subtitle="Esta ventana modal está usando la configuración en vivo que estás editando en este momento."
                type={previewType}
                confirmLabel="Entendido y Cerrar"
                confirmBtnType={previewType === 'confirmacion' ? 'danger' : 'primary'}
                configOverride={localModalConfig}
              >
                <div style={{ padding: '8px 0' }}>
                  <p style={{ margin: 0, marginBottom: '12px' }}>
                    ¡Felicidades! Estás probando el funcionamiento real de la ventana modal estandarizada de GovData Nexus.
                  </p>
                  <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.85rem' }}>
                    <strong>Interactividad Habilitada:</strong>
                    <ul style={{ margin: '4px 0 0 0', paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <li>Cierre con tecla <strong>ESC</strong>: {localModalConfig.closeOnEsc ? 'Habilitado' : 'Deshabilitado'}</li>
                      <li>Cierre con clic <strong>fuera del modal</strong>: {localModalConfig.overlayClickClose ? 'Habilitado' : 'Deshabilitado'}</li>
                      <li><strong>Arrastre (Drag & Drop)</strong>: {localModalConfig.isDraggable ? 'Habilitado (Haz click en la cabecera y arrastra)' : 'Deshabilitado'}</li>
                      <li>Tipo de disposición física: <strong>{localModalConfig.layoutType}</strong></li>
                    </ul>
                  </div>
                </div>
              </UnifiedModal>
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

                  {/* Asistente de Parametrización del Dashboard */}
                  <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '24px', marginTop: '32px' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '8px' }}>Asistente de Parametrización del Dashboard</h3>
                    <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.85rem', marginBottom: '20px' }}>
                      Ajusta cómo se renderizan los gráficos de métricas y la tipografía base en tu Dashboard.
                    </p>

                    <div className={styles.section} style={{ background: 'rgba(0,0,0,0.15)', padding: '20px', borderRadius: '12px' }}>
                      <div className={styles.field}>
                        <label>Tipo de Gráfica Evolutiva</label>
                        <select 
                          className={styles.select} 
                          value={dashboardChartType} 
                          onChange={(e) => setDashboardChartType(e.target.value as any)}
                        >
                          <option value="area">Área (Relleno Suave)</option>
                          <option value="bar">Barras (Histórico)</option>
                          <option value="line">Líneas (Tendencia)</option>
                        </select>
                      </div>

                      <div className={styles.field} style={{ marginTop: '16px' }}>
                        <label>Paleta de Colores de Gráficas</label>
                        <select 
                          className={styles.select} 
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === 'ocean') setDashboardChartColors(['#3b82f6', '#0ea5e9', '#0284c7']);
                            else if (val === 'emerald') setDashboardChartColors(['#10b981', '#059669', '#047857']);
                            else if (val === 'warm') setDashboardChartColors(['#f59e0b', '#d97706', '#b45309']);
                            else if (val === 'corporate') setDashboardChartColors(['#1e3a8a', '#312e81', '#1e1b4b']);
                          }}
                          value={
                            dashboardChartColors[0] === '#3b82f6' ? 'ocean' :
                            dashboardChartColors[0] === '#10b981' ? 'emerald' :
                            dashboardChartColors[0] === '#f59e0b' ? 'warm' :
                            dashboardChartColors[0] === '#1e3a8a' ? 'corporate' : 'custom'
                          }
                        >
                          <option value="ocean">Oceánico (Azules)</option>
                          <option value="emerald">Esmeralda (Verdes)</option>
                          <option value="warm">Cálido (Naranjas/Amarillos)</option>
                          <option value="corporate">Corporativo (Azul Oscuro/Indigo)</option>
                          <option value="custom">Personalizado</option>
                        </select>
                        <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                          {dashboardChartColors.map((col, idx) => (
                            <input 
                              key={idx}
                              type="color" 
                              value={col} 
                              onChange={(e) => {
                                const newCols = [...dashboardChartColors];
                                newCols[idx] = e.target.value;
                                setDashboardChartColors(newCols);
                              }}
                              style={{ width: '32px', height: '32px', padding: '0', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                            />
                          ))}
                        </div>
                      </div>

                      <div className={styles.field} style={{ marginTop: '16px' }}>
                        <label>Tipografía del Dashboard</label>
                        <select 
                          className={styles.select} 
                          value={dashboardFont} 
                          onChange={(e) => setDashboardFont(e.target.value)}
                        >
                          <option value="'Inter', sans-serif">Inter (Moderna/Limpia)</option>
                          <option value="'Roboto', sans-serif">Roboto (Corporativa)</option>
                          <option value="'Poppins', sans-serif">Poppins (Geométrica)</option>
                          <option value="'Outfit', sans-serif">Outfit (Tecnológica)</option>
                        </select>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginTop: '16px' }}>
                        <div className={styles.field}>
                          <label>Color de Textos Principales</label>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <input 
                              type="color" 
                              value={dashboardTextColor} 
                              onChange={(e) => setDashboardTextColor(e.target.value)}
                              style={{ width: '40px', height: '40px', padding: '0', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                            />
                            <select 
                              className={styles.select} 
                              value={dashboardTextColor} 
                              onChange={(e) => setDashboardTextColor(e.target.value)}
                            >
                              <option value="#0f172a">Azul Oscuro (Pizarra)</option>
                              <option value="#111827">Gris Muy Oscuro</option>
                              <option value="#ffffff">Blanco Nieve</option>
                            </select>
                          </div>
                        </div>

                        <div className={styles.field}>
                          <label>Color de Títulos Secundarios</label>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <input 
                              type="color" 
                              value={dashboardTitleColor} 
                              onChange={(e) => setDashboardTitleColor(e.target.value)}
                              style={{ width: '40px', height: '40px', padding: '0', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                            />
                            <select 
                              className={styles.select} 
                              value={dashboardTitleColor} 
                              onChange={(e) => setDashboardTitleColor(e.target.value)}
                            >
                              <option value="#475569">Gris Suave (Slate)</option>
                              <option value="#6b7280">Gris Medio</option>
                              <option value="#94a3b8">Gris Claro / Translúcido</option>
                            </select>
                          </div>
                        </div>

                        <div className={styles.field}>
                          <label>Tamaño General de Textos</label>
                          <select 
                            className={styles.select} 
                            value={dashboardTextScale} 
                            onChange={(e) => setDashboardTextScale(e.target.value)}
                          >
                            <option value="0.85">Pequeño (85%)</option>
                            <option value="1">Normal (100%)</option>
                            <option value="1.15">Grande (115%)</option>
                            <option value="1.3">Extra Grande (130%)</option>
                          </select>
                        </div>
                      </div>

                      <div className={styles.field} style={{ marginTop: '16px' }}>
                        <label>Estilo de Gráficas de Distribución</label>
                        <select 
                          className={styles.select} 
                          value={pieChartType} 
                          onChange={(e) => setPieChartType(e.target.value as any)}
                        >
                          <option value="donut">Anillo (Donut) - Estilo Moderno</option>
                          <option value="pie">Pastel (Pie) - Sólido Completo</option>
                        </select>
                      </div>

                      <h4 style={{ marginTop: '32px', marginBottom: '16px', fontSize: '1rem', fontWeight: 'bold', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>Textos y Títulos del Dashboard Principal</h4>
                      
                      <div className={styles.field}>
                        <label>Título Principal</label>
                        <input 
                          type="text" 
                          className={styles.input} 
                          value={dashboardContent.mainTitle}
                          onChange={e => setDashboardContent({...dashboardContent, mainTitle: e.target.value})}
                        />
                      </div>
                      <div className={styles.field} style={{ marginTop: '12px' }}>
                        <label>Subtítulo / Saludo</label>
                        <input 
                          type="text" 
                          className={styles.input} 
                          value={dashboardContent.mainSubtitle}
                          onChange={e => setDashboardContent({...dashboardContent, mainSubtitle: e.target.value})}
                        />
                      </div>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginTop: '16px' }}>
                        <div className={styles.field}>
                          <label>Título KPI 1</label>
                          <input type="text" className={styles.input} value={dashboardContent.kpi1Title} onChange={e => setDashboardContent({...dashboardContent, kpi1Title: e.target.value})} />
                        </div>
                        <div className={styles.field}>
                          <label>Título KPI 2</label>
                          <input type="text" className={styles.input} value={dashboardContent.kpi2Title} onChange={e => setDashboardContent({...dashboardContent, kpi2Title: e.target.value})} />
                        </div>
                        <div className={styles.field}>
                          <label>Título KPI 3</label>
                          <input type="text" className={styles.input} value={dashboardContent.kpi3Title} onChange={e => setDashboardContent({...dashboardContent, kpi3Title: e.target.value})} />
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }}>
                        <div className={styles.field}>
                          <label>Título Gráfica Principal (Evolución)</label>
                          <input type="text" className={styles.input} value={dashboardContent.chart1Title} onChange={e => setDashboardContent({...dashboardContent, chart1Title: e.target.value})} />
                        </div>
                        <div className={styles.field}>
                          <label>Título Gráfica Secundaria (Distribución)</label>
                          <input type="text" className={styles.input} value={dashboardContent.chart2Title} onChange={e => setDashboardContent({...dashboardContent, chart2Title: e.target.value})} />
                        </div>
                      </div>

                      <h4 style={{ marginTop: '32px', marginBottom: '12px', fontSize: '1rem', fontWeight: 'bold', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>Estilo de Tarjetas y Contenedores</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div className={styles.field}>
                          <label>Fondo de Tarjeta</label>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <input 
                              type="color" 
                              value={cardBg.startsWith('rgba') || cardBg.startsWith('transparent') ? '#ffffff' : cardBg} 
                              onChange={(e) => setCardBg(e.target.value)}
                              style={{ width: '40px', height: '40px', padding: '0', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                            />
                            <select 
                              className={styles.select} 
                              value={cardBg} 
                              onChange={(e) => setCardBg(e.target.value)}
                            >
                              <option value="rgba(255,255,255,0.03)">Cristal Oscuro (Glassmorphism)</option>
                              <option value="rgba(15,23,42,0.8)">Sólido Oscuro (Slate)</option>
                              <option value="#ffffff">Blanco Sólido</option>
                              <option value="transparent">Transparente</option>
                            </select>
                          </div>
                        </div>

                        <div className={styles.field}>
                          <label>Color de Borde</label>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <input 
                              type="color" 
                              value={cardBorderColor.startsWith('rgba') || cardBorderColor.startsWith('transparent') ? '#ffffff' : cardBorderColor} 
                              onChange={(e) => setCardBorderColor(e.target.value)}
                              style={{ width: '40px', height: '40px', padding: '0', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                            />
                            <select 
                              className={styles.select} 
                              value={cardBorderColor} 
                              onChange={(e) => setCardBorderColor(e.target.value)}
                            >
                              <option value="rgba(255, 255, 255, 0.1)">Translúcido Fino</option>
                              <option value="rgba(59, 130, 246, 0.3)">Brillo Azul</option>
                              <option value="transparent">Sin Color</option>
                            </select>
                          </div>
                        </div>

                        <div className={styles.field}>
                          <label>Grosor del Borde</label>
                          <select 
                            className={styles.select} 
                            value={cardBorderWidth} 
                            onChange={(e) => setCardBorderWidth(e.target.value)}
                          >
                            <option value="0px">Sin Borde (0px)</option>
                            <option value="1px">Delgado (1px)</option>
                            <option value="2px">Medio (2px)</option>
                            <option value="4px">Grueso (4px)</option>
                          </select>
                        </div>

                        <div className={styles.field}>
                          <label>Bordes Redondeados (Radius)</label>
                          <select 
                            className={styles.select} 
                            value={cardBorderRadius} 
                            onChange={(e) => setCardBorderRadius(e.target.value)}
                          >
                            <option value="4px">Recto (4px)</option>
                            <option value="12px">Ligero (12px)</option>
                            <option value="24px">Curvo (24px)</option>
                            <option value="32px">Pastilla (32px)</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* App Store & Gamification Configuration */}
                  <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '24px', marginTop: '32px' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '8px' }}>Configuración de App Store & Gamificación</h3>
                    <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.85rem', marginBottom: '20px' }}>
                      Controla los parámetros operativos de las aplicaciones complementarias e interactivas.
                    </p>

                    <div style={{ background: 'rgba(124, 58, 237, 0.05)', border: '1px solid rgba(124, 58, 237, 0.2)', padding: '20px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <strong style={{ display: 'block', fontSize: '0.92rem', color: '#ffffff', marginBottom: '4px' }}>Modo Ilimitado (Data Defender Galaxy)</strong>
                        <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Permitir a los usuarios jugar y realizar el Reto Diario múltiples veces sin el bloqueo de 24 horas.</span>
                      </div>
                      <div>
                        <button
                          onClick={() => {
                            const current = localStorage.getItem('daily_challenge_unlimited') === 'true';
                            localStorage.setItem('daily_challenge_unlimited', (!current).toString());
                            if (current) {
                              // If turning OFF unlimited, clear state to force normal daily tracking
                              localStorage.removeItem(`daily_challenge_played_${currentTenant?.id || 'demo'}`);
                            }
                            alert(`Modo Ilimitado ${!current ? 'ACTIVADO' : 'DESACTIVADO'}.`);
                            // Force state reload by updating window event
                            window.dispatchEvent(new Event('storage'));
                          }}
                          style={{
                            background: typeof window !== 'undefined' && localStorage.getItem('daily_challenge_unlimited') === 'true' ? '#10b981' : 'rgba(255, 255, 255, 0.08)',
                            color: '#ffffff',
                            border: '1px solid rgba(255, 255, 255, 0.15)',
                            padding: '8px 16px',
                            borderRadius: '10px',
                            fontWeight: 'bold',
                            fontSize: '0.85rem',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                        >
                          {typeof window !== 'undefined' && localStorage.getItem('daily_challenge_unlimited') === 'true' ? 'Activado (Jugar Siempre)' : 'Desactivado (Solo 1 vez)'}
                        </button>
                      </div>
                    </div>
                  </div>

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

             {activeTab === 'roles' && (
              <>
                <div className={styles.panelHeader}>
                  <h2>Definición de Roles</h2>
                  <p>Administra los roles de los usuarios en plataforma y decide a qué tienen acceso.</p>
                </div>
                <div className={styles.section} style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
                  <button className={styles.primaryBtn} onClick={() => setIsRoleModalOpen(true)}>
                    <KeyIcon size={16} /> Crear Rol
                  </button>
                </div>

                <div className={styles.rolesGrid}>
                  {roles.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
                      <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🔑</div>
                      <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '4px' }}>Sin roles personalizados</div>
                      <div style={{ fontSize: '0.9rem' }}>Crea roles para controlar qué módulos puede ver y editar cada tipo de usuario.</div>
                    </div>
                  )}
                  {roles.map(r => {
                    const rolePerms: RolePerms = r.perms || modulesToPerms(r.modules || []);
                    return (
                    <div key={r.id} className={styles.roleCard}>
                      <div className={styles.roleHeader}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #6366f1, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1rem' }}>🔑</div>
                          <div className={styles.roleName}>{r.name}</div>
                        </div>
                        <div className={styles.roleActions}>
                          <button className={styles.iconBtn} onClick={() => {
                            setEditingRole({
                              id: r.id,
                              name: r.name,
                              description: r.description || '',
                              perms: r.perms || modulesToPerms(r.modules || [])
                            });
                            setIsEditRoleModalOpen(true);
                          }} title="Editar"><Edit size={14} /></button>
                          <button className={styles.iconBtn} onClick={async () => {
                            if (confirm('¿Eliminar rol?')) {
                              const { error } = await supabase.from('roles').delete().eq('id', r.id);
                              if (!error) setRoles(roles.filter(v => v.id !== r.id));
                            }
                          }} title="Eliminar"><Trash2 size={14} color="#ef4444" /></button>
                        </div>
                      </div>
                      <div className={styles.roleDesc}>{r.description || 'Sin descripción del rol.'}</div>
                      
                      <hr className={styles.divider} />
                      
                      <div className={styles.moduleAccessTitle}>Matriz de Permisos:</div>
                      <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                          <thead>
                            <tr>
                              <th style={{ textAlign: 'left', padding: '4px 6px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Módulo</th>
                              {PERMISSION_LABELS.map(p => (
                                <th key={p.key} style={{ textAlign: 'center', padding: '4px 6px', color: p.color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', minWidth: '48px' }}>{p.label}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {AVAILABLE_MODULES.map(mod => {
                              const mp = rolePerms[mod.key] || { view: false, create: false, edit: false, delete: false };
                              const hasAny = mp.view || mp.create || mp.edit || mp.delete;
                              return (
                                <tr key={mod.key} style={{ background: hasAny ? 'rgba(99,102,241,0.04)' : 'transparent', borderRadius: '6px' }}>
                                  <td style={{ padding: '5px 6px', fontWeight: hasAny ? 700 : 400, color: hasAny ? '#1e293b' : '#cbd5e1', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    <span>{mod.icon}</span><span>{mod.label}</span>
                                  </td>
                                  {PERMISSION_LABELS.map(p => (
                                    <td key={p.key} style={{ textAlign: 'center', padding: '5px 6px' }}>
                                      {mp[p.key]
                                        ? <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '20px', height: '20px', borderRadius: '50%', background: p.color, color: 'white' }}><Check size={12} strokeWidth={3} /></span>
                                        : <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '20px', height: '20px', borderRadius: '50%', background: '#f1f5f9', color: '#cbd5e1', fontSize: '14px', fontWeight: 800 }}>−</span>
                                      }
                                    </td>
                                  ))}
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                    );
                  })}
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
                          alias: '',
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

        {/* Modal: Crear Rol */}
        <AnimatePresence>
          {isRoleModalOpen && (
            <div className={styles.modalOverlay} onClick={() => setIsRoleModalOpen(false)}>
              <motion.div
                className={styles.modalContent}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                onClick={e => e.stopPropagation()}
              >
                <div className={styles.modalHeader}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'linear-gradient(135deg, #6366f1, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1.2rem' }}>🔑</div>
                    <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>Crear Nuevo Rol</h2>
                  </div>
                  <button className={styles.closeBtn} onClick={() => setIsRoleModalOpen(false)}><XCircle size={28} /></button>
                </div>
                <div className={styles.modalBody} style={{ maxHeight: '75vh', overflowY: 'auto' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                    <div className={styles.field}>
                      <label>Nombre del Rol</label>
                      <input type="text" className={styles.input} placeholder="Ej: Analista de Datos" value={newRole.name} onChange={e => setNewRole({ ...newRole, name: e.target.value })} />
                    </div>
                    <div className={styles.field}>
                      <label>Descripción</label>
                      <input type="text" className={styles.input} placeholder="Breve descripción del rol..." value={newRole.description} onChange={e => setNewRole({ ...newRole, description: e.target.value })} />
                    </div>
                  </div>
                  
                  <div className={styles.field} style={{ marginTop: '0' }}>
                    <label style={{ fontWeight: 700, display: 'block', marginBottom: '12px', color: '#1e293b', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>🔐 Matriz de Permisos por Módulo</label>
                    <div style={{ borderRadius: '14px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                        <thead>
                          <tr style={{ background: '#f8fafc' }}>
                            <th style={{ textAlign: 'left', padding: '10px 16px', color: '#64748b', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Módulo</th>
                            {PERMISSION_LABELS.map(p => (
                              <th key={p.key} style={{ textAlign: 'center', padding: '10px 12px', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: p.color }}>{p.label}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {AVAILABLE_MODULES.map((mod, idx) => (
                            <tr key={mod.key} style={{ background: idx % 2 === 0 ? 'white' : '#fafbfc', borderTop: '1px solid #f1f5f9' }}>
                              <td style={{ padding: '12px 16px', fontWeight: 600, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontSize: '1.1rem' }}>{mod.icon}</span>
                                <span>{mod.label}</span>
                              </td>
                              {PERMISSION_LABELS.map(p => {
                                const val = newRole.perms[mod.key]?.[p.key] || false;
                                return (
                                  <td key={p.key} style={{ textAlign: 'center', padding: '12px' }}>
                                    <label style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                      <input
                                        type="checkbox"
                                        checked={val}
                                        onChange={e => {
                                          const updated: RolePerms = { ...newRole.perms };
                                          updated[mod.key] = { ...(updated[mod.key] || { view: false, create: false, edit: false, delete: false }), [p.key]: e.target.checked };
                                          // Auto-enable 'view' if any other permission is enabled
                                          if (p.key !== 'view' && e.target.checked) updated[mod.key].view = true;
                                          setNewRole({ ...newRole, perms: updated });
                                        }}
                                        style={{ display: 'none' }}
                                      />
                                      <span style={{
                                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                        width: '24px', height: '24px', borderRadius: '6px',
                                        background: val ? p.color : '#f1f5f9',
                                        color: val ? 'white' : '#cbd5e1',
                                        border: val ? `2px solid ${p.color}` : '2px solid #e2e8f0',
                                        transition: 'all 0.15s',
                                        cursor: 'pointer'
                                      }}>
                                        {val ? <Check size={14} strokeWidth={3} /> : <span style={{ fontSize: '12px', fontWeight: 800 }}>−</span>}
                                      </span>
                                    </label>
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div style={{ marginTop: '8px', fontSize: '0.78rem', color: '#94a3b8', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                      {PERMISSION_LABELS.map(p => <span key={p.key} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '3px', background: p.color }}></span>{p.label}: puede {p.key === 'view' ? 'visualizar' : p.key === 'create' ? 'crear registros' : p.key === 'edit' ? 'modificar' : 'eliminar'}</span>)}
                    </div>
                  </div>
                </div>
                <div className={styles.modalActions}>
                  <button className={styles.secondaryBtn} onClick={() => setIsRoleModalOpen(false)}>Cancelar</button>
                  <button className={styles.primaryBtn} onClick={async () => {
                    if (!newRole.name) { alert('Nombre requerido'); return; }
                    if (!currentTenant) return;
                    
                    const isValidUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(currentTenant.id);
                    
                    try {
                      // Insert Role (use null tenant_id if non-UUID mock ID)
                      const { data: roleData, error: roleError } = await supabase
                        .from('roles')
                        .insert({ 
                          name: newRole.name, 
                          description: newRole.description,
                          tenant_id: isValidUuid ? currentTenant.id : null
                        })
                        .select()
                        .single();
                        
                      if (roleError) throw roleError;
                      
                      // Insert granular permissions as role_modules entries
                      const moduleKeys = permsToModules(newRole.perms);
                      if (moduleKeys.length > 0) {
                        const mappings = moduleKeys.map(mod => ({
                          role_id: roleData.id,
                          module: mod
                        }));
                        const { error: mapError } = await supabase
                          .from('role_modules')
                          .insert(mappings);
                          
                        if (mapError) throw mapError;
                      }
                      
                      // Update State and Close
                      setRoles([{ ...roleData, perms: newRole.perms, modules: moduleKeys }, ...roles]);
                      setIsRoleModalOpen(false);
                      setNewRole({ name: '', description: '', perms: emptyPerms() });
                      alert('✅ Rol creado exitosamente con matriz de permisos configurada.');
                    } catch (e: any) {
                      console.error(e);
                      alert('❌ Error al crear el rol: ' + (e.message || e.details || e));
                    }
                  }}>
                    <Check size={18} /> Crear Rol
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
        {/* Modal: Editar Rol */}
        <AnimatePresence>
          {isEditRoleModalOpen && editingRole && (
            <div className={styles.modalOverlay} onClick={() => setIsEditRoleModalOpen(false)}>
              <motion.div
                className={styles.modalContent}
                style={{ width: '800px', maxWidth: '95vw' }}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                onClick={e => e.stopPropagation()}
              >
                <div className={styles.modalHeader}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'linear-gradient(135deg, #6366f1, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1.2rem' }}>🔑</div>
                    <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>Editar Rol: {editingRole.name}</h2>
                  </div>
                  <button className={styles.closeBtn} onClick={() => setIsEditRoleModalOpen(false)}><XCircle size={28} /></button>
                </div>
                <div className={styles.modalBody} style={{ maxHeight: '75vh', overflowY: 'auto' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                    <div className={styles.field}>
                      <label>Nombre del Rol</label>
                      <input type="text" className={styles.input} value={editingRole.name} onChange={e => setEditingRole({ ...editingRole, name: e.target.value })} />
                    </div>
                    <div className={styles.field}>
                      <label>Descripción</label>
                      <input type="text" className={styles.input} value={editingRole.description} onChange={e => setEditingRole({ ...editingRole, description: e.target.value })} />
                    </div>
                  </div>
                  
                  <div className={styles.field} style={{ marginTop: '0' }}>
                    <label style={{ fontWeight: 700, display: 'block', marginBottom: '12px', color: '#1e293b', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>🔐 Matriz de Permisos por Módulo</label>
                    <div style={{ borderRadius: '14px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                        <thead>
                          <tr style={{ background: '#f8fafc' }}>
                            <th style={{ textAlign: 'left', padding: '10px 16px', color: '#64748b', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Módulo</th>
                            {PERMISSION_LABELS.map(p => (
                              <th key={p.key} style={{ textAlign: 'center', padding: '10px 12px', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: p.color }}>{p.label}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {AVAILABLE_MODULES.map((mod, idx) => (
                            <tr key={mod.key} style={{ background: idx % 2 === 0 ? 'white' : '#fafbfc', borderTop: '1px solid #f1f5f9' }}>
                              <td style={{ padding: '12px 16px', fontWeight: 600, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontSize: '1.1rem' }}>{mod.icon}</span>
                                <span>{mod.label}</span>
                              </td>
                              {PERMISSION_LABELS.map(p => {
                                const val = editingRole.perms[mod.key]?.[p.key] || false;
                                return (
                                  <td key={p.key} style={{ textAlign: 'center', padding: '12px' }}>
                                    <label style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                      <input
                                        type="checkbox"
                                        checked={val}
                                        onChange={e => {
                                          const updated: RolePerms = { ...editingRole.perms };
                                          updated[mod.key] = { ...(updated[mod.key] || { view: false, create: false, edit: false, delete: false }), [p.key]: e.target.checked };
                                          if (p.key !== 'view' && e.target.checked) updated[mod.key].view = true;
                                          setEditingRole({ ...editingRole, perms: updated });
                                        }}
                                        style={{ display: 'none' }}
                                      />
                                      <span style={{
                                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                        width: '24px', height: '24px', borderRadius: '6px',
                                        background: val ? p.color : '#f1f5f9',
                                        color: val ? 'white' : '#cbd5e1',
                                        border: val ? `2px solid ${p.color}` : '2px solid #e2e8f0',
                                        transition: 'all 0.15s',
                                        cursor: 'pointer'
                                      }}>
                                        {val ? <Check size={14} strokeWidth={3} /> : <span style={{ fontSize: '12px', fontWeight: 800 }}>−</span>}
                                      </span>
                                    </label>
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div style={{ marginTop: '8px', fontSize: '0.78rem', color: '#94a3b8', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                      {PERMISSION_LABELS.map(p => <span key={p.key} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '3px', background: p.color }}></span>{p.label}</span>)}
                    </div>
                  </div>
                </div>
                <div className={styles.modalActions}>
                  <button className={styles.secondaryBtn} onClick={() => setIsEditRoleModalOpen(false)}>Cancelar</button>
                  <button className={styles.primaryBtn} onClick={async () => {
                    if (!editingRole.name) { alert('Nombre requerido'); return; }
                    try {
                      // Update Role
                      const { error: roleError } = await supabase
                        .from('roles')
                        .update({ 
                          name: editingRole.name, 
                          description: editingRole.description
                        })
                        .eq('id', editingRole.id);
                        
                      if (roleError) throw roleError;
                      
                      // Delete old mappings
                      const { error: deleteError } = await supabase
                        .from('role_modules')
                        .delete()
                        .eq('role_id', editingRole.id);
                        
                      if (deleteError) throw deleteError;

                      // Insert updated granular permissions
                      const moduleKeys = permsToModules(editingRole.perms);
                      if (moduleKeys.length > 0) {
                        const mappings = moduleKeys.map(mod => ({
                          role_id: editingRole.id,
                          module: mod
                        }));
                        const { error: mapError } = await supabase
                          .from('role_modules')
                          .insert(mappings);
                          
                        if (mapError) throw mapError;
                      }
                      
                      // Update state list
                      setRoles(roles.map(r => r.id === editingRole.id ? { ...editingRole, modules: moduleKeys } : r));
                      setIsEditRoleModalOpen(false);
                      setEditingRole(null);
                      alert('✅ Rol actualizado exitosamente.');
                    } catch (e: any) {
                      console.error(e);
                      alert('❌ Error al actualizar el rol: ' + (e.message || e.details || e));
                    }
                  }}>
                    <Check size={18} /> Guardar Cambios
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
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
                    <label>Alias (Opcional, para certificados)</label>
                    <input 
                      type="text" 
                      className={styles.input} 
                      placeholder="Ej: CyberNinja"
                      value={inviteForm.alias} 
                      onChange={e => setInviteForm({...inviteForm, alias: e.target.value})} 
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
                      {/* Default Plan Roles */}
                      {getRolesForPlan().map(role => (
                        <option key={role.value} value={role.value}>
                          {role.label}
                        </option>
                      ))}
                      {/* Custom DB Roles */}
                      {roles.map(role => (
                        <option key={role.id} value={role.name}>
                          {role.name} (Personalizado)
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
                    <label>Alias (Opcional, para certificados)</label>
                    <input 
                      type="text" 
                      className={styles.input} 
                      placeholder="Ej: CyberNinja"
                      value={editForm.alias} 
                      onChange={e => setEditForm({...editForm, alias: e.target.value})} 
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
                      {/* Default Plan Roles */}
                      {getRolesForPlan().map(role => (
                        <option key={role.value} value={role.value}>
                          {role.label}
                        </option>
                      ))}
                      {/* Custom DB Roles */}
                      {roles.map(role => (
                        <option key={role.id} value={role.name}>
                          {role.name} (Personalizado)
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
