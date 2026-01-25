"use client"

import { motion } from "framer-motion"
import { Calendar } from "lucide-react"
import { SectionReveal } from "@/components/ui/SectionReveal"

const experiences = [
    {
        period: "2025 — PRESENTE",
        role: "Founder & AI Engineer",
        company: "ASC (Agent Service Client)",
        achievements: [
            "Liderazgo Técnico: Dirijo el diseño y desarrollo de una infraestructura SaaS basada en microservicios para el despliegue de agentes inteligentes autónomos.",
            "Ingeniería de Datos: Diseño y optimizo pipelines de datos vectoriales utilizando Qdrant y Supabase, logrando una recuperación de información con baja latencia para sistemas RAG.",
            "Automatización de CX: Desarrollo lógica de negocio avanzada para la cualificación automática de leads, integrando LLMs con herramientas de mensajería.",
            "Arquitectura C4: Diseño de infraestructura multitenant para agentes de IA integrados con Meta Cloud API.",
            "Orquestación: Implementación de flujos cíclicos con LangGraph para toma de decisiones autónoma."
        ],
        tech: ["RAG", "LLMs", "SaaS", "Python", "LangGraph", "Qdrant", "Supabase", "Meta Cloud API"],
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
    return (
        <section id="experience" className="relative bg-background py-32 px-6">
            <div className="container mx-auto max-w-6xl">
                {/* Header */}
                <SectionReveal width="100%" direction="up">
                    <div className="mb-20 text-center">
                        <h2 className="mb-4 text-sm font-black uppercase tracking-[0.5em] text-primary">Trayectoria</h2>
                        <h3 className="text-4xl font-black uppercase tracking-tight text-white md:text-6xl">
                            Experiencia <span className="text-primary">Laboral</span>
                        </h3>
                    </div>
                </SectionReveal>

                {/* Timeline */}
                <div className="relative space-y-16">
                    {/* Vertical line */}
                    <div className="absolute left-[1.875rem] top-8 hidden h-[calc(100%-4rem)] w-[2px] bg-gradient-to-b from-primary via-accent to-transparent md:block" />

                    {experiences.map((exp, idx) => (
                        <SectionReveal
                            key={idx}
                            width="100%"
                            direction="up"
                            delay={idx * 0.15}
                        >
                            <div className="relative grid gap-8 md:grid-cols-12">
                                {/* Timeline Dot */}
                                <div className="absolute left-6 top-0 hidden h-4 w-4 rounded-full bg-primary ring-4 ring-primary/20 md:block" />

                                {/* Period */}
                                <div className="flex items-start gap-2 md:col-span-3 md:pl-16">
                                    <Calendar className="mt-1 h-4 w-4 text-primary md:hidden" />
                                    <span className="text-sm font-bold uppercase tracking-wider text-primary whitespace-nowrap">{exp.period}</span>
                                </div>

                                {/* Content */}
                                <div className="glass rounded-2xl p-8 md:col-span-9">
                                    <h4 className="mb-1 text-2xl font-bold text-white">{exp.role}</h4>
                                    <span className="text-sm font-semibold text-brand-300 block mb-4">{exp.company}</span>

                                    <ul className="space-y-3">
                                        {exp.achievements.map((achievement, aIdx) => (
                                            <li key={aIdx} className="flex gap-3 text-sm leading-relaxed text-zinc-300">
                                                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                                                <span>{achievement}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    <div className="mt-6 flex flex-wrap gap-2">
                                        {exp.tech.map((t) => (
                                            <span
                                                key={t}
                                                className="rounded-lg border border-border bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground"
                                            >
                                                {t}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </SectionReveal>
                    ))}
                </div>
            </div>
        </section>
    )
}
