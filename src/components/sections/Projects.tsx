
import React from 'react';
import { ExternalLink, Github, Terminal, ArrowRight } from 'lucide-react';
import { PROJECTS } from './constants';
import SpotlightCard from './SpotlightCard';
import Reveal from './Reveal';

const Projects = () => (
    <section id="projects" className="py-40 px-8 bg-background">
        <div className="max-w-7xl mx-auto">
            <Reveal>
                <div className="mb-24 text-left">
                    <h2 className="text-5xl md:text-6xl font-black tracking-tighter mb-4 uppercase text-white leading-none">
                        Proyectos <span className="text-white/20">Destacados</span>
                    </h2>
                    <p className="text-white/40 text-lg max-w-2xl font-medium">
                        Proyectos que demuestran la capacidad técnica para orquestar infraestructuras complejas y modelos de IA generativa.
                    </p>
                </div>
            </Reveal>

            <div className="grid md:grid-cols-3 gap-6">
                {PROJECTS.map((p, i) => (
                    <Reveal key={p.id} delay={i * 0.1}>
                        <SpotlightCard className="flex flex-col h-full group bg-card border-white/5 hover:border-primary/30 transition-all duration-700">
                            <div className="aspect-[16/11] overflow-hidden relative border-b border-white/5">
                                <img
                                    src={p.image}
                                    className="w-full h-full object-cover grayscale opacity-50 transition-all duration-1000 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-110"
                                    alt={p.title}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-80" />
                                <div className="absolute top-6 left-6 px-4 py-1.5 bg-background/80 backdrop-blur-md border border-white/10 text-[8px] font-black uppercase tracking-widest text-primary">
                                    {p.category}
                                </div>
                            </div>
                            <div className="p-10 flex flex-col flex-1">
                                <div className="flex justify-between items-center mb-6">
                                    <div className="flex flex-col">
                                        <div className="flex gap-4 items-center mb-1">
                                            <Terminal size={12} className="text-secondary" />
                                            <span className="text-[10px] font-bold text-secondary uppercase tracking-wider">{p.role}</span>
                                        </div>
                                    </div>
                                    <a href={p.link} target="_blank" rel="noopener noreferrer">
                                        <ExternalLink size={16} className="text-muted-foreground hover:text-primary cursor-pointer transition-colors" />
                                    </a>
                                </div>
                                <h3 className="text-xl font-black mb-4 tracking-tight uppercase text-white group-hover:text-primary transition-colors leading-tight">
                                    {p.title}
                                </h3>
                                <p className="text-white/60 text-xs leading-relaxed mb-6 font-medium">
                                    {p.description}
                                </p>

                                {p.details && (
                                    <ul className="space-y-3 mb-10 flex-1">
                                        {p.details.map((detail, idx) => (
                                            <li key={idx} className="flex gap-3 text-[10px] leading-relaxed text-white/40 group-hover:text-white/60 transition-colors">
                                                <span className="text-primary mt-1 shrink-0">▹</span>
                                                {detail}
                                            </li>
                                        ))}
                                    </ul>
                                )}

                                <div className="flex justify-between items-center pt-8 border-t border-white/5">
                                    <a href={p.link} target="_blank" rel="noopener noreferrer" className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30 group-hover:text-white transition-all cursor-pointer flex items-center gap-3">
                                        View Project <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                    </a>
                                    <div className="flex gap-4">
                                        {p.github && p.github !== '#' && (
                                            <a href={p.github} target="_blank" rel="noopener noreferrer">
                                                <Github size={18} className="text-white/20 hover:text-white transition-colors cursor-pointer" />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </SpotlightCard>
                    </Reveal>
                ))}
            </div>
        </div>
    </section>
);

export default Projects;
