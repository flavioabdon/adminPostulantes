const ExcelJS = require('exceljs');

exports.generateExcel = async (postulantes) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Postulantes');

    // Definir columnas SOLO con los campos existentes en la base de datos
    worksheet.columns = [
        { header: 'ID', key: 'id', width: 10 },
        { header: 'Nombre', key: 'nombre', width: 20 },
        { header: 'Apellido Paterno', key: 'apellido_paterno', width: 20 },
        { header: 'Apellido Materno', key: 'apellido_materno', width: 20 },
        { header: 'Fecha Nacimiento', key: 'fecha_nacimiento', width: 15 },
        { header: 'Cédula Identidad', key: 'cedula_identidad', width: 15 },
        { header: 'Complemento', key: 'complemento', width: 10 },
        { header: 'Expedición', key: 'expedicion', width: 10 },
        { header: 'Grado Instrucción', key: 'grado_instruccion', width: 20 },
        { header: 'Carrera', key: 'carrera', width: 25 },
        { header: 'Ciudad', key: 'ciudad', width: 15 },
        { header: 'Zona', key: 'zona', width: 15 },
        { header: 'Calle/Avenida', key: 'calle_avenida', width: 20 },
        { header: 'Número Domicilio', key: 'numero_domicilio', width: 15 },
        { header: 'Email', key: 'email', width: 25 },
        { header: 'Teléfono', key: 'telefono', width: 15 },
        { header: 'Celular', key: 'celular', width: 15 },
        { header: 'Cargo Postulación', key: 'cargo_postulacion', width: 25 },
        { header: 'Experiencia Específica', key: 'experiencia_especifica', width: 20 },
        { header: 'Experiencia Procesos Rural', key: 'experiencia_procesos_rural', width: 25 },
        { header: 'Es Boliviano', key: 'es_boliviano', width: 10 },
        { header: 'Registrado Padrón', key: 'registrado_en_padron_electoral', width: 15 },
        { header: 'CI Vigente', key: 'ci_vigente', width: 10 },
        { header: 'Disponibilidad Tiempo Completo', key: 'disponibilidad_tiempo_completo', width: 20 },
        { header: 'Línea Entel', key: 'linea_entel', width: 10 },
        { header: 'Sin Militancia Política', key: 'ninguna_militancia_politica', width: 20 },
        { header: 'Sin Conflictos Institución', key: 'sin_conflictos_con_la_institucion', width: 25 },
        { header: 'Sin Sentencia Ejecutoriada', key: 'sin_sentencia_ejecutoriada', width: 20 },
        { header: 'Cuenta con Celular Android', key: 'cuenta_con_celular_android', width: 20 },
        { header: 'Cuenta con Powerbank', key: 'cuenta_con_powerbank', width: 15 },
        { header: 'Archivo CI', key: 'archivo_ci', width: 20 },
        { header: 'Archivo No Militancia', key: 'archivo_no_militancia', width: 25 },
        { header: 'Archivo Hoja de Vida', key: 'archivo_hoja_de_vida', width: 25 },
        { header: 'Archivo Certificado Ofimática', key: 'archivo_certificado_ofimatica', width: 25 },
        { header: 'Fecha Registro', key: 'fecha_registro', width: 20 }
    ];

    // Formatear datos booleanos
    const formatBoolean = (value) => value ? 'Sí' : 'No';

    // Añadir filas con los datos existentes
    postulantes.forEach(postulante => {
        worksheet.addRow({
            id: postulante.id,
            nombre: postulante.nombre,
            apellido_paterno: postulante.apellido_paterno,
            apellido_materno: postulante.apellido_materno,
            fecha_nacimiento: postulante.fecha_nacimiento,
            cedula_identidad: postulante.cedula_identidad,
            complemento: postulante.complemento,
            expedicion: postulante.expedicion,
            grado_instruccion: postulante.grado_instruccion,
            carrera: postulante.carrera,
            ciudad: postulante.ciudad,
            zona: postulante.zona,
            calle_avenida: postulante.calle_avenida,
            numero_domicilio: postulante.numero_domicilio,
            email: postulante.email,
            telefono: postulante.telefono,
            celular: postulante.celular,
            cargo_postulacion: postulante.cargo_postulacion,
            experiencia_especifica: postulante.experiencia_especifica,
            experiencia_procesos_rural: postulante.experiencia_procesos_rural,
            es_boliviano: formatBoolean(postulante.es_boliviano),
            registrado_en_padron_electoral: formatBoolean(postulante.registrado_en_padron_electoral),
            ci_vigente: formatBoolean(postulante.ci_vigente),
            disponibilidad_tiempo_completo: formatBoolean(postulante.disponibilidad_tiempo_completo),
            linea_entel: formatBoolean(postulante.linea_entel),
            ninguna_militancia_politica: formatBoolean(postulante.ninguna_militancia_politica),
            sin_conflictos_con_la_institucion: formatBoolean(postulante.sin_conflictos_con_la_institucion),
            sin_sentencia_ejecutoriada: formatBoolean(postulante.sin_sentencia_ejecutoriada),
            cuenta_con_celular_android: formatBoolean(postulante.cuenta_con_celular_android),
            cuenta_con_powerbank: formatBoolean(postulante.cuenta_con_powerbank),
            archivo_ci: postulante.archivo_ci,
            archivo_no_militancia: postulante.archivo_no_militancia,
            archivo_hoja_de_vida: postulante.archivo_hoja_de_vida,
            archivo_certificado_ofimatica: postulante.archivo_certificado_ofimatica,
            fecha_registro: postulante.fecha_registro
        });
    });

    // Estilo para la cabecera
    worksheet.getRow(1).eachCell((cell) => {
        cell.font = { bold: true };
        cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFD9D9D9' }
        };
        cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
        };
    });

    // Autoajustar columnas
    worksheet.columns.forEach(column => {
        if (column.eachCell) {
            let maxLength = 0;
            column.eachCell({ includeEmpty: true }, cell => {
                let columnLength = cell.value ? cell.value.toString().length : 0;
                if (columnLength > maxLength) {
                    maxLength = columnLength;
                }
            });
            column.width = maxLength < 10 ? 10 : maxLength + 2;
        }
    });

    return workbook.xlsx.writeBuffer();
};