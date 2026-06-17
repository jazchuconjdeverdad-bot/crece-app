// --- SISTEMA DE LOG IN Y PANEL DE ADMINISTRACIÓN ---

const getAuthApiUrl = (endpoint) => {
  const isHttp = window.location.protocol.startsWith('http');
  const baseUrl = isHttp ? '' : 'http://localhost:3000';
  return `${baseUrl}${endpoint}`;
};

// Referencias del DOM
const authModal = document.getElementById('auth-modal');
const headerLoginBtn = document.getElementById('header-login-btn');
const headerUserMenu = document.getElementById('header-user-menu');
const headerUsernameLabel = document.getElementById('header-username-label');
const headerLogoutBtn = document.getElementById('header-logout-btn');
const authCloseBtn = document.getElementById('auth-close-btn');

// Selector de Pestañas (Tabs)
const tabLoginBtn = document.getElementById('tab-login-btn');
const tabRegisterBtn = document.getElementById('tab-register-btn');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');

// Formularios
const regPasswordInput = document.getElementById('register-password');
const regConfirmPasswordInput = document.getElementById('register-confirm-password');
const regPasswordMatchError = document.getElementById('register-password-match-error');

// Panel Administrativo
const adminPanelSection = document.getElementById('panel-admin');
const adminUsersList = document.getElementById('admin-users-list');
const adminMessagesList = document.getElementById('admin-messages-list');
const adminUploadTabs = document.getElementById('admin-upload-tabs');
const adminUploadPanes = document.querySelectorAll('.admin-upload-pane');

// Formularios CRUD del admin
const adminGaleriaForm = document.getElementById('admin-galeria-form');
const adminProyectoForm = document.getElementById('admin-proyecto-form');
const adminGuionForm = document.getElementById('admin-guion-form');
const adminAsistenciaForm = document.getElementById('admin-asistencia-form');

// ==========================================
// 1. MANEJO DE SESIÓN Y VISTAS DE ROL
// ==========================================

function getSessionToken() {
  return localStorage.getItem('sessionToken');
}

function getCurrentUser() {
  const userJson = localStorage.getItem('currentUser');
  return userJson ? JSON.parse(userJson) : null;
}

function updateAuthUI() {
  const user = getCurrentUser();
  const token = getSessionToken();

  if (user && token) {
    // Usuario logueado
    if (headerLoginBtn) headerLoginBtn.style.display = 'none';
    if (headerUserMenu) {
      headerUserMenu.style.display = 'flex';
      if (headerUsernameLabel) headerUsernameLabel.textContent = user.name || user.username;
    }
    
    // Mostrar u ocultar panel administrativo según el rol
    if (user.role === 'admin') {
      const adminOnlyElements = document.querySelectorAll('.admin-only');
      adminOnlyElements.forEach(el => el.style.display = 'block');
      loadAdminUsers(); // Cargar la tabla de usuarios
      loadAdminMessages(); // Cargar los mensajes de contacto
    } else {
      const adminOnlyElements = document.querySelectorAll('.admin-only');
      adminOnlyElements.forEach(el => el.style.display = 'none');
    }
  } else {
    // Usuario no logueado
    if (headerLoginBtn) headerLoginBtn.style.display = 'block';
    if (headerUserMenu) headerUserMenu.style.display = 'none';
    
    // Ocultar paneles administrativos
    const adminOnlyElements = document.querySelectorAll('.admin-only');
    adminOnlyElements.forEach(el => el.style.display = 'none');
  }
  handleLocalRefresh();
}

// Cierre de Sesión
if (headerLogoutBtn) {
  headerLogoutBtn.addEventListener('click', () => {
    localStorage.removeItem('sessionToken');
    localStorage.removeItem('currentUser');
    
    updateAuthUI();
    showToastNotification('Cierre de Sesión', 'Has cerrado tu sesión con éxito.', 'success');
    window.location.hash = '#inicio';
  });
}

// ==========================================
// 2. MODAL DE LOGIN & REGISTRO
// ==========================================

// Abrir Modal
if (headerLoginBtn) {
  headerLoginBtn.addEventListener('click', () => {
    if (authModal) {
      authModal.style.display = 'flex';
      // Por defecto activar la pestaña de Login
      switchTab('login');
    }
  });
}

// Cerrar Modal
if (authCloseBtn) {
  authCloseBtn.addEventListener('click', () => {
    if (authModal) authModal.style.display = 'none';
  });
}

if (authModal) {
  authModal.addEventListener('click', (e) => {
    if (e.target === authModal) {
      authModal.style.display = 'none';
    }
  });
}

