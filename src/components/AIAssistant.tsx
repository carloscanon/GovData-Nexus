'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, X, Send, Bot, Sparkles, MinusCircle, 
  BookOpen, Search, ArrowRight, ShieldCheck, CheckSquare, 
  Activity, GraduationCap, Settings, LayoutGrid 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import styles from './AIAssistant.module.css';

interface Message {
  role: 'bot' | 'user';
  text: string;
  timestamp: string;
}

interface DocArticle {
  category: string;
  title: string;
  content: string;
  tags: string[];
}

const DOCS_DATABASE: DocArticle[] = [
  {
    category: 'Gobernanza y Catálogo',
    title: 'Catálogo de Activos de Información',
    content: 'El Catálogo unifica todas las tablas, APIs, reportes y archivos de la organización. Permite asignar Data Owners (dueños) y Data Stewards (custodios) para asegurar la rendición de cuentas (accountability) sobre cada activo crítico.',
    tags: ['catalogo', 'activos', 'dueño', 'custodio', 'catalog']
  },
  {
    category: 'Gobernanza y Catálogo',
    title: 'Metadata Intelligence',
    content: 'Usa Inteligencia Artificial para perfilar campos y clasificar automáticamente columnas sensibles (ej. PII, correos, documentos de identidad). Permite etiquetar metadatos y aplicar reglas de calidad directamente en la base de datos.',
    tags: ['metadatos', 'inteligencia', 'pii', 'sensible', 'campos', 'metadata']
  },
  {
    category: 'Calidad de Datos',
    title: 'Reglas y SLAs de Calidad',
    content: 'Define reglas de completitud (campos nulos), duplicidad (registros repetidos) y consistencia. El Command Center calcula el promedio general de calidad en base a la ejecución automatizada de estas reglas en las fuentes de datos.',
    tags: ['calidad', 'sla', 'reglas', 'duplicidad', 'scan', 'quality']
  },
  {
    category: 'Calidad de Datos',
    title: 'Motor de Escaneo Automatizado',
    content: 'Permite programar revisiones automáticas (diarias, semanales) en bases de datos conectadas. Al detectar fallas de calidad, reporta incidentes directamente en el flujo de trabajo del equipo de datos.',
    tags: ['escaneo', 'scan', 'motor', 'automatico', 'programar']
  },
  {
    category: 'Políticas y Cumplimiento',
    title: 'Ciclo de Vida de Políticas',
    content: 'El flujo documental permite redactar políticas asistidas por Nexus IA, adjuntar archivos de soporte y avanzar en el ciclo de aprobación (Borrador -> Revisión -> Aprobado/Vigente) con opciones de firma rápida en 1-click.',
    tags: ['politicas', 'ciclo de vida', 'aprobacion', 'firma', 'borrador', 'policies']
  },
  {
    category: 'Políticas y Cumplimiento',
    title: 'Marco Normativo Colombiano (Ley 1581 y 1712)',
    content: 'GovData Nexus viene pre-cargado con controles normativos para Colombia. La Ley 1581 (Protección de Datos Personales) exige auditoría sobre datos PII, consentimiento y seguridad. La Ley 1712 (Transparencia e Información Pública) exige publicación proactiva y estructuración en Datos Abiertos.',
    tags: ['ley 1581', 'ley 1712', 'colombia', 'transparencia', 'proteccion de datos', 'cumplimiento']
  },
  {
    category: 'Seguridad y Riesgos',
    title: 'Gestión de Riesgos de Información',
    content: 'La matriz de riesgos consolida amenazas de seguridad física y lógica (ej: fuga de datos, accesos no autorizados). Cada riesgo debe ligarse a un activo de información, un control activo (como MFA) y una acción de mitigación.',
    tags: ['seguridad', 'riesgos', 'controles', 'mitigacion', 'mfa', 'security']
  },
  {
    category: 'Madurez de Datos',
    title: 'Modelo de Madurez GovData Score',
    content: 'Basado en el modelo DAMA DMBoK, evalúa 6 dimensiones clave del gobierno corporativo. El Command Center muestra la evolución histórica del score global para que la gerencia trace su hoja de ruta (Roadmap).',
    tags: ['madurez', 'score', 'dama', 'evolution', 'evaluacion', 'maturity']
  },
  {
    category: 'General y Plataforma',
    title: 'Personalización de Marca y SaaS',
    content: 'Los administradores pueden modificar los colores primarios y secundarios de su instancia en Ajustes > Branding. Estas configuraciones se almacenan de manera persistente en la base de datos de Supabase para que toda la interfaz adopte la identidad de la organización.',
    tags: ['branding', 'color', 'empresa', 'organizacion', 'personalizacion', 'settings']
  }
];

