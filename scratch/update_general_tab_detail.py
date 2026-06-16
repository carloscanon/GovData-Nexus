filepath = "C:/Users/carlo/Desktop/GovData Nexus/src/app/policies/page.tsx"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# Target the general tab content in policies/page.tsx
# {!isEditing ? (
#   <>
#     <p><strong>Objetivo:</strong> {selectedPolicy.objective}</p>
#     <p style={{ marginTop: '24px' }}><strong>Alcance:</strong> {selectedPolicy.scope}</p>
#   </>

target_readonly = """                        {!isEditing ? (
                          <>
                            <p><strong>Objetivo:</strong> {selectedPolicy.objective}</p>
                            <p style={{ marginTop: '24px' }}><strong>Alcance:</strong> {selectedPolicy.scope}</p>
                          </>"""

replacement_readonly = """                        {!isEditing ? (
                          <>
                            <p><strong>Objetivo:</strong> {selectedPolicy.objective || 'No especificado.'}</p>
                            <p style={{ marginTop: '24px' }}><strong>Alcance (Scope):</strong> {selectedPolicy.scope || 'No especificado.'}</p>
                            <p style={{ marginTop: '24px' }}><strong>Descripción / Lineamiento Principal:</strong> {selectedPolicy.guidelines?.[0] || 'No especificada.'}</p>
                          </>"""

content = content.replace(target_readonly, replacement_readonly)

# Now target the textarea inputs in edit mode (under editForm.scope)
target_edit_textareas = """                              <div>
                                 <label className={styles.modalLabel}>Alcance (Scope)</label>
                                 <textarea 
                                   rows={4}
                                   className={styles.modalInput} 
                                   style={{ minHeight: '100px' }}
                                   value={editForm.scope}
                                   onChange={e => setEditForm({...editForm, scope: e.target.value})}
                                 />
                              </div>
                           </div>"""

replacement_edit_textareas = """                              <div>
                                 <label className={styles.modalLabel}>Alcance (Scope)</label>
                                 <textarea 
                                   rows={4}
                                   className={styles.modalInput} 
                                   style={{ minHeight: '100px' }}
                                   value={editForm.scope}
                                   onChange={e => setEditForm({...editForm, scope: e.target.value})}
                                 />
                              </div>
                              <div>
                                 <label className={styles.modalLabel}>Descripción / Lineamiento Principal</label>
                                 <textarea 
                                   rows={4}
                                   className={styles.modalInput} 
                                   style={{ minHeight: '100px' }}
                                   value={editForm.guidelines?.[0] || ''}
                                   onChange={e => {
                                     const newG = [...(editForm.guidelines || [])];
                                     newG[0] = e.target.value;
                                     setEditForm({...editForm, guidelines: newG});
                                   }}
                                 />
                              </div>
                           </div>"""

content = content.replace(target_edit_textareas, replacement_edit_textareas)

# Replace the Definitions list with a database status banner
target_defs = """                        <div style={{ marginTop: '32px', padding: '20px', background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                           <h5 style={{ margin: '0 0 12px 0', color: '#1e293b' }}>Definiciones Clave</h5>
                           <ul style={{ fontSize: '0.9rem', color: '#64748b' }}>
                              <li><strong>Dato Sensible:</strong> Aquel que afecta la intimidad del titular.</li>
                              <li><strong>PII:</strong> Personally Identifiable Information.</li>
                           </ul>
                        </div>"""

replacement_defs = """                        <div style={{ marginTop: '32px', padding: '20px', background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                           <h5 style={{ margin: '0 0 8px 0', color: '#1e293b' }}>Información de Base de Datos</h5>
                           <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b' }}>
                              Esta política está registrada activamente en la base de datos de <strong>GovData Nexus</strong> bajo el origen regulatorio: <strong>{selectedPolicy.framework_origin || 'General'}</strong>.
                           </p>
                        </div>"""

content = content.replace(target_defs, replacement_defs)

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("Policy detail General tab updated to show actual DB description, scope, and objective.")
