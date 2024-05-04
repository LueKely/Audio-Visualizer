#ifdef GL_ES
precision mediump float;
#endif

varying vec2 vUv;
uniform float time;		
varying vec3 vPosition;
float PI = 3.14159265358979323846;

void main()	{
	vUv = uv;
	// projectionMatrix, modelViewMatrix, position -> passed in from Three.js
	gl_Position = projectionMatrix 
		* modelViewMatrix
		* vec4(position.x, position.y, position.z, 1.0);


// regular mode
	// gl_Position = projectionMatrix 
	// 	* modelViewMatrix
	// 	* vec4(position.x, postion.y, position.z, 1.0);
}