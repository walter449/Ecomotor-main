const express = require('express');
const router = express.Router();

const db = require('../config/db');

router.get('/', (req, res) => {

    const sql = `
        SELECT *
        FROM tipos_mantenimiento
        ORDER BY nombre
    `;

    db.query(sql, (err, results) => {

        if (err) {
            console.log(err);
            return res.status(500).json(err);
        }

        res.json(results);
    });
});

module.exports = router;