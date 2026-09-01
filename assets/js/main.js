/**
 * Joan San Bartolome Ferri - Portafolio Profesional
 * Lógica interactiva en Javascript vanilla
 */

document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initEmailCopier();
  initProjectFilters();
  initExperienceTabs();
  initBgSelector();
});

/**
 * Controla la apertura/cierre del menú móvil responsive
 */
function initMobileMenu() {
  const menuBtn = document.getElementById('menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  const menuIcon = document.getElementById('menu-icon');

  if (!menuBtn || !mobileMenu || !menuIcon) return;

  menuBtn.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
    
    if (mobileMenu.classList.contains('hidden')) {
      menuIcon.setAttribute('d', 'M4 6h16M4 12h16M4 18h16');
    } else {
      menuIcon.setAttribute('d', 'M6 18L18 6M6 6l12 12');
    }
  });

  const mobileLinks = document.querySelectorAll('.mobile-link');
  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.add('hidden');
      menuIcon.setAttribute('d', 'M4 6h16M4 12h16M4 18h16');
    });
  });
}

/**
 * Copiado interactivo de correo al portapapeles con feedback de tooltip
 */
function initEmailCopier() {
  const copyEmailBtn = document.getElementById('copy-email-btn');
  const tooltip = document.getElementById('tooltip');

  if (!copyEmailBtn || !tooltip) return;

  copyEmailBtn.addEventListener('click', () => {
    const email = copyEmailBtn.getAttribute('data-email') || 'josanbart@gmail.com';
    
    navigator.clipboard.writeText(email).then(() => {
      tooltip.classList.remove('opacity-0', 'translate-y-1', 'pointer-events-none');
      tooltip.classList.add('opacity-100', 'translate-y-0');
      
      setTimeout(() => {
        tooltip.classList.remove('opacity-100', 'translate-y-0');
        tooltip.classList.add('opacity-0', 'translate-y-1', 'pointer-events-none');
      }, 2200);
    }).catch(err => {
      console.error('[ERR] Error al copiar el correo al portapapeles: ', err);
    });
  });
}

/**
 * Filtro interactivo por categorías en la sección de proyectos (PCB, RTL & FPGA, Sistemas Embebidos)
 */
function initProjectFilters() {
  const filterBtns = document.querySelectorAll('.project-filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  if (!filterBtns.length || !projectCards.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const category = btn.getAttribute('data-filter');

      // Actualizar botón activo
      filterBtns.forEach(b => {
        b.classList.remove('bg-brand-accent', 'text-zinc-950', 'border-transparent', 'font-bold');
        b.classList.add('bg-zinc-900', 'text-zinc-400', 'border-brand-borderDark', 'hover:text-zinc-100');
      });

      btn.classList.remove('bg-zinc-900', 'text-zinc-400', 'border-brand-borderDark', 'hover:text-zinc-100');
      btn.classList.add('bg-brand-accent', 'text-zinc-950', 'border-transparent', 'font-bold');

      // Filtrar tarjetas
      projectCards.forEach(card => {
        const cardCategories = card.getAttribute('data-category') || '';
        if (category === 'all' || cardCategories.includes(category)) {
          card.classList.remove('hidden');
          card.classList.add('flex');
        } else {
          card.classList.remove('flex');
          card.classList.add('hidden');
        }
      });
    });
  });
}

/**
 * Pestañas interactivas para alternar entre "Formación Académica" y "Experiencia Laboral"
 */
function initExperienceTabs() {
  const tabBtns = document.querySelectorAll('.exp-tab-btn');
  const tabContents = document.querySelectorAll('.exp-tab-content');

  if (!tabBtns.length || !tabContents.length) return;

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-tab');

      tabBtns.forEach(b => {
        b.classList.remove('border-brand-accent', 'text-brand-accent', 'bg-cyan-500/5');
        b.classList.add('border-brand-borderDark', 'text-zinc-400', 'bg-zinc-900/40');
      });

      btn.classList.remove('border-brand-borderDark', 'text-zinc-400', 'bg-zinc-900/40');
      btn.classList.add('border-brand-accent', 'text-brand-accent', 'bg-cyan-500/5');

      tabContents.forEach(content => {
        if (content.id === targetId) {
          content.classList.remove('hidden');
        } else {
          content.classList.add('hidden');
        }
      });
    });
  });
}

/**
 * Seleccionador flotante de fondo interactivo
 */
function initBgSelector() {
  const bgOverlay = document.getElementById('global-bg-overlay');
  const optionBtns = document.querySelectorAll('.bg-option-btn');
  const togglePanelBtn = document.getElementById('toggle-bg-panel');
  const bgPanel = document.getElementById('bg-selector-panel');

  if (!bgOverlay || !optionBtns.length) return;

  // Toggle abrir/cerrar panel de selección
  if (togglePanelBtn && bgPanel) {
    togglePanelBtn.addEventListener('click', () => {
      bgPanel.classList.toggle('hidden');
      bgPanel.classList.toggle('flex');
    });
  }

  // Lista de clases de patrones
  const bgClasses = ['bg-pattern-grid', 'bg-pattern-dots', 'bg-pattern-scanlines', 'bg-pattern-solid', 'bg-pattern-aurora'];

  // Cargar fondo guardado o predeterminado
  const savedPattern = localStorage.getItem('portfolio-bg-pattern') || 'bg-pattern-grid';
  applyPattern(savedPattern);

  optionBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const pattern = btn.getAttribute('data-pattern');
      applyPattern(pattern);
      localStorage.setItem('portfolio-bg-pattern', pattern);
    });
  });

  function applyPattern(pattern) {
    // Eliminar todas las clases de fondo
    bgClasses.forEach(cls => bgOverlay.classList.remove(cls));
    // Aplicar la nueva
    bgOverlay.classList.add(pattern);

    // Actualizar estilo visual de los botones
    optionBtns.forEach(b => {
      const bPattern = b.getAttribute('data-pattern');
      if (bPattern === pattern) {
        b.classList.remove('bg-zinc-900', 'text-zinc-400', 'border-brand-borderDark');
        b.classList.add('bg-cyan-500/10', 'text-brand-accent', 'border-cyan-500/50', 'font-bold');
      } else {
        b.classList.remove('bg-cyan-500/10', 'text-brand-accent', 'border-cyan-500/50', 'font-bold');
        b.classList.add('bg-zinc-900', 'text-zinc-400', 'border-brand-borderDark');
      }
    });
  }
}
