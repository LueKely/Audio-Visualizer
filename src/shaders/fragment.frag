#ifdef GL_ES
precision mediump float;
#endif


uniform float time; // basically u_time
varying vec2 vUv; //the resolution
varying vec4 vColor;
uniform float uFreq;

void main(){
  // choose either of the two
  vec2 uv = vUv;



  // vec2 coord =   gl_FragCoord.xy / u_resolution;
  // gl_FragColor = vec4(cos(len * 2.0), cos(len - 1.0), sin(time *0.5) , 1.0);

  gl_FragColor = vec4(vColor);
    // gl_FragColor = vec4( uFreq);

}