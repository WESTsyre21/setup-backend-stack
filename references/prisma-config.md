# Prisma Configuration Reference

## Contents
1. [schema.prisma](#schemaprisma)
2. [server.js snippet](#serverjs-snippet)
3. [Seed file](#seed-file)
4. [Shadow database](#shadow-database)
5. [Baseline migration (existing DB)](#baseline-migration-existing-db)

---

## `prisma/schema.prisma`

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider          = "postgresql"
  url               = env("DATABASE_URL")
  shadowDatabaseUrl = env("SHADOW_DATABASE_URL")
}

model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
}
```

> Only include `shadowDatabaseUrl` if the DB user has `CREATEDB` privileges or you
> have provisioned a dedicated shadow database. Remove the line if it causes errors
> and use the fix in the Shadow database section below instead.

---

## `server.js` snippet

```js
const express = require('express');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ status: 'ok' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

app.get('/', (_req, res) => res.send('Backend is running.'));

app.listen(PORT, () => console.log(`Server on http://localhost:${PORT}`));
```

> `prisma.$queryRaw\`SELECT 1\`` is the safest health check — it does not require
> any model to exist yet, making it safe to call before migrations have run.

---

## Seed file

Detect whether the project uses TypeScript (`tsconfig.json` present or `typescript`
in `devDependencies`). Generate the appropriate seed file:

### JavaScript seed (`prisma/seed.js`)

```js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: { email: 'admin@example.com', name: 'Admin' },
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

Add to `package.json`:

```json
"prisma": {
  "seed": "node prisma/seed.js"
}
```

### TypeScript seed (`prisma/seed.ts`)

```ts
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: { email: 'admin@example.com', name: 'Admin' },
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

Add to `package.json`:

```json
"prisma": {
  "seed": "ts-node prisma/seed.ts"
}
```

Install `ts-node` if not already present: `npm install -D ts-node`.

---

## Shadow database

Prisma needs a shadow database to safely apply and roll back migration diffs.

**Option A — Grant CREATEDB to the DB user (preferred for local dev):**

```sql
ALTER USER postgres CREATEDB;
```

**Option B — Provision an explicit shadow DB and reference it in `.env`:**

```dotenv
SHADOW_DATABASE_URL="postgresql://postgres:postgres@localhost:5432/app_db_shadow?schema=public"
```

Then reference it in `schema.prisma`:

```prisma
datasource db {
  provider          = "postgresql"
  url               = env("DATABASE_URL")
  shadowDatabaseUrl = env("SHADOW_DATABASE_URL")
}
```

Create the shadow database manually:

```bash
docker exec -it <db-container-name> psql -U postgres -c "CREATE DATABASE app_db_shadow;"
```

---

## Baseline migration (existing DB)

If `_prisma_migrations` already exists in the database, do **not** run
`prisma migrate dev --name init` — it will conflict.

Instead, create a baseline:

```bash
# 1. Create the migration directory without applying it
mkdir -p prisma/migrations/0_init

# 2. Export the current schema as SQL
npx prisma migrate diff \
  --from-empty \
  --to-schema-datamodel prisma/schema.prisma \
  --script > prisma/migrations/0_init/migration.sql

# 3. Mark the migration as already applied (baseline it)
npx prisma migrate resolve --applied 0_init
```

Now future `prisma migrate dev` commands will work incrementally.
