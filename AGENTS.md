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

### Verificar animaciones en el navegador

Chrome **estrangula `requestAnimationFrame` en pestanas sin foco**. Dos capturas
identicas separadas por segundos NO prueban que algo este quieto: puede ser la
pestana sin foco. Comprobado en carne propia comparando con animejs.com.

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

## External integrations (hardcoded)

- Contact form submits to Formspree via a plain HTML `action` (`https://formspree.io/f/mojeonpo`) in `src/components/sections/Contact.tsx`. The README incorrectly says "Netlify Forms". The `@formspree/react` `useForm`/`ValidationError` imports are unused — the form is a native POST.
- Google Analytics is hardcoded in `src/app/layout.tsx` (G-0KDF54NSVZ) via `next/script`.

## Deploy

- Netlify: `netlify.toml` sets `publish = ".next"` and uses `@netlify/plugin-nextjs`. No serverless functions or edge runtime.
