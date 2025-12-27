import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import gsap from 'gsap'
import birthdayUrl from './birthday.glb?url';

const canvas = document.querySelector('.myeffect-webgl')
//HTMLの表示を防ぐ
const card = document.getElementById('card-inner')
document.addEventListener('DOMContentLoaded', () => {
    if (card) {
        card.style.display = 'block';
    }
});

const scene = new THREE.Scene()
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
    pixelRatio: Math.min(window.devicePixelRatio, 2)
}
const cameraPosY = sizes.width > sizes.height ? 25 : 42;
const cameraPosZ = sizes.width > sizes.height ? 27 : 32;
//カメラ
const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 100)
camera.position.set(0, cameraPosY, 12);
camera.lookAt(0, 0, 0); // シーンの中心を見る
scene.add(camera)
// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true
controls.dampingFactor = 0.1;
controls.minDistance = 5;  // ズームインの最小距離
controls.maxDistance = 90; // ズームアウトの最大距離
//レンダー
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(sizes.pixelRatio)
renderer.setClearColor(0xeeeeee, 1);
//影
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap

// ボタンのアニメーションを作成
const cardFront = document.querySelector('.card-front');
const tween = gsap.to(cardFront, {
    scale: 1,
    repeat: -1,
    yoyo: true,
    duration: 0.6,
    paused: true,
    ease: "power1.inOut"
});
cardFront.addEventListener("pointerenter", () => {
    tween.restart();
});
cardFront.addEventListener("pointerleave", () => {
    tween.pause();
    gsap.to(cardFront, {
        scale: 0.8,
        duration: 0.3,
        ease: "power2.out"
    });
});
const manager = new THREE.LoadingManager();

const gltfLoader = new GLTFLoader(manager);
manager.onProgress = function (url, itemsLoaded, itemsTotal) {
  const progress = (itemsLoaded / itemsTotal) * 100;
  document.getElementById("progress-bar").style.width = `${progress}%`;
  console.log(progress)
  if (itemsLoaded === itemsTotal) {
    document.getElementById("progress-container").style.display = "none";
  }
};

