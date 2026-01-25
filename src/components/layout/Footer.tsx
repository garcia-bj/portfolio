'use client';

import React from 'react';
import { Github, Linkedin, Twitter, ArrowUp } from 'lucide-react';
import { SiWhatsapp } from 'react-icons/si';

export function Footer() {
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <footer className="bg-background border-t border-border pt-20 pb-10 relative overflow-hidden">
            {/* Ambient Background */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent blur-sm" />

            <div className="container mx-auto px-6 max-w-7xl relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-center gap-10 mb-16">
                    {/* Brand */}
                    <div className="text-center md:text-left">
                        <h2 className="text-3xl font-black tracking-tighter text-foreground mb-2">
                            GARCIA<span className="text-primary">.DEV</span>
                        </h2>
                        <p className="text-zinc-500 max-w-xs">
                            Desarrollador Full Stack con experiencia en IA y desarrollo de experiencias digitales de alto rendimiento.
                        </p>
                    </div>

                    {/* Socials */}
                    <div className="flex gap-6">
                        <a href="https://github.com/garcia-bj" target="_blank" rel="noopener noreferrer" className="p-3 rounded-full bg-primary/5 text-foreground hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover:-translate-y-1">
                            <Github size={20} />
                        </a>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-white/5 gap-4">
                    <p className="text-zinc-600 text-sm">
                        © {new Date().getFullYear()} Garcia Dev. Todos los derechos reservados.
                    </p>

                    <button
                        onClick={scrollToTop}
                        className="group flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-brand-400 transition-colors"
                    >
                        Volver arriba
                        <span className="p-1 rounded bg-white/5 group-hover:bg-brand-500 group-hover:text-white transition-colors">
                            <ArrowUp size={14} />
                        </span>
                    </button>
                </div>
            </div>
        </footer>
    );
}
