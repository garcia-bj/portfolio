'use client';

import { useEffect, useRef, useState } from 'react';
import { type MotionValue } from 'framer-motion';

const FRAMES = 40;
const FRAME_W = 900;
const FRAME_H = 1200;

const frameSrc = (i: number) => `/3d/module/module_${String(i).padStart(4, '0')}.webp`;

/**
 * Secuencia 3D renderizada en Blender (`3d/build_stack_module.py`), scrubbeada
 * con el progreso del scroll: el modulo se despieza mientras avanzas.
 *
 * Se pinta en canvas y no en <img> porque cambiar `src` 40 veces provoca
 * parpadeo; con las imagenes ya decodificadas en memoria el scrub es continuo.
 *
 * Los frames vienen OPACOS sobre negro. `mix-blend-mode: screen` hace que el
 * negro desaparezca sobre el fondo oscuro del sitio y las lineas se sumen.
 * Renderizar con alfa duplicaba el peso del WebP.
 */
export function StackModule({ progress, start }: { progress: MotionValue<number>; start: boolean }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const framesRef = useRef<HTMLImageElement[]>([]);
    const currentRef = useRef(-1);
    const [ready, setReady] = useState(false);

    // Precarga diferida: solo cuando la seccion se acerca, no en el primer paint
    useEffect(() => {
        if (!start || framesRef.current.length) return;

        let cancelled = false;
        let loaded = 0;

        const images = Array.from({ length: FRAMES }, (_, i) => {
            const img = new Image();
            img.src = frameSrc(i + 1);
            img.onload = () => {
                loaded += 1;
                if (!cancelled && loaded === FRAMES) setReady(true);
            };
            return img;
        });

        framesRef.current = images;

        return () => {
            cancelled = true;
        };
    }, [start]);

    // Pinta el frame que toca segun el progreso
    useEffect(() => {
        if (!ready) return;

        const draw = (p: number) => {
            const index = Math.min(FRAMES - 1, Math.max(0, Math.round(p * (FRAMES - 1))));
            if (index === currentRef.current) return;

            const canvas = canvasRef.current;
            const img = framesRef.current[index];
            if (!canvas || !img?.complete) return;

            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            currentRef.current = index;
        };

        draw(progress.get());
        const unsubscribe = progress.on('change', draw);
        return unsubscribe;
    }, [ready, progress]);

    return (
        <canvas
            ref={canvasRef}
            width={FRAME_W}
            height={FRAME_H}
            aria-hidden
            className="h-full w-full object-contain mix-blend-screen transition-opacity duration-700"
            style={{ opacity: ready ? 1 : 0 }}
        />
    );
}

export { FRAMES as MODULE_FRAMES };
