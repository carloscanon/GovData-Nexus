'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Sparkles, Bot, User } from 'lucide-react';
import styles from './AIAssistant.module.css';

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: '¡Hola! Soy Nexus AI. ¿En qué puedo ayudarte hoy con el gobierno de tus datos?', type: 'bot' }
  ]);
  const [input, setInput] = useState('');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { id: Date.now(), text: input, type: 'user' };
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    // Simular respuesta
    setTimeout(() => {
      const botMsg = { 
        id: Date.now() + 1, 
        text: 'Analizando el catálogo... He encontrado que el "Maestro de Clientes" tiene un 94% de calidad, pero hay 452 correos nulos en Salesforce que requieren atención.', 
        type: 'bot' 
      };
      setMessages(prev => [...prev, botMsg]);
    }, 1000);
  };

  return (
    <div className={styles.container}>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className={styles.chatWindow}
          >
            <div className={styles.chatHeader}>
              <div className={styles.headerTitle}>
                <Sparkles size={18} className={styles.sparkle} />
                <span>Nexus AI Assistant</span>
              </div>
              <button onClick={() => setIsOpen(false)} className={styles.closeBtn}>
                <X size={18} />
              </button>
            </div>

            <div className={styles.messageList}>
              {messages.map(msg => (
                <div key={msg.id} className={`${styles.message} ${styles[msg.type]}`}>
                  <div className={styles.msgIcon}>
                    {msg.type === 'bot' ? <Bot size={14} /> : <User size={14} />}
                  </div>
                  <div className={styles.msgText}>{msg.text}</div>
                </div>
              ))}
            </div>

            <form onSubmit={handleSend} className={styles.inputArea}>
              <input 
                type="text" 
                placeholder="Pregunta sobre riesgos, calidad..." 
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <button type="submit" className={styles.sendBtn}>
                <Send size={18} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button 
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className={styles.launcher}
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
        <div className={styles.launcherBadge}>IA</div>
      </motion.button>
    </div>
  );
}
