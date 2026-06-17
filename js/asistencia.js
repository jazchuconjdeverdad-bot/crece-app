// --- REGISTRO DE ASISTENCIA DINÁMICA REDISEÑADA ---

// Estados locales de la tabla de asistencia
let attendanceSortBy = 'student';
let attendanceOrder = 'asc';

// Elementos de la interfaz (DOM)
const attendanceTableBody = document.getElementById('attendance-table-body');
const attendanceSearchInput = document.getElementById('attendance-search-input');
const attendanceGradeSelect = document.getElementById('attendance-grade-select');
const attendanceDateSelect = document.getElementById('attendance-date-select');
const attendanceTableHeaders = document.querySelectorAll('#attendance-table-element th');

// Tarjetas de estadísticas
const statTotalRec = document.getElementById('stat-total-rec');
const statPresentRec = document.getElementById('stat-present-rec');
const statAbsentRec = document.getElementById('stat-absent-rec');
const statTardyRec = document.getElementById('stat-tardy-rec');

// Utilidad de URL (compartida)
const getAttendanceApiUrl = (endpoint) => {
  const isHttp = window.location.protocol.startsWith('http');
  const baseUrl = isHttp ? '' : 'http://localhost:3000';
  return `${baseUrl}${endpoint}`;
};

// Helper para saber si el usuario actual es admin
function isAttendanceUserAdmin() {
  try {
    const userJson = localStorage.getItem('currentUser');
    if (!userJson) return false;
    const user = JSON.parse(userJson);
    return user && user.role === 'admin';
  } catch (e) {
    return false;
  }
}

/**
 * Realiza la petición a la API y renderiza los datos de asistencia.
 */
async function loadAttendance() {
  if (!attendanceTableBody) return;
  
  const isAdmin = isAttendanceUserAdmin();
  const colSpan = isAdmin ? 6 : 5;
  
  attendanceTableBody.innerHTML = `<tr><td colspan="${colSpan}" style="text-align: center; color: var(--text-muted);">Cargando registros...</td></tr>`;
  
  try {
    const q = attendanceSearchInput ? attendanceSearchInput.value.trim() : '';
    const grade = attendanceGradeSelect ? attendanceGradeSelect.value : 'all';
    const dateVal = attendanceDateSelect ? attendanceDateSelect.value : '';
    
    if (!dateVal) {
      attendanceTableBody.innerHTML = `<tr><td colspan="${colSpan}" style="text-align: center; color: var(--text-muted);">Selecciona una fecha para ver el registro.</td></tr>`;
      return;
    }

    // Armar URL con parámetros
    const url = getAttendanceApiUrl(`/api/asistencia?q=${encodeURIComponent(q)}&grade=${grade}&date=${dateVal}&sortBy=${attendanceSortBy}&order=${attendanceOrder}`);
    
    const res = await fetch(url);
    if (!res.ok) throw new Error('Error de conexión con la API de asistencia');
    
    const data = await res.json();
    const records = data.records;
    const stats = data.stats;
    
    // 1. Actualizar tarjetas de estadísticas
    if (statTotalRec) statTotalRec.textContent = stats.total || 0;
    if (statPresentRec) statPresentRec.textContent = stats.presentes || 0;
    if (statAbsentRec) statAbsentRec.textContent = stats.ausentes || 0;
    if (statTardyRec) statTardyRec.textContent = '0%'; // Mostramos porcentaje general de asistencia o 0
    if (stats.total > 0 && statTardyRec) {
      const globalPercent = Math.round((stats.presentes * 100) / stats.total);
      statTardyRec.textContent = `${globalPercent}%`;
    }
    
    // 2. Actualizar encabezado de la tabla para mostrar/ocultar columna Acciones y Porcentaje
    const tableElement = document.getElementById('attendance-table-element');
    if (tableElement) {
      const thead = tableElement.querySelector('thead tr');
      if (thead) {
        // Asegurarse de que esté el TH de Porcentaje
        let pctTh = thead.querySelector('.th-percentage');
        if (!pctTh) {
          pctTh = document.createElement('th');
          pctTh.className = 'th-percentage';
          pctTh.setAttribute('data-sort', 'attendance_percentage');
          pctTh.style.cursor = 'pointer';
          pctTh.innerHTML = 'Asistencia % ⇅';
          // Insertar antes del th de acciones si existe
          const existingActionTh = thead.querySelector('.th-acciones');
          if (existingActionTh) {
            thead.insertBefore(pctTh, existingActionTh);
          } else {
            thead.appendChild(pctTh);
          }
        }

        // Remover columna Acciones existente si hay
        const existingActionTh = thead.querySelector('.th-acciones');
        if (existingActionTh) existingActionTh.remove();
        
        // Agregar columna Acciones si es admin
        if (isAdmin) {
          const actionTh = document.createElement('th');
          actionTh.className = 'th-acciones';
          actionTh.textContent = 'Acciones';
          thead.appendChild(actionTh);
        }
      }
    }
    
    // 3. Renderizar filas en la tabla
    if (records.length === 0) {
      attendanceTableBody.innerHTML = `<tr><td colspan="${colSpan}" style="text-align: center; color: var(--text-muted);">No se encontraron alumnos para los criterios seleccionados.</td></tr>`;
      return;
    }
    
    attendanceTableBody.innerHTML = records.map(record => {
      // Clases del badge según el estado
      let badgeClass = 'badge-presente';
      if (record.status === 'Ausente') badgeClass = 'badge-ausente';
      
      const recordDate = new Date(record.date);
      const formattedDate = recordDate.toLocaleDateString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit' });
      const isoDate = record.date.substring(0, 10);
      
      const badgeHtml = isAdmin 
        ? `<span class="badge ${badgeClass}" onclick="window.changeAttendanceStatusInline('${record.student}', '${record.grade}', '${isoDate}', '${record.status}')" style="cursor:pointer;" title="Click para alternar estado">${record.status === 'Presente' ? '✅ Presente' : '❌ Ausente'}</span>`
        : `<span class="badge ${badgeClass}">${record.status === 'Presente' ? '✅ Presente' : '❌ Ausente'}</span>`;

      // Colorear el porcentaje individual de asistencia
      const pct = record.attendance_percentage !== null ? record.attendance_percentage : 100;
      let pctColor = 'var(--success)';
      if (pct < 60) pctColor = 'var(--danger)';
      else if (pct < 85) pctColor = 'var(--warning)';

      return `
        <tr>
          <td><strong>${record.student}</strong></td>
          <td>${record.grade}</td>
          <td>${formattedDate}</td>
          <td>${badgeHtml}</td>
          <td><strong style="color: ${pctColor};">${pct}%</strong></td>
          ${isAdmin ? `<td><button onclick="window.deleteAsistenciaItem(${record.id})" style="background: var(--danger); color: #fff; border: none; border-radius: var(--radius-sm); padding: 4px 10px; font-size: 0.8rem; cursor: pointer;">🗑</button></td>` : ''}
        </tr>
      `;
    }).join('');
    
  } catch (err) {
    console.error('Error cargando asistencia:', err);
    const colSpan = isAttendanceUserAdmin() ? 6 : 5;
    attendanceTableBody.innerHTML = `<tr><td colspan="${colSpan}" style="text-align: center; color: var(--danger);">Error al conectar con la base de datos de asistencia.</td></tr>`;
  }
}

