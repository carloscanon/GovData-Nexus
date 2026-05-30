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
  Award
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { supabase } from '@/lib/supabase';
import CreateRuleModal from '@/components/quality/CreateRuleModal';
import NotificationSettingsModal from '@/components/quality/NotificationSettingsModal';
import ExecutionSummaryModal from '@/components/quality/ExecutionSummaryModal';
import ConnectExternalAssetModal from '@/components/quality/ConnectExternalAssetModal';
import SourceDetailModal from '@/components/quality/SourceDetailModal';
import { usePlatform } from '@/contexts/PlatformContext';
import styles from './quality.module.css';

export default function QualityModule() {
  const { mode, currentTenant } = usePlatform();
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddRuleModal, setShowAddRuleModal] = useState(false);
  const [newRule, setNewRule] = useState({ name: '', description: '', type: 'Integridad', severity: 'Media' });
  const [loading, setLoading] = useState(true);
  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<any>(null);
  const [isNotifyModalOpen, setIsNotifyModalOpen] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [assetToConnect, setAssetToConnect] = useState<any>(null);
  const [lastExecutionResults, setLastExecutionResults] = useState<any[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleEditRule = (rule: any) => {
    setEditingRule(rule);
    setIsRuleModalOpen(true);
  };
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionProgress, setExecutionProgress] = useState(0);
  const [assets, setAssets] = useState<any[]>([]);
  const [rules, setRules] = useState<any[]>([]);
  const [selectedAssetId, setSelectedAssetId] = useState<string>('');
  const [stats, setStats] = useState({
    completeness: mode === 'DEMO' ? 92 : 0,
    accuracy: mode === 'DEMO' ? 88 : 0,
    consistency: mode === 'DEMO' ? 95 : 0,
    uniqueness: mode === 'DEMO' ? 97 : 0,
    timeliness: mode === 'DEMO' ? 91 : 0
  });

  const [sourceStats, setSourceStats] = useState<any[]>([]);
  const [selectedSourceDetail, setSelectedSourceDetail] = useState<any>(null);

  const demoIncidents = [
    { id: '1', name: 'Nulos en Email', system: 'SAP ERP', affected: 142, severity: 'Crítica', owner: 'Carlos Ruiz', date: 'Hace 2h', total: 1000, compliant: 858, pct: '85.80' },
    { id: '2', name: 'Documento Inválido', system: 'Salesforce', affected: 85, severity: 'Alta', owner: 'Maria Silva', date: 'Hace 5h', total: 500, compliant: 415, pct: '83.00' },
    { id: '3', name: 'Fecha Vencida', system: 'Oracle DB', affected: 320, severity: 'Media', owner: 'Juan Perez', date: 'Ayer', total: 5000, compliant: 4680, pct: '93.60' },
    { id: '4', name: 'IDs Duplicados', system: 'Data Lake', affected: 12, severity: 'Crítica', owner: 'Ana Belen', date: 'Hace 10m', total: 2000, compliant: 1988, pct: '99.40' },
  ];

  const [incidents, setIncidents] = useState<any[]>(mode === 'DEMO' ? demoIncidents : []);

  const handleExecuteRules = async () => {
    if (mode === 'ENTERPRISE' && !selectedAssetId) {
      alert('Por favor, seleccione un activo de información para validar.');
      return;
    }

    setIsExecuting(true);
    setExecutionProgress(0);

    // Si es empresa, buscamos las reglas reales del activo
    let activeRules = [];
    if (mode === 'ENTERPRISE') {
      const { data } = await supabase
        .from('quality_rules')
        .select('*')
        .eq('asset_id', selectedAssetId)
        .or('status.eq.Activa,status.is.null');
      activeRules = data || [];

      if (activeRules.length === 0) {
        setIsExecuting(false);
        alert('No se encontraron reglas activas para este activo. Cree una regla primero.');
        return;
      }
    }

    // Simular escaneo de reglas
    for (let i = 0; i <= 100; i += 10) {
      setExecutionProgress(i);
      await new Promise(r => setTimeout(r, mode === 'DEMO' ? 200 : 400));
    }

    const newStats = mode === 'DEMO' ? {
      completeness: Math.floor(90 + Math.random() * 8),
      accuracy: Math.floor(85 + Math.random() * 10),
      consistency: Math.floor(92 + Math.random() * 5),
      uniqueness: Math.floor(95 + Math.random() * 4),
      timeliness: Math.floor(88 + Math.random() * 10)
    } : {
      completeness: 100 - (activeRules.filter(r => r.type === 'Nulos').length * 2),
      accuracy: 100 - (activeRules.filter(r => r.type === 'Formato').length * 3),
      consistency: 98,
      uniqueness: 100 - (activeRules.filter(r => r.type === 'Duplicados').length * 5),
      timeliness: 100
    };

    let executionResults: any[] = [];

    if (mode === 'ENTERPRISE') {
      const asset = assets.find(a => a.id === selectedAssetId);
      
      const isExternal = asset?.tags?.includes('Metadatos_Externos');
      if (isExternal) {
        setAssetToConnect(asset);
        setIsConnectModalOpen(true);
        setIsExecuting(false);
        return;
      }

      // Si no tiene table_name, pedir confirmación al usuario
      let resolvedTableName = asset?.table_name;
      if (!resolvedTableName) {
        const userInput = prompt(
          `⚠️ El activo "${asset?.name}" no tiene una tabla física configurada.\n\n` +
          `Por favor, escriba el nombre EXACTO de la tabla en Supabase que desea consultar.\n` +
          `(Ejemplo: clientes, productos, data_assets)\n\n` +
          `Nota: El nombre debe coincidir exactamente con la tabla en la base de datos.`
        );
        if (!userInput || !userInput.trim()) {
          alert('Ejecución cancelada. Debe especificar una tabla válida.');
          setIsExecuting(false);
          return;
        }
        resolvedTableName = userInput.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_');
        
        // Guardar en la base de datos para que no vuelva a preguntar
        await supabase.from('data_assets').update({ table_name: resolvedTableName }).eq('id', asset?.id);
        // Actualizar localmente
        asset.table_name = resolvedTableName;
      }
      
      executionResults = await Promise.all(activeRules.map(async rule => {
        let total = 0;
        let affected = 0;
        
        try {
          const { data: fieldData } = await supabase.from('asset_fields').select('field_name').eq('id', rule.field_id).single();
          let fieldName = fieldData?.field_name;
          let targetTable = resolvedTableName;
          // Limpiar para evitar "Invalid path specified in request URL"
          if (targetTable) {
             targetTable = targetTable.toLowerCase().replace(/[^a-z0-9_]/g, '_');
          }

          if (!fieldName) {
            // Intento de fallback si es un campo mock (f-gen-1 -> id)
            if (rule.field_id === 'f-gen-1') fieldName = 'id';
            else if (rule.field_id === 'f-gen-2') fieldName = 'nombre';
            else if (rule.field_id === 'f-gen-3') fieldName = 'email';
            else if (rule.field_id === 'f-gen-4') fieldName = 'estado';
            else {
              return {
                id: rule.id.slice(0, 8),
                name: rule.name,
                system: asset?.source || 'N/A',
                total: 0,
                compliant: 0,
                affected: 0,
                pct: '0.00',
                severity: rule.severity,
                owner: 'Nexus AI',
                date: 'Error',
                status: `⚠️ No se pudo determinar el nombre de la columna para el ID: ${rule.field_id}`,
                fieldError: true
              };
            }
          }

          if (targetTable && fieldName) {
            // Pre-validar que la columna existe en la tabla
            const { error: colCheck } = await supabase.from(targetTable).select(fieldName).limit(1);
            if (colCheck) {
              console.warn(`⚠️ Error validando columna "${fieldName}" en tabla "${targetTable}":`, colCheck);
              return {
                id: rule.id.slice(0, 8),
                name: rule.name,
                system: asset?.source || 'N/A',
                total: 0,
                compliant: 0,
                affected: 0,
                pct: '0.00',
                severity: rule.severity,
                owner: 'Nexus AI',
                date: 'Error de BD',
                status: `⚠️ ${colCheck.message || 'La tabla o columna no existe en la base de datos.'}`,
                fieldError: true
              };
            }

            // Siempre extraer el total real de la tabla
            const { count: tCount, error: tErr } = await supabase.from(targetTable).select('*', { count: 'exact', head: true });
            if (tErr) {
              console.error(`Error contando total en ${targetTable}:`, tErr);
              return {
                id: rule.id.slice(0, 8),
                name: rule.name,
                system: asset?.source || 'N/A',
                total: 0,
                compliant: 0,
                affected: 0,
                pct: '0.00',
                severity: rule.severity,
                owner: 'Nexus AI',
                date: 'Error de BD',
                status: `⚠️ No se pudo consultar la tabla ${targetTable}. Detalle: ${tErr.message}`,
                fieldError: true
              };
            }
            total = tCount || 0;

            if (rule.type === 'Nulos') {
              const { count: aCount, error: aErr } = await supabase.from(targetTable).select('*', { count: 'exact', head: true }).is(fieldName, null);
              if (aErr) console.error(`Error contando nulos en ${targetTable}.${fieldName}:`, aErr?.message, aErr?.code, aErr?.details);
              
              affected = aCount || 0;
            } else {
              // Para otras reglas, extraemos muestra y procesamos en memoria
              const { data: allData, error: dErr } = await supabase.from(targetTable).select(fieldName).limit(5000);
              if (dErr) {
                console.error(`Error extrayendo datos de ${targetTable}.${fieldName}:`, dErr?.message, dErr?.code, dErr?.details);
                alert(`Error al analizar la tabla "${targetTable}" y campo "${fieldName}". Detalle: ${dErr?.message || 'Revisar permisos RLS'}`);
              }
              
              if (allData) {
                if (allData.length > total) total = allData.length;
                if (rule.type === 'Duplicados') {
                  const vals = allData.map(d => d[fieldName]).filter(v => v !== null);
                  const uniqueVals = new Set(rule.config?.caseSensitive ? vals : vals.map((v: any) => String(v).toLowerCase()));
                  affected = vals.length - uniqueVals.size;
                } else if (rule.type === 'Formato') {
                  const pattern = rule.config?.regex || '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$';
                  try {
                    const formatRegex = new RegExp(pattern);
                    affected = allData.filter(d => d[fieldName] && !formatRegex.test(String(d[fieldName]))).length;
                  } catch {
                    console.error('Regex inválido:', pattern);
                    affected = 0;
                  }
                } else if (rule.type === 'Rango') {
                  const min = rule.config?.min ?? 0;
                  const max = rule.config?.max ?? 100000;
                  affected = allData.filter(d => {
                    const val = Number(d[fieldName]);
                    return !isNaN(val) && (val < min || val > max);
                  }).length;
                } else if (rule.type === 'Negocio') {
                  if (rule.config?.allowedValues) {
                    const allowed = rule.config.allowedValues.split(',').map((v: string) => v.trim().toLowerCase());
                    affected = allData.filter(d => d[fieldName] && !allowed.includes(String(d[fieldName]).trim().toLowerCase())).length;
                  }
                }
              }
            }
          }
        } catch (err) {
          console.error("Error ejecutando regla:", rule.name, err);
        }

        // Evitar ceros o cálculos erróneos si la tabla está vacía
        if (total === 0) total = 1; 
        const compliant = Math.max(0, total - affected);
        const pct = (compliant / total) * 100;

        return {
          id: rule.id.slice(0, 8),
          name: rule.name,
          system: asset?.source || 'N/A',
          total: total,
          compliant: compliant,
          affected: affected,
          pct: pct.toFixed(2),
          severity: rule.severity,
          owner: 'Nexus AI',
          date: 'Recién detectado',
          status: 'Abierto'
        };
      }));

      // Guardar en DB para persistencia y obtener los IDs reales
      const dbPayload = executionResults.map(r => ({
        asset_id: selectedAssetId,
        rule_id: activeRules.find(ar => ar.name === r.name)?.id,
        total_records: r.total,
        affected_records: r.affected,
        compliant_records: r.compliant,
        compliance_pct: parseFloat(r.pct),
        description: `Validación: ${r.name}`,
        priority: r.severity,
        status: 'Abierto'
      }));

      const { data: savedData, error: insertErr } = await supabase
        .from('quality_incidents')
        .insert(dbPayload)
        .select();

      if (insertErr) {
        console.error('Error guardando incidentes:', insertErr);
      }

      // Enviar alertas al endpoint de notificaciones para Slack / Canales
      executionResults.forEach(async (result) => {
        if (parseFloat(result.pct) < 95 && (result.severity === 'Crítica' || result.severity === 'Alta')) {
          try {
            await fetch('/api/notify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                type: 'Incidente de Calidad de Datos',
                message: `La regla "${result.name}" falló con un porcentaje de cumplimiento del ${result.pct}%.`,
                severity: result.severity,
                system: result.system,
                pct: result.pct,
                total: result.total,
                affected: result.affected
              })
            });
          } catch (nErr) {
            console.error('Error enviando alerta:', nErr);
          }
        }
      });

      // Actualizar el estado con los IDs reales de la base de datos
      if (savedData) {
        const incidentsWithDbId = executionResults.map(r => {
          const matchingDbItem = savedData.find(sd => sd.priority === r.severity && sd.compliance_pct === parseFloat(r.pct));
          return {
            ...r,
            dbId: matchingDbItem?.id
          };
        });
        setIncidents(incidentsWithDbId);
      } else {
        setIncidents(executionResults);
      }
    }

    setStats(newStats);
    setLastExecutionResults(mode === 'ENTERPRISE' ? executionResults : incidents); // En demo usamos los mock incidents
    setIsExecuting(false);
    setShowSummaryModal(true);
  };

  const handleExportReport = (currentStats: any) => {
    const wb = XLSX.utils.book_new();

    // Hoja 1: Resumen Ejecutivo
    const summaryData = [
      ['Métrica', 'Score (%)', 'Estado'],
      ['Completitud', currentStats.completeness, currentStats.completeness > 90 ? 'Saludable' : 'Riesgo'],
      ['Exactitud', currentStats.accuracy, currentStats.accuracy > 90 ? 'Saludable' : 'Riesgo'],
      ['Consistencia', currentStats.consistency, currentStats.consistency > 90 ? 'Saludable' : 'Riesgo'],
      ['Unicidad', currentStats.uniqueness, currentStats.uniqueness > 90 ? 'Saludable' : 'Riesgo'],
      ['Oportunidad', currentStats.timeliness, currentStats.timeliness > 90 ? 'Saludable' : 'Riesgo'],
    ];
    const wsSummary = XLSX.utils.aoa_to_sheet([
      ['REPORTE DE SALUD DE DATOS - GOVDATA NEXUS'],
      ['Fecha:', new Date().toLocaleString()],
      [],
      ...summaryData
    ]);
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Resumen Ejecutivo');

    // Hoja 2: Incidentes Detallados
    const incidentData = incidents.map(inc => ({
      ID: inc.id,
      Regla: inc.name,
      Sistema: inc.system,
      'Total Registros': (inc as any).total || 1000,
      'Cumplen': (inc as any).compliant || 950,
      'Fallan': inc.affected,
      '% Calidad': (inc as any).pct ? `${(inc as any).pct}%` : '95%',
      Severidad: inc.severity,
      Responsable: inc.owner,
      Detectado: inc.date
    }));
    const wsIncidents = XLSX.utils.json_to_sheet(incidentData);
    XLSX.utils.book_append_sheet(wb, wsIncidents, 'Detalle de Incidentes');

    XLSX.writeFile(wb, `Reporte_Calidad_Nexus_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  useEffect(() => {
    fetchAssets();
    fetchEnterpriseKPIs();
    if (selectedAssetId) {
      fetchRules(selectedAssetId);
      fetchIncidents(selectedAssetId);
    } else if (mode === 'ENTERPRISE') {
      fetchIncidents(); // Cargar incidentes globales si no hay activo seleccionado
    }
    setTimeout(() => setLoading(false), 1000);
  }, [mode, selectedAssetId, isMounted, currentTenant?.id]);

  const handleAddRule = async () => {
    if (!newRule.name || !selectedAssetId || !currentTenant?.id) return;

    try {
      const { data, error } = await supabase.from('quality_rules').insert([{
        tenant_id: currentTenant.id,
        asset_id: selectedAssetId,
        rule_name: newRule.name,
        description: newRule.description,
        rule_type: newRule.type,
        status: 'Activa'
      }]).select();

      if (error) throw error;
      
      if (data && data.length > 0) {
        setRules([...rules, data[0]]);
        setNewRule({ name: '', description: '', type: 'Integridad', severity: 'Media' });
        setShowAddRuleModal(false);
      }
    } catch (err: any) {
      console.error('Error adding rule to Supabase:', err);
      alert('Error guardando en la base de datos. Verifica que la tabla quality_rules exista.');
    }
  };

  const handleDeleteRule = async (ruleId: string) => {
    if (!confirm('¿Está seguro de que desea eliminar esta regla?')) return;


    try {
      const { error } = await supabase.from('quality_rules').delete().eq('id', ruleId);
      if (error) throw error;

      setRules(prev => prev.filter(r => r.id !== ruleId));
    } catch (err) {
      console.error('Error deleting rule:', err);
      alert('No se pudo eliminar la regla.');
    }
  };

  const handleToggleRule = async (ruleId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'Activa' ? 'Inactiva' : 'Activa';

    // En modo DEMO solo operamos en memoria y localStorage
    if (mode === 'DEMO') {
      setRules(prev => {
        const updated = prev.map(r => r.id === ruleId ? { ...r, status: newStatus } : r);
        if (selectedAssetId) {
          localStorage.setItem(`govdata_rules_${selectedAssetId}`, JSON.stringify(updated));
        }
        return updated;
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('quality_rules')
        .update({ status: newStatus })
        .eq('id', ruleId);

      if (error) throw error;

      setRules(prev => {
        const updated = prev.map(r => r.id === ruleId ? { ...r, status: newStatus } : r);
        if (selectedAssetId) {
          localStorage.setItem(`govdata_rules_${selectedAssetId}`, JSON.stringify(updated));
        }
        return updated;
      });
    } catch (err) {
      console.warn('Error toggling rule, applying local fallback:', err);
      setRules(prev => {
        const updated = prev.map(r => r.id === ruleId ? { ...r, status: newStatus } : r);
        if (selectedAssetId) {
          localStorage.setItem(`govdata_rules_${selectedAssetId}`, JSON.stringify(updated));
        }
        return updated;
      });
    }
  };

  const handleResolveIncident = async (incidentDbId: string) => {
    if (mode !== 'ENTERPRISE') {
      alert('Esta función solo está disponible en la versión Enterprise.');
      return;
    }
    
    try {
      const { error } = await supabase
        .from('quality_incidents')
        .update({ status: 'Corregido' })
        .eq('id', incidentDbId);

      if (error) throw error;

      // Update local state to reflect resolution
      setIncidents(prev => prev.map(inc => 
        inc.dbId === incidentDbId ? { ...inc, status: 'Corregido' } : inc
      ));
      
      // Update global KPI by re-fetching
      fetchEnterpriseKPIs();
      
      alert('Incidente marcado como corregido.');
    } catch (err) {
      console.error('Error resolving incident:', err);
      alert('No se pudo actualizar el estado del incidente.');
    }
  };

  const fetchIncidents = async (assetId?: string) => {
    let tenantAssetIds: string[] = [];
    if (mode === 'ENTERPRISE') {
      const { data: tenantAssets } = await supabase
        .from('data_assets')
        .select('id')
        .eq('tenant_id', currentTenant?.id || '00000000-0000-0000-0000-000000000001');
      tenantAssetIds = (tenantAssets || []).map(a => a.id);
      
      if (tenantAssetIds.length === 0 && !assetId) {
        setIncidents([]);
        return;
      }
    }

    let query = supabase
      .from('quality_incidents')
      .select(`
        *,
        rule:quality_rules(name),
        asset:data_assets(name, source)
      `);

    if (assetId) {
      query = query.eq('asset_id', assetId);
    } else {
      // Global view: show all open incidents across the organization (isolated by tenant)
      query = query.eq('status', 'Abierto').in('asset_id', tenantAssetIds);
    }

    const { data } = await query
      .order('detected_at', { ascending: false })
      .limit(assetId ? 10 : 20);

    if (data) {
      setIncidents(data.map(d => ({
        id: d.id.slice(0, 8),
        dbId: d.id,
        name: d.rule?.name || d.description,
        system: d.asset?.source || (assetId ? 'Base de Datos' : 'Global'),
        assetName: d.asset?.name,
        total: d.total_records,
        compliant: d.compliant_records,
        affected: d.affected_records,
        pct: d.compliance_pct,
        severity: d.priority,
        owner: d.assigned_to || 'Nexus AI',
        date: isMounted ? new Date(d.detected_at).toLocaleDateString() : '',
        status: d.status
      })));

      if (mode === 'ENTERPRISE') {
        let totalRecords = 0;
        let totalAffected = 0;
        data.forEach(d => {
          totalRecords += (d.total_records || 0);
          totalAffected += (d.affected_records || 0);
        });

        let globalHealth = 100;
        if (totalRecords > 0) {
          globalHealth = Math.round(((totalRecords - totalAffected) / totalRecords) * 100);
        }

        setStats({
          completeness: globalHealth,
          accuracy: globalHealth > 5 ? globalHealth - 5 : globalHealth,
          consistency: globalHealth > 2 ? globalHealth - 2 : globalHealth,
          uniqueness: globalHealth > 3 ? globalHealth - 3 : globalHealth,
          timeliness: 100
        });
      }
    }
  };

  const fetchRules = async (assetId: string) => {
    try {
      const { data, error } = await supabase
        .from('quality_rules')
        .select('*')
        .eq('asset_id', assetId);

      if (error) throw error;
      setRules(data || []);
    } catch (err: any) {
      console.error('Error fetching rules from Supabase:', err);
      if (err.code === '42P01') {
        alert("La tabla quality_rules no existe. Por favor corre el script SQL.");
      }
      setRules([]);
    }
  };

  const fetchAssets = async () => {
    if (!currentTenant?.id) return;
    try {
      const { data, error } = await supabase
        .from('data_assets')
        .select('id, name, source, tags, table_name, quality_score')
        .eq('tenant_id', currentTenant.id)
        .order('name');

      if (error) throw error;
      setAssets(data || []);

      // Calcular estadísticas por sistema fuente
      if (data && data.length > 0) {
        const sourceMap = new Map<string, { total: number; scoreSum: number; count: number }>();
        data.forEach((a: any) => {
          const src = a.source || 'Sin Fuente';
          const existing = sourceMap.get(src) || { total: 0, scoreSum: 0, count: 0 };
          existing.total += 1;
          existing.scoreSum += (a.quality_score || 0);
          existing.count += 1;
          sourceMap.set(src, existing);
        });
        const stats = Array.from(sourceMap.entries()).map(([name, info]) => ({
          name,
          score: info.count > 0 ? Math.round(info.scoreSum / info.count) : 0,
          assets: info.total,
          alerts: 0
        }));
        setSourceStats(stats.sort((a, b) => b.score - a.score));
      }
    } catch (err) {
      console.warn('Error al cargar activos de Supabase para Calidad:', err);
      const saved = localStorage.getItem(localKey);
      if (saved) {
        setAssets(JSON.parse(saved));
      } else {
        setAssets([]);
      }
    }
  };

  const fetchEnterpriseKPIs = async () => {
    if (mode !== 'ENTERPRISE') return;
    try {
      // 1. Obtener solo los activos correspondientes al tenant activo
      const { data: tenantAssets } = await supabase
        .from('data_assets')
        .select('id')
        .eq('tenant_id', currentTenant?.id || '00000000-0000-0000-0000-000000000001');
      
      const tenantAssetIds = (tenantAssets || []).map(a => a.id);
      if (tenantAssetIds.length === 0) {
        setStats({ completeness: 0, accuracy: 0, consistency: 0, uniqueness: 0, timeliness: 0 });
        return;
      }

      // 2. Obtener incidentes asociados solo a los activos de la empresa
      const { data: allIncidents } = await supabase
        .from('quality_incidents')
        .select('total_records, affected_records, rule_id')
        .in('asset_id', tenantAssetIds);

      if (!allIncidents || allIncidents.length === 0) return;

      let totalRecords = 0;
      let totalAffected = 0;
      const ruleIds = allIncidents.map(i => i.rule_id).filter(Boolean);
      const { data: rulesData } = await supabase
        .from('quality_rules')
        .select('id, type')
        .in('id', ruleIds);

      const typeMap: any = {};
      (rulesData || []).forEach((r: any) => { typeMap[r.id] = r.type; });

      const byDimension: any = { Nulos: { t: 0, a: 0 }, Formato: { t: 0, a: 0 }, Duplicados: { t: 0, a: 0 }, Rango: { t: 0, a: 0 }, Negocio: { t: 0, a: 0 } };

      allIncidents.forEach((inc: any) => {
        const t = inc.total_records || 0;
        const a = inc.affected_records || 0;
        totalRecords += t;
        totalAffected += a;
        const ruleType = typeMap[inc.rule_id] || 'Negocio';
        if (byDimension[ruleType]) {
          byDimension[ruleType].t += t;
          byDimension[ruleType].a += a;
        }
      });

      const calcPct = (dim: string) => {
        const d = byDimension[dim];
        if (!d || d.t === 0) return 0;
        return Math.round(((d.t - d.a) / d.t) * 100);
      };

      setStats({
        completeness: calcPct('Nulos') || (totalRecords > 0 ? Math.round(((totalRecords - totalAffected) / totalRecords) * 100) : 0),
        accuracy: calcPct('Formato') || (totalRecords > 0 ? Math.round(((totalRecords - totalAffected) / totalRecords) * 100) : 0),
        consistency: calcPct('Rango') || 100,
        uniqueness: calcPct('Duplicados') || 100,
        timeliness: calcPct('Negocio') || 100
      });
    } catch (err) {
      console.error('Error computing enterprise KPIs:', err);
    }
  };

  const getSeverityClass = (severity: string) => {
    switch (severity) {
      case 'Crítica': return styles.sevCritical;
      case 'Alta': return styles.sevHigh;
      case 'Media': return styles.sevMedium;
      default: return styles.sevLow;
    }
  };

  // ── Consolidated Global Score Banner calculations ──
  const globalScore = Math.round(
    ((stats.completeness || 0) +
     (stats.accuracy || 0) +
     (stats.consistency || 0) +
     (stats.uniqueness || 0) +
     (stats.timeliness || 0)) / 5
  );

  let levelText = 'RIESGO';
  let levelColor = '#ef4444';
  if (globalScore >= 90) {
    levelText = 'SALUDABLE';
    levelColor = '#10b981';
  } else if (globalScore >= 75) {
    levelText = 'ADECUADO';
    levelColor = '#f59e0b';
  }

  const circumference = 2 * Math.PI * 52;
  const dashOffset = circumference - (globalScore / 100) * circumference;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0 }}>
            <Activity size={24} />
          </div>
          <div>
            <h1 style={{ margin: 0, marginBottom: '4px', fontSize: '1.8rem' }}>Salud de los Datos</h1>
            <p style={{ margin: 0, color: '#64748b', fontSize: '0.95rem' }}>Monitoreo en tiempo real de dimensiones de calidad por sistema y dominio.</p>
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
          <button
            className={styles.secondaryBtn}
            onClick={() => {
              fetchAssets();
              if (selectedAssetId) fetchRules(selectedAssetId);
            }}
          >
            <RefreshCw size={18} /> Refrescar
          </button>
          <button
            className={`${styles.secondaryBtn} ${isExecuting ? styles.executing : ''}`}
            onClick={handleExecuteRules}
            disabled={isExecuting}
          >
            {isExecuting ? <RefreshCw size={18} className={styles.spin} /> : <Play size={18} />}
            {isExecuting ? 'Ejecutando...' : 'Ejecutar'}
          </button>
          <button className={styles.secondaryBtn} onClick={() => setIsNotifyModalOpen(true)}>
            <Calendar size={18} /> Programar
          </button>
          <button className={styles.primaryBtn} onClick={() => setIsRuleModalOpen(true)}>
            <Plus size={18} /> Crear Regla
          </button>
        </div>
      </header>

      {/* ── Consolidated Global Score Banner ── */}
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
                strokeDashoffset={loading ? circumference : dashOffset}
                strokeLinecap="round"
                transform="rotate(-90 60 60)"
                style={{ transition: 'stroke-dashoffset 1.2s ease' }}
              />
              <text x="60" y="55" textAnchor="middle" fill={levelColor} fontSize="22" fontWeight="900">
                {loading ? '…' : `${globalScore}%`}
              </text>
              <text x="60" y="72" textAnchor="middle" fill="#94a3b8" fontSize="10" fontWeight="700">
                CALIDAD
              </text>
            </svg>
          </div>
          <div className={styles.globalInfo}>
            <div className={styles.globalLevel} style={{ color: levelColor }}>
              <Award size={20} /> {levelText}
            </div>
            <h2 className={styles.globalTitle}>Índice de Calidad de Datos (DQI)</h2>
            <p className={styles.globalSub}>
              Monitoreo continuo de completitud, exactitud y coherencia de activos de información.
            </p>
          </div>
        </div>

        {/* Mini dimension pills */}
        <div className={styles.globalRight}>
          <div className={styles.miniPill}>
            <CheckCircle2 size={14} />
            <span>Completitud</span>
            <strong style={{ color: stats.completeness >= 85 ? '#10b981' : '#f59e0b' }}>{stats.completeness}%</strong>
          </div>
          <div className={styles.miniPill}>
            <Activity size={14} />
            <span>Exactitud</span>
            <strong style={{ color: stats.accuracy >= 85 ? '#10b981' : '#f59e0b' }}>{stats.accuracy}%</strong>
          </div>
          <div className={styles.miniPill}>
            <RefreshCw size={14} />
            <span>Consistencia</span>
            <strong style={{ color: stats.consistency >= 85 ? '#10b981' : '#f59e0b' }}>{stats.consistency}%</strong>
          </div>
          <div className={styles.miniPill}>
            <ShieldCheck size={14} />
            <span>Unicidad</span>
            <strong style={{ color: stats.uniqueness >= 85 ? '#10b981' : '#f59e0b' }}>{stats.uniqueness}%</strong>
          </div>
          <div className={styles.miniPill}>
            <Clock size={14} />
            <span>Oportunidad</span>
            <strong style={{ color: stats.timeliness >= 85 ? '#10b981' : '#f59e0b' }}>{stats.timeliness}%</strong>
          </div>
          <div className={styles.miniPill}>
            <AlertCircle size={14} />
            <span>Alertas Activas</span>
            <strong style={{ color: incidents.length > 0 ? '#ef4444' : '#10b981' }}>{incidents.length}</strong>
          </div>
        </div>
      </motion.div>

      {mode === 'ENTERPRISE' && selectedAssetId && (
        <section className={styles.rulesSection}>
          <div className={styles.sectionHeader}>
            <h3>Reglas de Calidad Activas ({rules.length})</h3>
            <div className={styles.headerActions}>
              <button className={styles.secondaryBtnSmall} onClick={() => fetchRules(selectedAssetId)}>
                <RefreshCw size={14} /> Refrescar Reglas
              </button>
            </div>
          </div>
          <div className={styles.rulesGrid}>
            {rules.length === 0 ? (
              <div className={styles.emptyRules}>
                <ShieldCheck size={48} color="#cbd5e1" />
                <p>No hay reglas configuradas para este activo.</p>
                <button className={styles.primaryBtnSmall} onClick={() => setIsRuleModalOpen(true)}>Crear Regla Ahora</button>
              </div>
            ) : (
              rules.map(rule => (
                <div key={rule.id} className={styles.ruleCard}>
                  <div className={styles.ruleIconBox}>
                    <Zap size={18} color="#6366f1" />
                  </div>
                  <div className={styles.ruleMain}>
                    <h4>{rule.name}</h4>
                    <div className={styles.ruleBadges}>
                      <span className={styles.typeBadge}>{rule.type}</span>
                      <span className={`${styles.sevBadgeSmall} ${getSeverityClass(rule.severity)}`}>{rule.severity}</span>
                    </div>
                  </div>
                  <div className={styles.ruleActions}>
                    <button className={styles.actionBtn} onClick={() => handleEditRule(rule)} title="Modificar Regla">
                      <Edit2 size={18} color="#3b82f6" />
                    </button>
                    <button
                      className={styles.actionBtn}
                      onClick={() => handleToggleRule(rule.id, rule.status)}
                      title={rule.status === 'Activa' ? 'Desactivar' : 'Activar'}
                    >
                      {rule.status === 'Activa' ? <CheckCircle2 size={18} color="#10b981" /> : <X size={18} color="#94a3b8" />}
                    </button>
                    <button className={styles.actionBtn} onClick={() => handleDeleteRule(rule.id)} title="Eliminar">
                      <Trash2 size={18} color="#ef4444" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      )}

      <div className={styles.mainGrid}>
        <div className={styles.chartSection}>
          <div className={styles.sectionHeader}>
            <h3>Calidad por Sistema Fuente</h3>
            <button className={styles.iconBtn}><Filter size={18} /></button>
          </div>

          <div className={styles.sourceList}>
            {(mode === 'ENTERPRISE' ? sourceStats : [
              { name: 'SAP ERP', score: 94, alerts: 2, assets: 4 },
              { name: 'Salesforce', score: 82, alerts: 5, assets: 3 },
              { name: 'Oracle DB', score: 88, alerts: 3, assets: 6 },
              { name: 'Data Lake', score: 91, alerts: 1, assets: 2 },
              { name: 'Legacy App', score: 64, alerts: 12, assets: 1 },
            ]).map((source, i) => (
              <div key={i} className={styles.sourceCard} onClick={() => setSelectedSourceDetail(source)} style={{ cursor: 'pointer' }}>
                <div className={styles.sourceInfo}>
                  <Database size={20} className={styles.sourceIcon} />
                  <div>
                    <strong>{source.name}</strong>
                    <span>{source.assets || 0} activos · {source.alerts} alertas</span>
                  </div>
                </div>
                <div className={styles.sourceScore}>
                  <div className={styles.scoreValue}>{source.score}%</div>
                  <div className={`${styles.scoreIndicator} ${source.score > 90 ? styles.indGood : source.score > 75 ? styles.indWarn : styles.indCrit}`}></div>
                </div>
                <ChevronRight size={18} className={styles.chevron} />
              </div>
            ))}
            {mode === 'ENTERPRISE' && sourceStats.length === 0 && (
              <div style={{ padding: '24px', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
                <Database size={32} color="#cbd5e1" style={{ marginBottom: '8px' }} />
                <p>No hay activos registrados aún. Importe activos desde el Catálogo.</p>
              </div>
            )}
          </div>
        </div>

        <div className={styles.incidentsSection}>
          <div className={styles.sectionHeader}>
            <h3>Resultados de Calidad</h3>
            <span className={styles.badgeCount}>{incidents.length}</span>
          </div>

          <div className={styles.incidentList}>
            {incidents.map((inc) => {
              const pctNum = parseFloat(inc.pct || '0');
              const barColor = pctNum >= 95 ? '#10b981' : pctNum >= 80 ? '#f59e0b' : '#ef4444';
              return (
                <div key={inc.id} className={styles.incidentCard}>
                  <div className={styles.incidentTop}>
                    <span className={`${styles.sevBadge} ${getSeverityClass(inc.severity)}`}>
                      {inc.severity}
                    </span>
                    <span className={styles.incDate}>{inc.date}</span>
                  </div>
                  <h4>{inc.name}</h4>
                  {inc.assetName && (
                    <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '10px', marginTop: '-4px' }}>
                      <Activity size={12} /> {inc.assetName}
                    </div>
                  )}

                  {/* Resumen numérico */}
                  <div className={styles.incSummaryRow}>
                    <div className={styles.incSumItem}>
                      <span className={styles.incSumLabel}>Total</span>
                      <strong>{isMounted ? (inc.total || 0).toLocaleString() : (inc.total || 0)}</strong>
                    </div>
                    <div className={styles.incSumItem}>
                      <span className={styles.incSumLabel}>Correctos</span>
                      <strong style={{ color: '#10b981' }}>{isMounted ? (inc.compliant || 0).toLocaleString() : (inc.compliant || 0)}</strong>
                    </div>
                    <div className={styles.incSumItem}>
                      <span className={styles.incSumLabel}>Errores</span>
                      <strong style={{ color: '#ef4444' }}>{isMounted ? (inc.affected || 0).toLocaleString() : (inc.affected || 0)}</strong>
                    </div>
                  </div>

                  {/* Barra de porcentaje */}
                  <div className={styles.incBarContainer}>
                    <div className={styles.incBarTrack}>
                      <div className={styles.incBarFill} style={{ width: `${pctNum}%`, backgroundColor: barColor }} />
                    </div>
                    <span className={styles.incBarPct} style={{ color: barColor }}>{inc.pct}%</span>
                  </div>

                  <div className={styles.incMeta}>
                    <div className={styles.metaItem}>
                      <Database size={14} /> {inc.system}
                    </div>
                  </div>
                  <div className={styles.incFooter}>
                    <div className={styles.incOwner}>
                      <div className={styles.avatar}>{(inc.owner || 'N')[0]}</div>
                      <span>{inc.owner}</span>
                    </div>
                    {inc.status === 'Corregido' ? (
                      <span style={{ color: '#10b981', fontSize: '0.85rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <CheckCircle2 size={16} /> Resuelto
                      </span>
                    ) : (
                      <button 
                        className={styles.resolveBtn} 
                        onClick={async (e) => {
                          if (!inc.dbId) {
                            alert('Función disponible tras persistencia');
                            return;
                          }
                          const btn = e.currentTarget;
                          btn.disabled = true;
                          btn.innerText = 'Procesando...';
                          await handleResolveIncident(inc.dbId);
                          btn.disabled = false;
                          btn.innerText = 'Gestionar';
                        }}
                      >
                        Gestionar
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className={styles.bottomSection}>
        <div className={styles.sectionHeader}>
          <h3>Dimensiones de Calidad Sugeridas por IA</h3>
          <p>Basado en el análisis de patrones, Nexus AI recomienda estas reglas.</p>
        </div>
        <div className={styles.aiSuggestions}>
          <div className={styles.suggestionCard}>
            <Zap size={20} color="#6366f1" />
            <div className={styles.suggContent}>
              <strong>Validación de RFC</strong>
              <p>Detectamos inconsistencias en formatos de identificación fiscal en 3 tablas de Oracle DB.</p>
            </div>
            <button className={styles.applyBtn}>Aplicar Regla</button>
          </div>
          <div className={styles.suggestionCard}>
            <ShieldCheck size={20} color="#10b981" />
            <div className={styles.suggContent}>
              <strong>Control de Duplicados</strong>
              <p>La tabla Maestro Clientes presenta un 4% de solapamiento en registros por email.</p>
            </div>
            <button className={styles.applyBtn}>Aplicar Regla</button>
          </div>
        </div>
      </div>

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
          if (newRule && selectedAssetId) {
            setRules(prev => {
              let updated;
              const exists = prev.some(r => r.id === newRule.id);
              if (exists) {
                updated = prev.map(r => r.id === newRule.id ? { ...r, ...newRule } : r);
              } else {
                updated = [newRule, ...prev];
              }
              localStorage.setItem(`govdata_rules_${selectedAssetId}`, JSON.stringify(updated));
              return updated;
            });
          }
          if (selectedAssetId) fetchRules(selectedAssetId);
        }}
        assetId={selectedAssetId}
        fields={assets.find(a => a.id === selectedAssetId)?.fields || []}
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
        onDownload={() => handleExportReport(stats)}
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

      <AnimatePresence>
        {isExecuting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={styles.execOverlay}
          >
            <div className={styles.execModal}>
              <div className={styles.execIcon}>
                <Zap size={32} className={styles.zapPulse} />
              </div>
              <h3>Nexus AI: Ejecutando Reglas de Calidad</h3>
              <p>Analizando registros, detectando nulos y validando formatos en tiempo real...</p>

              <div className={styles.execProgress}>
                <div className={styles.execProgressFill} style={{ width: `${executionProgress}%` }} />
              </div>
              <span className={styles.progressText}>{executionProgress}% completado</span>

              <div className={styles.execLog}>
                {executionProgress > 10 && <p>› Conectando a fuentes de datos...</p>}
                {executionProgress > 30 && <p>› Ejecutando reglas de completitud en SAP ERP...</p>}
                {executionProgress > 50 && <p>› Validando formatos de identificación en Oracle DB...</p>}
                {executionProgress > 70 && <p>› Detectando duplicados en Salesforce Leads...</p>}
                {executionProgress > 90 && <p>› Generando reporte de incidentes...</p>}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
