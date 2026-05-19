import jwt from 'jsonwebtoken';
import Usuario from '../../usuarios/usuario.model.js';

/**
 * Middleware para verificar que el token JWT sea válido
 */
export const verifyToken = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Obtener el token del header (formato: "Bearer <token>")
      token = req.headers.authorization.split(' ')[1];

      // Decodificar el token
      const secret = process.env.JWT_SECRET || 'fallback_secret_no_usar_en_produccion';
      const decoded = jwt.verify(token, secret);

      // Buscar el usuario en la BD (sin el password) y añadirlo a la request
      const usuario = await Usuario.findById(decoded.id).select('-password');

      if (!usuario) {
        return res.status(401).json({ message: 'El usuario del token ya no existe' });
      }

      if (!usuario.activo) {
        return res.status(401).json({ message: 'Usuario desactivado' });
      }

      req.user = usuario;
      next();
    } catch (error) {
      return res.status(401).json({ message: 'No autorizado, token falló' });
    }
  } else {
    return res.status(401).json({ message: 'No autorizado, no se proveyó token' });
  }
};

/**
 * Middleware para verificar si el usuario tiene uno de los roles permitidos
 * @param {string[]} roles Permitidos (ej: ['ADMIN', 'PLANTA'])
 */
export const checkRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'No autenticado' });
    }

    if (!roles.includes(req.user.rol)) {
      return res.status(403).json({ 
        message: `Acceso denegado. Rol necesario: ${roles.join(' o ')}` 
      });
    }

    next();
  };
};
