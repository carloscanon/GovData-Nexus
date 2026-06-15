'use client';

import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  Mail, 
  ArrowRight, 
  ShieldCheck, 
  Globe,
  Layout,
  Check,
  X,
  Award
} from 'lucide-react';
import { motion } from 'framer-motion';
import styles from './login.module.css';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { supabase } from '@/lib/supabase';

const STORAGE_KEY = 'govdata_login_config';

interface LoginPageConfig {
  backgroundMode: 'gradient' | 'image';
  headline: string;
  headlineHighlight: string;
  subtitle: string;
  feature1: string;
  feature2: string;
  feature3: string;
  gradientColorFrom: string;
  gradientColorTo: string;
  gradientAngle: string;
  overlayColorFrom: string;
  overlayColorTo: string;
  overlayOpacity: string;
  headlineColor: string;
  highlightColor: string;
  subtitleColor: string;
  featureColor: string;
  backgroundImageUrl: string;
  loginTitle: string;
  loginSubtitle: string;
  headlineSizeRem: string;
  subtitleSizeRem: string;
  featureSizeRem: string;
  loginTitleSizeRem: string;
  logoMode: 'text' | 'image';
  logoText: string;
  logoImageUrl: string;
  logoImageHeightPx: string;
  logoImageWidthPx: string;
  logoKeepRatio: boolean;
  showLogo: boolean;
  logoPosition?: 'left-panel' | 'top-right';
  enableLoginSound?: boolean;
  loginSoundUrl?: string;
  themeId?: 'classic' | 'cyberpunk' | 'luxury' | 'minimalist' | 'custom';
  fontFamily?: string;
}

