import * as service from './sucursal.service.js';

export async function crear(req, res, next) {
  try {
    const data = await service.crear(req.body);
    res.status(201).json(data);
  } catch (error) {
    next(error);
  }
}

export async function listar(req, res, next) {
  try {
    const data = await service.listar();
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
}

export async function obtenerPorId(req, res, next) {
  try {
    const data = await service.obtenerPorId(req.params.id);
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
}

export async function actualizar(req, res, next) {
  try {
    const data = await service.actualizar(req.params.id, req.body);
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
}

export async function desactivar(req, res, next) {
  try {
    const data = await service.desactivar(req.params.id);
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
}

export async function activar(req, res, next) {
  try {
    const data = await service.activar(req.params.id);
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
}
