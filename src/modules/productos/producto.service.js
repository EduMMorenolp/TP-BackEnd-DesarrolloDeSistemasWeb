import Producto from './producto.model.js';
import Pedido from '../pedidos/pedido.model.js';

// Helper interno para centralizar la validación de roles de administración
function validarPermisoAdministracion(rol) {
  if (rol !== 'ADMIN' && rol !== 'PLANTA') {
    const error = new Error("No tiene permisos para realizar esta acción. Solo PLANTA o ADMIN pueden administrar el catálogo.");
    error.status = 403; // Forbidden (Prohibido)
    throw error;
  }
}


// Crear producto
export async function crear(data, userId, rol) {
  validarPermisoAdministracion(rol);
  const productoData = {
    ...data,
    createdBy: userId 
  };

  const producto = new Producto(productoData);
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

export async function actualizar(id, data, userId, rol) {
  // 1. Validar rol (Defensa en profundidad)
  validarPermisoAdministracion(rol);
const { precio} = data

  // 1. Validaciones manuales (antes de ir a la DB)
    if (precio !== undefined && (typeof precio !== 'number' || precio <= 0)) {
    const error = new Error("El campo 'precio' debe ser un numero mayor a 0");
    error.status = 400;
    throw error;
  }

  // Agregar auditoría de actualización 
  const dataUpdate = {
    ...data,
    updatedBy: userId 
  };

  // 2. Buscamos el producto y actualizamos
  const productoActualizado = await Producto.findByIdAndUpdate(id, dataUpdate, { 
    returnDocument: 'after', 
    runValidators: true 
  });


  // 3. Si el ID no existe en MongoDB
  if (!productoActualizado) {
    const error = new Error('Producto no encontrado');
    error.status = 404;
    throw error;
  }
  return productoActualizado;

 }


// Eliminar producto
// Se añade 'rol' para validar la baja del producto
export async function eliminar(id,rol) {
  // 1. Validar rol (Defensa en profundidad)
  validarPermisoAdministracion(rol);

  const producto = await Producto.findById(id);

  if (!producto) {
    const error = new Error('Producto no encontrado');
    error.status = 404;
    throw error;
  }

 // Regla de negocio: Validar contra pedidos en MongoDB
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


// Trazabilidad completa: auditoría + pedidos asociados al producto
export const obtenerTrazabilidad = async (id) => {

  // 1. Buscamos el producto. 
  const producto = await Producto.findById(id)
     .populate('createdBy', 'nombre email')
     .populate('updatedBy', 'nombre email');

  if (!producto) {
    const error = new Error('Producto no encontrado');
    error.status = 404;
    throw error;
  }

  // 2. Buscamos la trazabilidad cruzada en la colección de Pedidos
  const [totalPedidos, pedidosActivos, ultimosPedidos] = await Promise.all([
    Pedido.countDocuments({ 'productos.productoId': id }),
    Pedido.countDocuments({ 'productos.productoId': id, estado: { $ne: 'entregado' } }),
    Pedido.find({ 'productos.productoId': id })
      .sort({ fechaPedido: -1 }) // Ordenamos por el pedido más reciente 
      .limit(5)
      .select('estado fechaPedido observaciones sucursalId')
      .populate('sucursalId', 'nombre') // para saber en qué sucursal se pidió el producto
      .lean()
  ]);

  // 3. Retornamos el objeto unificado 
  return {
    ...producto.toJSON(), // Convertimos el documento Mongoose a objeto JS
    pedidos: {
      total: totalPedidos,
      activos: pedidosActivos,
      ultimos: ultimosPedidos
    }
  };
}