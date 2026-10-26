/**
 * main.js · Núcleo del sitio
 *
 * Expone `window.site`, la API común que usan los scripts de cada sección:
 *   site.lang                    idioma activo ('es' | 'en')
 *   site.t(key)                  texto traducido para el idioma activo (o la clave si falta)
 *   site.addTranslations(lang, dict)  registra textos (lo usan assets/js/i18n/*.js)
 *   site.onLangChange(fn)        fn(lang) cada vez que se aplica un idioma; si ya se aplicó
 *                                uno, fn se llama al instante con el idioma actual
 *   site.reducedMotion           true si el usuario pide reducir el movimiento
 *
 * Traducción del HTML (el español vive en el propio HTML; el diccionario 'en' lo sustituye):
 *   data-i18n="clave"                  reemplaza textContent
 *   data-i18n-html="clave"             reemplaza innerHTML (solo para textos con <strong>, <a>…)
 *   data-i18n-attr="attr:clave; ..."   reemplaza atributos (href, aria-label, alt, content…)
 *
 * Textos que solo usa JavaScript (no están en el HTML, p. ej. "Copiado"): se registran
 * en ambos idiomas, addTranslations('es', { … }) y addTranslations('en', { … }),
 * y se leen con site.t(key).
 *
 * Orden de carga: boot.js (síncrono, en <head>; pone html.js y .i18n-pending)
 * → main.js → i18n/*.js → sections/*.js (todo con `defer`, que conserva el orden).
 */
