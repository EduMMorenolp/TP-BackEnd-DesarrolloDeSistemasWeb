const express = require('express');
const router = express.Router();
const pedidoController = require('./pedido.controller');

router.get('/', pedidoController.listar);
router.get('/:id', pedidoController.obtenerPorId);
router.post('/', pedidoController.crear);
router.patch('/:id/estado', pedidoController.cambiarEstado);
router.delete('/:id', pedidoController.cancelar);

module.exports = router;
