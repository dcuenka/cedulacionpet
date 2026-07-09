# petdulación

**Registro Nacional de Mascotas del Ecuador** (servicio de RENIAC.EC). Plataforma para
crear la **ficha** de cada mascota (según el Formulario de Registro físico), registrar el
**número de serie del microchip**, el **Certificado N°** y el **Código QR N°**, emitir una
**cédula física con código QR** y permitir la **localización en caso de pérdida**.
Proyecto independiente.

Campos de la ficha (idénticos al formulario): Microchip N°, Certificado N°, Código QR N°,
nombre, especie, raza, fecha de nacimiento, sexo, color, esterilizado, adiestramiento,
antecedentes de agresión, alimentación (balanceado/casera/mixta), fecha última vacuna,
enfermedades; y del tutor: nombre, cédula, teléfono 1 y 2, correo, dirección, provincia,
ciudad. La marca se cambia en `src/lib/brand.ts`.

## Dos accesos

- **Administrador** (equipo interno): crea y gestiona las fichas, registra el microchip,
  emite la cédula PDF y puede marcar una mascota como perdida. Protegido por contraseña.
- **Consulta pública** (tutores, veterinarios, quien encuentre una mascota): solo lectura.
  Ingresa el número de serie del microchip o escanea el QR para ver la ficha y contactar
  al tutor. No puede registrar ni modificar información.

## Rutas

| Ruta                       | Acceso   | Qué hace                                             |
| -------------------------- | -------- | ---------------------------------------------------- |
| `/`                        | público  | Portada institucional                                |
| `/localizar`               | público  | Buscar por microchip / N.º de cédula                 |
| `/m/<código>`              | público  | Ficha de localización (lo que abre el QR) + contacto |
| `/admin`                   | admin    | Panel: listado y búsqueda de fichas                  |
| `/admin/nueva`             | admin    | Crear ficha                                          |
| `/admin/<id>`              | admin    | Ficha completa (técnica + salud + tutor), QR, PDF    |
| `/admin/<id>/editar`       | admin    | Editar (aquí se registra el microchip tras implante) |
| `/cedula/<n.º>`            | admin    | Vista de la cédula recién emitida + descarga PDF     |
| `/api/cedula/<n.º>`        | —        | Genera la cédula en PDF                              |

El **QR de cada cédula** codifica `/m/<número de serie del microchip>` (o el N.º de ficha
si aún no hay microchip).

## Correr en local

```bash
npm install
cp .env.example .env      # ajusta ADMIN_PASSWORD y los secretos
npm run db:push           # crea la base SQLite local (prisma/dev.db)
npm run dev               # http://localhost:3000
```

Entra a `/admin` con la contraseña de `ADMIN_PASSWORD` para crear la primera ficha.

## Stack

Next.js 16 · React 19 · Prisma · Tailwind CSS 4 · `pdf-lib` (cédula PDF) · `qrcode` (QR).
La foto se guarda comprimida (JPEG base64) dentro de la ficha — sin almacenamiento externo.

## Despliegue en Vercel + Neon

Ver [`DEPLOY.md`](./DEPLOY.md).
