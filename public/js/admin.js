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
                    targets: 0,
                    className: 'select-checkbox'
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