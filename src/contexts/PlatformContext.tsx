'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

type PlatformMode = 'DEMO' | 'ENTERPRISE';

interface BrandColors {
  primary: string;
  secondary: string;
  theme: string;
}

export interface DashboardContent {
  mainTitle: string;
  mainSubtitle: string;
  kpi1Title: string;
  kpi2Title: string;
  kpi3Title: string;
  chart1Title: string;
  chart2Title: string;
}

export const DEFAULT_DASHBOARD_CONTENT: DashboardContent = {
  mainTitle: 'Executive Command Center',
  mainSubtitle: 'Resumen estratégico de gobernanza de datos',
  kpi1Title: 'Calidad Global',
  kpi2Title: 'Madurez Global',
  kpi3Title: 'Cumplimiento',
  chart1Title: 'Evolución de Métricas',
  chart2Title: 'Distribución de Activos',
};

export interface Tenant {
  id: string;
  name: string;
  domain: string;
  plan: 'Starter' | 'Professional' | 'Enterprise';
  modules: string[];
  monthlyCost: string;
  status: 'active' | 'suspended';
  nit?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  createdAt?: string;
  brandColors?: BrandColors;
  dashboardType?: 'executive' | 'technical' | 'collaborative';
}

export interface SaaSPlan {
  id: string;
  name: 'Starter' | 'Professional' | 'Enterprise';
  priceMonthly: number;
  priceAnnually: number;
  maxUsers: number;
  maxScans: number;
  storageGb: number;
  prioritySupport: boolean;
  apiAccess: boolean;
  active: boolean;
  modules: string[];
}

export interface ModalConfig {
  width: string;
  height: string;
  minHeight: string;
  maxHeight: string;
  borderRadius: string;
  bg: string;
  opacity: number;
  shadow: string;
  borderColor: string;
  borderWidth: string;
  borderStyle: string;
  showHeader: boolean;
  headerBg: string;
  headerTextColor: string;
  headerFontSize: string;
  headerFontWeight: string;
  headerAlignment: string;
  showIcon: boolean;
  contentFontFamily: string;
  contentFontSize: string;
  contentPadding: string;
  contentLineHeight: string;
  contentMargin: string;
  contentTextColor: string;
  showFooter: boolean;
  footerAlign: string;
  footerPadding: string;
  btnPrimaryBg: string;
  btnPrimaryText: string;
  btnSecondaryBg: string;
  btnSecondaryText: string;
  btnWarningBg: string;
  btnWarningText: string;
  btnDangerBg: string;
  btnDangerText: string;
  btnBorderRadius: string;
  btnSize: 'sm' | 'md' | 'lg';
  btnIconography: boolean;
  overlayBg: string;
  overlayOpacity: number;
  overlayBlur: string;
  overlayClickClose: boolean;
  closeOnEsc: boolean;
  isDraggable: boolean;
  isResizable: boolean;
  layoutType: 'centered' | 'lateral' | 'fullscreen';
  responsive: boolean;
  updatedAt?: string;
}

export interface SATheme {
  background: string;
  card: string;
  border: string;
  primary: string;
  text: string;
  fontFamily: string;
  sidebarText: string;
  btnText: string;
}

interface PlatformContextType {
  saTheme: SATheme;
  setSaTheme: (theme: SATheme) => void;
  mode: PlatformMode;
  setMode: (mode: PlatformMode) => void;
  brandColors: BrandColors;
  setBrandColors: (colors: BrandColors) => void;
  // Card styles
  cardBg: string;
  setCardBg: (bg: string) => void;
  cardBorderColor: string;
  setCardBorderColor: (color: string) => void;
  cardBorderRadius: string;
  setCardBorderRadius: (radius: string) => void;
  cardBorderWidth: string;
  setCardBorderWidth: (width: string) => void;
  // Dashboard parameters
  dashboardChartType: 'area' | 'bar' | 'line';
  setDashboardChartType: (type: 'area' | 'bar' | 'line') => void;
  dashboardChartColors: string[];
  setDashboardChartColors: (colors: string[]) => void;
  pieChartType: 'pie' | 'donut';
  setPieChartType: (type: 'pie' | 'donut') => void;
  dashboardFont: string;
  setDashboardFont: (font: string) => void;
  dashboardTextColor: string;
  setDashboardTextColor: (color: string) => void;
  dashboardTitleColor: string;
  setDashboardTitleColor: (color: string) => void;
  dashboardTextScale: string;
  setDashboardTextScale: (scale: string) => void;
  dashboardContent: DashboardContent;
  setDashboardContent: (content: DashboardContent) => void;
  // Modals
  modalBg: string;
  setModalBg: (bg: string) => void;
  modalFont: string;
  setModalFont: (font: string) => void;
  modalTextColor: string;
  setModalTextColor: (color: string) => void;
  modalBlur: string;
  setModalBlur: (blur: string) => void;
  // Configurable Modals
  modalConfig: ModalConfig;
  setModalConfig: (config: ModalConfig) => void;
  saveModalConfig: (config: ModalConfig) => Promise<void>;
  // Configurable Branding & Video settings
  logoUrl: string;
  setLogoUrl: (url: string) => void;
  logoWidth: string;
  setLogoWidth: (width: string) => void;
  transformationVideoUrl: string;
  setTransformationVideoUrl: (url: string) => void;
  transformationVideoAspect: string;
  setTransformationVideoAspect: (aspect: string) => void;
  // Tenants
  tenants: Tenant[];
  currentTenant: Tenant;
  setCurrentTenant: (tenant: Tenant) => void;
  updateTenantModules: (tenantId: string, modules: string[]) => Promise<void>;
  addTenant: (data: Partial<Tenant> & { name: string; domain: string; plan: 'Starter' | 'Professional' | 'Enterprise' }) => Promise<void>;
  updateTenant: (tenantId: string, data: Partial<Tenant>) => Promise<void>;
  deleteTenant: (tenantId: string) => Promise<void>;
  toggleTenantStatus: (tenantId: string) => Promise<void>;
  // Plans
  plans: SaaSPlan[];
  updatePlan: (planId: string, data: Partial<SaaSPlan>) => void;
}

