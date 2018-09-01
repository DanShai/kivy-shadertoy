void mainImage(out vec4 fragColor , in vec2 fragCoord){

    vec2 uv =  fragCoord.xy / iResolution.xy ;
	uv = 2.*uv - 1. ; //remap to -1  1	
    uv.x *= iResolution.x/iResolution.y ;    // to make it square screen
	
    vec2 p = uv;
    vec2 cc = vec2( cos(.25*iTime), sin(.25*iTime*1.423) );

    float dmin = 1000.0;
    vec2 z  = p*vec2(1.33,1.0);
    for( int i=0; i<64; i++ )
    {
        z = cc + vec2( z.x*z.x - z.y*z.y, 2.0*z.x*z.y );
        float m2 = dot(z,z);
        if( m2>100.0 ) break;
        dmin=min(dmin,m2);
        }

    vec3 col = vec3(sqrt(sqrt(dmin))*0.7);
	fragColor = vec4( col ,1. ); 
} 
