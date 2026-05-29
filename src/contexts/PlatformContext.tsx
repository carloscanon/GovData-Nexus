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

export interface SATheme {
  background: string;
  card: string;
  border: string;
  primary: string;
  text: string;
  fontFamily: string;
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
  const [mode, setMode] = useState<PlatformMode>('DEMO');
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
    fontFamily: 'Inter'
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

  const [tenants, setTenants] = useState<Tenant[]>(defaultTenants);
  const [currentTenant, setCurrentTenantState] = useState<Tenant>(defaultTenants[0]);
  const [plans, setPlans] = useState<SaaSPlan[]>(defaultPlans);

  // Load persisted state from localStorage
  useEffect(() => {
    const savedMode = localStorage.getItem('govdata_mode') as PlatformMode;
    if (savedMode) setMode(savedMode);

    const savedSaTheme = localStorage.getItem('govdata_satheme');
    if (savedSaTheme) {
      try {
        setSaThemeState(JSON.parse(savedSaTheme));
      } catch(e) {}
    }
  }, []);

  useEffect(() => {
    if (!currentTenant?.id) return;
    const tid = currentTenant.id;
    const getVar = (key: string) => localStorage.getItem(`${key}_${tid}`) || localStorage.getItem(key);

    const savedCardBg = getVar('govdata_card_bg');
    if (savedCardBg) setCardBgState(savedCardBg);

    const savedCardBorderColor = getVar('govdata_card_border_color');
    if (savedCardBorderColor) setCardBorderColorState(savedCardBorderColor);

    const savedCardBorderRadius = getVar('govdata_card_border_radius');
    if (savedCardBorderRadius) setCardBorderRadiusState(savedCardBorderRadius);

    const savedCardBorderWidth = getVar('govdata_card_border_width');
    if (savedCardBorderWidth) setCardBorderWidthState(savedCardBorderWidth);

    const savedChartType = getVar('govdata_dashboard_chart_type');
    if (savedChartType === 'area' || savedChartType === 'bar' || savedChartType === 'line') {
      setDashboardChartTypeState(savedChartType);
    }

    const savedChartColors = getVar('govdata_dashboard_chart_colors');
    if (savedChartColors) {
      try {
        setDashboardChartColorsState(JSON.parse(savedChartColors));
      } catch (e) {}
    }

    const savedPieChartType = getVar('govdata_pie_chart_type');
    if (savedPieChartType === 'pie' || savedPieChartType === 'donut') {
      setPieChartTypeState(savedPieChartType);
    }

    const savedFont = getVar('govdata_dashboard_font');
    if (savedFont) setDashboardFontState(savedFont);

    const savedTextColor = getVar('govdata_dashboard_text_color');
    if (savedTextColor) setDashboardTextColorState(savedTextColor);

    const savedTitleColor = getVar('govdata_dashboard_title_color');
    if (savedTitleColor) setDashboardTitleColorState(savedTitleColor);

    const savedTextScale = getVar('govdata_dashboard_text_scale');
    if (savedTextScale) setDashboardTextScaleState(savedTextScale);

    const savedContent = getVar('govdata_dashboard_content');
    if (savedContent) {
      try {
        setDashboardContentState({ ...DEFAULT_DASHBOARD_CONTENT, ...JSON.parse(savedContent) });
      } catch (e) {}
    } else {
      setDashboardContentState(DEFAULT_DASHBOARD_CONTENT);
    }
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
          const savedCurrentTenantId = localStorage.getItem('govdata_current_tenant_id');
          const active = parsed.find(t => t.id === savedCurrentTenantId) || parsed[0];
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
      const savedTenants = localStorage.getItem('govdata_tenants');
      if (savedTenants) {
        try {
          const parsed = JSON.parse(savedTenants) as Tenant[];
          const withDashboard = parsed.map(t => ({
            ...t,
            dashboardType: (t.dashboardType || localStorage.getItem('govdata_dashboard_type_' + t.id) || 'executive') as 'executive' | 'technical' | 'collaborative'
          }));
          setTenants(withDashboard);
          const savedCurrentTenantId = localStorage.getItem('govdata_current_tenant_id');
          const active = withDashboard.find(t => t.id === savedCurrentTenantId) || withDashboard[0];
          setCurrentTenantState(active);
        } catch (e) {
          console.error('Error parsing local tenants', e);
        }
      }
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

  // Update brand colors when current tenant changes
  useEffect(() => {
    if (currentTenant) {
      if (currentTenant.brandColors) {
        setBrandColors(currentTenant.brandColors);
      } else {
        setBrandColors({
          primary: '#1e3a8a',
          secondary: '#10b981',
          theme: 'light'
        });
      }
    }
  }, [currentTenant?.id]);

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
    document.documentElement.setAttribute('data-theme', brandColors.theme);
  }, [brandColors]);

  useEffect(() => {
    document.documentElement.style.setProperty('--sa-background', saTheme.background);
    document.documentElement.style.setProperty('--sa-card', saTheme.card);
    document.documentElement.style.setProperty('--sa-border', saTheme.border);
    document.documentElement.style.setProperty('--sa-primary', saTheme.primary);
    document.documentElement.style.setProperty('--sa-text', saTheme.text);
    document.documentElement.style.setProperty('--sa-font', saTheme.fontFamily);
  }, [saTheme]);

  useEffect(() => {
    document.documentElement.style.setProperty('--card-bg', cardBg);
    document.documentElement.style.setProperty('--card-border-color', cardBorderColor);
    document.documentElement.style.setProperty('--card-border-radius', cardBorderRadius);
    document.documentElement.style.setProperty('--card-border-width', cardBorderWidth);
  }, [cardBg, cardBorderColor, cardBorderRadius, cardBorderWidth]);

  // =================== Handlers ===================

  const handleSetMode = (newMode: PlatformMode) => {
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
      
      // Update tenant in the list
      const updatedTenants = tenants.map(t => 
        t.id === currentTenant.id ? updatedTenant : t
      );
      setTenants(updatedTenants);
      localStorage.setItem('govdata_tenants', JSON.stringify(updatedTenants));
    }
  };

  const setCurrentTenant = (tenant: Tenant) => {
    setCurrentTenantState(tenant);
    localStorage.setItem('govdata_current_tenant_id', tenant.id);
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
    localStorage.setItem(key, value); // Fallback guardado a nivel global
    if (currentTenant?.id) {
      localStorage.setItem(`${key}_${currentTenant.id}`, value);
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
