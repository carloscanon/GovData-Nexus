/**
 * moduleRegistry.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Single source of truth for every module in the GovData Nexus platform.
 *
 * When a new module is added to the Sidebar, add it here and it will
 * automatically appear in:
 *   • SuperAdmin → Nombres de Módulos (module-names/page.tsx)
 *   • SuperAdmin → Roles (roles/page.tsx  – module selector checklist)
 *   • SuperAdmin → Catálogo de Módulos (modules/page.tsx)
 *
 * type:
 *   'superadmin' – only visible in the SuperAdmin sidebar section
 *   'tenant'     – visible to tenant users (normal users)
 */

export interface ModuleDefinition {
  /** Unique slug used as route segment, config key and DB module id */
  key: string;
  /** Human-readable default label shown in the sidebar */
  label: string;
  /** Brief description shown in the Modules catalogue */
  description: string;
  /** Which sidebar section this belongs to */
  type: 'superadmin' | 'tenant';
  /** Optional price shown in Modules catalogue (tenant modules only) */
  basePrice?: string;
  /** Release status badge */
  status?: 'stable' | 'beta' | 'alpha';
  /** Icon name from lucide-react (informational – not imported here) */
  icon?: string;
}

// ─── SuperAdmin Modules ───────────────────────────────────────────────────────
export const SUPERADMIN_MODULES: ModuleDefinition[] = [
  { key: 'dashboard',    label: 'Dashboard SaaS',          description: 'Vista general del estado del SaaS, métricas y KPIs de la plataforma.',        type: 'superadmin', status: 'stable' },
  { key: 'empresas',     label: 'Empresas',                 description: 'Gestión de clientes empresariales y tenants suscritos.',                       type: 'superadmin', status: 'stable' },
  { key: 'demos',        label: 'Solicitud de Demos',       description: 'Pipeline de solicitudes de demo y seguimiento comercial.',                      type: 'superadmin', status: 'stable' },
  { key: 'planes',       label: 'Planes SaaS',              description: 'Definición y gestión de planes de suscripción y precios.',                      type: 'superadmin', status: 'stable' },
  { key: 'billing',      label: 'Facturación',              description: 'Control de facturación, pagos y estados de cuenta por tenant.',                 type: 'superadmin', status: 'stable' },
  { key: 'consumo',      label: 'Control de Consumo',       description: 'Monitoreo de uso de recursos, cuotas y límites por plan.',                      type: 'superadmin', status: 'stable' },
  { key: 'escaneos',     label: 'Escaneos Automáticos',     description: 'Configuración de escaneos automáticos de calidad y seguridad.',                 type: 'superadmin', status: 'stable' },
  { key: 'tickets',      label: 'Soporte Tickets',          description: 'Sistema de tickets de soporte y seguimiento de incidencias.',                   type: 'superadmin', status: 'stable' },
  { key: 'security',     label: 'Seguridad y RLS',          description: 'Gestión de políticas de seguridad, RLS y acceso a recursos.',                   type: 'superadmin', status: 'stable' },
  { key: 'logs',         label: 'Logs de Auditoría',        description: 'Registro completo de acciones, eventos y cambios en la plataforma.',             type: 'superadmin', status: 'stable' },
  { key: 'loginConfig',  label: 'Portal de Login',          description: 'Personalización del portal de autenticación y branding por tenant.',            type: 'superadmin', status: 'stable' },
  { key: 'config',       label: 'Configuración',            description: 'Configuración global de la plataforma y parámetros del sistema.',               type: 'superadmin', status: 'stable' },
  { key: 'moduleNames',  label: 'Nombres de Módulos',       description: 'Personalización de etiquetas de módulos para cada tenant.',                     type: 'superadmin', status: 'stable' },
  { key: 'roles',        label: 'Roles',                    description: 'Gestión de roles personalizados y asignación de permisos por módulo.',           type: 'superadmin', status: 'stable' },
  { key: 'modules',      label: 'Catálogo de Módulos',      description: 'Catálogo maestro de todos los módulos funcionales de la plataforma.',            type: 'superadmin', status: 'stable' },
];

