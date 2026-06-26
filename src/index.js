import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

import { connectDB } from './config/db.js';
import sucursalRoutes from './modules/sucursales/sucursal.routes.js';
import productoRoutes from './modules/productos/producto.routes.js';
import pedidoRoutes from './modules/pedidos/pedido.routes.js';
import usuarioRoutes from './modules/usuarios/usuario.routes.js';
import authRoutes from './modules/auth/auth.routes.js';
import dashboardRoutes from './modules/dashboard/dashboard.routes.js';
import errorHandler from './shared/errorHandler.js';
import { seedDatabase } from './config/seed.js';
import { verifyToken } from './shared/middlewares/auth.middleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Configurar el motor de plantillas (Pug)
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'view'));

// Middleware para parsear JSON
app.use(express.json());

// Servir archivos estáticos desde la carpeta public
app.use('/public', express.static(path.join(__dirname, 'public')));

// Registrar los 3 routers bajo /api
app.use('/api/auth', authRoutes);
app.use('/api/sucursales', verifyToken,  sucursalRoutes);
app.use('/api/productos',verifyToken, productoRoutes);
app.use('/api/pedidos', verifyToken, pedidoRoutes);
app.use('/api/usuarios', verifyToken, usuarioRoutes);
app.use('/api/dashboard', verifyToken, dashboardRoutes);

// Endpoint de health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

// Rutas de vistas (opcional, para el frontend)
app.get('/', function (req, res) {
    res.redirect('/index'); 
});

app.get('/login', function (req, res) {
    res.render('login');    
});

app.get('/index', function (req, res) {
    res.render('index');
});

app.get('/dashboard', function (req, res) {
    res.render('dashboard');
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

app.get('/usuarios', function (req, res) {
    res.render('usuarios');
});


// Middleware global de manejo de errores (siempre al final)
app.use(errorHandler);

// Conectar a MongoDB y luego iniciar el servidor
async function start() {
  await connectDB();
  await seedDatabase();
  app.listen(PORT, () => {
    console.log(`Servidor La Espiga de Oro corriendo en http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error('Error al iniciar el servidor:', err.message);
  process.exit(1);
});

