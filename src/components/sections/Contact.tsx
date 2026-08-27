'use client';

import { SiWhatsapp, SiGmail, SiGithub } from 'react-icons/si';
import { ArrowUpRight, MapPin } from 'lucide-react';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Reveal } from '@/components/ui/Reveal';

// Los canales SON la seccion, no el apendice de un formulario.
// Se quito el form: era un POST nativo a Formspree sin campo `_next`, asi que
// al enviar sacaba al visitante del sitio a una pagina de terceros.
const channels = [
    {
        Icon: SiWhatsapp,
        label: 'WhatsApp',
        value: '+591 62423272',
        note: 'La vía más rápida',
        href: 'https://wa.me/59162423272',
    },
    {
        Icon: SiGmail,
        label: 'Email',
        value: 'garciacussi7@gmail.com',
        note: 'Respondo en menos de 24 h',
        href: 'mailto:garciacussi7@gmail.com',
    },
];

const socials = [{ Icon: SiGithub, label: 'GitHub', href: 'https://github.com/garcia-bj' }];

export function Contact() {
    return (
        <section id="contact" className="relative overflow-hidden py-32">
            <div className="pointer-events-none absolute left-1/2 top-1/2 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/[0.07] blur-[130px]" />

            <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-10">
                <SectionHeading
                    eyebrow="Contacto"
                    title="Trabajemos"
                    accent="juntos"
                    description="Desarrollo web completo, integración de IA o automatización de procesos. Escríbeme por el canal que prefieras."
                />

                <div className="mt-24 grid gap-5 md:grid-cols-2">
                    {channels.map(({ Icon, label, value, note, href }, i) => (
                        <Reveal key={label} from="up" distance={48} duration={800} delay={i * 110}>
                            <a
                                href={href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group glass flex h-full cursor-pointer flex-col rounded-3xl border border-border/60 p-8 transition-colors duration-300 hover:border-primary/45 md:p-10"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <Icon
                                        size={26}
                                        className="text-muted-foreground/45 transition-colors duration-300 group-hover:text-primary"
                                    />
                                    <ArrowUpRight
                                        size={20}
                                        className="text-muted-foreground/30 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary"
                                    />
                                </div>

                                <p className="mt-10 font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground/60">
                                    {label}
                                </p>
                                <p className="mt-2 break-words font-display text-[clamp(1.15rem,2.1vw,1.6rem)] font-extrabold leading-[1.05] text-foreground transition-colors duration-300 group-hover:text-primary">
                                    {value}
                                </p>
                                <p className="mt-3 text-sm text-muted-foreground/70">{note}</p>
                            </a>
                        </Reveal>
                    ))}
                </div>

                <Reveal from="up" distance={40} duration={800} delay={220}>
                    <div className="mt-8 flex flex-wrap items-center justify-between gap-6 border-t border-border/60 pt-8">
                        <a
                            href="https://maps.google.com/?q=Cochabamba,Bolivia"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group inline-flex cursor-pointer items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground/60 transition-colors duration-200 hover:text-foreground"
                        >
                            <MapPin size={14} className="transition-colors duration-200 group-hover:text-primary" />
                            Cochabamba, Bolivia — UTC−4
                        </a>

                        <div className="flex items-center gap-3">
                            {socials.map(({ Icon, label, href }) => (
                                <a
                                    key={label}
                                    href={href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={label}
                                    className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-border/60 text-muted-foreground/60 transition-colors duration-200 hover:border-primary/45 hover:text-primary"
                                >
                                    <Icon size={17} />
                                </a>
                            ))}
                        </div>
                    </div>
                </Reveal>
            </div>
        </section>
    );
}
