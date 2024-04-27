#ifdef GL_ES
precision mediump float;
#endif

varying vec2 vUv;
varying vec4 vColor;
uniform float time;	
uniform float uFreq;
uniform sampler2D uPositions;
  
void main()	{
	vUv = uv;
vec4 pos = texture2D(uPositions, uv);

float angle = atan(pos.y,pos.x);


vec3 colorA = vec3(0.07, 0.46, 0.91);
vec3 colorB = vec3(0.91, 0.12, 0.24);
float pct = uFreq;

vColor = vec4(mix(colorA, colorB, pct),0.55 + 0.55 * sin(angle + time )) ;




vec4 mvPosition = modelViewMatrix * vec4(pos.xyz, 1.);
gl_PointSize = 1. * (5./ - mvPosition.z);
gl_Position = projectionMatrix * mvPosition;



}