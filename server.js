require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const basicAuth = require('express-basic-auth');
const logger = require('./utils/logger');
const AUTH_CONFIG = require('./config/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares de seguridad y configuración
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos (para el frontend)
app.use('/dashboard', express.static('public'));

// Configuración de Basic Auth
const authMiddleware = basicAuth({
  users: AUTH_CONFIG.users,
  challenge: AUTH_CONFIG.challenge,
  realm: AUTH_CONFIG.realm,
  unauthorizedResponse: (req) => {
    logger.warn(`Intento de acceso no autorizado desde IP: ${req.ip || req.connection.remoteAddress} a ${req.originalUrl}`);
    return {
      error: 'Acceso no autorizado',
      message: 'Se requiere autenticación básica para acceder a este recurso',
      timestamp: new Date().toISOString()
    };
  }
});

// Middleware de logging personalizado
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.originalUrl;
  const ip = req.ip || req.connection.remoteAddress;
  
  // Log de autenticación si existe
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Basic ')) {
    const credentials = Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
    const username = credentials[0];
    logger.info(`${method} ${url} - IP: ${ip} - Usuario autenticado: ${username} - Timestamp: ${timestamp}`);
  } else {
    logger.info(`${method} ${url} - IP: ${ip} - Sin autenticación - Timestamp: ${timestamp}`);
  }
  
  if (Object.keys(req.body).length > 0) {
    logger.info(`Body: ${JSON.stringify(req.body)}`);
  }
  
  if (Object.keys(req.query).length > 0) {
    logger.info(`Query params: ${JSON.stringify(req.query)}`);
  }
  
  next();
});

// Middleware de Morgan para logging HTTP
app.use(morgan('combined', {
  stream: {
    write: (message) => logger.http(message.trim())
  }
}));

// Importar rutas
const apiRoutes = require('./routes/api');

// Aplicar Basic Auth a todas las rutas de la API
app.use('/api', authMiddleware, apiRoutes);

// Ruta raíz (sin autenticación)
app.get('/', (req, res) => {
  logger.info('Acceso a la ruta raíz');
  res.json({
    message: 'Bienvenido al Backend CPI',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    authentication: {
      required: true,
      type: 'Basic Auth',
      users: ['admin', 'user', 'api-client'],
      note: 'Se requiere autenticación para acceder a las rutas /api/*'
    },
    endpoints: {
      dashboard: '/dashboard (Frontend web)',
      users: '/api/users (requiere auth)',
      products: '/api/products (requiere auth)',  
      health: '/api/health (requiere auth)',
      'gma-pi4': '/api/gma/ssffev/PI4/ (requiere auth)',
      'logtail-status': '/api/logtail/status (requiere auth)',
      'logtail-test': '/api/logtail/test (requiere auth)',
      evaluar: '/api/evaluar/* (solo recepción de datos, requiere auth)',
      pruebas: '/api/pruebas/* (solo recepción de datos, requiere auth)'
    }
  });
});

// Ruta de información de autenticación (sin auth requerida)
app.get('/auth-info', (req, res) => {
  logger.info('Consulta de información de autenticación');
  res.json({
    message: 'Información de Autenticación - Backend CPI',
    authentication: {
      type: 'HTTP Basic Authentication',
      realm: AUTH_CONFIG.realm,
      instructions: {
        browser: 'El navegador mostrará un diálogo de autenticación',
        curl: 'curl -u usuario:contraseña http://localhost:3000/api/health',
        powershell: 'Usar -Credential (Get-Credential) con Invoke-RestMethod',
        postman: 'En la pestaña Authorization, seleccionar Basic Auth'
      },
      testCredentials: {
        admin: 'password123',
        user: 'user123',
        'api-client': 'client456'
      }
    },
    timestamp: new Date().toISOString()
  });
});

// Servir archivo HTML de prueba (sin auth requerida)
app.get('/test', (req, res) => {
  logger.info('Acceso a página de prueba de autenticación');
  res.sendFile(__dirname + '/test-auth.html');
});

// Middleware de manejo de errores
app.use((err, req, res, next) => {
  logger.error(`Error: ${err.message} - Stack: ${err.stack}`);
  res.status(500).json({
    error: 'Error interno del servidor',
    message: err.message,
    timestamp: new Date().toISOString()
  });
});

// Middleware para rutas no encontradas
app.use('*', (req, res) => {
  logger.warn(`Ruta no encontrada: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    error: 'Ruta no encontrada',
    method: req.method,
    url: req.originalUrl,
    timestamp: new Date().toISOString()
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  logger.info(`Servidor iniciado en el puerto ${PORT}`);
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});

module.exports = app;