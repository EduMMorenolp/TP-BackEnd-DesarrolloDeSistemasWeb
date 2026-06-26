# La Espiga de Oro - Sistema de Gestión de Pedidos

Sistema backend modular en Node.js + Express para la gestión de pedidos de la panificadora "La Espiga de Oro S.R.L.". Incluye autenticación JWT, control de permisos por rol, trazabilidad de sucursales/productos/pedidos y un dashboard con KPIs en tiempo real.

## Contexto del Proyecto

La Espiga de Oro recibe pedidos de 5 sucursales propias y 10 franquicias por WhatsApp. Este sistema resuelve la desconexión digital permitiendo registrar y gestionar pedidos, integrar información entre planta, sucursales y franquicias, y generar datos confiables para planificación productiva.

## Arquitectura

Arquitectura feature-based con separación clara de responsabilidades por módulo:

- **Model**: Estructura de datos, validaciones de schema y virtuals (Mongoose)
- **Service**: Lógica de negocio, validaciones y filtros por rol
- **Controller**: Manejo de req/res HTTP y delegación al service
- **Routes**: Definición de endpoints + middlewares de auth y permisos

Cada módulo es autónomo y se monta independientemente en `index.js` bajo `/api/<recurso>`.

## Roles y Permisos

El sistema maneja 4 roles con visibilidad escalonada:

| Rol | Sucursales | Productos | Pedidos | Usuarios | Dashboard |
|-----|-----------|-----------|---------|----------|-----------|
| **ADMIN** | Crear, editar, desactivar/reactivar TODAS | CRUD completo | Ver todos | CRUD completo | Datos globales |
| **PLANTA** | Crear, editar, desactivar/reactivar TODAS | CRUD completo | Ver todos | No accede | Datos globales |
| **FRANQUICIA** | Editar/desactivar solo la SUYA | Solo lectura | Ver los de su sucursal | No accede | Solo su sucursal |
| **SUCURSAL** | No accede (solo hace pedidos) | Solo lectura | Ver los de su sucursal | No accede | Solo su sucursal |

Los permisos se aplican con dos middlewares reutilizables:

- `permit(roles)` — pasa si el rol está en la lista (ADMIN siempre pasa)
- `permitOwnerOr(globalRoles, ownerRoles, model, param, field)` — globalRoles pasan directo; ownerRoles solo si son dueños del recurso

## Requisitos

- **Node.js** 18+
- **MongoDB** 7+ (local o via Docker)

```bash
# Opción 1: Con Docker (recomendado)
docker run -d --name mongodb -p 27017:27017 mongo:7
```

---

### Opción 2: Instalación directa en Windows

1. **Descargar MongoDB Community Server** desde:
   https://www.mongodb.com/try/download/community

2. **Elegir la versión**:
   - Package: `msi`
   - Version: `7.0.XX` (o la más reciente de la 7.x)
   - OS: `Windows x64`
   - Installer: `MSI`

3. **Ejecutar el instalador**:
   - Marcar "Complete" (instalación completa)
   - Desmarcar "Install MongoDB Compass" (opcional, es solo la GUI)
   - Marcar "Install MongoD as a Service" → "Run service as Network Service user"
   - La instalación por defecto va en `C:\Program Files\MongoDB\Server\7.0\bin`

4. **Verificar que MongoDB esté corriendo**:
   ```bash
   # En PowerShell (como Administrador)
   Start-Service MongoDB
    
   # O verificar estado
   Get-Service MongoDB
   ```

5. **Crear el directorio de datos** (si no se creó solo):
   ```bash
   mongod --dbpath "C:\data\db"
   ```

6. **Opcional: MongoDB Compass** (GUI para visualizar datos):
   https://www.mongodb.com/products/compass

---

### Opción 3: En Linux (WSL2 o Ubuntu)

```bash
# Instalar MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org

# Iniciar servicio
sudo systemctl start mongod
```

---

### Opción 4: En macOS

```bash
# Con Homebrew
brew tap mongodb/brew
brew install mongodb-community@7.0

# Iniciar como servicio
brew services start mongodb-community@7.0
```

---

### Verificar conexión

