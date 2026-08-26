'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValueEvent, useScroll, useTransform } from 'framer-motion';
import { animate, stagger } from 'animejs';
import {
    TbDeviceDesktop, TbServerBolt, TbDatabase, TbBrain,
    TbCloud, TbTerminal2
} from 'react-icons/tb';
import { SiMeta, SiWhatsapp, SiInstagram, SiMessenger, SiMinio, SiRust } from 'react-icons/si';
import type { IconType } from 'react-icons';
import { Cpu, Bot, Terminal, Waypoints, Sparkles, Braces } from 'lucide-react';
import { SectionId } from '@/types';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Reveal } from '@/components/ui/Reveal';
import { StackModule } from './StackModule';

// Iconos servidos desde /public/icons (solo se usan en el marquee)
const techIcons: Record<string, string> = {
    "React": "/icons/react_dark.svg",
    "Next.js": "/icons/nextjs_icon_dark.svg",
    "TypeScript": "/icons/typescript.svg",
    "Tailwind CSS": "/icons/tailwindcss.svg",
    "Node.js": "/icons/nodejs.svg",
    "Python": "/icons/python.svg",
    "FastAPI": "/icons/fastapi.svg",
    "NestJS": "/icons/nestjs.svg",
    "PostgreSQL": "/icons/postgresql.svg",
    "MongoDB": "/icons/mongodb-icon-dark.svg",
    "Redis": "/icons/redis.svg",
    "Docker": "/icons/docker.svg",
    "Kubernetes": "/icons/kubernetes.svg",
    "GitHub Actions": "/icons/github_dark.svg",
    "Git": "/icons/git.svg",
    "Supabase": "/icons/supabase.svg",
    "Linux": "/icons/linux.svg",
    "Google Cloud": "/icons/google-cloud.svg",
    "VSCode": "/icons/vscode.svg",
    "OpenAI API": "/icons/openai.svg",
    "Claude AI": "/icons/claude-ai-icon.svg",
    "Qdrant": "/icons/qdrant-icon-light.svg",
    "n8n": "/icons/n8n.svg",
    "LangGraph": "/icons/langgraph-color.svg",
    "OpenRouter": "/icons/openrouter_dark.svg",
    "LangChain": "/icons/langchain-color.svg",
};

// Iconos como componente: no requieren asset en /public
const techReactIcons: Record<string, IconType> = {
    "Meta Cloud API": SiMeta,
    "WhatsApp Business API": SiWhatsapp,
    "Instagram Graph API": SiInstagram,
    "Messenger Platform": SiMessenger,
    "MinIO": SiMinio,
    "RUSTFS": SiRust,
    // Tooling agéntico: sin marca oficial en /public/icons todavía
    "Claude Code": Terminal,
    "OpenCode": Braces,
    "MCP": Waypoints,
    "Skills": Sparkles,
    "Subagentes": Bot,
};

type Category = {
    id: string;
    title: string;
    description: string;
    icon: IconType;
    color: string;
    techs: { name: string; level: number }[];
};

