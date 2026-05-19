'use client';

import React, { useMemo } from 'react';
import { usePlatform } from '@/contexts/PlatformContext';

export default function BillingPage() {
  const { tenants, plans } = usePlatform();

  // Calcular ingresos mensuales esperados (MRR)
  const mrr = useMemo(() => {
    return tenants
      .filter(t => t.status === 'active')
      .reduce((sum, t) => {
        const plan = plans.find(p => p.name === t.plan);
        return sum + (plan?.priceMonthly || 0);
      }, 0);
  }, [tenants, plans]);

  // Costo simulado de infraestructura (ejemplo: base $100 + $15 por cada plan pro/enterprise + $5 por starter)
  const infraCost = useMemo(() => {
    return tenants.reduce((cost, t) => {
      if (t.plan === 'Enterprise') return cost + 50;
      if (t.plan === 'Professional') return cost + 15;
      return cost + 5;
    }, 100);
  }, [tenants]);

  // Margen de ganancia
  const profitMargin = mrr > 0 ? ((mrr - infraCost) / mrr) * 100 : 0;

  // Invoices dinámicas
  const invoices = useMemo(() => {
    return tenants.map((t, i) => {
      const plan = plans.find(p => p.name === t.plan);
      return {
        id: `INV-${String(100 + i).padStart(3, '0')}`,
        company: t.name,
        date: t.createdAt || new Date().toISOString().split('T')[0],
        amount: `$${plan?.priceMonthly || 0}.00`,
        status: t.status === 'active' ? 'Pagado' : 'Pendiente',
        plan: t.plan,
      };
    });
  }, [tenants, plans]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Facturación & Uso</h1>
        <p className="text-slate-500 mt-1">Monitorea los costos de infraestructura, suscripciones y facturas emitidas.</p>
      </div>

      {/* Cost Structure Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-slate-500 font-medium mb-2">Costo Total de Infraestructura</h3>
          <p className="text-3xl font-bold text-slate-900">${infraCost.toFixed(2)}</p>
          <span className="text-xs text-slate-400">Cómputo en la nube, DB & APIs</span>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-slate-500 font-medium mb-2">Margen de Ganancia (SaaS)</h3>
          <p className="text-3xl font-bold text-emerald-600">{profitMargin.toFixed(1)}%</p>
          <span className="text-xs text-slate-400">Ingresos vs Costos de Operación</span>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-slate-500 font-medium mb-2">Próxima Facturación Estimada (MRR)</h3>
          <p className="text-3xl font-bold text-slate-900">${mrr.toFixed(2)}</p>
          <span className="text-xs text-slate-400">Basado en planes activos actuales</span>
        </div>
      </div>

      {/* Usage Analytics per Tenant */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Consumo y Estructura de Costos por Empresa</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-sm font-semibold text-slate-600">
                <th className="py-3 px-4">Empresa</th>
                <th className="py-3 px-4">Usuarios Activos / Límite</th>
                <th className="py-3 px-4">Storage (DB)</th>
                <th className="py-3 px-4">Llamadas API</th>
                <th className="py-3 px-4">Costo Operativo</th>
                <th className="py-3 px-4">Precio Suscripción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {tenants.map((tenant) => {
                const planDef = plans.find(p => p.name === tenant.plan);
                const maxUsers = planDef?.maxUsers === 9999 ? '∞' : planDef?.maxUsers || 0;
                const storageGb = planDef?.storageGb || 0;
                
                // Simulación de uso actual basado en el id/plan (en un entorno real viene de DB)
                const currentUsers = planDef?.maxUsers === 9999 ? Math.floor(Math.random() * 500) + 50 : Math.floor(Math.random() * (planDef?.maxUsers || 10));
                const currentStorage = (Math.random() * storageGb * 0.8).toFixed(1);
                const apiCalls = Math.floor(Math.random() * 500) + 'k / ' + (planDef?.apiAccess ? '1M' : '50k');
                const opCost = tenant.plan === 'Enterprise' ? '$120.00' : tenant.plan === 'Professional' ? '$45.00' : '$12.50';

                return (
                  <tr key={tenant.id} className="hover:bg-slate-50 opacity-100">
                    <td className="py-4 px-4 font-medium text-slate-900 flex items-center gap-2">
                      <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs">{tenant.name.charAt(0)}</div>
                      {tenant.name}
                      {tenant.status === 'suspended' && <span className="ml-2 text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">Suspendida</span>}
                    </td>
                    <td className="py-4 px-4">{currentUsers} / {maxUsers}</td>
                    <td className="py-4 px-4">{currentStorage} GB / {storageGb} GB</td>
                    <td className="py-4 px-4">{apiCalls}</td>
                    <td className="py-4 px-4 text-slate-500">{opCost}</td>
                    <td className="py-4 px-4 font-semibold text-emerald-600">${planDef?.priceMonthly || 0}.00</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Facturas Recientes</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-sm font-semibold text-slate-600">
                <th className="py-3 px-4">Factura ID</th>
                <th className="py-3 px-4">Empresa</th>
                <th className="py-3 px-4">Fecha</th>
                <th className="py-3 px-4">Plan</th>
                <th className="py-3 px-4">Monto</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50">
                  <td className="py-4 px-4 font-medium text-blue-600">{inv.id}</td>
                  <td className="py-4 px-4 font-medium text-slate-900">{inv.company}</td>
                  <td className="py-4 px-4 text-slate-500">{inv.date}</td>
                  <td className="py-4 px-4">{inv.plan}</td>
                  <td className="py-4 px-4 font-semibold">{inv.amount}</td>
                  <td className="py-4 px-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      inv.status === 'Pagado' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <button className="text-slate-400 hover:text-blue-600 text-sm font-medium">Descargar PDF</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
