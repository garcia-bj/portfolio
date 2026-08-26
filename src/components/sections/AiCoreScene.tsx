'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import type { MotionValue } from 'framer-motion';
import meta from '@/data/ai-core.json';

/**
 * El nucleo de IA: una nube de puntos que se reconfigura entre tres esculturas.
 *
 * Aqui esta el salto respecto al cofre. El cofre son tablas y flejes, y por eso
 * cabe en una lista de medidas. Esta forma es ruido esculpido: no hay manera de
 * describirla con numeros.
 *
 * La solucion no fue exportar un `.glb` —que traeria caras, normales, UVs y
 * texturas que no vamos a dibujar— sino darse cuenta de que **si lo vamos a
 * pintar como particulas, solo hacen falta las posiciones**:
 *
 *     escultura (Blender)  ->  ai-core.bin (Int16 XYZ)  ->  THREE.Points
 *          3M de polys            180 KB, 3 formas          1 draw call
 *
 * Las tres formas nacen del mismo icoesfera, asi que el punto `i` de una
 * corresponde al `i` de las otras: morfear es interpolar dos arrays.
 */

const COLOR_NEAR = new THREE.Color('#5EEAD4');
const COLOR_FAR = new THREE.Color('#0B6B63');

const VERTEX = /* glsl */ `
    attribute vec3 aTarget1;
    attribute vec3 aTarget2;
    attribute float aSeed;

    uniform float uMorph;    // 0..2: recorre las tres formas
    uniform float uTime;
    uniform float uSize;
    uniform float uAssemble; // 0 = disperso, 1 = formado

    varying float vDepth;
    varying float vSeed;

    void main() {
        // Interpolacion entre las tres esculturas
        vec3 shaped = uMorph < 1.0
            ? mix(position, aTarget1, uMorph)
            : mix(aTarget1, aTarget2, uMorph - 1.0);

        // Respiracion: el conjunto late despacio
        shaped *= 1.0 + sin(uTime * 0.7 + aSeed * 6.283) * 0.018;

        // Deriva individual: sin esto la nube se ve congelada
        shaped += vec3(
            sin(uTime * 0.61 + aSeed * 10.0),
            cos(uTime * 0.53 + aSeed * 7.3),
            sin(uTime * 0.72 + aSeed * 13.1)
        ) * 0.014;

        vec4 mv = modelViewMatrix * vec4(shaped, 1.0);
        vDepth = -mv.z;
        vSeed = aSeed;

        // Atenuacion por distancia. Ojo con la constante: con 260 cada punto
        // salia de ~97 px y la nube se saturaba a blanco solido.
        gl_PointSize = uSize * (30.0 / max(-mv.z, 0.1));
        gl_Position = projectionMatrix * mv;
    }
`;

const FRAGMENT = /* glsl */ `
    uniform vec3 uColorNear;
    uniform vec3 uColorFar;

    varying float vDepth;
    varying float vSeed;

    void main() {
        // Punto redondo con borde suave, no un cuadrado
        vec2 offset = gl_PointCoord - 0.5;
        float dist = length(offset);
        if (dist > 0.5) discard;

        float alpha = smoothstep(0.5, 0.06, dist) * 0.55;

        // Niebla por profundidad: da volumen a algo que no tiene sombreado
        float fog = clamp((vDepth - 3.5) / 7.5, 0.0, 1.0);
        vec3 color = mix(uColorNear, uColorFar, fog);

        // Un puñado de puntos brilla mas: rompe la uniformidad
        float spark = step(0.965, fract(vSeed * 97.3));
        color += spark * 0.35;

        gl_FragColor = vec4(color, alpha * (1.0 - fog * 0.6));
    }
`;

