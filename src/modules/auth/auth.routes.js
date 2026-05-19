import { Router } from 'express';
import * as authController from './auth.controller.js';
import { verifyToken } from '../../shared/middlewares/auth.middleware.js';

const router = Router();

// Endpoint para login
router.post('/login', authController.login);

// Endpoint para obtener mi perfil (requiere estar logueado)
router.get('/me', verifyToken, authController.getProfile);

export default router;
