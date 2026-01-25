'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { ArrowRight, Github, Linkedin, FileDown, Terminal, Cpu } from 'lucide-react';

// --- Neural Network Canvas Background ---
const NeuralNetworkBackground = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Configuration
        const particleCount = 60; // Adjust for density
        const connectionDistance = 150;
        const mouseDistance = 200;

        // Colors
        const particleColor = 'rgba(15, 185, 177, 0.7)'; // Primary Petrol Green (#0FB9B1)
        const lineColor = 'rgba(32, 227, 178, 0.2)'; // Secondary AI Green (#20E3B2)

        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;

        let particles: Particle[] = [];
        let mouse = { x: 0, y: 0 };

        class Particle {
            x: number;
            y: number;
            vx: number;
            vy: number;
            size: number;

            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.vx = (Math.random() - 0.5) * 0.5; // Slow movement
                this.vy = (Math.random() - 0.5) * 0.5;
                this.size = Math.random() * 2 + 1;
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;

                // Bounce off edges
                if (this.x < 0 || this.x > width) this.vx *= -1;
                if (this.y < 0 || this.y > height) this.vy *= -1;

                // Mouse interaction
                const dx = mouse.x - this.x;
                const dy = mouse.y - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < mouseDistance) {
                    const forceDirectionX = dx / distance;
                    const forceDirectionY = dy / distance;
                    const force = (mouseDistance - distance) / mouseDistance;
                    const directionX = forceDirectionX * force * 0.5;
                    const directionY = forceDirectionY * force * 0.5;

                    // Gently move away from mouse (repulse)
                    this.x -= directionX;
                    this.y -= directionY;
                }
            }

            draw() {
                if (!ctx) return;
                ctx.fillStyle = particleColor;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        const init = () => {
            particles = [];
            for (let i = 0; i < particleCount; i++) {
                particles.push(new Particle());
            }
        };

        const animate = () => {
            if (!ctx) return;
            ctx.clearRect(0, 0, width, height);

            for (let i = 0; i < particles.length; i++) {
                particles[i].update();
                particles[i].draw();

                // Draw connections
                for (let j = i; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < connectionDistance) {
                        ctx.beginPath();
                        ctx.strokeStyle = lineColor;
                        ctx.lineWidth = 1;
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }
            requestAnimationFrame(animate);
        };

        const handleResize = () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
            init();
        };

        const handleMouseMove = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            mouse.x = e.clientX - rect.left;
            mouse.y = e.clientY - rect.top;
        };

        window.addEventListener('resize', handleResize);
        window.addEventListener('mousemove', handleMouseMove);

        init();
        animate();

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    return <canvas ref={canvasRef} className="absolute inset-0 z-0 bg-background" />;
};


// --- Hero Component ---
const Hero = () => {
    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
            {/* Background Layer */}
            <NeuralNetworkBackground />

            {/* Gradient Overlay for Depth */}
            <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-transparent to-background z-10 pointer-events-none" />

            {/* Content Container */}
            <div className="relative z-20 container mx-auto px-4 sm:px-6 lg:px-8 py-20 flex flex-col lg:flex-row items-center gap-12 lg:gap-20">

                {/* Left: Text Content */}
                <div className="flex-1 w-full max-w-2xl text-center lg:text-left">

                    {/* Badge */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10 backdrop-blur-md mb-8"
                    >
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                        </span>
                        <span className="text-primary text-xs font-bold tracking-widest uppercase">
                            Full Stack Developer & IA engineer
                        </span>
                    </motion.div>

                    {/* Headline */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white mb-6 leading-[1.1]">
                            Hola, soy <br className="hidden lg:block" />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                                Brandon Garcia
                            </span>
                        </h1>
                    </motion.div>

                    {/* Subheadline */}
                    <motion.p
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className="text-lg sm:text-xl text-slate-400 mb-10 leading-relaxed max-w-lg mx-auto lg:mx-0"
                    >
                        Ingeniero Full Stack especializado en <span className="text-[#34A5EB] font-medium">Inteligencia Artificial</span> y desarrollo de experiencias digitales de alto rendimiento.
                    </motion.p>

                    {/* CTA Buttons */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.6 }}
                        className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
                    >
                        <a
                            href="#projects"
                            className="group relative px-8 py-4 rounded-xl bg-[#1AB8A6] text-[#0F172A] font-bold text-sm transition-all hover:bg-[#159c8b] hover:shadow-[0_0_20px_rgba(26,184,166,0.4)] flex items-center justify-center gap-2"
                        >
                            Ver Proyectos
                            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </a>

                        <a
                            href="/CV_Brandon Garcia.pdf"
                            download
                            className="group px-8 py-4 rounded-xl border border-slate-700 text-white font-medium text-sm transition-all hover:border-[#1AB8A6]/50 hover:bg-[#1AB8A6]/5 flex items-center justify-center gap-2 backdrop-blur-sm"
                        >
                            <FileDown size={18} />
                            Descargar CV
                        </a>
                    </motion.div>

                    {/* Social Links */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.8 }}
                        className="mt-10 flex items-center justify-center lg:justify-start gap-6"
                    >
                        {[
                            { href: 'https://github.com/garcia-bj', icon: Github },
                        ].map((social, idx) => (
                            <a
                                key={idx}
                                href={social.href}
                                target="_blank"
                                rel="noreferrer"
                                className="text-slate-500 hover:text-[#1AB8A6] transition-colors hover:scale-110 transform duration-200"
                            >
                                <social.icon size={24} />
                            </a>
                        ))}
                    </motion.div>
                </div>

                {/* Right: Visual Element (Constrained) */}
                <div className="flex-1 w-full flex justify-center lg:justify-end relative">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, rotateY: -20 }}
                        animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="relative w-full max-w-md aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl border border-white/10"
                        style={{ perspective: '1000px' }}
                    >
                        {/* Background for Card */}
                        <div className="absolute inset-0 bg-slate-800/50 backdrop-blur-xl z-0" />

                        {/* Interactive glow behind image */}
                        <div className="absolute -inset-1 bg-gradient-to-tr from-[#1AB8A6] to-[#34A5EB] opacity-20 blur-2xl animate-pulse" />

                        <div className="relative z-10 w-full h-full p-2">
                            <div className="relative w-full h-full rounded-2xl overflow-hidden bg-background">
                                <Image
                                    src="/perfil.avif"
                                    alt="Profile Visual"
                                    fill
                                    className="object-cover opacity-90 hover:scale-105 transition-transform duration-700 ease-out"
                                />
                                {/* Gradient Overlay on Image */}
                                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-80" />

                                {/* Floating Tags inside card */}
                                <div className="absolute bottom-6 left-6 right-6 flex flex-col gap-3">
                                    <div className="flex items-center gap-2 p-3 rounded-lg bg-white/5 backdrop-blur-md border border-white/10">
                                        <Cpu size={20} className="text-[#1AB8A6]" />
                                        <div>
                                            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Enfoque</p>
                                            <p className="text-xs text-white font-medium">Inteligencia Artificial</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 p-3 rounded-lg bg-white/5 backdrop-blur-md border border-white/10">
                                        <Terminal size={20} className="text-[#34A5EB]" />
                                        <div>
                                            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Tecnologías</p>
                                            <p className="text-xs text-white font-medium">Next.js & Python</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

            </div>
        </section>
    );
};

export default Hero;
