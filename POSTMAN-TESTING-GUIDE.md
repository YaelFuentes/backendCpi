# 🚀 GUÍA COMPLETA DE TESTING CON POSTMAN

## 📋 CONFIGURACIÓN INICIAL

### 1️⃣ **Información del Servidor**
```
🌐 URL Base: https://backendcpi.onrender.com
🔐 Tipo de Auth: Basic Auth
👤 Usuario: admin
🔑 Contraseña: [Tu contraseña de Render Environment]
```

### 2️⃣ **Configurar Postman**

1. **Abrir Postman**
2. **Crear Nueva Collection**: "Backend CPI Tests"
3. **Configurar Variables de Collection**:
   - Click derecho en collection → "Edit"
   - Tab "Variables"
   - Agregar:
     ```
     Variable: baseUrl
     Initial Value: https://backendcpi.onrender.com
     Current Value: https://backendcpi.onrender.com
     
     Variable: username  
     Initial Value: admin
     Current Value: admin
     
     Variable: password
     Initial Value: [TU_PASSWORD]
     Current Value: [TU_PASSWORD]
     ```

---

## 🧪 TESTS BÁSICOS

### ✅ Test 1: Verificar Servidor Activo

**Request**:
```
Method: GET
URL: {{baseUrl}}/
Auth: None
```

**Respuesta Esperada**:
```json
{
  "message": "Bienvenido al Backend CPI",
  "version": "1.0.0",
  "timestamp": "2025-10-09T...",
  "endpoints": {
    "health": "/api/health",
    "evaluar": "/api/evaluar/*",
    "pruebas": "/api/pruebas/*"
  }
}
```

**Status**: `200 OK`

---

### ✅ Test 2: Health Check (Con Auth)

**Request**:
```
Method: GET
URL: {{baseUrl}}/api/health
Auth: Basic Auth
  Username: {{username}}
  Password: {{password}}
```

**Respuesta Esperada**:
```json
{
  "status": "ok",
  "timestamp": "2025-10-09T...",
  "uptime": 12345,
  "server": "Backend CPI",
  "version": "1.0.0"
}
```

**Status**: `200 OK`

---

## 🔍 TESTS DE APIs EVALUAR

### ✅ Test 3: POST /api/evaluar/orden

**Request**:
```
Method: POST
URL: {{baseUrl}}/api/evaluar/orden
Auth: Basic Auth
  Username: {{username}}
  Password: {{password}}
Headers:
  Content-Type: application/json
Body (raw JSON):
{
  "numeroOrden": "ORD-2025-001",
  "cliente": "Empresa ABC",
  "productos": [
    {
      "codigo": "PROD-001",
      "nombre": "Producto Ejemplo",
      "cantidad": 10,
      "precio": 25.50
    }
  ],
  "total": 255.00,
  "fechaCreacion": "2025-10-09T10:00:00Z"
}
```

**Respuesta Esperada**:
```json
{
  "success": true,
  "scope": "evaluar",
  "endpoint": "orden",
  "message": "Datos recibidos",
  "requestId": "EVALUAR_1728467123456",
  "receivedAt": "2025-10-09T10:00:00.000Z",
  "meta": {
    "bodySize": 245,
    "querySize": 0
  }
}
```

**Status**: `202 Accepted`

---

### ✅ Test 4: POST /api/evaluar/inventario

**Request**:
```
Method: POST
URL: {{baseUrl}}/api/evaluar/inventario
Auth: Basic Auth
  Username: {{username}}
  Password: {{password}}
Headers:
  Content-Type: application/json
Body (raw JSON):
{
  "almacen": "WAREHOUSE-01",
  "productos": [
    {
      "codigo": "INV-001",
      "nombre": "Producto A",
      "stock": 150,
      "stockMinimo": 20,
      "ubicacion": "A-01-15"
    },
    {
      "codigo": "INV-002", 
      "nombre": "Producto B",
      "stock": 5,
      "stockMinimo": 10,
      "ubicacion": "B-02-08"
    }
  ],
  "fechaActualizacion": "2025-10-09T10:30:00Z"
}
```

**Respuesta Esperada**:
```json
{
  "success": true,
  "scope": "evaluar",
  "endpoint": "inventario",
  "message": "Datos recibidos",
  "requestId": "EVALUAR_1728467456789",
  "receivedAt": "2025-10-09T10:30:00.000Z",
  "meta": {
    "bodySize": 325,
    "querySize": 0
  }
}
```

**Status**: `202 Accepted`

---

### ✅ Test 5: POST /api/evaluar/envio

