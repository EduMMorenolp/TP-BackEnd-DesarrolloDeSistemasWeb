import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

import { connectDB } from './config/db.js';
import sucursalRoutes from './sucursales/sucursal.routes.js';
import productoRoutes from './productos/producto.routes.js';
import pedidoRoutes from './pedidos/pedido.routes.js';
import usuarioRoutes from './usuarios/usuario.routes.js';
import authRoutes from './auth/auth.routes.js';
import errorHandler from './shared/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Configurar el motor de plantillas (Pug)
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'view'));

// Middleware para parsear JSON
app.use(express.json());

// Registrar los 3 routers bajo /api
app.use('/api/sucursales', sucursalRoutes);
app.use('/api/productos', productoRoutes);
app.use('/api/pedidos', pedidoRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/auth', authRoutes);

// Endpoint de health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

// Rutas de vistas (opcional, para el frontend)
app.get('/', function (req, res) {
    res.render('index');
});

app.get('/index', function (req, res) {
    res.render('index');
});

app.get('/pedidos', function (req, res) {
    res.render('pedidos');
});

app.get('/sucursales', function (req, res) {
    res.render('sucursales');
});

app.get('/productos', function (req, res) {
    res.render('productos');
});

// Middleware global de manejo de errores (siempre al final)
app.use(errorHandler);

// Conectar a MongoDB y luego iniciar el servidor
async function start() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Servidor La Espiga de Oro corriendo en http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error('Error al iniciar el servidor:', err.message);
  process.exit(1);
});
