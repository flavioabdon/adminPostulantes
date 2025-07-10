exports.isAuthenticated = (req, res, next) => {
    if (req.session.user) {
      return next();
    }
    req.flash('error_msg', 'Por favor inicia sesión');
    res.redirect('/');
  };
  
  exports.isAdmin = (req, res, next) => {
    if (req.session.user && req.session.user.rol === 'admin') {
      return next();
    }
    req.flash('error_msg', 'No tienes permisos para acceder a esta sección');
    res.redirect('/admin/dashboard');
  };