**Request**:
```
Method: POST
URL: {{baseUrl}}/api/evaluar/envio
Auth: Basic Auth
  Username: {{username}}
  Password: {{password}}
Headers:
  Content-Type: application/json
Body (raw JSON):
{
  "numeroEnvio": "ENV-2025-001",
  "ordenRelacionada": "ORD-2025-001",
  "transportista": "Express Logistics",
  "destino": {
    "nombre": "Cliente ABC",
    "direccion": "Calle Principal 123",
    "ciudad": "Madrid",
    "codigoPostal": "28001",
    "pais": "España"
  },
  "productos": [
    {
      "codigo": "PROD-001",
      "cantidad": 10
    }
  ],
  "fechaEnvio": "2025-10-09T11:00:00Z",
  "fechaEntregaEstimada": "2025-10-11T11:00:00Z"
}
```

**Respuesta Esperada**:
```json
{
  "success": true,
  "scope": "evaluar",
  "endpoint": "envio",
  "message": "Datos recibidos",
  "requestId": "EVALUAR_1728467789012",
  "receivedAt": "2025-10-09T11:00:00.000Z",
  "meta": {
    "bodySize": 445,
    "querySize": 0
  }
}
```

**Status**: `202 Accepted`

---

## 🧪 TESTS DE APIs PRUEBAS

### ✅ Test 6: POST /api/pruebas/ping

**Request**:
```
Method: POST
URL: {{baseUrl}}/api/pruebas/ping
Auth: Basic Auth
  Username: {{username}}
  Password: {{password}}
Headers:
  Content-Type: application/json
Body (raw JSON):
{
  "message": "test ping",
  "timestamp": "2025-10-09T12:00:00Z"
}
```

**Respuesta Esperada**:
```json
{
  "success": true,
  "scope": "pruebas",
  "endpoint": "ping",
  "message": "Datos recibidos",
  "requestId": "PRUEBAS_1728468000123",
  "receivedAt": "2025-10-09T12:00:00.000Z",
  "meta": {
    "bodySize": 65,
    "querySize": 0
  }
}
```

**Status**: `202 Accepted`

---

### ✅ Test 7: POST /api/pruebas/echo

**Request**:
```
Method: POST
URL: {{baseUrl}}/api/pruebas/echo
Auth: Basic Auth
  Username: {{username}}
  Password: {{password}}
Headers:
  Content-Type: application/json
Body (raw JSON):
{
  "data": "Hello World",
  "metadata": {
    "source": "postman",
    "version": "1.0"
  }
}
```

**Respuesta Esperada**:
```json
{
  "success": true,
  "scope": "pruebas",
  "endpoint": "echo",
  "message": "Datos recibidos",
  "requestId": "PRUEBAS_1728468123456",
  "receivedAt": "2025-10-09T12:05:00.000Z",
  "meta": {
    "bodySize": 85,
    "querySize": 0
  }
}
```

**Status**: `202 Accepted`

---

### ✅ Test 8: POST /api/pruebas/evento

**Request**:
```
Method: POST
URL: {{baseUrl}}/api/pruebas/evento
Auth: Basic Auth
  Username: {{username}}
  Password: {{password}}
Headers:
  Content-Type: application/json
Body (raw JSON):
{
  "evento": "usuario_login",
  "usuario": "test_user",
  "timestamp": "2025-10-09T12:10:00Z",
  "detalles": {
    "ip": "192.168.1.100",
    "userAgent": "Postman Test",
    "sesionId": "sess_123456789"
  }
}
```

**Respuesta Esperada**:
```json
{
  "success": true,
  "scope": "pruebas",
  "endpoint": "evento",
  "message": "Datos recibidos",
  "requestId": "PRUEBAS_1728468600789",
  "receivedAt": "2025-10-09T12:10:00.000Z",
  "meta": {
    "bodySize": 165,
    "querySize": 0
  }
}
```

**Status**: `202 Accepted`

---

## 🔧 TESTS DE ENDPOINTS GENÉRICOS

### ✅ Test 9: POST /api/evaluar/generic/miNuevoEndpoint

**Request**:
```
Method: POST
URL: {{baseUrl}}/api/evaluar/generic/miNuevoEndpoint
Auth: Basic Auth
  Username: {{username}}
  Password: {{password}}
Headers:
  Content-Type: application/json
Body (raw JSON):
{
  "tipo": "endpoint_personalizado",
  "datos": {
    "campo1": "valor1",
    "campo2": "valor2"
  }
}
```

**Respuesta Esperada**:
```json
{
  "success": true,
  "scope": "evaluar",
  "endpoint": "miNuevoEndpoint",
  "message": "Datos recibidos",
  "requestId": "EVALUAR_1728468900123",
  "receivedAt": "2025-10-09T12:15:00.000Z",
  "meta": {
    "bodySize": 95,
    "querySize": 0
  }
}
```

**Status**: `202 Accepted`

---

## ❌ TESTS DE ERRORES

### ✅ Test 10: Sin Autenticación (Error 401)

