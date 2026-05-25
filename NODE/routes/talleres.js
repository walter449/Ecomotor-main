const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET todos los talleres
router.get('/', (req, res) => {
  db.query('SELECT * FROM talleres', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// GET taller por id
router.get('/:id', (req, res) => {
  db.query(
    'SELECT * FROM talleres WHERE id = ?',
    [req.params.id],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results[0]);
    }
  );
});

// POST registrar taller
router.post('/', (req, res) => {
  const { nombre, direccion, ciudad, telefono, calificacion } = req.body;
  db.query(
    'INSERT INTO talleres (nombre, direccion, ciudad, telefono, calificacion) VALUES (?, ?, ?, ?, ?)',
    [nombre, direccion, ciudad, telefono, calificacion],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Taller registrado', id: result.insertId });
    }
  );
});

module.exports = router;