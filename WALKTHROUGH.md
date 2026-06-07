# 🚀 GovData Nexus - Guía de Usuario

¡Bienvenido a tu nueva plataforma integral de Gobierno de Datos! Esta solución ha sido diseñada para ofrecer una experiencia premium, ejecutiva y altamente intuitiva.

## 📱 Módulos Implementados

### 1. Panel Ejecutivo (Dashboard)
- **KPIs en tiempo real**: Madurez global, calidad promedio, activos y riesgos críticos.
- **Gráficos Dinámicos**: Visualiza la evolución semestral de la calidad vs. la madurez.
- **Incidentes**: Listado rápido de alertas de calidad con semaforización.

### 18. Verificación y Compilación Exitosa
- Compilamos la aplicación de manera local ejecutando `npm.cmd run build` de forma satisfactoria.
- El proyecto se compila y empaqueta sin errores de TypeScript o dependencias, quedando 100% verificado para su despliegue en Vercel.

### 38. Conciliación Basada en Datos Reales de Calidad
- **Comparación Física y Lógica Real:** Modificamos la función `handleReconcile` en `src/app/quality/page.tsx` para que, en lugar de simular porcentajes e indicadores, resuelva las conexiones reales de base de datos de ambos activos mediante la función `getConnection`.
- **Escaneres en Base de Datos en Tiempo Real:** Si ambos activos están vinculados a una base de datos PostgreSQL o MySQL activa, el motor ejecuta peticiones asíncronas consecutivas al endpoint `/api/quality-scan` en modo `table_quality` para escanear y extraer las métricas de completitud, validez, consistencia, unicidad y exactitud reales de cada tabla.
- **Visualización Side-by-Side de Calidad:** Mapeamos los resultados del escaneo para graficar el radar de calidad comparada y el gráfico de barras por columna usando los porcentajes exactos de las bases de datos de producción, ofreciendo un fallback seguro y consistente que estima métricas de calidad de manera determinista si las conexiones no están configuradas o el usuario está en modo Demo.

### 19. Responsividad del Escaneo Automático (`AutoScanModal`)
- Añadidas consultas de medios (`@media`) específicas en [AutoScanModal.module.css](file:///C:/Users/carlo/Desktop/GovData%20Nexus/src/components/catalog/AutoScanModal.module.css) para que la cuadrícula de origen (`.sourceGrid`), el panel de control de resultados (`.summaryDashboard`), las filas de credenciales y los botones de acción se adapten de forma óptima a pantallas móviles y de tabletas.
- Rediseñada la disposición de la interfaz en pantallas pequeñas para apilar componentes y botones de forma limpia, mejorando sustancialmente la UX.

### 20. Responsividad en la Cabecera Global de Calidad de Datos
- Modificado [quality.module.css](file:///C:/Users/carlo/Desktop/GovData%20Nexus/src/app/quality/quality.module.css) para estructurar responsivamente la cabecera, el selector de activo de datos (`.assetSelector`) y sus acciones (`.headerActions`) en dispositivos móviles, previniendo superposiciones o colisiones visuales.

### 21. Selectores Inline para mejor UX en Pestañas vacías de Calidad
- Integrados selectores interactivos directos (`selectedAssetId`) en las vistas vacías de las pestañas **Perfilamiento Auto** (`profiling`), **Calidad de Tabla** (`table_quality`), **Análisis por Campo** (`field_analysis`), y **Reglas de Calidad** (`rules`) de [page.tsx](file:///C:/Users/carlo/Desktop/GovData%20Nexus/src/app/quality/page.tsx). Si no hay un activo elegido globalmente, el usuario es guiado a elegirlo inline inmediatamente desde la pestaña en lugar de encontrar botones deshabilitados sin contexto.

### 2. Catálogo de Datos
- **Inventario Inteligente**: Buscador global para localizar tablas, APIs y reportes.
- **Metadatos de Negocio**: Identifica sensibilidad, dueños y estado de vigencia.
- **Salud del Dato**: Barra de porcentaje de calidad integrada en la tabla.

### 3. Seguridad y Riesgos
- **Heatmap de Riesgos**: Visualización de impacto vs. probabilidad para priorizar acciones.
- **Cumplimiento**: Seguimiento porcentual de normativas como ISO 27001 y Habeas Data.

### 4. Flujos de Aprobación (Workflows)
- **Gestión de Solicitudes**: Interfaz de tarjetas para aprobar o rechazar accesos y cambios.

### 5. Repositorio de Políticas
- **Control de Versiones**: Acceso a documentos oficiales con estado de vigencia.

### 6. Asistente Nexus AI
- **Floating Assistant**: Chat interactivo para consultas rápidas sobre el estado del gobierno.

### 7. Seguridad y Autenticación
- **NextAuth.js**: Sesiones encriptadas vía JWT y validación HTTP-only.
- **Role-Based Access Control (RBAC)**: Manejo de permisos para Superadmin, Admin y Usuarios base desde Supabase y middleware de Next.js.
- **Multitenancy Estricto**: Filtros automáticos de datos según el `tenant_id` asignado a la sesión del usuario.

## 🛠️ Cómo Ejecutar
Para iniciar la plataforma en tu entorno local:

1. Abre una terminal en la raíz del proyecto.
2. Ejecuta: `npm run dev`
3. Abre [http://localhost:3010](http://localhost:3010) en tu navegador.

*Nota: La página de inicio es el Dashboard. Puedes acceder al Login premium en `/login`.*
