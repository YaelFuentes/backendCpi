# Ba## Características

- 🚀 API RESTful con Express.js
- 🔐 **Autenticación Basic Auth** para todas las rutas API
- 🤖 **Integración con IA** para traducir logs CPI a lenguaje natural
- 📝 Sistema de logging completo con Winston
- 🔒 Middlewares de seguridad con Helmet
- 🌐 CORS habilitado para peticiones cross-origin
- 📊 Logging de peticiones HTTP con Morgan
- 👤 Logging de usuarios autenticados
- 🔍 Endpoints de health check
- 📁 Organización modular del código API con Node.js y Express

Una aplicación backend desarrollada con Node.js y Express que proporciona APIs RESTful con un sistema completo de logging.

## Características

- 🚀 API RESTful con Express.js
- � **Autenticación Basic Auth** para todas las rutas API
- �📝 Sistema de logging completo con Winston
- 🔒 Middlewares de seguridad con Helmet
- 🌐 CORS habilitado para peticiones cross-origin
- 📊 Logging de peticiones HTTP con Morgan
- 👤 Logging de usuarios autenticados
- 🔍 Endpoints de health check
- 📁 Organización modular del código

## Instalación

1. **Instalar las dependencias:**
```bash
npm install
```

2. **Configurar variables de entorno:**
```bash
# Copiar el archivo de ejemplo
copy .env.example .env

# Editar .env con tus credenciales de autenticación
notepad .env
```

3. **Ejecutar en modo desarrollo:**
```bash
npm run dev
```

4. **Ejecutar en producción:**
```bash
npm start
```

## Autenticación

🔐 **Todas las rutas `/api/*` requieren autenticación Basic Auth**

### Credenciales (configurables en .env):
- **admin** / Cpilogger
- **user** / Yael156503383  
- **api-client** / client456

> **⚠️ Importante**: Las credenciales se configuran mediante variables de entorno en el archivo `.env`. Nunca subas credenciales reales al repositorio.

## Endpoints Disponibles

### Información General (Sin autenticación)
- `GET /` - Información de la API y endpoints disponibles
- `GET /auth-info` - Información detallada sobre autenticación

### API Endpoints (Requieren autenticación)
- `GET /api/health` - Health check del servidor

### Usuarios (Requieren autenticación)
- `GET /api/users` - Obtener todos los usuarios
- `GET /api/users/:id` - Obtener un usuario por ID
- `POST /api/users` - Crear un nuevo usuario
- `PUT /api/users/:id` - Actualizar un usuario
- `DELETE /api/users/:id` - Eliminar un usuario

### Productos (Requieren autenticación)
- `GET /api/products` - Obtener todos los productos
- `GET /api/products/:id` - Obtener un producto por ID
- `POST /api/products` - Crear un nuevo producto

### GMA/SSFFEV/PI4 con IA (Requieren autenticación)
- `POST /api/gma/ssffev/PI4/` - **Procesar logs CPI con traducción IA automática**
- `GET /api/gma/ssffev/PI4/` - Obtener lista de datos procesados
- `GET /api/gma/ssffev/PI4/:id` - Obtener dato específico por ID
- `DELETE /api/gma/ssffev/PI4/` - Limpiar todos los datos procesados

### Inteligencia Artificial (Requieren autenticación)
- `GET /api/ai/status` - **Estado del servicio de IA**
- `POST /api/ai/translate` - **Traducir logs manualmente con IA**
- `GET /api/ai/translations` - **Historial de traducciones recientes**

## Ejemplos de Uso

### Con CURL (incluyendo autenticación)

#### Obtener información sin autenticación
```bash
curl http://localhost:3000/
curl http://localhost:3000/auth-info
```

#### Crear un usuario (con Basic Auth)
```bash
curl -u admin:Cpilogger -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name": "Juan Pérez", "email": "juan@example.com", "age": 30}'
```

#### Obtener todos los usuarios (con Basic Auth)
```bash
curl -u admin:Cpilogger http://localhost:3000/api/users
```

#### Crear un producto (con Basic Auth)
```bash
curl -u admin:Cpilogger -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{"name": "Laptop Gaming", "price": 1299.99, "category": "Electronics"}'
```

#### Enviar datos a GMA/SSFFEV/PI4 (con Basic Auth)
```bash
curl -u admin:Cpilogger -X POST http://localhost:3000/api/gma/ssffev/PI4/ \
  -H "Content-Type: application/json" \
  -d '{
    "transactionId": "TXN001",
    "customerInfo": {
      "id": "CUST001",
      "name": "Juan Pérez",
      "email": "juan@empresa.com"
    },
    "productData": {
      "productId": "PROD001",
      "quantity": 5,
      "unitPrice": 199.99
    }
  }'
```

### Con PowerShell
```powershell
# Configurar credenciales
$credential = Get-Credential  # Ingresa admin/Cpilogger

# Hacer petición autenticada
Invoke-RestMethod -Uri "http://localhost:3000/api/users" -Method Get -Credential $credential

# O usando headers
$auth = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("admin:Cpilogger"))
$headers = @{ Authorization = "Basic $auth" }
Invoke-RestMethod -Uri "http://localhost:3000/api/users" -Method Get -Headers $headers
```

### Probar las APIs
Ejecuta el archivo de pruebas incluido:
```powershell
.\test-apis.ps1
```

## Sistema de Logging

Los logs se guardan en el directorio `logs/` con los siguientes archivos:

