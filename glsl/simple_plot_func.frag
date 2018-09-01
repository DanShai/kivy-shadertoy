
vec3 plot(float y, vec2 p) {     

    float d1 = abs(p.y - y) ; //distance
    // Background    
    vec3 col = vec3(.1);
    // Mix graphs with background
	const vec3 yellow = vec3(140., 188., 79.)/255.;
    float eps = 0.01;
    col = mix(yellow, col, smoothstep(0.0, eps, d1));
        
    return col;
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
	vec2 uv = fragCoord.xy / iResolution.xy;    
    uv = 2.*uv-1.;
    uv.x *= iResolution.x / iResolution.y;
    float x= uv.x;
	float y = sin(x*x);
    vec3 col = plot(y,uv);
	float y1 = (x*x);
    vec3 col1 = plot(y1,uv);
	col=mix(col,col1,.5);
    col = pow(col, vec3(0.5));
    col = smoothstep(0.0, 1.0, col);
    
	fragColor = vec4(col,1.0);
}