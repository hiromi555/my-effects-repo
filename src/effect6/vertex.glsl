attribute float aIntensity;
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
}
