export interface Option {
  text: string;
  score: number;
}

export interface Question {
  id: string;
  pillar: 'estrategia' | 'organizacion' | 'calidad' | 'arquitectura' | 'seguridad' | 'cumplimiento';
  title: string;
  options: Option[];
}

export const QUESTIONS: Question[] = [
  // ESTRATEGIA (8)
  {
    id: 'est_1', pillar: 'estrategia',
    title: '¿Existe un Comité de Gobierno de Datos formalizado y sesionando?',
    options: [
      { text: 'No existe.', score: 1 },
      { text: 'Está en diseño o se reúne informalmente.', score: 3 },
      { text: 'Sí, formalizado y toma decisiones activamente.', score: 5 }
    ]
  },
  {
    id: 'est_2', pillar: 'estrategia',
    title: '¿La estrategia de datos está alineada con los objetivos corporativos?',
    options: [
      { text: 'No, son iniciativas de TI aisladas.', score: 1 },
      { text: 'Parcialmente, algunos proyectos tienen impacto en negocio.', score: 3 },
      { text: 'Totalmente alineada y patrocinada por Alta Dirección.', score: 5 }
    ]
  },
  {
    id: 'est_3', pillar: 'estrategia',
    title: '¿Existe presupuesto asignado específicamente para iniciativas de datos?',
    options: [
      { text: 'No hay presupuesto específico.', score: 1 },
      { text: 'Se aprueba presupuesto proyecto por proyecto.', score: 3 },
      { text: 'Hay un presupuesto anual asignado y gestionado por el CDO.', score: 5 }
    ]
  },
  {
    id: 'est_4', pillar: 'estrategia',
    title: '¿Tienen definidos KPIs de valor para medir el impacto de los datos?',
    options: [
      { text: 'No medimos el impacto de los datos.', score: 1 },
      { text: 'Se miden métricas técnicas (volumen, disponibilidad).', score: 3 },
      { text: 'Medimos ROI, ahorro de costos y generación de ingresos.', score: 5 }
    ]
  },
  {
    id: 'est_5', pillar: 'estrategia',
    title: '¿Existe un Roadmap de Datos y Analítica a 1-3 años?',
    options: [
      { text: 'No hay roadmap.', score: 1 },
      { text: 'Solo plan a corto plazo (meses).', score: 3 },
      { text: 'Sí, roadmap estratégico documentado y comunicado.', score: 5 }
    ]
  },
  {
    id: 'est_6', pillar: 'estrategia',
    title: '¿Cómo es la gestión del cambio cultural hacia ser Data-Driven?',
    options: [
      { text: 'Inexistente.', score: 1 },
      { text: 'Capacitaciones esporádicas en herramientas.', score: 3 },
      { text: 'Programa formal de Alfabetización de Datos (Data Literacy).', score: 5 }
    ]
  },
  {
    id: 'est_7', pillar: 'estrategia',
    title: '¿Tienen un modelo de madurez de datos definido para autoevaluación?',
    options: [
      { text: 'No nos autoevaluamos.', score: 1 },
      { text: 'Evaluaciones informales sin estándar.', score: 3 },
      { text: 'Usamos DAMA/DCAM y medimos progreso regularmente.', score: 5 }
    ]
  },
  {
    id: 'est_8', pillar: 'estrategia',
    title: '¿El CDO (Chief Data Officer) u homólogo reporta a nivel ejecutivo?',
    options: [
      { text: 'No existe el rol.', score: 1 },
      { text: 'Reporta a mandos medios (TI).', score: 3 },
      { text: 'Reporta directamente a CEO o Comité Ejecutivo.', score: 5 }
    ]
  },

  // ORGANIZACIÓN (8)
  {
    id: 'org_1', pillar: 'organizacion',
    title: '¿Tienen identificados y asignados los roles de Data Owner y Data Steward?',
    options: [
      { text: 'No existen estos roles.', score: 1 },
      { text: 'Asignados informalmente o solo en TI.', score: 3 },
      { text: 'Asignados formalmente en las áreas de negocio.', score: 5 }
    ]
  },
  {
    id: 'org_2', pillar: 'organizacion',
    title: '¿Los Data Stewards tienen tiempo oficial asignado a sus tareas de datos?',
    options: [
      { text: 'No tienen tiempo asignado.', score: 1 },
      { text: 'Hacen tareas de datos solo en tiempo libre.', score: 3 },
      { text: 'Tienen un % de su FTE oficialmente dedicado.', score: 5 }
    ]
  },
  {
    id: 'org_3', pillar: 'organizacion',
    title: '¿Cómo se resuelven las disputas sobre el significado de un dato?',
    options: [
      { text: 'No se resuelven, cada quien usa su definición.', score: 1 },
      { text: 'Se resuelve en largas reuniones Ad-Hoc.', score: 3 },
      { text: 'El Data Owner tiene la autoridad y está en el Glosario.', score: 5 }
    ]
  },
  {
    id: 'org_4', pillar: 'organizacion',
    title: '¿Existe una red o comunidad interna de profesionales de datos?',
    options: [
      { text: 'No hay comunidad.', score: 1 },
      { text: 'Grupos aislados por área.', score: 3 },
      { text: 'Comunidad activa que comparte mejores prácticas.', score: 5 }
    ]
  },
  {
    id: 'org_5', pillar: 'organizacion',
    title: '¿Cuentan con un equipo centralizado o federado de Oficina de Datos (Data Office)?',
    options: [
      { text: 'No hay Data Office.', score: 1 },
      { text: 'Es una función secundaria dentro de TI.', score: 3 },
      { text: 'Data Office establecida (centralizada, federada o híbrida).', score: 5 }
    ]
  },
  {
    id: 'org_6', pillar: 'organizacion',
    title: '¿Tienen definidos dominios de datos corporativos (Ej: Clientes, Productos)?',
    options: [
      { text: 'Todo es un solo bloque sin dominios.', score: 1 },
      { text: 'Dominios identificados pero sin responsables.', score: 3 },
      { text: 'Dominios mapeados con Data Owners responsables.', score: 5 }
    ]
  },
  {
    id: 'org_7', pillar: 'organizacion',
    title: '¿La estructura organizacional soporta el escalamiento de problemas complejos de datos?',
    options: [
      { text: 'Los problemas no se escalan.', score: 1 },
      { text: 'Escalamiento informal basado en relaciones.', score: 3 },
      { text: 'Ruta clara: Steward -> Owner -> Comité.', score: 5 }
    ]
  },
  {
    id: 'org_8', pillar: 'organizacion',
    title: '¿Existe evaluación de desempeño atada a responsabilidades de datos?',
    options: [
      { text: 'No se evalúa en absoluto.', score: 1 },
      { text: 'Se evalúa cualitativamente a fin de año.', score: 3 },
      { text: 'Objetivos formales (OKRs) en el rol del empleado.', score: 5 }
    ]
  },

  // CALIDAD (9)
  {
    id: 'cal_1', pillar: 'calidad',
    title: '¿Cómo miden la calidad de los datos críticos?',
    options: [
      { text: 'No la medimos.', score: 1 },
      { text: 'Reglas manuales o queries esporádicos.', score: 3 },
      { text: 'Monitoreo automatizado continuo.', score: 5 }
    ]
  },
  {
    id: 'cal_2', pillar: 'calidad',
    title: '¿Tienen definidos los CDEs (Critical Data Elements)?',
    options: [
      { text: 'No sabemos qué es un CDE.', score: 1 },
      { text: 'Lista informal en Excel.', score: 3 },
      { text: 'CDEs identificados, catalogados y priorizados.', score: 5 }
    ]
  },
  {
    id: 'cal_3', pillar: 'calidad',
    title: '¿Qué dimensiones de calidad de datos monitorean?',
    options: [
      { text: 'Ninguna de forma estructurada.', score: 1 },
      { text: 'Principalmente Completitud (nulos).', score: 3 },
      { text: 'Exactitud, Validez, Consistencia, Oportunidad y Completitud.', score: 5 }
    ]
  },
  {
    id: 'cal_4', pillar: 'calidad',
    title: '¿Existe un proceso formal para el reporte de incidentes de calidad de datos?',
    options: [
      { text: 'Se reportan por correo o chat de forma desorganizada.', score: 1 },
      { text: 'Se abren tickets genéricos a la mesa de TI.', score: 3 },
      { text: 'Mesa de servicio especializada en calidad (Workflows).', score: 5 }
    ]
  },
  {
    id: 'cal_5', pillar: 'calidad',
    title: '¿Cómo se remedian los errores de calidad de datos?',
    options: [
      { text: 'Los usuarios arreglan el reporte final (parche).', score: 1 },
      { text: 'TI hace scripts masivos de limpieza periódica.', score: 3 },
      { text: 'Remediación en la fuente (Root-Cause) liderada por negocio.', score: 5 }
    ]
  },
  {
    id: 'cal_6', pillar: 'calidad',
    title: '¿Hay perfiles o reglas de calidad (Data Quality Rules) documentadas?',
    options: [
      { text: 'No hay documentación.', score: 1 },
      { text: 'Documentadas en un repositorio aislado.', score: 3 },
      { text: 'Reglas atadas directamente al diccionario y ejecutadas en código.', score: 5 }
    ]
  },
  {
    id: 'cal_7', pillar: 'calidad',
    title: '¿Tienen tableros (Dashboards) operativos de calidad de datos visibles?',
    options: [
      { text: 'No hay tableros de calidad.', score: 1 },
      { text: 'Reportes estáticos compartidos mensualmente.', score: 3 },
      { text: 'Dashboards en tiempo real accesibles para los Stewards.', score: 5 }
    ]
  },
  {
    id: 'cal_8', pillar: 'calidad',
    title: '¿La calidad se verifica en la entrada (Point of Entry)?',
    options: [
      { text: 'Entra cualquier cosa y se arregla luego.', score: 1 },
      { text: 'Existen validaciones básicas en sistemas core.', score: 3 },
      { text: 'Controles de validación rigurosos en todas las fuentes críticas.', score: 5 }
    ]
  },
  {
    id: 'cal_9', pillar: 'calidad',
    title: '¿Existen SLAs definidos para la resolución de incidentes de calidad?',
    options: [
      { text: 'No hay SLAs.', score: 1 },
      { text: 'SLAs de TI genéricos sin prioridad de negocio.', score: 3 },
      { text: 'SLA específico basado en la criticidad del dato (CDE).', score: 5 }
    ]
  },

  // ARQUITECTURA (8)
  {
    id: 'arq_1', pillar: 'arquitectura',
    title: '¿Tienen un Catálogo de Datos corporativo implementado?',
    options: [
      { text: 'No tenemos catálogo.', score: 1 },
      { text: 'Excel o wiki manual.', score: 3 },
      { text: 'Plataforma automatizada.', score: 5 }
    ]
  },
  {
    id: 'arq_2', pillar: 'arquitectura',
    title: '¿Cómo gestionan el Linaje de Datos (Data Lineage)?',
    options: [
      { text: 'Nadie sabe de dónde vienen los datos.', score: 1 },
      { text: 'Se mapea manualmente a petición (diagramas Visio).', score: 3 },
      { text: 'Linaje automatizado técnico y de negocio en el Catálogo.', score: 5 }
    ]
  },
  {
    id: 'arq_3', pillar: 'arquitectura',
    title: '¿Cuentan con un Glosario de Términos de Negocio oficial?',
    options: [
      { text: 'No existe.', score: 1 },
      { text: 'Existe pero no está vinculado a la base de datos.', score: 3 },
      { text: 'Glosario integrado con el catálogo técnico (semántica real).', score: 5 }
    ]
  },
  {
    id: 'arq_4', pillar: 'arquitectura',
    title: '¿Cómo es el modelo arquitectónico de sus datos?',
    options: [
      { text: 'Silos de información desconectados.', score: 1 },
      { text: 'Data Warehouse o Data Lake tradicional monolítico.', score: 3 },
      { text: 'Arquitectura moderna (Data Mesh, Data Fabric, Lakehouse).', score: 5 }
    ]
  },
  {
    id: 'arq_5', pillar: 'arquitectura',
    title: '¿Existe gestión de Datos Maestros (MDM)?',
    options: [
      { text: 'Múltiples versiones contradictorias de clientes/productos.', score: 1 },
      { text: 'Esfuerzos aislados de consolidación.', score: 3 },
      { text: 'Golden Record corporativo con plataforma MDM.', score: 5 }
    ]
  },
  {
    id: 'arq_6', pillar: 'arquitectura',
    title: '¿Cuentan con modelos de datos (lógico, conceptual, físico) documentados?',
    options: [
      { text: 'No modelamos, creamos tablas al vuelo.', score: 1 },
      { text: 'Modelos desactualizados.', score: 3 },
      { text: 'Modelado gobernado y gestionado por Data Architects.', score: 5 }
    ]
  },
  {
    id: 'arq_7', pillar: 'arquitectura',
    title: '¿Las integraciones de datos están estandarizadas?',
    options: [
      { text: 'Cientos de conexiones punto a punto sin control.', score: 1 },
      { text: 'Procesos ETL nocturnos pesados y frágiles.', score: 3 },
      { text: 'Integración vía APIs, eventos y pipelines gobernados.', score: 5 }
    ]
  },
  {
    id: 'arq_8', pillar: 'arquitectura',
    title: '¿Tienen visibilidad del ciclo de vida del dato (Desde creación hasta purga)?',
    options: [
      { text: 'Los datos se guardan para siempre sin orden.', score: 1 },
      { text: 'Políticas de retención en papel, rara vez aplicadas.', score: 3 },
      { text: 'Ciclo de vida automatizado y purga segura.', score: 5 }
    ]
  },

  // SEGURIDAD (8)
  {
    id: 'seg_1', pillar: 'seguridad',
    title: '¿Cómo clasifican y protegen los datos sensibles (PII)?',
    options: [
      { text: 'No hay clasificación.', score: 1 },
      { text: 'Clasificación manual, controles genéricos.', score: 3 },
      { text: 'Clasificación automatizada con controles de acceso estrictos.', score: 5 }
    ]
  },
  {
    id: 'seg_2', pillar: 'seguridad',
    title: '¿El acceso a datos está basado en el principio de "Menor Privilegio"?',
    options: [
      { text: 'No, los desarrolladores ven todo.', score: 1 },
      { text: 'Controles basados en rol (RBAC) pero a veces permisivos.', score: 3 },
      { text: 'Estricto control RBAC/ABAC con auditoría de acceso.', score: 5 }
    ]
  },
  {
    id: 'seg_3', pillar: 'seguridad',
    title: '¿Se aplican técnicas de enmascaramiento o anonimización?',
    options: [
      { text: 'Datos reales se copian a ambientes de prueba sin control.', score: 1 },
      { text: 'Enmascaramiento manual ocasional.', score: 3 },
      { text: 'Enmascaramiento dinámico/estático por defecto.', score: 5 }
    ]
  },
  {
    id: 'seg_4', pillar: 'seguridad',
    title: '¿Tienen un inventario actualizado de dónde residen los datos sensibles?',
    options: [
      { text: 'No sabemos.', score: 1 },
      { text: 'Estimaciones o encuestas anuales.', score: 3 },
      { text: 'Inventario vivo escaneado en el Catálogo de Datos.', score: 5 }
    ]
  },
  {
    id: 'seg_5', pillar: 'seguridad',
    title: '¿Se auditan los logs de acceso a bases de datos críticas?',
    options: [
      { text: 'No hay auditoría.', score: 1 },
      { text: 'Los logs existen pero nadie los revisa.', score: 3 },
      { text: 'Alertas automatizadas sobre accesos anómalos.', score: 5 }
    ]
  },
  {
    id: 'seg_6', pillar: 'seguridad',
    title: '¿Cómo se gestiona el acceso de terceros a sus datos?',
    options: [
      { text: 'Se envían archivos por correo/FTP sin mucho control.', score: 1 },
      { text: 'Contratos firmados pero poca visibilidad técnica.', score: 3 },
      { text: 'Intercambio seguro vía portales/APIs con monitoreo.', score: 5 }
    ]
  },
  {
    id: 'seg_7', pillar: 'seguridad',
    title: '¿Los datos en reposo y en tránsito están encriptados?',
    options: [
      { text: 'No se usa encriptación.', score: 1 },
      { text: 'Solo en tránsito (HTTPS) pero no en reposo.', score: 3 },
      { text: 'Encriptación obligatoria E2E (En tránsito y reposo).', score: 5 }
    ]
  },
  {
    id: 'seg_8', pillar: 'seguridad',
    title: '¿Existe un plan de respuesta rápida ante fugas de datos (Data Breach)?',
    options: [
      { text: 'No existe.', score: 1 },
      { text: 'Documento teórico nunca probado.', score: 3 },
      { text: 'Plan probado con simulacros regulares (Red Team).', score: 5 }
    ]
  },

  // CUMPLIMIENTO (9)
  {
    id: 'cum_1', pillar: 'cumplimiento',
    title: '¿Tienen políticas de datos publicadas y acatadas por la organización?',
    options: [
      { text: 'No existen políticas.', score: 1 },
      { text: 'Existen pero nadie las conoce.', score: 3 },
      { text: 'Vigentes, comunicadas y auditadas.', score: 5 }
    ]
  },
  {
    id: 'cum_2', pillar: 'cumplimiento',
    title: '¿Existe un registro centralizado de normativas que les aplican (GDPR, etc.)?',
    options: [
      { text: 'No existe registro.', score: 1 },
      { text: 'Manejado por Legal sin conexión a TI.', score: 3 },
      { text: 'Registro mapeado a políticas y activos de datos.', score: 5 }
    ]
  },
  {
    id: 'cum_3', pillar: 'cumplimiento',
    title: '¿Cómo garantizan el derecho de borrado o acceso de los clientes (ARCO)?',
    options: [
      { text: 'Proceso manual y casi imposible de cumplir a tiempo.', score: 1 },
      { text: 'Tickets a TI que toman semanas en procesar.', score: 3 },
      { text: 'Proceso estandarizado con tiempos SLA estrictos.', score: 5 }
    ]
  },
  {
    id: 'cum_4', pillar: 'cumplimiento',
    title: '¿Existe trazabilidad del consentimiento de uso de datos de los clientes?',
    options: [
      { text: 'No guardamos el consentimiento explícitamente.', score: 1 },
      { text: 'Un check de términos genéricos en el registro.', score: 3 },
      { text: 'Consentimiento granular gestionado y revocable por el usuario.', score: 5 }
    ]
  },
  {
    id: 'cum_5', pillar: 'cumplimiento',
    title: '¿Cómo gestionan el cumplimiento transfronterizo de datos?',
    options: [
      { text: 'Desconocemos las reglas de soberanía de datos.', score: 1 },
      { text: 'Contratos legales pero almacenamos datos en cualquier nube.', score: 3 },
      { text: 'Controles técnicos de geolocalización de almacenamiento.', score: 5 }
    ]
  },
  {
    id: 'cum_6', pillar: 'cumplimiento',
    title: '¿Las iniciativas de IA y Analítica Avanzada pasan por revisión de ética de datos?',
    options: [
      { text: 'No hay revisión ética.', score: 1 },
      { text: 'Revisión informal a criterio del Data Scientist.', score: 3 },
      { text: 'Comité de Ética de Datos evalúa sesgos y cumplimiento.', score: 5 }
    ]
  },
  {
    id: 'cum_7', pillar: 'cumplimiento',
    title: '¿Tienen indicadores para monitorear incidentes de incumplimiento normativo?',
    options: [
      { text: 'No se monitorean.', score: 1 },
      { text: 'Reporte manual a fin de mes.', score: 3 },
      { text: 'Alertas en tiempo real en el Command Center.', score: 5 }
    ]
  },
  {
    id: 'cum_8', pillar: 'cumplimiento',
    title: '¿Realizan auditorías internas periódicas al programa de Gobierno de Datos?',
    options: [
      { text: 'Nunca se ha auditado.', score: 1 },
      { text: 'Auditoría única durante la implementación.', score: 3 },
      { text: 'Auditoría anual estructurada y documentada.', score: 5 }
    ]
  },
  {
    id: 'cum_9', pillar: 'cumplimiento',
    title: '¿Existe un proceso formal de aprobación para compartir datos externos?',
    options: [
      { text: 'Cualquiera puede enviar datos si lo solicitan.', score: 1 },
      { text: 'Aprobación del jefe directo.', score: 3 },
      { text: 'Workflow formal aprobado por Data Owner y Legal.', score: 5 }
    ]
  }
];
