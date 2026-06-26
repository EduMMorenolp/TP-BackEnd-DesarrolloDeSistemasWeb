import express from 'express';
import { obtenerDashboard } from './dashboard.controller.js';

const router = express.Router();

router.get('/', obtenerDashboard);

export default router;