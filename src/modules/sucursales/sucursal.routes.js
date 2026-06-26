import express from 'express';
const router = express.Router();
import * as controller from './sucursal.controller.js';
import { permit, permitOwnerOr } from '../../shared/middlewares/permission.middleware.js';

router.get('/', controller.listar);

router.get('/:id/trazabilidad', controller.trazabilidad);

router.get('/:id', controller.obtenerPorId);

// Creación: solo PLANTA (ADMIN implícito via middleware). FRANQUICIA no crea sucursales.
router.post('/', permit(['PLANTA']), controller.crear);

// Editar / Desactivar / Reactivar:
//  - PLANTA: administra TODAS las sucursales y franquicias (globalRoles)
//  - FRANQUICIA: solo sobre la suya (ownerRoles -> verifica propiedad)
//  - SUCURSAL: 403 (no toca sucursales, solo hace pedidos)
router.put('/:id', permitOwnerOr(['PLANTA'], ['FRANQUICIA'], 'Sucursal', 'id', 'sucursalId'), controller.actualizar);

router.delete('/:id', permitOwnerOr(['PLANTA'], ['FRANQUICIA'], 'Sucursal', 'id', 'sucursalId'), controller.desactivar);

// Reactivar sucursal desactivada (soft delete revert)
router.patch('/:id/activar', permitOwnerOr(['PLANTA'], ['FRANQUICIA'], 'Sucursal', 'id', 'sucursalId'), controller.activar);

export default router;
