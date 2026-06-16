'use client';
// src/app/normativas/page.tsx

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookMarked, Search, Filter, Plus, X, ChevronRight,
  LayoutGrid, List, BookOpen, Download, ExternalLink,
  Shield, Activity, Brain, AlertTriangle, ClipboardList,
  Layers, Tag, Globe, Lock, Cpu, Building2, ShieldCheck,
  CheckCircle2, XCircle, MinusCircle, ArrowRight, Send,
  BarChart3, FileText, Zap, Eye, MessageSquare, Network,
  RefreshCw, Star, TrendingUp, Award, Info, ChevronDown
} from 'lucide-react';

import styles from './normativas.module.css';
import {
  NORMATIVAS, CATEGORIAS_CONFIG, AI_RESPONSES,
  Normativa, NormaCategoria, NormaTipo, ChecklistItem
} from './data/normativas-data';
import KnowledgeGraph from './components/KnowledgeGraph';
import { usePlatform } from '@/contexts/PlatformContext';
import { supabase } from '@/lib/supabase';

// ─── TYPES ────────────────────────────────────────────────────────────────────
type ViewMode = 'shelf' | 'cards' | 'list';
type DetailTab = 'info' | 'summary' | 'compliance' | 'risks' | 'graph' | 'chat';

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function getComplianceColor(pct: number) {
  if (pct >= 75) return '#10b981';
  if (pct >= 50) return '#f59e0b';
  return '#ef4444';
}

function getEstadoStyle(estado: string): { bg: string; color: string; label: string } {
  switch (estado) {
    case 'vigente':       return { bg: 'rgba(16,185,129,0.15)',  color: '#34d399', label: '● Vigente' };
    case 'desactualizado':return { bg: 'rgba(245,158,11,0.15)',  color: '#fbbf24', label: '● Desactualizado' };
    case 'en_revision':   return { bg: 'rgba(59,130,246,0.15)',  color: '#60a5fa', label: '● En Revisión' };
    case 'derogado':      return { bg: 'rgba(239,68,68,0.15)',   color: '#f87171', label: '● Derogado' };
    default:              return { bg: 'rgba(100,116,139,0.15)', color: '#94a3b8', label: '● Desconocido' };
  }
}

function getTipoColor(tipo: NormaTipo): string {
  const map: Record<string, string> = {
    'Ley': '#f59e0b', 'Decreto': '#f97316', 'Resolución': '#ef4444',
    'Circular': '#8b5cf6', 'Estándar': '#3b82f6', 'Framework': '#10b981',
    'Guía': '#06b6d4', 'Manual': '#84cc16', 'Política': '#ec4899', 'Regulación': '#6366f1',
  };
  return map[tipo] || '#64748b';
}

// ─── CATEGORY FILTER BAR ──────────────────────────────────────────────────────
function CategoryBar({ selected, onChange, styles: s }: {
  selected: NormaCategoria | 'all';
  onChange: (cat: NormaCategoria | 'all') => void;
  styles: Record<string, string>;
}) {
  const cats = Object.entries(CATEGORIAS_CONFIG) as [NormaCategoria, typeof CATEGORIAS_CONFIG[NormaCategoria]][];
  const counts: Record<string, number> = {};
  NORMATIVAS.forEach(n => n.categorias.forEach(c => { counts[c] = (counts[c] || 0) + 1; }));

  return (
    <div className={s.categoryTabs}>
      <button
        className={`${s.catTab} ${selected === 'all' ? s.catTabActive : ''}`}
        style={{ '--cat-color': '#3b82f6', '--cat-color-dim': 'rgba(59,130,246,0.15)' } as React.CSSProperties}
        onClick={() => onChange('all')}
      >
        <div className={s.catDot} />
        Todas ({NORMATIVAS.length})
      </button>
      {cats.map(([cat, cfg]) => (
        <button
          key={cat}
          className={`${s.catTab} ${selected === cat ? s.catTabActive : ''}`}
          style={{ '--cat-color': cfg.color, '--cat-color-dim': `${cfg.color}22` } as React.CSSProperties}
          onClick={() => onChange(cat)}
        >
          <div className={s.catDot} />
          {cfg.emoji} {cat.split(' ').slice(0, 2).join(' ')} {counts[cat] ? `(${counts[cat]})` : ''}
        </button>
      ))}
    </div>
  );
}

// ─── BOOK (shelf view) ────────────────────────────────────────────────────────
function Book({ norma, onClick, s }: { norma: Normativa; onClick: () => void; s: Record<string, string> }) {
  const estadoStyle = getEstadoStyle(norma.estado);
  const cc = getComplianceColor(norma.cumplimientoPct);
  return (
    <div className={s.book} onClick={onClick} role="button" tabIndex={0} onKeyDown={e => e.key === 'Enter' && onClick()}>
      <div
        className={s.bookTooltip}
        style={{ zIndex: 200 }}
      >
        <div className={s.bookTooltipTitle}>{norma.nombreCorto}</div>
        <div className={s.bookTooltipMeta}>{norma.entidadEmisora} · {norma.bandera} {norma.pais}</div>
        <div className={s.bookTooltipMeta} style={{ color: estadoStyle.color }}>{estadoStyle.label}</div>
        <div className={s.bookComplianceBar}>
          <div className={s.bookComplianceFill} style={{ width: `${norma.cumplimientoPct}%`, background: cc }} />
        </div>
        <div style={{ fontSize: '0.6rem', color: '#94a3b8', marginTop: '3px' }}>
          Cumplimiento: {norma.cumplimientoPct}%
        </div>
      </div>

      <div className={s.bookInner}>
        {norma.estado === 'vigente' && (
          <div className={s.bookBadge}><div className={s.bookBadgeDot} /></div>
        )}
        {norma.estado === 'desactualizado' && (
          <div className={`${s.bookBadge} ${s.bookBadgeAlert}`}><div className={s.bookBadgeDot} /></div>
        )}

        <div
          className={s.bookSpine}
          style={{ '--book-color': norma.colorPrimario } as React.CSSProperties}
        >
          <div className={s.bookSpineText}>{norma.nombreCorto}</div>
          <div className={s.bookSpineCode}>{norma.version}</div>
        </div>
      </div>
    </div>
  );
}

