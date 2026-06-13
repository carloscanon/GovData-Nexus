'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Save, 
  Mail, 
  Cpu, 
  Palette, 
  ShieldAlert, 
  UserPlus, 
  Trash2, 
  CheckCircle2, 
  Sliders, 
  Eye, 
  Laptop, 
  X,
  Info,
  Award,
  AlertTriangle,
  FileText,
  Download,
  Upload,
  Copy,
  RefreshCw,
  Sparkles,
  Settings,
  Check,
  Globe,
  Lock,
  Type,
  Layout,
  Layers,
  Image as ImageIcon,
  CheckCircle
} from 'lucide-react';
import { usePlatform, DEFAULT_MODAL_CONFIG, MODAL_TEMPLATES, ModalConfig } from '@/contexts/PlatformContext';
import UnifiedModal from '@/components/UnifiedModal';

// ─────────────────────────────────────────────
// Design Tokens & Presets Architecture
// ─────────────────────────────────────────────
interface GlobalThemeConfig {
  id: string;
  name: string;
  description: string;
  emoji: string;
  isDark: boolean;
  colors: {
    background: string;
    bgSecondary: string;
    card: string;
    modal: string;
    input: string;
    table: string;
    border: string;
    hover: string;
    selection: string;
    focus: string;
    primary: string;
    secondary: string;
    success: string;
    warning: string;
    danger: string;
    info: string;
    text: string;
  };
  typography: {
    fontFamily: string;
    baseSize: string;
    weightHeading: string;
    weightSubtitle: string;
    weightBody: string;
    lineHeight: string;
    letterSpacing: string;
  };
  components: {
    btnRadius: string;
    btnHeight: string;
    btnShadow: string;
    inputBorder: string;
    inputFocus: string;
    cardRadius: string;
    cardShadow: string;
    cardOpacity: string;
    modalRadius: string;
    modalBlur: string;
    tableZebra: boolean;
    sidebarBg: string;
    sidebarText: string;
  };
}

