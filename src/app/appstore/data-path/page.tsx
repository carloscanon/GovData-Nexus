'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Calendar,
  Share2,
  Lock,
  Play,
  RotateCcw,
  Sparkles,
  Trophy,
  Volume2,
  VolumeX,
  ChevronDown,
  ChevronUp,
  RefreshCw
} from 'lucide-react';
import { usePlatform } from '@/contexts/PlatformContext';
import styles from './data-path.module.css';

// Thematic DAMA labels for numbers
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
  17: 'Aprobación',
  18: 'Anonimización',
  19: 'SLA',
  20: 'Mesa de Incidentes'
};

// Seed-based random generator (LCG)
class SeededRandom {
  private seed: number;
  constructor(seed: number) {
    this.seed = seed;
  }
  next(): number {
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

// Represent horizontal/vertical walls between adjacent cells
// A wall exists between (r,c) and an adjacent cell in a direction (up, down, left, right)
interface Wall {
  r1: number;
  c1: number;
  r2: number;
  c2: number;
}

interface BoardData {
  rows: number;
  cols: number;
  numbers: Record<string, number>; // "r,c" -> number
  maxNumber: number;
  walls: Wall[]; // Custom maze borders
  solutionPath: Cell[];
  seed: number;
}

export default function DataPathChallengePage() {
  const router = useRouter();
  const { currentTenant } = usePlatform();
  const [mode, setMode] = useState<'daily' | 'free'>('daily');
  const [size, setSize] = useState<number>(8);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard' | 'expert'>('hard');
  const [board, setBoard] = useState<BoardData | null>(null);
  
  // Dragging / Drawing state
  const [playerPath, setPlayerPath] = useState<Cell[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [hintsLeft, setHintsLeft] = useState(3);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [gameWon, setGameWon] = useState(false);
  const [score, setScore] = useState(0);
  
  // Game metrics
  const [streak, setStreak] = useState(0);
  const [hasPlayedToday, setHasPlayedToday] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showHowToPlay, setShowHowToPlay] = useState(true);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);

  // Refs for tracking drag coordinates relative to grid bounding box
  const gridRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<Cell[]>([]);
  pathRef.current = playerPath;

  const updatePath = (newPath: Cell[]) => {
    pathRef.current = newPath;
    setPlayerPath(newPath);
  };

  const isDraggingRef = useRef(false);

  // Sound Synthesizer using Web Audio API
  const playSound = (freq: number, type: OscillatorType, duration: number) => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.005, audioCtx.currentTime + duration);
      
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {}
  };

  // Timer effect
  useEffect(() => {
    let interval: any = null;
    if (startTime && !gameWon && !hasPlayedToday) {
      interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [startTime, gameWon, hasPlayedToday]);

  // Seed generator
  const getDateSeed = useCallback(() => {
    const d = new Date();
    return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
  }, []);

  // Check if there's a wall between two cells
  const hasWallBetween = (c1: Cell, c2: Cell, walls: Wall[]) => {
    return walls.some(w => 
      (w.r1 === c1.r && w.c1 === c1.c && w.r2 === c2.r && w.c2 === c2.c) ||
      (w.r1 === c2.r && w.c1 === c2.c && w.r2 === c1.r && w.c2 === c1.c)
    );
  };

  // Generate board procedurally
  const generateBoard = useCallback((gridSize: number, diff: 'easy' | 'medium' | 'hard' | 'expert', useSeed: boolean) => {
    const seedValue = useSeed ? getDateSeed() : Math.floor(Math.random() * 1000000);
    const rng = new SeededRandom(seedValue);
    
    let targetNodes = 12;
    if (diff === 'easy') targetNodes = 8;
    else if (diff === 'medium') targetNodes = 12;
    else if (diff === 'hard') targetNodes = 16;
    else targetNodes = 20;

    let attempts = 0;
    while (attempts < 150) {
      attempts++;
      const walls: Wall[] = [];
      
      // Let's generate a Hamiltonian path visiting all cells of the grid using simple DFS
      let path = generateHamiltonianPath(gridSize, rng);
      
      // Fallback: if we are struggling to find a path randomly, use a guaranteed snake path
      if (!path && attempts >= 140) {
        path = [];
        for (let r = 0; r < gridSize; r++) {
          if (r % 2 === 0) {
            for (let c = 0; c < gridSize; c++) {
              path.push({ r, c });
            }
          } else {
            for (let c = gridSize - 1; c >= 0; c--) {
              path.push({ r, c });
            }
          }
        }
      }

      if (path && path.length >= targetNodes + 4) {
        // Place custom walls on boundaries that the path does NOT cross
        // This makes the board match the visual walls in the screenshot!
        const pathEdges = new Set<string>();
        for (let i = 0; i < path.length - 1; i++) {
          const u = path[i];
          const v = path[i + 1];
          pathEdges.add(`${u.r},${u.c}-${v.r},${v.c}`);
          pathEdges.add(`${v.r},${v.c}-${u.r},${u.c}`);
        }

        // Randomly place maze walls between non-consecutive path cells to enforce complexity
        for (let r = 0; r < gridSize; r++) {
          for (let c = 0; c < gridSize; c++) {
            // Check right
            if (c + 1 < gridSize) {
              const edge = `${r},${c}-${r},${c + 1}`;
              if (!pathEdges.has(edge) && rng.next() < 0.35) {
                walls.push({ r1: r, c1: c, r2: r, c2: c + 1 });
              }
            }
            // Check down
            if (r + 1 < gridSize) {
              const edge = `${r},${c}-${r + 1},${c}`;
              if (!pathEdges.has(edge) && rng.next() < 0.35) {
                walls.push({ r1: r, c1: c, r2: r + 1, c2: c });
              }
            }
          }
        }

        // Format nodes/numbers along the path
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

        setBoard({
          rows: gridSize,
          cols: gridSize,
          numbers,
          maxNumber: targetNodes,
          walls,
          solutionPath: path,
          seed: seedValue
        });
        updatePath([]);
        isDraggingRef.current = false;
        setIsDragging(false);
        setGameWon(false);
        setElapsedTime(0);
        setStartTime(null);
        setScore(0);
        return;
      }
    }
  }, [getDateSeed]);

  // Generate Hamiltonian path visiting all cells of the grid using simple DFS
  function generateHamiltonianPath(gridSize: number, rng: SeededRandom): Cell[] | null {
    const visited = new Set<string>();
    const path: Cell[] = [{ r: 0, c: 0 }];
    visited.add('0,0');

    let steps = 0;
    const maxSteps = gridSize * gridSize * 120; // Safe threshold (e.g. 7680 steps for 8x8) to prevent CPU lockups

    function dfs(r: number, c: number): boolean {
      steps++;
      if (steps > maxSteps) return false; // Abort if taking too long to prevent freezing the main thread

      if (path.length === gridSize * gridSize) {
        return true;
      }
      const neighbors = [
        { r: r - 1, c },
        { r: r + 1, c },
        { r: r, c: c - 1 },
        { r: r, c: c + 1 }
      ].filter(n => n.r >= 0 && n.r < gridSize && n.c >= 0 && n.c < gridSize && !visited.has(`${n.r},${n.c}`));

      // Shuffle
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

    if (dfs(0, 0)) return path;
    return null;
  }

  // Load Daily or Custom Challenge
  useEffect(() => {
    if (mode === 'daily') {
      setSize(8);
      setDifficulty('hard');
      generateBoard(8, 'hard', true);
      const today = new Date().toDateString();
      const status = localStorage.getItem(`data_path_daily_played_${today}_${currentTenant?.id || 'demo'}`);
      setHasPlayedToday(status === 'true');
    } else {
      generateBoard(size, difficulty, false);
      setHasPlayedToday(false);
    }
  }, [mode, size, difficulty, generateBoard, currentTenant?.id]);

  // Load Leaderboards
  useEffect(() => {
    setLeaderboard([
      { name: 'Sofía Steward (Finanzas)', time: '01:12', score: 1250 },
      { name: 'Mateo CDO (Gobierno)', time: '01:28', score: 1100 },
      { name: 'Diana Analyst (Riesgos)', time: '01:45', score: 980 }
    ]);
  }, []);

  // Agile pointer move coordinate calculation for smooth dragging (prevent lag/drop)
  const handlePointerMove = useCallback((clientX: number, clientY: number) => {
    if (!isDraggingRef.current || gameWon || !board || !gridRef.current) return;
    
    const gridRect = gridRef.current.getBoundingClientRect();
    const relativeX = clientX - gridRect.left;
    const relativeY = clientY - gridRect.top;

    // Map pixel coordinate to cell index
    const colWidth = gridRect.width / board.cols;
    const rowHeight = gridRect.height / board.rows;

    const c = Math.floor(relativeX / colWidth);
    const r = Math.floor(relativeY / rowHeight);

    if (r < 0 || r >= board.rows || c < 0 || c >= board.cols) return;

    const currentPath = pathRef.current;
    if (currentPath.length === 0) return;

    const lastCell = currentPath[currentPath.length - 1];

    // Check if cell is the same as the last cell
    if (r === lastCell.r && c === lastCell.c) return;

    // Check if dragging back over any cell already in the path for intuitive backtracking / retraction
    const existingIndex = currentPath.findIndex(cell => cell.r === r && cell.c === c);
    if (existingIndex !== -1) {
      if (existingIndex < currentPath.length - 1) {
        playSound(300, 'sine', 0.05);
        updatePath(currentPath.slice(0, existingIndex + 1));
      }
      return;
    }

    // Check adjacency
    const isAdjacent = 
      (Math.abs(r - lastCell.r) === 1 && c === lastCell.c) ||
      (Math.abs(c - lastCell.c) === 1 && r === lastCell.r);
    
    if (!isAdjacent) return;

    // Check walls constraint (cannot cross walls)
    if (hasWallBetween(lastCell, { r, c }, board.walls)) return;

    // Validate sequential connect
    const targetVal = board.numbers[`${r},${c}`];
    if (targetVal !== undefined) {
      // Find expected next number in sequence
      let expected = 2;
      for (const pCell of currentPath) {
        const val = board.numbers[`${pCell.r},${pCell.c}`];
        if (val !== undefined && val === expected) {
          expected++;
        }
      }
      if (targetVal !== expected) return;
      playSound(520 + targetVal * 40, 'triangle', 0.15);
    } else {
      playSound(400, 'sine', 0.02);
    }

    // Extend path
    const newPath = [...currentPath, { r, c }];
    updatePath(newPath);

    // Check win condition
    checkWin(newPath);
  }, [gameWon, board, soundEnabled]);

  const handlePointerUp = useCallback(() => {
    isDraggingRef.current = false;
    setIsDragging(false);
  }, []);

  // Listen to mouse/touch move globally for agile, continuous drawing
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      handlePointerMove(e.clientX, e.clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        // Prevent default screen bounce / page scrolling while drawing the path
        if (isDraggingRef.current) {
          if (e.cancelable) {
            e.preventDefault();
          }
        }
        handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('mouseup', handlePointerUp);
    window.addEventListener('touchend', handlePointerUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('mouseup', handlePointerUp);
      window.removeEventListener('touchend', handlePointerUp);
    };
  }, [handlePointerMove, handlePointerUp]);

  // Start path connection on click/press on cell 1 or any cell in existing path
  const handleCellStart = (cell: Cell) => {
    if (gameWon || hasPlayedToday || !board) return;

    // If clicking / pressing on a cell that is already part of the path, let the user resume drawing from there
    const pathIndex = playerPath.findIndex(p => p.r === cell.r && p.c === cell.c);
    if (pathIndex !== -1) {
      playSound(440, 'sine', 0.1);
      updatePath(playerPath.slice(0, pathIndex + 1));
      isDraggingRef.current = true;
      setIsDragging(true);
      if (!startTime) setStartTime(Date.now());
      return;
    }

    const num = board.numbers[`${cell.r},${cell.c}`];
    if (num === 1) {
      playSound(440, 'sine', 0.1);
      updatePath([cell]);
      isDraggingRef.current = true;
      setIsDragging(true);
      if (!startTime) setStartTime(Date.now());
    }
  };

  // Undo button action (Deshacer)
  const undoPath = () => {
    if (playerPath.length > 1) {
      playSound(300, 'sine', 0.05);
      updatePath(playerPath.slice(0, -1));
    } else {
      updatePath([]);
    }
  };

  // Hint Logic (Pista)
  const getHint = () => {
    if (hintsLeft <= 0 || gameWon || !board) return;
    let matchLen = 0;
    for (let i = 0; i < board.solutionPath.length; i++) {
      if (i < playerPath.length && playerPath[i].r === board.solutionPath[i].r && playerPath[i].c === board.solutionPath[i].c) {
        matchLen++;
      } else {
        break;
      }
    }

    if (matchLen < board.solutionPath.length) {
      updatePath(board.solutionPath.slice(0, matchLen + 1));
      setHintsLeft(prev => prev - 1);
      playSound(880, 'sine', 0.3);
    }
  };

  // Check Win
  const checkWin = (path: Cell[]) => {
    if (!board) return;
    const numbersReached = path.filter(p => board.numbers[`${p.r},${p.c}`] !== undefined);
    if (numbersReached.length === board.maxNumber && path.length === board.rows * board.cols) {
      setGameWon(true);
      setIsDragging(false);
      playSound(1046.5, 'sine', 0.45);

      const timeBonus = Math.max(0, 800 - elapsedTime * 2);
      const totalScore = 1000 + timeBonus + hintsLeft * 100;
      setScore(totalScore);

      if (mode === 'daily') {
        const today = new Date().toDateString();
        localStorage.setItem(`data_path_daily_played_${today}_${currentTenant?.id || 'demo'}`, 'true');
        setHasPlayedToday(true);
        setStreak(prev => prev + 1);
      }
    }
  };

  const handleShare = () => {
    const text = `🧠 DATA PATH CHALLENGE™ | RETO DIARIO\n¡Flujo de Datos Restaurado! 🚀\n🏆 Score: ${score} pts | ⏱️ Tiempo: ${formatTime(elapsedTime)}\n🔗 Supera mi racha en GovData Nexus.`;
    navigator.clipboard.writeText(text);
    alert('¡Resultados copiados al portapapeles!');
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className={styles.container}>
      {/* Top Navigation */}
      <div className={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <button onClick={() => router.push('/appstore')} className={styles.backBtn}>
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

      <div className={styles.mainLayout}>
        <div className={styles.gameView}>
          {hasPlayedToday && !gameWon ? (
            <div className={styles.lockOverlay}>
              <Lock size={64} style={{ color: '#10b981', marginBottom: '20px' }} />
              <h3>Reto Completado Hoy</h3>
              <p>Has asegurado la gobernanza de datos para el día de hoy. Vuelve a la medianoche para el próximo puzzle.</p>
              <button className={styles.shareBtn} onClick={handleShare} style={{ marginTop: '20px' }}>
                <Share2 size={16} /> Compartir Score
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              
              {/* Gameplay Metrics Row */}
              <div className={styles.hudRow}>
                <div className={styles.hudItem}>
                  <span>Tiempo</span>
                  <strong>{formatTime(elapsedTime)}</strong>
                </div>
                <div className={styles.hudItem}>
                  <span>Racha</span>
                  <strong>🔥 {streak}</strong>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => setSoundEnabled(!soundEnabled)} className={styles.soundToggle}>
                    {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                  </button>
                </div>
              </div>

              {/* Grid Difficulty Config for Free Mode */}
              {mode === 'free' && (
                <div className={styles.configRow}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700 }}>Tamaño:</span>
                    {[6, 8, 10].map(s => (
                      <button key={s} className={size === s ? styles.cfgBtnActive : styles.cfgBtn} onClick={() => setSize(s)}>
                        {s}x{s}
                      </button>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700 }}>Dificultad:</span>
                    {(['easy', 'medium', 'hard', 'expert'] as const).map(d => (
                      <button key={d} className={difficulty === d ? styles.cfgBtnActive : styles.cfgBtn} onClick={() => setDifficulty(d)}>
                        {d.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Dynamic Numbrix / Flow Grid */}
              {board && (
                <div 
                  ref={gridRef}
                  className={styles.gridContainer}
                  style={{
                    gridTemplateColumns: `repeat(${board.cols}, 1fr)`,
                    gridTemplateRows: `repeat(${board.rows}, 1fr)`
                  }}
                  onMouseDown={(e) => {
                    // Prevent default dragging behaviors
                    e.preventDefault();
                  }}
                >
                  {/* Glowing neon path SVG overlay */}
                  <svg className={styles.svgOverlay} viewBox="0 0 400 400">
                    {playerPath.length > 0 && (
                      <path
                        d={playerPath.map((cell, idx) => {
                          const x = (cell.c + 0.5) * (400 / board.cols);
                          const y = (cell.r + 0.5) * (400 / board.rows);
                          return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
                        }).join(' ')}
                        fill="none"
                        stroke="#10b981"
                        strokeWidth={400 / board.cols * 0.46} // 46% of cell width
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={styles.greenFlowLine}
                      />
                    )}
                  </svg>

                  {/* Outer & Inner border walls rendering */}
                  {board.walls.map((wall, idx) => {
                    // Calculate wall location based on cells
                    const isHorizontal = wall.r1 === wall.r2; // Wall is vertical between cols
                    const minR = Math.min(wall.r1, wall.r2);
                    const minC = Math.min(wall.c1, wall.c2);

                    let style: React.CSSProperties = {};
                    if (isHorizontal) {
                      // Vertical wall border
                      style = {
                        gridColumnStart: minC + 2,
                        gridRowStart: minR + 1,
                        width: '6px',
                        height: '100%',
                        left: '-3px',
                        background: '#000000',
                        position: 'absolute',
                        zIndex: 10
                      };
                    } else {
                      // Horizontal wall border
                      style = {
                        gridColumnStart: minC + 1,
                        gridRowStart: minR + 2,
                        width: '100%',
                        height: '6px',
                        top: '-3px',
                        background: '#000000',
                        position: 'absolute',
                        zIndex: 10
                      };
                    }

                    return <div key={idx} style={style} />;
                  })}

                  {/* Render board cells */}
                  {Array.from({ length: board.rows }).map((_, r) => 
                    Array.from({ length: board.cols }).map((_, c) => {
                      const key = `${r},${c}`;
                      const number = board.numbers[key];
                      const isPath = playerPath.some(cell => cell.r === r && cell.c === c);
                      const isStart = playerPath.length > 0 && playerPath[0].r === r && playerPath[0].c === c;

                      const cellWidth = 480 / board.cols;
                      const circleSize = Math.max(26, cellWidth * 0.65);
                      const fontSize = circleSize * 0.52;

                      return (
                        <div
                          key={key}
                          className={`${styles.cell} ${isPath ? styles.pathCell : ''}`}
                          onMouseDown={() => handleCellStart({ r, c })}
                          onTouchStart={() => handleCellStart({ r, c })}
                          data-r={r}
                          data-c={c}
                        >
                          {number && (
                            <div 
                              className={`${styles.nodeNumber} ${isStart ? styles.startNode : ''}`}
                              style={{
                                width: `${circleSize}px`,
                                height: `${circleSize}px`,
                                fontSize: `${fontSize}px`
                              }}
                            >
                              {number}
                            </div>
                          )}
                          {number && (
                            <span className={styles.thematicLabel}>
                              {THEMATIC_LABELS[number] || 'Dato'}
                            </span>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {/* Action Buttons: Deshacer and Pista */}
              <div className={styles.actionRow}>
                <button onClick={undoPath} className={styles.undoBtn}>
                  Deshacer
                </button>
                <button onClick={getHint} disabled={hintsLeft <= 0} className={styles.hintBtn}>
                  Pista
                </button>
              </div>

              {/* Accordion "Cómo se juega" */}
              <div className={styles.accordion}>
                <button 
                  className={styles.accordionHeader} 
                  onClick={() => setShowHowToPlay(!showHowToPlay)}
                >
                  <span>Cómo se juega</span>
                  {showHowToPlay ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
                
                <AnimatePresence>
                  {showHowToPlay && (
                    <motion.div 
                      className={styles.accordionContent}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                    >
                      <div className={styles.howToPlayGrid}>
                        <div className={styles.howToItem}>
                          <div className={styles.circleExample}>
                            <span>1</span>
                            <span>2</span>
                            <span>3</span>
                          </div>
                          <strong>Conecta los puntos en orden</strong>
                          <p>Arrastra tu cursor o dedo en orden consecutivo partiendo del nodo 1.</p>
                        </div>
                        <div className={styles.howToItem}>
                          <div className={styles.cellExample}>
                            <div className={styles.innerPathGlow} />
                          </div>
                          <strong>Pasa por cada celda</strong>
                          <p>El flujo debe recorrer exactamente cada casilla vacía del tablero.</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </div>
          )}
        </div>

        {/* Global Rankings and Info Column */}
        <div className={styles.sideColumn}>
          <div className={styles.sideCard}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 16px 0', fontSize: '1.1rem' }}>
              <Trophy size={18} style={{ color: '#fbbf24' }} /> Ranking del Día
            </h3>
            <div className={styles.leaderboard}>
              {leaderboard.map((item, index) => (
                <div key={index} className={styles.leaderRow}>
                  <span className={styles.leaderPos}>{index + 1}</span>
                  <span className={styles.leaderName}>{item.name}</span>
                  <span className={styles.leaderScore}>{item.score} pts</span>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.sideCard} style={{ background: 'rgba(16, 185, 129, 0.05)', borderColor: 'rgba(16, 185, 129, 0.2)' }}>
            <h3>💡 Data Governance Tip</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', lineHeight: 1.5, margin: 0 }}>
              La coherencia lógica en la secuencia de flujo de datos asegura un linaje correcto y un diccionario estructurado bajo estándares DAMA.
            </p>
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

              <div style={{ display: 'flex', gap: '12px', width: '100%', marginTop: '20px' }}>
                <button className={styles.modalShareBtn} onClick={handleShare}>
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
