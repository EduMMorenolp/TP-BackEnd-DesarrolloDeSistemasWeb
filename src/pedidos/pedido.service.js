import * as pedidoModel from './pedido.model.js';
import { store, saveStore } from '../shared/store.js';
import { esSucursalActiva } from '../sucursales/sucursal.service.js';
import { obtenerProductosPorIds } from '../productos/producto.service.js';
import Sucursal from '../sucursales/sucursal.model.js';

export const crear = async (datos) => {
    const { sucursalId, productos, observaciones } = datos;

    if (!sucursalId || !productos || !Array.isArray(productos) || productos.length === 0) {
        const error = new Error("Datos incompletos: sucursalId y productos son requeridos.");
        error.status = 400;
        throw error;
    }

    const activa = await esSucursalActiva(sucursalId);
    if (!activa) {
        const error = new Error(`La sucursal con id '${sucursalId}' no esta activa`);
        error.status = 400;
        throw error;
    }

    const productoIds = productos.map(p => p.productoId);
    const productosEncontrados = obtenerProductosPorIds(productoIds);
    if (productosEncontrados.length !== productoIds.length) {
        const error = new Error("Uno o mas productos no existen");
        error.status = 400;
        throw error;
    }

    return pedidoModel.createPedido({ sucursalId, productos, observaciones });
};

export const listar = async () => {
    const pedidos = [];
    for (const pedido of store.pedidos) {
        pedidos.push(await populatePedido(pedido));
    }
    return pedidos;
};

export const obtenerPorId = async (id) => {
    const pedido = store.pedidos.find(p => p.id === id);
    if (!pedido) {
        const error = new Error(`Pedido con id '${id}' no encontrado`);
        error.status = 404;
        throw error;
    }
    return await populatePedido(pedido);
};

export const cambiarEstado = (id, nuevoEstado) => {
    const pedido = store.pedidos.find(p => p.id === id);
    if (!pedido) {
        const error = new Error(`Pedido con id '${id}' no encontrado`);
        error.status = 404;
        throw error;
    }

    const transicionesValidas = {
        pendiente: ['en_produccion'],
        en_produccion: ['despachado'],
        despachado: ['entregado']
    };

    if (!transicionesValidas[pedido.estado] || !transicionesValidas[pedido.estado].includes(nuevoEstado)) {
        const error = new Error(`Transicion invalida: no se puede pasar de '${pedido.estado}' a '${nuevoEstado}'`);
        error.status = 400;
        throw error;
    }

    return pedidoModel.updatePedidoInDb(id, { estado: nuevoEstado });
};

export const cancelar = (id) => {
    const pedido = store.pedidos.find(p => p.id === id);
    if (!pedido) {
        const error = new Error(`Pedido con id '${id}' no encontrado`);
        error.status = 404;
        throw error;
    }

    if (pedido.estado !== 'pendiente') {
        const error = new Error("No se puede cancelar: el pedido no esta en estado 'pendiente'");
        error.status = 409;
        throw error;
    }

    const index = store.pedidos.indexOf(pedido);
    store.pedidos.splice(index, 1);
    saveStore();
    return { message: 'Pedido cancelado exitosamente' };
};

const populatePedido = async (pedido) => {
    const sucursal = await Sucursal.findById(pedido.sucursalId);
    const productosPopulados = pedido.productos.map(item => {
        const producto = store.productos.find(p => p.id === item.productoId);
        return {
            productoId: item.productoId,
            nombre: producto ? producto.nombre : null,
            precio: producto ? producto.precio : null,
            cantidad: item.cantidad
        };
    });

    return {
        id: pedido.id,
        sucursal: sucursal ? { id: sucursal._id.toString(), nombre: sucursal.nombre, tipo: sucursal.tipo } : null,
        productos: productosPopulados,
        estado: pedido.estado,
        observaciones: pedido.observaciones,
        fechaPedido: pedido.fechaPedido,
        fechaActualizacion: pedido.fechaActualizacion
    };
};
