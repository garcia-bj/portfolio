'use client';

import React from 'react';
import { SiWhatsapp, SiGmail, SiGooglemaps } from 'react-icons/si';
import { ArrowUpRight } from 'lucide-react';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Reveal } from '@/components/ui/Reveal';

const channels = [
    { Icon: SiGmail, label: 'Email', value: 'garciacussi7@gmail.com', href: 'mailto:garciacussi7@gmail.com' },
    { Icon: SiWhatsapp, label: 'WhatsApp', value: '+591 62423272', href: 'https://wa.me/59162423272' },
    {
        Icon: SiGooglemaps,
        label: 'Ubicación',
        value: 'Cochabamba, Bolivia',
        href: 'https://maps.google.com/?q=Cochabamba,Bolivia',
    },
];

const fieldClass =
    'w-full border-b border-border bg-transparent px-0 py-3.5 text-foreground placeholder:text-muted-foreground/35 transition-colors duration-200 focus:border-primary focus:outline-none';

const labelClass = 'font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground/60';

export function Contact() {
    return (
        <section id="contact" className="relative overflow-hidden py-32">
            <div className="pointer-events-none absolute left-1/2 top-1/2 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/[0.07] blur-[130px]" />

            <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-10">
                <SectionHeading
                    eyebrow="Contacto"
                    title="Trabajemos"
                    accent="juntos"
                    description="¿Tienes un proyecto en mente? Cuéntame qué necesitas y te respondo en menos de 24 horas."
                />

                <div className="mt-24 grid gap-16 lg:grid-cols-[0.85fr_1.15fr] lg:gap-24">
                    {/* Canales directos */}
                    <Reveal from="left" distance={56} duration={800} className="flex flex-col">
                        <p className="max-w-sm text-base leading-relaxed text-muted-foreground/80">
                            Desarrollo web completo, integración de IA o automatización de procesos. Si algo de
                            eso te suena, escríbeme por el canal que prefieras.
                        </p>

                        <div className="mt-12 space-y-px">
                            {channels.map(({ Icon, label, value, href }) => (
                                <a
                                    key={label}
                                    href={href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group flex cursor-pointer items-center gap-5 border-b border-border/50 py-5 transition-colors duration-300 hover:border-primary/40"
                                >
                                    <Icon
                                        size={18}
                                        className="shrink-0 text-muted-foreground/50 transition-colors duration-300 group-hover:text-primary"
                                    />
                                    <div className="min-w-0 flex-1">
                                        <p className={labelClass}>{label}</p>
                                        <p className="mt-1 truncate text-sm text-foreground">{value}</p>
                                    </div>
                                    <ArrowUpRight
                                        size={16}
                                        className="shrink-0 text-muted-foreground/30 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary"
                                    />
                                </a>
                            ))}
                        </div>
                    </Reveal>

                    {/* Formulario (Formspree, POST nativo) */}
                    <Reveal from="right" distance={56} duration={800} delay={120}>
                        <form
                            action="https://formspree.io/f/mojeonpo"
                            method="POST"
                            className="space-y-10"
                        >
                        <div className="space-y-2">
                            <label htmlFor="nombre" className={labelClass}>
                                01 — Nombre
                            </label>
                            <input
                                id="nombre"
                                name="nombre"
                                type="text"
                                required
                                autoComplete="name"
                                placeholder="Tu nombre"
                                className={fieldClass}
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="email" className={labelClass}>
                                02 — Email
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                autoComplete="email"
                                placeholder="tu@email.com"
                                className={fieldClass}
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="mensaje" className={labelClass}>
                                03 — Mensaje
                            </label>
                            <textarea
                                id="mensaje"
                                name="mensaje"
                                rows={4}
                                required
                                placeholder="Cuéntame sobre tu proyecto..."
                                className={`${fieldClass} resize-none`}
                            />
                        </div>

                        <button
                            type="submit"
                            className="group flex w-full cursor-pointer items-center justify-center gap-3 rounded-full bg-primary py-4.5 text-sm font-bold uppercase tracking-[0.15em] text-primary-foreground transition-colors duration-200 hover:bg-secondary"
                        >
                            Enviar mensaje
                            <ArrowUpRight
                                size={17}
                                className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                            />
                        </button>
                        </form>
                    </Reveal>
                </div>
            </div>
        </section>
    );
}
