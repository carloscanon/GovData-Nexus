'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Settings, 
  LayoutGrid, 
  Palette, 
  Save, 
  FileCode, 
  Sparkles, 
  Database, 
  Sliders, 
  TrendingUp, 
  Activity, 
  ShieldAlert, 
  Users, 
  RefreshCw, 
  Zap, 
  HelpCircle,
  X,
  Play,
  Copy,
  ChevronRight,
  UserCheck,
  Code,
  Grid,
  Info,
  SlidersHorizontal,
  CloudLightning,
  AlertTriangle,
  Award,
  LayoutDashboard
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlatform } from '@/contexts/PlatformContext';
import styles from './builder.module.css';

// Predefined template options for the builder
const templatesList = [
  { id: 'calidad', name: 'Control de Calidad', tag: 'Calidad', desc: 'Plantilla optimizada para Data Stewards enfocado en nulos, duplicados y SLAs.', color: '#10b981', bg: '#ecfdf5' },
  { id: 'seguridad', name: 'Monitoreo de Seguridad', tag: 'Seguridad', desc: 'Enfocado en accesos PII, enmascaramiento dinámico e incidentes activos.', color: '#ef4444', bg: '#fef2f2' },
  { id: 'cumplimiento', name: 'Auditoría y Normas', tag: 'Cumplimiento', desc: 'KPIs globales de cumplimiento regulatorio local e internacional.', color: '#3b82f6', bg: '#eff6ff' },
  { id: 'ia', name: 'Foresight Predictivo IA', tag: 'IA / Inteligente', desc: 'Predicción de anomalías y generación automática de insights.', color: '#8b5cf6', bg: '#f5f3ff' },
];

interface Widget {
  id: string;
  name: string;
  type: 'kpi' | 'chart' | 'ia';
  size: 'small' | 'medium' | 'large';
  height: number;
  icon: any;
  value: string;
  desc: string;
  apiSource: string;
  refresh: 'Realtime' | 'Hourly' | 'Daily';
  roles: string[];
}

const initialLibraryWidgets: Widget[] = [
  { id: 'lib-1', name: 'Calidad de Datos RUT', type: 'kpi', size: 'small', height: 1, icon: Activity, value: '92.4%', desc: 'Índice de precisión de RUTs chilenos.', apiSource: 'PostgreSQL - Prod', refresh: 'Realtime', roles: ['CDO', 'Data Steward'] },
  { id: 'lib-2', name: 'Cumplimiento Normativo', type: 'kpi', size: 'small', height: 1, icon: UserCheck, value: '88%', desc: 'Porcentaje de compliance de políticas.', apiSource: 'SAP ERP Connect', refresh: 'Hourly', roles: ['Auditor', 'CDO'] },
  { id: 'lib-3', name: 'Riesgos Críticos', type: 'kpi', size: 'small', height: 1, icon: ShieldAlert, value: '3 Activos', desc: 'Incidentes de fuga de datos no resueltos.', apiSource: 'AWS CloudTrail', refresh: 'Realtime', roles: ['Seguridad', 'Auditor'] },
  { id: 'lib-4', name: 'Madurez del Gobierno', type: 'kpi', size: 'small', height: 1, icon: TrendingUp, value: '64%', desc: 'Evaluación del framework de gobernanza.', apiSource: 'Encuesta Anual', refresh: 'Daily', roles: ['CDO', 'CIO'] },
  { id: 'lib-5', name: 'Grafo de Linaje de Datos', type: 'chart', size: 'medium', height: 2, icon: Database, value: 'Visual Interactivo', desc: 'Rastreo del origen y flujo de tablas.', apiSource: 'GovData Engine', refresh: 'Daily', roles: ['Data Steward', 'CIO'] },
  { id: 'lib-6', name: 'Sankey de Procesos', type: 'chart', size: 'medium', height: 2, icon: Grid, value: 'Diagrama de Flujo', desc: 'Volumen de transferencia por área.', apiSource: 'Oracle DB Core', refresh: 'Hourly', roles: ['CIO', 'Auditor'] },
  { id: 'lib-7', name: 'Predicción de Anomalías IA', type: 'ia', size: 'medium', height: 2, icon: Sparkles, value: '8 Anomalías hoy', desc: 'Detección proactiva de picos de nulos.', apiSource: 'GovData AI-Agent', refresh: 'Realtime', roles: ['CDO', 'Data Steward'] },
  { id: 'lib-8', name: 'Resumen Ejecutivo IA', type: 'ia', size: 'large', height: 2, icon: Sparkles, value: 'Generando Reporte...', desc: 'Explicación automática del estado organizativo.', apiSource: 'OpenAI GPT-4o Integration', refresh: 'Daily', roles: ['CDO', 'CIO'] },
];

