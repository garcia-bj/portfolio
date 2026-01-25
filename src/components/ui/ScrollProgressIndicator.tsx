'use client';

import { motion, useScroll, useSpring } from 'framer-motion';

export function ScrollProgressIndicator() {
    const { scrollYProgress } = useScroll();

    // Simpler, more performant spring
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 200,
        damping: 50,
        restDelta: 0.01
    });

    return (
        <motion.div
            className="fixed top-0 left-0 right-0 h-[3px] z-[100] origin-left bg-gradient-to-r from-primary via-secondary to-primary"
            style={{ scaleX }}
        />
    );
}