- `combined.log` - Todos los logs de la aplicación
- `error.log` - Solo logs de errores
- `http.log` - Logs de peticiones HTTP

### Información que se registra:
- Timestamp de cada petición
- Método HTTP y URL
- Dirección IP del cliente
- **Usuario autenticado** (cuando usa Basic Auth)
- Parámetros de consulta y body de la petición
- Intentos de acceso no autorizado
- Errores y excepciones
- Logs de aplicación personalizados

## Estructura del Proyecto

```
backendCpi/
├── config/
│   └── auth.js          # Configuración de autenticación Basic Auth
├── logs/                # Archivos de log (generados automáticamente)
├── routes/
│   └── api.js           # Definición de rutas API
├── utils/
│   └── logger.js        # Configuración de Winston logger
├── package.json         # Dependencias y scripts
├── server.js           # Archivo principal del servidor
├── test-apis.ps1       # Script de pruebas con autenticación
└── README.md           # Este archivo
```

## Variables de Entorno

El proyecto utiliza variables de entorno para la configuración sensible. Todas las variables se definen en el archivo `.env`:

### Variables de Autenticación:
- `AUTH_ADMIN_USER` - Usuario administrador
- `AUTH_ADMIN_PASS` - Contraseña del administrador
- `AUTH_USER_USER` - Usuario estándar
- `AUTH_USER_PASS` - Contraseña del usuario estándar
- `AUTH_CLIENT_USER` - Usuario para cliente API
- `AUTH_CLIENT_PASS` - Contraseña del cliente API

### Variables del Servidor:
- `PORT` - Puerto del servidor (default: 3000)
- `NODE_ENV` - Entorno de ejecución (development/production)
- `LOG_LEVEL` - Nivel de logging (debug/info/warn/error)

### Variables de Autenticación:
- `AUTH_REALM` - Nombre del realm para Basic Auth
- `AUTH_CHALLENGE` - Mostrar diálogo de autenticación (true/false)

### 🔒 Seguridad:
- ✅ El archivo `.env` está incluido en `.gitignore`
- ✅ Se proporciona `.env.example` como plantilla
- ✅ Validación automática de variables requeridas al iniciar
- ✅ Las contraseñas nunca se muestran en los logs

## 🤖 Integración con Inteligencia Artificial

### **Funcionalidad Principal:**
Esta aplicación traduce automáticamente logs técnicos de CPI a mensajes comprensibles para usuarios de negocio usando IA.

### **Proveedores de IA Soportados:**

#### 1. **Groq** (Recomendado - Gratuito y Rápido)
- ✅ **Completamente gratuito**
- ✅ Muy rápido (respuestas en segundos)
- ✅ Modelos avanzados (Llama, Mixtral)
- 📝 Regístrate en: https://console.groq.com/

#### 2. **Ollama** (Local - Completamente Gratuito)
- ✅ **100% local y privado**
- ✅ Sin límites de uso
- ✅ Funciona sin internet
- 📝 Descarga: https://ollama.ai/

#### 3. **Hugging Face** (Alternativa Gratuita)
- ✅ Modelos de código abierto
- ✅ API gratuita con límites
- 📝 Regístrate en: https://huggingface.co/

### **Tipos de Logs que Traduce:**
- 🔴 **Errores** - Traduce errores técnicos a impacto de negocio
- 🟡 **Warnings** - Explica advertencias y acciones recomendadas  
- 🟢 **Éxito** - Confirma operaciones completadas
- 📊 **Transacciones** - Resume procesamiento de pedidos/pagos
- ⚙️ **Configuración** - Explica cambios de sistema
- 📦 **Inventario** - Traduce actualizaciones de stock

### **Configuración de IA:**

```bash
# En tu archivo .env
AI_PROVIDER=groq                    # o 'ollama' o 'huggingface'
GROQ_API_KEY=tu_api_key_aqui       # Gratis en console.groq.com
AI_MODEL=llama3-8b-8192            # Modelo a usar
AI_MAX_TOKENS=500                  # Máximo de tokens por respuesta
AI_TEMPERATURE=0.3                 # Creatividad (0.0-1.0)
```

### **Ejemplo de Traducción:**

**Log Técnico Original:**
```json
{
  "errorCode": "CPI_ERR_001",
  "message": "Connection timeout to SAP system during invoice processing",
  "transactionId": "TXN_12345",
  "customerInfo": { "name": "Empresa ABC S.L." }
}
```

**Traducción IA:** 🤖
> "❌ **Error en facturación**: La conexión con SAP se interrumpió mientras se procesaba la factura de Empresa ABC S.L. (ID: TXN_12345). **Impacto**: La factura no se pudo generar. **Acción**: El sistema reintentará automáticamente o contacte a soporte técnico."

## Tecnologías Utilizadas

- **Express.js** - Framework web para Node.js
- **express-basic-auth** - Middleware de autenticación básica
- **dotenv** - Gestión de variables de entorno
- **Winston** - Logger para Node.js
- **Morgan** - Middleware de logging HTTP
- **Helmet** - Middlewares de seguridad
- **CORS** - Cross-Origin Resource Sharing
- **Nodemon** - Auto-restart del servidor en desarrollo

## Puerto del Servidor

Por defecto, el servidor se ejecuta en el puerto 3000. Puedes cambiarlo estableciendo la variable de entorno `PORT`:

```bash
PORT=8080 npm start
```