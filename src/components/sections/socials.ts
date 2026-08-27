import { SiGithub, SiLinkedin } from 'react-icons/si';
import type { IconType } from 'react-icons';

// Unica fuente de las redes: las usan Hero, Contact y Footer
export const SOCIALS: { Icon: IconType; label: string; href: string }[] = [
    { Icon: SiGithub, label: 'GitHub', href: 'https://github.com/garcia-bj' },
    {
        Icon: SiLinkedin,
        label: 'LinkedIn',
        href: 'https://www.linkedin.com/in/brandon-junior-garcia-cussi',
    },
];
