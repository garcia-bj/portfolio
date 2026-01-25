import Hero from '@/components/sections/Hero';
import { TechStack } from '@/components/sections/Stack';
import Projects from '@/components/sections/Projects';
import { Experience } from '@/components/sections/Experience';
import { Contact } from '@/components/sections/Contact';
import { SectionReveal } from '@/components/ui/SectionReveal';

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      <Hero />

      <SectionReveal width="100%" threshold={0.1}>
        <TechStack />
      </SectionReveal>

      <SectionReveal width="100%" threshold={0.1}>
        <Projects />
      </SectionReveal>

      <SectionReveal width="100%" threshold={0.1}>
        <Experience />
      </SectionReveal>

      <SectionReveal width="100%" threshold={0.1}>
        <Contact />
      </SectionReveal>
    </main>
  );
}
