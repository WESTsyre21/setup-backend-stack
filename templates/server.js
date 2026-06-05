const express = require('express');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const app = express();
const port = process.env.PORT || 3000;

app.get('/health', async (req, res) => {
  try {
    await prisma.user.findFirst();
    return res.status(200).json({ status: 'ok' });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
});

app.get('/', (req, res) => {
  res.send('Backend server is running.');
});

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
