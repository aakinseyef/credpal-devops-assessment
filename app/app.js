const express = require('express');
const { Pool } = require('pg');

const app = express();
const port = process.env.PORT || 3000;

// Database connection (will be overridden in production)
const pool = process.env.DATABASE_URL
  ? new Pool({ connectionString: process.env.DATABASE_URL })
  : null;

app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

// Status endpoint – also checks DB connectivity
app.get('/status', async (req, res) => {
  if (!pool) {
    return res.status(200).json({ status: 'ok', database: 'not configured' });
  }
  try {
    await pool.query('SELECT 1');
    res.status(200).json({ status: 'ok', database: 'connected' });
  } catch (err) {
    res.status(500).json({ status: 'error', database: 'disconnected' });
  }
});

// Process endpoint – example POST that stores data
app.post('/process', async (req, res) => {
  const { data } = req.body;
  if (!data) {
    return res.status(400).json({ error: 'data field required' });
  }
  if (!pool) {
    return res.status(503).json({ error: 'database not configured' });
  }
  try {
    const result = await pool.query(
      'INSERT INTO processed_data (data) VALUES ($1) RETURNING id',
      [data]
    );
    res.status(201).json({ id: result.rows[0].id, received: data });
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: 'internal server error' });
  }
});

// Basic logging
app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});

module.exports = app;
