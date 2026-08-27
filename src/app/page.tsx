import Hero from '@/components/sections/Hero';
import { Stats } from '@/components/sections/Stats';
import { AiCore } from '@/components/sections/AiCore';
import { TechStack } from '@/components/sections/Stack';
import Projects from '@/components/sections/Projects';
import { Experience } from '@/components/sections/Experience';
import { Toolbox } from '@/components/sections/Toolbox';
import { Dragon } from '@/components/sections/Dragon';
import { Contact } from '@/components/sections/Contact';

// Cada sección trae sus propias animaciones de scroll; no hace falta envolverlas
// (un wrapper con transform rompería el apilado sticky de Projects).
export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Hero />
      <Stats />
      <AiCore />
      <TechStack />
      <Projects />
      <Experience />
      <Toolbox />
      <Dragon />
      <Contact />
    </main>
  );
}
