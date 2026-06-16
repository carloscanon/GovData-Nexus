import re

filepath = "C:/Users/carlo/Desktop/GovData Nexus/src/app/policies/page.tsx"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# We want to replace lines 1344-1349 (0-indexed lines 1343 to 1348):
# '                      </div>\n'
# '                      <div>\n'
# "                         <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '8px' }}>Auditor Designado</label>\n"
# '                         <select \n'
# '        )}\n'
# '      </AnimatePresence>\n'

target = """                      </div>
                      <div>
                         <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '8px' }}>Auditor Designado</label>
                         <select \n        )}
      </AnimatePresence>"""

replacement = """                      </div>
                      <div>
                         <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '8px' }}>Auditor Designado</label>
                         <select 
                           style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}
                           value={newPolicy.auditor_designado}
                           onChange={e => setNewPolicy({...newPolicy, auditor_designado: e.target.value})}
                         >
                            {companyUsers.map((m, i) => (
                              <option key={i} value={`${m.name} (${m.role || 'Usuario'})`}>{m.name} ({m.role || 'Usuario'})</option>
                            ))}
                         </select>
                      </div>
                   </div>
                </div>
                <div className="styles_footer__abc" style={{ padding: '24px 32px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                   <button onClick={() => setIsCreateModalOpen(false)} className="styles_secondaryBtn__abc">Cancelar</button>
                   <button onClick={handleAddPolicy} className="styles_primaryBtn__abc">Crear Política</button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Workflow Editor Modal */}
      <AnimatePresence>
        {isWfModalOpen && editingWf && (
          <div className="styles_modalOverlay__abc" onClick={() => setIsWfModalOpen(false)}>
            <motion.div 
              className="styles_modalContent__abc"
              style={{ maxWidth: '600px', width: '90%' }}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="styles_modalHeader__abc">
                <div className="styles_headerInfo__abc">
                  <h2>{String(editingWf.id).startsWith('new_') ? 'Nuevo Flujo de Aprobación' : 'Editar Flujo de Aprobación'}</h2>
                  <p style={{ color: '#64748b' }}>Configure los pasos y el orden del flujo.</p>
                </div>
                <button onClick={() => setIsWfModalOpen(false)} className="styles_modalCloseBtn__abc">
                  <X size={18} />
                </button>
              </div>

              <div className="styles_modalBody__abc" style={{ padding: '32px', display: 'block', overflowY: 'auto' }}>
                 <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px', marginBottom: '24px' }}>
                    <div>
                       <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '8px' }}>Nombre del Flujo</label>
                       <input 
                         type="text" 
                         value={editingWf.name || ''}
                         onChange={e => setEditingWf({ ...editingWf, name: e.target.value })}
                         className="styles_modalInput__abc"
                       />
                    </div>
                    <div>
                       <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '8px' }}>Color Identificador</label>
                       <input 
                         type="color" 
                         value={editingWf.color || '#6366f1'}
                         onChange={e => setEditingWf({ ...editingWf, color: e.target.value })}
                         className="styles_modalInput__abc"
                         style={{ padding: '4px', height: '46px' }}
                       />
                    </div>
                 </div>

                 <label className="styles_modalLabel__abc" style={{ marginBottom: '12px', display: 'block' }}>Pasos del Ciclo de Vida (Arrastra con el mouse para cambiar el orden)</label>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: '#f8fafc', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                    {(editingWf.steps || []).map((step: string, idx: number) => (
                      <div 
                        key={idx} 
                        style={{ 
                          display: 'flex', 
                          gap: '12px', 
                          alignItems: 'center', 
                          cursor: 'grab',
                          background: draggedStepIdx === idx ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                          borderRadius: '10px',
                          padding: '6px',
                          border: '1px dashed rgba(0,0,0,0.05)',
                          transition: 'background 0.2s'
                        }}
                        draggable
                        onDragStart={() => setDraggedStepIdx(idx)}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={() => {
                          if (draggedStepIdx !== null && draggedStepIdx !== idx) {
                            const newSteps = [...(editingWf.steps || [])];
                            const [removed] = newSteps.splice(draggedStepIdx, 1);
                            newSteps.splice(idx, 0, removed);
                            setEditingWf({ ...editingWf, steps: newSteps });
                          }
                          setDraggedStepIdx(null);
                        }}
                      >
                         <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'grab', flexShrink: 0 }}>
                           <GitBranch size={16} style={{ color: '#94a3b8' }} />
                           <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: editingWf.color || '#6366f1', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: 700 }}>
                             {idx + 1}
                           </div>
                         </div>
                         <input 
                           type="text" 
                           value={step || ''}
                           onChange={e => {
                             const newSteps = [...(editingWf.steps || [])];
                             newSteps[idx] = e.target.value;
                             setEditingWf({ ...editingWf, steps: newSteps });
                           }}
                           className="styles_modalInput__abc"
                           placeholder="Ej. Revisión Legal"
                         />
                         <button 
                           onClick={() => {
                             const newSteps = (editingWf.steps || []).filter((_: any, i: number) => i !== idx);
                             setEditingWf({ ...editingWf, steps: newSteps });
                           }}
                           style={{ color: '#ef4444', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '10px', padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s', flexShrink: 0 }}
                         >
                            <Trash2 size={18} />
                         </button>
                      </div>
                    ))}
                    <button 
                      onClick={() => setEditingWf({ ...editingWf, steps: [...(editingWf.steps || []), 'Nuevo Paso'] })}
                      className="styles_secondaryBtn__abc"
                      style={{ marginTop: '8px', alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                       <Plus size={16} /> Añadir Paso
                    </button>
                 </div>
              </div>
              <div className="styles_footer__abc" style={{ padding: '24px 32px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                 <button onClick={() => setIsWfModalOpen(false)} className="styles_secondaryBtn__abc">Cancelar</button>
                 <button onClick={saveWorkflow} className="styles_primaryBtn__abc" style={{ background: editingWf.color || '#6366f1' }}>
                    {String(editingWf.id).startsWith('new_') ? 'Crear Flujo' : 'Guardar Cambios'}
                 </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>"""

