uniform vec2 uResolution;
uniform float uTime;
varying vec2 vUv;

float smax( float a, float b, float k ) {
	float h =clamp( 0.5 + 0.5*(b-a)/k, 0.0, 1.0);
	return mix( a, b, h ) +  k* h *(1.0-h);
}
float Heart(vec2 uv){
    uv *= 3.0;
    uv.x *= 0.65;
    float r = 0.6;
    float b = 0.15;
    uv.y -= smax(sqrt(abs (uv.x)) * 0.7, b, 0.1);
    float d = length(uv);
    return smoothstep(r + b, r-b-0.01, d);
}
mat2 Rot(float a) {
	float s=sin(a), c=cos(a);
    return mat2(c,-s,s,c);
}
vec3 Transform(vec3 p, float a){
    p.xz *=Rot(a);
    p.xy *=Rot(a*0.3);
    return p;
}
float Ball(vec3 ro, vec3 rd, vec3 s, float angle){
    float r = 1.0;
    float t = dot(s - ro, rd);
    vec3 p = ro + rd * t;
    float y = length(s - p);
    float m = 0.0;
    if (y < r) {
        float x = sqrt(r*r - y*y);
        float t1 = t - x;
        float t2 = t + x;
        vec3 posF = ro + rd * t1 - s;
        vec3 posB = ro + rd * t2 - s;
        posF = Transform(posF, angle);
        posB = Transform(posB, angle);
        vec2 uvF = vec2(atan( posF.x,  posF.z),  posF.y);
        vec2 uvB = vec2(atan( posB.x,  posB.z),  posB.y);
        vec2 scale = vec2(0.6, 0.6);
        uvF *= scale;
        uvB *= scale;
        m = Heart(uvB)+ Heart(uvF);
    }
    return m;
}

void main() {
    vec2 uv = (vUv * 2.0 - 1.0) * vec2(uResolution.x / uResolution.y, 1.0);
    vec3 col = vec3(0.0);
    vec3 ro = vec3(0.0, 0.0, 0.0);
    vec3 rd = normalize(vec3(uv, 1.0));

    float t = uTime * 0.6;
    float t2 = uTime * 0.2;

    float m = 0.0;
    float stp = 1.0 / 40.0;
    for(float i=0.0; i<1.0; i+=stp) {
        float x = mix(-5.0, 5.0, fract(sin(i*543.2)*4560.3));
        float y = mix(-6.0, 6.0, fract(i+t*0.1));
        float z = mix(4.0, 3.0, i);
       float a = uTime + i*567.8;
       float d = Ball(ro, rd, vec3(x, y, z), a);
       m = max(m, clamp(d, 0.0, 1.0));
    }

    col = mix(col, vec3( cos(t2)*0.5+0.5, 0.1, sin(t2)*0.5+0.5), m);
    vec4 finalcol = vec4(col, 0.4);
    finalcol = pow(finalcol, vec4(.4545));
    gl_FragColor = finalcol;
}
