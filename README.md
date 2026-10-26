# Portafolio · Joan San Bartolomé Ferri

> Ingeniero de Diseño y Verificación Digital · RTL (SystemVerilog) · FPGA · PCB
> Máster Universitario en Ingeniería de Sistemas Electrónicos (UPV)

Web personal publicada en **https://joansanbartolome.es**. Página única, bilingüe (ES/EN), hecha con HTML, CSS y JavaScript sin frameworks ni paso de compilación.

## Secciones

Hero (con fondo 3D de un chip en Three.js) · Sobre mí · Trayectoria · Experiencia · Proyecto destacado (placa STM32F746ZG) · Otros proyectos · Habilidades · Contacto.

## Probar en local

```bash
python -m http.server 5500
```

Abre http://localhost:5500.

## Mantenimiento

- Estructura, reglas de estilo, sistema de idiomas y cómo añadir un proyecto: [docs/CONVENCIONES.md](docs/CONVENCIONES.md).
- Los datos salen del CV v3 y del perfil de `ruta_al_silicio`. No se publica nada que no esté verificado allí.
- Imágenes: `python tools/optimize_image.py origen.png assets/img/projects/nombre.webp`.

## Publicación (Hostinger)

Sube a `public_html` el contenido del repositorio. Basta con `index.html`, `404.html`, `.htaccess`, `robots.txt`, `sitemap.xml` y la carpeta `assets/`. El `.htaccess` fuerza HTTPS, define la caché y las cabeceras de seguridad, y bloquea el acceso a `docs/`, `tools/` y los archivos de configuración si se suben por error.

## Contacto

- Email: [josanbart@gmail.com](mailto:josanbart@gmail.com)
- LinkedIn: [Joan San Bartolomé Ferri](https://www.linkedin.com/in/joan-san-bartolome-ferri-358818252)
- GitHub: [@JoanSanbartolome](https://github.com/JoanSanbartolome)
