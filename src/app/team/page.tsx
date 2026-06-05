'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useTenantStorage } from '@/hooks/useTenantStorage';

import { 
  Users, 
  UserPlus, 
  Shield, 
  Mail, 
  MoreVertical,
  Briefcase,
  Globe,
  Activity,
  CheckCircle,
  AlertTriangle,
  BookOpen,
  GitBranch,
  ShieldAlert,
  BarChart3,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Layers,
  ArrowUpRight,
  TrendingUp,
  LayoutGrid,
  Table as TableIcon,
  PieChart,
  Award,
  Info,
  X,
  Settings,
  Upload,
  Edit3,
  Trash2
} from 'lucide-react';
import { usePlatform } from '@/contexts/PlatformContext';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './team.module.css';

function parseTextSla(slaStr: string, createdTime: number): number | null {
  const clean = (slaStr || '').toLowerCase().trim();
  const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  
  const monthIdx = months.findIndex(m => clean.includes(m));
  if (monthIdx === -1) return null;
  
  const createdYear = new Date(createdTime).getFullYear();
  let day = 1;
  
  if (clean.startsWith('finales de') || clean.includes('fin de')) {
    day = new Date(createdYear, monthIdx + 1, 0).getDate();
  } else if (clean.startsWith('mediados de') || clean.includes('mitad de')) {
    day = 15;
  } else if (clean.startsWith('inicios de') || clean.startsWith('principio de')) {
    day = 5;
  } else {
    day = new Date(createdYear, monthIdx + 1, 0).getDate();
  }
  
  return new Date(createdYear, monthIdx, day, 23, 59, 59).getTime();
}

// --- Types ---

interface GovernanceMember {

  id: any;

  name: string;

  role: string;

  roleType: 'CDO' | 'Data Owner' | 'Data Steward' | 'Data Custodian' | 'Auditor' | 'CISO';

  area: string;

  status: 'Activo' | 'Inactivo' | 'Fuera';

  email: string;

  domain: string;

  country: string;

  stats: {

    assetsManaged: number;

    openIncidents: number;

    stewardScore: number;

    slaCompliance: number;

    qualityAvg: number;

  };

  assignments: {

    assets: string[];

    policies: string[];

    workflows: number;

  };

  avatar?: string;

}



interface GovernanceDomain {

  id: string;

  name: string;

  description: string;

  owner: string;

  steward: string;

  custodian: string;

  coverage: number;

  status: 'Cubierto' | 'Parcial' | 'Huérfano';

}



// --- Mock Data ---

const governanceMembers: GovernanceMember[] = [

  { 

    id: 1, 

    name: 'Carlos Director', 

    role: 'CDO (Chief Data Officer)', 

    roleType: 'CDO',

    area: 'Estrategia', 

    status: 'Activo', 

    email: 'carlos@govdata.io',

    domain: 'Corporativo',

    country: 'México',

    stats: { assetsManaged: 120, openIncidents: 0, stewardScore: 100, slaCompliance: 100, qualityAvg: 95 },

    assignments: { assets: ['Enterprise Metadata', 'Data Strategy v2'], policies: ['Política Global de Ética IA'], workflows: 5 }

  },

  { 

    id: 2, 

    name: 'Ana García', 

    role: 'Senior Data Steward', 

    roleType: 'Data Steward',

    area: 'Ventas', 

    status: 'Activo', 

    email: 'ana.garcia@govdata.io',

    domain: 'Comercial',

    country: 'Colombia',

    stats: { assetsManaged: 42, openIncidents: 3, stewardScore: 91, slaCompliance: 88, qualityAvg: 91 },

    assignments: { assets: ['CLIENTES_MASTER', 'VENTAS_ANUAL_2024'], policies: ['Privacidad Clientes'], workflows: 12 }

  },

  { 

    id: 3, 

    name: 'Luis Martínez', 

    role: 'Data Owner Business', 

    roleType: 'Data Owner',

    area: 'Marketing', 

    status: 'Activo', 

    email: 'luis.m@govdata.io',

    domain: 'Comercial',

    country: 'Chile',

    stats: { assetsManaged: 15, openIncidents: 1, stewardScore: 95, slaCompliance: 100, qualityAvg: 88 },

    assignments: { assets: ['LEADS_GEN_SOCIAL'], policies: ['Uso Ético de Datos Mkt'], workflows: 4 }

  },

  { 

    id: 4, 

    name: 'Sofía Rodriguez', 

    role: 'Data Custodian Infra', 

    roleType: 'Data Custodian',

    area: 'TI', 

    status: 'Activo', 

    email: 'sofia.r@govdata.io',

    domain: 'Infraestructura',

    country: 'Perú',

    stats: { assetsManaged: 250, openIncidents: 7, stewardScore: 85, slaCompliance: 92, qualityAvg: 94 },

    assignments: { assets: ['DB_PRODUCTION_CLUSTER'], policies: ['Backup & Recovery'], workflows: 18 }

  },

  { 

    id: 5, 

    name: 'Elena Gómez', 

    role: 'Compliance Auditor', 

    roleType: 'Auditor',

    area: 'Riesgos', 

    status: 'Fuera', 

    email: 'elena.g@govdata.io',

    domain: 'Legal',

    country: 'España',

    stats: { assetsManaged: 0, openIncidents: 0, stewardScore: 0, slaCompliance: 0, qualityAvg: 0 },

    assignments: { assets: [], policies: ['Auditoría ISO 27001'], workflows: 2 }

  }

];



const governanceDomains: GovernanceDomain[] = [

  { id: 'DOM-01', name: 'Finanzas', description: 'Datos contables, tesorería y fiscal.', owner: 'Carlos D.', steward: 'Ana G.', custodian: 'Sofía R.', coverage: 95, status: 'Cubierto' },

  { id: 'DOM-02', name: 'Ventas', description: 'Transacciones y CRM.', owner: 'Luis M.', steward: 'Ana G.', custodian: 'Sofía R.', coverage: 82, status: 'Parcial' },

  { id: 'DOM-03', name: 'Recursos Humanos', description: 'Nómina y talento.', owner: 'Por definir', steward: 'Por definir', custodian: 'TI Central', coverage: 0, status: 'Huérfano' },

  { id: 'DOM-04', name: 'Logística', description: 'Inventarios y despacho.', owner: 'Carlos D.', steward: 'Ana G.', custodian: 'Sofía R.', coverage: 65, status: 'Parcial' },

];



const raciData = [

  { process: 'Definición de Glosario', owner: 'A', steward: 'R', custodian: 'C', analyst: 'C' },

  { process: 'Validación de Calidad', owner: 'A', steward: 'R', custodian: 'I', analyst: 'C' },

  { process: 'Aprobación de Acceso', owner: 'A', steward: 'C', custodian: 'R', analyst: 'I' },

  { process: 'Modelado de Datos', owner: 'C', steward: 'C', custodian: 'R', analyst: 'A' },

  { process: 'Gestión de Incidentes', owner: 'I', steward: 'R', custodian: 'A', analyst: 'C' },

];



