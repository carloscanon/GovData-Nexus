'use client';

import React, { useState, useRef } from 'react';
import { 
  X, 
  Upload, 
  Download, 
  FileSpreadsheet, 
  AlertCircle, 
  CheckCircle2, 
  Loader2,
  Trash2,
  Table as TableIcon,
  Users,
  ShieldCheck,
  Zap
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { supabase } from '@/lib/supabase';
import { usePlatform } from '@/contexts/PlatformContext';
import styles from './ImportExcelModal.module.css';

interface ImportExcelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newData?: any) => void;
}

export default function ImportExcelModal({ isOpen, onClose, onSuccess }: ImportExcelModalProps) {
  const { mode } = usePlatform();
  const [step, setStep] = useState(1); // 1: Download/Upload, 2: Validate, 3: Preview/Import
  const [file, setFile] = useState<File | null>(null);
  const [data, setData] = useState<any>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const downloadTemplate = () => {
    const wb = XLSX.utils.book_new();

    // 0. Instrucciones
    const wsInstr = XLSX.utils.aoa_to_sheet([
      ['Paso', 'Detalle'],
      ['1. Activos', 'Registre la información principal del activo (Tabla, API, etc.)'],
      ['2. Campos', 'Detalle las columnas o campos técnicos del activo'],
      ['3. Responsables', 'Asigne dueños de negocio y custodios técnicos'],
      ['4. Clasificación', 'Defina niveles de sensibilidad, riesgo y cumplimiento'],
      ['5. Calidad', 'Registre las mediciones de calidad de los datos']
    ]);
    XLSX.utils.book_append_sheet(wb, wsInstr, 'Instrucciones');

    // 1. Activos
    const wsActivos = XLSX.utils.aoa_to_sheet([
      ['Codigo_Activo', 'Nombre_Activo', 'Tipo_Activo', 'Sistema_Fuente', 'Base_Datos', 'Esquema', 'Tabla_Archivo', 'Area_Duena', 'Criticidad', 'Estado', 'Frecuencia_Actualizacion', 'Descripcion', 'Etiquetas'],
      ['ACT001', 'Maestro Clientes', 'Tabla SQL', 'SAP ERP', 'SAPDB', 'ZSD', 'CLIENTES', 'Ventas', 'Alta', 'Vigente', 'Diario', 'Datos maestros de clientes', 'Maestro, Crítico, IA Ready']
    ]);
    XLSX.utils.book_append_sheet(wb, wsActivos, 'Activos');

    // 2. Campos
    const wsCampos = XLSX.utils.aoa_to_sheet([
      ['Codigo_Activo', 'Nombre_Campo', 'Tipo_Dato', 'Longitud', 'Permite_Nulos', 'Es_Clave', 'Es_Sensible', 'Descripcion_Campo', 'Regla_Calidad'],
      ['ACT001', 'email', 'varchar', '150', 'No', 'No', 'Sí', 'Correo cliente', 'Formato Email']
    ]);
    XLSX.utils.book_append_sheet(wb, wsCampos, 'Campos');

    // 3. Responsables
    const wsResp = XLSX.utils.aoa_to_sheet([
      ['Codigo_Activo', 'Area_Duena', 'Data_Owner', 'Cargo_Owner', 'Email_Owner', 'Data_Steward', 'Email_Steward', 'Custodian_TI'],
      ['ACT001', 'Ventas', 'Juan Pérez', 'Director Comercial', 'juan@empresa.com', 'Maria Garcia', 'maria@empresa.com', 'TI Corporativo']
    ]);
    XLSX.utils.book_append_sheet(wb, wsResp, 'Responsables');

    // 4. Clasificacion
    const wsClas = XLSX.utils.aoa_to_sheet([
      ['Codigo_Activo', 'Sensibilidad', 'Nivel_Riesgo', 'Contiene_Datos_Personales', 'Contiene_Datos_Sensibles', 'Regulado', 'Norma_Aplica', 'Tiempo_Retencion'],
      ['ACT001', 'Confidencial', 'Alto', 'Sí', 'No', 'Sí', 'Habeas Data', '5 años']
    ]);
    XLSX.utils.book_append_sheet(wb, wsClas, 'Clasificacion');

    // 5. Calidad
    const wsCal = XLSX.utils.aoa_to_sheet([
      ['Codigo_Activo', 'Fecha_Medicion', 'Completitud', 'Exactitud', 'Unicidad', 'Consistencia', 'Oportunidad', 'Score_Global'],
      ['ACT001', '2026-05-14', '96', '94', '98', '92', '90', '94']
    ]);
    XLSX.utils.book_append_sheet(wb, wsCal, 'Calidad');

    XLSX.writeFile(wb, 'GovDataNexus_Plantilla_Catalogo_Datos.xlsx');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      setStep(2);
      processFile(uploadedFile);
    }
  };

  const processFile = (file: File) => {
    setIsValidating(true);
    setErrors([]);
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const bstr = e.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        
        const sheetsData: any = {};
        const requiredSheets = ['Activos', 'Campos', 'Responsables', 'Clasificacion', 'Calidad'];
        const currentErrors: string[] = [];

        requiredSheets.forEach(sheetName => {
          if (!wb.SheetNames.includes(sheetName)) {
            currentErrors.push(`Falta la hoja obligatoria: ${sheetName}`);
          } else {
            sheetsData[sheetName] = XLSX.utils.sheet_to_json(wb.Sheets[sheetName]);
          }
        });

        if (currentErrors.length === 0) {
          // Validar códigos únicos en Activos
          const codigos = sheetsData.Activos.map((a: any) => a.Codigo_Activo);
          const uniqueCodigos = new Set(codigos);
          if (uniqueCodigos.size !== codigos.length) {
            currentErrors.push('Existen códigos de activo duplicados en la hoja Activos.');
          }

          // Validar que Campos tengan un Código_Activo existente
          sheetsData.Campos.forEach((c: any, index: number) => {
            if (!uniqueCodigos.has(c.Codigo_Activo)) {
              currentErrors.push(`Error en Campos (Fila ${index + 2}): El código ${c.Codigo_Activo} no existe en Activos.`);
            }
          });
        }

        setData(sheetsData);
        setErrors(currentErrors);
      } catch (err) {
        setErrors(['Error al leer el archivo. Asegúrese de que es un archivo Excel válido.']);
      } finally {
        setIsValidating(false);
      }
    };

    reader.readAsBinaryString(file);
  };

  const handleImport = async () => {
    if (!data || errors.length > 0) return;
    setIsImporting(true);

    if (mode === 'DEMO') {
      try {
        const importedAssets = data.Activos.map((a: any, index: number) => {
          const resp = data.Responsables.find((r: any) => r.Codigo_Activo === a.Codigo_Activo) || {};
          const clas = data.Clasificacion.find((c: any) => c.Codigo_Activo === a.Codigo_Activo) || {};
          const quality = data.Calidad.find((q: any) => q.Codigo_Activo === a.Codigo_Activo) || {};
          const baseTags = a.Etiquetas ? a.Etiquetas.split(',').map((t: string) => t.trim()) : [a.Area_Duena];
          const hasPhysicalTable = !!a.Tabla_Archivo;
          const importTags = hasPhysicalTable ? baseTags : [...baseTags, 'Metadatos_Externos'];

          return {
            id: `DEMO-${Date.now()}-${index}`,
            code_id: a.Codigo_Activo || `ACT-${Math.floor(100 + Math.random() * 900)}`,
            name: a.Nombre_Activo,
            type: a.Tipo_Activo || 'Tabla SQL',
            source: a.Sistema_Fuente || 'Excel Import',
            owner: a.Area_Duena || 'General',
            data_owner: resp.Data_Owner || 'No Asignado',
            data_steward: resp.Data_Steward || 'No Asignado',
            sensitivity: clas.Sensibilidad || 'Interno',
            quality_score: Number(quality.Score_Global) || 100,
            status: a.Estado || 'Vigente',
            risk_level: clas.Nivel_Riesgo || 'Bajo',
            tags: importTags,
            updated_at: new Date().toISOString().split('T')[0]
          };
        });

        setStep(3);
        setTimeout(() => {
          onSuccess(importedAssets);
          onClose();
          // Reset
          setStep(1);
          setFile(null);
          setData(null);
        }, 2000);
      } catch (err) {
        setErrors(['Error al importar los datos en memoria.']);
      } finally {
        setIsImporting(false);
      }
      return;
    }

    try {
      // Importar uno por uno para poder mapear los campos correctamente
      for (const a of data.Activos) {
        const resp = data.Responsables.find((r: any) => r.Codigo_Activo === a.Codigo_Activo) || {};
        const clas = data.Clasificacion.find((c: any) => c.Codigo_Activo === a.Codigo_Activo) || {};
        const quality = data.Calidad.find((q: any) => q.Codigo_Activo === a.Codigo_Activo) || {};

          const baseTags = a.Etiquetas ? a.Etiquetas.split(',').map((t: string) => t.trim()) : [a.Area_Duena];
          
          // Determinar si tiene tabla física configurada
          const hasPhysicalTable = !!a.Tabla_Archivo;
          const importTags = hasPhysicalTable ? baseTags : [...baseTags, 'Metadatos_Externos'];

          const assetPayload = {
            name: a.Nombre_Activo,
            table_name: a.Tabla_Archivo || null, // Nombre técnico REAL de la tabla física
            description: a.Descripcion,
            type: a.Tipo_Activo || 'Tabla SQL',
            source: a.Sistema_Fuente,
            owner: a.Area_Duena,
            data_owner: resp.Data_Owner,
            data_steward: resp.Data_Steward,
            sensitivity: clas.Sensibilidad || 'Interno',
            risk_level: clas.Nivel_Riesgo || 'Bajo',
            criticality: a.Criticidad || 'Media',
            status: a.Estado || 'Vigente',
            tags: importTags,
          code_id: a.Codigo_Activo,
          quality_score: quality.Score_Global || 100
        };

        const { data: insertedAsset, error: assetError } = await supabase
          .from('data_assets')
          .insert([assetPayload])
          .select();

        if (assetError) throw assetError;

        const newAssetId = insertedAsset[0].id;

        // Buscar y mapear campos para este activo
        const assetFields = data.Campos.filter((c: any) => c.Codigo_Activo === a.Codigo_Activo);
        if (assetFields.length > 0) {
          const fieldsToInsert = assetFields.map((f: any) => ({
            asset_id: newAssetId,
            field_name: f.Nombre_Campo,
            data_type: f.Tipo_Dato || 'text',
            description: f.Descripcion_Campo || '',
            is_sensitive: f.Es_Sensible === 'Sí',
            quality_rule: f.Regla_Calidad || '',
            is_mandatory: f.Permite_Nulos === 'No'
          }));

          const { error: fieldsError } = await supabase.from('asset_fields').insert(fieldsToInsert);
          if (fieldsError) console.error(`Error al importar campos para ${a.Codigo_Activo}:`, fieldsError);
        }
      }

      setStep(3);
      setTimeout(() => {
        onSuccess();
        onClose();
        // Reset
        setStep(1);
        setFile(null);
        setData(null);
      }, 2000);

    } catch (err) {
      setErrors(['Error al insertar datos en la base de datos.']);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <div>
            <h2>Importar Catálogo Masivo</h2>
            <p>Cargue sus activos de datos desde una plantilla Excel.</p>
          </div>
          <button onClick={onClose} className={styles.closeBtn}>
            <X size={20} />
          </button>
        </div>

        <div className={styles.content}>
          {step === 1 && (
            <div className={styles.step1}>
              <div className={styles.downloadSection}>
                <div className={styles.iconCircle}>
                  <Download size={32} />
                </div>
                <h3>1. Descargue la Plantilla</h3>
                <p>Use nuestra plantilla oficial con todas las validaciones necesarias para una carga exitosa.</p>
                <button onClick={downloadTemplate} className={styles.downloadBtn}>
                  <FileSpreadsheet size={18} />
                  Descargar Plantilla (.xlsx)
                </button>
              </div>

              <div className={styles.divider}></div>

              <div className={styles.uploadSection}>
                <div className={styles.iconCircle}>
                  <Upload size={32} />
                </div>
                <h3>2. Suba su Archivo</h3>
                <p>Una vez llena, suba la plantilla aquí para validarla.</p>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  accept=".xlsx, .xls"
                  style={{ display: 'none' }}
                />
                <button 
                  onClick={() => fileInputRef.current?.click()} 
                  className={styles.uploadBtn}
                >
                  Seleccionar Archivo
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className={styles.step2}>
              <div className={styles.fileStatus}>
                <FileSpreadsheet size={40} color="var(--primary)" />
                <div>
                  <h4>{file?.name}</h4>
                  <span>{(file?.size || 0) / 1024} KB • {isValidating ? 'Validando...' : 'Leído'}</span>
                </div>
                <button onClick={() => { setStep(1); setFile(null); }} className={styles.removeBtn}>
                  <Trash2 size={18} />
                </button>
              </div>

              {isValidating ? (
                <div className={styles.validatingState}>
                  <Loader2 className={styles.spin} size={40} />
                  <p>Validando estructura y consistencia de datos...</p>
                </div>
              ) : (
                <div className={styles.results}>
                  {errors.length > 0 ? (
                    <div className={styles.errorBox}>
                      <div className={styles.boxTitle}>
                        <AlertCircle size={20} />
                        <span>Se encontraron errores en el archivo</span>
                      </div>
                      <ul>
                        {errors.map((err, i) => <li key={i}>{err}</li>)}
                      </ul>
                      <button onClick={() => setStep(1)} className={styles.retryBtn}>
                        Corregir y Reintentar
                      </button>
                    </div>
                  ) : (
                    <div className={styles.successBox}>
                      <div className={styles.boxTitle}>
                        <CheckCircle2 size={20} />
                        <span>Archivo válido y listo para importar</span>
                      </div>
                      <div className={styles.statsSummary}>
                        <div className={styles.stat}>
                          <TableIcon size={16} />
                          <strong>{data?.Activos?.length}</strong> Activos
                        </div>
                        <div className={styles.stat}>
                          <Zap size={16} />
                          <strong>{data?.Campos?.length}</strong> Campos
                        </div>
                        <div className={styles.stat}>
                          <Users size={16} />
                          <strong>{data?.Responsables?.length}</strong> Dueños
                        </div>
                        <div className={styles.stat}>
                          <ShieldCheck size={16} />
                          <strong>{data?.Clasificacion?.length}</strong> Clasif.
                        </div>
                      </div>
                      
                      <div className={styles.actions}>
                        <button onClick={() => setStep(1)} className={styles.cancelBtn}>Cancelar</button>
                        <button 
                          onClick={handleImport} 
                          className={styles.confirmBtn}
                          disabled={isImporting}
                        >
                          {isImporting ? <Loader2 className={styles.spin} size={18} /> : 'Confirmar Importación'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div className={styles.step3}>
              <div className={styles.importSuccess}>
                <div className={styles.checkAnim}>
                  <CheckCircle2 size={80} />
                </div>
                <h2>¡Importación Exitosa!</h2>
                <p>Se han cargado correctamente {data?.Activos?.length} activos al catálogo de datos.</p>
                <div className={styles.loaderLine}>
                  <div className={styles.loaderFill}></div>
                </div>
                <span>Actualizando catálogo...</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
