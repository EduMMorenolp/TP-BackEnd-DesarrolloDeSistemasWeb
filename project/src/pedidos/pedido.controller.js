const pedidoService = require('./pedido.service');

const crear = (req, res) => {
    try {
        const nuevoPedido = pedidoService.crearNuevoPedido(req.body);
        res.status(201).json(nuevoPedido);
    } catch (error) {
        res.status(error.status || 500).json({ mensaje: error.message });
    }
};

module.exports = { crear };