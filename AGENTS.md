# AGENTS.md

Personal portfolio site for Brandon Garcia (Full Stack Developer & AI Engineer).

## Commands

- `pnpm dev` / `pnpm build` / `pnpm lint`. **Usa pnpm, no npm**: Netlify instala
  con `pnpm-lock.yaml` y `--frozen-lockfile`. Un `npm install` desincroniza el
  lockfile y el deploy falla con `ERR_PNPM_OUTDATED_LOCKFILE`. Por eso
  `package-lock.json` esta en `.gitignore`.
- El comando de build en `netlify.toml` es `npm run build`, pero eso solo ejecuta
  el script: las dependencias ya se instalaron con pnpm.
- No test script and no CI. There is no standalone `typecheck` script — type checking runs inside `next build` (strict TS).
- Node 20 is required for the Netlify build (pinned in `netlify.toml`).

## Stack & architecture

- Next.js 16 (App Router, Turbopack) + React 19 + TypeScript (strict) + Tailwind CSS v4 + Framer Motion + anime.js v4.
- Single-page site: `src/app/page.tsx` assembles section components from `src/components/sections/` (`Hero`, `Stats`, `Stack`, `Projects`, `Experience`, `Contact`), each wrapped in `<SectionReveal>`. Only routes are `/` and `/gracias`.
- `src/app/layout.tsx` owns the chrome: `Navbar`, `Footer`, `ScrollProgressIndicator` and the GA scripts. Note `<html lang="en">` while all copy is Spanish.
- Path alias `@/*` → `./src/*`.
- Projects data lives in `src/components/sections/constants.ts`, not fetched or in a DB. Anchor ids come from the `SectionId` enum in `src/types/index.ts` (used by the Navbar links).

## Animation layer (`src/components/ui/`)

Dos librerias, cada una en lo suyo:

- **anime.js v4** para los revelados de scroll. `Reveal` envuelve un bloque y lo
  anima con `onScroll({ sync: 'play reverse play reverse' })`: entra al bajar y
  se rebobina al subir, no es un `once`. Con `items` anima los hijos marcados
  `data-reveal-item` escalonados en vez del contenedor.
- **Framer Motion** para lo ligado al scroll de forma continua: el apilado
  sticky de `Projects`, el parallax del Hero, `TextReveal`, `ScrollProgressIndicator`.

Otros componentes: `SectionHeading` (cabecera de seccion, revela el titular
palabra por palabra sobre `Reveal`), `TextReveal` (frase que se ilumina ligada
al scroll), `Magnetic` (boton que sigue al cursor, en el Hero).

### Trampas de anime.js que ya costaron caro

- **No pases `target` a `onScroll`.** Si `_params.target` esta definido, `link()`
  no llama a `refresh()` y el observador puede quedarse sin inicializar. Dejalo
  deducir el target de la propia animacion.
- **`leave` por defecto.** Un `leave: 'top+=80 bottom'` hace desaparecer los
  elementos cortos (palabras de un titular) estando aun en pantalla.
- Verificar reveals con `window.scrollTo()` desde la consola **no funciona**: el
  scroll programatico por CDP no dispara eventos `scroll`. Hay que scrollear con
  rueda de verdad.

### La lamina del Stack

`Stack.tsx` no usa tarjetas. Es un dial fijado con modulos que rotan al scrollear,
al estilo de animejs.com:

- El track mide `categories.length * 62vh` y su hijo es `sticky top-0 h-screen`.
  `useScroll` sobre el track da el progreso; de ahi salen `active` (el modulo) y
  `started` (si ya arranco la animacion de entrada).
- **`StackDial`**: SVG generado por codigo (cruz, anillos, corona de 96 marcas y
  un arco por categoria). Toda la geometria sale de `polar` y `arcPath` sobre un
  viewBox fijo de 1000x640 — **no hay ningun asset grafico**.
