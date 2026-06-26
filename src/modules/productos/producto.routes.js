import express from "express";
const router = express.Router();

import * as productoController from "./producto.controller.js";
import { permit } from '../../shared/middlewares/permission.middleware.js';

router.get('/', productoController.obtenerCatalogo);

// Crear / editar / eliminar: solo PLANTA (ADMIN implicito via middleware).
// FRANQUICIA y SUCURSAL son consumidores del catalogo, no lo administran.
router.post('/', permit(['PLANTA']), productoController.crearProducto);

router.get('/:id', productoController.obtenerProductosPorIds);

router.put('/:id', permit(['PLANTA']), productoController.actualizarProducto);

router.delete('/:id', permit(['PLANTA']), productoController.eliminarProducto);

export default router;
