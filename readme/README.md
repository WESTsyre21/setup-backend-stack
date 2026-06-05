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

## Notes

- This skill assumes your environment supports filesystem writes and shell command execution.
- If the skill cannot run commands directly, it will output the exact commands and file contents for manual execution.
- The `templates` folder contains boilerplate files for a standard Prisma/Express setup.