const categories: Category[] = [
    {
        id: "frontend",
        title: "Frontend",
        description: "Interfaces modernas y responsivas",
        icon: TbDeviceDesktop,
        color: "#0FB9B1",
        techs: [
            { name: "React", level: 95 },
            { name: "Next.js", level: 90 },
            { name: "TypeScript", level: 92 },
            { name: "Tailwind CSS", level: 95 },
        ]
    },
    {
        id: "backend",
        title: "Backend",
        description: "APIs robustas y escalables",
        icon: TbServerBolt,
        color: "#14B8A6",
        techs: [
            { name: "Node.js", level: 90 },
            { name: "Python", level: 92 },
            { name: "FastAPI", level: 88 },
            { name: "NestJS", level: 85 },
        ]
    },
    {
        id: "database",
        title: "Bases de Datos",
        description: "Almacenamiento optimizado",
        icon: TbDatabase,
        color: "#22D3EE",
        techs: [
            { name: "PostgreSQL", level: 90 },
            { name: "Supabase", level: 95 },
            { name: "MongoDB", level: 85 },
            { name: "Redis", level: 80 },
            { name: "Qdrant", level: 88 },
        ]
    },
    {
        id: "ai",
        title: "IA & Machine Learning",
        description: "Modelos, RAG y orquestación",
        icon: TbBrain,
        color: "#20E3B2",
        techs: [
            { name: "LangChain", level: 92 },
            { name: "LangGraph", level: 88 },
            { name: "OpenAI API", level: 95 },
            { name: "Claude AI", level: 88 },
            { name: "OpenRouter", level: 90 },
            { name: "Python", level: 94 },
        ]
    },
    {
        id: "agentic",
        title: "Tooling Agéntico",
        description: "Desarrollo asistido por agentes",
        icon: Bot,
        color: "#5EEAD4",
        techs: [
            { name: "Claude Code", level: 95 },
            { name: "OpenCode", level: 85 },
            { name: "MCP", level: 92 },
            { name: "Skills", level: 90 },
            { name: "Subagentes", level: 88 },
        ]
    },
    {
        id: "devops",
        title: "DevOps & Cloud",
        description: "Infraestructura automatizada",
        icon: TbCloud,
        color: "#34D399",
        techs: [
            { name: "Docker", level: 90 },
            { name: "Kubernetes", level: 78 },
            { name: "GitHub Actions", level: 92 },
            { name: "Google Cloud", level: 80 },
            { name: "MinIO", level: 82 },
            { name: "RUSTFS", level: 78 },
        ]
    },
    {
        id: "meta",
        title: "Ecosistema Meta",
        description: "Aplicaciones multicanal",
        icon: SiMeta,
        color: "#0D9488",
        techs: [
            { name: "Meta Cloud API", level: 90 },
            { name: "WhatsApp Business API", level: 92 },
            { name: "Instagram Graph API", level: 85 },
            { name: "Messenger Platform", level: 85 },
        ]
    },
    {
        id: "tools",
        title: "Herramientas",
        description: "Productividad y versionado",
        icon: TbTerminal2,
        color: "#2DD4BF",
        techs: [
            { name: "Git", level: 95 },
            { name: "Linux", level: 85 },
            { name: "VSCode", level: 95 },
            { name: "n8n", level: 90 },
        ]
    }
];

/* ------------------------------------------------------------------ */
/* Geometría del dial                                                  */
/* ------------------------------------------------------------------ */

const VB_W = 1000;
const VB_H = 640;
const CX = 500;
const CY = 320;
const R_ARC = 236;
const R_INNER = 170; // hueco libre para el contenido del modulo
const SEG = 360 / categories.length;
const GAP = 6; // grados de separación entre segmentos
const TICKS = 96;

const polar = (r: number, deg: number) => {
    const a = (deg * Math.PI) / 180;
    return { x: CX + r * Math.cos(a), y: CY + r * Math.sin(a) };
};

const arcPath = (r: number, from: number, to: number) => {
    const s = polar(r, from);
    const e = polar(r, to);
    const large = Math.abs(to - from) > 180 ? 1 : 0;
    return `M ${s.x.toFixed(2)} ${s.y.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${e.x.toFixed(2)} ${e.y.toFixed(2)}`;
};

/* ------------------------------------------------------------------ */

