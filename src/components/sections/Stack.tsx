'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValueEvent, useScroll, useTransform } from 'framer-motion';
import type { MotionValue } from 'framer-motion';
import { animate, stagger } from 'animejs';
import { StackModule3D } from './StackModule3D';
import {
    TbDeviceDesktop, TbServerBolt, TbDatabase, TbBrain,
    TbCloud, TbTerminal2
} from 'react-icons/tb';
import { SiMeta, SiWhatsapp, SiInstagram, SiMessenger, SiMinio, SiRust } from 'react-icons/si';
import type { IconType } from 'react-icons';
import { Cpu, Bot, Terminal, Waypoints, Sparkles, Braces } from 'lucide-react';
import { SectionId } from '@/types';
import { SectionHeading } from '@/components/ui/SectionHeading';

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
        color: "#22D3EE",
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
        color: "#5B8DEF",
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
        color: "#A8E063",
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
        color: "#FFD93D",
        techs: [
            { name: "Docker", level: 90 },
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
        color: "#FF9F43",
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
        color: "#FF7A6B",
        techs: [
            { name: "Git", level: 95 },
            { name: "Linux", level: 85 },
            { name: "VSCode", level: 95 },
            { name: "n8n", level: 90 },
        ]
    }
];

/** Regla de progreso: el marcador recorre los módulos, como el film-strip de anime.js */
function ProgressRuler({
    progress,
    color,
}: {
    progress: ReturnType<typeof useScroll>['scrollYProgress'];
    color: string;
}) {
    const left = useTransform(progress, [0, 1], ['0%', '100%']);
    return (
        <div className="pointer-events-none absolute bottom-10 right-6 hidden w-72 lg:right-10 lg:block">
            <div className="relative flex h-10 items-center justify-between overflow-hidden rounded-md border border-border/60 bg-card/40 px-3 backdrop-blur-sm">
                {Array.from({ length: 44 }, (_, i) => (
                    <span key={i} className="h-3 w-px bg-muted-foreground/25" />
                ))}
                <motion.span
                    style={{ left, backgroundColor: color }}
                    className="absolute top-1/2 h-5 w-[3px] -translate-x-1/2 -translate-y-1/2 rounded-full transition-colors duration-500"
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
    "Supabase", "Google Cloud", "OpenAI API", "Claude AI",
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
function ModuleTechs({ category, align = 'left' }: { category: Category; align?: 'left' | 'right' }) {
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
        <div
            ref={ref}
            className={`mt-7 flex flex-wrap items-start gap-x-5 gap-y-6 ${align === 'right' ? 'justify-end' : ''}`}
        >
            {category.techs.map((t) => (
                <div
                    key={t.name}
                    data-chip
                    className={`flex w-[4.6rem] flex-col gap-2 ${align === 'right' ? 'items-end text-right' : 'items-start'}`}
                >
                    <TechIcon name={t.name} className="h-7 w-7" />
                    <span className="font-mono text-[9px] uppercase leading-tight tracking-[0.1em] text-muted-foreground/70">
                        {t.name}
                    </span>
                </div>
            ))}
        </div>
    );
}

/**
 * Recorrido lateral del modulo: derecha, izquierda, y dos posiciones
 * intermedias. El texto siempre va al lado contrario, asi nunca se pisan.
 */
const MODULE_COLORS = categories.map((c) => c.color);

// Recorrido lateral. Antes era la mitad y el modulo parecia temblar en el
// sitio en vez de cruzar la pantalla.
const DRIFT = [1.0, -1.0, 0.52, -0.52];

/** Transicion suave entre dos umbrales, para el relevo de textos. */
const smoothstep = (edge0: number, edge1: number, x: number) => {
    const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
    return t * t * (3 - 2 * t);
};

// El relevo arranca antes y con mas recorrido: con 48px de viaje el texto
// entrante parecia aparecer ahi mismo en vez de venir de abajo.
const FADE_START = 0.52;
const TRAVEL_IN = 190;    // px que sube el entrante
const TRAVEL_OUT = 130;   // px que sigue subiendo el saliente

function ModuleCopy({
    category,
    index,
    total,
    align,
}: {
    category: Category;
    index: number;
    total: number;
    align: 'left' | 'right';
}) {
    return (
        <div className={align === 'right' ? 'text-right' : ''}>
            <span className="font-mono text-[11px] tracking-[0.3em] text-muted-foreground/50">
                {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
            </span>

            <h3
                className="mt-5 break-words font-display text-[clamp(1.75rem,3.4vw,3rem)] font-extrabold leading-[0.95]"
                style={{ color: category.color }}
            >
                {category.title}
            </h3>

            <p className="mt-5 text-base leading-relaxed text-muted-foreground/80">
                {category.description}.
            </p>

            <div className={`mt-8 h-px w-full max-w-[18rem] bg-border ${align === 'right' ? 'ml-auto' : ''}`} />

            <ModuleTechs category={category} align={align} />
        </div>
    );
}

/**
 * Un bloque de copy por categoria. Todos existen siempre; cada uno calcula su
 * propia opacidad desde el progreso continuo.
 *
 * Antes se renderizaban solo dos (el actual y el siguiente) con `key` por id.
 * Al cambiar de etapa React remontaba el bloque entrante y su MotionValue
 * llegaba **con un fotograma de retraso**: el texto asomaba a opacidad plena y
 * desaparecia de golpe. Con todos montados no hay remontaje ni valor obsoleto.
 */
function ModuleSlot({
    raw,
    index,
    category,
    total,
}: {
    raw: MotionValue<number>;
    index: number;
    category: Category;
    total: number;
}) {
    const align: 'left' | 'right' = DRIFT[index % DRIFT.length] > 0 ? 'left' : 'right';

    const opacity = useTransform(raw, (v: number) => {
        const d = v - index;
        if (d <= -1 || d >= 1) return 0;
        // Entrando: la opacidad arranca despues que el movimiento, asi el texto
        // ya viene subiendo cuando empieza a verse.
        if (d < 0) return smoothstep(FADE_START - 0.84, 0, d);
        return 1 - smoothstep(FADE_START, 0.94, d);
    });

    const y = useTransform(raw, (v: number) => {
        const d = v - index;
        if (d < 0) return (1 - smoothstep(FADE_START - 1, 0, d)) * TRAVEL_IN;
        return -smoothstep(FADE_START, 1, d) * TRAVEL_OUT;
    });

    return (
        <motion.div
            style={{ opacity, y }}
            className={`pointer-events-none absolute inset-x-0 top-0 max-w-[22rem] md:max-w-lg ${align === 'right' ? 'ml-auto' : ''
                }`}
        >
            <ModuleCopy category={category} index={index} total={total} align={align} />
        </motion.div>
    );
}

export function TechStack() {
    const trackRef = useRef<HTMLDivElement>(null);
    const [active, setActive] = useState(0);

    // Un modulo por categoria: el 3D se queda fijo en pantalla y el texto rota
    const { scrollYProgress } = useScroll({
        target: trackRef,
        offset: ['start start', 'end end'],
    });

    useMotionValueEvent(scrollYProgress, 'change', (p) => {
        const i = Math.min(categories.length - 1, Math.max(0, Math.floor(p * categories.length)));
        setActive(i);
    });

    const current = categories[active];

    // Relevo de textos ligado al scroll: el saliente se va mientras el entrante
    // ya esta llegando, en vez de cambiar de golpe al saltar de indice.
    const raw = useTransform(scrollYProgress, (p) => p * categories.length);

    // Deriva continua: el cilindro empieza a cruzar en el mismo instante en que
    // el texto arranca su relevo, y llega a la vez que el titular nuevo.
    const drift = useTransform(raw, (v) => {
        const i = Math.floor(v);
        const f = smoothstep(FADE_START, 1, v - i);
        const from = DRIFT[i % DRIFT.length];
        const to = DRIFT[(i + 1) % DRIFT.length];
        return from + (to - from) * f;
    });


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

                {/* Modulos fijados. Ya no es `hidden md:block`: el 3D pesa lo mismo
                    en cualquier pantalla porque se dibuja, no se descarga. */}
                <div
                    ref={trackRef}
                    className="relative mt-8"
                    style={{ height: `${categories.length * 62}vh` }}
                >
                    <div className="sticky top-0 h-screen overflow-hidden">
                        <div className="pointer-events-none absolute left-0 top-1/4 h-96 w-96 rounded-full bg-primary/[0.07] blur-[120px]" />
                        <div className="pointer-events-none absolute bottom-1/4 right-0 h-96 w-96 rounded-full bg-secondary/[0.05] blur-[120px]" />

                        {/* El modulo ocupa todo el ancho y deriva de lado a lado */}
                        <div className="absolute inset-0">
                            <StackModule3D
                                progress={scrollYProgress}
                                colors={MODULE_COLORS}
                                drift={drift}
                                active={active}
                            />
                        </div>

                        {/* Velo bajo el texto: en movil el 3D pasa por detras */}
                        <div
                            className={`pointer-events-none absolute inset-y-0 w-full max-w-xl bg-gradient-to-r from-background via-background/85 to-transparent transition-all duration-500 md:max-w-2xl ${DRIFT[active % DRIFT.length] > 0 ? 'left-0' : 'right-0 rotate-180'
                                }`}
                        />

                        <div className="relative z-10 flex h-full items-center">
                            <div className="mx-auto w-full max-w-7xl px-6 lg:px-10">
                                <div className="relative h-[26rem] md:h-[24rem]">
                                    {categories.map((category, i) => (
                                        <ModuleSlot
                                            key={category.id}
                                            raw={raw}
                                            index={i}
                                            category={category}
                                            total={categories.length}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                        <ProgressRuler progress={scrollYProgress} color={current.color} />
                    </div>
                </div>
            </div>
        </section>
    );
}
