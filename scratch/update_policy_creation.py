import re

filepath = "C:/Users/carlo/Desktop/GovData Nexus/src/app/policies/page.tsx"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Fix className quotes created in the previous step
content = re.sub(r'className="\{styles\.([^}]+)\}"', r'className={styles.\1}', content)

# 2. Find the end of the auditor_designado select div in Create Policy Modal
# It looks like:
#                       <div>
#                          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '8px' }}>Auditor Designado</label>
#                          <select 
#                            style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}
#                            value={newPolicy.auditor_designado}
#                            onChange={e => setNewPolicy({...newPolicy, auditor_designado: e.target.value})}
#                          >
#                             {companyUsers.map((m, i) => (
#                               <option key={i} value={`${m.name} (${m.role || 'Usuario'})`}>{m.name} ({m.role || 'Usuario'})</option>
#                             ))}
#                          </select>
#                       </div>
#                    </div>
#                 </div>

# We can find this spot and insert our new fields just before the closing of the modalBody:
# We'll replace the closing "</div>\n                <div className={styles.footer}" of the modalBody.

target_part = """                             {companyUsers.map((m, i) => (
                              <option key={i} value={`${m.name} (${m.role || 'Usuario'})`}>{m.name} ({m.role || 'Usuario'})</option>
                            ))}
                          </select>
                       </div>
                    </div>
                 </div>"""

replacement_part = """                             {companyUsers.map((m, i) => (
                              <option key={i} value={`${m.name} (${m.role || 'Usuario'})`}>{m.name} ({m.role || 'Usuario'})</option>
                            ))}
                          </select>
                       </div>
                    </div>

                    <div style={{ marginTop: '24px', borderTop: '1px solid #e2e8f0', paddingTop: '24px' }}>
                       <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px', color: '#1e293b' }}>Definición de Contenido de la Política</h3>
                       
                       <div style={{ marginBottom: '20px' }}>
                          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '8px' }}>Objetivo de la Política</label>
                          <textarea 
                            rows={3}
                            placeholder="Defina el objetivo principal de la política (ej: Garantizar la privacidad de los datos personales...)" 
                            style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', minHeight: '80px', resize: 'vertical' }}
                            value={newPolicy.objective}
                            onChange={e => setNewPolicy({...newPolicy, objective: e.target.value})}
                          />
                       </div>

                       <div style={{ marginBottom: '20px' }}>
                          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '8px' }}>Alcance (Scope)</label>
                          <textarea 
                            rows={3}
                            placeholder="Defina a quiénes y a qué sistemas aplica (ej: Todos los colaboradores y proveedores que traten PII...)" 
                            style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', minHeight: '80px', resize: 'vertical' }}
                            value={newPolicy.scope}
                            onChange={e => setNewPolicy({...newPolicy, scope: e.target.value})}
                          />
                       </div>

                       <div style={{ marginBottom: '20px' }}>
                          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '8px' }}>Descripción / Lineamiento Principal</label>
                          <textarea 
                            rows={4}
                            placeholder="Describa en detalle las directrices o reglas que se deben cumplir..." 
                            style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', minHeight: '100px', resize: 'vertical' }}
                            value={newPolicy.guidelines[0] || ''}
                            onChange={e => {
                              const newG = [...newPolicy.guidelines];
                              newG[0] = e.target.value;
                              setNewPolicy({...newPolicy, guidelines: newG});
                            }}
                          />
                       </div>
                    </div>
                 </div>"""

content = content.replace(target_part, replacement_part)

# 3. Read the selectedPolicy detail modal we extracted from HEAD
with open("C:/Users/carlo/Desktop/GovData Nexus/scratch/selected_policy_modal_head.tsx", "r", encoding="utf-8") as f:
    detail_modal = f.read()

# Replace all teamMembers.map in the detail_modal with companyUsers.map
detail_modal = detail_modal.replace("teamMembers.map", "companyUsers.map")
# Replace any teamMembers reference in the type signature if any
detail_modal = detail_modal.replace("{teamMembers.map", "{companyUsers.map")

# Insert this modal right before "/* Standard Modal */"
content = content.replace("      {/* Standard Modal */}", detail_modal + "\n\n      {/* Standard Modal */}")

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("Policy creation inputs expanded and detail modal restored successfully!")