function StackDial({ active, started }: { active: number; started: boolean }) {
    const ref = useRef<SVGSVGElement>(null);

    // Estado inicial: trazos sin dibujar y marcas invisibles. Se aplica al montar
    // para que no haya un salto cuando arranca la animacion.
    useEffect(() => {
        const root = ref.current;
        if (!root) return;
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        root.querySelectorAll<SVGGeometryElement>('[data-draw]').forEach((el) => {
            const len = el.getTotalLength();
            el.style.strokeDasharray = `${len}`;
            el.style.strokeDashoffset = `${len}`;
        });
        root.querySelectorAll<SVGElement>('[data-fade]').forEach((el) => {
            el.style.opacity = '0';
        });
    }, []);

    // El dial vive dentro de un contenedor fijado ocho pantallas: ni el
    // ScrollObserver de anime ni un IntersectionObserver aciertan su ventana.
    // El disparo viene del progreso del propio track.
    useEffect(() => {
        const root = ref.current;
        if (!root || !started) return;
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        // Medimos la longitud a mano en vez de usar createDrawable: aqui conviven
        // elementos que React vuelve a renderizar y el helper se quedaba a medias.
        const strokes = animate(root.querySelectorAll('[data-draw]'), {
            strokeDashoffset: 0,
            duration: 1300,
            delay: stagger(70),
            ease: 'inOut(3)',
        });

        const fades = animate(root.querySelectorAll('[data-fade]'), {
            opacity: [0, 1],
            duration: 500,
            delay: stagger(6, { start: 400 }),
            ease: 'out(2)',
        });

        return () => {
            strokes.revert();
            fades.revert();
        };
    }, [started]);

    return (
        <svg
            ref={ref}
            viewBox={`0 0 ${VB_W} ${VB_H}`}
            className="w-full"
            role="img"
            aria-label="Instrumento del stack técnico"
        >
            {/* Retícula */}
            <line data-draw x1={CX - 290} y1={CY} x2={CX + 290} y2={CY} stroke="currentColor" strokeWidth="1" className="text-border" />
            <line data-draw x1={CX} y1={CY - 290} x2={CX} y2={CY + 290} stroke="currentColor" strokeWidth="1" className="text-border" />

            {/* Anillos concéntricos */}
            <circle data-draw cx={CX} cy={CY} r={R_INNER} fill="none" stroke="currentColor" strokeWidth="1" className="text-border" />
            <circle data-draw cx={CX} cy={CY} r={R_ARC - 22} fill="none" stroke="currentColor" strokeWidth="1" className="text-border" />
            {/* El anillo punteado ya usa dasharray, asi que entra con un fundido */}
            <circle data-fade cx={CX} cy={CY} r={R_INNER + 34} fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="2 6" className="text-border" />

            {/* Corona de marcas */}
            <g>
                {Array.from({ length: TICKS }, (_, i) => {
                    const deg = (360 / TICKS) * i;
                    const long = i % 8 === 0;
                    const a = polar(R_ARC - 22, deg);
                    const b = polar(R_ARC - (long ? 40 : 32), deg);
                    return (
                        <line
                            key={i}
                            data-fade
                            x1={a.x.toFixed(2)}
                            y1={a.y.toFixed(2)}
                            x2={b.x.toFixed(2)}
                            y2={b.y.toFixed(2)}
                            stroke="currentColor"
                            strokeWidth={long ? 1.5 : 1}
                            className={long ? 'text-primary/40' : 'text-border'}
                        />
                    );
                })}
            </g>

            {/* Un segmento por categoría: el activo se enciende.
                Sin animacion de trazo aqui — React reescribe estos nodos en cada
                cambio de modulo y pisaria los estilos en linea de anime.js. */}
            <g data-fade>
                {categories.map((c, i) => {
                    const from = -90 + i * SEG + GAP / 2;
                    const to = -90 + (i + 1) * SEG - GAP / 2;
                    const isActive = active === i;
                    return (
                        <path
                            key={c.id}
                            d={arcPath(R_ARC, from, to)}
                            fill="none"
                            stroke={c.color}
                            strokeWidth={isActive ? 8 : 3}
                            strokeLinecap="round"
                            opacity={isActive ? 1 : 0.16}
                            className="transition-all duration-500"
                            style={isActive ? { filter: `drop-shadow(0 0 12px ${c.color})` } : undefined}
                        />
                    );
                })}
            </g>
        </svg>
    );
}

