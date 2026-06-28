# Deploy de La Espiga de Oro — Atlas + Railway

Guía paso a paso para deployar el backend en hosting gratuito. Dos servicios independientes:

- **MongoDB Atlas** (free tier M0) — base de datos
- **Railway** (free tier con $5/mes de crédito) — código Node/Express + vistas Pug

---

## Parte 1 — MongoDB Atlas (la base de datos)

1. **Crear cuenta**: https://www.mongodb.com/cloud/atlas/register
2. **Crear un cluster gratuito (M0)**:
   - Click en **"Build a Database"** → elegir **M0 FREE** (Shared)
   - Provider: AWS (recomendado) o el que prefieras
   - Region: la más cercana a tu audiencia (ej. `São Paulo` para Argentina)
   - Cluster name: `laespiga` (o el que quieras)
   - Click **"Create Cluster"** — tarda 1-3 min en provisionar
3. **Crear usuario de base de datos**:
   - En el menú izquierdo: **Database Access** → **"Add New Database User"**
   - Authentication Method: Password
   - Username: `laespiga_user` (o el que quieras)
   - Password: generá una fuerte y **guardala** (la vas a necesitar)
   - Database User Privileges: `Read and write to any database`
   - Click **"Add User"**
4. **Permitir acceso desde cualquier IP** (para que Railway pueda conectarse):
   - Menú izquierdo: **Network Access** → **"Add IP Address"**
   - Click en **"Allow Access from Anywhere"** (agrega `0.0.0.0/0`)
   - Click **"Confirm"**
5. **Obtener la connection string**:
   - Volvé a **Database** (menú izquierdo) → click **"Connect"** en tu cluster
   - Elegí **"Drivers"**
   - Driver: Node.js, Version: 6.0 or later
   - Copiá la connection string. Se ve así:
     ```
     mongodb+srv://laespiga_user:<password>@laespiga.xxxxx.mongodb.net/?retryWrites=true&w=majority
     ```
   - **Reemplazá `<password>`** por la contraseña real del paso 3
   - **Agregá el nombre de la DB** al final: `...mongodb.net/laespiga?retryWrites=true&w=majority`

   ✅ Tu connection string final debería verse así:
   ```
   mongodb+srv://laespiga_user:TuPasswordReal@laespiga.abc123.mongodb.net/laespiga?retryWrites=true&w=majority
   ```

---

## Parte 2 — Railway (el código)

1. **Crear cuenta**: https://railway.app/ → **"Login with GitHub"**
2. **Crear proyecto nuevo**:
   - Click **"New Project"** → **"Deploy from GitHub repo"**
   - Si es la primera vez, autorizá a Railway a acceder a tus repos
   - Buscá y elegí `TP-BackEnd-DesarrolloDeSistemasWeb` (o el nombre de tu repo)
3. **Configurar las variables de entorno** (CRÍTICO):
   - En el dashboard del proyecto, click en tu servicio → tab **"Variables"**
   - Click **"Raw Editor"** (es más rápido que agregar una por una)
   - Pegá esto reemplazando los valores:
     ```
     MONGODB_URI=mongodb+srv://laespiga_user:TuPasswordReal@laespiga.abc123.mongodb.net/laespiga?retryWrites=true&w=majority
     PORT=3000
     JWT_SECRET=<pegar_acá_un_secreto_fuerte_de_64_caracteres>
     JWT_EXPIRES_IN=24h
     NODE_ENV=production
     ```
   - **Para generar el `JWT_SECRET`**: andá a https://www.random.org/strings/?num=1&len=64&upperalpha=on&loweralpha=on&digits=on&unique=on&format=html o desde tu terminal:
     ```bash
     node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
     ```
   - Click **"Add"** o **"Save"**
4. **Esperar el primer deploy**:
   - Railway detecta Node, hace `npm install`, y arranca con `npm start`
   - Tarda 2-5 minutos la primera vez
   - En los logs deberías ver: `Servidor La Espiga de Oro corriendo en http://localhost:3000`
   - **El seeder corre automáticamente** y crea los 4 usuarios base
5. **Generar dominio público**:
   - Tab **"Settings"** del servicio → sección **"Networking"** → **"Generate Domain"**
   - Te da una URL tipo `https://la-espiga-de-oro.up.railway.app`
   - Esa es tu URL pública 🎉

---

## Parte 3 — Verificar que funciona

1. **Health check**: abrí `https://tu-app.up.railway.app/api/health` en el navegador
   - Debería devolver JSON: `{"status":"ok","timestamp":"..."}`
2. **Login desde el navegador**: andá a `https://tu-app.up.railway.app/login`
   - Login con `admin@laespiga.com` / `password123`
   - Navegá `/dashboard`, `/sucursales`, `/pedidos` — todo debería funcionar
3. **Probar la API con Postman**:
   - Importá `La Espiga de Oro - API Collection.postman_collection.json`
   - Cambiá la `base_url` en Postman a tu URL de Railway
   - Hacé login y probá los endpoints

---

## Troubleshooting

| Problema | Solución |
|----------|----------|
| `MongooseServerSelectionError: connect ECONNREFUSED` | El `MONGODB_URI` está mal o falta el paso 4 de Atlas (Network Access) |
| `Application failed to start` | Revisá los logs de Railway (tab "Deployments" → click en el deploy fallido → "View Logs") |
| Login devuelve 401 con credenciales correctas | El seeder no corrió. Conectate a Atlas con Compass y verificá que la colección `usuarios` tenga 4 docs |
| Las vistas cargan pero el JS no | Verificá que `/public/auth.js` y `/public/styles.css` respondan 200 |
| `JWT malformed` | El `JWT_SECRET` cambió entre deploys y los tokens viejos quedaron inservibles. Volvé a hacer login |

---

## Costos

- **Atlas M0**: gratis para siempre (512 MB, suficiente para un TP)
- **Railway**: $5 de crédito gratis/mes. Este proyecto Express consume ~$0.50/mes. Te queda crédito para probar todo el ciclo académico
- **Total: $0** mientras no excedas el crédito de Railway

Si en algún momento el crédito de Railway se acaba, podés migrar a **Render** (también free tier) cambiando solo el archivo `railway.json` por un `render.yaml`. El código no cambia.
