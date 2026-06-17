// --- CONTROLADOR PRINCIPAL DEL FRONTEND ---

document.addEventListener('DOMContentLoaded', () => {
  
  // ==========================================
  // 1. CONTROL DE MENÚ MÓVIL (HAMBURGUESA)
  // ==========================================
  const burger = document.getElementById('mobile-menu-burger');
  const navLinks = document.getElementById('nav-links-menu');
  
  if (burger && navLinks) {
    burger.addEventListener('click', () => {
      const isOpen = navLinks.classList.contains('active');
      
      burger.classList.toggle('active');
      navLinks.classList.toggle('active');
      
      // Accesibilidad
      burger.setAttribute('aria-expanded', !isOpen);
    });
    
    // Cerrar menú al hacer clic en un enlace de navegación
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        burger.classList.remove('active');
        navLinks.classList.remove('active');
        burger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // ==========================================
  // 2. CAMBIO DE TEMA CLARO / OSCURO (PERSISTENTE)
  // ==========================================
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  const sunIcon = themeToggleBtn?.querySelector('.sun-icon');
  const moonIcon = themeToggleBtn?.querySelector('.moon-icon');
  const htmlElement = document.documentElement;

  // Cargar tema guardado en localStorage o preferencia del sistema
  const savedTheme = localStorage.getItem('theme') || 
                     (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  
  setTheme(savedTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const currentTheme = htmlElement.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      setTheme(newTheme);
    });
  }

  function setTheme(theme) {
    htmlElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    
    if (theme === 'dark') {
      if (sunIcon) sunIcon.style.display = 'none';
      if (moonIcon) moonIcon.style.display = 'block';
    } else {
      if (sunIcon) sunIcon.style.display = 'block';
      if (moonIcon) moonIcon.style.display = 'none';
    }
  }

  // ==========================================
  // 3. EFECTO DE BARRA DE NAVEGACIÓN EN SCROLL
  // ==========================================
  const header = document.getElementById('site-header');
  
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      header?.classList.add('scrolled');
    } else {
      header?.classList.remove('scrolled');
    }
    
    // Resaltar link de la sección activa
    highlightActiveNavLink();
  });

  // Resaltar sección activa en menú
  const sections = document.querySelectorAll('section');
  const navLinksList = document.querySelectorAll('.nav-link');

  function highlightActiveNavLink() {
    let scrollPosition = window.scrollY + 100;

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute('id');

      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        navLinksList.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }

  // ==========================================
  // 4. CARRUSEL DE TESTIMONIOS (AUTOSLIDE + DOTS)
  // ==========================================
  const testimonialCards = document.querySelectorAll('.testimonial-card');
  const sliderDots = document.querySelectorAll('.slider-dot');
  let currentTestimonialIndex = 0;
  let testimonialInterval;

  function showTestimonial(index) {
    testimonialCards.forEach(card => card.classList.remove('active'));
    sliderDots.forEach(dot => dot.classList.remove('active'));
    
    testimonialCards[index].classList.add('active');
    sliderDots[index].classList.add('active');
    currentTestimonialIndex = index;
  }

  function startTestimonialAutoSlide() {
    testimonialInterval = setInterval(() => {
      let nextIndex = currentTestimonialIndex + 1;
      if (nextIndex >= testimonialCards.length) {
        nextIndex = 0;
      }
      showTestimonial(nextIndex);
    }, 6000); // Cambia cada 6 segundos
  }

  if (sliderDots.length > 0) {
    sliderDots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        clearInterval(testimonialInterval); // Detener auto-slide en interacción manual
        showTestimonial(index);
        startTestimonialAutoSlide(); // Reiniciar auto-slide
      });
    });
    
    // Iniciar
    startTestimonialAutoSlide();
  }

  // ==========================================
  // 5. VALIDACIÓN Y ENVÍO DE FORMULARIO DE CONTACTO
  // ==========================================
  const contactForm = document.getElementById('contact-form-element');
  
  if (contactForm) {
    const nameInput = document.getElementById('contact-name');
    const emailInput = document.getElementById('contact-email');
    const subjectInput = document.getElementById('contact-subject');
    const messageInput = document.getElementById('contact-message');
    
    // Validar en tiempo real al perder foco (blur)
    nameInput.addEventListener('blur', () => validateField(nameInput, nameInput.value.trim().length >= 3));
    emailInput.addEventListener('blur', () => validateField(emailInput, validateEmailFormat(emailInput.value.trim())));
    subjectInput.addEventListener('blur', () => validateField(subjectInput, subjectInput.value.trim().length > 0));
    messageInput.addEventListener('blur', () => validateField(messageInput, messageInput.value.trim().length >= 10));

    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      // Ejecutar todas las validaciones
      const isNameValid = validateField(nameInput, nameInput.value.trim().length >= 3);
      const isEmailValid = validateField(emailInput, validateEmailFormat(emailInput.value.trim()));
      const isSubjectValid = validateField(subjectInput, subjectInput.value.trim().length > 0);
      const isMessageValid = validateField(messageInput, messageInput.value.trim().length >= 10);
      
      if (isNameValid && isEmailValid && isSubjectValid && isMessageValid) {
        const payload = {
          name: nameInput.value.trim(),
          email: emailInput.value.trim(),
          subject: subjectInput.value.trim(),
          message: messageInput.value.trim()
        };
        
        const submitBtn = document.getElementById('contact-submit-btn');
        const originalBtnHTML = submitBtn.innerHTML;
        
        try {
          // Cambiar botón a estado de carga
          submitBtn.disabled = true;
          submitBtn.innerHTML = '<span class="loading-spinner">Enviando...</span>';
          
          const isHttp = window.location.protocol.startsWith('http');
          const apiUrl = isHttp ? '/api/contacto' : 'http://localhost:3000/api/contacto';
          
          const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
          });
          
          const result = await response.json();
          
          if (response.ok && result.success) {
            // Mostrar modal de éxito o alerta flotante premium
            showNotification('¡Éxito!', 'Tu mensaje ha sido enviado e insertado en la base de datos MySQL.', 'success');
            contactForm.reset();
            
            // Notificar cambio de datos para refrescar la lista de mensajes en el panel si el admin está viéndola
            localStorage.setItem('dataChanged', Date.now());
            window.dispatchEvent(new StorageEvent('storage', { key: 'dataChanged' }));
            
            // Limpiar clases de validación
            [nameInput, emailInput, subjectInput, messageInput].forEach(inp => {
              inp.classList.remove('valid', 'invalid');
            });
          } else {
            throw new Error(result.error || 'No se pudo procesar tu mensaje.');
          }
        } catch (err) {
          console.error('Error al enviar formulario:', err);
          showNotification('Error', err.message || 'Error al conectar con el servidor backend.', 'error');
        } finally {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnHTML;
        }
      }
    });
  }

  function validateField(inputElement, condition) {
    if (condition) {
      inputElement.classList.remove('invalid');
      inputElement.classList.add('valid');
      return true;
    } else {
      inputElement.classList.remove('valid');
      inputElement.classList.add('invalid');
      return false;
    }
  }

  function validateEmailFormat(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  // --- COMPONENTE DE NOTIFICACIÓN FLOTANTE PREMIUM ---
  function showNotification(title, message, type = 'success') {
    // Eliminar notificaciones previas si existen
    const existingNotif = document.querySelector('.toast-notification');
    if (existingNotif) existingNotif.remove();
    
    const notif = document.createElement('div');
    notif.className = `toast-notification toast-${type} glass`;
    
    // Estilos inline de la notificación toast para asegurar su visualización sin interferir con otros estilos
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
    
    // Agregar animación keyframe al documento
    if (!document.getElementById('toast-animation-styles')) {
      const styleSheet = document.createElement('style');
      styleSheet.id = 'toast-animation-styles';
      styleSheet.innerText = `
        @keyframes slideIn {
          from { transform: translateY(100px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes slideOut {
          from { transform: translateY(0); opacity: 1; }
          to { transform: translateY(100px); opacity: 0; }
        }
      `;
      document.head.appendChild(styleSheet);
    }
    
    document.body.appendChild(notif);
    
    // Auto-eliminar en 5 segundos
    setTimeout(() => {
      notif.style.animation = 'slideOut 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards';
      setTimeout(() => notif.remove(), 300);
    }, 5000);
  }

  // --- CONTADORES DINÁMICOS DESDE API ---
  async function initHeroCounters() {
    try {
      const isHttp = window.location.protocol.startsWith('http');
      const apiUrl = isHttp ? '/api/stats' : 'http://localhost:3000/api/stats';
      const res = await fetch(apiUrl);
      if (!res.ok) throw new Error('Failed to fetch stats');
      const stats = await res.json();

      animateCounter('stat-proy', stats.proyectos, '+');
      animateCounter('stat-alumnos', stats.alumnos, '+');
      animateCounter('stat-guiones', stats.guiones, '');
    } catch (err) {
      console.warn('Error al cargar estadísticas para contadores:', err);
    }
  }

  function animateCounter(id, targetValue, suffix = '') {
    const el = document.getElementById(id);
    if (!el) return;
    let start = 0;
    const duration = 1000; // 1s
    if (targetValue <= 0) {
      el.textContent = '0' + suffix;
      return;
    }
    const stepTime = Math.max(Math.floor(duration / targetValue), 15);
    
    const timer = setInterval(() => {
      start += 1;
      if (start >= targetValue) {
        el.textContent = targetValue + suffix;
        clearInterval(timer);
      } else {
        el.textContent = start + suffix;
      }
    }, stepTime);
  }

  initHeroCounters();
});
