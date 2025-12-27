uniform vec2 uResolution;
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

    // サイズが1.0未満なら、パーティクルを遠くに飛ばす
    if(gl_PointSize < 1.0) {
        gl_Position = vec4(9999.9, 9999.9, 9999.9, 1.0);
    }

    vColor = color;

    if(progress < 0.15) {
        float fadeIn = remap(progress, 0.0, 0.4, 0.0, 1.0);
        gl_PointSize *= fadeIn;
    }
    // if(progress > 0.95) {
    //     float fadeOut = remap(progress, 0.95, 1.0, 1.0, 0.0);
    //     gl_PointSize *= fadeOut;
    // }

}
