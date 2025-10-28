const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../middlewares/authMiddleware');

// Página de inicio protegida
router.get('/', ensureAuthenticated, (req, res) => {
    res.render('inicio', { usuario: req.session.usuario });
});

module.exports = router;