- **`ModuleTechs`**: los logos del stack, dentro del hueco central del dial.
  Se reanima con un stagger cada vez que cambia la categoria.
- **`ProgressRuler`**: la regla de marcas abajo a la derecha, con el marcador
  ligado al progreso del track.
- Por debajo de `md` el dial se oculta y manda un indice tipografico.

#### Por que el dial no usa el ScrollObserver de anime

Vive dentro de un contenedor fijado ocho pantallas. Tanto `onScroll` de anime
como un `IntersectionObserver` calculan mal su ventana ahi. El disparo viene del
progreso del track (`started`).

#### Por que el trazo no usa `svg.createDrawable`

Con estos elementos el helper dejaba los arcos a medio dibujar. La longitud se
mide a mano con `getTotalLength()` y se anima `strokeDashoffset`.

**Los arcos no llevan animacion de trazo**: React reescribe esos nodos en cada
cambio de modulo y pisaria los estilos en linea de anime.js. Entran con un
fundido sobre el `<g>` que los agrupa, que React no toca.

### Trampas del apilado sticky de `Projects`

- `overflow-x: hidden` en `html`/`body` **rompe** `position: sticky` (convierte
  el elemento en contenedor de scroll). `globals.css` usa `overflow-x: clip`.
- El apilado se desactiva por debajo de `md` (`useIsDesktop`): la tarjeta no cabe
  en un movil.

## Pieza 3D: el modulo del stack

El objeto ES el contenido: una capa por categoria de `Stack.tsx`. Gira siempre,
se despieza con el scroll y deriva de lado a lado.

### Como esta hecho

`StackModule3D.tsx` lo construye en three.js con las **mismas primitivas** que
`3d/build_stack_module.py` (cilindros, toros, cubos). **No hay ningun `.glb`**:
cero peso de asset. Blender sigue siendo donde se disena y previsualiza la pieza;
la web la dibuja.

Antes esto era una secuencia de 40 WebP (1.044 KB). three.js pesa 182 KB gzip,
asi que el cambio **aligero el sitio en ~860 KB** ademas de mejorarlo.

### Por que 3D real y no una secuencia de imagenes

Una secuencia no puede separar dos movimientos independientes. Aqui conviven:

- **Giro continuo** (`rig.rotation.y += delta`), que no depende del scroll. Es lo
  que hace que nunca se quede quieto.
- **Despiece** ligado al progreso del track.
- **Deriva lateral** hacia `DRIFT[active % 4]`, suavizada por interpolacion.

Con fotogramas pregenerados habria que renderizar el producto cartesiano de los
tres ejes.

### Trampas

- **Cada capa lleva un relleno opaco ademas de las aristas.** El relleno va del
  color del fondo (`OCCLUDER`) y no se ve, pero escribe en el buffer de
  profundidad y **oculta las lineas de la cara trasera**. Sin el, el objeto se ve
  transparente como una jaula de alambre. Es lo que hacia Freestyle en Blender.
- `polygonOffset` en ese relleno evita que las aristas parpadeen sobre el.
- Las geometrias de cada capa se fusionan con `mergeGeometries` para no acabar
  con ~230 draw calls (28 dientes x 8 capas).
- El bucle de render se para cuando el modulo no esta en pantalla
  (IntersectionObserver) y respeta `prefers-reduced-motion`.

### El relevo de textos

`Stack.tsx` renderiza **dos** bloques de copy a la vez: el actual y el siguiente.
Sus opacidades y desplazamientos salen de la parte fraccionaria del progreso
(`FADE_START`), no del indice entero. Por eso ves llegar el texto siguiente
mientras el actual se va, en vez de un cambio brusco al saltar de modulo.

El texto va siempre al lado contrario del objeto, asi que nunca se pisan.

El recorrido importa: con 48 px de viaje el texto entrante parecia aparecer ahi
mismo. `TRAVEL_IN` lo sube a 190 px y la opacidad entra **despues** que el
movimiento, asi se lee como que llega desde abajo y no como un fundido.

