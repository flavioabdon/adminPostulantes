const PDFDocument = require('pdfkit');
const fs = require('fs');

exports.generatePDF = async (postulantes) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const buffers = [];
    
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {
      const pdfData = Buffer.concat(buffers);
      resolve(pdfData);
    });
    doc.on('error', reject);

    // Encabezado
    doc.fontSize(20).text('REPORTE DE POSTULANTES', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Fecha: ${new Date().toLocaleDateString()}`, { align: 'right' });
    doc.moveDown(2);

    // Tabla de postulantes
    let y = doc.y;
    const startX = 50;
    const columnWidth = 100;

    // Encabezados de tabla
    doc.font('Helvetica-Bold');
    doc.text('N°', startX, y);
    doc.text('Nombre Completo', startX + 30, y);
    doc.text('CI', startX + 200, y);
    doc.text('Postulación', startX + 300, y);
    doc.moveDown();

    // Línea separadora
    doc.moveTo(startX, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(0.5);

    // Contenido
    doc.font('Helvetica');
    postulantes.forEach((postulante, index) => {
      const nombreCompleto = `${postulante.nombre} ${postulante.apellido_paterno} ${postulante.apellido_materno}`;
      const ci = `${postulante.cedula_identidad}${postulante.complemento || ''} ${postulante.expedicion}`;
      
      doc.text(`${index + 1}`, startX, doc.y);
      doc.text(nombreCompleto, startX + 30, doc.y, { width: 170, ellipsis: true });
      doc.text(ci, startX + 200, doc.y);
      doc.text(postulante.tipo_postulacion, startX + 300, doc.y, { width: 150, ellipsis: true });
      
      doc.moveDown();
      if (doc.y > 700) {
        doc.addPage();
        y = 50;
      }
    });

    // Pie de página
    doc.fontSize(10).text(`Total de postulantes: ${postulantes.length}`, { align: 'right' });

    doc.end();
  });
};