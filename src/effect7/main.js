import * as THREE from 'three'
import vertexShader from './vertex.glsl'
import fragmentShader from './fragment.glsl'
import gsap from 'gsap'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { setupScrollObserver2 } from '../utils/scrollObserver';
import bakedUrl from './baked.jpg?url';
import gostUrl from './gost.glb?url';
import textUrl from './text.glb?url';



const textContainer = document.querySelector('.myeffect-text-class-bottom');
function hideTextContainer() {
    if (textContainer) {
        textContainer.style.display = 'none';
    }
}
function showTextContainer() {
    if (textContainer) {
        textContainer.style.display = 'block';
    }
}
window.addEventListener("DOMContentLoaded",showTextContainer)
//window.addEventListener('scroll', hideTextContainer);

const canvas = document.querySelector('.myeffect-webgl')
const scene = new THREE.Scene()

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
    pixelRatio: Math.min(window.devicePixelRatio, 2)
}
sizes.resolution = new THREE.Vector2(sizes.width*sizes.pixelRatio, sizes.height*sizes.pixelRatio)

const camera = new THREE.PerspectiveCamera(25, sizes.width / sizes.height, 0.1, 1000)
camera.position.set(0, 0, 6)
scene.add(camera)

const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(sizes.pixelRatio)
renderer.setClearColor(0x000000, 1.0);

//ゴースト　　　
const textureLoader = new THREE.TextureLoader()
const bakedTexture = textureLoader.load(bakedUrl)
bakedTexture.flipY = false
bakedTexture.colorSpace = THREE.SRGBColorSpace
const bakedMaterial = new THREE.MeshBasicMaterial({ map: bakedTexture })
const gltfLoader = new GLTFLoader()
let gost, animations, mixer;
gltfLoader.load(
    gostUrl,
    (gltf) =>{
        gost = gltf.scene
        animations = gltf.animations;
        mixer = new THREE.AnimationMixer(gost);
        animations.forEach((clip) => {
            const action = mixer.clipAction(clip);
            action.play();
        });
        gost.traverse((child) => {
           if (child.isMesh) {
              child.material = bakedMaterial;
          }
      })
      gost.position.set(0, 0, -20)
      gost.rotation.set(0.17, -0.25, 0)
    }
)
// gostを追従させる処理
let mouseX = 0;
let mouseY = 0;
window.addEventListener('pointermove', (event) => {
    mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    if(gost){
        gost.position.x += (mouseX * 5 - gost.position.x) * 0.1;
        gost.position.y += (mouseY * 5 - gost.position.y) * 0.1;
        gost.rotation.y += (mouseX - gost.rotation.y) * 0.1;
        gost.rotation.x += (-mouseY - gost.rotation.x) * 0.1;
    }
});
//パーティクル
const pointsZ = sizes.resolution.y > sizes.resolution.x ? -5 : 1;
const pSize = sizes.width > 600 ? 0.05 : 0.1;
let points = null
gltfLoader.load(
     textUrl,(gltf) =>{
      const meshes = gltf.scene.children
      const positionArrays =meshes.map(mesh => mesh.geometry.attributes.position.array);
      const counts = positionArrays.map(positionArray => positionArray.length / 3);
      const maxCount = Math.max(...counts);
      const timeMultipliersArray = new Float32Array(maxCount)
      const colors = new Float32Array(maxCount * 3)
      for (let i = 0; i < maxCount; i++) {
        const rand = Math.random();
            if (rand < 0.33) {
                colors[i * 3    ] =Math.random();
                colors[i * 3 + 1] = 0.1;
                colors[i * 3 + 2] = 0.1;
            } else if (rand < 0.66) {
                colors[i * 3    ] = 0.1;
                colors[i * 3 + 1] = 0.1;
                colors[i * 3 + 2] = Math.random();
            } else {
                colors[i * 3    ] = 1;
                colors[i * 3 + 1] =  1;
                colors[i * 3 + 2] =  1;
            }
        timeMultipliersArray[i] =1 + Math.random() ;
      }
      const adjustedPositions = positionArrays.map(positionArray => {
            const count = positionArray.length / 3;
            if (count < maxCount) {
             return adjustPositions(positionArray, maxCount);
            }
             return positionArray;
        });
      const material = new THREE.ShaderMaterial({
            vertexShader: vertexShader,
            fragmentShader:  fragmentShader,
            uniforms:{
              uSize: { value: pSize },
              uResolution: { value: sizes.resolution },
              uProgress: { value: 0}
            },
            blending: THREE.AdditiveBlending,
            transparent:true,
            depthWrite: false
        })
     const geometry = new THREE.BufferGeometry()
     const positionAttribute = new THREE.BufferAttribute(adjustedPositions[0], 3);
     const targetPositionAttribute = new THREE.BufferAttribute(adjustedPositions[1], 3);
     const conePositionAttribute = new THREE.BufferAttribute(adjustedPositions[2], 3);
        geometry.setAttribute('position',positionAttribute);
        geometry.setAttribute('aPositionTarget',targetPositionAttribute);
        geometry.setAttribute('aConePosition',conePositionAttribute);
        geometry.setAttribute('aTimeMultiplier', new THREE.Float32BufferAttribute(timeMultipliersArray, 1))
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        points = new THREE.Points(geometry, material)
        points.position.z = pointsZ
        scene.add(points)

        gsap.to(material.uniforms.uProgress, {
            value: 1,
            duration: 6,
            ease: "linear",
            onUpdate: () =>  {
                const progress = material.uniforms.uProgress.value;
                if (progress > 0.8) {
                    if (gost) {
                        gost.visible = false;
                        scene.add(gost);
                    }
                }
                if (gost && progress > 0.8) {
                    gost.visible = true;
                    hideTextContainer()
                }
            },
            onComplete:() => {
                scene.remove(points)
                geometry.dispose()
                material.dispose()
            },
          });
    }
)

function adjustPositions(positionArray, targetCount) {
    let currentCount = positionArray.length / 3;
    let newArray = new Float32Array(targetCount * 3);
    for (let i = 0; i < currentCount; i++) {
        newArray[i * 3] = positionArray[i * 3];
        newArray[i * 3 + 1] = positionArray[i * 3 + 1];
        newArray[i * 3 + 2] = positionArray[i * 3 + 2];
    }
    for (let i = currentCount; i < targetCount; i++) {
        let randomIndex = Math.floor(Math.random() * currentCount);
        newArray[i * 3] = positionArray[randomIndex * 3];
        newArray[i * 3 + 1] = positionArray[randomIndex * 3 + 1];
        newArray[i * 3 + 2] = positionArray[randomIndex * 3 + 2];
    }
    return newArray;
}

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



const clock = new THREE.Clock()
let previousTime = 0;
let deltaTime;
const tick = () =>{
    const elapsedTime = clock.getElapsedTime()
    deltaTime = elapsedTime - previousTime;
    previousTime = elapsedTime;
    if (mixer) {
        mixer.update(deltaTime);
    }
    renderer.render(scene, camera)
}
// レンダリングの開始と停止を制御する関数
const startRendering = () => {
    renderer.setAnimationLoop(tick);  // レンダリングループ開始
};
const stopRendering = () => {
    renderer.setAnimationLoop(null);  // レンダリングループ停止
};
setupScrollObserver2('.myeffect-target-class', startRendering, stopRendering);

handleResize()
window.addEventListener('resize', handleResize)
