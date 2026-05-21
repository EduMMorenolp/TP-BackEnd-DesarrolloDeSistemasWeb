import * as productoService from './producto.service.js';

export const crearProducto = async (req, res, next) => {
  try {
    const nuevo = await productoService.crear(req.body);
    res.status(201).json(nuevo);
  } catch (err) {
    next(err);
  }
}

export const obtenerCatalogo = async (req, res, next) => {
  try {
    const productos = await productoService.listar();
    res.status(200).json(productos);
  } catch (err) {
    next(err);
  }
}

export const obtenerProductosPorIds = async (req, res, next) => {
  try {
    const producto = await productoService.obtenerProductosPorIds([req.params.id]);
    res.status(200).json(producto[0]);
  } catch (err) {
    next(err);
  }
}

export const actualizarProducto = async (req, res, next) => {
  try {
    const actualizado = await productoService.actualizar(req.params.id, req.body);
    res.status(200).json(actualizado);
  } catch (err) {
    next(err);
  }
}

export const eliminarProducto = async (req, res, next) => {
  try {
    await productoService.eliminar(req.params.id);
    res.status(200).json({ mensaje: "Producto eliminado correctamente" });
  } catch (err) {
    next(err);
  }
}