# Replace styles classNames back to styles.xxx format
replacement = replacement.replace("styles_footer__abc", "{styles.footer}")
replacement = replacement.replace("styles_secondaryBtn__abc", "{styles.secondaryBtn}")
replacement = replacement.replace("styles_primaryBtn__abc", "{styles.primaryBtn}")
replacement = replacement.replace("styles_modalOverlay__abc", "{styles.modalOverlay}")
replacement = replacement.replace("styles_modalContent__abc", "{styles.modalContent}")
replacement = replacement.replace("styles_modalHeader__abc", "{styles.modalHeader}")
replacement = replacement.replace("styles_headerInfo__abc", "{styles.headerInfo}")
replacement = replacement.replace("styles_modalCloseBtn__abc", "{styles.modalCloseBtn}")
replacement = replacement.replace("styles_modalBody__abc", "{styles.modalBody}")
replacement = replacement.replace("styles_modalInput__abc", "{styles.modalInput}")
replacement = replacement.replace("styles_modalLabel__abc", "{styles.modalLabel}")

# Let's perform precise match by doing a string replace using exact lines
lines = content.splitlines(keepends=True)
# Locate indices
start_idx = -1
for i, line in enumerate(lines):
    if "Auditor Designado" in line and "<select" in lines[i+1] and ")}" in lines[i+2]:
        start_idx = i - 2
        break

if start_idx != -1:
    print(f"Found match at line {start_idx+1}")
    new_lines = lines[:start_idx] + [replacement + "\n"] + lines[start_idx+6:]
    with open(filepath, "w", encoding="utf-8") as f:
        f.write("".join(new_lines))
    print("Successfully replaced!")
else:
    print("Error: Could not locate exact lines!")
