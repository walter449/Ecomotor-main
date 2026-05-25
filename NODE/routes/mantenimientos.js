const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET todos los mantenimientos
router.get('/', (req, res) => {
  db.query('SELECT * FROM mantenimientos', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// GET mantenimientos por vehículo
router.get('/:id_vehiculo', (req, res) => {
  db.query(
    'SELECT * FROM mantenimientos WHERE id_vehiculo = ?',
    [req.params.id_vehiculo],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    }
  );
});

// POST registrar mantenimiento
router.post('/', (req, res) => {
  const { tipo, fecha, kilometraje, costo, id_vehiculo } = req.body;
  db.query(
    'INSERT INTO mantenimientos (tipo, fecha, kilometraje, costo, id_vehiculo) VALUES (?, ?, ?, ?, ?)',
    [tipo, fecha, kilometraje, costo, id_vehiculo],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Mantenimiento registrado', id: result.insertId });
    }
  );
});

module.exports = router;