### El grosor del trazo

**`LineBasicMaterial.linewidth` se ignora en WebGL**: siempre pinta a 1 px, por
una limitacion de la especificacion. Da igual el valor que le pongas.

Para tener grosor de verdad hay que usar `LineSegments2` + `LineMaterial`
(`three/examples/jsm/lines/`), que dibuja cada arista como dos triangulos.
Requiere pasarle la **resolucion del lienzo** en cada `resize`, o las lineas
salen finisimas.

La capa encendida tambien engorda: `LINE_WIDTH` 2.2 -> `LINE_WIDTH_HOT` 3.4.

### La deriva es continua, no por etapas

`drift` es un **MotionValue**, no un numero. Si dependiera de `active` solo
cambiaria al saltar de etapa y el cilindro daria un brinco. Se interpola desde
el progreso con el mismo `smoothstep(FADE_START, 1, ...)` que el relevo de
textos, asi que el objeto empieza a cruzar en el mismo instante en que el texto
arranca su cambio y llega a la vez que el titular nuevo.

### La capa encendida

`StackModule3D` recibe `active` y enciende **una sola capa**: la suya toma el
color de la etapa y el resto se quedan en el trazo apagado (`DIM`).

Dos detalles que ya costaron:

- Las capas se apilan **de abajo arriba** (la 0 es la de mas abajo), asi que hay
  que invertir el indice (`layers.length - 1 - active`) para que el encendido
  **baje** conforme avanzas.
- El color sale de `colors[active]`, **no** del indice de la capa. Con lo
  segundo el titular decia azul y la capa se encendia ambar.

Los colores de las categorias son un espectro contenido (petroleo -> cian ->
azul -> verde -> lima -> ambar -> naranja -> coral). Si fueran todos del mismo
verde, "el color baja pero a otro color" no se notaria.

### Verificar animaciones en el navegador

Chrome **estrangula `requestAnimationFrame` en pestanas sin foco**. Dos capturas
identicas separadas por segundos NO prueban que algo este quieto: puede ser la
pestana sin foco. Comprobado en carne propia comparando con animejs.com.

## Pieza 3D: el cofre de herramientas

Banda entre Experiencia y Contacto. El cofre se abre con el scroll y expulsa
los logos del stack en abanico.

### El pipeline: Blender -> JSON -> three.js

A diferencia del modulo del stack (donde las medidas estan duplicadas a mano en
el `.py` y en el `.tsx`), aqui hay **una sola fuente de verdad**:

    3d/build_treasure_chest.py  ->  src/data/chest-parts.json  ->  ToolboxScene.tsx
       (modela en Blender)            (145 piezas, 16 KB)          (lo monta)

El script escribe la lista de piezas — medidas, posicion, giro y material — y la
web la lee y reconstruye la geometria. **No hay `.glb`**: un `.glb` guarda la
malla entera (vertices, caras, normales) y pesaria cientos de KB; el JSON guarda
solo las medidas y three.js fabrica la malla en el navegador.

Para retocar el cofre se editan las constantes de arriba del script y se corre:

    blender --background --factory-startup --python 3d/build_treasure_chest.py -- --save

Regenera el JSON y el `.blend` a la vez, asi que nunca se separan.

### Trampas del cofre

- **Blender es Z-up y three.js Y-up.** La conversion correcta es
  `(x, y, z) -> (x, -z, y)`, tambien en los giros. Con `(x, z, y)` se invierte
  la mano: las duelas de la boveda salian planas, en escalera.
- **Esta pieza SI lleva color** (madera, hierro, laton), a diferencia del resto
  del sitio. Usa `MeshLambertMaterial`, que **necesita luces**: sin ellas el
  cofre sale negro.
- Las 145 piezas se fusionan en **seis** mallas (cuerpo y tapa x tres
  materiales) para no acabar con 145 draw calls.

