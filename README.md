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

> Nota: el deploy quedó fijado al proyecto `art-synt-13037` y al sitio de Hosting `art-synt-13037` usando target `production` en `firebase.json/.firebaserc`, para evitar publicar por error en otro site.

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
npx firebase-tools login
```

2. Generá el build y desplegá Hosting al target correcto (`production` → `art-synt-13037`):

```bash
npm install
npm run build
npm run firebase:deploy:hosting
```

3. Si querés subir reglas/índices de Firestore también:

```bash
npm run firebase:deploy:firestore
```

## Checklist cuando aparece "Site Not Found" en Firebase Hosting

Si en `https://art-synt-13037.web.app` ves **Site Not Found** y en Console dice **"Esperando tu primera versión"**, el sitio todavía no tiene una versión publicada.

Seguí este checklist en orden:

1. **Firebase Console → Hosting**
   - Confirmá que estás en el proyecto `art-synt-13037`.
   - Si ves “Esperando tu primera versión”, falta desplegar desde CLI.

2. **Habilitar Authentication (obligatorio para login/registro de la app)**
   - Firebase Console → Authentication → Sign-in method.
   - Activá **Email/Password**.

3. **Crear Firestore Database**
   - Firebase Console → Firestore Database → Crear base de datos.
   - Elegí modo **Production** o **Test** (según tu etapa) y una región.
   - Luego publicá reglas e índices del repo:

   ```bash
   npm run firebase:deploy:firestore
   ```

4. **Deploy de Hosting (primer release)**

   ```bash
   npx firebase-tools login
   npm install
   npm run build
   npm run firebase:deploy:hosting
   ```

5. **Validar resultado**
   - En terminal deberías ver `Deploy complete!`.
   - En Firebase Console → Hosting debería aparecer una versión en “Versiones anteriores”.
   - Abrí `https://art-synt-13037.web.app` y hacé hard refresh (`Ctrl + F5`).

### Errores típicos y cómo corregirlos

- **Deploy successful pero sigue "Site Not Found"**
  - Verificá que el deploy vaya al target `production` (site `art-synt-13037`) y no a otro sitio del proyecto.
  - Ejecutá explícitamente:
    ```bash
    npx firebase-tools deploy --only hosting:production --project art-synt-13037
    ```

- **Deploy de carpeta vacía**
  - Este repo publica `dist` (`firebase.json` usa `"public": "dist"`).
  - Si no corriste `npm run build`, `dist` no tendrá el bundle final.

- **Pantalla en blanco después del deploy**
  - Revisá errores de JS en consola del navegador.
  - Confirmá que el `firebaseConfig` apunte al mismo proyecto (`art-synt-13037`) y que Firestore/Auth estén habilitados.

codex/find-config.ts-setup-options-hu10ak
=======

main
### Si falla con `firebase: not found`

El repo ahora ejecuta Firebase CLI con `npx firebase-tools` en los scripts de `package.json`, así no depende de tener `firebase` global instalado.

Si tu entorno bloquea `npx`, instalá Firebase CLI de forma global y volvé a ejecutar:

```bash
npm install -g firebase-tools
```
codex/find-config.ts-setup-options-hu10ak


## Verificación rápida del target de Hosting

Ejecutá este comando para confirmar que el target `production` está mapeado al site correcto:

```bash
npx firebase-tools target:apply hosting production art-synt-13037 --project art-synt-13037
```

> Si responde que el target ya existe, está bien: significa que `hosting:production` apunta al sitio correcto.
=======
main