// =================== Default data ===================
export const DEFAULT_MODAL_CONFIG: ModalConfig = {
  width: '600px',
  height: 'auto',
  minHeight: '200px',
  maxHeight: '90vh',
  borderRadius: '24px',
  bg: '#ffffff',
  opacity: 1,
  shadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
  borderColor: '#e2e8f0',
  borderWidth: '1px',
  borderStyle: 'solid',
  showHeader: true,
  headerBg: '#4f46e5',
  headerTextColor: '#ffffff',
  headerFontSize: '1.25rem',
  headerFontWeight: '800',
  headerAlignment: 'left',
  showIcon: true,
  contentFontFamily: 'Inter, sans-serif',
  contentFontSize: '0.95rem',
  contentPadding: '32px',
  contentLineHeight: '1.5',
  contentMargin: '0px',
  contentTextColor: '#1e293b',
  showFooter: true,
  footerAlign: 'right',
  footerPadding: '16px 32px',
  btnPrimaryBg: '#4f46e5',
  btnPrimaryText: '#ffffff',
  btnSecondaryBg: '#f1f5f9',
  btnSecondaryText: '#475569',
  btnWarningBg: '#f59e0b',
  btnWarningText: '#ffffff',
  btnDangerBg: '#ef4444',
  btnDangerText: '#ffffff',
  btnBorderRadius: '12px',
  btnSize: 'md',
  btnIconography: true,
  overlayBg: '#0f172a',
  overlayOpacity: 0.5,
  overlayBlur: '4px',
  overlayClickClose: true,
  closeOnEsc: true,
  isDraggable: false,
  isResizable: false,
  layoutType: 'centered',
  responsive: true,
};

export const MODAL_TEMPLATES: Record<string, ModalConfig> = {
  corporate: { ...DEFAULT_MODAL_CONFIG },
  minimalist: {
    ...DEFAULT_MODAL_CONFIG,
    borderRadius: '8px',
    bg: '#ffffff',
    borderColor: '#e2e8f0',
    borderWidth: '1px',
    borderStyle: 'solid',
    headerBg: '#ffffff',
    headerTextColor: '#0f172a',
    headerFontSize: '1.2rem',
    headerFontWeight: '600',
    contentPadding: '24px',
    contentTextColor: '#334155',
    btnPrimaryBg: '#0f172a',
    btnBorderRadius: '6px',
    shadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    overlayBlur: '0px',
  },
  critical: {
    ...DEFAULT_MODAL_CONFIG,
    headerBg: '#ef4444',
    btnPrimaryBg: '#ef4444',
    shadow: '0 25px 50px -12px rgba(239, 68, 68, 0.15)',
  },
  form: {
    ...DEFAULT_MODAL_CONFIG,
    width: '700px',
    headerBg: '#3b82f6',
    btnPrimaryBg: '#3b82f6',
  },
  notification: {
    ...DEFAULT_MODAL_CONFIG,
    width: '450px',
    headerBg: '#10b981',
    btnPrimaryBg: '#10b981',
    showFooter: false,
    overlayClickClose: true,
  }
};

const defaultPlans: SaaSPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    priceMonthly: 29,
    priceAnnually: 290,
    maxUsers: 10,
    maxScans: 100,
    storageGb: 5,
    prioritySupport: false,
    apiAccess: false,
    active: true,
    modules: ['catalog']
  },
  {
    id: 'professional',
    name: 'Professional',
    priceMonthly: 99,
    priceAnnually: 990,
    maxUsers: 100,
    maxScans: 500,
    storageGb: 20,
    prioritySupport: true,
    apiAccess: true,
    active: true,
    modules: ['catalog', 'metadata', 'quality', 'team']
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    priceMonthly: 499,
    priceAnnually: 4990,
    maxUsers: 9999,
    maxScans: 9999,
    storageGb: 500,
    prioritySupport: true,
    apiAccess: true,
    active: true,
    modules: ['catalog', 'metadata', 'quality', 'workflows', 'security', 'team', 'maturity']
  }
];

const defaultTenants: Tenant[] = [
  {
    id: '1',
    name: 'Gobierno de la Ciudad',
    domain: 'ciudad.govdata.com',
    plan: 'Enterprise',
    modules: ['catalog', 'metadata', 'quality', 'workflows', 'security', 'team', 'maturity'],
    monthlyCost: '$4,500',
    status: 'active',
    nit: '900.123.001-1',
    email: 'admin@ciudad.gov',
    createdAt: '2025-01-10'
  },
  {
    id: '2',
    name: 'Ministerio de Salud',
    domain: 'minsalud.govdata.com',
    plan: 'Professional',
    modules: ['catalog', 'metadata', 'quality', 'team'],
    monthlyCost: '$1,200',
    status: 'active',
    nit: '800.500.120-4',
    email: 'ti@minsalud.gov.co',
    createdAt: '2025-03-15'
  },
  {
    id: '3',
    name: 'Banco Central',
    domain: 'bcentral.govdata.com',
    plan: 'Enterprise',
    modules: ['catalog', 'quality', 'workflows', 'security', 'team', 'maturity'],
    monthlyCost: '$8,000',
    status: 'active',
    nit: '860.001.555-3',
    email: 'ciso@bcentral.gov.co',
    createdAt: '2024-11-20'
  },
  {
    id: '4',
    name: 'Secretaría de Educación',
    domain: 'educacion.govdata.com',
    plan: 'Starter',
    modules: ['catalog'],
    monthlyCost: '$300',
    status: 'suspended',
    nit: '900.222.333-7',
    email: 'datos@educacion.gov.co',
    createdAt: '2025-05-01'
  }
];

// =================== Context ===================
const PlatformContext = createContext<PlatformContextType | undefined>(undefined);

