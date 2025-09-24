const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');

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

// POST - Procesar datos GMA/SSFFEV/PI4
router.post('/gma/ssffev/PI4/', (req, res) => {
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

    // Estructura base para procesar el body
    const processedData = {
      id: requestId,
      receivedAt: timestamp,
      originalData: req.body,
      processedData: null,
      status: 'received',
      metadata: {
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent'),
        contentType: req.get('Content-Type'),
        bodySize: JSON.stringify(req.body).length
      }
    };

    // Aquí es donde procesaremos el body más adelante
    // Por ahora solo lo almacenamos y registramos
    processedData.processedData = {
      message: 'Datos recibidos correctamente - Procesamiento pendiente',
      dataKeys: Object.keys(req.body),
      dataTypes: Object.keys(req.body).reduce((types, key) => {
        types[key] = typeof req.body[key];
        return types;
      }, {}),
      processed: false
    };

    // Guardar en almacenamiento temporal
    pi4Data.push(processedData);
    
    logger.info(`[${requestId}] Datos procesados y almacenados exitosamente`);
    
    // Respuesta de éxito
    res.status(200).json({
      success: true,
      requestId,
      message: 'Datos GMA/SSFFEV/PI4 recibidos y procesados correctamente',
      timestamp,
      data: {
        processed: processedData.processedData,
        metadata: processedData.metadata
      },
      nextSteps: 'Los datos están listos para procesamiento adicional'
    });

  } catch (error) {
    logger.error(`[${requestId}] Error procesando datos GMA/SSFFEV/PI4: ${error.message}`);
    logger.error(`[${requestId}] Stack trace: ${error.stack}`);
    
    res.status(500).json({
      success: false,
      requestId,
      message: 'Error interno procesando los datos GMA/SSFFEV/PI4',
      timestamp,
      error: error.message
    });
  }
});

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

module.exports = router;