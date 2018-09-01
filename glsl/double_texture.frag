void mainImage(out vec4 fragColor , in vec2 fragCoord){

    vec2 uv =  fragCoord.xy / iResolution.xy ;
	uv = 2.*uv - 1. ; //remap to -1  1	
    uv.x *= iResolution.x/iResolution.y ;    // to make it square screen
	
    vec2 p = uv;
    vec2 cst = vec2( cos(.5*iTime), sin(.5*iTime) );
    mat2 rot = 0.5*cst.x*mat2(cst.x,-cst.y,cst.y,cst.x);
    vec3 col1 = texture2D(iChannel0,rot*p).xyz;

    // scroll
    vec3 col2 = texture2D(iChannel1,0.5*p+sin(0.1*iTime)).xyz;

    // blend layers
    vec3 col = col2*col1;
    
	fragColor = vec4( col ,1. ); 
} 
