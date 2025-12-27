
uniform sampler2D uTexture;
uniform sampler2D uMessageTexture;
uniform bool uIsClicked;
uniform float uTime;
uniform int colorIndex;
varying vec2 vUv;

varying float vElevation;

vec3 palette(float t) {
    vec3 a = vec3(0.5, 0.5, 0.5);
    vec3 b = vec3(0.5, 0.5, 0.5);
    vec3 c = vec3(1.0, 1.0, 1.0);
    vec3 d = vec3(0.000, 0.333, 0.667);
    return a + b * cos(6.28318 * (c * t + d));
}
float HexDist(vec2 p) {
	p = abs(p);
    float c = dot(p, normalize(vec2(1,1.73)));
    c = max(c, p.x);
    return c;
}
vec4 HexCoords(vec2 uv) {
	vec2 r = vec2(1, 1.73);
    vec2 h = r*.5;
    vec2 a = mod(uv, r)-h;
    vec2 b = mod(uv-h, r)-h;
    vec2 gv = dot(a, a) < dot(b,b) ? a : b;
    float x = atan(gv.x, gv.y);
    x = (x+3.14)/6.28;
    float y = HexDist(gv);
    vec2 id = uv-gv;
    return vec4(x, y, id.x,id.y);
}
mat2 Rot(float a) {
	float s=sin(a), c=cos(a);
    return mat2(c,s,-s,c);
}
vec2 N22(vec2 p){
    vec3 a = fract(p.xyx*vec3(123.34,234.34, 345.65));
    a += dot(a, a+34.45);
    return fract(vec2(a.x*a.y, a.y* a.z));
}
vec2 N(float angle){
    return vec2(sin(angle), cos(angle));
}
vec3 Kaleidoscope1(vec2 uv){
   vec3 col = vec3(0.0);
    uv.x = abs(uv.x);
    uv.y += tan((5.0/6.0)*3.1415)*0.5;
    vec2 n = N( (5.0/6.0)*3.1415);
    float d = dot(uv -vec2(0.5, 0.0), n);
    uv -= n * max(0.0, d)* 2.0;
    n= N( (2.0/3.0)*3.1415);
    float scale= 1.0;
    uv.x +=0.5;
    for(int i = 0; i<3; i++){
        uv*=3.0;
        scale *=3.0;
        uv.x -=1.5;
        uv.x = abs(uv.x);
        uv.x -= 0.5;
        uv -= n * min(0.0, dot(uv, n))* 2.0;
    }
    uv/=scale;
    col += texture2D(uTexture, uv*0.7-sin(uTime*0.5) * 0.2 + 0.2).rgb;
    return col;
}
vec3 Kaleidoscope2(vec2 uv){
    vec2 uv0 = uv;
    uv = vec2(atan(uv.y, uv.x), length(uv));
    uv.x = ((uv.x+3.14)/6.28) * 8.0;
    vec3 col = vec3(0.1, 0.2, 0.8);
    for (float i = 0.0; i < 4.0; i++) {
        uv = fract(uv * 2.0) - 0.5;
        float d = length(uv);
        vec3 c = palette(length(uv0*i) - uTime * 0.5 );
        d = 0.03/ d;
        col +=  d * c;
    }
    return col;
}
vec3 Kaleidoscope3(vec2 uv){
    vec2 uv0 = uv;
    vec3 col = palette(HexDist(uv0) - uTime);
    uv = vec2(atan(uv.y, uv.x), length(uv));
    uv.x = ((uv.x + 3.14) / 6.28) * 3.0;
    float s = 4.0;
    vec4 gv = HexCoords(uv*s);
    float m = smoothstep(0.01, 0.9, gv.x);
    m = sin(m * 10.0+ uTime) / 10.0;
    m = abs(m);
    m = 0.02 / m;
    col *= m;
    return col;
}
vec3 Voronoi(vec2 uv, float scale){
    float t= uTime* 0.3;
    uv = abs(uv);
    uv=(uv.x < uv.y)? uv.xy : uv.yx;
    uv*=Rot(t);
    vec3 voronoi = vec3(0.0);
    float s = scale;
    vec2 gv = fract(uv * s) - 0.5;
    vec2 id = floor(uv * s);
    vec2 cellIndex = vec2(0.0);
    float minDist = 100.0;
    for(float y = -1.0; y<= 1.0;  y++){
        for(float x = -1.0; x <= 1.0;  x++){
            vec2 offset = vec2(x, y);
            vec2 n = N22(vec2( id + offset));
            vec2 p = offset + n;
            float d = length(gv - p);
            if(d < minDist){
                minDist = d;
                cellIndex = id + offset;
            }
        }
    }
    voronoi =vec3(cellIndex, minDist);
    return voronoi;
}
vec3 MinKale(vec2 uv, vec3 c, float scale, float v){
    float t= uTime* 0.3;
    vec3 col =c;
    float s = scale;
    uv = abs(uv);
    uv=(uv.x < uv.y)? uv.xy : uv.yx;
    uv*=Rot(t);
    vec2 gv = fract(uv * s) - 0.5;
    float strength  =  min(abs(gv.y),abs(gv.x))* v;
    col += vec3(strength);
    return col;
}
vec3 MaxKale(vec2 uv, vec3 c, float scale, float v){
    float t= uTime* 0.3;
    vec3 col = c;
    float s = scale;
    uv = abs(uv);
    uv=(uv.x < uv.y)? uv.xy : uv.yx;
    uv*=Rot(t);
    vec2 gv = fract(uv * s) - 0.5;
    float strength  =  max(abs(gv.y),abs(gv.x))*v;
    col += vec3(strength);
    return col;
}

