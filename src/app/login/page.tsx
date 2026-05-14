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

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    window.location.href = '/';
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
          <div className={styles.loginHeader}>
            <h2>Bienvenido</h2>
            <p>Ingresa tus credenciales corporativas</p>
          </div>

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
              <a href="#" className={styles.forgot}>¿Olvidaste tu contraseña?</a>
            </div>

            <button type="submit" className={styles.submitBtn}>
              Iniciar Sesión
              <ArrowRight size={18} />
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

          <p className={styles.footer}>
            ¿No tienes acceso? <a href="#">Contacta a Soporte TI</a>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
