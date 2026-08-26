'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import type { MotionValue } from 'framer-motion';

/**
 * El modulo del stack en 3D real.
 *
 * Se construye con las MISMAS primitivas que `3d/build_stack_module.py`
 * (cilindros, toros y cubos), asi que no hace falta ningun `.glb`: cero peso de
 * asset. Blender sigue siendo donde se disena y previsualiza la pieza; aqui se
 * dibuja.
 *
 * Sustituye a la secuencia de 40 imagenes (1.044 KB) por three.js (182 KB gzip).
 * Ademas de pesar menos, permite separar dos movimientos que una secuencia de
 * imagenes no puede: el giro continuo y el despiece ligado al scroll.
 */

type Kind = 'disc' | 'ring' | 'knurl' | 'bolts';

/** Geometria de cada capa. El orden y el numero coinciden con `categories`. */
const SPECS: { kind: Kind; radius: number; height: number }[] = [
    { kind: 'disc', radius: 1.58, height: 0.18 },
    { kind: 'knurl', radius: 1.26, height: 0.34 },
    { kind: 'ring', radius: 1.46, height: 0.20 },
    { kind: 'bolts', radius: 1.18, height: 0.30 },
    { kind: 'knurl', radius: 1.38, height: 0.38 },
    { kind: 'ring', radius: 1.12, height: 0.18 },
    { kind: 'disc', radius: 1.30, height: 0.22 },
    { kind: 'bolts', radius: 1.52, height: 0.28 },
];

const GAP_ASSEMBLED = 0.06;
const GAP_EXPLODED = 0.52;
const EDGE_THRESHOLD = 28;   // grados: por debajo, la arista no se dibuja
/** Color del relleno opaco que oculta las lineas traseras. Es el fondo del sitio. */
const OCCLUDER = '#010505';

/**
 * Una capa = relleno opaco + aristas.
 *
 * El relleno no se ve (va del color del fondo), pero escribe en el buffer de
 * profundidad y **oculta las lineas de la cara trasera**. Sin el, el objeto se
 * ve transparente como una jaula de alambre; con el, se lee como el trazo que
 * generaba Freestyle en Blender.
 */
function buildLayer(spec: (typeof SPECS)[number], color: string) {
    const { kind, radius, height } = spec;
    const parts: THREE.BufferGeometry[] = [];

    if (kind === 'ring') {
        parts.push(new THREE.TorusGeometry(radius, height * 0.5, 10, 56).rotateX(Math.PI / 2));
    } else {
        parts.push(new THREE.CylinderGeometry(radius, radius, height, 56));
    }

    if (kind === 'knurl') {
        // Corona de dientes: la silueta rica es lo que hace legible el trazo
        const teeth = 28;
        for (let i = 0; i < teeth; i++) {
            const angle = (Math.PI * 2 * i) / teeth;
            const tooth = new THREE.BoxGeometry(radius * 0.11, height * 0.85, radius * 0.05);
            tooth.rotateY(-angle);
            tooth.translate(Math.cos(angle) * radius * 1.02, 0, Math.sin(angle) * radius * 1.02);
            parts.push(tooth);
        }
    }

    if (kind === 'bolts') {
        const bolts = 8;
        for (let i = 0; i < bolts; i++) {
            const angle = (Math.PI * 2 * i) / bolts;
            const bolt = new THREE.CylinderGeometry(height * 0.22, height * 0.22, height * 1.4, 10);
            bolt.translate(Math.cos(angle) * radius * 0.68, 0, Math.sin(angle) * radius * 0.68);
            parts.push(bolt);
        }
    }

    const solid = mergeGeometries(parts, false);
    for (const part of parts) part.dispose();

    const group = new THREE.Group();

    const fill = new THREE.Mesh(
        solid,
        new THREE.MeshBasicMaterial({
            color: OCCLUDER,
            polygonOffset: true,      // empuja el relleno hacia atras para que
            polygonOffsetFactor: 1,   // las aristas no parpadeen sobre el
            polygonOffsetUnits: 1,
        })
    );

    const edges = new THREE.LineSegments(
        new THREE.EdgesGeometry(solid, EDGE_THRESHOLD),
        new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.95 })
    );

    group.add(fill, edges);
    return { group, fill, edges };
}

