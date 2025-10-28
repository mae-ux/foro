function ensureAuthenticated(req, res, next) {
    if (req.session && req.session.usuario) {
        return next();
    }
    res.redirect('/login');
}

function ensureAdmin(req, res, next) {
    if (req.session.usuario && req.session.usuario.rol === 'admin') {
        return next();
    }
    res.status(403).send('Acceso denegado');
}

module.exports = {
    ensureAuthenticated,
    ensureAdmin
};