export function PlatformProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<PlatformMode>('ENTERPRISE');
  const [brandColors, setBrandColors] = useState<BrandColors>({
    primary: '#1e3a8a',
    secondary: '#10b981',
    theme: 'light'
  });

  const [saTheme, setSaThemeState] = useState<SATheme>({
    background: '#050b14',
    card: '#090f1d',
    border: '#16223f',
    primary: '#3b82f6',
    text: '#ffffff',
    fontFamily: 'Inter',
    sidebarText: '#94a3b8',
    btnText: '#ffffff',
  });

  const [cardBg, setCardBgState] = useState<string>('#ffffff');
  const [cardBorderColor, setCardBorderColorState] = useState<string>('rgba(229, 231, 235, 0.5)');
  const [cardBorderRadius, setCardBorderRadiusState] = useState<string>('24px');
  const [cardBorderWidth, setCardBorderWidthState] = useState<string>('1px');

  const [dashboardChartType, setDashboardChartTypeState] = useState<'area' | 'bar' | 'line'>('area');
  const [dashboardChartColors, setDashboardChartColorsState] = useState<string[]>(['#60a5fa', '#3b82f6', '#2563eb']);
  const [pieChartType, setPieChartTypeState] = useState<'pie' | 'donut'>('donut');
  const [dashboardFont, setDashboardFontState] = useState<string>('Inter, sans-serif');
  const [dashboardTextColor, setDashboardTextColorState] = useState<string>('#0f172a');
  const [dashboardTitleColor, setDashboardTitleColorState] = useState<string>('#475569');
  const [dashboardTextScale, setDashboardTextScaleState] = useState<string>('1');
  const [dashboardContent, setDashboardContentState] = useState<DashboardContent>(DEFAULT_DASHBOARD_CONTENT);

  const [modalBg, setModalBgState] = useState<string>('rgba(15, 23, 42, 0.85)');
  const [modalFont, setModalFontState] = useState<string>('inherit');
  const [modalTextColor, setModalTextColorState] = useState<string>('white');
  const [modalBlur, setModalBlurState] = useState<string>('24px');
  const [modalConfig, setModalConfigState] = useState<ModalConfig>(DEFAULT_MODAL_CONFIG);

  const [logoUrl, setLogoUrlState] = useState<string>('/logo.png');
  const [logoWidth, setLogoWidthState] = useState<string>('180px');
  const [transformationVideoUrl, setTransformationVideoUrlState] = useState<string>('');
  const [transformationVideoAspect, setTransformationVideoAspectState] = useState<string>('16:9');

  const [tenants, setTenants] = useState<Tenant[]>(defaultTenants);
  const [currentTenant, setCurrentTenantState] = useState<Tenant>(defaultTenants[0]);
  const [plans, setPlans] = useState<SaaSPlan[]>(defaultPlans);

  // Load persisted state from localStorage
  useEffect(() => {
    const savedCurrentTenantId = localStorage.getItem('govdata_current_tenant_id');
    if (savedCurrentTenantId) {
      const found = defaultTenants.find(t => t.id === savedCurrentTenantId);
      if (found) {
        setCurrentTenantState(found);
      } else {
        setCurrentTenantState({
          id: savedCurrentTenantId,
          name: localStorage.getItem('govdata_user_name') || 'Mi Empresa',
          domain: '',
          plan: 'Enterprise',
          modules: ['catalog', 'quality', 'workflows'],
          monthlyCost: '0',
          status: 'active'
        });
      }
    }
    const savedMode = localStorage.getItem('govdata_mode') as PlatformMode;
    const userRole = localStorage.getItem('govdata_role');
    const userEmail = localStorage.getItem('govdata_user_email');
    if (userEmail && userEmail.toLowerCase().trim() !== 'admin@govdata.io') {
      setMode('ENTERPRISE');
      localStorage.setItem('govdata_mode', 'ENTERPRISE');
    } else if (userRole && userRole !== 'superadmin') {
      setMode('ENTERPRISE');
      localStorage.setItem('govdata_mode', 'ENTERPRISE');
    } else if (savedMode) {
      setMode(savedMode);
    }

    const savedSaTheme = localStorage.getItem('govdata_satheme');
    if (savedSaTheme) {
      try {
        const parsed = JSON.parse(savedSaTheme);
        // Migration: fill missing fields added after initial release
        setSaThemeState({
          sidebarText: '#94a3b8',
          btnText: '#ffffff',
          ...parsed,
        });
      } catch(e) {}
    }
  }, []);

  useEffect(() => {
    if (!currentTenant?.id) return;
    const tid = currentTenant.id;
    
    // Load from DB first, then fallback to local
    const loadSettings = async () => {
      let dbConfigs: Record<string, string> = {};
      try {
        const { data } = await supabase.from('tenant_config').select('config_key, config_value').eq('tenant_id', tid);
        if (data) {
          data.forEach(item => {
            dbConfigs[item.config_key] = typeof item.config_value === 'string' ? item.config_value : JSON.stringify(item.config_value);
          });
        }
      } catch (e) {
        console.warn('Could not load tenant config from DB:', e);
      }

      const getVar = (key: string, defaultValue: any) => {
        if (dbConfigs[key] !== undefined) return dbConfigs[key];
        const val = localStorage.getItem(`${key}_${tid}`);
        return val !== null ? val : defaultValue;
      };

    const savedCardBg = getVar('govdata_card_bg', '#ffffff');
    setCardBgState(savedCardBg);

    const savedCardBorderColor = getVar('govdata_card_border_color', 'rgba(229, 231, 235, 0.5)');
    setCardBorderColorState(savedCardBorderColor);

    const savedCardBorderRadius = getVar('govdata_card_border_radius', '24px');
    setCardBorderRadiusState(savedCardBorderRadius);

    const savedCardBorderWidth = getVar('govdata_card_border_width', '1px');
    setCardBorderWidthState(savedCardBorderWidth);

    const savedChartType = getVar('govdata_dashboard_chart_type', 'area');
    if (savedChartType === 'area' || savedChartType === 'bar' || savedChartType === 'line') {
      setDashboardChartTypeState(savedChartType);
    }

    const savedChartColors = getVar('govdata_dashboard_chart_colors', JSON.stringify(['#60a5fa', '#3b82f6', '#2563eb']));
    try {
      setDashboardChartColorsState(JSON.parse(savedChartColors));
    } catch (e) {}

    const savedPieChartType = getVar('govdata_pie_chart_type', 'donut');
    if (savedPieChartType === 'pie' || savedPieChartType === 'donut') {
      setPieChartTypeState(savedPieChartType);
    }

    const savedFont = getVar('govdata_dashboard_font', 'Inter, sans-serif');
    setDashboardFontState(savedFont);

    const savedTextColor = getVar('govdata_dashboard_text_color', '#0f172a');
    setDashboardTextColorState(savedTextColor);

    const savedTitleColor = getVar('govdata_dashboard_title_color', '#475569');
    setDashboardTitleColorState(savedTitleColor);

    const savedTextScale = getVar('govdata_dashboard_text_scale', '1');
    setDashboardTextScaleState(savedTextScale);

    const savedContent = getVar('govdata_dashboard_content', JSON.stringify(DEFAULT_DASHBOARD_CONTENT));
    try {
      setDashboardContentState({ ...DEFAULT_DASHBOARD_CONTENT, ...JSON.parse(savedContent) });
    } catch (e) {
      setDashboardContentState(DEFAULT_DASHBOARD_CONTENT);
    }

    const savedModalBg = getVar('govdata_modal_bg', 'rgba(15, 23, 42, 0.85)');
    setModalBgState(savedModalBg);

    const savedModalFont = getVar('govdata_modal_font', 'inherit');
    setModalFontState(savedModalFont);

    const savedModalTextColor = getVar('govdata_modal_text_color', 'white');
    setModalTextColorState(savedModalTextColor);

    const savedModalBlur = getVar('govdata_modal_blur', '24px');
    setModalBlurState(savedModalBlur);

    const savedLogoUrl = getVar('govdata_logo_url', '/logo.png');
    setLogoUrlState(savedLogoUrl);

    const savedLogoWidth = getVar('govdata_logo_width', '180px');
    setLogoWidthState(savedLogoWidth);

    const savedVideoUrl = getVar('govdata_transformation_video_url', '');
    setTransformationVideoUrlState(savedVideoUrl);

    const savedVideoAspect = getVar('govdata_transformation_video_aspect', '16:9');
    setTransformationVideoAspectState(savedVideoAspect);

    const savedBrandColors = getVar('brandColors', null);
    if (savedBrandColors) {
      try {
        const parsed = JSON.parse(savedBrandColors);
        if (parsed && parsed.primary) {
          setBrandColors(parsed);
        }
      } catch (e) {}
    } else if (currentTenant?.brandColors) {
      setBrandColors(currentTenant.brandColors);
    } else {
      setBrandColors({
        primary: '#1e3a8a',
        secondary: '#10b981',
        theme: 'light'
      });
    }

    const loadModalConfig = async () => {
      console.log('[PlatformContext] loadModalConfig called for tenant:', tid);
      let dbConfig: ModalConfig | null = null;
      let localConfig: ModalConfig | null = null;

      // 1. Try DB
      try {
        const { data: mData, error } = await supabase
          .from('tenant_modal_config')
          .select('config_value')
          .eq('tenant_id', tid)
          .eq('config_key', 'global')
          .single();
        if (!error && mData && mData.config_value) {
          dbConfig = { ...DEFAULT_MODAL_CONFIG, ...mData.config_value };
        } else if (error) {
          console.warn('[PlatformContext] Database load warning:', error.message);
        }
      } catch (e) {
        console.warn('[PlatformContext] Database exception loading modal config:', e);
      }

      // 2. Try LocalStorage
      try {
        const savedLConfig = localStorage.getItem(`govdata_modal_config_${tid}`);
        if (savedLConfig) {
          localConfig = { ...DEFAULT_MODAL_CONFIG, ...JSON.parse(savedLConfig) };
        }
      } catch (e) {
        console.warn('[PlatformContext] LocalStorage exception loading modal config:', e);
      }

      // 3. Resolve Conflict
      if (dbConfig && localConfig) {
        const dbTime = dbConfig.updatedAt ? new Date(dbConfig.updatedAt).getTime() : 0;
        const localTime = localConfig.updatedAt ? new Date(localConfig.updatedAt).getTime() : 0;
        if (localTime > dbTime) {
          console.log('[PlatformContext] Using newer LocalStorage configuration (local:', localConfig.updatedAt, 'db:', dbConfig.updatedAt, ')');
          setModalConfigState(localConfig);
        } else {
          console.log('[PlatformContext] Using authorative/newer DB configuration (db:', dbConfig.updatedAt, 'local:', localConfig.updatedAt, ')');
          setModalConfigState(dbConfig);
        }
      } else if (dbConfig) {
        console.log('[PlatformContext] Using DB configuration (only one available)');
        setModalConfigState(dbConfig);
      } else if (localConfig) {
        console.log('[PlatformContext] Using LocalStorage configuration (only one available)');
        setModalConfigState(localConfig);
      } else {
        console.log('[PlatformContext] No config found anywhere, using default config.');
        setModalConfigState(DEFAULT_MODAL_CONFIG);
      }
    };
    loadModalConfig();

    };
    
    loadSettings();
  }, [currentTenant?.id]);

  useEffect(() => {
    const fetchTenants = async () => {
      try {
        const { data: tenantsData, error } = await supabase
          .from('tenants')
          .select(`*, tenant_modules(module_name, is_active)`);
          
        if (error) throw error;

        if (tenantsData && tenantsData.length > 0) {
          const parsed: Tenant[] = tenantsData.map(t => ({
            id: t.id,
            name: t.name,
            domain: t.domain,
            plan: (t.subscription_plan === 'starter' ? 'Starter' : t.subscription_plan === 'professional' ? 'Professional' : 'Enterprise') as 'Starter' | 'Professional' | 'Enterprise',
            modules: t.tenant_modules?.filter((m: any) => m.is_active).map((m: any) => m.module_name) || [],
            monthlyCost: '$0', // Handled by plan
            status: t.status as 'active' | 'suspended',
            email: t.billing_email,
            createdAt: new Date(t.created_at).toISOString().split('T')[0],
            dashboardType: (t.dashboard_type || localStorage.getItem('govdata_dashboard_type_' + t.id) || 'executive') as 'executive' | 'technical' | 'collaborative'
          }));
          
          setTenants(parsed);
          let savedCurrentTenantId = localStorage.getItem('govdata_current_tenant_id');
          let userRole = localStorage.getItem('govdata_role');
          const userEmail = localStorage.getItem('govdata_user_email');

          if (userEmail && userEmail.toLowerCase().trim() !== 'admin@govdata.io') {
            try {
              const { data: dbUser } = await supabase
                .from('tenant_users')
                .select('tenant_id, role')
                .ilike('email', userEmail.trim())
                .single();
              if (dbUser) {
                const tid = dbUser.tenant_id || '';
                const roleVal = dbUser.role || 'user';
                savedCurrentTenantId = tid;
                userRole = roleVal;
                localStorage.setItem('govdata_current_tenant_id', tid);
                localStorage.setItem('govdata_role', roleVal);
              }
            } catch (dbErr) {
              console.error('Error verifying user session with database:', dbErr);
            }
          }

          // Superadmin: usar el tenant guardado si existe, o el primero por defecto
          if (userRole === 'superadmin') {
            const active = parsed.find(t => t.id === savedCurrentTenantId) || parsed[0];
            setCurrentTenantState(active);
            localStorage.setItem('govdata_current_tenant_id', active.id);
            return;
          }

          let active = parsed.find(t => t.id === savedCurrentTenantId);

          if (!active && savedCurrentTenantId && savedCurrentTenantId !== 'global') {
            // El tenant del usuario no está en la lista precargada,
            // buscar directamente en Supabase para obtener su nombre y módulos reales
            try {
              const { data: tenantRow } = await supabase
                .from('tenants')
                .select('id, name, domain, subscription_plan, status')
                .eq('id', savedCurrentTenantId)
                .single();
              const { data: moduleRows } = await supabase
                .from('tenant_modules')
                .select('module_name')
                .eq('tenant_id', savedCurrentTenantId)
                .eq('is_active', true);
              if (tenantRow) {
                active = {
                  id: tenantRow.id,
                  name: tenantRow.name,
                  domain: tenantRow.domain || '',
                  plan: (tenantRow.subscription_plan === 'starter' ? 'Starter' : tenantRow.subscription_plan === 'professional' ? 'Professional' : 'Enterprise') as 'Starter' | 'Professional' | 'Enterprise',
                  modules: moduleRows?.map((m: any) => m.module_name) || ['catalog', 'quality', 'workflows'],
                  monthlyCost: '0',
                  status: tenantRow.status as 'active' | 'suspended'
                };
              } else {
                // Fallback genérico con el ID correcto (nunca usar parsed[0])
                active = {
                  id: savedCurrentTenantId,
                  name: localStorage.getItem('govdata_user_name') || 'Mi Empresa',
                  domain: '',
                  plan: 'Enterprise',
                  modules: ['catalog', 'quality', 'workflows'],
                  monthlyCost: '0',
                  status: 'active'
                };
              }
            } catch {
              active = {
                id: savedCurrentTenantId,
                name: localStorage.getItem('govdata_user_name') || 'Mi Empresa',
                domain: '',
                plan: 'Enterprise',
                modules: ['catalog', 'quality', 'workflows'],
                monthlyCost: '0',
                status: 'active'
              };
            }
          } else if (!active) {
            // Sin tenant guardado: usar el primero
            active = parsed[0];
          }

          setCurrentTenantState(active);
        } else {
          // Fallback to initial if DB is empty
          loadLocalTenants();
        }
      } catch (e) {
        console.error('Error fetching tenants from Supabase', e);
        loadLocalTenants();
      }
    };

    const loadLocalTenants = () => {
      let activeTenants = defaultTenants;
      const savedTenants = localStorage.getItem('govdata_tenants');
      if (savedTenants) {
        try {
          const parsed = JSON.parse(savedTenants) as Tenant[];
          activeTenants = parsed.map(t => ({
            ...t,
            dashboardType: (t.dashboardType || localStorage.getItem('govdata_dashboard_type_' + t.id) || 'executive') as 'executive' | 'technical' | 'collaborative'
          }));
        } catch (e) {
          console.error('Error parsing local tenants', e);
        }
      }
      setTenants(activeTenants);
      
      const savedCurrentTenantId = localStorage.getItem('govdata_current_tenant_id');
      const userRole = localStorage.getItem('govdata_role');
      let active = activeTenants.find(t => t.id === savedCurrentTenantId);

      if (!active && savedCurrentTenantId && savedCurrentTenantId !== 'global' && userRole !== 'superadmin') {
        // Crear fallback con el ID real del usuario (nunca caer en Demo Corp)
        active = {
          id: savedCurrentTenantId,
          name: localStorage.getItem('govdata_user_name') || 'Mi Empresa',
          domain: '',
          plan: 'Enterprise',
          modules: ['catalog', 'quality', 'workflows'],
          monthlyCost: '0',
          status: 'active'
        };
      } else if (!active) {
        active = activeTenants[0];
      }

      setCurrentTenantState(active);
    };

    fetchTenants();

    const savedPlans = localStorage.getItem('govdata_plans');
    if (savedPlans) {
      try {
        setPlans(JSON.parse(savedPlans) as SaaSPlan[]);
      } catch (e) {
        console.error('Error parsing local plans', e);
      }
    }
  }, []);
  
  useEffect(() => {
    if (!currentTenant?.id) return;
    const isMain = tenants.length > 0 && (currentTenant.id === '1' || currentTenant.id === tenants[0].id);
    if (!isMain && mode === 'DEMO') {
      setMode('ENTERPRISE');
      localStorage.setItem('govdata_mode', 'ENTERPRISE');
    }
  }, [currentTenant, tenants, mode]);



  useEffect(() => {
    document.documentElement.style.setProperty('--primary-brand', brandColors.primary);
    document.documentElement.style.setProperty('--secondary-brand', brandColors.secondary);
    const hexToRgb = (hex: string) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return `${r}, ${g}, ${b}`;
    };
    if (brandColors.primary.startsWith('#') && brandColors.primary.length === 7) {
      document.documentElement.style.setProperty('--primary-rgb', hexToRgb(brandColors.primary));
    }
    if (brandColors.secondary.startsWith('#') && brandColors.secondary.length === 7) {
      document.documentElement.style.setProperty('--secondary-rgb', hexToRgb(brandColors.secondary));
    }
    if (typeof window !== 'undefined' && window.location.pathname === '/login') {
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.setAttribute('data-theme', brandColors.theme);
    }
  }, [brandColors]);

  useEffect(() => {
    document.documentElement.style.setProperty('--sa-background', saTheme.background);
    document.documentElement.style.setProperty('--sa-card', saTheme.card);
    document.documentElement.style.setProperty('--sa-border', saTheme.border);
    document.documentElement.style.setProperty('--sa-primary', saTheme.primary);
    document.documentElement.style.setProperty('--sa-text', saTheme.text);
    document.documentElement.style.setProperty('--sa-font', saTheme.fontFamily);
    document.documentElement.style.setProperty('--sa-sidebar-text', saTheme.sidebarText ?? '#94a3b8');
    document.documentElement.style.setProperty('--sa-btn-text', saTheme.btnText ?? '#ffffff');
  }, [saTheme]);

  useEffect(() => {
    document.documentElement.style.setProperty('--card-bg', cardBg);
    document.documentElement.style.setProperty('--card-border-color', cardBorderColor);
    document.documentElement.style.setProperty('--card-border-radius', cardBorderRadius);
    document.documentElement.style.setProperty('--card-border-width', cardBorderWidth);
  }, [cardBg, cardBorderColor, cardBorderRadius, cardBorderWidth]);

  useEffect(() => {
    document.documentElement.style.setProperty('--modal-bg', modalBg);
    document.documentElement.style.setProperty('--modal-font', modalFont);
    document.documentElement.style.setProperty('--modal-text-color', modalTextColor);
    document.documentElement.style.setProperty('--modal-blur', modalBlur);
  }, [modalBg, modalFont, modalTextColor, modalBlur]);

  // =================== Handlers ===================

  const handleSetMode = (newMode: PlatformMode) => {
    const userRole = typeof window !== 'undefined' ? localStorage.getItem('govdata_role') : null;
    const userEmail = typeof window !== 'undefined' ? localStorage.getItem('govdata_user_email') : null;
    if (userRole !== 'superadmin' || (userEmail && userEmail.toLowerCase().trim() !== 'admin@govdata.io')) return;
    setMode(newMode);
    localStorage.setItem('govdata_mode', newMode);
  };

  const handleSetSaTheme = (theme: SATheme) => {
    setSaThemeState(theme);
    localStorage.setItem('govdata_satheme', JSON.stringify(theme));
  };

  const handleSetBrandColors = (newColors: BrandColors) => {
    setBrandColors(newColors);
    if (currentTenant) {
      const updatedTenant = { ...currentTenant, brandColors: newColors };
      setCurrentTenantState(updatedTenant);
      
      // Save to DB
      supabase.from('tenant_config').upsert({
        tenant_id: currentTenant.id,
        config_key: 'brandColors',
        config_value: newColors,
        updated_at: new Date().toISOString()
      }, { onConflict: 'tenant_id, config_key' }).then(({ error }) => {
        if (error) console.error('Error saving brandColors to DB:', error);
      });

      // Update tenant in the list
      const updatedTenants = tenants.map(t => 
        t.id === currentTenant.id ? updatedTenant : t
      );
      setTenants(updatedTenants);
      localStorage.setItem('govdata_tenants', JSON.stringify(updatedTenants));
    }
  };

  const setCurrentTenant = (tenant: Tenant) => {
    const userRole = typeof window !== 'undefined' ? localStorage.getItem('govdata_role') : null;
    const userEmail = typeof window !== 'undefined' ? localStorage.getItem('govdata_user_email') : null;
    if (userRole !== 'superadmin' || (userEmail && userEmail.toLowerCase().trim() !== 'admin@govdata.io')) return;
    setCurrentTenantState(tenant);
    localStorage.setItem('govdata_current_tenant_id', tenant.id);

    // Si no es la empresa principal, forzar ENTERPRISE
    const isMain = tenants.length > 0 && (tenant.id === '1' || tenant.id === tenants[0].id);
    if (!isMain) {
      setMode('ENTERPRISE');
      localStorage.setItem('govdata_mode', 'ENTERPRISE');
    }
  };

  const persistTenants = (updated: Tenant[]) => {
    setTenants(updated);
    localStorage.setItem('govdata_tenants', JSON.stringify(updated));
  };

  const updateTenantModules = async (tenantId: string, modules: string[]) => {
    try {
      await supabase.from('tenant_modules').delete().eq('tenant_id', tenantId);
      const inserts = modules.map(m => ({ tenant_id: tenantId, module_name: m, is_active: true }));
      if (inserts.length > 0) {
        await supabase.from('tenant_modules').insert(inserts);
      }
      
      const updated = tenants.map(t => {
        if (t.id === tenantId) {
          const u = { ...t, modules };
          if (currentTenant.id === tenantId) setCurrentTenantState(u);
          return u;
        }
        return t;
      });
      persistTenants(updated);
    } catch (e) {
      console.error('Failed to update tenant modules', e);
    }
  };

  const addTenant = async (data: Partial<Tenant> & { name: string; domain: string; plan: 'Starter' | 'Professional' | 'Enterprise' }) => {
    const planDef = plans.find(p => p.name === data.plan);
    const initialModules = planDef?.modules || [];
    const dbPlan = data.plan.toLowerCase();

    try {
      const { data: tData, error } = await supabase.from('tenants').insert({
        name: data.name,
        domain: data.domain,
        subscription_plan: dbPlan,
        billing_email: data.email || null,
        status: 'active'
      }).select().single();

      if (error) throw error;

      const tenantId = tData.id;
      const moduleInserts = initialModules.map(m => ({
        tenant_id: tenantId,
        module_name: m,
        is_active: true
      }));

      if (moduleInserts.length > 0) {
        await supabase.from('tenant_modules').insert(moduleInserts);
      }

      const costMap = { Starter: '$29', Professional: '$99', Enterprise: '$499' };
      const newTenant: Tenant = {
        id: tenantId,
        name: data.name,
        domain: data.domain,
        plan: data.plan,
        modules: initialModules,
        monthlyCost: costMap[data.plan] || '$0',
        status: 'active',
        email: data.email,
        nit: data.nit,
        phone: data.phone,
        address: data.address,
        city: data.city,
        createdAt: new Date().toISOString().split('T')[0]
      };
      
      persistTenants([...tenants, newTenant]);
    } catch (e) {
      console.error('Failed to add tenant', e);
      throw e;
    }
  };

  const updateTenant = async (tenantId: string, data: Partial<Tenant>) => {
    try {
      const updates: any = {};
      if (data.name) updates.name = data.name;
      if (data.domain) updates.domain = data.domain;
      if (data.plan) updates.subscription_plan = data.plan.toLowerCase();
      if (data.email) updates.billing_email = data.email;
      if (data.status) updates.status = data.status;
      if (data.dashboardType) {
        updates.dashboard_type = data.dashboardType;
        localStorage.setItem('govdata_dashboard_type_' + tenantId, data.dashboardType);
      }

      if (Object.keys(updates).length > 0) {
        try {
          const { error } = await supabase.from('tenants').update(updates).eq('id', tenantId);
          if (error) throw error;
        } catch (err) {
          console.warn('Supabase update tenant failed (possibly missing dashboard_type column), using local storage fallback:', err);
        }
      }

      const updatedList = tenants.map(t => {
        if (t.id !== tenantId) return t;
        let updatedT = { ...t, ...data };
        if (data.plan && data.plan !== t.plan) {
          const planDef = plans.find(p => p.name === data.plan);
          if (planDef) {
            updatedT.modules = planDef.modules;
            updatedT.monthlyCost = `$${planDef.priceMonthly}`;
          }
        }
        if (currentTenant.id === tenantId) setCurrentTenantState(updatedT);
        return updatedT;
      });
      persistTenants(updatedList);
    } catch (e) {
      console.error('Failed to update tenant', e);
      throw e;
    }
  };

  const deleteTenant = async (tenantId: string) => {
    try {
      const { error } = await supabase.from('tenants').delete().eq('id', tenantId);
      if (error) throw error;

      const updated = tenants.filter(t => t.id !== tenantId);
      persistTenants(updated);
      if (currentTenant.id === tenantId && updated.length > 0) {
        setCurrentTenantState(updated[0]);
        localStorage.setItem('govdata_current_tenant_id', updated[0].id);
      }
    } catch (e) {
      console.error('Failed to delete tenant', e);
      throw e;
    }
  };

  const toggleTenantStatus = async (tenantId: string) => {
    try {
      const target = tenants.find(t => t.id === tenantId);
      if (!target) return;
      
      const newStatus = target.status === 'active' ? 'suspended' : 'active';
      const { error } = await supabase.from('tenants').update({ status: newStatus }).eq('id', tenantId);
      if (error) throw error;

      const updated = tenants.map(t => {
        if (t.id !== tenantId) return t;
        const u = { ...t, status: newStatus as 'active' | 'suspended' };
        if (currentTenant.id === tenantId) setCurrentTenantState(u);
        return u;
      });
      persistTenants(updated);
    } catch (e) {
      console.error('Failed to toggle tenant status', e);
      throw e;
    }
  };

  const updatePlan = (planId: string, data: Partial<SaaSPlan>) => {
    const updated = plans.map(p => p.id === planId ? { ...p, ...data } : p);
    setPlans(updated);
    localStorage.setItem('govdata_plans', JSON.stringify(updated));
  };

  const saveTenantSetting = (key: string, value: string) => {
    if (currentTenant?.id) {
      localStorage.setItem(`${key}_${currentTenant.id}`, value);
      
      // Save directly to DB config table
      let parsedValue = value;
      try { parsedValue = JSON.parse(value); } catch(e) {}
      
      supabase.from('tenant_config').upsert({
        tenant_id: currentTenant.id,
        config_key: key,
        config_value: parsedValue,
        updated_at: new Date().toISOString()
      }, { onConflict: 'tenant_id, config_key' }).then(({ error }) => {
        if (error) console.error(`Error saving ${key} to DB:`, error);
      });
    }
  };

  const handleSetCardBg = (bg: string) => {
    setCardBgState(bg);
    saveTenantSetting('govdata_card_bg', bg);
  };

  const handleSetCardBorderColor = (color: string) => {
    setCardBorderColorState(color);
    saveTenantSetting('govdata_card_border_color', color);
  };

  const handleSetCardBorderRadius = (radius: string) => {
    setCardBorderRadiusState(radius);
    saveTenantSetting('govdata_card_border_radius', radius);
  };

  const handleSetCardBorderWidth = (width: string) => {
    setCardBorderWidthState(width);
    saveTenantSetting('govdata_card_border_width', width);
  };

  const handleSetDashboardChartType = (type: 'area' | 'bar' | 'line') => {
    setDashboardChartTypeState(type);
    saveTenantSetting('govdata_dashboard_chart_type', type);
  };

  const handleSetDashboardChartColors = (colors: string[]) => {
    setDashboardChartColorsState(colors);
    saveTenantSetting('govdata_dashboard_chart_colors', JSON.stringify(colors));
  };

  const handleSetPieChartType = (type: 'pie' | 'donut') => {
    setPieChartTypeState(type);
    saveTenantSetting('govdata_pie_chart_type', type);
  };

  const handleSetDashboardFont = (font: string) => {
    setDashboardFontState(font);
    saveTenantSetting('govdata_dashboard_font', font);
  };

  const handleSetDashboardTextColor = (color: string) => {
    setDashboardTextColorState(color);
    saveTenantSetting('govdata_dashboard_text_color', color);
  };

  const handleSetDashboardTitleColor = (color: string) => {
    setDashboardTitleColorState(color);
    saveTenantSetting('govdata_dashboard_title_color', color);
  };

  const handleSetDashboardTextScale = (scale: string) => {
    setDashboardTextScaleState(scale);
    saveTenantSetting('govdata_dashboard_text_scale', scale);
  };

  const handleSetDashboardContent = (content: DashboardContent) => {
    setDashboardContentState(content);
    saveTenantSetting('govdata_dashboard_content', JSON.stringify(content));
  };

  const handleSetModalBg = (bg: string) => {
    setModalBgState(bg);
    saveTenantSetting('govdata_modal_bg', bg);
  };

  const handleSetModalFont = (font: string) => {
    setModalFontState(font);
    saveTenantSetting('govdata_modal_font', font);
  };

  const handleSetModalTextColor = (color: string) => {
    setModalTextColorState(color);
    saveTenantSetting('govdata_modal_text_color', color);
  };

  const handleSetModalBlur = (blur: string) => {
    setModalBlurState(blur);
    saveTenantSetting('govdata_modal_blur', blur);
  };

  const handleSetLogoUrl = (url: string) => {
    setLogoUrlState(url);
    saveTenantSetting('govdata_logo_url', url);
  };

  const handleSetLogoWidth = (width: string) => {
    setLogoWidthState(width);
    saveTenantSetting('govdata_logo_width', width);
  };

  const handleSetTransformationVideoUrl = (url: string) => {
    setTransformationVideoUrlState(url);
    saveTenantSetting('govdata_transformation_video_url', url);
  };

  const handleSetTransformationVideoAspect = (aspect: string) => {
    setTransformationVideoAspectState(aspect);
    saveTenantSetting('govdata_transformation_video_aspect', aspect);
  };

  return (
    <PlatformContext.Provider value={{
      saTheme,
      setSaTheme: handleSetSaTheme,
      mode,
      setMode: handleSetMode,
      brandColors,
      setBrandColors: handleSetBrandColors,
      cardBg,
      setCardBg: handleSetCardBg,
      cardBorderColor,
      setCardBorderColor: handleSetCardBorderColor,
      cardBorderRadius,
      setCardBorderRadius: handleSetCardBorderRadius,
      cardBorderWidth,
      setCardBorderWidth: handleSetCardBorderWidth,
      dashboardChartType,
      setDashboardChartType: handleSetDashboardChartType,
      dashboardChartColors,
      setDashboardChartColors: handleSetDashboardChartColors,
      pieChartType,
      setPieChartType: handleSetPieChartType,
      dashboardFont,
      setDashboardFont: handleSetDashboardFont,
      dashboardTextColor,
      setDashboardTextColor: handleSetDashboardTextColor,
      dashboardTitleColor,
      setDashboardTitleColor: handleSetDashboardTitleColor,
      dashboardTextScale,
      setDashboardTextScale: handleSetDashboardTextScale,
      dashboardContent,
      setDashboardContent: handleSetDashboardContent,
      modalBg,
      setModalBg: handleSetModalBg,
      modalFont,
      setModalFont: handleSetModalFont,
      modalTextColor,
      setModalTextColor: handleSetModalTextColor,
      modalBlur,
      setModalBlur: handleSetModalBlur,
      modalConfig,
      setModalConfig: setModalConfigState,
      saveModalConfig: async (config: ModalConfig) => {
        if (!currentTenant) {
          console.warn('[PlatformContext] saveModalConfig failed: no currentTenant');
          return;
        }
        const configWithTime: ModalConfig = { ...config, updatedAt: new Date().toISOString() };
        console.log('[PlatformContext] saveModalConfig saving for tenant:', currentTenant.id, configWithTime);
        setModalConfigState(configWithTime);
        localStorage.setItem(`govdata_modal_config_${currentTenant.id}`, JSON.stringify(configWithTime));
        try {
          const { error } = await supabase.from('tenant_modal_config').upsert({
            tenant_id: currentTenant.id,
            config_key: 'global',
            config_value: configWithTime,
            updated_at: configWithTime.updatedAt
          }, { onConflict: 'tenant_id, config_key' });
          if (error) {
            console.error('[PlatformContext] Error upserting modal config to DB:', error.message);
          } else {
            console.log('[PlatformContext] Modal config successfully saved to Supabase DB');
          }
        } catch (e) {
          console.error('[PlatformContext] Exception saving modal config to DB:', e);
        }
      },
      logoUrl,
      setLogoUrl: handleSetLogoUrl,
      logoWidth,
      setLogoWidth: handleSetLogoWidth,
      transformationVideoUrl,
      setTransformationVideoUrl: handleSetTransformationVideoUrl,
      transformationVideoAspect,
      setTransformationVideoAspect: handleSetTransformationVideoAspect,
      tenants,
      currentTenant,
      setCurrentTenant,
      updateTenantModules,
      addTenant,
      updateTenant,
      deleteTenant,
      toggleTenantStatus,
      plans,
      updatePlan
    }}>
      {children}
    </PlatformContext.Provider>
  );
}

export function usePlatform() {
  const context = useContext(PlatformContext);
  if (!context) {
    throw new Error('usePlatform debe usarse dentro de un PlatformProvider');
  }
  return context;
}
