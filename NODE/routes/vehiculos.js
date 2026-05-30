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
  // Datos enviados desde angular
  const { placa, marca, modelo, anio, kilometraje, id_usuario } = req.body;
  // Buscar la especificación correspondiente al vehículo
  // usando marca + modelo + año
  const queryEspecificacion = `
    SELECT id
    FROM especificaciones_vehiculos
    WHERE marca = ?
      AND modelo = ?
      AND anio_modelo = ?
    LIMIT 1
  `;

  db.query(
    queryEspecificacion,
    [marca, modelo, anio],
    (err, especificaciones) => {

      if (err) {
        return res.status(500).json({ error: err.message });
      }

      // Si no encuentra coincidencia en la tabla
      // especificaciones_vehiculos
      if (especificaciones.length === 0) {
        return res.status(404).json({
          error: 'No se encontró una especificación para ese vehículo'
        });
      }

      // Obtener el id de la especificación encontrada
      const id_especificacion = especificaciones[0].id;

      // Ahora también se guarda id_especificacion
      db.query(
        'INSERT INTO vehiculos (placa, marca, modelo, anio, kilometraje, id_usuario, id_especificacion) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [placa, marca, modelo, anio,  kilometraje, id_usuario, id_especificacion],
        (err, result) => {
          if (err) {
             return res.status(500).json({ error: err.message });
          }

          res.json({ message: 'Vehículo registrado',  
                     id: result.insertId,
                     id_especificacion: id_especificacion 
          });
        }
      );
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