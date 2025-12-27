import * as THREE from 'three';
import vertexShader from './vertex.glsl';
import fragmentShader from './fragment.glsl';
import { setupScrollObserver } from '../utils/scrollObserver';
const getIsIntersecting = setupScrollObserver('.myeffect-target-class');

const canvas = document.querySelector('.myeffect-webgl')
//Sizes
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}
const scene = new THREE.Scene()
const material = new THREE.ShaderMaterial({
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    uniforms:{
        uTime: { value: 0 },
        uResolution: {value: new THREE.Vector2(sizes.width, sizes.height) },
    }
})
const geometry = new THREE.PlaneGeometry(2,2) //2で全画面
const mesh = new THREE.Mesh(geometry, material)
scene.add(mesh)
const camera = new THREE.Camera();
scene.add(camera)
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
})
function handleResize(){
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    material.uniforms.uResolution.value.set(sizes.width, sizes.height);
}

const clock = new THREE.Clock()
let lastTime = 0;
const fps = 30;

const tick = () => {
    if (getIsIntersecting()) {
        const elapsedTime = clock.getElapsedTime();
        const currentTime = new Date().getTime();

        if (currentTime - lastTime >= 1000 / fps) {
            material.uniforms.uTime.value = elapsedTime;
            renderer.render(scene, camera);
            lastTime = currentTime;
        }
    }
    window.requestAnimationFrame(tick);
}
handleResize()
tick()
window.addEventListener('resize', handleResize)
