'use client';

import { useRef } from 'react';
import { useScroll } from 'framer-motion';
import { DragonScene } from './DragonScene';

/**
 * Banda del dragon. Se ensambla desde el caos conforme bajas y se dispersa al
 * subir, como el resto de animaciones del sitio.
 */
export function Dragon() {
    const trackRef = useRef<HTMLDivElement>(null);

    const { scrollYProgress } = useScroll({
        target: trackRef,
        offset: ['start start', 'end end'],
    });

    return (
        <section className="relative border-t border-border/60">
            <div className="pointer-events-none absolute left-1/2 top-1/2 h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-secondary/[0.06] blur-[140px]" />

            <div ref={trackRef} className="relative h-[200vh]">
                <div className="sticky top-0 flex h-screen flex-col items-center justify-center overflow-hidden">
                    <div className="h-[62vh] w-full max-w-3xl">
                        <DragonScene progress={scrollYProgress} />
                    </div>

                    <p className="mt-4 max-w-md px-6 text-center font-mono text-[10px] uppercase leading-relaxed tracking-[0.22em] text-muted-foreground/50">
                        18.000 puntos · 106 KB · sin esqueleto
                    </p>
                </div>
            </div>
        </section>
    );
}
