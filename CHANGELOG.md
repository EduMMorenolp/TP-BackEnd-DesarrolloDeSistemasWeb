# Changelog

## Seguridad + UX por rol en Sucursales y Productos (2026-06-20)

**Asistido por IA** (OpenCode + Engram Memory)

### Resumen

Cuatro mejoras de seguridad y UX sobre el módulo Sucursales, alineando la app con el modelo de negocio: PLANTA administra todo, FRANQUICIA solo su local, SUCURSAL es read-only. Se corrigió un bug de seguridad crítico en `permitOwnerOr` (los roles listados pasaban directo sin verificar propiedad), se unificaron los timestamps de Sucursal con el patrón de Pedido, se filtró el listado por propiedad, y se bloqueó el CRUD de productos para FRANQUICIA/SUCURSAL.

### Cambios

#### 1. Fix de seguridad: `permitOwnerOr` verificaba propiedad decorativamente

**Bug crítico**: el middleware `permitOwnerOr(['PLANTA','FRANQUICIA'], ...)` pasaba a cualquier rol listado **sin verificar propiedad**. La verificación de "owner" era código muerto — una FRANQUICIA podía editar/desactivar TODAS las sucursales del sistema, contradiciendo el CHANGELOG del 2026-05-24.

**Fix**: rediseño de la firma para separar `globalRoles` (pasan sin verificar, ej PLANTA) de `ownerRoles` (verifican propiedad, ej FRANQUICIA). SUCURSAL recibe 403.

#### 2. Timestamps unificados en Sucursal

`fechaCreacion` manual eliminado. Ahora usa `timestamps: { createdAt: 'fechaCreacion', updatedAt: 'fechaActualizacion' }` — mismo patrón que `pedido.model.js`. El Pug sigue leyendo `s.fechaCreacion` sin cambios. Panel de trazabilidad enriquecido: ahora muestra fecha de creación y de última modificación junto a `createdBy`/`updatedBy`.

#### 3. Listado de sucursales filtrado por propiedad

`listar()` ahora recibe `req.user`: ADMIN/PLANTA ven todas, FRANQUICIA y SUCURSAL ven solo la suya (activa o desactivada, para permitir reactivar). Frontend oculta la card "Alta de sucursal" y los botones de acción para roles no-administradores.

#### 4. Productos: CRUD solo PLANTA

POST/PUT/DELETE de productos ahora `permit(['PLANTA'])` (antes permitía FRANQUICIA). Frontend oculta el form "Alta rápida" y los botones Editar/Eliminar para FRANQUICIA y SUCURSAL. El catálogo (GET) sigue visible para todos porque lo usan para armar pedidos.

### Matriz de permisos resultante

| Acción | ADMIN | PLANTA | FRANQUICIA | SUCURSAL |
|--------|:-----:|:------:|:----------:|:--------:|
| Crear sucursal | ✅ | ✅ | ❌ | ❌ |
| Editar/desactivar cualquier sucursal | ✅ | ✅ | ❌ | ❌ |
| Editar/desactivar la suya | ✅ | ✅ | ✅ | ❌ |
| Ver todas las sucursales | ✅ | ✅ | ❌ solo la suya | ❌ solo la suya |
| Crear/editar/eliminar productos | ✅ | ✅ | ❌ | ❌ |
| Ver catálogo de productos | ✅ | ✅ | ✅ | ✅ |

### Archivos modificados

| Archivo | Cambio |
|---------|--------|
| `src/shared/middlewares/permission.middleware.js` | Fix: `permitOwnerOr` rediseñado con `globalRoles`/`ownerRoles`. JSDoc actualizado. |
| `src/modules/sucursales/sucursal.routes.js` | `POST` solo PLANTA. `PUT`/`DELETE`/`PATCH` con `permitOwnerOr(['PLANTA'],['FRANQUICIA'],...)`. |
| `src/modules/sucursales/sucursal.controller.js` | `actualizar` pasa `req.user.rol` al service. `listar` pasa `req.user`. |
| `src/modules/sucursales/sucursal.service.js` | `actualizar` filtra `tipo` para no-PLANTA/no-ADMIN. `listar(user)` filtra por propiedad. |
| `src/modules/sucursales/sucursal.model.js` | `fechaCreacion` manual → `timestamps` mapeado a español. |
| `src/modules/productos/producto.routes.js` | `POST`/`PUT`/`DELETE` con `permit(['PLANTA'])`. |
| `src/public/auth.js` | Nuevas helpers `getUserRole()`, `canManageSucursales()`, `canManageProductos()`. |
| `src/view/sucursales.pug` | Card alta con id, oculta por rol. `fila()` renderiza botones según rol. Trazabilidad muestra fechas. |
| `src/view/productos.pug` | Card alta con id, oculta por rol. `filaProducto()` muestra — en Acciones para no-admins. |

