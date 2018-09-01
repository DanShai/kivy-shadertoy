float random (vec2 st) {
    return fract(sin(dot(st.xy,
                         vec2(120.9898,780.233)))*
        43758.5453123);
}


void mainImage(out vec4 fragColor , in vec2 fragCoord){

    vec2 uv =  fragCoord.xy / iResolution.xy ; // just this for texture to work 
	//uv = 2.*uv - 1. ; //remap to -1  1	
    //uv.x *= iResolution.x/iResolution.y ;    // to make it square screen
    uv *= 10.0; // Scale the coordinate system by 10
    vec2 ipos = floor(uv);  // get the integer coords
    vec2 fpos = fract(uv);  // get the fractional coords

    // Assign a random value based on the integer coord
	vec3 color = vec3(( random(ipos)));
    //vec3 color = vec3(( ipos/10. ),0.);

    // Uncomment to see the subdivided grid
    //color = vec3(fpos,0.0);

    fragColor = vec4( color,1.); 

} 

