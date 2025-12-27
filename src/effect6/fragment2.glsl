varying vec3 vColor;
varying float vProg;
void main(){
    vec2 uv = gl_PointCoord-0.5;
    float d = length(uv);
    if(d > 0.5)
        discard;
    gl_FragColor = vec4(vColor, vProg);
    #include <colorspace_fragment>
}
