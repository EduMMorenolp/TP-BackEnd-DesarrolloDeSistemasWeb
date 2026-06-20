import Sucursal from './sucursal.model.js';
import Pedido from '../pedidos/pedido.model.js';

// Crear sucursal
export async function crear(data, userId) {
  const sucursal = new Sucursal({ ...data, createdBy: userId });
  await sucursal.save();
  return sucursal;
}

// Listar sucursales
export async function listar() {
  return await Sucursal.find();
}

// Buscar sucursal por ID
export async function obtenerPorId(id) {
  const sucursal = await Sucursal.findById(id);

  if (!sucursal) {
    const error = new Error('Sucursal no encontrada');
    error.status = 404;
    throw error;
  }

  return sucursal;
}

// Actualizar datos
export async function actualizar(id, data, userId) {
  const sucursal = await Sucursal.findByIdAndUpdate(
    id,
    { $set: { ...data, updatedBy: userId } },
    { new: true, runValidators: true }
  );

  if (!sucursal) {
    const error = new Error('Sucursal no encontrada');
    error.status = 404;
    throw error;
  }

  return sucursal;
}

// Desactivar sucursal
export async function desactivar(id, userId) {
  const sucursal = await Sucursal.findById(id);

  if (!sucursal) {
    const error = new Error('Sucursal no encontrada');
    error.status = 404;
    throw error;
  }

  // Validar que no tenga pedidos activos (estado !== "entregado")
  const pedidoActivo = await Pedido.findOne({
    sucursalId: id,
    estado: { $ne: 'entregado' }
  });

  if (pedidoActivo) {
    const error = new Error('No se puede desactivar: la sucursal tiene pedidos activos');
    error.status = 409;
    throw error;
  }

  sucursal.activa = false;
  sucursal.deactivatedBy = userId;
  sucursal.deactivatedAt = new Date();
  await sucursal.save();

  return sucursal;
}

// Activar sucursal (revertir soft delete)
export async function activar(id, userId) {
  const sucursal = await Sucursal.findById(id);

  if (!sucursal) {
    const error = new Error('Sucursal no encontrada');
    error.status = 404;
    throw error;
  }

  sucursal.activa = true;
  sucursal.deactivatedBy = null;
  sucursal.deactivatedAt = null;
  sucursal.updatedBy = userId;
  await sucursal.save();

  return sucursal;
}

// Verificar si una sucursal esta activa
export async function esSucursalActiva(id) {
  const sucursal = await Sucursal.findById(id);
  return sucursal ? sucursal.activa : false;
}

// Trazabilidad completa: auditoría + pedidos asociados
export async function obtenerTrazabilidad(id) {
  const sucursal = await Sucursal.findById(id)
    .populate('createdBy', 'nombre email')
    .populate('updatedBy', 'nombre email')
    .populate('deactivatedBy', 'nombre email');

  if (!sucursal) {
    const error = new Error('Sucursal no encontrada');
    error.status = 404;
    throw error;
  }

  const [totalPedidos, pedidosActivos, ultimosPedidos] = await Promise.all([
    Pedido.countDocuments({ sucursalId: id }),
    Pedido.countDocuments({ sucursalId: id, estado: { $ne: 'entregado' } }),
    Pedido.find({ sucursalId: id })
      .sort({ fechaPedido: -1 })
      .limit(5)
      .select('estado fechaPedido observaciones')
      .lean()
  ]);

  return {
    ...sucursal.toJSON(),
    pedidos: {
      total: totalPedidos,
      activos: pedidosActivos,
      ultimos: ultimosPedidos
    }
  };
}
