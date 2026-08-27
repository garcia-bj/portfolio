'use client';

import { useEffect, useRef, useState } from 'react';
import { animate, stagger, utils } from 'animejs';

/**
 * Campo de puntos de fondo, animado con anime.js. Cubre toda la web.
 *
 * No late en bucle: **reacciona**. La onda nace del borde hacia el que
 * scrolleas o de la celda bajo el cursor. Asi no gasta un solo fotograma
 * mientras la pagina esta quieta, que importa porque el sitio ya carga
 * cuatro lienzos de WebGL.
 *
 * Es tambien la demo de lo unico que hace anime.js y no cubren ni three.js
 * ni Framer Motion: `stagger` con rejilla calcula el retardo de cada punto
 * por su DISTANCIA al origen, no por su indice. De ahi que la onda salga
 * redonda y no en barrido de izquierda a derecha.
 */

const SPACING = 68;        // px entre puntos
const BASE_OPACITY = 0.11; // en reposo son textura, no protagonistas

export function DotField() {
    const rootRef = useRef<HTMLDivElement>(null);
    const [grid, setGrid] = useState({ cols: 0, rows: 0 });

    // La rejilla se dimensiona al viewport
    useEffect(() => {
        const measure = () =>
            setGrid({
                cols: Math.ceil(window.innerWidth / SPACING) + 1,
                rows: Math.ceil(window.innerHeight / SPACING) + 1,
            });
        measure();
        window.addEventListener('resize', measure);
        return () => window.removeEventListener('resize', measure);
    }, []);

    useEffect(() => {
        const root = rootRef.current;
        if (!root || !grid.cols) return;
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        const dots = Array.from(root.querySelectorAll<HTMLElement>('[data-dot]'));
        if (!dots.length) return;
        const { cols, rows } = grid;

        const wave = (from: 'center' | 'first' | 'last' | number, step: number) => {
            // anime.js v4 no cancela lo anterior al animar los mismos targets:
            // sin esto dos ondas solapadas se pelean por el mismo estilo.
            utils.remove(dots);
            animate(dots, {
                scale: [{ to: 2.4, duration: 200 }, { to: 1, duration: 620 }],
                opacity: [{ to: 0.8, duration: 200 }, { to: BASE_OPACITY, duration: 620 }],
                ease: 'out(3)',
                delay: stagger(step, { grid: [cols, rows], from }),
            });
        };

        // Una sola cadencia global: dos ondas de 400 puntos a la vez no aportan
        let cooling = false;
        const cool = (ms: number) => {
            cooling = true;
            window.setTimeout(() => {
                cooling = false;
            }, ms);
        };

        wave('center', 16); // el campo se enciende al entrar
        cool(900);

        // Scroll: la onda nace del borde hacia el que vas
        let lastY = window.scrollY;
        const onScroll = () => {
            const down = window.scrollY > lastY;
            lastY = window.scrollY;
            if (cooling) return;
            cool(620);
            wave(down ? 'last' : 'first', 9);
        };

        // Cursor: `from` acepta el indice de celda, la onda nace justo ahi
        const onPointer = (event: PointerEvent) => {
            if (cooling) return;
            cool(380);
            const col = utils.clamp(Math.floor(event.clientX / SPACING), 0, cols - 1);
            const row = utils.clamp(Math.floor(event.clientY / SPACING), 0, rows - 1);
            wave(row * cols + col, 20);
        };

        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('pointermove', onPointer, { passive: true });
        return () => {
            window.removeEventListener('scroll', onScroll);
            window.removeEventListener('pointermove', onPointer);
            utils.remove(dots);
        };
    }, [grid]);

    return (
        <div
            ref={rootRef}
            aria-hidden
            className="pointer-events-none fixed inset-0 -z-10 grid justify-center overflow-hidden"
            style={{
                gridTemplateColumns: `repeat(${grid.cols}, ${SPACING}px)`,
                gridAutoRows: `${SPACING}px`,
            }}
        >
            {Array.from({ length: grid.cols * grid.rows }, (_, i) => (
                <span
                    key={i}
                    data-dot
                    className="h-[3px] w-[3px] self-center justify-self-center rounded-full bg-primary"
                    style={{ opacity: BASE_OPACITY }}
                />
            ))}
        </div>
    );
}
