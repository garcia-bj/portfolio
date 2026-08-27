'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import type { MotionValue } from 'framer-motion';
import meta from '@/data/dragon.json';
import { createDragRotate } from './dragRotate';

/**
 * El dragon como nube de puntos.
 *
 * La malla viene generada fuera (Meshy, a partir de una descripcion propia) y
 * `3d/build_dragon.py` la muestrea. Al navegador solo llegan las posiciones:
 *
 *     .blend 12,5 MB  /  .glb 4,4 MB   ->   dragon.bin 106 KB
 *
 * Y no hace falta esqueleto ni animacion horneada: el movimiento —la
 * respiracion, la deriva, el ensamblado desde el caos— sale de matematicas en
 * el shader. Riggear esta malla habria costado dias; esto son 40 lineas.
 */

// El color ya no es uniforme: cada punto trae el suyo, pintado por zonas en
// Blender. `COLOR_FAR` solo se usa para la niebla de profundidad.
const COLOR_FAR = new THREE.Color('#07332F');

const VERTEX = /* glsl */ `
    attribute vec3 aChaos;
    attribute vec3 aColor;
    attribute float aSeed;

    uniform float uTime;
    uniform float uSize;
    uniform float uAssemble;   // 0 = disperso, 1 = dragon

    varying float vDepth;
    varying float vSeed;
    varying vec3 vColor;

    void main() {
        vColor = aColor;
        // Cada punto llega a su sitio a su ritmo: el retardo por semilla es lo
        // que hace que se ensamble en oleadas y no de golpe
        float local = clamp((uAssemble - aSeed * 0.35) / 0.65, 0.0, 1.0);
        local = local * local * (3.0 - 2.0 * local);          // smoothstep

        vec3 shaped = mix(aChaos, position, local);

        // Respiracion y deriva: sin esto la nube se ve congelada
        shaped *= 1.0 + sin(uTime * 0.6 + aSeed * 6.283) * 0.012;
        shaped += vec3(
            sin(uTime * 0.55 + aSeed * 11.0),
            cos(uTime * 0.48 + aSeed * 8.1),
            sin(uTime * 0.63 + aSeed * 14.2)
        ) * 0.012;

        vec4 mv = modelViewMatrix * vec4(shaped, 1.0);
        vDepth = -mv.z;
        vSeed = aSeed;

        gl_PointSize = uSize * (30.0 / max(-mv.z, 0.1)) * (0.45 + local * 0.55);
        gl_Position = projectionMatrix * mv;
    }
`;

const FRAGMENT = /* glsl */ `
    uniform vec3 uColorFar;

    varying float vDepth;
    varying float vSeed;
    varying vec3 vColor;

    void main() {
        vec2 offset = gl_PointCoord - 0.5;
        float dist = length(offset);
        if (dist > 0.5) discard;

        float alpha = smoothstep(0.5, 0.06, dist) * 0.6;

        // Niebla por profundidad: da volumen a algo que no tiene sombreado
        float fog = clamp((vDepth - 4.0) / 8.0, 0.0, 1.0);
        vec3 color = mix(vColor, uColorFar, fog * 0.75);
        color += step(0.97, fract(vSeed * 91.7)) * 0.35;

        gl_FragColor = vec4(color, alpha * (1.0 - fog * 0.55));
    }
`;

