'use client';

import React, { useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';
import { ArrowRight, FileDown, Cpu, Terminal } from 'lucide-react';
import { SOCIALS } from './socials';
import { Magnetic } from '@/components/ui/Magnetic';

// --- Fondo: red neuronal en canvas ---
const NeuralNetworkBackground = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Sin animación si el usuario pide menos movimiento
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        const particleCount = window.innerWidth < 768 ? 30 : 64;
        const connectionDistance = 150;
        const mouseDistance = 200;
        const particleColor = 'rgba(15, 185, 177, 0.65)';

        let width = 0;
        let height = 0;
        let raf = 0;
        const mouse = { x: -9999, y: -9999 };

        class Particle {
            x = Math.random() * width;
            y = Math.random() * height;
            vx = (Math.random() - 0.5) * 0.45;
            vy = (Math.random() - 0.5) * 0.45;
            size = Math.random() * 1.8 + 0.8;

            update() {
                this.x += this.vx;
                this.y += this.vy;
                if (this.x < 0 || this.x > width) this.vx *= -1;
                if (this.y < 0 || this.y > height) this.vy *= -1;

                const dx = mouse.x - this.x;
                const dy = mouse.y - this.y;
                const distance = Math.hypot(dx, dy);
                if (distance < mouseDistance && distance > 0) {
                    const force = (mouseDistance - distance) / mouseDistance;
                    this.x -= (dx / distance) * force * 0.6;
                    this.y -= (dy / distance) * force * 0.6;
                }
            }
        }

        let particles: Particle[] = [];

        const resize = () => {
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width * dpr;
            canvas.height = height * dpr;
            canvas.style.width = width + 'px';
            canvas.style.height = height + 'px';
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            particles = Array.from({ length: particleCount }, () => new Particle());
        };

        const animate = () => {
            ctx.clearRect(0, 0, width, height);

            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];
                p.update();

                ctx.fillStyle = particleColor;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();

                // j = i + 1: cada par se dibuja una sola vez
                for (let j = i + 1; j < particles.length; j++) {
                    const q = particles[j];
                    const distance = Math.hypot(p.x - q.x, p.y - q.y);
                    if (distance < connectionDistance) {
                        // La línea se desvanece con la distancia -> malla más orgánica
                        const alpha = 0.22 * (1 - distance / connectionDistance);
                        ctx.strokeStyle = 'rgba(32, 227, 178, ' + alpha + ')';
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(q.x, q.y);
                        ctx.stroke();
                    }
                }
            }
            raf = requestAnimationFrame(animate);
        };

        const handleMouseMove = (e: MouseEvent) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        };

        resize();
        animate();
        window.addEventListener('resize', resize);
        window.addEventListener('mousemove', handleMouseMove);

        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden />;
};

const fadeUp = {
    hidden: { opacity: 0, y: 24, filter: 'blur(8px)' },
    show: { opacity: 1, y: 0, filter: 'blur(0px)' },
};

const ease = [0.22, 1, 0.36, 1] as const;

