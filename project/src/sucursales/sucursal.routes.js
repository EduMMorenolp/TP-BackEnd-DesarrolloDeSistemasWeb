const express = require('express');
const router = express.Router();
const controller = require('./sucursal.controller');

router.get('/', controller.listar);

router.get('/:id', controller.obtenerPorId);

router.post('/', controller.crear);

router.put('/:id', controller.actualizar);

router.delete('/:id', controller.desactivar);

module.exports = router;
