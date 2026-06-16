'use client';
// src/app/normativas/components/KnowledgeGraph.tsx

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Normativa } from '../data/normativas-data';

interface GraphNode {
  id: string;
  label: string;
  sublabel?: string;
  x: number;
  y: number;
  r: number;
  color: string;
  glow: string;
  type: 'center' | 'primary' | 'secondary';
  emoji?: string;
}

interface GraphEdge {
  from: string;
  to: string;
  color: string;
  dashed?: boolean;
}

const SATELLITE_NODES = [
  { id: 'requisitos',   label: 'Requisitos',   sublabel: '',   emoji: '📋', color: '#3b82f6', glow: 'rgba(59,130,246,0.5)',  angle: 0   },
  { id: 'controles',    label: 'Controles',    sublabel: '',   emoji: '🛡️', color: '#10b981', glow: 'rgba(16,185,129,0.5)',  angle: 45  },
  { id: 'riesgos',      label: 'Riesgos',      sublabel: '',   emoji: '⚠️', color: '#ef4444', glow: 'rgba(239,68,68,0.5)',   angle: 90  },
  { id: 'auditorias',   label: 'Auditorías',   sublabel: '',   emoji: '🔍', color: '#84cc16', glow: 'rgba(132,204,22,0.5)',  angle: 135 },
  { id: 'evidencias',   label: 'Evidencias',   sublabel: '',   emoji: '📁', color: '#f97316', glow: 'rgba(249,115,22,0.5)',  angle: 180 },
  { id: 'indicadores',  label: 'Indicadores',  sublabel: '',   emoji: '📊', color: '#f59e0b', glow: 'rgba(245,158,11,0.5)',  angle: 225 },
  { id: 'politicas',    label: 'Políticas',    sublabel: '',   emoji: '📜', color: '#8b5cf6', glow: 'rgba(139,92,246,0.5)',  angle: 270 },
  { id: 'procesos',     label: 'Procesos',     sublabel: '',   emoji: '⚙️', color: '#06b6d4', glow: 'rgba(6,182,212,0.5)',   angle: 315 },
];

interface Props {
  norma: Normativa;
  styles: Record<string, string>;
}

