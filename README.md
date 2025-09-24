# Backend CPI - API con Node.js y Express

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

1. Instalar las dependencias:
```bash
npm install
```

2. Ejecutar en modo desarrollo:
```bash
npm run dev
```

3. Ejecutar en producción:
```bash
npm start
```

## Autenticación

🔐 **Todas las rutas `/api/*` requieren autenticación Basic Auth**

### Credenciales de prueba:
- **admin** / password123
- **user** / user123  
- **api-client** / client456

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

### GMA/SSFFEV/PI4 (Requieren autenticación)
- `POST /api/gma/ssffev/PI4/` - Procesar datos GMA/SSFFEV/PI4
- `GET /api/gma/ssffev/PI4/` - Obtener lista de datos procesados
- `GET /api/gma/ssffev/PI4/:id` - Obtener dato específico por ID
- `DELETE /api/gma/ssffev/PI4/` - Limpiar todos los datos procesados

## Ejemplos de Uso

### Con CURL (incluyendo autenticación)

#### Obtener información sin autenticación
```bash
curl http://localhost:3000/
curl http://localhost:3000/auth-info
```

#### Crear un usuario (con Basic Auth)
```bash
curl -u admin:password123 -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name": "Juan Pérez", "email": "juan@example.com", "age": 30}'
```

#### Obtener todos los usuarios (con Basic Auth)
```bash
curl -u admin:password123 http://localhost:3000/api/users
```

#### Crear un producto (con Basic Auth)
```bash
curl -u admin:password123 -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{"name": "Laptop Gaming", "price": 1299.99, "category": "Electronics"}'
```

#### Enviar datos a GMA/SSFFEV/PI4 (con Basic Auth)
```bash
curl -u admin:password123 -X POST http://localhost:3000/api/gma/ssffev/PI4/ \
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
$credential = Get-Credential  # Ingresa admin/password123

# Hacer petición autenticada
Invoke-RestMethod -Uri "http://localhost:3000/api/users" -Method Get -Credential $credential

# O usando headers
$auth = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("admin:password123"))
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

## Tecnologías Utilizadas

- **Express.js** - Framework web para Node.js
- **express-basic-auth** - Middleware de autenticación básica
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