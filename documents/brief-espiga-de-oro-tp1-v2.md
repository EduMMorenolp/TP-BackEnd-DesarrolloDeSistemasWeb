# La Espiga de Oro S

| La Espiga de Oro S.R.L. Sistema de Gestión de Pedidos *Brief Técnico — TP1: CRUD con Interacciones entre Módulos* |
| :---: |

| Versión:  2.0 Stack:  Node.js \+ Express (in-memory) Arquitectura:  Feature-based (tipo Next.js) | Formato respuesta:  JSON exclusivamente Equipo:  1 Tech Lead \+ 5 Devs Junior Entrega:  TP1 — Sistema base funcional |
| :---- | :---- |

# **1\. Contexto del Proyecto**

La Espiga de Oro recibe pedidos de 5 sucursales propias y 10 franquicias por WhatsApp. Nadie tiene visibilidad de qué hay que producir. La planta central no puede planificar. Nuestro trabajo: un backend modular en Node.js que resuelva exactamente eso.

*Tres actores. Tres módulos. Un store en memoria que los conecta.*

* **Planta Central — produce y despacha**

* Sucursales (5) — realizan pedidos, reciben productos

* Franquicias (10) — autónomas pero bajo estándares de marca; también hacen pedidos

| Regla \#1: Todo el sistema responde JSON. Sin excepción. Ni HTML, ni texto plano, ni nada que no sea { ... }. |
| :---- |

# **2\. Arquitectura del Proyecto**

Arquitectura feature-based: cada entidad del negocio vive en su propia carpeta con su model, service, controller y routes. Mismo concepto que Next.js con sus carpetas de rutas, pero aplicado al backend.

| Una carpeta por feature. Todo lo de sucursales en /sucursales. Todo lo de productos en /productos. Todo lo de pedidos en /pedidos. Nada de controllers/ separados, nada de services/ separados. |
| :---- |

## **2.1. Estructura de carpetas**

| espiga-de-oro/ ├── src/ │   ├── sucursales/ │   │   ├── sucursal.model.js       ← schema / estructura de datos │   │   ├── sucursal.service.js      ← lógica de negocio y validaciones │   │   ├── sucursal.controller.js   ← maneja req/res, llama al service │   │   └── sucursal.routes.js       ← define los endpoints del módulo │   │ │   ├── productos/ │   │   ├── producto.model.js │   │   ├── producto.service.js │   │   ├── producto.controller.js │   │   └── producto.routes.js │   │ │   ├── pedidos/ │   │   ├── pedido.model.js │   │   ├── pedido.service.js        ← consume funciones de sucursal y producto │   │   ├── pedido.controller.js │   │   └── pedido.routes.js │   │ │   ├── shared/ │   │   ├── store.js                 ← arrays en memoria compartidos por todos │   │   └── errorHandler.js          ← middleware global de errores │   │ │   └── index.js                     ← entry point, registra todos los routers │ ├── package.json └── README.md |
| :---- |

## **2.2. Responsabilidad de cada archivo**

| Archivo | Responsabilidad |
| :---- | :---- |
| **\*.model.js** | Define la estructura del objeto. Función createXxx() que arma y retorna el objeto con todos sus campos. |
| **\*.service.js** | Lógica de negocio pura. Validaciones, cálculos, interacciones con el store. No conoce req ni res. |
| **\*.controller.js** | Lee req.body / req.params, llama al service, escribe res.status().json(). Nada más. |
| **\*.routes.js** | Crea un Router de Express y mapea cada método HTTP a su controller. |
| **shared/store.js** | Exporta los arrays compartidos: sucursales, productos, pedidos. Fuente única de verdad en memoria. |
| **shared/errorHandler.js** | Middleware global (err, req, res, next). Centraliza todos los errores con su status y mensaje JSON. |
| **index.js** | Inicializa Express, registra los 3 routers bajo /api, arranca el servidor en puerto 3000\. |