float Circle(vec2 uv, vec2 p, float r, float blar){
    vec4 col = vec4(vec3(0.0), 1.0);
    float d = length(uv-p);
    float c = smoothstep(r, r-blar, d);
    return c;
}
float Rect(vec2 uv, vec2 bottomLeft, vec2 topRight, float blur) {
    blur = max(blur, 0.0);
    float leftEdge = smoothstep(bottomLeft.x - blur, bottomLeft.x + blur, uv.x);
    float rightEdge = smoothstep(topRight.x + blur, topRight.x - blur, uv.x);
    float bottomEdge = smoothstep(bottomLeft.y - blur, bottomLeft.y + blur, uv.y);
    float topEdge = smoothstep(topRight.y + blur, topRight.y - blur, uv.y);
    return min(leftEdge, rightEdge) * min(bottomEdge, topEdge);
}

vec4 Jellyfish(vec2 uv){
    vec4 col = vec4(vec3(0.0), 1.0);
    float t = sin(uTime * 3.0) * 0.2 + 0.7;
    float t2 = sin(uTime);
    float x = uv.x;
    uv.y = uv.y*2.0;
    float y2 =  uv.y * t;
    float v =  x * x ;
    float y = (uv.y * t)  +  (v * t);

    vec2 nUv = vec2(x, y);
    vec2 nUv2 = vec2(x, y2);

    float tOffset1 = 0.0;
    float tOffset2 = 1.0;
    float tOffset3 = 2.0;
    float tOffset4 = 3.0;
    float m1 = sin(t2 + tOffset1 +  uv.y * 6.5) * 0.1;
    float m2 = sin(t2 + tOffset2 +  uv.y * 7.0) * 0.09;
    float m3 = sin(t2 + tOffset3 +  uv.y * 7.5) * 0.09;
    float m4 = sin(t2 + tOffset4 +  uv.y  * 6.0) * 0.1;
    m1 = m1 * m1 * 5.0;
    m2 = m2 * m2 * 5.0;
    m3 = m3 * m3 * 5.0;
    m4 = m4 * m4 * 5.0;
    vec2 nUv3_1 = vec2(nUv2.x - 0.03 + m1, y2);
    vec2 nUv3_2 = vec2(nUv2.x - 0.03 + m2, y2);
    vec2 nUv3_3 = vec2(nUv2.x - 0.03 + m3, y2);
    vec2 nUv3_4 = vec2(nUv2.x - 0.03 + m4, y2);

    float face = Circle(nUv, vec2(0.0, 0.5), 0.35, 0.01);
    float faceShadow = Circle(nUv, vec2(0.0, 0.5), 0.5, 0.3);
    float eye = Circle(vec2(abs(nUv2.x), nUv2.y), vec2(0.11, 0.5), 0.04, 0.03);
    float cheek = Circle(vec2(abs(nUv2.x), nUv2.y), vec2(0.15, 0.37), 0.14, 0.1) * 0.3;
    col.rgb = mix(col.rgb, vec3(1.0), face);
    col.rgb = mix(col.rgb, vec3(0.1, 0.5, 0.9)*3.0, faceShadow);
    col.rgb = mix(col.rgb, vec3(0.0), eye);
    col.rgb = mix(col.rgb, vec3(1.0, 0.0, 0.0), cheek * 1.8);

    float legShadow = Rect(vec2(nUv3_1.x, nUv3_1.y), vec2(0.05, -0.5), vec2(0.08,0.2), 0.05);
    legShadow += Rect(vec2(nUv3_2.x, nUv3_2.y), vec2(0.15, -0.4), vec2(0.18,0.2), 0.05);
    legShadow += Rect(vec2(nUv3_3.x, nUv3_3.y), vec2(-0.08,-0.35), vec2(-0.05, 0.2), 0.05);
    legShadow += Rect(vec2(nUv3_4.x, nUv3_4.y), vec2(-0.18, -0.45), vec2(-0.15,0.2), 0.05);
    col.rgb = mix(col.rgb, vec3(0.1, 0.5, 0.9)*2.0, legShadow);
    float leg = Rect(vec2(nUv3_1.x, nUv3_1.y), vec2(0.06, -0.5), vec2(0.07,0.2), 0.01);
    leg += Rect(vec2(nUv3_2.x, nUv3_2.y), vec2(0.16, -0.4), vec2(0.17,0.2), 0.01);
    leg+= Rect(vec2(nUv3_3.x, nUv3_3.y), vec2(-0.06,-0.35), vec2(-0.05, 0.2), 0.01);
    leg += Rect(vec2(nUv3_4.x, nUv3_4.y), vec2(-0.17, -0.45), vec2(-0.16,0.2), 0.01);
    col.rgb = mix(col.rgb, vec3(1.0), leg);
    return col;
}