// Alternancia de Pestañas
function switchTab(tab) {
  if (tab === 'login') {
    tabLoginBtn.classList.add('active');
    tabLoginBtn.style.borderBottom = '3px solid var(--primary)';
    tabLoginBtn.style.color = 'var(--primary)';
    
    tabRegisterBtn.classList.remove('active');
    tabRegisterBtn.style.borderBottom = 'none';
    tabRegisterBtn.style.color = 'var(--text-muted)';
    
    loginForm.style.display = 'block';
    registerForm.style.display = 'none';
  } else {
    tabRegisterBtn.classList.add('active');
    tabRegisterBtn.style.borderBottom = '3px solid var(--accent)';
    tabRegisterBtn.style.color = 'var(--accent)';
    
    tabLoginBtn.classList.remove('active');
    tabLoginBtn.style.borderBottom = 'none';
    tabLoginBtn.style.color = 'var(--text-muted)';
    
    loginForm.style.display = 'none';
    registerForm.style.display = 'block';
  }
}

if (tabLoginBtn) tabLoginBtn.addEventListener('click', () => switchTab('login'));
if (tabRegisterBtn) tabRegisterBtn.addEventListener('click', () => switchTab('register'));

// Petición AJAX: LOGIN
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;
    
    try {
      const res = await fetch(getAuthApiUrl('/api/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Credenciales incorrectas');
      }
      
      // Guardar sesión
      localStorage.setItem('sessionToken', data.token);
      localStorage.setItem('currentUser', JSON.stringify(data.user));
      
      authModal.style.display = 'none';
      loginForm.reset();
      
      updateAuthUI();
      showToastNotification('¡Bienvenido!', `Has iniciado sesión como: ${data.user.name}`, 'success');
      
    } catch (err) {
      showToastNotification('Error de Acceso', err.message, 'error');
    }
  });
}

// Petición AJAX: REGISTRO
if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('register-username').value.trim();
    const name = document.getElementById('register-name').value.trim();
    const email = document.getElementById('register-email').value.trim();
    const password = regPasswordInput.value;
    const confirmPassword = regConfirmPasswordInput.value;
    
    // Validar coincidencia de contraseña
    if (password !== confirmPassword) {
      regPasswordMatchError.style.display = 'block';
      return;
    } else {
      regPasswordMatchError.style.display = 'none';
    }
    
    try {
      const res = await fetch(getAuthApiUrl('/api/register'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, name, email, password })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Error al registrar usuario');
      }
      
      showToastNotification('Registro Completado', 'Cuenta creada con éxito. Ahora inicia sesión.', 'success');
      registerForm.reset();
      
      // Cambiar a pestaña de Login y pre-rellenar usuario
      switchTab('login');
      document.getElementById('login-username').value = username;
      
    } catch (err) {
      showToastNotification('Error de Registro', err.message, 'error');
    }
  });
}

// Ocultar error de contraseña al escribir
if (regConfirmPasswordInput) {
  regConfirmPasswordInput.addEventListener('input', () => {
    regPasswordMatchError.style.display = 'none';
  });
}

// ==========================================
// 3. PANEL DE ADMINISTRACIÓN (SOLO ADMINS)
// ==========================================

// Carga de la lista de usuarios
async function loadAdminUsers() {
  if (!adminUsersList) return;
  
  adminUsersList.innerHTML = '<tr><td colspan="3" style="text-align: center; color: var(--text-muted);">Cargando usuarios...</td></tr>';
  
  const token = getSessionToken();
  if (!token) return;
  
  try {
    const res = await fetch(getAuthApiUrl('/api/users'), {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `No posees autorización para ver esta sección (Código: ${res.status})`);
    }
    
    const users = await res.json();
    
    adminUsersList.innerHTML = users.map(user => {
      // Deshabilitar botones para el administrador semilla 'admin'
      const isSeedAdmin = user.username === 'admin';
      const buttonText = user.role === 'admin' ? 'Degradar' : 'Hacer Admin';
      const buttonClass = user.role === 'admin' ? 'btn-secondary' : 'btn-primary';
      const newRole = user.role === 'admin' ? 'user' : 'admin';
      
      return `
        <tr>
          <td><strong>${user.name} (${user.username})</strong><br><small style="color: var(--text-muted);">${user.email}</small></td>
          <td>
            <span class="badge ${user.role === 'admin' ? 'badge-presente' : 'badge-tarde'}">
              ${user.role.toUpperCase()}
            </span>
          </td>
          <td style="text-align: right;">
            <button class="btn ${buttonClass} btn-toggle-role" 
                    data-id="${user.id}" 
                    data-role="${newRole}"
                    ${isSeedAdmin ? 'disabled title="No puedes degradar al admin principal"' : ''} 
                    style="font-size: 0.75rem; padding: 4px 10px; border-radius: var(--radius-sm);">
              ${buttonText}
            </button>
          </td>
        </tr>
      `;
    }).join('');
    
    // Asignar eventos de click a botones de cambio de rol
    adminUsersList.querySelectorAll('.btn-toggle-role').forEach(btn => {
      btn.addEventListener('click', () => {
        const userId = btn.getAttribute('data-id');
        const role = btn.getAttribute('data-role');
        changeUserRole(userId, role);
      });
    });
    
  } catch (err) {
    console.error('Error cargando usuarios en panel:', err);
    adminUsersList.innerHTML = `<tr><td colspan="3" style="text-align: center; color: var(--danger);">${err.message}</td></tr>`;
  }
}

