"use client";

import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { usePlatform } from "@/contexts/PlatformContext";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./committees.module.css";
import { Users, Plus, Upload, XCircle, Shield, FileText, Trash2, Edit3, Calendar, Download } from "lucide-react";

// Types
interface Committee {
  id: number;
  tenant_id: string;
  name: string;
  description: string;
  owner: string;
  docCount?: number;
}

interface CommitteeDoc {
  id: number;
  committee_id: number;
  storage_path: string;
  file_name: string;
  uploaded_by: string;
  uploaded_at?: string;
  topic?: string;
  meeting_date?: string;
}

export default function Committees() {
  const { currentTenant } = usePlatform();
  const [committees, setCommittees] = useState<Committee[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCommittee, setEditingCommittee] = useState<Committee | null>(null);
  const [newCommittee, setNewCommittee] = useState({ name: "", description: "", owner: "" });
  const [tenantUsers, setTenantUsers] = useState<any[]>([]);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [selectedCommittee, setSelectedCommittee] = useState<Committee | null>(null);
  const [isDocsModalOpen, setIsDocsModalOpen] = useState(false);
  const [committeeDocs, setCommitteeDocs] = useState<CommitteeDoc[]>([]);
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [totalDocs, setTotalDocs] = useState(0);
  const [docTopic, setDocTopic] = useState("");
  const [docMeetingDate, setDocMeetingDate] = useState("");

  const fetchCommittees = useCallback(async () => {
    if (!currentTenant?.id) return;
    const { data, error } = await supabase
      .from("gov_committees")
      .select("*")
      .eq("tenant_id", currentTenant.id)
      .order("id", { ascending: false });
    
    if (error) {
      console.error("Error fetching committees:", error);
      return;
    }

    // Fetch doc counts per committee
    const committeeList = (data as Committee[]) || [];
    if (committeeList.length > 0) {
      const { data: docsData } = await supabase
        .from("gov_committee_documents")
        .select("committee_id");
      
      const countMap: Record<number, number> = {};
      (docsData || []).forEach((d: any) => {
        countMap[d.committee_id] = (countMap[d.committee_id] || 0) + 1;
      });

      const enriched = committeeList.map(c => ({ ...c, docCount: countMap[c.id] || 0 }));
      setCommittees(enriched);
      setTotalDocs(Object.values(countMap).reduce((a, b) => a + b, 0));
    } else {
      setCommittees([]);
    }
  }, [currentTenant?.id]);

  useEffect(() => {
    fetchCommittees();
  }, [fetchCommittees]);

  // Fetch tenant users for owner selection
  useEffect(() => {
    if (!currentTenant?.id) return;
    const fetch = async () => {
      const { data, error } = await supabase
        .from("tenant_users")
        .select("id, name, avatar")
        .eq("tenant_id", currentTenant.id);
      
      if (error || !data || data.length === 0) {
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
    if (!currentTenant?.id || !newCommittee.name.trim()) {
      alert("El nombre del comité es obligatorio.");
      return;
    }
    setIsCreating(true);
    try {
      const finalOwner = newCommittee.owner || "CDO";
      
      const { data, error } = await supabase.from("gov_committees").insert([
        {
          tenant_id: currentTenant.id,
          name: newCommittee.name.trim(),
          description: newCommittee.description.trim(),
          owner: finalOwner,
        },
      ]).select();

      if (error) {
        // Fallback if owner column doesn't exist
        if (error.message?.includes('owner')) {
          const { data: fallbackData, error: fallbackError } = await supabase.from("gov_committees").insert([
            {
              tenant_id: currentTenant.id,
              name: newCommittee.name.trim(),
              description: newCommittee.description.trim() + `\n\n(Responsable: ${finalOwner})`,
            },
          ]).select();
          if (fallbackError) throw fallbackError;
          if (fallbackData && fallbackData.length > 0) {
            (fallbackData[0] as Committee).owner = finalOwner;
            await handleDocUpload(fallbackData[0].id);
            await fetchCommittees();
          }
        } else {
          throw error;
        }
      } else if (data && data.length > 0) {
        await handleDocUpload(data[0].id);
        await fetchCommittees();
      }

      setIsModalOpen(false);
      setNewCommittee({ name: "", description: "", owner: "" });
      setUploadFile(null);
    } catch (e: any) {
      console.error("Error creating committee:", e);
      alert("Error creando comité: " + e.message);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDocUpload = async (committeeId: number) => {
    if (!uploadFile || !currentTenant?.id) return;
    const safeName = uploadFile.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const path = `tenants/${currentTenant.id}/committees/${committeeId}/${Date.now()}_${safeName}`;
    const { error: uploadError } = await supabase.storage.from("governance-docs").upload(path, uploadFile);
    
    if (!uploadError) {
      await supabase.from("gov_committee_documents").insert([
        {
          committee_id: committeeId,
          storage_path: path,
          file_name: uploadFile.name,
          uploaded_by: currentTenant.id,
          topic: "Documento Fundacional / Acta de Constitución",
          meeting_date: new Date().toISOString()
        }
      ]);
    } else {
      console.error("Doc upload error:", uploadError);
      alert("Comité creado, pero hubo un error al subir el documento: " + uploadError.message);
    }
  };

  const handleDeleteCommittee = async (c: Committee) => {
    if (!confirm(`¿Eliminar el comité "${c.name}" y todos sus documentos? Esta acción no se puede deshacer.`)) return;
    try {
      // Delete associated docs from storage
      const { data: docs } = await supabase
        .from("gov_committee_documents")
        .select("storage_path")
        .eq("committee_id", c.id);
      
      if (docs && docs.length > 0) {
        await supabase.storage.from("governance-docs").remove(docs.map((d: any) => d.storage_path));
        await supabase.from("gov_committee_documents").delete().eq("committee_id", c.id);
      }

      const { error } = await supabase.from("gov_committees").delete().eq("id", c.id);
      if (error) throw error;

      setCommittees(prev => prev.filter(x => x.id !== c.id));
      if (isDocsModalOpen && selectedCommittee?.id === c.id) {
        setIsDocsModalOpen(false);
        setSelectedCommittee(null);
      }
    } catch (e: any) {
      alert("Error eliminando comité: " + e.message);
    }
  };

  const handleUpdateCommittee = async () => {
    if (!editingCommittee) return;
    try {
      const { error } = await supabase.from("gov_committees").update({
        name: editingCommittee.name,
        description: editingCommittee.description,
        owner: editingCommittee.owner,
      }).eq("id", editingCommittee.id);
      if (error) throw error;
      setCommittees(prev => prev.map(c => c.id === editingCommittee.id ? { ...c, ...editingCommittee } : c));
      setIsEditModalOpen(false);
      setEditingCommittee(null);
    } catch (e: any) {
      alert("Error actualizando comité: " + e.message);
    }
  };

  const openDocsModal = async (c: Committee) => {
    setSelectedCommittee(c);
    setIsDocsModalOpen(true);
    setCommitteeDocs([]);
    const { data, error } = await supabase
      .from('gov_committee_documents')
      .select('*')
      .eq('committee_id', c.id)
      .order('id', { ascending: false });
    if (!error && data) setCommitteeDocs(data as CommitteeDoc[]);
  };

  const handleUploadToExisting = async () => {
    if (!uploadFile || !selectedCommittee || !currentTenant?.id) return;
    setIsUploadingDoc(true);
    try {
      const safeName = uploadFile.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const path = `tenants/${currentTenant.id}/committees/${selectedCommittee.id}/${Date.now()}_${safeName}`;
      const { error: uploadError } = await supabase.storage.from("governance-docs").upload(path, uploadFile);
      
      if (uploadError) {
        throw new Error(uploadError.message);
      }

      const { data } = await supabase.from("gov_committee_documents").insert([
        {
          committee_id: selectedCommittee.id,
          storage_path: path,
          file_name: uploadFile.name,
          uploaded_by: currentTenant.id,
          topic: docTopic.trim() || null,
          meeting_date: docMeetingDate ? new Date(docMeetingDate).toISOString() : new Date().toISOString()
        }
      ]).select();
      
      if (data && data.length > 0) {
        setCommitteeDocs(prev => [data[0] as CommitteeDoc, ...prev]);
        // Update the card's doc count
        setCommittees(prev => prev.map(c => 
          c.id === selectedCommittee.id ? { ...c, docCount: (c.docCount || 0) + 1 } : c
        ));
      }
      alert("✅ Acta registrada y guardada en base de datos exitosamente.");
      setUploadFile(null);
      setDocTopic("");
      setDocMeetingDate("");
    } catch (e: any) {
      alert("Error subiendo documento: " + e.message);
    } finally {
      setIsUploadingDoc(false);
    }
  };

  const handleDeleteDoc = async (doc: CommitteeDoc) => {
    if (!confirm(`¿Eliminar el documento "${doc.file_name}"?`)) return;
    try {
      await supabase.storage.from("governance-docs").remove([doc.storage_path]);
      await supabase.from("gov_committee_documents").delete().eq("id", doc.id);
      setCommitteeDocs(prev => prev.filter(d => d.id !== doc.id));
      setCommittees(prev => prev.map(c =>
        c.id === doc.committee_id ? { ...c, docCount: Math.max(0, (c.docCount || 1) - 1) } : c
      ));
    } catch (e: any) {
      alert("Error eliminando documento: " + e.message);
    }
  };

  const downloadDoc = async (doc: CommitteeDoc) => {
    const { data } = await supabase.storage.from('governance-docs').createSignedUrl(doc.storage_path, 300);
    if (data?.signedUrl) window.open(data.signedUrl, '_blank');
  };

  const displayedCommittees = activeTab === 'my'
    ? committees.filter(c => tenantUsers.some(u => u.name === c.owner))
    : committees;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <div className={styles.headerIcon}>
            <Users size={24} />
          </div>
          <div>
            <h1>Comités de Gobierno</h1>
            <p>Gestiona los órganos de decisión, actas y responsabilidades de datos</p>
          </div>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.secondaryBtn} onClick={() => {
            if (committees.length === 0) { alert("No hay comités para exportar."); return; }
            const rows = [['Comité','Descripción','Responsable','Documentos']];
            committees.forEach(c => rows.push([c.name, c.description, c.owner, String(c.docCount || 0)]));
            const csv = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n');
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a'); a.href = url; a.download = 'comites.csv'; a.click();
          }}>
            <FileText size={18} /> Exportar CSV
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
          <span className={styles.statValue}>{totalDocs}</span>
          <span className={styles.statLabel}>Actas Registradas</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statValue}>{tenantUsers.length}</span>
          <span className={styles.statLabel}>Miembros Activos</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statValue}>{committees.filter(c => (c.docCount || 0) > 0).length}</span>
          <span className={styles.statLabel}>Con Documentación</span>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabContainer}>
        <button 
          className={`${styles.tab} ${activeTab === 'all' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('all')}
        >
          Todos los Comités ({committees.length})
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'my' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('my')}
        >
          Con Documentación ({committees.filter(c => (c.docCount || 0) > 0).length})
        </button>
      </div>

      {/* Committee Grid */}
      {displayedCommittees.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}><Shield size={36} /></div>
          <h3>No hay comités registrados</h3>
          <p>Crea el primer comité de gobierno para comenzar a gestionar actas y resoluciones.</p>
          <button className={styles.addBtn} onClick={() => setIsModalOpen(true)}>
            <Plus size={18} /> Crear Primer Comité
          </button>
        </div>
      ) : (
        <div className={styles.committeeGrid}>
          {displayedCommittees.map((c, index) => {
            const ownerUser = tenantUsers.find(u => u.name === c.owner);
            const initials = (c.owner || 'C').charAt(0).toUpperCase();
            
            // Gradients and visual theme per card to make it friendly & colorful
            const palettes = [
              { from: "#6366f1", to: "#a855f7", border: "rgba(168,85,247,0.3)", shadow: "rgba(168,85,247,0.25)", bg: "rgba(99,102,241,0.05)", iconBg: "rgba(168,85,247,0.15)", iconColor: "#a855f7", textTheme: "#a5b4fc" },
              { from: "#10b981", to: "#06b6d4", border: "rgba(6,182,212,0.3)", shadow: "rgba(6,182,212,0.25)", bg: "rgba(16,185,129,0.05)", iconBg: "rgba(6,182,212,0.15)", iconColor: "#06b6d4", textTheme: "#34d399" },
              { from: "#f59e0b", to: "#ef4444", border: "rgba(239,68,68,0.3)", shadow: "rgba(239,68,68,0.25)", bg: "rgba(245,158,11,0.05)", iconBg: "rgba(239,68,68,0.15)", iconColor: "#ef4444", textTheme: "#fcd34d" },
              { from: "#ec4899", to: "#8b5cf6", border: "rgba(139,92,246,0.3)", shadow: "rgba(139,92,246,0.25)", bg: "rgba(236,72,153,0.05)", iconBg: "rgba(139,92,246,0.15)", iconColor: "#8b5cf6", textTheme: "#fbcfe8" },
              { from: "#3b82f6", to: "#06b6d4", border: "rgba(59,130,246,0.3)", shadow: "rgba(59,130,246,0.25)", bg: "rgba(59,130,246,0.05)", iconBg: "rgba(59,130,246,0.15)", iconColor: "#3b82f6", textTheme: "#93c5fd" },
            ];
            const theme = palettes[index % palettes.length];

            return (
              <motion.div 
                key={c.id} 
                className={styles.committeeCard}
                whileHover={{ y: -6, boxShadow: `0 16px 30px -10px ${theme.shadow}`, borderColor: theme.from }}
                style={{ background: 'linear-gradient(135deg, #111216 0%, #050608 100%)', border: `1px solid ${theme.border}` }}
                transition={{ duration: 0.2 }}
              >
                <div className={styles.cardAccent} style={{ background: `linear-gradient(90deg, ${theme.from}, ${theme.to})`, opacity: 1, height: '5px' }} />
                <div className={styles.cardHeader}>
                  <div className={styles.cardIcon} style={{ background: theme.iconBg, color: theme.iconColor }}><Shield size={20} /></div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      onClick={(e) => { e.stopPropagation(); setEditingCommittee({ ...c }); setIsEditModalOpen(true); }}
                      style={{ width: '30px', height: '30px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s, color 0.2s' }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; e.currentTarget.style.color = '#fff'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#94a3b8'; }}
                      title="Editar comité"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteCommittee(c); }}
                      style={{ width: '30px', height: '30px', borderRadius: '8px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s, color 0.2s' }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.25)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; }}
                      title="Eliminar comité"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <h3 className={styles.cardTitle} style={{ color: '#ffffff', textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>{c.name}</h3>
                <p className={styles.cardDesc} style={{ color: '#cbd5e1' }}>{c.description || 'Sin descripción.'}</p>
                <div className={styles.cardFooter} style={{ borderTop: `1px solid rgba(255,255,255,0.06)` }}>
                  <div className={styles.ownerInfo}>
                    <div className={styles.ownerAvatar} style={{ overflow: 'hidden', background: `linear-gradient(135deg, ${theme.from}, ${theme.to})` }}>
                      {ownerUser?.avatar && ownerUser.avatar.startsWith('http') ? (
                        <img src={ownerUser.avatar} alt={c.owner} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                      ) : (
                        initials
                      )}
                    </div>
                    <span className={styles.ownerName} style={{ color: theme.textTheme }}>{c.owner || 'Sin asignar'}</span>
                  </div>
                  <button
                    className={styles.memberCount}
                    onClick={() => openDocsModal(c)}
                    style={{ cursor: 'pointer', background: theme.iconBg, border: `1px solid rgba(255,255,255,0.05)`, display: 'flex', alignItems: 'center', gap: '6px', color: theme.iconColor, fontWeight: 700, fontSize: '0.85rem', padding: '6px 14px', borderRadius: '9999px', transition: 'transform 0.2s, background 0.2s' }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.background = `linear-gradient(135deg, ${theme.from}, ${theme.to})`; e.currentTarget.style.color = '#fff'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.background = theme.iconBg; e.currentTarget.style.color = theme.iconColor; }}
                  >
                    <FileText size={14} /> {c.docCount || 0} Sesiones
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Modal: Crear Comité */}
      <AnimatePresence>
        {isModalOpen && (
          <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
            <motion.div
              className={styles.modal}
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
            >
              <header className={styles.modalHeader}>
                <h2>Crear Nuevo Comité</h2>
                <button className={styles.closeBtn} onClick={() => setIsModalOpen(false)}>
                  <XCircle size={24} />
                </button>
              </header>
              <div className={styles.modalBody}>
                <div className={styles.formGroup}>
                  <label>Nombre del Comité *</label>
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
                    style={{ minHeight: '80px', resize: 'vertical' }}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Sponsor / Responsable</label>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <select
                      className={styles.inputField}
                      value={newCommittee.owner}
                      onChange={(e) => setNewCommittee({ ...newCommittee, owner: e.target.value })}
                      style={{ flex: 1 }}
                    >
                      <option value="">Seleccionar Responsable...</option>
                      {tenantUsers.map((u) => (
                        <option key={u.id} value={u.name}>{u.name}</option>
                      ))}
                    </select>
                    {newCommittee.owner && (
                      <div className={styles.ownerAvatar} style={{ width: '40px', height: '40px', fontSize: '1rem', overflow: 'hidden', flexShrink: 0 }}>
                        {(() => {
                          const selectedU = tenantUsers.find(u => u.name === newCommittee.owner);
                          return selectedU?.avatar && selectedU.avatar.startsWith('http') ? (
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
                  <label>Documento Fundacional (Acta / Resolución)</label>
                  <input 
                    type="file" 
                    className={styles.inputField} 
                    accept="application/pdf,.docx,.doc" 
                    onChange={(e) => setUploadFile(e.target.files?.[0] || null)} 
                  />
                  {uploadFile && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px', padding: '10px', background: 'rgba(99,102,241,0.1)', borderRadius: '8px' }}>
                      <FileText size={16} color="#a5b4fc" />
                      <span style={{ fontSize: '0.88rem', color: '#a5b4fc' }}>{uploadFile.name}</span>
                    </div>
                  )}
                </div>
                
                <button className={styles.primaryBtn} onClick={handleCreate} disabled={isCreating} style={{ width: '100%', justifyContent: 'center', marginTop: '8px' }}>
                  {isCreating ? '⏳ Guardando...' : <><Plus size={16} /> Crear Comité</>}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Editar Comité */}
      <AnimatePresence>
        {isEditModalOpen && editingCommittee && (
          <div className={styles.modalOverlay} onClick={() => setIsEditModalOpen(false)}>
            <motion.div
              className={styles.modal}
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <header className={styles.modalHeader}>
                <h2>Editar Comité</h2>
                <button className={styles.closeBtn} onClick={() => setIsEditModalOpen(false)}>
                  <XCircle size={24} />
                </button>
              </header>
              <div className={styles.modalBody}>
                <div className={styles.formGroup}>
                  <label>Nombre del Comité *</label>
                  <input
                    type="text"
                    className={styles.inputField}
                    value={editingCommittee.name}
                    onChange={(e) => setEditingCommittee({ ...editingCommittee, name: e.target.value })}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Descripción</label>
                  <textarea
                    className={styles.inputField}
                    value={editingCommittee.description}
                    onChange={(e) => setEditingCommittee({ ...editingCommittee, description: e.target.value })}
                    style={{ minHeight: '80px', resize: 'vertical' }}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Responsable</label>
                  <select
                    className={styles.inputField}
                    value={editingCommittee.owner}
                    onChange={(e) => setEditingCommittee({ ...editingCommittee, owner: e.target.value })}
                  >
                    <option value="">Sin asignar</option>
                    {tenantUsers.map((u) => (
                      <option key={u.id} value={u.name}>{u.name}</option>
                    ))}
                  </select>
                </div>
                <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                  <button className={styles.secondaryBtn} onClick={() => setIsEditModalOpen(false)} style={{ flex: 1, justifyContent: 'center' }}>Cancelar</button>
                  <button className={styles.primaryBtn} onClick={handleUpdateCommittee} style={{ flex: 1, justifyContent: 'center' }}>Guardar Cambios</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Actas del Comité */}
      <AnimatePresence>
        {isDocsModalOpen && selectedCommittee && (
          <div className={styles.modalOverlay} onClick={() => setIsDocsModalOpen(false)}>
            <motion.div
              className={styles.modal}
              style={{ maxWidth: '680px' }}
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <header className={styles.modalHeader}>
                <div>
                  <h2 style={{ fontSize: '1.35rem' }}>{selectedCommittee.name}</h2>
                  <p style={{ color: '#94a3b8', fontSize: '0.88rem', marginTop: '4px' }}>
                    Actas, Resoluciones y Documentos del Comité
                  </p>
                </div>
                <button className={styles.closeBtn} onClick={() => setIsDocsModalOpen(false)}>
                  <XCircle size={24} />
                </button>
              </header>
              <div className={styles.modalBody}>
                {/* Documents list */}
                <div style={{ marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FileText size={14} /> Documentos Registrados ({committeeDocs.length})
                  </h3>
                  
                  {committeeDocs.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '32px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px dashed rgba(255,255,255,0.08)' }}>
                      <FileText size={32} color="#475569" style={{ marginBottom: '12px' }} />
                      <p style={{ color: '#64748b', fontSize: '0.9rem' }}>No hay actas ni sesiones registradas aún.<br />Sube el primer documento abajo.</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '280px', overflowY: 'auto' }}>
                      {committeeDocs.map(doc => {
                        const meetingDateFormatted = doc.meeting_date 
                          ? new Date(doc.meeting_date).toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' }) 
                          : doc.uploaded_at 
                          ? new Date(doc.uploaded_at).toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' })
                          : 'Fecha no disponible';
                        return (
                          <div key={doc.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'rgba(255,255,255,0.04)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #6366f1, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <FileText size={16} color="white" />
                              </div>
                              <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                <div style={{ color: '#e2e8f0', fontSize: '0.92rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {doc.topic || doc.file_name}
                                </div>
                                {doc.topic && (
                                  <div style={{ color: '#94a3b8', fontSize: '0.78rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    Archivo: {doc.file_name}
                                  </div>
                                )}
                                <div style={{ color: '#38bdf8', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px', fontWeight: 600 }}>
                                  <Calendar size={11} />
                                  Sesión: {meetingDateFormatted}
                                </div>
                              </div>
                            </div>
                            <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                              <button
                                onClick={() => downloadDoc(doc)}
                                style={{ padding: '6px 12px', borderRadius: '8px', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', color: '#a5b4fc', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}
                              >
                                <Download size={13} /> Ver
                              </button>
                              <button
                                onClick={() => handleDeleteDoc(doc)}
                                style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                title="Eliminar documento"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Upload new doc */}
                <div style={{ padding: '20px', background: 'rgba(99,102,241,0.06)', borderRadius: '16px', border: '1px dashed rgba(99,102,241,0.25)', marginTop: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '12px', fontWeight: 700, color: '#a5b4fc', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    <Upload size={14} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
                    Registrar Nueva Sesión (Acta / Resolución)
                  </label>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '0.75rem', color: '#cbd5e1', fontWeight: 600 }}>Tema / Asunto Principal</label>
                      <input 
                        type="text"
                        placeholder="Ej. Aprobación Políticas de Datos"
                        className={styles.inputField}
                        value={docTopic}
                        onChange={(e) => setDocTopic(e.target.value)}
                        style={{ padding: '8px 12px', fontSize: '0.88rem' }}
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '0.75rem', color: '#cbd5e1', fontWeight: 600 }}>Fecha de la Sesión</label>
                      <input 
                        type="date"
                        className={styles.inputField}
                        value={docMeetingDate}
                        onChange={(e) => setDocMeetingDate(e.target.value)}
                        style={{ padding: '8px 12px', fontSize: '0.88rem' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <input 
                      type="file" 
                      className={styles.inputField} 
                      accept="application/pdf,.docx,.doc,.xlsx" 
                      onChange={(e) => setUploadFile(e.target.files?.[0] || null)} 
                      style={{ flex: 1, padding: '8px 12px', fontSize: '0.88rem' }}
                    />
                    <button 
                      className={styles.primaryBtn} 
                      onClick={handleUploadToExisting}
                      disabled={!uploadFile || isUploadingDoc}
                      style={{ flexShrink: 0, padding: '10px 20px', marginTop: 0 }}
                    >
                      {isUploadingDoc ? '⏳ Subiendo...' : <><Upload size={14} /> Registrar</>}
                    </button>
                  </div>
                  {uploadFile && (
                    <div style={{ marginTop: '8px', fontSize: '0.82rem', color: '#94a3b8' }}>
                      📄 {uploadFile.name} · {(uploadFile.size / 1024).toFixed(0)} KB
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
