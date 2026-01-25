'use client';

import React from 'react';
import { SiWhatsapp, SiGmail, SiGooglemaps } from 'react-icons/si';
import { Send } from 'lucide-react';
import { SectionReveal } from '@/components/ui/SectionReveal';

export function Contact() {
    return (
        <section id="contact" className="py-24 px-6 md:px-12 bg-background relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-6xl mx-auto relative z-10">
                <SectionReveal width="100%" direction="up">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tighter">
                            Trabajemos <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Juntos</span>
                        </h2>
                        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                            ¿Tienes un proyecto en mente? Estoy listo para ayudarte a hacerlo realidad.
                        </p>
                    </div>
                </SectionReveal>

                <div className="grid md:grid-cols-2 gap-12 lg:gap-20">
                    {/* Left Column: Contact Info */}
                    <SectionReveal width="100%" delay={0.2} direction="right">
                        <div className="space-y-8">
                            <div>
                                <h3 className="text-2xl font-bold text-white mb-4">Contáctame</h3>
                                <p className="text-zinc-400 leading-relaxed mb-8">
                                    Ya sea que necesites un desarrollo web completo, una integración de IA, o automatización de procesos, estoy aquí para ayudarte.
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div className="p-4 rounded-xl bg-card border border-border flex items-center gap-4 group hover:border-primary/50 transition-colors">
                                    <div className="p-3 rounded-lg bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                                        <SiGmail size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-0.5">Email</p>
                                        <p className="text-white font-medium">garciacussi7@gmail.com</p>
                                    </div>
                                </div>

                                <div className="p-4 rounded-xl bg-card border border-border flex items-center gap-4 group hover:border-primary/50 transition-colors">
                                    <div className="p-3 rounded-lg bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                                        <SiWhatsapp size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider mb-0.5">WhatsApp</p>
                                        <p className="text-white font-medium">+591 62423272</p>
                                    </div>
                                </div>

                                <div className="p-4 rounded-xl bg-card border border-border flex items-center gap-4 group hover:border-primary/50 transition-colors">
                                    <div className="p-3 rounded-lg bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                                        <SiGooglemaps size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-0.5">Ubicación</p>
                                        <p className="text-foreground font-medium">Cochabamba / Bolivia</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </SectionReveal>

                    {/* Right Column: Form */}
                    <SectionReveal width="100%" delay={0.4} direction="left">
                        <form
                            name="contact"
                            method="POST"
                            data-netlify="true"
                            netlify-honeypot="bot-field"
                            action="/gracias"
                            className="space-y-6"
                        >
                            {/* Hidden field for Netlify */}
                            <input type="hidden" name="form-name" value="contact" />

                            {/* Honeypot anti-spam (invisible) */}
                            <p className="hidden">
                                <label>No llenar: <input name="bot-field" /></label>
                            </p>

                            <div className="space-y-2">
                                <label htmlFor="nombre" className="text-sm font-bold text-zinc-300">Nombre</label>
                                <input
                                    id="nombre"
                                    name="nombre"
                                    type="text"
                                    required
                                    placeholder="Tu nombre"
                                    className="w-full px-4 py-3 rounded-lg bg-card border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary transition-colors"
                                />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="email" className="text-sm font-bold text-zinc-300">Email</label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    placeholder="tu@email.com"
                                    className="w-full px-4 py-3 rounded-lg bg-card border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary transition-colors"
                                />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="mensaje" className="text-sm font-bold text-zinc-300">Mensaje</label>
                                <textarea
                                    id="mensaje"
                                    name="mensaje"
                                    rows={4}
                                    required
                                    placeholder="Cuéntame sobre tu proyecto..."
                                    className="w-full px-4 py-3 rounded-lg bg-card border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary transition-colors resize-none"
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full py-4 rounded-lg bg-primary text-primary-foreground font-bold text-lg flex items-center justify-center gap-2 hover:brightness-110 transition-all shadow-[0_0_20px_hsla(var(--primary),0.2)]"
                            >
                                Enviar Mensaje <Send size={18} />
                            </button>
                        </form>
                    </SectionReveal>
                </div>
            </div>
        </section>
    );
}
