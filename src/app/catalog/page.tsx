'use client';

import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  MoreVertical, 
  Database, 
  Table as TableIcon, 
  FileJson, 
  BarChart,
  Tag,
  Shield,
  ExternalLink
} from 'lucide-react';
import styles from './catalog.module.css';

const assets = [
  { id: 1, name: 'Maestro de Clientes', type: 'Tabla SQL', source: 'SAP ERP', owner: 'Ventas', sensitivity: 'Confidencial', quality: 94, status: 'Vigente' },
  { id: 2, name: 'Transacciones Q2', type: 'Vista', source: 'Oracle DB', owner: 'Finanzas', sensitivity: 'Restringido', quality: 88, status: 'Vigente' },
  { id: 3, name: 'Leads Marketing', type: 'API', source: 'Salesforce', owner: 'Marketing', sensitivity: 'Público', quality: 72, status: 'En Revisión' },
  { id: 4, name: 'Reporte Consolidado Anual', type: 'Power BI', source: 'Data Lake', owner: 'Estrategia', sensitivity: 'Confidencial', quality: 99, status: 'Vigente' },
  { id: 5, name: 'Inventario Global', type: 'Tabla SQL', source: 'PostgreSQL', owner: 'Logística', sensitivity: 'Interno', quality: 85, status: 'Vigente' },
  { id: 6, name: 'Logs de Acceso', type: 'JSON', source: 'Azure Blob', owner: 'Seguridad IT', sensitivity: 'Altamente Sensible', quality: 100, status: 'Vigente' },
];

export default function Catalog() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredAssets = assets.filter(asset => 
    asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.owner.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <h1>Catálogo de Datos</h1>
          <p>Inventario centralizado de todos los activos de información de la organización.</p>
        </div>
        <button className={styles.addBtn}>
          <Plus size={18} />
          Registrar Activo
        </button>
      </header>

      <div className={styles.toolbar}>
        <div className={styles.searchBar}>
          <Search size={20} className={styles.searchIcon} />
          <input 
            type="text" 
            placeholder="Buscar por nombre, fuente o dueño..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className={styles.filters}>
          <button className={styles.filterBtn}>
            <Filter size={18} />
            Filtros
          </button>
          <select className={styles.select}>
            <option>Todas las fuentes</option>
            <option>SAP ERP</option>
            <option>Salesforce</option>
            <option>Oracle DB</option>
          </select>
        </div>
      </div>

      <div className={styles.tableCard}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Nombre del Activo</th>
              <th>Tipo</th>
              <th>Fuente</th>
              <th>Área Dueña</th>
              <th>Sensibilidad</th>
              <th>Calidad</th>
              <th>Estado</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filteredAssets.map(asset => (
              <tr key={asset.id} className={styles.row}>
                <td className={styles.nameCell}>
                  <div className={styles.iconBox}>
                    {asset.type.includes('Tabla') ? <TableIcon size={16} /> : 
                     asset.type.includes('API') ? <FileJson size={16} /> : 
                     <Database size={16} />}
                  </div>
                  <div>
                    <span className={styles.assetName}>{asset.name}</span>
                    <span className={styles.assetSub}>ID: AST-{asset.id}00{asset.id}</span>
                  </div>
                </td>
                <td>{asset.type}</td>
                <td>{asset.source}</td>
                <td>{asset.owner}</td>
                <td>
                  <span className={`${styles.badge} ${styles[asset.sensitivity.toLowerCase().replace(' ', '')]}`}>
                    <Shield size={12} />
                    {asset.sensitivity}
                  </span>
                </td>
                <td>
                  <div className={styles.qualityCell}>
                    <div className={styles.qualityTrack}>
                      <div className={styles.qualityFill} style={{ 
                        width: `${asset.quality}%`,
                        backgroundColor: asset.quality > 90 ? '#10b981' : asset.quality > 80 ? '#f59e0b' : '#ef4444'
                      }}></div>
                    </div>
                    <span>{asset.quality}%</span>
                  </div>
                </td>
                <td>
                  <span className={`${styles.status} ${asset.status === 'Vigente' ? styles.active : styles.pending}`}>
                    {asset.status}
                  </span>
                </td>
                <td>
                  <button className={styles.actionBtn}>
                    <MoreVertical size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
