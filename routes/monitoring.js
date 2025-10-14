const express = require('express');
const router = express.Router();
const MonitoringService = require('../services/monitoring-service');
const CPIDebugger = require('../services/cpi-debugger');
const logger = require('../utils/logger');

// Instancia del servicio de monitoreo
const monitoringService = new MonitoringService();
const cpiDebugger = new CPIDebugger();

// GET /api/monitoring/status - Estado del sistema de monitoreo
router.get('/status', async (req, res) => {
    try {
        const status = await monitoringService.getStatus();
        res.json({
            success: true,
            status: status,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        logger.error('Error obteniendo status de monitoreo:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// POST /api/monitoring/run - Ejecutar monitoreo manual
router.post('/run', async (req, res) => {
    try {
        logger.info('Iniciando monitoreo manual', {
            user: req.headers.authorization || 'unknown',
            ip: req.ip
        });

        const result = await monitoringService.runMonitoring();
        
        res.json({
            success: true,
            message: 'Monitoreo ejecutado exitosamente',
            result: result,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        logger.error('Error ejecutando monitoreo:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// GET /api/monitoring/reports - Listar reportes disponibles
router.get('/reports', async (req, res) => {
    try {
        const reports = await monitoringService.getReports();
        res.json({
            success: true,
            reports: reports,
            count: reports.length
        });
    } catch (error) {
        logger.error('Error obteniendo reportes:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// GET /api/monitoring/reports/:id - Obtener reporte específico
router.get('/reports/:id', async (req, res) => {
    try {
        const report = await monitoringService.getReport(req.params.id);
        if (!report) {
            return res.status(404).json({
                success: false,
                error: 'Reporte no encontrado'
            });
        }
        res.json({
            success: true,
            report: report
        });
    } catch (error) {
        logger.error('Error obteniendo reporte:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// POST /api/monitoring/config - Configurar monitoreo
router.post('/config', async (req, res) => {
    try {
        const config = req.body;
        await monitoringService.updateConfig(config);
        
        logger.info('Configuración de monitoreo actualizada', { 
            baseUrl: config.baseUrl,
            integrationsCount: config.integrations?.length || 0
        });
        
        res.json({
            success: true,
            message: 'Configuración actualizada exitosamente'
        });
    } catch (error) {
        logger.error('Error actualizando configuración:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// GET /api/monitoring/config - Obtener configuración actual
router.get('/config', async (req, res) => {
    try {
        const config = monitoringService.getConfig();
        res.json({
            success: true,
            config: {
                ...config,
                credentials: { // No exponer credenciales completas
                    username: config.credentials?.username ? config.credentials.username.substring(0, 3) + '***' : '',
                    configured: !!(config.credentials?.username && config.credentials?.password)
                }
            }
        });
    } catch (error) {
        logger.error('Error obteniendo configuración:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// DELETE /api/monitoring/reports/:id - Eliminar reporte específico
router.delete('/reports/:id', async (req, res) => {
    try {
        await monitoringService.deleteReport(req.params.id);
        res.json({
            success: true,
            message: 'Reporte eliminado exitosamente'
        });
    } catch (error) {
        logger.error('Error eliminando reporte:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// POST /api/monitoring/test-connection - Probar conexión a CPI
router.post('/test-connection', async (req, res) => {
    try {
        const result = await monitoringService.testConnection();
        res.json({
            success: true,
            result: result,
            message: 'Prueba de conexión completada'
        });
    } catch (error) {
        logger.error('Error probando conexión:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// POST /api/monitoring/debug-login - Debug de la página de login
router.post('/debug-login', async (req, res) => {
    try {
        logger.info('Iniciando debug de página de login CPI');
        
        const result = await cpiDebugger.debugLoginPage();
        
        res.json({
            success: true,
            message: 'Debug de login completado',
            result: result,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        logger.error('Error en debug de login:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;