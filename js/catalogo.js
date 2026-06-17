// --- CATÁLOGO, GALERÍA Y GUIONES DE CLASE ---

// Función de utilidad para obtener la URL base de la API de forma flexible
// Funciona si el frontend se carga desde el servidor Express (relativo) o directo por file:// (absoluto)
const getApiUrl = (endpoint) => {
  const isHttp = window.location.protocol.startsWith('http');
  const baseUrl = isHttp ? '' : 'http://localhost:3000';
  return `${baseUrl}${endpoint}`;
};

// Estados globales del catálogo
let galleryItems = [];
let currentActivePhotoIndex = 0;

// Elementos de la interfaz (DOM)
const projectsContainer = document.getElementById('projects-container');
const projectsFilterBar = document.getElementById('projects-filter-bar');

const galleryContainer = document.getElementById('gallery-container');
const galleryFilterBar = document.getElementById('gallery-filter-bar');
const galleryDateSelect = document.getElementById('gallery-date-select');

const scriptsContainer = document.getElementById('scripts-container');
const scriptsSearchInput = document.getElementById('scripts-search-input');
const scriptsGradeSelect = document.getElementById('scripts-grade-select');

// Elementos del Lightbox (Galería)
const lightbox = document.getElementById('gallery-lightbox');
const lightboxImg = document.getElementById('lightbox-active-img');
const lightboxTitle = document.getElementById('lightbox-title');
const lightboxDesc = document.getElementById('lightbox-desc');
const lightboxCloseBtn = document.getElementById('lightbox-close-btn');
const lightboxPrevBtn = document.getElementById('lightbox-prev-btn');
const lightboxNextBtn = document.getElementById('lightbox-next-btn');

// Elementos del Visor PDF
const pdfModal = document.getElementById('pdf-viewer-modal');
const pdfIframe = document.getElementById('pdf-viewer-iframe');
const pdfTitle = document.getElementById('pdf-viewer-title');
const pdfCloseBtn = document.getElementById('pdf-close-btn');

// Helper para saber si el usuario actual es admin
function isCurrentUserAdmin() {
  try {
    const userJson = localStorage.getItem('currentUser');
    if (!userJson) return false;
    const user = JSON.parse(userJson);
    return user && user.role === 'admin';
  } catch (e) {
    return false;
  }
}

// ==========================================
// 1. CARGA Y RENDERIZADO DE PROYECTOS SCRATCH
// ==========================================

async function loadProjects(gradeFilter = 'all') {
  if (!projectsContainer) return;
  
  projectsContainer.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: var(--text-muted);">Cargando proyectos...</div>';
  
  try {
    const res = await fetch(getApiUrl(`/api/proyectos?grade=${gradeFilter}`));
    if (!res.ok) throw new Error('Error al conectar con la API');
    
    const projects = await res.ok ? await res.json() : [];
    const isAdmin = isCurrentUserAdmin();
    
    if (projects.length === 0) {
      projectsContainer.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: var(--text-muted);">No se encontraron proyectos para este grado.</div>';
      return;
    }
    
    projectsContainer.innerHTML = projects.map(proj => `
      <article class="project-card">
        <div class="project-thumb-wrapper">
          <span class="project-badge">${proj.grade} Grado</span>
          <img src="${proj.thumbnail}" alt="Captura de ${proj.title}" class="project-thumb" onerror="this.src='https://placehold.co/600x400/1e293b/f8fafc?text=Scratch+Project'">
        </div>
        <div class="project-info">
          <span class="project-author">Por: ${proj.author}</span>
          <h3>${proj.title}</h3>
          <p class="project-desc">${proj.description}</p>
          <div class="project-actions">
            <a href="${proj.scratch_url}" target="_blank" class="btn btn-primary">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px;"><polygon points="6 3 20 12 6 21 6 3"/></svg>
              Jugar
            </a>
            <a href="https://scratch.mit.edu" target="_blank" class="btn btn-secondary">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px;"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
              Ver Código
            </a>
            ${isAdmin ? `
              <button class="btn btn-secondary" onclick="event.stopPropagation(); window.editProyectoItem(${proj.id}, this)" style="background: var(--accent); color: #fff; border: none; font-size: 0.8rem; padding: 6px 12px; border-radius: var(--radius-sm); cursor: pointer;" data-title="${proj.title.replace(/"/g, '&quot;')}" data-author="${proj.author.replace(/"/g, '&quot;')}" data-grade="${proj.grade}" data-desc="${proj.description.replace(/"/g, '&quot;')}" data-url="${proj.scratch_url}" data-thumb="${proj.thumbnail}">✏️ Editar</button>
              <button class="btn btn-secondary" onclick="window.deleteProyectoItem(${proj.id})" style="background: var(--danger); color: #fff; border: none; font-size: 0.8rem; padding: 6px 12px; border-radius: var(--radius-sm); cursor: pointer;">🗑 Eliminar</button>
            ` : ''}
          </div>
        </div>
      </article>
    `).join('');
  } catch (err) {
    console.error('Error cargando proyectos:', err);
    projectsContainer.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: var(--danger);">Error al cargar los proyectos. Asegúrate de iniciar la base de datos y el servidor.</div>';
  }
}

