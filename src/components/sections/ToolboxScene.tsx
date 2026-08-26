'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import type { MotionValue } from 'framer-motion';
import chest from '@/data/chest-parts.json';

/**
 * El cofre: se abre con el scroll y expulsa los logos.
 *
 * La geometria NO esta escrita aqui. Sale de `src/data/chest-parts.json`, que
 * genera `3d/build_treasure_chest.py` desde Blender. Blender es el taller; el
 * JSON es la lista de piezas (medidas + material); esto solo la monta. Asi no
 * hay dos fuentes de verdad que se desincronicen, y pesa 16 KB en vez de los
 * cientos de un .glb.
 *
 * A diferencia del resto del sitio, esta pieza SI va con color: madera, hierro
 * y laton, sombreados con luz real. La arista oscura la mantiene emparentada
 * con el trazo del modulo del stack.
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

const EDGE_THRESHOLD = 25;
const LID_LIFT = 1.92;   // radianes que gira la tapa al abrirse

/** Los tres materiales del cofre. El borde oscuro le da el aire grafico. */
const MATERIALS: Record<string, { color: number; edge: number }> = {
    wood: { color: 0x8a5a2b, edge: 0x2b1a0c },
    iron: { color: 0x2f3a42, edge: 0x121a20 },
    brass: { color: 0xc9a227, edge: 0x4d3c08 },
};

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

type Part = {
    type: string;
    pos: number[];
    group: string;
    mat: string;
    size?: number[];
    rot?: number[];
    r?: number;
    h?: number;
    axis?: string;
};

/** Una pieza del JSON -> una geometria ya colocada en su sitio. */
function partGeometry(part: Part): THREE.BufferGeometry {
    const [x, y, z] = part.pos;

    if (part.type === 'box') {
        const [w, h, d] = part.size!;
        const geometry = new THREE.BoxGeometry(w, h, d);
        const [rx, ry, rz] = part.rot ?? [0, 0, 0];
        if (rx) geometry.rotateX(rx);
        if (ry) geometry.rotateY(ry);
        if (rz) geometry.rotateZ(rz);
        return geometry.translate(x, y, z);
    }

    // Cilindro: en three.js nace sobre el eje Y
    const geometry = new THREE.CylinderGeometry(part.r, part.r, part.h, 14);
    if (part.axis === 'x') geometry.rotateZ(Math.PI / 2);
    if (part.axis === 'z') geometry.rotateX(Math.PI / 2);
    return geometry.translate(x, y, z);
}

/**
 * Fusiona las piezas de un grupo que comparten material.
 *
 * Sin esto serian 145 draw calls: una por tabla, fleje y remache. Asi quedan
 * seis mallas (cuerpo y tapa x madera, hierro y laton).
 */
function buildGroup(group: 'body' | 'lid') {
    const holder = new THREE.Group();
    const created: { geometry: THREE.BufferGeometry; material: THREE.Material }[] = [];

    for (const [name, tone] of Object.entries(MATERIALS)) {
        const parts = (chest.parts as Part[]).filter((p) => p.group === group && p.mat === name);
        if (!parts.length) continue;

        const geometries = parts.map(partGeometry);
        const merged = mergeGeometries(geometries, false)!;
        for (const g of geometries) g.dispose();

        const material = new THREE.MeshLambertMaterial({
            color: tone.color,
            polygonOffset: true,
            polygonOffsetFactor: 1,
            polygonOffsetUnits: 1,
        });
        const mesh = new THREE.Mesh(merged, material);

        const edgeGeometry = new THREE.EdgesGeometry(merged, EDGE_THRESHOLD);
        const edgeMaterial = new THREE.LineBasicMaterial({
            color: tone.edge,
            transparent: true,
            opacity: 0.55,
        });
        const edges = new THREE.LineSegments(edgeGeometry, edgeMaterial);

        holder.add(mesh, edges);
        created.push({ geometry: merged, material }, { geometry: edgeGeometry, material: edgeMaterial });
    }

    return { group: holder, created };
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
        camera.position.set(0, 3.5, 11.6);
        camera.lookAt(0, 1.1, 0);

        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        mount.appendChild(renderer.domElement);
        renderer.domElement.style.width = '100%';
        renderer.domElement.style.height = '100%';
        renderer.domElement.style.display = 'block';

        // MeshLambertMaterial necesita luz: sin esto el cofre saldria negro
        scene.add(new THREE.AmbientLight(0xffffff, 1.9));
        const key = new THREE.DirectionalLight(0xffffff, 2.1);
        key.position.set(-4, 7, 8);
        scene.add(key);
        const rim = new THREE.DirectionalLight(0x5eead4, 0.9);
        rim.position.set(5, 2, -6);
        scene.add(rim);

        const rig = new THREE.Group();
        rig.rotation.y = -0.42;
        scene.add(rig);

        const body = buildGroup('body');
        rig.add(body.group);

        // La tapa cuelga de una bisagra en el borde trasero
        const hinge = new THREE.Group();
        hinge.position.set(0, chest.height, -chest.halfDepth);
        rig.add(hinge);

        const lid = buildGroup('lid');
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
            const radius = 3.5 + tier * 0.85;

            const from = new THREE.Vector3(
                (Math.random() - 0.5) * chest.halfWidth,
                0.5,
                (Math.random() - 0.5) * chest.halfDepth
            );
            const to = new THREE.Vector3(
                Math.cos(angle) * radius * 1.3,
                1.15 + Math.sin(angle) * radius * 0.62,
                // Delante de la caja: la tapa abierta no los tapa
                chest.halfDepth * 0.7 + tier * 0.45
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
            for (const piece of [...body.created, ...lid.created]) {
                piece.geometry.dispose();
                piece.material.dispose();
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
