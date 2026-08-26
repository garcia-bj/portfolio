# 🚀 Portfolio - Brandon Garcia

Portafolio profesional de alto rendimiento para **Full Stack Developer & AI Engineer**.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Tailwind](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss)
![Netlify](https://img.shields.io/badge/Deploy-Netlify-00C7B7?logo=netlify)

## ✨ Características

- 🧠 **Hero Interactivo** — Red neuronal animada en Canvas que reacciona al cursor
- 🎬 **Scroll reversible** — Los reveals entran al bajar y se deshacen al subir (anime.js `onScroll`)
- 🃏 **Proyectos apilados** — Tarjetas que se fijan y se montan una sobre otra al scrollear
- 💎 **Glassmorphism + grano** — Cristal, auroras a la deriva y textura de película
- 📱 **100% Responsive** — El apilado sticky se desactiva bajo `md`, donde no cabe
- ♿ **Accesible** — Foco visible, `aria-label` en iconos y `prefers-reduced-motion` respetado
- 🌙 **Dark Theme** — Paleta "Petrol Green" sobre fondo casi negro
- 📧 **Formulario de Contacto** — Integrado con **Formspree**

## 🛠 Tech Stack

| Categoría | Tecnología |
|-----------|------------|
| Framework | Next.js 16 (App Router + Turbopack) |
| Lenguaje | TypeScript (strict) |
| Estilos | Tailwind CSS v4 (sin `tailwind.config`, todo en `globals.css`) |
| Animación de scroll | anime.js v4 (`onScroll` con `sync` reversible) |
| Animación de UI | Framer Motion (sticky/parallax ligados al scroll) |
| Tipografía | Syne (display) + Geist Sans / Geist Mono |
| Iconos | Lucide React, React Icons |
| Formulario | Formspree |
| Analítica | Google Analytics (GA4) |
| Deploy | Netlify |

## 📦 Instalación

```bash
# Clonar
git clone https://github.com/garcia-bj/portafolio.git
cd portafolio

# Instalar
pnpm install

# Desarrollo
pnpm dev

# Build (aquí corre también el chequeo de tipos)
pnpm build

# Lint
pnpm lint
```

No hay script de `test` ni de `typecheck`: el chequeo de tipos va dentro de `next build`.

## 🚀 Deploy en Netlify

El proyecto incluye `netlify.toml` preconfigurado (`@netlify/plugin-nextjs`, Node 20):

1. Conecta tu repo de GitHub a Netlify
2. Netlify detecta la configuración automáticamente
3. El build corre con `npm run build` y publica `.next`

### Formulario de contacto (Formspree, no Netlify Forms)

El formulario hace un `POST` nativo a Formspree desde
`src/components/sections/Contact.tsx`:

```
action="https://formspree.io/f/mojeonpo"
```

Para gestionarlo o cambiar el destinatario, entra a [formspree.io](https://formspree.io)
con la cuenta dueña de ese formulario.

**Pendiente:** la página `/gracias` existe pero todavía no se usa. Formspree
redirige ahí si añades un campo oculto con la URL absoluta del sitio:

```html
<input type="hidden" name="_next" value="https://TU-DOMINIO/gracias" />
```

## 📂 Estructura

```
src/
├── app/              # Rutas (App Router): / y /gracias + globals.css
├── components/
│   ├── ui/           # Reveal (anime.js), SectionHeading, TextReveal,
│   │                 # Magnetic, ScrollProgressIndicator
│   ├── sections/     # Hero, Stats, Stack, Projects, Experience, Contact
│   └── layout/       # Navbar, Footer
└── types/            # SectionId (anclas de navegación)
```

Los datos de los proyectos viven en `src/components/sections/constants.ts`.

## 👤 Autor

**Brandon Garcia** — Full Stack Developer & AI Engineer

- 📍 Cochabamba, Bolivia
- 📧 garciacussi7@gmail.com
- 📱 +591 62423272

## 📝 Licencia

MIT License