# **3\. Endpoints y Respuestas JSON**

Todos los endpoints del sistema. Para el TP1 el único formato de respuesta es JSON. Los ejemplos de abajo son exactamente lo que el endpoint debe retornar.

## **3.1. Módulo Sucursales  —  /api/sucursales**

| Método | Código HTTP | Endpoint | Descripción \+ Respuesta JSON |
| :---- | :---- | :---- | :---- |
| **GET** | **200** | /api/sucursales | Lista todas las sucursales activas e inactivas |
| **GET** | **200/404** | /api/sucursales/:id | Retorna una sucursal por ID. 404 si no existe |
| **POST** | **201/400** | /api/sucursales | Crea una sucursal. Requiere nombre, tipo, direccion |
| **PUT** | **200/404** | /api/sucursales/:id | Actualiza nombre, tipo o direccion |
| **DELETE** | **200/409** | /api/sucursales/:id | Desactiva la sucursal. 409 si tiene pedidos activos |

| POST /api/sucursales → 201 Created |
| :---- |
| {   "id": "a3f1c8d2-...",   "nombre": "Sucursal La Plata Centro",   "tipo": "sucursal",   "direccion": "Calle 7 Nro 850",   "activa": true,   "fechaCreacion": "2025-04-13T10:00:00.000Z" } |

| DELETE /api/sucursales/:id → 409 Conflict (tiene pedidos activos) |
| :---- |
| {   "error": "No se puede desactivar: la sucursal tiene pedidos activos" } |

| GET /api/sucursales/:id → 404 Not Found |
| :---- |
| {   "error": "Sucursal con id 'xyz' no encontrada" } |

## **3.2. Módulo Productos  —  /api/productos**

| Método | Código HTTP | Endpoint | Descripción \+ Respuesta JSON |
| :---- | :---- | :---- | :---- |
| **GET** | **200** | /api/productos | Lista el catálogo completo de productos |
| **GET** | **200/404** | /api/productos/:id | Retorna un producto por ID |
| **POST** | **201/400** | /api/productos | Crea un producto. Requiere nombre, precio, categoria |
| **PUT** | **200/404** | /api/productos/:id | Actualiza nombre, precio o descripcion |
| **DELETE** | **200/409** | /api/productos/:id | Elimina si no está en pedidos activos. 409 si está |

| POST /api/productos → 201 Created |
| :---- |
| {   "id": "b7e2d1a9-...",   "nombre": "Medialunas de manteca x12",   "descripcion": "Caja de 12 medialunas de manteca artesanales",   "precio": 2400,   "categoria": "facturas",   "disponible": true,   "fechaCreacion": "2025-04-13T10:05:00.000Z" } |

| POST /api/productos → 400 Bad Request (precio inválido) |
| :---- |
| {   "error": "El campo 'precio' debe ser un número mayor a 0" } |

## **3.3. Módulo Pedidos  —  /api/pedidos**

| Método | Código HTTP | Endpoint | Descripción \+ Respuesta JSON |
| :---- | :---- | :---- | :---- |
| **GET** | **200** | /api/pedidos | Lista todos los pedidos con sucursal y productos populados |
| **GET** | **200/404** | /api/pedidos/:id | Detalle completo del pedido (populate incluido) |
| **POST** | **201/400** | /api/pedidos | Crea pedido. Valida sucursal activa y productos existentes |
| **PATCH** | **200/400** | /api/pedidos/:id/estado | Cambia estado respetando la máquina de estados |
| **DELETE** | **200/409** | /api/pedidos/:id | Cancela el pedido. Solo si estado es "pendiente" |

| Estados válidos: pendiente → en\_produccion → despachado → entregado. No se puede saltar ni retroceder. |
| :---- |

