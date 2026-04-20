'use client';

import React, { useState, useEffect, useRef } from 'react';
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

    // Detect scroll position using Framer Motion
    useMotionValueEvent(scrollY, "change", (latest) => {
        setIsScrolled(latest > 50);

        // Detect active section
        const sections = navLinks.map(link => link.sectionId).filter(Boolean);
        let currentSection = '';

        for (const sectionId of sections) {
            const element = document.getElementById(sectionId);
            if (element) {
                const rect = element.getBoundingClientRect();
                if (rect.top <= 150 && rect.bottom >= 150) {
                    currentSection = sectionId;
                    break;
                }
            }
        }

        // If at top of page
        if (latest < 100) {
            currentSection = '';
        }

        setActiveSection(currentSection);
    });

    // Smooth scroll function
    const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
        e.preventDefault();

        if (href === '#') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            const targetId = href.replace('#', '');
            const targetElement = document.getElementById(targetId);

            if (targetElement) {
                const targetPosition = targetElement.offsetTop - 80;
                window.scrollTo({ top: targetPosition, behavior: 'smooth' });
            }
        }

        setIsMobileMenuOpen(false);
    };

    return (
        <motion.nav
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled
                    ? 'bg-background/80 backdrop-blur-xl border-b border-white/5 py-3'
                    : 'bg-transparent py-5'
                }`}
        >
            <div className="container mx-auto px-6 max-w-7xl flex items-center justify-between">
                {/* Logo with hover effect */}
                <motion.a
                    href="#"
                    onClick={(e) => handleNavClick(e, '#')}
                    className="text-2xl font-black tracking-tighter text-foreground group"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    GARCIA<span className="text-primary group-hover:text-secondary transition-colors duration-300">.DEV</span>
                </motion.a>

                {/* Desktop Nav - Pill Style */}
                <div className="hidden md:flex items-center gap-1 relative bg-white/5 backdrop-blur-md rounded-full px-2 py-2 border border-white/10">
                    {navLinks.map((link, idx) => (
                        <motion.a
                            key={link.name}
                            href={link.href}
                            onClick={(e) => handleNavClick(e, link.href)}
                            className={`relative z-10 px-4 py-2 text-sm font-medium uppercase tracking-wider transition-all duration-300 rounded-full ${activeSection === link.sectionId
                                    ? 'text-primary bg-primary/10'
                                    : 'text-muted-foreground hover:text-white hover:bg-white/5'
                                }`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            {link.name}
                            {activeSection === link.sectionId && (
                                <motion.div
                                    layoutId="activeIndicator"
                                    className="absolute inset-0 bg-primary/10 rounded-full -z-10"
                                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                        </motion.a>
                    ))}

                    <motion.a
                        href="#contact"
                        onClick={(e) => handleNavClick(e, '#contact')}
                        className="ml-2 px-5 py-2 rounded-full bg-primary text-primary-foreground text-sm font-bold uppercase tracking-wider"
                        whileHover={{
                            scale: 1.05,
                            boxShadow: '0 0 25px rgba(15, 185, 177, 0.5)'
                        }}
                        whileTap={{ scale: 0.95 }}
                    >
                        Hablemos
                    </motion.a>
                </div>

                {/* Mobile Menu Button */}
                <motion.button
                    className="md:hidden text-white p-2 rounded-lg bg-white/5 border border-white/10"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    whileTap={{ scale: 0.9 }}
                >
                    <AnimatePresence mode="wait">
                        {isMobileMenuOpen ? (
                            <motion.div
                                key="close"
                                initial={{ rotate: -90, opacity: 0 }}
                                animate={{ rotate: 0, opacity: 1 }}
                                exit={{ rotate: 90, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <X size={24} />
                            </motion.div>
                        ) : (
                            <motion.div
                                key="menu"
                                initial={{ rotate: 90, opacity: 0 }}
                                animate={{ rotate: 0, opacity: 1 }}
                                exit={{ rotate: -90, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <Menu size={24} />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.button>
            </div>

            {/* Mobile Nav Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                        className="md:hidden absolute top-full left-0 right-0 bg-background/95 backdrop-blur-xl border-b border-white/5 overflow-hidden"
                    >
                        <div className="flex flex-col p-6 gap-2">
                            {navLinks.map((link, idx) => (
                                <motion.a
                                    key={link.name}
                                    href={link.href}
                                    onClick={(e) => handleNavClick(e, link.href)}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className={`text-lg font-medium py-3 px-4 rounded-lg transition-colors ${activeSection === link.sectionId
                                            ? 'text-primary bg-primary/10'
                                            : 'text-zinc-300 hover:text-primary hover:bg-white/5'
                                        }`}
                                >
                                    {link.name}
                                </motion.a>
                            ))}
                            <motion.a
                                href="#contact"
                                onClick={(e) => handleNavClick(e, '#contact')}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: navLinks.length * 0.1 }}
                                className="mt-4 text-center py-4 rounded-lg bg-primary text-primary-foreground font-bold uppercase tracking-wider"
                            >
                                Hablemos
                            </motion.a>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.nav>
    );
}
