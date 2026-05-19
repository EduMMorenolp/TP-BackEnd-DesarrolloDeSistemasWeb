import { Router } from 'express';
import * as usuarioController from './usuario.controller.js';
import { verifyToken, checkRole } from '../shared/middlewares/auth.middleware.js';

const router = Router();

// Todas las rutas de usuarios requieren estar autenticado
// Y temporalmente dejaremos POST sin proteger para poder crear el primer usuario, 
// o bien podrías crear un endpoint de "seed".
// Aquí protegeremos GET, PUT y DELETE para que solo ADMIN pueda gestionar usuarios.

router.get('/', verifyToken, checkRole(['ADMIN']), usuarioController.getUsuarios);
router.get('/:id', verifyToken, checkRole(['ADMIN']), usuarioController.getUsuarioById);

// NOTA: Para producción, este POST debería estar protegido: router.post('/', verifyToken, checkRole(['ADMIN']), ...)
// Lo dejamos abierto temporalmente para crear el primer ADMIN, o usar la ruta de seed en auth.
router.post('/', usuarioController.createUsuario); 

router.put('/:id', verifyToken, checkRole(['ADMIN']), usuarioController.updateUsuario);
router.delete('/:id', verifyToken, checkRole(['ADMIN']), usuarioController.deleteUsuario);

export default router;
