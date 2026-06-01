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
  const {
    placa,
    marca,
    modelo,
    anio,
    kilometraje,
    id_usuario
  } = req.body;

  if (!placa || !id_usuario) {
    return res.status(400).json({
      error: 'Placa e id_usuario son obligatorios'
    });
  }

  const placaNormalizada = String(placa).trim().toUpperCase();
  const marcaNormalizada = marca ? String(marca).trim() : null;
  const modeloNormalizado = modelo ? String(modelo).trim() : null;
  const anioNormalizado = anio ? Number(anio) : null;

  // Buscar la especificación correspondiente al vehículo
  // usando marca + modelo + año
  const queryEspecificacion = `
    SELECT id
    FROM especificaciones_vehiculos
    WHERE LOWER(TRIM(marca)) = LOWER(TRIM(?))
      AND LOWER(TRIM(modelo)) = LOWER(TRIM(?))
      AND anio_modelo = ?
    LIMIT 1
  `;

  db.query(
    queryEspecificacion,
    [marcaNormalizada, modeloNormalizado, anioNormalizado],
    (err, especificaciones) => {

      if (err) {
        return res.status(500).json({ error: err.message });
      }

      // Si no encuentra especificación, se guarda igual con id_especificacion en null.
      const id_especificacion =
        especificaciones.length > 0
          ? especificaciones[0].id
          : null;

      // Ahora también se guarda id_especificacion
      db.query(
        'INSERT INTO vehiculos (placa, marca, modelo, anio, kilometraje, id_usuario, id_especificacion) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [
          placaNormalizada,
          marcaNormalizada,
          modeloNormalizado,
          anioNormalizado,
          kilometraje,
          id_usuario,
          id_especificacion
        ],
        (err, result) => {
          if (err) {
             if (err.code === 'ER_DUP_ENTRY') {
               return res.status(409).json({
                 error: 'Ya existe un vehículo con esa placa'
               });
             }

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