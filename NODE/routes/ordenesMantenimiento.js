const express = require('express');
const router = express.Router();

const db = require('../config/db');

router.post('/', (req, res) => {

    const {
        fecha,
        kilometraje,
        costo_total,
        id_vehiculo,
        id_taller,
        servicios
    } = req.body;

    const sqlOrden = `
        INSERT INTO ordenes_mantenimiento
        (
            fecha,
            kilometraje,
            costo_total,
            id_vehiculo,
            id_taller
        )
        VALUES (?, ?, ?, ?, ?)
    `;

    db.query(
        sqlOrden,
        [
            fecha,
            kilometraje,
            costo_total,
            id_vehiculo,
            id_taller
        ],
        (err, result) => {

            if (err) {
                return res.status(500).json(err);
            }

            const idOrden = result.insertId;

            servicios.forEach(servicio => {

                db.query(
                    `
                    INSERT INTO detalle_mantenimiento
                    (
                        id_orden,
                        id_tipo_mantenimiento,
                        costo
                    )
                    VALUES (?, ?, ?)
                    `,
                    [
                        idOrden,
                        servicio.id_tipo_mantenimiento,
                        servicio.costo
                    ]
                );
            });

            db.query(
                `
                UPDATE vehiculos
                SET kilometraje = ?
                WHERE id = ?
                `,
                [
                    kilometraje,
                    id_vehiculo
                ]
            );

            res.json({
                ok: true
            });

        }
    );
});

module.exports = router;