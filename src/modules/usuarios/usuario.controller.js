import * as usuarioService from './usuario.service.js';

export const getUsuarios = async (req, res, next) => {
  try {
    const usuarios = await usuarioService.getUsuarios();
    res.status(200).json(usuarios);
  } catch (error) {
    next(error);
  }
};

export const getUsuarioById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const usuario = await usuarioService.getUsuarioById(id);
    
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    res.status(200).json(usuario);
  } catch (error) {
    next(error);
  }
};

export const createUsuario = async (req, res, next) => {
  try {
    const nuevoUsuario = await usuarioService.createUsuario(req.body);
    res.status(201).json(nuevoUsuario);
  } catch (error) {
    // Manejar error de email duplicado de Mongoose
    if (error.code === 11000) {
      return res.status(400).json({ message: 'El email ya está registrado' });
    }
    next(error);
  }
};

export const updateUsuario = async (req, res, next) => {
  try {
    const { id } = req.params;
    const usuarioActualizado = await usuarioService.updateUsuario(id, req.body);
    
    if (!usuarioActualizado) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    res.status(200).json(usuarioActualizado);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'El email ya está registrado' });
    }
    next(error);
  }
};

export const deleteUsuario = async (req, res, next) => {
  try {
    const { id } = req.params;
    const usuarioBorrado = await usuarioService.deleteUsuario(id);
    
    if (!usuarioBorrado) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    res.status(200).json({ message: 'Usuario desactivado correctamente' });
  } catch (error) {
    next(error);
  }
};
