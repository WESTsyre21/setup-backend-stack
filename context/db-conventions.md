# DB Environment Variable Conventions

All variable names below must be consistent across `docker-compose.yml`, `.env`,
and ORM configuration. A mismatch between any two of these files is the most
common source of connection failures.

## Required variables

| Variable       | Purpose                                  | Example         |
|----------------|------------------------------------------|-----------------|
| `DB_USER`      | PostgreSQL username                      | `postgres`      |
| `DB_PASSWORD`  | PostgreSQL password                      | `postgres`      |
| `DB_HOST`      | Hostname from the server's perspective   | `localhost`     |
| `DB_PORT`      | PostgreSQL port inside the container     | `5432`          |
| `DB_NAME`      | Target database name                     | `app_db`        |
| `HOST_DB_PORT` | Host machine port mapped to DB container | `5432`          |

## Host-based vs. containerised server

- **Host-based server** (server runs on your machine, DB in Docker):
  - `DB_HOST=localhost`, `DB_PORT=${HOST_DB_PORT}`
- **Containerised server** (both server and DB in Docker Compose):
  - `DB_HOST=<compose-service-name>` (e.g. `db`), `DB_PORT=5432`

## Prisma-specific

- `DATABASE_URL` must use the `postgresql://` scheme:
  ```
  postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}?schema=public
  ```
- `SHADOW_DATABASE_URL` is required when the DB user lacks `CREATEDB` privileges.
  See `references/prisma-config.md` → **Shadow database** for details.

## Migration metadata detection

Before running any initial migration command, check for existing metadata tables:

```sql
-- Prisma
SELECT 1 FROM _prisma_migrations LIMIT 1;

-- Sequelize
SELECT 1 FROM "SequelizeMeta" LIMIT 1;
```

If either table exists, follow the **baseline migration** flow in the relevant
reference file instead of re-running the init migration.
