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
firebase deploy --only hosting
```

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