void main() {
    vec2 uv = (vUv * 2.0 - 1.0);
    vec2 aspect = vec2(1.0, 1.5);
    uv *=aspect;
    vec2 uv0 = uv;
    uv *= Rot(-uTime*0.2);

    vec3 v = Voronoi(uv, 3.0);
    vec4 col4 = vec4(vec3(N22(v.xy)*0.6, 0.3), 1.0);
    col4.rgb += Kaleidoscope1(uv)*0.5;

    vec3 c2 = Kaleidoscope2(uv);
    vec3 c3 =vec3(0.3);
    c3 += Kaleidoscope3(uv);
    vec4 col2 = vec4(MaxKale(uv, c3 ,1.0, 0.9), 1.0);
    vec4 col3 = vec4(MinKale(uv, c2 ,2.0, 1.2), 1.0);

    vec2 center = vec2(0.1, -0.4);
    uv0 *= 1.1;
    uv0 -= center;
    uv0 *= Rot(sin(uTime * 0.3)*0.5 + 0.1);
    uv0 += vec2(0.0, -0.5 - sin(uTime * 0.5));
    vec4 col1 = Jellyfish(uv0);
    uv0*= 1.8;
    uv0 += vec2(-0.9, 0.7);
    col1 += Jellyfish(uv0);

    vec4 col;
    if (colorIndex == 0) {
        col = col1;
    } else if (colorIndex == 1) {
        col = col2;
    } else if (colorIndex == 2) {
        col = col3;
    } else if (colorIndex == 3) {
        col = col4;
    }

    if (uIsClicked) {
        gl_FragColor = col;
    } else {
        vec4 messageColor = texture2D(uMessageTexture, vUv);
        gl_FragColor = messageColor;
    }

}