Independientemente del método elegido, el sistema se conectará a:
```
mongodb://localhost:27017/laespiga
```

Para verificar que MongoDB responde:
```bash
mongosh --eval "db.adminCommand('ping')"
```

## Instalación y Arranque

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Configurar variables de entorno:**
   ```bash
   cp .env.example .env
   ```
   Editar `.env` con los valores correctos:
   ```env
   MONGODB_URI=mongodb://localhost:27017/laespiga
   PORT=3000
   JWT_SECRET=tu_secreto_super_seguro_cambiar_en_produccion
   JWT_EXPIRES_IN=24h
   ```

3. **Arrancar el servidor (modo desarrollo):**
   ```bash
   npm run dev
   ```
   En el primer arranque, si la colección de usuarios está vacía, el **seeder automático** crea las sucursales y usuarios base (ver sección siguiente).

4. **Arrancar en modo producción:**
   ```bash
   npm start
   ```

Abrir `http://localhost:3000` en el navegador para acceder al login.

## Seeding de Datos y Credenciales de Login

El sistema incluye un **seeder** que pobla la base de datos con datos de prueba. Funciona de dos maneras:

### Automático (al arrancar el servidor)

Al ejecutar `npm run dev` o `npm start`, si la colección de usuarios está vacía, el seeder se dispara automáticamente y crea:

- 2 sucursales (`Sucursal Central` y `Franquicia Demo`)
- 4 usuarios (uno por rol) con contraseña `password123`
- 4 productos de prueba (`Pan de Campo`, `Factura con Crema`, `Mignon`, `Pepas de Membrillo`)

### Manual (standalone)

Si querés repoblar la base de datos sin arrancar el servidor:

```bash
# 1. Asegurate de que MongoDB esté corriendo
# 2. Ejecutar el seeder standalone
npm run seed
```

El script `npm run seed` ejecuta `node --env-file=.env src/config/seed.js`, que conecta a MongoDB, crea los datos base y se desconecta. Solo crea registros si las colecciones están vacías (idempotente).

### Credenciales de Login

> **Contraseña para todos los usuarios:** `password123`

| Usuario | Email | Rol | Acceso |
|---------|-------|-----|--------|
| Administrador General | `admin@laespiga.com` | ADMIN | Todo el sistema +Usuarios |
| Jefe de Planta | `planta@laespiga.com` | PLANTA | Sucursales + Productos + Pedidos |
| Encargado Sucursal | `sucursal@laespiga.com` | SUCURSAL | Productos (lectura) + Pedidos de su sucursal |
| Dueño Franquicia | `franquicia@laespiga.com` | FRANQUICIA | Su sucursal + Pedidos de su sucursal |

Para hacer login desde la API:
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@laespiga.com",
  "password": "password123"
}
```
La respuesta incluye un `token` JWT que debe enviarse en el header `Authorization: Bearer <token>` en todos los endpoints protegidos.

### Resetear datos de prueba

Si necesitás **borrar todos los usuarios** para volver a disparar el seeder en el siguiente arranque:
```bash
# Con Docker
docker exec -it mongodb mongosh laespiga --eval "db.usuarios.deleteMany({})"

# Con instalación local
mongosh laespiga --eval "db.usuarios.deleteMany({})"
```

Para resetear todo (sucursales, usuarios, productos y pedidos):
```bash
# Con Docker
docker exec -it mongodb mongosh laespiga --eval "db.dropDatabase()"

