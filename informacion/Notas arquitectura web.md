- **HTML5 Semántico:** Da la estructura limpia a la página.
    
- **Tailwind CSS (vía CDN):** Permite aplicar estilos usando clases directas en el propio HTML. La IA domina Tailwind a la perfección, lo que evita tener que pelear con archivos `.css` separados.
    
- **JavaScript vanilla (mínimo):** Solo para interactividades básicas (como abrir/cerrar un menú en móvil o cambiar entre tema claro/oscuro).

Estilo de la web:
El estilo **Dark Modern Minimalista** con la estética de **Hermes Agent** se basa en un diseño técnico, sobrio y de alta densidad de información, donde la usabilidad predomina sobre el adorno visual. Apuesta por fondos abismales casi negros (`bg-zinc-950` o `bg-black`) combinados con tarjetas de contraste muy sutil (`bg-zinc-900/60`), superficies oscuras con opacidades reducidas y bordes extremadamente finos pero nítidos (`border-zinc-800`). La paleta neutra se compone de tipografía blanca limpia para titulares (`text-zinc-100`) y grises apagados o monocromáticos para el cuerpo de texto (`text-zinc-400`). El toque de identidad visual lo aporta un único color de acento altamente saturado o neón —usualmente un verde terminal o cyan eléctrico— reservado exclusivamente para indicadores de estado actitudinales (como puntos _live_ de "disponible"), etiquetas clave y pequeños resaltados interactivos.

En cuanto a los componentes visuales, destacan la tipografía monoespaciada para elementos de datos o código, cuadrículas sutiles de fondo tipo _grid_ que evocan un entorno de desarrollo o panel de control, y _badges_ o microetiquetas rectangulares con bordes bien definidos para listar lenguajes y herramientas. Las tarjetas de contenido no utilizan sombras pronunciadas ni degradados vistosos; en su lugar, emplean una microinteracción limpia mediante la cual el borde se ilumina levemente (`hover:border-zinc-700` o color de acento) al pasar el ratón. Todo el conjunto transmite precisión, solvencia en ingeniería de sistemas y una arquitectura de software/hardware seria, pulida y funcional.
## Los 6 Módulos Indivisibles

Cada módulo responderá a una única responsabilidad. Cuando le pidas cambios a la IA, solo le pasarás el bloque `<section>` correspondiente.

### Módulo 1: `Header` (Navegación fija)

- **Responsabilidad:** Mantener accesible la navegación entre secciones y mostrar el estado actual de disponibilidad.
    
- **Elementos:** Logo/Monograma estático, enlaces directos (`#projects`, `#skills`), y un indicador _live_ (p. ej., `● Disponible para proyectos`).
    

### Módulo 2: `Hero` (Presentación)

- **Responsabilidad:** Impacto inicial en menos de 3 segundos.
    
- **Elementos:** Titular de rol técnico, resumen ejecutivo de 2-3 líneas, etiquetas de especialidad y botones de acción rápida (Descargar CV / Contacto / GitHub).
    

### Módulo 3: `Skills` (Stack Técnico y Herramientas)

- **Responsabilidad:** Visualizar tus capacidades sin listas aburridas.
    
- **Elementos:** Rejilla dividida por áreas (Diseño Digital/Hardware, Lenguajes, Herramientas de Simulación/EDA) usando tarjetas con etiquetas monoespaciadas.
    

### Módulo 4: `Projects` (El Núcleo)

- **Responsabilidad:** Demostrar experiencia práctica con métricas y arquitectura.
    
- **Elementos:** Tarjetas de proyecto con:
    
    - Título y badge de tipo de proyecto (Académico / Personal / Investigación).
        
    - Descripción del problema y la solución técnica aportada.
        
    - Chips con las tecnologías involucradas.
        
    - Enlaces directos a repositorio/documentación.
        

### Módulo 5: `Experience` (Trayectoria / Formación)

- **Responsabilidad:** Mostrar evolución cronológica limpia.
    
- **Elementos:** Línea temporal minimalista (_timeline_) con puntos de anclaje, fechas en fuente monoespaciada y descripción concisa de hitos o titulación.
    

### Módulo 6: `Footer` (Contacto y Cierre)

- **Responsabilidad:** Vía rápida de comunicación y cierre del sitio.
    
- **Elementos:** Enlaces directos a correo electrónico, LinkedIn, GitHub y aviso de _copyright_ minimalista.