/**
 * hero.js · Mini terminal con efecto de escritura.
 * Escribe una sola vuelta de las frases 'hero.term_1'…'hero.term_4' (registradas en
 * assets/js/i18n/hero.js): al terminar la última vuelve a la primera y se queda fija.
 * Al cambiar de idioma empieza otra vuelta; se pausa mientras el hero no está a la vista.
 * Con movimiento reducido muestra la primera frase de forma estática.
 * El aria-label de la terminal es estable: el texto animado está en aria-hidden.
 */
(() => {
  'use strict';

  const root = document.getElementById('hero');
  if (!root || !window.site) return;

  const line = root.querySelector('[data-hero-typed]');
  if (!line) return;

  const KEYS = ['hero.term_1', 'hero.term_2', 'hero.term_3', 'hero.term_4'];
  const SEPARATOR = ' = ';
  const TYPE_MS = 48;
  const TYPE_JITTER_MS = 40;
  const DELETE_MS = 18;
  const HOLD_MS = 2400;
  const GAP_MS = 450;

  /* Tres tramos coloreados: nombre, operador y valor */
  const parts = ['hero__term-key', 'hero__term-op', 'hero__term-val'].map((cls) => {
    let el = line.querySelector(`.${cls}`);
    if (!el) {
      el = document.createElement('span');
      el.className = cls;
      line.append(el);
    }
    return el;
  });

  let queue = []; // frases de la vuelta: 1, 2, …, n y otra vez la 1
  let pos = 0; // frase actual dentro de la vuelta
  let chars = 0;
  let deleting = false;
  let timer = 0;
  let running = false; // hay una vuelta en curso
  let waiting = false; // la vuelta está pausada (hero fuera de vista o pestaña oculta)
  let visible = true;
  let firstRun = true;

  function render(phrase, count) {
    const cut = phrase.indexOf(SEPARATOR);
    const keyEnd = cut === -1 ? phrase.length : cut;
    const opEnd = cut === -1 ? phrase.length : cut + SEPARATOR.length;
    parts[0].textContent = phrase.slice(0, Math.min(count, keyEnd));
    parts[1].textContent = count > keyEnd ? phrase.slice(keyEnd, Math.min(count, opEnd)) : '';
    parts[2].textContent = count > opEnd ? phrase.slice(opEnd, count) : '';
  }

  function cancel() {
    window.clearTimeout(timer);
    timer = 0;
  }

  function schedule(delay) {
    cancel();
    timer = window.setTimeout(step, delay);
  }

  function finish() {
    cancel();
    running = false;
    waiting = false;
  }

  function step() {
    timer = 0;
    if (!running || !queue.length) {
      finish();
      return;
    }
    if (!visible || document.hidden) {
      waiting = true;
      return;
    }

    const phrase = queue[pos];
    if (!deleting) {
      chars = Math.min(chars + 1, phrase.length);
      render(phrase, chars);
      if (chars < phrase.length) {
        schedule(TYPE_MS + Math.random() * TYPE_JITTER_MS);
      } else if (pos >= queue.length - 1) {
        finish(); // de vuelta en la primera frase: se queda fija
      } else {
        deleting = true;
        schedule(HOLD_MS);
      }
    } else {
      chars = Math.max(chars - 1, 0);
      render(phrase, chars);
      if (chars > 0) {
        schedule(DELETE_MS);
      } else {
        deleting = false;
        pos += 1;
        schedule(GAP_MS);
      }
    }
  }

  function pause() {
    cancel();
    if (running) waiting = true;
  }

  function resume() {
    if (!running || !waiting || !visible || document.hidden) return;
    waiting = false;
    schedule(GAP_MS);
  }

  function start() {
    finish();
    const isFirst = firstRun;
    firstRun = false;

    const phrases = KEYS.map((key) => site.t(key)).filter((text) => text && !KEYS.includes(text));
    queue = phrases.length > 1 ? [...phrases, phrases[0]] : phrases.slice();
    pos = 0;
    deleting = false;
    if (!queue.length) return;

    if (site.reducedMotion || queue.length === 1) {
      chars = queue[0].length;
      render(queue[0], chars);
      return;
    }

    running = true;

    /* Primera carga: si el HTML ya muestra la frase 1, se parte de ella sin borrarla */
    if (isFirst && line.textContent === queue[0]) {
      chars = queue[0].length;
      render(queue[0], chars);
      deleting = true;
      schedule(HOLD_MS);
      return;
    }

    chars = 0;
    render(queue[0], 0);
    schedule(GAP_MS);
  }

  if (!site.reducedMotion) {
    if ('IntersectionObserver' in window) {
      new IntersectionObserver((entries) => {
        visible = entries[entries.length - 1].isIntersecting;
        if (visible) resume();
        else pause();
      }).observe(root);
    }
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) pause();
      else resume();
    });
  }

  site.onLangChange(start);
})();
