const User = require('../models/User');
const md5 = require('md5');

exports.list = async (req, res) => {
  try {
    const users = await User.getAll();
    res.render('admin/usuarios', { users });
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Error al obtener usuarios');
    res.redirect('/admin/dashboard');
  }
};

exports.createForm = (req, res) => {
  res.render('admin/usuarioForm', { user: null });
};

exports.create = async (req, res) => {
  const { username, email, password, rol } = req.body;
  try {
    await User.create({ username, email, password, rol });
    req.flash('success_msg', 'Usuario creado exitosamente');
    res.redirect('/admin/users');
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Error al crear usuario');
    res.redirect('/admin/users/create');
  }
};

exports.editForm = async (req, res) => {
  try {
    const user = await User.findByUsername(req.params.username);
    if (!user) {
      req.flash('error_msg', 'Usuario no encontrado');
      return res.redirect('/admin/users');
    }
    res.render('admin/usuarioForm', { user });
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Error al obtener usuario');
    res.redirect('/admin/users');
  }
};

exports.update = async (req, res) => {
  const { username, email, rol, activo } = req.body;
  try {
    await User.update(req.params.id, { username, email, rol, activo: activo === 'on' });
    req.flash('success_msg', 'Usuario actualizado exitosamente');
    res.redirect('/admin/users');
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Error al actualizar usuario');
    res.redirect(`/admin/users/edit/${req.params.id}`);
  }
};

exports.delete = async (req, res) => {
  try {
    await User.delete(req.params.id);
    req.flash('success_msg', 'Usuario eliminado exitosamente');
    res.redirect('/admin/users');
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Error al eliminar usuario');
    res.redirect('/admin/users');
  }
};

exports.changePassword = async (req, res) => {
  const { newPassword } = req.body;
  try {
    await User.updatePassword(req.params.id, newPassword);
    req.flash('success_msg', 'Contraseña actualizada exitosamente');
    res.redirect('/admin/users');
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Error al actualizar contraseña');
    res.redirect('/admin/users');
  }
};