# Art-Syntex

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![React Router](https://img.shields.io/badge/React_Router-CA4245?style=for-the-badge&logo=reactrouter&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-38B2AC?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)
![Firestore](https://img.shields.io/badge/Cloud_Firestore-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)
![Firebase Auth](https://img.shields.io/badge/Firebase_Auth-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)
![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![Nodemailer](https://img.shields.io/badge/Nodemailer-009688?style=for-the-badge)
![CORS](https://img.shields.io/badge/CORS-283593?style=for-the-badge)

Art-Syntex (A/S Nexus) es una SPA orientada a catálogo, autenticación de usuarios y checkout básico. El frontend está construido con React + Vite y utiliza Firebase para autenticación, persistencia y hosting. El backend HTTP de correo y checkout pertenece al mismo proyecto Art-Syntex y se conecta mediante `VITE_API_BASE_URL`. No requiere contratar ni incorporar otro proveedor.

## Estado actual del proyecto

### Frontend

Stack principal:

- **React 18**
- **TypeScript 5**
- **Vite 7**
- **React Router DOM 6**
- **Tailwind CSS 3**
- **Firebase SDK 10**

Rutas expuestas por la aplicación:

- `/`: home/landing de A/S Nexus.
- `/acceso`: registro, login, logout y estado de verificación.
- `/productos`: catálogo, filtros, carrito y checkout.
- `/contacto`: formulario de postulación/contacto.
- `/verificar-email`: centro informativo para cuentas pendientes o verificadas.

Capacidades implementadas:

- Carga del catálogo desde **Cloud Firestore**.
- Seed automático de `products` cuando la colección está vacía, utilizando `src/data/products.ts`.
- Registro de usuarios con **Firebase Authentication** usando email/password.
- Envío de verificación de correo mediante Firebase antes de habilitar el inicio de sesión.
- Persistencia de perfiles básicos en `users/{uid}`.
- Inicio y cierre de sesión con validación explícita del estado `emailVerified`.
- Carrito en memoria del cliente con control de cantidades y cálculo de totales.
- Generación de órdenes en `purchaseOrders` al ejecutar checkout.
- Registro de postulaciones/contactos en `contactMessages`.
- Escritura de eventos internos en `notifications` para altas, login y checkout.
- Navegación con **lazy loading** de páginas y `Suspense` para fallback de rutas.
- Selector de idioma **ES/EN** con preferencia persistida en `localStorage`.
- Selector de tema **oscuro/claro** con preferencia persistida en `localStorage`.
- Menú principal responsive con cierre al cambiar de ruta, click externo o tecla `Escape`.
- Catálogo con búsqueda por texto, filtro por categoría, orden por destacados/precio/nombre y vista ampliada de producto.

### Backend

La lógica de negocio y los servicios reutilizables están en `server/`. El servicio expone una API HTTP para correo y checkout; Express permite ejecutar el mismo backend localmente y el `Dockerfile` conserva el empaquetado del runtime.

- **Express 4** para la API HTTP.
- **Nodemailer** con SMTP configurable (Gmail por defecto).
- Validación, sanitización, CORS y rate limiting por ruta.
- Firebase Admin para verificar tokens, consultar el catálogo y registrar órdenes en Firestore.
- Endpoints: `GET /health`, `POST /contact`, `POST /newsletter/subscribe`, `POST /registration-notice` y `POST /checkout`.
- `netlify/functions/api.mjs` se conserva como adaptador alternativo y para pruebas; no es un requisito para desplegar el backend en Firebase.

Flujos transaccionales:

- Contacto: notificación interna y confirmación automática al remitente.
- Newsletter: alta en Firestore y bienvenida sin duplicar envíos.
- Registro: correo complementario para orientar la verificación de Firebase Authentication.
- Checkout: compra como invitado o con sesión Firebase, validación de datos y productos, creación de la orden en Firestore, generación del PDF y envío de copias al comprador y al buzón interno.
- Si SMTP no está configurado o no responde, la orden y el PDF se conservan; la respuesta informa que los correos no se entregaron.

### Calidad

El repositorio incluye una capa de calidad con:

- **Vitest** para unit/integration tests.
- **Testing Library** para componentes React.
- **V8 Coverage** para medición de cobertura.
- Tests de routing, Home, cliente HTTP, validación backend, configuración y límites de la aplicación Express.
- **GitHub Actions** para ejecutar tests y build en pushes y Pull Requests hacia `main`.

## Rol de Firebase

### Authentication

**Firebase Authentication** se utiliza con proveedor **Email/Password** para:

- alta de usuario
- inicio de sesión
- persistencia de sesión autenticada
- envío del email de verificación
- bloqueo de acceso mientras `emailVerified` sea `false`

### Cloud Firestore

**Cloud Firestore** funciona como base de datos principal para:

- `products`: catálogo
- `users`: perfiles de usuario
- `purchaseOrders`: órdenes generadas desde checkout
- `contactMessages`: mensajes/postulaciones enviadas desde contacto
- `newsletterSubscribers`: direcciones suscritas, consentimiento y estado del correo de bienvenida
- `notifications`: eventos operativos internos

### Hosting y API

La SPA se publica en **Firebase Hosting**, usando `dist/`. El backend HTTP se mantiene dentro del proyecto Art-Syntex en Firebase y expone su propia URL HTTPS. El frontend recibe esa URL mediante `VITE_API_BASE_URL`, configurada en las variables del entorno de build.

El workflow `.github/workflows/deploy-firebase-hosting.yml` publica el frontend y las reglas de Firestore. No crea servicios, activa facturación ni incorpora proveedores externos. El despliegue del runtime del backend se gestiona desde el recurso Firebase donde ya está alojado.

### Reglas e índices

El repositorio incluye:

- reglas de Firestore en `src/firebase/firestore.rules`
- índices de Firestore en `src/firebase/firestore.indexes.json`

Las reglas actuales permiten:

- lectura pública del catálogo
- escritura temporal en `products` hasta el **1 de enero de 2030**
- acceso propietario a `users/{uid}`
- lectura de `purchaseOrders` sólo al usuario propietario; las altas se realizan desde la API backend con Firebase Admin
- creación pública de `contactMessages`
- creación de `notifications` sólo por usuarios autenticados

## Arquitectura

```text
Frontend SPA (React + Vite)
        |
        |-- React Router DOM
        |-- Tailwind CSS
        |-- Firebase Authentication
        |-- Cloud Firestore
        \-- Firebase Hosting

API HTTP (backend de Art-Syntex en Firebase)
        |
        |-- server/index.js         Runtime Express
        |-- server/config/          Configuración SMTP
        |-- server/validation.js    Validación de payloads
        |-- server/services/        Firebase Admin, email y checkout PDF
        \-- netlify/functions/api.mjs  Adaptador alternativo para pruebas

Quality layer
        |
        |-- Vitest
        |-- Testing Library
        |-- V8 Coverage
        \-- GitHub Actions
```

## Estructura principal del repositorio

```text
src/
  components/        Componentes visuales reutilizables
  data/              Seed tipado del catálogo
  firebase/          Configuración, acceso a Firestore y reglas/índices
  hooks/             Lógica de auth, catálogo y carrito
  layout/            Shell principal y navegación
  lib/               Utilidades compartidas y cliente HTTP
  pages/             Entradas por ruta y pruebas de páginas
  sections/          Composición de cada página
  test/              Configuración global de Testing Library
public/
  images/            Recursos visuales del catálogo
server/
  index.js           Entry point del servicio
  app.js             Composición de Express
  config/env.js      Configuración y validación del entorno
  core/errors.js     Errores de aplicación
  controllers/      Controllers HTTP
  middleware/        Rate limiting y manejo global de errores
  routes/            Rutas HTTP
  services/          Integraciones de correo
  validation.js      Validación y sanitización testeable
```

## Requisitos

- **Node.js 18 o superior**
- **npm**
- Proyecto de **Firebase** con Authentication y Firestore habilitados
- Cuenta de correo apta para uso con **Nodemailer** si se ejecuta el backend

## Variables de entorno

### Frontend (`.env`)

Crear el archivo local a partir de `.env.example`:

```bash
cp .env.example .env
```

Variables requeridas:

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

Variable opcional:

```env
VITE_API_BASE_URL=http://localhost:3001
```

`VITE_API_BASE_URL` define la URL HTTPS del backend de Art-Syntex para `/contact`, `/newsletter/subscribe`, `/registration-notice` y `/checkout`. `http://localhost:3001` se usa únicamente con Express en desarrollo local. En producción, si la URL falta, los formularios que dependen de la API y el checkout no podrán completarse.

### Backend

El archivo `.env.example` incluye la configuración completa. Los valores actuales para correo son:

```env
EMAIL_USER=lucasmontenegroburgos@gmail.com
EMAIL_PASS=
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
CONTACT_RECEIVER_EMAIL=lucasmontenegroburgos@gmail.com
ORDER_RECEIVER_EMAIL=lucasmontenegroburgos@gmail.com
CONTACT_FROM=lucasmontenegroburgos@gmail.com
CONTACT_REPLY_TO=lucasmontenegroburgos@gmail.com
NEWSLETTER_FROM=lucasmontenegroburgos@gmail.com
REGISTRATION_FROM=lucasmontenegroburgos@gmail.com
ALLOWED_ORIGINS=http://localhost:5173
APP_BASE_URL=http://localhost:5173
PORT=3001
```

Descripción:

- `EMAIL_USER` y `EMAIL_PASS`: credenciales SMTP. Para Gmail, `EMAIL_PASS` debe ser una contraseña de aplicación; nunca se guarda en el repositorio.
- `SMTP_HOST`, `SMTP_PORT` y `SMTP_SECURE`: servidor, puerto y modo TLS del proveedor de correo. El valor predeterminado corresponde a Gmail SMTP.
- `CONTACT_FROM`: remitente de los avisos y confirmaciones del formulario.
- `CONTACT_RECEIVER_EMAIL`: casilla que recibe los mensajes del formulario.\n- `ORDER_RECEIVER_EMAIL`: casilla interna que recibe las órdenes de compra PDF.
- `CONTACT_REPLY_TO`: destino de respuesta para la confirmación enviada al cliente.
- `NEWSLETTER_FROM`: remitente independiente para las bienvenidas del newsletter.
- `REGISTRATION_FROM`: remitente para los avisos de registro.
- `ALLOWED_ORIGINS`: orígenes permitidos por CORS; admite una lista separada por comas. `ALLOWED_ORIGIN` sigue aceptándose por compatibilidad.
- `APP_BASE_URL`: URL pública usada en los enlaces de los correos.
- `PORT`: puerto de escucha de Express; por defecto `3001`.

Si no se declara `EMAIL_USER`, el backend utiliza `lucasmontenegroburgos@gmail.com`. Las credenciales de Firebase Admin son necesarias para las operaciones autenticadas. `EMAIL_PASS` es opcional: sin SMTP, la API sigue registrando órdenes y generando el PDF, pero marca los correos como no entregados.

#### Migración futura a un dominio propio

Cuando exista un dominio autenticado y un proveedor SMTP, no habrá que modificar el código. Se reemplazan las variables SMTP y los remitentes, por ejemplo `CONTACT_FROM=contacto@art-syntex.net` y `NEWSLETTER_FROM=newsletters@art-syntex.net`. El proveedor deberá tener verificadas esas direcciones/dominio y sus registros de autenticación. No alcanza con cambiar el texto del remitente si el SMTP actual no autoriza esa dirección.

## Ejecución local

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar entorno

- Completar `.env` con las credenciales de Firebase.
- Si se ejecuta el backend, exportar o definir las variables requeridas por `server/`.
- Habilitar en Firebase Console:
  - Authentication > Email/Password
  - Firestore Database

### 3. Iniciar el frontend

```bash
npm run dev
```

Vite expone la aplicación por defecto en `http://localhost:5173`.

### 4. Iniciar el backend de correo opcional

```bash
npm run server
```

El servicio Express escucha por defecto en `http://localhost:3001`.

## Build de producción

```bash
npm run build
```

Este comando ejecuta:

1. compilación TypeScript
2. build de Vite
3. emisión de artefactos en `dist/`

Vista previa local del build:

```bash
npm run preview
```

## Despliegue

### Hosting

```bash
npm run firebase:deploy:hosting
```

Publica `dist/` en Firebase Hosting según `firebase.json`.

### Firestore

```bash
npm run firebase:deploy:firestore
```

Publica reglas e índices definidos en `src/firebase/firestore.rules` y `src/firebase/firestore.indexes.json`.

### Despliegue completo

```bash
npm run firebase:deploy
```

Ejecuta el despliegue integral de recursos Firebase configurados en el proyecto.

## Scripts disponibles

```bash
npm run dev
npm run build
npm run preview
npm run server
npm run test
npm run test:watch
npm run test:coverage
npm run firebase:deploy
npm run firebase:deploy:firestore
npm run firebase:deploy:hosting
```

## Consideraciones operativas

- El seed del catálogo se ejecuta únicamente cuando `products` no contiene documentos.
- Los documentos existentes de `products` se normalizan contra el seed tipado: se validan ids/categorías, se corrigen rutas legacy de imágenes y se usan valores fallback cuando faltan campos.
- El checkout no requiere iniciar sesión ni crear una cuenta: el comprador ingresa nombre y correo en el carrito. Si existe una sesión Firebase válida, la orden también queda asociada a esa cuenta.
- El login invalida la sesión si la cuenta existe pero todavía no verificó el correo.
- El backend valida estructura y longitud de campos antes de enviar correos.
- El rate limit del backend usa almacenamiento en memoria por instancia; no es un contador distribuido global.
- El adaptador alternativo de Netlify se conserva por compatibilidad y pruebas; no forma parte del despliegue requerido en Firebase.
- El backend separa configuración, routing, controllers, servicios, middleware y errores para mantener las responsabilidades aisladas.
- La colección `mail` figura en las reglas de Firestore, pero no existe escritura activa hacia esa colección dentro del código actual.


## API y órdenes de compra PDF

### Configuración

El frontend debe compilarse con `VITE_API_BASE_URL` apuntando al endpoint HTTPS del backend que ya está desplegado para Art-Syntex en Firebase. Para desarrollo local, usar `http://localhost:3001` e iniciar Express con `npm run server`.

Variables privadas del backend:

- `FIREBASE_ADMIN_PROJECT_ID`
- `FIREBASE_ADMIN_CLIENT_EMAIL`
- `FIREBASE_ADMIN_PRIVATE_KEY`
- `EMAIL_PASS` (opcional; contraseña de aplicación de Gmail si se habilita SMTP)
- `ALLOWED_ORIGINS` con el origen de Firebase Hosting
- `APP_BASE_URL` con la URL pública de Art-Syntex

No hay que crear un sitio Netlify, contratar un plan externo ni desplegar otro servidor para seguir el flujo existente.

### Qué hace el checkout

1. El frontend envía los identificadores y cantidades del carrito, además del nombre y correo del comprador.
2. La compra como invitado no envía token ni requiere cuenta. Si hay una sesión Firebase, el token se valida de forma opcional para asociar la orden al usuario.
3. Los precios se vuelven a leer desde Firestore; no se confía en los importes enviados por el navegador.
4. La orden se guarda en `purchaseOrders` como `pending` / `unpaid`.
5. El backend genera un PDF con número de orden, fecha, cliente, productos, cantidades, precios unitarios y total.
6. El navegador descarga el PDF y, cuando SMTP está disponible, la API adjunta el mismo archivo al correo del comprador y al buzón interno.

El documento es una **orden de compra pendiente**, no una factura fiscal ni un comprobante de pago. El checkout actual no procesa pagos. La generación del PDF y el guardado de la orden son independientes del SMTP: si el proveedor de correo no está configurado o no responde, la orden y el PDF se siguen generando y la respuesta informa el estado de entrega de cada correo.
