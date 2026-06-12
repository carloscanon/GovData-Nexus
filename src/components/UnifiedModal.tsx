'use client';

import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Award, AlertTriangle, CheckCircle, Info, ShieldAlert } from 'lucide-react';
import { usePlatform, ModalConfig } from '@/contexts/PlatformContext';

interface UnifiedModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  type?: 'informativa' | 'confirmacion' | 'formulario';
  onConfirm?: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmBtnType?: 'primary' | 'danger' | 'warning';
  icon?: React.ReactNode;
  children?: React.ReactNode;
  footerButtons?: React.ReactNode;
  configOverride?: Partial<ModalConfig>;
}

export default function UnifiedModal({
  isOpen,
  onClose,
  title,
  subtitle,
  type = 'informativa',
  onConfirm,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  confirmBtnType = 'primary',
  icon,
  children,
  footerButtons,
  configOverride,
}: UnifiedModalProps) {
  const { modalConfig: contextConfig } = usePlatform();
  const modalRef = useRef<HTMLDivElement>(null);

  // Combine global config with any module-specific overrides
  const config: ModalConfig = {
    ...contextConfig,
    ...configOverride,
  };

  // Close on ESC handler
  useEffect(() => {
    if (!isOpen || !config.closeOnEsc) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, config.closeOnEsc, onClose]);

  // Focus trap for WCAG accessibility
  useEffect(() => {
    if (!isOpen) return;

    // Focus the first focusable element inside the modal
    const focusableElements = modalRef.current?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex="0"]'
    );
    if (focusableElements && focusableElements.length > 0) {
      (focusableElements[0] as HTMLElement).focus();
    }
  }, [isOpen]);

  // Default icon based on type if none is provided
  const getDefaultIcon = () => {
    if (icon) return icon;
    switch (type) {
      case 'confirmacion':
        return <AlertTriangle size={24} />;
      case 'formulario':
        return <Info size={24} />;
      default:
        return <Award size={24} />;
    }
  };

  // Get confirm button background color based on confirmBtnType config
  const getConfirmBtnStyle = () => {
    let bg = config.btnPrimaryBg;
    let text = config.btnPrimaryText;

    if (confirmBtnType === 'danger') {
      bg = config.btnDangerBg;
      text = config.btnDangerText;
    } else if (confirmBtnType === 'warning') {
      bg = config.btnWarningBg;
      text = config.btnWarningText;
    }

    return {
      background: bg,
      color: text,
      border: 'none',
    };
  };

  if (!isOpen) return null;

  // Custom animation variants based on layout type
  const getAnimationVariants = () => {
    if (config.layoutType === 'lateral') {
      return {
        initial: { x: '100%', opacity: 0.8 },
        animate: { x: 0, opacity: 1 },
        exit: { x: '100%', opacity: 0.8 },
      };
    }
    if (config.layoutType === 'fullscreen') {
      return {
        initial: { scale: 1, y: '100%' },
        animate: { scale: 1, y: 0 },
        exit: { scale: 1, y: '100%' },
      };
    }
    // Centered transition
    return {
      initial: { scale: 0.9, y: 20, opacity: 0 },
      animate: { scale: 1, y: 0, opacity: 1 },
      exit: { scale: 0.9, y: 20, opacity: 0 },
    };
  };

  // Layout-specific wrapper styles
  const getLayoutStyles = () => {
    switch (config.layoutType) {
      case 'lateral':
        return {
          position: 'absolute' as const,
          top: 0,
          right: 0,
          width: config.width || '450px',
          height: '100vh',
          maxHeight: '100vh',
          borderRadius: '0px',
          margin: 0,
        };
      case 'fullscreen':
        return {
          position: 'absolute' as const,
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          maxWidth: '100vw',
          maxHeight: '100vh',
          borderRadius: '0px',
          margin: 0,
        };
      default: // Centered
        return {
          width: config.width || '600px',
          height: config.height || 'auto',
          minHeight: config.minHeight || 'auto',
          maxHeight: config.maxHeight || '90vh',
          borderRadius: config.borderRadius || '24px',
          margin: '20px',
        };
    }
  };

  const layoutStyles = getLayoutStyles();

  return (
    <AnimatePresence>
      <div
        className="unified-modal-overlay"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: `${config.overlayBg}${Math.round(config.overlayOpacity * 255).toString(16).padStart(2, '0')}`,
          backdropFilter: `blur(${config.overlayBlur})`,
          zIndex: 1000,
          display: 'flex',
          justifyContent: 'center',
          alignItems: config.layoutType === 'centered' ? 'center' : 'flex-start',
          overflow: 'hidden',
        }}
        onClick={() => {
          if (config.overlayClickClose) {
            onClose();
          }
        }}
      >
        <style dangerouslySetInnerHTML={{__html: `
          .unified-modal-overlay .primaryBtn,
          .unified-modal-overlay button.primary-btn-override,
          .unified-modal-overlay button[class*="primaryBtn"] {
            background: var(--modal-btn-primary-bg) !important;
            color: var(--modal-btn-primary-text) !important;
            border-radius: var(--modal-btn-border-radius) !important;
            transition: all 0.2s ease;
          }
          .unified-modal-overlay .primaryBtn:hover,
          .unified-modal-overlay button.primary-btn-override:hover,
          .unified-modal-overlay button[class*="primaryBtn"]:hover {
            opacity: 0.9 !important;
            transform: translateY(-1px) !important;
          }
          .unified-modal-overlay .secondaryBtn,
          .unified-modal-overlay button.secondary-btn-override,
          .unified-modal-overlay label.secondaryBtn,
          .unified-modal-overlay button[class*="secondaryBtn"] {
            background: var(--modal-btn-secondary-bg) !important;
            color: var(--modal-btn-secondary-text) !important;
            border-radius: var(--modal-btn-border-radius) !important;
            border: 1px solid var(--modal-border-color) !important;
            transition: all 0.2s ease;
          }
          .unified-modal-overlay .secondaryBtn:hover,
          .unified-modal-overlay button.secondary-btn-override:hover,
          .unified-modal-overlay label.secondaryBtn:hover,
          .unified-modal-overlay button[class*="secondaryBtn"]:hover {
            opacity: 0.9 !important;
            background: var(--modal-btn-secondary-bg) !important;
            filter: brightness(0.95) !important;
          }
          /* Estilo para los inputs, selectores y textareas del modal */
          .unified-modal-overlay input, 
          .unified-modal-overlay select, 
          .unified-modal-overlay textarea {
            border-color: var(--modal-border-color) !important;
            font-family: inherit !important;
          }
        `}} />
        <motion.div
          ref={modalRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          aria-describedby="modal-subtitle"
          variants={getAnimationVariants()}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          onClick={(e) => e.stopPropagation()}
          drag={config.isDraggable}
          dragMomentum={false}
          style={{
            background: config.bg,
            borderWidth: config.borderWidth,
            borderColor: config.borderColor,
            borderStyle: config.borderStyle,
            boxShadow: config.shadow,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            opacity: config.opacity,
            fontFamily: config.contentFontFamily,
            color: config.contentTextColor,
            fontSize: config.contentFontSize,
            userSelect: config.isDraggable ? 'none' : 'auto',
            // CSS Variables for child consumption
            '--modal-bg': config.bg,
            '--modal-border-color': config.borderColor,
            '--modal-text-color': config.contentTextColor,
            '--modal-header-bg': config.headerBg,
            '--modal-header-text': config.headerTextColor,
            '--modal-btn-primary-bg': config.btnPrimaryBg,
            '--modal-btn-primary-text': config.btnPrimaryText,
            '--modal-btn-secondary-bg': config.btnSecondaryBg,
            '--modal-btn-secondary-text': config.btnSecondaryText,
            '--modal-btn-border-radius': config.btnBorderRadius,
            ...layoutStyles,
          } as any}
        >
          {/* Header */}
          {config.showHeader && (
            <div
              className="unified-modal-header"
              style={{
                padding: '20px 32px',
                background: config.headerBg,
                color: config.headerTextColor,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: config.headerBg === 'transparent' || config.headerBg === config.bg ? `1px solid ${config.borderColor}` : 'none',
                cursor: config.isDraggable ? 'move' : 'default',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  width: '100%',
                  justifyContent: config.headerAlignment === 'center' ? 'center' : config.headerAlignment === 'right' ? 'flex-end' : 'flex-start',
                }}
              >
                {config.showIcon && (
                  <div
                    style={{
                      padding: '8px',
                      background: 'rgba(255, 255, 255, 0.2)',
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: config.headerTextColor,
                    }}
                  >
                    {getDefaultIcon()}
                  </div>
                )}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <h3
                    id="modal-title"
                    style={{
                      margin: 0,
                      color: config.headerTextColor,
                      fontSize: config.headerFontSize,
                      fontWeight: Number(config.headerFontWeight) || 800,
                    }}
                  >
                    {title}
                  </h3>
                  {subtitle && (
                    <p
                      id="modal-subtitle"
                      style={{
                        margin: '2px 0 0 0',
                        color: config.headerTextColor === '#ffffff' ? 'rgba(255,255,255,0.75)' : '#64748b',
                        fontSize: '0.8rem',
                        fontWeight: 400,
                      }}
                    >
                      {subtitle}
                    </p>
                  )}
                </div>
              </div>

              <button
                onClick={onClose}
                aria-label="Cerrar modal"
                style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  border: 'none',
                  padding: '8px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  color: config.headerTextColor,
                  display: 'flex',
                  marginLeft: '16px',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)')}
              >
                <X size={18} />
              </button>
            </div>
          )}

          {/* Body Content */}
          <div
            className="unified-modal-body"
            style={{
              flex: 1,
              padding: config.contentPadding,
              overflowY: 'auto',
              lineHeight: config.contentLineHeight,
              margin: config.contentMargin,
            }}
          >
            {children}
          </div>

          {/* Footer */}
          {config.showFooter && (
            <div
              className="unified-modal-footer"
              style={{
                padding: config.footerPadding,
                borderTop: `1px solid ${config.borderColor}`,
                background: '#f8fafc',
                display: 'flex',
                justifyContent: config.footerAlign === 'center' ? 'center' : config.footerAlign === 'left' ? 'flex-start' : 'flex-end',
                gap: '12px',
              }}
            >
              {footerButtons ? (
                footerButtons
              ) : (
                <>
                  {type !== 'informativa' && (
                    <button
                      onClick={onClose}
                      style={{
                        background: config.btnSecondaryBg,
                        color: config.btnSecondaryText,
                        border: '1px solid #cbd5e1',
                        borderRadius: config.btnBorderRadius,
                        padding: config.btnSize === 'lg' ? '12px 24px' : config.btnSize === 'sm' ? '6px 12px' : '8px 16px',
                        cursor: 'pointer',
                        fontWeight: 600,
                        fontSize: config.btnSize === 'lg' ? '1rem' : config.btnSize === 'sm' ? '0.8rem' : '0.9rem',
                      }}
                    >
                      {cancelLabel}
                    </button>
                  )}
                  <button
                    onClick={onConfirm || onClose}
                    style={{
                      ...getConfirmBtnStyle(),
                      borderRadius: config.btnBorderRadius,
                      padding: config.btnSize === 'lg' ? '12px 24px' : config.btnSize === 'sm' ? '6px 12px' : '8px 16px',
                      cursor: 'pointer',
                      fontWeight: 600,
                      fontSize: config.btnSize === 'lg' ? '1rem' : config.btnSize === 'sm' ? '0.8rem' : '0.9rem',
                    }}
                  >
                    {confirmLabel}
                  </button>
                </>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
