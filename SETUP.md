# Setup – App Mercado Libre Vitrina

## 1. Supabase (base de datos)

1. Entra a [supabase.com](https://supabase.com) y crea un proyecto nuevo.
2. Ve a **SQL Editor** y ejecuta el contenido de `supabase/schema.sql` para crear las tablas.
3. Ve a **Project Settings → API** y copia:
   - `Project URL`
   - `anon / public` key

## 2. Variables de entorno

Crea el archivo `.env.local` en la raíz del proyecto (copia de `.env.local.example`):

```
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
```

## 3. Ejecutar en local

```bash
npm install
npm run dev
```

Abre http://localhost:3000

## 4. Deploy en Vercel

1. Sube el proyecto a un repositorio de GitHub.
2. En [vercel.com](https://vercel.com) importa el repositorio.
3. En **Environment Variables** agrega las mismas dos variables de `.env.local`.
4. Deploy. Vercel detecta Next.js automáticamente.

## 5. Habilitar Realtime en Supabase

En el dashboard de Supabase:
- Ve a **Database → Replication**
- Activa las tablas `ingresos` y `bonos` en la publicación `supabase_realtime`

(El schema.sql ya incluye este comando, pero si falla manualmente actívalo aquí.)

## URLs de la app

| Módulo | Ruta |
|--------|------|
| Inicio | / |
| Ingreso | /ingreso |
| Actividad 1 – Grito de Gol | /actividad1 |
| Actividad 2 – Gol James | /actividad2 |
| Dashboard general | /dashboard |
