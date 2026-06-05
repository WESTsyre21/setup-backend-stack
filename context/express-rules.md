Use Express for the backend server entrypoint and include a health endpoint.

- The dev script should be `node server.js` or `nodemon server.js`.
- The `/health` endpoint must verify database connectivity via the ORM.
- Prefer `prisma.user.findFirst()` or `sequelize.authenticate()` for ORM-native health checks.
- Keep the server simple and focused on startup readiness and DB validation.
