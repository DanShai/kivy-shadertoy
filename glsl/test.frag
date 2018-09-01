vec3 circle(vec2 xy, vec2 p , float r , float blur , vec3 bg_color , vec3 fg_color) {
	float d = length(xy - p);
	float c = smoothstep(r,r+.01,d);
	// mix (a,b,cond) if cond = 0 it returns a else b  
	//vec3 col = mix(vec3(c) , vec3(1.,1.,0.) ,  1.-vec3(c) )  ;
	vec3 col = mix(fg_color , bg_color , vec3(c))  ;
	return col ;
}

void mainImage(out vec4 fragColor , in vec2 fragCoord){

    vec2 uv =  fragCoord.xy / iResolution.xy ;
	uv = 2.*uv - 1. ; //remap to -1  1	
    uv.x *= iResolution.x/iResolution.y ;    // to make it square screen

	vec2 p = vec2(0.  , .5*sin(iGlobalTime)) ;
	vec2 xy = uv.xy ;
	vec3 col1 = circle(xy, p , .2 , .01, vec3(1.,1.,1.) , vec3(1.,0.,0.) );
	vec3 col2 = circle(xy, p+vec2(.5,0.) , .1 , .01, vec3(1.,1.,1.) , vec3(1.,0.,1.) ) ;
	vec3 col = min(col1,col2);
    fragColor = vec4( col , 1.);
}
