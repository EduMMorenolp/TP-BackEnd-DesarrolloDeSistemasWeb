import express from 'express';
const router = express.Router();
import * as controller from './sucursal.controller.js';
import { permit, permitOwnerOr } from '../../shared/middlewares/permission.middleware.js';

router.get('/', controller.listar);

router.get('/:id', controller.obtenerPorId);

// Creación: PLANTA o FRANQUICIA (ADMIN implícito via middleware global)
router.post('/', permit(['PLANTA','FRANQUICIA']), controller.crear);

// Actualizar / Desactivar: PLANTA o FRANQUICIA sobre sus propias sucursales
router.put('/:id', permitOwnerOr(['PLANTA','FRANQUICIA'], 'Sucursal', 'id', 'sucursalId'), controller.actualizar);

router.delete('/:id', permitOwnerOr(['PLANTA','FRANQUICIA'], 'Sucursal', 'id', 'sucursalId'), controller.desactivar);

export default router;
