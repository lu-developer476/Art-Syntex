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

Art-Syntex (A/S Nexus) es una SPA orientada a catálogo, autenticación de usuarios y checkout básico. El frontend está construido con React + Vite y utiliza Firebase para autenticación, persistencia y despliegue. El repositorio también incluye un servicio Node.js independiente para envío transaccional de correos mediante Express y Nodemailer.

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

Servicio opcional ubicado en `server/` con:

- **Express 4**
- **CORS** configurable por origen
- **Nodemailer** con transporte Gmail
- Validación y sanitización de payloads
- Rate limiting en middleware reutilizable
- Endpoint de salud (`GET /health`)
- Manejo centralizado de errores HTTP
- Configuración centralizada de entorno
- Controllers y routes separados por responsabilidad
- Servicio de email aislado de Express
- Endpoints de correo:
  - `POST /contact`
  - `POST /registration-notice`

El backend procesa dos flujos transaccionales:

- Notificación de contacto/postulación al destinatario configurado y confirmación automática al remitente.
- Correo complementario de onboarding para guiar la validación de cuenta registrada en Firebase Authentication.

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
- `notifications`: eventos operativos internos

### Hosting

La SPA está preparada para desplegarse en **Firebase Hosting**, publicando la carpeta `dist` y resolviendo todas las rutas al `index.html` de Vite.

### Reglas e índices

El repositorio incluye:

- reglas de Firestore en `src/firebase/firestore.rules`
- índices de Firestore en `src/firebase/firestore.indexes.json`

Las reglas actuales permiten:

- lectura pública del catálogo
- escritura temporal en `products` hasta el **1 de enero de 2030**
- acceso propietario a `users/{uid}`
- creación y lectura restringida de `purchaseOrders` al usuario autenticado dueño del documento
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

Servicio de correo (Node.js)
        |
        |-- app.js                 Composición de Express
        |-- config/env.js          Configuración de entorno
        |-- routes/                Entrada HTTP
        |-- controllers/           Orquestación de requests
        |-- services/              Integraciones externas
        |-- middleware/            Rate limit + errores
        \-- core/errors.js         Errores de aplicación

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

`VITE_API_BASE_URL` define la base de la API consumida por el frontend para `/contact` y `/registration-notice`. Si no se declara, el cliente usa `http://localhost:3001`.

### Backend

```env
EMAIL_USER=
EMAIL_PASS=
CONTACT_RECEIVER_EMAIL=
ALLOWED_ORIGIN=
APP_BASE_URL=
PORT=3001
```

Descripción:

- `EMAIL_USER`: cuenta emisora utilizada por Nodemailer.
- `EMAIL_PASS`: credencial o app password asociada a `EMAIL_USER`.
- `CONTACT_RECEIVER_EMAIL`: destinatario de las postulaciones; si no se informa, se utiliza `EMAIL_USER`.
- `ALLOWED_ORIGIN`: origen permitido por CORS.
- `APP_BASE_URL`: URL pública usada en links incluidos en los correos.
- `PORT`: puerto de escucha del servicio Express; por defecto `3001`.

`EMAIL_USER` y `EMAIL_PASS` son obligatorias para iniciar el backend. El frontend puede ejecutarse sin estas variables siempre que no se requiera el servicio de correo.

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
- El checkout requiere usuario autenticado y correo disponible en la sesión actual.
- El login invalida la sesión si la cuenta existe pero todavía no verificó el correo.
- El backend valida estructura y longitud de campos antes de enviar correos.
- El rate limit del servicio Express utiliza almacenamiento en memoria; para despliegues horizontales conviene reemplazarlo por un store externo.
- El backend separa configuración, routing, controllers, servicios, middleware y errores para mantener las responsabilidades aisladas.
- La colección `mail` figura en las reglas de Firestore, pero no existe escritura activa hacia esa colección dentro del código actual.
