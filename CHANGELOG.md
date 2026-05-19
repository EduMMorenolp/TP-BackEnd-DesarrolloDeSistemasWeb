# Changelog

## Sistema de Usuarios, Roles y Autenticación (2026-05-18)

**Asistido por IA** (Antigravity)

### Resumen
Implementación de un sistema de usuarios con roles y autenticación mediante JWT.

### Archivos modificados/creados ( Eduardo Moreno 18/05/2026 | Antigravity )
- `.env.example`: Agregadas variables de entorno `JWT_SECRET` y `JWT_EXPIRES_IN`.
- `src/usuarios/*`: Creado módulo de Usuarios (model, service, controller, routes).
- `src/auth/*`: Creado módulo de Autenticación para login y perfil (service, controller, routes).
- `src/shared/middlewares/auth.middleware.js`: Creados middlewares `verifyToken` y `checkRole`.
- `src/index.js`: Registrados los routers de `auth` y `usuarios`.
- `postman_collection.json`: Añadidos endpoints de Autenticación y Usuarios con manejo automático de tokens.

### Logros ( Eduardo Moreno 18/05/2026 | Antigravity )
- Implementación de un Seeder automático para generar sucursales y usuarios base (`ADMIN`, `PLANTA`, `SUCURSAL`, `FRANQUICIA`) al arrancar el servidor con DB vacía.
- Refactorización de Arquitectura: Todas las funcionalidades de negocio (`auth`, `usuarios`, `pedidos`, `productos`, `sucursales`) se movieron dentro de la nueva carpeta `src/modules/` para mantener la raíz limpia y escalable.
- CRUD de usuarios con contraseñas encriptadas con `bcryptjs`.
- Login de usuarios que retorna token JWT.
- Middlewares que protegen rutas usando validación de token y roles (`ADMIN`, `PLANTA`, `SUCURSAL`, `FRANQUICIA`).
- Ruta abierta temporalmente en `POST /api/usuarios` para facilitar la creación del primer administrador.

---

## Slice 1 — Sucursales en MongoDB + Infraestructura base (2026-05-09)

**Asistido por IA** (Deepseek v4 + OpenCode + Engram Memory)

### Resumen

Migración del dominio de Sucursales de archivos JSON a MongoDB con Mongoose. Se estableció la infraestructura base para todo el proyecto: variables de entorno, conexión a base de datos, sistema de módulos ES6, y startup asíncrono. Este es el primer tracer bullet del refactor planificado en el [PRD #3](https://github.com/EduMMorenolp/TP-BackEnd-DesarrolloDeSistemasWeb/issues/3).

### Archivos modificados

| Archivo | Cambio |
|---------|--------|
| `.env` | Nuevo — MONGODB_URI y PORT |
| `.gitignore` | Agregado .env |
| `package.json` | `"type": "module"`, dependencias mongoose y dotenv |
| `package-lock.json` | Actualizado con nuevas dependencias |
| `src/config/db.js` | Nuevo — conexión a MongoDB con Mongoose |
| `src/index.js` | Refactor: dotenv, await connectDB, import.meta.url, ES6 |
| `src/shared/store.js` | ES6, eliminada la gestión de sucursales (ahora en MongoDB) |
| `src/shared/errorHandler.js` | Convertido a ES6 export |
| `src/sucursales/sucursal.model.js` | Schema de Mongoose con validaciones (enum, required) |
| `src/sucursales/sucursal.service.js` | Refactor a async/await + Mongoose |
| `src/sucursales/sucursal.controller.js` | Refactor a async/await + next(err) unificado |
| `src/sucursales/sucursal.routes.js` | Convertido a ES6 imports |
| `src/productos/producto.model.js` | Convertido a ES6 (lógica intacta) |
| `src/productos/producto.service.js` | Convertido a ES6 (lógica intacta) |
| `src/productos/producto.controller.js` | Convertido a ES6 (lógica intacta) |
| `src/productos/producto.routes.js` | Convertido a ES6 imports |
| `src/pedidos/pedido.model.js` | Convertido a ES6 (lógica intacta) |
| `src/pedidos/pedido.service.js` | Convertido a ES6; populatePedido ahora consulta MongoDB |
| `src/pedidos/pedido.controller.js` | Convertido a ES6; handlers async donde corresponde |
| `src/pedidos/pedido.routes.js` | Convertido a ES6 imports |
| `README.md` | Actualizado con MongoDB, Docker, .env, estructura nueva |

**Total: 22 archivos tocados** (19 modificados + 2 nuevos + 1 actualizado)

### Logros

- Sucursales persisten en MongoDB con validaciones en el schema
- Todo el proyecto usa ES6 imports (`"type": "module"`)
- Manejo de errores unificado: los 3 controllers usan `try/catch` + `next(err)`
- Startup bloqueante: el servidor no levanta sin conexión a MongoDB
- Configuración externalizada en `.env` (dotenv)
- Productos y pedidos mantienen compatibilidad con store.js

### Commits

- `2d9fb24` feat: Slice 1 - migrar sucursales a MongoDB, async/await y ES6 imports
- `95ee9d3` docs: actualizar README con MongoDB, Docker y estructura actual

### Pendiente

- Slice 2: Productos en MongoDB ([#5](https://github.com/EduMMorenolp/TP-BackEnd-DesarrolloDeSistemasWeb/issues/5))
- Slice 3: Pedidos en MongoDB ([#6](https://github.com/EduMMorenolp/TP-BackEnd-DesarrolloDeSistemasWeb/issues/6))
- Slice 4: Cleanup + Seed ([#7](https://github.com/EduMMorenolp/TP-BackEnd-DesarrolloDeSistemasWeb/issues/7))

---

## Planificación (2026-05-09)

**Asistido por IA** (Deepseek v4 + OpenCode + Grill Session)

- [PRD #3](https://github.com/EduMMorenolp/TP-BackEnd-DesarrolloDeSistemasWeb/issues/3): Migración a MongoDB, Async/Await y ES6 Imports
- Definición de 4 slices con dependencias y criterios de aceptación
- 11 decisiones de arquitectura documentadas
