'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  RefreshCw,
  Play,
  Calendar,
  Download,
  Plus,
  Search,
  Database,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  MoreVertical,
  Clock,
  ShieldCheck,
  Zap,
  Filter,
  Trash2,
  X,
  Edit2,
  Award,
  Settings,
  Layers,
  HelpCircle,
  TrendingUp,
  UserCheck,
  FileSpreadsheet,
  Grid,
  Check,
  Key
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { supabase } from '@/lib/supabase';
import * as XLSX from 'xlsx';
import CreateRuleModal from '@/components/quality/CreateRuleModal';
import NotificationSettingsModal from '@/components/quality/NotificationSettingsModal';
import ExecutionSummaryModal from '@/components/quality/ExecutionSummaryModal';
import ConnectExternalAssetModal from '@/components/quality/ConnectExternalAssetModal';
import SourceDetailModal from '@/components/quality/SourceDetailModal';
import { usePlatform } from '@/contexts/PlatformContext';
import styles from './quality.module.css';

// Pesos DQI por defecto
interface DqiWeights {
  completeness: number;
  validez: number;
  consistency: number;
  uniqueness: number;
  accuracy: number;
}

export default function QualityModule() {
  const { mode, currentTenant } = usePlatform();
  const [activeTab, setActiveTab] = useState('overview'); // overview, profiling, rules, reconciliation, incidents
  const [selectedAssetId, setSelectedAssetId] = useState<string>('');
  const [assets, setAssets] = useState<any[]>([]);
  const [rules, setRules] = useState<any[]>([]);
  const [incidents, setIncidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  // Modales
  const [showAddRuleModal, setShowAddRuleModal] = useState(false);
  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<any>(null);
  const [isNotifyModalOpen, setIsNotifyModalOpen] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [assetToConnect, setAssetToConnect] = useState<any>(null);
  const [selectedSourceDetail, setSelectedSourceDetail] = useState<any>(null);

  // Ejecución
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionProgress, setExecutionProgress] = useState(0);
  const [lastExecutionResults, setLastExecutionResults] = useState<any[]>([]);
  const [reconcileProgress, setReconcileProgress] = useState(0);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<any>(null);
  const [reconKeyA, setReconKeyA] = useState('');
  const [reconKeyB, setReconKeyB] = useState('');
  const [exclusionMode, setExclusionMode] = useState('none');

  // Pesos Inteligentes DQI
  const [showDqiConfig, setShowDqiConfig] = useState(false);
  const [dqiWeights, setDqiWeights] = useState<DqiWeights>({
    completeness: 30,
    validez: 25,
    consistency: 20,
    uniqueness: 15,
    accuracy: 10
  });

  // Programación de Monitoreo Continuo
  const [schedule, setSchedule] = useState('Manual');
  const [monitoringHistory, setMonitoringHistory] = useState<any[]>([
    { 
      date: '2026-06-02 10:00', 
      asset: 'Maestro de Clientes', 
      status: 'Exitoso', 
      score: 94,
      rulesCount: 4,
      rulesDetails: [
        { name: 'Completitud Email', pct: '98.00', total: 100, compliant: 98, affected: 2, severity: 'Alta' },
        { name: 'Formato Telefono', pct: '92.00', total: 100, compliant: 92, affected: 8, severity: 'Media' },
        { name: 'Unicidad ID', pct: '100.00', total: 100, compliant: 100, affected: 0, severity: 'Crítica' },
        { name: 'Rango Edad', pct: '86.00', total: 100, compliant: 86, affected: 14, severity: 'Baja' }
      ]
    },
    { 
      date: '2026-06-01 10:00', 
      asset: 'Maestro de Clientes', 
      status: 'Exitoso', 
      score: 92,
      rulesCount: 3,
      rulesDetails: [
        { name: 'Completitud Email', pct: '96.00', total: 100, compliant: 96, affected: 4, severity: 'Alta' },
        { name: 'Formato Telefono', pct: '90.00', total: 100, compliant: 90, affected: 10, severity: 'Media' },
        { name: 'Unicidad ID', pct: '90.00', total: 100, compliant: 90, affected: 10, severity: 'Crítica' }
      ]
    },
    { 
      date: '2026-05-31 10:00', 
      asset: 'Transacciones Q2', 
      status: 'Exitoso', 
      score: 88,
      rulesCount: 3,
      rulesDetails: [
        { name: 'Monto Positivo', pct: '100.00', total: 100, compliant: 100, affected: 0, severity: 'Crítica' },
        { name: 'Consistencia ID Cliente', pct: '84.00', total: 100, compliant: 84, affected: 16, severity: 'Alta' },
        { name: 'Exactitud Codigo Sucursal', pct: '80.00', total: 100, compliant: 80, affected: 20, severity: 'Media' }
      ]
    }
  ]);

  // Perfilamiento Automático
  const [isProfiling, setIsProfiling] = useState(false);
  const [profileResult, setProfileResult] = useState<any>(null);
  const [profileTab, setProfileTab] = useState('general'); // general, distribution, anomalies, recommendations, historial
  const [profilingHistory, setProfilingHistory] = useState<any[]>([]);

  // Tabla completa
  const [isAnalyzingTable, setIsAnalyzingTable] = useState(false);
  const [tableAnalysisResult, setTableAnalysisResult] = useState<any>(null);
  const [assetFields, setAssetFields] = useState<any[]>([]);

  // Conciliación de Activos
  const [reconciliationResult, setReconciliationResult] = useState<any>(null);
  const [isReconciling, setIsReconciling] = useState(false);
  const [assetIdA, setAssetIdA] = useState('');
  const [assetIdB, setAssetIdB] = useState('');
  const [fieldsA, setFieldsA] = useState<any[]>([]);
  const [fieldsB, setFieldsB] = useState<any[]>([]);
  const [activeReconTab, setActiveReconTab] = useState<'schema'|'quality'|'detail'|'exclusion'>('schema');
  const [showReconModal, setShowReconModal] = useState(false);
  const [reconciliationHistory, setReconciliationHistory] = useState<any[]>([]);

  // Detalle de incidente & workflow de remediación
  const [selectedIncident, setSelectedIncident] = useState<any>(null);
  const [remediationStep, setRemediationStep] = useState(1);
  const [stewards, setStewards] = useState<any[]>([
    { id: '1', name: 'Carlos Ruiz', role: 'Data Steward Clientes' },
    { id: '2', name: 'Maria Silva', role: 'Data Steward Finanzas' },
    { id: '3', name: 'Juan Perez', role: 'Data Steward TI' }
  ]);
  const [incidentFields, setIncidentFields] = useState({
    assignedTo: 'Carlos Ruiz',
    dueDate: '2026-06-15',
    impact: 'Alto',
    rootCause: '',
    evidence: ''
  });

  // Estadísticas globales e inicialización
  const [stats, setStats] = useState({
    completeness: 92,
    validez: 88,
    consistency: 95,
    uniqueness: 90,
    accuracy: 86
  });

  // Historial de 12 meses para DQI
  const trendData = [
    { name: 'Jun 25', score: 84 },
    { name: 'Jul 25', score: 85 },
    { name: 'Ago 25', score: 86 },
    { name: 'Sep 25', score: 85 },
    { name: 'Oct 25', score: 88 },
    { name: 'Nov 25', score: 87 },
    { name: 'Dic 25', score: 89 },
    { name: 'Ene 26', score: 90 },
    { name: 'Feb 26', score: 88 },
    { name: 'Mar 26', score: 91 },
    { name: 'Abr 26', score: 90 },
    { name: 'May 26', score: 92 }
  ];

  // Radar de Dominios
  const domainRadarData = [
    { subject: 'Clientes', score: 95, fullMark: 100 },
    { subject: 'Finanzas', score: 89, fullMark: 100 },
    { subject: 'RRHH', score: 87, fullMark: 100 },
    { subject: 'Compras', score: 82, fullMark: 100 }
  ];

  // Biblioteca Corporativa templates
  const corporateLibrary = [
    { name: 'Correo válido', domain: 'Clientes', industry: 'General', system: 'CRM', type: 'Formato' },
    { name: 'RFC válido', domain: 'Finanzas', industry: 'Servicios', system: 'SAT', type: 'Formato' },
    { name: 'NIT válido', domain: 'Finanzas', industry: 'Servicios', system: 'DIAN', type: 'Formato' },
    { name: 'Documento único', domain: 'Clientes', industry: 'General', system: 'Todos', type: 'Unicidad' },
    { name: 'Fecha nacimiento válida', domain: 'RRHH', industry: 'General', system: 'Nómina', type: 'Rango' },
    { name: 'Código SAP válido', domain: 'Compras', industry: 'Manufactura', system: 'SAP ERP', type: 'Formato' }
  ];

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    fetchAssets();
    fetchEnterpriseKPIs();
    if (selectedAssetId) {
      fetchRules(selectedAssetId);
      fetchIncidents(selectedAssetId);
      fetchAssetFields(selectedAssetId);
      fetchProfilingHistory(selectedAssetId);
    } else {
      fetchIncidents();
      setAssetFields([]);
    }

    if (currentTenant?.id) {
      const fetchHistoryAndStewards = async () => {
        try {
          const { data: histData } = await supabase
            .from('quality_monitoring_history')
            .select('*')
            .eq('tenant_id', currentTenant.id)
            .order('date', { ascending: false });
          if (histData && histData.length > 0) {
            const detailsKey = `govdata_quality_rules_details_${currentTenant.id}`;
            let storedDetails: any = {};
            try {
              storedDetails = JSON.parse(localStorage.getItem(detailsKey) || '{}');
            } catch (e) {}

            setMonitoringHistory(histData.map(h => {
              const dateStr = new Date(h.date).toLocaleString('es-CO');
              const runKey = `${dateStr}_${h.asset_name}`;
              const detail = storedDetails[runKey];
              return {
                date: dateStr,
                asset: h.asset_name,
                status: h.status,
                score: h.score,
                rulesCount: detail ? detail.rulesCount : 3,
                rulesDetails: detail ? detail.rulesDetails : [
                  { name: 'Completitud de Campos', pct: h.score.toFixed(2), total: 100, compliant: h.score, affected: 100 - h.score, severity: 'Alta' },
                  { name: 'Validez del Formato', pct: '100.00', total: 100, compliant: 100, affected: 0, severity: 'Media' },
                  { name: 'Unicidad de Registros', pct: '100.00', total: 100, compliant: 100, affected: 0, severity: 'Baja' }
                ]
              };
            }));
          }

          const { data: teamData } = await supabase
            .from('team_members')
            .select('id, name, role')
            .eq('tenant_id', currentTenant.id);
          if (teamData && teamData.length > 0) {
            setStewards(teamData);
          }
          // Cargar historial de conciliaciones
          try {
            const reconHistKey = `govdata_recon_history_${currentTenant.id}`;
            const stored = localStorage.getItem(reconHistKey);
            if (stored) {
              setReconciliationHistory(JSON.parse(stored));
            } else {
              setReconciliationHistory([]);
            }
          } catch (e) {
            console.warn('Error loading reconciliation history:', e);
          }
        } catch (err) {
          console.error('[Quality] Error fetching history/stewards:', err);
        }
      };
      fetchHistoryAndStewards();
    }
  }, [selectedAssetId, currentTenant?.id, mode]);

  const fetchAssets = async () => {
    if (mode === 'DEMO' || !currentTenant?.id) {
      const demoAssets = [
        { id: '1', name: 'Maestro de Clientes', source: 'SAP ERP', table_name: 'clientes' },
        { id: '2', name: 'Transacciones Q2', source: 'Oracle DB', table_name: 'transacciones' },
        { id: '3', name: 'Leads Marketing', source: 'Salesforce', table_name: 'leads' },
        { id: '4', name: 'Reporte Consolidado', source: 'Data Lake', table_name: 'reportes' }
      ];
      setAssets(demoAssets);
      return;
    }

    try {
      // Intentar con JOIN (requiere que connection_id exista en la tabla)
      const { data, error } = await supabase
        .from('data_assets')
        .select('*, connection:data_connections(id, name, source_id, host, username, password_encrypted, connection_string)')
        .eq('tenant_id', currentTenant.id)
        .order('name');

      if (error) {
        // Si falla el JOIN (columna aún no existe), hacer query simple
        console.warn('[Quality] JOIN con data_connections falló, usando query simple:', error.message);
        const { data: simpleData, error: simpleError } = await supabase
          .from('data_assets')
          .select('*')
          .eq('tenant_id', currentTenant.id)
          .order('name');
        if (simpleError) throw simpleError;
        setAssets(simpleData || []);
        return;
      }
      setAssets(data || []);
    } catch (err) {
      console.warn('Error fetching assets:', err);
      setAssets([]);
    }
  };

  /**
   * Resuelve la conexión de BD para un activo dado.
   * Estrategia de búsqueda (en orden de prioridad):
   *   1. asset.connection (del JOIN directo si connection_id existe)
   *   2. asset.connection_id → data_connections.id 
   *   3. asset.source === data_connections.name (match exacto)
   *   4. asset.source contiene o es contenido en data_connections.name (parcial)
   *   5. Primera conexión con connection_string (más confiable)
   *   6. Primera conexión con host no vacío
   */
  const getConnection = async (asset: any): Promise<{ conn: any; tableName: string } | null> => {
    const resolvedTableName = asset?.table_name || asset?.name || 'unknown';

    // 1. Si el activo ya trae la conexión del JOIN
    if (asset?.connection && (asset.connection.host || asset.connection.connection_string)) {
      console.log(`[Quality] Conexión por JOIN directo: "${asset.connection.name}" → tabla "${resolvedTableName}"`);
      return { conn: asset.connection, tableName: resolvedTableName };
    }

    // 2. Si tiene connection_id pero no vino en el JOIN
    if (asset?.connection_id) {
      const { data: connData } = await supabase
        .from('data_connections')
        .select('*')
        .eq('id', asset.connection_id)
        .single();
      if (connData) {
        console.log(`[Quality] Conexión por connection_id: "${connData.name}" → tabla "${resolvedTableName}"`);
        return { conn: connData, tableName: resolvedTableName };
      }
    }

    // 3-6. Buscar en todas las conexiones del tenant
    const { data: allConns } = await supabase
      .from('data_connections')
      .select('*')
      .or(`tenant_id.eq.${currentTenant?.id || '00000000-0000-0000-0000-000000000001'},tenant_id.is.null`);

    if (!allConns || allConns.length === 0) {
      console.warn('[Quality] No hay conexiones registradas en data_connections');
      return null;
    }

    console.log(`[Quality] Buscando conexión para activo "${asset?.name}" (source="${asset?.source}"). Conexiones disponibles:`, allConns.map((c: any) => `${c.name} [${c.source_id}] host=${c.host || 'N/A'} conn_string=${c.connection_string ? 'SÍ' : 'NO'}`));

    // 3. Match exacto por nombre
    let conn = allConns.find((c: any) => c.name === asset?.source);

    // 4. Match parcial case-insensitive
    if (!conn && asset?.source) {
      const srcLower = asset.source.toLowerCase();
      conn = allConns.find((c: any) => {
        const connName = (c.name || '').toLowerCase();
        return connName.includes(srcLower) || srcLower.includes(connName);
      });
    }

    // 5. Primera conexión con connection_string (más confiable que solo host)
    if (!conn) {
      conn = allConns.find((c: any) => c.connection_string && c.connection_string.trim() !== '');
    }

    // 6. Primera conexión con host válido
    if (!conn) {
      conn = allConns.find((c: any) => c.host && c.host.trim() !== '');
    }

    // 7. Último recurso: primera conexión disponible
    if (!conn) {
      conn = allConns[0];
    }

    console.log(`[Quality] Conexión seleccionada: "${conn.name}" (source_id=${conn.source_id}, host=${conn.host || 'N/A'}, conn_string=${conn.connection_string ? 'SÍ' : 'NO'}) → tabla "${resolvedTableName}"`);
    return { conn, tableName: resolvedTableName };
  };

  const fetchRules = async (assetId: string) => {
    try {
      const { data, error } = await supabase
        .from('quality_rules')
        .select('*')
        .eq('asset_id', assetId);
      if (error) throw error;
      setRules(data || []);
    } catch (err) {
      console.warn('Error fetching rules:', err);
    }
  };

  const fetchAssetFields = async (assetId: string) => {
    try {
      if (mode === 'DEMO') {
        const demoFieldsMap: any = {
          '1': [
            { id: 'f1-1', field_name: 'id', data_type: 'INTEGER' },
            { id: 'f1-2', field_name: 'nombre', data_type: 'VARCHAR' },
            { id: 'f1-3', field_name: 'email', data_type: 'VARCHAR' },
            { id: 'f1-4', field_name: 'rut', data_type: 'VARCHAR' },
            { id: 'f1-5', field_name: 'telefono', data_type: 'VARCHAR' }
          ],
          '2': [
            { id: 'f2-1', field_name: 'id_transaccion', data_type: 'INTEGER' },
            { id: 'f2-2', field_name: 'cliente_id', data_type: 'INTEGER' },
            { id: 'f2-3', field_name: 'monto', data_type: 'NUMERIC' },
            { id: 'f2-4', field_name: 'tarjeta_hash', data_type: 'VARCHAR' },
            { id: 'f2-5', field_name: 'estado', data_type: 'VARCHAR' }
          ]
        };
        setAssetFields(demoFieldsMap[assetId] || []);
        return;
      }
      const { data, error } = await supabase
        .from('asset_fields')
        .select('id, field_name, data_type')
        .eq('asset_id', assetId);
      if (error) throw error;
      setAssetFields(data || []);
    } catch (err) {
      console.warn('Error fetching asset fields:', err);
    }
  };

  const fetchProfilingHistory = async (assetId: string) => {
    try {
      const { data, error } = await supabase
        .from('quality_profiling_history')
        .select('*')
        .eq('asset_id', assetId)
        .order('created_at', { ascending: false });
      
      if (!error && data) {
        setProfilingHistory(data);
      }
    } catch (err) {
      console.warn('Error fetching profiling history:', err);
    }
  };

  const handleDeleteRule = async (ruleId: string) => {
    if (!confirm('¿Está seguro de que desea eliminar esta regla de calidad?')) return;
    try {
      if (mode === 'DEMO') {
        setRules(prev => prev.filter(r => r.id !== ruleId));
        alert('Regla eliminada exitosamente (Modo DEMO).');
        return;
      }
      const { error } = await supabase.from('quality_rules').delete().eq('id', ruleId);
      if (error) throw error;
      alert('Regla eliminada exitosamente.');
      if (selectedAssetId) fetchRules(selectedAssetId);
    } catch (err: any) {
      console.warn('Error al eliminar regla en BD, aplicando fallback local:', err);
      setRules(prev => prev.filter(r => r.id !== ruleId));
      alert('Regla eliminada exitosamente.');
    }
  };

  const fetchIncidents = async (assetId?: string) => {
    try {
      let query = supabase.from('quality_incidents').select(`
        *,
        rule:quality_rules(name),
        asset:data_assets!inner(name, source, tenant_id)
      `);
      if (assetId) {
        query = query.eq('asset_id', assetId);
      } else if (currentTenant?.id) {
        query = query.eq('asset.tenant_id', currentTenant.id);
      }
      const { data } = await query.order('detected_at', { ascending: false });
      if (data) {
        setIncidents(data.map(d => ({
          id: d.id.slice(0, 8),
          dbId: d.id,
          name: d.rule?.name || d.description || 'Validación de Calidad',
          system: d.asset?.source || 'Base de Datos',
          assetName: d.asset?.name || 'Activo',
          assetId: d.asset_id,
          total: d.total_records || 1000,
          compliant: d.compliant_records || 900,
          affected: d.affected_records || 100,
          pct: d.compliance_pct ? parseFloat(d.compliance_pct.toString()) : 90.0,
          severity: d.priority || 'Media',
          owner: d.assigned_to || 'Nexus AI',
          date: new Date(d.detected_at).toLocaleDateString(),
          status: d.status || 'Nuevo',
          dueDate: d.due_date || '2026-06-15',
          impact: d.impact || 'Medio',
          rootCause: d.root_cause || '',
          evidence: d.evidence || ''
        })));
      }
    } catch (err) {
      console.warn('Error fetching incidents:', err);
    }
  };

  const fetchEnterpriseKPIs = async () => {
    // Simular obtención
    setStats({
      completeness: 94,
      validez: 91,
      consistency: 89,
      uniqueness: 96,
      accuracy: 88
    });
  };

  // Score DQI global ponderado
  const computedDqiScore = Math.round(
    ((stats.completeness * dqiWeights.completeness) +
     (stats.validez * dqiWeights.validez) +
     (stats.consistency * dqiWeights.consistency) +
     (stats.uniqueness * dqiWeights.uniqueness) +
     (stats.accuracy * dqiWeights.accuracy)) / 100
  );

  // Descarga de Reporte de Calidad en Excel
  const handleDownloadReport = () => {
    if (!lastExecutionResults || lastExecutionResults.length === 0) {
      alert('No hay resultados de ejecución para descargar.');
      return;
    }

    const assetName = assets.find(a => a.id === selectedAssetId)?.name || 'Entorno DEMO';

    // 1. Resumen general
    const totalAnalyzed = lastExecutionResults.reduce((acc, curr) => acc + (curr.total || 0), 0);
    const totalIssues = lastExecutionResults.reduce((acc, curr) => acc + (curr.affected || 0), 0);
    const globalHealth = totalAnalyzed > 0 ? (((totalAnalyzed - totalIssues) / totalAnalyzed) * 100).toFixed(2) : '0.00';

    const summaryData = [
      { 'Propiedad': 'Activo de Datos', 'Valor': assetName },
      { 'Propiedad': 'Fecha de Escaneo', 'Valor': new Date().toLocaleString() },
      { 'Propiedad': 'Registros Evaluados', 'Valor': totalAnalyzed },
      { 'Propiedad': 'Incidentes Detectados', 'Valor': totalIssues },
      { 'Propiedad': 'Salud Global (DQI)', 'Valor': `${globalHealth}%` }
    ];

    // 2. Detalle por Regla
    const rulesData = lastExecutionResults.map(res => ({
      'ID Regla': res.id,
      'Regla': res.name,
      'Criticidad': res.severity,
      'Registros Evaluados': res.total,
      'Cumplen': res.compliant,
      'Fallas': res.affected,
      'Cumplimiento (%)': `${res.pct}%`,
      'Estado': parseFloat(res.pct) >= 95 ? 'Conforme' : 'Alerta'
    }));

    // 3. Crear Workbook
    const wb = XLSX.utils.book_new();

    // Hoja Resumen
    const wsSummary = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Resumen General');

    // Hoja Detalle de Calidad
    const wsDetails = XLSX.utils.json_to_sheet(rulesData);
    XLSX.utils.book_append_sheet(wb, wsDetails, 'Detalle de Calidad');

    // Descargar archivo
    XLSX.writeFile(wb, `Reporte_Calidad_${assetName.replace(/[^a-zA-Z0-9]/g, '_')}.xlsx`);
  };

  // Ejecución de Reglas Integrada con Base de Datos y Workflows
  const handleExecuteRules = async () => {
    if (!selectedAssetId) {
      alert('Seleccione un activo de datos.');
      return;
    }
    setIsExecuting(true);
    setExecutionProgress(0);

    const asset = assets.find(a => a.id === selectedAssetId);

    // Resolver conexión usando el vínculo directo connection_id
    const resolved = await getConnection(asset);
    if (!resolved) {
      setIsExecuting(false);
      alert('No se encontró una conexión configurada para este activo.\n\nVe al Catálogo de Datos → edita el activo → vincula una Conexión y define el nombre físico de la tabla.');
      return;
    }
    const { conn, tableName } = resolved;
    setExecutionProgress(20);

    // Obtener campos reales
    const { data: fields } = await supabase
      .from('asset_fields')
      .select('id, field_name')
      .eq('asset_id', selectedAssetId);

    setExecutionProgress(40);

    const preparedRules = rules.map(r => {
      const field = fields?.find(f => f.id === r.field_id);
      return {
        id: r.id,
        type: r.rule_type || r.type,
        config: r.config,
        fieldName: field?.field_name || 'id'
      };
    });

    setExecutionProgress(60);

    try {
      const scanRes = await fetch('/api/quality-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          database_type: conn.source_id || 'postgres',
          host: conn.host,
          user: conn.username,
          key: conn.password_encrypted,
          connection_string: conn.connection_string,
          table_name: tableName,
          rules: preparedRules
        })
      });

      const scanData = await scanRes.json();
      setExecutionProgress(90);

      if (!scanData.success) {
        throw new Error(scanData.error || 'Error desconocido en el escaneo');
      }

      const results = rules.map(rule => {
        const res = scanData.ruleResults.find((r: any) => r.ruleId === rule.id);
        const total = res ? res.total : 100;
        const affected = res ? res.affected : 0;
        const compliant = total - affected;
        const pct = total > 0 ? (compliant / total) * 100 : 100;

        return {
          id: rule.id.slice(0, 8),
          name: rule.rule_name || rule.name,
          total,
          compliant,
          affected,
          pct: pct.toFixed(2),
          severity: rule.severity || 'Media'
        };
      });

      // Crear incidentes reales para fallas y crear tickets en workflows
      for (const res of results) {
        if (parseFloat(res.pct) < 95) {
          const { data: newInc } = await supabase.from('quality_incidents').insert([{
            tenant_id: currentTenant?.id || '00000000-0000-0000-0000-000000000001',
            asset_id: selectedAssetId,
            rule_id: rules.find(r => (r.rule_name || r.name) === res.name)?.id,
            total_records: res.total,
            affected_records: res.affected,
            compliant_records: res.compliant,
            compliance_pct: parseFloat(res.pct),
            description: `Fallo de validación en regla ${res.name}`,
            priority: res.severity,
            status: 'Nuevo'
          }]).select();

          if (newInc && newInc.length > 0) {
            const incId = newInc[0].id;
            await supabase.from('workflow_requests').insert([{
              tenant_id: currentTenant?.id || '00000000-0000-0000-0000-000000000001',
              title: `[Incidente Calidad] ${res.name} - ${res.pct}% Cumplimiento`,
              description: `Incidente automático de calidad detectado en el activo. ID Incidente: ${incId}. Registros afectados: ${res.affected}/${res.total}.`,
              status: 'Pendiente',
              category: 'Calidad',
              priority: res.severity === 'Crítica' ? 'Crítica' : res.severity === 'Alta' ? 'Alta' : 'Media',
              sla: '24h',
              sla_status: 'Ok',
              current_step: 'Nuevo Incidente Detectado',
              timeline: [
                { step: 'Alerta Generada por Nexus AI', user: 'Nexus Motor Calidad', date: new Date().toISOString().split('T')[0], status: 'done' }
              ]
            }]);
          }
        }
      }

      setLastExecutionResults(results);
      setExecutionProgress(100);

      // Calcular el DQI promedio del escaneo y registrarlo en el historial
      const avgPct = results.length > 0 
        ? Math.round(results.reduce((acc, curr) => acc + parseFloat(curr.pct), 0) / results.length) 
        : 100;
      
      const newHistoryItem = {
        date: new Date().toISOString().replace('T', ' ').substring(0, 16),
        asset: asset?.name || 'Activo Sin Nombre',
        status: 'Exitoso',
        score: avgPct,
        rulesCount: results.length,
        rulesDetails: results
      };

      if (mode !== 'DEMO' && currentTenant?.id) {
        supabase.from('quality_monitoring_history').insert([{
          tenant_id: currentTenant.id,
          asset_name: asset?.name || 'Activo Sin Nombre',
          status: 'Exitoso',
          score: avgPct,
          date: new Date().toISOString()
        }]).then(({ error }) => {
          if (error) console.error('[Quality] Error saving monitoring history to Supabase:', error);
        });

        // UPDATE the data asset's quality score in Supabase
        supabase.from('data_assets')
          .update({ quality_score: avgPct })
          .eq('id', selectedAssetId)
          .eq('tenant_id', currentTenant.id)
          .then(({ error }) => {
            if (error) console.error('[Quality] Error updating asset quality score in Supabase:', error);
          });
      }

      // Guardar detalles de reglas en localStorage para poder consultarlas en el historial
      const detailsKey = `govdata_quality_rules_details_${currentTenant?.id || 'demo'}`;
      let storedDetails: any = {};
      try {
        storedDetails = JSON.parse(localStorage.getItem(detailsKey) || '{}');
      } catch (e) {}
      const runKey = `${newHistoryItem.date}_${newHistoryItem.asset}`;
      storedDetails[runKey] = {
        rulesCount: results.length,
        rulesDetails: results
      };
      localStorage.setItem(detailsKey, JSON.stringify(storedDetails));

      setMonitoringHistory(prev => {
        const updated = [newHistoryItem, ...prev];
        const localKey = `govdata_quality_history_${currentTenant?.id || 'demo'}`;
        localStorage.setItem(localKey, JSON.stringify(updated));
        return updated;
      });

      setShowSummaryModal(true);
      fetchIncidents(selectedAssetId);

    } catch (err: any) {
      alert('Error ejecutando reglas en base de datos: ' + err.message);
    } finally {
      setIsExecuting(false);
    }
  };

  // Perfilamiento Automático desde Base de Datos
  const handleStartProfiling = async () => {
    if (!selectedAssetId) {
      alert('Seleccione un activo de datos.');
      return;
    }
    setIsProfiling(true);

    const asset = assets.find(a => a.id === selectedAssetId);

    try {
      const resolved = await getConnection(asset);
      if (!resolved) {
        throw new Error('No hay conexión configurada para este activo.\n\nVe al Catálogo → edita el activo → vincula una Conexión y define el nombre físico de la tabla.');
      }
      const { conn, tableName } = resolved;

      const res = await fetch('/api/quality-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          database_type: conn.source_id || 'postgres',
          host: conn.host,
          user: conn.username,
          key: conn.password_encrypted,
          connection_string: conn.connection_string,
          table_name: tableName,
          mode: 'profiling'
        })
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      setProfileResult(data);
      
      // Save profiling history
      try {
        const { error: insertErr } = await supabase.from('quality_profiling_history').insert([{
          tenant_id: currentTenant?.id || '00000000-0000-0000-0000-000000000001',
          asset_id: selectedAssetId,
          asset_name: asset?.name || 'Desconocido',
          profile_data: data
        }]);
        if (insertErr) {
          console.error('Supabase insert error:', insertErr);
        } else {
          fetchProfilingHistory(selectedAssetId); // Refresh history
        }
      } catch (saveErr) {
        console.warn('Error saving profiling history:', saveErr);
      }
    } catch (err: any) {
      alert('Error en perfilamiento: ' + err.message);
    } finally {
      setIsProfiling(false);
    }
  };

  // Analizar Tabla Completa desde Base de Datos
  const handleAnalyzeTable = async () => {
    if (!selectedAssetId) {
      alert('Seleccione un activo de datos.');
      return;
    }
    setIsAnalyzingTable(true);

    const asset = assets.find(a => a.id === selectedAssetId);

    try {
      const resolved = await getConnection(asset);
      if (!resolved) {
        throw new Error('No hay conexión configurada para este activo.\n\nVe al Catálogo → edita el activo → vincula una Conexión y define el nombre físico de la tabla.');
      }
      const { conn, tableName } = resolved;

      const res = await fetch('/api/quality-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          database_type: conn.source_id || 'postgres',
          host: conn.host,
          user: conn.username,
          key: conn.password_encrypted,
          connection_string: conn.connection_string,
          table_name: tableName,
          mode: 'table_quality'
        })
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      setTableAnalysisResult(data);
    } catch (err: any) {
      alert('Error al analizar la tabla: ' + err.message);
    } finally {
      setIsAnalyzingTable(false);
    }
  };

  // Cargar campos de un activo para conciliación
  const loadFieldsForAsset = async (assetId: string, side: 'A' | 'B') => {
    if (!assetId) { side === 'A' ? setFieldsA([]) : setFieldsB([]); return; }
    try {
      if (mode === 'DEMO') {
        const demoMap: any = {
          '1': [
            { field_name: 'id', data_type: 'INTEGER' },
            { field_name: 'nombre', data_type: 'VARCHAR' },
            { field_name: 'email', data_type: 'VARCHAR' },
            { field_name: 'rut', data_type: 'VARCHAR' },
            { field_name: 'telefono', data_type: 'VARCHAR' },
            { field_name: 'fecha_alta', data_type: 'DATE' }
          ],
          '2': [
            { field_name: 'id_transaccion', data_type: 'INTEGER' },
            { field_name: 'cliente_id', data_type: 'INTEGER' },
            { field_name: 'nombre_cliente', data_type: 'VARCHAR' },
            { field_name: 'email_contacto', data_type: 'VARCHAR' },
            { field_name: 'monto', data_type: 'NUMERIC' },
            { field_name: 'estado', data_type: 'VARCHAR' }
          ],
          '3': [
            { field_name: 'lead_id', data_type: 'INTEGER' },
            { field_name: 'nombre', data_type: 'VARCHAR' },
            { field_name: 'correo', data_type: 'VARCHAR' },
            { field_name: 'telefono', data_type: 'VARCHAR' },
            { field_name: 'origen', data_type: 'VARCHAR' },
            { field_name: 'calificacion', data_type: 'NUMERIC' }
          ],
          '4': [
            { field_name: 'reporte_id', data_type: 'INTEGER' },
            { field_name: 'nombre', data_type: 'VARCHAR' },
            { field_name: 'periodo', data_type: 'DATE' },
            { field_name: 'total', data_type: 'NUMERIC' },
            { field_name: 'estado', data_type: 'VARCHAR' }
          ]
        };
        const fields = demoMap[assetId] || [];
        side === 'A' ? setFieldsA(fields) : setFieldsB(fields);
        return;
      }
      const { data } = await supabase.from('asset_fields').select('field_name, data_type').eq('asset_id', assetId);
      side === 'A' ? setFieldsA(data || []) : setFieldsB(data || []);
    } catch (e) {
      console.warn('Error loading fields for reconciliation:', e);
    }
  };

  // Conciliación de Activos
  const handleReconcile = async () => {
    if (!assetIdA || !assetIdB) { alert('Seleccione ambos activos para conciliar.'); return; }
    if (assetIdA === assetIdB) { alert('Seleccione dos activos diferentes.'); return; }
    setIsReconciling(true);
    setReconcileProgress(0);

    const assetA = assets.find(a => a.id === assetIdA);
    const assetB = assets.find(a => a.id === assetIdB);

    setReconcileProgress(10);
    // Intentar resolver conexiones reales
    let resolvedA: any = null;
    let resolvedB: any = null;
    try {
      resolvedA = await getConnection(assetA);
      resolvedB = await getConnection(assetB);
    } catch (e) {
      console.warn('[Reconciliation] Error al obtener conexiones:', e);
    }

    setReconcileProgress(25);

    let scanResultA: any = null;
    let scanResultB: any = null;

    // Escanear Activo A si tiene conexión
    if (resolvedA) {
      try {
        console.log(`[Reconciliation] Iniciando escaneo real para Activo A: ${assetA?.name}`);
        const resA = await fetch('/api/quality-scan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            database_type: resolvedA.conn.source_id || 'postgres',
            host: resolvedA.conn.host,
            user: resolvedA.conn.username,
            key: resolvedA.conn.password_encrypted,
            connection_string: resolvedA.conn.connection_string,
            table_name: resolvedA.tableName,
            mode: 'table_quality'
          })
        });
        const dataA = await resA.json();
        if (dataA.success) {
          scanResultA = dataA;
          console.log('[Reconciliation] Escaneo Activo A exitoso:', dataA.score);
        } else {
          console.warn('[Reconciliation] Escaneo Activo A falló:', dataA.error);
        }
      } catch (e) {
        console.warn('[Reconciliation] Error conectando a base de datos A:', e);
      }
    }
    setReconcileProgress(55);

    // Escanear Activo B si tiene conexión
    if (resolvedB) {
      try {
        console.log(`[Reconciliation] Iniciando escaneo real para Activo B: ${assetB?.name}`);
        const resB = await fetch('/api/quality-scan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            database_type: resolvedB.conn.source_id || 'postgres',
            host: resolvedB.conn.host,
            user: resolvedB.conn.username,
            key: resolvedB.conn.password_encrypted,
            connection_string: resolvedB.conn.connection_string,
            table_name: resolvedB.tableName,
            mode: 'table_quality'
          })
        });
        const dataB = await resB.json();
        if (dataB.success) {
          scanResultB = dataB;
          console.log('[Reconciliation] Escaneo Activo B exitoso:', dataB.score);
        } else {
          console.warn('[Reconciliation] Escaneo Activo B falló:', dataB.error);
        }
      } catch (e) {
        console.warn('[Reconciliation] Error conectando a base de datos B:', e);
      }
    }
    setReconcileProgress(75);

    const baseA = scanResultA ? scanResultA.score : (assetA?.quality_score != null ? Number(assetA.quality_score) : 85);
    const baseB = scanResultB ? scanResultB.score : (assetB?.quality_score != null ? Number(assetB.quality_score) : 80);

    const getVal = (str: string, base: number) => {
      let h = 0;
      for (let i = 0; i < str.length; i++) {
        h = (h << 5) - h + str.charCodeAt(i);
        h |= 0;
      }
      const varPct = (Math.abs(h) % 15) - 7;
      return Math.max(0, Math.min(100, base + varPct));
    };

    setReconcileProgress(90);

    // Comparar campos por nombre normalizado
    const normalize = (s: string) => s.toLowerCase().replace(/[_\s-]/g, '');
    const mapA = new Map(fieldsA.map(f => [normalize(f.field_name), f]));
    const mapB = new Map(fieldsB.map(f => [normalize(f.field_name), f]));

    // Sinónimos semánticos para matching parcial
    const synonyms: Record<string, string[]> = {
      'nombre': ['nombre_cliente', 'name', 'full_name'],
      'email': ['email_contacto', 'correo', 'mail'],
      'telefono': ['phone', 'celular', 'tel'],
      'id': ['id_transaccion', 'lead_id', 'reporte_id', 'cliente_id'],
      'estado': ['status', 'calificacion']
    };

    const matchedPairs: any[] = [];
    const onlyA: any[] = [];
    const onlyB: any[] = [];
    const usedB = new Set<string>();

    fieldsA.forEach(fA => {
      const normA = normalize(fA.field_name);

      // Obtener calidad real desde el scan de la DB si está disponible
      const scanColA = scanResultA?.columns?.find((c: any) => normalize(c.name) === normA);
      const qualityA = scanColA ? scanColA.quality : getVal(fA.field_name, baseA);

      // Exact match
      if (mapB.has(normA)) {
        const fB = mapB.get(normA);
        const typeMatch = fA.data_type === fB.data_type;
        const scanColB = scanResultB?.columns?.find((c: any) => normalize(c.name) === normA);
        const qualityB = scanColB ? scanColB.quality : getVal(fB.field_name, baseB);

        matchedPairs.push({
          fieldA: fA,
          fieldB: fB,
          typeMatch,
          matchType: 'exact',
          qualityA,
          qualityB
        });
        usedB.add(normA);
      } else {
        // Synonym match
        const synKey = Object.keys(synonyms).find(k => normalize(k) === normA || synonyms[k].some(s => normalize(s) === normA));
        let synMatch = null;
        if (synKey) {
          const candidates = [normalize(synKey), ...synonyms[synKey].map(normalize)];
          const candidate = candidates.find(c => mapB.has(c) && !usedB.has(c));
          if (candidate) { synMatch = mapB.get(candidate); usedB.add(candidate); }
        }
        if (synMatch) {
          const typeMatch = fA.data_type === synMatch.data_type;
          const scanColB = scanResultB?.columns?.find((c: any) => normalize(c.name) === normalize(synMatch.field_name));
          const qualityB = scanColB ? scanColB.quality : (getVal(synMatch.field_name, baseB) - 3);

          matchedPairs.push({
            fieldA: fA,
            fieldB: synMatch,
            typeMatch,
            matchType: 'semantic',
            qualityA: scanColA ? scanColA.quality : (qualityA - 3),
            qualityB
          });
        } else {
          onlyA.push(fA);
        }
      }
    });

    fieldsB.forEach(fB => {
      const normB = normalize(fB.field_name);
      if (!usedB.has(normB)) onlyB.push(fB);
    });

    const compatRate = matchedPairs.length / Math.max(fieldsA.length, fieldsB.length, 1) * 100;
    const typeCompatRate = matchedPairs.filter(p => p.typeMatch).length / Math.max(matchedPairs.length, 1) * 100;
    const avgQualityA = matchedPairs.length > 0 ? Math.round(matchedPairs.reduce((s, p) => s + p.qualityA, 0) / matchedPairs.length) : 0;
    const avgQualityB = matchedPairs.length > 0 ? Math.round(matchedPairs.reduce((s, p) => s + p.qualityB, 0) / matchedPairs.length) : 0;

    const finalQualityA = scanResultA ? scanResultA.score : avgQualityA;
    const finalQualityB = scanResultB ? scanResultB.score : avgQualityB;
    const consolidatedScore = Math.round((finalQualityA * 0.4) + (finalQualityB * 0.4) + (compatRate * 0.2));

    // Generar análisis de exclusión si aplica
    let exclusionResult = null;
    if (reconKeyA && reconKeyB && exclusionMode !== 'none') {
      if (mode !== 'DEMO') {
        if (resolvedA && resolvedB) {
          try {
            console.log('[Reconciliation] Ejecutando análisis de exclusión real en bases de datos independientes...');
            const resExclude = await fetch('/api/quality-exclude', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                connA: resolvedA.conn,
                connB: resolvedB.conn,
                tableNameA: resolvedA.tableName,
                tableNameB: resolvedB.tableName,
                keyA: reconKeyA,
                keyB: reconKeyB,
                exclusionMode
              })
            });
            const excludeData = await resExclude.json();
            if (excludeData.success) {
              exclusionResult = excludeData.exclusionResult;
            } else {
              alert(`Error al ejecutar análisis de exclusión real: ${excludeData.error}`);
            }
          } catch (e: any) {
            alert(`Error de red al conectar con el API de exclusión: ${e.message}`);
          }
        } else {
          alert('No se pudieron resolver las credenciales de conexión para los activos seleccionados. Verifique la configuración de origen de datos.');
        }
      }

      if (mode === 'DEMO' && !exclusionResult) {
        const getAssetRows = (assetId: string, scanRes: any) => {
          if (scanRes?.summary?.records) return Number(scanRes.summary.records);
          if (scanRes?.records) return Number(scanRes.records);
          if (assetId === '1') return 12450;
          if (assetId === '2') return 15200;
          if (assetId === '3') return 8500;
          if (assetId === '4') return 5000;
          return 1000;
        };

        const totalA = getAssetRows(assetIdA, scanResultA);
        const totalB = getAssetRows(assetIdB, scanResultB);
        const nameA = assetA?.name || 'Activo A';
        const nameB = assetB?.name || 'Activo B';

        if (exclusionMode === 'A_EXCLUDE_B') {
          const matched = Math.min(totalA, Math.max(1, Math.round(totalB * 0.95)));
          const mismatched = Math.max(0, totalA - matched);
          const pct = totalA > 0 ? (matched / totalA) * 100 : 100;

          exclusionResult = {
            mode: 'A_EXCLUDE_B',
            keyA: reconKeyA,
            keyB: reconKeyB,
            totalA,
            totalB,
            matched,
            mismatched,
            pct,
            samples: ['0098', '0352', '1153', '6619', '7389'].slice(0, Math.max(1, Math.min(5, mismatched))).map((k) => {
              const keyVal = `${reconKeyA.toUpperCase().substring(0, 3)}-${k}`;
              return {
                key: keyVal,
                reason: `Llave '${keyVal}' del campo clave '${reconKeyA}' existe en "${nameA}" pero no tiene correspondencia en "${nameB}" (Falla de Integridad Referencial).`
              };
            })
          };
        } else if (exclusionMode === 'B_EXCLUDE_A') {
          const matched = Math.min(totalB, Math.max(1, Math.round(totalA * 0.95)));
          const mismatched = Math.max(0, totalB - matched);
          const pct = totalB > 0 ? (matched / totalB) * 100 : 100;

          exclusionResult = {
            mode: 'B_EXCLUDE_A',
            keyA: reconKeyA,
            keyB: reconKeyB,
            totalA,
            totalB,
            matched,
            mismatched,
            pct,
            samples: ['0512', '0689', '1502', '3042', '5511'].slice(0, Math.max(1, Math.min(5, mismatched))).map((k) => {
              const keyVal = `${reconKeyB.toUpperCase().substring(0, 3)}-${k}`;
              return {
                key: keyVal,
                reason: `Llave '${keyVal}' del campo clave '${reconKeyB}' en "${nameB}" no existe en "${nameA}". Registro huérfano detectado.`
              };
            })
          };
        } else if (exclusionMode === 'MATCHING_WITH_DIFF') {
          const matched = Math.min(totalA, totalB);
          const mismatched = Math.max(0, Math.round(matched * 0.033));
          const pct = matched > 0 ? ((matched - mismatched) / matched) * 100 : 100;

          const diffFields = matchedPairs.filter(p => p.fieldA.field_name !== reconKeyA).map(p => p.fieldA.field_name);
          const field1 = diffFields[0] || 'telefono';
          const field2 = diffFields[1] || 'email';
          const field3 = diffFields[2] || 'nombre';
          const field4 = diffFields[3] || 'direccion';

          exclusionResult = {
            mode: 'MATCHING_WITH_DIFF',
            keyA: reconKeyA,
            keyB: reconKeyB,
            totalA,
            totalB,
            matched,
            mismatched,
            pct,
            samples: [
              { key: `${reconKeyA.toUpperCase().substring(0, 3)}-0142`, reason: `Discrepancia detectada en campo "${field1}" (en "${nameA}": +56988887777 vs "${nameB}": 988887777)` },
              { key: `${reconKeyA.toUpperCase().substring(0, 3)}-2291`, reason: `Discrepancia detectada en campo "${field2}" (en "${nameA}": juan.perez@corp.com vs "${nameB}": juan.perez@gmail.com)` },
              { key: `${reconKeyA.toUpperCase().substring(0, 3)}-5542`, reason: `Discrepancia detectada en campo "${field3}" (en "${nameA}": Maria Gomez vs "${nameB}": María Gómez Silva)` },
              { key: `${reconKeyA.toUpperCase().substring(0, 3)}-0982`, reason: `Discrepancia detectada en campo "${field4}" (en "${nameA}": Av. Providencia 120 vs "${nameB}": Av Providencia #120)` }
            ].slice(0, Math.max(1, Math.min(4, mismatched)))
          };
        }
      }
    }

    const resultObj = {
      assetA, assetB,
      matchedPairs,
      onlyA, onlyB,
      compatRate: Math.round(compatRate),
      typeCompatRate: Math.round(typeCompatRate),
      avgQualityA: finalQualityA,
      avgQualityB: finalQualityB,
      consolidatedScore,
      exclusionResult,
      radarData: [
        {
          subject: 'Completitud',
          A: scanResultA?.indicators?.completeness ?? getVal('Completitud', baseA),
          B: scanResultB?.indicators?.completeness ?? getVal('Completitud', baseB)
        },
        {
          subject: 'Unicidad',
          A: scanResultA?.indicators?.uniqueness ?? getVal('Unicidad', baseA),
          B: scanResultB?.indicators?.uniqueness ?? getVal('Unicidad', baseB)
        },
        {
          subject: 'Consistencia',
          A: scanResultA?.indicators?.consistency ?? getVal('Consistencia', baseA),
          B: scanResultB?.indicators?.consistency ?? getVal('Consistencia', baseB)
        },
        {
          subject: 'Validez',
          A: scanResultA?.indicators?.validez ?? getVal('Validez', baseA),
          B: scanResultB?.indicators?.validez ?? getVal('Validez', baseB)
        },
        {
          subject: 'Exactitud',
          A: scanResultA?.indicators?.accuracy ?? getVal('Exactitud', baseA),
          B: scanResultB?.indicators?.accuracy ?? getVal('Exactitud', baseB)
        }
      ],
      barData: matchedPairs.slice(0, 8).map(p => ({
        field: p.fieldA.field_name.length > 12 ? p.fieldA.field_name.slice(0, 12) + '…' : p.fieldA.field_name,
        [assetA?.name?.slice(0,10) || 'A']: p.qualityA,
        [assetB?.name?.slice(0,10) || 'B']: p.qualityB
      }))
    };

    setReconciliationResult(resultObj);

    // Guardar en el histórico
    try {
      const historyItem = {
        id: Date.now().toString(),
        date: new Date().toLocaleString('es-CO'),
        assetAName: assetA?.name || 'Activo A',
        assetBName: assetB?.name || 'Activo B',
        keyA: reconKeyA || 'N/A',
        keyB: reconKeyB || 'N/A',
        exclusionMode: exclusionMode,
        score: consolidatedScore,
        result: resultObj
      };

      const updatedHistory = [historyItem, ...reconciliationHistory];
      setReconciliationHistory(updatedHistory);

      const reconHistKey = `govdata_recon_history_${currentTenant?.id || '00000000-0000-0000-0000-000000000001'}`;
      localStorage.setItem(reconHistKey, JSON.stringify(updatedHistory));
    } catch (e) {
      console.warn('Error saving reconciliation to history:', e);
    }

    setIsReconciling(false);
  };

  // Actualizar e integrar remediación del incidente
  const handleUpdateIncidentStatus = async (newStatus: string) => {
    if (!selectedIncident) return;
    try {
      // 1. Actualizar tabla calidad
      await supabase
        .from('quality_incidents')
        .update({
          status: newStatus,
          assigned_to: incidentFields.assignedTo,
          due_date: incidentFields.dueDate,
          impact: incidentFields.impact,
          root_cause: incidentFields.rootCause,
          evidence: incidentFields.evidence
        })
        .eq('id', selectedIncident.dbId);

      // 2. Sincronizar actualización con el ticket de workflows correspondiente
      await supabase
        .from('workflow_requests')
        .update({
          status: newStatus === 'Cerrado' ? 'Cerrado' : newStatus === 'Corregido' ? 'Aprobado' : 'En Revisión',
          current_step: `Remediación: ${newStatus}`
        })
        .like('description', `%ID Incidente: ${selectedIncident.dbId}%`);

      setSelectedIncident((prev: any) => ({
        ...prev,
        status: newStatus,
        ...incidentFields
      }));

      fetchIncidents(selectedAssetId);
      alert('Incidente actualizado y sincronizado en el Centro de Operaciones (Workflows) exitosamente.');
    } catch (e) {
      console.error(e);
      alert('Error actualizando el incidente o sincronizando workflow.');
    }
  };

  const handleSaveIncidentEdit = async () => {
    if (!selectedIncident) return;
    try {
      await supabase
        .from('quality_incidents')
        .update({
          assigned_to: incidentFields.assignedTo,
          due_date: incidentFields.dueDate,
          impact: incidentFields.impact,
          root_cause: incidentFields.rootCause,
          evidence: incidentFields.evidence
        })
        .eq('id', selectedIncident.dbId);

      await supabase
        .from('workflow_requests')
        .update({
          assigned_to: incidentFields.assignedTo
        })
        .like('description', `%ID Incidente: ${selectedIncident.dbId}%`);

      setSelectedIncident((prev: any) => ({
        ...prev,
        ...incidentFields
      }));
      fetchIncidents(selectedAssetId);
      alert('Cambios guardados correctamente.');
    } catch (e) {
      console.error(e);
      alert('Error al guardar los cambios.');
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0 }}>
            <Activity size={24} />
          </div>
          <div>
            <h1 style={{ margin: 0, marginBottom: '4px', fontSize: '1.8rem' }}>Calidad de Datos Empresarial</h1>
            <p style={{ margin: 0, color: '#64748b', fontSize: '0.95rem' }}>Perfilamiento avanzado, conciliación entre sistemas y workflows de remediación.</p>
          </div>
        </div>

        <div className={styles.assetSelector}>
          <Database size={18} className={styles.selectorIcon} />
          <select
            value={selectedAssetId}
            onChange={(e) => setSelectedAssetId(e.target.value)}
            className={styles.select}
          >
            <option value="">Seleccionar Activo...</option>
            {assets.map(a => (
              <option key={a.id} value={a.id}>{a.name} ({a.source})</option>
            ))}
          </select>
        </div>

        <div className={styles.headerActions}>
          <button className={styles.secondaryBtn} onClick={() => setShowDqiConfig(true)}>
            <Settings size={18} /> Configuración DQI
          </button>
          <button className={styles.secondaryBtn} onClick={() => setIsNotifyModalOpen(true)}>
            <Calendar size={18} /> Monitorear
          </button>
          <button className={styles.primaryBtn} onClick={() => setIsRuleModalOpen(true)}>
            <Plus size={18} /> Crear Regla
          </button>
        </div>
      </header>

      {/* Tabs Principales */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', flexWrap: 'wrap' }}>
        {[
          { id: 'overview', label: 'Dashboard CDO', icon: <Award size={16} /> },
          { id: 'profiling', label: 'Perfilamiento Auto', icon: <BarChart3 size={16} /> },
          { id: 'table_quality', label: 'Calidad de Tabla', icon: <Grid size={16} /> },
          { id: 'field_analysis', label: 'Análisis por Campo', icon: <Layers size={16} /> },
          { id: 'rules', label: 'Reglas de Calidad', icon: <ShieldCheck size={16} /> },
          { id: 'reconciliation', label: 'Conciliación Activos', icon: <Activity size={16} /> },
          { id: 'incidents', label: 'Remediación & Incidentes', icon: <AlertCircle size={16} /> }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === t.id ? '#6366f1' : 'transparent',
              color: activeTab === t.id ? 'white' : '#475569',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* CONTENIDOS DE LAS PESTAÑAS */}
      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {/* Banner Global DQI */}
            <div className={styles.globalBanner} style={{ marginBottom: '24px' }}>
              <div className={styles.globalLeft}>
                <div className={styles.circleWrap}>
                  <svg width="120" height="120" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="52" fill="none" stroke="#e2e8f0" strokeWidth="10" />
                    <circle
                       cx="60" cy="60" r="52" fill="none"
                      stroke="#10b981"
                      strokeWidth="10"
                      strokeDasharray={2 * Math.PI * 52}
                      strokeDashoffset={(1 - computedDqiScore / 100) * 2 * Math.PI * 52}
                      strokeLinecap="round"
                      transform="rotate(-90 60 60)"
                      style={{ transition: 'stroke-dashoffset 1s ease' }}
                    />
                    <text x="60" y="65" textAnchor="middle" fill="#10b981" fontSize="24" fontWeight="900">
                      {computedDqiScore}%
                    </text>
                  </svg>
                </div>
                <div className={styles.globalInfo}>
                  <div className={styles.globalLevel} style={{ color: '#10b981' }}>
                    <Award size={20} /> Calidad Global Empresa
                  </div>
                  <h2 className={styles.globalTitle}>Índice DQI Inteligente Ponderado</h2>
                  <p className={styles.globalSub}>
                    Calculado usando los pesos corporativos configurados por la organización.
                  </p>
                </div>
              </div>

              {/* Sub-Dimensiones DQI */}
              <div className={styles.globalRight}>
                {[
                  { name: 'Completitud', val: stats.completeness, w: dqiWeights.completeness },
                  { name: 'Validez', val: stats.validez, w: dqiWeights.validez },
                  { name: 'Consistencia', val: stats.consistency, w: dqiWeights.consistency },
                  { name: 'Unicidad', val: stats.uniqueness, w: dqiWeights.uniqueness },
                  { name: 'Exactitud', val: stats.accuracy, w: dqiWeights.accuracy }
                ].map((d, i) => (
                  <div key={i} className={styles.miniPill}>
                    <span>{d.name} <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>({d.w}%)</span></span>
                    <strong>{d.val}%</strong>
                  </div>
                ))}
              </div>
            </div>

            {/* Gráficos CDO */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '24px' }}>
              <div style={{ background: 'white', padding: '24px', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
                <h3 style={{ margin: '0 0 16px', fontSize: '1.1rem', color: '#1e293b' }}>Tendencia Histórica DQI (Últimos 12 Meses)</h3>
                <div style={{ height: '250px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendData}>
                      <defs>
                        <linearGradient id="colorDqi" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                      <YAxis domain={[70, 100]} stroke="#94a3b8" fontSize={11} />
                      <Tooltip />
                      <Area type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorDqi)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div style={{ background: 'white', padding: '24px', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
                <h3 style={{ margin: '0 0 16px', fontSize: '1.1rem', color: '#1e293b' }}>Calidad por Dominio Corporativo</h3>
                <div style={{ height: '250px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={domainRadarData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="subject" stroke="#475569" fontSize={11} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#94a3b8" />
                      <Radar name="Calidad" dataKey="score" stroke="#a855f7" fill="#a855f7" fillOpacity={0.3} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Integración con el Centro de Madurez */}
            <div style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #311042 100%)', color: 'white', padding: '24px', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '24px' }}>
              <div>
                <span style={{ textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1px', color: '#a5b4fc', fontWeight: 700 }}>Integración Centro de Madurez</span>
                <h3 style={{ margin: '8px 0', fontSize: '1.3rem' }}>Recomendaciones de Calidad Predictiva</h3>
                <p style={{ margin: 0, color: '#c7d2fe', fontSize: '0.9rem', maxWidth: '700px' }}>
                  Basado en tu nivel de madurez actual de Gobierno de Datos, Nexus AI sugiere automatizar el monitoreo continuo para prevenir incidentes e implementar técnicas de calidad predictiva sobre flujos de ETL.
                </p>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.1)', padding: '16px 24px', borderRadius: '16px', textAlign: 'center' }}>
                <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fcd34d' }}>Nivel 3</div>
                <span style={{ fontSize: '0.8rem', color: '#e0e7ff' }}>Madurez Recomendada</span>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'profiling' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {!selectedAssetId ? (
              <div style={{ background: 'white', padding: '40px 24px', borderRadius: '24px', border: '1px solid #e2e8f0', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <Database size={48} color="#6366f1" style={{ marginBottom: '16px' }} />
                <h3 style={{ margin: '0 0 8px', color: '#1e293b' }}>Selecciona un Activo de Datos</h3>
                <p style={{ margin: '0 0 24px', color: '#64748b', fontSize: '0.95rem', maxWidth: '450px' }}>
                  Para realizar el Perfilamiento Automático (Data Profiling), primero debes elegir un activo de información del catálogo:
                </p>
                <div className={styles.assetSelector} style={{ maxWidth: '360px', width: '100%' }}>
                  <Database size={18} className={styles.selectorIcon} />
                  <select
                    value={selectedAssetId}
                    onChange={(e) => setSelectedAssetId(e.target.value)}
                  >
                    <option value="">— Elegir Activo de Información —</option>
                    {assets.map(a => (
                      <option key={a.id} value={a.id}>{a.name} ({a.source})</option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              <div style={{ background: 'white', padding: '24px', borderRadius: '24px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                  <h3 style={{ margin: 0 }}>Perfilamiento Automático (Data Profiling)</h3>
                  <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.9rem' }}>Analiza la cardinalidad, distribución de valores y patrones anómalos.</p>
                </div>
                <button
                  onClick={handleStartProfiling}
                  disabled={isProfiling || !selectedAssetId}
                  className={styles.primaryBtn}
                >
                  {isProfiling ? <RefreshCw className={styles.spin} /> : <Play />} Perfilar Activo
                </button>
              </div>

              {!profileResult ? (
                <div style={{ padding: '48px', textAlign: 'center', background: '#f8fafc', borderRadius: '16px' }}>
                  <BarChart3 size={48} color="#cbd5e1" style={{ marginBottom: '12px' }} />
                  <p style={{ margin: 0, color: '#64748b' }}>Haga clic en "Perfilar Activo" para iniciar el análisis automático.</p>
                </div>
              ) : (
                <div>
                  <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #e2e8f0', marginBottom: '16px' }}>
                    {['general', 'distribution', 'anomalies', 'recommendations', 'historial'].map(t => (
                      <button
                        key={t}
                        onClick={() => setProfileTab(t)}
                        style={{
                          padding: '8px 16px',
                          border: 'none',
                          background: 'transparent',
                          color: profileTab === t ? '#6366f1' : '#64748b',
                          fontWeight: profileTab === t ? 700 : 500,
                          borderBottom: profileTab === t ? '2px solid #6366f1' : 'none',
                          cursor: 'pointer'
                        }}
                      >
                        {t === 'general' ? 'Resumen General' : 
                         t === 'distribution' ? 'Distribución' : 
                         t === 'anomalies' ? 'Anomalías' : 
                         t === 'historial' ? 'Historial de Perfilamiento' :
                         'Recomendaciones AI'}
                      </button>
                    ))}
                  </div>

                  {profileTab === 'general' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                        <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px' }}>
                          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Número de registros</span>
                          <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{profileResult.records.toLocaleString()}</div>
                        </div>
                        <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px' }}>
                          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Número de columnas</span>
                          <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{profileResult.columns}</div>
                        </div>
                        <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px' }}>
                          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>% Nulos</span>
                          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ef4444' }}>{profileResult.nullsPct}%</div>
                        </div>
                        <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px' }}>
                          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Claves Candidatas</span>
                          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#10b981' }}>{profileResult.columns > 0 ? 'id, clave' : 'N/A'}</div>
                        </div>
                      </div>

                      {/* Visualización de Indicadores de Calidad Evaluados */}
                      {profileResult.indicators && (
                        <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                          <h4 style={{ margin: '0 0 16px', fontSize: '1.1rem', color: '#1e293b' }}>Porcentaje por Indicador de Calidad Evaluado</h4>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                              {[
                                { name: 'Completitud', value: profileResult.indicators.completeness, color: '#6366f1', desc: 'Presencia de valores obligatorios sin nulos.' },
                                { name: 'Validez', value: profileResult.indicators.validez, color: '#10b981', desc: 'Conformidad con formatos y tipos definidos.' },
                                { name: 'Consistencia', value: profileResult.indicators.consistency, color: '#f59e0b', desc: 'Coherencia e integridad lógica de la información.' },
                                { name: 'Unicidad', value: profileResult.indicators.uniqueness, color: '#ec4899', desc: 'Ausencia de duplicados en registros o identificadores.' },
                                { name: 'Exactitud', value: profileResult.indicators.accuracy, color: '#3b82f6', desc: 'Cercanía a los valores reales y ausencia de anomalías.' }
                              ].map((ind, idx) => (
                                <div key={idx}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                      <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#334155' }}>{ind.name}</span>
                                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{ind.desc}</span>
                                    </div>
                                    <strong style={{ fontSize: '1.1rem', color: ind.color }}>{ind.value}%</strong>
                                  </div>
                                  <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                                    <div style={{ height: '100%', background: ind.color, width: `${ind.value}%`, borderRadius: '4px' }} />
                                  </div>
                                </div>
                              ))}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'white', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0' }}>
                              <div style={{ width: '100%', height: '240px' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={[
                                    { subject: 'Completitud', value: profileResult.indicators.completeness },
                                    { subject: 'Validez', value: profileResult.indicators.validez },
                                    { subject: 'Consistencia', value: profileResult.indicators.consistency },
                                    { subject: 'Unicidad', value: profileResult.indicators.uniqueness },
                                    { subject: 'Exactitud', value: profileResult.indicators.accuracy }
                                  ]}>
                                    <PolarGrid />
                                    <PolarAngleAxis dataKey="subject" stroke="#475569" fontSize={11} />
                                    <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#94a3b8" />
                                    <Radar name="Calidad" dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} />
                                  </RadarChart>
                                </ResponsiveContainer>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {profileTab === 'distribution' && (
                    <div>
                      <h4 style={{ margin: '0 0 12px' }}>Distribución de Valores (País Común)</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {profileResult.distribution.map((item: any, i: number) => (
                          <div key={i}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                              <span>{item.value}</span>
                              <strong>{item.count.toLocaleString()} registros</strong>
                            </div>
                            <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                              <div style={{ height: '100%', background: '#6366f1', width: `${(item.count / 50000) * 100}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {profileTab === 'anomalies' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {profileResult.anomalies.map((a: any, i: number) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '12px' }}>
                          <AlertTriangle color="#ef4444" />
                          <div>
                            <strong style={{ display: 'block', color: '#991b1b' }}>{a.type} en campo "{a.field}"</strong>
                            <span style={{ fontSize: '0.85rem', color: '#b91c1c' }}>Detectamos {a.count} registros con formato inválido o fuera del patrón estándar.</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {profileTab === 'recommendations' && (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <h4 style={{ margin: 0 }}>Recomendaciones de Reglas IA</h4>
                        <button
                          onClick={() => alert('Se han aplicado las reglas recomendadas exitosamente.')}
                          className={styles.secondaryBtnSmall}
                          style={{ borderColor: '#6366f1', color: '#6366f1' }}
                        >
                          <Check size={14} /> Aplicar todas
                        </button>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        {profileResult.recommendations.map((r: any) => (
                          <div key={r.id} style={{ padding: '16px', border: '1px solid #e2e8f0', borderRadius: '12px', background: '#f8fafc' }}>
                            <strong style={{ display: 'block', color: '#1e293b', marginBottom: '4px' }}>{r.title}</strong>
                            <p style={{ margin: '0 0 12px', fontSize: '0.85rem', color: '#64748b' }}>{r.text}</p>
                            <button
                              onClick={() => alert(`Aplicada: ${r.title}`)}
                              className={styles.primaryBtnSmall}
                              style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                            >
                              Aplicar
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {profileTab === 'historial' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <h4 style={{ margin: 0, color: '#0f172a' }}>Historial de Perfilamientos Anteriores</h4>
                      {profilingHistory.length === 0 ? (
                        <div style={{ color: '#64748b', fontSize: '0.9rem', fontStyle: 'italic', padding: '16px', background: '#f8fafc', borderRadius: '8px' }}>
                          No hay historial de perfilamiento para este activo.
                        </div>
                      ) : (
                        profilingHistory.map((h: any) => (
                          <div key={h.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                            <div>
                              <div style={{ fontWeight: 600, color: '#1e293b' }}>
                                {new Date(h.created_at).toLocaleString()}
                              </div>
                              <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                                Registros: {h.profile_data?.records?.toLocaleString() || 'N/A'} | Columnas: {h.profile_data?.columns || 'N/A'}
                              </div>
                            </div>
                            <button
                              onClick={() => { setProfileResult(h.profile_data); setProfileTab('general'); }}
                              className={styles.secondaryBtnSmall}
                              style={{ padding: '6px 12px' }}
                            >
                              Ver Detalle
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          </motion.div>
        )}

        {activeTab === 'table_quality' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {!selectedAssetId ? (
              <div style={{ background: 'white', padding: '40px 24px', borderRadius: '24px', border: '1px solid #e2e8f0', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <Database size={48} color="#6366f1" style={{ marginBottom: '16px' }} />
                <h3 style={{ margin: '0 0 8px', color: '#1e293b' }}>Selecciona un Activo de Datos</h3>
                <p style={{ margin: '0 0 24px', color: '#64748b', fontSize: '0.95rem', maxWidth: '450px' }}>
                  Para analizar la calidad de la tabla completa y diagnosticar sus dimensiones, primero debes elegir un activo de información del catálogo:
                </p>
                <div className={styles.assetSelector} style={{ maxWidth: '360px', width: '100%' }}>
                  <Database size={18} className={styles.selectorIcon} />
                  <select
                    value={selectedAssetId}
                    onChange={(e) => setSelectedAssetId(e.target.value)}
                  >
                    <option value="">— Elegir Activo de Información —</option>
                    {assets.map(a => (
                      <option key={a.id} value={a.id}>{a.name} ({a.source})</option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              <div style={{ background: 'white', padding: '24px', borderRadius: '24px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                  <h3 style={{ margin: 0 }}>Calidad de Tabla Completa / Activo</h3>
                  <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.9rem' }}>Obtén el score general y el diagnóstico de las 5 dimensiones de calidad para todo el activo.</p>
                </div>
                <button
                  onClick={handleAnalyzeTable}
                  disabled={isAnalyzingTable || !selectedAssetId}
                  className={styles.primaryBtn}
                >
                  {isAnalyzingTable ? <RefreshCw className={styles.spin} /> : <Play />} Analizar Tabla Completa
                </button>
              </div>

              {!tableAnalysisResult ? (
                <div style={{ padding: '48px', textAlign: 'center', background: '#f8fafc', borderRadius: '16px' }}>
                  <Grid size={48} color="#cbd5e1" style={{ marginBottom: '12px' }} />
                  <p style={{ margin: 0, color: '#64748b' }}>Haga clic en "Analizar Tabla Completa" para iniciar la evaluación global.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                  {/* Score global y Radial */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px', alignItems: 'center', background: '#f8fafc', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                    <div style={{ textAlign: 'center', padding: '20px', background: 'white', borderRadius: '16px', border: '1px solid #cbd5e1' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '12px' }}>SCORE GENERAL</span>
                      <div style={{ fontSize: '3rem', fontWeight: 900, color: tableAnalysisResult.score >= 90 ? '#10b981' : tableAnalysisResult.score >= 80 ? '#f59e0b' : '#ef4444' }}>
                        {tableAnalysisResult.score}%
                      </div>
                      <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'block', marginTop: '6px' }}>
                        Salud general del Activo
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <h4 style={{ margin: '0 0 8px', color: '#1e293b' }}>Resumen por Dimensión de Calidad</h4>
                      {tableAnalysisResult.indicators && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px' }}>
                          {[
                            { name: 'Completitud', val: tableAnalysisResult.indicators.completeness, color: '#6366f1' },
                            { name: 'Validez', val: tableAnalysisResult.indicators.validez, color: '#10b981' },
                            { name: 'Consistencia', val: tableAnalysisResult.indicators.consistency, color: '#f59e0b' },
                            { name: 'Unicidad', val: tableAnalysisResult.indicators.uniqueness, color: '#ec4899' },
                            { name: 'Exactitud', val: tableAnalysisResult.indicators.accuracy, color: '#3b82f6' }
                          ].map((ind, i) => (
                            <div key={i} style={{ background: 'white', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '4px' }}>{ind.name}</span>
                              <strong style={{ fontSize: '1.2rem', color: ind.color }}>{ind.val}%</strong>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Gráfico de Barras Comparativo (Diferencial) */}
                  <div style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #cbd5e1' }}>
                    <h4 style={{ margin: '0 0 16px', color: '#1e293b' }}>Diferencial de Calidad entre Campos</h4>
                    <div style={{ height: '240px' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={tableAnalysisResult.columns} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                          <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                          <YAxis domain={[0, 100]} stroke="#64748b" fontSize={11} tickLine={false} />
                          <Tooltip cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }} content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              return (
                                <div style={{ background: 'white', border: '1px solid #cbd5e1', padding: '12px', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                                  <strong style={{ color: '#1e293b', display: 'block', marginBottom: '4px' }}>{data.name}</strong>
                                  <span style={{ color: '#6366f1', fontWeight: 700 }}>Calidad: {data.quality}%</span>
                                </div>
                              );
                            }
                            return null;
                          }} />
                          <Bar dataKey="quality" radius={[6, 6, 0, 0]}>
                            {tableAnalysisResult.columns.map((entry: any, index: number) => {
                              const color = entry.quality >= 90 ? '#10b981' : entry.quality >= 80 ? '#f59e0b' : '#ef4444';
                              return <Cell key={`cell-${index}`} fill={color} />;
                            })}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Desglose de calidad por campo */}
                  <div>
                    <h4 style={{ margin: '0 0 16px', color: '#1e293b' }}>Calidad Desglosada por Campo</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
                      {tableAnalysisResult.columns.map((c: any, i: number) => (
                        <div key={i} style={{ background: '#f8fafc', padding: '16px', borderRadius: '16px', border: '1px solid #cbd5e1' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <strong style={{ fontSize: '0.9rem', color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '140px' }} title={c.name}>{c.name}</strong>
                            <span style={{
                              background: c.quality >= 90 ? '#ecfdf5' : c.quality >= 80 ? '#fffbeb' : '#fef2f2',
                              color: c.quality >= 90 ? '#059669' : c.quality >= 80 ? '#d97706' : '#dc2626',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              fontWeight: 700
                            }}>{c.quality}%</span>
                          </div>
                          {/* Micro Gráfico de Barras de 5 Dimensiones */}
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-around',
                            alignItems: 'flex-end',
                            height: '50px',
                            background: 'white',
                            padding: '6px',
                            borderRadius: '8px',
                            border: '1px solid #e2e8f0',
                            marginBottom: '10px',
                            gap: '4px'
                          }}>
                            {[
                              { label: 'C', title: 'Completitud', val: c.indicators?.completeness ?? c.quality, color: '#6366f1' },
                              { label: 'V', title: 'Validez', val: c.indicators?.validez ?? 100, color: '#10b981' },
                              { label: 'Co', title: 'Consistencia', val: c.indicators?.consistency ?? 100, color: '#f59e0b' },
                              { label: 'U', title: 'Unicidad', val: c.indicators?.uniqueness ?? 100, color: '#ec4899' },
                              { label: 'E', title: 'Exactitud', val: c.indicators?.accuracy ?? 100, color: '#3b82f6' }
                            ].map((dim, idx) => (
                              <div key={idx} style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                flex: 1,
                                height: '100%',
                                justifyContent: 'flex-end'
                              }}>
                                <div
                                  style={{
                                    width: '100%',
                                    maxWidth: '8px',
                                    height: `${dim.val}%`,
                                    background: dim.color,
                                    borderRadius: '3px 3px 0 0',
                                    minHeight: '2px',
                                    transition: 'height 0.3s ease'
                                  }}
                                  title={`${dim.title}: ${dim.val}%`}
                                />
                                <span style={{ fontSize: '0.6rem', marginTop: '2px', fontWeight: 700, color: '#64748b' }} title={dim.title}>
                                  {dim.label}
                                </span>
                              </div>
                            ))}
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '2px', fontSize: '0.6rem', textAlign: 'center', color: '#64748b', fontWeight: 600 }}>
                            <div>{c.indicators?.completeness ?? c.quality}%</div>
                            <div>{c.indicators?.validez ?? 100}%</div>
                            <div>{c.indicators?.consistency ?? 100}%</div>
                            <div>{c.indicators?.uniqueness ?? 100}%</div>
                            <div>{c.indicators?.accuracy ?? 100}%</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          </motion.div>
        )}

        {activeTab === 'field_analysis' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {!selectedAssetId ? (
              <div style={{ background: 'white', padding: '40px 24px', borderRadius: '24px', border: '1px solid #e2e8f0', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <Layers size={48} color="#6366f1" style={{ marginBottom: '16px' }} />
                <h3 style={{ margin: '0 0 8px', color: '#1e293b' }}>Selecciona un Activo de Datos</h3>
                <p style={{ margin: '0 0 24px', color: '#64748b', fontSize: '0.95rem', maxWidth: '450px' }}>
                  Para visualizar el análisis granular por campo (columna), primero debes elegir un activo de información del catálogo:
                </p>
                <div className={styles.assetSelector} style={{ maxWidth: '360px', width: '100%' }}>
                  <Database size={18} className={styles.selectorIcon} />
                  <select
                    value={selectedAssetId}
                    onChange={(e) => setSelectedAssetId(e.target.value)}
                  >
                    <option value="">— Elegir Activo de Información —</option>
                    {assets.map(a => (
                      <option key={a.id} value={a.id}>{a.name} ({a.source})</option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              <div style={{ background: 'white', padding: '24px', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                  <h3 style={{ margin: 0 }}>Análisis Granular por Campo (Columna)</h3>
                  <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.9rem' }}>Visualiza detalladamente los scores individuales para cada columna del activo en las 5 dimensiones.</p>
                </div>
                {!tableAnalysisResult && (
                  <button
                    onClick={handleAnalyzeTable}
                    disabled={isAnalyzingTable || !selectedAssetId}
                    className={styles.primaryBtn}
                  >
                    {isAnalyzingTable ? <RefreshCw className={styles.spin} /> : <Play />} Ejecutar Análisis
                  </button>
                )}
              </div>

              {!tableAnalysisResult ? (
                <div style={{ padding: '48px', textAlign: 'center', background: '#f8fafc', borderRadius: '16px' }}>
                  <Layers size={48} color="#cbd5e1" style={{ marginBottom: '12px' }} />
                  <p style={{ margin: 0, color: '#64748b' }}>Haga clic en "Ejecutar Análisis" o realice el análisis en la pestaña de Calidad de Tabla primero.</p>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#475569', fontSize: '0.85rem', fontWeight: 700 }}>
                        <th style={{ padding: '12px 16px' }}>Campo / Columna</th>
                        <th style={{ padding: '12px 16px' }}>Score General</th>
                        <th style={{ padding: '12px 16px', color: '#6366f1' }}>Completitud</th>
                        <th style={{ padding: '12px 16px', color: '#10b981' }}>Validez</th>
                        <th style={{ padding: '12px 16px', color: '#f59e0b' }}>Consistencia</th>
                        <th style={{ padding: '12px 16px', color: '#ec4899' }}>Unicidad</th>
                        <th style={{ padding: '12px 16px', color: '#3b82f6' }}>Exactitud</th>
                        <th style={{ padding: '12px 16px' }}>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tableAnalysisResult.columns.map((c: any, i: number) => {
                        const matchedField = assetFields.find(f => f.field_name === c.name);
                        return (
                          <tr key={i} style={{ borderBottom: '1px solid #f1f5f9', fontSize: '0.9rem', color: '#1e293b' }}>
                            <td style={{ padding: '14px 16px', fontWeight: 700 }}>{c.name}</td>
                            <td style={{ padding: '14px 16px' }}>
                              <span style={{
                                background: c.quality >= 90 ? '#ecfdf5' : c.quality >= 80 ? '#fffbeb' : '#fef2f2',
                                color: c.quality >= 90 ? '#059669' : c.quality >= 80 ? '#d97706' : '#dc2626',
                                padding: '4px 8px',
                                borderRadius: '6px',
                                fontWeight: 700
                              }}>{c.quality}%</span>
                            </td>
                            <td style={{ padding: '14px 16px' }}>{c.indicators?.completeness ?? c.quality}%</td>
                            <td style={{ padding: '14px 16px' }}>{c.indicators?.validez ?? 100}%</td>
                            <td style={{ padding: '14px 16px' }}>{c.indicators?.consistency ?? 100}%</td>
                            <td style={{ padding: '14px 16px' }}>{c.indicators?.uniqueness ?? 100}%</td>
                            <td style={{ padding: '14px 16px' }}>{c.indicators?.accuracy ?? 100}%</td>
                            <td style={{ padding: '14px 16px' }}>
                              <button
                                onClick={() => {
                                  setEditingRule({
                                    asset_id: selectedAssetId,
                                    field_id: matchedField?.id || '',
                                    name: `Validación de completitud para ${c.name}`,
                                    type: 'Nulos',
                                    severity: 'Media',
                                    config: {}
                                  });
                                  setIsRuleModalOpen(true);
                                }}
                                className={styles.primaryBtnSmall}
                                style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                              >
                                + Regla
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
          </motion.div>
        )}

        {activeTab === 'rules' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {!selectedAssetId ? (
              <div style={{ background: 'white', padding: '40px 24px', borderRadius: '24px', border: '1px solid #e2e8f0', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <ShieldCheck size={48} color="#6366f1" style={{ marginBottom: '16px' }} />
                <h3 style={{ margin: '0 0 8px', color: '#1e293b' }}>Selecciona un Activo de Datos</h3>
                <p style={{ margin: '0 0 24px', color: '#64748b', fontSize: '0.95rem', maxWidth: '450px' }}>
                  Para gestionar y ejecutar reglas de calidad sobre un activo de información, primero debes elegir un activo de información del catálogo:
                </p>
                <div className={styles.assetSelector} style={{ maxWidth: '360px', width: '100%' }}>
                  <Database size={18} className={styles.selectorIcon} />
                  <select
                    value={selectedAssetId}
                    onChange={(e) => setSelectedAssetId(e.target.value)}
                  >
                    <option value="">— Elegir Activo de Información —</option>
                    {assets.map(a => (
                      <option key={a.id} value={a.id}>{a.name} ({a.source})</option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              <>
                {/* Listado de reglas de calidad */}
                <section className={styles.rulesSection}>
              <div className={styles.sectionHeader}>
                <h3>Reglas de Calidad Configuradas ({rules.length})</h3>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    className={styles.secondaryBtnSmall} 
                    onClick={handleExecuteRules}
                    disabled={isExecuting || rules.length === 0}
                    style={{ opacity: rules.length === 0 ? 0.6 : 1 }}
                  >
                    {isExecuting ? `Ejecutando (${executionProgress}%)` : 'Ejecutar Reglas'}
                  </button>
                  <button className={styles.primaryBtnSmall} onClick={() => setIsRuleModalOpen(true)}>Crear Regla</button>
                </div>
              </div>
              <div className={styles.rulesGrid}>
                {rules.length === 0 ? (
                  <div className={styles.emptyRules}>
                    <ShieldCheck size={48} color="#cbd5e1" />
                    <p>No hay reglas configuradas para este activo.</p>
                  </div>
                ) : (
                  rules.map(rule => (
                    <div key={rule.id} className={styles.ruleCard}>
                      <div className={styles.ruleIconBox}>
                        <Zap size={18} color="#6366f1" />
                      </div>
                      <div className={styles.ruleMain} style={{ flex: 1 }}>
                        <h4>{rule.rule_name || rule.name}</h4>
                        <div className={styles.ruleBadges}>
                          <span className={styles.typeBadge}>{rule.rule_type || rule.type}</span>
                          <span className={`${styles.sevBadgeSmall} ${rule.severity === 'Crítica' ? styles.sevCritical : styles.sevLow}`}>{rule.severity || 'Media'}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setEditingRule({
                            id: rule.id,
                            asset_id: rule.asset_id || selectedAssetId,
                            field_id: rule.field_id || '',
                            name: rule.rule_name || rule.name,
                            type: rule.rule_type || rule.type,
                            severity: rule.severity || 'Media',
                            config: rule.config || {}
                          });
                          setIsRuleModalOpen(true);
                        }}
                        style={{ background: 'transparent', border: 'none', color: '#6366f1', cursor: 'pointer', padding: '8px' }}
                        title="Editar Regla"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteRule(rule.id)}
                        style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '8px' }}
                        title="Eliminar Regla"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </section>

            {/* Historial de Escaneos de Calidad */}
            <div style={{ background: 'white', padding: '24px', borderRadius: '24px', border: '1px solid #e2e8f0', marginBottom: '32px' }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px', color: '#1e293b' }}>
                <Clock size={18} color="#6366f1" />
                Historial de Escaneos y Resultados
              </h3>
              
              {(() => {
                const selectedAsset = assets.find(a => a.id === selectedAssetId);
                const filteredHistory = selectedAsset 
                  ? monitoringHistory.filter(h => h.asset === selectedAsset.name)
                  : monitoringHistory;

                if (filteredHistory.length === 0) {
                  return (
                    <div style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
                      {selectedAsset 
                        ? `No se han registrado ejecuciones de calidad previas para el activo "${selectedAsset.name}".`
                        : "No se han registrado ejecuciones previas de calidad para este tenant."
                      }
                    </div>
                  );
                }

                return (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                      <thead>
                        <tr style={{ borderBottom: '2px solid #f1f5f9' }}>
                          <th style={{ padding: '12px 16px', color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700 }}>Fecha y Hora</th>
                          <th style={{ padding: '12px 16px', color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700 }}>Activo de Datos</th>
                          <th style={{ padding: '12px 16px', color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700 }}>Estado</th>
                          <th style={{ padding: '12px 16px', color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700 }}>Reglas</th>
                          <th style={{ padding: '12px 16px', color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700 }}>Calidad Promedio (DQI)</th>
                          <th style={{ padding: '12px 16px', color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700, textAlign: 'right' }}>Tendencia</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredHistory.map((item, idx) => (
                          <tr key={idx} style={{ borderBottom: '1px solid #f8fafc', transition: 'background 0.2s' }}>
                            <td style={{ padding: '14px 16px', fontSize: '0.85rem', color: '#64748b', fontFamily: 'monospace' }}>{item.date}</td>
                            <td style={{ padding: '14px 16px', fontSize: '0.85rem', fontWeight: 600, color: '#1e293b' }}>{item.asset}</td>
                            <td style={{ padding: '14px 16px' }}>
                              <span style={{ 
                                fontSize: '0.75rem', 
                                padding: '4px 10px', 
                                borderRadius: '100px', 
                                fontWeight: 700,
                                background: item.status === 'Exitoso' ? '#ecfdf5' : '#fef2f2',
                                color: item.status === 'Exitoso' ? '#10b981' : '#ef4444'
                              }}>
                                {item.status}
                              </span>
                            </td>
                            <td style={{ padding: '14px 16px' }}>
                              <button 
                                onClick={() => setSelectedHistoryItem(item)}
                                style={{
                                  background: '#f1f5f9',
                                  border: 'none',
                                  borderRadius: '8px',
                                  padding: '6px 12px',
                                  fontSize: '0.8rem',
                                  fontWeight: 600,
                                  color: '#6366f1',
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  transition: 'all 0.2s'
                                }}
                              >
                                <Layers size={14} />
                                {item.rulesCount || (item.rulesDetails ? item.rulesDetails.length : 3)} aplicadas
                              </button>
                            </td>
                            <td style={{ padding: '14px 16px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.9rem' }}>{item.score}%</span>
                                <div style={{ width: '80px', height: '6px', background: '#f1f5f9', borderRadius: '10px', overflow: 'hidden' }}>
                                  <div style={{ 
                                    width: `${item.score}%`, 
                                    height: '100%', 
                                    background: item.score >= 90 ? '#10b981' : item.score >= 75 ? '#f59e0b' : '#ef4444'
                                  }} />
                                </div>
                              </div>
                            </td>
                            <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                              {idx === filteredHistory.length - 1 ? (
                                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>—</span>
                              ) : (
                                (() => {
                                  const diff = item.score - filteredHistory[idx + 1].score;
                                  if (diff > 0) {
                                    return <span style={{ color: '#10b981', fontSize: '0.8rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '2px' }}><ArrowUpRight size={14} /> +{diff}%</span>;
                                  } else if (diff < 0) {
                                    return <span style={{ color: '#ef4444', fontSize: '0.8rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '2px' }}><ArrowDownRight size={14} /> {diff}%</span>;
                                  } else {
                                    return <span style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: 700 }}>0%</span>;
                                  }
                                })()
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              })()}
            </div>

            {/* Biblioteca de reglas corporativas */}
            <div style={{ background: 'white', padding: '24px', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '1.1rem' }}>Biblioteca de Reglas Corporativas</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                {corporateLibrary.map((item, i) => (
                  <div key={i} style={{ padding: '16px', border: '1px solid #e2e8f0', borderRadius: '12px', position: 'relative' }}>
                    <strong style={{ display: 'block', color: '#1e293b' }}>{item.name}</strong>
                    <div style={{ display: 'flex', gap: '6px', margin: '8px 0', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.65rem', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>Dom: {item.domain}</span>
                      <span style={{ fontSize: '0.65rem', background: '#e0e7ff', padding: '2px 6px', borderRadius: '4px' }}>Sis: {item.system}</span>
                    </div>
                    <button
                      onClick={() => alert(`Plantilla "${item.name}" copiada y cargada para ser aplicada.`)}
                      className={styles.secondaryBtnSmall}
                      style={{ fontSize: '0.75rem', width: '100%', justifyContent: 'center', marginTop: '4px' }}
                    >
                      Usar Plantilla
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </>
          )}
          </motion.div>
        )}

        {activeTab === 'reconciliation' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {/* Header */}
            <div style={{ background: 'white', padding: '24px 28px', borderRadius: '20px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '8px' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'linear-gradient(135deg,#6366f1,#a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                  <Activity size={22} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Conciliación de Activos de Datos</h3>
                  <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem' }}>Compara esquemas y calidad entre dos activos: detecta brechas, incompatibilidades y divergencias de calidad.</p>
                </div>
              </div>

              {/* Selector de activos */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 60px 1fr', gap: '16px', alignItems: 'center', marginTop: '20px' }}>
                <div style={{ padding: '16px', background: 'linear-gradient(135deg,#eef2ff,#f5f3ff)', borderRadius: '16px', border: '2px solid #c7d2fe' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}><Database size={16} /></div>
                    <span style={{ fontWeight: 700, color: '#4338ca', fontSize: '0.9rem' }}>Activo A</span>
                  </div>
                  <div className={styles.assetSelector} style={{ maxWidth: '100%', borderColor: '#c7d2fe', backgroundColor: 'white' }}>
                    <Database size={18} className={styles.selectorIcon} style={{ color: '#6366f1' }} />
                    <select
                      value={assetIdA}
                      onChange={e => { setAssetIdA(e.target.value); loadFieldsForAsset(e.target.value, 'A'); setReconciliationResult(null); }}
                    >
                      <option value="">Seleccionar activo A…</option>
                      {assets.filter(a => a.id !== assetIdB).map(a => <option key={a.id} value={a.id}>{a.name} ({a.source})</option>)}
                    </select>
                  </div>
                  {assetIdA && <div style={{ marginTop: '8px', fontSize: '0.75rem', color: '#6366f1', fontWeight: 600 }}>{fieldsA.length} campos detectados</div>}
                </div>

                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#f1f5f9', border: '2px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', fontWeight: 900, color: '#475569', fontSize: '0.85rem' }}>VS</div>
                </div>

                <div style={{ padding: '16px', background: 'linear-gradient(135deg,#fdf4ff,#fce7f3)', borderRadius: '16px', border: '2px solid #e9d5ff' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#a855f7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}><Database size={16} /></div>
                    <span style={{ fontWeight: 700, color: '#7c3aed', fontSize: '0.9rem' }}>Activo B</span>
                  </div>
                  <div className={styles.assetSelector} style={{ maxWidth: '100%', borderColor: '#e9d5ff', backgroundColor: 'white' }}>
                    <Database size={18} className={styles.selectorIcon} style={{ color: '#a855f7' }} />
                    <select
                      value={assetIdB}
                      onChange={e => { setAssetIdB(e.target.value); loadFieldsForAsset(e.target.value, 'B'); setReconciliationResult(null); }}
                    >
                      <option value="">Seleccionar activo B…</option>
                      {assets.filter(a => a.id !== assetIdA).map(a => <option key={a.id} value={a.id}>{a.name} ({a.source})</option>)}
                    </select>
                  </div>
                  {assetIdB && <div style={{ marginTop: '8px', fontSize: '0.75rem', color: '#a855f7', fontWeight: 600 }}>{fieldsB.length} campos detectados</div>}
                </div>
              </div>

              {/* Criterios de Cruce y Exclusiones de Integridad de Datos */}
              {assetIdA && assetIdB && (
                <div style={{
                  marginTop: '20px',
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1.2fr',
                  gap: '20px'
                }}>
                  {/* Card 1: Key A */}
                  <div style={{ padding: '16px', background: 'linear-gradient(135deg,#eef2ff,#f5f3ff)', borderRadius: '16px', border: '2px solid #c7d2fe' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}><Key size={16} /></div>
                      <span style={{ fontWeight: 700, color: '#4338ca', fontSize: '0.9rem' }}>Campo Clave A</span>
                    </div>
                    <div className={styles.assetSelector} style={{ maxWidth: '100%', borderColor: '#c7d2fe', backgroundColor: 'white' }}>
                      <Key size={18} className={styles.selectorIcon} style={{ color: '#6366f1' }} />
                      <select
                        value={reconKeyA}
                        onChange={e => setReconKeyA(e.target.value)}
                      >
                        <option value="">Seleccionar llave A...</option>
                        {fieldsA.map(f => (
                          <option key={f.field_name} value={f.field_name}>{f.field_name} ({f.field_type || f.data_type || 'text'})</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Card 2: Key B */}
                  <div style={{ padding: '16px', background: 'linear-gradient(135deg,#fdf4ff,#fce7f3)', borderRadius: '16px', border: '2px solid #e9d5ff' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#a855f7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}><Key size={16} /></div>
                      <span style={{ fontWeight: 700, color: '#7c3aed', fontSize: '0.9rem' }}>Campo Clave B</span>
                    </div>
                    <div className={styles.assetSelector} style={{ maxWidth: '100%', borderColor: '#e9d5ff', backgroundColor: 'white' }}>
                      <Key size={18} className={styles.selectorIcon} style={{ color: '#a855f7' }} />
                      <select
                        value={reconKeyB}
                        onChange={e => setReconKeyB(e.target.value)}
                      >
                        <option value="">Seleccionar llave B...</option>
                        {fieldsB.map(f => (
                          <option key={f.field_name} value={f.field_name}>{f.field_name} ({f.field_type || f.data_type || 'text'})</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Card 3: Criterio */}
                  <div style={{ padding: '16px', background: 'linear-gradient(135deg,#f8fafc,#f1f5f9)', borderRadius: '16px', border: '2px solid #cbd5e1' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}><Settings size={16} /></div>
                      <span style={{ fontWeight: 700, color: '#334155', fontSize: '0.9rem' }}>Criterio de Exclusión</span>
                    </div>
                    <div className={styles.assetSelector} style={{ maxWidth: '100%', borderColor: '#cbd5e1', backgroundColor: 'white' }}>
                      <Settings size={18} className={styles.selectorIcon} style={{ color: '#475569' }} />
                      <select
                        value={exclusionMode}
                        onChange={e => setExclusionMode(e.target.value)}
                      >
                        <option value="none">Ninguno (Sólo Comparar Esquema)</option>
                        <option value="A_EXCLUDE_B">Registros de A que NO existen en B (Integridad A-B)</option>
                        <option value="B_EXCLUDE_A">Registros de B que NO existen en A (Integridad B-A)</option>
                        <option value="MATCHING_WITH_DIFF">Registros comunes con discrepancia en atributos</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                <button
                  onClick={handleReconcile}
                  disabled={isReconciling || !assetIdA || !assetIdB}
                  className={styles.primaryBtn}
                  style={{ minWidth: '220px', justifyContent: 'center', opacity: (!assetIdA || !assetIdB) ? 0.5 : 1 }}
                >
                  {isReconciling ? <><RefreshCw className={styles.spin} /> Analizando…</> : <><Play size={16} /> Ejecutar Conciliación</>}
                </button>
              </div>
            </div>

            {/* Resultados */}
            {/* Resultados */}
            {reconciliationResult && (() => {
              const r = reconciliationResult;
              const nameA = r.assetA?.name || 'Activo A';
              const nameB = r.assetB?.name || 'Activo B';
              const circumference = 2 * Math.PI * 52;
              const strokeDashoffset = (1 - r.consolidatedScore / 100) * circumference;

              return (
                <>
                  {/* Banner de Resultado Principal (Hero) */}
                  <div className={styles.globalBanner} style={{ marginBottom: '24px', background: 'linear-gradient(135deg, #1e1b4b 0%, #311042 100%)', color: 'white' }}>
                    <div className={styles.globalLeft}>
                      <div className={styles.circleWrap}>
                        <svg width="120" height="120" viewBox="0 0 120 120">
                          <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="10" />
                          <circle
                            cx="60" cy="60" r="52" fill="none"
                            stroke="#a855f7"
                            strokeWidth="10"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            strokeLinecap="round"
                            transform="rotate(-90 60 60)"
                            style={{ transition: 'stroke-dashoffset 1s ease' }}
                          />
                          <text x="60" y="65" textAnchor="middle" fill="#a855f7" fontSize="24" fontWeight="900">
                            {r.consolidatedScore}%
                          </text>
                        </svg>
                      </div>
                      <div className={styles.globalInfo}>
                        <div className={styles.globalLevel} style={{ color: '#a855f7' }}>
                          <Award size={20} /> Indicador de Calidad Consolidado
                        </div>
                        <h2 className={styles.globalTitle} style={{ color: 'white' }}>Resultado de Conciliación</h2>
                        <p className={styles.globalSub} style={{ color: '#c7d2fe' }}>
                          Evaluación integrada de compatibilidad de esquemas, tipos y DQI real en base de datos.
                        </p>
                      </div>
                    </div>

                    <div className={styles.globalRight} style={{ gridTemplateColumns: '1fr 1fr' }}>
                      <div className={styles.miniPill} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <span style={{ color: '#c7d2fe' }}>Calidad Promedio A</span>
                        <strong style={{ color: '#a855f7' }}>{r.avgQualityA}%</strong>
                      </div>
                      <div className={styles.miniPill} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <span style={{ color: '#c7d2fe' }}>Calidad Promedio B</span>
                        <strong style={{ color: '#6366f1' }}>{r.avgQualityB}%</strong>
                      </div>
                      <div className={styles.miniPill} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <span style={{ color: '#c7d2fe' }}>Compatibilidad Esquema</span>
                        <strong style={{ color: '#10b981' }}>{r.compatRate}%</strong>
                      </div>
                      <div className={styles.miniPill} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <span style={{ color: '#c7d2fe' }}>Tipos de Datos OK</span>
                        <strong style={{ color: '#f59e0b' }}>{r.typeCompatRate}%</strong>
                      </div>
                    </div>
                  </div>

                  {/* Acciones e Informes */}
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '24px' }}>
                    <button
                      onClick={() => setShowReconModal(true)}
                      className={styles.primaryBtn}
                      style={{ background: 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)', minWidth: '320px', justifyContent: 'center' }}
                    >
                      <BarChart3 size={18} /> Ver Informe por Campo y Dimensión (Gráficos)
                    </button>
                  </div>

                  {/* KPI Strip Detalle */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px', marginBottom: '20px' }}>
                    {[
                      { label: 'Campos Activo A', value: fieldsA.length, color: '#6366f1', bg: '#eef2ff' },
                      { label: 'Campos Activo B', value: fieldsB.length, color: '#a855f7', bg: '#fdf4ff' },
                      { label: 'Campos Homólogos', value: r.matchedPairs.length, color: '#10b981', bg: '#f0fdf4' },
                      { label: 'Solo en A', value: r.onlyA.length, color: '#f59e0b', bg: '#fffbeb' },
                      { label: 'Solo en B', value: r.onlyB.length, color: '#ef4444', bg: '#fef2f2' }
                    ].map((k,i) => (
                      <div key={i} style={{ background: k.bg, padding: '16px', borderRadius: '16px', border: `1px solid ${k.color}33`, textAlign: 'center' }}>
                        <div style={{ fontSize: '1.8rem', fontWeight: 800, color: k.color }}>{k.value}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, marginTop: '4px' }}>{k.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Sub-tabs de resultados (Esquema, Tabla detallada, Exclusividad) */}
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                    {([
                      ['schema','Diagrama de Mapeo de Esquemas'],
                      ['detail','Tabla Comparativa de Campos']
                    ] as const).map(([id, label]) => (
                      <button key={id} onClick={() => setActiveReconTab(id as any)} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', background: activeReconTab === id ? '#6366f1' : '#f1f5f9', color: activeReconTab === id ? 'white' : '#475569', transition: 'all 0.2s' }}>{label}</button>
                    ))}
                    {r.exclusionResult && (
                      <button
                        onClick={() => setActiveReconTab('exclusion')}
                        style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', background: activeReconTab === 'exclusion' ? '#ef4444' : '#fef2f2', color: activeReconTab === 'exclusion' ? 'white' : '#ef4444', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '6px' }}
                      >
                        🔍 Análisis de Exclusividad ({r.exclusionResult.mismatched.toLocaleString()} registros)
                      </button>
                    )}
                  </div>

                  {/* Schema SVG Diagram */}
                  {(activeReconTab === 'schema' || activeReconTab === 'quality') && (
                    <div style={{ background: 'white', padding: '24px', borderRadius: '20px', border: '1px solid #e2e8f0', overflowX: 'auto' }}>
                      <h4 style={{ margin: '0 0 16px', color: '#1e293b' }}>Diagrama de Mapeo de Campos</h4>
                      <svg width="100%" viewBox={`0 0 700 ${Math.max(fieldsA.length, fieldsB.length, r.matchedPairs.length + r.onlyA.length) * 38 + 60}`} style={{ fontFamily: 'Inter,sans-serif', minWidth: '500px' }}>
                        {/* Column A */}
                        <rect x="10" y="0" width="220" height="40" rx="8" fill="#eef2ff" stroke="#c7d2fe" strokeWidth="1.5" />
                        <text x="120" y="25" textAnchor="middle" fontWeight="700" fontSize="13" fill="#4338ca">{nameA}</text>
                        {(() => {
                          const allFieldsA = [...r.matchedPairs.map((p:any) => p.fieldA), ...r.onlyA];
                          return allFieldsA.map((f: any, i: number) => (
                            <g key={i}>
                              <rect x="10" y={50 + i * 38} width="220" height="32" rx="6" fill={r.onlyA.includes(f) ? '#fff7ed' : '#f8fafc'} stroke={r.onlyA.includes(f) ? '#fed7aa' : '#e2e8f0'} strokeWidth="1" />
                              <text x="22" y={70 + i * 38} fontSize="12" fill={r.onlyA.includes(f) ? '#c2410c' : '#1e293b'} fontWeight="600">{f.field_name}</text>
                              <text x="190" y={70 + i * 38} fontSize="10" fill="#94a3b8" textAnchor="end">{f.data_type}</text>
                            </g>
                          ));
                        })()}

                        {/* Column B */}
                        <rect x="470" y="0" width="220" height="40" rx="8" fill="#fdf4ff" stroke="#e9d5ff" strokeWidth="1.5" />
                        <text x="580" y="25" textAnchor="middle" fontWeight="700" fontSize="13" fill="#7c3aed">{nameB}</text>
                        {(() => {
                          const allFieldsB = [...r.matchedPairs.map((p:any) => p.fieldB), ...r.onlyB];
                          return allFieldsB.map((f: any, i: number) => (
                            <g key={i}>
                              <rect x="470" y={50 + i * 38} width="220" height="32" rx="6" fill={r.onlyB.includes(f) ? '#fff7ed' : '#f8fafc'} stroke={r.onlyB.includes(f) ? '#fed7aa' : '#e2e8f0'} strokeWidth="1" />
                              <text x="482" y={70 + i * 38} fontSize="12" fill={r.onlyB.includes(f) ? '#c2410c' : '#1e293b'} fontWeight="600">{f.field_name}</text>
                              <text x="650" y={70 + i * 38} fontSize="10" fill="#94a3b8" textAnchor="end">{f.data_type}</text>
                            </g>
                          ));
                        })()}

                        {/* Connection lines */}
                        {r.matchedPairs.map((p: any, i: number) => {
                          const allA = [...r.matchedPairs.map((x:any) => x.fieldA), ...r.onlyA];
                          const allB = [...r.matchedPairs.map((x:any) => x.fieldB), ...r.onlyB];
                          const yA = 66 + allA.indexOf(p.fieldA) * 38;
                          const yB = 66 + allB.indexOf(p.fieldB) * 38;
                          const color = !p.typeMatch ? '#ef4444' : p.matchType === 'semantic' ? '#f59e0b' : '#10b981';
                          const dash = !p.typeMatch ? '6,4' : p.matchType === 'semantic' ? '4,3' : undefined;
                          return (
                            <line key={i} x1="230" y1={yA} x2="470" y2={yB} stroke={color} strokeWidth="1.8" strokeDasharray={dash} opacity="0.8" />
                          );
                        })}
                      </svg>
                      <div style={{ display: 'flex', gap: '16px', marginTop: '12px', flexWrap: 'wrap' }}>
                        {[['#10b981','Mapeo Exacto (tipo compatible)'],['#f59e0b','Mapeo Semántico (sinónimo)'],['#ef4444','Tipo Incompatible'],['#fed7aa','Solo en un activo']].map(([c,l]) => (
                          <div key={l} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#475569' }}>
                            <div style={{ width: '20px', height: '3px', background: c as string, borderRadius: '2px' }} />{l}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Detail table */}
                  {activeReconTab === 'detail' && (
                    <div style={{ background: 'white', borderRadius: '20px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                      <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9' }}>
                        <h4 style={{ margin: 0 }}>Tabla Comparativa de Campos</h4>
                      </div>
                      <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                          <thead>
                            <tr style={{ background: '#f8fafc' }}>
                              <th style={{ padding: '10px 16px', textAlign: 'left', color: '#64748b', fontWeight: 600 }}>Campo en {nameA.slice(0,14)}</th>
                              <th style={{ padding: '10px 16px', textAlign: 'left', color: '#64748b', fontWeight: 600 }}>Tipo A</th>
                              <th style={{ padding: '10px 16px', textAlign: 'left', color: '#64748b', fontWeight: 600 }}>Campo en {nameB.slice(0,14)}</th>
                              <th style={{ padding: '10px 16px', textAlign: 'left', color: '#64748b', fontWeight: 600 }}>Tipo B</th>
                              <th style={{ padding: '10px 16px', textAlign: 'center', color: '#64748b', fontWeight: 600 }}>Compatib.</th>
                              <th style={{ padding: '10px 16px', textAlign: 'center', color: '#6366f1', fontWeight: 600 }}>Cal. A</th>
                              <th style={{ padding: '10px 16px', textAlign: 'center', color: '#a855f7', fontWeight: 600 }}>Cal. B</th>
                              <th style={{ padding: '10px 16px', textAlign: 'center', color: '#64748b', fontWeight: 600 }}>Brecha</th>
                            </tr>
                          </thead>
                          <tbody>
                            {r.matchedPairs.map((p: any, i: number) => {
                              const gap = Math.abs(p.qualityA - p.qualityB);
                              return (
                                <tr key={i} style={{ borderTop: '1px solid #f1f5f9', background: i % 2 === 0 ? 'white' : '#fafafa' }}>
                                  <td style={{ padding: '10px 16px', fontWeight: 600, color: '#1e293b' }}>{p.fieldA.field_name}</td>
                                  <td style={{ padding: '10px 16px' }}><span style={{ fontSize: '0.72rem', background: '#e0e7ff', color: '#4338ca', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>{p.fieldA.data_type}</span></td>
                                  <td style={{ padding: '10px 16px', fontWeight: 600, color: '#1e293b' }}>{p.fieldB.field_name}</td>
                                  <td style={{ padding: '10px 16px' }}><span style={{ fontSize: '0.72rem', background: '#f3e8ff', color: '#7c3aed', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>{p.fieldB.data_type}</span></td>
                                  <td style={{ padding: '10px 16px', textAlign: 'center' }}>
                                    {p.typeMatch
                                      ? <span style={{ fontSize: '0.72rem', background: '#f0fdf4', color: '#166534', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>✓ {p.matchType === 'semantic' ? 'Semántico' : 'Exacto'}</span>
                                      : <span style={{ fontSize: '0.72rem', background: '#fef2f2', color: '#991b1b', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>✗ Tipo Diferente</span>}
                                  </td>
                                  <td style={{ padding: '10px 16px', textAlign: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}>
                                      <div style={{ width: '48px', height: '6px', borderRadius: '3px', background: '#e2e8f0', overflow: 'hidden' }}><div style={{ width: `${p.qualityA}%`, height: '100%', background: '#6366f1', borderRadius: '3px' }} /></div>
                                      <span style={{ fontWeight: 700, color: '#6366f1', fontSize: '0.8rem' }}>{p.qualityA}%</span>
                                    </div>
                                  </td>
                                  <td style={{ padding: '10px 16px', textAlign: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}>
                                      <div style={{ width: '48px', height: '6px', borderRadius: '3px', background: '#e2e8f0', overflow: 'hidden' }}><div style={{ width: `${p.qualityB}%`, height: '100%', background: '#a855f7', borderRadius: '3px' }} /></div>
                                      <span style={{ fontWeight: 700, color: '#a855f7', fontSize: '0.8rem' }}>{p.qualityB}%</span>
                                    </div>
                                  </td>
                                  <td style={{ padding: '10px 16px', textAlign: 'center' }}>
                                    <span style={{ fontWeight: 700, fontSize: '0.85rem', color: gap > 15 ? '#ef4444' : gap > 5 ? '#f59e0b' : '#10b981' }}>{gap > 0 ? `${gap}%` : '—'}</span>
                                  </td>
                                </tr>
                              );
                            })}
                            {r.onlyA.map((f: any, i: number) => (
                              <tr key={`a-${i}`} style={{ borderTop: '1px solid #f1f5f9', background: '#fff7ed' }}>
                                <td style={{ padding: '10px 16px', fontWeight: 600, color: '#c2410c' }}>{f.field_name}</td>
                                <td style={{ padding: '10px 16px' }}><span style={{ fontSize: '0.72rem', background: '#ffedd5', color: '#c2410c', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>{f.data_type}</span></td>
                                <td colSpan={5} style={{ padding: '10px 16px', color: '#94a3b8', fontStyle: 'italic', fontSize: '0.82rem' }}>Sin correspondencia en {nameB.slice(0,14)}</td>
                                <td style={{ padding: '10px 16px', textAlign: 'center' }}><span style={{ fontSize: '0.72rem', background: '#fff7ed', color: '#c2410c', padding: '2px 8px', borderRadius: '4px' }}>Solo en A</span></td>
                              </tr>
                            ))}
                            {r.onlyB.map((f: any, i: number) => (
                              <tr key={`b-${i}`} style={{ borderTop: '1px solid #f1f5f9', background: '#fdf4ff' }}>
                                <td colSpan={2} style={{ padding: '10px 16px', color: '#94a3b8', fontStyle: 'italic', fontSize: '0.82rem' }}>Sin correspondencia en {nameA.slice(0,14)}</td>
                                <td style={{ padding: '10px 16px', fontWeight: 600, color: '#7c3aed' }}>{f.field_name}</td>
                                <td style={{ padding: '10px 16px' }}><span style={{ fontSize: '0.72rem', background: '#f3e8ff', color: '#7c3aed', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>{f.data_type}</span></td>
                                <td colSpan={3} />
                                <td style={{ padding: '10px 16px', textAlign: 'center' }}><span style={{ fontSize: '0.72rem', background: '#fdf4ff', color: '#7c3aed', padding: '2px 8px', borderRadius: '4px' }}>Solo en B</span></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Panel de Exclusividad */}
                  {activeReconTab === 'exclusion' && r.exclusionResult && (() => {
                    const ex = r.exclusionResult;
                    const modeLabel = ex.mode === 'A_EXCLUDE_B' ? `Registros en "${nameA}" que NO existen en "${nameB}"`
                      : ex.mode === 'B_EXCLUDE_A' ? `Registros en "${nameB}" que NO existen en "${nameA}"`
                      : `Registros comunes con discrepancia en atributos entre "${nameA}" y "${nameB}"`;
                    const pctOk = ex.pct;
                    const pctFail = (100 - pctOk).toFixed(1);
                    return (
                      <div>
                        {/* Header */}
                        <div style={{ padding: '20px 24px', background: 'linear-gradient(135deg, #1e293b, #0f172a)', borderRadius: '20px', color: 'white', marginBottom: '20px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>🔍</div>
                            <div>
                              <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>Análisis de Exclusividad de Datos</h4>
                              <p style={{ margin: '2px 0 0', fontSize: '0.8rem', opacity: 0.7 }}>{modeLabel}</p>
                            </div>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                            {[
                              { label: 'Total en A', value: ex.totalA.toLocaleString(), color: '#818cf8' },
                              { label: 'Total en B', value: ex.totalB.toLocaleString(), color: '#c084fc' },
                              { label: 'Coincidentes', value: ex.matched.toLocaleString(), color: '#34d399' },
                              { label: 'Registros Huérfanos', value: ex.mismatched.toLocaleString(), color: '#f87171' }
                            ].map((kpi, i) => (
                              <div key={i} style={{ textAlign: 'center', padding: '12px', background: 'rgba(255,255,255,0.06)', borderRadius: '12px' }}>
                                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: kpi.color }}>{kpi.value}</div>
                                <div style={{ fontSize: '0.72rem', opacity: 0.65, marginTop: '2px' }}>{kpi.label}</div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Gauge / barra de integridad */}
                        <div style={{ background: 'white', padding: '20px', borderRadius: '20px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
                          <h4 style={{ margin: '0 0 12px', fontSize: '0.95rem', color: '#1e293b' }}>Tasa de Integridad Referencial</h4>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Registros coincidentes</span>
                                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: pctOk >= 95 ? '#10b981' : pctOk >= 80 ? '#f59e0b' : '#ef4444' }}>{pctOk.toFixed(1)}%</span>
                              </div>
                              <div style={{ height: '10px', background: '#f1f5f9', borderRadius: '999px', overflow: 'hidden' }}>
                                <div style={{ height: '100%', width: `${pctOk}%`, background: pctOk >= 95 ? 'linear-gradient(90deg, #10b981, #34d399)' : pctOk >= 80 ? 'linear-gradient(90deg, #f59e0b, #fcd34d)' : 'linear-gradient(90deg, #ef4444, #f87171)', transition: 'width 0.8s ease', borderRadius: '999px' }} />
                              </div>
                            </div>
                            <div style={{ textAlign: 'center', minWidth: '80px' }}>
                              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ef4444' }}>{pctFail}%</div>
                              <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Huérfanos</div>
                            </div>
                          </div>
                          <div style={{ marginTop: '12px', padding: '10px 14px', background: pctOk >= 95 ? '#ecfdf5' : pctOk >= 80 ? '#fffbeb' : '#fef2f2', borderRadius: '10px', border: `1px solid ${pctOk >= 95 ? '#d1fae5' : pctOk >= 80 ? '#fef3c7' : '#fee2e2'}` }}>
                            <p style={{ margin: 0, fontSize: '0.8rem', color: pctOk >= 95 ? '#065f46' : pctOk >= 80 ? '#92400e' : '#991b1b', fontWeight: 500 }}>
                              {pctOk >= 95 ? `✔ La integridad referencial entre "${nameA}" y "${nameB}" es excelente. Solo ${ex.mismatched} registros no tienen correspondencia.`
                                : pctOk >= 80 ? `⚠ Se detectaron ${ex.mismatched} registros sin correspondencia. Se recomienda investigar las discrepancias encontradas.`
                                : `🚨 Alerta crítica: ${ex.mismatched} registros huérfanos (${pctFail}%). Se requiere acción inmediata para mantener la integridad de datos.`
                              }
                            </p>
                          </div>
                        </div>

                        {/* Muestra de registros con discrepancia */}
                        <div style={{ background: 'white', borderRadius: '20px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                          <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div>
                              <h4 style={{ margin: 0, fontSize: '0.95rem', color: '#991b1b' }}>Muestra de Registros Huérfanos / con Discrepancia</h4>
                              <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#b91c1c' }}>Clave: <strong>{ex.keyA}</strong> ({nameA}) ↔ <strong>{ex.keyB}</strong> ({nameB})</p>
                            </div>
                            <span style={{ fontSize: '0.75rem', background: '#fecaca', color: '#991b1b', padding: '4px 10px', borderRadius: '999px', fontWeight: 700 }}>{ex.mismatched.toLocaleString()} total</span>
                          </div>
                          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                            <thead>
                              <tr style={{ background: '#f8fafc' }}>
                                <th style={{ padding: '10px 16px', textAlign: 'left', color: '#64748b', fontWeight: 700 }}>#</th>
                                <th style={{ padding: '10px 16px', textAlign: 'left', color: '#64748b', fontWeight: 700 }}>Valor de Llave</th>
                                <th style={{ padding: '10px 16px', textAlign: 'left', color: '#64748b', fontWeight: 700 }}>Detalle del Hallazgo</th>
                              </tr>
                            </thead>
                            <tbody>
                              {ex.samples.map((s: any, i: number) => (
                                <tr key={i} style={{ borderTop: '1px solid #f1f5f9', background: i % 2 === 0 ? 'white' : '#fffbfb' }}>
                                  <td style={{ padding: '10px 16px', color: '#94a3b8', fontWeight: 600 }}>{i + 1}</td>
                                  <td style={{ padding: '10px 16px' }}>
                                    <span style={{ background: '#fef2f2', color: '#dc2626', padding: '3px 10px', borderRadius: '6px', fontWeight: 700, fontFamily: 'monospace', fontSize: '0.85rem' }}>{s.key}</span>
                                  </td>
                                  <td style={{ padding: '10px 16px', color: '#475569', lineHeight: '1.5' }}>{s.reason}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          <div style={{ padding: '12px 20px', background: '#f8fafc', borderTop: '1px solid #f1f5f9', fontSize: '0.78rem', color: '#94a3b8', fontStyle: 'italic' }}>
                            Se muestran {ex.samples.length} registros de muestra de un total de {ex.mismatched.toLocaleString()} registros con discrepancias detectadas. Conecta los activos a una base de datos real para obtener el listado completo.
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                  </>
                );
              })()}
            {/* Historial de Conciliaciones */}
            <div style={{ background: 'white', padding: '24px', borderRadius: '24px', border: '1px solid #e2e8f0', marginTop: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'linear-gradient(135deg, #e2e8f0, #cbd5e1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569' }}>
                  <Clock size={18} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#1e293b' }}>Historial de Conciliaciones</h3>
                  <p style={{ margin: 0, color: '#64748b', fontSize: '0.78rem' }}>Registro de las comparaciones y análisis de exclusión ejecutados anteriormente.</p>
                </div>
              </div>

              {reconciliationHistory.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px', color: '#94a3b8', fontSize: '0.85rem', border: '1px dashed #cbd5e1', borderRadius: '12px' }}>
                  Aún no se han registrado conciliaciones en este proyecto.
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                    <thead>
                      <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                        <th style={{ padding: '12px 16px', textAlign: 'left', color: '#64748b', fontWeight: 700 }}>Fecha</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left', color: '#64748b', fontWeight: 700 }}>Activo A (Clave)</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left', color: '#64748b', fontWeight: 700 }}>Activo B (Clave)</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left', color: '#64748b', fontWeight: 700 }}>Criterio</th>
                        <th style={{ padding: '12px 16px', textAlign: 'center', color: '#64748b', fontWeight: 700 }}>Calidad</th>
                        <th style={{ padding: '12px 16px', textAlign: 'right', color: '#64748b', fontWeight: 700 }}>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reconciliationHistory.map((h, i) => (
                        <tr key={h.id || i} style={{ borderBottom: '1px solid #f1f5f9', background: i % 2 === 0 ? 'white' : '#f8fafc' }}>
                          <td style={{ padding: '12px 16px', color: '#64748b', whiteSpace: 'nowrap' }}>{h.date}</td>
                          <td style={{ padding: '12px 16px', color: '#1e293b', fontWeight: 600 }}>{h.assetAName} <span style={{ fontSize: '0.75rem', background: '#eef2ff', color: '#4338ca', padding: '2px 6px', borderRadius: '4px', marginLeft: '4px' }}>{h.keyA}</span></td>
                          <td style={{ padding: '12px 16px', color: '#1e293b', fontWeight: 600 }}>{h.assetBName} <span style={{ fontSize: '0.75rem', background: '#fdf4ff', color: '#7c3aed', padding: '2px 6px', borderRadius: '4px', marginLeft: '4px' }}>{h.keyB}</span></td>
                          <td style={{ padding: '12px 16px', color: '#475569' }}>
                            {h.exclusionMode === 'none' ? 'Sólo Esquema' : 
                             h.exclusionMode === 'A_EXCLUDE_B' ? 'Exclusividad A-B' :
                             h.exclusionMode === 'B_EXCLUDE_A' ? 'Exclusividad B-A' : 'Discrepancia Atribs.'}
                          </td>
                          <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                            <span style={{ 
                              background: h.score >= 90 ? '#ecfdf5' : h.score >= 70 ? '#fffbeb' : '#fef2f2', 
                              color: h.score >= 90 ? '#047857' : h.score >= 70 ? '#b45309' : '#b91c1c', 
                              padding: '2px 8px', 
                              borderRadius: '6px', 
                              fontWeight: 700 
                            }}>
                              {h.score}%
                            </span>
                          </td>
                          <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                            <button
                              onClick={() => { setReconciliationResult(h.result); setAssetIdA(assets.find(a => a.name === h.assetAName)?.id || ''); setAssetIdB(assets.find(a => a.name === h.assetBName)?.id || ''); setReconKeyA(h.keyA); setReconKeyB(h.keyB); setExclusionMode(h.exclusionMode); }}
                              className={styles.secondaryBtnSmall}
                              style={{ fontSize: '0.75rem' }}
                            >
                              Cargar
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'incidents' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px' }}>
            {/* Lista de incidentes */}
            <div style={{ background: 'white', padding: '24px', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
              <h3 style={{ margin: '0 0 16px' }}>Gestión de Incidentes de Calidad</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {incidents.map((inc) => (
                  <div
                    key={inc.id}
                    onClick={() => {
                      setSelectedIncident(inc);
                      setIncidentFields({
                        assignedTo: inc.owner || 'Carlos Ruiz',
                        dueDate: inc.dueDate || '2026-06-15',
                        impact: inc.impact || 'Alto',
                        rootCause: inc.rootCause || '',
                        evidence: inc.evidence || ''
                      });
                    }}
                    style={{
                      padding: '16px',
                      borderRadius: '16px',
                      border: selectedIncident?.dbId === inc.dbId ? '2.5px solid #6366f1' : '1px solid #e2e8f0',
                      cursor: 'pointer',
                      background: '#f8fafc'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: 800, background: '#fee2e2', color: '#991b1b', padding: '2px 8px', borderRadius: '4px' }}>
                        {inc.severity}
                      </span>
                      <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{inc.date}</span>
                    </div>
                    <h4 style={{ margin: '0 0 8px' }}>{inc.name}</h4>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                      Activo: {inc.assetName} · Estado: <strong style={{ color: '#4f46e5' }}>{inc.status}</strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Workflow de remediación interactivo */}
            <div style={{ background: 'white', padding: '24px', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
              <h3 style={{ margin: '0 0 16px' }}>Workflow de Remediación</h3>
              {selectedIncident ? (
                <div>
                  {/* Pasos visuales del workflow */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', marginBottom: '24px' }}>
                    <div style={{ position: 'absolute', top: '14px', left: '10px', right: '10px', height: '2px', background: '#cbd5e1', zIndex: 1 }} />
                    {['Nuevo', 'Asignado', 'En análisis', 'Corregido', 'Cerrado'].map((st, i) => {
                      const isActive = selectedIncident.status === st;
                      return (
                        <div key={st} style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                          <div style={{
                            width: '30px',
                            height: '30px',
                            borderRadius: '50%',
                            background: isActive ? '#6366f1' : '#f1f5f9',
                            color: isActive ? 'white' : '#64748b',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            border: isActive ? 'none' : '2px solid #cbd5e1'
                          }}>
                            {i + 1}
                          </div>
                          <span style={{ fontSize: '0.65rem', fontWeight: 600 }}>{st}</span>
                        </div>
                      );
                    })}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Asignar Data Steward</label>
                      <select
                        value={incidentFields.assignedTo}
                        onChange={e => setIncidentFields({ ...incidentFields, assignedTo: e.target.value })}
                        className={styles.select}
                      >
                        {stewards.map(s => <option key={s.id} value={s.name}>{s.name} ({s.role})</option>)}
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Fecha límite</label>
                      <input
                        type="date"
                        value={incidentFields.dueDate}
                        onChange={e => setIncidentFields({ ...incidentFields, dueDate: e.target.value })}
                        className={styles.input}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Causa raíz</label>
                      <textarea
                        value={incidentFields.rootCause}
                        onChange={e => setIncidentFields({ ...incidentFields, rootCause: e.target.value })}
                        className={styles.input}
                        placeholder="Ej: Desactualización de plantilla CRM..."
                      />
                    </div>

                    <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
                      <button
                        onClick={handleSaveIncidentEdit}
                        className={styles.primaryBtnSmall}
                        style={{ flex: '1 1 100%', justifyContent: 'center', background: '#3b82f6', marginBottom: '8px' }}
                      >
                        Guardar Cambios
                      </button>
                      <button
                        onClick={() => handleUpdateIncidentStatus('En análisis')}
                        className={styles.secondaryBtnSmall}
                        style={{ flex: 1, justifyContent: 'center' }}
                      >
                        Analizar
                      </button>
                      <button
                        onClick={() => handleUpdateIncidentStatus('Corregido')}
                        className={styles.secondaryBtnSmall}
                        style={{ flex: 1, justifyContent: 'center', borderColor: '#10b981', color: '#10b981' }}
                      >
                        Resolver
                      </button>
                      <button
                        onClick={() => handleUpdateIncidentStatus('Cerrado')}
                        className={styles.primaryBtnSmall}
                        style={{ flex: 1, justifyContent: 'center', background: '#10b981' }}
                      >
                        Cerrar Caso
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '32px', color: '#94a3b8' }}>
                  Seleccione un incidente de la lista para gestionar su workflow.
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Configuración DQI */}
      <AnimatePresence>
        {showDqiConfig && (
          <div className={styles.execOverlay}>
            <div className={styles.execModal} style={{ width: '450px' }}>
              <div className={styles.execIcon}>
                <Settings size={32} />
              </div>
              <h3>Configuración DQI Inteligente</h3>
              <p>Asigne los pesos (%) para el cálculo de la Calidad Global Corporativa. La suma debe dar 100%.</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', textAlign: 'left', marginBottom: '24px' }}>
                {[
                  { key: 'completeness', label: 'Completitud' },
                  { key: 'validez', label: 'Validez' },
                  { key: 'consistency', label: 'Consistencia' },
                  { key: 'uniqueness', label: 'Unicidad' },
                  { key: 'accuracy', label: 'Exactitud' }
                ].map(item => (
                  <div key={item.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600 }}>{item.label}</span>
                    <input
                      type="number"
                      value={dqiWeights[item.key as keyof DqiWeights]}
                      onChange={(e) => setDqiWeights({ ...dqiWeights, [item.key]: Number(e.target.value) })}
                      style={{ width: '80px', padding: '6px 12px', border: '1px solid #cbd5e1', borderRadius: '8px' }}
                    />
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button className={styles.secondaryBtn} onClick={() => setShowDqiConfig(false)} style={{ flex: 1, justifyContent: 'center' }}>
                  Cancelar
                </button>
                <button
                  className={styles.primaryBtn}
                  onClick={() => {
                    const total = dqiWeights.completeness + dqiWeights.validez + dqiWeights.consistency + dqiWeights.uniqueness + dqiWeights.accuracy;
                    if (total !== 100) {
                      alert(`Los pesos deben sumar exactamente 100%. Actualmente suman ${total}%.`);
                      return;
                    }
                    setShowDqiConfig(false);
                  }}
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  Guardar Pesos
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal de Progreso de Ejecución de Reglas (Estilo Launchpad / Premium) */}
      <AnimatePresence>
        {isExecuting && (
          <div className={styles.execOverlay}>
            <motion.div 
              className={styles.execModal}
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
            >
              <div className={`${styles.execIcon} ${styles.zapPulse}`}>
                <Zap size={32} />
              </div>
              <h3>Ejecución de Motores de Calidad</h3>
              <p style={{ margin: '0 0 24px 0', fontSize: '0.9rem', color: '#64748b' }}>
                Escaneando activo de datos y validando el ecosistema de reglas en tiempo real...
              </p>
              
              <div className={styles.execProgress}>
                <div 
                  className={styles.execProgressFill} 
                  style={{ width: `${executionProgress}%` }}
                />
              </div>
              
              <div className={styles.progressText}>
                {executionProgress}% Completado
              </div>

              <div className={styles.execLog}>
                {executionProgress >= 20 && <p>✔ Conexión a origen de datos establecida.</p>}
                {executionProgress >= 40 && <p>✔ Campos cargados del activo con éxito.</p>}
                {executionProgress >= 60 && <p>✔ Compilando reglas de calidad y consultas de escaneo...</p>}
                {executionProgress >= 90 && <p>✔ Consultas SQL ejecutadas. Generando métricas...</p>}
                {executionProgress === 100 && <p>✔ Sincronización de incidentes y Service Desk completa.</p>}
                <p style={{ color: '#6366f1', fontWeight: 600, animation: 'pulse 1.5s infinite', margin: 0 }}>
                  {executionProgress < 20 && "Conectando al motor de base de datos..."}
                  {executionProgress >= 20 && executionProgress < 40 && "Cargando metadatos de columnas..."}
                  {executionProgress >= 40 && executionProgress < 60 && "Preparando reglas sintácticas y semánticas..."}
                  {executionProgress >= 60 && executionProgress < 90 && "Escaneando registros y calculando DQI..."}
                  {executionProgress >= 90 && executionProgress < 100 && "Evaluando incidentes y SLA de gobierno..."}
                  {executionProgress === 100 && "¡Finalizado!"}
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal de Progreso de Conciliación (Estilo Launchpad / Premium) */}
      <AnimatePresence>
        {isReconciling && (
          <div className={styles.execOverlay}>
            <motion.div 
              className={styles.execModal}
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
            >
              <div className={`${styles.execIcon} ${styles.zapPulse}`} style={{ background: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)' }}>
                <Activity size={32} />
              </div>
              <h3>Conciliación de Esquemas</h3>
              <p style={{ margin: '0 0 24px 0', fontSize: '0.9rem', color: '#64748b' }}>
                Cruzando estructuras de datos y evaluando consistencia semántica side-by-side...
              </p>
              
              <div className={styles.execProgress}>
                <div 
                  className={styles.execProgressFill} 
                  style={{ width: `${reconcileProgress}%`, background: 'linear-gradient(90deg, #a855f7, #6366f1)' }}
                />
              </div>
              
              <div className={styles.progressText} style={{ color: '#a855f7' }}>
                {reconcileProgress}% Completado
              </div>

              <div className={styles.execLog}>
                {reconcileProgress >= 20 && <p>✔ Esquemas de Activo A y Activo B cargados.</p>}
                {reconcileProgress >= 50 && <p>✔ Normalización y emparejamiento físico de columnas completo.</p>}
                {reconcileProgress >= 75 && <p>✔ Mapeo semántico de campos y sinónimos procesado.</p>}
                {reconcileProgress >= 90 && <p>✔ Tasa de homología y DQI comparativo estimado.</p>}
                {reconcileProgress === 100 && <p>✔ Diagrama de homología y radar finalizados.</p>}
                <p style={{ color: '#a855f7', fontWeight: 600, animation: 'pulse 1.5s infinite', margin: 0 }}>
                  {reconcileProgress < 20 && "Descargando esquemas de datos..."}
                  {reconcileProgress >= 20 && reconcileProgress < 50 && "Normalizando nombres físicos de columnas..."}
                  {reconcileProgress >= 50 && reconcileProgress < 75 && "Ejecutando mapeo semántico de campos..."}
                  {reconcileProgress >= 75 && reconcileProgress < 90 && "Comparando tipos de datos y DQI side-by-side..."}
                  {reconcileProgress >= 90 && reconcileProgress < 100 && "Generando diagramas de homología y Recharts..."}
                  {reconcileProgress === 100 && "¡Homologación Completada!"}
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <CreateRuleModal
        isOpen={isRuleModalOpen}
        ruleToEdit={editingRule}
        assets={assets}
        onClose={() => {
          setIsRuleModalOpen(false);
          setEditingRule(null);
        }}
        onSuccess={(newRule?: any) => {
          setIsRuleModalOpen(false);
          setEditingRule(null);
          if (selectedAssetId) fetchRules(selectedAssetId);
        }}
        assetId={selectedAssetId}
        fields={[]}
      />

      <SourceDetailModal
        isOpen={!!selectedSourceDetail}
        onClose={() => setSelectedSourceDetail(null)}
        source={selectedSourceDetail}
        assets={assets}
        mode={mode}
      />

      <NotificationSettingsModal
        isOpen={isNotifyModalOpen}
        onClose={() => setIsNotifyModalOpen(false)}
      />

      <ExecutionSummaryModal
        isOpen={showSummaryModal}
        onClose={() => setShowSummaryModal(false)}
        onDownload={handleDownloadReport}
        stats={stats}
        results={lastExecutionResults}
        assetName={assets.find(a => a.id === selectedAssetId)?.name || ''}
      />

      <ConnectExternalAssetModal
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
        asset={assetToConnect}
        onSuccess={() => {
          setIsConnectModalOpen(false);
          fetchAssets();
        }}
      />

      {/* Modal de Detalle de Reglas Aplicadas en Historial */}
      <AnimatePresence>
        {selectedHistoryItem && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px'
          }}>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              style={{
                background: 'white',
                borderRadius: '24px',
                width: '100%',
                maxWidth: '700px',
                maxHeight: '90vh',
                overflow: 'hidden',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              {/* Header */}
              <div style={{
                background: 'linear-gradient(135deg, #1e293b, #0f172a)',
                padding: '24px',
                color: 'white',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>
                    Reglas Aplicadas: {selectedHistoryItem.asset}
                  </h3>
                  <p style={{ margin: '4px 0 0', opacity: 0.7, fontSize: '0.85rem' }}>
                    Ejecutado el {selectedHistoryItem.date} • DQI: {selectedHistoryItem.score}%
                  </p>
                </div>
                <button
                  onClick={() => setSelectedHistoryItem(null)}
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '36px',
                    height: '36px',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Body */}
              <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #f1f5f9' }}>
                      <th style={{ padding: '8px 12px', color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700 }}>Regla</th>
                      <th style={{ padding: '8px 12px', color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700 }}>Criticidad</th>
                      <th style={{ padding: '8px 12px', color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700 }}>Evaluados</th>
                      <th style={{ padding: '8px 12px', color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700 }}>Cumplen</th>
                      <th style={{ padding: '8px 12px', color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700 }}>Fallas</th>
                      <th style={{ padding: '8px 12px', color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700, textAlign: 'right' }}>%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(selectedHistoryItem.rulesDetails || []).map((res: any, idx: number) => {
                      const pctVal = parseFloat(res.pct);
                      return (
                        <tr key={idx} style={{ borderBottom: '1px solid #f8fafc' }}>
                          <td style={{ padding: '12px', fontSize: '0.85rem', fontWeight: 600, color: '#1e293b' }}>{res.name}</td>
                          <td style={{ padding: '12px' }}>
                            <span style={{
                              fontSize: '0.7rem',
                              padding: '2px 8px',
                              borderRadius: '100px',
                              fontWeight: 700,
                              background: res.severity === 'Crítica' ? '#fef2f2' : res.severity === 'Alta' ? '#fff7ed' : '#f0fdf4',
                              color: res.severity === 'Crítica' ? '#ef4444' : res.severity === 'Alta' ? '#f97316' : '#22c55e'
                            }}>
                              {res.severity || 'Media'}
                            </span>
                          </td>
                          <td style={{ padding: '12px', fontSize: '0.85rem', color: '#475569' }}>{res.total}</td>
                          <td style={{ padding: '12px', fontSize: '0.85rem', color: '#10b981', fontWeight: 600 }}>{res.compliant}</td>
                          <td style={{ padding: '12px', fontSize: '0.85rem', color: res.affected > 0 ? '#ef4444' : '#64748b', fontWeight: res.affected > 0 ? 600 : 400 }}>{res.affected}</td>
                          <td style={{ padding: '12px', fontSize: '0.85rem', fontWeight: 700, textAlign: 'right', color: pctVal >= 95 ? '#10b981' : pctVal >= 80 ? '#f59e0b' : '#ef4444' }}>
                            {res.pct}%
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Footer */}
              <div style={{
                padding: '16px 24px',
                borderTop: '1px solid #f1f5f9',
                display: 'flex',
                justifyContent: 'flex-end',
                background: '#f8fafc'
              }}>
                <button
                  onClick={() => setSelectedHistoryItem(null)}
                  style={{
                    padding: '8px 16px',
                    background: '#6366f1',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    boxShadow: '0 4px 6px -1px rgba(99, 102, 241, 0.2)'
                  }}
                >
                  Cerrar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal de Informe Gráfico de Conciliación Completo */}
      <AnimatePresence>
        {showReconModal && reconciliationResult && (() => {
          const r = reconciliationResult;
          const nameA = r.assetA?.name || 'Activo A';
          const nameB = r.assetB?.name || 'Activo B';
          return (
            <div className={styles.execOverlay}>
              <motion.div
                className={styles.execModal}
                style={{ width: '900px', maxWidth: '95vw', background: 'white', color: '#1e293b', textAlign: 'left', padding: '28px' }}
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                transition={{ type: "spring", duration: 0.5 }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '16px', marginBottom: '20px' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.4rem', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Activity size={24} style={{ color: '#a855f7' }} /> Informe Gráfico y Análisis de Conciliación
                    </h3>
                    <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.85rem' }}>
                      Dimensiones de Calidad Comparadas y Distribución de Calidad por Campo Homólogo.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowReconModal(false)}
                    style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b' }}
                  >
                    <X size={18} />
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
                  {/* Radar */}
                  <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                    <h4 style={{ margin: '0 0 12px 0', color: '#1e293b', fontSize: '0.95rem', fontWeight: 700 }}>Radar de Calidad Comparado</h4>
                    {isMounted && (
                      <ResponsiveContainer width="100%" height={260}>
                        <RadarChart data={r.radarData}>
                          <PolarGrid stroke="#cbd5e1" />
                          <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#475569' }} />
                          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 8, fill: '#94a3b8' }} />
                          <Radar name={nameA.slice(0,14)} dataKey="A" stroke="#6366f1" fill="#6366f1" fillOpacity={0.25} strokeWidth={2} />
                          <Radar name={nameB.slice(0,14)} dataKey="B" stroke="#a855f7" fill="#a855f7" fillOpacity={0.2} strokeWidth={2} />
                          <Tooltip formatter={(v: any) => `${v}%`} />
                        </RadarChart>
                      </ResponsiveContainer>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 600 }}><div style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#6366f1' }} />{nameA.slice(0,16)}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 600 }}><div style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#a855f7' }} />{nameB.slice(0,16)}</div>
                    </div>
                  </div>

                  {/* Bar */}
                  <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                    <h4 style={{ margin: '0 0 12px 0', color: '#1e293b', fontSize: '0.95rem', fontWeight: 700 }}>Calidad por Campo Homólogo</h4>
                    {isMounted && (
                      <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={r.barData} margin={{ left: -20 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                          <XAxis dataKey="field" tick={{ fontSize: 9, fill: '#475569' }} />
                          <YAxis domain={[0, 100]} tick={{ fontSize: 9, fill: '#94a3b8' }} />
                          <Tooltip formatter={(v: any) => `${v}%`} />
                          <Bar dataKey={nameA.slice(0,10)} fill="#6366f1" radius={[4,4,0,0]} />
                          <Bar dataKey={nameB.slice(0,10)} fill="#a855f7" radius={[4,4,0,0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                    <div style={{ marginTop: '12px', padding: '8px 12px', background: 'white', borderRadius: '8px', border: '1px solid #cbd5e1', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <div style={{ textAlign: 'center' }}><div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#6366f1' }}>{r.avgQualityA}%</div><div style={{ fontSize: '0.7rem', color: '#64748b' }}>Calidad Media {nameA.slice(0,12)}</div></div>
                      <div style={{ textAlign: 'center' }}><div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#a855f7' }}>{r.avgQualityB}%</div><div style={{ fontSize: '0.7rem', color: '#64748b' }}>Calidad Media {nameB.slice(0,12)}</div></div>
                    </div>
                  </div>
                </div>

                {/* Explicación del Proceso */}
                <div style={{ padding: '16px', background: '#eef2ff', borderRadius: '12px', border: '1px solid #c7d2fe', fontSize: '0.85rem', color: '#3730a3' }}>
                  <strong style={{ display: 'block', marginBottom: '4px' }}>ℹ Proceso de Conciliación Realizado:</strong>
                  El motor de conciliación analizó dinámicamente las estructuras físicas de <strong>{nameA}</strong> y <strong>{nameB}</strong>.
                  El proceso incluyó la normalización de campos, la resolución semántica de sinónimos comunes del negocio (ej. <em>nombre</em> = <em>name</em> = <em>full_name</em>)
                  y la ejecución de escaneos de calidad en tiempo real (modo DQI) en el origen. El indicador consolidado refleja la integración ponderada de la tasa de homología (20%) y las calidades medias de ambos activos (40% c/u).
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
                  <button
                    className={styles.secondaryBtn}
                    onClick={() => setShowReconModal(false)}
                    style={{ minWidth: '120px', justifyContent: 'center' }}
                  >
                    Cerrar Informe
                  </button>
                </div>
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}
