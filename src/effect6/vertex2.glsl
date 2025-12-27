uniform float uSize;
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

     // サイズが1.0未満なら、パーティクルを遠くに飛ばす
    if(gl_PointSize < 1.0) {
        gl_Position = vec4(9999.9, 9999.9, 9999.9, 1.0);
    }

    vColor = color;
}