// Envío AJAX de Cambio de Rol
async function changeUserRole(userId, newRole) {
  const token = getSessionToken();
  if (!token) return;

  try {
    const res = await fetch(getAuthApiUrl(`/api/users/${userId}/role`), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ role: newRole })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Error al cambiar rol');
    }

    showToastNotification('Rol Actualizado', `Permisos cambiados a "${newRole}" con éxito.`, 'success');
    
    // Si el administrador se cambió el rol a sí mismo por error o a través de otro medio, actualizar su sesión local
    const currentUser = getCurrentUser();
    if (currentUser && String(currentUser.id) === String(userId)) {
      currentUser.role = newRole;
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
      localStorage.setItem('sessionToken', `${currentUser.username}:${newRole}`);
      updateAuthUI();
    } else {
      loadAdminUsers();
    }
    
  } catch (err) {
    showToastNotification('Error de Permisos', err.message, 'error');
  }
}

// Carga de mensajes de contacto
async function loadAdminMessages() {
  if (!adminMessagesList) return;
  
  adminMessagesList.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--text-muted);">Cargando mensajes...</td></tr>';
  
  const token = getSessionToken();
  if (!token) return;
  
  try {
    const res = await fetch(getAuthApiUrl('/api/contacto'), {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `No posees autorización para ver esta sección (Código: ${res.status})`);
    }
    
    const messages = await res.json();
    
    if (messages.length === 0) {
      adminMessagesList.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--text-muted);">No hay mensajes de contacto recibidos.</td></tr>';
      return;
    }
    
    adminMessagesList.innerHTML = messages.map(msg => {
      const formattedDate = new Date(msg.created_at || Date.now()).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      return `
        <tr>
          <td><strong>${msg.name}</strong><br><small style="color: var(--text-muted);">${msg.email}</small></td>
          <td><strong>${msg.subject}</strong></td>
          <td style="max-width: 300px; white-space: pre-wrap; font-size: 0.85rem;">${msg.message}</td>
          <td><small style="color: var(--text-muted);">${formattedDate}</small></td>
          <td style="text-align: right;">
            <button class="btn btn-secondary btn-delete-message" 
                    data-id="${msg.id}" 
                    style="font-size: 0.75rem; padding: 4px 10px; border-radius: var(--radius-sm); background: var(--danger); color: #fff; border: none; cursor: pointer;">
              🗑 Eliminar
            </button>
          </td>
        </tr>
      `;
    }).join('');
    
    // Asignar eventos de click a botones de eliminación
    adminMessagesList.querySelectorAll('.btn-delete-message').forEach(btn => {
      btn.addEventListener('click', () => {
        const messageId = btn.getAttribute('data-id');
        if (confirm('¿Estás seguro de que deseas eliminar este mensaje de contacto?')) {
          deleteAdminMessage(messageId);
        }
      });
    });
    
  } catch (err) {
    console.error('Error cargando mensajes en panel:', err);
    adminMessagesList.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--danger);">${err.message}</td></tr>`;
  }
}