**Request**:
```
Method: POST
URL: {{baseUrl}}/api/evaluar/orden
Auth: None
Headers:
  Content-Type: application/json
Body (raw JSON):
{
  "test": "sin auth"
}
```

**Respuesta Esperada**:
```json
{
  "error": "Unauthorized"
}
```

**Status**: `401 Unauthorized`

---

### ✅ Test 11: Método No Permitido (Error 405)

**Request**:
```
Method: GET
URL: {{baseUrl}}/api/evaluar/orden
Auth: Basic Auth
  Username: {{username}}
  Password: {{password}}
```

**Respuesta Esperada**:
```json
{
  "error": "Method Not Allowed"
}
```

**Status**: `405 Method Not Allowed`

---

## 📊 CONFIGURAR TESTS AUTOMATIZADOS

Para cada request, agregar en la pestaña **"Tests"**:

```javascript
// Test básico de status
pm.test("Status code is correct", function () {
    pm.response.to.have.status(202); // Cambiar según endpoint
});

// Test de estructura de respuesta
pm.test("Response has required fields", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('success');
    pm.expect(jsonData).to.have.property('scope');
    pm.expect(jsonData).to.have.property('endpoint');
    pm.expect(jsonData).to.have.property('requestId');
});

// Test de contenido
pm.test("Success is true", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.eql(true);
});

// Test de tiempo de respuesta
pm.test("Response time is less than 5000ms", function () {
    pm.expect(pm.response.responseTime).to.be.below(5000);
});
```

---

## 🏃‍♂️ EJECUTAR TODOS LOS TESTS

### **Opción 1: Individual**
- Ejecutar cada request uno por uno
- Verificar respuestas manualmente

### **Opción 2: Collection Runner**
1. Click derecho en collection "Backend CPI Tests"
2. "Run collection"
3. Configurar:
   - Iterations: 1
   - Delay: 1000ms entre requests
4. Click "Run Backend CPI Tests"

### **Opción 3: Comando (Newman)**
```bash
# Instalar Newman
npm install -g newman

# Exportar collection desde Postman
# Ejecutar tests
newman run "Backend-CPI-Tests.postman_collection.json" \
  --environment "Backend-CPI-Environment.postman_environment.json"
```

---

## 🎯 CHECKLIST DE TESTING

### ✅ **Preparación**
- [ ] Postman instalado
- [ ] Collection "Backend CPI Tests" creada
- [ ] Variables configuradas (baseUrl, username, password)
- [ ] Servidor activo en Render

### ✅ **Tests Básicos**
- [ ] GET / (Servidor activo)
- [ ] GET /api/health (Health check)

### ✅ **Tests APIs Evaluar**
- [ ] POST /api/evaluar/orden
- [ ] POST /api/evaluar/inventario  
- [ ] POST /api/evaluar/envio
- [ ] POST /api/evaluar/generic/test

### ✅ **Tests APIs Pruebas**
- [ ] POST /api/pruebas/ping
- [ ] POST /api/pruebas/echo
- [ ] POST /api/pruebas/evento
- [ ] POST /api/pruebas/generic/test

### ✅ **Tests de Errores**
- [ ] 401 Unauthorized (sin auth)
- [ ] 405 Method Not Allowed (GET en POST endpoints)

---

## 🔍 DEBUGGING

### **Si un test falla**:

1. **Verificar Status Code**:
   - 401: Problema de autenticación
   - 404: URL incorrecta
   - 500: Error del servidor

2. **Verificar Response Body**:
   - ¿Contiene mensaje de error?
   - ¿Estructura correcta?

3. **Verificar Headers**:
   - Content-Type: application/json
   - Authorization: Basic YWRtaW46...

4. **Verificar Logs en Render**:
   - Ve a Render Dashboard
   - Logs de tu servicio
   - Busca errores o requests

---

## 🚀 RESULTADOS ESPERADOS

**✅ Todos los tests PASAN**:
- Status 200/202 según endpoint
- Responses con estructura correcta
- RequestId único en cada respuesta
- Logs registrados en Render

**❌ Si algún test FALLA**:
- Verificar autenticación
- Verificar URL (sin `/` final)
- Verificar que el servidor esté activo
- Revisar logs en Render

---

## 📱 PRÓXIMOS PASOS

1. **Configurar Dashboard**:
   - URL: `https://backendcpi.onrender.com` (sin `/`)
   - Usuario: `admin`
   - Contraseña: [tu password]

2. **Ejecutar Tests en Postman**:
   - Empezar con Test 1 y 2
   - Luego seguir con APIs evaluar
   - Finalmente APIs pruebas

3. **Verificar Logs**:
   - Dashboard debería mostrar conexión exitosa
   - Render logs debería mostrar requests

**🎯 ¡Con esto tendrás una API completamente testeada y funcional!**