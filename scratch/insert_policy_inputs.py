filepath = "C:/Users/carlo/Desktop/GovData Nexus/src/app/policies/page.tsx"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# Let's locate the select tag for newPolicy.auditor_designado
target_tag = "value={newPolicy.auditor_designado}"
idx = content.find(target_tag)

if idx != -1:
    print(f"Found {target_tag} at character {idx}")
    
    # We want to find the closing </select> after this
    select_close = content.find("</select>", idx)
    # The div enclosing the select closes next
    div_close_1 = content.find("</div>", select_close)
    # The grid div closes next
    div_close_2 = content.find("</div>", div_close_1 + 6)
    
    # Let's insert right after div_close_2 + 6 (which is the end of the grid div)
    insert_pos = div_close_2 + 6
    
    fields_code = """

                    <div style={{ marginTop: '24px', borderTop: '1px solid #e2e8f0', paddingTop: '24px' }}>
                       <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px', color: '#1e293b' }}>Definición de Contenido de la Política</h3>
                       
                       <div style={{ marginBottom: '20px' }}>
                          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '8px' }}>Objetivo de la Política</label>
                          <textarea 
                            rows={3}
                            placeholder="Defina el objetivo principal de la política (ej: Garantizar la privacidad de los datos personales...)" 
                            style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', minHeight: '80px', resize: 'vertical', background: '#ffffff', color: '#000000' }}
                            value={newPolicy.objective}
                            onChange={e => setNewPolicy({...newPolicy, objective: e.target.value})}
                          />
                       </div>

                       <div style={{ marginBottom: '20px' }}>
                          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '8px' }}>Alcance (Scope)</label>
                          <textarea 
                            rows={3}
                            placeholder="Defina a quiénes y a qué sistemas aplica (ej: Todos los colaboradores y proveedores que traten PII...)" 
                            style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', minHeight: '80px', resize: 'vertical', background: '#ffffff', color: '#000000' }}
                            value={newPolicy.scope}
                            onChange={e => setNewPolicy({...newPolicy, scope: e.target.value})}
                          />
                       </div>

                       <div style={{ marginBottom: '20px' }}>
                          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '8px' }}>Descripción / Lineamiento Principal</label>
                          <textarea 
                            rows={4}
                            placeholder="Describa en detalle las directrices o reglas que se deben cumplir..." 
                            style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', minHeight: '100px', resize: 'vertical', background: '#ffffff', color: '#000000' }}
                            value={newPolicy.guidelines[0] || ''}
                            onChange={e => {
                              const newG = [...newPolicy.guidelines];
                              newG[0] = e.target.value;
                              setNewPolicy({...newPolicy, guidelines: newG});
                            }}
                          />
                       </div>
                    </div>"""

    new_content = content[:insert_pos] + fields_code + content[insert_pos:]
    
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(new_content)
    print("Insert complete!")
else:
    print("Error: Target not found!")
