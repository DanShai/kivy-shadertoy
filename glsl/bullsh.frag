void mainImage(out vec4 fragColor , in vec2 fragCoord){

    vec2 uv =  fragCoord.xy / iResolution.xy ; // just this for texture to work 
	vec2 tex = uv.xy;
	uv = 2.*uv - 1. ; //remap to -1  1	
    uv.x *= iResolution.x/iResolution.y ;    // to make it square screen
	vec3 bg = vec3(.8,.7,.1);	
	vec3 pc= vec3(.9,.2,.2);	
	vec2 p = 4.*uv.xy;
	vec2 n = floor(p);
	vec2 c = fract(p );

	float r = .3;
	vec3 col = vec3(bg); 
	if (mod(n,vec2(2.,2.)) == vec2(0.,0.)){
		//c.y += .5+.1*sin(.2*iTime);
		float disc = length(c) ; 
		col = mix(pc,bg,smoothstep( r-.01,r+.01, disc ) ) ;
	}
	
	fragColor = vec4( col ,1. );  

 }
