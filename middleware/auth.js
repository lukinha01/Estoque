function autenticarEmpresa(req, res, next) {
    if (!req.session.empresaId) {
        req.flash('error', 'Você precisa estar logado para acessar esta página.');
        return res.redirect('/loginEmpresa');
    }
    next();  

module.exports = autenticarEmpresa;
