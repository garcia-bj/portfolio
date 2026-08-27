'use client';

import { useEffect, useRef } from 'react';
import { animate, createTimeline, stagger, utils } from 'animejs';

/**
 * Rejilla de puntos animada con anime.js. Es su demo insignia, y sirve para ver
 * de un vistazo lo que hace la libreria.
 *
 * Aqui se ven las tres cosas que anime.js hace bien y que ni three.js ni Framer
 * Motion cubren:
 *
 * 1. **`stagger` con rejilla** — el retardo de cada punto se calcula por su
 *    DISTANCIA a un origen, no por su indice. Por eso la onda sale redonda y no
 *    en barrido de izquierda a derecha.
 * 2. **`createTimeline`** — varias animaciones encadenadas con posiciones
 *    relativas, sin contar milisegundos a mano.
 * 3. **Anima el DOM**, no un canvas: son divs de verdad, con su CSS.
 */

const COLS = 22;
const ROWS = 10;
const TOTAL = COLS * ROWS;

export function StaggerGrid({ className = '' }: { className?: string }) {
    const rootRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const root = rootRef.current;
        if (!root) return;
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        const dots = Array.from(root.querySelectorAll<HTMLElement>('[data-dot]'));
        if (!dots.length) return;

        // --- Latido de fondo: una onda que sale del centro cada pocos segundos ---
        const pulse = createTimeline({ loop: true })
            .add(dots, {
                scale: [1, 2.1, 1],
                opacity: [0.25, 0.9, 0.25],
                duration: 1400,
                ease: 'inOut(3)',
                // El retardo depende de la DISTANCIA al centro en la rejilla.
                // Es lo que convierte un barrido en una onda circular.
                delay: stagger(55, { grid: [COLS, ROWS], from: 'center' }),
            })
            .add({}, { duration: 2600 });   // respiro entre latidos

        // --- Onda bajo el cursor: el mismo stagger, otro origen ---
        let cooling = false;
        const ripple = (event: PointerEvent) => {
            if (cooling) return;
            cooling = true;
            window.setTimeout(() => { cooling = false; }, 160);

            const box = root.getBoundingClientRect();
            const col = utils.clamp(
                Math.floor(((event.clientX - box.left) / box.width) * COLS), 0, COLS - 1
            );
            const row = utils.clamp(
                Math.floor(((event.clientY - box.top) / box.height) * ROWS), 0, ROWS - 1
            );

            animate(dots, {
                scale: [{ to: 2.6, duration: 220 }, { to: 1, duration: 620 }],
                opacity: [{ to: 1, duration: 220 }, { to: 0.25, duration: 620 }],
                ease: 'out(3)',
                // `from` acepta el indice de la celda origen: la onda nace ahi
                delay: stagger(28, { grid: [COLS, ROWS], from: row * COLS + col }),
            });
        };

        root.addEventListener('pointermove', ripple);

        return () => {
            root.removeEventListener('pointermove', ripple);
            pulse.revert();
        };
    }, []);

    return (
        <div
            ref={rootRef}
            aria-hidden
            className={`grid ${className}`}
            style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}
        >
            {Array.from({ length: TOTAL }, (_, i) => (
                <div key={i} className="flex items-center justify-center">
                    <span
                        data-dot
                        className="block h-1 w-1 rounded-full bg-primary"
                        style={{ opacity: 0.25 }}
                    />
                </div>
            ))}
        </div>
    );
}
