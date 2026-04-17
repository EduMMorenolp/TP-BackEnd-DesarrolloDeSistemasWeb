// Almacenamiento en memoria (Database temporal)
const pedidos = [];
let nextId = 1;

/**
 * Función para crear un pedido con los campos base requeridos.
 * Según el brief: id, estado (pendiente), fechaPedido y fechaActualizacion.
 */
const createPedido = (data) => {
    const nuevoPedido = {
        id: nextId++,
        idSucursal: data.idSucursal,
        productos: data.productos, // Array de { idProducto, cantidad }
        estado: 'pendiente', // Estado inicial por defecto
        fechaPedido: new Date().toISOString(),
        fechaActualizacion: new Date().toISOString()
    };
    
    pedidos.push(nuevoPedido);
    return nuevoPedido;
};

// Funciones auxiliares para el CRUD
const getAll = () => pedidos;

const getById = (id) => pedidos.find(p => p.id === parseInt(id));

const updatePedidoInDb = (id, updatedData) => {
    const index = pedidos.findIndex(p => p.id === parseInt(id));
    if (index !== -1) {
        pedidos[index] = { 
            ...pedidos[index], 
            ...updatedData, 
            fechaActualizacion: new Date().toISOString() 
        };
        return pedidos[index];
    }
    return null;
};

module.exports = {
    createPedido,
    getAll,
    getById,
    updatePedidoInDb
};