export default function Team() {

  const { currentTenant } = usePlatform();

  const [selectedKPI, setSelectedKPI] = useState<any>(null);

  const [activeTab, setActiveTab] = useState<'team' | 'domains' | 'raci' | 'coverage'>('team');

  const [selectedMember, setSelectedMember] = useState<any | null>(null);

  const [searchTerm, setSearchTerm] = useState('');

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  const [isDomainModalOpen, setIsDomainModalOpen] = useState(false);

  const [isOrgChartModalOpen, setIsOrgChartModalOpen] = useState(false);

  const [isEditMemberModalOpen, setIsEditMemberModalOpen] = useState(false);

  const [isReassignModalOpen, setIsReassignModalOpen] = useState(false);

  const [reassignTargetId, setReassignTargetId] = useState('');

  const [members, setMembers] = useState<any[]>([]);

  const [domains, setDomains] = useState<GovernanceDomain[]>([]);

  const [newDomain, setNewDomain] = useState<Partial<GovernanceDomain>>({ name: '', description: '', owner: 'Por definir', steward: 'Por definir', custodian: 'Por definir' });

  const [editingDomainId, setEditingDomainId] = useState<string | null>(null);

  const [tenantUsers, setTenantUsers] = useState<any[]>([]);

  const { getItem, setItem } = useTenantStorage();

  const [newMember, setNewMember] = useState({
    name: '',
    roleType: 'Data Steward' as any,
    area: '',
    domain: 'Comercial',
    email: '',
    country: 'México',
    avatar: ''
  });

  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentTenant?.id) return;

    setIsUploadingAvatar(true);
    try {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const path = `tenants/${currentTenant.id}/avatars/${Date.now()}_${safeName}`;
      
      const { error: uploadError } = await supabase.storage.from("governance-docs").upload(path, file);
      if (uploadError) throw uploadError;

      // Generate a long-lived signed URL (10 years)
      const { data: signedData, error: signError } = await supabase.storage
        .from("governance-docs")
        .createSignedUrl(path, 315360000);
      
      if (signError || !signedData?.signedUrl) throw signError || new Error("Failed to get signed URL");

      setNewMember(prev => ({ ...prev, avatar: signedData.signedUrl }));
      alert("✅ Foto subida exitosamente.");
    } catch (err: any) {
      console.error("Avatar upload error:", err);
      alert("Error subiendo imagen: " + err.message);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const fetchAllData = useCallback(async () => {
    if (!currentTenant?.id) return;

    try {
      // 1. Fetch tenant users FIRST so we have avatars ready
      const { data: usersData } = await supabase
        .from('tenant_users')
        .select('id, name, email, avatar')
        .eq('tenant_id', currentTenant.id)
        .order('name');

      const freshUsers = usersData || [];
      setTenantUsers(freshUsers);

      // 2. Fetch members, domains, assets, incidents, policies, and workflows in parallel
      const [membersRes, domainsRes, assetsRes, incidentsRes, policiesRes, workflowsRes] = await Promise.all([
        supabase.from('team_members').select('*').eq('tenant_id', currentTenant.id),
        supabase.from('team_domains').select('*').eq('tenant_id', currentTenant.id),
        supabase.from('data_assets').select('id, name, data_owner').eq('tenant_id', currentTenant.id),
        supabase.from('quality_incidents').select('id, asset_id, issue_type, severity, status, assigned_to').eq('tenant_id', currentTenant.id).neq('status', 'Cerrado'),
        supabase.from('data_policies').select('id, title, owner, data_custodian, auditor_designado').eq('tenant_id', currentTenant.id),
        supabase.from('workflow_requests').select('id, requested_by, assigned_to, created_at, sla, sla_status, status').eq('tenant_id', currentTenant.id)
      ]);

      if (membersRes.data) {
        const freshAssets = assetsRes.data || [];
        const freshIncidents = incidentsRes.data || [];
        const freshPolicies = policiesRes.data || [];
        const freshWorkflows = workflowsRes.data || [];

        const mappedMembers = membersRes.data.map(m => {
          const seed = encodeURIComponent((m.name || '').replace(/\s+/g, '').substring(0, 30));
          // Look up by email first (more reliable), then by name
          const tenantUser = freshUsers.find(u =>
            (m.email && u.email && u.email.toLowerCase() === m.email.toLowerCase()) ||
            (m.name && u.name && u.name.toLowerCase() === m.name.toLowerCase())
          );

          // Prefer tenant user's real photo; fallback to member avatar; last resort: dicebear
          const isReal = (url: string | null | undefined) =>
            !!url && url.startsWith('http') && !url.includes('dicebear') && !url.includes('/initials/');
          const fixedAvatar =
            isReal(tenantUser?.avatar) ? tenantUser!.avatar :
            isReal(m.avatar)           ? m.avatar :
            `https://api.dicebear.com/9.x/avataaars/svg?seed=${seed}`;

          // Calculate real assets and incidents managed by the member
          const mNameLower = (m.name || '').toLowerCase().trim();
          const memberAssets = freshAssets.filter(a => (a.data_owner || '').toLowerCase().trim() === mNameLower);
          const assetsManaged = memberAssets.length;
          const assetIds = memberAssets.map(a => a.id);
          
          const openIncidentsList = freshIncidents
            .filter(i => {
              if (assetIds.includes(i.asset_id)) return true;
              if (!i.assigned_to) return false;
              const assignedLower = i.assigned_to.toLowerCase().trim();
              return assignedLower.includes(mNameLower) || mNameLower.includes(assignedLower);
            })
            .map(i => {
              const asset = freshAssets.find(a => a.id === i.asset_id);
              return {
                id: i.id,
                issue_type: i.issue_type,
                severity: i.severity || 'media',
                asset_name: asset ? asset.name : 'Activo'
              };
            });
          
          const openIncidents = openIncidentsList.length;

          const memberPolicies = freshPolicies
            .filter(p => {
              const ownerStr = (p.owner || '').toLowerCase();
              const custodianStr = (p.data_custodian || '').toLowerCase();
              const auditorStr = (p.auditor_designado || '').toLowerCase();
              return ownerStr.includes(mNameLower) || custodianStr.includes(mNameLower) || auditorStr.includes(mNameLower);
            })
            .map(p => p.title);

          const memberWorkflows = freshWorkflows
            .filter(w => w.assigned_to && w.assigned_to.toLowerCase().trim() === mNameLower);
          const memberWorkflowsCount = freshWorkflows
            .filter(w => w.requested_by === m.id || (w.assigned_to && w.assigned_to.toLowerCase().trim() === mNameLower)).length;
          const overdueWorkflows = memberWorkflows.filter(w => {
            let isOverdue = w.sla_status === 'Overdue';
            const createdTime = new Date(w.created_at).getTime();
            const nowTime = Date.now();
            const slaStr = (w.sla || '').trim();
            const hoursMatch = slaStr.match(/^(\d+)h$/);

            if (w.status === 'Pendiente' || w.status === 'En Revisión' || w.status === 'Escalado') {
              if (hoursMatch) {
                const slaHours = parseInt(hoursMatch[1], 10);
                const diffHours = (nowTime - createdTime) / (1000 * 60 * 60);
                if (diffHours > slaHours) {
                  isOverdue = true;
                }
              } else {
                const parsedSlaTime = parseTextSla(slaStr, createdTime);
                if (parsedSlaTime !== null && nowTime > parsedSlaTime) {
                  isOverdue = true;
                }
              }
            } else {
              isOverdue = false;
            }
            return isOverdue;
          }).length;

          return {
            ...m,
            avatar: fixedAvatar,
            roleType: m.role || 'Data Steward',
            country: 'Colombia',
            stats: { 
              assetsManaged, 
              openIncidents, 
              stewardScore: Math.max(50, Math.min(100, 100 - (openIncidents * 5) - (overdueWorkflows * 8))), 
              slaCompliance: Math.max(0, Math.min(100, 100 - (openIncidents * 3) - (overdueWorkflows * 15))), 
              qualityAvg: Math.max(60, Math.min(100, 95 - (openIncidents * 4)))
            },
            assignments: { 
              assets: memberAssets.map(a => a.name), 
              policies: memberPolicies, 
              workflows: memberWorkflowsCount,
              incidents: openIncidentsList
            }
          };
        });
        setMembers(mappedMembers);
      }

      if (domainsRes.data) {
        const mappedDomains = domainsRes.data.map(d => {
          const domainOwner = membersRes.data?.find(m => m.id === d.owner_id);
          const domainSteward = membersRes.data?.find(m => m.id === d.steward_id);
          const domainCustodian = membersRes.data?.find(m => m.id === d.custodian_id);
          return {
            ...d,
            owner: domainOwner ? domainOwner.name : 'Por definir',
            steward: domainSteward ? domainSteward.name : 'Por definir',
            custodian: domainCustodian ? domainCustodian.name : 'Por definir',
            coverage: d.coverage || 50,
            status: d.status || 'Parcial'
          };
        });
        setDomains(mappedDomains as any);
      }
    } catch (e: any) {
      console.error('Error fetching team data:', e);
      if (e?.code === '42P01') alert("Faltan las tablas team_members o team_domains en Supabase.");
    }
  }, [currentTenant?.id]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);



  const handleAddMember = async () => {
    if (!currentTenant?.id) return;
    if (!newMember.name) {
      alert("Por favor selecciona un usuario primero.");
      return;
    }
    try {
      const seed = encodeURIComponent(newMember.name.replace(/\s+/g, '').substring(0, 30));
      const fallbackAvatar = `https://api.dicebear.com/9.x/avataaars/svg?seed=${seed}`;
      const avatarUrl = newMember.avatar || fallbackAvatar;

      const { data, error } = await supabase.from('team_members').insert([{
        tenant_id: currentTenant.id,
        name: newMember.name.substring(0, 150),
        email: (newMember.email || `${newMember.name.replace(/\s+/g, '').toLowerCase().substring(0,50)}@empresa.com`).substring(0, 200),
        role: newMember.roleType.substring(0, 100),
        area: (newMember.area || 'General').substring(0, 100),
        avatar: avatarUrl
      }]).select();

      if (error) throw error;

      setIsAssignModalOpen(false);
      setNewMember({ name: '', roleType: 'Data Steward', area: '', domain: 'Comercial', email: '', country: 'México', avatar: '' });
      await fetchAllData();
      alert("Miembro agregado y asignado correctamente.");
    } catch (e: any) {
      console.error('Detalles del error:', e.message || JSON.stringify(e));
      alert(`Error guardando el miembro: ${e.message || 'Verifica tu base de datos.'}`);
    }
  };

  const handleUpdateMember = async () => {
    if (!currentTenant?.id || !selectedMember) return;
    try {
      const oldName = selectedMember.name;
      const newName = newMember.name.substring(0, 150);

      const { error } = await supabase.from('team_members').update({
        name: newName,
        email: newMember.email.substring(0, 200),
        role: newMember.roleType.substring(0, 100),
        area: (newMember.area || 'General').substring(0, 100),
        avatar: newMember.avatar
      }).eq('id', selectedMember.id);

      if (error) throw error;

      if (oldName.toLowerCase().trim() !== newName.toLowerCase().trim()) {
        await Promise.all([
          supabase.from('data_assets')
            .update({ data_owner: newName })
            .eq('tenant_id', currentTenant.id)
            .eq('data_owner', oldName),
          supabase.from('data_policies')
            .update({ owner: newName })
            .eq('tenant_id', currentTenant.id)
            .eq('owner', oldName),
          supabase.from('data_policies')
            .update({ data_custodian: newName })
            .eq('tenant_id', currentTenant.id)
            .eq('data_custodian', oldName),
          supabase.from('data_policies')
            .update({ auditor_designado: newName })
            .eq('tenant_id', currentTenant.id)
            .eq('auditor_designado', oldName),
          supabase.from('quality_incidents')
            .update({ assigned_to: newName })
            .eq('tenant_id', currentTenant.id)
            .eq('assigned_to', oldName),
          supabase.from('security_incidents')
            .update({ assigned_to: newName })
            .eq('tenant_id', currentTenant.id)
            .eq('assigned_to', oldName),
          supabase.from('security_risks')
            .update({ owner: newName })
            .eq('tenant_id', currentTenant.id)
            .eq('owner', oldName),
          supabase.from('workflow_requests')
            .update({ assigned_to: newName })
            .eq('tenant_id', currentTenant.id)
            .eq('assigned_to', oldName)
        ]);
      }

      // ── Sync avatar & name to tenant_users and localStorage if this is the current user ──
      const currentUserEmail = typeof window !== 'undefined' ? localStorage.getItem('govdata_user_email') : null;
      const memberEmail = (newMember.email || selectedMember.email || '').toLowerCase().trim();
      const isCurrentUser = !!(currentUserEmail && memberEmail && currentUserEmail.toLowerCase().trim() === memberEmail);

      if (isCurrentUser) {
        // Update tenant_users table so the avatar persists across logins
        const { data: tuData } = await supabase
          .from('tenant_users')
          .select('id')
          .eq('tenant_id', currentTenant.id)
          .ilike('email', memberEmail)
          .maybeSingle();

        if (tuData?.id) {
          await supabase
            .from('tenant_users')
            .update({ avatar: newMember.avatar, name: newName })
            .eq('id', tuData.id);
        }

        // Update localStorage so Sidebar refreshes immediately
        if (newMember.avatar) {
          localStorage.setItem('govdata_avatar_url', newMember.avatar);
        }
        if (newName) {
          localStorage.setItem('govdata_user_name', newName);
        }

        // Dispatch custom event so Sidebar reacts without page reload
        window.dispatchEvent(new CustomEvent('govdata_user_updated', {
          detail: { avatar: newMember.avatar, name: newName }
        }));
      }

      setIsEditMemberModalOpen(false);
      await fetchAllData();
      setSelectedMember(null);
      alert("Perfil actualizado correctamente.");
    } catch (e: any) {
      console.error(e);
      alert(`Error actualizando el miembro: ${e.message}`);
    }
  };

  const handleDeleteMember = async (memberId: any) => {
    if (!confirm("¿Está seguro que desea eliminar este miembro del equipo de gobierno?")) return;
    try {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;

      setIsEditMemberModalOpen(false);
      setSelectedMember(null);
      await fetchAllData();
      alert("Miembro de gobierno eliminado exitosamente.");
    } catch (e: any) {
      console.error(e);
      alert(`Error eliminando el miembro: ${e.message}`);
    }
  };

  const handleReassign = async () => {
    if (!currentTenant?.id || !selectedMember || !reassignTargetId) return;
    
    const targetMember = members.find(m => m.id === reassignTargetId);
    if (!targetMember) return;

    try {
      const sourceName = selectedMember.name;
      const targetName = targetMember.name;

      // 1. Reassign data assets (by name)
      const { error: assetErr } = await supabase.from('data_assets')
        .update({ data_owner: targetName })
        .eq('tenant_id', currentTenant.id)
        .eq('data_owner', sourceName);
      if (assetErr) throw assetErr;

      // 2. Reassign policies (by name)
      const { error: policyErr } = await supabase.from('data_policies')
        .update({ owner: targetName })
        .eq('tenant_id', currentTenant.id)
        .eq('owner', sourceName);
      if (policyErr) throw policyErr;

      await supabase.from('data_policies')
        .update({ data_custodian: targetName })
        .eq('tenant_id', currentTenant.id)
        .eq('data_custodian', sourceName);

      await supabase.from('data_policies')
        .update({ auditor_designado: targetName })
        .eq('tenant_id', currentTenant.id)
        .eq('auditor_designado', sourceName);

      // Reassign incidents, risks and workflows (by name)
      await supabase.from('quality_incidents')
        .update({ assigned_to: targetName })
        .eq('tenant_id', currentTenant.id)
        .eq('assigned_to', sourceName);

      await supabase.from('security_incidents')
        .update({ assigned_to: targetName })
        .eq('tenant_id', currentTenant.id)
        .eq('assigned_to', sourceName);

      await supabase.from('security_risks')
        .update({ owner: targetName })
        .eq('tenant_id', currentTenant.id)
        .eq('owner', sourceName);

      await supabase.from('workflow_requests')
        .update({ assigned_to: targetName })
        .eq('tenant_id', currentTenant.id)
        .eq('assigned_to', sourceName);

      // 3. Reassign domains (by owner_id UUID)
      const { error: domainErr } = await supabase.from('team_domains')
        .update({ owner_id: targetMember.id })
        .eq('tenant_id', currentTenant.id)
        .eq('owner_id', selectedMember.id);
      if (domainErr) throw domainErr;

      alert("Responsabilidades reasignadas correctamente.");
      setIsReassignModalOpen(false);
      setSelectedMember(null);
      await fetchAllData();
    } catch (e: any) {
      console.error(e);
      alert(`Error durante la reasignación: ${e.message}`);
    }
  };



  const closeDomainModal = () => {
    setIsDomainModalOpen(false);
    setEditingDomainId(null);
    setNewDomain({ name: '', description: '', owner: 'Por definir', steward: 'Por definir', custodian: 'Por definir' });
  };

  const handleAddDomain = async () => {
    if (!newDomain.name || !newDomain.description || !currentTenant?.id) {
      alert("Por favor completa el nombre y descripción del dominio.");
      return;
    }

    try {
      const ownerMember = members.find(m => m.name === newDomain.owner);
      const stewardMember = members.find(m => m.name === newDomain.steward);
      const custodianMember = members.find(m => m.name === newDomain.custodian);

      const payload: any = {
        tenant_id: currentTenant.id,
        name: newDomain.name,
        description: newDomain.description,
        owner_id: ownerMember ? ownerMember.id : null,
        steward_id: stewardMember ? stewardMember.id : null,
        custodian_id: custodianMember ? custodianMember.id : null
      };

      if (editingDomainId) {
        // Mode: EDIT
        const { error } = await supabase
          .from('team_domains')
          .update(payload)
          .eq('id', editingDomainId);

        if (error) throw error;

        setDomains(prev => prev.map(d => d.id === editingDomainId ? {
          ...d,
          name: newDomain.name!,
          description: newDomain.description!,
          owner: newDomain.owner || 'Por definir',
          steward: newDomain.steward || 'Por definir',
          custodian: newDomain.custodian || 'Por definir',
          owner_id: ownerMember ? ownerMember.id : null,
          steward_id: stewardMember ? stewardMember.id : null,
          custodian_id: custodianMember ? custodianMember.id : null
        } : d));

        alert("Dominio de datos actualizado exitosamente.");
      } else {
        // Mode: CREATE
        payload.status = 'Parcial';
        const { data, error } = await supabase
          .from('team_domains')
          .insert([payload])
          .select();

        if (error) throw error;

        if (data && data.length > 0) {
          const d = data[0];
          const domainToAdd: GovernanceDomain = {
            ...d,
            owner: newDomain.owner || 'Por definir',
            steward: newDomain.steward || 'Por definir',
            custodian: newDomain.custodian || 'Por definir',
            coverage: 50,
            status: 'Parcial'
          };
          setDomains([...domains, domainToAdd]);
          alert("Dominio de datos creado exitosamente.");
        }
      }

      closeDomainModal();
    } catch (e) {
      console.error(e);
      alert('Error guardando el dominio en base de datos.');
    }
  };

  const handleDeleteDomain = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este dominio de datos? Esta acción no se puede deshacer.')) return;

    try {
      const { error } = await supabase
        .from('team_domains')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setDomains(prev => prev.filter(d => d.id !== id));
      alert('Dominio eliminado exitosamente.');
    } catch (e) {
      console.error(e);
      alert('Error al eliminar el dominio.');
    }
  };



  const filteredMembers = members.filter(m => 

    m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 

    m.role.toLowerCase().includes(searchTerm.toLowerCase())

  );



  return (

    <div className={styles.container}>

      {/* Header Enterprise */}

      <header className={styles.header}>

        <div className={styles.titleArea} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>

          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0 }}>

            <Users size={24} />

          </div>

          <div>

            <h1 style={{ margin: 0, marginBottom: '4px', fontSize: '1.8rem' }}>Centro Operativo de Gobierno de Datos</h1>

            <p style={{ margin: 0, color: '#64748b', fontSize: '0.95rem' }}>Definición de roles, estructura organizativa y asignación de dominios de datos.</p>

          </div>

        </div>

        <div className={styles.headerActions}>

           <button className={styles.secondaryBtn} onClick={() => setIsOrgChartModalOpen(true)}><Activity size={16} /> Ver Organigrama</button>

           <button className={styles.addBtn} onClick={() => setIsAssignModalOpen(true)}><UserPlus size={18} /> Asignar Responsable</button>

        </div>

      </header>



      {/* ── Consolidated Global Score Banner calculations ── */}

      {(() => {

        const ownersCount = members.filter(m => m.roleType === 'Data Owner').length;

        const stewardsCount = members.filter(m => m.roleType === 'Data Steward').length;

        const custodiansCount = members.filter(m => m.roleType === 'Data Custodian').length;

        

        const activeMembers = members.filter(m => m.status === 'Activo');

        const slaEfficiency = activeMembers.length > 0 

          ? Math.round(activeMembers.reduce((acc, m) => acc + (m.stats?.slaCompliance || 0), 0) / activeMembers.length)

          : 100;

        

        const coveredDomainsCount = domains.filter(d => d.status !== 'Huérfano').length;

        const coverageScore = domains.length > 0 ? Math.round((coveredDomainsCount / domains.length) * 100) : 0;



        let levelText = 'HUÉRFANO';

        let levelColor = '#ef4444';

        if (coverageScore >= 90) {

          levelText = 'SÓLIDO';

          levelColor = '#10b981';

        } else if (coverageScore >= 75) {

          levelText = 'ESTRUCTURADO';

          levelColor = '#6366f1';

        }



        const circumference = 2 * Math.PI * 52;

        const dashOffset = circumference - (coverageScore / 100) * circumference;



        const kpiExplanations: Record<string, string> = {

          'Dueños Asignados': 'Líderes de negocio responsables de definir la criticidad, el valor comercial y la autorización de acceso a los activos de información.',

          'Stewards Activos': 'Especialistas técnicos responsables de velar por la calidad, definición y consistencia del catálogo de metadatos.',

          'Custodians': 'Administradores de sistemas y bases de datos que ejecutan controles físicos de almacenamiento, respaldo y accesos de seguridad.',

          'Cobertura': 'Porcentaje de activos de información críticos que cuentan con un Data Owner formalmente asignado en la organización.',

          'Dominios Asignados': 'Áreas de negocio o dominios lógicos de datos que cuentan con asignaciones activas de gobierno.',

          'Eficiencia SLA': 'Cumplimiento promedio en Acuerdos de Nivel de Servicio para la atención de solicitudes de acceso e incidentes de calidad.'

        };



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

                    {coverageScore}%

                  </text>

                  <text x="60" y="72" textAnchor="middle" fill="#94a3b8" fontSize="10" fontWeight="700">

                    COBERTURA

                  </text>

                </svg>

              </div>

              <div className={styles.globalInfo}>

                <div className={styles.globalLevel} style={{ color: levelColor }}>

                  <Award size={20} /> {levelText}

                </div>

                <h2 className={styles.globalTitle}>Índice de Ownership Coverage</h2>

                <p className={styles.globalSub}>

                  Porcentaje de dominios y activos de información con dueños de datos formalmente asignados.

                </p>

              </div>

            </div>



            {/* Mini dimension pills */}

            <div className={styles.globalRight}>

              <div className={styles.miniPill} onClick={() => setSelectedKPI({ label: 'Dueños Asignados', value: ownersCount.toString(), explanation: kpiExplanations['Dueños Asignados'], color: '#10b981' })}>

                <Shield size={14} color="#10b981" />

                <span>Dueños</span>

                <strong style={{ color: '#10b981' }}>{ownersCount}</strong>

              </div>

              <div className={styles.miniPill} onClick={() => setSelectedKPI({ label: 'Stewards Activos', value: stewardsCount.toString(), explanation: kpiExplanations['Stewards Activos'], color: '#f59e0b' })}>

                <Briefcase size={14} color="#f59e0b" />

                <span>Stewards</span>

                <strong style={{ color: '#f59e0b' }}>{stewardsCount}</strong>

              </div>

              <div className={styles.miniPill} onClick={() => setSelectedKPI({ label: 'Custodians', value: custodiansCount.toString(), explanation: kpiExplanations['Custodians'], color: '#ef4444' })}>

                <Layers size={14} color="#ef4444" />

                <span>Custodians</span>

                <strong style={{ color: '#ef4444' }}>{custodiansCount}</strong>

              </div>

              <div className={styles.miniPill} onClick={() => setSelectedKPI({ label: 'Cobertura', value: `${coverageScore}%`, explanation: kpiExplanations['Cobertura'], color: '#6366f1' })}>

                <CheckCircle2 size={14} color="#6366f1" />

                <span>Cobertura</span>

                <strong style={{ color: '#6366f1' }}>{coverageScore}%</strong>

              </div>

              <div className={styles.miniPill} onClick={() => setSelectedKPI({ label: 'Dominios Asignados', value: coveredDomainsCount.toString(), explanation: kpiExplanations['Dominios Asignados'], color: '#8b5cf6' })}>

                <LayoutGrid size={14} color="#8b5cf6" />

                <span>Dominios</span>

                <strong style={{ color: '#8b5cf6' }}>{coveredDomainsCount} / {domains.length}</strong>

              </div>

              <div className={styles.miniPill} onClick={() => setSelectedKPI({ label: 'Eficiencia SLA', value: `${slaEfficiency}%`, explanation: kpiExplanations['Eficiencia SLA'], color: '#06b6d4' })}>

                <Clock size={14} color="#06b6d4" />

                <span>Eficiencia</span>

                <strong style={{ color: '#06b6d4' }}>{slaEfficiency}%</strong>

              </div>

            </div>

          </motion.div>

        );

      })()}



      {/* Tabs de Navegación */}

      <div className={styles.tabContainer}>

        <button className={`${styles.tab} ${activeTab === 'team' ? styles.activeTab : ''}`} onClick={() => setActiveTab('team')}>

          <Users size={16} /> Red de Gobierno

        </button>

        <button className={`${styles.tab} ${activeTab === 'domains' ? styles.activeTab : ''}`} onClick={() => setActiveTab('domains')}>

          <LayoutGrid size={16} /> Ownership Dominios

        </button>

        <button className={`${styles.tab} ${activeTab === 'raci' ? styles.activeTab : ''}`} onClick={() => setActiveTab('raci')}>

          <TableIcon size={16} /> Matriz RACI

        </button>

        <button className={`${styles.tab} ${activeTab === 'coverage' ? styles.activeTab : ''}`} onClick={() => setActiveTab('coverage')}>

          <PieChart size={16} /> Capacidad y Madurez

        </button>

      </div>



      <div className={styles.mainContent}>

        {activeTab === 'team' && (

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>

            <div className={styles.filterArea}>

              <div className={styles.searchBar}>

                <Search size={18} />

                <input 

                  type="text" 

                  placeholder="Buscar por nombre, rol o dominio..." 

                  value={searchTerm}

                  onChange={(e) => setSearchTerm(e.target.value)}

                />

              </div>

              <button className={styles.filterBtn}><Filter size={16} /> Filtros Avanzados</button>

            </div>



            <div className={styles.memberGrid}>

              {filteredMembers.map(member => (

                <motion.div 

                  key={member.id} 

                  className={styles.memberCard}

                  whileHover={{ y: -5 }}

                  onClick={() => setSelectedMember(member)}

                >

                  <div className={styles.cardStatus} style={{ background: member.status === 'Activo' ? '#10b981' : '#f59e0b' }} />

                  <div className={styles.memberHeader}>

                    <div className={styles.avatarArea}>

                      <div className={styles.avatar} style={{ padding: 0, overflow: 'hidden', background: 'linear-gradient(135deg, #6366f1, #a855f7)' }}>

                        {member.avatar && member.avatar.startsWith('http') ? (

                          <img

                            src={member.avatar}

                            alt={member.name}

                            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}

                            onError={(e) => {

                              const target = e.target as HTMLImageElement;

                              target.style.display = 'none';

                              const initials = member.name.split(' ').map((n: string) => n[0]).join('').toUpperCase();

                              if (target.parentElement) {

                                target.parentElement.innerHTML = `<span style="color:white;font-size:1.1rem;font-weight:800;display:flex;align-items:center;justify-content:center;width:100%;height:100%;">${initials}</span>`;

                              }

                            }}

                          />

                        ) : (

                          <span style={{ color: 'white', fontSize: '1.1rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>

                            {member.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}

                          </span>

                        )}

                      </div>

                      <div className={styles.scoreBadge} title="Steward Score">{member.stats.stewardScore}%</div>

                    </div>

                    <button className={styles.moreBtn} onClick={(e) => e.stopPropagation()}><MoreVertical size={18} /></button>

                  </div>

                  <div className={styles.memberBody}>

                    <h3>{member.name}</h3>

                    <span className={styles.roleTag} data-role={member.roleType}>{member.role}</span>

                    

                    <div className={styles.assignmentSummary}>

                      <div className={styles.assignItem}>

                        <Layers size={14} />

                        <span>{member.stats.assetsManaged} Activos</span>

                      </div>

                      <div className={styles.assignItem}>

                        <Activity size={14} />

                        <span>{member.stats.openIncidents} Incidentes</span>

                      </div>

                    </div>



                    <div className={styles.footerInfo}>

                      <div className={styles.domainInfo}>

                        <Globe size={14} />

                        <span>{member.domain} • {member.country}</span>

                      </div>

                      <div className={styles.slaBadge} style={{ color: member.stats.slaCompliance > 90 ? '#10b981' : '#f59e0b' }}>

                        SLA: {member.stats.slaCompliance}%

                      </div>

                    </div>

                  </div>

                </motion.div>

              ))}

            </div>

          </motion.div>

        )}



        {activeTab === 'domains' && (

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={styles.domainView}>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>

              <button className={styles.primaryBtn} onClick={() => setIsDomainModalOpen(true)}>

                <Plus size={16} /> Crear Dominio

              </button>

            </div>

            <div className={styles.domainTableContainer}>

              <table className={styles.domainTable}>

                <thead>

                  <tr>

                    <th>Dominio</th>

                    <th>Data Owner</th>

                    <th>Data Steward</th>

                    <th>Data Custodian</th>

                    <th>Cobertura</th>

                    <th>Estado</th>

                    <th>Acciones</th>

                  </tr>

                </thead>

                <tbody>

                  {domains.map(domain => (

                    <tr key={domain.id}>

                      <td>

                        <div className={styles.domainCol}>

                          <span className={styles.domainName}>{domain.name}</span>

                          <span className={styles.domainDesc}>{domain.description}</span>

                        </div>

                      </td>

                      <td>

                        <div className={styles.userCell}>

                          <div className={styles.miniAvatar}>{domain.owner === 'Por definir' ? '?' : domain.owner[0]}</div>

                          <span className={domain.owner === 'Por definir' ? styles.unassigned : ''}>{domain.owner}</span>

                        </div>

                      </td>

                      <td>

                        <div className={styles.userCell}>

                          <div className={styles.miniAvatar}>{domain.steward === 'Por definir' ? '?' : domain.steward[0]}</div>

                          <span className={domain.steward === 'Por definir' ? styles.unassigned : ''}>{domain.steward}</span>

                        </div>

                      </td>

                      <td>

                        <div className={styles.userCell}>

                          <div className={styles.miniAvatar}>{domain.custodian === 'Por definir' ? '?' : domain.custodian[0]}</div>

                          <span className={domain.custodian === 'Por definir' ? styles.unassigned : ''}>{domain.custodian}</span>

                        </div>

                      </td>

                      <td>

                        <div className={styles.coverageCell}>

                          <div className={styles.coverageBar}><div style={{ width: `${domain.coverage}%`, background: domain.coverage > 80 ? '#10b981' : domain.coverage > 40 ? '#f59e0b' : '#ef4444' }} /></div>

                          <span>{domain.coverage}%</span>

                        </div>

                      </td>

                      <td><span className={styles.statusBadge} data-status={domain.status.toLowerCase()}>{domain.status}</span></td>

                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button 
                            className={styles.actionBtn} 
                            onClick={() => {
                              setEditingDomainId(domain.id);
                              setNewDomain({
                                name: domain.name,
                                description: domain.description || '',
                                owner: domain.owner,
                                steward: domain.steward,
                                custodian: domain.custodian
                              });
                              setIsDomainModalOpen(true);
                            }}
                            title="Editar Dominio"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button 
                            className={styles.actionBtn}
                            style={{ color: '#ef4444' }} 
                            onClick={() => handleDeleteDomain(domain.id)}
                            title="Eliminar Dominio"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          </motion.div>

        )}



        {activeTab === 'raci' && (

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={styles.raciView}>

             <div className={styles.raciInfo}>

                <h3>Matriz RACI: Gobierno Operativo</h3>

                <p>Definición de niveles de responsabilidad por proceso clave de gobierno.</p>

             </div>

             <div className={styles.raciLegend}>

                <div className={styles.legendItem}><span className={styles.raciA}>A</span> Accountable (Rinde cuentas)</div>

                <div className={styles.legendItem}><span className={styles.raciR}>R</span> Responsible (Ejecuta)</div>

                <div className={styles.legendItem}><span className={styles.raciC}>C</span> Consulted (Consultado)</div>

                <div className={styles.legendItem}><span className={styles.raciI}>I</span> Informed (Informado)</div>

             </div>

             <table className={styles.raciTable}>

                <thead>

                  <tr>

                    <th>Proceso / Actividad</th>

                    <th>Data Owner</th>

                    <th>Data Steward</th>

                    <th>Data Custodian</th>

                    <th>Data Analyst</th>

                  </tr>

                </thead>

                <tbody>

                  {raciData.map((row, i) => (

                    <tr key={i}>

                      <td className={styles.processName}>{row.process}</td>

                      <td><span className={styles.raciBadge} data-type={row.owner}>{row.owner}</span></td>

                      <td><span className={styles.raciBadge} data-type={row.steward}>{row.steward}</span></td>

                      <td><span className={styles.raciBadge} data-type={row.custodian}>{row.custodian}</span></td>

                      <td><span className={styles.raciBadge} data-type={row.analyst}>{row.analyst}</span></td>

                    </tr>

                  ))}

                </tbody>

             </table>

          </motion.div>

        )}

      </div>



      {/* Modal de Perfil de Gobierno */}

      <AnimatePresence>

        {selectedMember && (

          <div className={styles.modalOverlay} onClick={() => setSelectedMember(null)}>

            <motion.div 

              className={styles.profileDrawer}

              initial={{ x: '100%' }}

              animate={{ x: 0 }}

              exit={{ x: '100%' }}

              transition={{ type: 'spring', damping: 25, stiffness: 200 }}

              onClick={(e) => e.stopPropagation()}

            >

              <div className={styles.profileHeader}>

                <button className={styles.closeBtn} onClick={() => setSelectedMember(null)}><XCircle size={24} /></button>

                <div className={styles.profileBasicInfo}>

                   <div className={styles.largeAvatar} style={{ padding: 0, overflow: 'hidden', background: 'linear-gradient(135deg, #6366f1, #a855f7)' }}>

                     {selectedMember.avatar && selectedMember.avatar.startsWith('http') ? (

                       <img

                         src={selectedMember.avatar}

                         alt={selectedMember.name}

                         style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}

                         onError={(e) => {

                           const target = e.target as HTMLImageElement;

                           target.style.display = 'none';

                           const initials = selectedMember.name.split(' ').map((n: string) => n[0]).join('').toUpperCase();

                           if (target.parentElement) {

                             target.parentElement.innerHTML = `<span style="color:white;font-size:1.8rem;font-weight:800;display:flex;align-items:center;justify-content:center;width:100%;height:100%;">${initials}</span>`;

                           }

                         }}

                       />

                     ) : (

                       <span style={{ color: 'white', fontSize: '1.8rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>

                         {selectedMember.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}

                       </span>

                     )}

                   </div>

                   <div>

                      <h2>{selectedMember.name}</h2>

                      <span className={styles.roleTag} data-role={selectedMember.roleType}>{selectedMember.role}</span>

                      <div className={styles.profileSub}>

                         <Globe size={14} /> {selectedMember.domain} • {selectedMember.country} • {selectedMember.area}

                      </div>

                   </div>

                </div>

              </div>



              <div className={styles.profileBody}>

                 <div className={styles.profileStatsGrid}>

                    <div className={styles.profileStatItem}>

                       <span className={styles.pStatLabel}>Steward Score</span>

                       <span className={styles.pStatValue} style={{ color: '#10b981' }}>{selectedMember.stats.stewardScore}%</span>

                    </div>

                    <div className={styles.profileStatItem}>

                       <span className={styles.pStatLabel}>SLA Compliance</span>

                       <span className={styles.pStatValue}>{selectedMember.stats.slaCompliance}%</span>

                    </div>

                    <div className={styles.profileStatItem}>

                       <span className={styles.pStatLabel}>Calidad Promedio</span>

                       <span className={styles.pStatValue}>{selectedMember.stats.qualityAvg}%</span>

                    </div>

                    <div className={styles.profileStatItem}>

                       <span className={styles.pStatLabel}>Tickets Hoy</span>

                       <span className={styles.pStatValue}>{selectedMember.assignments.workflows}</span>

                    </div>

                 </div>



                 <div className={styles.profileSection}>

                    <h4><Layers size={16} /> Activos Asignados ({selectedMember.stats.assetsManaged})</h4>

                    <div className={styles.assetList}>

                       {selectedMember.assignments.assets.map((asset: string, i: number) => (

                         <div key={i} className={styles.assetTag}>{asset}</div>

                       ))}

                       {selectedMember.stats.assetsManaged > 2 && <div className={styles.moreAssets}>+ {selectedMember.stats.assetsManaged - 2} más</div>}

                    </div>

                 </div>



                 <div className={styles.profileSection}>

                     <h4><BookOpen size={16} /> Políticas Bajo su Responsabilidad</h4>

                     <div className={styles.policyList}>

                        {selectedMember.assignments.policies && selectedMember.assignments.policies.length > 0 ? (
                          selectedMember.assignments.policies.map((policy: string, i: number) => (
                            <div key={i} className={styles.policyItem}>
                               <div className={styles.policyIcon}><Shield size={14} /></div>
                               <span>{policy}</span>
                            </div>
                          ))
                        ) : (
                          <div style={{ color: '#64748b', fontSize: '0.85rem', padding: '8px' }}>Sin políticas asignadas.</div>
                        )}

                     </div>

                  </div>



                  <div className={styles.profileSection}>

                     <h4><Activity size={16} /> Incidentes Recientes ({selectedMember.assignments.incidents?.length || 0})</h4>

                     <div className={styles.incidentList}>

                        {selectedMember.assignments.incidents && selectedMember.assignments.incidents.length > 0 ? (
                          selectedMember.assignments.incidents.map((incident: any, i: number) => (
                            <div key={i} className={styles.incidentItem} data-severity={incident.severity === 'alta' ? 'alta' : 'media'}>
                               <AlertTriangle size={14} /> <span>{incident.issue_type} en {incident.asset_name}</span>
                            </div>
                          ))
                        ) : (
                          <div style={{ color: '#64748b', fontSize: '0.85rem', padding: '8px' }}>No hay incidentes abiertos.</div>
                        )}

                     </div>

                  </div>

               </div>



                <div className={styles.profileFooter}>

                  <button className={styles.secondaryBtn} style={{ width: '100%', justifyContent: 'center' }} onClick={() => window.open(`mailto:${selectedMember.email}`)}><Mail size={16} /> Contactar Responsable</button>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>

                     <button className={styles.secondaryBtn} style={{ justifyContent: 'center' }} onClick={() => setIsReassignModalOpen(true)}>Reasignar</button>

                    <button className={styles.primaryBtn} style={{ justifyContent: 'center' }} onClick={() => {

                      setNewMember({

                        name: selectedMember.name,

                        roleType: selectedMember.roleType,

                        area: selectedMember.area,

                        domain: selectedMember.domain,

                        email: selectedMember.email,

                        country: selectedMember.country,

                        avatar: selectedMember.avatar || ''

                      });

                      setIsEditMemberModalOpen(true);

                    }}>Editar Perfil</button>

                 </div>

              </div>

            </motion.div>

          </div>

        )}

       </AnimatePresence>



       {/* Modal: Asignar Responsable */}

       <AnimatePresence>

         {isAssignModalOpen && (

           <div className={styles.modalOverlay} onClick={() => setIsAssignModalOpen(false)}>

              <motion.div 

                 className={styles.assignModal}

                 style={{ 

                   maxWidth: '700px', width: '90%', maxHeight: '90vh', display: 'flex', flexDirection: 'column', 

                   background: 'var(--modal-bg, rgba(15, 23, 42, 0.85))', 

                   backdropFilter: 'blur(var(--modal-blur, 24px))', 

                   WebkitBackdropFilter: 'blur(var(--modal-blur, 24px))',

                   fontFamily: 'var(--modal-font, inherit)',

                   border: '1px solid rgba(255,255,255,0.1)',

                   borderRadius: '32px', 

                   color: 'var(--modal-text-color, white)', 

                   boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',

                   overflow: 'hidden' 

                 }}

                 initial={{ opacity: 0, scale: 0.9 }}

                 animate={{ opacity: 1, scale: 1 }}

                 exit={{ opacity: 0, scale: 0.9 }}

                 onClick={e => e.stopPropagation()}

               >

                  <div className={styles.modalHeader} style={{ background: 'transparent', padding: '32px 32px 0 32px', borderBottom: 'none' }}>

                     <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: 'var(--modal-text-color, white)' }}>Asignar Nuevo Responsable de Gobierno</h2>

                     <button onClick={() => setIsAssignModalOpen(false)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'var(--modal-text-color, white)', cursor: 'pointer', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><XCircle size={18} /></button>

                  </div>

                  <div style={{ padding: '32px', overflowY: 'auto' }}>

                    <div style={{ marginBottom: '16px' }}>

                       <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#94a3b8', fontSize: '0.9rem' }}>Seleccionar Usuario</label>

                       <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>

                         <select 

                           style={{ flex: 1, padding: '14px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: '#1e293b', color: '#e2e8f0', fontSize: '1rem', outline: 'none' }}

                           value={newMember.name}

                           onChange={e => {

                             const user = tenantUsers.find(u => u.name === e.target.value);

                             if (user) {

                               setNewMember({ ...newMember, name: user.name, email: user.email, avatar: user.avatar || '' });

                             } else {

                               setNewMember({ ...newMember, name: e.target.value });

                             }

                           }}

                         >

                           <option value="" style={{ color: '#94a3b8', background: '#1e293b' }}>Seleccione un usuario...</option>

                           {tenantUsers.map(u => (

                             <option key={u.id} value={u.name} style={{ color: '#e2e8f0', background: '#1e293b' }}>{u.name} {members.some(m => m.name === u.name) ? '(Ya asignado)' : ''}</option>

                           ))}

                         </select>

                         {newMember.name && (

                           <div style={{ width: '52px', height: '52px', borderRadius: '14px', overflow: 'hidden', flexShrink: 0, background: 'linear-gradient(135deg, #6366f1, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800 }}>

                             {newMember.avatar && newMember.avatar.startsWith('http') ? (

                               <img src={newMember.avatar} alt={newMember.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />

                             ) : (

                               newMember.name.charAt(0).toUpperCase()

                             )}

                           </div>

                         )}

                       </div>

                    </div>



                    <div style={{ marginBottom: '16px', padding: '16px', background: 'rgba(255,255,255,0.04)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)' }}>

                       <label style={{ display: 'block', marginBottom: '12px', fontWeight: 600, color: '#94a3b8', fontSize: '0.9rem' }}>📸 Foto de Perfil</label>

                       <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>

                         <div style={{ width: '72px', height: '72px', borderRadius: '16px', overflow: 'hidden', flexShrink: 0, background: 'linear-gradient(135deg, #6366f1, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1.8rem', fontWeight: 800 }}>

                           {newMember.avatar && newMember.avatar.startsWith('http') ? (

                             <img src={newMember.avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />

                           ) : (

                             <span>{newMember.name ? newMember.name.charAt(0).toUpperCase() : '?'}</span>

                           )}

                         </div>

                         <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>

                           <label style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '10px', border: '1px dashed rgba(99,102,241,0.5)', cursor: 'pointer', background: 'rgba(99,102,241,0.07)', color: '#a5b4fc', fontSize: '0.85rem', fontWeight: 600 }}>

                             {isUploadingAvatar ? '⏳ Subiendo...' : '📁 Subir imagen desde mi equipo'}

                             <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarUpload} disabled={isUploadingAvatar} />

                           </label>

                           <input

                             type="url"

                             placeholder="O pega una URL de imagen..."

                             style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'white', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' }}

                             value={newMember.avatar}

                             onChange={e => setNewMember({ ...newMember, avatar: e.target.value })}

                           />

                         </div>

                       </div>

                    </div>



                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>

                       <div>

                          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#94a3b8', fontSize: '0.9rem' }}>Rol de Gobierno</label>

                          <select 

                             style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: '#1e293b', color: '#e2e8f0', fontSize: '1rem', outline: 'none' }}

                             value={newMember.roleType}

                             onChange={e => setNewMember({...newMember, roleType: e.target.value as any})}

                           >

                              <option value="Data Owner" style={{ color: '#e2e8f0', background: '#1e293b' }}>Data Owner</option>

                              <option value="Data Steward" style={{ color: '#e2e8f0', background: '#1e293b' }}>Data Steward</option>

                              <option value="Data Custodian" style={{ color: '#e2e8f0', background: '#1e293b' }}>Data Custodian</option>

                              <option value="Auditor" style={{ color: '#e2e8f0', background: '#1e293b' }}>Auditor</option>

                              <option value="CISO" style={{ color: '#e2e8f0', background: '#1e293b' }}>CISO</option>

                              <option value="CDO" style={{ color: '#e2e8f0', background: '#1e293b' }}>CDO</option>

                           </select>

                       </div>

                       <div>

                          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#94a3b8', fontSize: '0.9rem' }}>Área / Departamento</label>

                          <input 

                            type="text" 

                            style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'var(--modal-text-color, white)', fontSize: '1rem', outline: 'none' }}

                            value={newMember.area}

                            onChange={e => setNewMember({...newMember, area: e.target.value})}

                            placeholder="Ej: Operaciones"

                          />

                       </div>

                    </div>

                    <div style={{ marginBottom: '24px' }}>

                       <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#94a3b8', fontSize: '0.9rem' }}>Correo Electrónico</label>

                       <input 

                         type="email" 

                         className={styles.modalInput}

                         value={newMember.email}

                         onChange={e => setNewMember({...newMember, email: e.target.value})}

                         placeholder="roberto@empresa.com"

                       />

                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>

                       <button className={styles.secondaryBtn} onClick={() => setIsAssignModalOpen(false)}>Cancelar</button>

                       <button className={styles.primaryBtn} onClick={handleAddMember} disabled={isUploadingAvatar}>{isUploadingAvatar ? 'Subiendo foto...' : 'Confirmar Asignación'}</button>

                    </div>

                 </div>

              </motion.div>

           </div>

         )}

       </AnimatePresence>



       {/* Modal: Editar Responsable */}

       <AnimatePresence>

         {isEditMemberModalOpen && (

           <div className={styles.modalOverlay} onClick={() => setIsEditMemberModalOpen(false)} style={{ zIndex: 10000 }}>

              <motion.div 

                 className={styles.assignModal}

                 style={{ 

                   maxWidth: '700px', width: '90%', display: 'flex', flexDirection: 'column', 

                   background: 'var(--modal-bg, rgba(15, 23, 42, 0.85))', 

                   backdropFilter: 'blur(var(--modal-blur, 24px))', 

                   WebkitBackdropFilter: 'blur(var(--modal-blur, 24px))',

                   border: '1px solid rgba(255,255,255,0.1)',

                   borderRadius: '32px', 

                   color: 'var(--modal-text-color, white)', 

                   boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',

                 }}

                 initial={{ opacity: 0, scale: 0.9 }}

                 animate={{ opacity: 1, scale: 1 }}

                 exit={{ opacity: 0, scale: 0.9 }}

                 onClick={e => e.stopPropagation()}

               >

                  <div className={styles.modalHeader} style={{ background: 'transparent', padding: '32px 32px 0 32px', borderBottom: 'none' }}>

                     <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>Editar Perfil de Gobierno</h2>

                     <button onClick={() => setIsEditMemberModalOpen(false)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', cursor: 'pointer', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><XCircle size={18} /></button>

                  </div>

                  <div style={{ padding: '32px', overflowY: 'auto', maxHeight: 'calc(90vh - 100px)' }}>

                     {/* Avatar Section */}
                     <div style={{ marginBottom: '24px', padding: '20px', background: 'rgba(99,102,241,0.08)', borderRadius: '20px', border: '1px solid rgba(99,102,241,0.2)' }}>
                       <label style={{ display: 'block', marginBottom: '12px', fontWeight: 700, color: '#a5b4fc', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>📸 Foto de Perfil</label>
                       <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                         <div style={{ width: '80px', height: '80px', borderRadius: '20px', overflow: 'hidden', flexShrink: 0, background: 'linear-gradient(135deg, #6366f1, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '2rem', fontWeight: 800, boxShadow: '0 8px 24px rgba(99,102,241,0.4)' }}>
                           {newMember.avatar && newMember.avatar.startsWith('http') ? (
                             <img src={newMember.avatar} alt="avatar preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                           ) : (
                             <span>{newMember.name ? newMember.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2) : '?'}</span>
                           )}
                         </div>
                         <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                           <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 18px', borderRadius: '12px', border: '1px dashed rgba(99,102,241,0.5)', cursor: isUploadingAvatar ? 'not-allowed' : 'pointer', background: 'rgba(99,102,241,0.08)', color: '#a5b4fc', fontSize: '0.88rem', fontWeight: 600, transition: 'all 0.2s' }}>
                             <Upload size={16} />
                             {isUploadingAvatar ? '⏳ Subiendo imagen...' : 'Subir imagen desde mi equipo'}
                             <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarUpload} disabled={isUploadingAvatar} />
                           </label>
                           <input
                             type="url"
                             placeholder="O pega una URL de imagen directa..."
                             style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'white', fontSize: '0.88rem', outline: 'none', boxSizing: 'border-box' }}
                             value={newMember.avatar}
                             onChange={e => setNewMember({ ...newMember, avatar: e.target.value })}
                           />
                         </div>
                       </div>
                     </div>

                    <div style={{ marginBottom: '16px' }}>
                       <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#94a3b8', fontSize: '0.9rem' }}>Nombre de Usuario</label>

                       <input 

                         type="text" 

                         style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'white', fontSize: '1rem', outline: 'none' }}

                         value={newMember.name}

                         onChange={e => setNewMember({...newMember, name: e.target.value})}

                       />

                    </div>

                    <div style={{ marginBottom: '16px' }}>

                       <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#94a3b8', fontSize: '0.9rem' }}>Correo Electrónico</label>

                       <input 

                         type="email" 

                         style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'white', fontSize: '1rem', outline: 'none' }}

                         value={newMember.email}

                         onChange={e => setNewMember({...newMember, email: e.target.value})}

                         placeholder="correo@empresa.com"

                       />

                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>

                       <div>

                          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#94a3b8', fontSize: '0.9rem' }}>Rol de Gobierno</label>

                          <select 

                             style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: '#1e293b', color: '#e2e8f0', fontSize: '1rem', outline: 'none' }}

                             value={newMember.roleType}

                             onChange={e => setNewMember({...newMember, roleType: e.target.value as any})}

                           >

                              <option value="Data Owner">Data Owner</option>

                              <option value="Data Steward">Data Steward</option>

                              <option value="Data Custodian">Data Custodian</option>

                              <option value="Auditor">Auditor</option>

                              <option value="CISO">CISO</option>

                              <option value="CDO">CDO</option>

                           </select>

                       </div>

                       <div>
                          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#94a3b8', fontSize: '0.9rem' }}>Área / Departamento</label>
                          <input 
                            type="text" 
                            style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'white', fontSize: '1rem', outline: 'none' }}
                            value={newMember.area}
                            onChange={e => setNewMember({...newMember, area: e.target.value})}
                          />
                       </div>
                    </div>

                    <div style={{ marginBottom: '16px', padding: '16px', background: 'rgba(255,255,255,0.04)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)' }}>
                       <label style={{ display: 'block', marginBottom: '12px', fontWeight: 600, color: '#94a3b8', fontSize: '0.9rem' }}>📸 Foto de Perfil</label>
                       <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                         <div style={{ width: '72px', height: '72px', borderRadius: '16px', overflow: 'hidden', flexShrink: 0, background: 'linear-gradient(135deg, #6366f1, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1.8rem', fontWeight: 800 }}>
                           {newMember.avatar && newMember.avatar.startsWith('http') ? (
                             <img src={newMember.avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                           ) : (
                             <span>{newMember.name ? newMember.name.charAt(0).toUpperCase() : '?'}</span>
                           )}
                         </div>
                         <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                           <label style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '10px', border: '1px dashed rgba(99,102,241,0.5)', cursor: 'pointer', background: 'rgba(99,102,241,0.07)', color: '#a5b4fc', fontSize: '0.85rem', fontWeight: 600 }}>
                             {isUploadingAvatar ? '⏳ Subiendo...' : '📁 Subir imagen desde mi equipo'}
                             <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarUpload} disabled={isUploadingAvatar} />
                           </label>
                           <input
                             type="url"
                             placeholder="O pega una URL de imagen..."
                             style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'white', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' }}
                             value={newMember.avatar}
                             onChange={e => setNewMember({ ...newMember, avatar: e.target.value })}
                           />
                         </div>
                       </div>
                    </div>

                    {selectedMember && (
                       <div style={{ marginBottom: '24px', padding: '20px', background: 'rgba(239,68,68,0.06)', borderRadius: '20px', border: '1px solid rgba(239,68,68,0.15)' }}>
                         <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', fontWeight: 700, color: '#fca5a5', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                           <AlertTriangle size={16} style={{ color: '#f87171' }} /> Incidentes Recientes Asignados
                         </label>
                         <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '180px', overflowY: 'auto' }}>
                            {selectedMember.assignments.incidents && selectedMember.assignments.incidents.length > 0 ? (
                              selectedMember.assignments.incidents.map((incident: any, i: number) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', borderRadius: '12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', fontSize: '0.9rem', color: '#e2e8f0' }}>
                                   <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '24px', height: '24px', borderRadius: '50%', background: incident.severity === 'alta' || incident.severity === 'Crítico' ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.2)', color: incident.severity === 'alta' || incident.severity === 'Crítico' ? '#f87171' : '#f59e0b', fontSize: '0.75rem', fontWeight: 700 }}>
                                     !
                                   </div>
                                   <div style={{ flex: 1 }}>
                                     <span style={{ fontWeight: 600 }}>{incident.issue_type}</span>
                                     <span style={{ color: '#94a3b8', margin: '0 4px' }}>en</span>
                                     <span style={{ color: '#a5b4fc', fontWeight: 500 }}>{incident.asset_name}</span>
                                   </div>
                                   <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '2px 8px', borderRadius: '6px', background: incident.severity === 'alta' || incident.severity === 'Crítico' ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)', color: incident.severity === 'alta' || incident.severity === 'Crítico' ? '#f87171' : '#f59e0b', textTransform: 'uppercase' }}>
                                     {incident.severity}
                                   </span>
                                </div>
                              ))
                            ) : (
                              <div style={{ color: '#94a3b8', fontSize: '0.88rem', padding: '8px', textAlign: 'center' }}>No hay incidentes abiertos asignados to este miembro.</div>
                            )}
                         </div>
                       </div>
                     )}

                     <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>

                        <button className={styles.dangerBtn} style={{ marginRight: 'auto' }} onClick={() => selectedMember && handleDeleteMember(selectedMember.id)}>

                           Eliminar Miembro

                        </button>

                        <button className={styles.secondaryBtn} onClick={() => setIsEditMemberModalOpen(false)}>Cancelar</button>

                        <button className={styles.primaryBtn} onClick={handleUpdateMember} disabled={isUploadingAvatar}>{isUploadingAvatar ? 'Subiendo...' : 'Guardar Cambios'}</button>

                    </div>

                 </div>

              </motion.div>

           </div>

         )}

       </AnimatePresence>



       {/* Modal: Crear Dominio */}

       <AnimatePresence>

         {isDomainModalOpen && (

           <div className={styles.modalOverlay} onClick={() => setIsDomainModalOpen(false)}>

              <motion.div 

                 className={styles.assignModal}

                 style={{ 

                   maxWidth: '700px', width: '90%', maxHeight: '90vh', display: 'flex', flexDirection: 'column', 

                   background: 'var(--modal-bg, rgba(15, 23, 42, 0.85))', 

                   backdropFilter: 'blur(var(--modal-blur, 24px))', 

                   WebkitBackdropFilter: 'blur(var(--modal-blur, 24px))',

                   fontFamily: 'var(--modal-font, inherit)',

                   border: '1px solid rgba(255,255,255,0.1)',

                   borderRadius: '32px', 

                   color: 'var(--modal-text-color, white)', 

                   boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',

                   overflow: 'hidden' 

                 }}

                 initial={{ opacity: 0, scale: 0.9 }}

                 animate={{ opacity: 1, scale: 1 }}

                 exit={{ opacity: 0, scale: 0.9 }}

                 onClick={e => e.stopPropagation()}

               >

                   <div className={styles.modalHeader} style={{ background: 'transparent', padding: '32px 32px 0 32px', borderBottom: 'none' }}>

                      <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: 'var(--modal-text-color, white)' }}>

                        {editingDomainId ? 'Editar Dominio de Datos' : 'Crear Nuevo Dominio de Datos'}

                      </h2>

                      <button onClick={closeDomainModal} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'var(--modal-text-color, white)', cursor: 'pointer', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><XCircle size={18} /></button>

                   </div>

                   <div style={{ padding: '32px', overflowY: 'auto' }}>

                     <div style={{ marginBottom: '16px' }}>

                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#94a3b8', fontSize: '0.9rem' }}>Nombre del Dominio</label>

                        <input 

                          type="text" 

                          className={styles.modalInput} 

                          value={newDomain.name}

                          onChange={e => setNewDomain({...newDomain, name: e.target.value})}

                          placeholder="Ej: Logística, Operaciones"

                        />

                     </div>

                     <div style={{ marginBottom: '16px' }}>

                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#94a3b8', fontSize: '0.9rem' }}>Descripción</label>

                        <input 

                          type="text" 

                          className={styles.modalInput} 

                          value={newDomain.description}

                          onChange={e => setNewDomain({...newDomain, description: e.target.value})}

                          placeholder="Descripción de los datos que abarca"

                        />

                     </div>

                     <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>

                        <div>

                           <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#94a3b8', fontSize: '0.9rem' }}>Data Owner</label>

                           <select 

                             style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: '#1e293b', color: '#e2e8f0', fontSize: '1rem', outline: 'none' }}

                             value={newDomain.owner}

                             onChange={e => setNewDomain({...newDomain, owner: e.target.value})}

                           >

                              <option value="Por definir" style={{ color: '#e2e8f0', background: '#1e293b' }}>Por definir</option>

                              {members.map(m => (

                                <option key={m.id} value={m.name} style={{ color: '#e2e8f0', background: '#1e293b' }}>{m.name} ({m.roleType})</option>

                              ))}

                           </select>

                        </div>

                        <div>

                           <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#94a3b8', fontSize: '0.9rem' }}>Data Steward</label>

                           <select 

                             style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: '#1e293b', color: '#e2e8f0', fontSize: '1rem', outline: 'none' }}

                             value={newDomain.steward}

                             onChange={e => setNewDomain({...newDomain, steward: e.target.value})}

                           >

                              <option value="Por definir" style={{ color: '#e2e8f0', background: '#1e293b' }}>Por definir</option>

                              {members.map(m => (

                                <option key={m.id} value={m.name} style={{ color: '#e2e8f0', background: '#1e293b' }}>{m.name} ({m.roleType})</option>

                              ))}

                           </select>

                        </div>

                        <div>

                           <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#94a3b8', fontSize: '0.9rem' }}>Data Custodian</label>

                           <select 

                             style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: '#1e293b', color: '#e2e8f0', fontSize: '1rem', outline: 'none' }}

                             value={newDomain.custodian}

                             onChange={e => setNewDomain({...newDomain, custodian: e.target.value})}

                           >

                              <option value="Por definir" style={{ color: '#e2e8f0', background: '#1e293b' }}>Por definir</option>

                              {members.map(m => (

                                <option key={m.id} value={m.name} style={{ color: '#e2e8f0', background: '#1e293b' }}>{m.name} ({m.roleType})</option>

                              ))}

                           </select>

                        </div>

                     </div>

                     <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>

                        <button className={styles.secondaryBtn} onClick={closeDomainModal}>Cancelar</button>

                        <button className={styles.primaryBtn} onClick={e => { e.stopPropagation(); handleAddDomain(); }}>Guardar Dominio</button>

                     </div>

                  </div>

               </motion.div>

            </div>

          )}

        </AnimatePresence>



       {/* Modal: Organigrama */}

       <AnimatePresence>

         {isOrgChartModalOpen && (

           <div className={styles.modalOverlay} onClick={() => setIsOrgChartModalOpen(false)}>

              <motion.div 

                className={styles.orgChartModal}

                initial={{ opacity: 0, y: 20 }}

                animate={{ opacity: 1, y: 0 }}

                exit={{ opacity: 0, y: 20 }}

                onClick={e => e.stopPropagation()}

              >

                 <div className={styles.modalHeader} style={{ background: '#1e293b', color: 'white', padding: '24px' }}>

                    <h2 style={{ margin: 0, fontSize: '1.25rem', color: 'white' }}>Jerarquía del Modelo Operativo</h2>

                    <button onClick={() => setIsOrgChartModalOpen(false)} style={{ background: 'transparent', border: 'none', color: 'white' }}><XCircle size={20} /></button>

                 </div>

                 <div style={{ padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '32px' }}>

                    {/* CDO */}

                    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>

                      {members.filter(m => m.roleType === 'CDO').length === 0 ? (

                        <div className={styles.orgNode} data-role="CDO">

                          <div style={{ width: '40px', height: '40px', borderRadius: '50%', marginBottom: '8px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '1.2rem', fontWeight: 800 }}>?</div>

                          <strong>CDO</strong>

                          <span>Vacante</span>

                        </div>

                      ) : (

                        members.filter(m => m.roleType === 'CDO').map(cdo => (

                          <div key={cdo.id} className={styles.orgNode} data-role="CDO">

                             <div style={{ width: '40px', height: '40px', borderRadius: '50%', marginBottom: '8px', backgroundImage: cdo.avatar ? `url(${cdo.avatar})` : `url(https://api.dicebear.com/9.x/avataaars/svg?seed=${cdo.name.replace(' ', '')})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />

                             <strong>CDO</strong>

                             <span>{cdo.name}</span>

                          </div>

                        ))

                      )}

                    </div>

                    

                    <div className={styles.orgLine} />



                    {/* Owners */}

                    <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap', justifyContent: 'center' }}>

                      {members.filter(m => m.roleType === 'Data Owner').length === 0 ? (

                        <span style={{ color: '#94a3b8' }}>Sin Data Owners asignados</span>

                      ) : (

                        members.filter(m => m.roleType === 'Data Owner').map(owner => (

                          <div key={owner.id} className={styles.orgNode} data-role="Data Owner">

                             <div style={{ width: '40px', height: '40px', borderRadius: '50%', marginBottom: '8px', backgroundImage: owner.avatar ? `url(${owner.avatar})` : `url(https://api.dicebear.com/9.x/avataaars/svg?seed=${owner.name.replace(' ', '')})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />

                             <strong>Data Owner</strong>

                             <span>{owner.name}</span>

                          </div>

                        ))

                      )}

                    </div>



                    <div className={styles.orgLine} />



                    {/* Stewards, Custodians & Auditors */}

                    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>

                      {members.filter(m => m.roleType !== 'CDO' && m.roleType !== 'Data Owner').length === 0 ? (

                        <span style={{ color: '#94a3b8' }}>Sin responsables técnicos asignados</span>

                      ) : (

                        members.filter(m => m.roleType !== 'CDO' && m.roleType !== 'Data Owner').map(member => (

                          <div key={member.id} className={styles.orgNode} data-role={member.roleType}>

                             <div style={{ width: '40px', height: '40px', borderRadius: '50%', marginBottom: '8px', backgroundImage: member.avatar ? `url(${member.avatar})` : `url(https://api.dicebear.com/9.x/avataaars/svg?seed=${member.name.replace(' ', '')})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />

                             <strong>{member.roleType.split(' ')[1] || member.roleType}</strong>

                             <span>{member.name}</span>

                          </div>

                        ))

                      )}

                    </div>

                 </div>

              </motion.div>

           </div>

         )}

       </AnimatePresence>



      {/* KPI Explainer Modal */}

      <AnimatePresence>

        {selectedKPI && (

          <div className={styles.modalOverlay} onClick={() => setSelectedKPI(null)}>

            <motion.div 

              className={styles.modalContent}

              style={{ maxWidth: '500px', padding: 0, overflow: 'hidden' }}

              initial={{ opacity: 0, scale: 0.95 }}

              animate={{ opacity: 1, scale: 1 }}

              exit={{ opacity: 0, scale: 0.95 }}

              onClick={e => e.stopPropagation()}

            >

              <div style={{ padding: '24px 32px', background: selectedKPI.color, color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>

                   <div style={{ padding: '10px', background: 'rgba(255,255,255,0.2)', borderRadius: '12px', display: 'flex' }}>

                     <Award size={24} />

                   </div>

                   <h3 style={{ margin: 0, color: 'white', fontSize: '1.2rem', fontWeight: 800 }}>{selectedKPI.label}</h3>

                </div>

                <button onClick={() => setSelectedKPI(null)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', padding: '8px', borderRadius: '10px', cursor: 'pointer', color: 'white', display: 'flex' }}>

                   <X size={20} />

                </button>

              </div>

              <div style={{ padding: '32px' }}>

                 <p style={{ fontSize: '1.05rem', lineHeight: 1.6, color: '#475569', margin: 0 }}>

                   {selectedKPI.explanation}

                 </p>

                 <div style={{ marginTop: '24px', padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>

                    <Info size={20} color="#6366f1" style={{ flexShrink: 0 }} />

                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', lineHeight: 1.4 }}>

                      Este indicador refleja el estado del modelo operativo de gobierno y es calculado en base a las asignaciones de red activas.

                    </p>

                 </div>

              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', padding: '16px 32px', borderTop: '1px solid #e2e8f0', background: '#f8fafc', borderRadius: '0 0 24px 24px' }}>

                 <button className={styles.primaryBtn} onClick={() => setSelectedKPI(null)}>

                   Entendido

                 </button>

              </div>

            </motion.div>

          </div>

        )}

      </AnimatePresence>



      {/* Modal: Reasignar Responsabilidades */}

      <AnimatePresence>

        {isReassignModalOpen && selectedMember && (

          <div className={styles.modalOverlay} onClick={() => setIsReassignModalOpen(false)} style={{ zIndex: 10000 }}>

             <motion.div 

                className={styles.assignModal}

                style={{ 

                  maxWidth: '500px', width: '90%', display: 'flex', flexDirection: 'column', 

                  background: 'var(--modal-bg, rgba(15, 23, 42, 0.85))', 

                  backdropFilter: 'blur(var(--modal-blur, 24px))', 

                  WebkitBackdropFilter: 'blur(var(--modal-blur, 24px))',

                  border: '1px solid rgba(255,255,255,0.1)',

                  borderRadius: '24px', 

                  color: 'var(--modal-text-color, white)', 

                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',

                }}

                initial={{ opacity: 0, scale: 0.9 }}

                animate={{ opacity: 1, scale: 1 }}

                exit={{ opacity: 0, scale: 0.9 }}

                onClick={e => e.stopPropagation()}

              >

                 <div className={styles.modalHeader} style={{ background: 'transparent', padding: '24px 24px 0 24px', borderBottom: 'none' }}>

                    <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 700 }}>Reasignar Responsabilidades</h2>

                    <button onClick={() => setIsReassignModalOpen(false)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', cursor: 'pointer', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><XCircle size={18} /></button>

                 </div>

                 <div style={{ padding: '24px' }}>

                   <p style={{ margin: '0 0 16px 0', fontSize: '0.9rem', color: '#94a3b8' }}>

                     Transfiere todos los activos de datos, políticas y dominios asignados a <strong>{selectedMember.name}</strong> hacia otro miembro del equipo.

                   </p>

                   

                   <div style={{ marginBottom: '20px' }}>

                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#94a3b8', fontSize: '0.85rem' }}>Seleccionar Nuevo Responsable</label>

                      <select 

                         style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', background: '#1e293b', color: '#e2e8f0', fontSize: '0.95rem', outline: 'none' }}

                         value={reassignTargetId}

                         onChange={e => setReassignTargetId(e.target.value)}

                       >

                          <option value="">Seleccione un miembro...</option>

                          {members.filter(m => m.id !== selectedMember.id).map(m => (

                            <option key={m.id} value={m.id}>{m.name} ({m.role})</option>

                          ))}

                       </select>

                   </div>



                   <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>

                       <button className={styles.secondaryBtn} onClick={() => setIsReassignModalOpen(false)}>Cancelar</button>

                       <button 

                          className={styles.primaryBtn} 

                          onClick={handleReassign}

                          disabled={!reassignTargetId}

                        >

                          Confirmar Reasignación

                       </button>

                   </div>

                 </div>

             </motion.div>

          </div>

        )}

      </AnimatePresence>

    </div>

  );

}



function Plus({ size, style }: { size: number, style?: any }) {

  return (

    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>

      <path d="M5 12h14" /><path d="M12 5v14" />

    </svg>

  );

}

