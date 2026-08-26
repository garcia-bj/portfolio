'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import { Menu, X } from 'lucide-react';

const navLinks = [
    { name: 'Inicio', href: '#', sectionId: '' },
    { name: 'Stack', href: '#stack', sectionId: 'stack' },
    { name: 'Proyectos', href: '#projects', sectionId: 'projects' },
    { name: 'Experiencia', href: '#experience', sectionId: 'experience' },
];

export function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [activeSection, setActiveSection] = useState('');
    const { scrollY } = useScroll();

    useMotionValueEvent(scrollY, 'change', (latest) => {
        setIsScrolled(latest > 50);

        let currentSection = '';
        for (const link of navLinks) {
            if (!link.sectionId) continue;
            const element = document.getElementById(link.sectionId);
            if (element) {
                const rect = element.getBoundingClientRect();
                if (rect.top <= 150 && rect.bottom >= 150) {
                    currentSection = link.sectionId;
                    break;
                }
            }
        }
        if (latest < 100) currentSection = '';

        setActiveSection(currentSection);
    });

    const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
        e.preventDefault();

        if (href === '#') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            const targetElement = document.getElementById(href.replace('#', ''));
            if (targetElement) {
                window.scrollTo({ top: targetElement.offsetTop - 80, behavior: 'smooth' });
            }
        }

        setIsMobileMenuOpen(false);
    };

    return (
        <motion.header
            initial={{ y: -80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-x-4 top-4 z-50 md:inset-x-6 md:top-6"
        >
            <nav
                className={`mx-auto flex max-w-7xl items-center justify-between rounded-full px-5 transition-all duration-500 md:px-6 ${isScrolled
                    ? 'border border-border/70 bg-background/70 py-2.5 backdrop-blur-xl'
                    : 'border border-transparent py-4'
                    }`}
            >
                <a
                    href="#"
                    onClick={(e) => handleNavClick(e, '#')}
                    className="group cursor-pointer font-display text-2xl font-semibold leading-none text-foreground"
                >
                    garcia
                    <span className="font-extrabold text-primary transition-colors duration-300 group-hover:text-secondary">
                        .dev
                    </span>
                </a>

                {/* Navegación de escritorio */}
                <div className="hidden items-center gap-1 md:flex">
                    {navLinks.map((link) => (
                        <a
                            key={link.name}
                            href={link.href}
                            onClick={(e) => handleNavClick(e, link.href)}
                            className={`relative cursor-pointer rounded-full px-4 py-2 font-mono text-[11px] uppercase tracking-[0.15em] transition-colors duration-200 ${activeSection === link.sectionId
                                ? 'text-primary'
                                : 'text-muted-foreground/70 hover:text-foreground'
                                }`}
                        >
                            {activeSection === link.sectionId && (
                                <motion.span
                                    layoutId="navActive"
                                    className="absolute inset-0 -z-10 rounded-full border border-primary/25 bg-primary/10"
                                    transition={{ type: 'spring', bounce: 0.18, duration: 0.5 }}
                                />
                            )}
                            {link.name}
                        </a>
                    ))}

                    <a
                        href="#contact"
                        onClick={(e) => handleNavClick(e, '#contact')}
                        className="ml-3 cursor-pointer rounded-full bg-primary px-5 py-2.5 font-mono text-[11px] font-bold uppercase tracking-[0.15em] text-primary-foreground transition-colors duration-200 hover:bg-secondary"
                    >
                        Hablemos
                    </a>
                </div>

                {/* Botón móvil */}
                <button
                    type="button"
                    aria-label={isMobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
                    aria-expanded={isMobileMenuOpen}
                    className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-border text-foreground md:hidden"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
                </button>
            </nav>

            {/* Menú móvil */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                        className="mt-3 overflow-hidden rounded-3xl border border-border/70 bg-background/95 backdrop-blur-xl md:hidden"
                    >
                        <div className="flex flex-col p-4">
                            {navLinks.map((link, idx) => (
                                <motion.a
                                    key={link.name}
                                    href={link.href}
                                    onClick={(e) => handleNavClick(e, link.href)}
                                    initial={{ opacity: 0, x: -12 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.06 }}
                                    className={`cursor-pointer rounded-xl px-4 py-3.5 font-mono text-xs uppercase tracking-[0.2em] transition-colors ${activeSection === link.sectionId
                                        ? 'bg-primary/10 text-primary'
                                        : 'text-muted-foreground/80 hover:bg-white/5 hover:text-foreground'
                                        }`}
                                >
                                    {link.name}
                                </motion.a>
                            ))}
                            <a
                                href="#contact"
                                onClick={(e) => handleNavClick(e, '#contact')}
                                className="mt-3 cursor-pointer rounded-xl bg-primary py-4 text-center font-mono text-xs font-bold uppercase tracking-[0.2em] text-primary-foreground"
                            >
                                Hablemos
                            </a>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.header>
    );
}