// Exponer como global
window.loadAttendance = loadAttendance;

// Función para cambiar estado de asistencia inline (Presente / Ausente)
window.changeAttendanceStatusInline = async function (student, grade, date, currentStatus) {
  const token = localStorage.getItem('sessionToken');
  if (!token) return;

  // Alternar entre Presente y Ausente
  let newStatus = (currentStatus === 'Presente') ? 'Ausente' : 'Presente';
  const payload = { student, grade, date, status: newStatus };

  try {
    const res = await fetch(getAttendanceApiUrl('/api/asistencia'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Error al actualizar estado');
    }

    loadAttendance();
  } catch (err) {
    console.error('Error al actualizar inline status:', err);
    if (typeof window.showToastNotification === 'function') {
      window.showToastNotification('Error', err.message, 'error');
    } else {
      alert('Error: ' + err.message);
    }
  }
};

// Exportar datos visualizados a CSV (Excel)
window.exportAttendanceToCSV = function() {
  const table = document.getElementById('attendance-table-element');
  if (!table) return;
  
  let csv = [];
  const rows = table.querySelectorAll('tr');
  for (let i = 0; i < rows.length; i++) {
    const row = [], cols = rows[i].querySelectorAll('td, th');
    for (let j = 0; j < cols.length; j++) {
      // Saltar columna de acciones si existe
      if (cols[j].classList.contains('th-acciones') || cols[j].querySelector('button')) continue;
      row.push('"' + cols[j].innerText.trim().replace(/"/g, '""') + '"');
    }
    if (row.length > 0) csv.push(row.join(','));
  }
  
  const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + csv.join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  
  const grade = attendanceGradeSelect ? attendanceGradeSelect.value : 'todos';
  const dateVal = attendanceDateSelect ? attendanceDateSelect.value : 'fecha';
  link.setAttribute('download', `asistencia_${grade.replace(/\s+/g, '_')}_${dateVal}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  if (typeof window.showToastNotification === 'function') {
    window.showToastNotification('Exportación', 'Reporte de asistencia descargado en CSV.', 'success');
  }
};

// Exportar reporte a PDF mediante diálogo de impresión
window.exportAttendanceToPDF = function() {
  window.print();
};

// Debounce para búsqueda
if (attendanceSearchInput) {
  let searchTimeout;
  attendanceSearchInput.addEventListener('input', () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(loadAttendance, 300);
  });
}

// Filtro por grado
if (attendanceGradeSelect) {
  attendanceGradeSelect.addEventListener('change', loadAttendance);
}

// Filtro por fecha
if (attendanceDateSelect) {
  attendanceDateSelect.addEventListener('change', loadAttendance);
}

// Ordenamiento por columnas
attendanceTableHeaders.forEach(th => {
  th.addEventListener('click', () => {
    const sortField = th.getAttribute('data-sort');
    if (!sortField) return;
    
    if (attendanceSortBy === sortField) {
      attendanceOrder = attendanceOrder === 'asc' ? 'desc' : 'asc';
    } else {
      attendanceSortBy = sortField;
      attendanceOrder = 'asc';
    }
    
    attendanceTableHeaders.forEach(header => {
      header.classList.remove('sort-asc', 'sort-desc');
    });
    th.classList.add(attendanceOrder === 'asc' ? 'sort-asc' : 'sort-desc');
    loadAttendance();
  });
});

// Inicializar al cargar el documento
document.addEventListener('DOMContentLoaded', () => {
  if (attendanceDateSelect && !attendanceDateSelect.value) {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    attendanceDateSelect.value = `${yyyy}-${mm}-${dd}`;
  }
  loadAttendance();
});
