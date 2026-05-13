import Sucursal from './sucursal.model.js';
import { store } from '../shared/store.js';

// Crear sucursal
export async function crear(data) {
  const sucursal = new Sucursal(data);
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
export async function actualizar(id, data) {
  const sucursal = await Sucursal.findByIdAndUpdate(
    id,
    { $set: data },
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
export async function desactivar(id) {
  const sucursal = await Sucursal.findById(id);

  if (!sucursal) {
    const error = new Error('Sucursal no encontrada');
    error.status = 404;
    throw error;
  }

  // Validar que no tenga pedidos activos (estado !== "entregado")
  // Como pedidos todavia usan store.js, consultamos ahi
  const tienePedidosActivos = store.pedidos.some(pedido =>
    pedido.sucursalId === id && pedido.estado !== "entregado"
  );

  if (tienePedidosActivos) {
    const error = new Error('No se puede desactivar: la sucursal tiene pedidos activos');
    error.status = 409;
    throw error;
  }

  sucursal.activa = false;
  await sucursal.save();

  return sucursal;
}

// Activar sucursal
export async function activar(id) {
  const sucursal = await Sucursal.findById(id);

  if (!sucursal) {
    const error = new Error('Sucursal no encontrada');
    error.status = 404;
    throw error;
  }

  sucursal.activa = true;
  await sucursal.save();

  return sucursal;
}

// Verificar si una sucursal esta activa
export async function esSucursalActiva(id) {
  const sucursal = await Sucursal.findById(id);
  return sucursal ? sucursal.activa : false;
}
