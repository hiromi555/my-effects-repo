varying vec3 vColor;
void main(){
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv);
    float alpha = 0.05 / d - 0.05*2.0;
    gl_FragColor = vec4(vColor, alpha);
}