## Pieza 3D: el nucleo de IA (nube de puntos)

Banda entre el manifiesto y el Stack. Una nube de 10.242 puntos que se
reconfigura entre tres esculturas segun el scroll.

### El caso que NO cabe en una lista de piezas

El cofre son tablas y flejes: se describe con medidas. Esta forma es **ruido
esculpido**, y no hay manera de reducirla a numeros.

La salida no fue exportar un `.glb`. Fue darse cuenta de que **si lo vamos a
dibujar como particulas, solo hacen falta las posiciones**: nada de caras,
normales, UVs ni texturas.

    escultura (Blender)  ->  public/3d/ai-core.bin  ->  THREE.Points
        3 formas               Int16 XYZ, 180 KB        1 draw call

El mismo modelo como `.glb` con caras y una textura 2K rondaria los 3-8 MB.

### Por que las tres formas morfean

Las tres nacen del **mismo icoesfera subdividido** y solo cambia el
desplazamiento. Comparten topologia, asi que el punto `i` de una corresponde al
`i` de las otras: morfear es un `mix()` en el vertex shader entre dos arrays.

### Trampas

- **`bmesh.ops.create_icosphere` numera raro**: los vertices son
  `10 * 4^(n-1) + 2`. Para 10.242 hace falta `subdivisions=6`, no 5.
- **El tamano de punto se calcula sobre la distancia a camara.** Con la
  constante mal (260 en vez de 30) cada punto salia de ~97 px y la nube se
  saturaba a blanco solido: parecia una mancha, no una escultura.
- Con `AdditiveBlending` y 10.000 puntos el brillo se acumula rapido. El alfa
  por punto va al 0.55, no a 1.
- El binario se carga con `fetch` en runtime, **no** se empaqueta en el bundle
  de JS.

Para regenerar:

    blender --background --factory-startup --python 3d/build_ai_core.py -- --save

## Tailwind v4 gotchas

- There is **no `tailwind.config.*`**. Theme is configured entirely in `src/app/globals.css` via the `@theme static` block, which maps `--color-*` tokens to `hsl(var(--...))` CSS variables.
- **`@theme static`, no `@theme`**: Tailwind v4 descarta las variables de tema que no ve usadas y las fuentes (`--font-sans`, `--font-mono`, `--font-display`) se quedaban vacías.
- **Las variables de next/font van en `<html>`, no en `<body>`**: `@theme` las resuelve en `:root`; si viven en `<body>` quedan indefinidas y ninguna fuente se aplica.
- Utilidades propias vía `@utility`: `glass`, `grid-lines`, `eyebrow`, `ring-glow`, `font-display`.
- The actual palette values (petrol-green dark theme) live in the `:root` block in the same file.

## Tipografía

- Display: **Syne** (`font-display`), titulares y cifras. El énfasis se marca con **salto de peso** (`font-normal text-foreground/50` -> `font-extrabold` con degradado `from-primary to-secondary`), no con itálica: Syne no tiene cursiva real.
- Cuerpo: **Geist Sans**. Micro-etiquetas y datos: **Geist Mono** (`font-mono` / `eyebrow`).

## Content & language

- All UI copy, code comments, and commit messages are in Spanish.
- **Los commits NO llevan trailer `Co-Authored-By`.** Es preferencia explicita
  del dueno del repo: los commits van solo a su nombre.

## External integrations (hardcoded)

- Contact form submits to Formspree via a plain HTML `action` (`https://formspree.io/f/mojeonpo`) in `src/components/sections/Contact.tsx`. The README incorrectly says "Netlify Forms". The `@formspree/react` `useForm`/`ValidationError` imports are unused — the form is a native POST.
- Google Analytics is hardcoded in `src/app/layout.tsx` (G-0KDF54NSVZ) via `next/script`.

## Deploy

- Netlify: `netlify.toml` sets `publish = ".next"` and uses `@netlify/plugin-nextjs`. No serverless functions or edge runtime.
