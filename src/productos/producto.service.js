import { store, saveStore } from '../shared/store.js';
import { createProducto } from './producto.model.js';

export const crear = (datos) => {
  const { nombre, precio, categoria } = datos;

  if (!nombre || typeof nombre !== 'string' || precio <= 0 || !categoria) {
    const error = new Error("El campo 'precio' debe ser un numero mayor a 0 y los campos obligatorios deben estar presentes");
    error.status = 400;
    throw error;
  }

  const nuevoProducto = createProducto(datos);
  store.productos.push(nuevoProducto);
  saveStore();
  return nuevoProducto;
};

export const listar = () => store.productos;

export const obtenerPorId = (id) => {
  const producto = store.productos.find(p => p.id === id);

  if (!producto) {
    const error = new Error("Producto no encontrado");
    error.status = 404;
    throw error;
  }

  return producto;
};

export const obtenerProductosPorIds = (ids) => {
  if (!Array.isArray(ids)) {
    const error = new Error('El parametro debe ser un arreglo de ids');
    error.status = 400;
    throw error;
  }

  return ids.map(id => obtenerPorId(id));
};

export const actualizar = (id, datosNuevos) => {
  const { nombre, precio, descripcion } = datosNuevos;
  const producto = store.productos.find(p => p.id === id);

  if (!producto) {
    const error = new Error("Producto no encontrado");
    error.status = 404;
    throw error;
  }

  if (precio !== undefined && (typeof precio !== 'number' || precio <= 0)) {
    const error = new Error("El campo 'precio' debe ser un numero mayor a 0");
    error.status = 400;
    throw error;
  }

  if (nombre) producto.nombre = nombre;
  if (precio !== undefined) producto.precio = precio;
  if (descripcion) producto.descripcion = descripcion;

  saveStore();

  return producto;
};

export const eliminar = (id) => {
  const index = store.productos.findIndex(p => p.id === id);
  if (index === -1) {
    const error = new Error("Producto no encontrado");
    error.status = 404;
    throw error;
  }

  const productoEnUso = store.pedidos.some(pedido =>
    pedido.productos.some(item => item.productoId === id) && pedido.estado !== "entregado"
  );

  if (productoEnUso) {
    const error = new Error("No se puede eliminar: el producto forma parte de un pedido activo");
    error.status = 409;
    throw error;
  }

  const eliminado = store.productos.splice(index, 1);
  saveStore();
  return eliminado;
};