const DEFAULT_CONFIG: LoginPageConfig = {
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

function getLeftBg(cfg: LoginPageConfig): React.CSSProperties {
  if (cfg.backgroundMode === 'gradient') {
    return { background: `linear-gradient(${cfg.gradientAngle}deg, ${cfg.gradientColorFrom}, ${cfg.gradientColorTo})` };
  }
  return { backgroundImage: `url(${cfg.backgroundImageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' };
}

function getOverlay(cfg: LoginPageConfig): React.CSSProperties {
  if (cfg.backgroundMode === 'gradient') return { display: 'none' };
  return {
    position: 'absolute' as const, inset: 0,
    background: `linear-gradient(135deg, ${cfg.overlayColorFrom}, ${cfg.overlayColorTo})`,
    opacity: parseFloat(cfg.overlayOpacity),
  };
}

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [view, setView] = useState<'login' | 'forgot'>('login');
  const [isSent, setIsSent] = useState(false);
  const [cfg, setCfg] = useState<LoginPageConfig>(DEFAULT_CONFIG);

  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [demoOrg, setDemoOrg] = useState('');
  const [demoName, setDemoName] = useState('');
  const [demoEmail, setDemoEmail] = useState('');
  const [demoCountryCode, setDemoCountryCode] = useState('+57');
  const [demoPhone, setDemoPhone] = useState('');
  const [demoRole, setDemoRole] = useState('');
  const [isDemoLoading, setIsDemoLoading] = useState(false);
  const [demoSuccess, setDemoSuccess] = useState(false);
  const [demoError, setDemoError] = useState('');

  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const reason = searchParams?.get('reason');

  // Load config: show localStorage cache instantly, then fetch from DB
  useEffect(() => {
    if (reason === 'inactivity') {
      setError('Su sesión ha expirado por inactividad. Por favor, ingrese de nuevo.');
    }
    // 1. Instant render from local cache
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setCfg({ ...DEFAULT_CONFIG, ...JSON.parse(saved) });
    } catch {}

    // 2. Fetch from Supabase (authoritative global config)
    const fetchFromDB = async () => {
      try {
        const { data, error } = await supabase
          .from('tenant_config')
          .select('config_value')
          .eq('tenant_id', 'global')
          .eq('config_key', 'govdata_login_config')
          .single();
        if (!error && data?.config_value) {
          const parsed = typeof data.config_value === 'string'
            ? JSON.parse(data.config_value)
            : data.config_value;
          // Sync to localStorage as cache for next load
          localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
          setCfg({ ...DEFAULT_CONFIG, ...parsed });
        }
      } catch {}
    };
    fetchFromDB();
  }, []);

  // ── Play login sound ─────────────────────────────────────────────
  const playLoginSound = (onComplete: () => void) => {
    // Use cfg state (already loaded from Supabase) instead of re-reading localStorage
    if (cfg.enableLoginSound === false) {
      onComplete();
      return;
    }

    // Custom uploaded audio file
    if (cfg.loginSoundUrl) {
      try {
        const audio = new Audio(cfg.loginSoundUrl);
        audio.volume = 0.8;
        
        let completed = false;
        const finish = () => {
          if (!completed) {
            completed = true;
            onComplete();
          }
        };

        audio.addEventListener('ended', finish);
        audio.addEventListener('error', finish);
        
        audio.play()
          .then(() => {
            // Fallback timeout of 2.5s to prevent hanging on long audio files
            setTimeout(finish, 2500);
          })
          .catch(e => {
            console.warn('Custom audio play failed:', e);
            finish();
          });
      } catch (e) {
        console.warn('Custom audio error:', e);
        onComplete();
      }
      return;
    }

    // Synthesized K.I.T.T. sound via Web Audio API
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) {
        onComplete();
        return;
      }
      const ctx = new AudioContextClass();

      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(80, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(135, ctx.currentTime + 1.3);

      filter.type = 'lowpass';
      filter.Q.setValueAtTime(18, ctx.currentTime);
      filter.frequency.setValueAtTime(180, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(1100, ctx.currentTime + 0.4);
      filter.frequency.exponentialRampToValueAtTime(260, ctx.currentTime + 0.8);
      filter.frequency.exponentialRampToValueAtTime(850, ctx.currentTime + 1.2);

      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.4);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 1.5);
      
      // Delay redirection by 1.5s to match synth duration
      setTimeout(onComplete, 1500);
    } catch (e) {
      console.warn('AudioContext failed:', e);
      onComplete();
    }
  };

  const storeUserMetadata = async (normalizedEmail: string) => {
    let role = 'user';
    let name = 'Usuario';
    let tenantId = '';

    // Solo superadmin es hardcodeado
    // IMPORTANT: tenant_id is UUID type in DB - use the global tenant UUID for superadmin
    const SUPERADMIN_TENANT_UUID = '00000000-0000-0000-0000-000000000001';
    if (normalizedEmail === 'admin@govdata.io') {
      role = 'superadmin';
      name = 'Super Admin';
      tenantId = SUPERADMIN_TENANT_UUID;
    } else {
      try {
        // Intentar obtener metadatos seguros de la sesión servidor/NextAuth
        const response = await fetch("/api/user-metadata");
        if (response.ok) {
          const meta = await response.json();
          role = meta.role || 'user';
          name = meta.name || 'Usuario';
          tenantId = meta.tenantId || '';
          if (meta.avatarUrl) localStorage.setItem('govdata_avatar_url', meta.avatarUrl);
        } else {
          // Fallback clásico directo a Supabase
          const { data, error } = await supabase
            .from('tenant_users')
            .select('name, role, tenant_id, avatar')
            .ilike('email', normalizedEmail)
            .single();

          if (data && !error) {
            role = data.role || 'user';
            name = data.name || 'Usuario';
            tenantId = data.tenant_id || '';
            if (data.avatar) localStorage.setItem('govdata_avatar_url', data.avatar);
          }
        }
      } catch (err) {
        console.error('[Login] Error fetching user metadata from API:', err);
      }
    }

    // Limpiar cache de tenants para forzar recarga fresca desde Supabase
    localStorage.removeItem('govdata_tenants');

    const mode = role === 'superadmin' ? 'DEMO' : 'ENTERPRISE';
    localStorage.setItem('govdata_mode', mode);

    localStorage.setItem('govdata_role', role);
    localStorage.setItem('govdata_user_name', name);
    localStorage.setItem('govdata_current_tenant_id', tenantId);
    localStorage.setItem('govdata_user_email', normalizedEmail);

    // Write auth cookie so Next.js middleware can protect routes server-side
    // SameSite=Strict prevents CSRF; no HttpOnly so JS can also read it client-side
    const maxAge = 8 * 60 * 60; // 8 hours
    document.cookie = `govdata_role=${role}; path=/; max-age=${maxAge}; SameSite=Strict`;


    // Create session connection log record in database table saas_connections
    try {
      // First, set any previously lingering active sessions for this user to 'Cerrada' to keep it clean
      await supabase
        .from('saas_connections')
        .update({ status: 'Cerrada', logout_time: new Date().toISOString() })
        .ilike('user_email', normalizedEmail.trim())
        .eq('status', 'Activa');

      // Detect browser client details
      const userAgent = typeof window !== 'undefined' ? window.navigator.userAgent : '';
      let browser = 'Chrome';
      if (userAgent.indexOf('Firefox') > -1) browser = 'Firefox';
      else if (userAgent.indexOf('Safari') > -1 && userAgent.indexOf('Chrome') === -1) browser = 'Safari';
      else if (userAgent.indexOf('Edge') > -1) browser = 'Edge';

      const SUPERADMIN_TENANT_UUID = '00000000-0000-0000-0000-000000000001';
      // tenant_id must be a valid UUID (not 'global' string)
      const safetenantId = (tenantId && tenantId !== 'global') ? tenantId : SUPERADMIN_TENANT_UUID;

      const { error: insertError } = await supabase.from('saas_connections').insert({
        tenant_id: safetenantId,
        user_email: normalizedEmail,
        user_name: name,
        user_role: role,
        login_time: new Date().toISOString(),
        ip_address: '186.116.15.24', // mock office IP
        browser: browser,
        os: 'Windows 11',
        device: 'Desktop PC',
        city: 'Bogotá',
        country: 'Colombia',
        status: 'Activa',
        is_suspicious: false
      });
      if (insertError) {
        console.error('[Login] Error inserting session into saas_connections:', insertError);
      } else {
        console.log('[Login] Session registered in saas_connections for:', normalizedEmail);
      }
    } catch (e) {
      console.warn('Error inserting saas_connections row on login:', e);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    const normalizedEmail = email.toLowerCase().trim();
    
    const result = await signIn('credentials', {
      redirect: false,
      email: normalizedEmail,
      password,
    });

    if (result?.error) {
      setError('Credenciales incorrectas. Por favor, verifica tu correo y contraseña.');
      setIsLoading(false);
    } else {
      await storeUserMetadata(normalizedEmail);
      playLoginSound(() => {
        window.location.href = '/';
      });
    }
  };

  const handleQuickLogin = async (quickEmail: string, quickPass: string) => {
    setEmail(quickEmail);
    setPassword(quickPass);
    setIsLoading(true);
    setError('');
    
    const normalizedEmail = quickEmail.toLowerCase().trim();
    
    const result = await signIn('credentials', {
      redirect: false,
      email: normalizedEmail,
      password: quickPass,
    });

    if (result?.error) {
      setError('Credenciales incorrectas. Por favor, verifica tu correo y contraseña.');
      setIsLoading(false);
    } else {
      await storeUserMetadata(normalizedEmail);
      playLoginSound(() => {
        window.location.href = '/';
      });
    }
  };


  const handleForgot = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSent(true);
    }, 1500);
  };

  const handleDemoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsDemoLoading(true);
    setDemoError('');

    const fullPhoneNumber = `${demoCountryCode} ${demoPhone.trim()}`;

    try {
      const { error: insertError } = await supabase
        .from('demo_requests')
        .insert({
          organization: demoOrg,
          name: demoName,
          email: demoEmail,
          phone: fullPhoneNumber,
          role: demoRole
        });

      if (insertError) throw insertError;

      setDemoSuccess(true);
      // Clear form
      setDemoOrg('');
      setDemoName('');
      setDemoEmail('');
      setDemoPhone('');
      setDemoRole('');
      setDemoCountryCode('+57');
    } catch (err: any) {
      console.error('Error submitting demo request:', err);
      setDemoError(err.message || 'Ocurrió un error al registrar la solicitud de demo. Por favor intente nuevamente.');
    } finally {
      setIsDemoLoading(false);
    }
  };

  return (
    <div className={styles.container} style={cfg.fontFamily ? { fontFamily: cfg.fontFamily } : undefined}>
      <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;700&family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Outfit:wght@400;600;800&display=swap" rel="stylesheet" />
      {/* Absolute positioned Top Right Logo */}
      {cfg.showLogo && cfg.logoPosition === 'top-right' && (
        <div className={styles.topRightLogo}>
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
              <div className={styles.logoIconDark}>GN</div>
              <span className={styles.logoTextDark}>{cfg.logoText}</span>
            </>
          )}
        </div>
      )}

      {/* Left panel — fully driven by superadmin config */}
      <div
        className={styles.leftSection}
        style={getLeftBg(cfg)}
      >
        {/* Dynamic overlay */}
        <div
          className={styles.overlay}
          style={getOverlay(cfg)}
        />
        <div className={styles.content}>
          {/* Logo */}
          {cfg.showLogo && cfg.logoPosition !== 'top-right' && (
            <div className={styles.logo}>
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
                  <div className={styles.logoIcon}>GN</div>
                  <span style={{ color: '#fff' }}>{cfg.logoText}</span>
                </>
              )}
            </div>
          )}

          {/* Headline & subtitle */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className={styles.hero}
          >
            <h1
              style={{
                fontSize: `${cfg.headlineSizeRem}rem`,
                color: cfg.headlineColor,
              }}
            >
              {cfg.headline}{' '}
              <br />
              <span style={{ color: cfg.highlightColor }}>{cfg.headlineHighlight}</span>
            </h1>
            <p
              style={{
                fontSize: `${cfg.subtitleSizeRem}rem`,
                color: cfg.subtitleColor,
              }}
            >
              {cfg.subtitle}
            </p>
          </motion.div>

          {/* Feature bullets */}
          <div className={styles.features}>
            {[cfg.feature1, cfg.feature2, cfg.feature3].filter(Boolean).map((feat, i) => (
              <div key={i} className={styles.featItem} style={{ fontSize: `${cfg.featureSizeRem}rem`, color: cfg.featureColor }}>
                <Check size={20} style={{ flexShrink: 0 }} />
                <span>{feat}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.rightSection}>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={styles.loginCard}
        >
          {view === 'login' ? (
            <>
              <div className={styles.loginHeader}>
                <h2 style={{ fontSize: `${cfg.loginTitleSizeRem}rem` }}>{cfg.loginTitle}</h2>
                <p>{cfg.loginSubtitle}</p>
              </div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className={styles.errorMsg}
                >
                  {error}
                </motion.div>
              )}

              <form onSubmit={handleLogin} className={styles.form}>
                <div className={styles.inputGroup}>
                  <label>Correo Corporativo</label>
                  <div className={styles.inputWrapper}>
                    <Mail size={18} className={styles.inputIcon} />
                    <input 
                      type="email" 
                      placeholder="ejemplo@empresa.com" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className={styles.inputGroup}>
                  <label>Contraseña</label>
                  <div className={styles.inputWrapper}>
                    <Lock size={18} className={styles.inputIcon} />
                    <input 
                      type="password" 
                      placeholder="••••••••" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className={styles.options}>
                  <label className={styles.remember}>
                    <input type="checkbox" />
                    <span>Recordarme</span>
                  </label>
                  <button type="button" onClick={() => setView('forgot')} className={styles.forgot}>¿Olvidaste tu contraseña?</button>
                </div>

                <button type="submit" className={styles.submitBtn} disabled={isLoading}>
                  {isLoading ? 'Autenticando...' : 'Iniciar Sesión'}
                  {!isLoading && <ArrowRight size={18} />}
                </button>
              </form>

              <div className={styles.divider}>
                <span>O ingresa con</span>
              </div>

              <div className={styles.ssoButtons}>
                <button 
                  className={styles.ssoBtn}
                  type="button"
                  onClick={() => signIn('azure-ad', { callbackUrl: '/' })}
                >
                  <svg className={styles.ssoIcon} viewBox="0 0 23 23" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <rect width="10" height="10" />
                    <rect x="13" width="10" height="10" />
                    <rect y="13" width="10" height="10" />
                    <rect x="13" y="13" width="10" height="10" />
                  </svg>
                  Microsoft 365
                </button>
                <button
                  className={styles.ssoBtn}
                  type="button"
                  onClick={() => signIn('google', { callbackUrl: '/' })}
                >
                  <svg className={styles.ssoIcon} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  Google Workspace
                </button>
              </div>
            </>
          ) : (
            <>
              <div className={styles.loginHeader}>
                <h2>Recuperar Contraseña</h2>
                <p>Te enviaremos un código de acceso a tu correo corporativo.</p>
              </div>

              {!isSent ? (
                <form onSubmit={handleForgot} className={styles.form}>
                  <div className={styles.inputGroup}>
                    <label>Correo Corporativo</label>
                    <div className={styles.inputWrapper}>
                      <Mail size={18} className={styles.inputIcon} />
                      <input 
                        type="email" 
                        placeholder="ejemplo@empresa.com" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <button type="submit" className={styles.submitBtn} disabled={isLoading}>
                    {isLoading ? 'Enviando...' : 'Enviar Instrucciones'}
                    {!isLoading && <ArrowRight size={18} />}
                  </button>

                  <button type="button" onClick={() => setView('login')} className={styles.backBtn}>
                    Volver al inicio de sesión
                  </button>
                </form>
              ) : (
                <div className={styles.successView}>
                   <div className={styles.successIcon}>
                      <ShieldCheck size={40} />
                   </div>
                   <h3>Instrucciones Enviadas</h3>
                   <p>Si el correo <strong>{email}</strong> está registrado, recibirás un enlace de recuperación en unos minutos.</p>
                   <button onClick={() => { setView('login'); setIsSent(false); }} className={styles.primaryBtn} style={{ width: '100%', marginTop: '20px' }}>
                      Volver al Login
                   </button>
                </div>
              )}
            </>
          )}

          <p className={styles.footer}>
            ¿No tienes acceso? <a href="#">Contacta a Soporte TI</a>
          </p>

          <div className={styles.demoCalloutCard}>
            <div className={styles.demoCalloutText}>
              <h4>¿Quieres conocer la plataforma?</h4>
              <p>Solicita una demostración guiada y personalizada para tu organización.</p>
            </div>
            <button 
              type="button" 
              className={styles.demoPrimaryBtn} 
              onClick={() => { setDemoSuccess(false); setDemoError(''); setIsDemoModalOpen(true); }}
            >
              Solicitar una Demo
            </button>
          </div>
        </motion.div>
      </div>

      {/* Demo Modal */}
      {isDemoModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsDemoModalOpen(false)}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={styles.modalContent} 
            style={{ maxWidth: '550px', padding: 0, overflow: 'hidden' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ padding: '20px 32px', background: '#4f46e5', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ padding: '8px', background: 'rgba(255,255,255,0.2)', borderRadius: '10px', display: 'flex' }}>
                  <Award size={22} />
                </div>
                <h3 style={{ margin: 0, color: 'white', fontSize: '1.15rem', fontWeight: 800 }}>Solicitar una Demo</h3>
              </div>
              <button onClick={() => setIsDemoModalOpen(false)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', padding: '6px', borderRadius: '8px', cursor: 'pointer', color: 'white', display: 'flex' }}>
                <X size={18} />
              </button>
            </div>
            
            {demoSuccess ? (
              <div style={{ padding: '32px', textAlign: 'center' }}>
                <div className={styles.successIcon} style={{ margin: '0 auto 20px' }}>
                  <ShieldCheck size={40} />
                </div>
                <h3 style={{ fontSize: '1.4rem', color: '#1e293b', marginBottom: '8px', fontWeight: 800 }}>¡Solicitud Registrada!</h3>
                <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: 1.5, margin: '0 0 24px 0' }}>
                  Tu solicitud de demo ha sido procesada con éxito. Un especialista de GovData Nexus se pondrá en contacto contigo muy pronto.
                </p>
                <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '16px 32px', borderTop: '1px solid #e2e8f0', background: '#f8fafc', margin: '32px -32px -32px -32px' }}>
                  <button 
                    onClick={() => setIsDemoModalOpen(false)} 
                    className={styles.primaryBtn} 
                    style={{ minWidth: '120px' }}
                  >
                    Entendido
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleDemoSubmit}>
                <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <p style={{ margin: '0 0 8px 0', fontSize: '0.92rem', color: '#64748b', lineHeight: 1.5 }}>
                    Completa tus datos a continuación y un consultor te contactará para coordinar una sesión personalizada.
                  </p>

                  {demoError && (
                    <div className={styles.errorMsg} style={{ marginBottom: 0 }}>
                      {demoError}
                    </div>
                  )}

                  <div className={styles.inputGroup}>
                    <label>Organización / Empresa</label>
                    <input 
                      type="text" 
                      placeholder="Nombre de la empresa" 
                      value={demoOrg}
                      onChange={(e) => setDemoOrg(e.target.value)}
                      required
                      className={styles.modalInput}
                    />
                  </div>

                  <div className={styles.inputGroup}>
                    <label>Nombre Completo</label>
                    <input 
                      type="text" 
                      placeholder="Tu nombre y apellido" 
                      value={demoName}
                      onChange={(e) => setDemoName(e.target.value)}
                      required
                      className={styles.modalInput}
                    />
                  </div>

                  <div className={styles.inputGroup}>
                    <label>Correo Corporativo</label>
                    <input 
                      type="email" 
                      placeholder="ejemplo@empresa.com" 
                      value={demoEmail}
                      onChange={(e) => setDemoEmail(e.target.value)}
                      required
                      className={styles.modalInput}
                    />
                  </div>

                  <div className={styles.inputGroup}>
                    <label>Teléfono de Contacto</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <select 
                        value={demoCountryCode} 
                        onChange={(e) => setDemoCountryCode(e.target.value)}
                        className={styles.modalSelect}
                        style={{ width: '95px', flexShrink: 0 }}
                      >
                        <option value="+57">🇨🇴 +57</option>
                        <option value="+1">🇺🇸 +1</option>
                        <option value="+52">🇲🇽 +52</option>
                        <option value="+34">🇪🇸 +34</option>
                        <option value="+54">🇦🇷 +54</option>
                        <option value="+56">🇨🇱 +56</option>
                        <option value="+51">🇵🇪 +51</option>
                        <option value="+58">🇻🇪 +58</option>
                        <option value="+ec">🇪🇨 +593</option>
                        <option value="+506">🇨🇷 +506</option>
                      </select>
                      <input 
                        type="tel" 
                        placeholder="300 000 0000" 
                        value={demoPhone}
                        onChange={(e) => setDemoPhone(e.target.value)}
                        required
                        className={styles.modalInput}
                      />
                    </div>
                  </div>

                  <div className={styles.inputGroup}>
                    <label>Cargo / Rol</label>
                    <input 
                      type="text" 
                      placeholder="Ej: Director de Datos, CIO, CDO" 
                      value={demoRole}
                      onChange={(e) => setDemoRole(e.target.value)}
                      required
                      className={styles.modalInput}
                    />
                  </div>
                </div>

                {/* Modal Footer with buttons */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', padding: '16px 32px', borderTop: '1px solid #e2e8f0', background: '#f8fafc' }}>
                  <button 
                    type="button" 
                    onClick={() => setIsDemoModalOpen(false)} 
                    className={styles.backBtn}
                    style={{ margin: 0, padding: '10px 16px' }}
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    className={styles.primaryBtn} 
                    disabled={isDemoLoading}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '160px', justifyContent: 'center' }}
                  >
                    {isDemoLoading ? 'Registrando...' : 'Enviar Solicitud'}
                    {!isDemoLoading && <ArrowRight size={16} />}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}