export default function KnowledgeGraph({ norma, styles }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [animProgress, setAnimProgress] = useState(0);
  const [dimensions, setDimensions] = useState({ w: 700, h: 460 });

  useEffect(() => {
    const obs = new ResizeObserver((entries) => {
      const el = entries[0]?.contentRect;
      if (el) setDimensions({ w: el.width, h: el.height });
    });
    if (svgRef.current?.parentElement) obs.observe(svgRef.current.parentElement);
    return () => obs.disconnect();
  }, []);

  // Animate on mount
  useEffect(() => {
    setAnimProgress(0);
    const start = Date.now();
    const duration = 800;
    const tick = () => {
      const p = Math.min((Date.now() - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setAnimProgress(eased);
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [norma.id]);

  const cx = dimensions.w / 2;
  const cy = dimensions.h / 2;
  const radius = Math.min(dimensions.w, dimensions.h) * 0.32;
  const centerR = 44;

  // Build nodes
  const centerNode: GraphNode = {
    id: 'center',
    label: norma.nombreCorto,
    sublabel: norma.codigo,
    x: cx, y: cy,
    r: centerR,
    color: norma.colorPrimario,
    glow: `${norma.colorPrimario}80`,
    type: 'center',
    emoji: norma.icono,
  };

  const satCounts: Record<string, string> = {
    requisitos:  `${norma.requisitosCount}`,
    controles:   `${norma.controles.length}`,
    riesgos:     `${norma.riesgos.length}`,
    auditorias:  `${norma.auditoriasCount}`,
    evidencias:  `${norma.checklist.length}`,
    indicadores: `${norma.indicadores.length}`,
    politicas:   `${norma.politicasCount}`,
    procesos:    `${norma.procesosAfectados.length}`,
  };

  const satNodes: GraphNode[] = SATELLITE_NODES.map((sat) => {
    const angle = (sat.angle - 90) * (Math.PI / 180);
    return {
      id: sat.id,
      label: sat.label,
      sublabel: satCounts[sat.id] || '',
      x: cx + radius * Math.cos(angle) * animProgress,
      y: cy + radius * Math.sin(angle) * animProgress,
      r: 30,
      color: sat.color,
      glow: sat.glow,
      type: 'primary',
      emoji: sat.emoji,
    };
  });

  const edges: GraphEdge[] = satNodes.map((n) => ({
    from: 'center',
    to: n.id,
    color: n.color,
    dashed: false,
  }));

  // Related normativas as outer ring
  const relatedNodes: GraphNode[] = norma.normativasRelacionadas.slice(0, 4).map((rel, i) => {
    const angle = ((i * 90 + 22) - 90) * (Math.PI / 180);
    const outerRadius = radius * 1.65;
    return {
      id: `rel_${rel}`,
      label: rel.replace(/-/g, ' ').toUpperCase().slice(0, 8),
      x: cx + outerRadius * Math.cos(angle) * animProgress,
      y: cy + outerRadius * Math.sin(angle) * animProgress,
      r: 22,
      color: '#475569',
      glow: 'rgba(71,85,105,0.4)',
      type: 'secondary',
      emoji: '🔗',
    };
  });

  // Pulse animation for center
  const [pulse, setPulse] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setPulse(p => (p + 1) % 100), 50);
    return () => clearInterval(id);
  }, []);
  const pulseScale = 1 + Math.sin(pulse / 10) * 0.06;

  return (
    <div style={{ position: 'relative', height: '100%' }}>
      <svg
        ref={svgRef}
        className={styles.graphSvg}
        viewBox={`0 0 ${dimensions.w} ${dimensions.h}`}
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* Center gradient */}
          <radialGradient id={`cg_${norma.id}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={norma.colorPrimario} stopOpacity="0.9" />
            <stop offset="100%" stopColor={norma.colorSecundario} stopOpacity="1" />
          </radialGradient>

          {/* Glow filters */}
          <filter id="glow_center" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <filter id="glow_sat" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          {/* Animated dash */}
          <marker id="arrow" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
            <path d="M 0 0 L 6 3 L 0 6 Z" fill="rgba(255,255,255,0.2)" />
          </marker>
        </defs>

        {/* Background grid */}
        <pattern id="grid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(0,0,0,0.03)" strokeWidth="1" />
        </pattern>
        <rect width="100%" height="100%" fill="url(#grid)" />

        {/* Outer ring glow */}
        <circle
          cx={cx} cy={cy}
          r={radius * 1.05 * animProgress}
          fill="none"
          stroke={norma.colorPrimario}
          strokeWidth="1.5"
          strokeOpacity="0.12"
          strokeDasharray="4 8"
        />
        <circle
          cx={cx} cy={cy}
          r={radius * 0.55 * animProgress}
          fill="none"
          stroke={norma.colorPrimario}
          strokeWidth="1.5"
          strokeOpacity="0.08"
        />

        {/* Edges */}
        {edges.map((edge) => {
          const fromNode = edge.from === 'center' ? centerNode : satNodes.find(n => n.id === edge.from);
          const toNode = edge.to === 'center' ? centerNode : satNodes.find(n => n.id === edge.to);
          if (!fromNode || !toNode) return null;
          const isHovered = hoveredNode === edge.to || hoveredNode === edge.from;

          return (
            <line
              key={`${edge.from}-${edge.to}`}
              x1={fromNode.x} y1={fromNode.y}
              x2={toNode.x} y2={toNode.y}
              stroke={edge.color}
              strokeWidth={isHovered ? 2.5 : 1.5}
              strokeOpacity={animProgress * (isHovered ? 0.8 : 0.35)}
              strokeDasharray={isHovered ? 'none' : '3 6'}
              style={{ transition: 'stroke-width 0.2s, stroke-opacity 0.2s' }}
            />
          );
        })}

        {/* Related nodes edges */}
        {relatedNodes.map((rn, i) => {
          const satNode = satNodes[i * 2] || satNodes[0];
          return (
            <line
              key={`rel_edge_${rn.id}`}
              x1={satNode.x} y1={satNode.y}
              x2={rn.x} y2={rn.y}
              stroke="#94a3b8"
              strokeWidth="1"
              strokeOpacity={animProgress * 0.3}
              strokeDasharray="2 6"
            />
          );
        })}

        {/* Related normativa nodes */}
        {relatedNodes.map((node) => (
          <g key={node.id} opacity={animProgress * 0.85}>
            <circle
              cx={node.x} cy={node.y} r={node.r}
              fill="#f8fafc"
              stroke="#cbd5e1"
              strokeWidth="1.5"
            />
            <text
              x={node.x} y={node.y + 1}
              textAnchor="middle" dominantBaseline="middle"
              fontSize="7.5" fill="#475569" fontWeight="700"
            >
              {node.label}
            </text>
          </g>
        ))}

        {/* Satellite nodes */}
        {satNodes.map((node) => {
          const isHovered = hoveredNode === node.id;
          return (
            <g
              key={node.id}
              className={styles.graphNode}
              onMouseEnter={() => setHoveredNode(node.id)}
              onMouseLeave={() => setHoveredNode(null)}
              opacity={animProgress}
              style={{ cursor: 'pointer' }}
            >
              {/* Glow ring */}
              {isHovered && (
                <circle
                  cx={node.x} cy={node.y}
                  r={node.r + 6}
                  fill="none"
                  stroke={node.color}
                  strokeWidth="2"
                  strokeOpacity="0.3"
                />
              )}

              {/* Node circle */}
              <circle
                cx={node.x} cy={node.y} r={node.r}
                fill="#ffffff"
                stroke={node.color}
                strokeWidth={isHovered ? 2.5 : 1.5}
                style={{ transition: 'all 0.2s', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.05))' }}
              />

              {/* Emoji */}
              <text
                x={node.x} y={node.y - 8}
                textAnchor="middle" dominantBaseline="middle"
                fontSize="13"
              >
                {node.emoji}
              </text>

              {/* Label */}
              <text
                x={node.x} y={node.y + 7}
                textAnchor="middle" dominantBaseline="middle"
                fontSize="7.5" fill={isHovered ? node.color : '#475569'}
                fontWeight="700"
                style={{ transition: 'fill 0.2s' }}
              >
                {node.label}
              </text>

              {/* Count */}
              {node.sublabel && (
                <text
                  x={node.x} y={node.y + 17}
                  textAnchor="middle" dominantBaseline="middle"
                  fontSize="9" fill={node.color}
                  fontWeight="800"
                >
                  {node.sublabel}
                </text>
              )}
            </g>
          );
        })}

        {/* Center node */}
        <g>
          {/* Pulse ring */}
          <circle
            cx={cx} cy={cy}
            r={centerR * pulseScale + 12}
            fill="none"
            stroke={norma.colorPrimario}
            strokeWidth="1.5"
            strokeOpacity="0.12"
          />
          <circle
            cx={cx} cy={cy}
            r={centerR * pulseScale + 6}
            fill="none"
            stroke={norma.colorPrimario}
            strokeWidth="1"
            strokeOpacity="0.2"
          />

          {/* Main center */}
          <circle
            cx={cx} cy={cy} r={centerR}
            fill={`url(#cg_${norma.id})`}
            stroke="#ffffff"
            strokeWidth="3"
            style={{ filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.15))' }}
          />
        </g>

        {/* Center label */}
        <text x={cx} y={cy - 8} textAnchor="middle" dominantBaseline="middle" fontSize="18">
          {norma.icono}
        </text>
        <text
          x={cx} y={cy + 9}
          textAnchor="middle" dominantBaseline="middle"
          fontSize="7.5" fill="#ffffff" fontWeight="800"
          style={{ letterSpacing: '0.02em' }}
        >
          {norma.nombreCorto.length > 12 ? norma.nombreCorto.slice(0, 12) + '…' : norma.nombreCorto}
        </text>

        {/* Hovered node tooltip */}
        {hoveredNode && (() => {
          const node = satNodes.find(n => n.id === hoveredNode);
          if (!node) return null;
          const isLeft = node.x < cx;
          const tx = isLeft ? node.x - 60 : node.x + 40;
          const ty = node.y - 30;
          const labelMap: Record<string, string> = {
            requisitos:  `${norma.requisitosCount} artículos`,
            controles:   `${norma.controles.length} controles`,
            riesgos:     `${norma.riesgos.length} riesgos`,
            auditorias:  `${norma.auditoriasCount} hallazgos`,
            evidencias:  `${norma.checklist.length} evidencias`,
            indicadores: `${norma.indicadores.length} KPIs`,
            politicas:   `${norma.politicasCount} políticas`,
            procesos:    `${norma.procesosAfectados.length} procesos`,
          };
          return (
            <g style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.06))' }}>
              <rect
                x={tx} y={ty}
                width="130" height="34"
                rx="6"
                fill="#ffffff"
                stroke={node.color}
                strokeWidth="1.5"
              />
              <text x={tx + 8} y={ty + 12} fontSize="8" fill={node.color} fontWeight="800">
                {node.label}
              </text>
              <text x={tx + 8} y={ty + 24} fontSize="7.5" fill="#64748b" fontWeight="600">
                {labelMap[hoveredNode] || ''}
              </text>
            </g>
          );
        })()}
      </svg>

      {/* Legend */}
      <div className={styles.graphLegend}>
        {SATELLITE_NODES.slice(0, 4).map(sat => (
          <div key={sat.id} className={styles.graphLegendItem}>
            <div className={styles.graphLegendDot} style={{ background: sat.color }} />
            {sat.label}
          </div>
        ))}
      </div>
    </div>
  );
}
