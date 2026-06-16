filepath = "C:/Users/carlo/Desktop/GovData Nexus/src/app/policies/page.tsx"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add Version and Expiry input fields in Create Policy Modal
# We will locate the Motivo de Cumplimiento and Flujo de Aprobación grid:
#                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
#                     <div>
#                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '8px' }}>Motivo de Cumplimiento</label>
# ...
#                     <div>
#                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '8px' }}>Flujo de Aprobación</label>
# ...
#                        </select>
#                      </div>
#                   </div>

target_creation_grid = """                     <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '8px' }}>Flujo de Aprobación</label>
                        <select 
                          style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}
                          value={newPolicy.workflowId}
                          onChange={e => setNewPolicy({...newPolicy, workflowId: e.target.value})}
                        >
                           {workflows.map((wf, i) => (
                             <option key={i} value={wf.id}>{wf.name}</option>
                           ))}
                        </select>
                      </div>
                   </div>"""

replacement_creation_grid = """                     <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '8px' }}>Flujo de Aprobación</label>
                        <select 
                          style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}
                          value={newPolicy.workflowId}
                          onChange={e => setNewPolicy({...newPolicy, workflowId: e.target.value})}
                        >
                           {workflows.map((wf, i) => (
                             <option key={i} value={wf.id}>{wf.name}</option>
                           ))}
                        </select>
                      </div>
                   </div>

                   <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                      <div>
                         <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '8px' }}>Versión de la Política</label>
                         <input 
                           type="text" 
                           placeholder="Ej: 1.0" 
                           style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#ffffff', color: '#000000' }}
                           value={newPolicy.version}
                           onChange={e => setNewPolicy({...newPolicy, version: e.target.value})}
                         />
                      </div>
                      <div>
                         <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '8px' }}>Vigencia (Año)</label>
                         <input 
                           type="number" 
                           placeholder="Ej: 2026" 
                           style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#ffffff', color: '#000000' }}
                           value={newPolicy.expiry}
                           onChange={e => setNewPolicy({...newPolicy, expiry: e.target.value})}
                         />
                      </div>
                   </div>"""

content = content.replace(target_creation_grid, replacement_creation_grid)

# 2. Update the onChange event of the workflow-file-upload in the Detail Modal
# Let's locate the file input and replace its handler with the real Supabase Storage upload + database state update logic.
target_file_upload_handler = """                                     <input 
                                       type="file" 
                                       id={`workflow-file-upload-${selectedPolicy.id}`} 
                                       style={{ display: 'none' }} 
                                       onChange={(e) => {
                                         if (e.target.files && e.target.files.length > 0) {
                                           handleFileUpload(selectedPolicy.id, e.target.files[0].name);
                                           advanceWorkflow(selectedPolicy.id);
                                         }
                                       }} 
                                     />"""

replacement_file_upload_handler = """                                     <input 
                                       type="file" 
                                       id={`workflow-file-upload-${selectedPolicy.id}`} 
                                       style={{ display: 'none' }} 
                                       onChange={async (e) => {
                                         const file = e.target.files?.[0];
                                         if (!file || !currentTenant?.id) return;
                                         try {
                                            const fileExt = file.name.split('.').pop();
                                            const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
                                            const filePath = `${currentTenant.id}/politicas/${Date.now()}_${safeName}`;
                                            
                                            // Upload to Supabase Storage
                                            const { error: uploadErr } = await supabase.storage
                                              .from('policy-documents')
                                              .upload(filePath, file, { upsert: false });
                                            if (uploadErr) throw uploadErr;

                                            // Create signed URL
                                            const { data: signedData, error: signErr } = await supabase.storage
                                              .from('policy-documents')
                                              .createSignedUrl(filePath, 31536000);
                                            if (signErr || !signedData?.signedUrl) throw signErr || new Error('Error al firmar url');
                                            
                                            const docUrl = signedData.signedUrl;

                                            // Save to data_policies table
                                            const pIndex = policies.findIndex(p => p.id === selectedPolicy.id);
                                            if (pIndex === -1) return;
                                            const policy = policies[pIndex];
                                            const wf = getPolicyWorkflow(policy.workflowId);
                                            if (!wf) return;

                                            const nextStepIdx = (policy.currentStep || 0) + 1;
                                            if (nextStepIdx >= wf.steps.length) return;

                                            const nextStepObj = wf.steps[nextStepIdx];
                                            const nextStatus = typeof nextStepObj === 'string' ? nextStepObj : nextStepObj.name;

                                            const { error: dbErr } = await supabase
                                              .from('data_policies')
                                              .update({ 
                                                document_url: docUrl,
                                                current_step: nextStepIdx,
                                                status: nextStatus
                                              })
                                              .eq('id', selectedPolicy.id);
                                            if (dbErr) throw dbErr;

                                            const updatedPolicy = { 
                                              ...policy, 
                                              documentUrl: docUrl, 
                                              currentStep: nextStepIdx, 
                                              status: nextStatus 
                                            };

                                            setPolicies(policies.map(p => p.id === selectedPolicy.id ? updatedPolicy : p));
                                            setSelectedPolicy(updatedPolicy);
                                            handleFileUpload(selectedPolicy.id, file.name);
                                            alert("Documento cargado y flujo avanzado correctamente.");

                                         } catch (err: any) {
                                            console.error(err);
                                            alert(`Error al cargar el documento: ${err.message}`);
                                         }
                                       }} 
                                     />"""

content = content.replace(target_file_upload_handler, replacement_file_upload_handler)

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("Inputs for Version and Expiry added to Create Modal, and file upload lifecyle handler implemented successfully.")
