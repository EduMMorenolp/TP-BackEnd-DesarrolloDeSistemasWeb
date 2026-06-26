import express from 'express';
const router = express.Router();
import * as pedidoController from './pedido.controller.js';

router.get('/', pedidoController.listar);
router.get('/:id', pedidoController.obtenerPorId);
router.post('/', pedidoController.crear);
router.get('/:id/trazabilidad', pedidoController.obtenerTrazabilidad);
router.patch('/:id/estado', pedidoController.cambiarEstado);
router.delete('/:id', pedidoController.cancelar);

export default router;
