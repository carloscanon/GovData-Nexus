'use client';

import React, { useState } from 'react';
import { 
  Lock, 
  Mail, 
  ArrowRight, 
  ShieldCheck, 
  Globe,
  Layout
} from 'lucide-react';
import { motion } from 'framer-motion';
import styles from './login.module.css';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [view, setView] = useState<'login' | 'forgot'>('login');
  const [isSent, setIsSent] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      // Hardcoded superadmin login
      if (email === 'admin@govdata.io' && password === 'admin123') {
        localStorage.setItem('govdata_role', 'superadmin');
        localStorage.setItem('govdata_user_name', 'Super Admin');
        window.location.href = '/';
        return;
      }

      // Consultar en Supabase
      const { data, error } = await supabase
        .from('tenant_users')
        .select('*')
        .eq('email', email)
        .eq('password', password)
        .single();

      if (error || !data) {
        setIsLoading(false);
        setError('Credenciales incorrectas. Por favor, verifica tu correo y contraseña.');
        return;
      }

      // Set tenant ID and role from user data so the dashboard loads their company
      localStorage.setItem('govdata_role', 'user');
      localStorage.setItem('govdata_user_name', data.name);
      localStorage.setItem('govdata_current_tenant_id', data.tenant_id);
      window.location.href = '/';
    } catch (err) {
      console.error('Login error:', err);
      setIsLoading(false);
      setError('Error de red. Intenta nuevamente.');
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

  return (
    <div className={styles.container}>
      <div className={styles.leftSection}>
        <div className={styles.overlay}></div>
        <div className={styles.content}>
          <div className={styles.logo}>
            <div className={styles.logoIcon}>GN</div>
            <span>GovData Nexus</span>
          </div>
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className={styles.hero}
          >
            <h1>La nueva era del <br/><span>Gobierno de Datos</span></h1>
            <p>Centraliza el control, garantiza la calidad y potencia la toma de decisiones estratégicas en un solo lugar.</p>
          </motion.div>
          
          <div className={styles.features}>
            <div className={styles.featItem}>
              <ShieldCheck size={20} />
              <span>Seguridad Nivel Enterprise</span>
            </div>
            <div className={styles.featItem}>
              <Globe size={20} />
              <span>Cumplimiento Global</span>
            </div>
            <div className={styles.featItem}>
              <Layout size={20} />
              <span>UX/UI de Próxima Generación</span>
            </div>
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
                <h2>Bienvenido</h2>
                <p>Ingresa tus credenciales corporativas</p>
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
                <button className={styles.ssoBtn}>
                  <img src="https://authjs.dev/img/providers/microsoft.svg" alt="Microsoft" />
                  Microsoft 365
                </button>
                <button className={styles.ssoBtn}>
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
        </motion.div>
      </div>
    </div>
  );
}
