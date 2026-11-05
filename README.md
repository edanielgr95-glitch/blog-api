# Blog API: Authors, Posts y Comments

API REST construida con **Node.js + Express + PostgreSQL** que gestiona authors, posts y comments (modelo tipo JSONPlaceholder). Incluye validaciones, manejo centralizado de errores, tests automatizados con Jest + Supertest, documentación OpenAPI con Swagger UI y deploy en Railway.

- **URL pública:** `https://TU-APP.up.railway.app` ← _se completa después del deploy_
- **Documentación interactiva:** `https://TU-APP.up.railway.app/docs`

---

## Índice

1. [Tecnologías](#tecnologías)
2. [Estructura del proyecto](#estructura-del-proyecto)
3. [Modelo de datos](#modelo-de-datos)
4. [Endpoints](#endpoints)
5. [Ejecutar en local](#ejecutar-en-local)
6. [Tests](#tests)
7. [Documentación OpenAPI](#documentación-openapi)
8. [Deploy en Railway](#deploy-en-railway)
9. [Decisiones de diseño](#decisiones-de-diseño)
10. [Registro del uso de IA](#registro-del-uso-de-ia)

---

## Tecnologías

| Herramienta | Uso |
|---|---|
| Node.js (>= 20) | Entorno de ejecución |
| Express 5 | Servidor HTTP y rutas |
| PostgreSQL + `pg` | Base de datos y conexión con `Pool` |
| dotenv | Variables de entorno |
| Jest + Supertest | Tests automatizados |
| swagger-ui-express + yaml | Documentación OpenAPI en `/docs` |
| GitHub Actions | Ejecuta los tests en cada push (CI) |
| Railway | Deploy de la API y de la base de datos |

---

## Estructura del proyecto

```
blog-api/
├── .github/workflows/ci.yml   # CI: corre los tests en cada push
├── db/
│   ├── setup.sql              # Schema: tablas, PK, FK, constraints e índices
│   └── seed.sql               # Datos de ejemplo
├── docs/
│   └── USO_DE_IA.md           # Registro detallado del uso de IA
├── scripts/
│   └── db.js                  # Ejecuta setup.sql y seed.sql (npm run db:*)
├── src/
│   ├── app.js                 # Configuración de Express (middlewares, rutas, errores)
│   ├── server.js              # Arranque del servidor (app.listen)
│   ├── db/pool.js             # Pool de conexiones a PostgreSQL
│   ├── routes/                # URL + método → controller
│   ├── controllers/           # Lógica HTTP: lee la request y decide el status code
│   ├── services/              # Acceso a datos: queries SQL parametrizadas
│   ├── middlewares/
│   │   ├── validate.js        # Validación de body, params y query
│   │   ├── errorHandler.js    # Manejo global de errores (400/404/500)
│   │   └── logger.js          # Log de cada request (método, ruta, status, tiempo)
│   └── utils/httpError.js     # Clase de error HTTP
├── tests/                     # Tests con Jest + Supertest
├── openapi.yaml               # Especificación OpenAPI 3
├── .env.example               # Variables de entorno de ejemplo
└── package.json
```

**Flujo de una request:**

```
Request → logger → route → validación → controller → service (SQL) → PostgreSQL
                                             ↓
Response ← controller (status + JSON) ←── resultado
         ← errorHandler (si algo falla en cualquier paso)
```

---

## Modelo de datos

```
authors (1) ──────< (N) posts (1) ──────< (N) comments
   │                                            │
   └──────────────────< (N) ────────────────────┘
```

| Tabla | Columnas | Reglas |
|---|---|---|
| **authors** | `id`, `name`, `email`, `bio`, `created_at` | `name` NOT NULL y no vacío · `email` NOT NULL y **UNIQUE** |
| **posts** | `id`, `author_id`, `title`, `content`, `published`, `created_at` | `author_id` **FK → authors.id** (`ON DELETE CASCADE`) · `title` y `content` NOT NULL y no vacíos · `published` por defecto `false` |

> El enunciado indica `author_id (FK -> users.id)`. Como en este modelo la tabla de usuarios se llama `authors`, la FK apunta a `authors.id`.
| **comments** _(extra credit)_ | `id`, `post_id`, `author_id`, `content`, `created_at` | `post_id` **FK → posts.id** (`ON DELETE CASCADE`) · `author_id` **FK → authors.id** (`ON DELETE SET NULL`) |

Índices: `posts(author_id)`, `comments(post_id)` y `comments(author_id)`, para acelerar las búsquedas por relación.

---

## Endpoints

### Authors

| Método | Ruta | Descripción | Respuestas |
|---|---|---|---|
| GET | `/authors` | Listar authors | 200 |
| GET | `/authors/:id` | Detalle de un author | 200 · 400 · 404 |
| POST | `/authors` | Crear author | 201 · 400 |
| PUT | `/authors/:id` | Actualizar author | 200 · 400 · 404 |
| DELETE | `/authors/:id` | Eliminar author (y sus posts) | 204 · 400 · 404 |

### Posts

| Método | Ruta | Descripción | Respuestas |
|---|---|---|---|
| GET | `/posts` | Listar posts. Admite `?limit=`, `?offset=` y `?published=true\|false`. Devuelve el total en el header `X-Total-Count` | 200 · 400 |
| GET | `/posts/:id` | Detalle de un post | 200 · 400 · 404 |
| GET | `/posts/author/:authorId` | Posts de un author, con el detalle del author | 200 · 400 · 404 |
| POST | `/posts` | Crear post | 201 · 400 |
| PUT | `/posts/:id` | Actualizar post | 200 · 400 · 404 |
| DELETE | `/posts/:id` | Eliminar post (y sus comments) | 204 · 400 · 404 |

### Comments (extra credit)

| Método | Ruta | Descripción | Respuestas |
|---|---|---|---|
| GET | `/comments` | Listar comments | 200 |
| GET | `/posts/:id/comments` | Comments de un post, con el nombre del autor | 200 · 400 · 404 |
| POST | `/comments` | Crear comment | 201 · 400 |
| DELETE | `/comments/:id` | Eliminar comment | 204 · 400 · 404 |

### Otros

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/health` | Estado del servidor |
| GET | `/docs` | Documentación Swagger UI |

### Ejemplos

**Crear un author**

```http
POST /authors
Content-Type: application/json

{ "name": "Ana García", "email": "ana@example.com", "bio": "Backend dev" }
```

```http
HTTP/1.1 201 Created

{ "id": 1, "name": "Ana García", "email": "ana@example.com", "bio": "Backend dev", "created_at": "2026-11-05T04:00:00.000Z" }
```

**Formato de error (igual en toda la API)**

```http
HTTP/1.1 400 Bad Request

{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request data",
    "details": [{ "field": "name", "issue": "is required" }]
  }
}
```

---

## Ejecutar en local

### Requisitos

- **Node.js 20 o superior**: verificar con `node -v`
- **PostgreSQL**, con una de estas opciones:
  - **Opción A (local):** [Postgres.app](https://postgresapp.com/) en Mac, o el instalador de [postgresql.org](https://www.postgresql.org/download/)
  - **Opción B (sin instalar nada):** la base PostgreSQL de Railway, usando su URL pública (`DATABASE_PUBLIC_URL`)

### Pasos

**1. Clonar e instalar dependencias**

```bash
git clone https://github.com/TU-USUARIO/blog-api.git
cd blog-api
npm install
```

**2. Configurar las variables de entorno**

```bash
cp .env.example .env
```

Edita `.env`:

| Variable | Descripción | Ejemplo |
|---|---|---|
| `PORT` | Puerto del servidor | `3000` |
| `DATABASE_URL` | Cadena de conexión a PostgreSQL | `postgresql://postgres:postgres@localhost:5432/blog_api` |
| `DB_SSL` | `true` si la base exige SSL | `false` |

> Con la opción A, crea antes la base con `createdb blog_api`. Con la opción B, pega en `DATABASE_URL` la `DATABASE_PUBLIC_URL` de Railway.

**3. Ejecutar el setup SQL (crear tablas) y el seed (datos de ejemplo)**

```bash
npm run db:init
```

O directamente con `psql`, si lo tienes instalado:

```bash
psql "$DATABASE_URL" -f db/setup.sql
psql "$DATABASE_URL" -f db/seed.sql
```

| Script | Qué hace |
|---|---|
| `npm run db:setup` | Ejecuta `db/setup.sql` (crea las tablas; no borra datos) |
| `npm run db:seed` | Ejecuta `db/seed.sql` **solo si la tabla authors está vacía** |
| `npm run db:init` | `db:setup` + `db:seed` |
| `npm run db:reset` | Borra todos los datos y vuelve a cargar el seed |

**4. Levantar el servidor**

```bash
npm run dev     # con recarga automática al guardar
npm start       # modo normal
```

La API queda en `http://localhost:3000` y la documentación en `http://localhost:3000/docs`.

---

## Tests

```bash
npm test                 # corre los 45 tests
npm run test:coverage    # además genera el reporte de cobertura (~88% de líneas)
```

**45 tests** con **Jest + Supertest**, en dos niveles:

| Archivo | Qué prueba | Cómo |
|---|---|---|
| `tests/authors.test.js`, `tests/posts.test.js`, `tests/comments.test.js` | Endpoints CRUD: rutas, validaciones, controllers, status codes y manejo de errores | Supertest hace requests reales a la app; los **services** se reemplazan por mocks |
| `tests/services.test.js` | Lógica de los services: que cada consulta sea **parametrizada** y devuelva lo esperado | El **Pool** de PostgreSQL se reemplaza por un mock |

- Cubren los flujos exitosos (200, 201, 204) y los de error: 400 por validación, JSON inválido, email duplicado o FK inexistente; 404; 500 por falla de la base; y rutas inexistentes.
- **No necesitan base de datos**, así que corren en cualquier máquina con `npm install`.
- **GitHub Actions** corre los tests en cada push (`.github/workflows/ci.yml`).

---

## Documentación OpenAPI

- **Archivo:** [`openapi.yaml`](./openapi.yaml) (OpenAPI 3.0.3)
- **Swagger UI:** con el servidor corriendo, entra a `/docs` (local: `http://localhost:3000/docs`). Cada endpoint se puede probar con **"Try it out"**.

---

## Deploy en Railway

### 1. Base de datos

En [railway.com](https://railway.com): **New Project → Database → PostgreSQL**.

### 2. Servicio de la API

En el mismo proyecto: **+ Create → GitHub Repo →** elegir este repositorio. Railway detecta Node.js y usa `npm start`.

### 3. Variables de entorno del servicio de la API

| Variable | Valor |
|---|---|
| `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` (referencia a la base de Railway) |
| `DB_SSL` | `false` |

`PORT` no hace falta: Railway lo define solo y la app lo lee con `process.env.PORT`.

### Internal URL vs. Public URL

Railway asigna a cada servicio una URL **interna** (solo accesible dentro del proyecto, por su red privada) y, opcionalmente, una **pública** (accesible desde internet).

| Servicio | Internal URL (red privada de Railway) | Public URL (internet) |
|---|---|---|
| **API** | `blog-api.railway.internal` | `https://TU-APP.up.railway.app` (se genera en **Settings → Networking → Generate Domain**) |
| **PostgreSQL** | `postgres.railway.internal:5432` (variable `DATABASE_URL`) | `xxxx.proxy.rlwy.net:PUERTO` (variable `DATABASE_PUBLIC_URL`, requiere activar **TCP Proxy**) |

- La API se conecta a la base por la **URL interna**: es más rápida, no sale a internet y no consume tráfico público.
- La **URL pública de la base** solo hace falta para conectarse desde tu computadora (por ejemplo, para correr `npm run db:init` localmente contra Railway).

### 4. Crear las tablas automáticamente

En el servicio de la API → **Settings → Deploy → Pre-Deploy Command**:

```bash
npm run db:init
```

Es seguro correrlo en cada deploy: `setup.sql` usa `CREATE TABLE IF NOT EXISTS` y el seed solo se carga si la base está vacía.

### 5. URL pública

En el servicio de la API → **Settings → Networking → Generate Domain**.

### 6. Verificar

```bash
curl https://TU-APP.up.railway.app/health
curl https://TU-APP.up.railway.app/authors
```

Cada `git push` a `main` genera un nuevo deploy automáticamente.

---

## Decisiones de diseño

- **Arquitectura en capas** (`routes → middlewares → controllers → services`): cada capa tiene una sola responsabilidad y se puede probar por separado.
- **Queries parametrizadas** (`$1, $2...`) en todos los services, para evitar SQL injection.
- **Manejo centralizado de errores** en `errorHandler.js`, que traduce los errores de PostgreSQL a HTTP:
  - `23505` (unique violation) → **400 Bad Request** (email duplicado)
  - `23503` (foreign key violation) → **400 Bad Request** (author o post inexistente)
  - `22P02`, `23502`, `23514` → **400 Bad Request**
  - cualquier otro error → **500** (sin exponer detalles internos)
- **Email duplicado → 400:** se respeta la lista de status codes del enunciado (200/201/204/400/404/500). La validación es doble: el middleware revisa el formato y la base garantiza la unicidad con `UNIQUE`.
- **Integridad referencial:** borrar un author borra sus posts (`CASCADE`); borrar un post borra sus comments (`CASCADE`); borrar un author conserva sus comments en posts de otros, con `author_id = NULL` (`SET NULL`).
- **Express 5:** los errores de funciones `async` llegan solos al middleware de errores, sin `try/catch` en cada controller.
- **PUT = reemplazo completo:** se exigen todos los campos obligatorios.
- **Paginación** en `GET /posts` con `limit` (máximo 100) y `offset`; el total se informa en el header `X-Total-Count` para no cambiar el formato de la respuesta.

---

## Cumplimiento del enunciado

| Requisito | Dónde está |
|---|---|
| Entidades `authors` y `posts` con los campos pedidos | `db/setup.sql` |
| Los 11 endpoints REST pedidos | `src/routes/` · tabla [Endpoints](#endpoints) |
| Validaciones: `name` no vacío, email único, `title`/`content`/`author_id` no vacíos | `src/middlewares/validate.js` + constraints en `db/setup.sql` |
| Códigos 200/201/204/400/404/500 | `src/controllers/` + `src/middlewares/errorHandler.js` |
| Consultas SQL parametrizadas en services | `src/services/` |
| Conexión con `pg` y `Pool` | `src/db/pool.js` |
| Scripts SQL de setup y seed | `db/setup.sql`, `db/seed.sql`, `npm run db:init` |
| Tests con supertest, ejecutables por npm | `tests/` · `npm test` |
| Documentación OpenAPI | `openapi.yaml` · `/docs` |
| `.env.example` (sin subir `.env`) | `.env.example` · `.gitignore` |
| Deploy en Railway | sección [Deploy en Railway](#deploy-en-railway) |
| Extra credit: `comments` con FKs, endpoints y borrado en cascada / `SET NULL` | `db/setup.sql`, `src/*/comments.*` |
| Registro del uso de IA | sección siguiente y `docs/USO_DE_IA.md` |

---

## Registro del uso de IA

Usé **Claude** (Anthropic) como tutor y como asistente que construyó gran parte del código, mientras yo revisaba, preguntaba y tomaba las decisiones. El registro completo, etapa por etapa (qué le pedí, qué hizo, qué hice yo y qué aprendí), está en **[docs/USO_DE_IA.md](./docs/USO_DE_IA.md)**.