| POST /api/pedidos → 201 Created  (con populate de sucursal y productos) |
| :---- |
| {   "id": "c9d3e5f7-...",   "sucursal": {     "id": "a3f1c8d2-...",     "nombre": "Sucursal La Plata Centro",     "tipo": "sucursal"   },   "productos": \[     {       "productoId": "b7e2d1a9-...",       "nombre": "Medialunas de manteca x12",       "precio": 2400,       "cantidad": 3     }   \],   "estado": "pendiente",   "observaciones": "Entregar antes de las 8am",   "fechaPedido": "2025-04-13T10:10:00.000Z",   "fechaActualizacion": "2025-04-13T10:10:00.000Z" } |

| PATCH /api/pedidos/:id/estado → 200 OK |
| :---- |
| {   "id": "c9d3e5f7-...",   "estado": "en\_produccion",   "fechaActualizacion": "2025-04-13T11:00:00.000Z" } |

| PATCH /api/pedidos/:id/estado → 400 Bad Request (transición inválida) |
| :---- |
| {   "error": "Transición inválida: no se puede pasar de 'despachado' a 'en\_produccion'" } |

| POST /api/pedidos → 400 Bad Request (sucursal inactiva) |
| :---- |
| {   "error": "La sucursal con id 'a3f1c8d2-...' no está activa" } |

# **4\. Asignación de Tareas por Desarrollador**

Cinco devs, cinco features. Lean la suya, entiendan de quién dependen, y avisen si hay un blocker antes de que sea tarde.

| Dev 1  *— Fundaciones & Shared ← Eduardo* |
| :---- |
| **Tareas asignadas:** **→** Inicializar el proyecto: npm init, instalar Express, nodemon (devDependency), uuid **→** Crear la estructura de carpetas completa (ver Sección 2\) con archivos vacíos como placeholder **→** Implementar src/shared/store.js: exportar los tres arrays vacíos { sucursales: \[\], productos: \[\], pedidos: \[\] } **→** Implementar src/shared/errorHandler.js: middleware (err, req, res, next) que responde { "error": err.message } con el status del error o 500 **→** Implementar src/index.js: inicializar Express, usar express.json(), registrar los tres routers, usar errorHandler, iniciar servidor en puerto 3000 **→** Agregar GET /api/health que responda { "status": "ok", "timestamp": "2025-..." } con 200 **→** Documentar en README.md cómo instalar dependencias y cómo correr el proyecto **Archivos a crear:**   **src/index.js**   **src/shared/store.js**   **src/shared/errorHandler.js**   **package.json**   **README.md** |

| Dev 2  *— Feature: Sucursales ← Paula Berni* |
| :---- |
| **Tareas asignadas:** **→** sucursal.model.js: función createSucursal({ nombre, tipo, direccion }) que retorna el objeto completo con id (uuid), activa: true y fechaCreacion **→** sucursal.service.js: implementar crear(), listar(), obtenerPorId(), actualizar(), desactivar() **→** desactivar() pone activa: false. Si el pedidoService detecta pedidos activos de esa sucursal, lanzar error con status 409 **→** Agregar y exportar esSucursalActiva(id): retorna true/false. El Dev 4 la va a importar desde su service **→** sucursal.controller.js: una función por endpoint, cada una lee req.body/params, llama al service y responde con res.status().json() **→** sucursal.routes.js: crear Router de Express y mapear los 5 endpoints **→** Validar que nombre, tipo ("sucursal"|"franquicia") y direccion sean obligatorios. Si falta alguno, lanzar error con status 400 **Archivos a crear:**   **src/sucursales/sucursal.model.js**   **src/sucursales/sucursal.service.js**   **src/sucursales/sucursal.controller.js**   **src/sucursales/sucursal.routes.js** |

