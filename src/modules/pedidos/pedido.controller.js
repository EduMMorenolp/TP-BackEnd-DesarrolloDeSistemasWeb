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
        const nuevoPedido = await pedidoService.crear(req.body);
        res.status(201).json(nuevoPedido);
    } catch (error) {
        next(error);
    }
};

export const cambiarEstado = async (req, res, next) => {
    try {
        const pedidoActualizado = await pedidoService.cambiarEstado(req.params.id, req.body.estado);
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
