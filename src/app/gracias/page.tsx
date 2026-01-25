import Link from 'next/link';
import { CheckCircle2, ArrowLeft } from 'lucide-react';

export default function Gracias() {
    return (
        <main className="min-h-screen bg-background flex items-center justify-center px-6">
            <div className="text-center max-w-md">
                <div className="mb-8 inline-flex items-center justify-center p-6 rounded-full bg-primary/10 text-primary">
                    <CheckCircle2 size={64} />
                </div>

                <h1 className="text-4xl font-black text-white mb-4 tracking-tight">
                    ¡Mensaje Enviado!
                </h1>

                <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
                    Gracias por contactarme. Te responderé lo antes posible.
                </p>

                <Link
                    href="/"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-bold hover:brightness-110 transition-all"
                >
                    <ArrowLeft size={18} />
                    Volver al inicio
                </Link>
            </div>
        </main>
    );
}
