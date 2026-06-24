import * as pedidoService from './pedido.service.js';

export const listar = async (req, res, next) => {
    try {
        const pedidos = await pedidoService.listar();
        res.status(200).json(pedidos);
    } catch (error) {
        next(error);
    }
};

export const obtenerPorId = async (req, res, next) => {
    try {
        const pedido = await pedidoService.obtenerPorId(req.params.id);
        res.status(200).json(pedido);
    } catch (error) {
        next(error);
    }
};

export const crear = async (req, res, next) => {
    try {
        // Pasamos el ID del usuario que está creando el pedido para la trazabilidad.
        // El objeto `req.user` es añadido por el middleware `verifyToken`.
        const usuarioId = req.user.id;
        const datosPedido = req.body;
        const nuevoPedido = await pedidoService.crear(datosPedido, usuarioId);
        res.status(201).json(nuevoPedido);
    } catch (error) {
        next(error);
    }
};

export const cambiarEstado = async (req, res, next) => {
    try {
        const pedidoId = req.params.id;
        const nuevoEstado = req.body.estado;
        const usuarioId = req.user.id; // Usuario que realiza el cambio.
        const pedidoActualizado = await pedidoService.cambiarEstado(pedidoId, nuevoEstado, usuarioId);
        res.status(200).json(pedidoActualizado);
    } catch (error) {
        next(error);
    }
};

export const cancelar = async (req, res, next) => {
    try {
        const resultado = await pedidoService.cancelar(req.params.id);
        res.status(200).json(resultado);
    } catch (error) {
        next(error);
    }
};

export const obtenerTrazabilidad = async (req, res, next) => {
    try {
        const trazabilidad = await pedidoService.obtenerTrazabilidad(req.params.id);
        res.status(200).json(trazabilidad);
    } catch (error) {
        next(error);
    }
};
