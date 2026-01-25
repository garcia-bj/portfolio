'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Github, Linkedin, Twitter } from 'lucide-react';
import { SiWhatsapp } from 'react-icons/si';

const navLinks = [
    { name: 'Inicio', href: '#' },
    { name: 'Stack', href: '#stack' },
    { name: 'Proyectos', href: '#projects' },
    { name: 'Experiencia', href: '#experience' },
];

export function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-background/80 backdrop-blur-md border-b border-border py-4' : 'bg-transparent py-6'
                }`}
        >
            <div className="container mx-auto px-6 max-w-7xl flex items-center justify-between">
                {/* Logo */}
                <a href="#" className="text-2xl font-black tracking-tighter text-foreground">
                    GARCIA<span className="text-primary">.DEV</span>
                </a>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-8">
                    {navLinks.map((link) => (
                        <a
                            key={link.name}
                            href={link.href}
                            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors uppercase tracking-wider"
                        >
                            {link.name}
                        </a>
                    ))}
                    <a
                        className="px-5 py-2 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-bold uppercase tracking-wider hover:bg-primary hover:text-primary-foreground transition-all duration-300"
                    >
                        Hablemos
                    </a>
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden text-white p-2"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Nav Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-[#0E0E10] border-b border-white/5 overflow-hidden"
                    >
                        <div className="flex flex-col p-6 gap-4">
                            {navLinks.map((link) => (
                                <a
                                    key={link.name}
                                    href={link.href}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="text-lg font-medium text-zinc-300 hover:text-brand-400 transition-colors"
                                >
                                    {link.name}
                                </a>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
