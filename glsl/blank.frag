void mainImage(out vec4 fragColor , in vec2 fragCoord){

    vec2 uv =  fragCoord.xy / iResolution.xy ; // just this for texture to work 
	vec2 tex = uv.xy;
	uv = 2.*uv - 1. ; //remap to -1  1	
    uv.x *= iResolution.x/iResolution.y ;    // to make it square screen
	
	//vec2 txc = vec2(uv.x*.5 ,1.-uv.y) ; 
    vec3 col =  texture2D(iChannel0, tex).xyz ; 
    fragColor = vec4( col,1.); 

	//vec3 col = vec3(length(uv) ) ;   
	//fragColor = vec4( col ,1. ); 
} 