| Dev 3  *— Feature: Productos ← Melissa Galeano* |
| :---- |
| **Tareas asignadas:** **→** producto.model.js: función createProducto({ nombre, descripcion, precio, categoria }) que retorna el objeto con id, disponible: true y fechaCreacion **→** producto.service.js: implementar crear(), listar(), obtenerPorId(), actualizar(), eliminar() **→** eliminar() debe verificar que el producto no esté en pedidos con estado \!= "entregado". Si está, lanzar error 409 **→** Agregar y exportar obtenerProductosPorIds(ids): recibe array de ids, retorna los objetos productos encontrados. El Dev 4 la importa para validar pedidos **→** producto.controller.js y producto.routes.js con los 5 endpoints **→** Validar que nombre (string no vacío), precio (número \> 0\) y categoria sean obligatorios. Errores con status 400 **Archivos a crear:**   **src/productos/producto.model.js**   **src/productos/producto.service.js**   **src/productos/producto.controller.js**   **src/productos/producto.routes.js** |

| Dev 4  *— Feature: Pedidos ← Leandro Parys* |
| :---- |
| **Tareas asignadas:** **→** pedido.model.js: función createPedido({ sucursalId, productos, observaciones }) que retorna el objeto con id, estado: "pendiente", fechaPedido y fechaActualizacion **→** pedido.service.js: implementar crear(), listar(), obtenerPorId(), cambiarEstado(), cancelar() **→** En crear(): importar esSucursalActiva() del Dev 2 y obtenerProductosPorIds() del Dev 3\. Si alguna validación falla, lanzar error 400 **→** En listar() y obtenerPorId(): hacer populate manual. Reemplazar sucursalId por el objeto sucursal, y cada productoId por el objeto producto correspondiente **→** cambiarEstado(): validar la transición. Solo se permite: pendiente→en\_produccion, en\_produccion→despachado, despachado→entregado. Cualquier otro caso: error 400 **→** cancelar(): solo si estado es "pendiente". Si no, error 409 con mensaje claro **→** pedido.controller.js y pedido.routes.js con los 5 endpoints incluyendo PATCH /:id/estado **Archivos a crear:**   **src/pedidos/pedido.model.js**   **src/pedidos/pedido.service.js**   **src/pedidos/pedido.controller.js**   **src/pedidos/pedido.routes.js** |

| Dev 5  *— Integración & Validación Final ← Marcelo* |
| :---- |
| **Tareas asignadas:** **→** Crear la colección de Postman (postman\_collection.json) con los 15 endpoints documentados, con ejemplos de body para cada POST/PUT/PATCH **→** Hacer la prueba de integración end-to-end: crear sucursal → crear producto → crear pedido → avanzar estados → intentar cancelar pedido en\_produccion (debe dar 409\) **→** Verificar que TODOS los endpoints responden JSON en éxito y en error. Si alguno no lo hace, reportarlo al dev responsable **→** Agregar al README la sección "Colección de endpoints" con tabla de todos los endpoints, método, ruta y descripción corta **→** Coordinar la demo final: levantar el servidor, ejecutar la colección Postman completa y verificar que todos los status HTTP sean los documentados en la Sección 3 **Archivos a crear:**   **postman\_collection.json**   **README.md (sección Endpoints)** |

# **5\. Dependencias entre Módulos**

El flujo de imports entre features. Si no respetan esto, van a tener errores de referencia circulares o funciones undefined.

| Este módulo... | ...importa de | Función específica |
| :---- | :---- | :---- |
| **pedido.service.js** | sucursal.service.js | esSucursalActiva(id) |
| **pedido.service.js** | producto.service.js | obtenerProductosPorIds(ids) |
| **producto.service.js** | shared/store.js | Lee store.pedidos para validar eliminación |
| **sucursal.service.js** | shared/store.js | Lee y escribe store.sucursales |
| **Todos los services** | shared/store.js | Cada feature lee/escribe su array correspondiente |

| Dev 1 tiene que terminar shared/store.js el día 1\. Sin el store, nadie puede arrancar su feature. |
| :---- |

# **6\. Estándares de Código**

## **6.1. Códigos HTTP**

