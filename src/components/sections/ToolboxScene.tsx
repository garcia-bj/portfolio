'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import type { MotionValue } from 'framer-motion';

/**
 * La caja de herramientas: se abre con el scroll y expulsa los logos.
 *
 * Misma tecnica que `StackModule3D`: primitivas + aristas sobre un relleno
 * opaco del color del fondo. Cero assets 3D; los unicos ficheros que carga son
 * los SVG que ya vivian en /public/icons.
 */

/** Solo tecnologias con SVG propio en /public/icons. */
const TOOLS = [
    { name: 'React', icon: '/icons/react_dark.svg' },
    { name: 'Next.js', icon: '/icons/nextjs_icon_dark.svg' },
    { name: 'TypeScript', icon: '/icons/typescript.svg' },
    { name: 'Tailwind', icon: '/icons/tailwindcss.svg' },
    { name: 'Node.js', icon: '/icons/nodejs.svg' },
    { name: 'Python', icon: '/icons/python.svg' },
    { name: 'PostgreSQL', icon: '/icons/postgresql.svg' },
    { name: 'Docker', icon: '/icons/docker.svg' },
    { name: 'Supabase', icon: '/icons/supabase.svg' },
    { name: 'OpenAI', icon: '/icons/openai.svg' },
    { name: 'Claude', icon: '/icons/claude-ai-icon.svg' },
    { name: 'LangGraph', icon: '/icons/langgraph-color.svg' },
    { name: 'Qdrant', icon: '/icons/qdrant-icon-light.svg' },
    { name: 'n8n', icon: '/icons/n8n.svg' },
];

const OCCLUDER = '#010505';
const EDGE = '#5EEAD4';
const EDGE_THRESHOLD = 20;

// Caja
const HALF = 1.5;        // media anchura interior
const WALL = 0.13;
const HEIGHT = 1.5;
const LID_LIFT = 1.78;   // radianes que gira la tapa al abrirse

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const clamp01 = (t: number) => (t < 0 ? 0 : t > 1 ? 1 : t);

/** Convierte un SVG en textura. Se dibuja a un canvas: sirve para cualquier SVG. */
function loadIconTexture(url: string): Promise<THREE.CanvasTexture | null> {
    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            const size = 128;
            const canvas = document.createElement('canvas');
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext('2d');
            if (!ctx) return resolve(null);
            // Tamano explicito: muchos SVG solo traen viewBox, sin width/height
            ctx.drawImage(img, 0, 0, size, size);
            const texture = new THREE.CanvasTexture(canvas);
            texture.colorSpace = THREE.SRGBColorSpace;
            resolve(texture);
        };
        img.onerror = () => resolve(null);
        img.src = url;
    });
}

/** Panel recto con relleno opaco + aristas, como el resto de piezas del sitio. */
function panel(w: number, h: number, d: number) {
    return new THREE.BoxGeometry(w, h, d);
}

function lineArt(geometry: THREE.BufferGeometry) {
    const group = new THREE.Group();

    const fill = new THREE.Mesh(
        geometry,
        new THREE.MeshBasicMaterial({
            color: OCCLUDER,
            polygonOffset: true,
            polygonOffsetFactor: 1,
            polygonOffsetUnits: 1,
        })
    );

    const edges = new THREE.LineSegments(
        new THREE.EdgesGeometry(geometry, EDGE_THRESHOLD),
        new THREE.LineBasicMaterial({ color: EDGE, transparent: true, opacity: 0.92 })
    );

    group.add(fill, edges);
    return { group, fill, edges };
}

