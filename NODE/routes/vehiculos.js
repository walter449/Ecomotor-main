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
  const query = `
    SELECT
      v.*,
      e.clase_vehiculo,
      e.cilindraje_motor,
      e.cilindros,
      e.transmision,
      e.tipo_combustible,
      e.consumo_ciudad,
      e.consumo_carretera,
      e.consumo_combinado,
      e.consumo_mpg,
      e.co2_base
    FROM vehiculos v
    LEFT JOIN especificaciones_vehiculos e
      ON v.id_especificacion = e.id
    WHERE v.id_usuario = ?
  `;

  db.query(
    query,
    [req.params.id_usuario],
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      console.log(results);
      res.json(results);
    }
  );
});

module.exports = router;