export function StackModule3D({
    progress,
    colors,
    drift,
}: {
    progress: MotionValue<number>;
    colors: string[];
    /** Desplazamiento lateral objetivo, de -1 (izquierda) a 1 (derecha) */
    drift: number;
}) {
    const mountRef = useRef<HTMLDivElement>(null);
    const driftRef = useRef(drift);
    driftRef.current = drift;

    useEffect(() => {
        const mount = mountRef.current;
        if (!mount) return;

        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
        camera.position.set(0, 1.4, 11.5);
        camera.lookAt(0, 0, 0);

        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        mount.appendChild(renderer.domElement);
        renderer.domElement.style.width = '100%';
        renderer.domElement.style.height = '100%';
        renderer.domElement.style.display = 'block';

        // rig: gira. shell: se desplaza de lado. Separados para que un movimiento
        // no interfiera con el otro.
        const shell = new THREE.Group();
        const rig = new THREE.Group();
        shell.add(rig);
        scene.add(shell);
        rig.rotation.x = 0.32;

        const totalHeight = SPECS.reduce((n, s) => n + s.height, 0);
        let cursor = -totalHeight / 2;
        const layers = SPECS.map((spec, i) => {
            const built = buildLayer(spec, colors[i] ?? '#0FB9B1');
            const assembled = cursor + spec.height / 2;
            cursor += spec.height + GAP_ASSEMBLED;
            rig.add(built.group);
            return { ...built, assembled, spread: (i - SPECS.length / 2) * GAP_EXPLODED };
        });

        const resize = () => {
            const { clientWidth: w, clientHeight: h } = mount;
            if (!w || !h) return;
            renderer.setSize(w, h, false);
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
        };
        resize();
        const observer = new ResizeObserver(resize);
        observer.observe(mount);

        // Solo dibujamos cuando el modulo esta en pantalla
        let visible = false;
        const visibility = new IntersectionObserver(
            ([entry]) => { visible = entry.isIntersecting; },
            { rootMargin: '200px' }
        );
        visibility.observe(mount);

        let raf = 0;
        let last = performance.now();
        let driftCurrent = driftRef.current;

        const tick = (now: number) => {
            raf = requestAnimationFrame(tick);
            const delta = Math.min((now - last) / 1000, 0.05);
            last = now;
            if (!visible) return;

            const p = progress.get();

            // Giro continuo: no depende del scroll, por eso nunca se queda quieto
            if (!reduced) rig.rotation.y += delta * 0.28;

            // Despiece ligado al scroll
            for (const layer of layers) {
                layer.group.position.y = layer.assembled + layer.spread * p;
            }

            // Deriva lateral suavizada hacia el lado que toca
            driftCurrent += (driftRef.current - driftCurrent) * Math.min(delta * 3.2, 1);
            shell.position.x = driftCurrent * 1.5;
            shell.rotation.z = driftCurrent * -0.05;

            renderer.render(scene, camera);
        };
        raf = requestAnimationFrame(tick);

        return () => {
            cancelAnimationFrame(raf);
            observer.disconnect();
            visibility.disconnect();
            for (const layer of layers) {
                layer.fill.geometry.dispose();
                (layer.fill.material as THREE.Material).dispose();
                layer.edges.geometry.dispose();
                (layer.edges.material as THREE.Material).dispose();
            }
            renderer.dispose();
            renderer.domElement.remove();
        };
        // `colors` es estable (viene de una constante de modulo)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [progress]);

    return <div ref={mountRef} className="h-full w-full" aria-hidden />;
}
