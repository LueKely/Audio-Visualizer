#ifdef GL_ES
precision mediump float;
#endif

varying vec2 vUv;
varying vec4 vColor;
uniform float time;	
uniform sampler2D uPositions;
  
void main()	{
	vUv = uv;
vec4 pos = texture2D(uPositions, uv);

float angle = atan(pos.y,pos.x);

vColor = vec4(0.5 + 0.45 * sin(angle + time )) * 0.9;

vec4 mvPosition = modelViewMatrix * vec4(pos.xyz, 1.);
gl_PointSize = 1. * (1./ - mvPosition.z);
gl_Position = projectionMatrix * mvPosition;



}