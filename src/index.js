const express = require('express');

// Importar routers de cada módulo
const sucursalRoutes = require('./sucursales/sucursal.routes');
const productoRoutes = require('./productos/producto.routes');
const pedidoRoutes = require('./pedidos/pedido.routes');

// Importar middleware global de errores
const errorHandler = require('./shared/errorHandler');

const app = express();
const PORT = 3000;


// Configurar el motor de plantillas (Pug)
app.set('view engine', 'pug');
app.set('views', './src/view');

// Middleware para parsear JSON
app.use(express.json());

// Registrar los 3 routers bajo /api
app.use('/api/sucursales', sucursalRoutes);
app.use('/api/productos', productoRoutes);
app.use('/api/pedidos', pedidoRoutes);

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

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor La Espiga de Oro corriendo en http://localhost:${PORT}`);
});

