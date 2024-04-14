#ifdef GL_ES
precision mediump float;
#endif

varying vec2 vUv;
uniform float time;	
uniform sampler2D uPositions;
  
void main()	{
	vUv = uv;
vec4 pos = texture2D(uPositions, uv);
vec4 mvPosition = modelViewMatrix * vec4(pos.xyz, 1.);
gl_PointSize = 10. * (1./ - mvPosition.z);
gl_Position = projectionMatrix * mvPosition;

}