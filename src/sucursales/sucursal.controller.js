const service = require('./sucursal.service');

function crear(req, res) {
  try {
    const data = service.crear(req.body);
    res.status(201).json(data);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
}

function listar(req, res) {
  try {
    const data = service.listar();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

function obtenerPorId(req, res) {
  try {
    const data = service.obtenerPorId(req.params.id);
    res.status(200).json(data);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
}

function actualizar(req, res) {
  try {
    const data = service.actualizar(req.params.id, req.body);
    res.status(200).json(data);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
}

function desactivar(req, res) {
  try {
    const data = service.desactivar(req.params.id);
    res.status(200).json(data);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
}

module.exports = {
  crear,
  listar,
  obtenerPorId,
  actualizar,
  desactivar
};