// Exponer como global para que auth.js pueda llamarla después de CRUD
window.loadProjects = loadProjects;

// Eventos para filtros de proyectos
if (projectsFilterBar) {
  projectsFilterBar.addEventListener('click', (e) => {
    if (e.target.classList.contains('filter-btn')) {
      // Activar botón visualmente
      projectsFilterBar.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
      e.target.classList.add('active');
      
      const filter = e.target.getAttribute('data-filter');
      loadProjects(filter);
    }
  });
}

// ==========================================
// 2. CARGA Y RENDERIZADO DE GALERÍA + LIGHTBOX
// ==========================================

async function loadGallery() {
  if (!galleryContainer) return;
  
  galleryContainer.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: var(--text-muted);">Cargando fotos...</div>';
  
  try {
    const gradeFilter = galleryFilterBar ? galleryFilterBar.querySelector('.filter-btn.active').getAttribute('data-filter') : 'all';
    const dateFilter = galleryDateSelect ? galleryDateSelect.value : 'all';
    
    const res = await fetch(getApiUrl(`/api/galeria?grade=${gradeFilter}`));
    if (!res.ok) throw new Error('Error al conectar con la API');
    
    let photos = await res.json();
    const isAdmin = isCurrentUserAdmin();
    
    // Filtrar por fecha en el cliente si hay un filtro específico seleccionado
    if (dateFilter !== 'all') {
      photos = photos.filter(photo => photo.date.startsWith(dateFilter));
    }
    
    galleryItems = photos; // Guardar en caché local para navegación del Lightbox
    
    if (photos.length === 0) {
      galleryContainer.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: var(--text-muted);">No se encontraron imágenes en este periodo o grado.</div>';
      return;
    }
    
    galleryContainer.innerHTML = photos.map((photo, index) => {
      // Formatear fecha para mostrar
      const photoDate = new Date(photo.date);
      const formattedDate = photoDate.toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' });
      
      return `
        <div class="gallery-card" data-index="${index}">
          <img src="${photo.src}" alt="${photo.title}" class="gallery-img" onerror="this.src='https://placehold.co/600x400/1e293b/f8fafc?text=CRECE+Photo'">
          <div class="gallery-overlay">
            ${isAdmin ? `<button class="gallery-edit-btn" onclick="event.stopPropagation(); window.editGaleriaItem(${photo.id}, this)" style="position: absolute; top: 8px; right: 46px; background: var(--accent); color: #fff; border: none; border-radius: 50%; width: 30px; height: 30px; font-size: 14px; cursor: pointer; display: flex; align-items: center; justify-content: center; z-index: 10;" data-title="${photo.title.replace(/"/g, '&quot;')}" data-desc="${photo.description.replace(/"/g, '&quot;')}" data-grade="${photo.grade}" data-date="${photo.date}" data-src="${photo.src}">✏️</button>` : ''}
            ${isAdmin ? `<button class="gallery-delete-btn" onclick="event.stopPropagation(); window.deleteGaleriaItem(${photo.id})" style="position: absolute; top: 8px; right: 8px; background: var(--danger); color: #fff; border: none; border-radius: 50%; width: 30px; height: 30px; font-size: 14px; cursor: pointer; display: flex; align-items: center; justify-content: center; z-index: 10;">🗑</button>` : ''}
            <h4>${photo.title}</h4>
            <p>${photo.description}</p>
            <div class="gallery-meta">
              <span class="gallery-badge">${photo.grade} Grado</span>
              <time datetime="${photo.date}">${formattedDate}</time>
            </div>
          </div>
        </div>
      `;
    }).join('');
    
    // Asignar eventos clic a las tarjetas para el Lightbox
    galleryContainer.querySelectorAll('.gallery-card').forEach(card => {
      card.addEventListener('click', () => {
        const index = parseInt(card.getAttribute('data-index'));
        openLightbox(index);
      });
    });
    
  } catch (err) {
    console.error('Error cargando galería:', err);
    galleryContainer.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: var(--danger);">Error al cargar las imágenes.</div>';
  }
}

