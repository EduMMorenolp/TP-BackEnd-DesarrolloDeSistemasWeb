import { Router } from 'express';
import * as usuarioController from './usuario.controller.js';
import { verifyToken, checkRole } from '../../shared/middlewares/auth.middleware.js';

const router = Router();

router.get('/', checkRole(['ADMIN']), usuarioController.getUsuarios);
router.get('/:id', checkRole(['ADMIN']), usuarioController.getUsuarioById);
router.put('/:id', checkRole(['ADMIN']), usuarioController.updateUsuario);
router.post('/', verifyToken, checkRole(['ADMIN']), usuarioController.createUsuario); 
router.delete('/:id', checkRole(['ADMIN']), usuarioController.deleteUsuario);


export default router;
