'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, MotionValue } from 'framer-motion';
import { Github, ArrowUpRight } from 'lucide-react';
import { PROJECTS } from './constants';
import SpotlightCard from './SpotlightCard';
import { SectionHeading } from '@/components/ui/SectionHeading';

type Project = (typeof PROJECTS)[number];

// El apilado sticky solo tiene sentido si la tarjeta cabe en la pantalla
function useIsDesktop() {
    const [isDesktop, setIsDesktop] = useState(true);
    useEffect(() => {
        const mq = window.matchMedia('(min-width: 768px)');
        const sync = () => setIsDesktop(mq.matches);
        sync();
        mq.addEventListener('change', sync);
        return () => mq.removeEventListener('change', sync);
    }, []);
    return isDesktop;
}

function ProjectCard({
    project,
    index,
    total,
    progress,
}: {
    project: Project;
    index: number;
    total: number;
    progress: MotionValue<number>;
}) {
    const isDesktop = useIsDesktop();
    // Cada tarjeta se encoge un poco cuando la siguiente se le monta encima
    const targetScale = 1 - (total - index) * 0.04;
    const scale = useTransform(progress, [index / total, 1], [1, isDesktop ? targetScale : 1]);
    const flip = index % 2 === 1;

    return (
        <div className="flex items-center justify-center px-6 py-6 md:sticky md:top-0 md:h-screen md:py-0 lg:px-10">
            <motion.div
                style={{ scale, top: isDesktop ? `${index * 26}px` : 0 }}
                className="relative w-full max-w-6xl origin-top"
            >
                {/* El grid va dentro: SpotlightCard envuelve a sus hijos en un div propio */}
                <SpotlightCard className="rounded-3xl border-white/10 bg-card/95 backdrop-blur-xl">
                    <div className="grid md:grid-cols-2">
                    {/* Imagen */}
                    <div className={`relative min-h-[220px] overflow-hidden ${flip ? 'md:order-2' : ''}`}>
                        <img
                            src={project.image}
                            alt={project.title}
                            loading="lazy"
                            className="absolute inset-0 h-full w-full scale-105 object-cover opacity-70 grayscale transition-all duration-700 hover:scale-110 hover:opacity-100 hover:grayscale-0"
                        />
                        <div
                            className={`pointer-events-none absolute inset-0 bg-gradient-to-t from-card via-card/30 to-transparent md:from-transparent md:to-card ${flip ? 'md:bg-gradient-to-l' : 'md:bg-gradient-to-r'
                                }`}
                        />
                        <span className="absolute left-6 top-6 font-display text-6xl font-extrabold leading-none text-foreground/15">
                            {String(index + 1).padStart(2, '0')}
                        </span>
                    </div>

                    {/* Contenido */}
                    <div className={`flex flex-col p-7 md:p-10 ${flip ? 'md:order-1' : ''}`}>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-[10px] uppercase tracking-[0.25em]">
                            <span className="text-primary">{project.category}</span>
                            <span className="text-border">|</span>
                            <span className="text-muted-foreground/60">{project.role}</span>
                        </div>

                        <h3 className="mt-4 font-display text-3xl font-bold leading-[1.05] text-foreground md:text-4xl">
                            {project.title}
                        </h3>

                        <p className="mt-4 text-sm leading-relaxed text-muted-foreground/85">
                            {project.description}
                        </p>

                        {project.details && (
                            <ul className="mt-6 space-y-2.5 border-l border-border/70 pl-5">
                                {project.details.map((detail) => (
                                    <li key={detail} className="text-xs leading-relaxed text-muted-foreground/65">
                                        {detail}
                                    </li>
                                ))}
                            </ul>
                        )}

                        {project.tags && (
                            <div className="mt-6 flex flex-wrap gap-2">
                                {project.tags.map((tag) => (
                                    <span
                                        key={tag}
                                        className="rounded-full border border-border/70 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground/70"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}

                        <div className="mt-auto flex items-center justify-between gap-4 pt-8">
                            <a
                                href={project.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group inline-flex cursor-pointer items-center gap-2 border-b border-primary/40 pb-1 font-mono text-[11px] uppercase tracking-[0.2em] text-primary transition-colors duration-200 hover:border-primary hover:text-secondary"
                            >
                                Ver proyecto
                                <ArrowUpRight
                                    size={14}
                                    className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                                />
                            </a>
                            {project.github && project.github !== '#' && (
                                <a
                                    href={project.github}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={`Repositorio de ${project.title}`}
                                    className="cursor-pointer text-muted-foreground/50 transition-colors duration-200 hover:text-foreground"
                                >
                                    <Github size={18} />
                                </a>
                            )}
                        </div>
                    </div>
                    </div>
                </SpotlightCard>
            </motion.div>
        </div>
    );
}

const Projects = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ['start start', 'end end'],
    });

    return (
        <section id="projects" className="relative py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-10">
                <SectionHeading
                    eyebrow="Portafolio"
                    title="Proyectos"
                    accent="destacados"
                    description="Infraestructuras complejas y modelos de IA generativa puestos a trabajar para negocios reales."
                />
            </div>

            {/* Tarjetas apiladas: cada una se queda fija y la siguiente se le monta encima */}
            <div ref={containerRef} className="relative mt-24">
                {PROJECTS.map((project, i) => (
                    <ProjectCard
                        key={project.id}
                        project={project}
                        index={i}
                        total={PROJECTS.length}
                        progress={scrollYProgress}
                    />
                ))}
            </div>
        </section>
    );
};

export default Projects;
