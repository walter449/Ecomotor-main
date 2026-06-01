const express = require('express');
const router = express.Router();

const db = require('../config/db');

router.post('/', (req, res) => {

    const orden = req.body.orden || req.body;

    const {
        fecha,
        kilometraje,
        id_vehiculo,
        id_taller
    } = orden;

    const servicios = Array.isArray(req.body.servicios)
        ? req.body.servicios
        : [];

    const serviciosNormalizados = servicios
        .map((servicio) => ({
            id_tipo_mantenimiento: Number(servicio?.id_tipo_mantenimiento),
            costo: Number(servicio?.costo)
        }))
        .filter((servicio) =>
            Number.isFinite(servicio.id_tipo_mantenimiento)
            && servicio.id_tipo_mantenimiento > 0
            && Number.isFinite(servicio.costo)
            && servicio.costo > 0
        );

    if (!fecha || !kilometraje || !id_vehiculo || !id_taller) {
        return res.status(400).json({
            ok: false,
            message: 'Faltan campos obligatorios de la orden.'
        });
    }

    if (serviciosNormalizados.length === 0) {
        return res.status(400).json({
            ok: false,
            message: 'Debes registrar al menos un servicio con costo válido.'
        });
    }

    const costo_total = serviciosNormalizados
        .reduce((acc, servicio) => acc + servicio.costo, 0);

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

    db.beginTransaction((txErr) => {

        if (txErr) {
            return res.status(500).json(txErr);
        }

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
                    return db.rollback(() => res.status(500).json(err));
                }

                const idOrden = result.insertId;

                let pendientes = serviciosNormalizados.length;

                const insertarDetalles = () => {
                    serviciosNormalizados.forEach((servicio) => {
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
                            ],
                            (detalleErr) => {
                                if (detalleErr) {
                                    return db.rollback(() => res.status(500).json(detalleErr));
                                }

                                pendientes -= 1;

                                if (pendientes === 0) {
                                    actualizarVehiculo();
                                }
                            }
                        );
                    });
                };

                const actualizarVehiculo = () => {
                    db.query(
                        `
                        UPDATE vehiculos
                        SET kilometraje = ?
                        WHERE id = ?
                        `,
                        [
                            kilometraje,
                            id_vehiculo
                        ],
                        (vehiculoErr) => {
                            if (vehiculoErr) {
                                return db.rollback(() => res.status(500).json(vehiculoErr));
                            }

                            db.commit((commitErr) => {
                                if (commitErr) {
                                    return db.rollback(() => res.status(500).json(commitErr));
                                }

                                res.json({
                                    ok: true,
                                    id_orden: idOrden,
                                    costo_total
                                });
                            });
                        }
                    );
                };

                insertarDetalles();

            }
        );

    });
});

module.exports = router;