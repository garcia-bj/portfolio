import Link from 'next/link';
import { Check, ArrowLeft } from 'lucide-react';

export default function Gracias() {
    return (
        <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-6">
            <div className="absolute inset-0 grid-lines [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
            <div className="pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-[130px]" />

            <div className="relative z-10 max-w-lg text-center">
                <div className="mx-auto mb-10 flex h-16 w-16 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-primary">
                    <Check size={28} strokeWidth={2.5} />
                </div>

                <span className="eyebrow">Mensaje recibido</span>

                <h1 className="mt-6 font-display text-[clamp(2.25rem,7vw,4rem)] font-normal leading-[0.95] text-foreground/60">
                    Gracias por{' '}
                    <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text font-extrabold text-transparent">
                        escribir
                    </span>
                </h1>

                <p className="mt-7 text-base leading-relaxed text-muted-foreground/80">
                    Te respondo en menos de 24 horas. Mientras tanto, puedes seguir explorando el trabajo.
                </p>

                <Link
                    href="/"
                    className="group mt-12 inline-flex cursor-pointer items-center gap-2.5 rounded-full border border-border px-7 py-4 font-mono text-[11px] uppercase tracking-[0.2em] text-foreground/80 transition-colors duration-200 hover:border-primary/50 hover:bg-primary/5 hover:text-foreground"
                >
                    <ArrowLeft size={15} className="transition-transform duration-200 group-hover:-translate-x-0.5" />
                    Volver al inicio
                </Link>
            </div>
        </main>
    );
}
