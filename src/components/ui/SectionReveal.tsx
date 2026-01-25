'use client';

import React, { useRef } from 'react';
import { motion, useInView, Variant } from 'framer-motion';

interface Props {
    children: React.ReactNode;
    width?: "fit-content" | "100%";
    delay?: number;
    threshold?: number;
    direction?: "up" | "down" | "left" | "right" | "none";
    duration?: number;
    className?: string;
}

export const SectionReveal = ({
    children,
    width = "100%",
    delay = 0,
    threshold = 0.2, // Trigger slightly earlier
    direction = "up",
    duration = 0.6,
    className = ""
}: Props) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-10%" });

    const getDirectionVariants = () => {
        const distance = 50;

        const variants: Record<string, any> = {
            hidden: { opacity: 0 },
            visible: {
                opacity: 1,
                transition: {
                    duration: duration,
                    delay: delay,
                    ease: [0.22, 1, 0.36, 1] // Custom refined bezier
                }
            }
        };

        switch (direction) {
            case "up":
                variants.hidden.y = distance;
                variants.visible.y = 0;
                break;
            case "down":
                variants.hidden.y = -distance;
                variants.visible.y = 0;
                break;
            case "left":
                variants.hidden.x = distance;
                variants.visible.x = 0;
                break;
            case "right":
                variants.hidden.x = -distance;
                variants.visible.x = 0;
                break;
            case "none":
                break;
        }

        return variants;
    };

    return (
        <div ref={ref} style={{ width }} className={className}>
            <motion.div
                variants={getDirectionVariants()}
                initial="hidden"
                animate={isInView ? "visible" : "hidden"}
            >
                {children}
            </motion.div>
        </div>
    );
};
