'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Rocket, 
  ShoppingBag, 
  ShieldCheck, 
  Database, 
  Brain, 
  Star, 
  Download, 
  Play, 
  Award,
  Users,
  AlertTriangle,
  CheckCircle2,
  Share2,
  Calendar
} from 'lucide-react';
import { usePlatform } from '@/contexts/PlatformContext';
import { supabase } from '@/lib/supabase';
import styles from './appstore.module.css';

// Target Apps inside GovData Nexus Store
const APPS = [
  {
    id: 'data-defender',
    name: 'Data Defender Galaxy',
    desc: 'MINI-JUEGO RETO DIARIO. Protege el ecosistema de datos resolviendo anomalías reales. Solo una oportunidad cada 24 horas.',
    category: 'Gamificación / Capacitación',
    rating: '5.0',
    premium: true,
    installed: true,
    bgImg: 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)',
    icon: Rocket
  },
  {
    id: 'data-path',
    name: 'Data Path Challenge™',
    desc: 'JUEGO DE PUZZLE DIARIO. Conecta el flujo correcto de los datos en orden numérico para restaurar la gobernanza corporativa.',
    category: 'Gamificación / Lógica',
    rating: '5.0',
    premium: true,
    installed: true,
    bgImg: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    icon: Database
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
  }
];