// ─── NORMA CARD ───────────────────────────────────────────────────────────────
function NormaCard({ norma, onClick, s }: { norma: Normativa; onClick: () => void; s: Record<string, string> }) {
  const cc = getComplianceColor(norma.cumplimientoPct);
  const tc = getTipoColor(norma.tipo);
  const estadoStyle = getEstadoStyle(norma.estado);

  return (
    <motion.div
      className={s.normaCard}
      style={{ '--card-color': norma.colorPrimario, '--card-color-dim': `${norma.colorPrimario}18` } as React.CSSProperties}
      onClick={onClick}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25 }}
      whileHover={{ y: -4 }}
    >
      <div className={s.cardHeader}>
        <div className={s.cardIcon}>{norma.icono}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className={s.cardTitle}>{norma.nombreCorto}</div>
          <div className={s.cardCode}>{norma.codigo}</div>
        </div>
      </div>

      <div className={s.cardBody}>
        <div className={s.cardMeta}>
          <span
            className={s.cardBadge}
            style={{ background: `${tc}18`, borderColor: `${tc}30`, color: tc }}
          >
            {norma.tipo}
          </span>
          <span className={s.cardBadge}>{norma.bandera} {norma.pais}</span>
          <span className={s.cardBadge} style={{ background: estadoStyle.bg, color: estadoStyle.color, borderColor: 'transparent' }}>
            {estadoStyle.label}
          </span>
        </div>

        <p className={s.cardDescription}>{norma.descripcion}</p>

        <div className={s.cardCompliance}>
          <span className={s.compliancePct} style={{ '--pct-color': cc } as React.CSSProperties}>
            {norma.cumplimientoPct}%
          </span>
          <div className={s.complianceBar}>
            <div
              className={s.complianceFill}
              style={{ width: `${norma.cumplimientoPct}%`, background: `linear-gradient(90deg, ${cc}aa, ${cc})` }}
            />
          </div>
        </div>
      </div>

      <div className={s.cardFooter}>
        <button className={`${s.cardAction} ${s.cardActionPrimary}`} onClick={(e) => { e.stopPropagation(); onClick(); }}>
          <Eye size={11} /> Ver
        </button>
        <button className={s.cardAction} onClick={e => e.stopPropagation()}>
          <ExternalLink size={11} /> Oficial
        </button>
        <button className={s.cardAction} onClick={e => e.stopPropagation()}>
          <MessageSquare size={11} /> Chat IA
        </button>
      </div>
    </motion.div>
  );
}

// ─── LIST ITEM ────────────────────────────────────────────────────────────────
function ListItem({ norma, onClick, s }: { norma: Normativa; onClick: () => void; s: Record<string, string> }) {
  const cc = getComplianceColor(norma.cumplimientoPct);
  const estadoStyle = getEstadoStyle(norma.estado);
  return (
    <motion.div
      className={s.listItem}
      onClick={onClick}
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className={s.listColorDot} style={{ background: `${norma.colorPrimario}20` }}>
        {norma.icono}
      </div>
      <div className={s.listTitle}>
        <span className={s.listNombreCorto}>{norma.nombreCorto}</span>
        <span className={s.listNombre}>{norma.nombre}</span>
      </div>
      <span className={s.listBadge}>{norma.tipo}</span>
      <span className={s.listBadge} style={{ color: estadoStyle.color, background: estadoStyle.bg, borderColor: 'transparent' }}>
        {estadoStyle.label}
      </span>
      <div className={s.listMiniBar}>
        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: cc, minWidth: 36 }}>{norma.cumplimientoPct}%</span>
        <div className={s.complianceBar} style={{ height: 4 }}>
          <div className={s.complianceFill} style={{ width: `${norma.cumplimientoPct}%`, background: cc }} />
        </div>
      </div>
    </motion.div>
  );
}

