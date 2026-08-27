'use client';

import { ArrowUp, ArrowUpRight } from 'lucide-react';
import { SectionId } from '@/types';
import { SOCIALS } from '@/components/sections/socials';

// El pie repite la navegacion a proposito: quien llega hasta abajo ya no
// quiere volver a subir a buscarla.
const nav = [
    { label: 'Inicio', href: '#' + SectionId.HERO },
    { label: 'Stack', href: '#' + SectionId.STACK },
    { label: 'Proyectos', href: '#' + SectionId.PROJECTS },
    { label: 'Experiencia', href: '#' + SectionId.EXPERIENCE },
    { label: 'Contacto', href: '#' + SectionId.CONTACT },
];

const direct = [
    { label: 'garciacussi7@gmail.com', href: 'mailto:garciacussi7@gmail.com' },
    { label: '+591 62423272', href: 'https://wa.me/59162423272' },
];

const columnTitle = 'font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground/45';
const columnLink =
    'inline-flex cursor-pointer items-center gap-1.5 text-sm text-muted-foreground/75 transition-colors duration-200 hover:text-primary';

export function Footer() {
    return (
        <footer className="relative overflow-hidden border-t border-border/60 pt-20">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />

            <div className="mx-auto max-w-7xl px-6 lg:px-10">
                <div className="grid gap-12 pb-16 md:grid-cols-[1.4fr_1fr_1fr] md:gap-10">
                    {/* Quien soy */}
                    <div>
                        <p className="font-display text-2xl font-extrabold leading-none text-foreground">
                            Brandon Garcia
                        </p>
                        <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground/70">
                            Full Stack Developer &amp; AI Engineer. Agentes autónomos, RAG y plataformas
                            que aguantan tráfico real.
                        </p>

                        <div className="mt-7 flex items-center gap-2.5">
                            {SOCIALS.map(({ Icon, label, href }) => (
                                <a
                                    key={label}
                                    href={href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={label}
                                    className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-border text-muted-foreground/70 transition-colors duration-200 hover:border-primary/50 hover:text-primary"
                                >
                                    <Icon size={16} />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Navegacion */}
                    <nav>
                        <p className={columnTitle}>Navegación</p>
                        <ul className="mt-5 space-y-3">
                            {nav.map(({ label, href }) => (
                                <li key={label}>
                                    <a href={href} className={columnLink}>
                                        {label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    {/* Contacto directo */}
                    <div>
                        <p className={columnTitle}>Directo</p>
                        <ul className="mt-5 space-y-3">
                            {direct.map(({ label, href }) => (
                                <li key={label}>
                                    <a
                                        href={href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`${columnLink} group`}
                                    >
                                        {label}
                                        <ArrowUpRight
                                            size={13}
                                            className="text-muted-foreground/30 transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary"
                                        />
                                    </a>
                                </li>
                            ))}
                            <li>
                                <a href="/CV_Brandon Garcia.pdf" download className={`${columnLink} group`}>
                                    Descargar CV
                                    <ArrowUpRight
                                        size={13}
                                        className="text-muted-foreground/30 transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary"
                                    />
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Wordmark gigante recortado por el borde inferior */}
                <div className="select-none overflow-hidden" aria-hidden>
                    <span className="block translate-y-[0.16em] bg-gradient-to-b from-foreground/12 to-transparent bg-clip-text font-display text-[clamp(2.5rem,calc(12.5vw_-_0.6rem),9.4rem)] font-extrabold leading-[0.8] text-transparent">
                        garcia.dev
                    </span>
                </div>

                <div className="flex flex-col gap-4 border-t border-border/40 py-7 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground/45 sm:flex-row sm:items-center sm:justify-between">
                    <span>© {new Date().getFullYear()} Brandon Garcia</span>
                    <span className="hidden sm:inline">Cochabamba · Bolivia</span>
                    <button
                        type="button"
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        className="group inline-flex cursor-pointer items-center gap-2 uppercase tracking-[0.2em] transition-colors duration-200 hover:text-primary"
                    >
                        Volver arriba
                        <ArrowUp size={12} className="transition-transform duration-200 group-hover:-translate-y-0.5" />
                    </button>
                </div>
            </div>
        </footer>
    );
}
