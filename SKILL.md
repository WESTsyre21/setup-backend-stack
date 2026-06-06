---
name: backend-setup-stack
description: >
  Bootstraps a local Node.js backend development stack with Docker, PostgreSQL,
  and an ORM (Prisma or Sequelize). Use this skill whenever the user wants to:
  initialize a new backend project, set up a Dockerized database locally, wire up
  an ORM with automated migrations, scaffold an Express server with a health
  endpoint, or repair a broken local dev environment involving Docker + Postgres.
  Also trigger when the user mentions any of: "set up backend", "docker postgres",
  "prisma setup", "sequelize setup", "local dev stack", "migrate my database",
  "scaffold express", or "backend boilerplate". If the user is starting any
  server-side Node.js project and hasn't mentioned a database setup, proactively
  suggest this skill.
prerequisites:
  - Docker and Docker Compose installed locally
  - Node.js (>=18) and npm installed locally
version: 2.0.0
---

# Skill: Docker + PostgreSQL + Node.js + ORM Stack Setup

## Objective

Scaffold a containerized local development ecosystem connecting an Express
backend to a Dockerized PostgreSQL instance via Prisma or Sequelize, with
automated version-controlled migrations and a verified health endpoint.

---

## Phase 1 — Capability Check & ORM Selection

**Check your environment first:**
- Do you have filesystem write access? Can you run shell commands?
- If **yes**: execute commands directly and report outputs.
- If **no**: print every command and file content verbatim; ask the user to run them and paste results back.

**ORM Selection Rules (strictly in order):**
1. If the user explicitly writes `Sequelize` (case-insensitive) → use Sequelize.
2. If both ORMs are mentioned or the request is ambiguous → ask: *"Which ORM do you prefer: Prisma or Sequelize?"*
3. Otherwise → default to **Prisma**.

**Record your state.** Create or update `.claude_history/setup_status.md` with:
- Chosen ORM and framework
- DB connection string template
- Checklist of phases (unchecked at start, checked as you complete them)

---

## Phase 2 — Structural Scaffolding

Run or print these commands in order:

```bash
# 1. Confirm Docker
docker --version
docker compose version        # or: docker-compose --version

# 2. Init npm (skip if package.json already exists)
npm init -y

# 3. Install runtime dependencies
npm install express

# 4. Install ORM dependencies
# For Prisma:
npm install @prisma/client && npm install -D prisma

# For Sequelize:
npm install sequelize pg pg-hstore && npm install -D sequelize-cli

# 5. Install dev tooling
npm install -D nodemon

# 6. Ensure a dev script exists
npm pkg set scripts.dev "nodemon server.js"

# 7. Initialize the ORM
# For Prisma:  npx prisma init
# For Sequelize: npx sequelize-cli init
```

> **If Docker is missing:** Stop. Instruct: *"Install Docker Desktop at https://www.docker.com/products/docker-desktop then re-run this skill."* Do not continue.

---

## Phase 3 — Configuration Generation

Generate all configuration files using the variable map below.
See [`references/prisma-config.md`](references/prisma-config.md) for Prisma-specific
config and [`references/sequelize-config.md`](references/sequelize-config.md) for
Sequelize-specific config.

### Default variable map

| Variable       | Default value  |
|----------------|---------------|
| `DB_USER`      | `postgres`    |
| `DB_PASSWORD`  | `postgres`    |
| `DB_HOST`      | `localhost`   |
| `DB_PORT`      | `5432`        |
| `DB_NAME`      | `app_db`      |
| `HOST_DB_PORT` | `5432`        |
| `PORT`         | `3000`        |

### `.env` file

```dotenv
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432
DB_NAME=app_db
HOST_DB_PORT=5432
PORT=3000
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/app_db?schema=public"
SHADOW_DATABASE_URL="postgresql://postgres:postgres@localhost:5432/app_db_shadow?schema=public"
```

### `docker-compose.yml`

```yaml
version: '3.9'
services:
  db:
    image: postgres:15
    restart: unless-stopped
    env_file:
      - .env
    environment:
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: ${DB_NAME}
    ports:
      - "${HOST_DB_PORT}:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER} -d ${DB_NAME}"]
      interval: 2s
      timeout: 5s
      retries: 15
volumes:
  pgdata:
```

> **Key:** The healthcheck replaces the manual retry loop — Docker will gate
> dependent services automatically. If you are running migrations from the host
> (not inside a container), still wait for `pg_isready` to succeed before running
> them (see Phase 4).

### `server.js`

Use the ORM-specific template from the relevant reference file. The shared
structure is:

```js
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// ORM client initialised here (see reference file)

app.get('/health', async (req, res) => {
  try {
    await /* ORM health check */;
    res.status(200).json({ status: 'ok' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

app.get('/', (_req, res) => res.send('Backend is running.'));

app.listen(PORT, () => console.log(`Server on http://localhost:${PORT}`));
```

---

## Phase 4 — Migration & Verification Gate

Do not mark this skill complete until every step in this gate passes.

```bash
# 1. Start the database
docker compose up -d

# 2. Wait for PostgreSQL readiness (host-based)
until pg_isready -h localhost -p ${HOST_DB_PORT} -U ${DB_USER}; do
  echo "Waiting for Postgres…"; sleep 2;
done

# 3. Check for existing migration metadata
#    Prisma:    SELECT 1 FROM _prisma_migrations LIMIT 1;
#    Sequelize: SELECT 1 FROM "SequelizeMeta" LIMIT 1;
#    If the table exists → do NOT run the init migration.
#    Instead: follow the baseline migration flow in the ORM reference file.

# 4. Run migrations
# Prisma:    npx prisma migrate dev --name init
# Sequelize: npx sequelize-cli db:migrate

# 5. (Prisma only) Generate the client
npx prisma generate

# 6. Start the server and verify the health endpoint
npm run dev &
sleep 3
curl -sf http://localhost:3000/health && echo "✅ Stack is healthy"
```

> **On success:** update `.claude_history/setup_status.md` — check off all phases.

---

## Phase 5 — Error Mitigation

Consult the table below when a step fails. Attempt the fix once; if it fails
again, write `setup_error.log` with the exact CLI output and stop.

| Failure | Diagnosis | Fix |
|---|---|---|
| `docker: command not found` | Docker not installed | Install Docker Desktop; abort until available |
| Postgres not accepting connections after 30 s | Container unhealthy | Run `docker compose logs db`; paste output |
| Auth error on migration | Wrong `.env` credentials | Run `psql postgresql://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME -c '\l'` |
| Prisma shadow DB permission denied | DB user lacks `CREATEDB` | Grant `CREATEDB` or add explicit `SHADOW_DATABASE_URL` (see `references/prisma-config.md`) |
| `npm run dev` not found | Missing dev script | Run `npm pkg set scripts.dev "nodemon server.js"` then retry |
| Migration schema error (2nd retry) | Invalid schema syntax | Write `setup_error.log`; halt and ask user to review schema |

---

## Reference files

Read the relevant file for ORM-specific details — do not load both:

- **Prisma setup, schema, seed, shadow DB:** [`references/prisma-config.md`](references/prisma-config.md)
- **Sequelize setup, models, migrations, config:** [`references/sequelize-config.md`](references/sequelize-config.md)
- **DB environment variable conventions:** [`context/db-conventions.md`](context/db-conventions.md)
- **Express server rules:** [`context/express-rules.md`](context/express-rules.md)