// ─── COMPLIANCE CHECKLIST ─────────────────────────────────────────────────────
function ComplianceTab({ norma, s, tenantId, connectionId, onUpdateCompliance }: { norma: Normativa; s: Record<string, string>; tenantId: string; connectionId: string | null; onUpdateCompliance?: (pct: number) => void }) {
  const [items, setItems] = useState<ChecklistItem[]>(norma.checklist.map(c => ({ ...c })));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEvaluations = async () => {
      if (!tenantId) return;
      setLoading(true);
      let query = supabase.from('normativas_evaluations').select('checklist_state').eq('tenant_id', tenantId).eq('normativa_id', norma.id);
      if (connectionId) {
        query = query.eq('connection_id', connectionId);
      } else {
        query = query.is('connection_id', null);
      }

      const { data } = await query.maybeSingle();
      if (data && data.checklist_state) {
        setItems(prev => prev.map(it => ({ ...it, estado: data.checklist_state[it.id] || null })));
      } else {
        setItems(norma.checklist.map(c => ({ ...c, estado: null })));
      }
      setLoading(false);
    };
    loadEvaluations();
  }, [tenantId, connectionId, norma.id]);

  const setEstado = async (id: string, estado: ChecklistItem['estado']) => {
    setItems(prev => prev.map(it => it.id === id ? { ...it, estado } : it));
    
    const newItems = items.map(it => it.id === id ? { ...it, estado } : it);
    const stateObj: Record<string, string | null> = {};
    let cCumple = 0, cParcial = 0, cTotal = 0;
    
    newItems.forEach(it => { 
      if(it.estado) stateObj[it.id] = it.estado; 
      if(it.estado && it.estado !== 'no_aplica') {
         cTotal++;
         if (it.estado === 'cumple') cCumple++;
         if (it.estado === 'parcial') cParcial++;
      }
    });

    const newPct = cTotal === 0 ? 0 : Math.round((cCumple * 100 + cParcial * 50) / (cTotal * 100) * 100);

    const payload = {
      tenant_id: tenantId,
      connection_id: connectionId,
      normativa_id: norma.id,
      checklist_state: stateObj,
      cumplimiento_pct: newPct
    };

    await supabase.from('normativas_evaluations').upsert(payload, { onConflict: 'tenant_id, connection_id, normativa_id' });
    if (onUpdateCompliance) onUpdateCompliance(newPct);
  };

  const counts = useMemo(() => {
    const c = { cumple: 0, parcial: 0, no_cumple: 0, no_aplica: 0, pending: 0 };
    items.forEach(it => {
      if (!it.estado) c.pending++;
      else c[it.estado]++;
    });
    return c;
  }, [items]);

  const answered = items.filter(it => it.estado && it.estado !== 'no_aplica').length;
  const cumplimiento = answered === 0 ? 0 : Math.round(
    (counts.cumple * 100 + counts.parcial * 50) /
    (answered * 100) * 100
  );
  const cc = getComplianceColor(cumplimiento);

  return (
    <div>
      <div className={s.complianceHeader}>
        <div className={s.complianceScore}>
          <div className={s.scoreBig} style={{ color: cc }}>{cumplimiento}%</div>
          <div className={s.scoreBreakdown}>
            {[
              { key: 'cumple',    label: 'Cumple',      color: '#10b981' },
              { key: 'parcial',   label: 'Parcialmente', color: '#f59e0b' },
              { key: 'no_cumple', label: 'No Cumple',   color: '#ef4444' },
              { key: 'no_aplica', label: 'No Aplica',   color: '#64748b' },
            ].map(({ key, label, color }) => (
              <div key={key} className={s.scoreBreakdownItem}>
                <div className={s.scoreDot} style={{ background: color }} />
                <span>{counts[key as keyof typeof counts]} {label}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className={s.complianceMeter} style={{ width: 200 }}>
            <div
              className={s.complianceMeterFill}
              style={{ width: `${cumplimiento}%`, background: `linear-gradient(90deg, ${cc}80, ${cc})` }}
            />
          </div>
          <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: 4 }}>
            {items.filter(it => it.estado).length} / {items.length} evaluados
          </div>
        </div>
      </div>

      <div className={s.checklistTitle}>Checklist de Cumplimiento</div>

      {items.map((item, idx) => {
        const isNotCompliant = item.estado === 'no_cumple' || item.estado === 'parcial';
        return (
          <div key={item.id} className={s.checklistItem}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div className={s.checklistDomain}>{item.dominio}</div>
              {isNotCompliant && (
                <button
                  className={s.btnPrimary}
                  style={{ padding: '3px 8px', fontSize: '0.68rem', background: '#dc2626' }}
                  onClick={async () => {
                    // Try to insert a new workflow task in database
                    try {
                      const { supabase } = await import('@/lib/supabase');
                      const email = localStorage.getItem('govdata_user_email') || 'user@company.com';
                      
                      // Only include columns that exist in the workflow_requests schema
                      const newCase = {
                        tenant_id: tenantId,
                        title: `Remediación: ${norma.nombreCorto} — ${item.dominio}`,
                        description: `Creado automáticamente por Biblioteca Inteligente (${email}). Normativa: ${norma.codigo}. Dominio: ${item.dominio}. Regla incumplida: "${item.pregunta}". Se requiere plan de remediación.`,
                        status: 'Pendiente',
                        priority: 'Alta',
                        sla: '72h',
                        sla_status: 'Ok',
                        current_step: 'Evaluación Inicial',
                        timeline: [
                          { step: 'Caso Detectado y Creado', user: `Biblioteca Inteligente (${email})`, date: new Date().toISOString().split('T')[0], status: 'done' },
                          { step: 'Asignación de Responsable', user: 'Pendiente', date: '', status: 'pending' }
                        ]
                      };

                      const { error } = await supabase.from('workflow_requests').insert([newCase]);
                      if (error) {
                        console.error('Workflow insert error:', error);
                        alert(`⚠️ No se pudo guardar en base de datos: ${error.message}`);
                      } else {
                        alert(`✅ Caso de remediación creado en Workflows para:\n"${item.pregunta}"`);
                      }
                    } catch (err) {
                      console.error('Error creating workflow request:', err);
                      alert(`⚠️ Error inesperado al crear el caso de workflow.`);
                    }
                  }}
                >
                  🚨 Crear Caso de Workflow
                </button>
              )}
            </div>
            <div className={s.checklistQuestion}>{idx + 1}. {item.pregunta}</div>
            <div className={s.checklistOptions}>
              {([
                { key: 'cumple',    label: '✅ Cumple',           cls: s.checklistBtnCumple },
                { key: 'parcial',   label: '⚠️ Parcialmente',     cls: s.checklistBtnParcial },
                { key: 'no_cumple', label: '❌ No Cumple',        cls: s.checklistBtnNoCumple },
                { key: 'no_aplica', label: '— No Aplica',         cls: s.checklistBtnNoAplica },
              ] as const).map(({ key, label, cls }) => (
                <button
                  key={key}
                  className={`${s.checklistBtn} ${item.estado === key ? cls : ''}`}
                  onClick={() => setEstado(item.id, key as ChecklistItem['estado'])}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── AI CHAT PANEL ────────────────────────────────────────────────────────────
function AIChatTab({ norma, s }: { norma: Normativa; s: Record<string, string> }) {
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([
    { role: 'ai', text: `¡Hola! Soy el asistente de IA para **${norma.nombreCorto}**. Puedo responder preguntas sobre sus requisitos, controles, riesgos, obligaciones y cumplimiento. ¿En qué te puedo ayudar?` }
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestions = [
    `¿Cuáles son los principales requisitos de ${norma.nombreCorto}?`,
    `¿Qué controles exige ${norma.nombreCorto}?`,
    `¿Cuáles son los riesgos de incumplir ${norma.nombreCorto}?`,
    `¿Qué roles involucra ${norma.nombreCorto}?`,
    `¿Cuáles son las sanciones de ${norma.nombreCorto}?`,
  ];

  const getAIResponse = useCallback((question: string): string => {
    const normaResponses = AI_RESPONSES[norma.id] || AI_RESPONSES.default;
    // Simple keyword matching
    const lq = question.toLowerCase();
    if (lq.includes('control') || lq.includes('control')) {
      return normaResponses[1] || normaResponses[0];
    }
    if (lq.includes('riesgo') || lq.includes('sanción') || lq.includes('multa')) {
      return `**Riesgos y Sanciones de ${norma.nombreCorto}:**\n\n${norma.sanciones}\n\n**Riesgos identificados:**\n${norma.riesgos.map(r => `• ${r.nombre} (Impacto: ${r.impacto})`).join('\n')}`;
    }
    if (lq.includes('rol') || lq.includes('responsable') || lq.includes('quien')) {
      return `**Roles involucrados en ${norma.nombreCorto}:**\n\n${norma.rolesInvolucrados.map(r => `• ${r}`).join('\n')}`;
    }
    if (lq.includes('obligac') || lq.includes('requisi')) {
      return `**Obligaciones principales de ${norma.nombreCorto}:**\n\n${norma.obligaciones.map((o, i) => `${i + 1}. ${o}`).join('\n')}`;
    }
    if (lq.includes('indicador') || lq.includes('kpi') || lq.includes('métrica')) {
      return `**Indicadores clave para ${norma.nombreCorto}:**\n\n${norma.indicadores.map(i => `• ${i}`).join('\n')}`;
    }
    // Default: random from pool
    const randomIdx = Math.floor(Math.random() * normaResponses.length);
    return normaResponses[randomIdx];
  }, [norma]);

  const sendMessage = useCallback((text: string) => {
    if (!text.trim()) return;
    const userMsg = { role: 'user' as const, text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setTyping(true);
    setTimeout(() => {
      const response = getAIResponse(text);
      setMessages(prev => [...prev, { role: 'ai', text: response }]);
      setTyping(false);
    }, 900 + Math.random() * 600);
  }, [getAIResponse]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const renderText = (text: string) => {
    // Simple markdown bold
    return text.split('\n').map((line, i) => (
      <div key={i} style={{ marginBottom: line === '' ? '0.5rem' : 0 }}>
        {line.split(/\*\*(.*?)\*\*/g).map((part, j) =>
          j % 2 === 1 ? <strong key={j} style={{ color: '#fff' }}>{part}</strong> : part
        )}
      </div>
    ));
  };

  return (
    <div className={s.chatContainer} style={{ height: '520px' }}>
      <div className={s.chatMessages}>
        {messages.map((msg, i) => (
          <div key={i} className={`${s.chatMessage} ${msg.role === 'user' ? s.chatMessageUser : ''}`}>
            <div className={`${s.chatAvatar} ${msg.role === 'ai' ? s.chatAvatarAI : s.chatAvatarUser}`}>
              {msg.role === 'ai' ? '🤖' : '👤'}
            </div>
            <div className={`${s.chatBubble} ${msg.role === 'ai' ? s.chatBubbleAI : s.chatBubbleUser}`}>
              {renderText(msg.text)}
            </div>
          </div>
        ))}

        {typing && (
          <div className={s.chatMessage}>
            <div className={`${s.chatAvatar} ${s.chatAvatarAI}`}>🤖</div>
            <div className={`${s.chatBubble} ${s.chatBubbleAI}`}>
              <div className={s.typingDots}>
                <span /><span /><span />
              </div>
            </div>
          </div>
        )}

        {messages.length === 1 && (
          <div className={s.chatSuggestions}>
            <div className={s.chatSuggestionTitle}>Preguntas sugeridas</div>
            {suggestions.map((sug, i) => (
              <button key={i} className={s.chatSuggestionBtn} onClick={() => sendMessage(sug)}>
                {sug}
              </button>
            ))}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className={s.chatInputArea}>
        <textarea
          className={s.chatInput}
          rows={2}
          placeholder={`Pregunta sobre ${norma.nombreCorto}…`}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              sendMessage(input);
            }
          }}
        />
        <button className={s.chatSend} onClick={() => sendMessage(input)}>
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}

// ─── DETAIL PANEL ─────────────────────────────────────────────────────────────
function DetailPanel({ norma, onClose, styles: s, connectionId, onUpdateCompliance }: { norma: Normativa; onClose: () => void; styles: Record<string, string>; connectionId: string | null; onUpdateCompliance?: (pct: number) => void }) {
  const { currentTenant } = usePlatform();
  const [tab, setTab] = useState<DetailTab>('info');
  const cc = getComplianceColor(norma.cumplimientoPct);
  const tc = getTipoColor(norma.tipo);
  const estadoStyle = getEstadoStyle(norma.estado);

  const tabs: { id: DetailTab; label: string; icon: React.ReactNode }[] = [
    { id: 'info',       label: 'Información',  icon: <Info size={13} /> },
    { id: 'summary',    label: 'Resumen IA',   icon: <Brain size={13} /> },
    { id: 'compliance', label: 'Cumplimiento', icon: <CheckCircle2 size={13} /> },
    { id: 'risks',      label: 'Riesgos',      icon: <AlertTriangle size={13} /> },
    { id: 'graph',      label: 'Knowledge Map',icon: <Network size={13} /> },
    { id: 'chat',       label: 'Chat IA',      icon: <MessageSquare size={13} /> },
  ];

  return (
    <>
      <motion.div
        className={s.detailOverlay}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.div
        className={`${s.detailPanel} ${s.animSlideInRight}`}
        style={{ '--detail-color': norma.colorPrimario, '--detail-bg': `${norma.colorPrimario}18` } as React.CSSProperties}
        initial={{ x: '100%', opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
      >
        {/* Header */}
        <div className={s.detailHeader}>
          <div className={s.detailHeaderTop}>
            <div className={s.detailTitleBlock}>
              <div className={s.detailIconLarge}>{norma.icono}</div>
              <div>
                <div className={s.detailNombreCorto}>{norma.nombreCorto}</div>
                <div className={s.detailCodigo}>{norma.codigo} · v{norma.version}</div>
              </div>
            </div>
            <button className={s.closeBtn} onClick={onClose} aria-label="Cerrar">
              <X size={16} />
            </button>
          </div>

          <div className={s.detailBadges} style={{ marginBottom: '0.875rem' }}>
            <span className={s.detailBadge} style={{ background: `${tc}18`, color: tc, border: `1px solid ${tc}40` }}>
              {norma.tipo}
            </span>
            <span className={s.detailBadge} style={{ background: estadoStyle.bg, color: estadoStyle.color, border: 'none' }}>
              {estadoStyle.label}
            </span>
            <span className={s.detailBadge} style={{ background: 'rgba(255,255,255,0.04)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.06)' }}>
              {norma.bandera} {norma.pais}
            </span>
            <span className={s.detailBadge} style={{ background: 'rgba(255,255,255,0.04)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.06)' }}>
              📅 {norma.fechaVigencia}
            </span>
          </div>

          <div className={s.detailComplianceStrip}>
            <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700 }}>CUMPLIMIENTO</span>
            <div className={s.complianceMeter}>
              <div
                className={s.complianceMeterFill}
                style={{ width: `${norma.cumplimientoPct}%`, background: `linear-gradient(90deg, ${cc}80, ${cc})` }}
              />
            </div>
            <span style={{ fontSize: '1.1rem', fontWeight: 900, color: cc }}>{norma.cumplimientoPct}%</span>
            <a href={norma.urlOficial} target="_blank" rel="noopener noreferrer">
              <button className={s.btnSecondary} style={{ padding: '4px 10px', fontSize: '0.7rem' }}>
                <ExternalLink size={11} /> Oficial
              </button>
            </a>
          </div>
        </div>

        {/* Tabs */}
        <div className={s.detailTabs}>
          {tabs.map(t => (
            <button
              key={t.id}
              className={`${s.detailTab} ${tab === t.id ? s.detailTabActive : ''}`}
              onClick={() => setTab(t.id)}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className={s.detailBody}>
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
            >
              {/* INFO TAB */}
              {tab === 'info' && (
                <div>
                  <div className={s.infoGrid}>
                    {[
                      { label: 'Código', value: norma.codigo },
                      { label: 'Versión', value: norma.version },
                      { label: 'Tipo', value: norma.tipo },
                      { label: 'Entidad Emisora', value: norma.entidadEmisora },
                      { label: 'País', value: `${norma.bandera} ${norma.pais}` },
                      { label: 'Publicación', value: norma.fechaPublicacion },
                      { label: 'Vigencia', value: norma.fechaVigencia },
                      { label: 'Estado', value: estadoStyle.label, valueColor: estadoStyle.color },
                    ].map(f => (
                      <div key={f.label} className={s.infoField}>
                        <div className={s.infoFieldLabel}>{f.label}</div>
                        <div className={s.infoFieldValue} style={{ color: (f as any).valueColor || undefined }}>
                          {f.value}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className={s.infoSection}>
                    <div className={s.infoSectionTitle}><FileText size={13} /> Descripción</div>
                    <p style={{ fontSize: '0.83rem', color: '#94a3b8', lineHeight: 1.65 }}>{norma.descripcion}</p>
                  </div>

                  <div className={s.infoSection}>
                    <div className={s.infoSectionTitle}><CheckCircle2 size={13} /> Obligaciones Principales</div>
                    <div className={s.obligList}>
                      {norma.obligaciones.map((o, i) => (
                        <div key={i} className={s.obligItem}>
                          <div className={s.obligDot} />
                          {o}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className={s.infoSection}>
                    <div className={s.infoSectionTitle}><Tag size={13} /> Palabras Clave</div>
                    <div className={s.tagCloud}>
                      {norma.palabrasClave.map(kw => (
                        <span key={kw} className={s.tag}>{kw}</span>
                      ))}
                    </div>
                  </div>

                  <div className={s.infoSection}>
                    <div className={s.infoSectionTitle}><Activity size={13} /> Historial de Versiones</div>
                    {norma.versiones.map((v, i) => (
                      <div key={i} style={{
                        display: 'flex', gap: '1rem', padding: '0.75rem',
                        background: 'rgba(255,255,255,0.02)', borderRadius: 8,
                        marginBottom: '0.5rem', border: '1px solid rgba(255,255,255,0.04)'
                      }}>
                        <div style={{ minWidth: 60, fontWeight: 800, fontSize: '0.78rem', color: norma.colorPrimario }}>
                          v{v.version}
                        </div>
                        <div>
                          <div style={{ fontSize: '0.72rem', color: '#64748b', marginBottom: 2 }}>{v.fecha} · {v.responsable}</div>
                          <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{v.cambios}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SUMMARY (AI) TAB */}
              {tab === 'summary' && (
                <div>
                  <div className={s.aiBadge}>
                    <Brain size={12} /> Generado con IA · {norma.nombreCorto}
                  </div>

                  {[
                    { title: '📋 Resumen Ejecutivo', content: norma.resumenEjecutivo },
                    { title: '🎯 Objetivo', content: norma.objetivo },
                    { title: '🌐 Alcance', content: norma.alcance },
                    { title: '⚖️ Sanciones y Consecuencias', content: norma.sanciones },
                  ].map(card => (
                    <div key={card.title} className={s.summaryCard}>
                      <div className={s.summaryCardTitle}>{card.title}</div>
                      <p className={s.summaryText}>{card.content}</p>
                    </div>
                  ))}

                  <div className={s.summaryCard}>
                    <div className={s.summaryCardTitle}>👥 Roles Involucrados</div>
                    <div className={s.rolesGrid}>
                      {norma.rolesInvolucrados.map(r => (
                        <span key={r} className={s.roleChip}>{r}</span>
                      ))}
                    </div>
                  </div>

                  <div className={s.summaryCard}>
                    <div className={s.summaryCardTitle}>📊 Indicadores Clave</div>
                    <div className={s.obligList}>
                      {norma.indicadores.map((ind, i) => (
                        <div key={i} className={s.obligItem}>
                          <div className={s.obligDot} style={{ background: norma.colorPrimario }} />
                          {ind}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className={s.summaryCard}>
                    <div className={s.summaryCardTitle}>⚙️ Procesos Afectados</div>
                    <div className={s.tagCloud}>
                      {norma.procesosAfectados.map(p => (
                        <span key={p} className={s.tag} style={{ borderColor: `${norma.colorPrimario}30`, color: norma.colorPrimario }}>
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* COMPLIANCE TAB */}
              {tab === 'compliance' && <ComplianceTab norma={norma} s={s} tenantId={currentTenant?.id || ''} connectionId={connectionId} onUpdateCompliance={onUpdateCompliance} />}

              {/* RISKS TAB */}
              {tab === 'risks' && (
                <div>
                  <div className={s.infoSectionTitle} style={{ marginBottom: '1rem' }}>
                    <AlertTriangle size={13} /> Riesgos Asociados
                  </div>
                  <div className={s.risksGrid}>
                    {norma.riesgos.map(r => {
                      const impactColor = r.impacto === 'Alto' ? '#ef4444' : r.impacto === 'Medio' ? '#f59e0b' : '#10b981';
                      const probColor = r.probabilidad === 'Alta' ? '#ef4444' : r.probabilidad === 'Media' ? '#f59e0b' : '#10b981';
                      return (
                        <div key={r.id} className={s.riskCard} style={{ '--risk-border': impactColor } as React.CSSProperties}>
                          <div className={s.riskTitle}>{r.nombre}</div>
                          <div className={s.riskMeta}>
                            <span className={s.riskBadge} style={{ background: `${impactColor}30`, color: impactColor }}>
                              Impacto: {r.impacto}
                            </span>
                            <span className={s.riskBadge} style={{ background: `${probColor}30`, color: probColor }}>
                              Probabilidad: {r.probabilidad}
                            </span>
                          </div>
                          <div className={s.riskTreatment}>
                            <strong style={{ color: '#cbd5e1' }}>Tratamiento: </strong>
                            {r.tratamiento}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className={s.infoSectionTitle} style={{ margin: '1.5rem 0 1rem' }}>
                    <ShieldCheck size={13} /> Controles
                  </div>
                  <div className={s.controlsGrid}>
                    {norma.controles.map(c => (
                      <div key={c.id} className={s.controlCard}>
                        <div className={s.controlName}>{c.nombre}</div>
                        <span className={s.controlMini}>{c.tipo}</span>
                        <span className={s.controlMini}>{c.frecuencia}</span>
                        <span className={s.controlMini}>{c.responsable}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* GRAPH TAB */}
              {tab === 'graph' && (
                <div>
                  <div className={s.aiBadge} style={{ marginBottom: '1rem' }}>
                    <Network size={12} /> Compliance Knowledge Graph · {norma.nombreCorto}
                  </div>
                  <p style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '1rem', lineHeight: 1.5 }}>
                    Mapa visual de todos los elementos conectados a esta normativa. Pasa el cursor sobre los nodos para ver detalles.
                  </p>
                  <div className={s.graphContainer}>
                    <KnowledgeGraph norma={norma} styles={s} />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', marginTop: '1rem' }}>
                    {[
                      { label: 'Requisitos', value: norma.requisitosCount, color: '#3b82f6', emoji: '📋' },
                      { label: 'Controles', value: norma.controles.length, color: '#10b981', emoji: '🛡️' },
                      { label: 'Riesgos', value: norma.riesgos.length, color: '#ef4444', emoji: '⚠️' },
                      { label: 'Indicadores', value: norma.indicadores.length, color: '#f59e0b', emoji: '📊' },
                    ].map(item => (
                      <div key={item.label} style={{
                        background: `${item.color}10`, border: `1px solid ${item.color}25`,
                        borderRadius: 10, padding: '0.875rem', textAlign: 'center'
                      }}>
                        <div style={{ fontSize: '1.25rem', marginBottom: 4 }}>{item.emoji}</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 900, color: item.color }}>{item.value}</div>
                        <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600 }}>{item.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CHAT TAB */}
              {tab === 'chat' && <AIChatTab norma={norma} s={s} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </>
  );
}

// ─── NEW NORMA FORM ────────────────────────────────────────────────────────────
function NormaForm({ onClose, s }: { onClose: () => void; s: Record<string, string> }) {
  return (
    <div className={s.formOverlay} onClick={onClose}>
      <motion.div
        className={s.formModal}
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        onClick={e => e.stopPropagation()}
      >
        <div className={s.formHeader}>
          <span className={s.formTitle}>➕ Nueva Normativa</span>
          <button className={s.closeBtn} onClick={onClose}><X size={16} /></button>
        </div>
        <div className={s.formBody}>
          <div className={s.formRow}>
            <div className={s.formField}>
              <label className={s.formLabel}>Código *</label>
              <input className={s.formInput} placeholder="Ej: ISO-8000" />
            </div>
            <div className={s.formField}>
              <label className={s.formLabel}>Versión</label>
              <input className={s.formInput} placeholder="Ej: 2022" />
            </div>
          </div>
          <div className={s.formField}>
            <label className={s.formLabel}>Nombre Completo *</label>
            <input className={s.formInput} placeholder="Nombre oficial de la normativa" />
          </div>
          <div className={s.formField}>
            <label className={s.formLabel}>Nombre Corto *</label>
            <input className={s.formInput} placeholder="Ej: ISO 8000" />
          </div>
          <div className={s.formRow}>
            <div className={s.formField}>
              <label className={s.formLabel}>Tipo *</label>
              <select className={s.formSelect}>
                {['Ley', 'Decreto', 'Resolución', 'Circular', 'Estándar', 'Framework', 'Guía', 'Manual', 'Política', 'Regulación'].map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div className={s.formField}>
              <label className={s.formLabel}>Categoría *</label>
              <select className={s.formSelect}>
                {Object.keys(CATEGORIAS_CONFIG).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className={s.formRow}>
            <div className={s.formField}>
              <label className={s.formLabel}>Entidad Emisora</label>
              <input className={s.formInput} placeholder="Ej: ISO / IEC" />
            </div>
            <div className={s.formField}>
              <label className={s.formLabel}>País</label>
              <input className={s.formInput} placeholder="Ej: Internacional" />
            </div>
          </div>
          <div className={s.formRow}>
            <div className={s.formField}>
              <label className={s.formLabel}>Fecha Publicación</label>
              <input className={s.formInput} type="date" />
            </div>
            <div className={s.formField}>
              <label className={s.formLabel}>Estado</label>
              <select className={s.formSelect}>
                <option value="vigente">Vigente</option>
                <option value="desactualizado">Desactualizado</option>
                <option value="en_revision">En Revisión</option>
                <option value="derogado">Derogado</option>
              </select>
            </div>
          </div>
          <div className={s.formField}>
            <label className={s.formLabel}>Descripción</label>
            <textarea className={s.formTextarea} placeholder="Descripción general de la normativa…" rows={3} />
          </div>
          <div className={s.formField}>
            <label className={s.formLabel}>URL Oficial</label>
            <input className={s.formInput} type="url" placeholder="https://…" />
          </div>
          <div className={s.formField}>
            <label className={s.formLabel}>Palabras Clave</label>
            <input className={s.formInput} placeholder="separadas por coma: ISO, datos, calidad" />
          </div>
        </div>
        <div className={s.formFooter}>
          <button className={s.btnSecondary} onClick={onClose}>Cancelar</button>
          <button className={s.btnPrimary} onClick={onClose}>
            <Plus size={14} /> Guardar Normativa
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── SHELF VIEW ───────────────────────────────────────────────────────────────
function ShelfView({ normativas, onSelect, s }: { normativas: Normativa[]; onSelect: (n: Normativa) => void; s: Record<string, string> }) {
  const grouped = useMemo(() => {
    const map = new Map<NormaCategoria, Normativa[]>();
    normativas.forEach(n => {
      const cat = n.categoria;
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(n);
    });
    return map;
  }, [normativas]);

  if (grouped.size === 0) return (
    <div className={s.emptyState}>
      <div className={s.emptyIcon}>📚</div>
      <div className={s.emptyText}>No se encontraron normativas</div>
      <div className={s.emptySubtext}>Intenta ajustar los filtros de búsqueda</div>
    </div>
  );

  return (
    <div className={s.shelfContainer}>
      {Array.from(grouped.entries()).map(([cat, norms]) => {
        const cfg = CATEGORIAS_CONFIG[cat];
        return (
          <div key={cat} className={s.shelfSection}>
            <div className={s.shelfLabel} style={{ '--cat-color': cfg.color } as React.CSSProperties}>
              <div className={s.shelfLabelDot} />
              {cfg.emoji} {cat}
              <span style={{ marginLeft: 4, opacity: 0.5 }}>({norms.length})</span>
              <div className={s.shelfLabelLine} />
            </div>
            <div className={s.shelf}>
              {norms.map(n => <Book key={n.id} norma={n} onClick={() => onSelect(n)} s={s} />)}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function NormativasPage() {
  const { currentTenant } = usePlatform();
  const [connections, setConnections] = useState<any[]>([]);
  const [selectedConnectionId, setSelectedConnectionId] = useState<string | null>(null);
  const [evaluationsMap, setEvaluationsMap] = useState<Record<string, number>>({});
  const [view, setView] = useState<ViewMode>('shelf');
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState<NormaCategoria | 'all'>('all');
  const [tipoFilter, setTipoFilter] = useState<NormaTipo | 'all'>('all');
  const [estadoFilter, setEstadoFilter] = useState<'all' | 'vigente' | 'desactualizado' | 'en_revision'>('all');
  const [selectedNorma, setSelectedNorma] = useState<Normativa | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (!currentTenant?.id) return;
    const fetchConnections = async () => {
      const { data } = await supabase.from('data_connections').select('id, name').eq('tenant_id', currentTenant.id);
      if (data) {
        setConnections(data);
        if (data.length > 0) setSelectedConnectionId(data[0].id);
      }
    };
    fetchConnections();
  }, [currentTenant?.id]);

  useEffect(() => {
    if (!currentTenant?.id) return;
    const loadStats = async () => {
      let q = supabase.from('normativas_evaluations').select('normativa_id, cumplimiento_pct').eq('tenant_id', currentTenant.id);
      if (selectedConnectionId) q = q.eq('connection_id', selectedConnectionId);
      else q = q.is('connection_id', null);

      const { data } = await q;
      if (data) {
        const map: Record<string, number> = {};
        data.forEach(d => { map[d.normativa_id] = d.cumplimiento_pct; });
        setEvaluationsMap(map);
      } else {
        setEvaluationsMap({});
      }
    };
    loadStats();
  }, [currentTenant?.id, selectedConnectionId]);

  const dynamicNormativas = useMemo(() => {
    return NORMATIVAS.map(n => ({
      ...n,
      cumplimientoPct: evaluationsMap[n.id] || 0
    }));
  }, [evaluationsMap]);

  const tipos = useMemo(() => [...new Set(dynamicNormativas.map(n => n.tipo))], [dynamicNormativas]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return dynamicNormativas.filter(n => {
      if (catFilter !== 'all' && !n.categorias.includes(catFilter)) return false;
      if (tipoFilter !== 'all' && n.tipo !== tipoFilter) return false;
      if (estadoFilter !== 'all' && n.estado !== estadoFilter) return false;
      if (q && !n.nombre.toLowerCase().includes(q) &&
          !n.nombreCorto.toLowerCase().includes(q) &&
          !n.codigo.toLowerCase().includes(q) &&
          !n.entidadEmisora.toLowerCase().includes(q) &&
          !n.palabrasClave.some(kw => kw.toLowerCase().includes(q))) return false;
      return true;
    });
  }, [search, catFilter, tipoFilter, estadoFilter, dynamicNormativas]);

  // Aggregate stats
  const stats = useMemo(() => ({
    total: dynamicNormativas.length,
    vigentes: dynamicNormativas.filter(n => n.estado === 'vigente').length,
    cumplimientoPromedio: dynamicNormativas.length > 0 ? Math.round(dynamicNormativas.reduce((acc, n) => acc + n.cumplimientoPct, 0) / dynamicNormativas.length) : 0,
    categorias: Object.keys(CATEGORIAS_CONFIG).length,
  }), [dynamicNormativas]);

  return (
    <div className={styles.root}>
      <div className={styles.page}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerTop}>
            <div className={styles.titleBlock}>
              <div className={styles.titleIcon}>
                <BookMarked size={26} color="#fff" />
              </div>
              <div>
                <h1 className={styles.pageTitle}>Biblioteca Inteligente de Normativas</h1>
                <p className={styles.pageSubtitle}>
                  {stats.total} marcos de referencia · {stats.categorias} categorías · {stats.vigentes} vigentes
                </p>
              </div>
            </div>
            <div className={styles.headerActions}>
              {connections.length > 0 && (
                <select 
                  className={styles.filterSelect} 
                  value={selectedConnectionId || ''} 
                  onChange={e => setSelectedConnectionId(e.target.value)}
                  style={{ marginRight: '0.5rem', padding: '0.4rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                  <option value="">Base de Datos (Global)</option>
                  {connections.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              )}
              <button className={styles.btnSecondary} onClick={() => setShowForm(true)}>
                <Plus size={14} /> Nueva Normativa
              </button>
              <button className={styles.btnPrimary}>
                <Download size={14} /> Exportar
              </button>
            </div>
          </div>

          {/* Stats bar */}
          <div className={styles.statsBar}>
            {[
              { label: 'Normativas Total',   value: stats.total,                  icon: <BookMarked size={18} />,  color: '#3b82f6',  bg: 'rgba(59,130,246,0.12)'  },
              { label: 'Vigentes',            value: stats.vigentes,               icon: <CheckCircle2 size={18} />,color: '#10b981',  bg: 'rgba(16,185,129,0.12)'  },
              { label: 'Cumplimiento Prom.',  value: `${stats.cumplimientoPromedio}%`, icon: <TrendingUp size={18} />,  color: '#f59e0b',  bg: 'rgba(245,158,11,0.12)'  },
              { label: 'Categorías',          value: stats.categorias,             icon: <Layers size={18} />,      color: '#8b5cf6',  bg: 'rgba(139,92,246,0.12)'  },
              { label: 'Países Cubiertos',    value: [...new Set(dynamicNormativas.map(n => n.pais))].length, icon: <Globe size={18} />, color: '#06b6d4', bg: 'rgba(6,182,212,0.12)' },
            ].map(stat => (
              <div key={stat.label} className={styles.statCard} style={{ '--stat-color': stat.color, '--stat-bg': stat.bg } as React.CSSProperties}>
                <div className={styles.statIcon}>{stat.icon}</div>
                <div>
                  <div className={styles.statValue}>{stat.value}</div>
                  <div className={styles.statLabel}>{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Toolbar */}
        <div className={styles.toolbar}>
          <div className={styles.searchWrapper}>
            <Search size={15} className={styles.searchIcon} />
            <input
              className={styles.searchInput}
              placeholder="Buscar por nombre, código, entidad, palabras clave…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <select className={styles.filterSelect} value={tipoFilter} onChange={e => setTipoFilter(e.target.value as any)}>
            <option value="all">Todos los tipos</option>
            {tipos.map(t => <option key={t} value={t}>{t}</option>)}
          </select>

          <select className={styles.filterSelect} value={estadoFilter} onChange={e => setEstadoFilter(e.target.value as any)}>
            <option value="all">Todos los estados</option>
            <option value="vigente">Vigente</option>
            <option value="desactualizado">Desactualizado</option>
            <option value="en_revision">En Revisión</option>
          </select>

          <div className={styles.viewToggle}>
            {([
              { key: 'shelf', icon: <BookOpen size={15} />, title: 'Estantería 3D' },
              { key: 'cards', icon: <LayoutGrid size={15} />, title: 'Tarjetas' },
              { key: 'list',  icon: <List size={15} />,       title: 'Lista' },
            ] as const).map(({ key, icon, title }) => (
              <button
                key={key}
                className={`${styles.viewBtn} ${view === key ? styles.viewBtnActive : ''}`}
                title={title}
                onClick={() => setView(key)}
                aria-label={title}
              >
                {icon}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className={styles.content}>
          {/* Category filter */}
          <CategoryBar selected={catFilter} onChange={setCatFilter} styles={styles} />

          {/* Results count */}
          {search || catFilter !== 'all' || tipoFilter !== 'all' || estadoFilter !== 'all' ? (
            <div style={{ marginBottom: '1rem', fontSize: '0.78rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Filter size={12} />
              {filtered.length} resultado{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}
              <button
                style={{ fontSize: '0.72rem', color: '#3b82f6', cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}
                onClick={() => { setSearch(''); setCatFilter('all'); setTipoFilter('all'); setEstadoFilter('all'); }}
              >
                × Limpiar filtros
              </button>
            </div>
          ) : null}

          {/* Views */}
          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {view === 'shelf' && (
                <ShelfView normativas={filtered} onSelect={setSelectedNorma} s={styles} />
              )}

              {view === 'cards' && (
                <div className={styles.cardGrid}>
                  {filtered.map(n => (
                    <NormaCard key={n.id} norma={n} onClick={() => setSelectedNorma(n)} s={styles} />
                  ))}
                  {filtered.length === 0 && (
                    <div className={styles.emptyState} style={{ gridColumn: '1/-1' }}>
                      <div className={styles.emptyIcon}>📚</div>
                      <div className={styles.emptyText}>No se encontraron normativas</div>
                      <div className={styles.emptySubtext}>Ajusta los filtros para ver más resultados</div>
                    </div>
                  )}
                </div>
              )}

              {view === 'list' && (
                <div className={styles.listView}>
                  {/* Header row */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'auto 1fr auto auto auto',
                    gap: '1.25rem',
                    padding: '0.5rem 1.5rem',
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    color: '#475569',
                  }}>
                    <div style={{ width: 36 }} />
                    <div>Normativa</div>
                    <div>Tipo</div>
                    <div>Estado</div>
                    <div>Cumplimiento</div>
                  </div>
                  {filtered.map(n => (
                    <ListItem key={n.id} norma={n} onClick={() => setSelectedNorma(n)} s={styles} />
                  ))}
                  {filtered.length === 0 && (
                    <div className={styles.emptyState}>
                      <div className={styles.emptyIcon}>📚</div>
                      <div className={styles.emptyText}>No se encontraron normativas</div>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Detail Panel */}
        <AnimatePresence>
          {selectedNorma && (
            <DetailPanel
              key={selectedNorma.id}
              norma={dynamicNormativas.find(n => n.id === selectedNorma.id) || selectedNorma}
              onClose={() => setSelectedNorma(null)}
              styles={styles}
              connectionId={selectedConnectionId}
              onUpdateCompliance={(pct) => {
                 setEvaluationsMap(prev => ({ ...prev, [selectedNorma.id]: pct }));
              }}
            />
          )}
        </AnimatePresence>

        {/* New Norma Form */}
        <AnimatePresence>
          {showForm && <NormaForm onClose={() => setShowForm(false)} s={styles} />}
        </AnimatePresence>
      </div>
    </div>
  );
}
