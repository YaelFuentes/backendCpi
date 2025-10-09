const express = require('express');
const router = express.Router();
const logger = require('../../utils/logger');

function createReceiverEndpoint(endpointName, scope = 'pruebas') {
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
      query: req.query
    });

    return res.status(202).json({
      success: true,
      scope,
      endpoint: endpointName,
      message: 'Datos recibidos',
      requestId,
      receivedAt
    });
  };
}

// Endpoints de ejemplo (solo recepción)
router.post('/ping', createReceiverEndpoint('ping'));
router.post('/echo', (req, res) => {
  const handler = createReceiverEndpoint('echo');
  handler(req, res);
});
router.post('/evento', createReceiverEndpoint('evento'));

// Endpoint genérico /api/pruebas/generic/:nombre
router.post('/generic/:nombre', (req, res) => {
  const nombre = req.params.nombre;
  return createReceiverEndpoint(nombre)(req, res);
});

module.exports = router;
