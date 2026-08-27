'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import type { MotionValue } from 'framer-motion';

/**
 * El dragon como malla solida. El contraste del experimento.
 *
 * Aqui SI viajan las caras, las normales y los colores de vertice. A cambio de
 * peso obtienes lo que la nube no puede dar: silueta, sombreado y oclusion
 * —las patas de delante tapan las de detras—.
 *
 *     nube de puntos  ->  159 KB   sin superficie
 *     malla solida    ->  289 KB   con superficie   (+ 250 KB de decodificador)
 *
 * Sin Draco el .glb pesaba 2 MB: los colores por vertice van en float y no hay
 * reuso de vertices. Draco lo baja siete veces, a cambio de cargar un
 * decodificador wasm que se cachea y sirve para cualquier otro modelo.
 */

const MODEL = '/3d/dragon-solid.glb';

export function DragonSolidScene({ progress }: { progress: MotionValue<number> }) {
    const mountRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const mount = mountRef.current;
        if (!mount) return;

        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        let disposed = false;
        let raf = 0;

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

        // Sin luces, un material sombreado sale negro
        scene.add(new THREE.AmbientLight(0xffffff, 1.1));
        const key = new THREE.DirectionalLight(0xffffff, 2.4);
        key.position.set(-3, 5, 6);
        scene.add(key);
        const rim = new THREE.DirectionalLight(0x5eead4, 1.6);
        rim.position.set(4, 1, -5);
        scene.add(rim);

        const rig = new THREE.Group();
        scene.add(rig);

        const draco = new DRACOLoader();
        draco.setDecoderPath('/draco/');
        const loader = new GLTFLoader();
        loader.setDRACOLoader(draco);

        let model: THREE.Object3D | null = null;

        loader.load(MODEL, (gltf) => {
            if (disposed) return;
            model = gltf.scene;
            model.traverse((child) => {
                if (!(child instanceof THREE.Mesh)) return;
                child.material = new THREE.MeshStandardMaterial({
                    vertexColors: true,   // el color va en la malla, no en textura
                    roughness: 0.68,
                    metalness: 0.05,
                    flatShading: false,
                });
            });
            model.position.y = -1.25;
            rig.add(model);
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

            if (model) {
                // Mismo movimiento que la nube, para que la comparacion sea justa
                if (!reduced) rig.rotation.y = -0.5 + Math.sin(elapsed * 0.14) * 0.55;
                const entrance = Math.min(1, p * 2.6);
                rig.scale.setScalar(0.3 + entrance * 0.7);
                model.position.y = -1.25 + (1 - entrance) * 0.8;
            }

            renderer.render(scene, camera);
        };
        raf = requestAnimationFrame(tick);

        return () => {
            disposed = true;
            cancelAnimationFrame(raf);
            sizeObserver.disconnect();
            visibility.disconnect();
            model?.traverse((child) => {
                if (!(child instanceof THREE.Mesh)) return;
                child.geometry.dispose();
                (child.material as THREE.Material).dispose();
            });
            draco.dispose();
            renderer.dispose();
            renderer.domElement.remove();
        };
    }, [progress]);

    return <div ref={mountRef} className="h-full w-full" aria-hidden />;
}
