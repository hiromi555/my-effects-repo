import"./modulepreload-polyfill-B5Qt9EMX.js";import{S as y,T,P,V as d,a as C,b as D,c as L,W as R,C as A}from"./three.module-BS1B3NZB.js";import{s as U}from"./scrollObserver-BS9xrVi3.js";var S=`varying vec2 vUv;

void main(){
  
    gl_Position = vec4(position, 1.0);
    vUv = uv;
}`,b=`uniform sampler2D uTexture;
uniform vec2 uResolution;
uniform float uTime;
uniform vec2 uDrawPositions[10];
uniform float uDrawTimes[10];
uniform int uDrawCount;
varying vec2 vUv;

float N(vec2 p) {
    p = fract(p*vec2(123.34,345.45));
    p +=dot(p, p+34.345);
    return fract(p.x * p.y);
}
vec3 Layer(vec2 vUv, float t){
    vec2 uv = (vUv * 2.0 - 1.0) * vec2(uResolution.x / uResolution.y, 1.0);
    float s = 2.0;
    vec2 aspect = vec2(2.0, 1.0);
    uv = uv * s * aspect;
    uv.y += t*0.4;
    vec2 gv = fract(uv) - 0.5;
    vec2 id = floor(uv);
    float n = N(id);
    t += n * 6.2831;

    float w = vUv.y*10.0;
    float x = (n-0.5)*0.8;
    x +=(0.3-abs(x))* sin(w)*pow(sin(w),3.0);
    float y = -sin(t+sin(t+sin(t)*0.5))*0.45;
    y -= (gv.x-x)*(gv.x-x);

    vec2 dropPos = (gv - vec2(x, y)) / aspect;
    float drop = smoothstep(0.05, 0.03, length(dropPos));

    vec2 trailPos = (gv-vec2(x, t*0.4)) / aspect;
    trailPos.y = (fract(trailPos.y*8.0)-0.5)/8.0;
    float trail = smoothstep(0.03, 0.01, length(trailPos));
    float fogTrail = smoothstep(-0.05, 0.05, dropPos.y);
    fogTrail*= smoothstep(0.5, y, gv.y);
    trail*=fogTrail;
    fogTrail*= smoothstep(0.05, 0.04, abs(dropPos.x));

    vec2 offs =dropPos * drop + trailPos * trail ;
    return vec3(offs,fogTrail);
}
void main() {
   float distortion = 2.7;
    float st = 1.0;
    float t =  mod( uTime * st, 100.0);

    vec3 drops = Layer(vUv,t);
    drops +=Layer(vUv * 1.23 + 3.21, t);
    drops +=Layer(vUv * 1.45 - 4.56, t);
    drops +=Layer(vUv * 3.45 - 6.54, t);
    float mipLevel = 5.0;
    float fogTime = 8.0;
    float aspectRatio = uResolution.x / uResolution.y;
    vec2 scaledUv = vec2(vUv.x * aspectRatio, vUv.y);
    float dynamicThreshold = (uResolution.x >= 600.0) ? 0.3 : 0.2;
    for (int i = 0; i < uDrawCount; i++) {
        vec2 scaledDrawPos = vec2(uDrawPositions[i].x * aspectRatio, uDrawPositions[i].y);
        float distance = length(scaledUv - scaledDrawPos) + N(scaledUv)*0.04;
        if (distance < dynamicThreshold) {
            float timeSinceClick = uTime - uDrawTimes[i];
            float localMipLevel = min(6.4, (timeSinceClick / fogTime) * 6.4);
            mipLevel = min(mipLevel, localMipLevel);
        }
    }
    float blar = mipLevel * (1.0 - drops.z);

    float windowAspect = uResolution.x / uResolution.y;
    float textureAspect = 1.0;
    vec2 uv0 = vUv;
    if (windowAspect > textureAspect) {
        uv0.y *= textureAspect / windowAspect;
        uv0.y -= (textureAspect / windowAspect - 1.0) * 0.5;
    } else {
        uv0.x *=  windowAspect / textureAspect;
        uv0.x -= ( windowAspect / textureAspect - 1.0) * 0.5;
    }
    vec4 textureColor =  textureLod(uTexture, uv0+drops.xy * distortion, blar);
   
    gl_FragColor = textureColor;
}`;const k="/my-effects-repo/assets/bg-D-dk9YId.jpg",u=document.querySelector(".myeffect-text-class"),E=U(".myeffect-target-class"),v=document.querySelector(".myeffect-webgl"),n={width:window.innerWidth,height:window.innerHeight},f=new y,M=new T,z=M.load(k),W=new P(2,2),a=10;let l=new Array(a).fill().map(()=>new d),r=new Array(a).fill(0),s=0;const o=new C({vertexShader:S,fragmentShader:b,transparent:!0,uniforms:{uTime:{value:0},uTexture:{value:z},uResolution:{value:new d(n.width,n.height)},uDrawPositions:{value:l},uDrawTimes:{value:r},uDrawCount:{value:s}}}),_=new D(W,o);f.add(_);const m=new L;f.add(m);const c=new R({canvas:v,alpha:!0});c.setSize(n.width,n.height);c.setPixelRatio(Math.min(window.devicePixelRatio,2));function q(e){const t=c.domElement.getBoundingClientRect();return{x:(e.clientX-t.left)/t.width,y:1-(e.clientY-t.top)/t.height}}function I(e){const t=v.getBoundingClientRect(),i=e.changedTouches[0];return{x:(i.clientX-t.left)/t.width,y:1-(i.clientY-t.top)/t.height}}function w(e){const t=g.getElapsedTime();l[s%a].set(e.x,e.y),r[s%a]=t,s++,o.uniforms.uDrawPositions.value=[...l],o.uniforms.uDrawTimes.value=[...r],o.uniforms.uDrawCount.value=Math.min(s,a)}function p(){u&&u.classList.remove("is-show")}function N(){u&&u.classList.add("is-show")}function Y(e){const t=q(e);w(t),p()}function B(e){const t=I(e);w(t),p()}function h(){n.width=window.innerWidth,n.height=window.innerHeight,c.setSize(n.width,n.height),c.setPixelRatio(Math.min(window.devicePixelRatio,2)),o.uniforms.uResolution.value.set(n.width,n.height),l=new Array(a).fill().map(()=>new d),r=new Array(a).fill(0),o.uniforms.uDrawCount.value=0}window.addEventListener("resize",h);window.addEventListener("DOMContentLoaded",N);v.addEventListener("click",Y,!1);v.addEventListener("touchend",B,!1);function F(e){for(let i=0;i<s;i++)e-r[i]>8&&(l[i].set(0,0),r[i]=0);o.uniforms.uDrawPositions.value=[...l],o.uniforms.uDrawTimes.value=[...r]}const g=new A,x=()=>{if(E()){const e=g.getElapsedTime();o.uniforms.uTime.value=e,s>0&&F(e),c.render(f,m)}window.requestAnimationFrame(x)};h();x();
