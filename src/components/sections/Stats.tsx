'use client';

import { useEffect, useRef } from 'react';
import { animate, onScroll } from 'animejs';
import { TextReveal } from '@/components/ui/TextReveal';
import { Reveal } from '@/components/ui/Reveal';

// La nota es lo que hace creible la cifra: un numero solo no dice nada
const stats = [
    { value: 3, suffix: '+', label: 'Años construyendo', note: 'Web, IA y automatización' },
    { value: 15, suffix: '+', label: 'Proyectos entregados', note: 'En producción, con usuarios' },
    { value: 10, suffix: '+', label: 'Integraciones de IA', note: 'RAG, agentes y visión' },
    { value: 3, suffix: '', label: 'Canales conectados', note: 'WhatsApp · Instagram · Messenger' },
];

/**
 * Cuenta escrita directo al DOM (sin estado de React): la anima anime.js y el
 * observador de scroll la rebobina al salir, asi vuelve a contar al regresar.
 */
function Counter({ value, suffix }: { value: number; suffix: string }) {
    const ref = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const print = (n: number) => {
            el.textContent = `${Math.round(n)}${suffix}`;
        };

        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            print(value);
            return;
        }

        const counter = { n: 0 };
        const animation = animate(counter, {
            n: value,
            duration: 1800,
            ease: 'out(3)',
            onUpdate: () => print(counter.n),
            autoplay: onScroll({
                enter: 'bottom-=80 top',
                sync: 'play reverse play reverse',
            }),
        });

        return () => {
            animation.revert();
        };
    }, [value, suffix]);

    // tabular-nums evita que el ancho baile mientras cuenta
    return (
        <span ref={ref} className="tabular-nums">
            0{suffix}
        </span>
    );
}

export function Stats() {
    return (
        <section className="relative border-y border-border/60 py-28">
            <div className="mx-auto max-w-7xl px-6 lg:px-10">
                {/* Declaración que se ilumina palabra por palabra al hacer scroll */}
                <TextReveal
                    text="Una IA no se mide en la demo. Se mide cuando un cliente escribe a las tres de la mañana y recibe una respuesta que resuelve."
                    className="mb-24 max-w-4xl font-display text-[clamp(1.75rem,4vw,3.25rem)] font-semibold leading-[1.15] text-foreground"
                />

                <Reveal
                    items
                    step={80}
                    distance={32}
                    className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-border/60 md:grid-cols-4"
                >
                    {stats.map((s) => (
                        <div
                            key={s.label}
                            data-reveal-item
                            className="group bg-background p-8 transition-colors duration-300 hover:bg-card/60"
                        >
                            <div className="font-display text-5xl font-extrabold text-foreground transition-colors duration-300 group-hover:text-primary md:text-6xl">
                                <Counter value={s.value} suffix={s.suffix} />
                            </div>
                            <p className="mt-4 font-mono text-[10px] uppercase leading-relaxed tracking-[0.2em] text-muted-foreground/70">
                                {s.label}
                            </p>
                            <p className="mt-2 text-xs leading-relaxed text-muted-foreground/45">
                                {s.note}
                            </p>
                        </div>
                    ))}
                </Reveal>
            </div>
        </section>
    );
}
