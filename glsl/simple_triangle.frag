
void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
  	vec3 p  = vec3( fragCoord / iResolution.xy, -1.),
    	 n1 = vec3(-1,.6,0),  n2 =vec3(1,.6,1),    n3 = vec3(0,-1,-.2), 
  	  	 d  = vec3( dot(p,n1), dot(p,n2), dot(p,n3) );
    fragColor = vec4( all(lessThan(d,vec3(.01))) && any(greaterThan(d,vec3(0)))  ? .1 : 1.0);
}