# Con instalación local
mongosh laespiga --eval "db.dropDatabase()"
```
Luego ejecutar `npm run seed` para repoblar.

## Estructura del Proyecto

```
la-espiga-de-oro/
├── src/
│   ├── config/
│   │   ├── db.js                      # Conexión a MongoDB con Mongoose
│   │   └── seed.js                    # Seeder de datos de prueba (standalone)
│   ├── modules/                       # Módulos feature-based
│   │   ├── auth/                      # Autenticación JWT
│   │   │   ├── auth.controller.js
│   │   │   ├── auth.routes.js
│   │   │   └── auth.service.js
│   │   ├── dashboard/                 # Dashboard con KPIs y resumen
│   │   │   ├── dashboard.controller.js
│   │   │   ├── dashboard.routes.js
│   │   │   └── dashboard.service.js
│   │   ├── productos/
│   │   │   ├── producto.model.js
│   │   │   ├── producto.service.js
│   │   │   ├── producto.controller.js
│   │   │   └── producto.routes.js
│   │   ├── sucursales/
│   │   │   ├── sucursal.model.js      # Campos de auditoría (createdBy, updatedBy, etc.)
│   │   │   ├── sucursal.service.js    # CRUD + activar + trazabilidad
│   │   │   ├── sucursal.controller.js
│   │   │   └── sucursal.routes.js
│   │   ├── pedidos/
│   │   │   ├── pedido.model.js        # Virtual 'id' + timestamps + historialEstados
│   │   │   ├── pedido.service.js
│   │   │   ├── pedido.controller.js
│   │   │   └── pedido.routes.js
│   │   └── usuarios/
│   │       ├── usuario.model.js       # bcrypt + matchPassword
│   │       ├── usuario.service.js
│   │       ├── usuario.controller.js
│   │       └── usuario.routes.js
│   ├── public/                        # Frontend estático (JS + CSS)
│   │   ├── auth.js                    # Helpers de token y permisos del lado cliente
│   │   ├── dashboard.js               # Fetch del dashboard y render de KPIs
│   │   └── styles.css
│   ├── shared/                        # Recursos compartidos
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.js     # verifyToken + checkRole
│   │   │   └── permission.middleware.js # permit + permitOwnerOr
│   │   ├── pedidos.json               # Datos legacy (migración en curso)
│   │   ├── productos.json
│   │   └── errorHandler.js
│   ├── view/                          # Vistas Pug
│   │   ├── login.pug
│   │   ├── dashboard.pug
│   │   ├── index.pug
│   │   ├── sucursales.pug             # Panel de trazabilidad integrado
│   │   ├── productos.pug
│   │   ├── pedidos.pug
│   │   └── usuarios.pug
│   └── index.js                       # Entry point (startup + seed)
├── .env.example                       # Template de variables de entorno
├── package.json
├── README.md
└── La Espiga de Oro - API Collection.postman_collection.json
```

## Endpoints de la API

> Todos los endpoints (excepto `/api/auth/login` y `/api/health`) requieren autenticación JWT vía el header `Authorization: Bearer <token>`.

### Dashboard (`/api/dashboard`)

|Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/dashboard` | Devuelve KPIs (pedidos pendientes/en producción/entregados), últimos 5 pedidos y estado de sucursales. Filtra por scope del usuario logueado. |

### Sucursales (`/api/sucursales`)

| Método | Endpoint | Permiso | Descripción |
|--------|----------|---------|-------------|
| GET | `/api/sucursales` | Autenticado | Lista sucursales según scope del usuario |
| GET | `/api/sucursales/:id` | Autenticado | Obtiene sucursal por ID |
| GET | `/api/sucursales/:id/trazabilidad` | Autenticado | Trazabilidad completa: auditoría (createdBy, updatedBy, deactivatedBy) + resumen de pedidos |
| POST | `/api/sucursales` | PLANTA / ADMIN | Crea nueva sucursal o franquicia |
| PUT | `/api/sucursales/:id` | PLANTA (todas) / FRANQUICIA (suya) | Actualiza datos de sucursal |
| DELETE | `/api/sucursales/:id` | PLANTA (todas) / FRANQUICIA (suya) | Desactiva sucursal (soft delete — valida pedidos activos) |
| PATCH | `/api/sucursales/:id/activar` | PLANTA (todas) / FRANQUICIA (suya) | Reactiva sucursal desactivada |

### Productos (`/api/productos`)

| Método | Endpoint | Permiso | Descripción |
|--------|----------|---------|-------------|
| GET | `/api/productos` | Autenticado | Lista todos los productos del catálogo |
| GET | `/api/productos/:id` | Autenticado | Obtiene producto por ID |
| GET | `/api/productos/:id/trazabilidad` | Autenticado | Trazabilidad del producto |
| POST | `/api/productos` | PLANTA / ADMIN | Crea nuevo producto |
| PUT | `/api/productos/:id` | PLANTA / ADMIN | Actualiza producto |
| DELETE | `/api/productos/:id` | PLANTA / ADMIN | Elimina producto |

