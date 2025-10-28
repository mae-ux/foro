const express = require('express');
const router = express.Router();

// Controladores
const authController = require('../controllers/authController');
const registroController = require('../controllers/registroController');

// Login
router.get('/login', authController.loginForm);
router.post('/autenticar', authController.autenticar);

// Logout
router.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Error al cerrar sesión:', err);
            return res.status(500).send('Error al cerrar sesión');
        }
        res.redirect('/login');
    });
});

module.exports = router;