export default function AppStorePage() {
  const router = useRouter();
  const { currentTenant } = usePlatform();
  const [activeApp, setActiveApp] = useState<string | null>(null);
  
  // Daily challenge locking states
  const [hasPlayedToday, setHasPlayedToday] = useState(false);
  const [lastScore, setLastScore] = useState(0);
  const [lastPrecision, setLastPrecision] = useState(0);
  
  // Nexia briefing messages based on the current day of the week
  const [nexiaMsg, setNexiaMsg] = useState<string>('');

  useEffect(() => {
    // Determine the day of the week and set briefing
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const currentDay = days[new Date().getDay()];
    
    let briefing = '';
    if (currentDay === 'Lunes' || currentDay === 'Martes') {
      briefing = '🚨 BRIEFING DE LA MISIÓN (LUNES/MARTES): CRM reporta un pico de duplicaciones del 35% en registros de clientes corporativos. Los Clone Records (👾 Verdes) dominan la zona. Usa la Regla de Calidad (🟢) para destruirlos de forma limpia.';
    } else if (currentDay === 'Miércoles' || currentDay === 'Jueves') {
      briefing = '🚨 BRIEFING DE LA MISIÓN (MIÉRCOLES/JUEVES): Se detectaron 528 diccionarios de datos sin términos comerciales en el Data Lake. Los Missing Fields (👾 Celestes) parpadean en las sombras. Usa el Enriquecimiento de Metadatos (🔵).';
    } else {
      briefing = '🚨 BRIEFING DE LA MISIÓN (FIN DE SEMANA): Un modelo de scoring de crédito no supervisado fue desplegado sin validación ética. Las Uncertified AI Entities (👾 Rojas) persiguen tu nave. ¡Equipa la Certificación de IA (🔴)!';
    }
    setNexiaMsg(briefing);

    // Load attempt state from localStorage to enforce "One Shot" policy
    const played = localStorage.getItem(`daily_challenge_played_${currentTenant?.id || 'demo'}`);
    const isUnlimited = localStorage.getItem('daily_challenge_unlimited') === 'true';
    if (played === 'true' && !isUnlimited) {
      setHasPlayedToday(true);
      setLastScore(parseInt(localStorage.getItem(`daily_challenge_score_${currentTenant?.id || 'demo'}`) || '0'));
      setLastPrecision(parseInt(localStorage.getItem(`daily_challenge_precision_${currentTenant?.id || 'demo'}`) || '0'));
    } else if (isUnlimited) {
      setHasPlayedToday(false);
    }
  }, [currentTenant?.id]);

  const handleShare = () => {
    const text = `🛸 DATA DEFENDER GALAXY | RETO DIARIO\n¡Gobernanza al 100%! Hoy defendí mi organización en GovData Nexus.\n🏆 Puntaje: ${lastScore} pts | 🎯 Precisión: ${lastPrecision}%\n¿Puedes superarme?`;
    navigator.clipboard.writeText(text);
    alert('¡Copiado al portapapeles! Compártelo en Slack o Microsoft Teams.');
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
                  return (
                    <div key={app.id} className={styles.appCard} style={app.id === 'data-defender' ? { borderColor: 'rgba(124, 58, 237, 0.5)', boxShadow: '0 0 20px rgba(124,58,237,0.15)' } : {}}>
                      {app.premium && <span className={styles.premiumBadge} style={app.id === 'data-defender' ? { background: 'linear-gradient(135deg, #7c3aed 0%, #db2777 100%)' } : {}}>RETO DIARIO</span>}
                      
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
                              style={{ 
                                padding: '8px 18px', 
                                fontSize: '0.9rem', 
                                borderRadius: '8px', 
                                background: hasPlayedToday ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg, #7c3aed 0%, #db2777 100%)',
                                color: hasPlayedToday ? '#94a3b8' : '#ffffff',
                                border: hasPlayedToday ? '1px solid rgba(255,255,255,0.1)' : 'none',
                                cursor: 'pointer'
                              }}
                              onClick={() => setActiveApp('data-defender')}
                            >
                              <Play size={14} fill="currentColor" /> {hasPlayedToday ? 'Ver Resultados' : 'Iniciar Reto'}
                            </button>
                          ) : app.id === 'data-path' ? (
                            <button 
                              className={styles.playBtn} 
                              style={{ 
                                padding: '8px 18px', 
                                fontSize: '0.9rem', 
                                borderRadius: '8px', 
                                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                color: '#ffffff',
                                border: 'none',
                                cursor: 'pointer'
                              }}
                              onClick={() => router.push('/appstore/data-path')}
                            >
                              <Play size={14} fill="currentColor" /> Iniciar Reto
                            </button>
                          ) : (
                            <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 700 }}>Próximamente</span>
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
                  <h2 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 900, background: 'linear-gradient(135deg, #fff 0%, #cbd5e1 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    🎮 Reto Diario: Data Defender Galaxy <span style={{ fontSize: '0.75rem', background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', color: '#f87171', padding: '2px 8px', borderRadius: '4px' }}>Una Oportunidad al Día</span>
                  </h2>
                  <p style={{ margin: '4px 0 0 0', color: '#94a3b8', fontSize: '0.9rem' }}>
                    Protege el ecosistema de datos resolviendo anomalías simuladas de la empresa.
                  </p>
                </div>
                <button 
                  className={styles.quitGameBtn}
                  onClick={() => setActiveApp(null)}
                  style={{ background: 'rgba(255,255,255,0.05)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                  Regresar al Marketplace
                </button>
              </div>

              {hasPlayedToday ? (
                <div style={{
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '2px solid rgba(124, 58, 237, 0.3)',
                  borderRadius: '24px',
                  padding: '40px',
                  textAlign: 'center',
                  maxWidth: '700px',
                  margin: '40px auto',
                  backdropFilter: 'blur(20px)',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
                }}>
                  <Calendar size={48} style={{ color: '#a855f7', marginBottom: '20px' }} />
                  <h3 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0 0 10px 0' }}>Misión Completada</h3>
                  <p style={{ color: '#94a3b8', margin: '0 0 30px 0' }}>
                    Has agotado tu oportunidad diaria para el día de hoy. La nave **Nexus Guardian X1** se encuentra en la bahía de mantenimiento y calibración.
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
                    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '15px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <span style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>PUNTOS LOGRADOS</span>
                      <strong style={{ fontSize: '1.8rem', color: '#a855f7' }}>{lastScore} pts</strong>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '15px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <span style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>PRECISIÓN DE GOBIERNO</span>
                      <strong style={{ fontSize: '1.8rem', color: '#38bdf8' }}>{lastPrecision}%</strong>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                    <button 
                      className={styles.playBtn}
                      onClick={handleShare}
                      style={{ background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                      <Share2 size={16} /> Compartir en Slack / Teams
                    </button>
                    <button 
                      className={styles.quitGameBtn}
                      onClick={() => setActiveApp(null)}
                      style={{ background: 'rgba(255,255,255,0.05)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.1)' }}
                    >
                      Volver
                    </button>
                  </div>
                </div>
              ) : (
                <div className={styles.gameLayout}>
                  {/* Game Canvas Module */}
                  <GameCanvasContainer 
                    setNexiaMsg={setNexiaMsg} 
                    onFinishGame={(finalScore, precision) => {
                      setLastScore(finalScore);
                      setLastPrecision(precision);
                      setHasPlayedToday(true);
                      localStorage.setItem(`daily_challenge_played_${currentTenant?.id || 'demo'}`, 'true');
                      localStorage.setItem(`daily_challenge_score_${currentTenant?.id || 'demo'}`, finalScore.toString());
                      localStorage.setItem(`daily_challenge_precision_${currentTenant?.id || 'demo'}`, precision.toString());
                      
                      // Save to tenant_config for persistence on Cloud/Vercel DB
                      if (currentTenant?.id) {
                        const todayStr = new Date().toISOString().split('T')[0];
                        supabase.from('tenant_config').upsert({
                          tenant_id: currentTenant.id,
                          config_key: `challenge_score_${todayStr}`,
                          config_value: { score: finalScore, precision, date: todayStr },
                          updated_at: new Date().toISOString()
                        }, { onConflict: 'tenant_id, config_key' }).then(({ error }) => {
                          if (error) console.error('Error persisting game score to Cloud DB:', error);
                        });
                      }
                    }}
                  />

                  {/* Cyber Sidecards */}
                  <div className={styles.sideContainer}>
                    {/* NEXIA AI */}
                    <div className={styles.sideCard}>
                      <h4 className={styles.sideCardTitle}>
                        <Brain size={18} style={{ color: '#c084fc' }} /> BRIEFING DE NEXIA AI
                      </h4>
                      <p className={styles.nexiaText}>
                        "{nexiaMsg}"
                      </p>
                    </div>

                    {/* Leaderboard */}
                    <div className={styles.sideCard}>
                      <h4 className={styles.sideCardTitle}>
                        <Users size={18} style={{ color: '#38bdf8' }} /> RANKING DE {currentTenant?.name?.toUpperCase() || 'EMPRESA'}
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
                      <div className={styles.rankRow} style={{ background: 'rgba(99, 102, 241, 0.1)', borderRadius: '6px', padding: '10px' }}>
                        <div className={styles.rankPos} style={{ background: '#6366f1', color: '#fff' }}>4</div>
                        <div className={styles.rankName} style={{ fontWeight: 700 }}>Tú (Gobernanza {currentTenant?.name})</div>
                        <div className={styles.rankScore}>{lastScore || 750} pts</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* Space shooter with strict vulnerability matrix */
interface DailyGameCanvasProps {
  setNexiaMsg: (msg: string) => void;
  onFinishGame: (score: number, precision: number) => void;
}

function GameCanvasContainer({ setNexiaMsg, onFinishGame }: DailyGameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [shields, setShields] = useState(100);
  const [precision, setPrecision] = useState(100);
  const [activeWeapon, setActiveWeapon] = useState('🟢 Regla de Calidad');
  const [isOverheated, setIsOverheated] = useState(false);

  const scoreRef = useRef(0);
  const shieldsRef = useRef(100);
  const shotsFiredRef = useRef(0);
  const shotsHitRef = useRef(0);
  const weaponRef = useRef('🟢 Regla de Calidad');
  const overheatedRef = useRef(false);
  const lastShotTimeRef = useRef(0);
  const consecutiveShotsRef = useRef(0);

  // 5 Weapons aligned to Data Governance roles and tools
  const weapons = [
    { name: '🟢 Regla de Calidad', color: '#10b981' },
    { name: '🔵 Enriquecimiento de Metadatos', color: '#06b6d4' },
    { name: '🟣 Data Purge / Borrado Seguro', color: '#8b5cf6' },
    { name: '🟡 Control de Cumplimiento', color: '#eab308' },
    { name: '🔴 Certificación de IA', color: '#ef4444' }
  ];

  const handleWeaponChange = (idx: number) => {
    setActiveWeapon(weapons[idx].name);
    weaponRef.current = weapons[idx].name;
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
    let meteors: any[] = [];

    // Daily varying meteor path layouts based on day of the week
    const currentDayIdx = new Date().getDay(); // 0-6
    
    // Spawn 15 tactical enemies
    const spawnEnemies = () => {
      enemies = [];
      const enemyTypes = [
        { name: 'Clone Records', color: '#10b981', weaponAllowed: '🟢 Regla de Calidad' },
        { name: 'Missing Fields', color: '#06b6d4', weaponAllowed: '🔵 Enriquecimiento de Metadatos' },
        { name: 'Legacy Monsters', color: '#8b5cf6', weaponAllowed: '🟣 Data Purge / Borrado Seguro' },
        { name: 'Compliance Raiders', color: '#eab308', weaponAllowed: '🟡 Control de Cumplimiento' },
        { name: 'Uncertified AI Entities', color: '#ef4444', weaponAllowed: '🔴 Certificación de IA' }
      ];

      for (let row = 0; row < 2; row++) {
        for (let col = 0; col < 6; col++) {
          const type = enemyTypes[(col + row) % enemyTypes.length];
          enemies.push({
            x: 80 + col * 90,
            y: 60 + row * 60,
            width: 36,
            height: 36,
            type: type.name,
            color: type.color,
            weaponAllowed: type.weaponAllowed,
            points: 100,
            direction: 1
          });
        }
      }
    };

    const spawnMeteor = () => {
      // Meteors use a different initial offset path pattern each day of the week
      const dailyOffset = (currentDayIdx * 85) % 150;
      const xPos = 40 + Math.random() * (canvas.width - 80);
      meteors.push({
        x: xPos,
        y: -40,
        radius: 14 + Math.random() * 8,
        // Day index scales the fall speed
        speed: 1.5 + (currentDayIdx * 0.2) + Math.random() * 1.5,
        // Curve trajectory varies dynamically day-to-day
        wiggleOffset: Math.random() * 100,
        wiggleSpeed: 0.02 + (currentDayIdx * 0.005)
      });
    };

    spawnEnemies();

    // Input handlers
    const keys: Record<string, boolean> = {};
    const handleKeyDown = (e: KeyboardEvent) => {
      keys[e.key] = true;
      if (e.key === ' ' || e.code === 'Space') {
        const now = Date.now();
        
        // Anti-Gatillo Fácil logic (Overheat check)
        if (overheatedRef.current) return;
        
        if (now - lastShotTimeRef.current < 250) {
          consecutiveShotsRef.current++;
          if (consecutiveShotsRef.current >= 4) {
            overheatedRef.current = true;
            setIsOverheated(true);
            setNexiaMsg('⚠️ ¡ADVERTENCIA DE SOBRECALENTAMIENTO! Núcleo bloqueado. No dispares reglas masivas en producción sin análisis.');
            setTimeout(() => {
              overheatedRef.current = false;
              setIsOverheated(false);
              consecutiveShotsRef.current = 0;
            }, 3000);
            return;
          }
        } else {
          consecutiveShotsRef.current = 0;
        }

        lastShotTimeRef.current = now;
        shotsFiredRef.current++;

        // Shoot bullet
        bullets.push({
          x: player.x + player.width / 2 - 2,
          y: player.y,
          width: 6,
          height: 16,
          speed: 8,
          weapon: weaponRef.current
        });

        // Laser sound effect synthesis
        try {
          const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(800, audioCtx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(150, audioCtx.currentTime + 0.15);
          gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.005, audioCtx.currentTime + 0.15);
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start();
          osc.stop(audioCtx.currentTime + 0.15);
        } catch (err) {}
      }
      
      if (['1','2','3','4','5'].includes(e.key)) {
        handleWeaponChange(parseInt(e.key) - 1);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keys[e.key] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Update game state loop
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

      // Spawning meteors dynamically
      if (Math.random() < 0.02) {
        spawnMeteor();
      }

      // Move meteors and detect collision with player
      meteors.forEach((met, mIdx) => {
        met.y += met.speed;
        
        // Dynamic horizontal drift based on the day of the week
        // Monday (1) has zig-zag, Wednesday (3) has sinusoidal curves, etc.
        const dayWave = Math.sin(met.y * met.wiggleSpeed + met.wiggleOffset) * (currentDayIdx * 1.5);
        met.x += dayWave;

        // Clean up out of bounds meteors
        if (met.y > canvas.height + 40) {
          meteors.splice(mIdx, 1);
        }

        // Collision detection with player ship (bounding circle vs bounding box approximation)
        const pCenterX = player.x + player.width / 2;
        const pCenterY = player.y + player.height / 2;
        const dist = Math.hypot(pCenterX - met.x, pCenterY - met.y);
        
        if (dist < met.radius + 15) {
          // Collision! Crash particle effect
          for (let i = 0; i < 15; i++) {
            particles.push({
              x: met.x,
              y: met.y,
              vx: (Math.random() - 0.5) * 10,
              vy: (Math.random() - 0.5) * 10,
              size: Math.random() * 4 + 3,
              color: '#f97316', // Orange fire spark
              life: 30
            });
          }

          // Remove meteor and deplete shields completely (Instant crash / highly dangerous)
          meteors.splice(mIdx, 1);
          shieldsRef.current = Math.max(0, shieldsRef.current - 40); // Hard meteor impact
          setShields(shieldsRef.current);
          setNexiaMsg('🚨 ¡ALERTA DE COLISIÓN! Impacto de meteoro detectado en los sensores frontales. Integridad gravemente comprometida.');
        }
      });

      // Move enemies (horizontal swap and crawl)
      enemies.forEach(enemy => {
        enemy.x += enemy.direction * 0.8;
        if (enemy.x > canvas.width - enemy.width - 20 || enemy.x < 20) {
          enemy.direction *= -1;
          enemy.y += 10;
        }

        // Breach detection: reached player zone
        if (enemy.y > canvas.height - 110) {
          shieldsRef.current = 0;
          setShields(0);
        }
      });

      // Collision detection with vulnerability check
      bullets.forEach((bullet, bIdx) => {
        enemies.forEach((enemy, eIdx) => {
          if (
            bullet.x < enemy.x + enemy.width &&
            bullet.x + bullet.width > enemy.x &&
            bullet.y < enemy.y + enemy.height &&
            bullet.y + bullet.height > enemy.y
          ) {
            // Collision occurred! Remove bullet
            bullets.splice(bIdx, 1);

            // Synthesize audio context sound effects
            const playSound = (freq: number, type: OscillatorType, duration: number, gainVal = 0.08) => {
              try {
                const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                
                osc.type = type;
                osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
                if (type === 'sawtooth') {
                  osc.frequency.exponentialRampToValueAtTime(40, audioCtx.currentTime + duration);
                }
                gain.gain.setValueAtTime(gainVal, audioCtx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.005, audioCtx.currentTime + duration);
                
                osc.connect(gain);
                gain.connect(audioCtx.destination);
                osc.start();
                osc.stop(audioCtx.currentTime + duration);
              } catch (e) {}
            };

            // Verify if weapon matches weakness
            if (bullet.weapon === enemy.weaponAllowed) {
              shotsHitRef.current++;
              playSound(440, 'triangle', 0.25); // Good hit sound
              
              // Spark particles
              for (let i = 0; i < 10; i++) {
                particles.push({
                  x: enemy.x + enemy.width / 2,
                  y: enemy.y + enemy.height / 2,
                  vx: (Math.random() - 0.5) * 8,
                  vy: (Math.random() - 0.5) * 8,
                  size: Math.random() * 3 + 2,
                  color: enemy.color,
                  life: 25
                });
              }

              enemies.splice(eIdx, 1);
              scoreRef.current += enemy.points;
              setScore(scoreRef.current);
              setNexiaMsg(`✅ ¡Impacto correcto! ${enemy.type} mitigado usando ${bullet.weapon}.`);
            } else {
              // WRONG WEAPON - Penalize shields and sound alarm
              playSound(150, 'sawtooth', 0.4, 0.15); // Alarm buzzer sound
              shieldsRef.current = Math.max(0, shieldsRef.current - 15);
              setShields(shieldsRef.current);
              setNexiaMsg(`❌ ERROR DE GOBIERNO: Disparaste ${bullet.weapon} contra un ${enemy.type} (requiere ${enemy.weaponAllowed}). Carga estática recibida.`);
            }

            // Calculate precision
            const computedPrecision = Math.round((shotsHitRef.current / Math.max(1, shotsFiredRef.current)) * 100);
            setPrecision(computedPrecision);
          }
        });
      });

      // Move particles
      particles.forEach((p, index) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life--;
        if (p.life <= 0) {
          particles.splice(index, 1);
        }
      });

      // Check end game conditions
      if (shieldsRef.current <= 0) {
        cancelAnimationFrame(animationFrameId);
        setIsPlaying(false);
        onFinishGame(scoreRef.current, Math.round((shotsHitRef.current / Math.max(1, shotsFiredRef.current)) * 100));
      } else if (enemies.length === 0) {
        // Clear! Add shield bonus
        scoreRef.current += (shieldsRef.current * 10);
        setScore(scoreRef.current);
        cancelAnimationFrame(animationFrameId);
        setIsPlaying(false);
        onFinishGame(scoreRef.current, Math.round((shotsHitRef.current / Math.max(1, shotsFiredRef.current)) * 100));
      }
    };

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Stars
      ctx.fillStyle = 'rgba(255,255,255,0.15)';
      for (let i = 0; i < 20; i++) {
        const x = (Math.sin(i * 999) * 0.5 + 0.5) * canvas.width;
        const y = ((Date.now() / 20 + i * 35) % canvas.height);
        ctx.fillRect(x, y, 2, 2);
      }

      // Draw player (Nexus Guardian X1 with 3D perspective shading)
      const centerX = player.x + player.width / 2;
      const centerY = player.y + player.height / 2;

      // Base body gradient (metallic 3D silver/blue finish)
      const bodyGrad = ctx.createLinearGradient(player.x, player.y, player.x + player.width, player.y + player.height);
      bodyGrad.addColorStop(0, '#1e293b');
      bodyGrad.addColorStop(0.3, '#3b82f6');
      bodyGrad.addColorStop(0.5, '#60a5fa');
      bodyGrad.addColorStop(0.7, '#2563eb');
      bodyGrad.addColorStop(1, '#0f172a');

      ctx.fillStyle = bodyGrad;
      ctx.shadowBlur = 20;
      ctx.shadowColor = 'rgba(59, 130, 246, 0.6)';
      
      // Draw 3D wings
      ctx.beginPath();
      ctx.moveTo(centerX, player.y);
      ctx.lineTo(player.x + player.width, player.y + player.height);
      ctx.lineTo(centerX + 6, player.y + player.height - 8);
      ctx.lineTo(centerX - 6, player.y + player.height - 8);
      ctx.lineTo(player.x, player.y + player.height);
      ctx.closePath();
      ctx.fill();

      // Draw 3D center canopy (glass cabin with cyan glow)
      const canopyGrad = ctx.createLinearGradient(centerX - 6, player.y + 10, centerX + 6, player.y + 25);
      canopyGrad.addColorStop(0, '#06b6d4');
      canopyGrad.addColorStop(1, '#0891b2');
      ctx.fillStyle = canopyGrad;
      ctx.beginPath();
      ctx.moveTo(centerX, player.y + 8);
      ctx.lineTo(centerX + 6, player.y + 25);
      ctx.lineTo(centerX - 6, player.y + 25);
      ctx.closePath();
      ctx.fill();

      // Engine quantum light (3D flame thruster)
      const thrusterSize = 10 + Math.random() * 8;
      const engineGrad = ctx.createRadialGradient(centerX, player.y + player.height, 2, centerX, player.y + player.height, thrusterSize);
      engineGrad.addColorStop(0, '#ffffff');
      engineGrad.addColorStop(0.2, '#f472b6');
      engineGrad.addColorStop(0.6, '#db2777');
      engineGrad.addColorStop(1, 'rgba(219, 39, 119, 0)');
      
      ctx.fillStyle = engineGrad;
      ctx.beginPath();
      ctx.arc(centerX, player.y + player.height + 2, thrusterSize, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Draw enemies with 3D custom structures aligned to GDD
      enemies.forEach(enemy => {
        const eCenterX = enemy.x + enemy.width / 2;
        const eCenterY = enemy.y + enemy.height / 2;

        ctx.shadowBlur = 15;
        ctx.shadowColor = enemy.color;

        if (enemy.type === 'Clone Records') {
          // 👾 DUPLICATE DESTROYER: Mechanical construct with clone arms
          // Draw Main 3D Box/Core
          ctx.fillStyle = '#10b981';
          ctx.fillRect(enemy.x + 4, enemy.y + 4, enemy.width - 8, enemy.height - 8);
          // Dark overlay side for 3D depth
          ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
          ctx.fillRect(enemy.x + 4, enemy.y + 4, (enemy.width - 8) / 2, enemy.height - 8);
          
          // Draw left and right mechanical claw arms
          ctx.strokeStyle = '#34d399';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(enemy.x, enemy.y + 10);
          ctx.lineTo(enemy.x - 6, enemy.y + 16);
          ctx.lineTo(enemy.x - 2, enemy.y + 26);
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(enemy.x + enemy.width, enemy.y + 10);
          ctx.lineTo(enemy.x + enemy.width + 6, enemy.y + 16);
          ctx.lineTo(enemy.x + enemy.width + 2, enemy.y + 26);
          ctx.stroke();
        } 
        else if (enemy.type === 'Compliance Raiders') {
          // 👾 COMPLIANCE PREDATOR: Biomechanical armor & giant jaw
          ctx.fillStyle = '#eab308';
          // Draw dark helmet/armor upper
          ctx.beginPath();
          ctx.moveTo(enemy.x, enemy.y + 10);
          ctx.lineTo(eCenterX, enemy.y);
          ctx.lineTo(enemy.x + enemy.width, enemy.y + 10);
          ctx.lineTo(enemy.x + enemy.width - 6, enemy.y + 24);
          ctx.lineTo(enemy.x + 6, enemy.y + 24);
          ctx.closePath();
          ctx.fill();

          // 3D Shadow
          ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
          ctx.beginPath();
          ctx.moveTo(enemy.x, enemy.y + 10);
          ctx.lineTo(eCenterX, enemy.y);
          ctx.lineTo(eCenterX, enemy.y + 24);
          ctx.lineTo(enemy.x + 6, enemy.y + 24);
          ctx.closePath();
          ctx.fill();

          // Glowing mechanical yellow claws / jaw lines
          ctx.strokeStyle = '#facc15';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(enemy.x + 8, enemy.y + 24);
          ctx.lineTo(enemy.x + 2, enemy.y + 32);
          ctx.lineTo(eCenterX, enemy.y + 26);
          ctx.lineTo(enemy.x + enemy.width - 2, enemy.y + 32);
          ctx.lineTo(enemy.x + enemy.width - 8, enemy.y + 24);
          ctx.stroke();
        } 
        else if (enemy.type === 'Missing Fields') {
          // 👾 NULL PHANTOM: Ghostly floating shards (parpadeon en CSS/canvas)
          const isFaded = Math.sin(Date.now() / 80) > 0;
          ctx.fillStyle = isFaded ? 'rgba(6, 182, 212, 0.2)' : 'rgba(6, 182, 212, 0.85)';
          
          // Draw main floating diamond shard
          ctx.beginPath();
          ctx.moveTo(eCenterX, enemy.y);
          ctx.lineTo(enemy.x + enemy.width - 6, eCenterY);
          ctx.lineTo(eCenterX, enemy.y + enemy.height);
          ctx.lineTo(enemy.x + 6, eCenterY);
          ctx.closePath();
          ctx.fill();

          // Left facet shadow
          ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
          ctx.beginPath();
          ctx.moveTo(eCenterX, enemy.y);
          ctx.lineTo(eCenterX, enemy.y + enemy.height);
          ctx.lineTo(enemy.x + 6, eCenterY);
          ctx.closePath();
          ctx.fill();
        }
        else if (enemy.type === 'Legacy Monsters') {
          // 👾 METADATA REAPER / LEGACY MONSTER: Heavy tank / guadaña digital
          // Draw Heavy 3D Base
          ctx.fillStyle = '#8b5cf6';
          ctx.beginPath();
          ctx.moveTo(enemy.x + 8, enemy.y);
          ctx.lineTo(enemy.x + enemy.width - 8, enemy.y);
          ctx.lineTo(enemy.x + enemy.width, enemy.y + 20);
          ctx.lineTo(enemy.x + enemy.width - 4, enemy.y + enemy.height);
          ctx.lineTo(enemy.x + 4, enemy.y + enemy.height);
          ctx.lineTo(enemy.x, enemy.y + 20);
          ctx.closePath();
          ctx.fill();

          // 3D Dark Facet
          ctx.fillStyle = 'rgba(0,0,0,0.35)';
          ctx.beginPath();
          ctx.moveTo(enemy.x + 8, enemy.y);
          ctx.lineTo(eCenterX, enemy.y);
          ctx.lineTo(eCenterX, enemy.y + enemy.height);
          ctx.lineTo(enemy.x + 4, enemy.y + enemy.height);
          ctx.lineTo(enemy.x, enemy.y + 20);
          ctx.closePath();
          ctx.fill();

          // Reaper Digital Scythe Lines
          ctx.strokeStyle = '#a78bfa';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(enemy.x + 8, enemy.y + 4);
          ctx.lineTo(enemy.x - 4, enemy.y - 4);
          ctx.lineTo(enemy.x + 12, enemy.y - 4);
          ctx.stroke();
        }
        else {
          // DEFAULT 3D ALIEN: Isometric voxel structure
          ctx.fillStyle = enemy.color;
          ctx.beginPath();
          ctx.moveTo(eCenterX, enemy.y); 
          ctx.lineTo(enemy.x + enemy.width - 4, enemy.y + enemy.height / 3); 
          ctx.lineTo(enemy.x + enemy.width - 8, enemy.y + enemy.height - 4); 
          ctx.lineTo(enemy.x + 8, enemy.y + enemy.height - 4); 
          ctx.lineTo(enemy.x + 4, enemy.y + enemy.height / 3); 
          ctx.closePath();
          ctx.fill();

          ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
          ctx.beginPath();
          ctx.moveTo(eCenterX, enemy.y);
          ctx.lineTo(eCenterX, enemy.y + enemy.height - 4);
          ctx.lineTo(enemy.x + 8, enemy.y + enemy.height - 4);
          ctx.lineTo(enemy.x + 4, enemy.y + enemy.height / 3);
          ctx.closePath();
          ctx.fill();
        }

        // Glowing 3D central eye core (Vulnerability core point)
        const eyePulse = 4 + Math.sin(Date.now() / 150) * 1.5;
        const eyeGrad = ctx.createRadialGradient(eCenterX, eCenterY, 1, eCenterX, eCenterY, eyePulse);
        eyeGrad.addColorStop(0, '#ffffff');
        eyeGrad.addColorStop(0.4, enemy.color);
        eyeGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = eyeGrad;
        ctx.beginPath();
        ctx.arc(eCenterX, eCenterY, eyePulse, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Draw tactical laser beams
      bullets.forEach(bullet => {
        const weaponObj = weapons.find(w => w.name === bullet.weapon);
        const col = weaponObj ? weaponObj.color : '#ffffff';

        ctx.fillStyle = col;
        ctx.shadowBlur = 10;
        ctx.shadowColor = col;
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        ctx.shadowBlur = 0;
      });

      // Draw 3D rocky meteors
      meteors.forEach(met => {
        ctx.shadowBlur = 12;
        ctx.shadowColor = '#ea580c'; // Orange fire glow

        // Outer burning shell
        const fireGrad = ctx.createRadialGradient(met.x, met.y, met.radius - 4, met.x, met.y, met.radius + 8);
        fireGrad.addColorStop(0, '#f97316');
        fireGrad.addColorStop(0.5, '#ea580c');
        fireGrad.addColorStop(1, 'rgba(234, 88, 12, 0)');
        
        ctx.fillStyle = fireGrad;
        ctx.beginPath();
        ctx.arc(met.x, met.y, met.radius + 8, 0, Math.PI * 2);
        ctx.fill();

        // Rocky core
        const rockGrad = ctx.createLinearGradient(met.x - met.radius, met.y - met.radius, met.x + met.radius, met.y + met.radius);
        rockGrad.addColorStop(0, '#475569');
        rockGrad.addColorStop(0.7, '#1e293b');
        rockGrad.addColorStop(1, '#0f172a');
        
        ctx.fillStyle = rockGrad;
        ctx.beginPath();
        
        // Draw irregular asteroid polygon shape (5 points)
        for (let i = 0; i < 5; i++) {
          const angle = (i * Math.PI * 2) / 5;
          const rDist = met.radius + (Math.sin(i * 1234 + met.wiggleOffset) * 3);
          const px = met.x + Math.cos(angle) * rDist;
          const py = met.y + Math.sin(angle) * rDist;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
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
    shieldsRef.current = 100;
    shotsFiredRef.current = 0;
    shotsHitRef.current = 0;
    setScore(0);
    setShields(100);
    setPrecision(100);
    setIsPlaying(true);
  };

  return (
    <div className={styles.gameScreen}>
      {!isPlaying ? (
        <div className={styles.gameSplash}>
          <Rocket size={64} style={{ color: '#a855f7', filter: 'drop-shadow(0 0 15px rgba(168, 85, 247, 0.4))' }} />
          <h3 className={styles.splashTitle}>RETO DIARIO ACTIVADO</h3>
          <p className={styles.splashSubtitle}>Bahía de Despegue del Nexus Guardian X1</p>
          <p className={styles.splashDesc}>
            Para completar el reto diario debes erradicar las anomalías usando la matriz de vulnerabilidad estricta. Disparar al azar dañará tus escudos de gobernanza.
          </p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: 'rgba(255,255,255,0.02)', padding: '15px', borderRadius: '12px', fontSize: '0.8rem', border: '1px solid rgba(255,255,255,0.05)', color: '#cbd5e1', width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#10b981' }}>🟢 Regla de Calidad (Teclado 1)</span> <span>Vulnerables: Clone Records</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#06b6d4' }}>🔵 Enriquecimiento de Metadatos (Teclado 2)</span> <span>Vulnerables: Missing Fields</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#8b5cf6' }}>🟣 Data Purge / Borrado (Teclado 3)</span> <span>Vulnerables: Legacy Monsters</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#eab308' }}>🟡 Control de Cumplimiento (Teclado 4)</span> <span>Vulnerables: Compliance Raiders</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#ef4444' }}>🔴 Certificación de IA (Teclado 5)</span> <span>Vulnerables: Uncertified AI Entities</span></div>
          </div>

          <button className={styles.playBtn} onClick={startGame}>
            ▶ Iniciar Misión
          </button>
        </div>
      ) : (
        <>
          <div className={styles.gameControlsOverlay}>
            <div className={styles.gameHud}>
              <span>SCORE: {score}</span>
            </div>
            <div className={styles.gameHud}>
              <span style={{ color: shields < 40 ? '#ef4444' : '#10b981' }}>ESCUDOS DE GOBERNANZA: {shields}%</span>
            </div>
            <div className={styles.gameHud}>
              <span>PRECISIÓN: {precision}%</span>
            </div>
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
              <div className={styles.consoleStatLabel}>ARMA ACTIVA</div>
              <div className={styles.consoleStatVal} style={{ fontSize: '0.85rem', color: '#a855f7' }}>
                {activeWeapon}
              </div>
            </div>
            
            <div className={styles.consoleStatCard}>
              <div className={styles.consoleStatLabel}>SELECCIÓN DIRECTA</div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '4px' }}>
                {weapons.map((w, idx) => (
                  <button 
                    key={idx}
                    onClick={() => handleWeaponChange(idx)}
                    style={{
                      background: activeWeapon === w.name ? '#7c3aed' : 'rgba(255,255,255,0.05)',
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
              <div className={styles.consoleStatLabel}>SOBRECALENTAMIENTO</div>
              <div className={styles.consoleStatVal} style={{ color: isOverheated ? '#ef4444' : '#10b981', fontSize: '0.9rem' }}>
                {isOverheated ? 'BLOQUEADO' : 'NORMAL'}
              </div>
            </div>

            <div className={styles.consoleStatCard}>
              <div className={styles.consoleStatLabel}>FUSIBLE CUÁNTICO</div>
              <div className={styles.consoleStatVal} style={{ color: '#06b6d4', fontSize: '0.9rem' }}>ACTIVO</div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