export default function AIAssistant() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'docs'>('chat');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize chatbot context based on current route
  useEffect(() => {
    let initialGreeting = 'Hola Carlos, soy Nexus AI. ¿En qué puedo ayudarte hoy con el gobierno de tus datos?';
    
    if (pathname.includes('/policies')) {
      initialGreeting = 'Hola Carlos. Veo que estás en el módulo de Políticas. Puedo ayudarte a estructurar una nueva política, a revisar el cumplimiento de las Leyes 1581 y 1712 en Colombia, o a agilizar tu flujo documental.';
    } else if (pathname.includes('/quality')) {
      initialGreeting = 'Hola Carlos. ¿Deseas definir reglas de consistencia de datos, programar un nuevo escaneo, o revisar la evolución de la calidad en tus fuentes?';
    } else if (pathname.includes('/security')) {
      initialGreeting = 'Hola Carlos. Estoy monitoreando la seguridad y riesgos. ¿Deseas asociar controles de mitigación o verificar los logs de incidentes?';
    } else if (pathname.includes('/catalog') || pathname.includes('/metadata')) {
      initialGreeting = 'Hola Carlos. ¿Quieres saber cómo funciona la Metadata Intelligence para detectar datos PII o cómo asignar custodios en tu catálogo?';
    } else if (pathname.includes('/maturity')) {
      initialGreeting = 'Hola Carlos. Estás viendo la madurez organizacional. Puedo explicarte las dimensiones del modelo DAMA o sugerir acciones para subir tu GovData Score.';
    } else if (pathname.includes('/settings')) {
      initialGreeting = 'Hola Carlos. Aquí puedes configurar la plataforma. ¿Necesitas ayuda para sincronizar tu branding corporativo o gestionar los módulos del SaaS?';
    }

    setMessages([
      { role: 'bot', text: initialGreeting, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
    ]);
  }, [pathname]);

  useEffect(() => {
    const handleOpen = () => {
      setIsOpen(true);
      setActiveTab('docs');
    };
    window.addEventListener('open-ai-assistant', handleOpen);
    return () => window.removeEventListener('open-ai-assistant', handleOpen);
  }, []);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  const getPageContextSuggestions = () => {
    if (pathname.includes('/policies')) {
      return ['Ley 1581 Colombia', 'Ley 1712 Colombia', 'Cómo aprobar política'];
    }
    if (pathname.includes('/quality')) {
      return ['Reglas de Calidad', 'Programar escaneo', 'SLAs de datos'];
    }
    if (pathname.includes('/security')) {
      return ['Matriz de Riesgos', 'Mitigar fuga de datos', 'Incidentes activos'];
    }
    if (pathname.includes('/catalog') || pathname.includes('/metadata')) {
      return ['Detectar datos PII', 'Data Owner vs Steward', 'Metadata Inteligente'];
    }
    if (pathname.includes('/maturity')) {
      return ['Modelo DAMA DMBoK', 'Subir GovData Score', 'Dimensiones de madurez'];
    }
    return ['Resumir riesgos', 'Estado de calidad general', 'Cómo personalizar colores'];
  };

  const getAiResponse = (query: string) => {
    const q = query.toLowerCase();
    
    // Custom match responses based on current modules/requests
    if (q.includes('1581') || q.includes('personales') || q.includes('proteccion')) {
      return "La Ley 1581 de 2012 es el Marco General de Protección de Datos Personales en Colombia. En GovData Nexus, aseguramos su cumplimiento auditando las columnas clasificadas como PII (Nombres, Documentos, Correos) en el catálogo de metadatos, y aplicando controles de encriptación y MFA obligatorios para su visualización.";
    }
    if (q.includes('1712') || q.includes('transparencia') || q.includes('publica')) {
      return "La Ley 1712 de 2014 es la Ley de Transparencia y del Derecho de Acceso a la Información Pública Nacional en Colombia. Exige registrar los Activos de Información y el Esquema de Publicación. Puedes usar el módulo de Catálogo de Activos para listar y certificar de manera pública la información que tu entidad debe poner a disposición ciudadana.";
    }
    if (q.includes('aprobar') || q.includes('ciclo') || q.includes('flujo')) {
      return "Para gestionar el ciclo de vida de una política de forma rápida, selecciona la política en la lista, abre 'Gestionar' (botón morado) y utiliza el botón verde 'Aprobar y Publicar Ya (1-Click)'. Esto la moverá directamente al estado final 'Vigente' actualizando la base de datos al instante.";
    }
    if (q.includes('riesgo') || q.includes('mitigar')) {
      return "En el módulo de Seguridad y Riesgos, hemos consolidado una Matriz de Riesgos en línea con el Command Center. Puedes agregar riesgos (como 'Fuga de Datos' o 'SQL Injection'), asociarles un activo del catálogo y un control específico, y definir un responsable del equipo de datos.";
    }
    if (q.includes('calidad') || q.includes('escaneo') || q.includes('scan')) {
      return "El Command Center monitorea la calidad general (actualmente en 87%). Puedes disparar un escaneo automático sobre tus bases de datos, el cual validará reglas de duplicidad y consistencia, levantando incidentes si se viola algún SLA.";
    }
    if (q.includes('color') || q.includes('branding') || q.includes('personalizar') || q.includes('personalizacion')) {
      return "Puedes cambiar los colores corporativos en Ajustes > Branding. Al hacer clic en 'Aplicar Branding', los colores primario y secundario se guardan permanentemente en la tabla `tenant_config` en la base de datos de Supabase para toda la empresa.";
    }
    if (q.includes('dama') || q.includes('madurez') || q.includes('score')) {
      return "El GovData Score evalúa tu madurez organizacional a través de las directrices DAMA. Las 6 dimensiones analizadas son: Gobernanza, Calidad, Arquitectura, Operaciones, Seguridad y Metadata. Puedes visualizar el radar y la evolución histórica en la pantalla de Madurez.";
    }
    if (q.includes('dios') || q.includes('hola') || q.includes('ayuda') || q.includes('quien eres')) {
      return "¡Hola! Soy Nexus AI, tu copiloto inteligente de gobierno de datos. Puedo ayudarte con dudas sobre gobernanza de datos, calidad de información, cumplimiento de leyes de datos en Colombia, mitigación de riesgos de seguridad, o guiarte a través de las características de la plataforma.";
    }

    // Smart search documentation match as fallback
    const match = DOCS_DATABASE.find(doc => 
      doc.tags.some(tag => q.includes(tag)) || doc.title.toLowerCase().includes(q)
    );
    if (match) {
      return `[Nexus Docs - ${match.category}]: ${match.content}`;
    }

    return "Entiendo tu consulta sobre el ecosistema de datos. Puedes consultar más detalles buscando directamente en la pestaña 'Guía y Docs' de este menú de ayuda, o indicarme qué módulo específico (Calidad, Políticas, Riesgos, Catálogo, Madurez) te interesa configurar.";
  };

  const handleSend = (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || isTyping) return;
    
    const userMsg: Message = { 
      role: 'user', 
      text, 
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);
    
    setTimeout(() => {
      const response = getAiResponse(text);
      setMessages(prev => [...prev, { 
        role: 'bot', 
        text: response, 
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
      }]);
      setIsTyping(false);
    }, 1000);
  };

  // Filter docs based on search query
  const filteredDocs = DOCS_DATABASE.filter(doc => 
    doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.tags.some(t => t.includes(searchQuery.toLowerCase()))
  );

  return (
    <div className={styles.wrapper}>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className={styles.chatWindow}
          >
            {/* Header */}
            <div className={styles.header}>
              <div className={styles.headerInfo}>
                <div className={styles.botIcon}>
                  <Bot size={22} className={styles.botSvg} />
                </div>
                <div>
                  <h3>Centro de Ayuda IA</h3>
                  <p>Nexus Copilot & Documentación</p>
                </div>
              </div>
              <button className={styles.closeBtn} onClick={() => setIsOpen(false)}>
                <X size={20} />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className={styles.tabBar}>
              <button 
                className={`${styles.tabLink} ${activeTab === 'chat' ? styles.activeTab : ''}`}
                onClick={() => setActiveTab('chat')}
              >
                <Sparkles size={14} /> Nexus Copilot
              </button>
              <button 
                className={`${styles.tabLink} ${activeTab === 'docs' ? styles.activeTab : ''}`}
                onClick={() => setActiveTab('docs')}
              >
                <BookOpen size={14} /> Guía y Docs
              </button>
            </div>

            {/* Chat Body */}
            {activeTab === 'chat' && (
              <>
                <div className={styles.messages}>
                  {messages.map((msg, i) => (
                    <div key={i} className={`${styles.message} ${styles[msg.role]}`}>
                      <div className={styles.msgHeader}>
                        <span>{msg.role === 'bot' ? 'Nexus AI' : 'Tú'}</span>
                        <span className={styles.time}>{msg.timestamp}</span>
                      </div>
                      <div className={styles.messageBubble}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  {isTyping && (
                    <div className={`${styles.message} ${styles.bot}`}>
                      <div className={styles.messageBubble} style={{ padding: '12px 18px' }}>
                        <div className={styles.typingIndicator}>
                          <span></span>
                          <span></span>
                          <span></span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Footer and Suggestion Pills */}
                <div className={styles.footer}>
                  <div className={styles.suggestions}>
                    {getPageContextSuggestions().map((s, idx) => (
                      <button key={idx} className={styles.suggestBtn} onClick={() => handleSend(s)}>
                        {s} <ArrowRight size={10} style={{ marginLeft: '4px' }} />
                      </button>
                    ))}
                  </div>
                  
                  <div className={styles.inputWrapper}>
                    <input 
                      type="text" 
                      placeholder="Pregunta a la IA sobre gobernanza..." 
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    />
                    <button onClick={() => handleSend()} className={styles.sendBtn} disabled={!input.trim()}>
                      <Send size={18} />
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Documentation Search Body */}
            {activeTab === 'docs' && (
              <div className={styles.docsBody}>
                <div className={styles.searchBox}>
                  <Search size={16} className={styles.searchIcon} />
                  <input 
                    type="text" 
                    placeholder="Buscar guías o módulos..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <button className={styles.clearSearch} onClick={() => setSearchQuery('')}>
                      <X size={14} />
                    </button>
                  )}
                </div>

                <div className={styles.docsList}>
                  {filteredDocs.length > 0 ? (
                    filteredDocs.map((doc, idx) => (
                      <div key={idx} className={styles.docCard}>
                        <div className={styles.docCategory}>
                          {doc.category === 'Calidad de Datos' && <Activity size={12} style={{ color: '#10b981' }} />}
                          {doc.category === 'Gobernanza y Catálogo' && <LayoutGrid size={12} style={{ color: '#6366f1' }} />}
                          {doc.category === 'Políticas y Cumplimiento' && <ShieldCheck size={12} style={{ color: '#ec4899' }} />}
                          {doc.category === 'Seguridad y Riesgos' && <CheckSquare size={12} style={{ color: '#ef4444' }} />}
                          {doc.category === 'Madurez de Datos' && <GraduationCap size={12} style={{ color: '#f59e0b' }} />}
                          {doc.category === 'General y Plataforma' && <Settings size={12} style={{ color: '#64748b' }} />}
                          <span>{doc.category}</span>
                        </div>
                        <h4>{doc.title}</h4>
                        <p>{doc.content}</p>
                        <button className={styles.docActionBtn} onClick={() => {
                          setActiveTab('chat');
                          handleSend(`Explícame en detalle: ${doc.title}`);
                        }}>
                          Preguntar al Copilot <ArrowRight size={12} />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className={styles.emptyDocs}>
                      <Bot size={36} style={{ opacity: 0.3, marginBottom: '8px' }} />
                      <p>No encontré artículos para "{searchQuery}"</p>
                      <button onClick={() => setSearchQuery('')} className={styles.resetSearchBtn}>Ver todo</button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button */}
      <button 
        className={`${styles.toggleBtn} ${isOpen ? styles.active : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Abrir centro de ayuda"
      >
        {isOpen ? <MinusCircle size={30} /> : <MessageSquare size={30} />}
        {!isOpen && (
          <div className={styles.badge}>
            <Sparkles size={11} /> HELP
          </div>
        )}
      </button>
    </div>
  );
}