export default function DashboardBuilder() {
  const { currentTenant } = usePlatform();
  const [activeTab, setActiveTab] = useState<'widgets' | 'themes' | 'settings'>('widgets');
  
  // Theme state settings (sliders)
  const [selectedTheme, setSelectedTheme] = useState<'execDark' | 'corpBlue' | 'neon' | 'glass' | 'minimal'>('glass');
  const [borderRadius, setBorderRadius] = useState(20);
  const [borderWidth, setBorderWidth] = useState(1);
  const [cardOpacity, setCardOpacity] = useState(90);
  const [blurAmount, setBlurAmount] = useState(15);
  
  // Selected Version
  const [builderVersion, setBuilderVersion] = useState('v1.0.4 (Activa)');
  const [globalRefresh, setGlobalRefresh] = useState('Hourly');

  // Layout widgets state
  const [layoutWidgets, setLayoutWidgets] = useState<Widget[]>([
    { id: 'w-1', name: 'Calidad de Datos RUT', type: 'kpi', size: 'small', height: 1, icon: Activity, value: '92.4%', desc: 'Índice de precisión de RUTs chilenos.', apiSource: 'PostgreSQL - Prod', refresh: 'Realtime', roles: ['CDO', 'Data Steward'] },
    { id: 'w-2', name: 'Cumplimiento Normativo', type: 'kpi', size: 'small', height: 1, icon: UserCheck, value: '88%', desc: 'Porcentaje de compliance de políticas.', apiSource: 'SAP ERP Connect', refresh: 'Hourly', roles: ['Auditor', 'CDO'] },
    { id: 'w-3', name: 'Grafo de Linaje de Datos', type: 'chart', size: 'medium', height: 2, icon: Database, value: 'Visual Interactivo', desc: 'Rastreo del origen y flujo de tablas.', apiSource: 'GovData Engine', refresh: 'Daily', roles: ['Data Steward', 'CIO'] },
    { id: 'w-4', name: 'Predicción de Anomalías IA', type: 'ia', size: 'medium', height: 2, icon: Sparkles, value: '8 Anomalías hoy', desc: 'Detección proactiva de picos de nulos.', apiSource: 'GovData AI-Agent', refresh: 'Realtime', roles: ['CDO', 'Data Steward'] },
  ]);

  // Selected widget for advanced config inspection
  const [inspectingWidget, setInspectingWidget] = useState<Widget | null>(null);

  // Modals state
  const [isJsonModalOpen, setIsJsonModalOpen] = useState(false);
  const [jsonText, setJsonText] = useState('');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Sync JSON text when layoutWidgets change
  useEffect(() => {
    const minifiedLayout = layoutWidgets.map(({ id, name, type, size, height, apiSource, refresh, roles }) => ({
      id, name, type, size, height, apiSource, refresh, roles
    }));
    setJsonText(JSON.stringify({
      theme: selectedTheme,
      border_radius: `${borderRadius}px`,
      border_width: `${borderWidth}px`,
      opacity: cardOpacity / 100,
      blur: `${blurAmount}px`,
      refresh_global: globalRefresh,
      widgets: minifiedLayout
    }, null, 2));
  }, [layoutWidgets, selectedTheme, borderRadius, borderWidth, cardOpacity, blurAmount, globalRefresh]);

  // Add widget from Library to Layout
  const addWidgetToLayout = (widget: Widget) => {
    // Generate unique ID
    const newWidget = {
      ...widget,
      id: `w-${Date.now()}`
    };
    setLayoutWidgets(prev => [...prev, newWidget]);
  };

  // Remove widget from Layout
  const removeWidget = (id: string) => {
    setLayoutWidgets(prev => prev.filter(w => w.id !== id));
    if (inspectingWidget?.id === id) {
      setInspectingWidget(null);
    }
  };

  // Save advanced configurations for widget
  const handleUpdateInspectedWidget = (updatedFields: Partial<Widget>) => {
    if (!inspectingWidget) return;
    const updated = { ...inspectingWidget, ...updatedFields };
    setInspectingWidget(updated);
    setLayoutWidgets(prev => 
      prev.map(w => w.id === updated.id ? updated : w)
    );
  };

  // Import JSON Layout configuration
  const handleImportJson = () => {
    try {
      const parsed = JSON.parse(jsonText);
      if (parsed.widgets && Array.isArray(parsed.widgets)) {
        // Reconstruct components with their icons
        const rebuilt: Widget[] = parsed.widgets.map((w: any) => {
          const libraryMatch = initialLibraryWidgets.find(lib => lib.name === w.name);
          return {
            id: w.id || `w-${Date.now()}-${Math.random()}`,
            name: w.name,
            type: w.type || 'kpi',
            size: w.size || 'small',
            height: w.height || 1,
            icon: libraryMatch?.icon || Database,
            value: libraryMatch?.value || 'N/A',
            desc: libraryMatch?.desc || 'Cargado mediante configuración externa.',
            apiSource: w.apiSource || 'Sin conectar',
            refresh: w.refresh || 'Hourly',
            roles: w.roles || ['CDO']
          };
        });

        setLayoutWidgets(rebuilt);
        if (parsed.theme) setSelectedTheme(parsed.theme);
        if (parsed.refresh_global) setGlobalRefresh(parsed.refresh_global);
        
        setIsJsonModalOpen(false);
        alert('✅ Tablero importado correctamente desde el JSON.');
      } else {
        alert('⚠️ Estructura JSON no válida. Debe contener una lista de widgets.');
      }
    } catch (e: any) {
      alert(`❌ Error al analizar el JSON: ${e.message}`);
    }
  };

  // Load Template configuration
  const loadTemplatePreset = (templateId: string) => {
    let presetWidgets: Widget[] = [];
    if (templateId === 'calidad') {
      presetWidgets = [
        initialLibraryWidgets[0], // Calidad RUT
        initialLibraryWidgets[4], // Grafo Linaje
        initialLibraryWidgets[6]  // Prediccion Anomalias
      ];
    } else if (templateId === 'seguridad') {
      presetWidgets = [
        initialLibraryWidgets[2], // Riesgos Criticos
        initialLibraryWidgets[1], // Cumplimiento
        initialLibraryWidgets[7]  // Resumen Ejecutivo IA
      ];
    } else if (templateId === 'cumplimiento') {
      presetWidgets = [
        initialLibraryWidgets[1], // Cumplimiento
        initialLibraryWidgets[3], // Madurez
        initialLibraryWidgets[5]  // Sankey de Procesos
      ];
    } else if (templateId === 'ia') {
      presetWidgets = [
        initialLibraryWidgets[6], // Prediccion Anomalias
        initialLibraryWidgets[7]  // Resumen Ejecutivo IA
      ];
    }

    // Set layout
    setLayoutWidgets(presetWidgets.map((w, index) => ({ ...w, id: `w-${templateId}-${index}` })));
    alert(`🎉 Plantilla de "${templateId.toUpperCase()}" cargada exitosamente.`);
  };

  // Clone active layout version
  const handleCloneConfig = () => {
    setBuilderVersion(`v1.0.5 (Draft - Copia de ${builderVersion.split(' ')[0]})`);
    alert('👥 Layout clonado. Ahora trabajando en un borrador v1.0.5.');
  };

  // Save changes action
  const handleSaveChanges = () => {
    alert(`💾 Configuración de tablero guardada para ${currentTenant?.name || 'la organización'} en Supabase.`);
  };

  // Switch size utility helper
  const sizeClass = (size: string) => {
    if (size === 'small') return 'col-span-3';
    if (size === 'medium') return 'col-span-6';
    return 'col-span-12';
  };

  // Theme canvas variable selector helper
  const getThemeClass = () => {
    if (selectedTheme === 'execDark') return styles.themeExecDark;
    if (selectedTheme === 'corpBlue') return styles.themeCorpBlue;
    if (selectedTheme === 'neon') return styles.themeNeon;
    if (selectedTheme === 'glass') return styles.themeGlassmorphism;
    if (selectedTheme === 'minimal') return styles.themeMinimalAI;
    return '';
  };

  return (
    <div className={styles.container}>
      {/* Left panel: Config, Widget library and themes */}
      <aside className={styles.sidebarPanel}>
        <div className={styles.panelHeader}>
          <h2>
            <Sliders size={20} className="text-blue-700" />
            Configuración Visual
          </h2>
          <p>Personaliza y edita los componentes del tablero.</p>
        </div>

        <div className={styles.panelTabs}>
          <button 
            className={`${styles.tabBtn} ${activeTab === 'widgets' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('widgets')}
          >
            <LayoutGrid size={14} /> Widgets
          </button>
          <button 
            className={`${styles.tabBtn} ${activeTab === 'themes' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('themes')}
          >
            <Palette size={14} /> Temas
          </button>
          <button 
            className={`${styles.tabBtn} ${activeTab === 'settings' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <SlidersHorizontal size={14} /> Global
          </button>
        </div>

        <div className={styles.tabContent}>
          {/* Tab 1: Library of widgets */}
          {activeTab === 'widgets' && (
            <div className="flex flex-col gap-6">
              <div>
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Biblioteca de Widgets</h3>
                <p className="text-xs text-slate-500 mb-4">Haz clic sobre un widget para agregarlo al lienzo de diseño.</p>
                
                <div className="flex flex-col gap-3">
                  {initialLibraryWidgets.map(widget => (
                    <div 
                      key={widget.id}
                      className={styles.libraryItem}
                      onClick={() => addWidgetToLayout(widget)}
                    >
                      <div className={styles.libraryIcon}>
                        <widget.icon size={18} />
                      </div>
                      <div className={styles.libraryInfo}>
                        <h4>{widget.name}</h4>
                        <p>{widget.desc}</p>
                      </div>
                      <span className={styles.addBadge}>
                        <Plus size={10} style={{ display: 'inline', marginRight: '2px' }} />
                        Añadir
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Theme settings */}
          {activeTab === 'themes' && (
            <div className="flex flex-col gap-6">
              <div>
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Estilos Preestablecidos</h3>
                <div className="grid grid-cols-2 gap-3">
                  {(['glass', 'execDark', 'corpBlue', 'neon', 'minimal'] as const).map(th => {
                    const label = {
                      glass: 'Modern Glass',
                      execDark: 'Exec Dark',
                      corpBlue: 'Corp Blue',
                      neon: 'Neon Tech',
                      minimal: 'Minimal AI'
                    }[th];

                    const previewBg = {
                      glass: 'linear-gradient(135deg, #e0e7ff 0%, #ede9fe 100%)',
                      execDark: '#0b0f19',
                      corpBlue: '#f0f4f8',
                      neon: '#020617',
                      minimal: '#fafafa'
                    }[th];

                    return (
                      <div 
                        key={th}
                        className={`${styles.themeCard} ${selectedTheme === th ? styles.activeTheme : ''}`}
                        onClick={() => setSelectedTheme(th)}
                      >
                        <div className={styles.themePreview} style={{ background: previewBg }}>
                          <div style={{ width: '12px', height: '100%', background: 'rgba(255,255,255,0.08)', borderRight: '1px solid rgba(0,0,0,0.05)' }}></div>
                        </div>
                        <span className="text-xs font-bold text-center block text-slate-700">{label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Slider modifiers */}
              <div className="flex flex-col gap-5 border-t border-slate-100 pt-5">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Ajustes Finos de Estilo</h3>

                <div className={styles.settingGroup}>
                  <div className={styles.settingLabel}>
                    <span>Bordes Redondeados</span>
                    <span>{borderRadius}px</span>
                  </div>
                  <input 
                    type="range" min="0" max="40" 
                    value={borderRadius} 
                    onChange={e => setBorderRadius(Number(e.target.value))} 
                    className={styles.slider}
                  />
                </div>

                <div className={styles.settingGroup}>
                  <div className={styles.settingLabel}>
                    <span>Grosor de Bordes</span>
                    <span>{borderWidth}px</span>
                  </div>
                  <input 
                    type="range" min="0" max="4" 
                    value={borderWidth} 
                    onChange={e => setBorderWidth(Number(e.target.value))} 
                    className={styles.slider}
                  />
                </div>

                <div className={styles.settingGroup}>
                  <div className={styles.settingLabel}>
                    <span>Opacidad de Fondo</span>
                    <span>{cardOpacity}%</span>
                  </div>
                  <input 
                    type="range" min="10" max="100" 
                    value={cardOpacity} 
                    onChange={e => setCardOpacity(Number(e.target.value))} 
                    className={styles.slider}
                  />
                </div>

                <div className={styles.settingGroup}>
                  <div className={styles.settingLabel}>
                    <span>Efecto Blur</span>
                    <span>{blurAmount}px</span>
                  </div>
                  <input 
                    type="range" min="0" max="40" 
                    value={blurAmount} 
                    onChange={e => setBlurAmount(Number(e.target.value))} 
                    className={styles.slider}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Global filters, Visibility rules and DB Sync */}
          {activeTab === 'settings' && (
            <div className="flex flex-col gap-6">
              <div>
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Fuentes Globales</h3>
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-slate-600">Intervalo de Refresco</label>
                    <select 
                      value={globalRefresh}
                      onChange={e => setGlobalRefresh(e.target.value)}
                      className="w-full border border-slate-200 rounded-lg p-2.5 bg-white text-xs font-semibold outline-none"
                    >
                      <option value="Realtime">En tiempo real (Websocket)</option>
                      <option value="Hourly">Cada Hora</option>
                      <option value="Daily">Diario (Cierre de Lote)</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-slate-600">Filtro Temporal Inicial</label>
                    <select className="w-full border border-slate-200 rounded-lg p-2.5 bg-white text-xs font-semibold outline-none">
                      <option>Último Semestre (Q3 - Q4)</option>
                      <option>Último Trimestre</option>
                      <option>Año Fiscal Completo</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Marketplace list of templates */}
              <div className="border-t border-slate-100 pt-5">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Marketplace de Tableros</h3>
                <div className={styles.marketplaceGrid}>
                  {templatesList.map(tmpl => (
                    <div 
                      key={tmpl.id}
                      className={styles.templateItem}
                      onClick={() => loadTemplatePreset(tmpl.id)}
                    >
                      <div className={styles.templateHeader}>
                        <strong>{tmpl.name}</strong>
                        <span 
                          className={styles.templateTag}
                          style={{ backgroundColor: tmpl.bg, color: tmpl.color }}
                        >
                          {tmpl.tag}
                        </span>
                      </div>
                      <p className={styles.templateDesc}>{tmpl.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Center workspace area */}
      <main className={styles.canvasArea}>
        {/* Top Control Bar */}
        <div className={styles.toolbar}>
          <div className={styles.titleArea} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0 }}>
              <LayoutDashboard size={24} />
            </div>
            <div>
              <h1 style={{ margin: 0, marginBottom: '4px', fontSize: '1.8rem' }}>Gestión Inteligente de Tableros</h1>
              <p style={{ margin: 0, color: '#64748b', fontSize: '0.95rem' }}>Personaliza y administra tus paneles analíticos.</p>
            </div>
          </div>

          <div className={styles.toolbarActions}>
            <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
              <span className="text-xs font-bold text-slate-500">Versión:</span>
              <select 
                value={builderVersion} 
                onChange={e => setBuilderVersion(e.target.value)}
                className="bg-transparent border-none text-xs font-black text-slate-700 outline-none cursor-pointer"
              >
                <option value="v1.0.4 (Activa)">v1.0.4 (Activa)</option>
                <option value="v1.0.3">v1.0.3 (Histórico)</option>
                <option value="v1.0.2">v1.0.2 (Histórico)</option>
              </select>
            </div>

            <button 
              onClick={() => setIsJsonModalOpen(true)}
              className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition"
            >
              <Code size={14} /> JSON Config
            </button>

            <button 
              onClick={handleCloneConfig}
              className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition"
            >
              Clonar Versión
            </button>

            <button 
              onClick={() => setIsPreviewOpen(true)}
              className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 transition"
            >
              <Play size={12} fill="white" /> Vista Previa
            </button>

            <button 
              onClick={handleSaveChanges}
              className="bg-blue-800 hover:bg-blue-900 text-white px-5 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 transition"
            >
              <Save size={14} /> Guardar Cambios
            </button>
          </div>
        </div>

        {/* Scrollable blueprint canvas */}
        <div className={styles.workspaceScroll}>
          <div className={`${styles.gridBlueprint} ${getThemeClass()}`}>
            
            {layoutWidgets.length > 0 ? (
              <div className={styles.dropGrid}>
                {layoutWidgets.map(widget => (
                  <div 
                    key={widget.id}
                    className={`${styles.gridCell} ${sizeClass(widget.size)}`}
                    style={{
                      borderRadius: `${borderRadius}px`,
                      borderWidth: `${borderWidth}px`,
                      backgroundColor: selectedTheme === 'glass' ? `rgba(255, 255, 255, ${cardOpacity / 100})` : undefined,
                      backdropFilter: selectedTheme === 'glass' ? `blur(${blurAmount}px)` : undefined,
                    }}
                  >
                    <div className={styles.cellHeader}>
                      <span className={styles.cellTitle}>{widget.name}</span>
                      <div className={styles.cellActions}>
                        <button 
                          className={styles.cellBtn} 
                          onClick={() => setInspectingWidget(widget)}
                          title="Configurar Origen"
                        >
                          <Settings size={13} />
                        </button>
                        <button 
                          className={styles.cellBtn} 
                          onClick={() => removeWidget(widget.id)}
                          title="Eliminar Widget"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                    <div className={styles.cellBody}>
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-slate-100/50 rounded-lg text-blue-900">
                          <widget.icon size={20} />
                        </div>
                        <div>
                          <div className="text-xl font-black">{widget.value}</div>
                          <div className="text-[10px] text-slate-500 font-semibold">{widget.desc}</div>
                        </div>
                      </div>
                      
                      {/* Connection metadata tag */}
                      <div className="flex items-center gap-2 mt-auto text-[9px] font-bold text-slate-400">
                        <span className="bg-slate-100 px-1.5 py-0.5 rounded uppercase">{widget.apiSource}</span>
                        <span>• Refresco: {widget.refresh}</span>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Helper empty slot placeholder */}
                {layoutWidgets.length < 8 && (
                  <div className={`${styles.emptyGridSlot} col-span-3`} style={{ height: '140px' }}>
                    <Plus size={16} style={{ marginRight: '6px' }} /> Soltar aquí
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <LayoutGrid size={48} className="text-slate-300 mb-4" />
                <h3 className="font-extrabold text-slate-700 text-lg">Lienzo Vacío</h3>
                <p className="text-slate-400 text-xs mt-1 max-w-[280px]">Agrega componentes desde la biblioteca de la izquierda para diseñar tu tablero.</p>
              </div>
            )}
          </div>
        </div>

        {/* Collapsible Inspection drawer (Widget settings) */}
        <AnimatePresence>
          {inspectingWidget && (
            <motion.div 
              initial={{ x: 320 }}
              animate={{ x: 0 }}
              exit={{ x: 320 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className={styles.inspectorDrawer}
            >
              <div className={styles.drawerHeader}>
                <h3>Configurar Widget</h3>
                <button className={styles.cellBtn} onClick={() => setInspectingWidget(null)}>
                  <X size={16} />
                </button>
              </div>

              <div className={styles.drawerBody}>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg text-blue-900 border border-slate-100">
                    {inspectingWidget && <inspectingWidget.icon size={20} />}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Nombre</h4>
                    <input 
                      type="text" 
                      value={inspectingWidget.name} 
                      onChange={e => handleUpdateInspectedWidget({ name: e.target.value })}
                      className="border-b border-transparent hover:border-slate-300 focus:border-blue-500 font-bold bg-transparent outline-none text-sm"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Conector API / Fuente</label>
                  <select 
                    value={inspectingWidget.apiSource}
                    onChange={e => handleUpdateInspectedWidget({ apiSource: e.target.value })}
                    className="border border-slate-200 rounded-lg p-2 bg-white text-xs font-bold outline-none"
                  >
                    <option value="PostgreSQL - Prod">PostgreSQL (Core-Database)</option>
                    <option value="SAP ERP Connect">SAP S/4HANA ERP</option>
                    <option value="AWS CloudTrail">AWS Security Logs</option>
                    <option value="Salesforce API">Salesforce CRM API</option>
                    <option value="GovData AI-Agent">GovData AI Engine</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Frecuencia</label>
                  <select 
                    value={inspectingWidget.refresh}
                    onChange={e => handleUpdateInspectedWidget({ refresh: e.target.value as any })}
                    className="border border-slate-200 rounded-lg p-2 bg-white text-xs font-bold outline-none"
                  >
                    <option value="Realtime">Tiempo Real (Websockets)</option>
                    <option value="Hourly">Cada Hora</option>
                    <option value="Daily">Diario</option>
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Permisos de Roles</label>
                  <div className="flex flex-wrap gap-1.5">
                    {['CDO', 'Data Steward', 'Auditor', 'CIO', 'Seguridad'].map(role => {
                      const isChecked = inspectingWidget.roles.includes(role);
                      return (
                        <button
                          key={role}
                          type="button"
                          onClick={() => {
                            const newRoles = isChecked 
                              ? inspectingWidget.roles.filter(r => r !== role) 
                              : [...inspectingWidget.roles, role];
                            handleUpdateInspectedWidget({ roles: newRoles });
                          }}
                          style={{
                            backgroundColor: isChecked ? '#eff6ff' : 'white',
                            borderColor: isChecked ? '#3b82f6' : '#e2e8f0',
                            color: isChecked ? '#1e3a8a' : '#64748b',
                            borderWidth: '1px',
                            borderRadius: '8px',
                            fontSize: '0.65rem',
                            padding: '6px 10px',
                            fontWeight: 800,
                            cursor: 'pointer',
                            transition: 'all 0.15s'
                          }}
                        >
                          {role}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className={styles.drawerFooter}>
                <button 
                  onClick={() => setInspectingWidget(null)}
                  className="w-full bg-slate-900 text-white font-extrabold py-2.5 rounded-xl text-xs hover:bg-slate-800"
                >
                  Confirmar
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Modal: JSON Configuration Viewer */}
      <AnimatePresence>
        {isJsonModalOpen && (
          <div className={styles.modalOverlay} onClick={() => setIsJsonModalOpen(false)}>
            <motion.div 
              className={styles.modalContent}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={e => e.stopPropagation()}
              style={{ maxWidth: '600px' }}
            >
              <div className={styles.modalHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <FileCode size={24} className="text-blue-800" />
                  <h3 style={{ margin: 0 }}>JSON Config - v1.0.4</h3>
                </div>
                <button className={styles.cellBtn} onClick={() => setIsJsonModalOpen(false)}><X size={16} /></button>
              </div>

              <div className={styles.modalBody}>
                <p className="text-xs text-slate-500 mb-3">Copia o edita el esquema JSON del tablero para importarlo o integrarlo en flujos CI/CD.</p>
                <textarea 
                  className={styles.jsonBox}
                  value={jsonText}
                  onChange={e => setJsonText(e.target.value)}
                />
              </div>

              <div className={styles.modalFooter}>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(jsonText);
                    alert('📋 Copiado al portapapeles.');
                  }}
                  className={styles.btnSecondary}
                >
                  <Copy size={12} style={{ display: 'inline', marginRight: '6px' }} />
                  Copiar
                </button>
                <button 
                  onClick={handleImportJson}
                  className={styles.btnPrimary}
                >
                  Importar JSON
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Live Production Preview Modal */}
      <AnimatePresence>
        {isPreviewOpen && (
          <div className={styles.modalOverlay} onClick={() => setIsPreviewOpen(false)}>
            <motion.div 
              className={styles.modalContent}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              style={{ maxWidth: '1050px', width: '90%' }}
            >
              <div className={styles.modalHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Award size={22} className="text-blue-800" />
                  <h3 style={{ margin: 0 }}>Vista Previa en Producción</h3>
                  <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded font-black">Pre-visualización activa</span>
                </div>
                <button className={styles.cellBtn} onClick={() => setIsPreviewOpen(false)}><X size={18} /></button>
              </div>

              <div className={`${styles.modalBody} ${getThemeClass()}`} style={{ backgroundColor: '#f1f5f9', padding: '36px', maxHeight: '550px', overflowY: 'auto' }}>
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-lg font-black">{currentTenant?.name || 'GovData Enterprise'}</h2>
                    <p className="text-xs text-slate-500 font-semibold mt-0.5">Vista corporativa unificada basada en tu configuración.</p>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Version {builderVersion.split(' ')[0]}</span>
                </div>

                <div className="grid grid-cols-12 gap-5">
                  {layoutWidgets.map(widget => (
                    <div 
                      key={widget.id}
                      className={`bg-white border border-slate-200/80 p-5 rounded-2xl flex flex-col justify-between ${sizeClass(widget.size)}`}
                      style={{
                        borderRadius: `${borderRadius}px`,
                        borderWidth: `${borderWidth}px`,
                        backgroundColor: selectedTheme === 'glass' ? `rgba(255, 255, 255, ${cardOpacity / 100})` : undefined,
                        backdropFilter: selectedTheme === 'glass' ? `blur(${blurAmount}px)` : undefined,
                        minHeight: widget.height > 1 ? '240px' : '120px'
                      }}
                    >
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{widget.name}</span>
                        <widget.icon size={16} className="text-blue-900/60" />
                      </div>
                      
                      <div className="my-auto py-2">
                        <div className="text-3xl font-black">{widget.value}</div>
                        <p className="text-xs text-slate-500 font-semibold mt-0.5">{widget.desc}</p>
                      </div>

                      <div className="flex justify-between items-center text-[9px] font-bold text-slate-400 mt-2 border-t border-slate-100 pt-2">
                        <span className="uppercase">{widget.apiSource}</span>
                        <span>{widget.refresh}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button 
                  onClick={() => setIsPreviewOpen(false)}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold px-6 py-2 rounded-xl text-xs"
                >
                  Cerrar Vista Previa
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
