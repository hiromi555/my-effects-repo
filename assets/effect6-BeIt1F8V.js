import"./modulepreload-polyfill-B5Qt9EMX.js";import{V as M,S as k,W as D,e as G,R as H,b as O,P as C,M as V,f as q,d as Z,T as X,B as S,a as z,g as _,h as J,F as m,i as K,j as N}from"./three.module-BS1B3NZB.js";import{g as Q}from"./index-DDlvirwQ.js";import{a as $}from"./scrollObserver-BS9xrVi3.js";var ee=`attribute float aIntensity;
attribute float aAngle;
uniform vec2 uResolution;
uniform sampler2D uTexture;
uniform sampler2D uCanvasTexture;
varying vec3 vColor;
void main() {
    vec3 newPosition = position;
    float i = texture(uCanvasTexture, uv).r ;
    i = smoothstep(0.1, 1.0, i);
    i *= 0.2 * aIntensity;
    vec3 pos = vec3(
        cos(aAngle)*0.5,
        sin(aAngle)*0.5,
        1.0
    );
    pos = normalize(pos);
    pos *= i;
    newPosition += pos;

    vec4 modelPosition = modelMatrix * vec4(newPosition, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    gl_Position = projectedPosition;

    vec4 textureColor = texture(uTexture, uv);
    float intensity =  length(textureColor.rgb);
    intensity *= 0.33;

    vColor = textureColor.rgb;
    gl_PointSize = 0.002 * intensity * uResolution.y;
    gl_PointSize *= (1.0 / -viewPosition.z);
}`,te=`varying vec3 vColor;
void main(){
    vec2 uv = gl_PointCoord;
    float d = length(uv - vec2(0.5));
    if(d > 0.5)
        discard;
    gl_FragColor = vec4(vColor, 1.0);
   #include <colorspace_fragment>
}`,ne=`uniform float uSize;
uniform vec2 uResolution;
uniform float uProgress;

float remap(float x, float a, float b, float c, float d){
  return c + (x - a) * (d - c) / (b - a);
}
attribute float aScale;
attribute float aTimeMultiplier;
varying vec3 vColor;
varying float vProg;
void main(){
    float progress = uProgress * aTimeMultiplier;
    vec3 newPosition = position;
    float progress1 = remap(progress, 0.0, 0.6, 0.0, 1.0);
    progress1 = clamp(progress1,0.0,1.0);
    newPosition *= progress1;

    float progress2 = remap(progress, 0.9, 1.0, 0.0, 1.0);
    progress2 = 1.0 - clamp(progress2,0.0,1.0);
    vProg = progress2;

    vec4 modelPosition = modelMatrix * vec4(newPosition, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;

    gl_Position = projectedPosition;
    gl_PointSize = uSize * aScale* uResolution.y ;
    gl_PointSize *= 1.0 / - viewPosition.z;

     
    if(gl_PointSize < 1.0) {
        gl_Position = vec4(9999.9, 9999.9, 9999.9, 1.0);
    }

    vColor = color;
}`,oe=`varying vec3 vColor;
varying float vProg;
void main(){
    vec2 uv = gl_PointCoord-0.5;
    float d = length(uv);
    if(d > 0.5)
        discard;
    gl_FragColor = vec4(vColor, vProg);
    #include <colorspace_fragment>
}`;const ie="/my-effects-repo/assets/f-jYUW-ObP.png",n=document.createElement("canvas");n.width=256;n.height=256;const l=n.getContext("2d"),re=document.querySelector(".myeffect-webgl"),e={width:window.innerWidth,height:window.innerHeight,pixelRatio:Math.min(window.devicePixelRatio,2)};e.resolution=new M(e.width*e.pixelRatio,e.height*e.pixelRatio);const d=new k,s=new D({canvas:re,alpha:!0});s.setSize(e.width,e.height);s.setPixelRatio(e.pixelRatio);s.setClearColor(0,.5);const o=new G(75,e.width/e.height,.1,100);o.position.set(0,0,1);d.add(o);const b=new H,P=new M(9999,9999),g=new M;window.addEventListener("pointermove",t=>{P.x=t.clientX/window.innerWidth*2-1,P.y=-(t.clientY/window.innerHeight)*2+1});const v=new O(new C(1,1),new V({side:q}));v.visible=!1;d.add(v);const T=new Z(n),se=new X,ae=se.load(ie),a=new C(1,1,1024,1024);a.setIndex(null);a.deleteAttribute("normal");const F=new Float32Array(a.attributes.position.count),j=new Float32Array(a.attributes.position.count);for(let t=0;t<a.attributes.position.count;t++)F[t]=Math.random(),j[t]=Math.random()*Math.PI*2;a.setAttribute("aIntensity",new S(F,1));a.setAttribute("aAngle",new S(j,1));const le=new z({vertexShader:ee,fragmentShader:te,uniforms:{uResolution:{value:e.resolution},uTexture:{value:ae},uCanvasTexture:{value:T}}}),y=new _(a,le);d.add(y);window.addEventListener("scroll",()=>{const t=window.scrollY;y.position.z=v.position.z=-t/e.height,y.rotation.y=v.rotation.y=-t/e.height});const u=new J,c=500,p=new Float32Array(c*3),h=new Float32Array(c*3),L=new Float32Array(c),W=new Float32Array(c),f=.65,ce=(1+Math.sqrt(5))/2;for(let t=0;t<c;t++){const i=2*Math.PI*t/ce,r=Math.acos(1-2*(t+.5)/c),E=f*Math.sin(r)*Math.cos(i),U=f*Math.cos(r),Y=f*Math.sin(r)*Math.sin(i);p[t*3]=E,p[t*3+1]=U,p[t*3+2]=Y,h[t*3]=.7+Math.random()*.2,h[t*3+1]=Math.random()*.5,h[t*3+2]=.5+Math.random()*.5,L[t]=Math.random(),W[t]=1+Math.random()}u.setAttribute("position",new m(p,3));u.setAttribute("color",new m(h,3));u.setAttribute("aScale",new m(L,1));u.setAttribute("aTimeMultiplier",new m(W,1));const w=new z({uniforms:{uSize:{value:.016},uResolution:{value:e.resolution},uProgress:{value:0}},vertexColors:!0,transparent:!0,depthWrite:!1,blending:K,vertexShader:ne,fragmentShader:oe}),de=e.resolution.y>e.resolution.x?.2:.5,A=e.width>900?1:1.5;let x=0;Q.to(w.uniforms.uProgress,{value:1,duration:5,ease:"linear",onUpdate:()=>{const i=w.uniforms.uProgress.value;if(x+=.01,o.position.x=A*Math.cos(x),o.position.z=A*Math.sin(x),i>=.9){const r=(i-.9)/.1;o.position.set(0,0,1-de*r)}o.lookAt(new N(0,0,0))},onComplete:()=>{d.remove(B),u.dispose(),w.dispose()}});const B=new _(u,w);d.add(B);function I(){e.width=window.innerWidth,e.height=window.innerHeight,e.pixelRatio=Math.min(window.devicePixelRatio,2),e.resolution.set(e.width*e.pixelRatio,e.height*e.pixelRatio),o.aspect=e.width/e.height,o.updateProjectionMatrix(),s.setSize(e.width,e.height),s.setPixelRatio(e.pixelRatio)}let R=0;const ue=30,ve=1e3/ue,ge=t=>{if(t-R>=ve){R=t,b.setFromCamera(P,o);const i=b.intersectObject(v);if(document.body.classList.toggle("myeffect-pointer",i.length>0),T.needsUpdate=!0,s.render(d,o),l.globalAlpha=.05,l.fillStyle="black",l.fillRect(0,0,n.width,n.height),i.length>0){const r=i[0].uv;g.x=r.x*n.width,g.y=(1-r.y)*n.height,l.globalAlpha=1,l.fillStyle="white",l.fillRect(g.x,g.y,n.width/5,n.height/5)}}},pe=()=>{s.setAnimationLoop(ge)},he=()=>{s.setAnimationLoop(null)};$(".myeffect-target-class",pe,he);I();window.addEventListener("resize",I);window.history.scrollRestoration="manual";