const THEME_PRESETS: GlobalThemeConfig[] = [
  {
    id: 'cosmos',
    name: 'Cosmos',
    description: 'Corporativo Oscuro · Vercel & Datadog vibe',
    emoji: '🌌',
    isDark: true,
    colors: {
      background: '#090d16',
      bgSecondary: '#05080e',
      card: '#0f172a',
      modal: '#1e293b',
      input: '#1e293b',
      table: '#0f172a',
      border: '#1e293b',
      hover: '#1e293b',
      selection: '#2563eb',
      focus: '#3b82f6',
      primary: '#38bdf8',
      secondary: '#64748b',
      success: '#10b981',
      warning: '#f59e0b',
      danger: '#ef4444',
      info: '#06b6d4',
      text: '#ffffff'
    },
    typography: {
      fontFamily: 'Inter',
      baseSize: '14px',
      weightHeading: '800',
      weightSubtitle: '600',
      weightBody: '400',
      lineHeight: '1.5',
      letterSpacing: '-0.02em'
    },
    components: {
      btnRadius: '10px',
      btnHeight: '40px',
      btnShadow: '0 4px 12px rgba(56, 189, 248, 0.15)',
      inputBorder: '#334155',
      inputFocus: '#38bdf8',
      cardRadius: '16px',
      cardShadow: '0 10px 25px -5px rgba(0,0,0,0.5)',
      cardOpacity: '1.0',
      modalRadius: '24px',
      modalBlur: '8px',
      tableZebra: true,
      sidebarBg: '#0f172a',
      sidebarText: '#94a3b8'
    }
  },
  {
    id: 'arctic',
    name: 'Arctic',
    description: 'Corporativo Claro · Stripe & HubSpot clean look',
    emoji: '❄️',
    isDark: false,
    colors: {
      background: '#f8fafc',
      bgSecondary: '#f1f5f9',
      card: '#ffffff',
      modal: '#ffffff',
      input: '#ffffff',
      table: '#ffffff',
      border: '#e2e8f0',
      hover: '#f8fafc',
      selection: '#e0f2fe',
      focus: '#0284c7',
      primary: '#0284c7',
      secondary: '#475569',
      success: '#16a34a',
      warning: '#ca8a04',
      danger: '#dc2626',
      info: '#0891b2',
      text: '#1e1b4b'
    },
    typography: {
      fontFamily: 'Poppins',
      baseSize: '14px',
      weightHeading: '700',
      weightSubtitle: '600',
      weightBody: '400',
      lineHeight: '1.6',
      letterSpacing: '0.01em'
    },
    components: {
      btnRadius: '8px',
      btnHeight: '38px',
      btnShadow: '0 1px 3px rgba(0,0,0,0.05)',
      inputBorder: '#cbd5e1',
      inputFocus: '#0284c7',
      cardRadius: '12px',
      cardShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)',
      cardOpacity: '1.0',
      modalRadius: '16px',
      modalBlur: '4px',
      tableZebra: false,
      sidebarBg: '#ffffff',
      sidebarText: '#475569'
    }
  },
  {
    id: 'ember',
    name: 'Ember',
    description: 'Dark Premium · Naranja lava & carbón',
    emoji: '🔥',
    isDark: true,
    colors: {
      background: '#090705',
      bgSecondary: '#050302',
      card: '#160f0a',
      modal: '#241810',
      input: '#1a100a',
      table: '#160f0a',
      border: '#3d2516',
      hover: '#29180e',
      selection: '#ea580c',
      focus: '#ea580c',
      primary: '#f97316',
      secondary: '#857266',
      success: '#10b981',
      warning: '#f59e0b',
      danger: '#ef4444',
      info: '#06b6d4',
      text: '#fef3e2'
    },
    typography: {
      fontFamily: 'Montserrat',
      baseSize: '14px',
      weightHeading: '800',
      weightSubtitle: '600',
      weightBody: '400',
      lineHeight: '1.5',
      letterSpacing: '-0.01em'
    },
    components: {
      btnRadius: '12px',
      btnHeight: '42px',
      btnShadow: '0 4px 14px rgba(249, 115, 22, 0.2)',
      inputBorder: '#3d2516',
      inputFocus: '#f97316',
      cardRadius: '20px',
      cardShadow: '0 15px 30px rgba(0,0,0,0.6)',
      cardOpacity: '1.0',
      modalRadius: '24px',
      modalBlur: '12px',
      tableZebra: true,
      sidebarBg: '#160f0a',
      sidebarText: '#a39285'
    }
  },
  {
    id: 'emerald',
    name: 'Emerald',
    description: 'Gobierno Verde · Estructurado y formal',
    emoji: '🟢',
    isDark: false,
    colors: {
      background: '#f0fdf4',
      bgSecondary: '#e8f5e9',
      card: '#ffffff',
      modal: '#ffffff',
      input: '#ffffff',
      table: '#ffffff',
      border: '#c8e6c9',
      hover: '#f1f8e9',
      selection: '#c8e6c9',
      focus: '#2e7d32',
      primary: '#2e7d32',
      secondary: '#455a64',
      success: '#2e7d32',
      warning: '#f9a825',
      danger: '#d32f2f',
      info: '#00838f',
      text: '#064e3b'
    },
    typography: {
      fontFamily: 'Inter',
      baseSize: '14px',
      weightHeading: '800',
      weightSubtitle: '600',
      weightBody: '400',
      lineHeight: '1.5',
      letterSpacing: '-0.02em'
    },
    components: {
      btnRadius: '6px',
      btnHeight: '38px',
      btnShadow: 'none',
      inputBorder: '#a5d6a7',
      inputFocus: '#2e7d32',
      cardRadius: '8px',
      cardShadow: '0 2px 4px rgba(0,0,0,0.05)',
      cardOpacity: '1.0',
      modalRadius: '12px',
      modalBlur: '2px',
      tableZebra: true,
      sidebarBg: '#ffffff',
      sidebarText: '#37474f'
    }
  },
  {
    id: 'nordic',
    name: 'Nordic',
    description: 'Gris Minimalista · Elegante, limpio y aséptico',
    emoji: '🏔️',
    isDark: false,
    colors: {
      background: '#f1f5f9',
      bgSecondary: '#e2e8f0',
      card: '#ffffff',
      modal: '#ffffff',
      input: '#ffffff',
      table: '#ffffff',
      border: '#cbd5e1',
      hover: '#f1f5f9',
      selection: '#cbd5e1',
      focus: '#475569',
      primary: '#0f172a',
      secondary: '#475569',
      success: '#10b981',
      warning: '#f59e0b',
      danger: '#ef4444',
      info: '#3b82f6',
      text: '#0f172a'
    },
    typography: {
      fontFamily: 'IBM Plex Sans',
      baseSize: '14px',
      weightHeading: '600',
      weightSubtitle: '500',
      weightBody: '400',
      lineHeight: '1.5',
      letterSpacing: '0px'
    },
    components: {
      btnRadius: '4px',
      btnHeight: '36px',
      btnShadow: 'none',
      inputBorder: '#cbd5e1',
      inputFocus: '#475569',
      cardRadius: '6px',
      cardShadow: '0 1px 2px rgba(0,0,0,0.05)',
      cardOpacity: '1.0',
      modalRadius: '8px',
      modalBlur: '0px',
      tableZebra: true,
      sidebarBg: '#ffffff',
      sidebarText: '#334155'
    }
  },
  {
    id: 'royal',
    name: 'Royal',
    description: 'Púrpura Monarca · Lujo corporativo',
    emoji: '👑',
    isDark: true,
    colors: {
      background: '#0a0514',
      bgSecondary: '#05020a',
      card: '#120a22',
      modal: '#1d0f37',
      input: '#120a22',
      table: '#120a22',
      border: '#2a164e',
      hover: '#20113c',
      selection: '#8b5cf6',
      focus: '#a78bfa',
      primary: '#c084fc',
      secondary: '#7c6a96',
      success: '#10b981',
      warning: '#f59e0b',
      danger: '#ef4444',
      info: '#06b6d4',
      text: '#faf5ff'
    },
    typography: {
      fontFamily: 'Montserrat',
      baseSize: '14px',
      weightHeading: '800',
      weightSubtitle: '700',
      weightBody: '400',
      lineHeight: '1.5',
      letterSpacing: '0.01em'
    },
    components: {
      btnRadius: '16px',
      btnHeight: '44px',
      btnShadow: '0 8px 20px rgba(168, 85, 247, 0.2)',
      inputBorder: '#2a164e',
      inputFocus: '#a855f7',
      cardRadius: '24px',
      cardShadow: '0 20px 40px rgba(0,0,0,0.6)',
      cardOpacity: '1.0',
      modalRadius: '32px',
      modalBlur: '16px',
      tableZebra: false,
      sidebarBg: '#120a22',
      sidebarText: '#9a8bb2'
    }
  },
  {
    id: 'sunset',
    name: 'Sunset',
    description: 'Atardecer Cálido · Inspiración Linear & Raycast',
    emoji: '🌅',
    isDark: false,
    colors: {
      background: '#fffbf7',
      bgSecondary: '#fff3e0',
      card: '#ffffff',
      modal: '#ffffff',
      input: '#ffffff',
      table: '#ffffff',
      border: '#ffe0b2',
      hover: '#fff8f0',
      selection: '#ffe0b2',
      focus: '#e65100',
      primary: '#ff6d00',
      secondary: '#795548',
      success: '#2e7d32',
      warning: '#f57c00',
      danger: '#d32f2f',
      info: '#00838f',
      text: '#431407'
    },
    typography: {
      fontFamily: 'Poppins',
      baseSize: '14px',
      weightHeading: '700',
      weightSubtitle: '500',
      weightBody: '400',
      lineHeight: '1.6',
      letterSpacing: '0.02em'
    },
    components: {
      btnRadius: '10px',
      btnHeight: '40px',
      btnShadow: '0 4px 10px rgba(255, 109, 0, 0.15)',
      inputBorder: '#ffcc80',
      inputFocus: '#ff6d00',
      cardRadius: '16px',
      cardShadow: '0 6px 15px rgba(0,0,0,0.04)',
      cardOpacity: '1.0',
      modalRadius: '20px',
      modalBlur: '6px',
      tableZebra: true,
      sidebarBg: '#ffffff',
      sidebarText: '#5d4037'
    }
  },
  {
    id: 'forest',
    name: 'Forest',
    description: 'Bosque Tecnológico · Elegancia verde oscuro',
    emoji: '🌲',
    isDark: true,
    colors: {
      background: '#040b06',
      bgSecondary: '#020603',
      card: '#08170c',
      modal: '#0e2615',
      input: '#08170c',
      table: '#08170c',
      border: '#153d1f',
      hover: '#113018',
      selection: '#10b981',
      focus: '#34d399',
      primary: '#34d399',
      secondary: '#6c8371',
      success: '#10b981',
      warning: '#f59e0b',
      danger: '#ef4444',
      info: '#06b6d4',
      text: '#ecfdf5'
    },
    typography: {
      fontFamily: 'Source Sans Pro',
      baseSize: '14px',
      weightHeading: '700',
      weightSubtitle: '600',
      weightBody: '400',
      lineHeight: '1.5',
      letterSpacing: '-0.01em'
    },
    components: {
      btnRadius: '8px',
      btnHeight: '38px',
      btnShadow: '0 4px 12px rgba(16, 185, 129, 0.15)',
      inputBorder: '#153d1f',
      inputFocus: '#34d399',
      cardRadius: '14px',
      cardShadow: '0 10px 20px rgba(0,0,0,0.5)',
      cardOpacity: '1.0',
      modalRadius: '18px',
      modalBlur: '6px',
      tableZebra: true,
      sidebarBg: '#08170c',
      sidebarText: '#7b9580'
    }
  }
];