/** Regla de progreso: el marcador recorre los módulos, como el film-strip de anime.js */
function ProgressRuler({ progress }: { progress: ReturnType<typeof useScroll>['scrollYProgress'] }) {
    const left = useTransform(progress, [0, 1], ['0%', '100%']);
    return (
        <div className="pointer-events-none absolute bottom-10 right-6 hidden w-72 lg:right-10 lg:block">
            <div className="relative flex h-10 items-center justify-between overflow-hidden rounded-md border border-border/60 bg-card/40 px-3 backdrop-blur-sm">
                {Array.from({ length: 44 }, (_, i) => (
                    <span key={i} className="h-3 w-px bg-muted-foreground/25" />
                ))}
                <motion.span
                    style={{ left }}
                    className="absolute top-1/2 h-5 w-[3px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary"
                />
            </div>
        </div>
    );
}

/* ------------------------------------------------------------------ */

function TechIcon({ name, className }: { name: string; className: string }) {
    const ReactIcon = techReactIcons[name];
    const iconUrl = techIcons[name];

    if (ReactIcon) return <ReactIcon className={`${className} text-primary`} />;
    if (iconUrl) return <img src={iconUrl} alt="" loading="lazy" className={className} />;
    return <Cpu className={`${className} text-primary`} />;
}

const marqueeTechs = [
    "React", "Next.js", "TypeScript", "Tailwind CSS", "Node.js", "Python",
    "FastAPI", "NestJS", "PostgreSQL", "MongoDB", "Redis", "Docker",
    "Kubernetes", "Supabase", "Google Cloud", "OpenAI API", "Claude AI",
    "Claude Code", "OpenCode", "MCP", "Skills",
    "Qdrant", "n8n", "LangGraph", "LangChain",
    "Meta Cloud API", "WhatsApp Business API", "Instagram Graph API", "Messenger Platform",
];

