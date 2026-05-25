const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET todas las RTM
router.get('/', (req, res) => {
  db.query('SELECT * FROM rtm', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// GET RTM por vehículo
router.get('/:id_vehiculo', (req, res) => {
  db.query(
    'SELECT * FROM rtm WHERE id_vehiculo = ?',
    [req.params.id_vehiculo],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    }
  );
});

// POST registrar RTM
router.post('/', (req, res) => {
  const { fecha_vencimiento, estado, id_vehiculo } = req.body;
  db.query(
    'INSERT INTO rtm (fecha_vencimiento, estado, id_vehiculo) VALUES (?, ?, ?)',
    [fecha_vencimiento, estado, id_vehiculo],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'RTM registrada', id: result.insertId });
    }
  );
});

module.exports = router;