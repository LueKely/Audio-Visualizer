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
  //  pos.xy += vec2(0.001);
  // vec2 coord =   gl_FragCoord.xy / u_resolution;
  // gl_FragColor = vec4(cos(len * 2.0), cos(len - 1.0), sin(time *0.5) , 1.0);

  gl_FragColor = vec4(pos.xy, 1.,1.);

}