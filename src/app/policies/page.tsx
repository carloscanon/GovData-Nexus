'use client';

import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Eye, 
  History, 
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  BookOpen,
  Settings,
  Activity,
  User,
  Calendar,
  Layers,
  ChevronRight,
  Plus,
  Search,
  Filter,
  X,
  ExternalLink,
  Shield,
  Clock,
  Info,
  CheckSquare,
  FileSearch,
  FileCheck,
  Lock,
  Cpu,
  GitBranch,
  Trash2,
  Award,
  Scale,
  Upload
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { usePlatform } from '@/contexts/PlatformContext';
import styles from './policies.module.css';
import UnifiedModal from '@/components/UnifiedModal';



// --- Roles y Equipos (Sincronizado) ---
const DEFAULT_TEAM_MEMBERS = [
  { name: 'Carlos Director', role: 'CDO' },
  { name: 'Ana Garcia', role: 'Data Steward' },
  { name: 'Luis Martinez', role: 'Data Owner' },
  { name: 'Sofia Rodriguez', role: 'Data Custodian' },
  { name: 'Elena Gomez', role: 'Auditor' },
];

export default function PoliciesModule() {
  const [activeTab, setActiveTab] = useState('politicas');
  const [selectedPolicy, setSelectedPolicy] = useState<any>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isStdModalOpen, setIsStdModalOpen] = useState(false);
  const [isProcModalOpen, setIsProcModalOpen] = useState(false);
  const [isStdDetailModalOpen, setIsStdDetailModalOpen] = useState(false);
  const [isProcDetailModalOpen, setIsProcDetailModalOpen] = useState(false);
  const [isEvidenceModalOpen, setIsEvidenceModalOpen] = useState(false);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [policyToApprove, setPolicyToApprove] = useState<string | null>(null);
  const [approveAssignee, setApproveAssignee] = useState<string>('');
  const [isControlModalOpen, setIsControlModalOpen] = useState(false);
  const [selectedControl, setSelectedControl] = useState<any>(null);
  const [newControl, setNewControl] = useState<any>({ code: '', description: '', frequency: 'Diaria', status: 'OK', policy_id: '' });


  const [newStandard, setNewStandard] = useState<any>({ name: '', code: '', category: 'Arquitectura', coverage: 'Global', status: 'Activo', owner: 'AR (Arquitectura)', document_url: null });
  const [newProcedure, setNewProcedure] = useState<any>({ title: '', code: '', version: '1.0', content: '', document_url: null });
  const [newEvidence, setNewEvidence] = useState<any>({ filename: '', description: '', file_url: null });
  const [selectedStandard, setSelectedStandard] = useState<any>(null);
  const [selectedProcedure, setSelectedProcedure] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);
  // Application State
  const [policies, setPolicies] = useState<any[]>([]);
  const [modalTab, setModalTab] = useState('general');
  const [isMounted, setIsMounted] = useState(false);
  const [selectedKPI, setSelectedKPI] = useState<any>(null);
  const { currentTenant, modalConfig } = usePlatform();
  const isAdmin = true; // Simulación de Rol (Administrador de Plataforma)

  const [workflows, setWorkflows] = useState<any[]>([]);
  const [standards, setStandards] = useState<any[]>([]);
  const [procedures, setProcedures] = useState<any[]>([]);
  const [controls, setControls] = useState<any[]>([]);
  const [evidences, setEvidences] = useState<any[]>([]);
  const [teamMembers, setTeamMembers] = useState<any[]>(DEFAULT_TEAM_MEMBERS);

  const [companyUsers, setCompanyUsers] = useState<any[]>([]);
  const [draggedStepIdx, setDraggedStepIdx] = useState<number | null>(null);

  // Load All Data from DB
  useEffect(() => {
    if (!currentTenant?.id) return;
    setIsMounted(true);
    
    const loadAll = async () => {
      try {
        const [
          { data: polData },
          { data: wfData },
          { data: stdData },
          { data: procData },
          { data: ctrlData },
          { data: evData },
          { data: membersData },
          { data: usersData }
        ] = await Promise.all([
          supabase.from('data_policies').select('*').eq('tenant_id', currentTenant.id).order('created_at', { ascending: false }),
          supabase.from('policy_workflows').select('*').eq('tenant_id', currentTenant.id),
          supabase.from('policy_standards').select('*').eq('tenant_id', currentTenant.id),
          supabase.from('policy_procedures').select('*').eq('tenant_id', currentTenant.id),
          supabase.from('policy_controls').select('*').eq('tenant_id', currentTenant.id),
          supabase.from('policy_evidences').select('*').eq('tenant_id', currentTenant.id),
          supabase.from('team_members').select('name, role').eq('tenant_id', currentTenant.id),
          supabase.from('tenant_users').select('name, role').eq('tenant_id', currentTenant.id)
        ]);

        if (polData) {
          setPolicies(polData.map(p => ({
            ...p,
            owner: p.owner || 'Usuario Asignado',
            type: p.type || 'Gobierno de Datos',
            version: p.version || '1.0',
            expiry: p.expiry || '2026',
            workflowId: p.workflow_id || '',
            currentStep: p.current_step || 0,
            documentUrl: p.document_url || null,
            data_custodian: p.data_custodian || 'Sofía Rodríguez (TI Ops)',
            auditor_designado: p.auditor_designado || 'Elena Gómez (Auditor)'
          })));
        }
        if (wfData) setWorkflows(wfData);
        if (stdData) setStandards(stdData);
        if (procData) setProcedures(procData);
        if (ctrlData) setControls(ctrlData);
        if (evData) setEvidences(evData);
        if (membersData && membersData.length > 0) {
          setTeamMembers(membersData);
        } else {
          setTeamMembers(DEFAULT_TEAM_MEMBERS);
        }

        if (usersData && usersData.length > 0) {
          setCompanyUsers(usersData);
        } else if (membersData && membersData.length > 0) {
          setCompanyUsers(membersData);
        } else {
          setCompanyUsers(DEFAULT_TEAM_MEMBERS);
        }
        
      } catch (e: any) {
        console.error('Error fetching policies data:', e);
      }
    };
    loadAll();
  }, [currentTenant?.id]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<any>(null);
  const [workflowFilter, setWorkflowFilter] = useState<string | null>(null);
  const [isWfModalOpen, setIsWfModalOpen] = useState(false);
  const [editingWf, setEditingWf] = useState<any>(null);

  const openWfEditor = (wf: any) => {
    setEditingWf({ ...wf });
    setIsWfModalOpen(true);
  };

  const saveWorkflow = async () => {
    try {
      let result;
      if (editingWf.id && !String(editingWf.id).startsWith('new_')) {
        // Update
        result = await supabase
          .from('policy_workflows')
          .update({
            name: editingWf.name,
            color: editingWf.color,
            steps: editingWf.steps,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingWf.id)
          .select();
      } else {
        // Insert
        result = await supabase
          .from('policy_workflows')
          .insert({
            tenant_id: currentTenant?.id,
            name: editingWf.name,
            color: editingWf.color,
            steps: editingWf.steps
          })
          .select();
      }

      if (result.error) throw result.error;
      
      const savedWf = result.data[0];
      if (editingWf.id && !String(editingWf.id).startsWith('new_')) {
        setWorkflows(workflows.map(w => w.id === savedWf.id ? savedWf : w));
      } else {
        setWorkflows([...workflows, savedWf]);
      }
      setIsWfModalOpen(false);
    } catch (err) {
      console.error('Error saving workflow:', err);
      alert('Error al guardar el flujo de aprobación');
    }
  };

  // Form State for Create/Edit
  const [newPolicy, setNewPolicy] = useState({
    id: '',
    title: '',
    type: 'Gobierno de Datos',
    framework_origin: 'Cumplimiento Normativo',
    status: 'Borrador',
    workflowId: '',
    currentStep: 0,
    expiry: '2026',
    owner: 'Carlos Director (CDO)',
    version: '1.0',
    objective: '',
    scope: '',
    guidelines: [''],
    controls: [''],
    sancions: '',
    data_custodian: 'Sofía Rodríguez (TI Ops)',
    auditor_designado: 'Elena Gómez (Auditor)'
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<any>(null);
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, any[]>>({});

  const getPolicyWorkflow = (workflowId: string | null) => {
    if (workflowId && workflowId !== 'WF-001') {
      const found = workflows.find(w => w.id === workflowId);
      if (found) return found;
    }
    if (workflows.length > 0) return workflows[0];
    return { id: 'default', name: 'Flujo Estándar', color: '#6366f1', steps: ['Borrador', 'Revisión y Actualización', 'Publicado'] };
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

   const handleAddPolicy = async () => {
    if (!currentTenant?.id) return;

    try {
      const selectedWf = getPolicyWorkflow(newPolicy.workflowId);
      const initialStepName = selectedWf && selectedWf.steps.length > 0 
        ? (typeof selectedWf.steps[0] === 'string' ? selectedWf.steps[0] : selectedWf.steps[0].name) 
        : newPolicy.status;

      const { data, error } = await supabase.from('data_policies').insert([{
        tenant_id: currentTenant.id,
        title: newPolicy.title,
        type: newPolicy.type,
        status: initialStepName,
        current_step: 0,
        workflow_id: selectedWf?.id || null,
        version: newPolicy.version,
        objective: newPolicy.objective,
        scope: newPolicy.scope,
        expiry: newPolicy.expiry,
        owner: newPolicy.owner,
        framework_origin: newPolicy.framework_origin,
        guidelines: newPolicy.guidelines,
        controls: newPolicy.controls,
        sancions: newPolicy.sancions,
        data_custodian: newPolicy.data_custodian,
        auditor_designado: newPolicy.auditor_designado
      }]).select();

      if (error) throw error;

      if (data && data.length > 0) {
        const newDoc = {
          ...data[0],
          workflowId: data[0].workflow_id || selectedWf?.id,
          currentStep: data[0].current_step || 0,
          data_custodian: data[0].data_custodian || newPolicy.data_custodian,
          auditor_designado: data[0].auditor_designado || newPolicy.auditor_designado
        };
        setPolicies([newDoc, ...policies]);
      }
    } catch (e: any) {
      console.error('Error adding policy:', e);
      alert('Error guardando en la base de datos.');
    }

    setIsCreateModalOpen(false);
    // Reset form
    setNewPolicy({
      id: '', title: '', type: 'Gobierno de Datos', framework_origin: 'Cumplimiento Normativo', status: 'Borrador', workflowId: '', currentStep: 0, expiry: '2026',
      owner: 'Carlos Director (CDO)', version: '1.0', objective: '', scope: '', 
      guidelines: [''], controls: [''], sancions: '',
      data_custodian: 'Sofía Rodríguez (TI Ops)',
      auditor_designado: 'Elena Gómez (Auditor)'
    });
  };

  const handleDeletePolicy = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta política? Esta acción no se puede deshacer.')) return;
    try {
      const { error } = await supabase.from('data_policies').delete().eq('id', id);
      if (error) throw error;
      setPolicies(policies.filter(p => p.id !== id));
      if (selectedPolicy?.id === id) setSelectedPolicy(null);
    } catch (err: any) {
      alert(`Error eliminando la política: ${err.message}`);
    }
  };

  const handleNativeFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    callback: (url: string) => void,
    fileType: 'evidencias' | 'procedimientos' | 'politicas' | 'estandares' = 'politicas'
  ) => {
    const file = e.target.files?.[0];
    if (!file || !currentTenant?.id) return;

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      // Organized path: tenantId / type / timestamp_filename
      const filePath = `${currentTenant.id}/${fileType}/${Date.now()}_${safeName}`;

      const { error } = await supabase.storage
        .from('policy-documents')
        .upload(filePath, file, { upsert: false });

      if (error) throw error;

      // Generate a signed URL valid for 1 year (31,536,000 s)
      const { data: signedData, error: signErr } = await supabase.storage
        .from('policy-documents')
        .createSignedUrl(filePath, 31536000);

      if (signErr || !signedData?.signedUrl) throw signErr || new Error('No signed URL');

      callback(signedData.signedUrl);
    } catch (err: any) {
      alert(`Error subiendo documento: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddControl = async () => {
    if (!currentTenant?.id) return;
    try {
      const { data, error } = await supabase.from('policy_controls').insert([{
        tenant_id: currentTenant.id,
        code: newControl.code,
        description: newControl.description,
        frequency: newControl.frequency,
        status: newControl.status,
        policy_id: newControl.policy_id || null
      }]).select();

      if (error) throw error;
      if (data && data.length > 0) {
        setControls([data[0], ...controls]);
        setIsControlModalOpen(false);
        setNewControl({ code: '', description: '', frequency: 'Diaria', status: 'OK', policy_id: '' });
      }
    } catch (e: any) {
      alert(`Error guardando control: ${e.message}`);
    }
  };

  const handleUpdateControl = async () => {
    if (!currentTenant?.id || !selectedControl) return;
    try {
      const { data, error } = await supabase.from('policy_controls').update({
        code: selectedControl.code,
        description: selectedControl.description,
        frequency: selectedControl.frequency,
        status: selectedControl.status,
        policy_id: selectedControl.policy_id || null
      }).eq('id', selectedControl.id).select();

      if (error) throw error;
      if (data && data.length > 0) {
        setControls(controls.map(c => c.id === selectedControl.id ? data[0] : c));
        setIsControlModalOpen(false);
        setSelectedControl(null);
      }
    } catch (e: any) {
      alert(`Error actualizando control: ${e.message}`);
    }
  };

  const handleDeleteControl = async (id: string) => {
    if (!window.confirm('¿Está seguro de eliminar este control?')) return;
    try {
      const { error } = await supabase.from('policy_controls').delete().eq('id', id);
      if (error) throw error;
      setControls(controls.filter(c => c.id !== id));
      setIsControlModalOpen(false);
      setSelectedControl(null);
    } catch (e: any) {
      alert(`Error eliminando control: ${e.message}`);
    }
  };

  const handleAddStandard = async () => {
    if (!currentTenant?.id) return;
    try {
      const { data, error } = await supabase.from('policy_standards').insert([{
        tenant_id: currentTenant.id,
        name: newStandard.name,
        code: newStandard.code,
        category: newStandard.category,
        coverage: newStandard.coverage,
        status: newStandard.status,
        owner: newStandard.owner,
        document_url: newStandard.document_url
      }]).select();

      if (error) throw error;
      if (data && data.length > 0) {
        setStandards([data[0], ...standards]);
        setIsStdModalOpen(false);
        setNewStandard({ name: '', code: '', category: 'Arquitectura', coverage: 'Global', status: 'Activo', owner: 'AR (Arquitectura)', document_url: null });
      }
    } catch (e: any) {
      alert(`Error guardando estándar: ${e.message}`);
    }
  };

  const handleAddProcedure = async () => {
    if (!currentTenant?.id) return;
    try {
      const { data, error } = await supabase.from('policy_procedures').insert([{
        tenant_id: currentTenant.id,
        title: newProcedure.title,
        code: newProcedure.code,
        version: newProcedure.version,
        content: newProcedure.content,
        last_revision_date: new Date().toISOString().split('T')[0],
        document_url: newProcedure.document_url
      }]).select();

      if (error) throw error;
      if (data && data.length > 0) {
        setProcedures([data[0], ...procedures]);
        setIsProcModalOpen(false);
        setNewProcedure({ title: '', code: '', version: '1.0', content: '', document_url: null });
      }
    } catch (e: any) {
      alert(`Error guardando procedimiento: ${e.message}`);
    }
  };

  const handleUpdateStandard = async () => {
    if (!currentTenant?.id || !selectedStandard?.id) return;
    try {
      const { data, error } = await supabase.from('policy_standards')
        .update({
          name: selectedStandard.name,
          code: selectedStandard.code,
          category: selectedStandard.category,
          coverage: selectedStandard.coverage,
          status: selectedStandard.status,
          owner: selectedStandard.owner,
          document_url: selectedStandard.document_url
        })
        .eq('id', selectedStandard.id)
        .select();

      if (error) throw error;
      setStandards(standards.map(s => s.id === selectedStandard.id ? data[0] : s));
      setIsStdDetailModalOpen(false);
    } catch (e: any) {
      alert(`Error actualizando estándar: ${e.message}`);
    }
  };

  const handleDeleteStandard = async (id: string) => {
    if (!currentTenant?.id) return;
    if (!confirm('¿Estás seguro de eliminar este estándar?')) return;
    try {
      const { error } = await supabase.from('policy_standards').delete().eq('id', id);
      if (error) throw error;
      setStandards(standards.filter(s => s.id !== id));
      setIsStdDetailModalOpen(false);
    } catch (e: any) {
      alert(`Error eliminando estándar: ${e.message}`);
    }
  };

  const handleUpdateProcedure = async () => {
    if (!currentTenant?.id || !selectedProcedure?.id) return;
    try {
      const { data, error } = await supabase.from('policy_procedures')
        .update({
          title: selectedProcedure.title,
          code: selectedProcedure.code,
          version: selectedProcedure.version,
          content: selectedProcedure.content,
          document_url: selectedProcedure.document_url
        })
        .eq('id', selectedProcedure.id)
        .select();

      if (error) throw error;
      setProcedures(procedures.map(p => p.id === selectedProcedure.id ? data[0] : p));
      setIsProcDetailModalOpen(false);
    } catch (e: any) {
      alert(`Error actualizando procedimiento: ${e.message}`);
    }
  };

  const handleDeleteProcedure = async (id: string) => {
    if (!currentTenant?.id) return;
    if (!confirm('¿Estás seguro de eliminar este procedimiento?')) return;
    try {
      const { error } = await supabase.from('policy_procedures').delete().eq('id', id);
      if (error) throw error;
      setProcedures(procedures.filter(p => p.id !== id));
      setIsProcDetailModalOpen(false);
    } catch (e: any) {
      alert(`Error eliminando procedimiento: ${e.message}`);
    }
  };

  const handleAddEvidence = async () => {
    if (!currentTenant?.id || !newEvidence.file_url) {
        alert("Sube el archivo primero");
        return;
    }
    try {
      const { data, error } = await supabase.from('policy_evidences').insert([{
        tenant_id: currentTenant.id,
        filename: newEvidence.filename || 'Evidencia sin título',
        description: newEvidence.description,
        file_url: newEvidence.file_url,
      }]).select();
      if (error) throw error;
      if (data && data.length > 0) {
        setEvidences([data[0], ...evidences]);
        setIsEvidenceModalOpen(false);
        setNewEvidence({ filename: '', description: '', file_url: null });
      }
    } catch (e: any) {
      alert(`Error guardando evidencia: ${e.message}`);
    }
  };

  const handleUpdateStatus = (id: string, newStatus: string) => {
    setPolicies(policies.map(p => p.id === id ? { ...p, status: newStatus } : p));
    if (selectedPolicy?.id === id) {
      setSelectedPolicy({ ...selectedPolicy, status: newStatus });
    }
  };

  const startEditing = () => {
    setEditForm({ ...selectedPolicy });
    setIsEditing(true);
  };

  const advanceWorkflow = async (policyId: string) => {
    const pIndex = policies.findIndex(p => p.id === policyId);
    if (pIndex === -1) return;

    const policy = policies[pIndex];
    const wf = getPolicyWorkflow(policy.workflowId);
    if (!wf) return;

    const nextStepIdx = (policy.currentStep || 0) + 1;
    if (nextStepIdx >= wf.steps.length) return; // Ya en el final

    const nextStepObj = wf.steps[nextStepIdx];
    const nextStatus = typeof nextStepObj === 'string' ? nextStepObj : nextStepObj.name;
    const updatedPolicy = { ...policy, currentStep: nextStepIdx, status: nextStatus };

    try {
      const { error } = await supabase
        .from('data_policies')
        .update({ current_step: nextStepIdx, status: nextStatus })
        .eq('id', policyId);
      if (error) throw error;

      setPolicies(policies.map(p => p.id === policyId ? updatedPolicy : p));
      if (selectedPolicy?.id === policyId) {
        setSelectedPolicy(updatedPolicy);
      }
    } catch (e) {
      console.error('Error advancing workflow:', e);
      alert('Error al avanzar el flujo en la base de datos.');
    }
  };

  const simulateAiGeneration = (field: 'new' | 'edit') => {
    setIsAiGenerating(true);
    
    const contextTitle = field === 'new' ? newPolicy.title : editForm.title;
    const titleLower = contextTitle.toLowerCase();

    setTimeout(() => {
      let generatedData = {
        objective: `Establecer un marco normativo para la gestión de ${contextTitle || 'activos de datos'} en la organización.`,
        scope: "Toda la infraestructura, procesos y personal que maneje información corporativa.",
        guidelines: [
          "Cumplimiento con estándares internacionales.",
          "Revisiones periódicas de cumplimiento.",
          "Capacitación obligatoria para el personal implicado."
        ]
      };

      // Lógica de contexto simple
      if (titleLower.includes('privacidad') || titleLower.includes('protección')) {
        generatedData = {
          objective: "Garantizar la protección de datos personales y la privacidad de los titulares de acuerdo con la Ley de Protección de Datos (GDPR/Habeas Data).",
          scope: "Todos los procesos que involucren recolección, almacenamiento o tratamiento de PII.",
          guidelines: [
            "Implementación de Privacy by Design en todo nuevo proyecto.",
            "Gestión estricta de consentimientos informados.",
            "Notificación de brechas de seguridad en menos de 72 horas."
          ]
        };
      } else if (titleLower.includes('calidad')) {
        generatedData = {
          objective: "Asegurar que los datos sean exactos, completos, consistentes y oportunos para la toma de decisiones estratégicas.",
          scope: "Sistemas maestros de datos (ERP, CRM) y almacenes de datos analíticos.",
          guidelines: [
            "Definición de umbrales mínimos de calidad por dominio.",
            "Limpieza de datos (Data Cleansing) automatizada mensual.",
            "Certificación de fuentes de datos oficiales."
          ]
        };
      } else if (titleLower.includes('seguridad') || titleLower.includes('cifrado')) {
        generatedData = {
          objective: "Proteger los activos de información contra accesos no autorizados, alteraciones o destrucción accidental.",
          scope: "Redes, servidores, dispositivos finales y bases de datos corporativas.",
          guidelines: [
            "Uso obligatorio de MFA y cifrado AES-256.",
            "Rotación bimensual de credenciales críticas.",
            "Auditorías de acceso trimestrales."
          ]
        };
      } else if (titleLower.includes('retención') || titleLower.includes('borrado')) {
        generatedData = {
          objective: "Definir los ciclos de vida de la información para optimizar el almacenamiento y cumplir con términos legales de conservación.",
          scope: "Archivos físicos y repositorios digitales históricos.",
          guidelines: [
            "Clasificación de datos por tiempo de vida legal.",
            "Borrado seguro certificado al finalizar la vigencia.",
            "Revisiones anuales de purga de datos obsoletos."
          ]
        };
      }

      if (field === 'new') {
        setNewPolicy({ ...newPolicy, ...generatedData });
      } else {
        setEditForm({ ...editForm, ...generatedData });
      }
      setIsAiGenerating(false);
    }, 1200);
  };

  const simulateStandardAiGeneration = (field: 'new' | 'edit') => {
    setIsAiGenerating(true);
    const contextCategory = field === 'new' ? newStandard.category : selectedStandard.category;
    
    setTimeout(() => {
      let generatedData = {
        name: `Estándar de ${contextCategory}`,
        code: `STD-${contextCategory.substring(0, 3).toUpperCase()}-${Math.floor(Math.random() * 1000)}`,
        coverage: 'Alcance Global Corporativo'
      };

      if (contextCategory === 'Arquitectura') {
        generatedData.name = 'Lineamientos de Arquitectura de Microservicios y API REST';
      } else if (contextCategory === 'Seguridad') {
        generatedData.name = 'Protocolo de Cifrado de Datos en Reposo y en Tránsito (AES-256)';
      } else if (contextCategory === 'Interoperabilidad') {
        generatedData.name = 'Estándar de Intercambio de Datos JSON y Validaciones de Esquema';
      } else if (contextCategory === 'Accesos') {
        generatedData.name = 'Manejo de Identidades y Control de Acceso Basado en Roles (RBAC)';
      }

      if (field === 'new') {
        setNewStandard({ ...newStandard, ...generatedData });
      } else {
        setSelectedStandard({ ...selectedStandard, ...generatedData });
      }
      setIsAiGenerating(false);
    }, 1000);
  };

  const simulateProcedureAiGeneration = (field: 'new' | 'edit') => {
    setIsAiGenerating(true);
    const contextTitle = field === 'new' ? newProcedure.title : selectedProcedure.title;
    const titleLower = contextTitle.toLowerCase();
    
    setTimeout(() => {
      let generatedData = {
        code: `PRC-${Math.floor(Math.random() * 1000)}`,
        content: `1. Objetivo:\nEstablecer los pasos para ${contextTitle || 'la tarea solicitada'}.\n\n2. Alcance:\nAplica a todo el personal involucrado.\n\n3. Pasos a seguir:\n- Identificar el requerimiento.\n- Ejecutar el proceso de validación.\n- Documentar los resultados.`
      };

      if (titleLower.includes('anonimización') || titleLower.includes('enmascaramiento')) {
        generatedData.content = `1. Identificación de PII: Ejecutar script de escaneo sobre la tabla destino.\n2. Aplicación de Reglas: Utilizar enmascaramiento parcial para emails (e***@dominio.com) y sustitución para nombres.\n3. Validación: El equipo de QA debe verificar que la base de datos resultante no permita re-identificación.\n4. Despliegue: Mover datos anonimizados a entornos de desarrollo.`;
      } else if (titleLower.includes('backup') || titleLower.includes('respaldo')) {
        generatedData.content = `1. Frecuencia: Los backups incrementales se realizarán diariamente a las 02:00 AM.\n2. Almacenamiento: Se enviarán a un bucket S3 con inmutabilidad habilitada por 30 días.\n3. Restauración de Prueba: El primer domingo de cada mes se ejecutará un simulacro de recuperación.\n4. Notificación: Cualquier fallo en el job de respaldo debe alertar inmediatamente a DevOps.`;
      }

      if (field === 'new') {
        setNewProcedure({ ...newProcedure, ...generatedData });
      } else {
        setSelectedProcedure({ ...selectedProcedure, ...generatedData });
      }
      setIsAiGenerating(false);
    }, 1000);
  };

  const saveEdits = async () => {
    try {
      const { data, error } = await supabase
        .from('data_policies')
        .update({
          title: editForm.title,
          type: editForm.type,
          version: editForm.version,
          objective: editForm.objective,
          scope: editForm.scope,
          expiry: editForm.expiry,
          owner: editForm.owner,
          framework_origin: editForm.framework_origin,
          guidelines: editForm.guidelines,
          controls: editForm.controls,
          sancions: editForm.sancions,
          data_custodian: editForm.data_custodian,
          auditor_designado: editForm.auditor_designado
        })
        .eq('id', editForm.id)
        .select();

      if (error) throw error;

      if (data && data.length > 0) {
        const updated = {
          ...data[0],
          workflowId: data[0].workflow_id || editForm.workflowId,
          currentStep: data[0].current_step || editForm.currentStep
        };
        setPolicies(policies.map(p => p.id === editForm.id ? updated : p));
        setSelectedPolicy(updated);
        setIsEditing(false);
      }
    } catch (err: any) {
      alert(`Error guardando cambios en base de datos: ${err.message}`);
    }
  };

  const handleFileUpload = (policyId: string, customFileName?: string) => {
    const fileName = customFileName || `Documento_Soporte_${Math.floor(Math.random()*1000)}.pdf`;
    const currentFiles = uploadedFiles[policyId] || [];
    setUploadedFiles({
      ...uploadedFiles,
      [policyId]: [...currentFiles, { name: fileName, date: new Date().toISOString().split('T')[0] }]
    });
  };

  const handleExportPDF = () => {
    // Usamos el diálogo de impresión del sistema para permitir "Guardar como PDF"
    // con el contenido formateado de la política.
    window.print();
  };

  const kpiExplanations: Record<string, string> = {
    'Políticas Activas': 'Total de normativas vigentes y publicadas que deben ser cumplidas por la organización.',
    'Vencidas': 'Políticas cuya fecha de vigencia ha expirado y requieren revisión urgente para evitar brechas de cumplimiento.',
    'En Revisión': 'Documentos en etapa de borrador o actualización que están esperando aprobación del CDO o CISO.',
    'Cumplimiento': 'Porcentaje de controles asociados a las políticas que han pasado satisfactoriamente las pruebas de auditoría.',
    'Estándares Aplicados': 'Número de reglas técnicas operativas que están siendo monitoreadas activamente en las bases de datos.'
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleArea} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className={styles.titleArea} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0 }}>
            <Scale size={24} />
          </div>
          <div>
            <h1 style={{ margin: 0, marginBottom: '4px', fontSize: '1.8rem' }}>Centro de Gobierno Normativo</h1>
            <p style={{ margin: 0, color: '#64748b', fontSize: '0.95rem' }}>Definición, control y auditoría de políticas corporativas y estándares de datos.</p>
          </div>
        </div>
          <button className={styles.primaryBtn} onClick={() => setIsCreateModalOpen(true)}>
            <Plus size={18} style={{ marginRight: '8px' }} /> Nueva Política
          </button>
        </div>
      </header>

      {/* ── Consolidated Global Score Banner calculations ── */}
      {(() => {
        const totalPoliciesCount = policies.length;
        const activePoliciesCount = policies.filter((p: any) => {
          const s = (p.status || '').toLowerCase();
          return s.includes('vigente') || s.includes('publicado') || s.includes('aprobado') || s.includes('activo');
        }).length;
        const expiredPoliciesCount = policies.filter((p: any) => {
          const s = (p.status || '').toLowerCase();
          return s.includes('vencida') || s.includes('vencido') || (p.expiry && parseInt(p.expiry) < new Date().getFullYear());
        }).length;
        const reviewPoliciesCount = policies.filter((p: any) => {
          const s = (p.status || '').toLowerCase();
          return s.includes('revisión') || s.includes('revision') || s.includes('actualiz') || s.includes('documento');
        }).length;

        // Cálculo de NGI homologado con Command Center (Gestión Documental Normativa)
        const totalDocs = policies.length + standards.length + procedures.length;
        let totalProgressPoints = 0;
        
        const getProgressPoints = (status: string, currentStep: number) => {
           const s = (status || '').toLowerCase();
           if (s.includes('publicado') || s.includes('vigente') || s.includes('aprobado') || s.includes('estable')) return 100;
           if (s.includes('revisión') || currentStep > 0) return 50;
           return 25; // Borrador inicial
        };

        policies.forEach((p: any) => totalProgressPoints += getProgressPoints(p.status, p.currentStep || 0));
        standards.forEach((s: any) => totalProgressPoints += getProgressPoints(s.status, 0));
        procedures.forEach((pr: any) => totalProgressPoints += getProgressPoints(pr.status, 0));

        const ngiScore = totalDocs > 0 ? Math.round(totalProgressPoints / totalDocs) : 0;

        let levelText = 'VULNERABLE';
        let levelColor = '#ef4444';
        if (ngiScore >= 85) {
          levelText = 'REGULADO';
          levelColor = '#10b981';
        } else if (ngiScore >= 70) {
          levelText = 'EN REGLA';
          levelColor = '#6366f1';
        }

        const circumference = 2 * Math.PI * 52;
        const dashOffset = circumference - (ngiScore / 100) * circumference;
        
        // Controles y tasa de cumplimiento reales basados en la base de datos
        const totalControls = controls.length;
        const complianceRate = controls.length > 0 ? Math.round((controls.filter((c: any) => c.status === 'OK' || c.status === 'CUMPLE').length / controls.length) * 100) : 100;

        return (
          <motion.div
            className={styles.globalBanner}
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className={styles.globalLeft}>
              <div className={styles.circleWrap}>
                <svg width="120" height="120" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="52" fill="none" stroke="#e2e8f0" strokeWidth="10" />
                  <circle
                    cx="60" cy="60" r="52" fill="none"
                    stroke={levelColor}
                    strokeWidth="10"
                    strokeDasharray={circumference}
                    strokeDashoffset={dashOffset}
                    strokeLinecap="round"
                    transform="rotate(-90 60 60)"
                    style={{ transition: 'stroke-dashoffset 1.2s ease' }}
                  />
                  <text x="60" y="55" textAnchor="middle" fill={levelColor} fontSize="22" fontWeight="900">
                    {ngiScore}%
                  </text>
                  <text x="60" y="72" textAnchor="middle" fill="#94a3b8" fontSize="10" fontWeight="700">
                    GOBERNANZA
                  </text>
                </svg>
              </div>
              <div className={styles.globalInfo}>
                <div className={styles.globalLevel} style={{ color: levelColor }}>
                  <Award size={20} /> {levelText}
                </div>
                <h2 className={styles.globalTitle}>Índice de Gobernanza Normativa (NGI)</h2>
                <p className={styles.globalSub}>
                  Avance consolidado de políticas, estándares y procedimientos (Homologado con Command Center).
                </p>
              </div>
            </div>

            {/* Mini dimension pills */}
            <div className={styles.globalRight}>
              <div className={styles.miniPill} onClick={() => setSelectedKPI({ label: 'Políticas Activas', value: activePoliciesCount.toString(), explanation: kpiExplanations['Políticas Activas'], color: '#10b981' })}>
                <FileCheck size={14} color="#10b981" />
                <span>Políticas Activas</span>
                <strong style={{ color: '#10b981' }}>{activePoliciesCount}</strong>
              </div>
              <div className={styles.miniPill} onClick={() => setSelectedKPI({ label: 'En Revisión', value: reviewPoliciesCount.toString(), explanation: kpiExplanations['En Revisión'], color: '#f59e0b' })}>
                <History size={14} color="#f59e0b" />
                <span>En Revisión</span>
                <strong style={{ color: '#f59e0b' }}>{reviewPoliciesCount}</strong>
              </div>
              <div className={styles.miniPill} onClick={() => setSelectedKPI({ label: 'Vencidas', value: expiredPoliciesCount.toString(), explanation: kpiExplanations['Vencidas'], color: '#ef4444' })}>
                <AlertCircle size={14} color="#ef4444" />
                <span>Vencidas</span>
                <strong style={{ color: expiredPoliciesCount > 0 ? '#ef4444' : '#64748b' }}>{expiredPoliciesCount}</strong>
              </div>
              <div className={styles.miniPill} onClick={() => setSelectedKPI({ label: 'Cumplimiento', value: `${complianceRate}%`, explanation: kpiExplanations['Cumplimiento'], color: '#6366f1' })}>
                <ShieldCheck size={14} color="#6366f1" />
                <span>Cumplimiento</span>
                <strong style={{ color: '#6366f1' }}>{complianceRate}%</strong>
              </div>
              <div className={styles.miniPill} onClick={() => setSelectedKPI({ label: 'Estándares Aplicados', value: standards.length.toString(), explanation: kpiExplanations['Estándares Aplicados'], color: '#8b5cf6' })}>
                <Settings size={14} color="#8b5cf6" />
                <span>Estándares</span>
                <strong style={{ color: '#8b5cf6' }}>{standards.length}</strong>
              </div>
              <div className={styles.miniPill} onClick={() => setSelectedKPI({ label: 'Controles Operativos', value: totalControls.toString(), explanation: kpiExplanations['Controles Operativos'] || 'Controles operacionales en ejecución.', color: '#06b6d4' })}>
                <CheckSquare size={14} color="#06b6d4" />
                <span>Controles</span>
                <strong style={{ color: '#06b6d4' }}>{totalControls}</strong>
              </div>
            </div>
          </motion.div>
        );
      })()}

      {/* Main Tabs */}
      <div className={styles.tabs}>
        {[
          { id: 'politicas', label: 'Políticas', icon: <FileText size={18} /> },
          { id: 'flujos', label: 'Flujos', icon: <GitBranch size={18} /> },
          { id: 'estandares', label: 'Estándares', icon: <Settings size={18} /> },
          { id: 'procedimientos', label: 'Procedimientos', icon: <Layers size={18} /> },
          { id: 'controles', label: 'Controles', icon: <CheckSquare size={18} /> },
          { id: 'evidencias', label: 'Evidencias', icon: <FileSearch size={18} /> }
        ].map(tab => (
          <button 
            key={tab.id}
            className={`${styles.tabBtn} ${activeTab === tab.id ? styles.activeTab : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      <div className={styles.tableContainer}>
        {activeTab === 'politicas' && (
          <>
            <div className={styles.tableHeader}>
              <span>Política</span>
              <span>Categoría / Motivo</span>
              <span>Estado</span>
              <span>Progreso de Flujo</span>
              <span>Vigencia</span>
              <span>Responsable</span>
              <span></span>
            </div>
            {workflowFilter && (
               <div style={{ padding: '12px 20px', background: '#eef2ff', borderRadius: '8px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.9rem', color: '#6366f1', fontWeight: 600 }}>
                     Filtro activo: {workflows.find(w => w.id === workflowFilter)?.name}
                  </span>
                  <button 
                    onClick={() => setWorkflowFilter(null)}
                    style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '0.8rem', textDecoration: 'underline', cursor: 'pointer' }}
                  >
                     Limpiar Filtro
                  </button>
               </div>
            )}
            {policies.filter(p => !workflowFilter || p.workflowId === workflowFilter).map((pol, idx) => (
              <motion.div 
                key={pol.id} 
                className={styles.row}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <div className={styles.policyInfo}>
                  <span className={styles.policyTitle}>{pol.title}</span>
                  <span className={styles.policySubtitle}><BookOpen size={12} /> {pol.version}</span>
                </div>
                <div>
                  <span className={styles.typeBadge}>{pol.type}</span>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px', fontWeight: 600 }}>
                    {pol.framework_origin || 'Cumplimiento Normativo'}
                  </div>
                </div>
                <div>
                  <span className={`${styles.statusBadge} ${pol.status === 'Vigente' ? styles.vigente : pol.status === 'En Revisión' ? styles.revision : pol.status === 'Vencida' ? styles.vencida : ''}`} style={{ background: pol.status === 'Borrador' ? '#f1f5f9' : undefined, color: pol.status === 'Borrador' ? '#64748b' : undefined }}>
                    {pol.status === 'Vigente' ? <CheckCircle size={14} /> : pol.status === 'En Revisión' ? <History size={14} /> : pol.status === 'Borrador' ? <Clock size={14} /> : <AlertCircle size={14} />}
                    {pol.status}
                  </span>
                </div>
                <div style={{ paddingRight: '20px' }}>
                   <div style={{ fontSize: '0.7rem', color: '#64748b', marginBottom: '4px' }}>
                      {getPolicyWorkflow(pol.workflowId)?.name}
                   </div>
                   <div className={styles.progressBar}>
                      <div 
                        className={styles.progressFill} 
                        style={{ 
                          width: `${((pol.currentStep || 0) + 1) / (getPolicyWorkflow(pol.workflowId)?.steps.length || 3) * 100}%`,
                          backgroundColor: getPolicyWorkflow(pol.workflowId)?.color
                        }}
                      ></div>
                   </div>
                </div>
                <span style={{ fontWeight: 600, color: '#1e293b' }}>{pol.expiry}</span>
                <div className={styles.ownerArea}>
                  <div className={styles.avatarMini}>{pol.owner.split(' ')[0]?.charAt(0) || 'U'}</div>
                  <span style={{ fontSize: '0.85rem' }}>{pol.owner.split(' - ')[0]}</span>
                </div>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                  <button className={styles.actionBtn} onClick={() => setSelectedPolicy(pol)}>Gestionar</button>
                  {isAdmin && (
                    <button 
                      className={styles.actionBtn} 
                      onClick={(e) => { e.stopPropagation(); handleDeletePolicy(pol.id); }}
                      style={{ background: '#fef2f2', color: '#ef4444', border: '1px solid #fca5a5', padding: '6px 10px' }}
                      title="Eliminar Política (Solo Admins)"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </>
        )}

        {activeTab === 'estandares' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
               <h2 className={styles.sectionTitle} style={{ margin: 0, border: 'none' }}>Catálogo de Estándares</h2>
               <button className={styles.primaryBtn} onClick={() => setIsStdModalOpen(true)}>
                  <Plus size={16} style={{ marginRight: '8px' }} /> Nuevo Estándar
               </button>
            </div>
            <div className={styles.tableHeader}>
              <span>Estándar Técnico</span>
              <span>Categoría</span>
              <span>Cobertura / Aplicación</span>
              <span>Estado</span>
              <span>Responsable</span>
              <span></span>
            </div>
            {standards.map((std: any, idx) => (
              <motion.div 
                key={std.id} 
                className={styles.row}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className={styles.policyInfo}>
                  <span className={styles.policyTitle}>{std.name}</span>
                  <span className={styles.policySubtitle}>{std.id}</span>
                </div>
                <div><span className={styles.typeBadge}>{std.category}</span></div>
                <span style={{ fontWeight: 600, color: '#1e293b' }}>{std.applied}</span>
                <div>
                  <span className={styles.sevBadge} style={{ 
                    color: std.status === 'Crítico' ? '#ef4444' : '#10b981',
                    background: std.status === 'Crítico' ? '#fef2f2' : '#f0fdf4',
                    padding: '4px 8px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 700
                  }}>{std.status}</span>
                </div>
                <div className={styles.ownerArea}>
                  <div className={styles.avatarMini}>AR</div>
                  <span style={{ fontSize: '0.85rem' }}>Arquitectura</span>
                </div>
                <button className={styles.actionBtn} onClick={() => { setSelectedStandard(std); setIsStdDetailModalOpen(true); }}>Detalle</button>
              </motion.div>
            ))}
          </>
        )}

        {activeTab === 'flujos' && (
          <div className={styles.mainContent} style={{ padding: '32px' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 className={styles.sectionTitle} style={{ margin: 0, border: 'none' }}>Configuración de Flujos de Aprobación</h2>
                <button className={styles.primaryBtn} onClick={() => openWfEditor({ id: `new_${Date.now()}`, name: 'Nuevo Flujo de Aprobación', color: '#8b5cf6', steps: ['Borrador', 'Revisión Legal', 'Aprobación Final', 'Publicado'] })}>
                   <Plus size={16} style={{ marginRight: '8px' }} /> Nuevo Flujo
                </button>
             </div>
             
             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                {workflows.map((wf, idx) => (
                  <motion.div 
                    key={idx} 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={styles.workflowCard} 
                    style={{ borderTop: `4px solid ${wf.color}` }}
                  >
                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{wf.name}</h3>
                        <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>ID: {wf.id}</span>
                     </div>
                     <div className={styles.stepList}>
                         {wf.steps.map((step: any, sIdx: number) => {
                           const stepName = typeof step === 'string' ? step : (step?.name || '');
                           const stepApprover = typeof step === 'string' ? '' : (step?.approver || '');
                           return (
                             <div key={sIdx} className={styles.stepItem}>
                                <div className={styles.stepDot} style={{ background: wf.color }}>{sIdx + 1}</div>
                                <div className={styles.stepName}>
                                  {stepName}
                                  {stepApprover && <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>Aprobador: {stepApprover}</span>}
                                </div>
                                {sIdx < wf.steps.length - 1 && <div className={styles.stepLine} style={{ background: wf.color, opacity: 0.2 }}></div>}
                             </div>
                           );
                         })}
                      </div>
                     <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '10px' }}>
                        <button className={styles.secondaryBtn} style={{ padding: '6px 12px', fontSize: '0.75rem' }} onClick={() => openWfEditor(wf)}>Editar Pasos</button>
                        <button 
                          className={styles.secondaryBtn} 
                          style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                          onClick={() => {
                            setWorkflowFilter(wf.id);
                            setActiveTab('politicas');
                          }}
                        >
                           Ver Políticas
                        </button>
                     </div>
                  </motion.div>
                ))}
             </div>
          </div>
        )}

        {activeTab === 'procedimientos' && (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
            <Layers size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
            <h3>Guías de Procedimiento Operativo</h3>
            <p>Repositorio de pasos técnicos para la ejecución de tareas de gobierno.</p>
            <div style={{ marginTop: '16px' }}>
               <button className={styles.primaryBtn} onClick={() => setIsProcModalOpen(true)}>
                  <Plus size={16} style={{ marginRight: '8px' }} /> Nuevo Procedimiento
               </button>
            </div>
            <div className={styles.evidenceGrid} style={{ marginTop: '32px', textAlign: 'left' }}>
               {procedures.map((proc: any, idx) => (
                 <div key={idx} className={styles.evidenceCard} onClick={() => { setSelectedProcedure(proc); setIsProcDetailModalOpen(true); }} style={{ cursor: 'pointer' }}>
                    <div style={{ padding: '10px', background: '#eef2ff', borderRadius: '8px' }}><Settings color="#6366f1" /></div>
                    <div>
                       <div style={{ fontWeight: 700 }}>{proc.code}: {proc.title}</div>
                       <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Última Rev: {proc.last_revision_date || 'N/A'} | v{proc.version || '1.0'}</div>
                    </div>
                 </div>
               ))}
               {procedures.length === 0 && (
                 <div style={{ gridColumn: '1 / -1', padding: '20px', textAlign: 'center', color: '#64748b' }}>No hay procedimientos configurados.</div>
               )}
            </div>
          </div>
        )}

        {activeTab === 'controles' && (
          <div className={styles.mainContent} style={{ padding: '0 0 32px 0' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 className={styles.sectionTitle} style={{ margin: 0, border: 'none' }}>Catálogo de Controles Operativos</h2>
                <button className={styles.primaryBtn} onClick={() => { setSelectedControl(null); setNewControl({ code: '', description: '', frequency: 'Diaria', status: 'OK', policy_id: '' }); setIsControlModalOpen(true); }}>
                   <Plus size={16} style={{ marginRight: '8px' }} /> Nuevo Control
                </button>
             </div>
             <div className={styles.tableHeader} style={{ gridTemplateColumns: '1.2fr 2.5fr 1fr 1fr 150px' }}>
                <span>Control ID</span>
                <span>Descripción del Control</span>
                <span>Frecuencia</span>
                <span>Estado</span>
                <span>Acciones</span>
             </div>
             {controls.map((ctrl: any, i) => (
               <div key={i} className={styles.row} style={{ gridTemplateColumns: '1.2fr 2.5fr 1fr 1fr 150px' }}>
                 <span className={styles.riskId}>{ctrl.code}</span>
                 <span style={{ fontWeight: 600 }}>{ctrl.description}</span>
                 <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{ctrl.frequency}</span>
                 <div>
                   <span className={styles.sevBadge} style={{ 
                      background: ctrl.status === 'OK' ? '#f0fdf4' : '#fef2f2',
                      color: ctrl.status === 'OK' ? '#10b981' : '#ef4444'
                   }}>{ctrl.status === 'OK' ? 'CUMPLE' : 'FALLA'}</span>
                 </div>
                 <div style={{ display: 'flex', gap: '8px' }}>
                    <button className={styles.secondaryBtn} onClick={() => { setSelectedControl(ctrl); setIsControlModalOpen(true); }} style={{ padding: '4px 8px', fontSize: '0.75rem' }}>Editar</button>
                    <button className={styles.secondaryBtn} onClick={() => handleDeleteControl(ctrl.id)} style={{ padding: '4px 8px', fontSize: '0.75rem', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)' }}>Eliminar</button>
                 </div>
               </div>
             ))}
             {controls.length === 0 && (
               <div style={{ padding: '20px', textAlign: 'center', color: '#cbd5e1' }}>No hay controles operativos configurados.</div>
             )}
          </div>
        )}

        {activeTab === 'evidencias' && (
          <div className={styles.mainContent} style={{ padding: '32px' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 className={styles.sectionTitle} style={{ margin: 0, border: 'none' }}>Repositorio de Evidencias</h2>
                <button className={styles.primaryBtn} onClick={() => setIsEvidenceModalOpen(true)}>
                   <Plus size={16} style={{ marginRight: '8px' }} /> Subir Evidencia
                </button>
             </div>
             <div className={styles.evidenceGrid}>
              {evidences.map((ev: any, idx) => (
                <div key={idx} className={styles.evidenceCard} onClick={() => ev.file_url ? window.open(ev.file_url, '_blank') : null} style={{ cursor: ev.file_url ? 'pointer' : 'default' }}>
                  <div style={{ padding: '12px', background: '#fef2f2', borderRadius: '10px' }}><FileText color="#ef4444" /></div>
                  <div>
                     <div style={{ fontWeight: 700 }}>{ev.filename}</div>
                     <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{ev.description || 'Certificado por Auditoría Externa'}</div>
                  </div>
                  <Download size={18} style={{ marginLeft: 'auto', color: '#64748b' }} />
                </div>
              ))}
              {evidences.length === 0 && (
                <div style={{ gridColumn: '1 / -1', padding: '20px', textAlign: 'center', color: '#64748b' }}>No hay evidencias registradas en auditoría.</div>
              )}
             </div>
          </div>
        )}
      </div>

      {/* Create Policy Modal */}
      <UnifiedModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Nueva Política Corporativa"
        subtitle="Complete los campos para iniciar el flujo de aprobación."
        type="formulario"
        icon={<ShieldCheck size={24} />}
        footerButtons={
          <>
            <button onClick={() => setIsCreateModalOpen(false)} className={styles.secondaryBtn}>Cancelar</button>
            <button onClick={handleAddPolicy} className={styles.primaryBtn}>Crear Política</button>
          </>
        }
        configOverride={{ width: '700px' }}
      >
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
          <button 
            className={styles.aiBtn} 
            onClick={() => simulateAiGeneration('new')}
            disabled={isAiGenerating}
          >
             <Cpu size={14} /> {isAiGenerating ? 'Generando...' : 'Asistente IA'}
          </button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
          <div>
             <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '8px' }}>Nombre de la Política</label>
             <input 
               type="text" 
               placeholder="Ej: Política de Ética en IA" 
               style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}
               value={newPolicy.title}
               onChange={e => setNewPolicy({...newPolicy, title: e.target.value})}
             />
          </div>
          <div>
             <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '8px' }}>Tipo / Categoría</label>
             <select 
               style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}
               value={newPolicy.type}
               onChange={e => setNewPolicy({...newPolicy, type: e.target.value})}
             >
                <option value="Seguridad y Privacidad">Seguridad y Privacidad</option>
                <option value="Calidad de Datos">Calidad de Datos</option>
                <option value="Ética y Cumplimiento">Ética y Cumplimiento</option>
                <option value="Arquitectura e Integración">Arquitectura e Integración</option>
             </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
            <div>
               <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '8px' }}>Objetivo Principal</label>
               <input 
                 type="text" 
                 placeholder="Ej: Mitigar sesgos en algoritmos" 
                 style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}
                 value={newPolicy.objective}
                 onChange={e => setNewPolicy({...newPolicy, objective: e.target.value})}
               />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '8px' }}>Flujo de Aprobación Asoc.</label>
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

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '24px' }}>
            <div>
               <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '8px' }}>Propietario (Owner)</label>
               <select 
                 style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}
                 value={newPolicy.owner}
                 onChange={e => setNewPolicy({...newPolicy, owner: e.target.value})}
               >
                  {companyUsers.map((m, i) => (
                    <option key={i} value={`${m.name} (${m.role || 'Usuario'})`}>{m.name} ({m.role || 'Usuario'})</option>
                  ))}
               </select>
            </div>
            <div>
               <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '8px' }}>Steward Responsable</label>
               <select 
                 style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}
                 value={newPolicy.data_custodian}
                 onChange={e => setNewPolicy({...newPolicy, data_custodian: e.target.value})}
               >
                  {companyUsers.map((m, i) => (
                    <option key={i} value={`${m.name} (${m.role || 'Usuario'})`}>{m.name} ({m.role || 'Usuario'})</option>
                  ))}
               </select>
            </div>
            <div>
               <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '8px' }}>Año de Expiración</label>
               <input 
                 type="number" 
                 style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}
                 value={newPolicy.expiry}
                 onChange={e => setNewPolicy({...newPolicy, expiry: e.target.value})}
               />
            </div>
        </div>

        <div style={{ marginBottom: '24px' }}>
           <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '8px' }}>Alcance (Áreas / Sistemas afectados)</label>
           <textarea 
             rows={2}
             placeholder="Ej: Sistemas de Big Data, Marketing, UX..." 
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
      </UnifiedModal>

      {/* Workflow Editor Modal */}
      <UnifiedModal
        isOpen={isWfModalOpen && !!editingWf}
        onClose={() => setIsWfModalOpen(false)}
        title={editingWf ? (String(editingWf.id).startsWith('new_') ? 'Nuevo Flujo de Aprobación' : 'Editar Flujo de Aprobación') : ''}
        subtitle="Configure los pasos y el orden del flujo."
        type="formulario"
        icon={<GitBranch size={24} />}
        footerButtons={
          editingWf ? (
            <>
              <button onClick={() => setIsWfModalOpen(false)} className={styles.secondaryBtn}>Cancelar</button>
              <button onClick={saveWorkflow} className={styles.primaryBtn} style={{ background: editingWf.color || '#6366f1' }}>
                 {String(editingWf.id).startsWith('new_') ? 'Crear Flujo' : 'Guardar Cambios'}
              </button>
            </>
          ) : null
        }
        configOverride={{ width: '600px' }}
      >
        {editingWf && (
          <div style={{ display: 'block' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px', marginBottom: '24px' }}>
               <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '8px' }}>Nombre del Flujo</label>
                  <input 
                    type="text" 
                    value={editingWf.name || ''}
                    onChange={e => setEditingWf({ ...editingWf, name: e.target.value })}
                    className={styles.modalInput}
                  />
               </div>
               <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '8px' }}>Color Identificador</label>
                  <input 
                    type="color" 
                    value={editingWf.color || '#6366f1'}
                    onChange={e => setEditingWf({ ...editingWf, color: e.target.value })}
                    className={styles.modalInput}
                    style={{ padding: '4px', height: '46px' }}
                  />
               </div>
            </div>

            <label className={styles.modalLabel} style={{ marginBottom: '12px', display: 'block' }}>Pasos del Ciclo de Vida (Arrastra con el mouse para cambiar el orden)</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: '#f8fafc', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
               {(editingWf.steps || []).map((step: any, idx: number) => {
                  const stepName = typeof step === 'string' ? step : (step?.name || '');
                  const stepApprover = typeof step === 'string' ? '' : (step?.approver || '');
                  return (
                    <div 
                      key={idx} 
                      style={{ 
                        display: 'flex', 
                        flexDirection: 'column',
                        gap: '8px', 
                        background: draggedStepIdx === idx ? 'rgba(99, 102, 241, 0.1)' : '#ffffff',
                        borderRadius: '12px',
                        padding: '16px',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                        transition: 'all 0.2s'
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
                       <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'grab', flexShrink: 0 }}>
                            <GitBranch size={16} style={{ color: '#94a3b8' }} />
                            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: editingWf.color || '#6366f1', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 700 }}>
                              {idx + 1}
                            </div>
                          </div>
                          
                          <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <div>
                              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '4px' }}>Nombre del Paso</label>
                              <input 
                                type="text" 
                                value={stepName}
                                onChange={e => {
                                  const newSteps = [...(editingWf.steps || [])];
                                  if (typeof newSteps[idx] === 'string') {
                                    newSteps[idx] = { name: e.target.value, approver: '' };
                                  } else {
                                    newSteps[idx] = { ...newSteps[idx], name: e.target.value };
                                  }
                                  setEditingWf({ ...editingWf, steps: newSteps });
                                }}
                                className={styles.modalInput}
                                placeholder="Ej: Revisión Legal"
                                style={{ height: '38px', fontSize: '0.875rem' }}
                              />
                            </div>
                            <div>
                              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '4px' }}>Aprobador Asignado</label>
                              <select
                                value={stepApprover}
                                onChange={e => {
                                  const newSteps = [...(editingWf.steps || [])];
                                  const val = e.target.value;
                                  if (typeof newSteps[idx] === 'string') {
                                    newSteps[idx] = { name: newSteps[idx], approver: val };
                                  } else {
                                    newSteps[idx] = { ...newSteps[idx], approver: val };
                                  }
                                  setEditingWf({ ...editingWf, steps: newSteps });
                                }}
                                className={styles.modalInput}
                                style={{ height: '38px', fontSize: '0.875rem', color: 'black' }}
                              >
                                <option value="" style={{ color: 'black' }}>-- Seleccionar Aprobador --</option>
                                {companyUsers.map((m: any, i: number) => (
                                  <option key={i} value={m.name} style={{ color: 'black' }}>
                                    {m.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <button 
                            onClick={() => {
                              const newSteps = (editingWf.steps || []).filter((_: any, i: number) => i !== idx);
                              setEditingWf({ ...editingWf, steps: newSteps });
                            }}
                            style={{ color: '#ef4444', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '10px', width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s', flexShrink: 0, marginTop: '20px' }}
                          >
                             <Trash2 size={18} />
                          </button>
                       </div>
                    </div>
                  );
               })}
               <button 
                 onClick={() => setEditingWf({ ...editingWf, steps: [...(editingWf.steps || []), { name: 'Nuevo Paso', approver: '' }] })}
                 className={styles.secondaryBtn}
                 style={{ marginTop: '8px', alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '8px' }}
               >
                  <Plus size={16} /> Añadir Paso
               </button>
            </div>
          </div>
        )}
      </UnifiedModal>

      {/* KPI Explainer Modal */}
      <UnifiedModal
        isOpen={!!selectedKPI}
        onClose={() => setSelectedKPI(null)}
        title={selectedKPI?.label || ''}
        subtitle=""
        type="informativa"
        icon={<Award size={24} />}
        footerButtons={
          <button className={styles.primaryBtn} onClick={() => setSelectedKPI(null)}>
            Entendido
          </button>
        }
        configOverride={{ width: '500px' }}
      >
        {selectedKPI && (
          <div>
             <p style={{ fontSize: '1.05rem', lineHeight: 1.6, color: '#475569', margin: 0 }}>
               {selectedKPI.explanation}
             </p>
             <div style={{ marginTop: '24px', padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <Info size={20} color="#6366f1" style={{ flexShrink: 0 }} />
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', lineHeight: 1.4 }}>
                  Este indicador se calcula en tiempo real y refleja el estado de gobierno normativo de la organización.
                </p>
             </div>
          </div>
        )}
      </UnifiedModal>

      <UnifiedModal
        isOpen={!!selectedPolicy}
        onClose={() => { setSelectedPolicy(null); setIsEditing(false); }}
        type="formulario"
        configOverride={{ showHeader: false, width: '1000px', contentPadding: '0px' }}
      >
        {selectedPolicy && (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ padding: '24px 32px', background: modalConfig?.headerBg || '#4f46e5', color: modalConfig?.headerTextColor || 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                 <div style={{ padding: '10px', background: 'rgba(255,255,255,0.2)', borderRadius: '12px', display: 'flex' }}>
                   <FileText size={24} />
                 </div>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                   <h3 style={{ margin: 0, color: 'white', fontSize: '1.2rem', fontWeight: 800 }}>{selectedPolicy.title}</h3>
                   <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                     <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px', background: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 600 }}>
                       Versión {selectedPolicy.version}
                     </span>
                     <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px', background: 'rgba(255,255,255,0.25)', color: 'white', fontWeight: 600 }}>
                       {selectedPolicy.status}
                     </span>
                   </div>
                 </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                 {!isEditing ? (
                   <>
                      <button 
                        onClick={startEditing}
                        style={{
                          background: 'rgba(255, 255, 255, 0.2)',
                          border: '1px solid rgba(255, 255, 255, 0.4)',
                          padding: '8px 16px',
                          borderRadius: '10px',
                          cursor: 'pointer',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          fontWeight: 600,
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.35)';
                          e.currentTarget.style.transform = 'translateY(-1px)';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                          e.currentTarget.style.transform = 'translateY(0)';
                        }}
                      >
                        <Settings size={18} style={{ marginRight: '8px' }} /> Editar
                      </button>
                      {selectedPolicy.status === 'Borrador' && (
                        <button className={styles.primaryBtn} style={{ background: '#f59e0b' }} onClick={() => handleUpdateStatus(selectedPolicy.id, 'En Revisión')}>
                          Enviar a Revisión
                        </button>
                      )}
                      {selectedPolicy.status === 'En Revisión' && (
                        <button className={styles.primaryBtn} style={{ background: '#10b981' }} onClick={() => handleUpdateStatus(selectedPolicy.id, 'Vigente')}>
                          <CheckSquare size={18} style={{ marginRight: '8px' }} /> Publicar Política
                        </button>
                      )}
                   </>
                 ) : (
                   <button className={styles.primaryBtn} style={{ background: '#10b981' }} onClick={saveEdits}>
                      <CheckCircle size={18} style={{ marginRight: '8px' }} /> Guardar Cambios
                   </button>
                 )}
                 <button onClick={() => { setSelectedPolicy(null); setIsEditing(false); }} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', padding: '8px', borderRadius: '10px', cursor: 'pointer', color: 'white', display: 'flex' }}>
                   <X size={20} />
                 </button>
              </div>
            </div>

            <div className={styles.modalBody}>
              {/* ... Sidebar ... */}
              <div className={styles.sidebar}>
                {[
                  { id: 'general', label: '1. Objetivo y Alcance', icon: <BookOpen size={16} /> },
                  { id: 'ciclo', label: '2. Ciclo de Vida', icon: <GitBranch size={16} /> },
                  { id: 'lineamientos', label: '3. Lineamientos', icon: <Layers size={16} /> },
                  { id: 'responsables', label: '4. Responsables', icon: <User size={16} /> },
                  { id: 'controles', label: '5. Controles y Sanciones', icon: <Shield size={16} /> },
                  { id: 'evidencias', label: '6. Evidencias y Doc.', icon: <FileSearch size={16} /> }
                ].map(t => (
                  <div 
                    key={t.id}
                    className={`${styles.sideTab} ${modalTab === t.id ? styles.activeSideTab : ''}`}
                    onClick={() => setModalTab(t.id)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {t.icon} {t.label}
                    </div>
                  </div>
                ))}
              </div>

              <div className={styles.mainDetail}>
                {modalTab === 'ciclo' && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                     <h3 className={styles.sectionTitle}>Gestión del Ciclo de Vida</h3>
                     <div style={{ padding: '24px', background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                        <div style={{ marginBottom: '32px' }}>
                           <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '16px' }}>
                              Flujo aplicado: <strong style={{ color: '#1e293b' }}>{getPolicyWorkflow(selectedPolicy.workflowId)?.name}</strong>
                           </div>
                           <div className={styles.horizontalStepper}>
                               {getPolicyWorkflow(selectedPolicy.workflowId)?.steps.map((step: any, sIdx: number) => {
                                  const stepName = typeof step === 'string' ? step : (step?.name || '');
                                  const stepApprover = typeof step === 'string' ? '' : (step?.approver || '');
                                  const isPast = sIdx < (selectedPolicy.currentStep || 0);
                                  const isCurrent = sIdx === (selectedPolicy.currentStep || 0);
                                  return (
                                    <div key={sIdx} className={`${styles.hStep} ${isCurrent ? styles.hStepActive : isPast ? styles.hStepPast : ''}`}>
                                       <div className={styles.hStepDot}>
                                          {isPast ? <CheckCircle size={14} /> : sIdx + 1}
                                       </div>
                                       <div className={styles.hStepLabel}>
                                         {stepName}
                                         {stepApprover && <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block', fontWeight: 'normal' }}>{stepApprover}</span>}
                                       </div>
                                       {sIdx < (getPolicyWorkflow(selectedPolicy.workflowId)?.steps.length || 0) - 1 && (
                                         <div className={styles.hStepLine}></div>
                                       )}
                                    </div>
                                  );
                               })}
                           </div>
                        </div>

                        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', padding: '20px', background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                           <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 700, color: '#1e293b' }}>Paso Actual: {selectedPolicy.status}</div>
                              <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>
                                 {selectedPolicy.currentStep === (getPolicyWorkflow(selectedPolicy.workflowId)?.steps.length || 1) - 1 
                                   ? 'Esta política ha completado su ciclo y se encuentra vigente.' 
                                   : (() => {
                                       const nextStep = getPolicyWorkflow(selectedPolicy.workflowId)?.steps[(selectedPolicy.currentStep || 0) + 1];
                                       const nextStepName = typeof nextStep === 'string' ? nextStep : (nextStep?.name || '');
                                       return `Siguiente paso: ${nextStepName}`;
                                     })()
                                 }
                              </div>
                           </div>
                           {(selectedPolicy.currentStep || 0) < (getPolicyWorkflow(selectedPolicy.workflowId)?.steps.length || 1) - 1 && (
                             <div>
                               {((selectedPolicy.status === 'Subir Documento' || selectedPolicy.status === 'Borrador') && !selectedPolicy.documentUrl) ? (
                                 <>
                                   <input 
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
                                   />
                                   <button 
                                     className={styles.primaryBtn} 
                                     onClick={() => document.getElementById(`workflow-file-upload-${selectedPolicy.id}`)?.click()}
                                     style={{ padding: '10px 20px', background: '#10b981' }}
                                   >
                                      <FileText size={16} style={{ marginRight: '8px' }} /> Adjuntar Doc y Avanzar
                                   </button>
                                 </>
                               ) : (
                                 <button 
                                   className={styles.primaryBtn} 
                                   onClick={() => {
                                      setPolicyToApprove(selectedPolicy.id);
                                      setApproveAssignee(companyUsers[0] ? companyUsers[0].name : '');
                                      setIsApproveModalOpen(true);
                                   }}
                                   style={{ padding: '10px 20px', background: '#f59e0b' }}
                                 >
                                    <CheckCircle size={16} style={{ marginRight: '8px' }} /> Asignar Aprobador y Avanzar
                                 </button>
                               )}
                             </div>
                           )}
                           {(selectedPolicy.currentStep || 0) === (getPolicyWorkflow(selectedPolicy.workflowId)?.steps.length || 1) - 1 && (
                             <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', fontWeight: 700, padding: '10px 20px', background: '#d1fae5', borderRadius: '8px' }}>
                               <ShieldCheck size={20} /> Cumpliendo Normativa
                             </div>
                           )}
                        </div>
                     </div>
                  </motion.div>
                )}

                {modalTab === 'general' && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                       <h3 className={styles.sectionTitle} style={{ margin: 0 }}>Objetivo y Alcance</h3>
                       {isEditing && (
                          <button 
                            className={styles.aiBtn} 
                            onClick={() => simulateAiGeneration('edit')}
                            disabled={isAiGenerating}
                          >
                             <Cpu size={14} /> {isAiGenerating ? 'Generando...' : 'Asistente IA'}
                          </button>
                       )}
                    </div>
                    <div className={styles.richText}>
                      {!isEditing ? (
                        <>
                          <p><strong>Objetivo:</strong> {selectedPolicy.objective || 'No especificado.'}</p>
                          <p style={{ marginTop: '24px' }}><strong>Alcance (Scope):</strong> {selectedPolicy.scope || 'No especificado.'}</p>
                          <p style={{ marginTop: '24px' }}><strong>Descripción / Lineamiento Principal:</strong> {selectedPolicy.guidelines?.[0] || 'No especificada.'}</p>
                        </>
                      ) : (
                         <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div>
                               <label className={styles.modalLabel}>Título de la Política</label>
                               <input 
                                 type="text" 
                                 className={styles.modalInput} 
                                 value={editForm.title}
                                 onChange={e => setEditForm({...editForm, title: e.target.value})}
                               />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                              <div>
                                 <label className={styles.modalLabel}>Propietario (Owner)</label>
                                 <select 
                                   className={styles.modalInput} 
                                   value={editForm.owner}
                                   onChange={e => setEditForm({...editForm, owner: e.target.value})}
                                 >
                                    {companyUsers.map((m, i) => (
                                      <option key={i} style={{ color: 'black' }}>{m.name} ({m.role})</option>
                                    ))}
                                 </select>
                              </div>
                              <div>
                                 <label className={styles.modalLabel}>Tipo</label>
                                 <select 
                                   className={styles.modalInput} 
                                   value={editForm.type}
                                   onChange={e => setEditForm({...editForm, type: e.target.value})}
                                 >
                                    <option style={{ color: 'black' }}>Gobierno de Datos</option>
                                    <option style={{ color: 'black' }}>Seguridad / Privacidad</option>
                                    <option style={{ color: 'black' }}>Cumplimiento / Legal</option>
                                    <option style={{ color: 'black' }}>Tecnología / IA</option>
                                 </select>
                              </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                               <div>
                                  <label className={styles.modalLabel}>Versión</label>
                                  <input 
                                    type="text" 
                                    className={styles.modalInput} 
                                    value={editForm.version}
                                    onChange={e => setEditForm({...editForm, version: e.target.value})}
                                  />
                               </div>
                               <div>
                                  <label className={styles.modalLabel}>Vigencia (Año)</label>
                                  <input 
                                    type="number" 
                                    className={styles.modalInput} 
                                    value={editForm.expiry}
                                    onChange={e => setEditForm({...editForm, expiry: e.target.value})}
                                  />
                               </div>
                            </div>
                            <div>
                               <label className={styles.modalLabel}>Objetivo</label>
                               <textarea 
                                 rows={4}
                                 className={styles.modalInput} 
                                 style={{ minHeight: '100px' }}
                                 value={editForm.objective}
                                 onChange={e => setEditForm({...editForm, objective: e.target.value})}
                               />
                            </div>
                            <div>
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
                         </div>
                      )}
                      <div style={{ marginTop: '32px', padding: '20px', background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                         <h5 style={{ margin: '0 0 8px 0', color: '#1e293b' }}>Información de Base de Datos</h5>
                         <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b' }}>
                            Esta política está registrada activamente en la base de datos de <strong>GovData Nexus</strong> bajo el origen regulatorio: <strong>{selectedPolicy.framework_origin || 'General'}</strong>.
                         </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {modalTab === 'lineamientos' && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                       <h3 className={styles.sectionTitle} style={{ margin: 0 }}>Lineamientos Obligatorios</h3>
                    </div>
                    <div className={styles.richText}>
                      <ul className={styles.guidelineList} style={{ listStyle: 'none', padding: 0 }}>
                        {(isEditing ? editForm.guidelines : selectedPolicy.guidelines)?.map((g: string, i: number) => (
                          <li key={i} style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                            <CheckCircle size={18} color="#10b981" style={{ flexShrink: 0, marginTop: '4px' }} />
                            {isEditing ? (
                              <input 
                                type="text" 
                                value={g}
                                style={{ border: 'none', borderBottom: '1px solid #e2e8f0', width: '100%', fontSize: '0.95rem' }}
                                onChange={e => {
                                  const newG = [...editForm.guidelines];
                                  newG[i] = e.target.value;
                                  setEditForm({...editForm, guidelines: newG});
                                }}
                              />
                            ) : (
                              <span>{g}</span>
                            )}
                          </li>
                        ))}
                      </ul>
                      {isEditing && (
                         <button 
                           className={styles.secondaryBtn} 
                           onClick={() => setEditForm({...editForm, guidelines: [...editForm.guidelines, '']})}
                           style={{ marginTop: '10px', fontSize: '0.8rem' }}
                         >
                           + Añadir Lineamiento
                         </button>
                      )}
                    </div>
                  </motion.div>
                )}

                {modalTab === 'responsables' && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                     <h3 className={styles.sectionTitle}>Matriz de Responsabilidades</h3>
                     <div className={styles.evidenceGrid} style={{ gridTemplateColumns: '1fr' }}>
                        <div className={styles.evidenceCard}>
                           <div style={{ padding: '10px', background: '#eef2ff', borderRadius: '8px' }}><User color="#6366f1" /></div>
                           <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 700 }}>Data Owner (Dueño)</div>
                               {isEditing ? (
                                  <select 
                                    style={{ width: '100%', padding: '8px', marginTop: '4px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#ffffff', color: '#1e293b' }}
                                    value={editForm.owner}
                                    onChange={e => setEditForm({...editForm, owner: e.target.value})}
                                  >
                                     {companyUsers.map((m: any, i: number) => <option key={i} value={`${m.name} (${m.role})`}>{m.name} ({m.role})</option>)}
                                  </select>
                               ) : (
                                  <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{selectedPolicy.owner}</div>
                               )}
                           </div>
                        </div>
                        <div className={styles.evidenceCard}>
                           <div style={{ padding: '10px', background: '#f0fdf4', borderRadius: '8px' }}><Shield color="#10b981" /></div>
                           <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 700 }}>Data Custodian (TI)</div>
                               {isEditing ? (
                                  <select 
                                    style={{ width: '100%', padding: '8px', marginTop: '4px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#ffffff', color: '#1e293b' }}
                                    value={editForm.data_custodian}
                                    onChange={e => setEditForm({...editForm, data_custodian: e.target.value})}
                                  >
                                     {companyUsers.map((m: any, i: number) => <option key={i} value={`${m.name} (${m.role})`}>{m.name} ({m.role})</option>)}
                                  </select>
                               ) : (
                                  <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{selectedPolicy.data_custodian}</div>
                               )}
                           </div>
                        </div>
                        <div className={styles.evidenceCard}>
                           <div style={{ padding: '10px', background: '#fffbeb', borderRadius: '8px' }}><CheckSquare color="#f59e0b" /></div>
                           <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 700 }}>Auditor Designado</div>
                               {isEditing ? (
                                  <select 
                                    style={{ width: '100%', padding: '8px', marginTop: '4px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#ffffff', color: '#1e293b' }}
                                    value={editForm.auditor_designado}
                                    onChange={e => setEditForm({...editForm, auditor_designado: e.target.value})}
                                  >
                                     {companyUsers.map((m: any, i: number) => <option key={i} value={`${m.name} (${m.role})`}>{m.name} ({m.role})</option>)}
                                  </select>
                               ) : (
                                  <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{selectedPolicy.auditor_designado}</div>
                               )}
                           </div>
                        </div>
                     </div>
                  </motion.div>
                )}

                {modalTab === 'controles' && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                    <h3 className={styles.sectionTitle}>Controles y Sanciones</h3>
                    <div className={styles.controlList}>
                       {(isEditing ? editForm.controls : selectedPolicy.controls)?.map((c: string, i: number) => (
                         <div key={i} className={styles.controlItem} style={{ marginBottom: '12px' }}>
                            <ShieldCheck size={20} color="#6366f1" />
                            <div style={{ flex: 1 }}>
                              {isEditing ? (
                                 <input 
                                   type="text" 
                                   value={c}
                                   style={{ border: 'none', borderBottom: '1px solid #e2e8f0', width: '100%', fontSize: '0.95rem' }}
                                   onChange={e => {
                                     const newC = [...editForm.controls];
                                     newC[i] = e.target.value;
                                     setEditForm({...editForm, controls: newC});
                                   }}
                                 />
                              ) : (
                                 <>
                                    <div style={{ fontWeight: 700, color: '#1e293b' }}>{c}</div>
                                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Frecuencia: Mensual | Estado: <span style={{ color: '#10b981', fontWeight: 800 }}>ACTIVO</span></div>
                                 </>
                              )}
                            </div>
                         </div>
                       ))}
                       {isEditing && (
                          <button 
                            className={styles.secondaryBtn} 
                            onClick={() => setEditForm({...editForm, controls: [...editForm.controls, '']})}
                            style={{ marginTop: '10px', fontSize: '0.8rem' }}
                          >
                            + Añadir Control
                          </button>
                       )}
                    </div>
                    <div style={{ marginTop: '32px', padding: '20px', background: '#fef2f2', borderRadius: '16px', border: '1px solid #fca5a5' }}>
                       <h5 style={{ margin: '0 0 8px 0', color: '#dc2626' }}>Sanciones por Incumplimiento</h5>
                       {isEditing ? (
                           <textarea 
                             rows={3}
                             style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #fca5a5', background: '#fff5f5', color: '#1e293b', marginTop: '8px', outline: 'none' }}
                             value={editForm.sancions}
                             onChange={e => setEditForm({...editForm, sancions: e.target.value})}
                           />
                       ) : (
                           <p style={{ margin: 0, fontSize: '0.95rem', color: '#dc2626' }}>{selectedPolicy.sancions}</p>
                       )}
                    </div>
                  </motion.div>
                )}

                {modalTab === 'evidencias' && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                       <h3 className={styles.sectionTitle} style={{ margin: 0 }}>Evidencias y Documentos</h3>
                       <input 
                         type="file" 
                         id={`evidence-file-upload-${selectedPolicy.id}`} 
                         style={{ display: 'none' }} 
                         onChange={(e) => {
                           if (e.target.files && e.target.files.length > 0) {
                             handleFileUpload(selectedPolicy.id, e.target.files[0].name);
                           }
                         }} 
                       />
                       <button className={styles.primaryBtn} style={{ padding: '8px 16px', fontSize: '0.8rem' }} onClick={() => document.getElementById(`evidence-file-upload-${selectedPolicy.id}`)?.click()}>
                          <Plus size={14} style={{ marginRight: '6px' }} /> Subir Documento
                       </button>
                    </div>
                    <div className={styles.evidenceGrid}>
                       <div className={styles.evidenceCard}>
                          <div style={{ padding: '10px', background: '#fef2f2', borderRadius: '8px' }}><FileText color="#ef4444" /></div>
                          <div>
                             <div style={{ fontWeight: 700 }}>Manual_Procedimiento.pdf</div>
                             <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>2.4 MB | Firmado Digitalmente</div>
                          </div>
                       </div>
                       {uploadedFiles[selectedPolicy.id]?.map((f, i) => (
                         <div key={i} className={styles.evidenceCard} style={{ border: '1px solid #10b981' }}>
                            <div style={{ padding: '10px', background: '#f0fdf4', borderRadius: '8px' }}><FileCheck color="#10b981" /></div>
                            <div>
                               <div style={{ fontWeight: 700 }}>{f.name}</div>
                               <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Cargado el: {f.date}</div>
                            </div>
                         </div>
                       ))}
                    </div>
                  </motion.div>
                )}
              </div>
            </div>

            <div className={styles.footer} style={{ padding: '24px 32px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '12px', background: '#f8fafc' }}>
              <div style={{ marginRight: 'auto', display: 'flex', alignItems: 'center', gap: '12px' }}>
                 <div className={styles.avatarMini}>{selectedPolicy.owner?.split(' ')[0]?.[0] || 'U'}</div>
                 <div style={{ fontSize: '0.8rem' }}>
                    <div style={{ color: '#64748b' }}>Propietario Principal</div>
                    <div style={{ fontWeight: 700 }}>{selectedPolicy.owner}</div>
                 </div>
              </div>
              <button className={styles.secondaryBtn} onClick={() => { setSelectedPolicy(null); setIsEditing(false); }}>Cerrar</button>
              <button className={styles.primaryBtn} onClick={handleExportPDF}><Download size={16} style={{ marginRight: '8px' }} /> Exportar PDF</button>
            </div>
          </div>
        )}
      </UnifiedModal>

      {/* Standard Modal */}
      <UnifiedModal
        isOpen={isStdModalOpen}
        onClose={() => setIsStdModalOpen(false)}
        title="Crear Estándar Técnico"
        subtitle="Complete los campos del estándar."
        type="formulario"
        icon={<Layers size={24} />}
        footerButtons={
          <>
            <button className={styles.secondaryBtn} onClick={() => setIsStdModalOpen(false)}>Cancelar</button>
            <button className={styles.primaryBtn} onClick={handleAddStandard}>Crear Estándar</button>
          </>
        }
        configOverride={{ width: '600px' }}
      >
        <div>
          <div className={styles.modalFormGroup}>
            <label className={styles.modalLabel}>Código del Estándar</label>
            <input type="text" value={newStandard.code} onChange={e => setNewStandard({...newStandard, code: e.target.value})} placeholder="Ej: EST-005" className={styles.modalInput} />
          </div>
          <div className={styles.modalFormGroup}>
            <label className={styles.modalLabel}>Nombre del Estándar</label>
            <input type="text" value={newStandard.name} onChange={e => setNewStandard({...newStandard, name: e.target.value})} placeholder="Ej: Cifrado de datos en tránsito" className={styles.modalInput} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
            <div className={styles.modalFormGroup}>
              <label className={styles.modalLabel}>Categoría</label>
              <select value={newStandard.category} onChange={e => setNewStandard({...newStandard, category: e.target.value})} className={styles.modalInput}>
                <option value="Arquitectura">Arquitectura</option>
                <option value="Seguridad">Seguridad</option>
                <option value="Interoperabilidad">Interoperabilidad</option>
                <option value="Accesos">Accesos</option>
              </select>
            </div>
            <div className={styles.modalFormGroup}>
              <label className={styles.modalLabel}>Estado</label>
              <select value={newStandard.status} onChange={e => setNewStandard({...newStandard, status: e.target.value})} className={styles.modalInput}>
                <option value="Activo">Activo</option>
                <option value="Crítico">Crítico</option>
              </select>
            </div>
          </div>
          <div className={styles.modalFormGroup} style={{ marginBottom: '24px' }}>
            <label className={styles.modalLabel}>Enlace al Documento o Subir Archivo</label>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input type="text" value={newStandard.document_url || ''} onChange={e => setNewStandard({...newStandard, document_url: e.target.value})} placeholder="https://sharepoint... o clic en Subir" className={styles.modalInput} style={{ flex: 1 }} />
              <div style={{ position: 'relative' }}>
                <input type="file" id="std-create-upload" style={{ display: 'none' }} onChange={e => handleNativeFileUpload(e, (url) => setNewStandard({...newStandard, document_url: url}), 'estandares')} />
                <label htmlFor="std-create-upload" className={styles.secondaryBtn} style={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer', padding: '12px 16px', borderRadius: '12px' }}>
                   <Upload size={16} style={{ marginRight: '8px' }} /> {isUploading ? 'Subiendo...' : 'Subir'}
                </label>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <button 
              className={styles.secondaryBtn} 
              onClick={() => simulateStandardAiGeneration('new')}
              disabled={isAiGenerating}
              style={{ background: '#f5f3ff', color: '#7c3aed', borderColor: '#d8b4fe', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
               <Cpu size={14} /> Asistente IA
            </button>
          </div>
        </div>
      </UnifiedModal>

      {/* Procedure Modal */}
      <UnifiedModal
        isOpen={isProcModalOpen}
        onClose={() => setIsProcModalOpen(false)}
        title="Crear Procedimiento"
        type="formulario"
        icon={<BookOpen size={24} />}
        footerButtons={
          <>
            <button className={styles.secondaryBtn} onClick={() => setIsProcModalOpen(false)}>Cancelar</button>
            <button className={styles.primaryBtn} onClick={handleAddProcedure}>Crear Procedimiento</button>
          </>
        }
        configOverride={{ width: '600px' }}
      >
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px', marginBottom: '16px' }}>
            <div className={styles.modalFormGroup}>
              <label className={styles.modalLabel}>Código</label>
              <input type="text" value={newProcedure.code} onChange={e => setNewProcedure({...newProcedure, code: e.target.value})} placeholder="PRC-010" className={styles.modalInput} />
            </div>
            <div className={styles.modalFormGroup}>
              <label className={styles.modalLabel}>Versión</label>
              <input type="text" value={newProcedure.version} onChange={e => setNewProcedure({...newProcedure, version: e.target.value})} placeholder="1.0" className={styles.modalInput} />
            </div>
          </div>
          <div className={styles.modalFormGroup} style={{ marginBottom: '16px' }}>
            <label className={styles.modalLabel}>Título del Procedimiento</label>
            <input type="text" value={newProcedure.title} onChange={e => setNewProcedure({...newProcedure, title: e.target.value})} placeholder="Ej: Manual de anonimización" className={styles.modalInput} />
          </div>
          <div className={styles.modalFormGroup} style={{ marginBottom: '24px' }}>
            <label className={styles.modalLabel}>Contenido / Resumen</label>
            <textarea value={newProcedure.content} onChange={e => setNewProcedure({...newProcedure, content: e.target.value})} placeholder="Describe el procedimiento brevemente..." rows={4} className={styles.modalInput} style={{ resize: 'vertical' }} />
          </div>
          <div className={styles.modalFormGroup} style={{ marginBottom: '24px' }}>
            <label className={styles.modalLabel}>Enlace al Documento o Subir Archivo</label>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input type="text" value={newProcedure.document_url || ''} onChange={e => setNewProcedure({...newProcedure, document_url: e.target.value})} placeholder="https://sharepoint... o clic en Subir" className={styles.modalInput} style={{ flex: 1 }} />
              {newProcedure.document_url && (
                <a href={newProcedure.document_url} target="_blank" rel="noopener noreferrer" className={styles.secondaryBtn} style={{ background: '#eff6ff', border: '1px solid #bfdbfe', color: '#2563eb', textDecoration: 'none', padding: '12px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Abrir enlace">
                  <ExternalLink size={16} />
                </a>
              )}
              <div style={{ position: 'relative' }}>
                <input type="file" id="proc-create-upload" style={{ display: 'none' }} onChange={e => handleNativeFileUpload(e, (url) => setNewProcedure({...newProcedure, document_url: url}), 'procedimientos')} />
                <label htmlFor="proc-create-upload" className={styles.secondaryBtn} style={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer', padding: '12px 16px', borderRadius: '12px' }}>
                   <Upload size={16} style={{ marginRight: '8px' }} /> {isUploading ? 'Subiendo...' : 'Subir'}
                </label>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <button 
              className={styles.secondaryBtn} 
              onClick={() => simulateProcedureAiGeneration('new')}
              disabled={isAiGenerating}
              style={{ background: '#f5f3ff', color: '#7c3aed', borderColor: '#d8b4fe', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
               <Cpu size={14} /> {isAiGenerating ? 'Generando...' : 'Asistente IA'}
            </button>
          </div>
        </div>
      </UnifiedModal>

      {/* Standard Detail/Edit Modal */}
      <UnifiedModal
        isOpen={isStdDetailModalOpen && !!selectedStandard}
        onClose={() => setIsStdDetailModalOpen(false)}
        title="Gestionar Estándar Técnico"
        type="formulario"
        icon={<Layers size={24} />}
        footerButtons={
          selectedStandard ? (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button className={styles.secondaryBtn} onClick={() => handleDeleteStandard(selectedStandard.id)} style={{ background: '#fef2f2', border: '1px solid #fee2e2', color: '#ef4444' }}>
                  <Trash2 size={16} style={{ marginRight: '8px' }} /> Eliminar
                </button>
                <button 
                  className={styles.secondaryBtn} 
                  onClick={() => simulateStandardAiGeneration('edit')}
                  disabled={isAiGenerating}
                  style={{ background: '#f5f3ff', color: '#7c3aed', borderColor: '#d8b4fe', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                   <Cpu size={14} /> Mejorar con IA
                </button>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button className={styles.secondaryBtn} onClick={() => setIsStdDetailModalOpen(false)}>Cancelar</button>
                <button className={styles.primaryBtn} onClick={handleUpdateStandard}>Guardar Cambios</button>
              </div>
            </div>
          ) : null
        }
        configOverride={{ width: '600px' }}
      >
        {selectedStandard && (
          <div>
            <div className={styles.modalFormGroup}>
              <label className={styles.modalLabel}>Código del Estándar</label>
              <input type="text" value={selectedStandard.code} onChange={e => setSelectedStandard({...selectedStandard, code: e.target.value})} className={styles.modalInput} />
            </div>
            <div className={styles.modalFormGroup}>
              <label className={styles.modalLabel}>Nombre del Estándar</label>
              <input type="text" value={selectedStandard.name} onChange={e => setSelectedStandard({...selectedStandard, name: e.target.value})} className={styles.modalInput} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
              <div className={styles.modalFormGroup}>
                <label className={styles.modalLabel}>Categoría</label>
                <select value={selectedStandard.category} onChange={e => setSelectedStandard({...selectedStandard, category: e.target.value})} className={styles.modalInput}>
                  <option value="Arquitectura">Arquitectura</option>
                  <option value="Seguridad">Seguridad</option>
                  <option value="Interoperabilidad">Interoperabilidad</option>
                  <option value="Accesos">Accesos</option>
                </select>
              </div>
              <div className={styles.modalFormGroup}>
                <label className={styles.modalLabel}>Estado</label>
                <select value={selectedStandard.status} onChange={e => setSelectedStandard({...selectedStandard, status: e.target.value})} className={styles.modalInput}>
                  <option value="Activo">Activo</option>
                  <option value="Crítico">Crítico</option>
                </select>
              </div>
            </div>
            <div className={styles.modalFormGroup} style={{ marginBottom: '24px' }}>
              <label className={styles.modalLabel}>Enlace al Documento o Subir Archivo</label>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input type="text" value={selectedStandard.document_url || ''} onChange={e => setSelectedStandard({...selectedStandard, document_url: e.target.value})} placeholder="https://sharepoint... o clic en Subir" className={styles.modalInput} style={{ flex: 1 }} />
                {selectedStandard.document_url && (
                  <a href={selectedStandard.document_url} target="_blank" rel="noopener noreferrer" className={styles.secondaryBtn} style={{ background: '#eff6ff', border: '1px solid #bfdbfe', color: '#2563eb', textDecoration: 'none', padding: '12px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Abrir enlace">
                    <ExternalLink size={16} />
                  </a>
                )}
                <div style={{ position: 'relative' }}>
                  <input type="file" id="std-edit-upload" style={{ display: 'none' }} onChange={e => handleNativeFileUpload(e, (url) => setSelectedStandard({...selectedStandard, document_url: url}), 'estandares')} />
                  <label htmlFor="std-edit-upload" className={styles.secondaryBtn} style={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer', padding: '12px 16px', borderRadius: '12px' }}>
                     <Upload size={16} style={{ marginRight: '8px' }} /> {isUploading ? 'Subiendo...' : 'Subir'}
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}
      </UnifiedModal>

      {/* Procedure Detail/Edit Modal */}
      <UnifiedModal
        isOpen={isProcDetailModalOpen && !!selectedProcedure}
        onClose={() => setIsProcDetailModalOpen(false)}
        title="Gestionar Procedimiento"
        type="formulario"
        icon={<BookOpen size={24} />}
        footerButtons={
          selectedProcedure ? (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button className={styles.secondaryBtn} onClick={() => handleDeleteProcedure(selectedProcedure.id)} style={{ background: '#fef2f2', border: '1px solid #fee2e2', color: '#ef4444' }}>
                  <Trash2 size={16} style={{ marginRight: '8px' }} /> Eliminar
                </button>
                <button 
                  className={styles.secondaryBtn} 
                  onClick={() => simulateProcedureAiGeneration('edit')}
                  disabled={isAiGenerating}
                  style={{ background: '#f5f3ff', color: '#7c3aed', borderColor: '#d8b4fe', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                   <Cpu size={14} /> Mejorar con IA
                </button>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button className={styles.secondaryBtn} onClick={() => setIsProcDetailModalOpen(false)}>Cancelar</button>
                <button className={styles.primaryBtn} onClick={handleUpdateProcedure}>Guardar Cambios</button>
              </div>
            </div>
          ) : null
        }
        configOverride={{ width: '600px' }}
      >
        {selectedProcedure && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px', marginBottom: '16px' }}>
              <div className={styles.modalFormGroup}>
                <label className={styles.modalLabel}>Código</label>
                <input type="text" value={selectedProcedure.code} onChange={e => setSelectedProcedure({...selectedProcedure, code: e.target.value})} className={styles.modalInput} />
              </div>
              <div className={styles.modalFormGroup}>
                <label className={styles.modalLabel}>Versión</label>
                <input type="text" value={selectedProcedure.version} onChange={e => setSelectedProcedure({...selectedProcedure, version: e.target.value})} className={styles.modalInput} />
              </div>
            </div>
            <div className={styles.modalFormGroup}>
              <label className={styles.modalLabel}>Título del Procedimiento</label>
              <input type="text" value={selectedProcedure.title} onChange={e => setSelectedProcedure({...selectedProcedure, title: e.target.value})} className={styles.modalInput} />
            </div>
            <div className={styles.modalFormGroup} style={{ marginBottom: '24px' }}>
              <label className={styles.modalLabel}>Contenido / Resumen</label>
              <textarea value={selectedProcedure.content} onChange={e => setSelectedProcedure({...selectedProcedure, content: e.target.value})} rows={4} className={styles.modalInput} style={{ resize: 'vertical' }} />
            </div>
            <div className={styles.modalFormGroup} style={{ marginBottom: '24px' }}>
              <label className={styles.modalLabel}>Enlace al Documento o Subir Archivo</label>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input type="text" value={selectedProcedure.document_url || ''} onChange={e => setSelectedProcedure({...selectedProcedure, document_url: e.target.value})} placeholder="https://sharepoint... o clic en Subir" className={styles.modalInput} style={{ flex: 1 }} />
                {selectedProcedure.document_url && (
                  <a href={selectedProcedure.document_url} target="_blank" rel="noopener noreferrer" className={styles.secondaryBtn} style={{ background: '#eff6ff', border: '1px solid #bfdbfe', color: '#2563eb', textDecoration: 'none', padding: '12px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Abrir enlace">
                    <ExternalLink size={16} />
                  </a>
                )}
                <div style={{ position: 'relative' }}>
                  <input type="file" id="proc-edit-upload" style={{ display: 'none' }} onChange={e => handleNativeFileUpload(e, (url) => setSelectedProcedure({...selectedProcedure, document_url: url}), 'procedimientos')} />
                  <label htmlFor="proc-edit-upload" className={styles.secondaryBtn} style={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer', padding: '12px 16px', borderRadius: '12px' }}>
                     <Upload size={16} style={{ marginRight: '8px' }} /> {isUploading ? 'Subiendo...' : 'Subir'}
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}
      </UnifiedModal>
      {/* Evidence Upload Modal */}
      <UnifiedModal
        isOpen={isEvidenceModalOpen}
        onClose={() => setIsEvidenceModalOpen(false)}
        title="Subir Evidencia"
        type="formulario"
        icon={<Upload size={24} />}
        footerButtons={
          <>
            <button className={styles.secondaryBtn} onClick={() => setIsEvidenceModalOpen(false)}>Cancelar</button>
            <button className={styles.primaryBtn} onClick={handleAddEvidence}>Guardar Evidencia</button>
          </>
        }
        configOverride={{ width: '500px' }}
      >
        <div>
          <div className={styles.modalFormGroup}>
            <label className={styles.modalLabel}>Nombre del Documento</label>
            <input type="text" value={newEvidence.filename} onChange={e => setNewEvidence({...newEvidence, filename: e.target.value})} placeholder="Ej: Certificado ISO 27001" className={styles.modalInput} />
          </div>
          <div className={styles.modalFormGroup}>
            <label className={styles.modalLabel}>Descripción / Notas</label>
            <input type="text" value={newEvidence.description} onChange={e => setNewEvidence({...newEvidence, description: e.target.value})} placeholder="Notas sobre la evidencia" className={styles.modalInput} />
          </div>
          <div className={styles.modalFormGroup} style={{ marginBottom: '24px' }}>
            <label className={styles.modalLabel}>Enlace al Documento o Subir Evidencia</label>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input type="text" value={newEvidence.file_url || ''} onChange={e => setNewEvidence({...newEvidence, file_url: e.target.value})} placeholder="https://sharepoint... o clic en Subir" className={styles.modalInput} style={{ flex: 1 }} />
              {newEvidence.file_url && (
                <a href={newEvidence.file_url} target="_blank" rel="noopener noreferrer" className={styles.secondaryBtn} style={{ background: '#eff6ff', border: '1px solid #bfdbfe', color: '#2563eb', textDecoration: 'none', padding: '12px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Abrir enlace">
                  <ExternalLink size={16} />
                </a>
              )}
              <div style={{ position: 'relative' }}>
                <input type="file" id="ev-create-upload" style={{ display: 'none' }} onChange={e => handleNativeFileUpload(e, (url) => setNewEvidence({...newEvidence, file_url: url}), 'evidencias')} />
                <label htmlFor="ev-create-upload" className={styles.secondaryBtn} style={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer', padding: '12px 16px', borderRadius: '12px' }}>
                   <Upload size={16} style={{ marginRight: '8px' }} /> {isUploading ? 'Subiendo...' : 'Subir'}
                </label>
              </div>
            </div>
          </div>
        </div>
      </UnifiedModal>

      {/* Approve Workflow Modal */}
      <UnifiedModal
        isOpen={isApproveModalOpen}
        onClose={() => { setIsApproveModalOpen(false); setPolicyToApprove(null); }}
        title="Asignar Aprobador y Avanzar"
        subtitle="Seleccione el usuario responsable de aprobar el paso actual de la política."
        type="formulario"
        icon={<User size={24} />}
        footerButtons={
          <>
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
          </>
        }
        configOverride={{ width: '500px' }}
      >
        <div>
          <div className={styles.modalFormGroup} style={{ marginBottom: '24px' }}>
            <label className={styles.modalLabel} style={{ fontWeight: 700, marginBottom: '8px', display: 'block' }}>Aprobador Asignado</label>
            <select 
              value={approveAssignee} 
              onChange={e => setApproveAssignee(e.target.value)} 
              className={styles.modalInput}
              style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#ffffff', color: '#000000' }}
            >
              {companyUsers.map((u, i) => (
                <option key={i} value={u.name}>{u.name}</option>
              ))}
            </select>
          </div>
        </div>
      </UnifiedModal>

            {/* --- Template Formal para Exportación PDF --- */}
      {selectedPolicy && (
        <div id="formal-policy-document" className={styles.printableDocument}>
          <div 
            className={styles.printWatermark} 
            style={{ 
              color: selectedPolicy.status === 'Vigente' || selectedPolicy.status === 'Publicado' || selectedPolicy.status?.includes('Aproba') ? 'rgba(16, 185, 129, 0.1)' : 
                     selectedPolicy.status === 'Borrador' ? 'rgba(100, 116, 139, 0.1)' : 'rgba(239, 68, 68, 0.1)'
            }}
          >
            {selectedPolicy.status}
          </div>
          <div className={styles.printHeader}>
             <div style={{ fontSize: '24px', fontWeight: 900, color: '#1e293b' }}>GovData<span style={{ color: '#6366f1' }}>Nexus</span></div>
             <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>{selectedPolicy.title}</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Referencia: {selectedPolicy.id?.substring(0,8).toUpperCase()} | Versión: {selectedPolicy.version}</div>
             </div>
          </div>

          <div className={styles.printBody}>
             <div className={styles.printMetaGrid}>
                <div><strong>Estado:</strong> {selectedPolicy.status}</div>
                <div><strong>Vigencia:</strong> {selectedPolicy.expiry}</div>
                <div><strong>Propietario:</strong> {selectedPolicy.owner}</div>
                <div><strong>Clasificación:</strong> Confidencial / Uso Interno</div>
             </div>

             <section>
                <h2 className={styles.printSectionTitle}>1. Objetivo</h2>
                <div className={styles.printSectionContent}>{selectedPolicy.objective || 'No especificado.'}</div>
             </section>

             <section>
                <h2 className={styles.printSectionTitle}>2. Alcance</h2>
                <div className={styles.printSectionContent}>{selectedPolicy.scope || 'No especificado.'}</div>
             </section>

             <section>
                <h2 className={styles.printSectionTitle}>3. Lineamientos</h2>
                <div className={styles.printSectionContent}>
                  <ul>
                     {selectedPolicy.guidelines?.filter(Boolean).length > 0 ? selectedPolicy.guidelines.map((g: string, i: number) => (
                       <li key={i}>{g}</li>
                     )) : <li>No hay lineamientos especificados.</li>}
                  </ul>
                </div>
             </section>

             <section>
                <h2 className={styles.printSectionTitle}>4. Controles Asociados</h2>
                <div className={styles.printSectionContent}>
                  <ul>
                     {selectedPolicy.controls?.filter(Boolean).length > 0 ? selectedPolicy.controls.map((c: string, i: number) => (
                       <li key={i}>{c}</li>
                     )) : <li>No hay controles especificados.</li>}
                  </ul>
                </div>
             </section>

             <section>
                <h2 className={styles.printSectionTitle}>5. Sanciones</h2>
                <div className={styles.printSectionContent}>{selectedPolicy.sancions || 'No especificado.'}</div>
             </section>

             <div className={styles.printSignatureArea}>
                <div className={styles.signatureBox}>
                   <div className={styles.sigLine}></div>
                   <div style={{ fontWeight: 700 }}>{selectedPolicy.owner}</div>
                   <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Responsable de la Política</div>
                </div>
                <div className={styles.signatureBox}>
                   <div className={styles.sigLine}></div>
                   <div style={{ fontWeight: 700 }}>Elena Gomez</div>
                   <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Auditoría y Cumplimiento</div>
                </div>
             </div>
          </div>
          
          <div className={styles.printFooter}>
             Documento generado automáticamente por GovData Nexus - © 2024 - Todos los derechos reservados.
          </div>
        </div>
      )}
      {/* Manage Control Modal */}
      <UnifiedModal
        isOpen={isControlModalOpen}
        onClose={() => { setIsControlModalOpen(false); setSelectedControl(null); }}
        title={selectedControl ? 'Editar Control Operativo' : 'Nuevo Control Operativo'}
        type="formulario"
        icon={<Shield size={24} />}
        footerButtons={
          <>
            <button className={styles.secondaryBtn} onClick={() => { setIsControlModalOpen(false); setSelectedControl(null); }}>Cancelar</button>
            <button className={styles.primaryBtn} onClick={selectedControl ? handleUpdateControl : handleAddControl}>
              {selectedControl ? 'Guardar Cambios' : 'Crear Control'}
            </button>
          </>
        }
        configOverride={{ width: '500px' }}
      >
        <div>
          <div className={styles.modalFormGroup}>
            <label className={styles.modalLabel}>Código del Control</label>
            <input 
              type="text" 
              value={selectedControl ? selectedControl.code : newControl.code} 
              onChange={e => {
                if (selectedControl) {
                  setSelectedControl({ ...selectedControl, code: e.target.value });
                } else {
                  setNewControl({ ...newControl, code: e.target.value });
                }
              }} 
              placeholder="Ej: CTRL-001" 
              className={styles.modalInput} 
            />
          </div>
          <div className={styles.modalFormGroup}>
            <label className={styles.modalLabel}>Descripción</label>
            <textarea 
              value={selectedControl ? selectedControl.description : newControl.description} 
              onChange={e => {
                if (selectedControl) {
                  setSelectedControl({ ...selectedControl, description: e.target.value });
                } else {
                  setNewControl({ ...newControl, description: e.target.value });
                }
              }} 
              placeholder="Descripción detallada del control operativo..." 
              className={styles.modalInput}
              style={{ minHeight: '100px', resize: 'vertical' }}
            />
          </div>
          <div className={styles.modalFormGroup}>
            <label className={styles.modalLabel}>Frecuencia</label>
            <select 
              value={selectedControl ? selectedControl.frequency : newControl.frequency} 
              onChange={e => {
                if (selectedControl) {
                  setSelectedControl({ ...selectedControl, frequency: e.target.value });
                } else {
                  setNewControl({ ...newControl, frequency: e.target.value });
                }
              }} 
              className={styles.modalInput}
            >
              <option value="Diaria">Diaria</option>
              <option value="Semanal">Semanal</option>
              <option value="Mensual">Mensual</option>
              <option value="Trimestral">Trimestral</option>
              <option value="Semestral">Semestral</option>
              <option value="Anual">Anual</option>
              <option value="Continuo">Continuo</option>
            </select>
          </div>
          <div className={styles.modalFormGroup}>
            <label className={styles.modalLabel}>Estado</label>
            <select 
              value={selectedControl ? selectedControl.status : newControl.status} 
              onChange={e => {
                if (selectedControl) {
                  setSelectedControl({ ...selectedControl, status: e.target.value });
                } else {
                  setNewControl({ ...newControl, status: e.target.value });
                }
              }} 
              className={styles.modalInput}
            >
              <option value="OK">CUMPLE (OK)</option>
              <option value="FALLA">FALLA</option>
            </select>
          </div>
          <div className={styles.modalFormGroup} style={{ marginBottom: '24px' }}>
            <label className={styles.modalLabel}>Política Asociada</label>
            <select 
              value={selectedControl ? (selectedControl.policy_id || '') : (newControl.policy_id || '')} 
              onChange={e => {
                if (selectedControl) {
                  setSelectedControl({ ...selectedControl, policy_id: e.target.value || null });
                } else {
                  setNewControl({ ...newControl, policy_id: e.target.value || null });
                }
              }} 
              className={styles.modalInput}
            >
              <option value="">Ninguna política asociada</option>
              {policies.map((p, i) => (
                <option key={i} value={p.id}>{p.title}</option>
              ))}
            </select>
          </div>
        </div>
      </UnifiedModal>

    </div>
  );
}
