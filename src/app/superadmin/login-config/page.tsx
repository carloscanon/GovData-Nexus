'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Save, RotateCcw, Eye, EyeOff, Type, Image as ImageIcon,
  Palette, AlignLeft, Monitor, Upload, Check,
  ChevronDown, ChevronUp, Layout, Sliders, Layers, Music, Play, Trash2, Sparkles
} from 'lucide-react';

export interface LoginPageConfig {
  // Background mode
  backgroundMode: 'gradient' | 'image';
  // Left panel texts
  headline: string;
  headlineHighlight: string;
  subtitle: string;
  // Feature bullets
  feature1: string;
  feature2: string;
  feature3: string;
  // Gradient background (when mode = 'gradient')
  gradientColorFrom: string;
  gradientColorTo: string;
  gradientAngle: string;
  // Overlay (only used when mode = 'image')
  overlayColorFrom: string;
  overlayColorTo: string;
  overlayOpacity: string;
  // Text colors
  headlineColor: string;
  highlightColor: string;
  subtitleColor: string;
  featureColor: string;
  // Background image (when mode = 'image')
  backgroundImageUrl: string;
  // Right panel
  loginTitle: string;
  loginSubtitle: string;
  // Font sizes (rem)
  headlineSizeRem: string;
  subtitleSizeRem: string;
  featureSizeRem: string;
  loginTitleSizeRem: string;
  // Logo
  logoMode: 'text' | 'image';
  logoText: string;
  logoImageUrl: string;
  logoImageHeightPx: string;
  logoImageWidthPx: string;   // 'auto' or px value
  logoKeepRatio: boolean;     // lock aspect ratio
  showLogo: boolean;
  logoPosition?: 'left-panel' | 'top-right';
  enableLoginSound?: boolean;
  loginSoundUrl?: string;  // custom uploaded audio file as data URL
  themeId?: 'classic' | 'cyberpunk' | 'luxury' | 'minimalist' | 'custom';
  fontFamily?: string;
}

export const DEFAULT_LOGIN_CONFIG: LoginPageConfig = {
  backgroundMode: 'image',
  headline: 'La nueva era del',
  headlineHighlight: 'Gobierno de Datos',
  subtitle: 'Centraliza el control, garantiza la calidad y potencia la toma de decisiones estratégicas en un solo lugar.',
  feature1: 'Seguridad Nivel Enterprise',
  feature2: 'Cumplimiento Global',
  feature3: 'UX/UI de Próxima Generación',
  gradientColorFrom: '#003366',
  gradientColorTo: '#1e40af',
  gradientAngle: '135',
  overlayColorFrom: 'rgba(0,51,102,0.88)',
  overlayColorTo: 'rgba(30,64,175,0.78)',
  overlayOpacity: '1',
  headlineColor: '#ffffff',
  highlightColor: '#3b82f6',
  subtitleColor: '#e2e8f0',
  featureColor: '#ffffff',
  backgroundImageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop',
  loginTitle: 'Bienvenido',
  loginSubtitle: 'Ingresa tus credenciales corporativas',
  headlineSizeRem: '3.5',
  subtitleSizeRem: '1.2',
  featureSizeRem: '1',
  loginTitleSizeRem: '2',
  logoMode: 'text',
  logoText: 'GovData Nexus',
  logoImageUrl: '',
  logoImageHeightPx: '52',
  logoImageWidthPx: 'auto',
  logoKeepRatio: true,
  showLogo: true,
  logoPosition: 'left-panel',
  enableLoginSound: true,
  loginSoundUrl: '',
  themeId: 'classic',
  fontFamily: 'system-ui, -apple-system, sans-serif',
};

export const STORAGE_KEY = 'govdata_login_config';

export function loadLoginConfig(): LoginPageConfig {
  if (typeof window === 'undefined') return DEFAULT_LOGIN_CONFIG;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return { ...DEFAULT_LOGIN_CONFIG, ...JSON.parse(saved) };
  } catch {}
  return DEFAULT_LOGIN_CONFIG;
}

