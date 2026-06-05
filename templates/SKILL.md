---
name: backend-setup-stack
description: Use this skill when the user wants to initialize a local development environment using Docker, PostgreSQL, an npm server, and an ORM (Prisma/Sequelize) with automated migration workflows, including detection of existing migration metadata and database readiness checks.
prerequisites:
  - Docker and Docker Compose installed locally
  - Node.js and npm installed locally
version: 1.1.0
---

# Skill: Docker + PostgreSQL + npm Server + ORM Architecture Setup

## Objective
To scaffold a containerized local development ecosystem that connects an npm backend server to a Dockerized PostgreSQL instance via an ORM, establishing automated, version-controlled database migrations.

## Phase 1: Environment Assessment & State Initialization
1. **Check capabilities:** Confirm whether you have filesystem write access and shell execution access.
   - If yes, perform actions and report outputs.
   - If no, output exact commands and file contents and ask the user to execute them.
2. **Analyze Requirements:** Scan the user's prompt for specific configuration choices:
   - If the user does not specify an ORM, select Prisma.
   - Only select Sequelize if the user explicitly includes the exact token `Sequelize` (case-insensitive).
   - If both ORMs are mentioned or the request is ambiguous, ask: "Which ORM do you prefer: Prisma or Sequelize?"
   - Chosen web framework (e.g., Express, Fastify).
   - Custom port preferences (default to 3000 for server, 5432 for DB).
3. **Anchor State to Disk:** If you have write access, create or update `.claude_history/setup_status.md` in the project root with the chosen ORM, DB connection string, and initialization checklist. If you do not have write access, print the exact commands and file contents to create or update that file and ask the user to confirm.

## Phase 2: Structural Scaffolding & ORM Initialization
If running as an agent with filesystem access, execute the following commands and report results. Otherwise, print the exact shell commands and file contents and ask the user to run them.
1. Confirm Docker availability:
   - Run `docker --version` and `docker-compose --version`.
   - If either command is missing, instruct: "Install Docker Desktop (https://www.docker.com/products/docker-desktop) or run your platform's Docker install instructions" and abort further steps.
2. Initialize npm if no `package.json` exists: `npm init -y`
3. Install the core backend and database dependencies:
   - For Express apps: `npm install express`
   - For Prisma: `npm install @prisma/client` and `npm install -D prisma`
   - For Sequelize: `npm install sequelize pg pg-hstore` and `npm install -D sequelize-cli`
   - If using `nodemon` for development, also run `npm install -D nodemon`
4. Ensure `package.json` contains a `dev` script. If absent, add one before running:
   - Example: `npm pkg set scripts.dev "node server.js"`
   - Or: `npm pkg set scripts.dev "nodemon server.js"`
5. Trigger the ORM initialization command:
   - Prisma: `npx prisma init` (generates `/prisma/schema.prisma` and updates `.env`)
   - Sequelize: `npx sequelize-cli init` (generates `/models`, `/migrations`, `/seeders`, `/config`)

## Phase 3: Defensive Configuration Generation
Generate the following configuration blocks using this exact variable map template:
- `DB_USER=postgres`
- `DB_PASSWORD=postgres`
- `DB_HOST=localhost`
- `DB_PORT=5432`
- `DB_NAME=app_db`
- `HOST_DB_PORT=5432`

### 1. `docker-compose.yml`
- Must use named volume persistence (`pgdata`).
- Ensure the docker-compose service maps host port `${HOST_DB_PORT}` to container port `5432`.
- For host-based development, `.env` should use `DB_HOST='localhost'` and `DB_PORT='${HOST_DB_PORT}'`.
- If the server itself runs in a container, set `DB_HOST` to the compose service name and `DB_PORT` to `5432`.

### 2. Database URL Configuration (`.env`)
- Construct the fully qualified connection string required by the ORM.
- Format for Prisma:
  `DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}?schema=public"`
- If migrations fail with authentication errors, print the CLI error, verify `.env` values for `DB_USER`/`DB_PASSWORD`/`DB_HOST`/`DB_PORT`/`DB_NAME`, and show the exact command to test the connection:
  `psql postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME} -c '\l'`

