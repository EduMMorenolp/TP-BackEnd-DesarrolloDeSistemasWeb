import Pedido from './pedido.model.js';
import { esSucursalActiva } from '../sucursales/sucursal.service.js';
import { obtenerProductosPorIds } from '../productos/producto.service.js';

export const crear = async (datos) => {
    const { sucursalId, productos, observaciones } = datos;

    // Las validaciones de presencia para sucursalId y productos ahora las maneja el Schema de Mongoose.
    // 1. Validar que la sucursal exista y esté activa
    const activa = await esSucursalActiva(sucursalId);
    if (!activa) {
        const error = new Error(`La sucursal con id '${sucursalId}' no esta activa`);
        error.status = 400;
        throw error;
    }
    
    // 2. Validar que los productos existan (todavía contra store.js)
    const productoIds = productos.map(p => p.productoId);
    const productosEncontrados = obtenerProductosPorIds(productoIds);
    if (productosEncontrados.length !== productoIds.length) {
        const error = new Error("Uno o mas productos no existen");
        error.status = 400;
        throw error;
    }
    
    // 3. Desnormalizar datos de productos para guardar en el pedido
    // Esto crea una "foto" del nombre y precio al momento de la compra.
    const productosParaGuardar = productos.map(item => {
        const productoCompleto = productosEncontrados.find(p => p.id === item.productoId);
        return {
            productoId: item.productoId,
            cantidad: item.cantidad,
            nombre: productoCompleto.nombre,
            precio: productoCompleto.precio,
        };
    });
    
    // 4. Crear y guardar el pedido en MongoDB
    const nuevoPedido = new Pedido({
        sucursalId,
        productos: productosParaGuardar,
        observaciones
    });
    
    await nuevoPedido.save();
    return nuevoPedido;
};

export const listar = async () => {
    // Usamos .populate() para traer los datos de la sucursal.
    // El segundo argumento de populate selecciona los campos a incluir.
    // Los datos de productos ya están desnormalizados en el documento del pedido.
    const pedidos = await Pedido.find()
        .populate('sucursalId', 'nombre tipo');
    
    // Transformamos la respuesta para mantener compatibilidad con el frontend,
    // que espera un campo `sucursal` en lugar de `sucursalId`.
    return pedidos.map(p => {
        const pedidoObj = p.toObject({ virtuals: true });
        pedidoObj.sucursal = pedidoObj.sucursalId;
        delete pedidoObj.sucursalId;
        return pedidoObj;
    });
};

export const obtenerPorId = async (id) => {
    const pedido = await Pedido.findById(id)
        .populate('sucursalId', 'nombre tipo');
        
    if (!pedido) {
        const error = new Error(`Pedido con id '${id}' no encontrado`);
        error.status = 404;
        throw error;
    }
    
    // Transformamos igual que en `listar` para mantener la compatibilidad.
    const pedidoObj = pedido.toObject({ virtuals: true });
    pedidoObj.sucursal = pedidoObj.sucursalId;
    delete pedidoObj.sucursalId;
    
    return pedidoObj;
};

export const cambiarEstado = async (id, nuevoEstado) => {
    const pedido = await Pedido.findById(id);
    if (!pedido) {
        const error = new Error(`Pedido con id '${id}' no encontrado`);
        error.status = 404;
        throw error;
    }
    
    // Se mantiene la lógica de la máquina de estados intacta.
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
    
    pedido.estado = nuevoEstado;
    await pedido.save();
    return pedido;
};

export const cancelar = async (id) => {
    const pedido = await Pedido.findById(id);
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
    
    // Usamos el método de Mongoose para eliminar el documento.
    await Pedido.findByIdAndDelete(id);
    return { message: 'Pedido cancelado exitosamente' };
};
