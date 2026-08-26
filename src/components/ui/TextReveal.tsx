'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform, MotionValue } from 'framer-motion';

function Word({ children, progress, range }: { children: string; progress: MotionValue<number>; range: [number, number] }) {
    const opacity = useTransform(progress, range, [0.12, 1]);
    return (
        <motion.span style={{ opacity }} className="mr-[0.28em] inline-block">
            {children}
        </motion.span>
    );
}

/**
 * Frase que se ilumina palabra por palabra conforme se hace scroll.
 * El progreso está ligado al scroll (scrubbed), no a un temporizador.
 */
export function TextReveal({ text, className = '' }: { text: string; className?: string }) {
    const ref = useRef<HTMLParagraphElement>(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ['start 0.85', 'start 0.3'],
    });

    const words = text.split(' ');

    return (
        <p ref={ref} className={`flex flex-wrap ${className}`}>
            {words.map((word, i) => {
                const start = i / words.length;
                return (
                    <Word key={i} progress={scrollYProgress} range={[start, start + 1 / words.length]}>
                        {word}
                    </Word>
                );
            })}
        </p>
    );
}
