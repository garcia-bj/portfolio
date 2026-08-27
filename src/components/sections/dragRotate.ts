/**
 * Girar un objeto 3D arrastrando con el raton o el dedo.
 *
 * Deliberadamente NO usa `OrbitControls` de three.js: ese captura la rueda para
 * hacer zoom, y dentro de una pagina eso significa que el usuario **no puede
 * seguir scrolleando** cuando el cursor cae sobre el canvas. Aqui solo se
 * escucha el arrastre.
 *
 * En movil, `touch-action: pan-y` deja pasar el scroll vertical: el dedo gira
 * el objeto solo cuando se mueve en horizontal.
 */

const SENSITIVITY = 0.0065;
const MAX_PITCH = 0.65;      // radianes: mas que esto y se ve por debajo
const RETURN_SPEED = 0.9;    // cuanto vuelve por segundo al soltar

export type DragRotate = {
    /** Desfase acumulado, en radianes */
    readonly offset: { x: number; y: number };
    /** Llamar cada frame: relaja el desfase vertical cuando no se arrastra */
    update(delta: number): void;
    dispose(): void;
};

export function createDragRotate(target: HTMLElement): DragRotate {
    const offset = { x: 0, y: 0 };
    let dragging = false;
    let lastX = 0;
    let lastY = 0;

    const down = (event: PointerEvent) => {
        dragging = true;
        lastX = event.clientX;
        lastY = event.clientY;
        target.style.cursor = 'grabbing';
        try {
            target.setPointerCapture(event.pointerId);
        } catch {
            /* algunos navegadores lo rechazan en punteros sinteticos */
        }
    };

    const move = (event: PointerEvent) => {
        if (!dragging) return;
        offset.y += (event.clientX - lastX) * SENSITIVITY;
        offset.x += (event.clientY - lastY) * SENSITIVITY * 0.8;
        offset.x = Math.max(-MAX_PITCH, Math.min(MAX_PITCH, offset.x));
        lastX = event.clientX;
        lastY = event.clientY;
    };

    const up = (event: PointerEvent) => {
        dragging = false;
        target.style.cursor = 'grab';
        try {
            target.releasePointerCapture(event.pointerId);
        } catch {
            /* ignorado */
        }
    };

    target.style.cursor = 'grab';
    target.style.touchAction = 'pan-y';
    target.addEventListener('pointerdown', down);
    target.addEventListener('pointermove', move);
    target.addEventListener('pointerup', up);
    target.addEventListener('pointercancel', up);

    return {
        offset,
        update(delta: number) {
            // El cabeceo vuelve solo al soltar; el giro horizontal se queda
            if (dragging) return;
            offset.x -= offset.x * Math.min(delta * RETURN_SPEED, 1);
        },
        dispose() {
            target.removeEventListener('pointerdown', down);
            target.removeEventListener('pointermove', move);
            target.removeEventListener('pointerup', up);
            target.removeEventListener('pointercancel', up);
            target.style.cursor = '';
            target.style.touchAction = '';
        },
    };
}
