'use client';

import React, { useEffect, useRef } from 'react';
import {
    TbDeviceDesktop, TbServerBolt, TbDatabase, TbBrain,
    TbCloud, TbTerminal2
} from 'react-icons/tb';
import { Cpu, Brain } from 'lucide-react';
import { SectionId } from '@/types';

// Tech icons using CDN
const techIcons: Record<string, string> = {
    "React": "/icons/react_dark.svg",
    "Next.js": "/icons/nextjs_icon_dark.svg",
    "TypeScript": "/icons/typescript.svg",
    "Tailwind CSS": "/icons/tailwindcss.svg",
    "Node.js": "/icons/nodejs.svg",
    "Python": "/icons/python.svg",
    "FastAPI": "/icons/fastapi.svg",
    "NestJS": "/icons/nestjs.svg",
    "PostgreSQL": "/icons/postgresql.svg",
    "MongoDB": "/icons/mongodb-icon-dark.svg",
    "Redis": "/icons/redis.svg",
    "Docker": "/icons/docker.svg",
    "Kubernetes": "/icons/kubernetes.svg",
    "GitHub Actions": "/icons/github_dark.svg",
    "Git": "/icons/git.svg",
    "Supabase": "/icons/supabase.svg",
    "Linux": "/icons/linux.svg",
    "Google Cloud": "/icons/google-cloud.svg",
    "VSCode": "/icons/vscode.svg",
    "OpenAI API": "/icons/openai.svg",
    "Claude AI": "/icons/claude-ai-icon.svg",
    "Qdrant": "/icons/qdrant-icon-light.svg",
    "n8n": "/icons/n8n.svg",
    "LangGraph": "/icons/langgraph-color.svg",
    "OpenRouter": "/icons/openrouter_dark.svg",
    "LangChain": "/icons/langchain-color.svg",
};

const categories = [
    {
        id: "frontend",
        title: "Frontend",
        description: "Interfaces modernas y responsivas",
        icon: TbDeviceDesktop,
        gradient: "from-teal-500 to-emerald-500",
        techs: [
            { name: "React", level: 95 },
            { name: "Next.js", level: 90 },
            { name: "TypeScript", level: 92 },
            { name: "Tailwind CSS", level: 95 },
        ]
    },
    {
        id: "backend",
        title: "Backend",
        description: "APIs robustas y escalables",
        icon: TbServerBolt,
        gradient: "from-emerald-500 to-cyan-500",
        techs: [
            { name: "Node.js", level: 90 },
            { name: "Python", level: 92 },
            { name: "FastAPI", level: 88 },
            { name: "NestJS", level: 85 },
        ]
    },
    {
        id: "database",
        title: "Bases de Datos",
        description: "Almacenamiento optimizado",
        icon: TbDatabase,
        gradient: "from-cyan-500 to-teal-500",
        techs: [
            { name: "PostgreSQL", level: 90 },
            { name: "Supabase", level: 95 },
            { name: "MongoDB", level: 85 },
            { name: "Redis", level: 80 },
            { name: "Qdrant", level: 88 },
        ]
    },
    {
        id: "ai",
        title: "IA & Machine Learning",
        description: "Inteligencia artificial avanzada",
        icon: TbBrain,
        gradient: "from-teal-400 to-cyan-400",
        techs: [
            { name: "LangChain", level: 92 },
            { name: "LangGraph", level: 88 },
            { name: "OpenAI API", level: 95 },
            { name: "Claude AI", level: 88 },
            { name: "OpenRouter", level: 90 },
            { name: "Python", level: 94 },
        ]
    },
    {
        id: "devops",
        title: "DevOps & Cloud",
        description: "Infraestructura automatizada",
        icon: TbCloud,
        gradient: "from-emerald-400 to-teal-400",
        techs: [
            { name: "Docker", level: 90 },
            { name: "Kubernetes", level: 78 },
            { name: "GitHub Actions", level: 92 },
            { name: "Google Cloud", level: 80 },
        ]
    },
    {
        id: "tools",
        title: "Herramientas",
        description: "Productividad y control de versiones",
        icon: TbTerminal2,
        gradient: "from-cyan-600 to-emerald-600",
        techs: [
            { name: "Git", level: 95 },
            { name: "Linux", level: 85 },
            { name: "VSCode", level: 95 },
            { name: "n8n", level: 90 },
        ]
    }
];

const aiData = {
    frameworks: ["LangChain", "LangGraph", "Pydantic AI", "OpenAI API", "Anthropic Claude API"],
    specialties: ["Agentes Autónomos (Agentic Workflows)", "RAG Avanzado", "IA Multimodal", "Prompt Engineering"],
    protocols: ["Model Context Protocol (MCP)", "Vector Databases (Qdrant, Supabase Vector, Pinecone)"]
};

