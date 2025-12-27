import { setupScrollObserver } from '../utils/scrollObserver';
import { setupSizes, setupScene, setupCamera, setupRenderer} from '../utils/setup.js';
import { updateModel } from '../utils/modelHelper.js';
import { createRaycaster } from '../utils/raycasterHelper.js';
import { MeshBasicMaterial, Clock, DirectionalLight,AnimationMixer } from 'three'
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import robotModelUrl from './robot.glb?url';

//定数
const initialPositionY = -2.75;
const initialRotationY = -0.3;
const materialList = [
    new MeshBasicMaterial({ color: 0xee0000 }),
    new MeshBasicMaterial({ color: 0x00eeee }),
    new MeshBasicMaterial({ color: 0xffff00 })
];
const textList = ['激おこモード', 'ハイテンション', '観察モード'];
const colorList = ['#ee0000', '#00eeee', '#ffff00'];
const MAX_SCALE_WIDTH = 1100;
//HTMLエレメント
const pointElement = document.querySelector('.myeffect-point');
const labelElement = document.querySelector('.myeffect-point .label');
const textElement =  document.querySelector('.myeffect-point .text');

//オブザーバー
const getIsIntersecting = setupScrollObserver('.myeffect-target-class');
//セットアップ
const sizes = setupSizes(MAX_SCALE_WIDTH);
const { scene, renderer } = setupScene("canvas.myeffect-webgl");
const camera = setupCamera(scene, sizes);
//ライト
function setupLights() {
    const directionalLight = new DirectionalLight(0xffffff, 3);
    directionalLight.position.set(1, 1, 3);
    scene.add(directionalLight);
}
//モデルの位置
const { getIntersections } = createRaycaster(scene);
//モデル
const gltfLoader = new GLTFLoader();
let robot, eyeMesh, bodyMesh, mixer, animations, currentAction;
let currentAnimationIndex = 2;
function loadModel() {
    gltfLoader.load(robotModelUrl, (gltf) => {
        robot = gltf.scene;
        animations = gltf.animations;
        updateModel(robot, sizes.scaleRatio, sizes.aspectRatio, [0.6, 0.75], [0.5, 2]);
        robot.position.y = initialPositionY;
        robot.rotation.y = initialRotationY;
        scene.add(robot);

        eyeMesh = robot.children[0].children[1];
        bodyMesh = robot.children[0].children[0];
        eyeMesh.material = materialList[currentAnimationIndex];
        bodyMesh.material = materialList[currentAnimationIndex];

        mixer = new AnimationMixer(robot);
        currentAction = mixer.clipAction(gltf.animations[currentAnimationIndex]);
        currentAction.play();
        pointElement.classList.add('visible');
        textElement.textContent='ロボットをクリックしてモードをチェンジ!!'
        labelElement.textContent = textList[currentAnimationIndex];
        updatePointPosition();
        addEventListeners();
    }, undefined, (error) => {
        console.error('An error occurred loading the model:', error);
    });
}

function addEventListeners() {
    window.addEventListener('mousemove', updatePointer);
    window.addEventListener('touchmove', updatePointer);
    window.addEventListener('click', onPointerClick);
 //   window.addEventListener('touchend', onPointerClick);
    window.addEventListener("scroll", onScroll);
    window.addEventListener("resize", handleResize);
}
function updatePointer(event) {
    const intersections = getIntersections(event, camera);
    document.body.classList.toggle('myeffect-pointer', intersections.length > 0);
}
function onPointerClick(event) {
    const intersections = getIntersections(event, camera);
    if (intersections.length > 0) {
        switchAnimation();
    }
}
function switchAnimation() {
    currentAction.stop();
    currentAnimationIndex = (currentAnimationIndex + 1) % animations.length;
    currentAction = mixer.clipAction(animations[currentAnimationIndex]);
    currentAction.reset().fadeIn(0.5).play();
    eyeMesh.material = materialList[currentAnimationIndex];
    bodyMesh.material = materialList[currentAnimationIndex];
    labelElement.textContent = textList[currentAnimationIndex];
    labelElement.style.color = colorList[currentAnimationIndex];
}

function onScroll() {
    let scrollY = window.scrollY;
    if (robot) {
        robot.position.y = initialPositionY + (scrollY / sizes.height * 10 );
        robot.rotation.y = initialRotationY - (scrollY / sizes.height * 12);
        updatePointPosition()
    }
}
function handleResize() {
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;
    sizes.aspectRatio = sizes.width / sizes.height;
    sizes.scaleRatio = Math.min(sizes.width / MAX_SCALE_WIDTH, 1);
    camera.aspect = sizes.aspectRatio;
    camera.updateProjectionMatrix();
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    updateModel(robot, sizes.scaleRatio, sizes.aspectRatio, [0.6, 0.75], [0.5, 2]);
    updatePointPosition();
}
function updatePointPosition() {
    const screenPosition = robot.position.clone().project(camera);
    const translateX = (screenPosition.x * sizes.width * 0.5) + (sizes.width / 2) - (pointElement.offsetWidth / 2);
    const translateY = -(screenPosition.y * sizes.height * 0.5) + (sizes.height / 2) - (pointElement.offsetHeight );
    pointElement.style.transform = `perspective(3000px) translate3d(${translateX}px, ${translateY}px, 50px) rotateY(${robot.rotation.y}rad)`;
}

const clock = new Clock();
let previousTime = 0;
let deltaTime;
function tick() {
    const elapsedTime = clock.getElapsedTime();
    deltaTime = elapsedTime - previousTime;
    previousTime = elapsedTime;
    if (getIsIntersecting() && mixer) {
        mixer.update(deltaTime);
    }
    if (getIsIntersecting()) {
        renderer.render(scene, camera);
    }
    window.requestAnimationFrame(tick);
}

function init() {
    setupRenderer(renderer, sizes);
    setupLights();
    loadModel();
    tick();
}
init();
