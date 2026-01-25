'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface Props {
    children: React.ReactNode;
    width?: "fit-content" | "100%";
    delay?: number;
    x?: number;
    y?: number;
}

const Reveal = ({ children, width = "fit-content", delay = 0.25, x = 0, y = 30 }: Props) => {
    return (
        <div style={{ position: "relative", width }}>
            <motion.div
                initial={{ opacity: 0, y: y, x: x }}
                whileInView={{ opacity: 1, y: 0, x: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: delay, ease: "easeOut" }}
            >
                {children}
            </motion.div>
        </div>
    );
};

export default Reveal;
