
attribute vec3  color;
attribute float size;
attribute float rotation;
attribute float texIndex;

varying vec3 vColor;
varying float vRotation;
varying float vTexIndex;

uniform float uTime;
uniform vec2 uMouse;

void main() {
  vColor = color;
  vRotation = rotation;
  vTexIndex = texIndex;

  // カメラ距離でポイントサイズを大小させる
  vec4 eyeCoord = modelViewMatrix * vec4( position, 1.0 );
  float dist = length( eyeCoord );
  float sizeScale = 600. / dist;

  gl_PointSize = size * sizeScale;

  gl_Position = projectionMatrix * eyeCoord;
}
