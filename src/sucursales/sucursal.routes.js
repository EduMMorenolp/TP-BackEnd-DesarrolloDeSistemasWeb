import express from 'express';
const router = express.Router();
import * as controller from './sucursal.controller.js';

router.get('/', controller.listar);

router.get('/:id', controller.obtenerPorId);

router.post('/', controller.crear);

router.put('/:id', controller.actualizar);

router.delete('/:id', controller.desactivar);

export default router;
