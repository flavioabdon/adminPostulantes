const Postulante = require('../models/Postulante');
const { generateExcel, generatePDF } = require('../utils/excelGenerator');

exports.dashboard = (req, res) => {
  res.render('admin/dashboard');
};

exports.postulantes = async (req, res) => {

    const page = parseInt(req.query.page) || 1; // pagina actual
    const limit = 25;                           // limite de registros
    const offset = (page - 1) * limit;          // salto para la consulta

    try {
      const { rows: postulantes, count: total } = await Postulante.getPaged(limit, offset); // Obtiene los postulantes paginados
      const totalPages = Math.ceil(total / limit); // Calcula el total de paginas
      //const postulantes = await Postulante.getAll();
      console.log('Postulantes obtenidos:', postulantes.length); // Verifica en consola
      
      res.render('admin/postulantes', { 
        postulantes: postulantes || [],
        currentPage: page,  // pagina actual
        totalPages: totalPages,         // total de paginas
        error_msg: req.flash('error_msg'),
        info_msg: req.flash('info_msg'),
        success_msg: req.flash('success_msg'),
        layout: 'layout',
        isSearch: false // Indicador de que no es una búsqueda
      });
      
    } catch (error) {
      console.error('Error en postulantes:', error);
      req.flash('error_msg', 'Error al cargar postulantes');
      res.redirect('/admin/dashboard');
    }
  };

  exports.postulantes_search = async (req, res) => {
    if (!req.query.ci && !req.query.apellido) {
      req.flash('error_msg', 'Debe ingresar un CI o apellido para buscar');
      return res.redirect('/admin/postulantes');
    }
    const termino = req.query.ci || req.query.apellido;
    let postulantes = [];
    const page = parseInt(req.query.page) || 1; // pagina actual
    const limit = 25;                           // limite de registros
    try {
      if (/^\d+$/.test(termino.trim())) {
        console.log(termino)
        postulantes = await Postulante.getByCI(termino);
        
      } else {
        console.log(termino)
        postulantes = await Postulante.getByApellido(termino);
      }
      const totalPages = Math.ceil( postulantes.length / limit ); // Calcula el total de paginas
      console.log('Postulantes obtenidos:', postulantes.length); // Verifica en consola
      console.log('Postulantes encontrados:', postulantes.length); // Verifica en consola
      
      // Renderiza la vista con los postulantes encontrados
        res.render('admin/postulantes', { 
          postulantes: postulantes || [],
          currentPage: page,  // pagina actual
          totalPages: totalPages,         // total de paginas
          error_msg: req.flash('error_msg'),
          success_msg: req.flash('success_msg'),
          info_msg: req.flash('info_msg'),
          layout: 'layout',
          isSearch: true, // Indicador de que es una búsqueda
        });
      
    } catch (error) {
      console.error('Error en postulantes_search:', error);
      req.flash('error_msg', 'Error al buscar postulantes');
      return res.redirect('/admin/postulantes');
    }
  }

  exports.estadisticas = async (req, res) => {
    try {
      const stats = await Postulante.getStats();
      // Nueva consulta: Obtener cantidad de postulantes por hora
      const inscritosPorHora = await Postulante.getInscritosPorHora();
      
      res.render('admin/estadisticas', { 
        stats,
        inscritosPorHora, // Enviamos los datos al frontend
        error_msg: req.flash('error_msg'),
        success_msg: req.flash('success_msg')
      });
    } catch (error) {
      console.error(error);
      req.flash('error_msg', 'Error al obtener estadísticas');
      res.redirect('/admin/dashboard');
    }
  };
exports.exportarTodosExcel = async (req, res) => {
    try {
        const result = await Postulante.getAll();
        console.log('Exportando todos los postulantes a Excel:', result.length);
        const buffer = await generateExcel(result);
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