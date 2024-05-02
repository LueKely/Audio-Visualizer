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


vec3 colorA = vec3(0.176,0.788,0.329);
vec3 colorB = vec3(0.07, 0.93, 0.25);
float pct = uFreq;

vec3 mixed = mix(colorA, colorB, pct);
float rotate = 0.55 + 0.55 * sin(angle + time) ;

vColor = vec4(mixed,rotate) ;




vec4 mvPosition = modelViewMatrix * vec4(pos.xyz, 1.);
gl_PointSize = 1. * (1./ - mvPosition.z);
gl_Position = projectionMatrix * mvPosition;



}