"use client"

import { useRef } from "react"
import { motion, useScroll, useSpring } from "framer-motion"
import { SectionHeading } from "@/components/ui/SectionHeading"
import { Reveal } from "@/components/ui/Reveal"

const experiences = [
    {
        period: "2026 — PRESENTE",
        role: "Full Stack Developer & AI Engineer",
        company: "DE-VEGA",
        achievements: [
            "Desarrollo de una aplicación web de creación y edición de imágenes con IA para menús personalizados de restaurante.",
            "Autopublicación automática de contenido como post e historia en Instagram y Facebook.",
            "Gestión de assets con MinIO."
        ],
        tech: ["IA Generativa", "MinIO", "RUSTFS", "Instagram API", "Facebook API"],
    },
    {
        period: "2026 — PRESENTE",
        role: "Full Stack Developer & Automation Engineer",
        company: "GENUINO IMPORTACIONES",
        achievements: [
            "Desarrollo del sitio web corporativo de Genuino Importaciones.",
            "Diseño de un formulario inteligente de embudos de ventas con filtrado automático de clientes.",
            "Asignación automática y notificación a los asesores comerciales correspondientes."
        ],
        tech: ["n8n", "CRM", "Automatización", "Embudos de Venta", "Web"],
    },
    {
        period: "2025 — PRESENTE",
        role: "Founder & AI Engineer",
        company: "ASC (Agent Service Client)",
        achievements: [
            "Liderazgo Técnico: Dirijo el diseño y desarrollo de una infraestructura SaaS basada en microservicios para el despliegue de agentes inteligentes autónomos.",
            "Ingeniería de Datos: Diseño y optimizo pipelines de datos vectoriales utilizando Qdrant y Supabase, logrando una recuperación de información con baja latencia para sistemas RAG.",
            "Automatización de CX: Desarrollo lógica de negocio avanzada para la cualificación automática de leads, integrando LLMs con herramientas de mensajería.",
            "Ecosistema Meta: Creación de aplicaciones multicanal (WhatsApp, Instagram y Messenger) sobre Meta Cloud API con arquitectura multitenant (C4).",
            "Orquestación: Implementación de flujos cíclicos con LangGraph para toma de decisiones autónoma."
        ],
        tech: ["RAG", "LLMs", "SaaS", "Python", "LangGraph", "Qdrant", "Supabase", "Meta Cloud API", "Instagram API", "Messenger API"],
    },
    {
        period: "2025 — PRESENTE",
        role: "Lead Full Stack Developer",
        company: "CARGUITA",
        achievements: [
            "Desarrollo de plataforma de monitoreo de transporte de carga en tiempo real con arquitectura escalable.",
            "Implementación de dos dashboards intuitivos (Cliente y Transportista) para gestión logística integral.",
            "Optimización de tiempos de entrega mediante algoritmos de geolocalización y notificaciones en tiempo real."
        ],
        tech: ["React", "Maps API", "Real-time DB", "Dashboard", "System Design"],
    },
    {
        period: "2023 — 2025",
        role: "Desarrollador & Automatizador",
        company: "TECPROCOM Bolivia",
        achievements: [
            "Automatización de Procesos: Diseñé flujos de trabajo con n8n que automatizaron el 90% de las consultas frecuentes, reduciendo la carga operativa del equipo de soporte.",
            "Desarrollo Full-Stack: Implementé soluciones e-commerce y sistemas de agendamiento personalizados y APIs de terceros.",
            "Gestión de APIs: Integré Evolution API para flujos masivos de WhatsApp, asegurando la escalabilidad de la comunicación corporativa."
        ],
        tech: ["WooCommerce", "n8n", "Evolution API", "Automation", "WordPress"],
    },
]

export function Experience() {
    const timelineRef = useRef<HTMLDivElement>(null)
    const { scrollYProgress } = useScroll({
        target: timelineRef,
        offset: ["start 0.75", "end 0.65"],
    })
    const lineScale = useSpring(scrollYProgress, { stiffness: 90, damping: 28 })

    return (
        <section id="experience" className="relative py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-10">
                <SectionHeading
                    eyebrow="Trayectoria"
                    title="Experiencia"
                    accent="laboral"
                    description="Cinco frentes en paralelo: producto propio, consultoría y automatización para empresas."
                />

                <div ref={timelineRef} className="relative mt-24">
                    {/* Riel de fondo + línea que se dibuja con el scroll */}
                    <div className="absolute left-0 top-2 hidden h-full w-px bg-border/60 md:block" />
                    <motion.div
                        style={{ scaleY: lineScale }}
                        className="absolute left-0 top-2 hidden h-full w-px origin-top bg-gradient-to-b from-primary via-secondary to-transparent md:block"
                    />

                    <div className="space-y-px md:pl-0">
                        {experiences.map((exp, idx) => (
                            <Reveal
                                key={idx}
                                as="article"
                                from={idx % 2 === 0 ? "left" : "right"}
                                distance={64}
                                duration={800}
                                className="group relative grid gap-6 border-b border-border/40 py-12 transition-colors duration-500 hover:border-primary/30 md:grid-cols-12 md:gap-10 md:pl-14"
                            >
                                {/* Nodo de la línea */}
                                <span className="absolute -left-[5px] top-14 hidden h-2.5 w-2.5 rounded-full bg-border ring-4 ring-background transition-colors duration-300 group-hover:bg-primary md:block" />

                                <div className="md:col-span-3">
                                    <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-primary">
                                        {exp.period}
                                    </span>
                                    <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground/50">
                                        {exp.company}
                                    </p>
                                </div>

                                <div className="md:col-span-9">
                                    <h3 className="font-display text-3xl font-bold leading-tight text-foreground transition-colors duration-300 group-hover:text-primary md:text-4xl">
                                        {exp.role}
                                    </h3>

                                    <ul className="mt-6 space-y-3">
                                        {exp.achievements.map((achievement) => (
                                            <li
                                                key={achievement}
                                                className="flex gap-3.5 text-sm leading-relaxed text-muted-foreground/75"
                                            >
                                                <span className="mt-[0.6em] h-px w-3 shrink-0 bg-primary/50" />
                                                <span>{achievement}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    <div className="mt-7 flex flex-wrap gap-2">
                                        {exp.tech.map((t) => (
                                            <span
                                                key={t}
                                                className="rounded-full border border-border/70 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground/70 transition-colors duration-300 group-hover:border-primary/25 group-hover:text-foreground/80"
                                            >
                                                {t}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}
