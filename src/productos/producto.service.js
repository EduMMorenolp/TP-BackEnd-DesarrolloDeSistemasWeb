const { store, saveStore } = require('../shared/store');

const { createProducto } = require('./producto.model');

const crear = (datos) => {
  const { nombre, precio, categoria } = datos;

  // Validación: Nombre string no vacío, precio > 0 y categoría obligatoria
  if (!nombre || typeof nombre !== 'string' || precio <= 0 || !categoria) {
    const error = new Error("El campo 'precio' debe ser un número mayor a 0 y los campos obligatorios deben estar presentes");
    error.status = 400;
    throw error;
  }

  const nuevoProducto = createProducto(datos);
  store.productos.push(nuevoProducto);
  saveStore();
  return nuevoProducto;
};

const listar = () => store.productos;

const obtenerPorId = (id) => {
  const producto = store.productos.find(p => p.id === id);

  if (!producto) {
    const error = new Error("Producto no encontrado");
    error.status = 404;
    throw error;
  }

  return producto;
};

const obtenerProductosPorIds = (ids) => {
  if (!Array.isArray(ids)) {
    const error = new Error('El parámetro debe ser un arreglo de ids');
    error.status = 400;
    throw error;
  }

  return ids.map(id => obtenerPorId(id));
};

const actualizar = (id, datosNuevos) => {
  const { nombre, precio, descripcion } = datosNuevos;
  const producto = store.productos.find(p => p.id === id);

  if (!producto) {
    const error = new Error("Producto no encontrado");
    error.status = 404;
    throw error;
  }

  // Validación: Si viene el precio, debe ser > 0
  if (precio !== undefined && (typeof precio !== 'number' || precio <= 0)) {
    const error = new Error("El campo 'precio' debe ser un número mayor a 0");
    error.status = 400;
    throw error;
  }

  // Actualizamos solo los campos que vienen en el body
  if (nombre) producto.nombre = nombre;
  if (precio !== undefined) producto.precio = precio;
  if (descripcion) producto.descripcion = descripcion;

  saveStore();

  return producto;
};

const eliminar = (id) => {
  // 1. Verificar si el producto existe
  const index = store.productos.findIndex(p => p.id === id);
  if (index === -1) {
    const error = new Error("Producto no encontrado");
    error.status = 404;
    throw error;
  }

  // 2. Regla de negocio: Verificar pedidos activos
  // Buscamos en el array de pedidos (Dev 4)
  const productoEnUso = store.pedidos.some(pedido =>
    pedido.productos.some(item => item.productoId === id) && pedido.estado !== "entregado"
  );

  if (productoEnUso) {
    const error = new Error("No se puede eliminar: el producto forma parte de un pedido activo");
    error.status = 409; // Código HTTP para conflicto
    throw error;
  }

  // 3. Si todo está bien, lo borramos
  const eliminado = store.productos.splice(index, 1);
  saveStore();
  return eliminado;
};


module.exports = { crear, listar, obtenerPorId, obtenerProductosPorIds, actualizar, eliminar };
