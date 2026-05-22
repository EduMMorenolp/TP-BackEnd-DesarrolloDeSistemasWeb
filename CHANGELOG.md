# Changelog

## Seguridad: autenticación JWT aplicada a rutas API (2026-05-21)

**Cambio Manual**

### Resumen

Se protegieron las rutas principales de la API con `verifyToken` desde `src/index.js`, dejando público solo el login de autenticación. Con esto, los recursos de sucursales, productos, pedidos y usuarios ya no quedan expuestos sin token.

### Archivos modificados

| Archivo | Cambio |
|---------|--------|
| `src/index.js` | Feat: se aplicó `verifyToken` al registro de rutas API para exigir token en sucursales, productos, pedidos y usuarios. |

### Logros

- Las rutas de negocio de la API ahora requieren token JWT.
- `POST /api/auth/login` se mantiene público para obtener el token.
- Se centralizó la protección en el punto de montaje de rutas, sin tocar cada handler individual.

### Pendiente

- Revisar si alguna ruta pública adicional debe mantenerse sin autenticación por diseño.

## Bugfix: Productos + Sucursales + Cleanup Slice 4 (2026-05-21)

**Asistido por IA** (OpenCode + Engram Memory + Deepseek v4)

### Resumen

Sesión de bugfixing y cleanup sobre la rama `melitest`. Se detectaron y corrigieron 3 bugs críticos remanentes de la reestructuración de carpetas y la migración a MongoDB, se eliminó código muerto (`store.js`), y se completó el Slice 4 con seed standalone y script `npm run seed`. Se verificó todo con tests manuales y se cerraron los issues #5, #6, y #7.

### Archivos modificados

| Archivo | Cambio |
|---------|--------|
| `src/modules/productos/producto.controller.js` | Fix: `actualizarProducto` devolvía referencia a función → `actualizado`. Fix: `obtenerProductosPorIds` recibía string en vez de array → `$in` iteraba carácter por carácter. |
| `src/modules/productos/producto.model.js` | Fix: validación `precio` mín 0 → 0.01, inconsistente con el service que rechazaba 0. |
| `src/modules/productos/producto.service.js` | Cleanup: comentario obsoleto sobre `store.js`. |
| `src/modules/sucursales/sucursal.service.js` | Fix: `store.pedidos` no definido → `ReferenceError` al desactivar. Reemplazado por `Pedido.findOne()` consultando MongoDB. |
| `src/modules/pedidos/pedido.model.js` | Cleanup: comentario obsoleto sobre "productos aún no están en MongoDB". |
| `src/modules/pedidos/pedido.service.js` | Cleanup: comentario obsoleto sobre `store.js`. |
| `src/shared/store.js` | **Eliminado** — código muerto, cero imports en todo el proyecto. |
| `src/config/seed.js` | Feat: ejecutable standalone con guard `isMain`. Importa `connectDB` y `mongoose` para correr sin el server. |
| `package.json` | Agregado script `npm run seed`. |

**Total: 9 archivos** (7 modificados + 1 eliminado + 1 creado)

### Merge desde meligaleano

- `dd4ee0e → b3efc6b`: Meli restauró lógica perdida en `producto.service.js` (`crear`, `obtenerProductosPorIds`, `actualizar` estaban como stubs vacíos tras la reestructuración de carpetas).

### Logros

- **Bug #1**: `PUT /api/productos/:id` ahora devuelve el producto actualizado en JSON (antes devolvía la referencia a la función `actualizarProducto`).
- **Bug #2**: `GET /api/productos/:id` ahora busca correctamente por ID (antes `$in` iteraba el string carácter por carácter, nunca encontraba nada).
- **Bug #3**: `DELETE /api/sucursales/:id` ya no crashea con `ReferenceError: store is not defined`. Ahora consulta `Pedido.findOne()` para validar pedidos activos antes de desactivar.
- **Validación de precio alineada**: el modelo Mongoose y el service ahora coinciden (precio > 0).
- **Código muerto eliminado**: `store.js` fuera del proyecto.
- **Comentarios obsoletos limpiados**: 3 referencias a `store.js` que ya no aplicaban.
- **Verificación manual**: los 4 bugs fueron testeados contra el servidor con datos del seed, todos pasan.
- **Seed standalone**: `npm run seed` ahora ejecuta el seed de forma independiente (sin levantar el server). El guard `isMain` evita que se duplique cuando corre desde `index.js`.
- **Issues cerrados**: #5 (Slice 2), #6 (Slice 3), #7 (Slice 4).

### Commits

- `58dfe1c` fix: corregir bugs en productos, sucursales y eliminar store.js muerto
- `545c016` feat: seed standalone + npm run seed script para Slice 4

### Pendiente

- Slice 5: QA Manual — flujo completo de negocio ([#8](https://github.com/EduMMorenolp/TP-BackEnd-DesarrolloDeSistemasWeb/issues/8))
- Slice 6: Documentación + PUG + Revisión Final ([#9](https://github.com/EduMMorenolp/TP-BackEnd-DesarrolloDeSistemasWeb/issues/9))

---

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