function TechCard({ tech, index }: { tech: { name: string; level: number }; index: number }) {
    const iconUrl = techIcons[tech.name];

    return (
        <div
            className="group relative flex flex-col items-center p-4 rounded-2xl bg-card/40 border border-border/50 hover:border-primary/60 hover:bg-primary/10 transition-all duration-300 backdrop-blur-sm cursor-pointer hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] opacity-0 animate-fade-in-up hover:translate-y-[-8px] hover:z-10"
            style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'forwards' }}
        >
            {/* Detailed Glow effect on hover */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-primary/20 via-transparent to-accent/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center">
                <div className="hover:scale-110 transition-transform duration-300">
                    {iconUrl ? (
                        <img
                            src={iconUrl}
                            alt={tech.name}
                            className="w-12 h-12 mb-3 drop-shadow-lg filter group-hover:drop-shadow-[0_0_8px_rgba(59,130,246,0.5)] transition-all duration-300"
                        />
                    ) : (
                        <div className="w-12 h-12 mb-3 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                            {tech.name.toLowerCase().includes('ai') || tech.name.toLowerCase().includes('lang') ? (
                                <Brain className="w-6 h-6 text-primary" />
                            ) : (
                                <Cpu className="w-6 h-6 text-primary" />
                            )}
                        </div>
                    )}
                </div>

                <span className="text-sm font-medium text-center mb-2 group-hover:text-white transition-colors">{tech.name}</span>

                {/* Skill level bar */}
                <div className="w-full h-1 rounded-full bg-muted overflow-hidden">
                    <div
                        className="h-full rounded-full bg-gradient-to-r from-primary to-accent group-hover:brightness-125 transition-all duration-1000 ease-out"
                        style={{ width: `${tech.level}%` }}
                    />
                </div>
            </div>
        </div>
    );
}

function CategorySection({ category, index }: { category: typeof categories[0]; index: number }) {
    const sectionRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        if (sectionRef.current) {
            observer.observe(sectionRef.current);
        }

        return () => observer.disconnect();
    }, []);

    return (
        <div ref={sectionRef} className="category-section opacity-0 transition-opacity duration-700 relative">
            <style jsx>{`
                .category-section.visible { opacity: 1; }
                .category-section.visible .category-header { opacity: 1; transform: translateX(0); }
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                :global(.animate-fade-in-up) {
                    animation: fadeInUp 0.5s ease-out;
                }
            `}</style>

            {/* Category header */}
            <div className="category-header opacity-0 -translate-x-5 transition-all duration-700 flex items-center gap-4 mb-6">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${category.gradient} shadow-lg shadow-primary/10`}>
                    <category.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h3 className="text-xl font-bold">{category.title}</h3>
                    <p className="text-sm text-muted-foreground">{category.description}</p>
                </div>
            </div>

            {/* Tech grid */}
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                {category.techs.map((tech, techIndex) => (
                    <TechCard key={tech.name} tech={tech} index={techIndex} />
                ))}
            </div>
        </div>
    );
}

export function TechStack() {
    return (
        <section id={SectionId.STACK} className="py-24 relative overflow-hidden">
            {/* Simple static background gradients for performance */}
            <div className="absolute top-1/4 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />

            <div className="container mx-auto px-6 relative z-10">
                <div className="text-center mb-16">
                    <h2 className="text-5xl md:text-6xl font-black tracking-tighter mb-4 uppercase text-foreground leading-none">
                        Stack <span className="text-muted-foreground/30">Tecnológico</span>
                    </h2>
                    <p className="section-subheading mx-auto text-muted-foreground">
                        Dominio completo del ecosistema de desarrollo moderno, desde el frontend hasta la infraestructura de IA
                    </p>
                </div>

                {/* Main tech categories */}
                <div className="grid md:grid-cols-2 gap-12 mb-16 max-w-6xl mx-auto">
                    {categories.map((category, index) => (
                        <CategorySection key={category.id} category={category} index={index} />
                    ))}
                </div>

                {/* AI & LLM Special Section */}
                <div className="relative p-8 rounded-3xl border border-border bg-gradient-to-br from-card to-card/50 overflow-hidden">
                    {/* Background glow */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl opacity-50" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl opacity-50" />

                    <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-4 rounded-2xl bg-gradient-to-br from-primary to-accent shadow-lg text-white">
                                <Brain className="w-8 h-8" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-foreground">Ingeniería de IA & LLM</h3>
                                <p className="text-muted-foreground">Especialización en modelos de lenguaje y agentes inteligentes</p>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            {[
                                { title: "Frameworks", color: "cyan", items: aiData.frameworks },
                                { title: "Especialidades", color: "purple", items: aiData.specialties },
                                { title: "Protocolos & Datos", color: "orange", items: aiData.protocols }
                            ].map((group) => (
                                <div key={group.title}>
                                    <h4 className={`text-${group.color}-400 font-bold mb-4 flex items-center gap-2`}>
                                        <span className={`w-1.5 h-1.5 rounded-full bg-${group.color}-400`} />
                                        {group.title}
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {group.items.map((tool) => (
                                            <div key={tool} className={`px-3 py-1.5 rounded-lg text-xs font-semibold bg-${group.color}-500/10 text-${group.color}-100 border border-${group.color}-500/30`}>
                                                {tool}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
