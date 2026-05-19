'use client';

import React, { useState } from 'react';
import { MessageSquare, X, Send, Bot, Sparkles, MinusCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './AIAssistant.module.css';

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'bot', text: 'Hola Carlos, soy Nexus AI. ¿En qué puedo ayudarte hoy con el gobierno de tus datos?' }
  ]);
  const [input, setInput] = useState('');

  const [isTyping, setIsTyping] = useState(false);

  const getAiResponse = (query: string) => {
    const q = query.toLowerCase();
    if (q.includes('riesgo')) return "Actualmente he detectado 5 riesgos de alto impacto. 3 están relacionados con la falta de dueños en el catálogo y 2 con brechas de seguridad en el Maestro de Clientes.";
    if (q.includes('calidad')) return "El índice de calidad global es del 87%. He notado una caída del 4% en el dominio 'Finanzas' debido a duplicidad de registros en el último cierre.";
    if (q.includes('política') || q.includes('normativa')) return "Tienes 24 políticas activas. Hay 3 políticas de 'Retención de Datos' que vencen el próximo mes. ¿Deseas que inicie un borrador de actualización?";
    if (q.includes('seguridad') || q.includes('acceso')) return "Se han detectado 12 intentos de acceso fallidos desde IPs no habituales. Recomiendo activar el MFA obligatorio para el grupo de Data Stewards.";
    if (q.includes('hola') || q.includes('quien eres')) return "¡Hola! Soy Nexus AI, tu co-piloto de gobierno de datos. Puedo ayudarte a analizar riesgos, monitorear la calidad o redactar políticas normativas.";
    return "Interesante consulta. Como asistente de gobierno, puedo analizar esa tendencia si me proporcionas más detalles sobre el activo o dominio afectado.";
  };

  const handleSend = () => {
    if (!input.trim() || isTyping) return;
    
    const userMsg = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    const currentInput = input;
    setInput('');
    setIsTyping(true);
    
    // Simulate AI thinking
    setTimeout(() => {
      const response = getAiResponse(currentInput);
      setMessages(prev => [...prev, { role: 'bot', text: response }]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className={styles.wrapper}>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={styles.chatWindow}
          >
            <div className={styles.header}>
              <div className={styles.headerInfo}>
                <div className={styles.botIcon}>
                  <Bot size={20} />
                </div>
                <div>
                  <h3>Nexus AI</h3>
                  <p>Asistente de Gobierno</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)}><X size={20} /></button>
            </div>

            <div className={styles.messages}>
              {messages.map((msg, i) => (
                <div key={i} className={`${styles.message} ${styles[msg.role]}`}>
                  <div className={styles.messageBubble}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className={`${styles.message} ${styles.bot}`}>
                  <div className={styles.messageBubble} style={{ display: 'flex', gap: '4px', padding: '10px 15px' }}>
                    <span className={styles.dot}></span>
                    <span className={styles.dot}></span>
                    <span className={styles.dot}></span>
                  </div>
                </div>
              )}
            </div>

            <div className={styles.footer}>
              <div className={styles.inputWrapper}>
                <input 
                  type="text" 
                  placeholder="Escribe tu consulta..." 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                />
                <button onClick={handleSend} className={styles.sendBtn}>
                  <Send size={18} />
                </button>
              </div>
              <div className={styles.suggestions}>
                <button className={styles.suggestBtn}>Resumir riesgos</button>
                <button className={styles.suggestBtn}>Estado calidad</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button 
        className={`${styles.toggleBtn} ${isOpen ? styles.active : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <MinusCircle size={28} /> : <MessageSquare size={28} />}
        {!isOpen && <div className={styles.badge}><Sparkles size={12} /> AI</div>}
      </button>
    </div>
  );
}
