'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HelpCircle,
  Award,
  TrendingUp,
  RotateCcw,
  Sparkles,
  ArrowLeft,
  Calendar,
  Share2,
  Lock,
  CheckCircle,
  Database,
  Play,
  Shield,
  Layers,
  ChevronRight,
  Flame,
  Volume2,
  VolumeX,
  Trophy,
  Activity,
  AlertTriangle
} from 'lucide-react';
import { usePlatform } from '@/contexts/PlatformContext';
import { supabase } from '@/lib/supabase';
import styles from './data-path.module.css';

// Node thematic labels
const THEMATIC_LABELS: Record<number, string> = {
  1: 'Fuente de datos',
  2: 'Calidad',
  3: 'Metadato',
  4: 'Catálogo',
  5: 'Steward',
  6: 'Política',
  7: 'Riesgo',
  8: 'Cumplimiento',
  9: 'Gobierno',
  10: 'Inteligencia Artificial',
  11: 'Auditoría',
  12: 'Linaje',
  13: 'Seguridad PII',
  14: 'Mapeo RACI',
  15: 'Comité de Datos',
  16: 'KPI de Calidad',
  17: 'Workflow de Aprobación',
  18: 'Anonimización',
  19: 'SLA de Atención',
  20: 'Mesa de Incidentes',
  21: 'Glosario Técnico',
  22: 'Diagnóstico DAMA',
  23: 'Datos Maestros',
  24: 'Reglas Regex',
  25: 'Cifrado AES-256',
  26: 'Enmascaramiento',
  27: 'Trazabilidad',
  28: 'Monitoreo Semanal',
  29: 'Reporte Regulatorio',
  30: 'Métricas de Red',
  31: 'Datos Abiertos',
  32: 'Tokenización',
  33: 'Certificación IA',
  34: 'Data Steward Elite',
  35: 'Metadata Master',
  36: 'Nexus Legend'
};

// Seed-based random generator (Lcg)
class SeededRandom {
  private seed: number;
  constructor(seed: number) {
    this.seed = seed;
  }
  next(): number {
    // LCG parameters
    this.seed = (this.seed * 1664525 + 1013904223) % 4294967296;
    return this.seed / 4294967296;
  }
  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min) + min);
  }
}

interface Cell {
  r: number;
  c: number;
}

interface BoardData {
  rows: number;
  cols: number;
  numbers: Record<string, number>; // "r,c" -> number
  maxNumber: number;
  obstacles: Set<string>; // "r,c"
  solutionPath: Cell[];
  seed: number;
}

