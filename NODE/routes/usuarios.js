const express = require('express');
const router = express.Router();
const db = require('../config/db');

// POST registro
router.post('/registro', (req, res) => {
  const { nombre, email, password } = req.body;
  db.query(
    'INSERT INTO usuarios (nombre, email, password) VALUES (?, ?, ?)',
    [nombre, email, password],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Usuario registrado', id: result.insertId });
    }
  );
});

// POST login
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  db.query(
    'SELECT * FROM usuarios WHERE email = ? AND password = ?',
    [email, password],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      if (results.length === 0) return res.status(401).json({ error: 'Credenciales incorrectas' });
      res.json({ message: 'Login exitoso', usuario: results[0] });
    }
  );
});

module.exports = router;