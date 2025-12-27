import * as THREE from 'three';
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import vertexShader from './vertex.glsl'
import fragmentShader from './fragment.glsl'
import { setupSizes, setupScene, setupCamera, setupRenderer} from '../utils/setup.js';
import { updateModel } from '../utils/modelHelper.js';
import { createRaycaster } from '../utils/raycasterHelper.js';
import { setupScrollObserver } from '../utils/scrollObserver';
import bg2Url from './bg2.jpg?url';
import bphoneUrl from './phone.glb?url';

// CanvasをテクスチャとしてThree.jsに渡す
const canvas = document.createElement('canvas');
const context = canvas.getContext('2d');
context.translate(canvas.width, 0);
context.scale(-1, 1);
context.fillStyle = 'black';
context.fillRect(0, 0, canvas.width, canvas.height);
context.font = '22px sans-serif';
context.fillStyle = 'white';
context.textAlign = 'center';
context.textBaseline = 'middle';
context.fillText('画面タップで', canvas.width / 2, canvas.height / 4.25);
context.fillText('スクリーンセーバーを', canvas.width / 2, canvas.height / 2.5);
context.fillText('切り替え', canvas.width / 2, canvas.height / 1.8);
context.fillText('スクロールで消去', canvas.width / 2, canvas.height / 1.25);
const messageTexture = new THREE.CanvasTexture(canvas);

//モデルのサイズの基準点
const MAX_SCALE_WIDTH = 600;

const textureLoader = new THREE.TextureLoader()
const effect4Texture = textureLoader.load(bg2Url)
//オブサーバー
const getIsIntersecting = setupScrollObserver('.myeffect-target-class');
//セットアップ
const sizes = setupSizes(MAX_SCALE_WIDTH);
const { scene, renderer } = setupScene("canvas.myeffect-webgl");
const camera = setupCamera(scene, sizes);
//ライト
function setupLights() {
    const directionalLight = new THREE.DirectionalLight(0xffffff, 100);
    directionalLight.position.set(10, -3, 7);
    scene.add(directionalLight);
}
//モデルの位置
const { getIntersections } = createRaycaster(scene);
const gltfLoader = new GLTFLoader();
let colorIndex = 0;
const maxColors = 4;
const shaderMaterial = new THREE.ShaderMaterial({
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    uniforms:{
        uTime: { value: 0 },
        uTexture: { value: effect4Texture },
        uMessageTexture: { value: messageTexture },
        uIsClicked: { value: false } ,
        colorIndex: { value: colorIndex }
    }
})
let phone, shaderMesh;
function loadModel() {
    gltfLoader.load(bphoneUrl, (gltf) => {
        phone = gltf.scene;
        phone.rotation.y = -0.4;
        shaderMesh = phone.children[0].children[3]
        shaderMesh.material = shaderMaterial;
        updateModel(phone, sizes.scaleRatio, sizes.aspectRatio, [1, 1.2]);
        scene.add(phone);
        addEventListeners();
    }, undefined, (error) => {
        console.error('An error occurred loading the model:', error);
    });
}

function addEventListeners() {
    window.addEventListener('mousemove', updatePointer);
    window.addEventListener('touchmove', updatePointer);
    window.addEventListener('click', onPointerClick);
    window.addEventListener("resize", handleResize);
}
function updatePointer(event) {
    const intersections = getIntersections(event, camera);
    document.body.classList.toggle('myeffect-pointer', intersections.length > 0);
}
function onPointerClick(event) {
    const intersections = getIntersections(event, camera);
    if (intersections.length > 0) {
        shaderMaterial.uniforms.uIsClicked.value = true;
        colorIndex = (colorIndex + 1) % maxColors;
        shaderMaterial.uniforms.colorIndex.value = colorIndex;
    }
}

function handleResize(){
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    updateModel(phone, sizes.scaleRatio, sizes.aspectRatio, [1, 1.2]);
}
const clock = new THREE.Clock()
function tick() {
  const elapsedTime = clock.getElapsedTime()
  shaderMaterial.uniforms.uTime.value = elapsedTime
  if (getIsIntersecting()) {
    renderer.render(scene, camera);
  }
  window.requestAnimationFrame(tick)
}

function init() {
    handleResize();
    setupRenderer(renderer, sizes);
    setupLights();
    loadModel();
    tick();
}
init();
