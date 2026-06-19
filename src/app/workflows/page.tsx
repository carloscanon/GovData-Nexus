'use client';

import { useEffect, useState } from 'react';
import { 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ArrowUpRight,
  FileText,
  User,
  MoreHorizontal,
  Loader2,
  AlertCircle,
  ShieldAlert,
  Activity,
  CheckCircle,
  AlertTriangle,
  ExternalLink,
  Filter,
  Search,
  MessageSquare,
  Paperclip,
  History,
  GitBranch,
  Shield,
  Layers,
  Award,
  Info,
  X,
  RefreshCw,
  GitMerge,
  ChevronRight,
  Download,
  Send,
  Eye,
  Sliders,
  Check,
  TrendingUp,
  Cpu,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { usePlatform } from '@/contexts/PlatformContext';
import styles from './workflows.module.css';

interface WorkflowReq {
  id: string;
  title: string;
  requester: string;
  type: string;
  category: string;
  status: 'Nuevo' | 'En revisión' | 'Pendiente de información' | 'En ejecución' | 'Bloqueado' | 'Escalado' | 'Aprobado' | 'Rechazado' | 'Cerrado';
  priority: 'Baja' | 'Media' | 'Alta' | 'Crítica';
  date: string;
  sla: string;
  slaStatus: 'Ok' | 'Warning' | 'Overdue';
  description?: string;
  assignee?: string;
  expirationDate?: string;
  currentStep: string;
  timeline: { step: string; user: string; date: string; status: string; ip?: string; justification?: string }[];
  impactScore?: number;
  riskLevel?: 'Bajo' | 'Medio' | 'Alto' | 'Crítico';
  dependencies?: string;
  slaRuleId?: string;   // FK to sla_rules
  domainId?: string;    // FK to team_domains — source of truth for domain
}

interface SlaRule {
  id: string;
  name: string;
  priority: string;
  domain: string;
  hours: number;
  alertThreshold: number; // e.g. 75, 90
  workingHoursOnly: boolean;
}

interface AuditLogEntry {
  id: string;
  date: string;
  user: string;
  action: string;
  prevValue: string;
  newValue: string;
  ip: string;
  justification: string;
}

export default function Workflows() {
  const { currentTenant } = usePlatform();
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<'dashboard' | 'inbox' | 'workflow-designer' | 'sla-config' | 'audit' | 'ai-copilot'>('dashboard');
  
  // Tab/filter values for smart inbox
  const [activeTab, setActiveTab] = useState('pendientes');
  const [activeDomain, setActiveDomain] = useState<string | null>(null);
  
  // DB states
  const [requests, setRequests] = useState<WorkflowReq[]>([]);
  const [domains, setDomains] = useState<any[]>([]);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [slaRules, setSlaRules] = useState<SlaRule[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  
  // Selection states
  const [selectedReq, setSelectedReq] = useState<WorkflowReq | null>(null);
  const [selectedKPI, setSelectedKPI] = useState<any>(null);
  
  // UI triggers
  const [isNewRequestModalOpen, setIsNewRequestModalOpen] = useState(false);
  const [newReq, setNewReq] = useState({
    title: '',
    category: '',
    priority: 'Media' as any,
    description: '',
    impactScore: 5,
    riskLevel: 'Medio' as any,
    dependencies: ''
  });
  
  // SLA config states
  const [newSlaRule, setNewSlaRule] = useState<Partial<SlaRule>>({
    name: '',
    priority: 'Cualquiera',
    domain: 'General',
    hours: 48,
    alertThreshold: 75,
    workingHoursOnly: true
  });
  
  // Search & advanced filters
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdvancedFilterOpen, setIsAdvancedFilterOpen] = useState(false);
  const [filterPriority, setFilterPriority] = useState('Todos');
  const [filterSlaStatus, setFilterSlaStatus] = useState('Todos');
  const [filterAssignee, setFilterAssignee] = useState('Todos');
  const [filterRisk, setFilterRisk] = useState('Todos');
  
  // Details comments & evidences
  const [comments, setComments] = useState<any[]>([]);
  const [evidences, setEvidences] = useState<any[]>([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [isUploadingEvidence, setIsUploadingEvidence] = useState(false);
  const [detailTab, setDetailTab] = useState('general');
  const [auditJustification, setAuditJustification] = useState('');
  
  // AI Copilot States
  const [aiQuery, setAiQuery] = useState('');
  const [aiChat, setAiChat] = useState<{ sender: 'user' | 'bot'; text: string; actionData?: any[] }[]>([
    { sender: 'bot', text: '¡Hola! Soy el Copiloto de IA de GovData Nexus. Pregúntame sobre los casos críticos, riesgos por dominio o resúmenes del día.' }
  ]);
  
  // Timeframe for dashboard trends
  const [timeframe, setTimeframe] = useState<'7' | '30' | '90' | '365'>('30');
  
  // Drag state for workflow designer
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = (idx: number) => setDragIndex(idx);
  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    setDragOverIndex(idx);
  };
  const handleDrop = (idx: number) => {
    if (dragIndex === null || dragIndex === idx) {
      setDragIndex(null);
      setDragOverIndex(null);
      return;
    }
    const newSteps = [...designerProcess.steps];
    const [moved] = newSteps.splice(dragIndex, 1);
    newSteps.splice(idx, 0, moved);
    setDesignerProcess({ ...designerProcess, steps: newSteps });
    setDragIndex(null);
    setDragOverIndex(null);
  };
  const handleDragEnd = () => {
    setDragIndex(null);
    setDragOverIndex(null);
  };

  // No-code Workflow Designer states
  const [designerProcess, setDesignerProcess] = useState({
    name: 'Aprobación de Acceso a Producción',
    version: '2.1',
    steps: [
      { id: '1', name: 'Validación Inicial', type: 'auto', approver: 'Sistema', duration: '1h' },
      { id: '2', name: 'Aprobación del Data Owner', type: 'manual', approver: 'Owner del Dominio', duration: '24h' },
      { id: '3', name: 'Revisión del Data Steward', type: 'manual', approver: 'Steward Asignado', duration: '48h' },
      { id: '4', name: 'Provisionamiento', type: 'auto', approver: 'Integration API', duration: '2h' }
    ]
  });
  const [newDesignerStep, setNewDesignerStep] = useState({ name: '', type: 'manual', approver: '', duration: '24h' });

  // 1. Fetch initial DB info
  useEffect(() => {
    if (!currentTenant?.id) return;
    
    const fetchAllData = async () => {
      try {
        const [reqs, slas, doms, team] = await Promise.all([
          supabase.from('workflow_requests').select('*').eq('tenant_id', currentTenant.id).order('created_at', { ascending: false }),
          supabase.from('sla_rules').select('*').eq('tenant_id', currentTenant.id).order('created_at', { ascending: false }),
          supabase.from('team_domains').select('id, name').eq('tenant_id', currentTenant.id),
          supabase.from('team_members').select('id, name, avatar').eq('tenant_id', currentTenant.id)
        ]);

        let loadedReqs: WorkflowReq[] = [];
        const domainList = doms.data || [];
        if (reqs.data) {
          loadedReqs = reqs.data.map((r: any) => {
            const createdTime = new Date(r.created_at).getTime();
            const nowTime = Date.now();
            let calculatedSlaStatus: 'Ok' | 'Warning' | 'Overdue' = r.sla_status || 'Ok';
            let expirationDateStr = 'N/A';
            const slaStr = (r.sla || '').trim();
            const hoursMatch = slaStr.match(/^(\d+)h$/);

            if (hoursMatch) {
              const slaHours = parseInt(hoursMatch[1], 10);
              const expTime = new Date(createdTime + slaHours * 60 * 60 * 1000);
              expirationDateStr = expTime.toLocaleString('es-CO');
              const diffHours = (nowTime - createdTime) / (1000 * 60 * 60);
              if (r.status !== 'Aprobado' && r.status !== 'Rechazado' && r.status !== 'Cerrado') {
                if (diffHours > slaHours) calculatedSlaStatus = 'Overdue';
                else if (slaHours - diffHours <= 12) calculatedSlaStatus = 'Warning';
              }
            }

            // Resolve category: prefer domain name from domain_id FK, fallback to stored category
            const linkedDomain = r.domain_id ? domainList.find((d: any) => d.id === r.domain_id) : null;
            const resolvedCategory = linkedDomain ? linkedDomain.name : (r.category || 'General');

            return {
              id: r.id,
              title: r.title,
              requester: r.requested_by || 'Sistema',
              type: r.title?.includes('Incidente') ? 'Incidente Operativo' : 'Solicitud',
              category: resolvedCategory,
              status: (r.status === 'Pendiente' ? 'Nuevo' : r.status === 'En Revisión' ? 'En revisión' : r.status) as any,
              priority: r.priority || 'Media',
              date: new Date(r.created_at).toISOString().split('T')[0],
              sla: r.sla || '48h',
              slaStatus: calculatedSlaStatus,
              description: r.description,
              assignee: r.assigned_to || '',
              expirationDate: expirationDateStr,
              currentStep: r.current_step || 'Validación Inicial',
              timeline: r.timeline || [{ step: 'Solicitud Creada', user: 'Sistema', date: new Date(r.created_at).toISOString().split('T')[0], status: 'done' }],
              impactScore: r.impact_score ?? (r.priority === 'Crítica' ? 10 : r.priority === 'Alta' ? 8 : r.priority === 'Media' ? 5 : 3),
              riskLevel: r.risk_level || (r.priority === 'Crítica' ? 'Crítico' : r.priority === 'Alta' ? 'Alto' : 'Medio'),
              dependencies: r.dependencies || 'Ninguna',
              slaRuleId: r.sla_rule_id || undefined,
              domainId: r.domain_id || undefined
            };
          });
          setRequests(loadedReqs);
        }

        if (slas.data && slas.data.length > 0) {
          setSlaRules(slas.data.map((s: any) => ({
            id: s.id,
            name: s.name,
            priority: s.priority || 'Cualquiera',
            domain: s.domain || 'General',
            hours: s.hours || 48,
            alertThreshold: s.alert_threshold || 75,
            workingHoursOnly: s.working_hours_only !== false
          })));
        } else {
          // Pre-populate mock SLA Rules
          setSlaRules([
            { id: '1', name: 'Atención Crítica de Seguridad', priority: 'Crítica', domain: 'Seguridad', hours: 4, alertThreshold: 90, workingHoursOnly: false },
            { id: '2', name: 'Validación Financiera Estándar', priority: 'Media', domain: 'Financiero', hours: 48, alertThreshold: 75, workingHoursOnly: true },
            { id: '3', name: 'Incidentes de Calidad', priority: 'Alta', domain: 'Calidad', hours: 24, alertThreshold: 80, workingHoursOnly: true }
          ]);
        }

        if (doms.data) setDomains(doms.data);
        if (team.data) setTeamMembers(team.data);

        // Prepopulate Audit Logs
        const tempLogs: AuditLogEntry[] = [];
        loadedReqs.forEach(req => {
          req.timeline.forEach((t, i) => {
            tempLogs.push({
              id: `${req.id}-${i}`,
              date: t.date,
              user: t.user || 'Sistema',
              action: t.step,
              prevValue: 'N/A',
              newValue: req.status,
              ip: t.ip || '192.168.1.42',
              justification: t.justification || 'Auditoría inicial de creación y transición automatizada.'
            });
          });
        });
        setAuditLogs(tempLogs.slice(0, 30));

      } catch (err) {
        console.error('Error fetching Governance Center data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [currentTenant?.id]);

  // 2. Comments and Evidences loader
  useEffect(() => {
    if (!selectedReq || !currentTenant?.id) return;
    const fetchAssetsInfo = async () => {
      try {
        const [commentsRes, evidencesRes] = await Promise.all([
          supabase.from('workflow_comments').select('*').eq('request_id', selectedReq.id).eq('tenant_id', currentTenant.id).order('created_at', { ascending: true }),
          supabase.from('workflow_evidences').select('*').eq('request_id', selectedReq.id).eq('tenant_id', currentTenant.id).order('created_at', { ascending: true })
        ]);
        if (commentsRes.data) setComments(commentsRes.data);
        if (evidencesRes.data) setEvidences(evidencesRes.data);
      } catch (e) {
        console.error(e);
      }
    };
    fetchAssetsInfo();
  }, [selectedReq, currentTenant?.id]);

  // 3. Request priority calculation (RF-02 Priority Engine)
  const getPriorityScore = (req: WorkflowReq): number => {
    let score = 0;
    // SLA Factor
    if (req.slaStatus === 'Overdue') score += 40;
    else if (req.slaStatus === 'Warning') score += 25;
    else score += 10;
    // Priority level factor
    if (req.priority === 'Crítica') score += 30;
    else if (req.priority === 'Alta') score += 20;
    else if (req.priority === 'Media') score += 10;
    else score += 5;
    // Impact level factor
    score += (req.impactScore || 5) * 2; // up to 20 points
    // Domain criticalities
    if (['Seguridad', 'Financiero', 'Cumplimiento'].includes(req.category)) {
      score += 10;
    }
    return score;
  };

  // 4. Save and audit log transition
  const handleSaveRequestChanges = async () => {
    if (!selectedReq || !currentTenant?.id) return;
    
    try {
      const original = requests.find(r => r.id === selectedReq.id);
      const newTimeline = [...(selectedReq.timeline || [])];
      const today = new Date().toISOString().split('T')[0];
      
      let changeMsg = 'Actualización';
      if (original) {
        if (original.status !== selectedReq.status) {
          changeMsg = `Cambio de Estado: ${original.status} -> ${selectedReq.status}`;
          newTimeline.push({
            step: changeMsg,
            user: 'Usuario Operaciones',
            date: today,
            status: 'done',
            ip: '192.168.1.102',
            justification: auditJustification || 'Revisión y avance de etapa operativa'
          });
          
          // Log Audit Log entry
          const newAuditEntry: AuditLogEntry = {
            id: `${selectedReq.id}-${Date.now()}`,
            date: new Date().toLocaleString('es-CO'),
            user: 'Usuario Operaciones',
            action: changeMsg,
            prevValue: original.status,
            newValue: selectedReq.status,
            ip: '192.168.1.102',
            justification: auditJustification || 'Revisión operativa del flujo de gobierno'
          };
          setAuditLogs([newAuditEntry, ...auditLogs]);
        }
      }

      // Recalculate SLA status after edits
      let recalcSlaStatus: 'Ok' | 'Warning' | 'Overdue' = 'Ok';
      const slaHoursMatch = (selectedReq.sla || '').trim().match(/^(\d+)h$/);
      if (slaHoursMatch) {
        const slaHours = parseInt(slaHoursMatch[1], 10);
        const createdTime = new Date(selectedReq.date).getTime();
        const diffHours = (Date.now() - createdTime) / (1000 * 60 * 60);
        if (!['Aprobado','Rechazado','Cerrado'].includes(selectedReq.status)) {
          if (diffHours > slaHours) recalcSlaStatus = 'Overdue';
          else if (slaHours - diffHours <= 12) recalcSlaStatus = 'Warning';
        }
      }

      const updatedReq = {
        ...selectedReq,
        timeline: newTimeline,
        slaStatus: recalcSlaStatus
      };

      // Resolve domain_id from the selected category name
      const selectedDomain = domains.find((d: any) => d.name === updatedReq.category);
      const resolvedDomainId = selectedDomain?.id || updatedReq.domainId || null;

      await supabase.from('workflow_requests').update({
        status: updatedReq.status,
        sla_status: recalcSlaStatus,
        current_step: updatedReq.currentStep,
        timeline: updatedReq.timeline,
        assigned_to: updatedReq.assignee || null,
        priority: updatedReq.priority,
        sla: updatedReq.sla,
        category: updatedReq.category,
        domain_id: resolvedDomainId,
        impact_score: updatedReq.impactScore,
        risk_level: updatedReq.riskLevel,
        // sla_rule_id may not exist yet — guarded via try/catch
        ...(updatedReq.slaRuleId !== undefined ? { sla_rule_id: updatedReq.slaRuleId || null } : {})
      }).eq('id', updatedReq.id);

      // Update local state with resolved domainId
      const finalReq = { ...updatedReq, domainId: resolvedDomainId || undefined };
      setRequests(requests.map(r => r.id === finalReq.id ? finalReq : r));
      setSelectedReq(null);
      setAuditJustification('');
      alert('✅ Cambios aplicados y persistidos en la base de datos.');
    } catch (e) {
      console.error(e);
    }
  };

  // 5. Post comments
  const handlePostComment = async () => {
    if (!newCommentText.trim() || !selectedReq || !currentTenant?.id) return;
    try {
      const { data, error } = await supabase.from('workflow_comments').insert([{
        tenant_id: currentTenant.id,
        request_id: selectedReq.id,
        author: 'Usuario Operaciones',
        comment: newCommentText.trim()
      }]).select();
      if (data) {
        setComments([...comments, data[0]]);
        setNewCommentText('');
      }
    } catch (e) {
      console.error(e);
    }
  };

  // 6. Manual request creation
  const handleCreateRequest = async () => {
    if (!newReq.title || !currentTenant?.id) return;

    // Find best matching SLA rule
    let matchingRule = slaRules.find(r => r.priority === newReq.priority && r.domain === newReq.category);
    if (!matchingRule) matchingRule = slaRules.find(r => r.domain === newReq.category && r.priority === 'Cualquiera');
    if (!matchingRule) matchingRule = slaRules.find(r => r.priority === newReq.priority && r.domain === 'General');
    if (!matchingRule) matchingRule = slaRules.find(r => r.domain === 'General' && r.priority === 'Cualquiera');
    if (!matchingRule && slaRules.length > 0) matchingRule = slaRules[0];

    const assignedHours = matchingRule ? matchingRule.hours : 48;

    // Resolve domain_id from category name
    const selectedDomainObj = domains.find((d: any) => d.name === newReq.category);
    const resolvedDomainId = selectedDomainObj?.id || null;

    const timeline = [
      { step: 'Creado y Priorizado', user: 'Usuario Operaciones', date: new Date().toISOString().split('T')[0], status: 'done' }
    ];

    try {
      const payload: any = {
        tenant_id: currentTenant.id,
        title: newReq.title,
        description: newReq.description,
        category: newReq.category || 'General',
        domain_id: resolvedDomainId,
        priority: newReq.priority,
        status: 'Nuevo',
        sla: `${assignedHours}h`,
        sla_status: 'Ok',
        current_step: 'Validación Inicial',
        timeline: timeline,
        impact_score: newReq.impactScore,
        risk_level: newReq.riskLevel,
        dependencies: newReq.dependencies
      };
      if (matchingRule) payload.sla_rule_id = matchingRule.id;

      const { data, error } = await supabase.from('workflow_requests').insert([payload]).select();

      if (error) {
        // If sla_rule_id column doesn't exist yet, retry without it
        if (error.message?.includes('sla_rule_id')) {
          delete payload.sla_rule_id;
          const { data: d2, error: e2 } = await supabase.from('workflow_requests').insert([payload]).select();
          if (e2) { alert('❌ Error al crear caso: ' + e2.message); return; }
          if (d2 && d2.length > 0) {
            setRequests([buildReq(d2[0], assignedHours, matchingRule, timeline, newReq, resolvedDomainId), ...requests]);
            setIsNewRequestModalOpen(false);
            setNewReq({ title: '', category: '', priority: 'Media', description: '', impactScore: 5, riskLevel: 'Medio', dependencies: '' });
          }
          return;
        }
        alert('❌ Error al crear caso: ' + error.message);
        return;
      }

      if (data && data.length > 0) {
        setRequests([buildReq(data[0], assignedHours, matchingRule, timeline, newReq, resolvedDomainId), ...requests]);
        setIsNewRequestModalOpen(false);
        setNewReq({ title: '', category: '', priority: 'Media', description: '', impactScore: 5, riskLevel: 'Medio', dependencies: '' });
      }
    } catch (e: any) {
      console.error(e);
      alert('❌ Error inesperado: ' + e?.message);
    }
  };

  // Helper to map a DB row to WorkflowReq
  const buildReq = (row: any, assignedHours: number, matchingRule: SlaRule | undefined, timeline: any[], form: any, resolvedDomainId?: string | null): WorkflowReq => ({
    id: row.id,
    title: row.title,
    requester: 'Usuario Operaciones',
    type: 'Solicitud',
    category: row.category || 'General',
    status: 'Nuevo',
    priority: row.priority,
    date: new Date().toISOString().split('T')[0],
    sla: row.sla,
    slaStatus: 'Ok',
    description: row.description,
    assignee: '',
    expirationDate: new Date(Date.now() + assignedHours * 3600 * 1000).toLocaleString('es-CO'),
    currentStep: 'Validación Inicial',
    timeline,
    impactScore: form.impactScore,
    riskLevel: form.riskLevel,
    dependencies: form.dependencies,
    slaRuleId: matchingRule?.id,
    domainId: resolvedDomainId || undefined
  });

  // 7. Config SLA Rule
  const handleCreateSlaRule = async () => {
    if (!newSlaRule.name || !newSlaRule.hours || !currentTenant?.id) return;
    try {
      // Build payload — include optional columns only if they exist
      const payload: any = {
        tenant_id: currentTenant.id,
        name: newSlaRule.name,
        priority: newSlaRule.priority || 'Cualquiera',
        domain: newSlaRule.domain || 'General',
        hours: Number(newSlaRule.hours)
      };

      // Try to include extended columns (may not exist in older DB schemas)
      if (newSlaRule.alertThreshold !== undefined) payload.alert_threshold = newSlaRule.alertThreshold;
      if (newSlaRule.workingHoursOnly !== undefined) payload.working_hours_only = newSlaRule.workingHoursOnly;

      const { data, error } = await supabase.from('sla_rules').insert([payload]).select();

      if (error) {
        console.error('Error creando regla SLA:', error);
        // If it's the missing column issue, try without those columns
        if (error.message?.includes('alert_threshold') || error.message?.includes('working_hours_only')) {
          const { data: data2, error: error2 } = await supabase.from('sla_rules').insert([{
            tenant_id: currentTenant.id,
            name: newSlaRule.name,
            priority: newSlaRule.priority || 'Cualquiera',
            domain: newSlaRule.domain || 'General',
            hours: Number(newSlaRule.hours)
          }]).select();
          if (error2) {
            alert('❌ Error al guardar el SLA: ' + error2.message);
            return;
          }
          if (data2 && data2.length > 0) {
            setSlaRules([...slaRules, {
              id: data2[0].id,
              name: data2[0].name,
              priority: data2[0].priority || 'Cualquiera',
              domain: data2[0].domain || 'General',
              hours: data2[0].hours,
              alertThreshold: newSlaRule.alertThreshold || 75,
              workingHoursOnly: newSlaRule.workingHoursOnly !== false
            }]);
            setNewSlaRule({ name: '', priority: 'Cualquiera', domain: 'General', hours: 48, alertThreshold: 75, workingHoursOnly: true });
            alert('✅ Regla de SLA registrada.\n\n⚠ Nota: Para guardar el umbral de alerta y horas hábiles, ejecuta el SQL de migración en Supabase (ver consola).');
            console.warn('MIGRACIÓN PENDIENTE - Ejecuta en Supabase SQL Editor:\nALTER TABLE public.sla_rules\n  ADD COLUMN IF NOT EXISTS alert_threshold INTEGER DEFAULT 75,\n  ADD COLUMN IF NOT EXISTS working_hours_only BOOLEAN DEFAULT true;');
          }
        } else {
          alert('❌ Error al guardar el SLA: ' + error.message);
        }
        return;
      }

      if (data && data.length > 0) {
        setSlaRules([...slaRules, {
          id: data[0].id,
          name: data[0].name,
          priority: data[0].priority || 'Cualquiera',
          domain: data[0].domain || 'General',
          hours: data[0].hours,
          alertThreshold: data[0].alert_threshold || newSlaRule.alertThreshold || 75,
          workingHoursOnly: data[0].working_hours_only !== undefined ? data[0].working_hours_only : (newSlaRule.workingHoursOnly !== false)
        }]);
        setNewSlaRule({ name: '', priority: 'Cualquiera', domain: 'General', hours: 48, alertThreshold: 75, workingHoursOnly: true });
        alert('✅ Regla de SLA registrada exitosamente en las políticas.');
      }
    } catch (e: any) {
      console.error('Error inesperado creando SLA:', e);
      alert('❌ Error inesperado: ' + (e?.message || String(e)));
    }
  };

  // 8. Dynamic Recommendations Engine (RF-12)
  const getOperationalRecommendations = () => {
    const list = [];
    const overdue = requests.filter(r => r.slaStatus === 'Overdue');
    if (overdue.length > 0) {
      list.push({
        type: 'critical',
        text: `Reasignar ${overdue.length} solicitudes vencidas reducirá el riesgo de bloqueo operativo en un 18%.`,
        action: 'Reasignación sugerida a Stewards disponibles.'
      });
    }
    const highRisk = requests.filter(r => r.priority === 'Crítica' && !r.assignee);
    if (highRisk.length > 0) {
      list.push({
        type: 'warning',
        text: `Hay ${highRisk.length} solicitudes de prioridad CRÍTICA sin responsable asignado.`,
        action: 'Auto-asignar automáticamente a líderes de dominio.'
      });
    }
    const qualityTasks = requests.filter(r => r.category === 'Calidad' && r.status === 'Nuevo');
    if (qualityTasks.length > 3) {
      list.push({
        type: 'info',
        text: 'Detectada sobrecarga en el pilar de Calidad. Configurar automatización inicial para validaciones técnicas.',
        action: 'Activar orquestador sin código.'
      });
    }
    return list;
  };

  // 9. AI Copilot Simulation (RF-14)
  const handleSendAiQuery = (customText?: string) => {
    const query = customText || aiQuery;
    if (!query.trim()) return;

    const userMsg = { sender: 'user' as const, text: query };
    setAiChat(prev => [...prev, userMsg]);
    setAiQuery('');

    // Simulate analysis response
    let responseText = '';
    let actionData: any[] = [];
    const clean = query.toLowerCase();

    if (clean.includes('casos') || clean.includes('critico') || clean.includes('vencido')) {
      const criticals = requests.filter(r => r.slaStatus === 'Overdue' || r.priority === 'Crítica');
      if (criticals.length > 0) {
        responseText = `He encontrado ${criticals.length} solicitudes que requieren atención crítica inmediata. Aquí está el listado priorizado:`;
        actionData = criticals;
      } else {
        responseText = 'No hay casos críticos con SLA vencido o prioridad crítica registrados para este Tenant.';
      }
    } else if (clean.includes('riesgo') || clean.includes('dominio')) {
      // Analyze domain risks
      const stats: Record<string, { total: number, critical: number }> = {};
      requests.forEach(r => {
        if (!stats[r.category]) stats[r.category] = { total: 0, critical: 0 };
        stats[r.category].total++;
        if (r.slaStatus === 'Overdue' || r.priority === 'Crítica') stats[r.category].critical++;
      });
      responseText = 'Análisis de riesgo por dominio de datos: El dominio "Seguridad" y "Financiero" concentran el 70% de la carga de criticidad por SLA. Sugiero delegar balanceadores a Data Stewards.';
    } else {
      responseText = 'Aquí tienes el resumen operativo de las últimas 24 horas: 12 solicitudes resueltas satisfactoriamente, 2 SLAs alertados, y un nivel de automatización global del 64% en la ingesta de metadatos.';
    }

    setTimeout(() => {
      setAiChat(prev => [...prev, { sender: 'bot', text: responseText, actionData }]);
    }, 600);
  };

  // 10. Mock Reports Export (RF-15)
  const handleExportReport = (format: 'pdf' | 'excel' | 'csv') => {
    // Standard mock file downloader
    const fileContent = `ID,Titulo,Dominio,Prioridad,Estado,SLA,Responsable\n` + 
      requests.map(r => `${r.id},"${r.title}",${r.category},${r.priority},${r.status},${r.sla},"${r.assignee}"`).join('\n');
    const blob = new Blob([fileContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `GovData_Operaciones_Report.${format}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter requests — use domainId (UUID) when available, fallback to category name
  const filteredRequests = requests.filter(req => {
    if (activeDomain) {
      const activeDomainObj = domains.find((d: any) => d.name === activeDomain);
      const matchById = activeDomainObj && req.domainId === activeDomainObj.id;
      const matchByName = req.category === activeDomain;
      if (!matchById && !matchByName) return false;
    }
    if (activeTab === 'pendientes') {
      if (!['Nuevo', 'En revisión', 'Pendiente de información', 'En ejecución', 'Bloqueado', 'Escalado'].includes(req.status)) return false;
    } else if (activeTab === 'mis') {
      if (req.requester !== 'Usuario Operaciones') return false;
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return req.id.toLowerCase().includes(term) || req.title.toLowerCase().includes(term) || req.assignee?.toLowerCase().includes(term);
    }

    if (filterPriority !== 'Todos' && req.priority !== filterPriority) return false;
    if (filterSlaStatus !== 'Todos' && req.slaStatus !== filterSlaStatus) return false;
    if (filterRisk !== 'Todos' && req.riskLevel !== filterRisk) return false;
    if (filterAssignee !== 'Todos') {
      if (filterAssignee === '' && req.assignee !== '') return false;
      if (filterAssignee !== '' && req.assignee !== filterAssignee) return false;
    }

    return true;
  });

  // Calculate stats for RF-01
  const totalWfs = requests.length;
  const pendingWfs = requests.filter(r => ['Nuevo', 'En revisión', 'Pendiente de información', 'En ejecución', 'Bloqueado', 'Escalado'].includes(r.status)).length;
  const criticalWfs = requests.filter(r => r.priority === 'Crítica' || r.slaStatus === 'Overdue').length;
  const slaComp = totalWfs > 0 ? Math.round((requests.filter(r => r.slaStatus !== 'Overdue').length / totalWfs) * 100) : 98;
  const avgResolutionTime = '2.4 Días';
  const automationRate = '64%';

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <div className={styles.titleWithIcon}>
            <div className={styles.iconContainer}>
              <GitMerge size={24} />
            </div>
            <div>
              <h1>Centro de Operaciones de Gobierno</h1>
              <p>Monitoreo de SLAs, flujos de trabajo, automatización y mitigación de riesgos de datos.</p>
            </div>
          </div>
        </div>

        <div className={styles.headerActions}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className={styles.secondaryBtn} onClick={() => handleExportReport('excel')}><Download size={16} /> Exportar Excel</button>
            <button className={styles.primaryBtn} onClick={() => setIsNewRequestModalOpen(true)}><Zap size={16} /> Nueva Solicitud</button>
          </div>
        </div>
      </header>

      {/* Main navigation tabs */}
      <div className={styles.navBar}>
        <button className={`${styles.navTab} ${activeView === 'dashboard' ? styles.activeNavTab : ''}`} onClick={() => setActiveView('dashboard')}><Activity size={16} /> Vista Ejecutiva</button>
        <button className={`${styles.navTab} ${activeView === 'inbox' ? styles.activeNavTab : ''}`} onClick={() => setActiveView('inbox')}><Sliders size={16} /> Bandeja Inteligente</button>
        <button className={`${styles.navTab} ${activeView === 'workflow-designer' ? styles.activeNavTab : ''}`} onClick={() => setActiveView('workflow-designer')}><GitBranch size={16} /> Diseñador No-Code</button>
        <button className={`${styles.navTab} ${activeView === 'sla-config' ? styles.activeNavTab : ''}`} onClick={() => setActiveView('sla-config')}><Clock size={16} /> Gestión de SLAs</button>
        <button className={`${styles.navTab} ${activeView === 'audit' ? styles.activeNavTab : ''}`} onClick={() => setActiveView('audit')}><History size={16} /> Trazabilidad de Auditoría</button>
        <button className={`${styles.navTab} ${activeView === 'ai-copilot' ? styles.activeNavTab : ''}`} onClick={() => setActiveView('ai-copilot')}><Cpu size={16} /> Copiloto de IA</button>
      </div>

      <div style={{ marginTop: '24px' }}>
        {/* VIEW 1: EXECUTIVE DASHBOARD */}
        {activeView === 'dashboard' && (
          <div className={styles.dashboardGrid}>
            <div className={styles.metricGrid}>
              <div className={styles.metricCard}>
                <div className={styles.metricHeader}>
                  <span>Cumplimiento Global de SLA</span>
                  <Award size={20} color="#10b981" />
                </div>
                <h2 style={{ color: '#10b981' }}>{slaComp}%</h2>
                <p>Meta Corporativa: &gt;95%</p>
              </div>

              <div className={styles.metricCard}>
                <div className={styles.metricHeader}>
                  <span>Solicitudes Activas</span>
                  <Clock size={20} color="#3b82f6" />
                </div>
                <h2>{pendingWfs}</h2>
                <p>En cola de resolución</p>
              </div>

              <div className={styles.metricCard}>
                <div className={styles.metricHeader}>
                  <span>Casos Críticos</span>
                  <AlertTriangle size={20} color="#ef4444" />
                </div>
                <h2 style={{ color: '#ef4444' }}>{criticalWfs}</h2>
                <p>Con SLA vencido o riesgo extremo</p>
              </div>

              <div className={styles.metricCard}>
                <div className={styles.metricHeader}>
                  <span>Nivel de Automatización</span>
                  <Cpu size={20} color="#8b5cf6" />
                </div>
                <h2>{automationRate}</h2>
                <p>Ingestas y reglas autogestionadas</p>
              </div>
            </div>

            {/* Recommendations & predictions block */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginTop: '24px' }}>
              <div className={styles.sectionCard}>
                <h3 className={styles.sectionTitle}><Activity size={18} /> Dominios Críticos y Mapa de Calor Operativo</h3>
                
                {/* Heatmap using REAL tenant domains */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px', marginTop: '16px' }}>
                  {(domains.length > 0 ? domains : [
                    { id: '1', name: 'General' }, { id: '2', name: 'Seguridad' }, { id: '3', name: 'Calidad' }
                  ]).map(dom => {
                    const domainTasks = requests.filter(r => r.category === dom.name);
                    const overdueCount = domainTasks.filter(r => r.slaStatus === 'Overdue').length;
                    const criticalCount = domainTasks.filter(r => r.priority === 'Crítica').length;
                    const val = domainTasks.length;
                    const color = overdueCount > 0 ? 'rgba(239, 68, 68, 0.13)' : criticalCount > 0 ? 'rgba(245, 158, 11, 0.13)' : val > 3 ? 'rgba(99, 102, 241, 0.1)' : 'rgba(16, 185, 129, 0.1)';
                    const border = overdueCount > 0 ? '#ef4444' : criticalCount > 0 ? '#f59e0b' : val > 3 ? '#6366f1' : '#10b981';
                    const statusLabel = overdueCount > 0 ? `${overdueCount} Vencidos` : criticalCount > 0 ? `${criticalCount} Críticos` : 'Estable';
                    return (
                      <div key={dom.id} style={{ padding: '20px', borderRadius: '16px', background: color, border: `1.5px solid ${border}`, textAlign: 'center', transition: 'transform 0.15s', cursor: 'default' }}
                        onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.03)')}
                        onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                      >
                        <strong style={{ display: 'block', fontSize: '1rem', color: '#1e293b' }}>{dom.name}</strong>
                        <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'block', marginTop: '8px' }}>{val} actividades</span>
                        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: border, display: 'block', marginTop: '4px' }}>{statusLabel}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Recommendations and AI insight panel */}
              <div className={styles.sectionCard} style={{ background: '#f8fafc' }}>
                <h3 className={styles.sectionTitle}><Cpu size={18} color="#8b5cf6" /> Recomendaciones IA</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
                  {getOperationalRecommendations().map((rec, i) => (
                    <div key={i} style={{ padding: '16px', borderRadius: '12px', background: 'white', border: '1px solid #e2e8f0' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: rec.type === 'critical' ? '#ef4444' : '#f59e0b' }}>
                        {rec.type === 'critical' ? 'Incumplimiento Crítico' : 'Sugerencia de Carga'}
                      </span>
                      <p style={{ margin: '6px 0', fontSize: '0.85rem', color: '#334155', fontWeight: 600 }}>{rec.text}</p>
                      <strong style={{ fontSize: '0.8rem', color: '#6366f1' }}>{rec.action}</strong>
                    </div>
                  ))}
                  {getOperationalRecommendations().length === 0 && (
                    <p style={{ fontSize: '0.85rem', color: '#64748b', textAlign: 'center' }}>No se han detectado alertas de sobrecarga o riesgos en los SLAs.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: SMART WORKLIST */}
        {activeView === 'inbox' && (
          <div className={styles.mainContent}>
            <div className={styles.sidebar}>
              <div className={styles.sidebarSection}>
                <h4 className={styles.sidebarTitle}>Filtros de Bandeja</h4>
                <button className={`${styles.sideTab} ${activeTab === 'pendientes' && !activeDomain ? styles.activeSideTab : ''}`} onClick={() => { setActiveTab('pendientes'); setActiveDomain(null); }}>
                  <Clock size={16} /> Pendientes Activos
                </button>
                <button className={`${styles.sideTab} ${activeTab === 'mis' ? styles.activeSideTab : ''}`} onClick={() => { setActiveTab('mis'); setActiveDomain(null); }}>
                  <User size={16} /> Mis Solicitudes
                </button>
                <button className={`${styles.sideTab} ${activeTab === 'todos' ? styles.activeSideTab : ''}`} onClick={() => { setActiveTab('todos'); setActiveDomain(null); }}>
                  <Layers size={16} /> Todo el Historial
                </button>
              </div>

              <div className={styles.sidebarSection}>
                <h4 className={styles.sidebarTitle}>Dominios</h4>
                {domains.map(domain => (
                  <button 
                    key={domain.id}
                    className={`${styles.sideTab} ${activeDomain === domain.name ? styles.activeSideTab : ''}`} 
                    onClick={() => { setActiveDomain(domain.name); setActiveTab(''); }}
                  >
                    <Layers size={16} /> {domain.name}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.registryArea}>
              <div className={styles.registryHeader}>
                <div className={styles.searchBar}>
                  <Search size={18} />
                  <input 
                    type="text" 
                    placeholder="Búsqueda global por ID, título o responsable..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <button 
                  className={`${styles.filterBtn} ${isAdvancedFilterOpen ? styles.activeFilterBtn : ''}`}
                  onClick={() => setIsAdvancedFilterOpen(!isAdvancedFilterOpen)}
                >
                  <Filter size={16} /> Filtros Avanzados
                </button>
              </div>

              {isAdvancedFilterOpen && (
                <div style={{ display: 'flex', gap: '16px', background: '#f8fafc', padding: '16px', borderBottom: '1px solid #e2e8f0', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: '140px' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '6px' }}>Prioridad</label>
                    <select style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #cbd5e1' }} value={filterPriority} onChange={e => setFilterPriority(e.target.value)}>
                      <option>Todos</option>
                      <option>Baja</option>
                      <option>Media</option>
                      <option>Alta</option>
                      <option>Crítica</option>
                    </select>
                  </div>
                  <div style={{ flex: 1, minWidth: '140px' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '6px' }}>Estado SLA</label>
                    <select style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #cbd5e1' }} value={filterSlaStatus} onChange={e => setFilterSlaStatus(e.target.value)}>
                      <option>Todos</option>
                      <option>Ok</option>
                      <option>Warning</option>
                      <option>Overdue</option>
                    </select>
                  </div>
                  <div style={{ flex: 1, minWidth: '140px' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '6px' }}>Nivel de Riesgo</label>
                    <select style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #cbd5e1' }} value={filterRisk} onChange={e => setFilterRisk(e.target.value)}>
                      <option>Todos</option>
                      <option>Bajo</option>
                      <option>Medio</option>
                      <option>Alto</option>
                      <option>Crítico</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Worklist Table */}
              <div className={styles.tableContainer}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Detalle de Actividad</th>
                      <th>Dominio</th>
                      <th>SLA / Vencimiento</th>
                      <th>Prioridad e Impacto</th>
                      <th>Riesgo</th>
                      <th>Score Prioridad</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRequests.map(req => {
                      const score = getPriorityScore(req);
                      return (
                        <tr key={req.id} className={styles.tableRow} onClick={() => { setSelectedReq(req); setDetailTab('general'); }}>
                          <td>
                            <strong style={{ color: '#1e293b', display: 'block' }}>
                              {req.title.replace(/^\[.*?\]\s*/, '')}
                            </strong>
                            {/^\[.*?\]/.test(req.title) && (
                              <span style={{
                                display: 'inline-block',
                                marginTop: '3px',
                                fontSize: '0.68rem',
                                fontWeight: 700,
                                padding: '1px 7px',
                                borderRadius: '4px',
                                background: req.type === 'Incidente Operativo' ? '#fef2f2' : '#f0f9ff',
                                color: req.type === 'Incidente Operativo' ? '#dc2626' : '#0369a1',
                                letterSpacing: '0.02em',
                                textTransform: 'uppercase'
                              }}>
                                {req.title.match(/^\[(.*?)\]/)?.[1] || req.type}
                              </span>
                            )}
                            <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginTop: '2px' }}>ID: {req.id.slice(0,8)} • {req.requester}</span>
                          </td>
                          <td>
                            <span className={styles.statusBadge} style={{ background: '#f0f9ff', color: '#0369a1' }}>{req.category}</span>
                          </td>
                          <td>
                            <span style={{ 
                              color: req.slaStatus === 'Overdue' ? '#ef4444' : req.slaStatus === 'Warning' ? '#f59e0b' : '#10b981', 
                              fontWeight: 700 
                            }}>
                              {req.sla}
                            </span>
                            <span style={{ display: 'block', fontSize: '0.7rem', color: '#94a3b8' }}>{req.expirationDate}</span>
                          </td>
                          <td>
                            <span style={{ fontWeight: 700, color: req.priority === 'Crítica' ? '#ef4444' : '#475569' }}>{req.priority}</span>
                            <span style={{ display: 'block', fontSize: '0.7rem', color: '#64748b' }}>Impacto: {req.impactScore}/10</span>
                          </td>
                          <td>
                            <span style={{ 
                              padding: '2px 8px', 
                              borderRadius: '6px', 
                              fontSize: '0.72rem', 
                              fontWeight: 800,
                              background: req.riskLevel === 'Crítico' ? '#fef2f2' : req.riskLevel === 'Alto' ? '#fff7ed' : '#f0fdf4',
                              color: req.riskLevel === 'Crítico' ? '#ef4444' : req.riskLevel === 'Alto' ? '#d97706' : '#166534'
                            }}>
                              {req.riskLevel || 'Medio'}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <strong style={{ fontSize: '1.1rem', color: '#6366f1' }}>{score}</strong>
                              <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>/ 100</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {filteredRequests.length === 0 && (
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>No hay solicitudes de gobierno en esta bandeja.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 3: NO-CODE WORKFLOW DESIGNER */}
        {activeView === 'workflow-designer' && (
          <div className={styles.sectionCard}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '16px' }}>
              <div>
                <h2 style={{ margin: 0 }}>Modelador de Procesos sin Código</h2>
                <p style={{ margin: '4px 0 0 0', color: '#64748b' }}>Configura reglas de transición, aprobadores y flujos operativos.</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ background: '#f5f3ff', color: '#8b5cf6', fontSize: '0.8rem', fontWeight: 800, padding: '4px 12px', borderRadius: '24px' }}>
                  Versión {designerProcess.version} Activa
                </span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginTop: '24px' }}>
              <div>
                <h4 style={{ marginBottom: '8px' }}>Pasos del Flujo Activo</h4>
                <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ background: '#f1f5f9', padding: '2px 8px', borderRadius: '6px', fontWeight: 600 }}>⠿ Arrastra</span> los pasos para reordenarlos
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {designerProcess.steps.map((step, idx) => (
                    <div 
                      key={step.id}
                      draggable
                      onDragStart={() => handleDragStart(idx)}
                      onDragOver={e => handleDragOver(e, idx)}
                      onDrop={() => handleDrop(idx)}
                      onDragEnd={handleDragEnd}
                      style={{ 
                        display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', 
                        background: dragOverIndex === idx && dragIndex !== idx ? '#eef2ff' : '#f8fafc', 
                        border: `1.5px solid ${dragOverIndex === idx && dragIndex !== idx ? '#6366f1' : '#e2e8f0'}`, 
                        borderRadius: '16px', cursor: 'grab',
                        opacity: dragIndex === idx ? 0.5 : 1,
                        transition: 'all 0.15s',
                        transform: dragOverIndex === idx && dragIndex !== idx ? 'scale(1.01)' : 'none'
                      }}
                    >
                      {/* Drag handle */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', cursor: 'grab', opacity: 0.4 }}>
                        {[0,1,2].map(i => <div key={i} style={{ width: '16px', height: '2px', background: '#64748b', borderRadius: '2px' }} />)}
                      </div>
                      <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#6366f1', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0 }}>
                        {idx + 1}
                      </div>
                      <div style={{ flex: 1 }}>
                        <strong style={{ display: 'block', color: '#1e293b' }}>{step.name}</strong>
                        <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Aprobador: {step.approver} • SLA: {step.duration}</span>
                      </div>
                      <span style={{ fontSize: '0.72rem', background: step.type === 'auto' ? '#f0fdf4' : '#eff6ff', color: step.type === 'auto' ? '#10b981' : '#3b82f6', padding: '3px 10px', borderRadius: '20px', fontWeight: 800, textTransform: 'uppercase', flexShrink: 0 }}>
                        {step.type}
                      </span>
                      <button 
                        onClick={() => setDesignerProcess({ ...designerProcess, steps: designerProcess.steps.filter((_, i) => i !== idx) })}
                        style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '4px 8px', cursor: 'pointer', color: '#ef4444', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0 }}
                      >✕</button>
                    </div>
                  ))}
                  {designerProcess.steps.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '32px', border: '2px dashed #e2e8f0', borderRadius: '16px', color: '#94a3b8' }}>Añade etapas desde el formulario →</div>
                  )}
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
                <h4>Añadir Nueva Etapa de Validación</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px' }}>Nombre de Etapa</label>
                    <input 
                      type="text" 
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} 
                      placeholder="Ej: Aprobación del Comité Operativo"
                      value={newDesignerStep.name}
                      onChange={e => setNewDesignerStep({ ...newDesignerStep, name: e.target.value })}
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px' }}>Aprobador</label>
                      <input 
                        type="text" 
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} 
                        placeholder="Ej: Steward / CDO"
                        value={newDesignerStep.approver}
                        onChange={e => setNewDesignerStep({ ...newDesignerStep, approver: e.target.value })}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px' }}>SLA Asignado</label>
                      <input 
                        type="text" 
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} 
                        placeholder="Ej: 24h"
                        value={newDesignerStep.duration}
                        onChange={e => setNewDesignerStep({ ...newDesignerStep, duration: e.target.value })}
                      />
                    </div>
                  </div>
                  <button 
                    className={styles.primaryBtn} 
                    style={{ marginTop: '8px' }}
                    onClick={() => {
                      if (!newDesignerStep.name) return;
                      setDesignerProcess({
                        ...designerProcess,
                        steps: [...designerProcess.steps, { id: Date.now().toString(), ...newDesignerStep, type: 'manual' }]
                      });
                      setNewDesignerStep({ name: '', type: 'manual', approver: '', duration: '24h' });
                    }}
                  >
                    Guardar Nueva Etapa
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 4: SLA MANAGEMENT */}
        {activeView === 'sla-config' && (
          <div className={styles.sectionCard}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
              {/* Left: existing SLA rules */}
              <div>
                <h2 style={{ margin: '0 0 4px' }}>Acuerdos de Nivel de Servicio (SLA)</h2>
                <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '0 0 20px' }}>Reglas activas de resolución de solicitudes por dominio y prioridad.</p>

                {slaRules.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '32px', border: '2px dashed #e2e8f0', borderRadius: '16px', color: '#94a3b8' }}>No hay reglas SLA configuradas. Crea la primera →</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {slaRules.map(rule => (
                      <div key={rule.id} style={{ padding: '16px', background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ flex: 1 }}>
                          <strong style={{ display: 'block', color: '#1e293b', fontSize: '0.95rem' }}>{rule.name}</strong>
                          <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Dominio: {rule.domain} • Prioridad: {rule.priority}</span>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ display: 'block', fontWeight: 800, color: '#6366f1', fontSize: '1.1rem' }}>{rule.hours}h</span>
                          <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Umbral: {rule.alertThreshold}%</span>
                        </div>
                        <span style={{ 
                          padding: '4px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 800,
                          background: rule.workingHoursOnly ? '#eff6ff' : '#f0fdf4',
                          color: rule.workingHoursOnly ? '#3b82f6' : '#10b981'
                        }}>{rule.workingHoursOnly ? 'Horas Hábiles' : '24/7'}</span>
                        <button
                          onClick={async () => {
                            if (!confirm('¿Eliminar esta regla SLA?')) return;
                            await supabase.from('sla_rules').delete().eq('id', rule.id);
                            setSlaRules(slaRules.filter(r => r.id !== rule.id));
                          }}
                          style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '4px 10px', cursor: 'pointer', color: '#ef4444', fontSize: '0.78rem', fontWeight: 700 }}
                        >✕</button>
                      </div>
                    ))}
                  </div>
                )}

                <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ padding: '14px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <strong style={{ display: 'block', marginBottom: '4px' }}>Escalamiento Automático</strong>
                    <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b' }}>Si una solicitud supera el 90% de su SLA, se transfiere al superior de dominio y notifica por Teams.</p>
                    <span style={{ fontSize: '0.75rem', color: '#6366f1', fontWeight: 800 }}>ESTADO: ACTIVADO</span>
                  </div>
                  <div style={{ padding: '14px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <strong style={{ display: 'block', marginBottom: '4px' }}>Horas Hábiles</strong>
                    <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b' }}>Lunes a Viernes, 08:00 - 18:00 (GMT-5). Festivos locales cargados automáticamente.</p>
                  </div>
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: '0 0 16px', color: '#1e293b' }}>Configurar Nueva Regla de SLA</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px' }}>Nombre de la Regla *</label>
                    <input 
                      type="text" 
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }} 
                      value={newSlaRule.name}
                      onChange={e => setNewSlaRule({ ...newSlaRule, name: e.target.value })}
                      placeholder="Ej: Resolución Crítica de Calidad"
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px' }}>Prioridad Aplicable</label>
                      <select 
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                        value={newSlaRule.priority}
                        onChange={e => setNewSlaRule({ ...newSlaRule, priority: e.target.value })}
                      >
                        <option value="Cualquiera">Cualquiera</option>
                        <option value="Baja">Baja</option>
                        <option value="Media">Media</option>
                        <option value="Alta">Alta</option>
                        <option value="Crítica">Crítica</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px' }}>Dominio Aplicable</label>
                      <select 
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                        value={newSlaRule.domain}
                        onChange={e => setNewSlaRule({ ...newSlaRule, domain: e.target.value })}
                      >
                        <option value="General">General (Todos)</option>
                        {domains.length > 0 ? (
                          domains.map(d => <option key={d.id} value={d.name}>{d.name}</option>)
                        ) : (
                          ['Seguridad', 'Financiero', 'Calidad', 'Operaciones', 'Cumplimiento', 'Tecnología'].map(d => (
                            <option key={d} value={d}>{d}</option>
                          ))
                        )}
                      </select>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px' }}>Horas Límite de Resolución *</label>
                      <input 
                        type="number" 
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }} 
                        value={newSlaRule.hours}
                        onChange={e => setNewSlaRule({ ...newSlaRule, hours: Number(e.target.value) })}
                        placeholder="48"
                        min={1}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px' }}>Umbral de Alerta Preventiva</label>
                      <select 
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                        value={newSlaRule.alertThreshold}
                        onChange={e => setNewSlaRule({ ...newSlaRule, alertThreshold: Number(e.target.value) })}
                      >
                        <option value={50}>50% del tiempo transcurrido</option>
                        <option value={75}>75% del tiempo transcurrido</option>
                        <option value={90}>90% del tiempo transcurrido</option>
                      </select>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', background: '#eff6ff', borderRadius: '10px', border: '1px solid #bfdbfe' }}>
                    <input 
                      type="checkbox" 
                      id="sla-working-hours" 
                      checked={newSlaRule.workingHoursOnly !== false}
                      onChange={e => setNewSlaRule({ ...newSlaRule, workingHoursOnly: e.target.checked })}
                      style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                    />
                    <label htmlFor="sla-working-hours" style={{ fontSize: '0.88rem', fontWeight: 600, color: '#1e40af', cursor: 'pointer' }}>
                      Contar solo horas hábiles (Lun–Vie 08:00–18:00)
                    </label>
                  </div>
                  <button 
                    className={styles.primaryBtn} 
                    onClick={handleCreateSlaRule} 
                    style={{ marginTop: '4px' }}
                    disabled={!newSlaRule.name || !newSlaRule.hours}
                  >
                    ✚ Registrar Regla de SLA
                  </button>
                  {!newSlaRule.name && <p style={{ margin: 0, fontSize: '0.78rem', color: '#f59e0b' }}>⚠ El nombre es obligatorio para guardar.</p>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 5: SECURITY AUDIT TRAIL */}
        {activeView === 'audit' && (
          <div className={styles.sectionCard}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h2>Log de Auditoría Inmutable</h2>
                <p>Cumple con los estándares ISO 27001, COBIT e ISO 8000. La información no puede ser modificada.</p>
              </div>
              <button className={styles.secondaryBtn} onClick={() => handleExportReport('csv')}><Download size={16} /> Exportar Log (.CSV)</button>
            </div>

            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Fecha / Hora</th>
                    <th>Acción / Evento</th>
                    <th>Responsable</th>
                    <th>Dirección IP</th>
                    <th>Justificación</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map(log => (
                    <tr key={log.id}>
                      <td style={{ fontSize: '0.8rem', color: '#64748b' }}>{log.date}</td>
                      <td>
                        <strong style={{ color: '#6366f1' }}>{log.action}</strong>
                      </td>
                      <td>{log.user}</td>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{log.ip}</td>
                      <td style={{ fontSize: '0.8rem', color: '#475569' }}>{log.justification}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* VIEW 6: AI COPILOT */}
        {activeView === 'ai-copilot' && (
          <div className={styles.sectionCard} style={{ display: 'flex', flexDirection: 'column', height: '520px', padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '20px 32px', background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', color: 'white', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Cpu size={24} />
              <div>
                <strong style={{ display: 'block', fontSize: '1.1rem' }}>Nexus Operations Copilot</strong>
                <span style={{ fontSize: '0.78rem', opacity: 0.9 }}>Asistente en Lenguaje Natural para Gobernabilidad y Operaciones</span>
              </div>
            </div>

            <div style={{ flex: 1, padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', flexGrow: 1 }}>
              {aiChat.map((msg, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start' }}>
                  <div style={{ 
                    maxWidth: '80%', 
                    padding: '12px 18px', 
                    borderRadius: '16px', 
                    background: msg.sender === 'user' ? '#6366f1' : '#f1f5f9',
                    color: msg.sender === 'user' ? 'white' : '#1e293b',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                  }}>
                    <span style={{ display: 'block', fontSize: '0.88rem', lineHeight: 1.4 }}>{msg.text}</span>
                    {msg.actionData && msg.actionData.length > 0 && (
                      <div style={{ marginTop: '12px', background: 'white', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        <table style={{ width: '100%', fontSize: '0.8rem', textAlign: 'left', borderCollapse: 'collapse' }}>
                          <thead>
                            <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b' }}>
                              <th style={{ paddingBottom: '6px' }}>Título</th>
                              <th style={{ paddingBottom: '6px' }}>Estado</th>
                              <th style={{ paddingBottom: '6px' }}>SLA</th>
                            </tr>
                          </thead>
                          <tbody>
                            {msg.actionData.map((req, i) => (
                              <tr key={i} style={{ borderBottom: '1px solid #f8fafc' }}>
                                <td style={{ padding: '6px 0', fontWeight: 600, color: '#1e293b' }}>{req.title}</td>
                                <td>{req.status}</td>
                                <td style={{ color: '#ef4444', fontWeight: 700 }}>{req.sla}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ padding: '20px 32px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button className={styles.secondaryBtn} style={{ fontSize: '0.75rem', padding: '4px 10px' }} onClick={() => handleSendAiQuery('¿Cuáles son los casos críticos de hoy?')}>Casos Críticos</button>
                <button className={styles.secondaryBtn} style={{ fontSize: '0.75rem', padding: '4px 10px' }} onClick={() => handleSendAiQuery('¿Qué dominio tiene mayor riesgo operativo?')}>Riesgos por Dominio</button>
                <button className={styles.secondaryBtn} style={{ fontSize: '0.75rem', padding: '4px 10px' }} onClick={() => handleSendAiQuery('Resume las novedades del día')}>Novedades Operativas</button>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <input 
                  type="text" 
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #cbd5e1' }} 
                  placeholder="Pregúntale a Nexus AI sobre SLAs, incidentes o carga operativa..."
                  value={aiQuery}
                  onChange={e => setAiQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSendAiQuery()}
                />
                <button className={styles.primaryBtn} onClick={() => handleSendAiQuery()} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Send size={18} /></button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Detail Drawer (Modal) RF-03 */}
      <AnimatePresence>
        {selectedReq && (
          <div className={styles.modalOverlay} onClick={() => { setSelectedReq(null); setDetailTab('general'); }}>
            <motion.div 
              className={styles.modalContent}
              style={{ maxWidth: '650px', padding: 0 }}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              onClick={e => e.stopPropagation()}
            >
              <div style={{ padding: '24px 32px', background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', opacity: 0.85 }}>
                      {selectedReq.category} • {selectedReq.id.slice(0, 8)}
                    </span>
                    {/^\[.*?\]/.test(selectedReq.title) && (
                      <span style={{
                        fontSize: '0.65rem',
                        fontWeight: 800,
                        padding: '2px 8px',
                        borderRadius: '4px',
                        background: selectedReq.type === 'Incidente Operativo' ? 'rgba(239,68,68,0.25)' : 'rgba(255,255,255,0.2)',
                        color: 'white',
                        letterSpacing: '0.04em',
                        textTransform: 'uppercase',
                        border: '1px solid rgba(255,255,255,0.3)'
                      }}>
                        {selectedReq.title.match(/^\[(.*?)\]/)?.[1] || selectedReq.type}
                      </span>
                    )}
                  </div>
                  <h3 style={{ margin: 0, color: 'white', fontSize: '1.15rem', fontWeight: 800, lineHeight: 1.3 }}>
                    {selectedReq.title.replace(/^\[.*?\]\s*/, '')}
                  </h3>
                </div>
                <button onClick={() => setSelectedReq(null)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', padding: '8px', borderRadius: '10px', color: 'white', cursor: 'pointer' }}>
                  <X size={20} />
                </button>
              </div>

              {/* Drawer Tabs */}
              <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
                <button style={{ flex: 1, padding: '12px', background: detailTab === 'general' ? 'white' : 'transparent', border: 'none', borderBottom: detailTab === 'general' ? '2px solid #4f46e5' : 'none', fontWeight: 700, cursor: 'pointer' }} onClick={() => setDetailTab('general')}>General</button>
                <button style={{ flex: 1, padding: '12px', background: detailTab === 'timeline' ? 'white' : 'transparent', border: 'none', borderBottom: detailTab === 'timeline' ? '2px solid #4f46e5' : 'none', fontWeight: 700, cursor: 'pointer' }} onClick={() => setDetailTab('timeline')}>Línea de Tiempo</button>
                <button style={{ flex: 1, padding: '12px', background: detailTab === 'comments' ? 'white' : 'transparent', border: 'none', borderBottom: detailTab === 'comments' ? '2px solid #4f46e5' : 'none', fontWeight: 700, cursor: 'pointer' }} onClick={() => setDetailTab('comments')}>Comentarios ({comments.length})</button>
              </div>

              <div style={{ padding: '32px', overflowY: 'auto', maxHeight: 'calc(100vh - 180px)' }}>
                {detailTab === 'general' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Descripción / Justificación</label>
                      <p style={{ margin: '8px 0', fontSize: '0.92rem', color: '#1e293b', lineHeight: 1.5 }}>{selectedReq.description || 'Sin descripción adicional provista.'}</p>
                    </div>

                    {/* Responsable + Estado */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                      <div>
                        <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', fontWeight: 700 }}>Responsable</span>
                        <select 
                          style={{ width: '100%', padding: '8px', borderRadius: '8px', marginTop: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }} 
                          value={selectedReq.assignee} 
                          onChange={e => setSelectedReq({ ...selectedReq, assignee: e.target.value })}
                        >
                          <option value="">Sin Asignar</option>
                          {teamMembers.map(m => (
                            <option key={m.id} value={m.name}>{m.name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', fontWeight: 700 }}>Estado Operativo</span>
                        <select 
                          style={{ width: '100%', padding: '8px', borderRadius: '8px', marginTop: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }} 
                          value={selectedReq.status} 
                          onChange={e => setSelectedReq({ ...selectedReq, status: e.target.value as any })}
                        >
                          <option>Nuevo</option>
                          <option>En revisión</option>
                          <option>Pendiente de información</option>
                          <option>En ejecución</option>
                          <option>Bloqueado</option>
                          <option>Escalado</option>
                          <option>Aprobado</option>
                          <option>Rechazado</option>
                          <option>Cerrado</option>
                        </select>
                      </div>
                    </div>

                    {/* Dominio + Prioridad */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div>
                        <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', fontWeight: 700, marginBottom: '6px' }}>Dominio</span>
                        <select 
                          style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }} 
                          value={selectedReq.domainId || selectedReq.category}
                          onChange={e => {
                            const byId = domains.find((d: any) => d.id === e.target.value);
                            const byName = domains.find((d: any) => d.name === e.target.value);
                            const dom = byId || byName;
                            setSelectedReq({
                              ...selectedReq,
                              category: dom ? dom.name : e.target.value,
                              domainId: dom ? dom.id : undefined
                            });
                          }}
                        >
                          {domains.length > 0 ? (
                            domains.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)
                          ) : (
                            ['General', 'Seguridad', 'Financiero', 'Calidad', 'Operaciones', 'Cumplimiento'].map(d => (
                              <option key={d} value={d}>{d}</option>
                            ))
                          )}
                        </select>
                        {selectedReq.domainId && (
                           <span style={{ fontSize: '0.7rem', color: '#22c55e', display: 'block', marginTop: '3px', fontWeight: 700 }}>
                             ✓ Vinculado a dominio real
                           </span>
                        )}
                      </div>

                      <div>
                        <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', fontWeight: 700, marginBottom: '6px' }}>Prioridad</span>
                        <select 
                          style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }} 
                          value={selectedReq.priority} 
                          onChange={e => setSelectedReq({ ...selectedReq, priority: e.target.value as any })}
                        >
                          <option>Baja</option>
                          <option>Media</option>
                          <option>Alta</option>
                          <option>Crítica</option>
                        </select>
                      </div>
                    </div>

                    {/* SLA Rule Selector + Impact Score */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div>
                        <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', fontWeight: 700, marginBottom: '6px' }}>Acuerdo de Nivel de Servicio (SLA)</span>
                        {slaRules.length > 0 ? (
                          <select
                            style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                            value={selectedReq.slaRuleId || ''}
                            onChange={e => {
                              const rule = slaRules.find(r => r.id === e.target.value);
                              setSelectedReq({
                                ...selectedReq,
                                slaRuleId: e.target.value || undefined,
                                sla: rule ? `${rule.hours}h` : selectedReq.sla
                              });
                            }}
                          >
                            <option value="">-- Sin regla asignada --</option>
                            {slaRules.map(rule => (
                              <option key={rule.id} value={rule.id}>
                                {rule.name} ({rule.hours}h • {rule.priority} • {rule.domain})
                              </option>
                            ))}
                          </select>
                        ) : (
                          <div style={{ padding: '8px 12px', borderRadius: '8px', background: '#fef9c3', border: '1px solid #fde68a', fontSize: '0.82rem', color: '#92400e' }}>
                            No hay SLAs configurados.
                            <button onClick={() => setActiveView('sla-config')} style={{ background: 'none', border: 'none', color: '#6366f1', fontWeight: 700, cursor: 'pointer', marginLeft: '4px' }}>Configurar →</button>
                          </div>
                        )}
                        {selectedReq.sla && (
                          <span style={{ display: 'block', marginTop: '4px', fontSize: '0.75rem', color: '#6366f1', fontWeight: 700 }}>
                            ⏱ Tiempo asignado: {selectedReq.sla}
                          </span>
                        )}
                      </div>

                      <div>
                        <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', fontWeight: 700, marginBottom: '6px' }}>Score de Impacto (1-10)</span>
                        <input
                          type="number"
                          min={1} max={10}
                          style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                          value={selectedReq.impactScore || 5}
                          onChange={e => setSelectedReq({ ...selectedReq, impactScore: Math.min(10, Math.max(1, Number(e.target.value))) })}
                        />
                      </div>
                    </div>

                    {/* Risk Level */}
                    <div>
                      <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', fontWeight: 700, marginBottom: '6px' }}>Nivel de Riesgo / Impacto</span>
                      <select 
                        style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }} 
                        value={selectedReq.riskLevel || 'Medio'} 
                        onChange={e => setSelectedReq({ ...selectedReq, riskLevel: e.target.value as any })}
                      >
                        <option>Bajo</option>
                        <option>Medio</option>
                        <option>Alto</option>
                        <option>Crítico</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>Justificación de Transición (Auditoría obligatoria)</label>
                      <textarea 
                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', minHeight: '80px', fontSize: '0.9rem' }} 
                        placeholder="Ingresa la justificación de los cambios realizados para el log inmutable..."
                        value={auditJustification}
                        onChange={e => setAuditJustification(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                {detailTab === 'timeline' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {selectedReq.timeline.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: '16px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Check size={12} color="white" />
                          </div>
                          {idx < selectedReq.timeline.length - 1 && (
                            <div style={{ width: '2px', background: '#cbd5e1', flexGrow: 1, minHeight: '30px' }} />
                          )}
                        </div>
                        <div>
                          <strong>{item.step}</strong>
                          <span style={{ display: 'block', fontSize: '0.75rem', color: '#64748b' }}>Realizado por: {item.user} el {item.date}</span>
                          {item.justification && (
                            <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: '#475569', fontStyle: 'italic' }}>Justificación: "{item.justification}"</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {detailTab === 'comments' && (
                  <div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                      {comments.map((c, i) => (
                        <div key={i} style={{ padding: '12px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b', marginBottom: '4px' }}>
                            <strong>{c.author}</strong>
                            <span>{new Date(c.created_at).toLocaleDateString('es-CO')}</span>
                          </div>
                          <p style={{ margin: 0, fontSize: '0.88rem', color: '#1e293b' }}>{c.comment}</p>
                        </div>
                      ))}
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input 
                        type="text" 
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} 
                        placeholder="Añadir comentario técnico..."
                        value={newCommentText}
                        onChange={e => setNewCommentText(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handlePostComment()}
                      />
                      <button className={styles.primaryBtn} onClick={handlePostComment}><Send size={16} /></button>
                    </div>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', padding: '16px 32px', borderTop: '1px solid #e2e8f0', background: '#f8fafc' }}>
                <button className={styles.secondaryBtn} onClick={() => { setSelectedReq(null); setDetailTab('general'); }}>Cancelar</button>
                <button className={styles.primaryBtn} onClick={handleSaveRequestChanges}>Aplicar Cambios</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* New Request Modal */}
      <AnimatePresence>
        {isNewRequestModalOpen && (
          <div className={styles.modalOverlay} onClick={() => setIsNewRequestModalOpen(false)}>
            <motion.div 
              className={styles.modalContent}
              style={{ maxWidth: '550px' }}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={e => e.stopPropagation()}
            >
              <div style={{ padding: '24px 32px', background: '#6366f1', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2>Nueva Solicitud de Gobierno</h2>
                <button onClick={() => setIsNewRequestModalOpen(false)} style={{ background: 'transparent', border: 'none', color: 'white' }}><X size={20} /></button>
              </div>

              <div style={{ padding: '32px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px' }}>Título</label>
                    <input 
                      type="text" 
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} 
                      placeholder="Ej: Aprobación de Acceso a Base de Clientes"
                      value={newReq.title}
                      onChange={e => setNewReq({ ...newReq, title: e.target.value })}
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px' }}>Dominio</label>
                      <select style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} value={newReq.category} onChange={e => setNewReq({ ...newReq, category: e.target.value })}>
                        <option value="">Seleccionar...</option>
                        {domains.map(d => (
                          <option key={d.id} value={d.name}>{d.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px' }}>Prioridad</label>
                      <select style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} value={newReq.priority} onChange={e => setNewReq({ ...newReq, priority: e.target.value as any })}>
                        <option>Baja</option>
                        <option>Media</option>
                        <option>Alta</option>
                        <option>Crítica</option>
                      </select>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px' }}>Score de Impacto (1-10)</label>
                      <input 
                        type="number" 
                        min="1" max="10"
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} 
                        value={newReq.impactScore}
                        onChange={e => setNewReq({ ...newReq, impactScore: Number(e.target.value) })}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px' }}>Nivel de Riesgo</label>
                      <select style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} value={newReq.riskLevel} onChange={e => setNewReq({ ...newReq, riskLevel: e.target.value as any })}>
                        <option>Bajo</option>
                        <option>Medio</option>
                        <option>Alto</option>
                        <option>Crítico</option>
                      </select>
                    </div>
                  </div>

                  {/* SLA Rule Selector */}
                  <div style={{ padding: '14px', borderRadius: '12px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '8px', color: '#1e293b' }}>
                      ⏱ Acuerdo de Nivel de Servicio (SLA)
                    </label>
                    {slaRules.length > 0 ? (
                      <>
                        <select
                          style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                          defaultValue=""
                          onChange={e => {
                            const rule = slaRules.find(r => r.id === e.target.value);
                            if (rule) setNewReq({ ...newReq, category: newReq.category });
                            // Store rule id in a temp var via data attr (handled by handleCreateRequest via auto-match)
                          }}
                        >
                          <option value="">Auto-seleccionar según dominio y prioridad</option>
                          {slaRules.map(rule => (
                            <option key={rule.id} value={rule.id}>
                              {rule.name} — {rule.hours}h · {rule.priority} · {rule.domain}
                            </option>
                          ))}
                        </select>
                        <p style={{ margin: '6px 0 0', fontSize: '0.75rem', color: '#64748b' }}>
                          Si no seleccionas, se asignará automáticamente la regla que mejor coincida con el dominio y prioridad elegidos.
                        </p>
                      </>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '0.82rem', color: '#92400e' }}>No hay reglas SLA configuradas para esta empresa.</span>
                        <button
                          type="button"
                          onClick={() => { setIsNewRequestModalOpen(false); setActiveView('sla-config'); }}
                          style={{ background: '#6366f1', color: 'white', border: 'none', borderRadius: '8px', padding: '4px 12px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
                        >Configurar SLA →</button>
                      </div>
                    )}
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px' }}>Dependencias de Activos / Sistemas</label>
                    <input 
                      type="text" 
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} 
                      placeholder="Ej: Servidor DW, Tabla fact_ventas"
                      value={newReq.dependencies}
                      onChange={e => setNewReq({ ...newReq, dependencies: e.target.value })}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px' }}>Justificación Operativa</label>
                    <textarea 
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', minHeight: '80px' }} 
                      value={newReq.description}
                      onChange={e => setNewReq({ ...newReq, description: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', padding: '16px 32px', borderTop: '1px solid #e2e8f0', background: '#f8fafc' }}>
                <button className={styles.secondaryBtn} onClick={() => setIsNewRequestModalOpen(false)}>Cancelar</button>
                <button className={styles.primaryBtn} onClick={handleCreateRequest}>Crear Solicitud</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
