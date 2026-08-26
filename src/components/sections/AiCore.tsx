'use client';

import { useRef, useState } from 'react';
import { motion, useMotionValueEvent, useScroll } from 'framer-motion';
import { AiCoreScene } from './AiCoreScene';

/** Los tres estados del nucleo. El indice sale del progreso del scroll. */
const STATES = [
    { name: 'Núcleo', note: 'La forma en reposo' },
    { name: 'Coral', note: 'Ramificándose' },
    { name: 'Cresta', note: 'Consolidado' },
];

export function AiCore() {
    const trackRef = useRef<HTMLDivElement>(null);
    const [state, setState] = useState(0);

    const { scrollYProgress } = useScroll({
        target: trackRef,
        offset: ['start start', 'end end'],
    });

    useMotionValueEvent(scrollYProgress, 'change', (p) => {
        setState(Math.min(STATES.length - 1, Math.max(0, Math.round(p * 2))));
    });

    return (
        <section className="relative border-t border-border/60">
            <div className="pointer-events-none absolute left-1/2 top-1/2 h-[38rem] w-[38rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/[0.06] blur-[140px]" />

            <div ref={trackRef} className="relative h-[220vh]">
                <div className="sticky top-0 flex h-screen items-center overflow-hidden">
                    <div className="mx-auto grid w-full max-w-7xl items-center gap-8 px-6 md:grid-cols-[minmax(0,22rem)_1fr] lg:gap-16 lg:px-10">
                        {/* Lectura del estado */}
                        <div className="relative z-10">
                            <div className="flex items-center gap-3">
                                <span className="h-px w-8 bg-primary/60" />
                                <span className="eyebrow">Núcleo</span>
                            </div>

                            <h2 className="mt-6 font-display text-[clamp(2.25rem,4.5vw,3.75rem)] leading-[0.95]">
                                <span className="block font-normal text-foreground/40">10.242</span>
                                <span className="block bg-gradient-to-r from-primary to-secondary bg-clip-text font-extrabold text-transparent">
                                    puntos
                                </span>
                            </h2>

                            <p className="mt-6 max-w-sm text-base leading-relaxed text-muted-foreground/80">
                                Una escultura de tres millones de polígonos, servida en 180 KB.
                                No viajan las caras: solo las posiciones.
                            </p>

                            <div className="mt-9 h-px w-full max-w-[16rem] bg-border" />

                            <div className="mt-6 space-y-2.5">
                                {STATES.map((s, i) => (
                                    <div
                                        key={s.name}
                                        className={`flex items-baseline gap-4 font-mono text-[11px] uppercase tracking-[0.18em] transition-colors duration-500 ${state === i ? 'text-primary' : 'text-muted-foreground/35'
                                            }`}
                                    >
                                        <span>{String(i + 1).padStart(2, '0')}</span>
                                        <span className="min-w-[5rem]">{s.name}</span>
                                        <span className="text-muted-foreground/30">{s.note}</span>
                                    </div>
                                ))}
                            </div>

                            <motion.p
                                className="mt-9 font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground/40"
                            >
                                1 draw call · sin texturas
                            </motion.p>
                        </div>

                        {/* La nube */}
                        <div className="h-[52vh] w-full md:h-[76vh]">
                            <AiCoreScene progress={scrollYProgress} />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
