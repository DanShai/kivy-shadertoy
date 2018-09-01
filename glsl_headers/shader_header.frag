
//#ifdef GL_ES
//precision midiump float;
//#endif

#define texture texture2D
#define textureLod texture2D

uniform vec4 iResolution;
uniform float iTime;
uniform float iGlobalTime;
uniform float iChannelTime[4];
uniform vec3 iChannelResolution[4];

uniform vec3 iChannelResolution0;
uniform vec3 iChannelResolution1;
uniform vec3 iChannelResolution2;
uniform vec3 iChannelResolution3;

uniform vec4 iMouse;
uniform vec4 iDate;
uniform float iSampleRate;