### Pedidos (`/api/pedidos`)

| Método | Endpoint | Permiso | Descripción |
|--------|----------|---------|-------------|
| GET | `/api/pedidos` | Autenticado | Lista todos los pedidos (con populate de sucursal) |
| GET | `/api/pedidos/:id` | Autenticado | Obtiene pedido por ID (con populate) |
| GET | `/api/pedidos/:id/trazabilidad` | Autenticado | Trazabilidad del pedido |
| POST | `/api/pedidos` | Autenticado | Crea nuevo pedido |
| PATCH | `/api/pedidos/:id/estado` | Autenticado | Cambia estado del pedido |
| DELETE | `/api/pedidos/:id` | Autenticado | Cancela pedido |

### Autenticación (`/api/auth`)

| Método | Endpoint | Permiso | Descripción |
|--------|----------|---------|-------------|
| POST | `/api/auth/login` | Público | Recibe `{ email, password }` y devuelve `{ usuario, token }` |
| GET | `/api/auth/me` | Autenticado | Devuelve perfil del usuario logueado |

### Usuarios (`/api/usuarios`)

| Método | Endpoint | Permiso | Descripción |
|--------|----------|---------|-------------|
| GET | `/api/usuarios` | ADMIN | Lista todos los usuarios |
| GET | `/api/usuarios/:id` | ADMIN | Obtiene usuario por ID |
| POST | `/api/usuarios` | ADMIN | Crea nuevo usuario |
| PUT | `/api/usuarios/:id` | ADMIN | Actualiza usuario |
| DELETE | `/api/usuarios/:id` | ADMIN | Elimina usuario |

Notas:

- Las contraseñas se almacenan encriptadas con `bcryptjs` (ver `src/modules/usuarios/usuario.model.js`).
- El seeder crea usuarios base (`ADMIN`, `PLANTA`, `SUCURSAL`, `FRANQUICIA`) con la contraseña `password123` si la colección está vacía.
- Los tokens JWT expiran en 24h por defecto (configurable via `JWT_EXPIRES_IN` en `.env`).

### Health Check

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/health` | Verifica estado del servidor (sin auth) |

### Vistas (frontend Pug)

| Ruta | Vista | Descripción |
|------|-------|-------------|
| `/login` | `login.pug` | Pantalla de login |
| `/index` | `index.pug` | Menú principal de navegación |
| `/dashboard` | `dashboard.pug` | KPIs + últimos pedidos + estado de sucursales |
| `/sucursales` | `sucursales.pug` | CRUD de sucursales + panel de trazabilidad |
| `/productos` | `productos.pug` | Catálogo de productos |
| `/pedidos` | `pedidos.pug` | Gestión de pedidos |
| `/usuarios` | `usuarios.pug` | Gestión de usuarios (solo ADMIN) |

## Tecnologías Utilizadas

- **Node.js**: Runtime de JavaScript
- **Express.js 5**: Framework web
- **MongoDB**: Base de datos NoSQL
- **Mongoose**: ODM para MongoDB (schemas, validaciones, virtuals, populate)
- **jsonwebtoken**: Generación y validación de tokens JWT
- **bcryptjs**: Encriptación de contraseñas
- **dotenv**: Variables de entorno
- **Pug**: Motor de plantillas para vistas

## Postman

Para probar la API, importar la colección `La Espiga de Oro - API Collection.postman_collection.json` (en la raíz del proyecto) en Postman. La colección incluye los endpoints de todos los módulos con ejemplos de request bodies.

## Despliegue

El servidor inicia en `http://localhost:3000` por defecto.

## Equipo de Desarrollo

- Eduardo Moreno - Integración Plantillas Pug y Validación Final
- Paula Beni - Feature: Sucursales
- Melissa Galeano - Feature: Productos
- Leandro Paryszewski - Feature: Pedidos
- Marcelo Moreno - Fundaciones, Shared y Documentación
