const productoService = require('./producto.service');

const crearProducto = (req, res, next) => {
  try {
    const nuevo = productoService.crear(req.body);
    res.status(201).json(nuevo);
  } catch (err) {
    next(err); // Esto lo envía al errorHandler.js
  }
};

const obtenerCatalogo = (req, res, next) => {
  try {
    const productos = productoService.listar();
    res.status(200).json(productos);
  } catch (err) {
    next(err);
  }
};

const obtenerProductoPorId = (req, res, next) => {
  try {
    const { id } = req.params;
    const producto = productoService.obtenerPorId(id);
    res.status(200).json(producto);
  } catch (err) {
    next(err);
  }
};

const actualizarProducto = (req, res, next) => {
  try {
    const { id } = req.params;
    const productoActualizado = productoService.actualizar(id, req.body);
    res.status(200).json(productoActualizado);
  } catch (err) {
    next(err);
  }
};

const eliminarProducto = (req, res, next) => {
  try {
    const { id } = req.params;
    productoService.eliminar(id);
    res.status(200).json({ mensaje: "Producto eliminado correctamente" });
  } catch (err) {
    next(err);
  }
};

module.exports = { crearProducto, obtenerCatalogo, obtenerProductoPorId, actualizarProducto, eliminarProducto };
