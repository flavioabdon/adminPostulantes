const Postulante = require('../models/Postulante');
const { generateExcel, generatePDF } = require('../utils/excelGenerator');

exports.dashboard = (req, res) => {
  res.render('admin/dashboard');
};

exports.postulantes = async (req, res) => {
    try {
      const postulantes = await Postulante.getAll();
      console.log('Postulantes obtenidos:', postulantes.length); // Verifica en consola
      
      res.render('admin/postulantes', { 
        postulantes: postulantes || [],
        error_msg: req.flash('error_msg'),
        info_msg: req.flash('info_msg'),
        success_msg: req.flash('success_msg'),
        layout: 'layout'
      });
    } catch (error) {
      console.error('Error en postulantes:', error);
      req.flash('error_msg', 'Error al cargar postulantes');
      res.redirect('/admin/dashboard');
    }
  };

exports.estadisticas = async (req, res) => {
  try {
    const stats = await Postulante.getStats();
    res.render('admin/estadisticas', { stats });
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Error al obtener estadísticas');
    res.redirect('/admin/dashboard');
  }
};
exports.exportarTodosExcel = async (req, res) => {
    try {
        const postulantes = await Postulante.getAll();
        
        const buffer = await generateExcel(postulantes);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=postulantes_completos.xlsx');
        return res.send(buffer);
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Error al exportar todos los postulantes');
        res.redirect('/admin/postulantes');
    }
};
exports.exportarPostulantes = async (req, res) => {
  const { ids, tipo } = req.body;
  
  if (!ids || !ids.length) {
    req.flash('error_msg', 'No se seleccionaron postulantes');
    return res.redirect('/admin/postulantes');
  }

  try {
    const postulantes = await Postulante.getByIds(ids);
    
    if (tipo === 'excel') {
      const buffer = await generateExcel(postulantes);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=postulantes.xlsx');
      return res.send(buffer);
    } else if (tipo === 'pdf') {
      const buffer = await generatePDF(postulantes);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=postulantes.pdf');
      return res.send(buffer);
    } else {
      req.flash('error_msg', 'Tipo de exportación no válido');
      return res.redirect('/admin/postulantes');
    }
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Error al exportar postulantes');
    res.redirect('/admin/postulantes');
  }
};