export default function DataPathChallengePage() {
  const { currentTenant } = usePlatform();
  const [mode, setMode] = useState<'daily' | 'free'>('daily');
  const [size, setSize] = useState<number>(6);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard' | 'expert'>('easy');
  const [board, setBoard] = useState<BoardData | null>(null);
  
  // Gameplay states
  const [playerPath, setPlayerPath] = useState<Cell[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hintsLeft, setHintsLeft] = useState(3);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [timerInterval, setTimerInterval] = useState<any>(null);
  const [gameWon, setGameWon] = useState(false);
  const [score, setScore] = useState(0);
  
  // Stats
  const [streak, setStreak] = useState(0);
  const [hasPlayedToday, setHasPlayedToday] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);

  // Timer effect
  useEffect(() => {
    if (startTime && !gameWon) {
      const interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
      setTimerInterval(interval);
      return () => clearInterval(interval);
    }
  }, [startTime, gameWon]);

  // Generate date seed
  const getDateSeed = useCallback(() => {
    const d = new Date();
    return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
  }, []);

  // Generate board
  const generateBoard = useCallback((gridSize: number, diff: 'easy' | 'medium' | 'hard' | 'expert', useSeed: boolean) => {
    const seedValue = useSeed ? getDateSeed() : Math.floor(Math.random() * 1000000);
    const rng = new SeededRandom(seedValue);
    
    // Set target numbers based on difficulty & size
    let targetNodes = 8;
    let obstacleRatio = 0.1;

    if (diff === 'easy') {
      targetNodes = gridSize === 6 ? 8 : 12;
      obstacleRatio = 0.08;
    } else if (diff === 'medium') {
      targetNodes = gridSize === 6 ? 12 : 16;
      obstacleRatio = 0.12;
    } else if (diff === 'hard') {
      targetNodes = gridSize === 8 ? 22 : 28;
      obstacleRatio = 0.15;
    } else {
      targetNodes = gridSize === 8 ? 28 : 34;
      obstacleRatio = 0.2;
    }

    // Try multiple times to build a valid grid with a Hamiltonian path
    let attempts = 0;
    while (attempts < 100) {
      attempts++;
      const obstacles = new Set<string>();
      
      // Determine obstacle cells
      const totalCells = gridSize * gridSize;
      const targetObstacles = Math.floor(totalCells * obstacleRatio);
      
      // Generate some obstacle cells (avoiding center/corners initially)
      for (let i = 0; i < targetObstacles; i++) {
        const r = rng.nextInt(0, gridSize);
        const c = rng.nextInt(0, gridSize);
        obstacles.add(`${r},${c}`);
      }

      // Generate a path on remaining cells
      const path = findRandomPath(gridSize, obstacles, rng);
      if (path && path.length > targetNodes + 3) {
        // Build final node sequence
        const numbers: Record<string, number> = {};
        const step = Math.floor(path.length / targetNodes);
        
        let nodeIndex = 1;
        for (let i = 0; i < path.length; i++) {
          if (i === 0) {
            numbers[`${path[i].r},${path[i].c}`] = 1;
            nodeIndex++;
          } else if (i === path.length - 1) {
            numbers[`${path[i].r},${path[i].c}`] = targetNodes;
          } else if (i % step === 0 && nodeIndex < targetNodes) {
            numbers[`${path[i].r},${path[i].c}`] = nodeIndex;
            nodeIndex++;
          }
        }

        // Complete board definition
        setBoard({
          rows: gridSize,
          cols: gridSize,
          numbers,
          maxNumber: targetNodes,
          obstacles,
          solutionPath: path,
          seed: seedValue
        });
        
        // Reset states
        setPlayerPath([]);
        setGameWon(false);
        setElapsedTime(0);
        setStartTime(null);
        setScore(0);
        return;
      }
    }
    
    // Fallback simple generation
    const fallbackPath: Cell[] = [];
    for (let r = 0; r < gridSize; r++) {
      if (r % 2 === 0) {
        for (let c = 0; c < gridSize; c++) fallbackPath.push({ r, c });
      } else {
        for (let c = gridSize - 1; c >= 0; c--) fallbackPath.push({ r, c });
      }
    }
    const numbers: Record<string, number> = {};
    numbers[`${fallbackPath[0].r},${fallbackPath[0].c}`] = 1;
    numbers[`${fallbackPath[Math.floor(fallbackPath.length / 2)].r},${fallbackPath[Math.floor(fallbackPath.length / 2)].c}`] = 2;
    numbers[`${fallbackPath[fallbackPath.length - 1].r},${fallbackPath[fallbackPath.length - 1].c}`] = 3;

    setBoard({
      rows: gridSize,
      cols: gridSize,
      numbers,
      maxNumber: 3,
      obstacles: new Set<string>(),
      solutionPath: fallbackPath,
      seed: seedValue
    });
    setPlayerPath([]);
    setGameWon(false);
    setElapsedTime(0);
    setStartTime(null);
    setScore(0);
  }, [getDateSeed]);

  // Find a random path visiting as many cells as possible
  function findRandomPath(gridSize: number, obstacles: Set<string>, rng: SeededRandom): Cell[] | null {
    const visited = new Set<string>();
    obstacles.forEach(o => visited.add(o));
    
    // Pick a starting corner or side cell
    let startR = rng.nextInt(0, 2) === 0 ? 0 : gridSize - 1;
    let startC = rng.nextInt(0, 2) === 0 ? 0 : gridSize - 1;
    
    if (obstacles.has(`${startR},${startC}`)) {
      // Find any non-obstacle starting cell
      let found = false;
      for (let r = 0; r < gridSize && !found; r++) {
        for (let c = 0; c < gridSize; c++) {
          if (!obstacles.has(`${r},${c}`)) {
            startR = r;
            startC = c;
            found = true;
            break;
          }
        }
      }
    }

    const path: Cell[] = [{ r: startR, c: startC }];
    visited.add(`${startR},${startC}`);

    function dfs(r: number, c: number): boolean {
      const neighbors = [
        { r: r - 1, c },
        { r: r + 1, c },
        { r: r, c: c - 1 },
        { r: r, c: c + 1 }
      ].filter(n => n.r >= 0 && n.r < gridSize && n.c >= 0 && n.c < gridSize && !visited.has(`${n.r},${n.c}`));

      if (neighbors.length === 0) {
        // If we visited at least 65% of playable cells, we accept the path
        const totalPlayable = gridSize * gridSize - obstacles.size;
        return path.length >= totalPlayable * 0.65;
      }

      // Shuffle neighbors
      for (let i = neighbors.length - 1; i > 0; i--) {
        const j = Math.floor(rng.next() * (i + 1));
        const temp = neighbors[i];
        neighbors[i] = neighbors[j];
        neighbors[j] = temp;
      }

      for (const next of neighbors) {
        path.push(next);
        visited.add(`${next.r},${next.c}`);
        if (dfs(next.r, next.c)) return true;
        path.pop();
        visited.delete(`${next.r},${next.c}`);
      }
      return false;
    }

    if (dfs(startR, startC)) {
      return path;
    }
    return null;
  }

  // Load Daily or Custom Challenge
  useEffect(() => {
    if (mode === 'daily') {
      generateBoard(6, 'easy', true);
      // Check daily status
      const today = new Date().toDateString();
      const status = localStorage.getItem(`data_path_daily_played_${today}_${currentTenant?.id || 'demo'}`);
      if (status === 'true') {
        setHasPlayedToday(true);
      } else {
        setHasPlayedToday(false);
      }
    } else {
      generateBoard(size, difficulty, false);
      setHasPlayedToday(false);
    }
  }, [mode, size, difficulty, generateBoard, currentTenant?.id]);

  // Load Leaderboard / Stats
  useEffect(() => {
    // Simulated global ranking
    setLeaderboard([
      { name: 'Sofia Steward (Finanzas)', time: '01:12', score: 1250, streak: 8 },
      { name: 'Mateo CDO (Gobierno)', time: '01:28', score: 1100, streak: 5 },
      { name: 'Diana Analyst (Riesgos)', time: '01:45', score: 980, streak: 12 },
      { name: 'Daniel Custodian (TI)', time: '01:59', score: 870, streak: 4 }
    ]);
    const savedStreak = parseInt(localStorage.getItem('data_path_streak') || '0');
    setStreak(savedStreak);
  }, []);

  // Handle cell interactions (mouse/touch drawing)
  const startDrawingPath = (cell: Cell) => {
    if (gameWon || hasPlayedToday) return;
    const num = board?.numbers[`${cell.r},${cell.c}`];
    
    // Path MUST start at 1
    if (num === 1) {
      if (soundEnabled) playSound(440, 'sine', 0.1);
      setPlayerPath([cell]);
      setIsDrawing(true);
      if (!startTime) setStartTime(Date.now());
    }
  };

  const drawToCell = (cell: Cell) => {
    if (!isDrawing || gameWon || playerPath.length === 0) return;
    
    // Check if cell is obstacle
    if (board?.obstacles.has(`${cell.r},${cell.c}`)) return;

    const lastCell = playerPath[playerPath.length - 1];
    
    // Check if cell is adjacent
    const isAdjacent = 
      (Math.abs(cell.r - lastCell.r) === 1 && cell.c === lastCell.c) ||
      (Math.abs(cell.c - lastCell.c) === 1 && cell.r === lastCell.r);
    
    if (!isAdjacent) return;

    // Check if drawing backward to delete path
    if (playerPath.length > 1 && cell.r === playerPath[playerPath.length - 2].r && cell.c === playerPath[playerPath.length - 2].c) {
      if (soundEnabled) playSound(330, 'sine', 0.05);
      setPlayerPath(prev => prev.slice(0, -1));
      return;
    }

    // Check if cell is already visited in current path
    const alreadyVisited = playerPath.some(c => c.r === cell.r && c.c === cell.c);
    if (alreadyVisited) return;

    // Validate sequential connection constraint
    // If cell contains a number, it MUST be the next expected number in sequence
    const cellNum = board?.numbers[`${cell.r},${cell.c}`];
    if (cellNum !== undefined) {
      // Find what numbers we already reached in order
      let expectedNum = 2;
      for (const p of playerPath) {
        const n = board?.numbers[`${p.r},${p.c}`];
        if (n !== undefined && n === expectedNum) {
          expectedNum++;
        }
      }
      if (cellNum !== expectedNum) return; // Disallow out-of-order connections
      
      if (soundEnabled) playSound(520 + cellNum * 40, 'triangle', 0.15);
    } else {
      if (soundEnabled) playSound(400, 'sine', 0.02);
    }

    // Extend path
    const newPath = [...playerPath, cell];
    setPlayerPath(newPath);

    // Check Win Condition
    checkWin(newPath);
  };

  const endDrawingPath = () => {
    setIsDrawing(false);
  };

  // Sound Synthesizer using Web Audio API
  const playSound = (freq: number, type: OscillatorType, duration: number) => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
      
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
      // Fallback
    }
  };

  // Check Win
  const checkWin = (path: Cell[]) => {
    if (!board) return;
    
    // Check if path length reaches last number
    const numbersReached = path.filter(p => board.numbers[`${p.r},${p.c}`] !== undefined);
    
    if (numbersReached.length === board.maxNumber) {
      // Verify all celdas (non-obstacles) are filled
      const totalCells = board.rows * board.cols;
      const playableCells = totalCells - board.obstacles.size;
      
      if (path.length === playableCells) {
        // WINNER!
        setGameWon(true);
        setIsDrawing(false);
        if (soundEnabled) {
          playSound(523.25, 'sine', 0.15);
          setTimeout(() => playSound(659.25, 'sine', 0.15), 150);
          setTimeout(() => playSound(783.99, 'sine', 0.2), 300);
          setTimeout(() => playSound(1046.5, 'sine', 0.4), 450);
        }

        // Calculate score
        const timeBonus = Math.max(0, 600 - elapsedTime * 2);
        const hintsPenalty = (3 - hintsLeft) * 100;
        const totalScore = Math.max(100, 1000 + timeBonus - hintsPenalty);
        setScore(totalScore);

        if (mode === 'daily') {
          const today = new Date().toDateString();
          localStorage.setItem(`data_path_daily_played_${today}_${currentTenant?.id || 'demo'}`, 'true');
          setHasPlayedToday(true);
          const newStreak = streak + 1;
          setStreak(newStreak);
          localStorage.setItem('data_path_streak', newStreak.toString());
        }
      }
    }
  };

  // Hint Logic
  const getHint = () => {
    if (hintsLeft <= 0 || gameWon || !board) return;
    
    // Pista shows the next correct cell along the solution path
    // Let's find how much of the solution path matches the player path
    let matchLen = 0;
    for (let i = 0; i < board.solutionPath.length; i++) {
      if (i < playerPath.length && playerPath[i].r === board.solutionPath[i].r && playerPath[i].c === board.solutionPath[i].c) {
        matchLen++;
      } else {
        break;
      }
    }

    if (matchLen < board.solutionPath.length) {
      const nextCell = board.solutionPath[matchLen];
      // Highlight or temporarily place path
      setPlayerPath(board.solutionPath.slice(0, matchLen + 1));
      setHintsLeft(prev => prev - 1);
      if (soundEnabled) playSound(880, 'sine', 0.3);
    }
  };

  const handleShare = () => {
    const today = new Date().toLocaleDateString();
    const text = `🧠 DATA PATH CHALLENGE™ | RETO DIARIO\n¡Flujo de Datos Restaurado! 🚀\n📅 Fecha: ${today}\n🏆 Score: ${score} pts | ⏱️ Tiempo: ${formatTime(elapsedTime)}\n🔗 ¿Puedes superarme en GovData Nexus?`;
    navigator.clipboard.writeText(text);
    alert('¡Copia de resultados lista para compartir en Teams / Slack!');
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <button onClick={() => window.history.back()} className={styles.backBtn}>
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1>Data Path Challenge™</h1>
            <p className={styles.subtitle}>Conecta el flujo correcto de los datos.</p>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            className={mode === 'daily' ? styles.tabBtnActive : styles.tabBtn} 
            onClick={() => setMode('daily')}
          >
            <Calendar size={16} /> Reto Diario
          </button>
          <button 
            className={mode === 'free' ? styles.tabBtnActive : styles.tabBtn} 
            onClick={() => setMode('free')}
          >
            <Play size={16} /> Juego Libre
          </button>
        </div>
      </div>

      <div className={styles.mainGrid}>
        {/* Play Panel */}
        <div className={styles.boardCard}>
          {hasPlayedToday && !gameWon ? (
            <div className={styles.lockOverlay}>
              <Lock size={64} style={{ color: '#059669', marginBottom: '20px' }} />
              <h3>Reto Completado Hoy</h3>
              <p>Has asegurado la gobernanza de datos para el día de hoy. Vuelve a la medianoche para el próximo puzzle.</p>
              <button className={styles.shareBtn} onClick={handleShare} style={{ marginTop: '20px' }}>
                <Share2 size={16} /> Compartir Score
              </button>
            </div>
          ) : (
            <>
              {/* Game Control HUD */}
              <div className={styles.hudHeader}>
                <div style={{ display: 'flex', gap: '20px' }}>
                  <div className={styles.hudStat}>
                    <span>TIEMPO</span>
                    <strong>{formatTime(elapsedTime)}</strong>
                  </div>
                  <div className={styles.hudStat}>
                    <span>PISTAS</span>
                    <strong>{hintsLeft}/3</strong>
                  </div>
                  {mode === 'daily' && (
                    <div className={styles.hudStat}>
                      <span>RACHA</span>
                      <strong style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Flame size={16} fill="currentColor" /> {streak}
                      </strong>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    onClick={() => generateBoard(size, difficulty, mode === 'daily')} 
                    className={styles.iconBtn}
                    title="Reiniciar Tablero"
                  >
                    <RotateCcw size={16} />
                  </button>
                  <button 
                    onClick={() => setSoundEnabled(!soundEnabled)} 
                    className={styles.iconBtn}
                    title={soundEnabled ? "Desactivar Sonido" : "Activar Sonido"}
                  >
                    {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                  </button>
                </div>
              </div>

              {/* Selection HUD for Free Play */}
              {mode === 'free' && (
                <div className={styles.selectionHud}>
                  <div className={styles.selectionRow}>
                    <span>Tablero:</span>
                    {[6, 8, 10, 12].map(s => (
                      <button 
                        key={s} 
                        className={size === s ? styles.sizeBtnActive : styles.sizeBtn}
                        onClick={() => setSize(s)}
                      >
                        {s}x{s}
                      </button>
                    ))}
                  </div>
                  <div className={styles.selectionRow}>
                    <span>Dificultad:</span>
                    {(['easy', 'medium', 'hard', 'expert'] as const).map(d => (
                      <button 
                        key={d} 
                        className={difficulty === d ? styles.diffBtnActive : styles.diffBtn}
                        onClick={() => setDifficulty(d)}
                      >
                        {d.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* The Interactive Logic Grid */}
              {board && (
                <div 
                  className={styles.gridContainer}
                  style={{
                    gridTemplateColumns: `repeat(${board.cols}, 1fr)`,
                    gridTemplateRows: `repeat(${board.rows}, 1fr)`
                  }}
                  onMouseLeave={endDrawingPath}
                >
                  {/* Glowing connector lines (SVG overlay) */}
                  <svg className={styles.svgOverlay}>
                    {playerPath.map((cell, idx) => {
                      if (idx === 0) return null;
                      const prev = playerPath[idx - 1];
                      // Calculate percentages for positioning line segments
                      const x1 = `${(prev.c + 0.5) * (100 / board.cols)}%`;
                      const y1 = `${(prev.r + 0.5) * (100 / board.rows)}%`;
                      const x2 = `${(cell.c + 0.5) * (100 / board.cols)}%`;
                      const y2 = `${(cell.r + 0.5) * (100 / board.rows)}%`;
                      return (
                        <line 
                          key={idx}
                          x1={x1}
                          y1={y1}
                          x2={x2}
                          y2={y2}
                          stroke="#10b981"
                          strokeWidth="8"
                          strokeLinecap="round"
                          className={styles.neonLine}
                        />
                      );
                    })}
                  </svg>

                  {/* Render Cells */}
                  {Array.from({ length: board.rows }).map((_, r) => 
                    Array.from({ length: board.cols }).map((_, c) => {
                      const key = `${r},${c}`;
                      const isObstacle = board.obstacles.has(key);
                      const number = board.numbers[key];
                      const isPath = playerPath.some(cell => cell.r === r && cell.c === c);
                      const isStart = playerPath.length > 0 && playerPath[0].r === r && playerPath[0].c === c;
                      const isEnd = playerPath.length > 0 && playerPath[playerPath.length - 1].r === r && playerPath[playerPath.length - 1].c === c;

                      return (
                        <div
                          key={key}
                          className={`${styles.cell} ${isObstacle ? styles.obstacle : ''} ${isPath ? styles.pathCell : ''}`}
                          onMouseDown={() => startDrawingPath({ r, c })}
                          onMouseEnter={() => drawToCell({ r, c })}
                          onMouseUp={endDrawingPath}
                          onTouchStart={() => startDrawingPath({ r, c })}
                          onTouchMove={(e) => {
                            // Touch coordinates to cell mapping
                            const touch = e.touches[0];
                            const elem = document.elementFromPoint(touch.clientX, touch.clientY);
                            if (elem) {
                              const rVal = elem.getAttribute('data-r');
                              const cVal = elem.getAttribute('data-c');
                              if (rVal !== null && cVal !== null) {
                                drawToCell({ r: parseInt(rVal), c: parseInt(cVal) });
                              }
                            }
                          }}
                          onTouchEnd={endDrawingPath}
                          data-r={r}
                          data-c={c}
                        >
                          {number && (
                            <div className={`${styles.nodeNumber} ${isStart ? styles.startNode : ''}`}>
                              {number}
                            </div>
                          )}
                          {number && (
                            <span className={styles.thematicLabel}>
                              {THEMATIC_LABELS[number] || 'Activo'}
                            </span>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {/* Hints Button */}
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                <button 
                  onClick={getHint} 
                  disabled={hintsLeft <= 0 || gameWon} 
                  className={styles.hintBtn}
                >
                  <Sparkles size={16} /> Solicitar Pista ({hintsLeft} restantes)
                </button>
              </div>
            </>
          )}
        </div>

        {/* Info & Side Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Instructions Card */}
          <div className={styles.sideCard}>
            <h3>📋 ¿Cómo Jugar?</h3>
            <ul className={styles.instructionsList}>
              <li>Haz clic y arrastra desde el <strong>nodo 1</strong>.</li>
              <li>Conecta la secuencia en orden: <strong>1 ➔ 2 ➔ 3 ➔ 4...</strong> hasta el final.</li>
              <li>El camino debe llenar <strong>todas las celdas vacías</strong> del tablero.</li>
              <li>No se puede pasar a través de obstáculos oscuros.</li>
            </ul>
          </div>

          {/* Ranking Card */}
          <div className={styles.sideCard}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Trophy size={18} style={{ color: '#fbbf24' }} /> Ranking Global
            </h3>
            <div className={styles.leaderboard}>
              {leaderboard.map((item, index) => (
                <div key={index} className={styles.leaderRow}>
                  <span className={styles.leaderPos}>{index + 1}</span>
                  <span className={styles.leaderName}>{item.name}</span>
                  <span className={styles.leaderTime}>{item.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Win Modal Overlay */}
      <AnimatePresence>
        {gameWon && (
          <motion.div 
            className={styles.modalOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className={styles.modal}
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
            >
              <CheckCircle size={64} style={{ color: '#10b981', marginBottom: '16px' }} />
              <h2>¡Flujo de Datos Restaurado!</h2>
              <p>Has trazado exitosamente la ruta de gobierno sin brechas.</p>
              
              <div className={styles.pointsGrid}>
                <div className={styles.pointsItem}>
                  <span>Governance Points</span>
                  <strong>+500 GP</strong>
                </div>
                <div className={styles.pointsItem}>
                  <span>Quality Points</span>
                  <strong>+300 QP</strong>
                </div>
                <div className={styles.pointsItem}>
                  <span>Metadata Points</span>
                  <strong>+200 MP</strong>
                </div>
              </div>

              <div className={styles.statsSummary}>
                <div>⏱️ Tiempo: <strong>{formatTime(elapsedTime)}</strong></div>
                <div>🏆 Score Total: <strong>{score} pts</strong></div>
              </div>

              <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
                <button 
                  className={styles.modalShareBtn} 
                  onClick={handleShare}
                >
                  <Share2 size={16} /> Compartir Resultados
                </button>
                <button 
                  className={styles.modalCloseBtn}
                  onClick={() => {
                    setGameWon(false);
                    generateBoard(size, difficulty, mode === 'daily');
                  }}
                >
                  Siguiente Reto
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
