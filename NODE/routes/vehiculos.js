const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET todos los vehículos
router.get('/', (req, res) => {
  db.query('SELECT * FROM vehiculos', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// POST registrar vehículo
router.post('/', (req, res) => {
  const { placa, marca, modelo, anio, combustible, kilometraje, id_usuario } = req.body;
  db.query(
    'INSERT INTO vehiculos (placa, marca, modelo, anio, combustible, kilometraje, id_usuario) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [placa, marca, modelo, anio, combustible, kilometraje, id_usuario],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Vehículo registrado', id: result.insertId });
    }
  );
});

// GET vehículos por usuario
router.get('/usuario/:id_usuario', (req, res) => {
  db.query(
    'SELECT * FROM vehiculos WHERE id_usuario = ?',
    [req.params.id_usuario],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    }
  );
});

module.exports = router;