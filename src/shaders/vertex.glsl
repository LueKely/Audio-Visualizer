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

vColor = vec4(uv.x, sin(time + uFreq), uv.y,0.55 + 0.55 * sin(angle + time )) ;

vColor.y+= uFreq;
vColor.x-= uFreq;


vec4 mvPosition = modelViewMatrix * vec4(pos.xyz, 1.);
gl_PointSize = 1. * (5./ - mvPosition.z);
gl_Position = projectionMatrix * mvPosition;



}