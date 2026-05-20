import Producto from './producto.model.js';
import Pedido from '../pedidos/pedido.model.js';

// Crear producto
export async function crear(data) {
}

// Listar productos
export async function listar() {
  return await Producto.find();
}


// Buscar producto por un array de IDs
export async function obtenerProductosPorIds(ids) {
}


// Actualizar datos
export async function actualizar(id, data) {
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