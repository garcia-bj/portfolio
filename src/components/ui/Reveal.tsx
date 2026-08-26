'use client';

import { useEffect, useRef } from 'react';
import { animate, onScroll, stagger } from 'animejs';

type From = 'up' | 'down' | 'left' | 'right' | 'scale';

interface RevealProps {
    children: React.ReactNode;
    /** Dirección desde la que entra */
    from?: From;
    /** Distancia del desplazamiento en px */
    distance?: number;
    /** Retardo inicial en ms */
    delay?: number;
    duration?: number;
    /**
     * Si es true, en vez de animar el contenedor anima sus hijos marcados con
     * `data-reveal-item`, escalonados: se van formando uno tras otro.
     */
    items?: boolean;
    /** Separación entre hijos en ms */
    step?: number;
    className?: string;
    /** Etiqueta del contenedor (por defecto div) */
    as?: 'div' | 'section' | 'article' | 'li' | 'header';
}

function offsets(from: From, distance: number): Record<string, number[]> {
    switch (from) {
        case 'left':
            return { x: [-distance, 0], rotate: [-1.5, 0] };
        case 'right':
            return { x: [distance, 0], rotate: [1.5, 0] };
        case 'down':
            return { y: [-distance, 0] };
        case 'scale':
            return { scale: [0.6, 1], y: [distance * 0.4, 0], rotate: [-6, 0] };
        default:
            return { y: [distance, 0] };
    }
}

/**
 * Revelado al hacer scroll con anime.js.
 *
 * `sync: 'play reverse play reverse'` = entra al bajar, se deshace al salir por
 * arriba y vuelve a entrar al subir. No es un `once`: la transición es
 * reversible en ambos sentidos.
 */
export function Reveal({
    children,
    from = 'up',
    distance = 48,
    delay = 0,
    duration = 750,
    items = false,
    step = 60,
    className = '',
    as: Tag = 'div',
}: RevealProps) {
    const ref = useRef<HTMLElement>(null);

    useEffect(() => {
        const root = ref.current;
        if (!root) return;
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        const targets = items
            ? Array.from(root.querySelectorAll<HTMLElement>('[data-reveal-item]'))
            : [root];
        if (!targets.length) return;

        const animation = animate(targets, {
            opacity: [0, 1],
            ...offsets(from, distance),
            duration,
            delay: items ? stagger(step, { start: delay }) : delay,
            ease: 'out(3)',
            // `sync` bidireccional: entra al bajar y se deshace al subir.
            // Sin `target`: anime.js lo deduce de la propia animación.
            autoplay: onScroll({
                // Entra un poco antes de ser visible del todo; se deshace solo
                // cuando sale de verdad por arriba (`leave` por defecto).
                enter: 'bottom-=80 top',
                sync: 'play reverse play reverse',
            }),
        });

        return () => {
            animation.revert();
        };
    }, [from, distance, delay, duration, items, step]);

    return (
        // @ts-expect-error - ref polimórfico sobre un set cerrado de etiquetas
        <Tag ref={ref} className={className}>
            {children}
        </Tag>
    );
}
