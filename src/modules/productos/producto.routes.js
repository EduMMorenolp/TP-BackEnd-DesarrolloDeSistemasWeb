import express from "express";
const router = express.Router();

import * as productoController from "./producto.controller.js";
import { permit } from '../../shared/middlewares/permission.middleware.js';

router.get('/', productoController.obtenerCatalogo);

router.post('/', permit(['PLANTA','FRANQUICIA']), productoController.crearProducto);

router.get('/:id', productoController.obtenerProductosPorIds);

router.put('/:id', permit(['PLANTA','FRANQUICIA']), productoController.actualizarProducto);

router.delete('/:id', permit(['PLANTA','FRANQUICIA']), productoController.eliminarProducto);

export default router;
