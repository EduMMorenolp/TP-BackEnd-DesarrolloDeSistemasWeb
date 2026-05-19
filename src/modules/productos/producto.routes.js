import express from "express";
const router = express.Router();

import * as productoController from "./producto.controller.js";

router.get('/', productoController.obtenerCatalogo);

router.post('/', productoController.crearProducto);

router.get('/:id', productoController.obtenerProductoPorId);

router.put('/:id', productoController.actualizarProducto);

router.delete('/:id', productoController.eliminarProducto);

export default router;