// Helper to convert hex to RGB
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let c = hex.replace('#', '');
  if (c.length === 3) {
    c = c[0] + c[0] + c[1] + c[1] + c[2] + c[2];
  }
  const num = parseInt(c, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255
  };
}

// Calculate WCAG Contrast Ratio
function getContrastRatio(fHex: string, bHex: string): number {
  try {
    const f = hexToRgb(fHex);
    const b = hexToRgb(bHex);
    
    const getL = (color: { r: number; g: number; b: number }) => {
      const a = [color.r, color.g, color.b].map((v) => {
        v /= 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
      });
      return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
    };

    const l1 = getL(f);
    const l2 = getL(b);
    return parseFloat(((Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)).toFixed(2));
  } catch {
    return 4.5;
  }
}

// Inject font links dynamically
function injectFontLink(font: string) {
  if (['Inter', 'system-ui', 'monospace'].includes(font)) return;
  const id = `gfont-${font.toLowerCase().replace(/\s+/g, '-')}`;
  if (document.getElementById(id)) return;
  const link = document.createElement('link');
  link.id = id;
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(font)}:wght@400;500;600;700;800&display=swap`;
  document.head.appendChild(link);
}

export default function GlobalDesignCenterPage() {
  const { saTheme, setSaTheme } = usePlatform();
  const [activeSubTab, setActiveSubTab] = useState<'presets' | 'colors' | 'typography' | 'components' | 'branding' | 'tokens'>('presets');
  
  // Real-time Visual Builder State (Starts with Cosmos)
  const [themeForm, setThemeForm] = useState<GlobalThemeConfig>({ ...THEME_PRESETS[0] });
  const [toast, setToast] = useState<string | null>(null);
  
  // Custom theme database / library
  const [themeLibrary, setThemeLibrary] = useState<GlobalThemeConfig[]>([...THEME_PRESETS]);
  const [newThemeName, setNewThemeName] = useState('');

  // Live preview interactive state
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [previewWidgetMode, setPreviewWidgetMode] = useState<'light' | 'dark'>('dark');
  const [isModalMockupOpen, setIsModalMockupOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto Contrast System (calculate contrast of primary against background, and card background against normal text)
  const contrastRatioPrimary = getContrastRatio(themeForm.colors.primary, themeForm.colors.background);
  const contrastRatioText = getContrastRatio(themeForm.colors.text === '#ffffff' ? '#ffffff' : '#000000', themeForm.colors.card);
  const isWcagPassPrimary = contrastRatioPrimary >= 4.5;
  const isWcagPassText = contrastRatioText >= 4.5;

  // Sync fonts when typography changes
  useEffect(() => {
    injectFontLink(themeForm.typography.fontFamily);
  }, [themeForm.typography.fontFamily]);

  const applyPreset = (preset: GlobalThemeConfig) => {
    setThemeForm({ ...preset });
    setToast(`Tema "${preset.name}" cargado en tiempo real.`);
    setTimeout(() => setToast(null), 3000);
  };

  const handleSaveToPlatform = () => {
    // Save theme to our global context variables
    setSaTheme({
      background: themeForm.colors.background,
      card: themeForm.colors.card,
      border: themeForm.colors.border,
      primary: themeForm.colors.primary,
      text: themeForm.isDark ? '#ffffff' : '#0f172a',
      fontFamily: themeForm.typography.fontFamily,
      sidebarText: themeForm.components.sidebarText,
      btnText: themeForm.isDark ? '#000000' : '#ffffff',
    });
    setToast('✅ Configuración guardada e inyectada en la consola.');
    setTimeout(() => setToast(null), 3000);
  };

  // Contrast Auto-Correction System
  const handleAutoCorrectContrast = () => {
    let textCorrection = themeForm.isDark ? '#ffffff' : '#0f172a';
    let newPrimary = themeForm.colors.primary;
    
    // If primary contrast ratio is low, make it brighter or darker
    if (contrastRatioPrimary < 4.5) {
      if (themeForm.isDark) {
        newPrimary = '#38bdf8'; // Sky blue neon passes dark background easily
      } else {
        newPrimary = '#1e3a8a'; // Deep Navy Blue passes light background easily
      }
    }

    setThemeForm({
      ...themeForm,
      colors: {
        ...themeForm.colors,
        text: textCorrection,
        primary: newPrimary
      }
    });

    setToast('⚡ Contraste optimizado automáticamente para WCAG AA.');
    setTimeout(() => setToast(null), 3000);
  };

  // Theme management actions
  const handleCreateTheme = () => {
    if (!newThemeName) return;
    const newTheme: GlobalThemeConfig = {
      ...themeForm,
      id: `custom_${Date.now()}`,
      name: newThemeName,
      description: 'Tema personalizado del Superadministrador'
    };
    setThemeLibrary([...themeLibrary, newTheme]);
    setNewThemeName('');
    setToast(`Tema "${newTheme.name}" guardado en tu biblioteca.`);
    setTimeout(() => setToast(null), 3000);
  };

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(themeForm, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `design_tokens_${themeForm.id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setToast('JSON Design Tokens exportado con éxito.');
    setTimeout(() => setToast(null), 3000);
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.colors && parsed.typography && parsed.components) {
          setThemeForm({
            ...themeForm,
            ...parsed,
            id: `imported_${Date.now()}`
          });
          setToast('Tokens importados y aplicados correctamente.');
        } else {
          alert('El archivo no posee el formato de Design Tokens válido.');
        }
      } catch (err) {
        alert('Error al parsear el JSON.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', background: '#070a13', color: '#cbd5e1', padding: '24px', borderRadius: '16px', fontFamily: 'Inter, sans-serif' }}>
      
      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 9999, padding: '1rem 1.5rem', borderRadius: '12px', fontWeight: 600, fontSize: '0.85rem', background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff', boxShadow: '0 8px 24px rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={16} />
          {toast}
        </div>
      )}

      {/* Main Page Title */}
      <div className="sa-title-area" style={{ borderBottom: '1px solid #1e293b', paddingBottom: '16px', margin: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="sa-title" style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.8rem', fontWeight: 900 }}>
            <Palette size={26} color="#38bdf8" /> Centro de Diseño Global & Tokens
          </h1>
          <p className="sa-subtitle" style={{ color: '#94a3b8' }}>
            Diseño arquitectónico, marca blanca, optimización de contraste y gestión de tokens de diseño para Nexus Master.
          </p>
        </div>
        
        <button onClick={handleSaveToPlatform} className="sa-btn sa-btn-primary" style={{ display: 'flex', gap: '8px', alignItems: 'center', background: 'linear-gradient(135deg, #3b82f6 0%, #10b981 100%)', border: 'none', padding: '10px 20px', fontWeight: 700 }}>
          <Save size={18} />
          <span>Publicar Cambios</span>
        </button>
      </div>

      {/* Outer Layout Grid: Controls vs Figma-style Preview Mockup */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.3fr', gap: '24px', alignItems: 'start' }}>
        
        {/* Left Side: Builder Knobs and Settings */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Sub Navigation controls */}
          <div style={{ display: 'flex', gap: '4px', background: '#0f172a', padding: '4px', borderRadius: '12px', border: '1px solid #1e293b', flexWrap: 'wrap' }}>
            {[
              { id: 'presets', label: 'Temas UX', icon: <Award size={14} /> },
              { id: 'colors', label: 'Colores & Contrastes', icon: <Palette size={14} /> },
              { id: 'typography', label: 'Tipografía', icon: <Type size={14} /> },
              { id: 'components', label: 'Componentes', icon: <Sliders size={14} /> },
              { id: 'branding', label: 'Branding', icon: <Globe size={14} /> },
              { id: 'tokens', label: 'Tokens & JSON', icon: <Layers size={14} /> },
            ].map((sub) => (
              <button
                key={sub.id}
                onClick={() => setActiveSubTab(sub.id as any)}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  background: activeSubTab === sub.id ? '#1e293b' : 'transparent',
                  color: activeSubTab === sub.id ? '#ffffff' : '#94a3b8',
                  border: 'none',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                {sub.icon}
                {sub.label}
              </button>
            ))}
          </div>

          {/* Sub Tab Panel: 1. Presets */}
          {activeSubTab === 'presets' && (
            <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#fff' }}>Plantillas UX Estandarizadas</h3>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Biblioteca Premium</span>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {themeLibrary.map((preset) => {
                  const isActive = themeForm.id === preset.id;
                  return (
                    <div
                      key={preset.id}
                      onClick={() => applyPreset(preset)}
                      style={{
                        padding: '14px',
                        borderRadius: '12px',
                        background: isActive ? 'rgba(59, 130, 246, 0.08)' : '#070a13',
                        border: `2px solid ${isActive ? 'var(--sa-primary, #38bdf8)' : '#1e293b'}`,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '1.2rem' }}>{preset.emoji}</span>
                          <strong style={{ fontSize: '0.85rem', color: '#fff' }}>{preset.name}</strong>
                        </div>
                        <span style={{
                          fontSize: '0.65rem',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          background: preset.isDark ? '#1e1b4b' : '#f0fdf4',
                          color: preset.isDark ? '#a78bfa' : '#10b981',
                          fontWeight: 700
                        }}>
                          {preset.isDark ? 'DARK' : 'LIGHT'}
                        </span>
                      </div>
                      
                      <p style={{ margin: 0, fontSize: '0.72rem', color: '#64748b', lineHeight: 1.3 }}>{preset.description}</p>
                      
                      {/* Mini palettes dot review */}
                      <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: preset.colors.primary }} />
                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: preset.colors.background }} />
                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: preset.colors.card }} />
                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: preset.colors.border }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Sub Tab Panel: 2. Colors & Contrast */}
          {activeSubTab === 'colors' && (
            <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* WCAG Contrast System Widget */}
              <div style={{ background: '#070a13', border: '1px solid #1e293b', padding: '16px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Analizador de Accesibilidad WCAG 2.1</span>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>WCAG AA Estándar</span>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div style={{ padding: '10px', borderRadius: '8px', background: isWcagPassPrimary ? 'rgba(16, 185, 129, 0.05)' : 'rgba(239, 68, 68, 0.05)', border: `1px solid ${isWcagPassPrimary ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}` }}>
                    <div style={{ fontSize: '0.65rem', color: '#64748b' }}>Contraste Primario / Fondo</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: isWcagPassPrimary ? '#10b981' : '#ef4444', margin: '4px 0' }}>{contrastRatioPrimary}:1</div>
                    <span style={{ fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px', background: isWcagPassPrimary ? '#064e3b' : '#7f1d1d', color: '#fff', fontWeight: 700 }}>
                      {isWcagPassPrimary ? 'PASÓ AA' : 'FALLA WCAG'}
                    </span>
                  </div>

                  <div style={{ padding: '10px', borderRadius: '8px', background: isWcagPassText ? 'rgba(16, 185, 129, 0.05)' : 'rgba(239, 68, 68, 0.05)', border: `1px solid ${isWcagPassText ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}` }}>
                    <div style={{ fontSize: '0.65rem', color: '#64748b' }}>Contraste Texto / Panel</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: isWcagPassText ? '#10b981' : '#ef4444', margin: '4px 0' }}>{contrastRatioText}:1</div>
                    <span style={{ fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px', background: isWcagPassText ? '#064e3b' : '#7f1d1d', color: '#fff', fontWeight: 700 }}>
                      {isWcagPassText ? 'PASÓ AA' : 'FALLA WCAG'}
                    </span>
                  </div>
                </div>

                {(!isWcagPassPrimary || !isWcagPassText) && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.2)', padding: '10px', borderRadius: '8px' }}>
                    <p style={{ margin: 0, fontSize: '0.72rem', color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <AlertTriangle size={14} /> El contraste actual no cumple con el nivel de accesibilidad mínimo.
                    </p>
                    <button 
                      onClick={handleAutoCorrectContrast}
                      className="sa-btn" 
                      style={{ padding: '6px 12px', fontSize: '0.7rem', alignSelf: 'flex-start', background: '#d97706', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 600 }}
                    >
                      Corregir automáticamente
                    </button>
                  </div>
                )}
              </div>

              {/* Surface Settings */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <strong style={{ fontSize: '0.8rem', color: '#fff' }}>1. Fondos y Superficies</strong>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="sa-form-group">
                    <label className="sa-label">Fondo Principal</label>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <input type="color" value={themeForm.colors.background} onChange={e => setThemeForm({ ...themeForm, colors: { ...themeForm.colors, background: e.target.value } })} style={{ width: 34, height: 34, border: 'none', cursor: 'pointer', borderRadius: '6px' }} />
                      <input type="text" className="sa-input" value={themeForm.colors.background} onChange={e => setThemeForm({ ...themeForm, colors: { ...themeForm.colors, background: e.target.value } })} />
                    </div>
                  </div>

                  <div className="sa-form-group">
                    <label className="sa-label">Fondo Cards</label>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <input type="color" value={themeForm.colors.card} onChange={e => setThemeForm({ ...themeForm, colors: { ...themeForm.colors, card: e.target.value } })} style={{ width: 34, height: 34, border: 'none', cursor: 'pointer', borderRadius: '6px' }} />
                      <input type="text" className="sa-input" value={themeForm.colors.card} onChange={e => setThemeForm({ ...themeForm, colors: { ...themeForm.colors, card: e.target.value } })} />
                    </div>
                  </div>

                  <div className="sa-form-group">
                    <label className="sa-label">Fondo Modales</label>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <input type="color" value={themeForm.colors.modal} onChange={e => setThemeForm({ ...themeForm, colors: { ...themeForm.colors, modal: e.target.value } })} style={{ width: 34, height: 34, border: 'none', cursor: 'pointer', borderRadius: '6px' }} />
                      <input type="text" className="sa-input" value={themeForm.colors.modal} onChange={e => setThemeForm({ ...themeForm, colors: { ...themeForm.colors, modal: e.target.value } })} />
                    </div>
                  </div>

                  <div className="sa-form-group">
                    <label className="sa-label">Color de Bordes</label>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <input type="color" value={themeForm.colors.border} onChange={e => setThemeForm({ ...themeForm, colors: { ...themeForm.colors, border: e.target.value } })} style={{ width: 34, height: 34, border: 'none', cursor: 'pointer', borderRadius: '6px' }} />
                      <input type="text" className="sa-input" value={themeForm.colors.border} onChange={e => setThemeForm({ ...themeForm, colors: { ...themeForm.colors, border: e.target.value } })} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Core brand options */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <strong style={{ fontSize: '0.8rem', color: '#fff' }}>2. Acentos y Semántica</strong>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="sa-form-group">
                    <label className="sa-label">Color Primario</label>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <input type="color" value={themeForm.colors.primary} onChange={e => setThemeForm({ ...themeForm, colors: { ...themeForm.colors, primary: e.target.value } })} style={{ width: 34, height: 34, border: 'none', cursor: 'pointer', borderRadius: '6px' }} />
                      <input type="text" className="sa-input" value={themeForm.colors.primary} onChange={e => setThemeForm({ ...themeForm, colors: { ...themeForm.colors, primary: e.target.value } })} />
                    </div>
                  </div>

                  <div className="sa-form-group">
                    <label className="sa-label">Color Secundario</label>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <input type="color" value={themeForm.colors.secondary} onChange={e => setThemeForm({ ...themeForm, colors: { ...themeForm.colors, secondary: e.target.value } })} style={{ width: 34, height: 34, border: 'none', cursor: 'pointer', borderRadius: '6px' }} />
                      <input type="text" className="sa-input" value={themeForm.colors.secondary} onChange={e => setThemeForm({ ...themeForm, colors: { ...themeForm.colors, secondary: e.target.value } })} />
                    </div>
                  </div>

                  <div className="sa-form-group">
                    <label className="sa-label">Color Éxito</label>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <input type="color" value={themeForm.colors.success} onChange={e => setThemeForm({ ...themeForm, colors: { ...themeForm.colors, success: e.target.value } })} style={{ width: 34, height: 34, border: 'none', cursor: 'pointer', borderRadius: '6px' }} />
                      <input type="text" className="sa-input" value={themeForm.colors.success} onChange={e => setThemeForm({ ...themeForm, colors: { ...themeForm.colors, success: e.target.value } })} />
                    </div>
                  </div>

                  <div className="sa-form-group">
                    <label className="sa-label">Color Error</label>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <input type="color" value={themeForm.colors.danger} onChange={e => setThemeForm({ ...themeForm, colors: { ...themeForm.colors, danger: e.target.value } })} style={{ width: 34, height: 34, border: 'none', cursor: 'pointer', borderRadius: '6px' }} />
                      <input type="text" className="sa-input" value={themeForm.colors.danger} onChange={e => setThemeForm({ ...themeForm, colors: { ...themeForm.colors, danger: e.target.value } })} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Sub Tab Panel: 3. Typography */}
          {activeSubTab === 'typography' && (
            <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#fff' }}>Tipografía de la Plataforma</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
                <div className="sa-form-group">
                  <label className="sa-label">Familia de Fuente Recomendada</label>
                  <select 
                    className="sa-select" 
                    value={themeForm.typography.fontFamily} 
                    onChange={e => setThemeForm({ ...themeForm, typography: { ...themeForm.typography, fontFamily: e.target.value } })}
                  >
                    <option value="Inter">Inter (Gobernanza corporativa)</option>
                    <option value="Poppins">Poppins (Elegante y redondeada)</option>
                    <option value="Montserrat">Montserrat (Geométrica de alto impacto)</option>
                    <option value="Nunito">Nunito (Moderna y suave)</option>
                    <option value="IBM Plex Sans">IBM Plex Sans (Técnica y legible)</option>
                    <option value="Source Sans Pro">Source Sans Pro (Formal y limpia)</option>
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="sa-form-group">
                    <label className="sa-label">Tamaño Base</label>
                    <input type="text" className="sa-input" value={themeForm.typography.baseSize} onChange={e => setThemeForm({ ...themeForm, typography: { ...themeForm.typography, baseSize: e.target.value } })} />
                  </div>
                  <div className="sa-form-group">
                    <label className="sa-label">Altura de Línea</label>
                    <input type="text" className="sa-input" value={themeForm.typography.lineHeight} onChange={e => setThemeForm({ ...themeForm, typography: { ...themeForm.typography, lineHeight: e.target.value } })} />
                  </div>
                  <div className="sa-form-group">
                    <label className="sa-label">Peso Títulos</label>
                    <select className="sa-select" value={themeForm.typography.weightHeading} onChange={e => setThemeForm({ ...themeForm, typography: { ...themeForm.typography, weightHeading: e.target.value } })}>
                      <option value="600">SemiBold (600)</option>
                      <option value="700">Bold (700)</option>
                      <option value="800">ExtraBold (800)</option>
                      <option value="900">Black (900)</option>
                    </select>
                  </div>
                  <div className="sa-form-group">
                    <label className="sa-label">Espaciado de Letras</label>
                    <input type="text" className="sa-input" value={themeForm.typography.letterSpacing} onChange={e => setThemeForm({ ...themeForm, typography: { ...themeForm.typography, letterSpacing: e.target.value } })} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Sub Tab Panel: 4. Component Details */}
          {activeSubTab === 'components' && (
            <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '65vh', overflowY: 'auto' }}>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#fff' }}>Personalización Fina de Componentes</h3>
              
              {/* Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <strong style={{ fontSize: '0.8rem', color: '#fff', borderBottom: '1px solid #1e293b', paddingBottom: '4px' }}>Botones Directos</strong>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="sa-form-group">
                    <label className="sa-label">Radio de Bordes</label>
                    <input type="text" className="sa-input" value={themeForm.components.btnRadius} onChange={e => setThemeForm({ ...themeForm, components: { ...themeForm.components, btnRadius: e.target.value } })} />
                  </div>
                  <div className="sa-form-group">
                    <label className="sa-label">Altura</label>
                    <input type="text" className="sa-input" value={themeForm.components.btnHeight} onChange={e => setThemeForm({ ...themeForm, components: { ...themeForm.components, btnHeight: e.target.value } })} />
                  </div>
                </div>
              </div>

              {/* Cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <strong style={{ fontSize: '0.8rem', color: '#fff', borderBottom: '1px solid #1e293b', paddingBottom: '4px' }}>Contenedores y Tarjetas (Cards)</strong>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="sa-form-group">
                    <label className="sa-label">Redondeado Card</label>
                    <input type="text" className="sa-input" value={themeForm.components.cardRadius} onChange={e => setThemeForm({ ...themeForm, components: { ...themeForm.components, cardRadius: e.target.value } })} />
                  </div>
                  <div className="sa-form-group">
                    <label className="sa-label">Opacidad de Tarjeta</label>
                    <input type="text" className="sa-input" value={themeForm.components.cardOpacity} onChange={e => setThemeForm({ ...themeForm, components: { ...themeForm.components, cardOpacity: e.target.value } })} placeholder="1.0" />
                  </div>
                </div>
              </div>

              {/* Modals & Sidebar */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <strong style={{ fontSize: '0.8rem', color: '#fff', borderBottom: '1px solid #1e293b', paddingBottom: '4px' }}>Modales & Sidebar</strong>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="sa-form-group">
                    <label className="sa-label">Radio Modal</label>
                    <input type="text" className="sa-input" value={themeForm.components.modalRadius} onChange={e => setThemeForm({ ...themeForm, components: { ...themeForm.components, modalRadius: e.target.value } })} />
                  </div>
                  <div className="sa-form-group">
                    <label className="sa-label">Fondo Sidebar</label>
                    <input type="color" value={themeForm.components.sidebarBg} onChange={e => setThemeForm({ ...themeForm, components: { ...themeForm.components, sidebarBg: e.target.value } })} style={{ width: '100%', height: '36px', border: 'none', borderRadius: '6px', cursor: 'pointer' }} />
                  </div>
                  <div className="sa-form-group" style={{ gridColumn: 'span 2' }}>
                    <label className="sa-label">Color Texto Sidebar</label>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <input type="color" value={themeForm.components.sidebarText} onChange={e => setThemeForm({ ...themeForm, components: { ...themeForm.components, sidebarText: e.target.value } })} style={{ width: 34, height: 34, border: 'none', cursor: 'pointer', borderRadius: '6px' }} />
                      <input type="text" className="sa-input" value={themeForm.components.sidebarText} onChange={e => setThemeForm({ ...themeForm, components: { ...themeForm.components, sidebarText: e.target.value } })} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Sub Tab Panel: 5. Branding */}
          {activeSubTab === 'branding' && (
            <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#fff' }}>Branding Corporativo (White Label)</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="sa-form-group">
                  <label className="sa-label">Nombre de la Plataforma</label>
                  <input type="text" className="sa-input" defaultValue="Nexus Master" placeholder="Nexus Master" />
                </div>
                
                <div className="sa-form-group">
                  <label className="sa-label">Logotipo Corporativo</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: 44, height: 44, borderRadius: '8px', background: 'var(--sa-primary, #38bdf8)', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', color: '#fff', fontSize: '1.2rem', fontWeight: 800 }}>N</div>
                    <button className="sa-btn sa-btn-secondary" style={{ fontSize: '0.8rem' }}>Subir Nuevo Logotipo</button>
                  </div>
                </div>

                <div className="sa-form-group">
                  <label className="sa-label">Imagen de Fondo en Login</label>
                  <input type="text" className="sa-input" defaultValue="/images/auth-bg.jpg" placeholder="Url de la imagen" />
                </div>
              </div>
            </div>
          )}

          {/* Sub Tab Panel: 6. Tokens & JSON */}
          {activeSubTab === 'tokens' && (
            <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#fff' }}>Gestión de Design Tokens</h3>
              
              <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b', lineHeight: 1.4 }}>
                Nexus Master implementa arquitectura basada en Design Tokens exportables en formato JSON compatibles con Figma Tokens o Style Dictionary.
              </p>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={handleExportJSON} className="sa-btn sa-btn-secondary" style={{ flex: 1, display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>
                  <Download size={14} />
                  <span>Exportar JSON</span>
                </button>
                
                <button onClick={() => fileInputRef.current?.click()} className="sa-btn sa-btn-secondary" style={{ flex: 1, display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>
                  <Upload size={14} />
                  <span>Importar JSON</span>
                </button>
                <input ref={fileInputRef} type="file" accept=".json" onChange={handleImportJSON} style={{ display: 'none' }} />
              </div>

              {/* Create/Save custom theme inside local list */}
              <div style={{ borderTop: '1px solid #1e293b', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <strong style={{ fontSize: '0.8rem', color: '#fff' }}>Guardar Tema Actual en Biblioteca</strong>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input 
                    type="text" 
                    placeholder="Nombre del tema..." 
                    value={newThemeName}
                    onChange={e => setNewThemeName(e.target.value)}
                    className="sa-input" 
                    style={{ flex: 1 }}
                  />
                  <button onClick={handleCreateTheme} className="sa-btn sa-btn-primary" style={{ padding: '8px 16px', fontSize: '0.8rem' }}>
                    Guardar
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Right Side: Figma-style Live Interactive Preview Workspace */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'sticky', top: '10px' }}>
          
          <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* Live mockup Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#10b981' }} />
                <strong style={{ fontSize: '0.85rem', color: '#fff' }}>Workspace de Previsualización en Vivo</strong>
              </div>
              
              {/* Preview parameters */}
              <div style={{ display: 'flex', gap: '4px' }}>
                {(['desktop', 'tablet', 'mobile'] as const).map((dev) => (
                  <button
                    key={dev}
                    onClick={() => setPreviewDevice(dev)}
                    style={{
                      padding: '4px 8px',
                      fontSize: '0.7rem',
                      background: previewDevice === dev ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
                      color: previewDevice === dev ? '#38bdf8' : '#64748b',
                      border: '1px solid ' + (previewDevice === dev ? '#38bdf8' : 'transparent'),
                      borderRadius: '6px',
                      cursor: 'pointer',
                      textTransform: 'capitalize'
                    }}
                  >
                    {dev}
                  </button>
                ))}
              </div>
            </div>

            {/* Simulated Live Workspace Environment */}
            <div 
              style={{
                background: themeForm.colors.background,
                borderRadius: '12px',
                border: '1px solid ' + themeForm.colors.border,
                minHeight: '480px',
                maxHeight: '560px',
                overflow: 'hidden',
                display: 'flex',
                fontFamily: themeForm.typography.fontFamily + ', sans-serif',
                fontSize: themeForm.typography.baseSize,
                color: themeForm.isDark ? '#f8fafc' : '#0f172a',
                transition: 'all 0.3s ease'
              }}
            >
              
              {/* 1. Sidebar Simulated */}
              {previewDevice !== 'mobile' && (
                <div 
                  style={{
                    width: previewDevice === 'tablet' ? '70px' : '170px',
                    background: themeForm.components.sidebarBg,
                    borderRight: '1px solid ' + themeForm.colors.border,
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '12px',
                    gap: '12px',
                    flexShrink: 0
                  }}
                >
                  {/* Sidebar Brand logo mock */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: 28, height: 28, borderRadius: '6px', background: themeForm.colors.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.8rem', fontWeight: 850 }}>N</div>
                    {previewDevice === 'desktop' && <span style={{ fontWeight: 800, fontSize: '0.75rem', color: '#fff' }}>Nexus Master</span>}
                  </div>

                  {/* Sidebar Nav link mocks */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '16px' }}>
                    {[
                      { label: 'Tablero', active: true },
                      { label: 'Empresas', active: false },
                      { label: 'Auditoría', active: false },
                      { label: 'Ajustes', active: false },
                    ].map((link, i) => (
                      <div
                        key={i}
                        style={{
                          padding: '6px 10px',
                          borderRadius: '8px',
                          background: link.active ? themeForm.colors.primary + '15' : 'transparent',
                          color: link.active ? themeForm.colors.primary : themeForm.components.sidebarText,
                          fontSize: '0.75rem',
                          fontWeight: link.active ? 700 : 500,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          cursor: 'pointer'
                        }}
                      >
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: link.active ? themeForm.colors.primary : 'transparent' }} />
                        {previewDevice === 'desktop' && link.label}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 2. Main simulated body */}
              <div style={{ flex: 1, padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto', background: themeForm.colors.background }}>
                
                {/* Dashboard mock Title Area */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ margin: 0, fontWeight: Number(themeForm.typography.weightHeading) || 800, fontSize: '1rem', color: themeForm.isDark ? '#fff' : '#0f172a' }}>Consola Superadmin</h4>
                    <span style={{ fontSize: '0.65rem', color: '#64748b' }}>Infraestructura de Clientes Activa</span>
                  </div>
                  
                  {/* Action button mock */}
                  <button 
                    onClick={() => setIsModalMockupOpen(true)}
                    style={{
                      height: themeForm.components.btnHeight,
                      borderRadius: themeForm.components.btnRadius,
                      background: themeForm.colors.primary,
                      color: themeForm.isDark ? '#000000' : '#ffffff',
                      boxShadow: themeForm.components.btnShadow,
                      border: 'none',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      padding: '0 12px',
                      cursor: 'pointer'
                    }}
                  >
                    Abrir Modal Mock
                  </button>
                </div>

                {/* Dashboard KPI cards mockup */}
                <div style={{ display: 'grid', gridTemplateColumns: previewDevice === 'mobile' ? '1fr' : '1fr 1fr', gap: '10px' }}>
                  
                  {/* Card 1 */}
                  <div
                    style={{
                      background: themeForm.colors.card,
                      borderRadius: themeForm.components.cardRadius,
                      border: '1px solid ' + themeForm.colors.border,
                      padding: '12px',
                      opacity: Number(themeForm.components.cardOpacity) || 1.0,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px'
                    }}
                  >
                    <span style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 600 }}>Total MRR</span>
                    <strong style={{ fontSize: '1.2rem', color: themeForm.isDark ? '#fff' : '#0f172a' }}>$15,300 USD</strong>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.6rem', color: themeForm.colors.success }}>
                      <span>▲ +12.4% este mes</span>
                    </div>
                  </div>

                  {/* Card 2 */}
                  <div
                    style={{
                      background: themeForm.colors.card,
                      borderRadius: themeForm.components.cardRadius,
                      border: '1px solid ' + themeForm.colors.border,
                      padding: '12px',
                      opacity: Number(themeForm.components.cardOpacity) || 1.0,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px'
                    }}
                  >
                    <span style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 600 }}>Clientes SaaS</span>
                    <strong style={{ fontSize: '1.2rem', color: themeForm.isDark ? '#fff' : '#0f172a' }}>32 Activos</strong>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.6rem', color: themeForm.colors.info }}>
                      <span>● Conexiones estables</span>
                    </div>
                  </div>
                </div>

                {/* Table Mockup */}
                <div style={{ background: themeForm.colors.card, borderRadius: themeForm.components.cardRadius, border: '1px solid ' + themeForm.colors.border, overflow: 'hidden' }}>
                  <div style={{ padding: '8px 12px', borderBottom: '1px solid ' + themeForm.colors.border, fontSize: '0.7rem', fontWeight: 700, color: themeForm.isDark ? '#fff' : '#0f172a' }}>
                    Últimas Empresas Registradas
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.68rem', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ background: themeForm.colors.bgSecondary, borderBottom: '1px solid ' + themeForm.colors.border }}>
                        <th style={{ padding: '6px 10px', color: '#64748b' }}>Empresa</th>
                        <th style={{ padding: '6px 10px', color: '#64748b' }}>Plan</th>
                        <th style={{ padding: '6px 10px', color: '#64748b', textAlign: 'right' }}>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { name: 'Bancolombia SAS', plan: 'Enterprise', status: 'Activa', color: themeForm.colors.success },
                        { name: 'Consultores Gob', plan: 'Professional', status: 'Suspendida', color: themeForm.colors.danger },
                      ].map((row, idx) => (
                        <tr 
                          key={idx} 
                          style={{ 
                            background: themeForm.components.tableZebra && idx % 2 === 1 ? themeForm.colors.bgSecondary : 'transparent',
                            borderBottom: '1px solid ' + themeForm.colors.border
                          }}
                        >
                          <td style={{ padding: '6px 10px', fontWeight: 600 }}>{row.name}</td>
                          <td style={{ padding: '6px 10px' }}>{row.plan}</td>
                          <td style={{ padding: '6px 10px', textAlign: 'right', fontWeight: 700, color: row.color }}>{row.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Simulated Form controls */}
                <div style={{ background: themeForm.colors.card, border: '1px solid ' + themeForm.colors.border, borderRadius: themeForm.components.cardRadius, padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: themeForm.isDark ? '#fff' : '#0f172a' }}>Registro Rápido</div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.6rem', color: '#64748b', marginBottom: '2px' }}>Dominio</label>
                      <input 
                        type="text" 
                        readOnly 
                        value="empresa.govdata.com" 
                        style={{
                          width: '100%',
                          padding: '6px',
                          fontSize: '0.65rem',
                          background: themeForm.colors.background,
                          border: `1px solid ${themeForm.components.inputBorder}`,
                          borderRadius: themeForm.components.btnRadius,
                          color: themeForm.isDark ? '#fff' : '#0f172a',
                          outline: 'none'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.6rem', color: '#64748b', marginBottom: '2px' }}>Plan</label>
                      <select 
                        disabled
                        style={{
                          width: '100%',
                          padding: '6px',
                          fontSize: '0.65rem',
                          background: themeForm.colors.background,
                          border: `1px solid ${themeForm.components.inputBorder}`,
                          borderRadius: themeForm.components.btnRadius,
                          color: themeForm.isDark ? '#fff' : '#0f172a',
                          outline: 'none'
                        }}
                      >
                        <option>Enterprise ($499)</option>
                      </select>
                    </div>
                  </div>
                </div>

              </div>

            </div>

          </div>
        </div>

      </div>

      {/* Simulated Live Modal overlay popup mockup */}
      <UnifiedModal
        isOpen={isModalMockupOpen}
        onClose={() => setIsModalMockupOpen(false)}
        title="Simulación de Ventana Estandarizada"
        subtitle="Esta ventana refleja de forma exacta el radio de bordes, fondo y colores que has configurado en el constructor visual."
        type="formulario"
        confirmLabel="Entendido y Cerrar"
        configOverride={{
          bg: themeForm.colors.modal,
          borderRadius: themeForm.components.modalRadius,
          borderColor: themeForm.colors.border,
          btnPrimaryBg: themeForm.colors.primary,
          contentFontFamily: themeForm.typography.fontFamily,
          contentTextColor: themeForm.isDark ? '#f8fafc' : '#0f172a',
          overlayBlur: themeForm.components.modalBlur
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', color: '#1e293b' }}>
          <p style={{ margin: 0, fontSize: '0.85rem' }}>
            Los componentes se adaptan dinámicamente según tus Design Tokens.
          </p>
          <div style={{ padding: '12px', background: '#f1f5f9', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.78rem' }}>
            <strong>Tokens del Modal:</strong>
            <ul style={{ margin: '4px 0 0 0', paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
              <li>Radio de Bordes: <strong>{themeForm.components.modalRadius}</strong></li>
              <li>Tipografía: <strong>{themeForm.typography.fontFamily}</strong></li>
              <li>Efecto Desenfoque: <strong>{themeForm.components.modalBlur}</strong></li>
            </ul>
          </div>
        </div>
      </UnifiedModal>

    </div>
  );
}
