varying vec3 vColor;
varying float vRotation;
varying float vTexIndex;

uniform sampler2D uSpriteTex0;
uniform sampler2D uSpriteTex1;

void main() {
  float cosX, sinX;
  float cosY, sinY;
  sinX = sin( vRotation );
  cosX = cos( vRotation );
  sinY = sin( vRotation );
  cosY = cos( vRotation );
  mat2 rotationMatrix = mat2( cosX, sinX, -sinY, cosX );
  vec2 uv = gl_PointCoord;
  vec2 offset = vec2( 0.5, 0.5 );
  uv = ( ( uv - offset ) * rotationMatrix ) + offset;

  vec4 color = vec4( vColor, 1. );

  vec4 texColor = texture2D( uSpriteTex0, uv ).rgba;
  if( vTexIndex > 0.9 ) texColor = texture2D( uSpriteTex1, uv ).rgba;

  color *= texColor;

  gl_FragColor = color;
}
