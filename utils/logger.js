require('dotenv').config();
const winston = require('winston');
const path = require('path');
const fs = require('fs');
const { Logtail } = require('@logtail/node');
const { LogtailTransport } = require('@logtail/winston');

// Crear directorio de logs si no existe
const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Configuración de formato personalizado
const customFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ level, message, timestamp, stack }) => {
    if (stack) {
      return `${timestamp} [${level.toUpperCase()}]: ${message}\n${stack}`;
    }
    return `${timestamp} [${level.toUpperCase()}]: ${message}`;
  })
);

// Configurar Logtail si el token está disponible
let logtail = null;
let logtailTransport = null;

if (process.env.LOGTAIL_SOURCE_TOKEN && process.env.LOGTAIL_SOURCE_TOKEN !== 'your_logtail_source_token_here') {
  try {
    logtail = new Logtail(process.env.LOGTAIL_SOURCE_TOKEN);
    logtailTransport = new LogtailTransport(logtail, {
      level: process.env.LOG_LEVEL || 'info'
    });
    console.log('✅ Logtail configurado correctamente');
  } catch (error) {
    console.error('❌ Error configurando Logtail:', error.message);
  }
} else {
  console.log('⚠️ Logtail no configurado - Token no encontrado o es placeholder');
}

// Crear array de transports base
const transports = [
  // Escribir todos los logs en 'combined.log'
  new winston.transports.File({ 
    filename: path.join(logsDir, 'combined.log'),
    maxsize: 5242880, // 5MB
    maxFiles: 5
  }),
  // Escribir solo errores en 'error.log'
  new winston.transports.File({ 
    filename: path.join(logsDir, 'error.log'), 
    level: 'error',
    maxsize: 5242880, // 5MB
    maxFiles: 5
  }),
  // Escribir logs de peticiones HTTP en 'http.log'
  new winston.transports.File({ 
    filename: path.join(logsDir, 'http.log'), 
    level: 'http',
    maxsize: 5242880, // 5MB
    maxFiles: 5
  })
];

// Agregar Logtail transport si está disponible
if (logtailTransport) {
  transports.push(logtailTransport);
}

// Crear el logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: customFormat,
  transports: transports
});

// Si no estamos en producción, también mostrar logs en consola
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

// Funciones auxiliares para Logtail
logger.getLogtailStatus = () => {
  return {
    configured: !!logtailTransport,
    token: process.env.LOGTAIL_SOURCE_TOKEN ? 
      `${process.env.LOGTAIL_SOURCE_TOKEN.substring(0, 8)}***` : 
      'No configurado'
  };
};

// Log inicial sobre el estado de Logtail
logger.info('🚀 Logger inicializado', {
  level: process.env.LOG_LEVEL || 'info',
  logtail: logger.getLogtailStatus(),
  transports: transports.length,
  environment: process.env.NODE_ENV || 'development'
});

module.exports = logger;