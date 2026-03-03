# Art-Synt — Cyberware Store (Portfolio Ready)

E-commerce conceptual estilo cyberpunk construido con **React + TypeScript + Tailwind + Firebase**.

## Qué incluye

- UI moderna y responsive para portfolio.
- Catálogo de 10 productos cargados desde Firestore.
- **Seed automático**: si la colección `products` está vacía, se insertan los 10 productos de `src/data/products.ts`.
- Configurado para deploy en **Firebase Hosting**.

## Stack

- Frontend: React + Vite + TypeScript
- UI: TailwindCSS
- DB: Firebase Firestore
- Hosting: Firebase Hosting

## Configuración local

1. Instalar dependencias:

```bash
npm install
```

2. Crear `.env` usando `.env.example`:

```bash
cp .env.example .env
```

3. Completar variables Firebase en `.env`.

4. Ejecutar en desarrollo:

```bash
npm run dev
```

## Deploy en Firebase

1. Build:

```bash
npm run build
```

2. Deploy:

```bash
npm run firebase:deploy:hosting
```

> Nota: ahora la configuración de Firebase está en la raíz (`firebase.json` y `.firebaserc`) para que Firebase CLI detecte automáticamente el proyecto correcto.

## Firestore sugerido

Colección: `products`.

Campos por documento:

- `id` (string)
- `name` (string)
- `price` (number)
- `image` (string)
- `description` (string)
- `category` (string)
- `featured` (boolean)

> Si no hay documentos, la app los crea automáticamente al iniciar.


## Configuración de Firebase (Auth + Firestore Orders)

1. En **Firebase Console → Authentication → Sign-in method**, habilitá **Email/Password**.
2. En **Firestore Database → Rules**, publicá las reglas de `firestore.rules` de este repo.
3. (Opcional) En **Extensions**, instalá **Trigger Email** si querés que la colección `mail` envíe correos.

### Flujo automático que ya implementa este proyecto

- **Registro de cuenta**: al hacer clic en `Registrarse`, la app crea el usuario en Firebase Authentication y además crea el perfil del cliente en `users/{uid}`.
- **Orden de compra**: al hacer clic en `Confirmar compra`, la app guarda una orden en la colección `purchaseOrders` con estado `pending`, items y total.

### Estructura esperada en Firestore

- `products/{productId}`: catálogo.
- `users/{uid}`: perfil básico del cliente autenticado.
- `purchaseOrders/{orderId}`: orden de compra generada automáticamente al confirmar carrito.
- `notifications/{id}`: eventos internos de la app.
- `mail/{id}`: mensajes para extensión de correo (si está activa).


## Pasos para publicar en Firebase Hosting

1. Iniciá sesión en Firebase CLI:

```bash
firebase login
```

2. Verificá que estés en el proyecto correcto:

```bash
firebase use
```

Debe mostrar `art-synt-13037` (se define por defecto en `.firebaserc`).

3. Generá el build y desplegá Hosting:

```bash
npm run build
npm run firebase:deploy:hosting
```

4. Si querés subir reglas/índices de Firestore también:

```bash
npm run firebase:deploy:firestore
```
