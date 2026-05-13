# Changelog

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

---

## Slice 1 — Ajustes: Activar sucursal + Fix Pug (2026-05-13)

**Asistido por IA** (Deepseek v4 + OpenCode + Engram Memory)

### Resumen

Sesión de testing y ajustes sobre el Slice 1. Se detectó un bug en el frontend Pug que impedía editar y desactivar sucursales (usaba `s.id` en vez de `s._id`). Se agregó el endpoint de reactivación de sucursales (`PATCH /activar`) con su lógica en service/controller/routes. Se actualizó el Pug con botón condicional que muestra "Activar" o "Desactivar" según el estado.

### Archivos modificados

| Archivo | Cambio |
|---------|--------|
| `src/view/sucursales.pug` | Fix `s.id` → `s._id` en fila() y botones (3 lugares). Botón condicional Activar/Desactivar. Handler `data-on` para PATCH. |
| `src/sucursales/sucursal.service.js` | Nuevo — `activar(id)`: busca sucursal, pone `activa = true`, guarda |
| `src/sucursales/sucursal.controller.js` | Nuevo — handler `activar(req, res, next)` con try/catch |
| `src/sucursales/sucursal.routes.js` | Nueva ruta `PATCH /:id/activar` |

**Total: 4 archivos modificados**

### Logros

- El CRUD de sucursales ahora es completo: Crear, Leer, Actualizar, Desactivar (soft), Activar
- El frontend refleja correctamente el estado con botón contextual
- Solucionado el CastError `"undefined" (type string) at path "_id"` causado por `s.id` inexistente
- Probado con MongoDB en Docker + Postman + frontend Pug

### Bugs solucionados

- **CastError al editar/desactivar desde Pug**: `s.id` devolvía `undefined` porque Mongoose serializa `_id`, no `id`. Solución: usar `s._id` en el template.
