import"./modulepreload-polyfill-B5Qt9EMX.js";import{S as F,V as W,e as B,W as j,T as E,k as G,M as U,A as D,a as H,i as I,h as Y,B as P,F as S,g as q,C as O}from"./three.module-BS1B3NZB.js";import{g as V}from"./index-DDlvirwQ.js";import{G as X}from"./GLTFLoader-C6mNuhKw.js";import{a as Z}from"./scrollObserver-BS9xrVi3.js";var J=`uniform vec2 uResolution;
uniform float uSize;
uniform float uProgress;
attribute vec3 aPositionTarget;
attribute vec3 aConePosition;
attribute float aTimeMultiplier;
attribute vec3 color;
varying vec3 vColor;

float remap(float x, float a, float b, float c, float d){
  return c + (x - a) * (d - c) / (b - a);
}
void main(){
    float progress = uProgress*aTimeMultiplier;
    vec3 mixedPosition;

    if(progress < 0.2) {
        float local_1 = remap(progress, 0.0, 0.2, 0.0, 1.0);
        mixedPosition = mix(aConePosition, position, local_1);
    }
    else if(progress < 0.35)  {
        mixedPosition = position;
    }
    else if(progress < 0.5)  {
       float local_2 = remap(progress, 0.0, 0.5, 0.0, 1.0);
        mixedPosition = mix( position, aPositionTarget, local_2);
    }
    else if(progress < 0.85) {
        mixedPosition = aPositionTarget;
    }
    else {
        float local_3 = remap(progress, 0.87, 1.0, 0.0, 1.0);
        mixedPosition = mix(aPositionTarget, aConePosition, local_3);
    }

    vec4 modelPosition = modelMatrix * vec4(mixedPosition, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;

    gl_Position = projectedPosition;

    gl_PointSize = uSize * uResolution.y;
    gl_PointSize *= (1.0 / - viewPosition.z);

    
    if(gl_PointSize < 1.0) {
        gl_Position = vec4(9999.9, 9999.9, 9999.9, 1.0);
    }

    vColor = color;

    if(progress < 0.15) {
        float fadeIn = remap(progress, 0.0, 0.4, 0.0, 1.0);
        gl_PointSize *= fadeIn;
    }
    
    
    
    

}`,K=`varying vec3 vColor;
void main(){
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv);
    float alpha = 0.05 / d - 0.05*2.0;
    gl_FragColor = vec4(vColor, alpha);
}`;const N="/my-effects-repo/assets/baked-B-Si6MFP.jpg",Q="/my-effects-repo/assets/gost-CcP_lWF4.glb",$="/my-effects-repo/assets/text-DpWascD8.glb",h=document.querySelector(".myeffect-text-class-bottom");function ee(){h&&(h.style.display="none")}function te(){h&&(h.style.display="block")}window.addEventListener("DOMContentLoaded",te);const oe=document.querySelector(".myeffect-webgl"),m=new F,e={width:window.innerWidth,height:window.innerHeight,pixelRatio:Math.min(window.devicePixelRatio,2)};e.resolution=new W(e.width*e.pixelRatio,e.height*e.pixelRatio);const p=new B(25,e.width/e.height,.1,1e3);p.position.set(0,0,6);m.add(p);const l=new j({canvas:oe,antialias:!0});l.setSize(e.width,e.height);l.setPixelRatio(e.pixelRatio);l.setClearColor(0,1);const ie=new E,C=ie.load(N);C.flipY=!1;C.colorSpace=G;const ne=new U({map:C}),_=new X;let i,y,w;_.load(Q,n=>{i=n.scene,y=n.animations,w=new D(i),y.forEach(r=>{w.clipAction(r).play()}),i.traverse(r=>{r.isMesh&&(r.material=ne)}),i.position.set(0,0,-20),i.rotation.set(.17,-.25,0)});let b=0,M=0;window.addEventListener("pointermove",n=>{b=n.clientX/window.innerWidth*2-1,M=-(n.clientY/window.innerHeight)*2+1,i&&(i.position.x+=(b*5-i.position.x)*.1,i.position.y+=(M*5-i.position.y)*.1,i.rotation.y+=(b-i.rotation.y)*.1,i.rotation.x+=(-M-i.rotation.x)*.1)});const se=e.resolution.y>e.resolution.x?-5:1,ae=e.width>600?.05:.1;let g=null;_.load($,n=>{const c=n.scene.children.map(t=>t.geometry.attributes.position.array),a=c.map(t=>t.length/3),o=Math.max(...a),u=new Float32Array(o),s=new Float32Array(o*3);for(let t=0;t<o;t++){const x=Math.random();x<.33?(s[t*3]=Math.random(),s[t*3+1]=.1,s[t*3+2]=.1):x<.66?(s[t*3]=.1,s[t*3+1]=.1,s[t*3+2]=Math.random()):(s[t*3]=1,s[t*3+1]=1,s[t*3+2]=1),u[t]=1+Math.random()}const v=c.map(t=>t.length/3<o?re(t,o):t),f=new H({vertexShader:J,fragmentShader:K,uniforms:{uSize:{value:ae},uResolution:{value:e.resolution},uProgress:{value:0}},blending:I,transparent:!0,depthWrite:!1}),d=new Y,A=new P(v[0],3),L=new P(v[1],3),k=new P(v[2],3);d.setAttribute("position",A),d.setAttribute("aPositionTarget",L),d.setAttribute("aConePosition",k),d.setAttribute("aTimeMultiplier",new S(u,1)),d.setAttribute("color",new S(s,3)),g=new q(d,f),g.position.z=se,m.add(g),V.to(f.uniforms.uProgress,{value:1,duration:6,ease:"linear",onUpdate:()=>{const t=f.uniforms.uProgress.value;t>.8&&i&&(i.visible=!1,m.add(i)),i&&t>.8&&(i.visible=!0,ee())},onComplete:()=>{m.remove(g),d.dispose(),f.dispose()}})});function re(n,r){let c=n.length/3,a=new Float32Array(r*3);for(let o=0;o<c;o++)a[o*3]=n[o*3],a[o*3+1]=n[o*3+1],a[o*3+2]=n[o*3+2];for(let o=c;o<r;o++){let u=Math.floor(Math.random()*c);a[o*3]=n[u*3],a[o*3+1]=n[u*3+1],a[o*3+2]=n[u*3+2]}return a}function z(){e.width=window.innerWidth,e.height=window.innerHeight,e.pixelRatio=Math.min(window.devicePixelRatio,2),e.resolution.set(e.width*e.pixelRatio,e.height*e.pixelRatio),p.aspect=e.width/e.height,p.updateProjectionMatrix(),l.setSize(e.width,e.height),l.setPixelRatio(e.pixelRatio)}const le=new O;let R=0,T;const ce=()=>{const n=le.getElapsedTime();T=n-R,R=n,w&&w.update(T),l.render(m,p)},de=()=>{l.setAnimationLoop(ce)},ue=()=>{l.setAnimationLoop(null)};Z(".myeffect-target-class",de,ue);z();window.addEventListener("resize",z);