// ─── Tenant (Normal User) Modules ─────────────────────────────────────────────
export const TENANT_MODULES: ModuleDefinition[] = [
  { key: 'launchpad',       label: 'GovData Launchpad',       description: 'Centro de inicio y acceso rápido a todos los módulos de la plataforma.',        type: 'tenant', status: 'stable', basePrice: 'Incluido'   },
  { key: 'journey',         label: 'Journey CDO',             description: 'Hoja de ruta interactiva para Chief Data Officers y líderes de datos.',         type: 'tenant', status: 'stable', basePrice: '$200/mes'   },
  { key: 'appstore',        label: 'App Store',               description: 'Marketplace de integraciones, conectores y extensiones para la plataforma.',     type: 'tenant', status: 'stable', basePrice: 'Incluido'   },
  { key: 'command-center',  label: 'Command Center 360°',     description: 'Vista ejecutiva 360° con indicadores clave de gobernanza de datos.',            type: 'tenant', status: 'stable', basePrice: 'Incluido'   },
  { key: 'normativas',      label: 'Biblioteca Inteligente',  description: 'Biblioteca digital de marcos, estándares, regulaciones y normativas de datos.',  type: 'tenant', status: 'stable', basePrice: '$250/mes'   },
  { key: 'metadata',        label: 'Metadata Intelligence',   description: 'Gestión inteligente de metadatos, glosarios y diccionario de datos.',            type: 'tenant', status: 'stable', basePrice: '$300/mes'   },
  { key: 'catalog',         label: 'Catálogo de Datos',       description: 'Inventario de activos, metadatos, linaje de datos e importación inteligente.',   type: 'tenant', status: 'stable', basePrice: '$300/mes'   },
  { key: 'quality',         label: 'Calidad de Datos',        description: 'Monitoreo de reglas, alertas de severidad, integraciones webhooks e incidencias.', type: 'tenant', status: 'stable', basePrice: '$500/mes' },
  { key: 'policies',        label: 'Políticas',               description: 'Gestión de políticas de datos, aprobación y trazabilidad normativa.',            type: 'tenant', status: 'stable', basePrice: '$200/mes'   },
  { key: 'team',            label: 'Roles y Equipo',          description: 'Gestión de equipos, roles y accesos dentro del tenant.',                        type: 'tenant', status: 'stable', basePrice: 'Incluido'   },
  { key: 'committees',      label: 'Comités de Gobierno',     description: 'Organización y seguimiento de comités de gobierno de datos.',                    type: 'tenant', status: 'stable', basePrice: '$150/mes'   },
  { key: 'workflows',       label: 'Gestión de Workflows',    description: 'Orquestación de procesos de gobernanza, aprobación y flujos automatizados.',     type: 'tenant', status: 'stable', basePrice: '$400/mes'   },
  { key: 'maturity',        label: 'Madurez DAMA',            description: 'Evaluación y seguimiento del modelo de madurez DAMA-DMBOK.',                     type: 'tenant', status: 'stable', basePrice: '$350/mes'   },
  { key: 'simulator',       label: 'Simulador CDO',           description: 'Simulador estratégico para escenarios de decisión del CDO.',                     type: 'tenant', status: 'stable', basePrice: '$450/mes'   },
];

// ─── Combined registry ────────────────────────────────────────────────────────
export const ALL_MODULES: ModuleDefinition[] = [
  ...SUPERADMIN_MODULES,
  ...TENANT_MODULES,
];

/**
 * Quick lookup: key → default label
 * Replaces the scattered DEFAULT_LABELS objects that were copy-pasted across files.
 */
export const MODULE_DEFAULT_LABELS: Record<string, string> = Object.fromEntries(
  ALL_MODULES.map((m) => [m.key, m.label])
);
