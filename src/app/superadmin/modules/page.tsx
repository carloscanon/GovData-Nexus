'use client';

import React, { useState } from 'react';

const initialModules = [
  { id: 'catalog', name: 'Catálogo de Datos', description: 'Inventario de activos, metadatos, linaje de datos e importación inteligente.', status: 'stable', enabledCount: 24, basePrice: '$300/mes' },
  { id: 'quality', name: 'Calidad de Datos', description: 'Monitoreo de reglas, alertas de severidad, integraciones webhooks e incidencias.', status: 'stable', enabledCount: 18, basePrice: '$500/mes' },
  { id: 'security', name: 'Seguridad y Riesgos', description: 'Gestión de riesgos, enmascaramiento de datos, políticas RLS y auditoría de accesos.', status: 'stable', enabledCount: 12, basePrice: '$600/mes' },
  { id: 'workflows', name: 'Workflows', description: 'Orquestación de procesos de gobernanza, aprobación y flujos automatizados.', status: 'stable', enabledCount: 15, basePrice: '$400/mes' },
  { id: 'ai', name: 'Asistente de IA (Copilot)', description: 'Sugerencias basadas en IA, generación automática de reglas de calidad y chat interactivo.', status: 'beta', enabledCount: 6, basePrice: '$1,000/mes' },
];

export default function ModulesPage() {
  const [modules, setModules] = useState(initialModules);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Catálogo de Módulos</h1>
          <p className="text-slate-500 mt-1">Habilita, edita y gestiona el catálogo de módulos funcionales para las empresas suscritas.</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm flex items-center space-x-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Nuevo Módulo</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((mod) => (
          <div key={mod.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between hover:border-blue-300 transition-all hover:shadow-md">
            <div>
              <div className="flex justify-between items-start mb-4">
                <span className={`px-2 py-1 rounded text-xs font-semibold uppercase ${
                  mod.status === 'stable' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-purple-50 text-purple-700 border border-purple-200'
                }`}>
                  {mod.status}
                </span>
                <span className="text-sm font-semibold text-slate-900">{mod.basePrice}</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">{mod.name}</h3>
              <p className="text-sm text-slate-500 line-clamp-3 mb-6">{mod.description}</p>
            </div>
            
            <div className="border-t border-slate-100 pt-4 flex items-center justify-between mt-auto">
              <span className="text-xs text-slate-400 font-medium">Empresas Activas: {mod.enabledCount}</span>
              <div className="flex space-x-2">
                <button className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600 border border-slate-200 hover:border-blue-200 rounded-lg transition-colors">
                  Configurar
                </button>
                <button className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
                  Administrar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
