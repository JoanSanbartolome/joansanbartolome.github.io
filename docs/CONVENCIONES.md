# Convenciones del sitio

Sitio estático en HTML, CSS y JavaScript sin frameworks ni paso de compilación. Se sirve tal cual (Hostinger, Apache).

## Estructura

```
index.html                     Única página. Cada sección es un <section id="…"> dentro de <main>.
404.html                       Página de error (sin JS; usa base.css).
assets/css/base.css            Tokens de diseño, reset, barra superior y componentes comunes.
assets/css/sections/<id>.css   Estilos propios de cada sección (prefijo de clase = id de la sección).
assets/js/boot.js              Arranque síncrono en <head>: clase html.js e idioma pendiente.
assets/js/main.js              Núcleo: idioma, menú, scroll, brillo del cursor, aparición al hacer scroll.
assets/js/i18n/<id>.js         Textos de cada sección (inglés; y español de los textos que solo usa JS).
assets/js/sections/<id>.js     Comportamiento propio de una sección (solo si lo necesita).
assets/js/chip3d.js            Fondo 3D del hero (módulo ES, Three.js desde CDN con versión fija).
assets/img/                    Imágenes en WebP (optimizadas con tools/optimize_image.py).
assets/docs/                   CV en PDF (ES y EN).
tools/optimize_image.py        Conversión de imágenes a WebP.
```

`index.html` se edita directamente: las secciones viven dentro de `<main>`, una tras otra, en el mismo archivo.

## Reglas

1. **Contenido verificable.** Los datos salen de `../empleabilidad_ia/ruta_al_silicio/datos` (perfil.md y cv/cv_v3*.md). No se inventan cifras, fechas ni logros.
2. **Idiomas.** El español se escribe en el HTML. Cada elemento traducible lleva:
   - `data-i18n="seccion.clave"` para texto plano,
   - `data-i18n-html="seccion.clave"` si contiene `<strong>`, `<a>`… (solo HTML propio y de confianza),
   - `data-i18n-attr="alt:seccion.clave; href:seccion.otra"` para atributos.
   El inglés va en `assets/js/i18n/<seccion>.js` con `site.addTranslations('en', { … })`. Las claves llevan el id de la sección como prefijo. Si falta una clave, la consola avisa.
   **Textos que solo usa JavaScript** (no están en el HTML, p. ej. "Copiado"): se registran en los dos idiomas, `site.addTranslations('es', { … })` y `site.addTranslations('en', { … })`, y se leen con `site.t('seccion.clave')`.
   El idioma por defecto es `es`; solo se guarda en `localStorage` (`site-lang`) cuando el usuario pulsa ES/EN.
3. **Estilos.** Solo tokens de `base.css` (`var(--accent)`, `var(--space-4)`…), nada de colores sueltos. Para transparencias del acento o del fondo: `rgb(var(--accent-rgb) / 0.2)`, `rgb(var(--bg-rgb) / 0.8)`. Capas con `var(--z-bg)`, `--z-glow`, `--z-base`, `--z-topbar`, `--z-progress`, `--z-skip`. Las clases de una sección empiezan por su id (`.hero__photo`, `.featured__tabs`). Nada debe provocar scroll horizontal a 360 px.
4. **Breakpoints.** Solo 480 / 720 / 960 px, en sintaxis de rango y sin solapes:
   ```css
   @media (width < 720px) { … }          /* móvil */
   @media (720px <= width < 960px) { … } /* tablet */
   @media (width >= 960px) { … }         /* escritorio */
   ```
   El menú pasa a desplegable por debajo de 960 px.
