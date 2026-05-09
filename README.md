# La Espiga de Oro - Sistema de Gestión de Pedidos

Sistema backend modular en Node.js + Express para la gestión de pedidos de la panificadora "La Espiga de Oro S.R.L.".

## Contexto del Proyecto

La Espiga de Oro recibe pedidos de 5 sucursales propias y 10 franquicias por WhatsApp. Este sistema resuelve la desconexión digital permitiendo registrar y gestionar pedidos, integrar información entre planta, sucursales y franquicias, y generar datos confiables para planificación productiva.

## Arquitectura

Arquitectura feature-based con separación clara de responsabilidades:
- **Model**: Estructura de datos y creación de objetos
- **Service**: Lógica de negocio y validaciones
- **Controller**: Manejo de req/res HTTP
- **Routes**: Definición de endpoints

## Requisitos

- **Node.js** 18+
- **MongoDB** 7+ (local o via Docker)

```bash
# Con Docker (recomendado)
docker run -d --name mongodb -p 27017:27017 mongo:7
```

## Instalación

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno (copiar .env de ejemplo)
# MONGODB_URI=mongodb://localhost:27017/laespiga
# PORT=3000

# Ejecutar en modo desarrollo
npm run dev

# Ejecutar en modo producción
npm start
```

## Estructura del Proyecto

```
espiga-de-oro/
├── src/
│   ├── config/
│   │   └── db.js              # Conexion a MongoDB con Mongoose
│   ├── sucursales/            # CRUD de sucursales (MongoDB)
│   │   ├── sucursal.model.js  # Schema de Mongoose
│   │   ├── sucursal.service.js
│   │   ├── sucursal.controller.js
│   │   └── sucursal.routes.js
│   ├── productos/             # CRUD de productos
│   │   ├── producto.model.js
│   │   ├── producto.service.js
│   │   ├── producto.controller.js
│   │   └── producto.routes.js
│   ├── pedidos/               # CRUD de pedidos con populate
│   │   ├── pedido.model.js
│   │   ├── pedido.service.js
│   │   ├── pedido.controller.js
│   │   └── pedido.routes.js
│   ├── shared/                # Recursos compartidos
│   │   ├── store.js           # Persistencia en JSON (prod/pedidos)
│   │   └── errorHandler.js    # Middleware global de errores
│   ├── view/                  # Vistas Pug
│   └── index.js               # Entry point
├── .env                       # Variables de entorno
├── package.json
├── README.md
└── postman_collection.json
```

## Endpoints de la API

### Sucursales (`/api/sucursales`)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/sucursales` | Lista todas las sucursales |
| GET | `/api/sucursales/:id` | Obtiene sucursal por ID |
| POST | `/api/sucursales` | Crea nueva sucursal |
| PUT | `/api/sucursales/:id` | Actualiza sucursal |
| DELETE | `/api/sucursales/:id` | Desactiva sucursal |

### Productos (`/api/productos`)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/productos` | Lista todos los productos |
| GET | `/api/productos/:id` | Obtiene producto por ID |
| POST | `/api/productos` | Crea nuevo producto |
| PUT | `/api/productos/:id` | Actualiza producto |
| DELETE | `/api/productos/:id` | Elimina producto |

### Pedidos (`/api/pedidos`)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/pedidos` | Lista todos los pedidos (con populate) |
| GET | `/api/pedidos/:id` | Obtiene pedido por ID (con populate) |
| POST | `/api/pedidos` | Crea nuevo pedido |
| PATCH | `/api/pedidos/:id/estado` | Cambia estado del pedido |
| DELETE | `/api/pedidos/:id` | Cancela pedido |

### Health Check

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/health` | Verifica estado del servidor |

## Tecnologías Utilizadas

- **Node.js**: Runtime de JavaScript
- **Express.js 5**: Framework web
- **MongoDB**: Base de datos NoSQL
- **Mongoose**: ODM para MongoDB
- **dotenv**: Variables de entorno
- **UUID**: Generación de IDs únicos (en migración a ObjectId de MongoDB)
- **Pug**: Motor de plantillas para vistas

## Despliegue

El servidor inicia en `http://localhost:3000` por defecto.

Para importar la colección de Postman, utiliza el archivo `postman_collection.json` incluido en el proyecto.

## Equipo de Desarrollo

- Eduardo Moreno - Integración Plantillas Pug y Validación Final
- Paula Beni - Feature: Sucursales
- Melissa Galeano - Feature: Productos
- Leandro Paryszewski - Feature: Pedidos
- Marcelo Moreno - Fundaciones, Shared y Documentación
