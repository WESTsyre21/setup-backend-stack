# Express Server Rules

## Entry point

The server entry point must be `server.js` in the project root. The `dev` npm
script must invoke it:

```json
"scripts": {
  "dev": "nodemon server.js",
  "start": "node server.js"
}
```

If `nodemon` is not installed, fall back to `node server.js` for the `dev` script
and prompt the user to run `npm install -D nodemon`.

## Required endpoints

### `GET /health`

This endpoint **must**:
- Use an ORM-native connectivity check (never raw TCP or raw SQL string passed as a
  string argument):
  - **Prisma:** `await prisma.$queryRaw\`SELECT 1\``
  - **Sequelize:** `await sequelize.authenticate()`
- Return `200 { status: 'ok' }` on success.
- Return `500 { status: 'error', message: <error message> }` on failure.
- Never crash the process — always wrap the check in try/catch.

### `GET /`

Return a plain string confirming the server is running. No ORM call required.

## Error handling

- Wrap all async route handlers in try/catch.
- Log errors to `console.error` before sending the 500 response.
- Never swallow exceptions silently.

## Environment variables

- Read `PORT` from `process.env.PORT`; default to `3000`.
- Load `.env` at startup using `dotenv` if the ORM doesn't already load it:
  ```js
  require('dotenv').config();
  ```
  Prisma loads `.env` automatically via its CLI; Sequelize does not — always call
  `dotenv.config()` at the top of `server.js` when using Sequelize.

## Keep it minimal

`server.js` is the startup and health-check layer only. Business logic, routes,
and model definitions belong in separate files/directories as the project grows.
