import { Scene, WebGLRenderer, PerspectiveCamera } from 'three';

export function setupSizes(maxScaleWidth) {
    return {
        width: window.innerWidth,
        height: window.innerHeight,
        aspectRatio: window.innerWidth / window.innerHeight,
        scaleRatio: Math.min(window.innerWidth / maxScaleWidth, 1)
    };
}

export function setupScene(canvasSelector, clearColor = 0x000000, alpha = true, antialias = true) {
    const canvas = document.querySelector(canvasSelector);
    if (!canvas) {
        console.error(`Canvas element not found: ${canvasSelector}`);
        return null;
    }
    const scene = new Scene();
    const renderer = new WebGLRenderer({ canvas, alpha, antialias });
    renderer.setClearColor(clearColor, 0);
    return { scene, renderer };
}

export function setupCamera(scene, sizes, fov = 35, near = 0.1, far = 100, positionZ = 10) {
    const camera = new PerspectiveCamera(fov, sizes.width / sizes.height, near, far);
    camera.position.z = positionZ;
    scene.add(camera);
    return camera;
}

export function setupRenderer(renderer, sizes) {
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
}