(() => {
  'use strict';

  const DEFAULT_LANG = 'es';
  const SUPPORTED = ['es', 'en'];
  const STORAGE_KEY = 'site-lang';

  const dictionaries = { es: {}, en: {} };
  const listeners = [];
  const originals = new WeakMap();
  let currentLang = DEFAULT_LANG;
  let langApplied = false;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Almacenamiento seguro ---------- */
  function readStoredLang() {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  }

  function storeLang(lang) {
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      /* modo privado o almacenamiento bloqueado: no pasa nada */
    }
  }

  /* ---------- i18n ---------- */
  function t(key) {
    const dict = dictionaries[currentLang];
    if (dict && key in dict) return dict[key];
    if (key in dictionaries[DEFAULT_LANG]) return dictionaries[DEFAULT_LANG][key];
    return key;
  }

  function addTranslations(lang, dict) {
    if (!SUPPORTED.includes(lang)) throw new Error(`Idioma no soportado: ${lang}`);
    Object.assign(dictionaries[lang], dict);
  }

  function originalOf(el, slot, read) {
    let store = originals.get(el);
    if (!store) {
      store = {};
      originals.set(el, store);
    }
    if (!(slot in store)) store[slot] = read();
    return store[slot];
  }

  function translated(key, original, lang) {
    if (lang === DEFAULT_LANG) return original;
    const dict = dictionaries[lang];
    if (key in dict) return dict[key];
    console.warn(`[i18n] Falta la clave "${key}" en "${lang}"`);
    return original;
  }

  function parseAttrSpec(spec) {
    return spec
      .split(';')
      .map((pair) => pair.trim())
      .filter(Boolean)
      .map((pair) => {
        const [attr, key] = pair.split(':').map((part) => part.trim());
        return { attr, key };
      });
  }

  function callListener(fn, lang) {
    try {
      fn(lang);
    } catch (error) {
      console.error('[site] Error en un listener de onLangChange:', error);
    }
  }

  function applyLanguage(lang) {
    currentLang = SUPPORTED.includes(lang) ? lang : DEFAULT_LANG;

    try {
      document.querySelectorAll('[data-i18n]').forEach((el) => {
        const original = originalOf(el, 'text', () => el.textContent);
        el.textContent = translated(el.dataset.i18n, original, currentLang);
      });

      document.querySelectorAll('[data-i18n-html]').forEach((el) => {
        const original = originalOf(el, 'html', () => el.innerHTML);
        el.innerHTML = translated(el.dataset.i18nHtml, original, currentLang);
      });

      document.querySelectorAll('[data-i18n-attr]').forEach((el) => {
        parseAttrSpec(el.dataset.i18nAttr).forEach(({ attr, key }) => {
          const original = originalOf(el, `attr:${attr}`, () => el.getAttribute(attr));
          const value = translated(key, original, currentLang);
          if (value !== null) el.setAttribute(attr, value);
        });
      });

      document.documentElement.lang = currentLang;
      document.querySelectorAll('[data-lang-btn]').forEach((btn) => {
        btn.setAttribute('aria-pressed', String(btn.dataset.langBtn === currentLang));
      });
    } finally {
      // Pase lo que pase, el contenido vuelve a ser visible
      document.documentElement.classList.remove('i18n-pending');
    }

    langApplied = true;
    listeners.forEach((fn) => callListener(fn, currentLang));
  }

  function onLangChange(fn) {
    listeners.push(fn);
    if (langApplied) callListener(fn, currentLang);
  }

  function initLanguage() {
    document.querySelectorAll('[data-lang-btn]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const lang = btn.dataset.langBtn;
        if (langApplied && lang === currentLang) return;
        applyLanguage(lang);
        storeLang(currentLang);
      });
    });
    // En la carga no se guarda nada: solo se respeta una elección previa del usuario
    applyLanguage(readStoredLang() || DEFAULT_LANG);
  }

  /* ---------- Menú móvil ---------- */
  function initMenu() {
    const btn = document.querySelector('[data-menu-btn]');
    const nav = document.getElementById('site-nav');
    if (!btn || !nav) return;

    const isOpen = () => btn.getAttribute('aria-expanded') === 'true';
    const setOpen = (open) => {
      btn.setAttribute('aria-expanded', String(open));
      nav.classList.toggle('is-open', open);
    };

    btn.addEventListener('click', () => setOpen(!isOpen()));
    nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setOpen(false)));
    document.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape' || !isOpen()) return;
      const focusWasInside = nav.contains(document.activeElement);
      setOpen(false);
      if (focusWasInside) btn.focus();
    });
    document.addEventListener('click', (event) => {
      if (isOpen() && !nav.contains(event.target) && !btn.contains(event.target)) setOpen(false);
    });
  }

  /* ---------- Enlace activo según la sección visible ---------- */
  function initActiveNav() {
    const links = [...document.querySelectorAll('.nav__link[href^="#"]')];
    // Se observan todas las secciones (también el hero, sin enlace) para limpiar el resaltado al volver arriba
    const sections = [...document.querySelectorAll('main > section[id]')];
    if (!links.length || !sections.length || !('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          links.forEach((link) => {
            const active = link.getAttribute('href') === `#${entry.target.id}`;
            link.classList.toggle('is-active', active);
            if (active) link.setAttribute('aria-current', 'location');
            else link.removeAttribute('aria-current');
          });
        });
      },
      { rootMargin: '-45% 0px -50% 0px' }
    );
    sections.forEach((section) => observer.observe(section));
  }

  /* ---------- Barra de progreso de scroll ---------- */
  function initScrollProgress() {
    const bar = document.querySelector('.scroll-progress__bar');
    if (!bar) return;
    let ticking = false;

    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.transform = `scaleX(${max > 0 ? Math.min(window.scrollY / max, 1) : 0})`;
      ticking = false;
    };

    const schedule = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };

    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });
    // La altura del documento cambia al cargar imágenes, abrir pestañas o cambiar de idioma
    if ('ResizeObserver' in window) new ResizeObserver(schedule).observe(document.body);
    onLangChange(schedule);
    update();
  }

  /* ---------- Brillo que sigue al cursor ---------- */
  function initCursorGlow() {
    const glow = document.querySelector('.cursor-glow');
    if (!glow || reducedMotion || !window.matchMedia('(pointer: fine)').matches) return;

    let x = 0;
    let y = 0;
    let frame = 0;

    const render = () => {
      frame = 0;
      glow.style.transform = `translate(${x}px, ${y}px)`;
      glow.classList.add('is-active');
    };

    const hide = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      glow.classList.remove('is-active');
    };

    window.addEventListener(
      'pointermove',
      (event) => {
        x = event.clientX;
        y = event.clientY;
        if (!frame) frame = requestAnimationFrame(render);
      },
      { passive: true }
    );
    document.documentElement.addEventListener('pointerleave', hide);
    window.addEventListener('blur', hide);
  }

  /* ---------- Aparición al hacer scroll ---------- */
  function initReveal() {
    const items = [...document.querySelectorAll('.reveal')];
    if (reducedMotion || !('IntersectionObserver' in window)) {
      items.forEach((el) => el.classList.add('is-visible'));
      return;
    }

    // Lo que ya está en pantalla (o por encima) aparece en este mismo tick, sin esperar al observer
    const viewportBottom = window.innerHeight;
    const pending = items.filter((el) => {
      if (el.getBoundingClientRect().top < viewportBottom) {
        el.classList.add('is-visible');
        return false;
      }
      return true;
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    pending.forEach((el) => observer.observe(el));
  }

  /* ---------- Año del pie ---------- */
  function initYear() {
    document.querySelectorAll('[data-year]').forEach((el) => {
      el.textContent = String(new Date().getFullYear());
    });
  }

  window.site = {
    get lang() {
      return currentLang;
    },
    t,
    addTranslations,
    onLangChange,
    reducedMotion,
  };

  function run(name, init) {
    try {
      init();
    } catch (error) {
      console.error(`[site] Falló ${name}:`, error);
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    // El idioma primero: así las medidas de reveal y progreso usan el texto definitivo
    run('initLanguage', initLanguage);
    run('initMenu', initMenu);
    run('initActiveNav', initActiveNav);
    run('initScrollProgress', initScrollProgress);
    run('initCursorGlow', initCursorGlow);
    run('initReveal', initReveal);
    run('initYear', initYear);
  });
})();