// ── helpers ────────────────────────────────────────────────────────
export function getLeftPanelBackground(cfg: LoginPageConfig): React.CSSProperties {
  if (cfg.backgroundMode === 'gradient') {
    return {
      background: `linear-gradient(${cfg.gradientAngle}deg, ${cfg.gradientColorFrom}, ${cfg.gradientColorTo})`,
    };
  }
  return {
    backgroundImage: `url(${cfg.backgroundImageUrl})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  };
}

export function getOverlayStyle(cfg: LoginPageConfig): React.CSSProperties {
  if (cfg.backgroundMode === 'gradient') return { display: 'none' };
  return {
    position: 'absolute',
    inset: 0,
    background: `linear-gradient(135deg, ${cfg.overlayColorFrom}, ${cfg.overlayColorTo})`,
    opacity: parseFloat(cfg.overlayOpacity),
  };
}

// ── UI primitives ──────────────────────────────────────────────────
function Section({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', overflow: 'hidden' }}>
      <button onClick={() => setOpen(!open)}
        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', background: 'none', border: 'none', cursor: 'pointer', color: '#f8fafc' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <Icon size={17} style={{ color: '#60a5fa' }} />
          <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{title}</span>
        </div>
        {open ? <ChevronUp size={16} style={{ color: '#64748b' }} /> : <ChevronDown size={16} style={{ color: '#64748b' }} />}
      </button>
      {open && <div style={{ padding: '0 1.25rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>{children}</div>}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
      <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: '10px', padding: '0.6rem 0.875rem', color: '#f8fafc',
  fontSize: '0.875rem', width: '100%', outline: 'none', fontFamily: 'inherit',
};

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const displayHex = value.startsWith('rgba') ? '#3b82f6' : value;
  return (
    <Field label={label}>
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <input type="color" value={displayHex} onChange={e => onChange(e.target.value)}
          style={{ width: 36, height: 36, padding: 0, border: 'none', borderRadius: '8px', cursor: 'pointer', background: 'none' }} />
        <input type="text" value={value} onChange={e => onChange(e.target.value)} style={{ ...inputStyle, flex: 1 }} />
      </div>
    </Field>
  );
}

function SizeField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <Field label={label}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <input type="range" min="0.8" max="6" step="0.1" value={value} onChange={e => onChange(e.target.value)}
          style={{ flex: 1, accentColor: '#3b82f6' }} />
        <span style={{ color: '#60a5fa', fontWeight: 700, fontSize: '0.85rem', minWidth: '3rem', textAlign: 'right' }}>{value} rem</span>
      </div>
    </Field>
  );
}

// ── Live preview ───────────────────────────────────────────────────
function LoginPreview({ cfg }: { cfg: LoginPageConfig }) {
  const leftBg = getLeftPanelBackground(cfg);
  const overlay = getOverlayStyle(cfg);
  return (
    <div style={{ display: 'flex', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', height: '520px', boxShadow: '0 24px 48px rgba(0,0,0,0.6)', position: 'relative', fontFamily: cfg.fontFamily || 'inherit' }}>
      {/* Absolute positioned Top Right Logo */}
      {cfg.showLogo && cfg.logoPosition === 'top-right' && (
        <div style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 50, display: 'flex', alignItems: 'center', gap: '8px' }}>
          {cfg.logoMode === 'image' && cfg.logoImageUrl ? (
            <img
              src={cfg.logoImageUrl}
              alt="logo"
              style={{
                height: `${cfg.logoImageHeightPx}px`,
                width: cfg.logoImageWidthPx === 'auto' ? 'auto' : `${cfg.logoImageWidthPx}px`,
                maxWidth: '100%',
                objectFit: 'contain',
                display: 'block',
              }}
            />
          ) : (
            <>
              <div style={{ width: 36, height: 36, background: '#1e3a8a', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.9rem', color: 'white' }}>GN</div>
              <span style={{ color: '#0f172a', fontWeight: 700, fontSize: '1rem' }}>{cfg.logoText}</span>
            </>
          )}
        </div>
      )}

      {/* Left */}
      <div style={{ flex: 1.2, position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '40px', ...leftBg }}>
        <div style={overlay} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          {cfg.showLogo && cfg.logoPosition !== 'top-right' && (
            <div style={{ marginBottom: '32px' }}>
              {cfg.logoMode === 'image' && cfg.logoImageUrl ? (
                <img
                  src={cfg.logoImageUrl}
                  alt="logo"
                  style={{
                    height: `${cfg.logoImageHeightPx}px`,
                    width: cfg.logoImageWidthPx === 'auto' ? 'auto' : `${cfg.logoImageWidthPx}px`,
                    maxWidth: '100%',
                    objectFit: 'contain',
                    display: 'block',
                  }}
                />
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: 36, height: 36, background: 'white', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.9rem', color: '#1e3a8a' }}>GN</div>
                  <span style={{ color: '#fff', fontWeight: 700, fontSize: '1rem' }}>{cfg.logoText}</span>
                </div>
              )}
            </div>
          )}
          <h1 style={{ fontSize: `${cfg.headlineSizeRem}rem`, lineHeight: 1.1, marginBottom: '16px', color: cfg.headlineColor, fontWeight: 800 }}>
            {cfg.headline} <br />
            <span style={{ color: cfg.highlightColor }}>{cfg.headlineHighlight}</span>
          </h1>
          <p style={{ fontSize: `${cfg.subtitleSizeRem}rem`, color: cfg.subtitleColor, lineHeight: 1.6, maxWidth: '340px' }}>{cfg.subtitle}</p>
          <div style={{ marginTop: '32px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[cfg.feature1, cfg.feature2, cfg.feature3].filter(Boolean).map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', color: cfg.featureColor, fontSize: `${cfg.featureSizeRem}rem`, fontWeight: 500 }}>
                <Check size={16} style={{ flexShrink: 0 }} />
                <span>{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Right */}
      <div style={{ flex: 1, background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px' }}>
        <div style={{ width: '100%', maxWidth: '320px' }}>
          <h2 style={{ fontSize: `${cfg.loginTitleSizeRem}rem`, fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>{cfg.loginTitle}</h2>
          <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '24px' }}>{cfg.loginSubtitle}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px 14px', color: '#94a3b8', fontSize: '0.85rem' }}>Correo Corporativo</div>
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px 14px', color: '#94a3b8', fontSize: '0.85rem' }}>Contraseña</div>
            <div style={{ background: '#1e3a8a', borderRadius: '10px', padding: '13px', color: 'white', textAlign: 'center', fontWeight: 700, fontSize: '0.9rem' }}>Iniciar Sesión →</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Mode toggle card ───────────────────────────────────────────────
function ModeCard({ active, onClick, icon: Icon, title, description }: {
  active: boolean; onClick: () => void; icon: any; title: string; description: string;
}) {
  return (
    <div onClick={onClick} style={{
      flex: 1, padding: '1.25rem', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s',
      border: `2px solid ${active ? '#3b82f6' : 'rgba(255,255,255,0.08)'}`,
      background: active ? 'rgba(59,130,246,0.12)' : 'rgba(255,255,255,0.03)',
      display: 'flex', flexDirection: 'column', gap: '0.5rem',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Icon size={18} style={{ color: active ? '#60a5fa' : '#64748b' }} />
        <span style={{ fontWeight: 700, fontSize: '0.9rem', color: active ? '#f8fafc' : '#94a3b8' }}>{title}</span>
        {active && <Check size={14} style={{ marginLeft: 'auto', color: '#3b82f6' }} />}
      </div>
      <p style={{ fontSize: '0.78rem', color: '#64748b', lineHeight: 1.5, margin: 0 }}>{description}</p>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────
export default function LoginConfigPage() {
  const [cfg, setCfg] = useState<LoginPageConfig>(DEFAULT_LOGIN_CONFIG);
  const [toast, setToast] = useState<string | null>(null);
  const [previewVisible, setPreviewVisible] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const soundFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setCfg(loadLoginConfig()); }, []);

  const update = (key: keyof LoginPageConfig, value: any) =>
    setCfg(prev => ({ ...prev, [key]: value, themeId: 'custom' }));

  const THEMES: Record<'classic' | 'cyberpunk' | 'luxury' | 'minimalist', Partial<LoginPageConfig>> = {
    classic: {
      themeId: 'classic',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      backgroundMode: 'image',
      backgroundImageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop',
      overlayColorFrom: 'rgba(0,51,102,0.88)',
      overlayColorTo: 'rgba(30,64,175,0.78)',
      overlayOpacity: '1',
      headline: 'La nueva era del',
      headlineHighlight: 'Gobierno de Datos',
      subtitle: 'Centraliza el control, garantiza la calidad y potencia la toma de decisiones estratégicas en un solo lugar.',
      feature1: 'Seguridad Nivel Enterprise',
      feature2: 'Cumplimiento Global',
      feature3: 'UX/UI de Próxima Generación',
      headlineColor: '#ffffff',
      highlightColor: '#3b82f6',
      subtitleColor: '#e2e8f0',
      featureColor: '#ffffff',
      loginTitle: 'Bienvenido',
      loginSubtitle: 'Ingresa tus credenciales corporativas',
      headlineSizeRem: '3.5',
      subtitleSizeRem: '1.2',
      featureSizeRem: '1.0',
      loginTitleSizeRem: '2.0',
    },
    cyberpunk: {
      themeId: 'cyberpunk',
      fontFamily: "'Space Grotesk', 'Courier New', monospace",
      backgroundMode: 'gradient',
      gradientColorFrom: '#03000a',
      gradientColorTo: '#140529',
      gradientAngle: '135',
      headline: 'LA NUEVA REVOLUCIÓN DEL',
      headlineHighlight: 'GOBIERNO DE DATOS',
      subtitle: 'Descentraliza el control, automatiza la orquestación y opera a velocidad hiperlumínica.',
      feature1: 'Seguridad Cuántica & RLS',
      feature2: 'Orquestación con Agentes IA',
      feature3: 'Telemetría en Tiempo Real (RT-SDK)',
      headlineColor: '#ffffff',
      highlightColor: '#00ffcc',
      subtitleColor: '#a78bfa',
      featureColor: '#00ffcc',
      loginTitle: 'ACCESO DECK',
      loginSubtitle: 'Ingresa tus claves de red encriptadas',
      headlineSizeRem: '3.2',
      subtitleSizeRem: '1.1',
      featureSizeRem: '0.95',
      loginTitleSizeRem: '1.8',
    },
    luxury: {
      themeId: 'luxury',
      fontFamily: "'Playfair Display', Georgia, serif",
      backgroundMode: 'image',
      backgroundImageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop',
      overlayColorFrom: '#0f172a',
      overlayColorTo: '#1e293b',
      overlayOpacity: '0.9',
      headline: 'La excelencia y control del',
      headlineHighlight: 'Activo de Datos',
      subtitle: 'Gobernanza corporativa de nivel mundial y auditoría unificada para la alta dirección.',
      feature1: 'Cumplimiento Global (GDPR/DAMA)',
      feature2: 'Certificación de Calidad Triple-A',
      feature3: 'Auditoría Inmutable (Traceability)',
      headlineColor: '#ffffff',
      highlightColor: '#e2b842',
      subtitleColor: '#e2e8f0',
      featureColor: '#e2b842',
      loginTitle: 'Área Ejecutiva',
      loginSubtitle: 'Inicie sesión con su identidad corporativa',
      headlineSizeRem: '3.5',
      subtitleSizeRem: '1.2',
      featureSizeRem: '1.0',
      loginTitleSizeRem: '2.0',
    },
    minimalist: {
      themeId: 'minimalist',
      fontFamily: "'Outfit', 'Inter', sans-serif",
      backgroundMode: 'gradient',
      gradientColorFrom: '#3b82f6',
      gradientColorTo: '#8b5cf6',
      gradientAngle: '145',
      headline: 'Simple. Inteligente.',
      headlineHighlight: 'Tus datos en orden.',
      subtitle: 'La plataforma moderna de autoservicio que empodera a tus equipos y acelera la innovación.',
      feature1: 'Búsqueda Semántica con IA',
      feature2: 'Diseño Centrado en el Humano',
      feature3: 'Integraciones Sin Fricciones',
      headlineColor: '#ffffff',
      highlightColor: '#fde047',
      subtitleColor: '#f3e8ff',
      featureColor: '#ffffff',
      loginTitle: 'Hola de nuevo',
      loginSubtitle: 'Ingresa para acceder a tu panel de control',
      headlineSizeRem: '3.4',
      subtitleSizeRem: '1.15',
      featureSizeRem: '0.95',
      loginTitleSizeRem: '1.9',
    }
  };

  const handleApplyTheme = (themeName: 'classic' | 'cyberpunk' | 'luxury' | 'minimalist') => {
    const themeData = THEMES[themeName];
    setCfg(prev => ({ ...prev, ...themeData }));
    const displayName = 
      themeName === 'classic' ? 'Por Defecto (Clásico)' : 
      themeName === 'cyberpunk' ? 'Distopía Cyberpunk' : 
      themeName === 'luxury' ? 'Negocios de Elite' : 
      'Minimalista Aurora';
    setToast(`✨ Tema "${displayName}" seleccionado.`);
    setTimeout(() => setToast(null), 3000);
  };

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg));
    setToast('✅ Configuración del login guardada correctamente.');
    setTimeout(() => setToast(null), 3500);
  };

  const handleReset = () => {
    if (confirm('¿Restaurar la configuración predeterminada del login?')) {
      setCfg(DEFAULT_LOGIN_CONFIG);
      localStorage.removeItem(STORAGE_KEY);
      setToast('↩ Configuración restaurada al estado original.');
      setTimeout(() => setToast(null), 3000);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      update('backgroundImageUrl', reader.result as string);
      update('backgroundMode', 'image');
    };
    reader.readAsDataURL(file);
  };

  const handleSoundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      update('loginSoundUrl', reader.result as string);
    };
    reader.readAsDataURL(file);
    // reset input so same file can be re-selected
    e.target.value = '';
  };

  const handlePreviewSound = () => {
    const src = cfg.loginSoundUrl;
    if (!src) return;
    try {
      const audio = new Audio(src);
      audio.volume = 0.8;
      audio.play().catch(err => console.warn('Preview play failed:', err));
    } catch (e) {
      console.warn('Audio preview error:', e);
    }
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', fontFamily: cfg.fontFamily || 'inherit' }}>
      <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;700&family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Outfit:wght@400;600;800&display=swap" rel="stylesheet" />
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 9999,
          padding: '1rem 1.5rem', borderRadius: '14px', fontWeight: 600,
          fontSize: '0.875rem', background: 'linear-gradient(135deg,#10b981,#059669)',
          color: '#fff', boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
        }}>{toast}</div>
      )}

      {/* Header */}
      <div className="sa-title-area">
        <div>
          <h1 className="sa-title">Portal de Login</h1>
          <p className="sa-subtitle">Personaliza la apariencia de la página de inicio de sesión. Los cambios se aplican en tiempo real.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={() => setPreviewVisible(!previewVisible)} className="sa-btn sa-btn-secondary">
            {previewVisible ? <EyeOff size={16} /> : <Eye size={16} />}
            {previewVisible ? 'Ocultar Preview' : 'Ver Preview'}
          </button>
          <button onClick={handleReset} className="sa-btn sa-btn-secondary">
            <RotateCcw size={16} /> Restaurar
          </button>
          <button onClick={handleSave} className="sa-btn sa-btn-primary">
            <Save size={16} /> Guardar Cambios
          </button>
        </div>
      </div>

      {/* ── THEME PRESETS SELECTOR ── */}
      <div className="sa-card" style={{ gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
          <Sparkles size={18} style={{ color: '#fbbf24' }} />
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#fff' }}>Temas Preestablecidos (UX & Colores Cohesivos)</h3>
        </div>
        <p style={{ color: '#64748b', fontSize: '0.82rem', margin: 0 }}>
          Selecciona uno de los estilos prediseñados para cambiar instantáneamente la paleta de colores, la tipografía, los textos y el fondo, creando un diseño unificado y premium.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
          {/* Classic theme button */}
          <button
            onClick={() => handleApplyTheme('classic')}
            style={{
              padding: '1.25rem',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              border: `2px solid ${cfg.themeId === 'classic' ? '#3b82f6' : 'rgba(255,255,255,0.08)'}`,
              background: cfg.themeId === 'classic' ? 'rgba(59, 130, 246, 0.08)' : 'rgba(255,255,255,0.03)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              textAlign: 'left',
              color: '#fff',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%' }}>
              <span style={{ fontSize: '1.25rem' }}>🏢</span>
              <span style={{ fontWeight: 700, fontSize: '0.9rem', color: cfg.themeId === 'classic' ? '#3b82f6' : '#f8fafc' }}>Por Defecto (Clásico)</span>
              {cfg.themeId === 'classic' && <Check size={14} style={{ marginLeft: 'auto', color: '#3b82f6' }} />}
            </div>
            <p style={{ fontSize: '0.75rem', color: '#64748b', lineHeight: 1.4, margin: 0 }}>
              El diseño corporativo original de GovData Nexus, con la paleta de colores azul oscuro, toques cian y tipografía predeterminada.
            </p>
            <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#003366', border: '1px solid #334155' }} />
              <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#1e40af' }} />
              <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#3b82f6' }} />
            </div>
          </button>

          {/* Cyberpunk theme button */}
          <button
            onClick={() => handleApplyTheme('cyberpunk')}
            style={{
              padding: '1.25rem',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              border: `2px solid ${cfg.themeId === 'cyberpunk' ? '#00ffcc' : 'rgba(255,255,255,0.08)'}`,
              background: cfg.themeId === 'cyberpunk' ? 'rgba(0, 255, 204, 0.08)' : 'rgba(255,255,255,0.03)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              textAlign: 'left',
              color: '#fff',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%' }}>
              <span style={{ fontSize: '1.25rem' }}>👾</span>
              <span style={{ fontWeight: 700, fontSize: '0.9rem', color: cfg.themeId === 'cyberpunk' ? '#00ffcc' : '#f8fafc' }}>Distopía Cyberpunk</span>
              {cfg.themeId === 'cyberpunk' && <Check size={14} style={{ marginLeft: 'auto', color: '#00ffcc' }} />}
            </div>
            <p style={{ fontSize: '0.75rem', color: '#64748b', lineHeight: 1.4, margin: 0 }}>
              Estilo futurista de ciencia ficción con luces de neón cian, fondo oscuro y tipografía monospace técnica.
            </p>
            <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#0a0a16', border: '1px solid #334155' }} />
              <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#00ffcc' }} />
              <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#a78bfa' }} />
            </div>
          </button>

          {/* Luxury theme button */}
          <button
            onClick={() => handleApplyTheme('luxury')}
            style={{
              padding: '1.25rem',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              border: `2px solid ${cfg.themeId === 'luxury' ? '#e2b842' : 'rgba(255,255,255,0.08)'}`,
              background: cfg.themeId === 'luxury' ? 'rgba(226, 184, 66, 0.08)' : 'rgba(255,255,255,0.03)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              textAlign: 'left',
              color: '#fff',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%' }}>
              <span style={{ fontSize: '1.25rem' }}>👑</span>
              <span style={{ fontWeight: 700, fontSize: '0.9rem', color: cfg.themeId === 'luxury' ? '#e2b842' : '#f8fafc' }}>Negocios de Elite</span>
              {cfg.themeId === 'luxury' && <Check size={14} style={{ marginLeft: 'auto', color: '#e2b842' }} />}
            </div>
            <p style={{ fontSize: '0.75rem', color: '#64748b', lineHeight: 1.4, margin: 0 }}>
              Diseño elegante para altos directivos, con fotografía de arquitectura, overlay oscuro y toques dorados sofisticados.
            </p>
            <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#0f172a', border: '1px solid #334155' }} />
              <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#e2b842' }} />
              <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#cbd5e1' }} />
            </div>
          </button>

          {/* Minimalist theme button */}
          <button
            onClick={() => handleApplyTheme('minimalist')}
            style={{
              padding: '1.25rem',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              border: `2px solid ${cfg.themeId === 'minimalist' ? '#8b5cf6' : 'rgba(255,255,255,0.08)'}`,
              background: cfg.themeId === 'minimalist' ? 'rgba(139, 92, 246, 0.08)' : 'rgba(255,255,255,0.03)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              textAlign: 'left',
              color: '#fff',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%' }}>
              <span style={{ fontSize: '1.25rem' }}>✨</span>
              <span style={{ fontWeight: 700, fontSize: '0.9rem', color: cfg.themeId === 'minimalist' ? '#a78bfa' : '#f8fafc' }}>Minimalista Aurora</span>
              {cfg.themeId === 'minimalist' && <Check size={14} style={{ marginLeft: 'auto', color: '#a78bfa' }} />}
            </div>
            <p style={{ fontSize: '0.75rem', color: '#64748b', lineHeight: 1.4, margin: 0 }}>
              Estilo moderno e innovador con un fondo degradado de aurora morado/azul, textos limpios y tipografía geométrica Outfit.
            </p>
            <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#3b82f6' }} />
              <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#8b5cf6' }} />
              <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#fde047' }} />
            </div>
          </button>
        </div>
      </div>

      {/* ── BACKGROUND MODE SELECTOR (prominent) ── */}
      <div className="sa-card" style={{ gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
          <Layers size={18} style={{ color: '#60a5fa' }} />
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#fff' }}>Fondo del Panel Izquierdo</h3>
        </div>
        <p style={{ color: '#64748b', fontSize: '0.82rem', margin: 0 }}>
          Elige si el fondo es un <strong style={{ color: '#94a3b8' }}>degradado de color puro</strong> o una <strong style={{ color: '#94a3b8' }}>fotografía / imagen</strong> con overlay.
        </p>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <ModeCard
            active={cfg.backgroundMode === 'gradient'}
            onClick={() => update('backgroundMode', 'gradient')}
            icon={Palette}
            title="Degradado de color"
            description="Fondo sólido con dos colores en degradé. Limpio, sin imágenes externas."
          />
          <ModeCard
            active={cfg.backgroundMode === 'image'}
            onClick={() => update('backgroundMode', 'image')}
            icon={ImageIcon}
            title="Imagen de fondo"
            description="Fotografía con overlay semitransparente encima. Puedes usar URL o subir tu propia imagen."
          />
        </div>
      </div>

      {/* Live Preview */}
      {previewVisible && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Monitor size={16} style={{ color: '#60a5fa' }} />
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Vista Previa en Tiempo Real</span>
          </div>
          <LoginPreview cfg={cfg} />
        </div>
      )}

      {/* Controls grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>

        {/* Left col */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          <Section title="Panel Izquierdo — Textos" icon={Type}>
            <Field label="Texto Principal (Línea 1)">
              <input type="text" value={cfg.headline} onChange={e => update('headline', e.target.value)} style={inputStyle} />
            </Field>
            <Field label="Texto Destacado (Línea 2 — resaltado)">
              <input type="text" value={cfg.headlineHighlight} onChange={e => update('headlineHighlight', e.target.value)} style={inputStyle} />
            </Field>
            <Field label="Subtítulo descriptivo">
              <textarea value={cfg.subtitle} onChange={e => update('subtitle', e.target.value)}
                rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
            </Field>
            <Field label="Característica 1">
              <input type="text" value={cfg.feature1} onChange={e => update('feature1', e.target.value)} style={inputStyle} />
            </Field>
            <Field label="Característica 2">
              <input type="text" value={cfg.feature2} onChange={e => update('feature2', e.target.value)} style={inputStyle} />
            </Field>
            <Field label="Característica 3">
              <input type="text" value={cfg.feature3} onChange={e => update('feature3', e.target.value)} style={inputStyle} />
            </Field>
          </Section>

          <Section title="Panel Derecho — Formulario" icon={AlignLeft}>
            <Field label="Título del formulario">
              <input type="text" value={cfg.loginTitle} onChange={e => update('loginTitle', e.target.value)} style={inputStyle} />
            </Field>
            <Field label="Subtítulo del formulario">
              <input type="text" value={cfg.loginSubtitle} onChange={e => update('loginSubtitle', e.target.value)} style={inputStyle} />
            </Field>
          </Section>

          <Section title="Logo y Marca" icon={Layout}>
            <Field label="Visibilidad del Logo">
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                {([true, false] as const).map(v => (
                  <button key={String(v)} onClick={() => update('showLogo', v)} style={{
                    flex: 1, padding: '0.55rem', borderRadius: '8px', fontWeight: 600,
                    fontSize: '0.82rem', cursor: 'pointer', border: 'none',
                    background: cfg.showLogo === v ? '#3b82f6' : 'rgba(255,255,255,0.06)',
                    color: cfg.showLogo === v ? '#fff' : '#94a3b8',
                  }}>
                    {v ? 'Mostrar' : 'Ocultar'}
                  </button>
                ))}
              </div>
            </Field>

            {cfg.showLogo && (
              <>
                <Field label="Posición del Logo">
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    {[
                      { value: 'left-panel', label: '📍 Panel Izquierdo' },
                      { value: 'top-right', label: '↗️ Superior Derecha' }
                    ].map(pos => (
                      <button key={pos.value} onClick={() => update('logoPosition', pos.value)} style={{
                        flex: 1, padding: '0.55rem', borderRadius: '8px', fontWeight: 600,
                        fontSize: '0.82rem', cursor: 'pointer', border: 'none',
                        background: (cfg.logoPosition || 'left-panel') === pos.value ? '#3b82f6' : 'rgba(255,255,255,0.06)',
                        color: (cfg.logoPosition || 'left-panel') === pos.value ? '#fff' : '#94a3b8',
                      }}>
                        {pos.label}
                      </button>
                    ))}
                  </div>
                </Field>

                <Field label="Tipo de Logo">
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    {(['text', 'image'] as const).map(mode => (
                      <button key={mode} onClick={() => update('logoMode', mode)} style={{
                        flex: 1, padding: '0.55rem', borderRadius: '8px', fontWeight: 600,
                        fontSize: '0.82rem', cursor: 'pointer', border: 'none',
                        background: cfg.logoMode === mode ? '#3b82f6' : 'rgba(255,255,255,0.06)',
                        color: cfg.logoMode === mode ? '#fff' : '#94a3b8',
                      }}>
                        {mode === 'text' ? '🔤 Texto' : '🖼️ Imagen'}
                      </button>
                    ))}
                  </div>
                </Field>

                {cfg.logoMode === 'text' && (
                  <Field label="Texto del Logo">
                    <input type="text" value={cfg.logoText} onChange={e => update('logoText', e.target.value)} style={inputStyle} />
                  </Field>
                )}

                {cfg.logoMode === 'image' && (
                  <>
                    <Field label="URL de la imagen del logo">
                      <input type="text" value={cfg.logoImageUrl}
                        onChange={e => update('logoImageUrl', e.target.value)}
                        style={inputStyle} placeholder="https://... o data:image/..." />
                    </Field>
                    <Field label="O sube tu logo desde el equipo">
                      <input
                        type="file" accept="image/*"
                        style={{ display: 'none' }}
                        id="logo-file-input"
                        onChange={e => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const reader = new FileReader();
                          reader.onloadend = () => update('logoImageUrl', reader.result as string);
                          reader.readAsDataURL(file);
                        }}
                      />
                      <label htmlFor="logo-file-input" className="sa-btn sa-btn-secondary"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center', cursor: 'pointer', padding: '0.6rem 1rem', borderRadius: '10px', fontSize: '0.875rem', fontWeight: 600 }}>
                        <Upload size={15} /> Subir imagen del logo
                      </label>
                    </Field>
                    {cfg.logoImageUrl && (
                      <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '10px', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'flex-start' }}>
                        <img src={cfg.logoImageUrl} alt="logo preview"
                          style={{
                            height: `${cfg.logoImageHeightPx}px`,
                            width: cfg.logoImageWidthPx === 'auto' ? 'auto' : `${cfg.logoImageWidthPx}px`,
                            maxWidth: '240px',
                            objectFit: 'contain',
                            display: 'block',
                          }} />
                        <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Vista previa del logo</span>
                      </div>
                    )}

                    {/* Keep ratio toggle */}
                    <Field label="Proporciones">
                      <div style={{ display: 'flex', gap: '0.75rem' }}>
                        {([true, false] as const).map(v => (
                          <button key={String(v)} onClick={() => {
                            update('logoKeepRatio', v);
                            if (v) update('logoImageWidthPx', 'auto');
                          }} style={{
                            flex: 1, padding: '0.5rem', borderRadius: '8px', fontWeight: 600,
                            fontSize: '0.8rem', cursor: 'pointer', border: 'none',
                            background: cfg.logoKeepRatio === v ? '#3b82f6' : 'rgba(255,255,255,0.06)',
                            color: cfg.logoKeepRatio === v ? '#fff' : '#94a3b8',
                          }}>
                            {v ? '🔒 Mantener proporción' : '↔️ Ancho libre'}
                          </button>
                        ))}
                      </div>
                    </Field>

                    {/* Height slider — always shown */}
                    <Field label={`Alto: ${cfg.logoImageHeightPx} px`}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <input type="range" min="20" max="500" step="2" value={cfg.logoImageHeightPx}
                          onChange={e => update('logoImageHeightPx', e.target.value)}
                          style={{ flex: 1, accentColor: '#3b82f6' }} />
                        <span style={{ color: '#60a5fa', fontWeight: 700, fontSize: '0.85rem', minWidth: '3.5rem', textAlign: 'right' }}>{cfg.logoImageHeightPx} px</span>
                      </div>
                    </Field>

                    {/* Width slider — only shown when ratio is unlocked */}
                    {!cfg.logoKeepRatio && (
                      <Field label={`Ancho: ${cfg.logoImageWidthPx === 'auto' ? 'auto' : cfg.logoImageWidthPx + ' px'}`}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <input type="range" min="20" max="800" step="4"
                            value={cfg.logoImageWidthPx === 'auto' ? '200' : cfg.logoImageWidthPx}
                            onChange={e => update('logoImageWidthPx', e.target.value)}
                            style={{ flex: 1, accentColor: '#8b5cf6' }} />
                          <span style={{ color: '#a78bfa', fontWeight: 700, fontSize: '0.85rem', minWidth: '3.5rem', textAlign: 'right' }}>
                            {cfg.logoImageWidthPx === 'auto' ? 'auto' : `${cfg.logoImageWidthPx} px`}
                          </span>
                        </div>
                        <button onClick={() => update('logoImageWidthPx', 'auto')}
                          style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '0.75rem', cursor: 'pointer', padding: 0, textAlign: 'left' }}>
                          ↩ Restablecer a automático
                        </button>
                      </Field>
                    )}
                  </>
                )}
              </>
            )}
          </Section>
        </div>

        {/* Right col */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          {/* ── GRADIENT MODE OPTIONS ── */}
          {cfg.backgroundMode === 'gradient' && (
            <Section title="Configuración del Degradado" icon={Palette}>
              <ColorField label="Color de inicio" value={cfg.gradientColorFrom} onChange={v => update('gradientColorFrom', v)} />
              <ColorField label="Color de fin" value={cfg.gradientColorTo} onChange={v => update('gradientColorTo', v)} />
              <Field label={`Ángulo del degradado: ${cfg.gradientAngle}°`}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <input type="range" min="0" max="360" step="5" value={cfg.gradientAngle}
                    onChange={e => update('gradientAngle', e.target.value)}
                    style={{ flex: 1, accentColor: '#3b82f6' }} />
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                    background: `linear-gradient(${cfg.gradientAngle}deg, ${cfg.gradientColorFrom}, ${cfg.gradientColorTo})`,
                    border: '2px solid rgba(255,255,255,0.15)',
                  }} />
                </div>
              </Field>
              {/* Quick presets */}
              <Field label="Presets de degradado">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.5rem' }}>
                  {[
                    { from: '#003366', to: '#1e40af', label: 'Navy' },
                    { from: '#0f172a', to: '#1e3a8a', label: 'Dark' },
                    { from: '#065f46', to: '#0d9488', label: 'Green' },
                    { from: '#7c3aed', to: '#4f46e5', label: 'Purple' },
                    { from: '#9f1239', to: '#be123c', label: 'Red' },
                    { from: '#92400e', to: '#d97706', label: 'Amber' },
                    { from: '#1e293b', to: '#475569', label: 'Slate' },
                    { from: '#0c4a6e', to: '#0284c7', label: 'Sky' },
                    { from: '#14532d', to: '#15803d', label: 'Emerald' },
                    { from: '#1c1917', to: '#44403c', label: 'Stone' },
                  ].map(p => (
                    <button key={p.label} onClick={() => { update('gradientColorFrom', p.from); update('gradientColorTo', p.to); }}
                      title={p.label}
                      style={{
                        height: 32, borderRadius: '8px', border: '2px solid transparent', cursor: 'pointer',
                        background: `linear-gradient(135deg, ${p.from}, ${p.to})`,
                        transition: 'border-color 0.15s',
                      }}
                    />
                  ))}
                </div>
              </Field>
            </Section>
          )}

          {/* ── IMAGE MODE OPTIONS ── */}
          {cfg.backgroundMode === 'image' && (
            <Section title="Imagen de Fondo" icon={ImageIcon}>
              <Field label="URL de la imagen (Unsplash, CDN, etc.)">
                <input type="text" value={cfg.backgroundImageUrl} onChange={e => update('backgroundImageUrl', e.target.value)}
                  style={inputStyle} placeholder="https://images.unsplash.com/..." />
              </Field>
              <Field label="O sube tu propia imagen">
                <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} style={{ display: 'none' }} />
                <button onClick={() => fileInputRef.current?.click()}
                  className="sa-btn sa-btn-secondary"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center', width: '100%' }}>
                  <Upload size={15} /> Subir imagen desde mi equipo
                </button>
              </Field>
              {cfg.backgroundImageUrl && (
                <div style={{ position: 'relative', borderRadius: '10px', overflow: 'hidden', height: '110px' }}>
                  <img src={cfg.backgroundImageUrl} alt="bg preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(135deg, ${cfg.overlayColorFrom}, ${cfg.overlayColorTo})`, opacity: parseFloat(cfg.overlayOpacity) }} />
                  <span style={{ position: 'absolute', bottom: '7px', left: '10px', color: '#fff', fontSize: '0.72rem', fontWeight: 600, textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}>Con overlay aplicado</span>
                </div>
              )}
              <Field label={`Opacidad del overlay: ${Math.round(parseFloat(cfg.overlayOpacity) * 100)}%`}>
                <input type="range" min="0" max="1" step="0.05" value={cfg.overlayOpacity}
                  onChange={e => update('overlayOpacity', e.target.value)}
                  style={{ width: '100%', accentColor: '#3b82f6' }} />
              </Field>
              <Field label="Color del overlay (inicio)">
                <input type="text" value={cfg.overlayColorFrom} onChange={e => update('overlayColorFrom', e.target.value)}
                  style={inputStyle} placeholder="rgba(0,51,102,0.88)" />
              </Field>
              <Field label="Color del overlay (fin)">
                <input type="text" value={cfg.overlayColorTo} onChange={e => update('overlayColorTo', e.target.value)}
                  style={inputStyle} placeholder="rgba(30,64,175,0.78)" />
              </Field>
            </Section>
          )}

          {/* Text colors — always visible */}
          <Section title="Colores del Texto" icon={Palette}>
            <ColorField label="Título Principal" value={cfg.headlineColor} onChange={v => update('headlineColor', v)} />
            <ColorField label="Texto Resaltado" value={cfg.highlightColor} onChange={v => update('highlightColor', v)} />
            <ColorField label="Subtítulo" value={cfg.subtitleColor} onChange={v => update('subtitleColor', v)} />
            <ColorField label="Características" value={cfg.featureColor} onChange={v => update('featureColor', v)} />
          </Section>

          <Section title="Tamaños y Tipografía" icon={Sliders}>
            <Field label="Fuente / Familia Tipográfica">
              <select 
                value={cfg.fontFamily || 'system-ui, -apple-system, sans-serif'} 
                onChange={e => update('fontFamily', e.target.value)} 
                style={inputStyle}
              >
                <option value="system-ui, -apple-system, sans-serif">Predeterminada (Sans-Serif)</option>
                <option value="'Outfit', 'Inter', sans-serif">Outfit / Inter (Geométrica / Limpia)</option>
                <option value="'Space Grotesk', 'Courier New', monospace">Space Grotesk / Monospace (Futurista / Cyberpunk)</option>
                <option value="'Playfair Display', Georgia, serif">Playfair Display / Serif (Elegante / Luxury)</option>
              </select>
            </Field>
            <SizeField label="Título Principal" value={cfg.headlineSizeRem} onChange={v => update('headlineSizeRem', v)} />
            <SizeField label="Subtítulo" value={cfg.subtitleSizeRem} onChange={v => update('subtitleSizeRem', v)} />
            <SizeField label="Características" value={cfg.featureSizeRem} onChange={v => update('featureSizeRem', v)} />
            <SizeField label="Título del Formulario" value={cfg.loginTitleSizeRem} onChange={v => update('loginTitleSizeRem', v)} />
          </Section>

          <Section title="Efectos y Sonido" icon={Music}>
            <Field label="Sonido de Inicio">
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                {([true, false] as const).map(v => (
                  <button key={String(v)} onClick={() => update('enableLoginSound', v)} style={{
                    flex: 1, padding: '0.55rem', borderRadius: '8px', fontWeight: 600,
                    fontSize: '0.82rem', cursor: 'pointer', border: 'none',
                    background: (cfg.enableLoginSound !== false ? true : false) === v ? '#3b82f6' : 'rgba(255,255,255,0.06)',
                    color: (cfg.enableLoginSound !== false ? true : false) === v ? '#fff' : '#94a3b8',
                  }}>
                    {v ? '🔊 Activado' : '🔇 Desactivado'}
                  </button>
                ))}
              </div>
            </Field>

            {cfg.enableLoginSound !== false && (
              <Field label="Archivo de Sonido Personalizado">
                {/* Hidden file input */}
                <input
                  ref={soundFileInputRef}
                  type="file"
                  accept="audio/*"
                  style={{ display: 'none' }}
                  onChange={handleSoundUpload}
                />

                {cfg.loginSoundUrl ? (
                  // ── Sound loaded: show name, preview, and clear ──
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '0.75rem',
                      background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.25)',
                      borderRadius: '10px', padding: '0.625rem 0.875rem',
                    }}>
                      <Music size={16} style={{ color: '#60a5fa', flexShrink: 0 }} />
                      <span style={{ flex: 1, fontSize: '0.82rem', color: '#93c5fd', fontWeight: 600, wordBreak: 'break-all' }}>
                        Sonido personalizado cargado ✓
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        type="button"
                        onClick={handlePreviewSound}
                        style={{
                          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                          gap: '0.4rem', padding: '0.5rem', borderRadius: '8px', fontWeight: 600,
                          fontSize: '0.8rem', cursor: 'pointer', border: 'none',
                          background: 'rgba(16,185,129,0.15)', color: '#34d399',
                        }}
                      >
                        <Play size={14} /> Previsualizar
                      </button>
                      <button
                        type="button"
                        onClick={() => soundFileInputRef.current?.click()}
                        style={{
                          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                          gap: '0.4rem', padding: '0.5rem', borderRadius: '8px', fontWeight: 600,
                          fontSize: '0.8rem', cursor: 'pointer', border: 'none',
                          background: 'rgba(255,255,255,0.06)', color: '#94a3b8',
                        }}
                      >
                        <Upload size={14} /> Cambiar
                      </button>
                      <button
                        type="button"
                        onClick={() => update('loginSoundUrl', '')}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          gap: '0.4rem', padding: '0.5rem 0.75rem', borderRadius: '8px', fontWeight: 600,
                          fontSize: '0.8rem', cursor: 'pointer', border: 'none',
                          background: 'rgba(239,68,68,0.12)', color: '#f87171',
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <p style={{ fontSize: '0.72rem', color: '#475569', margin: 0 }}>
                      El sonido personalizado reemplaza el efecto K.I.T.T. predeterminado.
                    </p>
                  </div>
                ) : (
                  // ── No sound uploaded: upload button + info ──
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={() => soundFileInputRef.current?.click()}
                      className="sa-btn sa-btn-secondary"
                      style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center', width: '100%' }}
                    >
                      <Upload size={15} /> Subir archivo de audio (.mp3, .wav, .ogg…)
                    </button>
                    <p style={{ fontSize: '0.72rem', color: '#475569', margin: 0 }}>
                      Si no subes un archivo, se usará el efecto K.I.T.T. sintetizado por defecto.
                    </p>
                  </div>
                )}
              </Field>
            )}
          </Section>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        <button onClick={handleReset} className="sa-btn sa-btn-secondary">
          <RotateCcw size={15} /> Restaurar predeterminado
        </button>
        <button onClick={handleSave} className="sa-btn sa-btn-primary">
          <Save size={15} /> Guardar y Publicar
        </button>
      </div>
    </div>
  );
}
