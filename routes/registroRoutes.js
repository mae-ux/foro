const express = require('express');
const router = express.Router();
const registroController = require('../controllers/registroController');

router.get('/registrar', registroController.registroForm);
router.post('/registrar', registroController.registrar);

router.get('/verificar', registroController.verificarForm);
router.post('/verificar', registroController.verificarCodigo);

module.exports = router;

