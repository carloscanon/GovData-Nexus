'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Rocket, 
  ShoppingBag, 
  Grid, 
  ShieldCheck, 
  Settings, 
  Database, 
  Brain, 
  Zap, 
  Star, 
  Download, 
  ArrowRight, 
  Play, 
  MessageSquare,
  Award,
  Users,
  Compass
} from 'lucide-react';
import { usePlatform } from '@/contexts/PlatformContext';
import styles from './appstore.module.css';

// Target Apps inside GovData Nexus Store
const APPS = [
  {
    id: 'data-defender',
    name: 'Data Defender Galaxy',
    desc: 'Minijuego premium de gamificación empresarial. Protege el ecosistema destruyendo entidades corruptas.',
    category: 'Gamificación / Capacitación',
    rating: '5.0',
    premium: true,
    installed: true,
    bgImg: 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)',
    icon: Rocket
  },
  {
    id: 'steward-challenge',
    name: 'Data Steward Challenge',
    desc: 'Juego de roles interactivo donde resuelves incidentes de asignación de RACI en escenarios reales.',
    category: 'Gamificación / Gestión',
    rating: '4.8',
    premium: false,
    installed: false,
    bgImg: 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)',
    icon: Award
  },
  {
    id: 'compliance-hunter',
    name: 'Compliance Hunter',
    desc: 'Audita y caza políticas vencidas en bases de datos simuladas en una carrera contra el reloj.',
    category: 'Cumplimiento / Legal',
    rating: '4.7',
    premium: false,
    installed: false,
    bgImg: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
    icon: ShieldCheck
  },
  {
    id: 'metadata-explorer',
    name: 'Metadata Explorer',
    desc: 'Explora de forma tridimensional el linaje de datos de tu corporación en un entorno de realidad virtual.',
    category: 'Inteligencia / Diccionario',
    rating: '4.9',
    premium: true,
    installed: false,
    bgImg: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
    icon: Compass
  },
  {
    id: 'ai-governance',
    name: 'AI Governance Lab',
    desc: 'Sandbox avanzado para entrenar y certificar agentes de inteligencia artificial bajo normas éticas.',
    category: 'IA / Sandbox',
    rating: '4.9',
    premium: true,
    installed: false,
    bgImg: 'linear-gradient(135deg, #06b6d4 0%, #7c3aed 100%)',
    icon: Brain
  }
];

