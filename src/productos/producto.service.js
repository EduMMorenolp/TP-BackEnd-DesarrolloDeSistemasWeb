import Producto from './producto.model.js';
import Pedido from '../pedidos/pedido.model.js';

// Crear producto
export async function crear(data) {
  const producto = new Producto(data);
  await producto.save();
  return producto;
}

// Listar productos
export async function listar() {
  return await Producto.find();
}


// Buscar producto por un array de IDs
export async function obtenerProductosPorIds(ids) {
// ids es un array que viene de pedido.service
  const productos = await Producto.find({
    _id: { $in: ids }
  });  


  if (!productos || productos.length === 0) {
    const err = new Error('Producto no encontrado');
    err.status = 404;
    throw err;
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
