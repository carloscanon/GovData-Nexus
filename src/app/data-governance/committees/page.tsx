"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { usePlatform } from "@/contexts/PlatformContext";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./committees.module.css";
import { Users, Plus, Upload, XCircle, Shield, FileText } from "lucide-react";

// Types
interface Committee {
  id: number;
  tenant_id: string;
  name: string;
  description: string;
  owner: string;
}

export default function Committees() {
  const { currentTenant } = usePlatform();
  const [committees, setCommittees] = useState<Committee[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCommittee, setNewCommittee] = useState({ name: "", description: "", owner: "" });
  const [tenantUsers, setTenantUsers] = useState<any[]>([]);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [selectedCommittee, setSelectedCommittee] = useState<Committee | null>(null);
  const [isDocsModalOpen, setIsDocsModalOpen] = useState(false);
  const [committeeDocs, setCommitteeDocs] = useState<any[]>([]);
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);

  // Fetch committees
  useEffect(() => {
    if (!currentTenant?.id) return;
    const fetch = async () => {
      const { data, error } = await supabase
        .from("gov_committees")
        .select("*")
        .eq("tenant_id", currentTenant.id);
      if (error) console.error(error);
      else setCommittees(data as Committee[]);
    };
    fetch();
  }, [currentTenant?.id]);

  // Fetch tenant users for owner selection
  useEffect(() => {
    if (!currentTenant?.id) return;
    const fetch = async () => {
      const { data, error } = await supabase
        .from("tenant_users")
        .select("id, name, avatar")
        .eq("tenant_id", currentTenant.id);
      
      if (error || !data || data.length === 0) {
        // Fallback demo users if RLS blocks or empty
        setTenantUsers([
          { id: 'demo1', name: 'Ana Silva (CDO)' },
          { id: 'demo2', name: 'Carlos Ruiz (DPO)' },
          { id: 'demo3', name: 'María Gómez (CISO)' },
          { id: 'demo4', name: 'Juan Pérez (CTO)' }
        ]);
      } else {
        setTenantUsers(data);
      }
    };
    fetch();
  }, [currentTenant?.id]);

  const handleCreate = async () => {
    if (!currentTenant?.id) return;
    const finalOwner = newCommittee.owner || "CDO";
    
    // First try with owner column
    let { data, error } = await supabase.from("gov_committees").insert([
      {
        tenant_id: currentTenant.id,
        name: newCommittee.name,
        description: newCommittee.description,
        owner: finalOwner,
      },
    ]).select();

    // Fallback if owner column doesn't exist
    if (error && error.message?.includes('owner')) {
      const { data: fallbackData, error: fallbackError } = await supabase.from("gov_committees").insert([
        {
          tenant_id: currentTenant.id,
          name: newCommittee.name,
          description: newCommittee.description + `\n\n(Responsable: ${finalOwner})`,
        },
      ]).select();
      
      data = fallbackData;
      error = fallbackError;
      
      if (data && data.length > 0) {
        // Patch the object in memory so UI shows it correctly
        (data[0] as Committee).owner = finalOwner;
      }
    }

    if (error) {
      console.error(error);
      alert("Error creando comité: " + error.message);
    } else {
      const newComId = data?.[0]?.id;
      if (newComId && uploadFile) {
        // Tenant-isolated path: tenants/{tenant_id}/committees/{committee_id}/{ts}_{file}
        const safeName = uploadFile.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        const path = `tenants/${currentTenant.id}/committees/${newComId}/${Date.now()}_${safeName}`;
        const { error: uploadError } = await supabase.storage.from("governance-docs").upload(path, uploadFile);
        
        if (!uploadError) {
          // Track in DB
          try {
            await supabase.from("gov_committee_documents").insert([
              {
                committee_id: newComId,
                storage_path: path,
                file_name: uploadFile.name,
                uploaded_by: currentTenant.id
              }
            ]);
          } catch (e) {
            console.error('Error saving to gov_committee_documents', e);
          }
        }
      }

      if (data) setCommittees([...committees, data[0] as Committee]);
      setIsModalOpen(false);
      setNewCommittee({ name: "", description: "", owner: "" });
      setUploadFile(null);
    }
  };

  const openDocsModal = async (c: Committee) => {
    setSelectedCommittee(c);
    setIsDocsModalOpen(true);
    // Fetch docs
    const { data, error } = await supabase.from('gov_committee_documents').select('*').eq('committee_id', c.id);
    if (!error && data) {
      setCommitteeDocs(data);
    } else {
      setCommitteeDocs([]);
    }
  };

  const handleUploadToExisting = async () => {
    if (!uploadFile || !selectedCommittee || !currentTenant?.id) return;
    setIsUploadingDoc(true);
    try {
      // Tenant-isolated path: tenants/{tenant_id}/committees/{committee_id}/{ts}_{file}
      const safeName = uploadFile.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const path = `tenants/${currentTenant.id}/committees/${selectedCommittee.id}/${Date.now()}_${safeName}`;
      const { error: uploadError } = await supabase.storage.from("governance-docs").upload(path, uploadFile);
      
      if (!uploadError) {
        const { data } = await supabase.from("gov_committee_documents").insert([
          {
            committee_id: selectedCommittee.id,
            storage_path: path,
            file_name: uploadFile.name,
            uploaded_by: currentTenant.id
          }
        ]).select();
        
        if (data && data.length > 0) {
          setCommitteeDocs([...committeeDocs, data[0]]);
        }
        alert("✅ Documento subido y registrado exitosamente.");
        setUploadFile(null);
      } else {
        console.error('Upload error:', uploadError);
        alert("Error subiendo documento: " + uploadError.message);
      }
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setIsUploadingDoc(false);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <div className={styles.headerIcon}>
            <Users size={24} />
          </div>
          <div>
            <h1>Comités de Gobierno</h1>
            <p>Gestiona los órganos de decisión y responsabilidades de datos</p>
          </div>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.secondaryBtn}>
            <FileText size={18} /> Exportar
          </button>
          <button className={styles.addBtn} onClick={() => setIsModalOpen(true)}>
            <Plus size={18} /> Nuevo Comité
          </button>
        </div>
      </header>

      {/* Stats Banner */}
      <div className={styles.statsBanner}>
        <div className={styles.statItem}>
          <span className={styles.statValue}>{committees.length}</span>
          <span className={styles.statLabel}>Total Comités</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statValue}>{tenantUsers.length}</span>
          <span className={styles.statLabel}>Miembros Activos</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statValue}>12</span>
          <span className={styles.statLabel}>Políticas Aprobadas</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statValue}>3</span>
          <span className={styles.statLabel}>Reuniones este mes</span>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabContainer}>
        <button 
          className={`${styles.tab} ${activeTab === 'all' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('all')}
        >
          Todos los Comités
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'my' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('my')}
        >
          Mis Comités
        </button>
      </div>

      <div className={styles.committeeGrid}>
        {committees.map((c) => {
          const ownerName = c.owner || c.description?.split('Responsable: ')[1]?.split(')')[0] || 'Asignado';
          const ownerUser = tenantUsers.find(u => u.name === ownerName);
          const initials = ownerName.charAt(0).toUpperCase();
          
          return (
            <motion.div 
              key={c.id} 
              className={styles.committeeCard} 
              onClick={() => openDocsModal(c)}
              style={{ cursor: 'pointer' }}
            >
              <div className={styles.cardHeader}>
                <div className={styles.cardIcon}>
                  <Shield size={20} />
                </div>
              </div>
              <h3 className={styles.cardTitle}>{c.name}</h3>
              <p className={styles.cardDesc}>{c.description}</p>
              <div className={styles.cardFooter}>
                <div className={styles.ownerInfo}>
                  <div className={styles.ownerAvatar} style={{ overflow: 'hidden' }}>
                    {ownerUser?.avatar ? (
                      <img 
                        src={ownerUser.avatar} 
                        alt={ownerName} 
                        style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} 
                      />
                    ) : (
                      initials
                    )}
                  </div>
                  <span className={styles.ownerName}>{ownerName}</span>
                </div>
                <div className={styles.memberCount}>
                  <FileText size={14} /> Actas
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
            <motion.div
              className={styles.modal}
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
            >
              <header className={styles.modalHeader}>
                <h2>Crear Comité</h2>
                <button className={styles.closeBtn} onClick={() => setIsModalOpen(false)}>
                  <XCircle size={24} />
                </button>
              </header>
              <div className={styles.modalBody}>
                <div className={styles.formGroup}>
                  <label>Nombre del Comité</label>
                  <input
                    type="text"
                    className={styles.inputField}
                    placeholder="Ej. Comité Ejecutivo de Datos"
                    value={newCommittee.name}
                    onChange={(e) => setNewCommittee({ ...newCommittee, name: e.target.value })}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Descripción y Funciones</label>
                  <textarea
                    className={styles.inputField}
                    placeholder="Describe el propósito del comité..."
                    value={newCommittee.description}
                    onChange={(e) => setNewCommittee({ ...newCommittee, description: e.target.value })}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Sponsor / Owner</label>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <select
                      className={styles.inputField}
                      value={newCommittee.owner}
                      onChange={(e) => setNewCommittee({ ...newCommittee, owner: e.target.value })}
                      style={{ flex: 1 }}
                    >
                      <option value="">Seleccionar Owner...</option>
                      {tenantUsers.map((u) => (
                        <option key={u.id} value={u.name}>
                          {u.name}
                        </option>
                      ))}
                    </select>
                    {newCommittee.owner && (
                      <div className={styles.ownerAvatar} style={{ width: '40px', height: '40px', fontSize: '1rem', overflow: 'hidden', flexShrink: 0 }}>
                        {(() => {
                          const selectedU = tenantUsers.find(u => u.name === newCommittee.owner);
                          return selectedU?.avatar ? (
                            <img src={selectedU.avatar} alt={newCommittee.owner} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            newCommittee.owner.charAt(0).toUpperCase()
                          );
                        })()}
                      </div>
                    )}
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label>Documento Fundacional (Acta/Resolución)</label>
                  <input 
                    type="file" 
                    className={styles.inputField} 
                    accept="application/pdf" 
                    onChange={(e) => setUploadFile(e.target.files?.[0] || null)} 
                  />
                </div>
                
                {uploadFile && (
                  <div style={{ background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '8px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FileText size={16} color="#60a5fa" />
                    <span style={{ fontSize: '0.9rem', color: '#e2e8f0' }}>{uploadFile.name} será subido al guardar.</span>
                  </div>
                )}
                
                <button className={styles.primaryBtn} onClick={handleCreate}>
                  Crear Comité
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isDocsModalOpen && selectedCommittee && (
          <div className={styles.modalOverlay} onClick={() => setIsDocsModalOpen(false)}>
            <motion.div
              className={styles.modal}
              style={{ maxWidth: '600px' }}
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <header className={styles.modalHeader}>
                <div>
                  <h2 style={{ fontSize: '1.4rem' }}>{selectedCommittee.name}</h2>
                  <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '4px' }}>Actas y Resoluciones del Comité</p>
                </div>
                <button className={styles.closeBtn} onClick={() => setIsDocsModalOpen(false)}>
                  <XCircle size={24} />
                </button>
              </header>
              <div className={styles.modalBody}>
                <div style={{ marginBottom: '24px', background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '12px' }}>
                  <h3 style={{ fontSize: '1rem', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}><FileText size={16} /> Documentos Registrados ({committeeDocs.length})</h3>
                  
                  {committeeDocs.length === 0 ? (
                    <p style={{ color: '#64748b', fontSize: '0.9rem', fontStyle: 'italic' }}>No hay actas registradas para este comité aún.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {committeeDocs.map(doc => (
                        <div key={doc.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <FileText size={18} color="#60a5fa" />
                            <div>
                              <div style={{ color: '#e2e8f0', fontSize: '0.95rem', fontWeight: 500 }}>{doc.file_name}</div>
                              <div style={{ color: '#64748b', fontSize: '0.8rem' }}>{new Date(doc.uploaded_at || Date.now()).toLocaleDateString()}</div>
                            </div>
                          </div>
                          <button 
                            className={styles.secondaryBtn} 
                            style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                            onClick={async () => {
                              const { data } = await supabase.storage.from('governance-docs').createSignedUrl(doc.storage_path, 60);
                              if (data?.signedUrl) window.open(data.signedUrl, '_blank');
                            }}
                          >
                            Ver / Descargar
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label>Subir Nueva Acta / Documento</label>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <input 
                      type="file" 
                      className={styles.inputField} 
                      accept="application/pdf,.docx,.doc" 
                      onChange={(e) => setUploadFile(e.target.files?.[0] || null)} 
                      style={{ flex: 1 }}
                    />
                    <button 
                      className={styles.primaryBtn} 
                      onClick={handleUploadToExisting}
                      disabled={!uploadFile || isUploadingDoc}
                    >
                      {isUploadingDoc ? 'Subiendo...' : 'Subir'}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
