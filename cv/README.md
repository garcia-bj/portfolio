# CV

`cv.html` es la fuente. El PDF se genera con Chrome sin abrir nada:

    chrome --headless=new --disable-gpu --no-pdf-header-footer \
      --virtual-time-budget=12000 \
      --print-to-pdf="<ruta absoluta>/CV_Brandon Garcia.pdf" \
      "http://localhost:PUERTO/cv.html"

Tres trampas que ya costaron:

- **`--print-to-pdf-no-header` no funciona.** La bandera buena es
  `--no-pdf-header-footer`. Sin ella, cada pagina lleva un pie con la URL y
  el numero de pagina.
- **La ruta de salida tiene que ser absoluta.** Con una relativa Chrome la
  resuelve desde su propio directorio y falla con "Acceso denegado".
- **Sirvelo por HTTP, no por `file://`.** Con `file://` el pie imprime la
  ruta local entera y las fuentes de Google tardan mas en llegar.
  `python -m http.server` en esta carpeta basta.

`--virtual-time-budget` es lo que hace esperar a que carguen Syne y Geist;
sin el salen las fuentes de respaldo.

El PDF publicado vive en `public/CV_Brandon Garcia.pdf`.
