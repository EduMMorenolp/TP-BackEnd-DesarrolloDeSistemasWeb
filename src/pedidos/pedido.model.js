const { v4: uuidv4 } = require('uuid');
const { store, saveStore } = require('../shared/store');

/**
 * Función para crear un pedido con los campos base requeridos.
 * Según el brief: id, sucursalId, productos, observaciones, estado, fechaPedido y fechaActualizacion.
 */
const createPedido = (data) => {
    const nuevoPedido = {
        id: uuidv4(),
        sucursalId: data.sucursalId,
        productos: data.productos,
        observaciones: data.observaciones || '',
        estado: 'pendiente',
        fechaPedido: new Date().toISOString(),
        fechaActualizacion: new Date().toISOString()
    };

    store.pedidos.push(nuevoPedido);
    saveStore();
    return nuevoPedido;
};

const getAll = () => store.pedidos;

const getById = (id) => store.pedidos.find(p => p.id === id);

const updatePedidoInDb = (id, updatedData) => {
    const index = store.pedidos.findIndex(p => p.id === id);
    if (index !== -1) {
        store.pedidos[index] = {
            ...store.pedidos[index],
            ...updatedData,
            fechaActualizacion: new Date().toISOString()
        };
        saveStore();
        return store.pedidos[index];
    }
    return null;
};

module.exports = {
    createPedido,
    getAll,
    getById,
    updatePedidoInDb
};