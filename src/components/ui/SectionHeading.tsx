'use client';

import { Reveal } from '@/components/ui/Reveal';

interface SectionHeadingProps {
    eyebrow: string;
    /** Se renderiza en peso ligero y atenuado */
    title: string;
    /** Se renderiza en extrabold con degradado (el énfasis) */
    accent?: string;
    description?: string;
    align?: 'left' | 'center';
    className?: string;
}

/**
 * Cabecera única para todas las secciones: etiqueta mono + titular con
 * revelado palabra por palabra (anime.js, reversible al volver a subir).
 */
export function SectionHeading({
    eyebrow,
    title,
    accent,
    description,
    align = 'left',
    className = '',
}: SectionHeadingProps) {
    const words = `${title}${accent ? ` ${accent}` : ''}`.split(' ');
    const accentFrom = accent ? title.split(' ').length : words.length;

    return (
        <div className={`${align === 'center' ? 'text-center' : ''} ${className}`}>
            <Reveal from="left" distance={24} duration={600}>
                <div className={`flex items-center gap-3 ${align === 'center' ? 'justify-center' : ''}`}>
                    <span className="h-px w-8 bg-primary/60" />
                    <span className="eyebrow">{eyebrow}</span>
                </div>
            </Reveal>

            <Reveal items step={70} distance={36} delay={80}>
                <h2
                    className={`mt-6 font-display text-[clamp(2.5rem,6.5vw,5rem)] leading-[0.92] ${align === 'center' ? 'mx-auto' : ''
                        }`}
                >
                    {words.map((word, i) => (
                        <span
                            key={`${word}-${i}`}
                            data-reveal-item
                            className={`inline-block ${i >= accentFrom
                                ? 'font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary'
                                : 'font-normal text-foreground/50'
                                }`}
                        >
                            {word}
                            {i < words.length - 1 && <span>&nbsp;</span>}
                        </span>
                    ))}
                </h2>
            </Reveal>

            {description && (
                <Reveal from="up" distance={24} delay={220}>
                    <p
                        className={`mt-7 max-w-xl text-base leading-relaxed text-muted-foreground/80 ${align === 'center' ? 'mx-auto' : ''
                            }`}
                    >
                        {description}
                    </p>
                </Reveal>
            )}
        </div>
    );
}
