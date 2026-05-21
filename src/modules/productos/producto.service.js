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

// Buscar producto por un array de IDs (usado por pedidos)
export async function obtenerProductosPorIds(ids) {
  return await Producto.find({ _id: { $in: ids } });
}

// Buscar producto por ID (usado por controlador de productos)
export async function obtenerPorId(id) {
  const producto = await Producto.findById(id);
  if (!producto) {
    const error = new Error('Producto no encontrado');
    error.status = 404;
    throw error;
  }
  return producto;
}

// Actualizar datos
export async function actualizar(id, data) {
  const producto = await Producto.findByIdAndUpdate(
    id,
    { $set: data },
    { new: true, runValidators: true }
  );

  if (!producto) {
    const error = new Error('Producto no encontrado');
    error.status = 404;
    throw error;
  }

  return producto;
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