export function ToolboxScene({ progress }: { progress: MotionValue<number> }) {
    const mountRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const mount = mountRef.current;
        if (!mount) return;

        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        let disposed = false;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
        camera.position.set(0, 3.4, 11.4);
        camera.lookAt(0, 1.15, 0);

        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        mount.appendChild(renderer.domElement);
        renderer.domElement.style.width = '100%';
        renderer.domElement.style.height = '100%';
        renderer.domElement.style.display = 'block';

        const rig = new THREE.Group();
        rig.rotation.y = -0.42;
        scene.add(rig);

        // --- Cuerpo de la caja: cuatro paredes y un suelo, fusionados ---
        const walls: THREE.BufferGeometry[] = [];
        const outer = HALF + WALL;

        const front = panel(outer * 2, HEIGHT, WALL).translate(0, HEIGHT / 2, outer - WALL / 2);
        const back = panel(outer * 2, HEIGHT, WALL).translate(0, HEIGHT / 2, -outer + WALL / 2);
        const left = panel(WALL, HEIGHT, outer * 2 - WALL * 2).translate(-outer + WALL / 2, HEIGHT / 2, 0);
        const right = panel(WALL, HEIGHT, outer * 2 - WALL * 2).translate(outer - WALL / 2, HEIGHT / 2, 0);
        const floor = panel(outer * 2, WALL, outer * 2).translate(0, WALL / 2, 0);
        walls.push(front, back, left, right, floor);

        const bodyGeometry = mergeGeometries(walls, false)!;
        for (const w of walls) w.dispose();
        const body = lineArt(bodyGeometry);
        rig.add(body.group);

        // --- Tapa: pivota sobre la bisagra del borde trasero ---
        const hinge = new THREE.Group();
        hinge.position.set(0, HEIGHT, -outer);
        rig.add(hinge);

        const lidGeometry = panel(outer * 2, WALL, outer * 2).translate(0, WALL / 2, outer);
        const lid = lineArt(lidGeometry);
        hinge.add(lid.group);

        // --- Logos: sprites que salen despedidos de dentro ---
        type Tool = {
            sprite: THREE.Sprite;
            from: THREE.Vector3;
            to: THREE.Vector3;
            delay: number;
            spin: number;
        };
        const tools: Tool[] = [];

        TOOLS.forEach((tool, i) => {
            const t = i / (TOOLS.length - 1);
            // Abanico de izquierda a derecha pasando por arriba: se lee como una
            // fuente, no como un anillo aplastado por la perspectiva.
            const angle = Math.PI - t * Math.PI;
            // Tres coronas: dos logos seguidos nunca caen a la misma distancia
            const tier = i % 3;
            const radius = 3.4 + tier * 0.85;

            const from = new THREE.Vector3(
                (Math.random() - 0.5) * HALF,
                0.35,
                (Math.random() - 0.5) * HALF
            );
            const to = new THREE.Vector3(
                Math.cos(angle) * radius * 1.3,
                0.85 + Math.sin(angle) * radius * 0.62,
                // Delante de la caja: la tapa abierta no los tapa
                0.7 + tier * 0.45
            );

            const sprite = new THREE.Sprite(
                new THREE.SpriteMaterial({ transparent: true, opacity: 0, depthWrite: false })
            );
            sprite.position.copy(from);
            sprite.scale.setScalar(0.001);
            rig.add(sprite);

            tools.push({ sprite, from, to, delay: t * 0.42, spin: tier - 1 });

            loadIconTexture(tool.icon).then((texture) => {
                if (disposed || !texture) return;
                sprite.material.map = texture;
                sprite.material.needsUpdate = true;
            });
        });

        const resize = () => {
            const { clientWidth: w, clientHeight: h } = mount;
            if (!w || !h) return;
            renderer.setSize(w, h, false);
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
        };
        resize();
        const sizeObserver = new ResizeObserver(resize);
        sizeObserver.observe(mount);

        // Solo dibujamos cuando la escena esta en pantalla
        let visible = false;
        const visibility = new IntersectionObserver(
            ([entry]) => { visible = entry.isIntersecting; },
            { rootMargin: '200px' }
        );
        visibility.observe(mount);

        let raf = 0;

        const tick = (now: number) => {
            raf = requestAnimationFrame(tick);
            if (!visible) return;

            const p = progress.get();

            // La caja se balancea despacio: nunca se queda del todo quieta
            if (!reduced) rig.rotation.y = -0.42 + Math.sin(now / 3400) * 0.22;

            // La tapa abre en el primer tramo del scroll
            hinge.rotation.x = -LID_LIFT * easeOut(clamp01(p / 0.32));

            // Los logos salen escalonados
            for (const tool of tools) {
                const local = easeOut(clamp01((p - tool.delay) / (1 - tool.delay - 0.1)));
                tool.sprite.position.lerpVectors(tool.from, tool.to, local);
                // Arco: sube de mas a mitad de camino, como si lo lanzaran
                tool.sprite.position.y += Math.sin(local * Math.PI) * 0.7;
                tool.sprite.scale.setScalar(0.001 + local * 0.78);
                tool.sprite.material.opacity = clamp01(local * 2.4);
                if (!reduced) tool.sprite.position.y += Math.sin(now / 900 + tool.spin) * 0.05 * local;
            }

            renderer.render(scene, camera);
        };
        raf = requestAnimationFrame(tick);

        return () => {
            disposed = true;
            cancelAnimationFrame(raf);
            sizeObserver.disconnect();
            visibility.disconnect();
            for (const piece of [body, lid]) {
                piece.fill.geometry.dispose();
                (piece.fill.material as THREE.Material).dispose();
                piece.edges.geometry.dispose();
                (piece.edges.material as THREE.Material).dispose();
            }
            for (const tool of tools) {
                tool.sprite.material.map?.dispose();
                tool.sprite.material.dispose();
            }
            renderer.dispose();
            renderer.domElement.remove();
        };
    }, [progress]);

    return <div ref={mountRef} className="h-full w-full" aria-hidden />;
}