**Total: 9 archivos modificados**

### Decisiones de diseño

- **Franquiciado = 1 local**: `Usuario.sucursalId` sigue siendo `ObjectId` único. Si un dueño abre otro local, se crea otro usuario dedicado. Mantiene trazabilidad limpia y no rompe el modelo.
- **Soft delete sin ocultar desactivadas**: el filtro del listado es por **propiedad**, no por estado. Las desactivadas siguen visibles para permitir reactivarlas.
- **Defensa en profundidad sobre `tipo`**: el service elimina `tipo` del payload si el rol no es PLANTA/ADMIN, previniendo auto-ascenso de franquicia a sucursal.
- **`canManageSucursales()` y `canManageProductos()` separados** aunque devuelvan el mismo conjunto (ADMIN/PLANTA), por semántica de dominio — si mañana cambia quién administra productos, se cambia un solo lugar.

---

## Trazabilidad de sucursales + restauración endpoint activar (2026-06-20)

**Asistido por IA** (OpenCode + Engram Memory)

### Resumen

Feature de trazabilidad de sucursales: campos de auditoría (`createdBy`, `updatedBy`, `deactivatedBy`, `deactivatedAt`) en el modelo, nuevo endpoint `GET /api/sucursales/:id/trazabilidad` con populate de usuario y resumen de pedidos, y panel de trazabilidad en `sucursales.pug`. Además se restauró el endpoint `PATCH /api/sucursales/:id/activar` (con su botón condicional en el Pug) que se había perdido porque el commit `509f843` nunca se pusheó a `origin/pre-main` — solo existía en `pre-main` local. La versión restaurada mejora la original: limpia `deactivatedBy`/`deactivatedAt` al reactivar, setea `updatedBy`, y aplica `permitOwnerOr` para autorización por propiedad.

### Archivos modificados

| Archivo | Cambio |
|---------|--------|
| `src/modules/sucursales/sucursal.model.js` | Feat: campos de trazabilidad `createdBy`, `updatedBy`, `deactivatedBy` (ref Usuario) + `deactivatedAt` (Date). |
| `src/modules/sucursales/sucursal.service.js` | Feat: `crear()` setea `createdBy`; `actualizar()` setea `updatedBy`; `desactivar()` setea `deactivatedBy`/`deactivatedAt`. Feat: `obtenerTrazabilidad(id)` con populate de usuario y resumen de pedidos (total, activos, últimos 5). Feat: `activar(id, userId)` reactiva sucursal, limpia campos de desactivación y setea `updatedBy`. |
| `src/modules/sucursales/sucursal.controller.js` | Feat: handler `trazabilidad(req, res, next)`. Feat: handler `activar(req, res, next)`. |
| `src/modules/sucursales/sucursal.routes.js` | Feat: `GET /:id/trazabilidad`. Feat: `PATCH /:id/activar` con `permitOwnerOr(['PLANTA','FRANQUICIA'], ...)`. |
| `src/view/sucursales.pug` | Feat: panel de trazabilidad con grid de auditoría + pedidos. Feat: botón "📋 Trazabilidad" por fila. Feat: botón condicional "Activar"/"Desactivar" según `s.activa`. Handler `data-on` para `PATCH /activar`. |
| `src/public/styles.css` | Feat: estilos `.btn-trace`, `.trazabilidad-grid` (grid 2 columnas), `#trazabilidadCard`. |

**Total: 6 archivos modificados**

### Logros

