'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { ToolboxScene } from './ToolboxScene';

/**
 * Banda entre Experiencia y Contacto: la caja se abre con el scroll y suelta
 * las herramientas con las que se hizo todo lo de arriba.
 */
export function Toolbox() {
    const trackRef = useRef<HTMLDivElement>(null);

    const { scrollYProgress } = useScroll({
        target: trackRef,
        offset: ['start start', 'end end'],
    });

    // El copy entra cuando la caja ya esta abierta
    const copyOpacity = useTransform(scrollYProgress, [0.28, 0.5], [0, 1]);
    const copyY = useTransform(scrollYProgress, [0.28, 0.5], [24, 0]);

    return (
        <section className="relative border-t border-border/60">
            <div className="pointer-events-none absolute left-1/2 top-1/2 h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-secondary/[0.07] blur-[130px]" />

            <div className="relative z-10 mx-auto max-w-7xl px-6 pt-32 lg:px-10">
                <SectionHeading
                    eyebrow="Herramientas"
                    title="La caja de"
                    accent="herramientas"
                    description="Todo lo que sale de aquí es lo que uso a diario para construir lo de arriba."
                />
            </div>

            {/* Track fijado: la caja se abre mientras dura el scroll */}
            <div ref={trackRef} className="relative h-[240vh]">
                <div className="sticky top-0 flex h-screen flex-col items-center justify-center overflow-hidden">
                    <div className="h-[62vh] w-full max-w-4xl">
                        <ToolboxScene progress={scrollYProgress} />
                    </div>

                    <motion.p
                        style={{ opacity: copyOpacity, y: copyY }}
                        className="mt-2 max-w-md px-6 text-center font-mono text-[11px] uppercase leading-relaxed tracking-[0.22em] text-muted-foreground/60"
                    >
                        14 herramientas · una sola caja
                    </motion.p>
                </div>
            </div>
        </section>
    );
}