export default function AppStorePage() {
  const { currentTenant } = usePlatform();
  const [activeApp, setActiveApp] = useState<string | null>(null);
  const [nexiaMsg, setNexiaMsg] = useState<string>(
    '¡Saludos Guardián! Detecté 234 registros duplicados en el Maestro de Clientes. Recomiendo iniciar la misión y disparar Reglas de Calidad para mitigarlos.'
  );

  // Installed states
  const [installedApps, setInstalledApps] = useState<Record<string, boolean>>({
    'data-defender': true
  });

  const handleInstall = (appId: string) => {
    if (installedApps[appId]) return;
    setInstalledApps(prev => ({ ...prev, [appId]: true }));
    alert(`¡Éxito! La aplicación fue parametrizada e instalada en el tenant de "${currentTenant?.name || 'su empresa'}".`);
  };

  return (
    <div className={styles.container}>
      <div className={styles.glowHeaderBlob} />
      
      <div className={styles.contentWrapper}>
        <AnimatePresence mode="wait">
          {!activeApp ? (
            <motion.div 
              key="store" 
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -15 }}
            >
              {/* Main Banner */}
              <div className={styles.banner}>
                <div className={styles.bannerGlow} />
                <div>
                  <h1 className={styles.bannerTitle}>🚀 GovData Nexus Marketplace</h1>
                  <p className={styles.bannerSubtitle}>
                    Expande el poder de tu Gobierno de Datos
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                  <span style={{ 
                    fontSize: '0.85rem', 
                    background: 'rgba(99,102,241,0.15)', 
                    padding: '8px 16px', 
                    borderRadius: '10px',
                    border: '1px solid rgba(99,102,241,0.3)',
                    color: '#a5b4fc',
                    fontWeight: 700 
                  }}>
                    Empresa: {currentTenant?.name || 'Cargando...'}
                  </span>
                </div>
              </div>

              {/* Grid Area */}
              <h2 className={styles.sectionTitle}>
                <ShoppingBag size={22} style={{ color: '#818cf8' }} /> APLICACIONES COMPLEMENTARIAS
              </h2>
              
              <div className={styles.grid}>
                {APPS.map((app) => {
                  const isInstalled = installedApps[app.id];
                  const Icon = app.icon;
                  return (
                    <div key={app.id} className={styles.appCard}>
                      {app.premium && <span className={styles.premiumBadge}>PREMIUM</span>}
                      
                      <div className={styles.appImageArea} style={{ background: app.bgImg }}>
                        <span className={styles.appCategory}>{app.category}</span>
                      </div>

                      <div className={styles.appInfoArea}>
                        <h3 className={styles.appTitle}>{app.name}</h3>
                        <p className={styles.appDesc}>{app.desc}</p>
                        
                        <div className={styles.cardFooter}>
                          <div className={styles.rating}>
                            <Star size={16} fill="currentColor" /> {app.rating}
                          </div>
                          
                          {app.id === 'data-defender' ? (
                            <button 
                              className={styles.playBtn} 
                              style={{ padding: '8px 18px', fontSize: '0.9rem', borderRadius: '8px' }}
                              onClick={() => setActiveApp('data-defender')}
                            >
                              <Play size={14} fill="currentColor" /> Jugar
                            </button>
                          ) : (
                            <button 
                              className={`${styles.installBtn} ${isInstalled ? styles.installedBtn : ''}`}
                              onClick={() => handleInstall(app.id)}
                              disabled={isInstalled}
                            >
                              {isInstalled ? 'Instalada' : (
                                <>
                                  <Download size={14} /> Instalar
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="game" 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 900, background: 'linear-gradient(135deg, #fff 0%, #cbd5e1 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    🎮 Data Defender Galaxy
                  </h2>
                  <p style={{ margin: '4px 0 0 0', color: '#94a3b8', fontSize: '0.9rem' }}>
                    La galaxia GovData está siendo invadida por entidades corruptas. ¡Protege el ecosistema!
                  </p>
                </div>
                <button 
                  className={styles.quitGameBtn}
                  onClick={() => setActiveApp(null)}
                >
                  Salir al Marketplace
                </button>
              </div>

              <div className={styles.gameLayout}>
                {/* Game Canvas Module */}
                <GameCanvasContainer setNexiaMsg={setNexiaMsg} />

                {/* Cyber Sidecards */}
                <div className={styles.sideContainer}>
                  {/* NEXIA AI */}
                  <div className={styles.sideCard}>
                    <h4 className={styles.sideCardTitle}>
                      <Brain size={18} style={{ color: '#c084fc' }} /> NEXIA AI COPILOTO
                    </h4>
                    <p className={styles.nexiaText}>
                      "{nexiaMsg}"
                    </p>
                  </div>

                  {/* Leaderboard */}
                  <div className={styles.sideCard}>
                    <h4 className={styles.sideCardTitle}>
                      <Users size={18} style={{ color: '#38bdf8' }} /> RANKING CORPORATIVO
                    </h4>
                    
                    <div className={styles.rankRow}>
                      <div className={`${styles.rankPos} ${styles.rank1}`}>1</div>
                      <div className={styles.rankName}>María Steward (Finanzas)</div>
                      <div className={styles.rankScore}>1,450 pts</div>
                    </div>
                    <div className={styles.rankRow}>
                      <div className={`${styles.rankPos} ${styles.rank2}`}>2</div>
                      <div className={styles.rankName}>CDO Office Team</div>
                      <div className={styles.rankScore}>1,200 pts</div>
                    </div>
                    <div className={styles.rankRow}>
                      <div className={`${styles.rankPos} ${styles.rank3}`}>3</div>
                      <div className={styles.rankName}>TI Infraestructura</div>
                      <div className={styles.rankScore}>980 pts</div>
                    </div>
                    <div className={styles.rankRow}>
                      <div className={styles.rankPos}>4</div>
                      <div className={styles.rankName}>Tú (Nexus Guardian)</div>
                      <div className={styles.rankScore}>750 pts</div>
                    </div>
                  </div>

                  {/* Logros */}
                  <div className={styles.sideCard}>
                    <h4 className={styles.sideCardTitle}>
                      <Award size={18} style={{ color: '#fbbf24' }} /> LOGROS DESBLOQUEADOS
                    </h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      <span style={{ fontSize: '0.75rem', background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)', color: '#fbbf24', padding: '4px 8px', borderRadius: '6px' }}>
                        🏆 Quality Guardian
                      </span>
                      <span style={{ fontSize: '0.75rem', background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.3)', color: '#38bdf8', padding: '4px 8px', borderRadius: '6px' }}>
                        🏆 Metadata Master
                      </span>
                      <span style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.05)', color: '#94a3b8', padding: '4px 8px', borderRadius: '6px' }}>
                        🔒 AI Trust Defender
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* Internal Space Invaders Game Engine component */
interface GameCanvasContainerProps {
  setNexiaMsg: (msg: string) => void;
}

function GameCanvasContainer({ setNexiaMsg }: GameCanvasContainerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [qualityPoints, setQualityPoints] = useState(90);
  const [activeWeapon, setActiveWeapon] = useState('🟢 Regla de Calidad');

  const scoreRef = useRef(0);
  const livesRef = useRef(3);
  const qualityRef = useRef(90);
  const weaponRef = useRef('🟢 Regla de Calidad');

  // Weapons list
  const weapons = [
    '🟢 Regla de Calidad',
    '🔵 Política de Datos',
    '🟣 Catálogo de Metadatos',
    '🟡 Stewardship',
    '🔴 Control de Cumplimiento'
  ];

  const handleWeaponChange = (idx: number) => {
    setActiveWeapon(weapons[idx]);
    weaponRef.current = weapons[idx];
  };

  useEffect(() => {
    if (!isPlaying) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    // Game variables
    const player = {
      x: canvas.width / 2 - 20,
      y: canvas.height - 70,
      width: 44,
      height: 40,
      speed: 6
    };

    let bullets: any[] = [];
    let enemies: any[] = [];
    let particles: any[] = [];

    // Enemy definitions
    const enemyTypes = [
      { name: 'Clone Records', color: '#ec4899', desc: 'Duplicado eliminado' },
      { name: 'Missing Fields', color: '#eab308', desc: 'Campo completado' },
      { name: 'Format Destroyers', color: '#3b82f6', desc: 'Formato corregido' },
      { name: 'Legacy Monsters', color: '#a855f7', desc: 'Datos obsoletos archivados' },
      { name: 'Compliance Raiders', color: '#ef4444', desc: 'Cumplimiento verificado' }
    ];

    // Spawn enemies helper
    const spawnEnemies = () => {
      enemies = [];
      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 8; col++) {
          const type = enemyTypes[row % enemyTypes.length];
          enemies.push({
            x: 50 + col * 75,
            y: 50 + row * 50,
            width: 32,
            height: 32,
            type: type.name,
            color: type.color,
            desc: type.desc,
            points: 40
          });
        }
      }
    };

    spawnEnemies();

    // Input handlers
    const keys: Record<string, boolean> = {};
    const handleKeyDown = (e: KeyboardEvent) => {
      keys[e.key] = true;
      if (e.key === ' ' || e.code === 'Space') {
        // Shoot
        bullets.push({
          x: player.x + player.width / 2 - 2,
          y: player.y,
          width: 5,
          height: 15,
          speed: 8,
          weapon: weaponRef.current
        });
      }
      // Switch weapon with numbers 1-5
      if (['1','2','3','4','5'].includes(e.key)) {
        handleWeaponChange(parseInt(e.key) - 1);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keys[e.key] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Game loop
    const update = () => {
      // Move player
      if (keys['ArrowLeft'] && player.x > 0) {
        player.x -= player.speed;
      }
      if (keys['ArrowRight'] && player.x < canvas.width - player.width) {
        player.x += player.speed;
      }

      // Move bullets
      bullets.forEach((bullet, index) => {
        bullet.y -= bullet.speed;
        if (bullet.y < 0) {
          bullets.splice(index, 1);
        }
      });

      // Move enemies
      let edgeReached = false;
      enemies.forEach(enemy => {
        enemy.x += 1; // Basic right movement
        if (enemy.x > canvas.width - enemy.width || enemy.x < 0) {
          // Keep inside simple boundaries
        }
      });

      // Collision detection
      bullets.forEach((bullet, bIdx) => {
        enemies.forEach((enemy, eIdx) => {
          if (
            bullet.x < enemy.x + enemy.width &&
            bullet.x + bullet.width > enemy.x &&
            bullet.y < enemy.y + enemy.height &&
            bullet.y + bullet.height > enemy.y
          ) {
            // Hit! Create particles
            for (let i = 0; i < 8; i++) {
              particles.push({
                x: enemy.x + enemy.width / 2,
                y: enemy.y + enemy.height / 2,
                vx: (Math.random() - 0.5) * 6,
                vy: (Math.random() - 0.5) * 6,
                size: Math.random() * 4 + 2,
                color: enemy.color,
                life: 30
              });
            }

            // Remove enemy and bullet
            enemies.splice(eIdx, 1);
            bullets.splice(bIdx, 1);

            // Update scores
            scoreRef.current += enemy.points;
            qualityRef.current = Math.min(100, qualityRef.current + 2);
            setScore(scoreRef.current);
            setQualityPoints(qualityRef.current);

            // Update Nexia copilot tip
            setNexiaMsg(
              `¡Excelente! Has destruido un ${enemy.type} usando tu ${bullet.weapon}. +${enemy.points} Puntos. Proceso de remediación registrado en workflows.`
            );
          }
        });
      });

      // Respawn if all destroyed
      if (enemies.length === 0) {
        spawnEnemies();
        setNexiaMsg('¡Alerta de Oleada! Se detectó un nuevo lote de datos sin estructurar. Prepárate.');
      }

      // Move particles
      particles.forEach((p, index) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life--;
        if (p.life <= 0) {
          particles.splice(index, 1);
        }
      });
    };

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Starfield background
      ctx.fillStyle = 'rgba(255,255,255,0.1)';
      for (let i = 0; i < 30; i++) {
        const x = (Math.sin(i * 12345) * 0.5 + 0.5) * canvas.width;
        const y = ((Date.now() / 15 + i * 20) % canvas.height);
        ctx.fillRect(x, y, 2, 2);
      }

      // Draw player (Nexus Guardian ship)
      ctx.fillStyle = '#6366f1';
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#6366f1';
      ctx.beginPath();
      ctx.moveTo(player.x + player.width / 2, player.y);
      ctx.lineTo(player.x + player.width, player.y + player.height);
      ctx.lineTo(player.x, player.y + player.height);
      ctx.closePath();
      ctx.fill();

      // Core engine glow
      ctx.fillStyle = '#d946ef';
      ctx.beginPath();
      ctx.arc(player.x + player.width / 2, player.y + player.height + 2, 6, 0, Math.PI * 2);
      ctx.fill();

      // Reset shadows
      ctx.shadowBlur = 0;

      // Draw enemies (Galaxian style)
      enemies.forEach(enemy => {
        ctx.fillStyle = enemy.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = enemy.color;
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);

        // Core eye/shield effect
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.fillRect(enemy.x + 8, enemy.y + 10, 6, 6);
        ctx.fillRect(enemy.x + 18, enemy.y + 10, 6, 6);
        ctx.shadowBlur = 0;
      });

      // Draw bullets
      bullets.forEach(bullet => {
        let bColor = '#10b981'; // Green rule
        if (bullet.weapon.includes('Política')) bColor = '#3b82f6';
        if (bullet.weapon.includes('Catálogo')) bColor = '#8b5cf6';
        if (bullet.weapon.includes('Stewardship')) bColor = '#eab308';
        if (bullet.weapon.includes('Control')) bColor = '#ef4444';

        ctx.fillStyle = bColor;
        ctx.shadowBlur = 12;
        ctx.shadowColor = bColor;
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        ctx.shadowBlur = 0;
      });

      // Draw particles
      particles.forEach(p => {
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, p.size, p.size);
      });
    };

    const loop = () => {
      update();
      render();
      animationFrameId = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isPlaying]);

  const startGame = () => {
    scoreRef.current = 0;
    livesRef.current = 3;
    qualityRef.current = 90;
    setScore(0);
    setLives(3);
    setQualityPoints(90);
    setIsPlaying(true);
  };

  return (
    <div className={styles.gameScreen}>
      {!isPlaying ? (
        <div className={styles.gameSplash}>
          <Rocket size={64} style={{ color: '#818cf8', filter: 'drop-shadow(0 0 15px rgba(129, 140, 248, 0.4))' }} />
          <h3 className={styles.splashTitle}>DATA DEFENDER GALAXY</h3>
          <p className={styles.splashSubtitle}>Estación de Defensa Galáctica de Datos</p>
          <p className={styles.splashDesc}>
            Controla tu nave **Nexus Guardian X1**. Dispara reglas de calidad y políticas de datos para limpiar duplicados, vacíos y amenazas normativas.
          </p>
          
          <div style={{ display: 'flex', gap: '20px', background: 'rgba(255,255,255,0.03)', padding: '15px 25px', borderRadius: '12px', fontSize: '0.82rem', border: '1px solid rgba(255,255,255,0.05)', color: '#94a3b8' }}>
            <div>⬅ / ➡ : Moverse</div>
            <div>[Espacio] : Disparar</div>
            <div>[1-5] : Cambiar Armas</div>
          </div>

          <button className={styles.playBtn} onClick={startGame}>
            ▶ Iniciar Misión
          </button>
        </div>
      ) : (
        <>
          <div className={styles.gameControlsOverlay}>
            <div className={styles.gameHud}>
              <span>PUNTOS: {score}</span>
            </div>
            <div className={styles.gameHud}>
              <span>CALIDAD GLOBAL: {qualityPoints}%</span>
            </div>
            <button className={styles.quitGameBtn} onClick={() => setIsPlaying(false)}>
              Reiniciar
            </button>
          </div>

          <canvas 
            ref={canvasRef} 
            width={750} 
            height={520} 
            className={styles.canvas}
          />

          {/* Console / Controls Panel */}
          <div className={styles.gameConsolePanel}>
            <div className={styles.consoleStatCard}>
              <div className={styles.consoleStatLabel}>ARMA ACTUAL</div>
              <div className={styles.consoleStatVal} style={{ fontSize: '0.9rem', color: '#a5b4fc' }}>
                {activeWeapon}
              </div>
            </div>
            
            <div className={styles.consoleStatCard}>
              <div className={styles.consoleStatLabel}>SELECCIÓN (Teclas 1-5)</div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '4px' }}>
                {weapons.map((w, idx) => (
                  <button 
                    key={idx}
                    onClick={() => handleWeaponChange(idx)}
                    style={{
                      background: activeWeapon === w ? '#4f46e5' : 'rgba(255,255,255,0.05)',
                      border: 'none',
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.consoleStatCard}>
              <div className={styles.consoleStatLabel}>ESCUDOS</div>
              <div className={styles.consoleStatVal} style={{ color: '#10b981' }}>ACTIVO</div>
            </div>

            <div className={styles.consoleStatCard}>
              <div className={styles.consoleStatLabel}>ESTADO DEL MOTOR</div>
              <div className={styles.consoleStatVal} style={{ color: '#06b6d4' }}>ESTABLE</div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
