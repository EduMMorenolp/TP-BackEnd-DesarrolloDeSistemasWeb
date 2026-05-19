import * as authService from './auth.service.js';

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Por favor provea email y password' });
    }

    const authData = await authService.login(email, password);
    res.status(200).json(authData);
  } catch (error) {
    if (error.message === 'Credenciales inválidas' || error.message.includes('desactivado')) {
      return res.status(401).json({ message: error.message });
    }
    next(error);
  }
};

export const getProfile = async (req, res, next) => {
  try {
    // req.user viene del middleware verifyToken
    res.status(200).json({ usuario: req.user });
  } catch (error) {
    next(error);
  }
};