export function DragonScene({ progress }: { progress: MotionValue<number> }) {
    const mountRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const mount = mountRef.current;
        if (!mount) return;

        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        let disposed = false;
        let raf = 0;
        let cleanup: (() => void) | null = null;

        fetch(meta.file)
            .then((response) => response.arrayBuffer())
            .then((buffer) => {
                if (disposed) return;

                const scene = new THREE.Scene();
                const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
                camera.position.set(0, 0.15, 5.5);
                camera.lookAt(0, 0, 0);

                const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
                renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
                mount.appendChild(renderer.domElement);
                renderer.domElement.style.width = '100%';
                renderer.domElement.style.height = '100%';
                renderer.domElement.style.display = 'block';

                const count = meta.count;
                // El binario lleva las posiciones (Int16) y luego los colores (Uint8)
                const raw = new Int16Array(buffer, 0, count * 3);
                const rgb = new Uint8Array(buffer, count * 3 * 2, count * 3);

                const positions = new Float32Array(count * 3);
                const chaos = new Float32Array(count * 3);
                const colors = new Float32Array(count * 3);
                const seeds = new Float32Array(count);

                for (let i = 0; i < count; i++) {
                    const o = i * 3;
                    // El modelo viene con los pies en 0: lo bajamos para centrarlo
                    positions[o] = (raw[o] / 32767) * meta.scale;
                    positions[o + 1] = (raw[o + 1] / 32767) * meta.scale - meta.height * 0.48;
                    positions[o + 2] = (raw[o + 2] / 32767) * meta.scale;

                    // Caos de partida: una esfera hueca alrededor
                    const theta = Math.random() * Math.PI * 2;
                    const phi = Math.acos(2 * Math.random() - 1);
                    const r = 4.2 + Math.random() * 2.4;
                    chaos[o] = Math.sin(phi) * Math.cos(theta) * r;
                    chaos[o + 1] = Math.cos(phi) * r * 0.7;
                    chaos[o + 2] = Math.sin(phi) * Math.sin(theta) * r;

                    colors[o] = rgb[o] / 255;
                    colors[o + 1] = rgb[o + 1] / 255;
                    colors[o + 2] = rgb[o + 2] / 255;

                    seeds[i] = Math.random();
                }

                const geometry = new THREE.BufferGeometry();
                geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
                geometry.setAttribute('aChaos', new THREE.BufferAttribute(chaos, 3));
                geometry.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));
                geometry.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1));

                const material = new THREE.ShaderMaterial({
                    vertexShader: VERTEX,
                    fragmentShader: FRAGMENT,
                    uniforms: {
                        uTime: { value: 0 },
                        uSize: { value: 0.58 },
                        uAssemble: { value: 0 },
                        uColorFar: { value: COLOR_FAR },
                    },
                    transparent: true,
                    depthWrite: false,
                    blending: THREE.AdditiveBlending,
                });

                const rig = new THREE.Group();
                rig.add(new THREE.Points(geometry, material));
                scene.add(rig);

                const resize = () => {
                    const { clientWidth: w, clientHeight: h } = mount;
                    if (!w || !h) return;
                    renderer.setSize(w, h, false);
                    camera.aspect = w / h;
                    camera.updateProjectionMatrix();
                    material.uniforms.uSize.value = w < 640 ? 0.44 : 0.58;
                };
                resize();
                const sizeObserver = new ResizeObserver(resize);
                sizeObserver.observe(mount);

                let visible = false;
                const visibility = new IntersectionObserver(
                    ([entry]) => { visible = entry.isIntersecting; },
                    { rootMargin: '200px' }
                );
                visibility.observe(mount);

                const drag = createDragRotate(mount);
                const start = performance.now();
                let last = start;

                const tick = (now: number) => {
                    raf = requestAnimationFrame(tick);
                    const delta = Math.min((now - last) / 1000, 0.05);
                    last = now;
                    if (!visible) return;

                    const elapsed = (now - start) / 1000;
                    const p = progress.get();

                    material.uniforms.uTime.value = reduced ? 0 : elapsed;
                    // Se arma en el primer tercio y se queda
                    material.uniforms.uAssemble.value = Math.min(1, p * 2.6);

                    // Giro automatico + lo que arrastre el usuario
                    drag.update(delta);
                    const auto = reduced ? -0.5 : -0.5 + Math.sin(elapsed * 0.14) * 0.55;
                    rig.rotation.y = auto + drag.offset.y;
                    rig.rotation.x = drag.offset.x;

                    renderer.render(scene, camera);
                };
                raf = requestAnimationFrame(tick);

                cleanup = () => {
                    drag.dispose();
                    sizeObserver.disconnect();
                    visibility.disconnect();
                    geometry.dispose();
                    material.dispose();
                    renderer.dispose();
                    renderer.domElement.remove();
                };
            })
            .catch(() => { /* si el binario no carga, la seccion queda vacia */ });

        return () => {
            disposed = true;
            cancelAnimationFrame(raf);
            cleanup?.();
        };
    }, [progress]);

    return <div ref={mountRef} className="h-full w-full" aria-hidden />;
}
