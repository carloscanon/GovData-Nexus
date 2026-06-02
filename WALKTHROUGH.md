# 🚀 GovData Nexus - Guía de Usuario

¡Bienvenido a tu nueva plataforma integral de Gobierno de Datos! Esta solución ha sido diseñada para ofrecer una experiencia premium, ejecutiva y altamente intuitiva.

## 📱 Módulos Implementados

### 1. Panel Ejecutivo (Dashboard)
- **KPIs en tiempo real**: Madurez global, calidad promedio, activos y riesgos críticos.
- **Gráficos Dinámicos**: Visualiza la evolución semestral de la calidad vs. la madurez.
- **Incidentes**: Listado rápido de alertas de calidad con semaforización.

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
