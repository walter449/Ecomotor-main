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
    `
      SELECT
        om.fecha,
        om.kilometraje,
        dm.costo,
        tm.nombre AS tipo
      FROM ordenes_mantenimiento om
      INNER JOIN detalle_mantenimiento dm ON dm.id_orden = om.id
      INNER JOIN tipos_mantenimiento tm ON tm.id = dm.id_tipo_mantenimiento
      WHERE om.id_vehiculo = ?
      ORDER BY om.fecha DESC, dm.id DESC
    `,
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