// Eliminar mensaje de contacto
async function deleteAdminMessage(messageId) {
  const token = getSessionToken();
  if (!token) return;

  try {
    const res = await fetch(getAuthApiUrl(`/api/contacto/${messageId}`), {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Error al eliminar mensaje');
    }

    showToastNotification('Mensaje Eliminado', 'El mensaje de contacto ha sido eliminado del sistema.', 'success');
    loadAdminMessages();
    
  } catch (err) {
    showToastNotification('Error al Eliminar', err.message, 'error');
  }
}

// --- LOGICA DE PESTAÑAS DE CARGA (PANEL ADMIN) ---
if (adminUploadTabs) {
  adminUploadTabs.addEventListener('click', (e) => {
    if (e.target.classList.contains('filter-btn')) {
      // Activar pestaña visualmente
      adminUploadTabs.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
      e.target.classList.add('active');
      
      // Mostrar el panel correspondiente
      const tabId = e.target.getAttribute('data-tab');
      
      adminUploadPanes.forEach(pane => {
        if (pane.getAttribute('id') === `pane-${tabId}`) {
          pane.style.display = 'block';
        } else {
          pane.style.display = 'none';
        }
      });
    }
  });
}

// ==========================================
// 4. OPERACIONES CRUD DEL ADMIN
// ==========================================

// --- GALERÍA CRUD ---

// Vista previa de imagen seleccionada
const agImageInput = document.getElementById('ag-image');
const agImagePreview = document.getElementById('ag-image-preview');
const agImagePreviewImg = document.getElementById('ag-image-preview-img');

if (agImageInput) {
  agImageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (agImagePreviewImg) agImagePreviewImg.src = ev.target.result;
        if (agImagePreview) agImagePreview.style.display = 'block';
      };
      reader.readAsDataURL(file);
    } else {
      if (agImagePreview) agImagePreview.style.display = 'none';
      if (agImagePreviewImg) agImagePreviewImg.src = '';
    }
  });
}