| Código | Cuándo | Ejemplo |
| :---- | :---- | :---- |
| **200 OK** | GET, PUT, PATCH exitoso | Listar pedidos, actualizar estado |
| **201 Created** | POST que crea un recurso nuevo | Crear pedido, registrar sucursal |
| **400 Bad Request** | Datos faltantes, inválidos o transición imposible | Crear pedido sin productos, precio negativo |
| **404 Not Found** | El ID no existe en el store | GET /api/pedidos/id-inexistente |
| **409 Conflict** | Acción bloqueada por estado actual del negocio | Eliminar sucursal con pedidos activos |
| **500 Server Error** | Error inesperado capturado por errorHandler | Cualquier excepción no manejada |

## **6.2. Reglas no negociables**

* Todo controller responde res.status(xxx).json({ ... }). Nada más. Jamás res.send() con texto plano.

* Nunca pongas lógica de negocio en el controller. El controller habla con el service y responde JSON.

* Nunca accedas al store directamente desde el controller. Siempre a través del service.

* Todos los IDs se generan con uuid() en el model. Nunca con Math.random() ni Date.now().

* Las fechas se guardan siempre como ISO string: new Date().toISOString()

* Si catcheás un error y no lo relanzás, estás ocultando un bug. Siempre usá next(err) en el controller.

| Regla de oro: si el endpoint puede fallar, tiene que responder { "error": "mensaje claro" } con el código HTTP correcto. Nunca dejar que el servidor explote con un 500 sin respuesta. |
| :---- |

# **7\. Preguntas Frecuentes**

**¿Puedo usar una librería extra?**

Para el TP1: Express, nodemon y uuid. Nada más. El objetivo es entender la capa de datos antes de agregar abstracciones.

**¿Cómo comparto una función entre features?**

Importás el service directamente: const { esSucursalActiva } \= require("../sucursales/sucursal.service"). Eso es exactamente lo que tiene que pasar entre Dev 2 y Dev 4\.

**¿Qué pasa si el store se vacía al reiniciar el servidor?**

Es esperado. El TP1 usa in-memory. En la siguiente entrega lo conectamos a MongoDB. Por ahora es una decisión de diseño, no un bug.

**¿El populate es obligatorio?**

Sí, en los endpoints GET de pedidos. La respuesta JSON no puede tener solo IDs. Tiene que tener los objetos completos de sucursal y productos.

| Cualquier duda: primero leen la consigna, después este brief. Si sigue sin resolverse, me preguntan con el código que intentaron, no con "no entiendo cómo hacerlo". |
| :---- |

# Pestaña 2

## **Caso 4: Panificadora Industrial "La Espiga de Oro S.R.L."** 

Se propone desarrollar un sistema para una **fábrica de panificados** que cuenta con cinco sucursales propias y una red de diez franquicias, donde la planta centraliza la producción de masas y productos terminados. La organización presenta una estructura matricial y descentralizada, en la cual los franquiciados poseen autonomía operativa, pero deben cumplir estándares definidos por la marca, generando tensiones cuando existen demoras en la entrega de pedidos. Actualmente, la empresa enfrenta problemas derivados de la desconexión digital, ya que los pedidos se reciben de forma informal (por ejemplo, mediante mensajería), dificultando la planificación de la producción y la compra de materia prima. El objetivo del trabajo es diseñar e implementar un  sistema que permita registrar y gestionar pedidos, integrar la información entre planta, sucursales y franquicias, y generar datos confiables para mejorar la planificación productiva y la toma de decisiones.

El sistema deberá permitir modelar la interrelación entre los distintos actores (planta, sucursales y franquicias) desde un enfoque sistémico, registrar pedidos de productos, gestionar estados de pedidos (pendiente, en producción, despachado, entregado), y consolidar la información necesaria para planificar la producción y la compra de insumos. Asimismo, deberá contemplar la construcción de un **portal de pedidos para franquiciados**, mediante el cual estos puedan realizar solicitudes estructuradas, evitando la dispersión de la información. El sistema deberá permitir visualizar la demanda consolidada, detectar retrasos en la entrega, y generar información útil para la conciliación de facturación interna y externa, así como el seguimiento del cobro de royalties.

