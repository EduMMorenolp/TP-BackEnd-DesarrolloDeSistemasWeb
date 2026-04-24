const pedidoService = require('./pedido.service');

const listar = (req, res, next) => {
    try {
        const pedidos = pedidoService.listar();
        res.status(200).json(pedidos);
    } catch (error) {
        next(error);
    }
};

const obtenerPorId = (req, res, next) => {
    try {
        const pedido = pedidoService.obtenerPorId(req.params.id);
        res.status(200).json(pedido);
    } catch (error) {
        next(error);
    }
};

const crear = (req, res, next) => {
    try {
        const nuevoPedido = pedidoService.crear(req.body);
        res.status(201).json(nuevoPedido);
    } catch (error) {
        next(error);
    }
};

const cambiarEstado = (req, res, next) => {
    try {
        const pedidoActualizado = pedidoService.cambiarEstado(req.params.id, req.body.estado);
        res.status(200).json(pedidoActualizado);
    } catch (error) {
        next(error);
    }
};

const cancelar = (req, res, next) => {
    try {
        const resultado = pedidoService.cancelar(req.params.id);
        res.status(200).json(resultado);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    listar,
    obtenerPorId,
    crear,
    cambiarEstado,
    cancelar
};