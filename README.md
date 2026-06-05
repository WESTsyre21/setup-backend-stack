# backend-setup-stack Skill

## Purpose
This skill bootstraps a local Node.js backend development stack with Docker, PostgreSQL, and an ORM (Prisma or Sequelize). It is designed to help the next user quickly install, configure, and run the skill in a Claude-compatible skill directory.

## Installation

1. Place the `backend-setup-stack` folder under your Claude skills directory, for example:
   - `~/.claude/skills/backend-setup-stack`
2. Ensure the following files and folders exist:
   - `templates/SKILL.md`
   - `templates/docker-compose.yml`
   - `templates/server.js`
   - `templates/.env.example`
   - `templates/schema.prisma`
   - `context/db-conventions.md`
   - `context/express-rules.md`
3. Confirm that Docker, Docker Compose, Node.js, and npm are installed on the local machine.

## Usage

1. Open the skill in Claude or your local Claude skill runner.
2. Use the skill when you want to create or repair a local backend stack that includes:
   - a Dockerized PostgreSQL database
   - an npm/Express server
   - Prisma or Sequelize ORM setup
   - automated migration workflows and health checks
3. Follow the skill instructions to scaffold files, initialize the ORM, verify database readiness, and run the app.

## Examples

### In Claude Desktop or Web

Simply mention the skill in your conversation:

```
I need to set up a new backend stack with Express, PostgreSQL, and Prisma. Can you bootstrap it for me?
```

Or be more specific about your requirements:

```
Set up a backend stack in my /projects/my-api directory with Sequelize ORM instead of Prisma.
```

### In IDE Extensions or Skill Runners

Reference the skill explicitly:

```
@backend-setup-stack Create a new Node.js backend with Docker and PostgreSQL using Prisma
```

Or with specific project paths:

```
@backend-setup-stack Bootstrap a backend stack at ~/Development/my-project with environment configured for production
```

The skill will then:
1. Scaffold the necessary project structure
2. Create Docker Compose configuration
3. Initialize your chosen ORM (Prisma or Sequelize)
4. Set up database migrations
5. Provide health check endpoints
6. Output deployment-ready files

## Notes

- This skill assumes your environment supports filesystem writes and shell command execution.
- If the skill cannot run commands directly, it will output the exact commands and file contents for manual execution.
- The `templates` folder contains boilerplate files for a standard Prisma/Express setup.