// Exponer como global para que auth.js pueda llamarla después de CRUD
window.loadGallery = loadGallery;

// Eventos para filtros de galería (grado)
if (galleryFilterBar) {
  galleryFilterBar.addEventListener('click', (e) => {
    if (e.target.classList.contains('filter-btn')) {
      galleryFilterBar.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
      e.target.classList.add('active');
      loadGallery();
    }
  });
}

// Eventos para filtros de galería (fecha)
if (galleryDateSelect) {
  galleryDateSelect.addEventListener('change', loadGallery);
}

// --- LOGICA DE LIGHTBOX ---

function openLightbox(index) {
  if (!galleryItems[index]) return;
  
  currentActivePhotoIndex = index;
  const photo = galleryItems[index];
  
  lightboxImg.src = photo.src;
  lightboxImg.alt = photo.title;
  lightboxTitle.textContent = photo.title;
  lightboxDesc.textContent = photo.description;
  
  lightbox.classList.add('active');
  document.body.style.overflow = 'hidden'; // Prevenir scroll de fondo
}

function closeLightbox() {
  lightbox.classList.remove('active');
  document.body.style.overflow = '';
}

function navigateLightbox(direction) {
  let newIndex = currentActivePhotoIndex + direction;
  
  if (newIndex >= galleryItems.length) {
    newIndex = 0; // Volver al inicio
  } else if (newIndex < 0) {
    newIndex = galleryItems.length - 1; // Ir al final
  }
  
  openLightbox(newIndex);
}

// Eventos del Lightbox
if (lightboxCloseBtn) lightboxCloseBtn.addEventListener('click', closeLightbox);
if (lightboxPrevBtn) lightboxPrevBtn.addEventListener('click', () => navigateLightbox(-1));
if (lightboxNextBtn) lightboxNextBtn.addEventListener('click', () => navigateLightbox(1));

// Cerrar haciendo clic fuera de la imagen
if (lightbox) {
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) {
      closeLightbox();
    }
  });
}

// Controles de teclado para el Lightbox
document.addEventListener('keydown', (e) => {
  if (!lightbox.classList.contains('active')) return;
  
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowRight') navigateLightbox(1);
  if (e.key === 'ArrowLeft') navigateLightbox(-1);
});

// ==========================================
// 3. CARGA Y RENDERIZADO DE GUIONES DE CLASE
// ==========================================

