'use client';

import React from 'react';
import { Github, ArrowUp } from 'lucide-react';

export function Footer() {
    const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

    return (
        <footer className="relative overflow-hidden border-t border-border/60 pt-24">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />

            <div className="mx-auto max-w-7xl px-6 lg:px-10">
                <div className="flex flex-col gap-10 pb-20 md:flex-row md:items-end md:justify-between">
                    <p className="max-w-sm text-sm leading-relaxed text-muted-foreground/70">
                        Full Stack Developer &amp; AI Engineer. Agentes autónomos, RAG y plataformas que
                        aguantan tráfico real.
                    </p>

                    <div className="flex items-center gap-3">
                        <a
                            href="https://github.com/garcia-bj"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Perfil de GitHub"
                            className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border border-border text-muted-foreground transition-colors duration-300 hover:border-primary/50 hover:bg-primary/10 hover:text-primary"
                        >
                            <Github size={19} />
                        </a>
                        <button
                            type="button"
                            onClick={scrollToTop}
                            aria-label="Volver arriba"
                            className="group flex h-12 cursor-pointer items-center gap-2.5 rounded-full border border-border px-5 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground transition-colors duration-300 hover:border-primary/50 hover:text-primary"
                        >
                            Volver arriba
                            <ArrowUp size={14} className="transition-transform duration-300 group-hover:-translate-y-0.5" />
                        </button>
                    </div>
                </div>

                {/* Wordmark gigante recortado por el borde inferior */}
                <div
                    className="select-none overflow-hidden"
                    aria-hidden
                >
                    <span className="block translate-y-[0.16em] bg-gradient-to-b from-foreground/12 to-transparent bg-clip-text font-display text-[clamp(4rem,16vw,13rem)] font-extrabold leading-[0.8] text-transparent">
                        garcia.dev
                    </span>
                </div>

                <div className="flex flex-col gap-3 border-t border-border/40 py-8 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground/50 sm:flex-row sm:items-center sm:justify-between">
                    <span>© {new Date().getFullYear()} Brandon Garcia</span>
                    <span>Cochabamba · Bolivia</span>
                </div>
            </div>
        </footer>
    );
}
