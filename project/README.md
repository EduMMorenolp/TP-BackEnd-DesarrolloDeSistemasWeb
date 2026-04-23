# La Espiga de Oro - Sistema de Gestión de Pedidos

Sistema backend modular en Node.js + Express para la gestión de pedidos de la panificadora "La Espiga de Oro S.R.L.".

## 📋 Contexto del Proyecto

La Espiga de Oro recibe pedidos de 5 sucursales propias y 10 franquicias por WhatsApp. Este sistema resuelve la desconexión digital permitiendo registrar y gestionar pedidos, integrar información entre planta, sucursales y franquicias, y generar datos confiables para planificación productiva.

## 🏗️ Arquitectura

Arquitectura feature-based con separación clara de responsabilidades:
- **Model**: Estructura de datos y creación de objetos
- **Service**: Lógica de negocio y validaciones
- **Controller**: Manejo de req/res HTTP
- **Routes**: Definición de endpoints

## 📦 Instalación

```bash
# Instalar dependencias
npm install

# Ejecutar en modo desarrollo (con nodemon)
npm run dev

# Ejecutar en modo producción
npm start
```

## 📁 Estructura del Proyecto

```
espiga-de-oro/
├── src/
│   ├── sucursales/          # CRUD de sucursales
│   │   ├── sucursal.model.js
│   │   ├── sucursal.service.js
│   │   ├── sucursal.controller.js
│   │   └── sucursal.routes.js
│   ├── productos/           # CRUD de productos
│   │   ├── producto.model.js
│   │   ├── producto.service.js
│   │   ├── producto.controller.js
│   │   └── producto.routes.js
│   ├── pedidos/             # CRUD de pedidos con populate
│   │   ├── pedido.model.js
│   │   ├── pedido.service.js
│   │   ├── pedido.controller.js
│   │   └── pedido.routes.js
│   ├── shared/              # Recursos compartidos
│   │   ├── store.js         # Arrays en memoria
│   │   └── errorHandler.js  # Middleware global de errores
│   └── index.js             # Entry point del servidor
├── package.json
├── README.md
└── postman_collection.json
```

## 🔗 Endpoints de la API

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

## 🔄 Estados de Pedidos

Los pedidos siguen una máquina de estados estricta:
- `pendiente` → `en_produccion` → `despachado` → `entregado`
- No se permiten transiciones inversas ni saltos
- Solo se puede cancelar pedidos en estado `pendiente`

## 📝 Ejemplos de Uso

### Flujo completo de ejemplo:

1. **Crear sucursal**
```bash
POST /api/sucursales
{
  "nombre": "Sucursal La Plata Centro",
  "tipo": "sucursal",
  "direccion": "Calle 7 Nro 850"
}
```

2. **Crear producto**
```bash
POST /api/productos
{
  "nombre": "Medialunas de manteca x12",
  "descripcion": "Caja de 12 medialunas de manteca artesanales",
  "precio": 2400,
  "categoria": "facturas"
}
```

3. **Crear pedido**
```bash
POST /api/pedidos
{
  "sucursalId": "a3f1c8d2-...",
  "productos": [
    {
      "productoId": "b7e2d1a9-...",
      "cantidad": 3
    }
  ],
  "observaciones": "Entregar antes de las 8am"
}
```

4. **Cambiar estado del pedido**
```bash
PATCH /api/pedidos/c9d3e5f7-.../estado
{
  "estado": "en_produccion"
}
```

## 🧪 Validaciones Implementadas

- **Sucursales**: Nombre, tipo ("sucursal"|"franquicia") y dirección obligatorios
- **Productos**: Nombre, precio (>0) y categoría obligatorios
- **Pedidos**: Sucursal activa, productos existentes, estructura correcta
- **Estados**: Transiciones válidas según máquina de estados
- **Dependencias**: No eliminar sucursales/productos con pedidos activos

## 📊 Respuestas JSON

Todas las respuestas siguen el formato JSON exclusivamente:

**Éxito (201 Created):**
```json
{
  "id": "a3f1c8d2-...",
  "nombre": "Sucursal La Plata Centro",
  "tipo": "sucursal",
  "direccion": "Calle 7 Nro 850",
  "activa": true,
  "fechaCreacion": "2025-04-13T10:00:00.000Z"
}
```

**Error (400 Bad Request):**
```json
{
  "error": "El campo 'precio' debe ser un número mayor a 0"
}
```

## 🛠️ Tecnologías Utilizadas

- **Node.js**: Runtime de JavaScript
- **Express.js**: Framework web
- **UUID**: Generación de IDs únicos
- **Pug**: Motor de plantillas (opcional para vistas)

## 🚀 Despliegue

El servidor inicia en `http://localhost:3000` por defecto.

Para importar la colección de Postman, utiliza el archivo `postman_collection.json` incluido en el proyecto.

## 👥 Equipo de Desarrollo

- **Dev 1**: Eduardo - Fundaciones & Shared
- **Dev 2**: Paula Berni - Feature: Sucursales
- **Dev 3**: Melissa Galeano - Feature: Productos
- **Dev 4**: Leandro Parys - Feature: Pedidos
- **Dev 5**: Marcelo - Integración & Validación Final
