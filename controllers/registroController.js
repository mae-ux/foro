const db = require('../config/db');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');

// Mostrar formulario de registro con carreras
exports.registroForm = (req, res) => {
    db.query('SELECT * FROM carreras', (err, resultados) => {
        if (err) {
            console.error('Error al obtener carreras:', err);
            return res.render('registro', {
                error: 'No se pudieron cargar las carreras.',
                exito: null,
                carreras: [],
                usuario: req.session.usuario
            });
        }

        res.render('registro', {
            error: null,
            exito: null,
            carreras: resultados,
            usuario: req.session.usuario
        });
    });
};

// Registrar usuario y enviar correo de verificación
exports.registrar = async (req, res) => {
    const { usuario, clave, nombre, idCarrera } = req.body;

    if (!usuario || !clave || !nombre || !idCarrera) {
        return res.render('registro', {
            error: 'Todos los campos son obligatorios.',
            exito: null,
            carreras: [],
            usuario: req.session.usuario
        });
    }

    const rolFinal = 2; // usuario normal

    try {
        // Verificar si el email ya existe
        const [existe] = await db.promise().query('SELECT * FROM usuarios WHERE email = ?', [usuario]);
        if (existe.length > 0) {
            // Volver a cargar las carreras para mostrarlas en el formulario
            const [carreras] = await db.promise().query('SELECT * FROM carreras');

            return res.render('registro', { 
            error: 'El correo ya está en uso.', 
            exito: null, 
            carreras, 
            usuario: req.session.usuario 
        });
        }

        // Hashear la contraseña
        const hashedPassword = await bcrypt.hash(clave, 10);
        const codigoVerificacion = Math.floor(100000 + Math.random() * 900000); // 6 dígitos
        const fechaCodigo = new Date();

        // Configurar nodemailer
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'neruson.san14@gmail.com',
                pass: 'yzkrwfzheemhoupy'
            }
        });

        const mailOptions = {
            from: '"Foro Santo Tomás" <neruson.san14@gmail.com>',
            to: usuario,
            subject: 'Código de verificación',
            text: `Hola ${nombre}, tu código de verificación es: ${codigoVerificacion}. Este código es válido por 2 minutos.`
        };

        // Enviar correo
        await transporter.sendMail(mailOptions);

        // Insertar usuario con verificado = FALSE y fecha_codigo
        await db.promise().query(
            'INSERT INTO usuarios (email, idRol, nombre, idCarrera, password, codigo_verificacion, verificado, fecha_codigo) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [usuario, rolFinal, nombre, idCarrera, hashedPassword, codigoVerificacion, false, fechaCodigo]
        );

        // Programar eliminación automática en 2 minutos si no se verifica
        setTimeout(async () => {
            try {
                const [user] = await db.promise().query(
                    'SELECT * FROM usuarios WHERE email = ? AND verificado = FALSE',
                    [usuario]
                );
                if (user.length > 0) {
                    await db.promise().query('DELETE FROM usuarios WHERE email = ?', [usuario]);
                    console.log(`Usuario ${usuario} eliminado por no verificar a tiempo.`);
                }
            } catch (err) {
                console.error('Error al eliminar usuario no verificado automáticamente:', err);
            }
        }, 120000); // 2 minutos = 120000 ms

        // Redirigir automáticamente a verificar con el correo
        res.redirect(`/verificar?email=${encodeURIComponent(usuario)}`);

    } catch (error) {
        console.error('Error al registrar usuario o enviar correo:', error);
        res.render('registro', {
            error: 'No se pudo enviar el correo de verificación. Usuario no registrado.',
            exito: null,
            carreras: [],
            usuario: req.session.usuario
        });
    }
};

// Mostrar formulario de verificación
exports.verificarForm = (req, res) => {
    const email = req.query.email || '';
    res.render('verificar', { error: null, email });
};

// Verificar código recibido por correo
exports.verificarCodigo = (req, res) => {
    const { email, codigo } = req.body;

    if (!email || !codigo) {
        return res.render('verificar', { error: 'Debe ingresar correo y código.', email });
    }

    db.query(
        'SELECT * FROM usuarios WHERE email = ? AND codigo_verificacion = ?',
        [email, codigo],
        (err, resultados) => {
            if (err) return res.render('verificar', { error: 'Error al verificar el código.', email });
            if (resultados.length === 0) return res.render('verificar', { error: 'Código incorrecto.', email });

            const usuario = resultados[0];
            const fechaCodigo = new Date(usuario.fecha_codigo);
            const ahora = new Date();

            // Verificar tiempo límite (2 minutos = 120000 ms)
            if (ahora - fechaCodigo > 120000) {
                // Eliminar cuenta si el tiempo expiró
                db.query('DELETE FROM usuarios WHERE email = ?', [email], (err) => {
                    if (err) console.error('Error al eliminar usuario expirado:', err);
                    return res.render('verificar', { error: 'El código expiró. Debes registrarte nuevamente.', email: '' });
                });
            } else {
                // Actualizar usuario como verificado
                db.query(
                    'UPDATE usuarios SET verificado = TRUE, codigo_verificacion = NULL WHERE email = ?',
                    [email],
                    (err) => {
                    if (err) return res.render('verificar', { error: 'Error al actualizar el usuario.', email });

                    // Mostrar mensaje bonito y redirigir al login
                    res.render('verificado');
                    }
                );
            }
        }
    );
};