if (adminGaleriaForm) {
  adminGaleriaForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const token = getSessionToken();
    if (!token) return;

    const imageFile = document.getElementById('ag-image').files[0];
    if (!imageFile) {
      showToastNotification('Error', 'Selecciona una imagen para subir.', 'error');
      return;
    }

    // Usar FormData para enviar la imagen como archivo
    const formData = new FormData();
    formData.append('title', document.getElementById('ag-title').value.trim());
    formData.append('description', document.getElementById('ag-desc').value.trim());
    formData.append('grade', document.getElementById('ag-grade').value);
    formData.append('date', document.getElementById('ag-date').value);
    formData.append('image', imageFile); // El archivo real

    try {
      const res = await fetch(getAuthApiUrl('/api/galeria'), {
        method: 'POST',
        headers: {
          // NO incluir 'Content-Type' — el navegador lo pone automáticamente con el boundary de multipart
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al crear elemento de galería');

      showToastNotification('Galería', '📸 Imagen subida con éxito.', 'success');
      adminGaleriaForm.reset();
      // Limpiar la vista previa
      if (agImagePreview) agImagePreview.style.display = 'none';
      if (agImagePreviewImg) agImagePreviewImg.src = '';
      notifyDataChange();
    } catch (err) {
      showToastNotification('Error', err.message, 'error');
    }
  });
}

// Variables para el control del modal de confirmación de borrado
let itemToDeleteId = null;
let deleteCallback = null;

const deleteConfirmModal = document.getElementById('confirm-delete-modal');
const cancelDeleteBtn = document.getElementById('confirm-delete-cancel-btn');
const confirmDeleteBtn = document.getElementById('confirm-delete-confirm-btn');

// Cerrar modal de confirmación
if (cancelDeleteBtn && deleteConfirmModal) {
  cancelDeleteBtn.addEventListener('click', () => {
    deleteConfirmModal.style.display = 'none';
    itemToDeleteId = null;
    deleteCallback = null;
  });
}

if (confirmDeleteBtn && deleteConfirmModal) {
  confirmDeleteBtn.addEventListener('click', async () => {
    if (itemToDeleteId && typeof deleteCallback === 'function') {
      await deleteCallback(itemToDeleteId);
    }
    deleteConfirmModal.style.display = 'none';
    itemToDeleteId = null;
    deleteCallback = null;
  });
}

function showDeleteConfirmation(id, callback) {
  itemToDeleteId = id;
  deleteCallback = callback;
  if (deleteConfirmModal) {
    deleteConfirmModal.style.display = 'flex';
  }
}

window.deleteGaleriaItem = function (id) {
  showDeleteConfirmation(id, async (itemId) => {
    const token = getSessionToken();
    if (!token) return;

    try {
      const res = await fetch(getAuthApiUrl(`/api/galeria/${itemId}`), {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Error al eliminar imagen');
      }

      showToastNotification('Galería', 'Imagen eliminada con éxito.', 'success');
      notifyDataChange();
    } catch (err) {
      showToastNotification('Error', err.message, 'error');
    }
  });
};

// --- EDITAR GALERÍA ---
window.editGaleriaItem = function(id, btn) {
  const title = btn.getAttribute('data-title');
  const desc = btn.getAttribute('data-desc');
  const grade = btn.getAttribute('data-grade');
  const date = btn.getAttribute('data-date');
  const src = btn.getAttribute('data-src');

  openEditModal({
    title: 'Editar Imagen de Galería',
    fields: [
      { name: 'title', label: 'Título', type: 'text', value: title },
      { name: 'description', label: 'Descripción', type: 'textarea', value: desc },
      { name: 'grade', label: 'Grado', type: 'select', value: grade, options: ['5°', '6°'] },
      { name: 'date', label: 'Fecha', type: 'date', value: date ? date.split('T')[0] : '' },
      { name: 'image', label: 'Nueva Imagen (opcional)', type: 'file', accept: 'image/*' }
    ],
    currentImageSrc: src,
    onSubmit: async (formData) => {
      const token = getSessionToken();
      try {
        const res = await fetch(getAuthApiUrl(`/api/galeria/${id}`), {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Error al editar');
        showToastNotification('Galería', '📸 Imagen actualizada con éxito.', 'success');
        notifyDataChange();
        return true;
      } catch (err) {
        showToastNotification('Error', err.message, 'error');
        return false;
      }
    }
  });
};

// --- PROYECTOS CRUD ---
if (adminProyectoForm) {
  adminProyectoForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const token = getSessionToken();
    if (!token) return;

    const formData = new FormData();
    formData.append('title', document.getElementById('ap-title').value.trim());
    formData.append('author', document.getElementById('ap-author').value.trim());
    formData.append('grade', document.getElementById('ap-grade').value);
    formData.append('description', document.getElementById('ap-desc').value.trim());
    formData.append('scratch_url', document.getElementById('ap-url').value.trim());

    const thumbInput = document.getElementById('ap-thumb');
    const thumbFileInput = document.getElementById('ap-thumb-file');

    if (thumbFileInput && thumbFileInput.files && thumbFileInput.files.length > 0) {
      formData.append('thumbnail_file', thumbFileInput.files[0]);
    } else if (thumbInput && thumbInput.value.trim()) {
      formData.append('thumbnail', thumbInput.value.trim());
    }

    try {
      const res = await fetch(getAuthApiUrl('/api/proyectos'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al crear proyecto');

      showToastNotification('Proyectos', 'Proyecto agregado con éxito.', 'success');
      adminProyectoForm.reset();
      notifyDataChange();
    } catch (err) {
      showToastNotification('Error', err.message, 'error');
    }
  });
}

window.deleteProyectoItem = function (id) {
  showDeleteConfirmation(id, async (itemId) => {
    const token = getSessionToken();
    if (!token) return;

    try {
      const res = await fetch(getAuthApiUrl(`/api/proyectos/${itemId}`), {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Error al eliminar proyecto');
      }

      showToastNotification('Proyectos', 'Proyecto eliminado con éxito.', 'success');
      notifyDataChange();
    } catch (err) {
      showToastNotification('Error', err.message, 'error');
    }
  });
};

// --- EDITAR PROYECTO ---
window.editProyectoItem = function(id, btn) {
  const title = btn.getAttribute('data-title');
  const author = btn.getAttribute('data-author');
  const grade = btn.getAttribute('data-grade');
  const desc = btn.getAttribute('data-desc');
  const url = btn.getAttribute('data-url');
  const thumb = btn.getAttribute('data-thumb');

  openEditModal({
    title: 'Editar Proyecto de Scratch',
    fields: [
      { name: 'title', label: 'Título', type: 'text', value: title },
      { name: 'author', label: 'Autor', type: 'text', value: author },
      { name: 'grade', label: 'Grado', type: 'select', value: grade, options: ['5°', '6°'] },
      { name: 'description', label: 'Descripción', type: 'textarea', value: desc },
      { name: 'scratch_url', label: 'URL de Scratch', type: 'text', value: url },
      { name: 'thumbnail_file', label: 'Nueva Imagen (opcional)', type: 'file', accept: 'image/*' }
    ],
    currentImageSrc: thumb,
    onSubmit: async (formData) => {
      const token = getSessionToken();
      try {
        const res = await fetch(getAuthApiUrl(`/api/proyectos/${id}`), {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Error al editar');
        showToastNotification('Proyectos', 'Proyecto actualizado con éxito.', 'success');
        notifyDataChange();
        return true;
      } catch (err) {
        showToastNotification('Error', err.message, 'error');
        return false;
      }
    }
  });
};

// --- GUIONES CRUD ---
if (adminGuionForm) {
  adminGuionForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const token = getSessionToken();
    if (!token) return;

    const fileInput = document.getElementById('agu-file');
    if (!fileInput.files || fileInput.files.length === 0) {
      showToastNotification('Error', 'Por favor selecciona un archivo para el guion.', 'error');
      return;
    }

    const formData = new FormData();
    formData.append('title', document.getElementById('agu-title').value.trim());
    formData.append('grade', document.getElementById('agu-grade').value);
    formData.append('subject', document.getElementById('agu-subject').value.trim());
    formData.append('date', document.getElementById('agu-date').value);
    formData.append('description', document.getElementById('agu-desc').value.trim());
    formData.append('file', fileInput.files[0]);

    try {
      const res = await fetch(getAuthApiUrl('/api/guiones'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al crear guion');

      showToastNotification('Guiones', 'Guion de clase agregado con éxito.', 'success');
      adminGuionForm.reset();
      notifyDataChange();
    } catch (err) {
      showToastNotification('Error', err.message, 'error');
    }
  });
}

window.deleteGuionItem = function (id) {
  showDeleteConfirmation(id, async (itemId) => {
    const token = getSessionToken();
    if (!token) return;

    try {
      const res = await fetch(getAuthApiUrl(`/api/guiones/${itemId}`), {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Error al eliminar guion');
      }

      showToastNotification('Guiones', 'Guion eliminado con éxito.', 'success');
      notifyDataChange();
    } catch (err) {
      showToastNotification('Error', err.message, 'error');
    }
  });
};

// --- ASISTENCIA CRUD ---
if (adminAsistenciaForm) {
  adminAsistenciaForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const token = getSessionToken();
    if (!token) return;

    const payload = {
      student: document.getElementById('aa-student').value.trim(),
      grade: document.getElementById('aa-grade').value,
      date: document.getElementById('aa-date').value,
      status: document.getElementById('aa-status').value
    };

    try {
      const res = await fetch(getAuthApiUrl('/api/asistencia'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al crear registro de asistencia');

      showToastNotification('Asistencia', 'Registro agregado con éxito.', 'success');
      adminAsistenciaForm.reset();
      notifyDataChange();
    } catch (err) {
      showToastNotification('Error', err.message, 'error');
    }
  });
}

const adminAlumnoForm = document.getElementById('admin-alumno-form');
if (adminAlumnoForm) {
  adminAlumnoForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const token = getSessionToken();
    if (!token) return;

    const payload = {
      full_name: document.getElementById('al-name').value.trim(),
      course: document.getElementById('al-grade').value
    };

    try {
      const res = await fetch(getAuthApiUrl('/api/students'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al agregar alumno');

      showToastNotification('Alumnos', 'Alumno registrado en el catálogo con éxito.', 'success');
      adminAlumnoForm.reset();
      notifyDataChange();
    } catch (err) {
      showToastNotification('Error', err.message, 'error');
    }
  });
}

// --- Botón para cargar alumnos aleatorios ---
const seedRandomBtn = document.getElementById('btn-seed-random-alumnos');
if (seedRandomBtn) {
  seedRandomBtn.addEventListener('click', async () => {
    const token = getSessionToken();
    if (!token) return;

    seedRandomBtn.disabled = true;
    seedRandomBtn.textContent = 'Cargando...';

    try {
      const res = await fetch(getAuthApiUrl('/api/alumnos/seed-random'), {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al cargar alumnos');

      showToastNotification('Alumnos', data.message, 'success');
      notifyDataChange();
    } catch (err) {
      showToastNotification('Error', err.message, 'error');
    } finally {
      seedRandomBtn.disabled = false;
      seedRandomBtn.textContent = '🎲 Cargar Alumnos Aleatorios';
    }
  });
}

window.deleteAsistenciaItem = function (id) {
  showDeleteConfirmation(id, async (itemId) => {
    const token = getSessionToken();
    if (!token) return;

    try {
      const res = await fetch(getAuthApiUrl(`/api/asistencia/${itemId}`), {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Error al eliminar registro');
      }

      showToastNotification('Asistencia', 'Registro eliminado con éxito.', 'success');
      notifyDataChange();
    } catch (err) {
      showToastNotification('Error', err.message, 'error');
    }
  });
};

// ==========================================
// 5. MODAL DE EDICIÓN DINÁMICO
// ==========================================

function openEditModal({ title, fields, currentImageSrc, onSubmit }) {
  // Remover modal existente si hay uno
  const existingModal = document.getElementById('dynamic-edit-modal');
  if (existingModal) existingModal.remove();

  const modal = document.createElement('div');
  modal.id = 'dynamic-edit-modal';
  Object.assign(modal.style, {
    position: 'fixed', top: '0', left: '0', width: '100%', height: '100%',
    background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', display: 'flex',
    alignItems: 'center', justifyContent: 'center', zIndex: '1500', padding: '20px'
  });

  const card = document.createElement('div');
  Object.assign(card.style, {
    background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)',
    padding: '32px', maxWidth: '550px', width: '100%', maxHeight: '85vh',
    overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.4)',
    border: '1px solid var(--border-color)'
  });

  let fieldsHtml = '';
  for (const f of fields) {
    let inputHtml = '';
    if (f.type === 'textarea') {
      inputHtml = `<textarea name="${f.name}" class="admin-input" rows="3" style="width:100%;padding:10px;border:1px solid var(--border-color);border-radius:var(--radius-sm);background:var(--bg-main);color:var(--text-main);resize:vertical;font-family:inherit;">${f.value || ''}</textarea>`;
    } else if (f.type === 'select') {
      const opts = f.options.map(o => `<option value="${o}" ${o === f.value ? 'selected' : ''}>${o}</option>`).join('');
      inputHtml = `<select name="${f.name}" class="admin-input" style="width:100%;padding:10px;border:1px solid var(--border-color);border-radius:var(--radius-sm);background:var(--bg-main);color:var(--text-main);">${opts}</select>`;
    } else if (f.type === 'file') {
      inputHtml = `<input type="file" name="${f.name}" accept="${f.accept || ''}" class="admin-input" style="width:100%;padding:10px;border:1px solid var(--border-color);border-radius:var(--radius-sm);background:var(--bg-main);color:var(--text-main);">`;
    } else {
      inputHtml = `<input type="${f.type}" name="${f.name}" value="${f.value || ''}" class="admin-input" style="width:100%;padding:10px;border:1px solid var(--border-color);border-radius:var(--radius-sm);background:var(--bg-main);color:var(--text-main);">`;
    }
    fieldsHtml += `
      <div style="margin-bottom: 14px;">
        <label style="display:block;font-size:0.85rem;font-weight:600;margin-bottom:6px;color:var(--text-main);">${f.label}</label>
        ${inputHtml}
      </div>
    `;
  }

  const previewHtml = currentImageSrc ? `
    <div style="margin-bottom:16px;text-align:center;">
      <p style="font-size:0.8rem;color:var(--text-muted);margin-bottom:8px;">Imagen actual:</p>
      <img src="${currentImageSrc}" alt="Preview" style="max-width:100%;max-height:180px;border-radius:var(--radius-sm);border:2px solid var(--border-color);object-fit:cover;" onerror="this.style.display='none'">
    </div>
  ` : '';

  card.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;">
      <h3 style="margin:0;font-family:var(--font-title);color:var(--primary);font-size:1.3rem;">✏️ ${title}</h3>
      <button id="edit-modal-close" style="background:none;border:none;color:var(--text-muted);font-size:1.5rem;cursor:pointer;padding:4px;">&times;</button>
    </div>
    ${previewHtml}
    <form id="edit-modal-form">
      ${fieldsHtml}
      <div style="display:flex;gap:12px;margin-top:20px;">
        <button type="submit" class="btn btn-primary" style="flex:1;padding:12px;font-weight:700;border-radius:var(--radius-sm);">
          💾 Guardar Cambios
        </button>
        <button type="button" id="edit-modal-cancel" class="btn btn-secondary" style="flex:1;padding:12px;border-radius:var(--radius-sm);">
          Cancelar
        </button>
      </div>
    </form>
  `;

  modal.appendChild(card);
  document.body.appendChild(modal);

  // Close handlers
  const closeModal = () => { modal.remove(); document.body.style.overflow = ''; };
  modal.querySelector('#edit-modal-close').addEventListener('click', closeModal);
  modal.querySelector('#edit-modal-cancel').addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

  // Submit
  modal.querySelector('#edit-modal-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData();
    const formEl = e.target;

    for (const f of fields) {
      const input = formEl.querySelector(`[name="${f.name}"]`);
      if (!input) continue;
      if (f.type === 'file') {
        if (input.files && input.files.length > 0) {
          formData.append(f.name, input.files[0]);
        }
      } else {
        formData.append(f.name, input.value);
      }
    }

    const submitBtn = formEl.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Guardando...';

    const success = await onSubmit(formData);
    if (success) {
      closeModal();
    } else {
      submitBtn.disabled = false;
      submitBtn.textContent = '💾 Guardar Cambios';
    }
  });
}

// ==========================================
// 6. NOTIFICACIONES TOAST (UTILERÍA)
// ==========================================

function showToastNotification(title, message, type = 'success') {
  const existing = document.querySelector('.toast-notification');
  if (existing) existing.remove();
  
  const notif = document.createElement('div');
  notif.className = `toast-notification toast-${type} glass`;
  
  Object.assign(notif.style, {
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    padding: '16px 24px',
    borderRadius: '12px',
    boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
    zIndex: '2000',
    maxWidth: '360px',
    animation: 'slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
    borderLeft: type === 'success' ? '4px solid var(--success)' : '4px solid var(--danger)',
    color: 'var(--text-main)',
    backgroundColor: 'var(--bg-surface)'
  });
  
  notif.innerHTML = `
    <div style="font-weight: 700; margin-bottom: 4px; font-family: var(--font-title); font-size: 1.05rem;">
      ${type === 'success' ? '✓ ' : '✗ '} ${title}
    </div>
    <div style="font-size: 0.88rem; color: var(--text-muted); line-height: 1.4;">
      ${message}
    </div>
  `;
  
  document.body.appendChild(notif);
  
  setTimeout(() => {
    notif.style.animation = 'slideOut 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards';
    setTimeout(() => notif.remove(), 300);
  }, 5000);
}

  // Función para sincronizar rol del usuario con la BD
  async function syncUserRole() {
    const token = getSessionToken();
    if (!token) return; // No hay sesión
    try {
      const response = await fetch(`${getAuthApiUrl('/api/me')}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Auth sync failed');
      const { user, token: newToken } = await response.json();
      const current = getCurrentUser();
      if (current && current.role !== user.role) {
        localStorage.setItem('currentUser', JSON.stringify(user));
        localStorage.setItem('sessionToken', newToken);
        updateAuthUI();
        handleLocalRefresh();
        showToastNotification('Sesión Actualizada', 'Se ha detectado un cambio de rol. La interfaz se ha actualizado.', 'info');
      } else if (!current && user) {
        // En caso de que no estuviera cargado pero ahora sí
        localStorage.setItem('currentUser', JSON.stringify(user));
        localStorage.setItem('sessionToken', newToken);
        updateAuthUI();
        handleLocalRefresh();
      }
    } catch (e) {
      console.warn('Error al sincronizar rol:', e);
    }
  }

  // Notificar cambio de datos localmente y a otras pestañas
  function notifyDataChange() {
    localStorage.setItem('dataChanged', Date.now());
    handleLocalRefresh();
  }

  // Refrescar todas las vistas locales
  function handleLocalRefresh() {
    if (typeof window.loadGallery === 'function') window.loadGallery();
    if (typeof window.loadProjects === 'function') window.loadProjects();
    if (typeof window.loadScripts === 'function') window.loadScripts();
    if (typeof window.loadAttendance === 'function') window.loadAttendance();
    const user = getCurrentUser();
    if (user && user.role === 'admin') {
      if (typeof loadAdminUsers === 'function') loadAdminUsers();
      if (typeof loadAdminMessages === 'function') loadAdminMessages();
    }
  }

  // Inicializar la interfaz de usuario con la sesión cargada al iniciar
  document.addEventListener('DOMContentLoaded', () => {
    updateAuthUI();
    syncUserRole();
    handleLocalRefresh();

    // Polling ligero (cada 15 segundos) para sincronizar el rol del usuario automáticamente
    setInterval(syncUserRole, 15000);

    // Inicializar listeners de alternancia para formularios CRUD en sus nuevas ubicaciones
    document.querySelectorAll('.admin-toggle-form-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetId = btn.getAttribute('data-target');
        const targetEl = document.getElementById(targetId);
        if (targetEl) {
          const isHidden = targetEl.style.display === 'none';
          targetEl.style.display = isHidden ? 'block' : 'none';
          
          if (isHidden) {
            btn.innerHTML = btn.innerHTML.replace('➕', '➖').replace('Agregar', 'Cerrar').replace('Registrar', 'Cerrar');
          } else {
            btn.innerHTML = btn.innerHTML.replace('➖', '➕').replace('Cerrar', btn.getAttribute('data-target') === 'inline-form-asistencia' ? 'Registrar' : 'Agregar');
          }
        }
      });
    });
  });

  // También sincronizar rol al volver al foco de la ventana (cuando el admin pudo haber cambiado el rol)
  window.addEventListener('focus', () => {
    syncUserRole();
    handleLocalRefresh();
  });

  // Escuchar cambios hechos en otras pestañas del mismo navegador en tiempo real
  window.addEventListener('storage', (e) => {
    if (e.key === 'dataChanged') {
      handleLocalRefresh();
    }
    if (e.key === 'currentUser' || e.key === 'sessionToken') {
      updateAuthUI();
    }
  });

