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

## Instalación

```bash
# Instalar dependencias
npm install

# Crear .env a partir del ejemplo
cp .env.example .env

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
