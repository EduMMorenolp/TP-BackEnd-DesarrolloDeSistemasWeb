import { store, saveStore } from '../../shared/store.js';
import { createProducto } from '../productos/producto.model.js';

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

  return productos;
}


// Actualizar datos
export async function actualizar(id, data) {
  const { nombre, precio, descripcion, categoria } = data

  // 1. Validaciones manuales (antes de ir a la DB)
    if (precio !== undefined && (typeof precio !== 'number' || precio <= 0)) {
    const error = new Error("El campo 'precio' debe ser un numero mayor a 0");
    error.status = 400;
    throw error;
  }

  // 2. Buscamos el producto
  const producto = await Producto.findById(id);
  
  if (!producto) {
    const error = new Error('Producto no encontrado');
    error.status = 404;
    throw error;
  }

  // 3. Aplicamos los cambios manualmente a la variable
  if (nombre) producto.nombre = nombre;
  if (precio !== undefined) producto.precio = precio;
  if (descripcion) producto.descripcion = descripcion;
  if (categoria) producto.categoria = categoria;

  // 4. Guardamos los cambios en la DB de una sola vez
  return await producto.save();
}



// Eliminar producto

export async function eliminar(id) {
  const producto = await Producto.findById(id);

  if (!producto) {
    const error = new Error('Producto no encontrado');
    error.status = 404;
    throw error;
  }

 // Regla de negocio: Validar contra pedidos en store.js (memoria)
  const productoEnUso = await Pedido.findOne({
    'productos.productoId': id,       // Busca dentro del array de productos del pedido
    estado: { $ne: 'entregado' }      // Que el estado NO sea 'entregado'
  });

  if (productoEnUso) {
    const err = new Error("No se puede eliminar: el producto forma parte de un pedido activo");
    err.status = 409;
    throw err;
  }

  return await Producto.findByIdAndDelete(id);
};
