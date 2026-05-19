import jwt from 'jsonwebtoken';
import { getUsuarioByEmail } from '../usuarios/usuario.service.js';

export const login = async (email, password) => {
  // 1. Verificar si el usuario existe
  const usuario = await getUsuarioByEmail(email);
  if (!usuario) {
    throw new Error('Credenciales inválidas'); // No revelar que el email no existe
  }

  // 2. Verificar si está activo
  if (!usuario.activo) {
    throw new Error('Usuario desactivado. Contacte al administrador');
  }

  // 3. Verificar contraseña
  const isMatch = await usuario.matchPassword(password);
  if (!isMatch) {
    throw new Error('Credenciales inválidas');
  }

  // 4. Generar Token JWT
  const payload = {
    id: usuario._id,
    rol: usuario.rol,
    sucursalId: usuario.sucursalId
  };

  const secret = process.env.JWT_SECRET || 'fallback_secret_no_usar_en_produccion';
  const expiresIn = process.env.JWT_EXPIRES_IN || '24h';

  const token = jwt.sign(payload, secret, { expiresIn });

  // 5. Retornar info de usuario y token
  return {
    usuario: {
      id: usuario._id,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol,
      sucursalId: usuario.sucursalId
    },
    token
  };
};
