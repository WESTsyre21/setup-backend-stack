# backend-setup-stack

A Claude skill that bootstraps a local Node.js backend development stack with
Docker, PostgreSQL, and an ORM (Prisma or Sequelize).

## What it does

Given a user request to set up a backend project, the skill will:

1. Detect your environment (filesystem + shell access vs. output-only mode)
2. Scaffold `docker-compose.yml`, `.env`, ORM config, and `server.js`
3. Run (or print) all setup commands: `npm install`, ORM init, Docker startup
4. Wait for Postgres readiness, detect existing migration metadata, and run migrations safely
5. Verify the stack via a `GET /health` endpoint
6. Output a status file at `.claude_history/setup_status.md`

## Directory structure

```
backend-setup-stack/
├── SKILL.md                        # Main skill instructions (required)
├── README.md                       # This file
├── templates/                      # Boilerplate files for new projects
│   ├── .env.example
│   ├── docker-compose.yml
│   ├── schema.prisma
│   └── server.js
├── references/                     # ORM-specific detail (loaded on demand)
│   ├── prisma-config.md
│   └── sequelize-config.md
├── context/                        # Shared conventions (always available)
│   ├── db-conventions.md
│   └── express-rules.md
└── evals/
    └── evals.json                  # Test cases for skill evaluation
```

## Installation

Place the `backend-setup-stack/` folder in your Claude skills directory, e.g.:

```
~/.claude/skills/backend-setup-stack/
```

## Prerequisites

- Docker and Docker Compose
- Node.js ≥ 18 and npm

## Example triggers

```
Set up a new backend stack with Express, PostgreSQL, and Prisma.
```

```
Bootstrap a backend at ~/projects/my-api with Sequelize ORM.
```

```
My Postgres container keeps rejecting connections when I run prisma migrate dev.
```

## License

MIT
