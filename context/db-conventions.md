Use Postgres environment variable conventions for local development.

- `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`, `DB_NAME`, and `HOST_DB_PORT` must align across `docker-compose.yml`, `.env`, and ORM configuration.
- For Prisma, use `DATABASE_URL` with `postgresql://` and `SHADOW_DATABASE_URL` when needed.
- If `_prisma_migrations` or `SequelizeMeta` already exists, do not run an initial `init` migration. Instead detect the existing table and prompt for a baseline migration or marking migrations as applied.
- Wait for the PostgreSQL container to accept connections before running migrations.
- If Prisma cannot create a shadow database due to permissions, provide an explicit shadow database URL in `schema.prisma` or use a DB user with `CREATEDB` privileges.