const Hero = () => {
    const { scrollY } = useScroll();
    const cardY = useTransform(scrollY, [0, 700], [0, 120]);
    const bgY = useTransform(scrollY, [0, 700], [0, 90]);
    const contentY = useTransform(scrollY, [0, 700], [0, -40]);
    const cueOpacity = useTransform(scrollY, [0, 400], [1, 0]);

    return (
        <section className="relative flex min-h-screen items-center overflow-hidden">
            {/* Capa 1: rejilla técnica */}
            <div className="absolute inset-0 grid-lines [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />

            {/* Capa 2: red neuronal */}
            <motion.div style={{ y: bgY }} className="absolute inset-0 z-0">
                <NeuralNetworkBackground />
            </motion.div>

            {/* Capa 3: auroras a la deriva */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -left-40 top-1/4 h-[36rem] w-[36rem] rounded-full bg-primary/12 blur-[140px] animate-drift" />
                <div className="absolute -right-32 bottom-0 h-[30rem] w-[30rem] rounded-full bg-secondary/10 blur-[130px] animate-drift [animation-delay:-8s]" />
            </div>

            {/* Capa 4: viñeta */}
            <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-b from-background via-transparent to-background" />

            <motion.div
                style={{ y: contentY }}
                className="relative z-20 mx-auto grid w-full max-w-7xl items-center gap-16 px-6 pb-24 pt-36 lg:grid-cols-[1.15fr_0.85fr] lg:gap-20 lg:px-10"
            >
                {/* Columna izquierda */}
                <motion.div initial="hidden" animate="show" transition={{ staggerChildren: 0.11 }}>
                    <motion.div
                        variants={fadeUp}
                        transition={{ duration: 0.7, ease }}
                        className="inline-flex items-center gap-2.5 rounded-full border border-primary/25 bg-primary/[0.06] px-4 py-1.5 backdrop-blur-md"
                    >
                        <span className="relative flex h-1.5 w-1.5">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
                        </span>
                        <span className="eyebrow">Sistemas de IA en producción</span>
                    </motion.div>

                    <motion.h1
                        variants={fadeUp}
                        transition={{ duration: 0.9, ease }}
                        className="mt-8 font-display text-[clamp(3.25rem,9vw,7rem)] leading-[0.88]"
                    >
                        <span className="block font-normal text-foreground/40">Brandon</span>
                        <span className="block bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text font-extrabold text-transparent text-shimmer">
                            Garcia
                        </span>
                    </motion.h1>

                    <motion.div
                        variants={fadeUp}
                        transition={{ duration: 0.7, ease }}
                        className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-[0.7rem] uppercase tracking-[0.25em] text-muted-foreground/70"
                    >
                        <span>Full Stack Developer</span>
                        <span className="text-primary">/</span>
                        <span>AI Engineer</span>
                        <span className="text-primary">/</span>
                        <span>Bolivia</span>
                    </motion.div>

                    <motion.p
                        variants={fadeUp}
                        transition={{ duration: 0.7, ease }}
                        className="mt-8 max-w-xl text-lg leading-relaxed text-muted-foreground/85"
                    >
                        Construyo <span className="text-foreground">agentes de IA</span> que atienden clientes,
                        buscadores que entienden tus documentos y plataformas SaaS que aguantan crecer.
                        Del modelo al deploy.
                    </motion.p>

                    <motion.div
                        variants={fadeUp}
                        transition={{ duration: 0.7, ease }}
                        className="mt-12 flex flex-col gap-4 sm:flex-row sm:items-center"
                    >
                        <Magnetic>
                            <a
                                href="#projects"
                                className="group flex cursor-pointer items-center justify-center gap-2.5 rounded-full bg-primary px-8 py-4 text-sm font-bold tracking-wide text-primary-foreground transition-colors duration-200 hover:bg-secondary"
                            >
                                Ver proyectos
                                <ArrowRight size={17} className="transition-transform duration-200 group-hover:translate-x-1" />
                            </a>
                        </Magnetic>

                        <Magnetic strength={0.22}>
                            <a
                                href="/CV_Brandon Garcia.pdf"
                                download
                                className="group flex cursor-pointer items-center justify-center gap-2.5 rounded-full border border-border px-8 py-4 text-sm font-medium text-foreground/80 backdrop-blur-sm transition-colors duration-200 hover:border-primary/50 hover:bg-primary/5 hover:text-foreground"
                            >
                                <FileDown size={17} />
                                Descargar CV
                            </a>
                        </Magnetic>

                        <div className="flex items-center gap-3">
                            {SOCIALS.map(({ Icon, label, href }) => (
                                <a
                                    key={label}
                                    href={href}
                                    target="_blank"
                                    rel="noreferrer"
                                    aria-label={label}
                                    className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border border-border text-muted-foreground transition-colors duration-200 hover:border-primary/50 hover:text-primary"
                                >
                                    <Icon size={19} />
                                </a>
                            ))}
                        </div>
                    </motion.div>
                </motion.div>

                {/* Columna derecha: retrato editorial */}
                <motion.div
                    initial={{ opacity: 0, y: 40, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 1, delay: 0.25, ease }}
                    style={{ y: cardY }}
                    className="relative mx-auto w-full max-w-sm lg:mx-0 lg:ml-auto"
                >
                    {/* Marco desplazado: profundidad sin sombras genéricas */}
                    <div className="absolute -inset-3 rounded-[2rem] border border-primary/20" />
                    <div className="absolute -inset-3 rounded-[2rem] bg-gradient-to-tr from-primary/20 via-transparent to-secondary/20 opacity-60 blur-2xl" />

                    <motion.div
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
                        className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-card"
                    >
                        <div className="relative aspect-[4/5]">
                            <Image
                                src="/perfil.avif"
                                alt="Retrato de Brandon Garcia"
                                fill
                                priority
                                sizes="(max-width: 1024px) 100vw, 420px"
                                className="object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
                        </div>

                        {/* Ficha técnica al pie del retrato */}
                        <div className="absolute inset-x-0 bottom-0 grid grid-cols-2 divide-x divide-white/10 border-t border-white/10 bg-background/60 backdrop-blur-xl">
                            <div className="flex items-center gap-2.5 p-4">
                                <Cpu size={16} className="shrink-0 text-primary" />
                                <div className="min-w-0">
                                    <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground/60">Enfoque</p>
                                    <p className="truncate text-xs font-medium text-foreground">IA aplicada</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2.5 p-4">
                                <Terminal size={16} className="shrink-0 text-secondary" />
                                <div className="min-w-0">
                                    <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground/60">Stack</p>
                                    <p className="truncate text-xs font-medium text-foreground">Next.js · Python</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            </motion.div>

            {/* Indicador de scroll */}
            <motion.div
                style={{ opacity: cueOpacity }}
                className="absolute bottom-8 left-1/2 z-20 hidden -translate-x-1/2 flex-col items-center gap-3 md:flex"
            >
                <span className="font-mono text-[9px] uppercase tracking-[0.35em] text-muted-foreground/50">Scroll</span>
                <div className="h-10 w-px overflow-hidden bg-border">
                    <div className="h-4 w-px animate-scan bg-primary" />
                </div>
            </motion.div>
        </section>
    );
};

export default Hero;
