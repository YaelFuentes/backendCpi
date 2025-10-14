// Test para verificar que el servidor se inicia correctamente
console.log('🔍 Iniciando test del servidor...');

try {
    require('dotenv').config();
    console.log('✅ dotenv cargado');
    
    const express = require('express');
    console.log('✅ express cargado');
    
    const logger = require('./utils/logger');
    console.log('✅ logger cargado');
    
    const MonitoringService = require('./services/monitoring-service');
    console.log('✅ MonitoringService cargado');
    
    const apiRoutes = require('./routes/api');
    console.log('✅ apiRoutes cargado');
    
    console.log('🎉 Todos los módulos cargados correctamente');
    
    // Intentar crear app básica
    const app = express();
    console.log('✅ App Express creada');
    
    const PORT = process.env.PORT || 3000;
    const server = app.listen(PORT, () => {
        console.log(`🚀 Servidor de prueba iniciado en puerto ${PORT}`);
        
        // Cerrar servidor después de verificar
        setTimeout(() => {
            server.close(() => {
                console.log('✅ Test completado - Servidor cerrado');
                process.exit(0);
            });
        }, 2000);
    });
    
} catch (error) {
    console.error('❌ Error en test:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
}