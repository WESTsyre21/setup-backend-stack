require('dotenv').config();
const express = require('express');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/health', async (req, res) => {
  try {
    // $queryRaw SELECT 1 works before any model exists — safe for all migration states
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ status: 'ok' });
  } catch (err) {
    console.error('Health check failed:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
});

app.get('/', (_req, res) => {
  res.send('Backend is running.');
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
