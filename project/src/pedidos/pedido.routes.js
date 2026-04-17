const express = require('express');
const router = express.Router();
const pedidoController = require('./pedido.controller');

// Definir el endpoint de creación
router.post('/', pedidoController.crear);

module.exports = router;
