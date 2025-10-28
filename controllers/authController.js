const db = require('../config/db');
const bcrypt = require('bcrypt');


exports.loginForm = (req, res) => {
    res.render('login', { error: null });
};

exports.autenticar = (req, res) => {
    const { usuario, clave } = req.body;

    // Primero obtenemos el usuario por correo y que esté verificado
    db.query(
        'SELECT * FROM usuarios WHERE email = ? AND verificado = TRUE',
        [usuario],
        async (err, results) => {
            if (err) throw err;

            if (results.length > 0) {
                const user = results[0];

                // Comparar la contraseña con bcrypt
                const match = await bcrypt.compare(clave, user.password);
                if (match) {
                    // Guardamos datos esenciales del usuario en la sesión
                    req.session.usuario = {
                        id: user.id_usuario,
                        nombre: user.nombre,
                        id_rol: user.idRol
                    };
                    return res.redirect('/inicio');
                } else {
                    return res.render('login', { error: 'Usuario o clave incorrecta' });
                }
            } else {
                return res.render('login', { error: 'Usuario o clave incorrecta' });
            }
        }
    );
};


exports.logout = (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Error al cerrar sesión:', err);
            return res.status(500).send('Error al cerrar sesión');
        }
        res.redirect('/login');
    });
};
