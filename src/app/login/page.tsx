'use client';

import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  Mail, 
  ArrowRight, 
  ShieldCheck, 
  Globe,
  Layout,
  Check
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

  // Load superadmin login config from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setCfg({ ...DEFAULT_CONFIG, ...JSON.parse(saved) });
    } catch {}
  }, []);

  const storeUserMetadata = async (normalizedEmail: string) => {
    let role = 'user';
    let name = 'Usuario';
    let tenantId = '';

    // Solo superadmin es hardcodeado
    if (normalizedEmail === 'admin@govdata.io') {
      role = 'superadmin';
      name = 'Super Admin';
      tenantId = 'global';
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
            .select('name, role, tenant_id, avatar_url')
            .ilike('email', normalizedEmail)
            .single();

          if (data && !error) {
            role = data.role || 'user';
            name = data.name || 'Usuario';
            tenantId = data.tenant_id || '';
            if (data.avatar_url) localStorage.setItem('govdata_avatar_url', data.avatar_url);
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
      window.location.href = '/';
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
      window.location.href = '/';
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
    <div className={styles.container}>
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
          {cfg.showLogo && (
            <div className={styles.logo}>
              {cfg.logoMode === 'image' && cfg.logoImageUrl ? (
                <img
                  src={cfg.logoImageUrl}
                  alt="logo"
                  style={{
                    height: `${cfg.logoImageHeightPx}px`,
                    width: cfg.logoImageWidthPx === 'auto' ? 'auto' : `${cfg.logoImageWidthPx}px`,
                    maxWidth: '280px',
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
                  <img src="https://authjs.dev/img/providers/microsoft.svg" alt="Microsoft" />
                  Microsoft 365
                </button>
                <button className={styles.ssoBtn} type="button">
                  <img src="https://authjs.dev/img/providers/google.svg" alt="Google" />
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
            onClick={(e) => e.stopPropagation()}
          >
            <button className={styles.closeBtn} onClick={() => setIsDemoModalOpen(false)}>&times;</button>
            
            {demoSuccess ? (
              <div className={styles.successView}>
                <div className={styles.successIcon}>
                  <ShieldCheck size={40} />
                </div>
                <h3>Solicitud Enviada</h3>
                <p>Tu solicitud de demo ha sido registrada con éxito. Nos pondremos en contacto contigo pronto.</p>
                <button 
                  onClick={() => setIsDemoModalOpen(false)} 
                  className={styles.submitBtn} 
                  style={{ width: '100%', marginTop: '24px' }}
                >
                  Cerrar
                </button>
              </div>
            ) : (
              <>
                <div className={styles.modalHeader}>
                  <h3>Solicitar una Demo</h3>
                  <p>Completa tus datos y un especialista te contactará.</p>
                </div>

                {demoError && (
                  <div className={styles.errorMsg}>
                    {demoError}
                  </div>
                )}

                <form onSubmit={handleDemoSubmit} className={styles.form}>
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
                      placeholder="Tu nombre" 
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
                        style={{ width: '100px', flexShrink: 0 }}
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
                      placeholder="Ej: Director de Datos" 
                      value={demoRole}
                      onChange={(e) => setDemoRole(e.target.value)}
                      required
                      className={styles.modalInput}
                    />
                  </div>

                  <button type="submit" className={styles.submitBtn} disabled={isDemoLoading}>
                    {isDemoLoading ? 'Registrando...' : 'Enviar Solicitud'}
                    {!isDemoLoading && <ArrowRight size={18} />}
                  </button>
                </form>
              </>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}
