/* const pedidoModel = require('./pedido.model');
// Aquí importarás las funciones de tus compañeros cuando las tengan:
// const { esSucursalActiva } = require('../sucursales/sucursal.service');
// const { obtenerProductosPorIds } = require('../productos/producto.service');

const crearNuevoPedido = (datos) => {
    const { idSucursal, productos } = datos;

    // 1. Validar datos obligatorios
    if (!idSucursal || !productos || productos.length === 0) {
        throw new Error("Datos incompletos: idSucursal y productos son requeridos.");
    }

    // 2. Simulación de validación entre módulos (lo que pide el TP)
    // if (!esSucursalActiva(idSucursal)) {
    //     throw new Error("La sucursal no está activa o no existe.");
    // }

    // 3. Crear el pedido usando el modelo
    return pedidoModel.createPedido({ idSucursal, productos });
};

const actualizarEstadoPedido = (id, nuevoEstado) => {
    const estadosPermitidos = ['pendiente', 'en_produccion', 'despachado', 'entregado'];
    
    if (!estadosPermitidos.includes(nuevoEstado)) {
        throw new Error("Estado no válido.");
    }

    const pedidoActualizado = pedidoModel.updatePedidoInDb(id, { estado: nuevoEstado });
    if (!pedidoActualizado) {
        throw new Error("Pedido no encontrado.");
    }

    return pedidoActualizado;
};

module.exports = {
    crearNuevoPedido,
    actualizarEstadoPedido,
    obtenerTodos: pedidoModel.getAll,
    obtenerPorId: pedidoModel.getById
}; */

const pedidoModel = require('./pedido.model');

// --- SIMULACIÓN DE OTROS MÓDULOS (Mocks) ---
const esSucursalActiva = (id) => {
    const sucursalesExistentes = [1, 2, 3]; // IDs de prueba
    return sucursalesExistentes.includes(parseInt(id));
};

const obtenerProductosPorIds = (productosSolicitados) => {
    // Simulamos que el producto 10 y 20 existen
    const dbProductos = [10, 20, 30];
    return productosSolicitados.every(p => dbProductos.includes(p.idProducto));
};
// ------------------------------------------

const crearNuevoPedido = (datos) => {
    const { sucursalId, productos } = datos;

    // 1. Validar sucursal activa (Requisito Dev 4)
    if (!esSucursalActiva(sucursalId)) {
        const error = new Error("La sucursal no existe o no está activa.");
        error.status = 400; // Según brief: lanzar error 400
        throw error;
    }

    // 2. Validar productos (Requisito Dev 4)
    if (!obtenerProductosPorIds(productos)) {
        const error = new Error("Uno o más productos no son válidos.");
        error.status = 400;
        throw error;
    }

    // 3. Crear pedido
    return pedidoModel.createPedido({ sucursalId, productos });
};

// ... (mantener funciones de listar, obtenerPorId, etc.)

module.exports = { crearNuevoPedido };