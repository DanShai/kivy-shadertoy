void mainImage(out vec4 fragColor , in vec2 fragCoord){

    vec2 uv =  fragCoord.xy / iResolution.xy ;
	uv = 2.*uv - 1. ; //remap to -1  1	
    uv.x *= iResolution.x/iResolution.y ;    // to make it square screen
	
    vec2 p;
	float e = 4. ;
	float q = .5 ;
	vec2 uv2 = uv*uv;
    float r = pow( pow(uv2.x,e) + pow(uv2.y,e), 1./e );
    p.x = q*iTime + q/r;
    p.y = q*atan(uv2.y,uv2.x)/3.1416;

    vec3 col =  texture2D(iChannel0,p).xyz;

    fragColor = vec4(col*r,1.0);  
} 
