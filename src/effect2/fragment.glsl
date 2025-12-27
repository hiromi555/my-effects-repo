uniform sampler2D uTexture;
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
   // textureColor .a *= 0.9;
    gl_FragColor = textureColor;
}
