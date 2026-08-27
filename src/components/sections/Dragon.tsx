'use client';

import { useRef } from 'react';
import { useScroll } from 'framer-motion';
import { DragonScene } from './DragonScene';
import { DragonSolidScene } from './DragonSolidScene';

/**
 * El mismo dragon con las dos tecnicas, lado a lado.
 *
 * Misma malla de origen, misma paleta, mismo encuadre y mismo movimiento. Lo
 * unico que cambia es que le mandamos al navegador.
 */

const COMPARISON = [
    {
        title: 'Nube de puntos',
        weight: '159 KB',
        notes: ['solo posiciones y color', 'sin caras ni normales', '1 draw call'],
    },
    {
        title: 'Malla sólida',
        weight: '289 KB',
        notes: ['caras, normales y color', '+250 KB de decodificador', 'silueta y sombras'],
    },
];

export function Dragon() {
    const trackRef = useRef<HTMLDivElement>(null);

    const { scrollYProgress } = useScroll({
        target: trackRef,
        offset: ['start start', 'end end'],
    });

    return (
        <section className="relative border-t border-border/60">
            <div className="pointer-events-none absolute left-1/2 top-1/2 h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-secondary/[0.05] blur-[140px]" />

            <div ref={trackRef} className="relative h-[220vh]">
                <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
                    <div className="mx-auto w-full max-w-6xl px-6 lg:px-10">
                        <div className="flex items-center gap-3">
                            <span className="h-px w-8 bg-primary/60" />
                            <span className="eyebrow">Mismo modelo, dos técnicas</span>
                        </div>

                        <div className="mt-8 grid gap-6 md:grid-cols-2">
                            {COMPARISON.map((side, i) => (
                                <div key={side.title} className="flex flex-col">
                                    <div className="h-[42vh] w-full md:h-[52vh]">
                                        {i === 0 ? (
                                            <DragonScene progress={scrollYProgress} />
                                        ) : (
                                            <DragonSolidScene progress={scrollYProgress} />
                                        )}
                                    </div>

                                    <div className="mt-4 border-t border-border/60 pt-4">
                                        <div className="flex items-baseline justify-between gap-4">
                                            <h3 className="font-display text-xl font-bold text-foreground">
                                                {side.title}
                                            </h3>
                                            <span className="font-mono text-sm text-primary">
                                                {side.weight}
                                            </span>
                                        </div>
                                        <ul className="mt-3 space-y-1">
                                            {side.notes.map((note) => (
                                                <li
                                                    key={note}
                                                    className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground/55"
                                                >
                                                    {note}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
