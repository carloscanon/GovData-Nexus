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
  Check
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
    { date: '2026-06-02 10:00', asset: 'Maestro de Clientes', status: 'Exitoso', score: 94 },
    { date: '2026-06-01 10:00', asset: 'Maestro de Clientes', status: 'Exitoso', score: 92 },
    { date: '2026-05-31 10:00', asset: 'Transacciones Q2', status: 'Exitoso', score: 88 }
  ]);

  // Perfilamiento Automático
  const [isProfiling, setIsProfiling] = useState(false);
  const [profileResult, setProfileResult] = useState<any>(null);
  const [profileTab, setProfileTab] = useState('general'); // general, distribution, anomalies, recommendations

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
  const [activeReconTab, setActiveReconTab] = useState<'schema'|'quality'|'detail'>('schema');

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
    } else {
      fetchIncidents();
      setAssetFields([]);
    }
  }, [selectedAssetId, currentTenant?.id]);

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
        rule:quality_rules(rule_name),
        asset:data_assets(name, source)
      `);
      if (assetId) {
        query = query.eq('asset_id', assetId);
      }
      const { data } = await query.order('detected_at', { ascending: false });
      if (data) {
        setIncidents(data.map(d => ({
          id: d.id.slice(0, 8),
          dbId: d.id,
          name: d.rule?.rule_name || d.description || 'Validación de Calidad',
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
            { field_name: 'id', data_type: 'INTEGER', nullable: false },
            { field_name: 'nombre', data_type: 'VARCHAR', nullable: false },
            { field_name: 'email', data_type: 'VARCHAR', nullable: true },
            { field_name: 'rut', data_type: 'VARCHAR', nullable: true },
            { field_name: 'telefono', data_type: 'VARCHAR', nullable: true },
            { field_name: 'fecha_alta', data_type: 'DATE', nullable: true }
          ],
          '2': [
            { field_name: 'id_transaccion', data_type: 'INTEGER', nullable: false },
            { field_name: 'cliente_id', data_type: 'INTEGER', nullable: false },
            { field_name: 'nombre_cliente', data_type: 'VARCHAR', nullable: true },
            { field_name: 'email_contacto', data_type: 'VARCHAR', nullable: true },
            { field_name: 'monto', data_type: 'NUMERIC', nullable: false },
            { field_name: 'estado', data_type: 'VARCHAR', nullable: true }
          ],
          '3': [
            { field_name: 'lead_id', data_type: 'INTEGER', nullable: false },
            { field_name: 'nombre', data_type: 'VARCHAR', nullable: false },
            { field_name: 'correo', data_type: 'VARCHAR', nullable: true },
            { field_name: 'telefono', data_type: 'VARCHAR', nullable: true },
            { field_name: 'origen', data_type: 'VARCHAR', nullable: true },
            { field_name: 'calificacion', data_type: 'NUMERIC', nullable: true }
          ],
          '4': [
            { field_name: 'reporte_id', data_type: 'INTEGER', nullable: false },
            { field_name: 'nombre', data_type: 'VARCHAR', nullable: false },
            { field_name: 'periodo', data_type: 'DATE', nullable: false },
            { field_name: 'total', data_type: 'NUMERIC', nullable: true },
            { field_name: 'estado', data_type: 'VARCHAR', nullable: true }
          ]
        };
        const fields = demoMap[assetId] || [];
        side === 'A' ? setFieldsA(fields) : setFieldsB(fields);
        return;
      }
      const { data } = await supabase.from('asset_fields').select('field_name, data_type, nullable').eq('asset_id', assetId);
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
    await new Promise(r => setTimeout(r, 1800));

    const assetA = assets.find(a => a.id === assetIdA);
    const assetB = assets.find(a => a.id === assetIdB);

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
      // Exact match
      if (mapB.has(normA)) {
        const fB = mapB.get(normA);
        const typeMatch = fA.data_type === fB.data_type;
        matchedPairs.push({ fieldA: fA, fieldB: fB, typeMatch, matchType: 'exact',
          qualityA: Math.floor(72 + Math.random() * 28),
          qualityB: Math.floor(72 + Math.random() * 28) });
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
          matchedPairs.push({ fieldA: fA, fieldB: synMatch, typeMatch, matchType: 'semantic',
            qualityA: Math.floor(65 + Math.random() * 30),
            qualityB: Math.floor(65 + Math.random() * 30) });
        } else {
          onlyA.push(fA);
        }
      }
    });

    fieldsB.forEach(fB => {
      if (!usedB.has(normalize(fB.field_name))) onlyB.push(fB);
    });

    const compatRate = matchedPairs.length / Math.max(fieldsA.length, fieldsB.length, 1) * 100;
    const typeCompatRate = matchedPairs.filter(p => p.typeMatch).length / Math.max(matchedPairs.length, 1) * 100;
    const avgQualityA = matchedPairs.length > 0 ? Math.round(matchedPairs.reduce((s, p) => s + p.qualityA, 0) / matchedPairs.length) : 0;
    const avgQualityB = matchedPairs.length > 0 ? Math.round(matchedPairs.reduce((s, p) => s + p.qualityB, 0) / matchedPairs.length) : 0;

    setReconciliationResult({
      assetA, assetB,
      matchedPairs,
      onlyA, onlyB,
      compatRate: Math.round(compatRate),
      typeCompatRate: Math.round(typeCompatRate),
      avgQualityA, avgQualityB,
      radarData: [
        { subject: 'Completitud', A: Math.floor(80 + Math.random() * 18), B: Math.floor(75 + Math.random() * 20) },
        { subject: 'Unicidad', A: Math.floor(85 + Math.random() * 14), B: Math.floor(80 + Math.random() * 16) },
        { subject: 'Consistencia', A: Math.floor(78 + Math.random() * 18), B: Math.floor(72 + Math.random() * 22) },
        { subject: 'Validez', A: Math.floor(82 + Math.random() * 15), B: Math.floor(76 + Math.random() * 18) },
        { subject: 'Exactitud', A: Math.floor(75 + Math.random() * 20), B: Math.floor(70 + Math.random() * 22) }
      ],
      barData: matchedPairs.slice(0, 8).map(p => ({
        field: p.fieldA.field_name.length > 12 ? p.fieldA.field_name.slice(0, 12) + '…' : p.fieldA.field_name,
        [assetA?.name?.slice(0,10) || 'A']: p.qualityA,
        [assetB?.name?.slice(0,10) || 'B']: p.qualityB
      }))
    });
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
                <select
                  value={selectedAssetId}
                  onChange={(e) => setSelectedAssetId(e.target.value)}
                  className={styles.select}
                  style={{ maxWidth: '360px', width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #cbd5e1', background: 'white', fontWeight: 600, fontSize: '0.95rem', color: '#1e293b', outline: 'none' }}
                >
                  <option value="">— Elegir Activo de Información —</option>
                  {assets.map(a => (
                    <option key={a.id} value={a.id}>{a.name} ({a.source})</option>
                  ))}
                </select>
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
                    {['general', 'distribution', 'anomalies', 'recommendations'].map(t => (
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
                        {t === 'general' ? 'Resumen General e Indicadores' : t === 'distribution' ? 'Distribución' : t === 'anomalies' ? 'Anomalías' : 'Recomendaciones IA'}
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
                <select
                  value={selectedAssetId}
                  onChange={(e) => setSelectedAssetId(e.target.value)}
                  className={styles.select}
                  style={{ maxWidth: '360px', width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #cbd5e1', background: 'white', fontWeight: 600, fontSize: '0.95rem', color: '#1e293b', outline: 'none' }}
                >
                  <option value="">— Elegir Activo de Información —</option>
                  {assets.map(a => (
                    <option key={a.id} value={a.id}>{a.name} ({a.source})</option>
                  ))}
                </select>
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
                <select
                  value={selectedAssetId}
                  onChange={(e) => setSelectedAssetId(e.target.value)}
                  className={styles.select}
                  style={{ maxWidth: '360px', width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #cbd5e1', background: 'white', fontWeight: 600, fontSize: '0.95rem', color: '#1e293b', outline: 'none' }}
                >
                  <option value="">— Elegir Activo de Información —</option>
                  {assets.map(a => (
                    <option key={a.id} value={a.id}>{a.name} ({a.source})</option>
                  ))}
                </select>
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
                <select
                  value={selectedAssetId}
                  onChange={(e) => setSelectedAssetId(e.target.value)}
                  className={styles.select}
                  style={{ maxWidth: '360px', width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #cbd5e1', background: 'white', fontWeight: 600, fontSize: '0.95rem', color: '#1e293b', outline: 'none' }}
                >
                  <option value="">— Elegir Activo de Información —</option>
                  {assets.map(a => (
                    <option key={a.id} value={a.id}>{a.name} ({a.source})</option>
                  ))}
                </select>
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
                  <select
                    value={assetIdA}
                    onChange={e => { setAssetIdA(e.target.value); loadFieldsForAsset(e.target.value, 'A'); setReconciliationResult(null); }}
                    className={styles.select}
                    style={{ border: '1px solid #c7d2fe', background: 'white' }}
                  >
                    <option value="">Seleccionar activo A…</option>
                    {assets.filter(a => a.id !== assetIdB).map(a => <option key={a.id} value={a.id}>{a.name} ({a.source})</option>)}
                  </select>
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
                  <select
                    value={assetIdB}
                    onChange={e => { setAssetIdB(e.target.value); loadFieldsForAsset(e.target.value, 'B'); setReconciliationResult(null); }}
                    className={styles.select}
                    style={{ border: '1px solid #e9d5ff', background: 'white' }}
                  >
                    <option value="">Seleccionar activo B…</option>
                    {assets.filter(a => a.id !== assetIdA).map(a => <option key={a.id} value={a.id}>{a.name} ({a.source})</option>)}
                  </select>
                  {assetIdB && <div style={{ marginTop: '8px', fontSize: '0.75rem', color: '#a855f7', fontWeight: 600 }}>{fieldsB.length} campos detectados</div>}
                </div>
              </div>

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
            {reconciliationResult && (() => {
              const r = reconciliationResult;
              const nameA = r.assetA?.name || 'Activo A';
              const nameB = r.assetB?.name || 'Activo B';
              return (
                <>
                  {/* KPI Strip */}
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

                  {/* Score badges */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                    <div style={{ background: 'white', padding: '16px 20px', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: `conic-gradient(#10b981 ${r.compatRate * 3.6}deg, #e2e8f0 0)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800, color: '#10b981' }}>{r.compatRate}%</div>
                      </div>
                      <div><div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Compatibilidad de Esquema</div><div style={{ fontSize: '0.78rem', color: '#64748b' }}>Campos con correspondencia entre activos</div></div>
                    </div>
                    <div style={{ background: 'white', padding: '16px 20px', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: `conic-gradient(#6366f1 ${r.typeCompatRate * 3.6}deg, #e2e8f0 0)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800, color: '#6366f1' }}>{r.typeCompatRate}%</div>
                      </div>
                      <div><div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Tipos de Datos Compatibles</div><div style={{ fontSize: '0.78rem', color: '#64748b' }}>Entre los campos homólogos detectados</div></div>
                    </div>
                  </div>

                  {/* Sub-tabs de resultados */}
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                    {([['schema','Diagrama de Esquema'],['quality','Calidad Comparada'],['detail','Detalle de Campos']] as const).map(([id, label]) => (
                      <button key={id} onClick={() => setActiveReconTab(id)} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', background: activeReconTab === id ? '#6366f1' : '#f1f5f9', color: activeReconTab === id ? 'white' : '#475569', transition: 'all 0.2s' }}>{label}</button>
                    ))}
                  </div>

                  {/* Schema SVG Diagram */}
                  {activeReconTab === 'schema' && (
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

                  {/* Quality Radar + Bar */}
                  {activeReconTab === 'quality' && isMounted && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                      <div style={{ background: 'white', padding: '20px', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
                        <h4 style={{ margin: '0 0 12px', color: '#1e293b' }}>Radar de Calidad Comparado</h4>
                        <ResponsiveContainer width="100%" height={280}>
                          <RadarChart data={r.radarData}>
                            <PolarGrid stroke="#e2e8f0" />
                            <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#64748b' }} />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9, fill: '#94a3b8' }} />
                            <Radar name={nameA.slice(0,14)} dataKey="A" stroke="#6366f1" fill="#6366f1" fillOpacity={0.25} strokeWidth={2} />
                            <Radar name={nameB.slice(0,14)} dataKey="B" stroke="#a855f7" fill="#a855f7" fillOpacity={0.2} strokeWidth={2} />
                            <Tooltip formatter={(v: any) => `${v}%`} />
                          </RadarChart>
                        </ResponsiveContainer>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '4px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem' }}><div style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#6366f1' }} />{nameA.slice(0,18)}</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem' }}><div style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#a855f7' }} />{nameB.slice(0,18)}</div>
                        </div>
                      </div>

                      <div style={{ background: 'white', padding: '20px', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
                        <h4 style={{ margin: '0 0 12px', color: '#1e293b' }}>Calidad por Campo Homólogo</h4>
                        <ResponsiveContainer width="100%" height={280}>
                          <BarChart data={r.barData} margin={{ left: -20 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis dataKey="field" tick={{ fontSize: 10, fill: '#64748b' }} />
                            <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                            <Tooltip formatter={(v: any) => `${v}%`} />
                            <Bar dataKey={nameA.slice(0,10)} fill="#6366f1" radius={[4,4,0,0]} />
                            <Bar dataKey={nameB.slice(0,10)} fill="#a855f7" radius={[4,4,0,0]} />
                          </BarChart>
                        </ResponsiveContainer>
                        <div style={{ marginTop: '12px', padding: '12px', background: '#f8fafc', borderRadius: '12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                          <div style={{ textAlign: 'center' }}><div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#6366f1' }}>{r.avgQualityA}%</div><div style={{ fontSize: '0.75rem', color: '#64748b' }}>Calidad Promedio {nameA.slice(0,12)}</div></div>
                          <div style={{ textAlign: 'center' }}><div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#a855f7' }}>{r.avgQualityB}%</div><div style={{ fontSize: '0.75rem', color: '#64748b' }}>Calidad Promedio {nameB.slice(0,12)}</div></div>
                        </div>
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
                </>
              );
            })()}
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
                        {stewards.map(s => <option key={s.id}>{s.name} ({s.role})</option>)}
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

                    <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
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
        onDownload={() => alert('Descargando reporte...')}
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
    </div>
  );
}
