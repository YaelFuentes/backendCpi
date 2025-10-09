const express = require('express');
const router = express.Router();
const logger = require('../../utils/logger');

// Utilidad para crear endpoints que solo reciben información
function createReceiverEndpoint(endpointName, scope = 'evaluar') {
  return (req, res) => {
    const requestId = `${scope.toUpperCase()}_${Date.now()}`;
    const receivedAt = new Date().toISOString();

    logger.info(`[${requestId}] /${scope}/${endpointName} - datos recibidos`, {
      scope,
      endpoint: endpointName,
      ip: req.ip || req.connection.remoteAddress,
      contentType: req.get('Content-Type'),
      userAgent: req.get('User-Agent'),
      body: req.body,
      query: req.query,
      headers: {
        'x-request-id': req.get('x-request-id') || null
      }
    });

    return res.status(202).json({
      success: true,
      scope,
      endpoint: endpointName,
      message: 'Datos recibidos',
      requestId,
      receivedAt,
      meta: {
        bodySize: JSON.stringify(req.body || {}).length,
        querySize: Object.keys(req.query || {}).length
      }
    });
  };
}

// Endpoints de ejemplo (solo recepción de datos)
router.post('/orden', createReceiverEndpoint('orden'));
router.post('/inventario', createReceiverEndpoint('inventario'));
router.post('/envio', createReceiverEndpoint('envio'));

// Endpoint genérico para facilitar nuevas integraciones sin tocar código
router.post('/generic/:nombre', (req, res) => {
  const nombre = req.params.nombre;
  return createReceiverEndpoint(nombre)(req, res);
});

module.exports = router;
