#ifdef GL_ES
precision mediump float;
#endif


uniform sampler2D uPositions;
uniform float time; // basically u_time
uniform vec2 u_resolution;
varying vec2 vUv; //the resolution

void main(){
  // choose either of the two
  vec2 uv = vUv;
  

vec4 pos = texture2D(uPositions, vUv);
float radius = length(pos.xy);
float angle = atan(pos.y,pos.x) - 0.1;

vec3 targetPos = vec3(cos(angle),sin(angle),0.0) * radius;

pos.xy += (targetPos.xy - pos.xy) * 0.005;


// orig answer
// pos.xy += (targetPos.xy - pos.xy) * 0.005;

  gl_FragColor = vec4(pos.xy, 1.,1.);

}