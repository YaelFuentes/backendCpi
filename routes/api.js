const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');
const aiService = require('../services/aiService');
// Sub-routers modulares
const evaluarRoutes = require('./evaluar');
const pruebasRoutes = require('./pruebas');

// Datos de ejemplo (en una aplicación real usarías una base de datos)
let users = [
  { id: 1, name: 'Juan Pérez', email: 'juan@example.com', age: 30 },
  { id: 2, name: 'María García', email: 'maria@example.com', age: 25 },
  { id: 3, name: 'Carlos López', email: 'carlos@example.com', age: 35 }
];

let products = [
  { id: 1, name: 'Laptop', price: 999.99, category: 'Electronics' },
  { id: 2, name: 'Mouse', price: 29.99, category: 'Electronics' },
  { id: 3, name: 'Keyboard', price: 79.99, category: 'Electronics' }
];

// Montar sub-routers modulares
router.use('/evaluar', evaluarRoutes);
router.use('/pruebas', pruebasRoutes);

// Ruta de health check
router.get('/health', (req, res) => {
  logger.info('Health check solicitado');
  res.json({
    status: 'OK',
    message: 'Servidor funcionando correctamente',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Ruta de estado de Logtail
router.get('/logtail/status', (req, res) => {
  logger.info('Estado de Logtail solicitado');
  
  const logtailStatus = logger.getLogtailStatus();
  
  res.json({
    success: true,
    message: 'Estado de Logtail',
    logtail: {
      configured: logtailStatus.configured,
      token: logtailStatus.token,
      status: logtailStatus.configured ? 'Activo' : 'No configurado'
    },
    logging: {
      level: process.env.LOG_LEVEL || 'info',
      environment: process.env.NODE_ENV || 'development'
    },
    timestamp: new Date().toISOString()
  });
});

// Ruta de prueba de logs
router.post('/logtail/test', (req, res) => {
  const testId = `TEST_${Date.now()}`;
  
  logger.info(`[${testId}] Prueba de logging iniciada`, {
    testId,
    userAgent: req.get('User-Agent'),
    ip: req.ip || req.connection.remoteAddress,
    body: req.body
  });
  
  logger.warn(`[${testId}] Log de advertencia de prueba`, {
    testId,
    level: 'warning',
    source: 'test_endpoint'
  });
  
  logger.error(`[${testId}] Log de error de prueba (simulado)`, {
    testId,
    level: 'error',
    source: 'test_endpoint',
    simulated: true
  });
  
  res.json({
    success: true,
    message: 'Logs de prueba enviados',
    testId,
    logs: [
      'INFO: Prueba de logging iniciada',
      'WARN: Log de advertencia de prueba',
      'ERROR: Log de error de prueba (simulado)'
    ],
    logtail: logger.getLogtailStatus(),
    timestamp: new Date().toISOString()
  });
});

// Ruta para obtener logs recientes (para el dashboard)
router.get('/logs/recent', (req, res) => {
  const fs = require('fs');
  const path = require('path');
  
  try {
    const logsDir = path.join(__dirname, '../logs');
    const combinedLogPath = path.join(logsDir, 'combined.log');
    
    if (!fs.existsSync(combinedLogPath)) {
      return res.json({
        success: true,
        logs: [],
        message: 'Archivo de logs no encontrado'
      });
    }
    
    const logContent = fs.readFileSync(combinedLogPath, 'utf8');
    const logLines = logContent.split('\n')
      .filter(line => line.trim())
      .slice(-50) // Últimas 50 líneas
      .map(line => {
        try {
          const logData = JSON.parse(line);
          return {
            timestamp: logData.timestamp,
            level: logData.level,
            message: logData.message,
            meta: logData.meta || {}
          };
        } catch {
          return {
            timestamp: new Date().toISOString(),
            level: 'info',
            message: line,
            meta: {}
          };
        }
      });
    
    res.json({
      success: true,
      logs: logLines,
      total: logLines.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error leyendo logs recientes: ' + error.message);
    res.status(500).json({
      success: false,
      message: 'Error leyendo logs',
      error: error.message
    });
  }
});

// === RUTAS DE USUARIOS ===

// GET - Obtener todos los usuarios
router.get('/users', (req, res) => {
  logger.info('Solicitada lista de usuarios');
  res.json({
    success: true,
    data: users,
    total: users.length,
    timestamp: new Date().toISOString()
  });
});

// GET - Obtener un usuario por ID
router.get('/users/:id', (req, res) => {
  const userId = parseInt(req.params.id);
  logger.info(`Solicitado usuario con ID: ${userId}`);
  
  const user = users.find(u => u.id === userId);
  
  if (!user) {
    logger.warn(`Usuario con ID ${userId} no encontrado`);
    return res.status(404).json({
      success: false,
      message: 'Usuario no encontrado',
      timestamp: new Date().toISOString()
    });
  }
  
  res.json({
    success: true,
    data: user,
    timestamp: new Date().toISOString()
  });
});

// POST - Crear un nuevo usuario
router.post('/users', (req, res) => {
  const { name, email, age } = req.body;
  logger.info(`Creando nuevo usuario: ${JSON.stringify(req.body)}`);
  
  // Validación básica
  if (!name || !email) {
    logger.warn('Intento de crear usuario sin datos requeridos');
    return res.status(400).json({
      success: false,
      message: 'Nombre y email son requeridos',
      timestamp: new Date().toISOString()
    });
  }
  
  const newUser = {
    id: users.length + 1,
    name,
    email,
    age: age || null
  };
  
  users.push(newUser);
  logger.info(`Usuario creado exitosamente con ID: ${newUser.id}`);
  
  res.status(201).json({
    success: true,
    message: 'Usuario creado exitosamente',
    data: newUser,
    timestamp: new Date().toISOString()
  });
});

// PUT - Actualizar un usuario
router.put('/users/:id', (req, res) => {
  const userId = parseInt(req.params.id);
  const { name, email, age } = req.body;
  logger.info(`Actualizando usuario ID: ${userId} con datos: ${JSON.stringify(req.body)}`);
  
  const userIndex = users.findIndex(u => u.id === userId);
  
  if (userIndex === -1) {
    logger.warn(`Usuario con ID ${userId} no encontrado para actualizar`);
    return res.status(404).json({
      success: false,
      message: 'Usuario no encontrado',
      timestamp: new Date().toISOString()
    });
  }
  
  // Actualizar campos
  if (name) users[userIndex].name = name;
  if (email) users[userIndex].email = email;
  if (age !== undefined) users[userIndex].age = age;
  
  logger.info(`Usuario ID: ${userId} actualizado exitosamente`);
  
  res.json({
    success: true,
    message: 'Usuario actualizado exitosamente',
    data: users[userIndex],
    timestamp: new Date().toISOString()
  });
});

// DELETE - Eliminar un usuario
router.delete('/users/:id', (req, res) => {
  const userId = parseInt(req.params.id);
  logger.info(`Eliminando usuario con ID: ${userId}`);
  
  const userIndex = users.findIndex(u => u.id === userId);
  
  if (userIndex === -1) {
    logger.warn(`Usuario con ID ${userId} no encontrado para eliminar`);
    return res.status(404).json({
      success: false,
      message: 'Usuario no encontrado',
      timestamp: new Date().toISOString()
    });
  }
  
  const deletedUser = users.splice(userIndex, 1)[0];
  logger.info(`Usuario ID: ${userId} eliminado exitosamente`);
  
  res.json({
    success: true,
    message: 'Usuario eliminado exitosamente',
    data: deletedUser,
    timestamp: new Date().toISOString()
  });
});

// === RUTAS DE PRODUCTOS ===

// GET - Obtener todos los productos
router.get('/products', (req, res) => {
  logger.info('Solicitada lista de productos');
  res.json({
    success: true,
    data: products,
    total: products.length,
    timestamp: new Date().toISOString()
  });
});

// GET - Obtener un producto por ID
router.get('/products/:id', (req, res) => {
  const productId = parseInt(req.params.id);
  logger.info(`Solicitado producto con ID: ${productId}`);
  
  const product = products.find(p => p.id === productId);
  
  if (!product) {
    logger.warn(`Producto con ID ${productId} no encontrado`);
    return res.status(404).json({
      success: false,
      message: 'Producto no encontrado',
      timestamp: new Date().toISOString()
    });
  }
  
  res.json({
    success: true,
    data: product,
    timestamp: new Date().toISOString()
  });
});

// POST - Crear un nuevo producto
router.post('/products', (req, res) => {
  const { name, price, category } = req.body;
  logger.info(`Creando nuevo producto: ${JSON.stringify(req.body)}`);
  
  if (!name || !price) {
    logger.warn('Intento de crear producto sin datos requeridos');
    return res.status(400).json({
      success: false,
      message: 'Nombre y precio son requeridos',
      timestamp: new Date().toISOString()
    });
  }
  
  const newProduct = {
    id: products.length + 1,
    name,
    price: parseFloat(price),
    category: category || 'Sin categoría'
  };
  
  products.push(newProduct);
  logger.info(`Producto creado exitosamente con ID: ${newProduct.id}`);
  
  res.status(201).json({
    success: true,
    message: 'Producto creado exitosamente',
    data: newProduct,
    timestamp: new Date().toISOString()
  });
});

// === RUTAS GMA/SSFFEV/PI4 ===

// Almacenamiento temporal para los datos de PI4 (en producción usar base de datos)
let pi4Data = [];
let pi4Counter = 1;

// POST - Procesar datos GMA/SSFFEV/PI4 con traducción IA
router.post('/gma/ssffev/PI4/', async (req, res) => {
  const requestId = `PI4_${pi4Counter++}`;
  const timestamp = new Date().toISOString();
  
  logger.info(`[${requestId}] Nueva petición GMA/SSFFEV/PI4 recibida`);
  logger.info(`[${requestId}] Body recibido: ${JSON.stringify(req.body, null, 2)}`);
  
  try {
    // Validar que se haya enviado un body
    if (!req.body || Object.keys(req.body).length === 0) {
      logger.warn(`[${requestId}] Petición sin body o body vacío`);
      return res.status(400).json({
        success: false,
        requestId,
        message: 'Se requiere un body con datos para procesar',
        timestamp,
        error: 'MISSING_BODY'
      });
    }

    // Detectar tipo de log basado en el contenido
    const logType = detectLogType(req.body);
    
    logger.info(`[${requestId}] Tipo de log detectado: ${logType}`);

    // Estructura base para procesar el body
    const processedData = {
      id: requestId,
      receivedAt: timestamp,
      originalData: req.body,
      logType,
      processedData: null,
      aiTranslation: null,
      status: 'processing',
      metadata: {
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent'),
        contentType: req.get('Content-Type'),
        bodySize: JSON.stringify(req.body).length
      }
    };

    // Análisis básico de los datos
    processedData.processedData = {
      message: 'Datos recibidos y analizados',
      dataKeys: Object.keys(req.body),
      dataTypes: Object.keys(req.body).reduce((types, key) => {
        types[key] = typeof req.body[key];
        return types;
      }, {}),
      logType,
      processed: true,
      analysisTimestamp: new Date().toISOString()
    };

    // ✨ TRADUCCIÓN CON IA ✨
    logger.info(`[${requestId}] Iniciando traducción con IA...`);
    
    try {
      const aiResult = await aiService.translateCPILog(req.body, logType);
      processedData.aiTranslation = aiResult;
      processedData.status = 'completed_with_ai';
      
      logger.info(`[${requestId}] Traducción IA completada: ${aiResult.success ? 'exitosa' : 'con fallback'}`);
    } catch (aiError) {
      logger.warn(`[${requestId}] Error en traducción IA: ${aiError.message}`);
      processedData.aiTranslation = {
        success: false,
        error: aiError.message,
        translation: `Log CPI procesado (ID: ${requestId}) - Traducción IA no disponible`,
        metadata: { provider: 'none', timestamp: new Date().toISOString() }
      };
      processedData.status = 'completed_without_ai';
    }

    // Guardar en almacenamiento temporal
    pi4Data.push(processedData);
    
    logger.info(`[${requestId}] Procesamiento completo - Status: ${processedData.status}`);
    
    // Respuesta de éxito con traducción IA
    res.status(200).json({
      success: true,
      requestId,
      message: 'Datos GMA/SSFFEV/PI4 procesados con traducción IA',
      timestamp,
      logType,
      data: {
        processed: processedData.processedData,
        metadata: processedData.metadata
      },
      aiTranslation: {
        available: processedData.aiTranslation.success,
        message: processedData.aiTranslation.translation,
        provider: processedData.aiTranslation.metadata?.provider,
        processingTime: processedData.aiTranslation.metadata?.processingTime
      },
      humanReadable: processedData.aiTranslation.translation
    });

  } catch (error) {
    logger.error(`[${requestId}] Error procesando datos GMA/SSFFEV/PI4: ${error.message}`);
    logger.error(`[${requestId}] Stack trace: ${error.stack}`);
    
    res.status(500).json({
      success: false,
      requestId,
      message: 'Error interno procesando los datos GMA/SSFFEV/PI4',
      timestamp,
      error: error.message,
      humanReadable: `❌ Error procesando log CPI (ID: ${requestId}): ${error.message}`
    });
  }
});

// Función auxiliar para detectar el tipo de log
function detectLogType(data) {
  // Detectar errores
  if (data.error || data.errorCode || data.exception || data.status === 'error') {
    return 'error';
  }
  
  // Detectar warnings
  if (data.warning || data.status === 'warning' || data.level === 'warn') {
    return 'warning';
  }
  
  // Detectar éxito
  if (data.success === true || data.status === 'success' || data.status === 'completed') {
    return 'success';
  }
  
  // Detectar transacciones
  if (data.transactionId || data.orderId || data.paymentInfo) {
    return 'transaction';
  }
  
  // Detectar configuración
  if (data.systemConfig || data.configuration || data.settings) {
    return 'configuration';
  }
  
  // Detectar inventario
  if (data.inventoryUpdate || data.warehouse || data.stock) {
    return 'inventory';
  }
  
  // Por defecto
  return 'info';
}

// GET - Obtener datos procesados de PI4
router.get('/gma/ssffev/PI4/', (req, res) => {
  logger.info('Solicitada lista de datos GMA/SSFFEV/PI4 procesados');
  
  res.json({
    success: true,
    message: 'Datos GMA/SSFFEV/PI4 recuperados',
    total: pi4Data.length,
    data: pi4Data.map(item => ({
      id: item.id,
      receivedAt: item.receivedAt,
      status: item.status,
      dataKeys: item.processedData?.dataKeys || [],
      metadata: item.metadata
    })),
    timestamp: new Date().toISOString()
  });
});

// GET - Obtener un dato específico de PI4 por ID
router.get('/gma/ssffev/PI4/:id', (req, res) => {
  const requestId = req.params.id;
  logger.info(`Solicitado dato GMA/SSFFEV/PI4 con ID: ${requestId}`);
  
  const pi4Item = pi4Data.find(item => item.id === requestId);
  
  if (!pi4Item) {
    logger.warn(`Dato GMA/SSFFEV/PI4 con ID ${requestId} no encontrado`);
    return res.status(404).json({
      success: false,
      message: 'Dato GMA/SSFFEV/PI4 no encontrado',
      requestId,
      timestamp: new Date().toISOString()
    });
  }
  
  res.json({
    success: true,
    message: 'Dato GMA/SSFFEV/PI4 encontrado',
    data: pi4Item,
    timestamp: new Date().toISOString()
  });
});

// DELETE - Limpiar datos de PI4
router.delete('/gma/ssffev/PI4/', (req, res) => {
  const deletedCount = pi4Data.length;
  pi4Data = [];
  pi4Counter = 1;
  
  logger.info(`Limpiados ${deletedCount} datos GMA/SSFFEV/PI4`);
  
  res.json({
    success: true,
    message: `Se eliminaron ${deletedCount} registros GMA/SSFFEV/PI4`,
    deletedCount,
    timestamp: new Date().toISOString()
  });
});

// === RUTAS DE IA ===

// GET - Estado del servicio de IA
router.get('/ai/status', async (req, res) => {
  logger.info('Consultando estado del servicio de IA');
  
  try {
    const status = await aiService.checkAvailability();
    
    res.json({
      success: true,
      message: 'Estado del servicio de IA',
      ai: {
        available: status.available,
        provider: status.provider,
        model: process.env.AI_MODEL,
        status: status.message
      },
      configuration: {
        maxTokens: process.env.AI_MAX_TOKENS,
        temperature: process.env.AI_TEMPERATURE,
        supportedProviders: ['groq', 'ollama', 'huggingface']
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error(`Error consultando estado de IA: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error consultando estado del servicio de IA',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// POST - Traducir log manualmente
router.post('/ai/translate', async (req, res) => {
  const requestId = `AI_TRANSLATE_${Date.now()}`;
  
  logger.info(`[${requestId}] Solicitud de traducción manual de IA`);
  
  try {
    const { logData, logType = 'info' } = req.body;
    
    if (!logData) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere el campo logData para traducir',
        timestamp: new Date().toISOString()
      });
    }
    
    logger.info(`[${requestId}] Traduciendo log tipo: ${logType}`);
    
    const translation = await aiService.translateCPILog(logData, logType);
    
    logger.info(`[${requestId}] Traducción completada: ${translation.success ? 'exitosa' : 'fallback'}`);
    
    res.json({
      success: true,
      requestId,
      message: 'Traducción completada',
      translation: {
        humanReadable: translation.translation,
        success: translation.success,
        provider: translation.metadata?.provider,
        model: translation.metadata?.model,
        processingTime: translation.metadata?.processingTime,
        tokensUsed: translation.metadata?.tokensUsed
      },
      originalData: logData,
      logType,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    logger.error(`[${requestId}] Error en traducción manual: ${error.message}`);
    res.status(500).json({
      success: false,
      requestId,
      message: 'Error en la traducción',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// GET - Obtener traducciones recientes
router.get('/ai/translations', (req, res) => {
  logger.info('Consultando traducciones recientes de IA');
  
  const translationsWithAI = pi4Data
    .filter(item => item.aiTranslation)
    .map(item => ({
      id: item.id,
      receivedAt: item.receivedAt,
      logType: item.logType,
      translation: item.aiTranslation.translation,
      aiSuccess: item.aiTranslation.success,
      provider: item.aiTranslation.metadata?.provider,
      processingTime: item.aiTranslation.metadata?.processingTime,
      tokensUsed: item.aiTranslation.metadata?.tokensUsed
    }))
    .slice(-20); // Últimos 20
    
  res.json({
    success: true,
    message: 'Traducciones recientes recuperadas',
    total: translationsWithAI.length,
    translations: translationsWithAI,
    timestamp: new Date().toISOString()
  });
});

module.exports = router;