# ⚽ FootballAI — Pronósticos de Fútbol con IA

App web completa de pronósticos de partidos de fútbol con análisis de Inteligencia Artificial.

## Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | React 18 + Vite + TypeScript + Tailwind CSS + Framer Motion |
| Backend | Node.js + Express + Arquitectura MVC |
| Base de datos | PostgreSQL / Supabase |
| Auth | JWT (jsonwebtoken + bcryptjs) |
| IA | Google Gemini 1.5 Flash (pendiente integrar) |
| API Fútbol | API-Football via RapidAPI (pendiente integrar) |

## Estructura del proyecto

```
Football/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── components/     # Componentes reutilizables
│   │   ├── context/        # AuthContext (JWT)
│   │   ├── lib/            # Axios configurado
│   │   ├── pages/          # Páginas de la app
│   │   └── types/          # TypeScript interfaces
│   └── package.json
│
└── server/                 # Backend Express MVC
    ├── src/
    │   ├── controllers/    # Lógica de negocio
    │   ├── models/         # Acceso a datos (DB)
    │   ├── routes/         # Definición de endpoints
    │   ├── middleware/     # Auth JWT, validación, errores
    │   └── database/       # Conexión, migraciones, seed
    └── package.json
```

## Cómo correr el proyecto

### 1. Backend

```bash
cd server
npm install

# Copiar el .env
cp .env.example .env
# Editar .env con tu DATABASE_URL de Supabase

# Crear tablas
npm run db:migrate

# Insertar datos de prueba
npm run db:seed

# Correr servidor
npm run dev
```

El servidor corre en: `http://localhost:5001`

### 2. Frontend

```bash
cd client
npm install
npm run dev
```

El cliente corre en: `http://localhost:5173`

### 3. App móvil (Expo Go)

```bash
cd FootballMobile
npm install --legacy-peer-deps
npx expo start
```

Escanea el QR con Expo Go. El celular y la computadora deben estar en la misma red:
la app toma la IP del servidor automáticamente desde Metro (puerto 5001).
Para apuntar a otra URL define `EXPO_PUBLIC_API_URL`, por ejemplo `http://192.168.1.10:5001/api`.

Arquitectura MVC de la app (`FootballMobile/src`):

| Capa | Carpeta | Contenido |
|------|---------|-----------|
| Model | `models/`, `services/` | Entidades tipadas, mappers y repositorios HTTP, sesión JWT en SecureStore |
| Controller | `controllers/` | `AuthContext` y hooks de datos (`useHome`, `useMatch`, `useLeaderboard`...) |
| View | `app/`, `views/components/` | Pantallas Expo Router y componentes de UI animados |

## Credenciales de prueba

| Rol | Email | Contraseña |
|-----|-------|-----------|
| Admin | admin@football.com | admin123 |
| Usuario | demo@football.com | password123 |

## Endpoints del API

### Auth
- `POST /api/auth/register` — Registro
- `POST /api/auth/login` — Login (retorna JWT)
- `GET /api/auth/me` — Perfil (requiere JWT)

### Partidos
- `GET /api/matches` — Listar partidos (filtros: status, league_id)
- `GET /api/matches/today` — Partidos de hoy
- `GET /api/matches/:id` — Detalle con análisis de IA
- `PUT /api/matches/:id/result` — Actualizar resultado (solo admin)

### Predicciones
- `POST /api/predictions` — Crear predicción (requiere JWT)
- `GET /api/predictions/me` — Mis predicciones e historial
- `GET /api/predictions/leaderboard` — Clasificación global

### Ligas
- `GET /api/leagues` — Todas las ligas
- `GET /api/leagues/:id/teams` — Equipos de una liga
