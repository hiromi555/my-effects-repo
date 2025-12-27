import * as THREE from 'three'
import vertexShader from './vertex.glsl'
import fragmentShader from './fragment.glsl'
import { setupScrollObserver } from '../utils/scrollObserver';
import bgUrl from './bg.jpg?url';

const textContainer = document.querySelector('.myeffect-text-class');
//オブザーバー
const getIsIntersecting = setupScrollObserver('.myeffect-target-class');
const canvas = document.querySelector('.myeffect-webgl')
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}
const scene = new THREE.Scene()
const textureLoader = new THREE.TextureLoader()
const effect2Texture = textureLoader.load(bgUrl)
const geometry = new THREE.PlaneGeometry(2,2)

const maxPositions = 10;
let drawPositions = new Array(maxPositions).fill().map(() => new THREE.Vector2());
let drawTimes = new Array(maxPositions).fill(0);
let drawCount = 0;

const material = new THREE.ShaderMaterial({
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    transparent: true ,
    uniforms:{
        uTime: { value: 0 },
        uTexture: { value: effect2Texture },
        uResolution: {value: new THREE.Vector2(sizes.width, sizes.height) },
        uDrawPositions: { value: drawPositions },
        uDrawTimes: { value: drawTimes },
        uDrawCount: { value: drawCount }
      }
})
const mesh = new THREE.Mesh(geometry, material)
scene.add(mesh)
const camera = new THREE.Camera();
scene.add(camera)
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
//renderer.setClearColor(0x000000, 0.1);
function getMousePos(event) {
    const rect = renderer.domElement.getBoundingClientRect();//キャンバスの境界ボックスを取得
    return {
        x: (event.clientX - rect.left) / rect.width,  //相対座標0から1の範囲に正規化
        y: 1 - (event.clientY - rect.top) / rect.height
    };
}
function getTouchPos(event) {
    const rect = canvas.getBoundingClientRect();
    const touch = event.changedTouches[0];
    return {
        x: (touch.clientX - rect.left) / rect.width,
        y: 1 - (touch.clientY - rect.top) / rect.height
    };
}
function draw(pos) {
    const elapsedTime = clock.getElapsedTime();
    drawPositions[drawCount % maxPositions].set(pos.x, pos.y);
    drawTimes[drawCount % maxPositions] = elapsedTime;// 現在の時間を保存
    drawCount++;
    material.uniforms.uDrawPositions.value = [...drawPositions];
    material.uniforms.uDrawTimes.value = [...drawTimes];
    material.uniforms.uDrawCount.value = Math.min(drawCount, maxPositions);
}

function hideTextContainer() {
    if (textContainer) {
        textContainer.classList.remove('is-show');
    }
}
function showTextContainer() {
    if (textContainer) {
        textContainer.classList.add('is-show');
    }
}
function handleClick(event) {
    const pos = getMousePos(event);
    draw(pos)
    hideTextContainer();
}
function handleTouchEnd(event) {
    const pos = getTouchPos(event);
    draw(pos)
    hideTextContainer();
}
function handleResize(){
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    material.uniforms.uResolution.value.set(sizes.width, sizes.height);
    drawPositions = new Array(maxPositions).fill().map(() => new THREE.Vector2());
    drawTimes = new Array(maxPositions).fill(0);
    material.uniforms.uDrawCount.value = 0;
}
window.addEventListener('resize', handleResize)
window.addEventListener("DOMContentLoaded",showTextContainer)
canvas.addEventListener('click', handleClick, false);
canvas.addEventListener('touchend', handleTouchEnd, false);


// クリック位置が元の状態に戻った場合に、その位置をリセット
function resetExpiredDrawPositions(elapsedTime) {
    const fogTime = 8.0; // 曇るまでの時間
    for (let i = 0; i < drawCount; i++) {
        const timeSinceClick = elapsedTime - drawTimes[i];
        if (timeSinceClick > fogTime) {
            drawPositions[i].set(0, 0); // 位置をリセット
            drawTimes[i] = 0; // 時間をリセット
        }
    }
    material.uniforms.uDrawPositions.value = [...drawPositions];
    material.uniforms.uDrawTimes.value = [...drawTimes];
}
const clock = new THREE.Clock()
const tick = () =>{
    if (getIsIntersecting()){
        const elapsedTime = clock.getElapsedTime()
        material.uniforms.uTime.value = elapsedTime
        if(drawCount>0) resetExpiredDrawPositions(elapsedTime)
        renderer.render(scene, camera)
    }
    window.requestAnimationFrame(tick)
}
handleResize()
tick()
