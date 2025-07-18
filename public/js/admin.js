$(document).ready(function() {
    // Verificar si la tabla existe y no está ya inicializada
    if ($('#postulantesTable').length && !$.fn.DataTable.isDataTable('#postulantesTable')) {
        // Destruir cualquier instancia previa (por seguridad)
        if ($.fn.dataTable.isDataTable('#postulantesTable')) {
            $('#postulantesTable').DataTable().destroy();
        }

        // Inicializar DataTable con configuración completa
        const table = $('#postulantesTable').DataTable({
            language: {
                url: '//cdn.datatables.net/plug-ins/1.11.5/i18n/es-ES.json'
            },
            responsive: true,
            dom: '<"top"<"row"<"col-md-6"l><"col-md-6"f>>><"row"<"col-md-12"tr>><"bottom"<"row"<"col-md-6"i><"col-md-6"p>>>',
            pageLength: 25,
            lengthMenu: [10, 25, 50, 100],
            columnDefs: [
                { 
                    orderable: false,
                    className: 'select-checkbox',
                    targets: 0
                },
                { responsivePriority: 1, targets: 1 },
                { responsivePriority: 2, targets: 2 }
            ],
            select: {
                style: 'multi',
                selector: 'td:first-child'
            },
            initComplete: function() {
                console.log('DataTable inicializado correctamente');
                initializeTableEvents(table);
            }
        });
    }

    const archivoModal = new bootstrap.Modal(document.getElementById('archivoModal'), {
        backdrop: true,
        keyboard: true
    });
    
    let isFullscreen = false;
    let originalStyles = {};
    
    // Función para alternar pantalla completa
    function toggleFullscreen() {
        const modalContent = $('.modal-content');
        const modalDialog = $('.modal-dialog');
        
        if (!isFullscreen) {
            // Guardar estilos originales
            originalStyles = {
                margin: modalDialog.css('margin'),
                maxWidth: modalDialog.css('max-width'),
                borderRadius: modalContent.css('border-radius')
            };
            
            // Aplicar estilos de pantalla completa
            modalDialog.css({
                'margin': '0',
                'max-width': '100%',
                'width': '100%',
                'height': '100vh'
            });
            
            modalContent.css({
                'border-radius': '0',
                'height': '100vh'
            });
            
            $('.modal-body').css('height', 'calc(100vh - 120px)');
            
            isFullscreen = true;
            $('#fullscreenBtn').html('<i class="bi bi-fullscreen-exit"></i> Salir de pantalla completa');
        } else {
            // Restaurar estilos originales
            modalDialog.css({
                'margin': originalStyles.margin,
                'max-width': originalStyles.maxWidth,
                'width': '',
                'height': '90vh'
            });
            
            modalContent.css({
                'border-radius': originalStyles.borderRadius,
                'height': '90vh'
            });
            
            $('.modal-body').css('height', 'calc(90vh - 120px)');
            
            isFullscreen = false;
            $('#fullscreenBtn').html('<i class="bi bi-fullscreen"></i> Pantalla completa');
        }
    }
    
    // Manejador de clic para pantalla completa
    $('#fullscreenBtn').on('click', toggleFullscreen);
    
    // Manejador para los botones de visualización
    $(document).on('click', '.view-file-btn', function() {
        const fileUrl = $(this).data('file-url');
        const fileType = $(this).data('file-type');
        const fileName = fileUrl.split('/').pop();
        
        // Resetear pantalla completa si estaba activa
        if (isFullscreen) {
            toggleFullscreen();
        }
        
        // Mostrar spinner
        $('#loadingSpinner').show();
        $('#pdf-viewer, #image-viewer, #unsupported-viewer').hide();
        $('#archivoModalLabel').text(`Visualizando: ${fileName}`);
        $('#download-link, #full-download-link').attr('href', fileUrl);
        
        // Mostrar el modal
        archivoModal.show();
        
        // Cargar contenido según tipo
        if (fileType === 'pdf') {
            $('#pdf-iframe').on('load', function() {
                $('#loadingSpinner').hide();
                $('#pdf-viewer').show();
            }).attr('src', fileUrl);
        } else if (['jpg', 'jpeg', 'png', 'gif'].includes(fileType)) {
            $('#image-preview').on('load', function() {
                $('#loadingSpinner').hide();
                $('#image-viewer').show();
            }).attr('src', fileUrl);
        } else {
            $('#loadingSpinner').hide();
            $('#unsupported-viewer').show();
        }
    });
    
    // Manejo del cierre del modal
    function resetModal() {
        $('#pdf-iframe').attr('src', '').off('load');
        $('#image-preview').attr('src', '').off('load');
        $('#loadingSpinner').hide();
        $('#pdf-viewer, #image-viewer, #unsupported-viewer').hide();
    }
    
    $('#modalCloseBtn, .btn-close').on('click', function() {
        resetModal();
        archivoModal.hide();
    });
    
    $('#archivoModal').on('hidden.bs.modal', resetModal);
    
    $(document).on('keydown', function(e) {
        if (e.key === 'Escape') {
            resetModal();
            archivoModal.hide();
        }
    });
    // Función para manejar eventos de la tabla
    function initializeTableEvents(table) {
        // Selección/deselección global
        $('#selectAll').on('change', function() {
            const isChecked = this.checked;
            table.rows().nodes().to$().find('input[type="checkbox"]').prop('checked', isChecked);
            
            if (isChecked) {
                table.rows().select();
            } else {
                table.rows().deselect();
            }
        });

        // Manejar selección individual
        $('#postulantesTable tbody').on('change', 'input[type="checkbox"]', function() {
            const tr = $(this).closest('tr');
            const row = table.row(tr);
            
            if (this.checked) {
                row.select();
            } else {
                row.deselect();
                $('#selectAll').prop('checked', false);
            }
        });

        // Exportar selección
        $('#exportSelectedBtn').click(function() {
            const tipo = $('#exportType').val();
            const selectedCount = table.rows({ selected: true }).count();
            
            if (selectedCount === 0) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Selección requerida',
                    text: 'Por favor seleccione al menos un postulante',
                    confirmButtonText: 'Entendido'
                });
                return;
            }
            
            if (!tipo) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Formato requerido',
                    text: 'Por favor seleccione un formato de exportación',
                    confirmButtonText: 'Entendido'
                });
                return;
            }
            
            // Crear formulario dinámico con los IDs seleccionados
            const form = $('<form>', {
                action: '/admin/exportar-postulantes',
                method: 'POST'
            });
            
            const selectedIds = table.rows({ selected: true }).data().toArray().map(row => row[1]); // Asume que ID está en la columna 1
            
            selectedIds.forEach(id => {
                form.append($('<input>', {
                    type: 'hidden',
                    name: 'ids',
                    value: id
                }));
            });
            
            form.append($('<input>', {
                type: 'hidden',
                name: 'tipo',
                value: tipo
            }));
            
            $('body').append(form);
            form.submit();
        });

        // Descargar todo Excel
        $('#exportAllExcelBtn').click(function(e) {
            e.preventDefault();
            const url = $(this).attr('href');
            
            Swal.fire({
                title: 'Confirmar descarga completa',
                text: `¿Desea descargar todos los ${table.rows().count()} postulantes en Excel?`,
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Descargar',
                cancelButtonText: 'Cancelar',
                confirmButtonColor: '#198754'
            }).then((result) => {
                if (result.isConfirmed) {
                    window.location.href = url;
                }
            });
        });
    }
});