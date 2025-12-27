varying vec3 vColor;
void main(){
    vec2 uv = gl_PointCoord;
    float d = length(uv - vec2(0.5));
    if(d > 0.5)
        discard;
    gl_FragColor = vec4(vColor, 1.0);
   #include <colorspace_fragment>
}