El sistema deberá diseñarse bajo una arquitectura modular, separando modelos, rutas, servicios y almacenamiento en memoria, validando datos obligatorios y respondiendo en formato JSON con códigos HTTP adecuados. Además, deberá contemplar requerimientos no funcionales vinculados a la escalabilidad, mantenibilidad y consistencia de la información, permitiendo su futura integración con bases de datos como MongoDB y con interfaces de usuario. Se espera que la propuesta incluya una estrategia de implementación por etapas basada en metodologías ágiles como Scrum, favoreciendo una adopción progresiva del sistema y la mejora continua en la articulación entre los distintos actores del proceso productivo.

# Desarrollo de un CRUD con interacciones entre módulos

## Contexto general

Un CRUD (Create, Read, Update, Delete) permite gestionar datos de manera básica. En sistemas más completos, los diferentes módulos CRUD pueden interactuar entre sí, formando relaciones que reflejan procesos de negocio más complejos.

* Ejemplo de interacción genérica:

  * Un pedido pertenece a un cliente y puede contener varios productos.  
  * Una reserva se asocia a un usuario y a un servicio.  
  * Un empleado puede estar asignado a varias tareas o proyectos.

## Requerimientos funcionales genéricos con interacciones

### a) Crear registro

* Cada módulo debe poder crear registros propios (Ej: cliente, producto, pedido, etc.).  
* Algunos registros pueden requerir referencias a otros módulos:  
  * Al crear un pedido, se debe seleccionar un cliente existente y productos disponibles.  
* Validar que los datos obligatorios estén completos y que las referencias a otros módulos sean válidas.

### b) Leer registros

* Se puede listar información de un módulo incluyendo datos relacionados de otros módulos:  
  * Mostrar un pedido junto con el nombre del cliente y la lista de productos.  
  * Mostrar una reserva con el usuario y el servicio asociado.

### c) Actualizar registro

* Permitir modificar datos propios y referencias a otros módulos:  
  * Cambiar productos de un pedido.  
  * Reasignar una reserva/pago/servicio/otros a otro usuario.  
* Verificar que las referencias actualizadas existan.

### d) Eliminar registro

* Al eliminar un registro, considerar dependencias entre módulos:

  * No eliminar un cliente que tenga pedidos activos. Tener en cuenta que a veces no es eliminar sino bloquear, desactivar, etc.  
  * Permitir eliminar un producto solo si no está en ningún pedido activo.

## Flujo de trabajo genérico con interacciones

1. Alta de registro: Se crea un registro, con referencias a otros módulos si aplica.  
2. Consulta de registros: Se visualizan los registros y, opcionalmente, información relacionada de otros módulos.  
3. Modificación del registro: Se actualiza la información y relaciones con otros módulos.  
4. Baja del registro: Se elimina un registro, verificando que no existan dependencias críticas.

Este flujo refleja cómo un sistema real maneja múltiples entidades relacionadas, evitando inconsistencias y permitiendo un control integral de las operaciones del negocio.

## Se evaluará

* Mantener cada módulo CRUD que sea mantenible   
* Enseñar buenas prácticas:  
  * Validación de datos.  
  * Manejo de errores si las referencias no existen.  
    Separación modular: cada CRUD en su propio archivo (modelo, controlador, rutas).  
* Esta estructura prepara a los estudiantes para manejar bases de datos relacionales o NoSQL más adelante.  
* Hacer una breve grabación con el funcionamiento y explicación de 10 minutos. En esta instancia no es obligatorio, pero si en la segunda entrega. [Lineamientos generales sobre los videos](https://docs.google.com/document/d/1jDTuERRGjRPVpG9jf9D3G23nq_JHhcUMqSGzHxDOwso/edit?usp=sharing)

