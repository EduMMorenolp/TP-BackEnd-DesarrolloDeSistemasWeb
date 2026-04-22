const express = require("express");
// Este router permite definir rutas en un archivo separado del servidor principal
const router = express.Router();

const productoController = require("./producto.controller");

// rutas CRUD

// GET /api/productos -> Listar todos los productos
router.get('/', productoController.obtenerCatalogo);

// POST /api/productos -> Crear un nuevo producto
router.post('/', productoController.crearProducto);

// GET /api/productos/:id -> Obtener un producto por ID
 router.get('/:id', productoController.obtenerProducto);

// PUT /api/productos/:id -> Actualizar un producto
 router.put('/:id', productoController.actualizarProducto);

// DELETE /api/productos/:id -> Eliminar un producto
 router.delete('/:id', productoController.eliminarProducto);


module.exports = router;
