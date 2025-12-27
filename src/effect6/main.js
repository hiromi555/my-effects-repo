import * as THREE from 'three'
import gsap from 'gsap'
import vertexShader from './vertex.glsl'
import fragmentShader from './fragment.glsl'
import vertexShader2 from './vertex2.glsl'
import fragmentShader2 from './fragment2.glsl'
import { setupScrollObserver2 } from '../utils/scrollObserver'
import fUrl from './f.png?url';
// Canvas
const c = document.createElement('canvas');
c.width = 256;
c.height = 256;
const ctx = c.getContext('2d');

const canvas = document.querySelector('.myeffect-webgl')
// サイズ設定
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
    pixelRatio : Math.min(window.devicePixelRatio, 2)
}
sizes.resolution = new THREE.Vector2(sizes.width*sizes.pixelRatio, sizes.height*sizes.pixelRatio)
// Three.jsの設定
const scene = new THREE.Scene()
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(sizes.pixelRatio)
renderer.setClearColor(0x000000, 0.5);

const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(0, 0, 1)
scene.add(camera)

// Raycaster
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2(9999,9999);
const canvasPointer = new THREE.Vector2()
window.addEventListener('pointermove', (event) => {
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
});
// PlaneとTexture設定
const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(1, 1),
    new THREE.MeshBasicMaterial({ side: THREE.DoubleSide })
)
plane.visible = false
scene.add(plane)
const canvasTexture = new THREE.CanvasTexture(c);

const textureLoader = new THREE.TextureLoader()
const texture = textureLoader.load(fUrl);

const geometry = new THREE.PlaneGeometry(1, 1, 1024, 1024)
geometry.setIndex(null)
geometry.deleteAttribute('normal')
const intensitiesArray = new Float32Array(geometry.attributes.position.count)
const anglesArray = new Float32Array(geometry.attributes.position.count)
for(let i = 0; i <geometry.attributes.position.count; i++){
    intensitiesArray[i] = Math.random()
    anglesArray[i] = Math.random() * Math.PI * 2
}
geometry.setAttribute('aIntensity', new THREE.BufferAttribute(intensitiesArray, 1))
geometry.setAttribute('aAngle', new THREE.BufferAttribute(anglesArray, 1))

const material = new THREE.ShaderMaterial({
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    uniforms: {
        uResolution: { value: sizes.resolution },
        uTexture: { value: texture },
        uCanvasTexture: { value: canvasTexture },
    }
})
const particles = new THREE.Points(geometry, material)
scene.add(particles)
// スクロールイベント
window.addEventListener("scroll", () => {
    const scrollY = window.scrollY;
    particles.position.z = plane.position.z = -scrollY / sizes.height;
    particles.rotation.y = plane.rotation.y = -scrollY / sizes.height;
});

// 3Dパーティクル設定
const geometry2 = new THREE.BufferGeometry()
const count = 500;
const positions = new Float32Array(count * 3)
const colors = new Float32Array(count * 3)
const scales = new Float32Array(count)
const timeMultipliersArray = new Float32Array(count)
const radius = 0.65;
const goldenRatio = (1 + Math.sqrt(5)) / 2;
for (let i = 0; i < count; i++) {
    const theta = 2 * Math.PI * i / goldenRatio;
    const phi = Math.acos(1 - 2 * (i + 0.5) / count);
    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.sin(theta);
    positions[i * 3    ] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;
    colors[i * 3    ] =  0.7 + Math.random() * 0.2;
    colors[i * 3 + 1] =  Math.random() * 0.5;
    colors[i * 3 + 2] =  0.5 + Math.random() * 0.5;
    scales[i] =Math.random();
    timeMultipliersArray[i] = 1 + Math.random();
}

geometry2.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
geometry2.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
geometry2.setAttribute('aScale', new THREE.Float32BufferAttribute(scales, 1));
geometry2.setAttribute('aTimeMultiplier', new THREE.Float32BufferAttribute(timeMultipliersArray, 1))
const material2 = new THREE.ShaderMaterial({
    uniforms:{
       uSize: { value: 0.016 },
       uResolution: { value: sizes.resolution },
       uProgress: { value: 0 },
    },
   vertexColors: true,
   transparent: true,
   depthWrite: false,
   blending: THREE.AdditiveBlending,
   vertexShader: vertexShader2,
   fragmentShader: fragmentShader2
})
 // GSAPアニメーションを開始
const posZ = sizes.resolution.y > sizes.resolution.x ? 0.2 : 0.5;
const cameraZ = sizes.width > 900 ? 1 : 1.5;
let initialAngle = 0;
gsap.to(material2.uniforms.uProgress, {
        value: 1,
        duration: 5,
        ease: "linear",
    onUpdate: () => {
        const speed = 0.01;
        const progress = material2.uniforms.uProgress.value;
        initialAngle += speed;
        camera.position.x =  cameraZ * Math.cos(initialAngle);
        camera.position.z =  cameraZ * Math.sin(initialAngle);
        if (progress >= 0.9) {
            const normalizedProgress = (progress - 0.9) / 0.1;
            camera.position.set(0, 0, 1 - posZ * normalizedProgress);
        }
         camera.lookAt( new THREE.Vector3(0, 0, 0));
    },
    onComplete: () => {
        scene.remove(particles2);
        geometry2.dispose();
        material2.dispose();
    },
});


const particles2 = new THREE.Points(geometry2, material2);
scene.add(particles2)
// リサイズ処理
function handleResize(){
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight
    sizes.pixelRatio = Math.min(window.devicePixelRatio, 2)
    sizes.resolution.set(sizes.width*sizes.pixelRatio, sizes.height*sizes.pixelRatio)
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(sizes.pixelRatio)
}
// アニメーションループ
let lastTime = 0;
const fps = 30;
const interval = 1000 / fps; // 1秒あたりのフレーム数からインターバルを計算
const tick = (time) => {
    if (time - lastTime >= interval) {
        lastTime = time;

        raycaster.setFromCamera(pointer, camera);
        const intersects = raycaster.intersectObject(plane);
        document.body.classList.toggle('myeffect-pointer', intersects.length > 0);
        canvasTexture.needsUpdate = true;
        renderer.render(scene, camera);
        ctx.globalAlpha = 0.05;
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, c.width, c.height);

        if (intersects.length > 0) {
            const uv = intersects[0].uv;
            canvasPointer.x = uv.x * c.width;
            canvasPointer.y = (1 - uv.y) * c.height;

            ctx.globalAlpha = 1;
            ctx.fillStyle = 'white';
            ctx.fillRect(canvasPointer.x, canvasPointer.y, c.width / 5, c.height / 5);
        }
    }
   // window.requestAnimationFrame(tick);
};
const startRendering = () => {
    renderer.setAnimationLoop(tick);  // レンダリングループ開始
};
const stopRendering = () => {
    renderer.setAnimationLoop(null);  // レンダリングループ停止
};
setupScrollObserver2('.myeffect-target-class', startRendering, stopRendering);

handleResize()
//tick()
window.addEventListener('resize', handleResize)
//リロード時にスクロール位置を自動的に復元することを防ぐ
window.history.scrollRestoration = 'manual';
