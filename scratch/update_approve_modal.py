filepath = "C:/Users/carlo/Desktop/GovData Nexus/src/app/policies/page.tsx"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Replace the "Asignar Aprobador y Avanzar" button onClick handler to open the modal
target_button = """                                   <button 
                                     className={styles.primaryBtn} 
                                     onClick={() => advanceWorkflow(selectedPolicy.id)}
                                     style={{ padding: '10px 20px', background: '#f59e0b' }}
                                   >"""

replacement_button = """                                   <button 
                                     className={styles.primaryBtn} 
                                     onClick={() => {
                                        setPolicyToApprove(selectedPolicy.id);
                                        setApproveAssignee(companyUsers[0] ? `${companyUsers[0].name} (${companyUsers[0].role || 'Usuario'})` : '');
                                        setIsApproveModalOpen(true);
                                     }}
                                     style={{ padding: '10px 20px', background: '#f59e0b' }}
                                   >"""

content = content.replace(target_button, replacement_button)

# 2. Render the Approve Workflow Modal JSX
target_placeholder = "      {/* Approve Workflow Modal */}"

replacement_modal = """      {/* Approve Workflow Modal */}
      <AnimatePresence>
        {isApproveModalOpen && (
          <div className={styles.modalOverlay} onClick={() => { setIsApproveModalOpen(false); setPolicyToApprove(null); }}>
            <motion.div 
              className={styles.modalContent}
              style={{ maxWidth: '500px', width: '90%', display: 'flex', flexDirection: 'column' }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={e => e.stopPropagation()}
            >
              <div className={styles.modalHeader}>
                <div className={styles.headerInfo}>
                  <h2>Asignar Aprobador y Avanzar</h2>
                  <p style={{ color: '#64748b', fontSize: '0.85rem' }}>Seleccione el usuario responsable de aprobar el paso actual de la política.</p>
                </div>
                <button onClick={() => { setIsApproveModalOpen(false); setPolicyToApprove(null); }} className={styles.modalCloseBtn}>
                  <X size={18} />
                </button>
              </div>
              <div style={{ padding: '32px' }}>
                <div className={styles.modalFormGroup} style={{ marginBottom: '24px' }}>
                  <label className={styles.modalLabel} style={{ fontWeight: 700, marginBottom: '8px', display: 'block' }}>Aprobador Asignado</label>
                  <select 
                    value={approveAssignee} 
                    onChange={e => setApproveAssignee(e.target.value)} 
                    className={styles.modalInput}
                    style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#ffffff', color: '#000000' }}
                  >
                    {companyUsers.map((u, i) => (
                      <option key={i} value={`${u.name} (${u.role || 'Usuario'})`}>{u.name} ({u.role || 'Usuario'})</option>
                    ))}
                  </select>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                  <button className={styles.secondaryBtn} onClick={() => { setIsApproveModalOpen(false); setPolicyToApprove(null); }}>Cancelar</button>
                  <button 
                    className={styles.primaryBtn} 
                    style={{ background: '#f59e0b' }}
                    onClick={async () => {
                      if (policyToApprove) {
                        await advanceWorkflow(policyToApprove);
                        alert(`Flujo avanzado y notificado al aprobador: ${approveAssignee}`);
                      }
                      setIsApproveModalOpen(false);
                      setPolicyToApprove(null);
                    }}
                  >
                    Asignar y Avanzar
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>"""

content = content.replace(target_placeholder, replacement_modal)

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("Approve Workflow Modal implemented and linked successfully.")