### 3. Baseline Schema & Seed Files
- Detect project type: if `package.json` contains `typescript` or `tsconfig.json` exists, prefer `prisma/seed.ts` and add a `seed` script using `ts-node`.
- Otherwise generate `seed.js` and add a `seed` script using `node`.
- **Prisma:** Create a boilerplate `User` or `HealthCheck` model inside `prisma/schema.prisma`.
- **Sequelize:** Generate an initial model configuration file.
- If a migrations metadata table (`_prisma_migrations` or `SequelizeMeta`) already exists, do not run the initial `init` migration. Instead detect the table and either:
  - prompt the user to create a baseline migration matching the current schema, or
  - instruct how to mark migrations as applied using the ORM's baseline/seed workflow.

### 4. Application Server Entrypoint (`server.js`)
- Import and instantiate the ORM client (e.g., `const prisma = new PrismaClient()`).
- Replace raw SQL queries with ORM-native health checks:
  - For Prisma: use `await prisma.user.findFirst()` or `await prisma.$executeRaw('SELECT 1')` only if necessary.
  - For Sequelize: use `await sequelize.authenticate()`.

## Phase 4: Automated Migration & Verification Loop
Do not mark this skill as complete until the entire stack passes this operational gate:
1. **Container Orchestration:** Spin up the database using `docker-compose up -d`.
2. **Wait for DB readiness:** After `docker-compose up -d`, wait for PostgreSQL to accept connections with a retry loop:
   - Retry up to 15 times with 2s backoff (maximum 30s).
   - Use `pg_isready` or a TCP connect to `${DB_HOST}:${DB_PORT}`.
3. **Existing migration metadata detection:** If `_prisma_migrations` or `SequelizeMeta` already exists, do not run the initial `init` migration. Prompt for a baseline migration or marking migrations as applied.
4. **The Migration Gate:** Execute the schema migration:
   - Prisma: `npx prisma migrate dev --name init`
   - Sequelize: `npx sequelize-cli db:migrate`
5. **Database Inspection:** Verify that the metadata table (`_prisma_migrations` or `SequelizeMeta`) exists in the container.
6. **Client Generation (If Prisma):** Run `npx prisma generate` explicitly.
7. **Integration Run:** Ensure `package.json` has a `dev` script, then start the server and hit `/health` to confirm the ORM client can read the database schema.
8. **Update State:** Mark all items complete in `.claude_history/setup_status.md`.

## Phase 5: Error Mitigation Protocol
Handle failures in a flat deterministic sequence with explicit retries:
1. **Docker availability failure:** If `docker` or `docker-compose` is not found, run `docker --version` and `docker-compose --version`, then instruct: "Install Docker Desktop (https://www.docker.com/products/docker-desktop) or run your platform's Docker install instructions." Abort until Docker is available.
2. **DB readiness failure:** If PostgreSQL does not accept connections, retry `pg_isready` or TCP connect up to 15 attempts with 2s backoff. If still failing, collect container logs and fail with exact diagnostic output.
3. **Authentication failure:** If migrations fail with authentication errors, print the CLI error, verify `.env` values for `DB_USER`/`DB_PASSWORD`/`DB_HOST`/`DB_PORT`/`DB_NAME`, and show:
   `psql postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME} -c '\l'`
4. **Prisma shadow DB permission failure:** If Prisma cannot create a shadow database due to permissions, instruct the user to provide an explicit shadow database URL in `schema.prisma` or use a DB user with `CREATEDB` privileges. Show the exact schema snippet and env var to add.
5. **Dev script absence:** If `npm run dev` is not available, add the `dev` script via `npm pkg set scripts.dev "node server.js"` or `npm pkg set scripts.dev "nodemon server.js"` before retrying.
6. **Schema/migration failure:** If migration still fails after two retries due to invalid schema syntax or constraints, halt execution and write a diagnostic summary file (`setup_error.log`) with the exact CLI error output.
