# Sistema de Monitoreo CPI - Documentation

## 📋 Descripción General

El sistema de monitoreo CPI automatiza el proceso de supervisión de integraciones que anteriormente se realizaba manualmente los lunes, miércoles y viernes. Utiliza web scraping con Puppeteer para capturar screenshots y analizar el estado de las integraciones.

## 🚀 Características

### ✅ Funcionalidades Implementadas
- **Monitoreo Automático**: Programado para lunes, miércoles y viernes a las 9:00 AM
- **Web Scraping**: Captura automática de screenshots del portal CPI
- **Análisis Inteligente**: Detección automática de errores, warnings y estados exitosos
- **Reportes**: Generación automática de reportes en formato JSON
- **API REST**: Endpoints para control manual y consulta de estados
- **Dashboard Integration**: Integración con el dashboard web existente

### 🛠️ Tecnologías Utilizadas
- **Puppeteer**: Web scraping y captura de screenshots
- **Sharp**: Procesamiento de imágenes
- **node-cron**: Programación de tareas automáticas
- **Express.js**: API REST para control del sistema

## 📁 Estructura de Archivos

```
backendCpi/
├── services/
│   └── monitoring-service.js      # Servicio principal de monitoreo
├── routes/
│   └── monitoring.js              # Endpoints API para monitoreo
├── config/
│   └── monitoring-config.json     # Configuración del sistema
├── reports/                       # Directorio de reportes generados
│   └── screenshots/              # Screenshots capturados
└── public/
    └── dashboard-external.html   # Dashboard con controles de monitoreo
```

## 🔧 Configuración

### Variables de Entorno Requeridas

Agregar al archivo `.env`:

```env
# Credenciales CPI
CPI_USERNAME=tu_usuario_cpi
CPI_PASSWORD=tu_contraseña_cpi

# Configuración opcional
NODE_ENV=production
LOG_LEVEL=info
```

### Configuración del Sistema

El archivo `config/monitoring-config.json` contiene:
- Selectores CSS para elementos de la interfaz CPI
- Configuración del navegador Puppeteer
- Horarios de ejecución
- Configuración de screenshots

## 📡 API Endpoints

### Estado del Sistema
```http
GET /api/monitoring/status
```
Retorna el estado actual del sistema de monitoreo.

### Ejecutar Monitoreo Manual
```http
POST /api/monitoring/run
```
Ejecuta el proceso de monitoreo de forma manual.

### Obtener Reportes
```http
GET /api/monitoring/reports
```
Lista todos los reportes generados.

### Obtener Reporte Específico
```http
GET /api/monitoring/reports/:id
```
Obtiene un reporte específico por ID.

### Configurar Credenciales
```http
POST /api/monitoring/config
```
Actualiza la configuración del sistema.

```json
{
  "credentials": {
    "username": "tu_usuario",
    "password": "tu_contraseña"
  }
}
```

### Probar Conexión
```http
POST /api/monitoring/test-connection
```
Verifica la conexión al portal CPI.

## 🕒 Programación Automática

El sistema está configurado para ejecutarse automáticamente:
- **Días**: Lunes, Miércoles, Viernes
- **Hora**: 9:00 AM (Timezone: America/Mexico_City)
- **Formato Cron**: `0 9 * * 1,3,5`

## 📊 Reportes Generados

Cada ejecución genera:

### Archivo JSON del Reporte
```json
{
  "id": "report-1672531200000",
  "timestamp": "2024-01-01T09:00:00.000Z",
  "duration": 15000,
  "screenshot": "/path/to/screenshot.png",
  "integrationStatus": {
    "total": 25,
    "statusCounts": {
      "success": 23,
      "warning": 1,
      "error": 1
    },
    "overallStatus": "error",
    "hasErrors": true,
    "hasWarnings": true
  },
  "summary": {
    "totalIntegrations": 25,
    "errors": 1,
    "warnings": 1,
    "success": 23,
    "overallStatus": "error"
  }
}
```

### Screenshot Capturado
- Imagen PNG de la página completa
- Almacenado en `/reports/screenshots/`
- Nombrado con timestamp para fácil identificación

## 🎮 Uso desde el Dashboard

El dashboard web incluye controles para:
1. **Ejecutar Monitoreo**: Botón para ejecución manual
2. **Ver Estado**: Indicador del estado actual del sistema
3. **Ver Reportes**: Lista de reportes generados
4. **Configurar**: Interfaz para actualizar credenciales

## 🔍 Análisis de Integraciones

El sistema analiza automáticamente:

### Indicadores de Estado
- **Éxito**: Elementos con clases `.success`, `.green`, estilos verdes
- **Advertencia**: Elementos con clases `.warning`, `.yellow`, estilos amarillos  
- **Error**: Elementos con clases `.error`, `.failed`, `.red`, estilos rojos

### Elementos Monitoreados
- Flujos de integración
- Estados de conectores
- Mensajes de error del sistema
- Indicadores visuales de la interfaz SAP

## 🛡️ Seguridad

- Credenciales almacenadas en variables de entorno
- Autenticación Basic Auth para todos los endpoints
- No exposición de credenciales en logs o respuestas API
- Navegador en modo headless para mayor seguridad

## 🚨 Manejo de Errores

### Errores Comunes y Soluciones

1. **Error de Login**
   - Verificar credenciales en variables de entorno
   - Comprobar acceso manual al portal CPI

2. **Timeout de Página**
   - Aumentar timeout en configuración
   - Verificar conectividad de red

3. **Elementos No Encontrados**
   - Revisar selectores CSS en configuración
   - Verificar cambios en la interfaz CPI

## 📈 Monitoreo y Logs

Todos los eventos se registran usando Winston:
- Inicio/fin de ejecuciones
- Errores y excepciones
- Análisis de integraciones
- Resultados de reportes

Los logs están disponibles en:
- Archivo local: `/logs/combined.log`
- Logtail (si está configurado)
- Dashboard web en tiempo real

## 🔄 Próximas Mejoras

### Funcionalidades Planificadas
- [ ] Notificaciones por email/Slack
- [ ] Análisis de tendencias históricas
- [ ] Configuración de umbrales de alertas
- [ ] Integración con sistemas de ticketing
- [ ] Dashboard de métricas avanzadas

### Optimizaciones Técnicas
- [ ] Cache de screenshots para comparación
- [ ] Compresión de reportes antiguos
- [ ] API para integración con otros sistemas
- [ ] Modo de depuración con screenshots paso a paso

## 📞 Soporte

Para problemas o consultas:
1. Revisar logs en `/api/logs/recent`
2. Verificar estado con `/api/monitoring/status`
3. Probar conexión con `/api/monitoring/test-connection`
4. Consultar documentación de errores arriba

---

**Última actualización**: Octubre 2024  
**Versión**: 1.0.0