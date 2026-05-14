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

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages([...messages, { role: 'user', text: input }]);
    setInput('');
    
    // Simulate AI response
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: 'bot', 
        text: 'Analizando activos... He encontrado 3 riesgos críticos en el Maestro de Clientes que requieren tu aprobación para mitigación.' 
      }]);
    }, 1000);
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
