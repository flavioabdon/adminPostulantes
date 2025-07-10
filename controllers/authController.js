const User = require('../models/User');
const md5 = require('md5');

exports.loginForm = (req, res) => {
    res.render('login', { 
      error_msg: req.flash('error_msg'),
      success_msg: req.flash('success_msg') 
    });
  };
  

exports.login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findByUsername(username);
    
    if (!user || md5(password) !== user.password_hash) {
      req.flash('error_msg', 'Credenciales incorrectas');
      return res.redirect('/');
    }

    if (!user.activo) {
      req.flash('error_msg', 'Usuario inactivo');
      return res.redirect('/');
    }

    req.session.user = user;
    res.redirect('/admin/dashboard');
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Error al iniciar sesión');
    res.redirect('/');
  }
};

exports.logout = (req, res) => {
  req.session.destroy();
  res.redirect('/');
};