async function loadScripts() {
  if (!scriptsContainer) return;
  
  scriptsContainer.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: var(--text-muted);">Cargando guiones...</div>';
  
  try {
    const query = scriptsSearchInput ? scriptsSearchInput.value.trim() : '';
    const grade = scriptsGradeSelect ? scriptsGradeSelect.value : 'all';
    const isAdmin = isCurrentUserAdmin();
    
    const res = await fetch(getApiUrl(`/api/guiones?q=${encodeURIComponent(query)}&grade=${grade}`));
    if (!res.ok) throw new Error('Error al conectar con la API');
    
    const scripts = await res.json();
    
    if (scripts.length === 0) {
      scriptsContainer.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: var(--text-muted);">No se encontraron guiones que coincidan con la búsqueda.</div>';
      return;
    }
    
    scriptsContainer.innerHTML = scripts.map(script => {
      const scriptDate = new Date(script.date);
      const formattedDate = scriptDate.toLocaleDateString('es-ES', { year: 'numeric', month: 'short' });
      
            const isPdf = script.pdf_url.toLowerCase().endsWith('.pdf');
            const buttonText = isPdf ? 'Ver Guion' : 'Descargar';
            const iconSvg = isPdf 
              ? `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px;"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>`
              : `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>`;

            return `
              <article class="script-card">
                <div class="script-meta">
                  <span class="script-subject">${script.subject}</span>
                  <span class="script-grade">${script.grade} Grado</span>
                </div>
                <h3>${script.title}</h3>
                <p class="script-desc">${script.description}</p>
                <div class="script-footer">
                  <time datetime="${script.date}">${formattedDate}</time>
                  <button class="btn btn-secondary btn-view-pdf" data-url="${script.pdf_url}" data-title="${script.title}">
                    ${iconSvg}
                    ${buttonText}
                  </button>
                  ${isAdmin ? `<button class="btn btn-secondary" onclick="window.deleteGuionItem(${script.id})" style="background: var(--danger); color: #fff; border: none; font-size: 0.8rem; padding: 6px 12px; border-radius: var(--radius-sm); cursor: pointer;">🗑</button>` : ''}
                </div>
              </article>
            `;
    }).join('');
    
    // Adjuntar evento clic para ver el PDF en el visor interno o descargar si es DOC
    scriptsContainer.querySelectorAll('.btn-view-pdf').forEach(btn => {
      btn.addEventListener('click', () => {
        const url = btn.getAttribute('data-url');
        const title = btn.getAttribute('data-title');
        
        const isPdf = url.toLowerCase().endsWith('.pdf');
        if (isPdf) {
          openPdfViewer(url, title);
        } else {
          // Descargar directamente abriendo en nueva pestaña
          window.open(getApiUrl(url), '_blank');
        }
      });
    });
    
  } catch (err) {
    console.error('Error cargando guiones:', err);
    scriptsContainer.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: var(--danger);">Error al cargar los recursos de clase.</div>';
  }
}

// Exponer como global para que auth.js pueda llamarla después de CRUD
window.loadScripts = loadScripts;

// Eventos de búsqueda y filtros para guiones
if (scriptsSearchInput) {
  // Búsqueda con retardo (debounce) para no saturar al servidor
  let debounceTimeout;
  scriptsSearchInput.addEventListener('input', () => {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(loadScripts, 300);
  });
}

if (scriptsGradeSelect) {
  scriptsGradeSelect.addEventListener('change', loadScripts);
}

// --- LÓGICA DEL VISOR PDF ---

function openPdfViewer(url, title) {
  if (!pdfModal || !pdfIframe) return;
  
  pdfTitle.textContent = title;
  
  // Si estamos en desarrollo local con file://, Google PDF Viewer puede fallar para rutas relativas
  // En producción o servidor local usará la ruta del servidor
  pdfIframe.src = getApiUrl(`/${url}`);
  
  pdfModal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closePdfViewer() {
  pdfModal.classList.remove('active');
  pdfIframe.src = '';
  document.body.style.overflow = '';
}

if (pdfCloseBtn) pdfCloseBtn.addEventListener('click', closePdfViewer);
if (pdfModal) {
  pdfModal.addEventListener('click', (e) => {
    if (e.target === pdfModal) {
      closePdfViewer();
    }
  });
}

// Inicializar componentes al cargar el archivo
document.addEventListener('DOMContentLoaded', () => {
  loadProjects();
  loadGallery();
  loadScripts();
});
