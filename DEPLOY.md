# Despliegue en Vercel + Neon (paso a paso)

Objetivo: que la plataforma quede en línea en **https://cedulacionpet.vercel.app**
(o un dominio propio como `cedulacionpet.com` / `cedulacionpet.ec`).

El proyecto ya está listo: base PostgreSQL, build verificado y `prisma generate`
incluido en el `build`. Solo faltan tus cuentas.

---

## 1) Crear la base de datos en Neon

1. Entra a **https://neon.tech** e inicia sesión (puedes usar tu cuenta de GitHub).
2. **New Project** → nómbralo `cedulacionpet` → región **`AWS us-east-1` (N. Virginia)**.
   *(Se recomienda us-east-1 para emparejar con la región `iad1` de Vercel que ya
   está fijada en `vercel.json`, y así minimizar la latencia hacia la base.)*
3. En **Connection Details** copia las DOS cadenas:
   - **Pooled connection** (tiene `-pooler` en el host) → será `DATABASE_URL`
   - **Direct connection** (sin `-pooler`) → será `DIRECT_URL`

## 2) Subir el código a GitHub

El commit inicial ya está hecho (rama `main`). Solo falta crear el repo y subirlo.

**Opción A — GitHub CLI (más rápido).** Si no lo tienes instalado:

```bash
winget install --id GitHub.cli -e      # instalar (Windows)
gh auth login                          # inicia sesión (elige GitHub.com > HTTPS)
```

Luego, desde la carpeta del proyecto, un solo comando crea el repo y lo sube:

```bash
gh repo create cedulacionpet --private --source=. --remote=origin --push
```

**Opción B — manual.** Crea el repo `cedulacionpet` en github.com y luego:

```bash
git remote add origin https://github.com/TU_USUARIO/cedulacionpet.git
git push -u origin main
```

## 3) Importar en Vercel

1. Entra a **https://vercel.com** (inicia sesión con GitHub).
2. **Add New… → Project** → importa el repo `cedulacionpet`.
3. **Project Name:** escribe `cedulacionpet`. → la URL final será
   **https://cedulacionpet.vercel.app**
   *(si estuviera ocupado, usa `cedulacionpet-ec` o `registro-cedulacionpet`.)*
4. Framework: **Next.js** (se detecta solo). No cambies el build command.
5. En **Environment Variables** agrega:

   | Nombre                 | Valor                                             |
   | ---------------------- | ------------------------------------------------- |
   | `DATABASE_URL`         | cadena **Pooled** de Neon                         |
   | `DIRECT_URL`           | cadena **Direct** de Neon                         |
   | `NEXT_PUBLIC_SITE_URL` | `https://cedulacionpet.vercel.app`                |
   | `ADMIN_PASSWORD`       | la clave del panel de administración              |
   | `ADMIN_SESSION_SECRET` | secreto largo (genera con `openssl rand -base64 32`) |

6. **Deploy**.

> ⚠️ `NEXT_PUBLIC_SITE_URL` es la URL que se **codifica dentro del QR** de cada
> cédula y pasaporte. Debe ser la URL final de producción.

## 4) Crear las tablas en Neon

Una sola vez, desde tu máquina con el `.env` apuntando a Neon:

```bash
# en .env pon las cadenas de Neon en DATABASE_URL y DIRECT_URL
npx prisma db push
```

Esto crea la tabla de fichas. Vuelve a Vercel y haz **Redeploy** si hiciste el
push después del primer deploy.

## 5) Probar

- Abre `https://cedulacionpet.vercel.app`
- Entra a `/admin` con `ADMIN_PASSWORD`, crea una ficha y descarga la cédula y el
  pasaporte. Escanea el QR: debe abrir `https://cedulacionpet.vercel.app/m/<microchip>`.

## 6) Dominio propio (opcional)

Si compras `cedulacionpet.com` (o `.ec`):
1. Vercel → tu proyecto → **Settings → Domains → Add** → escribe el dominio.
2. Sigue las instrucciones DNS que te da Vercel (registros A/CNAME).
3. Cambia `NEXT_PUBLIC_SITE_URL` a `https://cedulacionpet.com` y **Redeploy**
   (para que los QR nuevos usen el dominio propio).

---

## Checklist de verificación post-deploy

Al terminar el deploy, revisa en orden (5 minutos):

- [ ] **Portada** abre en `https://cedulacionpet.vercel.app` y se ve la barra
      tricolor, la huella y la marca **Cedulación Pet**.
- [ ] **Base conectada:** `/admin` carga sin error 500. Si da error al crear una
      ficha → faltó `npx prisma db push` (crear tablas en Neon).
- [ ] **Login admin:** entras a `/admin` con tu `ADMIN_PASSWORD`.
- [ ] **Crear ficha** de prueba con microchip y foto → se genera la cédula.
- [ ] **Cédula PDF** descarga y muestra foto, datos, tricolor y QR.
- [ ] **Pasaporte PDF** descarga con sus 2 páginas (portada + datos con MRZ).
- [ ] **QR correcto (¡clave!):** escanéalo con el celular. Debe abrir
      `https://cedulacionpet.vercel.app/m/<microchip>`, **NO** `localhost`.
      Si abre localhost → corrige `NEXT_PUBLIC_SITE_URL` y **Redeploy**.
- [ ] **Localización pública:** en `/localizar` ingresas el microchip y aparece la
      ficha con el contacto del tutor (botón WhatsApp).
- [ ] **Perdida:** marca la ficha como perdida en el admin → `/m/<microchip>`
      muestra el banner rojo "PERDIDA".
- [ ] **Respaldo:** la ficha aparece en la lista de `/admin` (guardada en Neon).
- [ ] **Seguridad:** cierra sesión → `/admin` y `/cedula/...` redirigen al login.
- [ ] **Claves reales:** confirma que `ADMIN_PASSWORD` NO es la de ejemplo y que
      `ADMIN_SESSION_SECRET` es un valor aleatorio largo.

## Desarrollo local

Ahora el proyecto usa PostgreSQL. Para correr en local, pon en `.env` la cadena de
Neon (funciona desde cualquier lugar) y ejecuta:

```bash
npm install
npx prisma generate
npm run dev
```

*(Opcional: para trabajar sin conexión puedes volver temporalmente a SQLite
cambiando `provider = "postgresql"` a `"sqlite"` en `prisma/schema.prisma` y usando
`DATABASE_URL="file:./dev.db"`.)*