function TechMarquee() {
    const items = [...marqueeTechs, ...marqueeTechs];

    return (
        <div className="relative overflow-hidden border-y border-border/60 py-6 [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
            <div className="flex w-max animate-marquee">
                {items.map((name, i) => (
                    <div key={i} className="mx-6 flex items-center gap-2.5 whitespace-nowrap">
                        <TechIcon name={name} className="h-4 w-4" />
                        <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-muted-foreground/60">
                            {name}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ------------------------------------------------------------------ */

/** Fichas de la categoría activa: los logos vuelven, dentro del instrumento. */
function ModuleTechs({ category }: { category: Category }) {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const root = ref.current;
        if (!root) return;
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        const anim = animate(root.querySelectorAll('[data-chip]'), {
            opacity: [0, 1],
            scale: [0.6, 1],
            y: [18, 0],
            duration: 600,
            delay: stagger(55),
            ease: 'out(3)',
        });

        return () => {
            anim.revert();
        };
    }, [category.id]);

    return (
        <div ref={ref} className="mt-7 flex flex-wrap items-start gap-x-5 gap-y-6">
            {category.techs.map((t) => (
                <div key={t.name} data-chip className="flex w-[4.6rem] flex-col items-start gap-2">
                    <TechIcon name={t.name} className="h-7 w-7" />
                    <span className="font-mono text-[9px] uppercase leading-tight tracking-[0.1em] text-muted-foreground/70">
                        {t.name}
                    </span>
                </div>
            ))}
        </div>
    );
}

export function TechStack() {
    const trackRef = useRef<HTMLDivElement>(null);
    const [active, setActive] = useState(0);
    const [started, setStarted] = useState(false);

    // Un modulo por categoria: el dial se queda fijo y el contenido rota
    const { scrollYProgress } = useScroll({
        target: trackRef,
        offset: ['start start', 'end end'],
    });

    useMotionValueEvent(scrollYProgress, 'change', (p) => {
        const i = Math.min(categories.length - 1, Math.max(0, Math.floor(p * categories.length)));
        setActive(i);
        setStarted(true);
    });

    const current = categories[active];

    return (
        <section id={SectionId.STACK} className="relative">
            <div className="pointer-events-none absolute left-0 top-1/4 h-96 w-96 rounded-full bg-primary/[0.06] blur-[120px]" />
            <div className="pointer-events-none absolute bottom-1/4 right-0 h-96 w-96 rounded-full bg-secondary/[0.05] blur-[120px]" />

            <div className="relative z-10 pt-32">
                <div className="mx-auto mb-20 max-w-7xl px-6 lg:px-10">
                    <SectionHeading
                        eyebrow="Tecnologías"
                        title="Stack"
                        accent="técnico"
                        description="Del pixel al pipeline: todo el ecosistema que uso para llevar una idea a producción."
                    />
                </div>

                <TechMarquee />

                {/* --- Módulos fijados (escritorio) --- */}
                <div
                    ref={trackRef}
                    className="relative hidden md:block"
                    style={{ height: `${categories.length * 62}vh` }}
                >
                    {/* `bg-background` no es decorativo: sin un fondo opaco aqui, el
                        `mix-blend-mode: screen` del canvas 3D no tiene contra que
                        mezclar y el negro del render se ve como un rectangulo. */}
                    <div className="sticky top-0 flex h-screen items-center overflow-hidden bg-background">
                        <div className="pointer-events-none absolute left-0 top-1/4 h-96 w-96 rounded-full bg-primary/[0.07] blur-[120px]" />
                        <div className="pointer-events-none absolute bottom-1/4 right-0 h-96 w-96 rounded-full bg-secondary/[0.05] blur-[120px]" />
                        <div className="mx-auto grid w-full max-w-7xl grid-cols-[minmax(0,20rem)_1fr] items-center gap-6 px-6 lg:grid-cols-[minmax(0,24rem)_1fr] lg:gap-10 lg:px-10">
                            {/* Columna izquierda: el módulo activo */}
                            <div key={current.id} className="module-copy">
                                <span className="font-mono text-[11px] tracking-[0.3em] text-muted-foreground/50">
                                    {String(active + 1).padStart(2, '0')} / {String(categories.length).padStart(2, '0')}
                                </span>

                                <h3
                                    className="mt-5 font-display text-[clamp(2rem,4vw,3.5rem)] font-extrabold leading-[0.95] transition-colors duration-500"
                                    style={{ color: current.color }}
                                >
                                    {current.title}
                                </h3>

                                <p className="mt-5 max-w-sm text-base leading-relaxed text-muted-foreground/80">
                                    {current.description}.
                                </p>

                                <div className="mt-8 h-px w-full max-w-[18rem] bg-border" />

                                <ModuleTechs category={current} />
                            </div>

                            {/* El instrumento enmarca la secuencia 3D: el modulo
                                se despieza mientras recorres las categorias */}
                            <div className="relative">
                                <StackDial active={active} started={started} />
                                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                                    <div className="aspect-[3/4] h-[126%]">
                                        <StackModule progress={scrollYProgress} start={started} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <ProgressRuler progress={scrollYProgress} />
                    </div>
                </div>

                {/* --- Índice tipográfico (móvil) --- */}
                <div className="mx-auto mt-20 max-w-6xl px-6 pb-24 md:hidden">
                    <Reveal items step={70} distance={28}>
                        {categories.map((c, i) => (
                            <div
                                key={c.id}
                                data-reveal-item
                                className="border-t border-border/50 py-7"
                            >
                                <span className="font-mono text-[11px] tracking-[0.2em] text-muted-foreground/40">
                                    {String(i + 1).padStart(2, '0')}
                                </span>
                                <h3
                                    className="mt-2 font-display text-2xl font-bold leading-none"
                                    style={{ color: c.color }}
                                >
                                    {c.title}
                                </h3>
                                <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground/50">
                                    {c.description}
                                </p>
                                <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2">
                                    {c.techs.map((t, ti) => (
                                        <span key={t.name} className="flex items-center gap-3">
                                            {ti > 0 && <span className="text-border">·</span>}
                                            <span
                                                className="font-mono text-[12px] tracking-[0.06em] text-foreground"
                                                style={{ opacity: 0.4 + (t.level / 100) * 0.6 }}
                                            >
                                                {t.name}
                                            </span>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}
                        <div data-reveal-item className="border-t border-border/50" />
                    </Reveal>
                </div>
            </div>
        </section>
    );
}