/** Int16 cuantizado -> posiciones reales. */
function decode(buffer: ArrayBuffer, count: number, scale: number) {
    const raw = new Int16Array(buffer);
    const forms: THREE.BufferAttribute[] = [];

    for (let f = 0; f < meta.forms.length; f++) {
        const positions = new Float32Array(count * 3);
        const offset = f * count * 3;
        for (let i = 0; i < count * 3; i++) {
            positions[i] = (raw[offset + i] / 32767) * scale;
        }
        forms.push(new THREE.BufferAttribute(positions, 3));
    }

    return forms;
}

export function AiCoreScene({ progress }: { progress: MotionValue<number> }) {
    const mountRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const mount = mountRef.current;
        if (!mount) return;

        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        let disposed = false;
        let raf = 0;
        let cleanupScene: (() => void) | null = null;

        fetch(meta.file)
            .then((response) => response.arrayBuffer())
            .then((buffer) => {
                if (disposed) return;

                const scene = new THREE.Scene();
                const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
                camera.position.set(0, 0, 6.4);

                const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
                renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
                mount.appendChild(renderer.domElement);
                renderer.domElement.style.width = '100%';
                renderer.domElement.style.height = '100%';
                renderer.domElement.style.display = 'block';

                const [form0, form1, form2] = decode(buffer, meta.count, meta.scale);

                // La semilla se genera aqui: no hace falta transportarla
                const seeds = new Float32Array(meta.count);
                for (let i = 0; i < meta.count; i++) seeds[i] = Math.random();

                const geometry = new THREE.BufferGeometry();
                geometry.setAttribute('position', form0);
                geometry.setAttribute('aTarget1', form1);
                geometry.setAttribute('aTarget2', form2);
                geometry.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1));

                const material = new THREE.ShaderMaterial({
                    vertexShader: VERTEX,
                    fragmentShader: FRAGMENT,
                    uniforms: {
                        uMorph: { value: 0 },
                        uTime: { value: 0 },
                        uSize: { value: 0.62 },
                        uAssemble: { value: 1 },
                        uColorNear: { value: COLOR_NEAR },
                        uColorFar: { value: COLOR_FAR },
                    },
                    transparent: true,
                    depthWrite: false,
                    blending: THREE.AdditiveBlending,
                });

                const points = new THREE.Points(geometry, material);
                const rig = new THREE.Group();
                rig.add(points);
                scene.add(rig);

                const resize = () => {
                    const { clientWidth: w, clientHeight: h } = mount;
                    if (!w || !h) return;
                    renderer.setSize(w, h, false);
                    camera.aspect = w / h;
                    camera.updateProjectionMatrix();
                    // Menos puntos visibles en pantallas pequenas seria lo ideal;
                    // de momento basta con achicarlos
                    material.uniforms.uSize.value = w < 640 ? 0.46 : 0.62;
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

                const start = performance.now();

                const tick = (now: number) => {
                    raf = requestAnimationFrame(tick);
                    if (!visible) return;

                    const elapsed = (now - start) / 1000;
                    const p = progress.get();

                    material.uniforms.uTime.value = reduced ? 0 : elapsed;
                    // El scroll recorre las tres formas
                    material.uniforms.uMorph.value = Math.min(2, Math.max(0, p * 2));

                    if (!reduced) {
                        rig.rotation.y = elapsed * 0.16;
                        rig.rotation.x = Math.sin(elapsed * 0.21) * 0.18;
                    }

                    renderer.render(scene, camera);
                };
                raf = requestAnimationFrame(tick);

                cleanupScene = () => {
                    sizeObserver.disconnect();
                    visibility.disconnect();
                    geometry.dispose();
                    material.dispose();
                    renderer.dispose();
                    renderer.domElement.remove();
                };
            })
            .catch(() => {
                // Si el binario no carga, la seccion se queda vacia y ya
            });

        return () => {
            disposed = true;
            cancelAnimationFrame(raf);
            cleanupScene?.();
        };
    }, [progress]);

    return <div ref={mountRef} className="h-full w-full" aria-hidden />;
}