5. **Hover.** Todos los `:hover` van dentro de `@media (hover: hover) { … }` (en táctil se quedarían pegados).
6. **Transiciones.** Tokens: `--dur-fast`, `--dur`, `--dur-reveal`, `--ease`, `--t-hover` (borde, sombra, transform, fondo y color) y `--t-reveal` (opacity y translate de la aparición). Regla: **un elemento con transición propia que además lleve `.reveal` declara `transition: <las suyas>, var(--t-reveal);`**, si no, la suya pisa la de `.reveal` y deja de animarse. Ejemplo en base: `.card.reveal { transition: var(--t-hover), var(--t-reveal); }`.
7. **Animación de aparición.** Añade `.reveal` a los bloques que deban aparecer al hacer scroll; `main.js` se encarga. Usa la propiedad `translate` (no `transform`), así no choca con el `transform` del hover. Para escalonar, `--reveal-delay` en el propio elemento con una regla de la sección (p. ej. `.skills__card:nth-child(2) { --reveal-delay: 0.1s; }`). Nunca con `style="…"` en el HTML: la CSP bloquea los estilos en línea.
8. **Componentes comunes** (en `base.css`): `.container`, `.section`, `.section-head`, `.section-tag`, `.section-title`, `.section-lead`, `.card`, `.card--interactive`, `.card__title`, `.card__text`, `.panel`, `.icon-box`, `.icon-box--lg`, `.eyebrow`, `.pill`, `.date-badge` (= `.pill` con margen inferior), `.chip-list`, `.chip`, `.chip--accent`, `.btn`, `.btn--primary`, `.btn--ghost`, `.link-arrow`, `.grid-2`, `.grid-3`, `.reveal`, `.visually-hidden`, `.mono`, `.accent`.
   - `.panel`: bloque con fondo y borde, más aire que `.card`, sin hover.
   - `.icon-box`: caja 40×40 (`--lg`: 44×44) con un `<svg>` de 20 px centrado sobre fondo de acento.
   - `.eyebrow`: antetítulo en mono, mayúsculas, `--tracking-wide`, color `--text-muted`.
   - `.pill`: etiqueta de acento en línea (fechas, estados); admite icono + texto.
   - `.chip`: parte línea si es largo (`overflow-wrap: anywhere`).
9. **Sin JavaScript.** `boot.js` pone la clase `js` en `<html>`; el único selector para el caso sin JS es `html:not(.js)` (no existe `.no-js`). Sin JS: los `.reveal` se ven, el selector de idioma y el botón de menú se ocultan y, por debajo de 960 px, la navegación es una fila con scroll horizontal dentro del topbar.
10. **JavaScript.** Cada script de sección es una IIFE en modo estricto que busca su raíz por id y sale si no existe. Usa `site.t()`, `site.onLangChange()` (si el idioma ya está aplicado, llama al instante) y `site.reducedMotion`. Sin variables globales nuevas ni dependencias externas (salvo Three.js en `chip3d.js`). Nada de `<script>` inline (CSP): por eso `boot.js` es un archivo.
11. **Pestañas.** `role="tablist"` / `role="tab"` / `role="tabpanel"`; los paneles inactivos llevan el atributo `hidden` (no una clase). Al imprimir se muestran todos los paneles y se oculta la lista de pestañas.
12. **Accesibilidad.** HTML semántico, `alt` en todas las imágenes, `width`/`height` en `<img>`, `loading="lazy"` fuera del hero, controles con teclado (pestañas con roles ARIA y flechas), foco visible, contraste AA y respeto a `prefers-reduced-motion`. El enlace de la sección visible lleva `aria-current="location"`.

## Arranque y carga

1. `boot.js` (síncrono, en `<head>` antes de los CSS): cambia la clase de `<html>` a `js` y, si el idioma guardado es `en`, añade `i18n-pending`, que oculta `<main>` hasta que `main.js` aplica la traducción (sin destello en español).
2. `main.js` → `i18n/*.js` → `sections/*.js`, todos con `defer` (conservan el orden). `chip3d.js` es un módulo.
3. En `DOMContentLoaded`, `main.js` aplica el idioma (y quita `i18n-pending`) y arranca menú, enlace activo, barra de progreso, brillo y aparición.

## Añadir un proyecto o un puesto

Copia una tarjeta existente de la sección en `index.html`, cambia el texto en español, añade las claves en inglés en `assets/js/i18n/<seccion>.js` y, si lleva imagen, conviértela:

```bash
python tools/optimize_image.py ruta/original.png assets/img/projects/nombre.webp --max-width 1200
```

## Probar en local

```bash
python -m http.server 5500
```

Abre http://localhost:5500. Prueba ES/EN, el móvil (360 px), sin JavaScript, la vista de impresión y que la consola no muestre avisos de `[i18n]`.