//モデルのロード
let model, clips, mixer;
gltfLoader.load( birthdayUrl, (gltf) => {
        model = gltf.scene;
        const originalY = model.position.y;
        model.children[0].visible = false  //カード
        model.children[2].visible = false  //テキスト
        model.children[3].scale.set(0, 0, 0) //ボックス

        mixer = new THREE.AnimationMixer(model);
        clips = gltf.animations;
        scene.add(model);
        //影
        model.traverse((child) => {
            if (child.name.includes("Text") || child.name.includes("Cube")) {
                child.castShadow = true; // 影を落とす
            } else {
                child.castShadow = false;
            }
            if (child.name.includes("Plane")) {
                child.receiveShadow = true; // 影を受け取る
            } else {
                child.receiveShadow = false;
            }
        });
    //ロード時
    const timeline = gsap.timeline({
        defaults: {
          ease: "power2.out",
        }
      });
      timeline.call(() => {
          resetAnimationByName(mixer, clips, "open");
          playAnimationByName(mixer, clips, "close");
          model.children[0].visible = true;
      }, null, "0")
      .to(model.rotation, {
          z: Math.PI * 2,
          duration: 3,
          ease: "SteppedEase.config(10)",
      })
      .fromTo(card,
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 1 }
      );
    //クリック
    let isOpen = false;
    card.addEventListener('click',()=>{
        if (!isOpen) {
            openTimeline.restart(); // 開くアニメーション再生
        } else {
            closeTimeline.restart(); // 閉じるアニメーション再生
        }
        isOpen = !isOpen; // 状態を切り替え
    })

   // 開くアニメーションのタイムライン
    const openTimeline = gsap.timeline({
        paused: true,
        ease: "power2.inOut",
        onStart: () => {
            cardFront.style.pointerEvents = 'none';
            gsap.to(card, {
                autoAlpha: 0,
                duration: 1,
            })
        },
        onComplete: () => {
            cardFront.style.pointerEvents = 'auto';
            gsap.to(card, {
                autoAlpha: 1,
                duration: 1,
            });
        }
    });
    openTimeline
        .call(() => {
            resetAnimationByName(mixer, clips, "close");
            playAnimationByName(mixer, clips, "open");
        }, null, "+=0.5")
        .to(camera.position, {
            x: 0,
            y: cameraPosY,
            z: 10,
            duration: 2,
        })
        .call(() => {
            model.children[2].visible = true;
        }, null, "+=2")
        .call(() => {
            playAnimationByName(mixer, clips, "text");
        }, null, "-=0.05")
        .to(camera.position, {
            x: 0,
            y: 7,
            z: cameraPosZ,
            duration: 2,
            ease: "back.out(2)",
            delay:3,
        })
        .to(model.position, {
            y: model.position.y - 5,
            duration: 2,
        }, "<")
        .to(model.children[3].scale, {
            x: 1.4,
            y: 1.4,
            z: 1.4,
            duration: 1,
        })
        .call(() => {
            playAnimationByName(mixer, clips, "box");
        }, null, "+=0.5")
        .to(model.position, {
            y: originalY,
            duration: 2,
            delay:2,
        })
        .to(camera.position, {
            x: 0,
            y: cameraPosY,
            z: 12,
            duration: 2,
            ease: "back.out(2)",
        }, "<")
        .call(() => {
            playAnimationByName(mixer, clips, "ribon");
        }, null, "-=2")
        .call(() => {
            cardFront.textContent = "CLOSE"; // テキスト切り替え
        });

    // 閉じるアニメーションのタイムライン
    const closeTimeline = gsap.timeline({
        paused: true,
        ease: "power2.inOut",
        onStart: () => {
           cardFront.style.pointerEvents = 'none';
            gsap.to(card, {
                autoAlpha: 0,
                duration: 1,
            })
        },
        onComplete: () => {
           cardFront.style.pointerEvents = 'auto';
            gsap.to(card, {
                delay:3,
                autoAlpha: 1,
                duration: 1,
            });
        }
    });
    closeTimeline
        .call(() => {
            model.children[2].visible = false;
            resetAnimationByName(mixer, clips, "open");
            resetAnimationByName(mixer, clips, "ribon");
            resetAnimationByName(mixer, clips, "text");
            resetAnimationByName(mixer, clips, "box");
            playAnimationByName(mixer, clips, "close");
        }, null, "+=0.5")
        .to(model.children[3].scale, {
            x: 0,
            y: 0,
            z: 0,
            duration: 0.25,
        })
        .call(() => {
            cardFront.textContent = "OPEN";
        });

    }, undefined, (error) => {
        console.error('An error occurred loading the model:', error);
    });

function playAnimationByName(mixer, clips, name) {
    const clip = THREE.AnimationClip.findByName(clips, name);
    if (clip) {
        const action = mixer.clipAction(clip);
        action.setLoop(THREE.LoopOnce); // 1回だけ再生する
        action.clampWhenFinished = true;
        action.play();
    } else {
        console.warn(`Animation clip "${name}" not found.`);
    }
}

function resetAnimationByName(mixer, clips, name) {
    const clip = THREE.AnimationClip.findByName(clips, name);
    if (clip) {
        const action = mixer.clipAction(clip);
        action.stop();  // アニメーションを停止
        action.reset(); // アニメーションの時間を0に戻す
    } else {
        console.warn(`Animation clip "${name}" not found.`);
    }
}

//ライト
const ambientLight = new THREE.AmbientLight(0xffffff, 1); // シーン全体に基本光
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 2); // メイン光源
directionalLight.position.set(-3, 3, 5);
scene.add(directionalLight);
//影
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 512;
directionalLight.shadow.mapSize.height = 512;
directionalLight.shadow.camera.near = 0.5;
directionalLight.shadow.camera.far = 50;
directionalLight.shadow.camera.left = -10;
directionalLight.shadow.camera.right = 10;
directionalLight.shadow.camera.top = 10;
directionalLight.shadow.camera.bottom = -10;

function handleResize(){
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight
    sizes.pixelRatio = Math.min(window.devicePixelRatio, 2)
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(sizes.pixelRatio)
}

const clock = new THREE.Clock()
function tick(){
    controls.update()
    // 前回のフレームからの経過時間を取得
    const deltaTime = clock.getDelta();
    if (mixer) {
        mixer.update(deltaTime);
    }
    renderer.render(scene, camera)
    window.requestAnimationFrame(tick)
}
handleResize()
tick();

window.addEventListener('resize', handleResize)
