const express = require('express');
const session = require('express-session');
const path = require('path');


const app = express();
app.enable('trust proxy'); // Detectar correctamente cliente detrás de proxy

// Middleware de parseo
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware de sesión
app.use(session({
    secret: 'tu_secreto_super_seguro',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Cambiar a true en producción con HTTPS
}));

// Variables globales para vistas
app.use((req, res, next) => {
    res.locals.usuario = req.session.usuario || null;
    next();
});

// Configuración del motor de vistas
app.set('view engine', 'ejs');

// Archivos estáticos
app.use(express.static('assets'));

// Importar rutas
const indexRoutes = require('./routes/index');
const inicioRoutes = require('./routes/inicioRoutes');
const registroRoutes = require('./routes/registroRoutes');

app.use('/', indexRoutes);
app.use('/inicio', inicioRoutes);
app.use('/', registroRoutes);

// Redirección raíz según sesión
app.get('/', (req, res) => {
    if (req.session.usuario) {
        res.redirect('/inicio');
    } else {
        res.redirect('/login');
    }
});

// Iniciar servidor
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});