- Auditoría completa: cada sucursal registra quién la creó, modificó y desactivó, y cuándo.
- Endpoint de trazabilidad con populate de usuario + agregación de pedidos en una sola query.
- Restaurado el endpoint `PATCH /activar` que se había perdido (commit `509f843` nunca pusheado a `origin/pre-main`).
- El botón de acción cambia dinámicamente entre "Activar" y "Desactivar" según el estado de la sucursal.
- La versión restaurada de `activar` mejora la original: limpia `deactivatedBy`/`deactivatedAt` y aplica `permitOwnerOr`.

### Notas

- El commit `509f843` (2026-05-13) quedó solo en `pre-main` local sin pushear a `origin/pre-main`, por eso no estaba disponible al crear la rama `trazabilidad-sucursales` desde `origin/pre-main`. Como `origin/pre-main` y `origin/main` apuntaban al mismo commit (`822dc52`), la rama nació sin el endpoint activar.
- Se decidió NO pushear `509f843` a `origin/pre-main` retroactivamente: el código ya está restaurado y mejorado en esta rama.

---

## Módulo Usuarios — Admin (2026-06-19)

**Asistido por IA**

### Resumen

Se implementó un nuevo módulo de administración de usuarios visible solo para rol `ADMIN`. Permite listar todos los usuarios, crear nuevos, editar datos y rol, y desactivar/reactivar usuarios. El link de navegación y la card en el dashboard se muestran condicionalmente solo para administradores.

### Archivos modificados/creados

| Archivo | Cambio |
|---------|--------|
| `src/view/usuarios.pug` | Nuevo — Vista completa del módulo: alta de usuario, listado con editar/desactivar/reactivar, y JS embebido conectado a los endpoints existentes. |
| `src/index.js` | Feat: ruta `GET /usuarios` que renderiza `usuarios.pug`. |
| `src/public/auth.js` | Feat: nueva función `isAdmin()`. |
| `src/view/index.pug` | Feat: nav link y card "Módulo Usuarios" visibles solo para ADMIN via JS condicional. |
| `src/view/sucursales.pug` | Feat: nav link "Usuarios" visible solo para ADMIN. |
| `src/view/productos.pug` | Feat: nav link "Usuarios" visible solo para ADMIN. |
| `src/view/pedidos.pug` | Feat: nav link "Usuarios" visible solo para ADMIN. |
| `src/modules/usuarios/usuario.routes.js` | Fix: `verifyToken` + `checkRole(['ADMIN'])` agregado al `POST /api/usuarios` (estaba público). |

### Notas

- El backend ya existía con CRUD de usuarios protegido por rol ADMIN, solo faltaba la vista.
- El botón de acción cambia dinámicamente entre "Desactivar" (DELETE → `activo: false`) y "Reactivar" (PUT → `activo: true`).
- Edición de usuarios mediante prompts secuenciales (mismo patrón que sucursales/productos), incluyendo cambio de rol y reasignación de sucursal.

## Seguridad: permisos por rol y autorización por propiedad (2026-05-24)

**Asistido por IA**

### Resumen

Se implementó una capa de autorización más fina que complementa la autenticación JWT: un middleware `permit` para permisos por rol y `permitOwnerOr` para autorización por propiedad de recursos (p. ej. que una `FRANQUICIA` solo edite sus sucursales). Estos middlewares se aplicaron en los puntos de montaje de rutas relevantes para evitar exposición accidental de endpoints.

### Archivos modificados/creados

| Archivo | Cambio |
|---------|--------|
| `src/shared/middlewares/permission.middleware.js` | Nuevo middleware `permit` y `permitOwnerOr` para autorización por rol y por propiedad. |
| `src/modules/productos/producto.routes.js` | Feat: `POST/PUT/DELETE` protegidos con `permit(['PLANTA','FRANQUICIA'])`. |
| `src/modules/sucursales/sucursal.routes.js` | Feat: `POST` protegido con `permit(['PLANTA','FRANQUICIA'])`; `PUT/DELETE` usan `permitOwnerOr(...)` para autorizar por pertenencia. |

### Notas

- `ADMIN` mantiene bypass implícito en los middlewares.
- Para soportar productos locales por franquicia, se recomienda añadir `sucursalId` o `scope` a `Producto` (no modificado automáticamente). 
- Se sugiere añadir comprobaciones duplicadas en los controllers (double-check) para evitar bypass en lógica de negocio.

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
