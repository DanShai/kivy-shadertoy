
float rect(vec2 r, vec2 bottomLeft, vec2 topRight) {
	float ret;
	float d = 0.005;
	ret = smoothstep(bottomLeft.x-d, bottomLeft.x+d, r.x);
	ret *= smoothstep(bottomLeft.y-d, bottomLeft.y+d, r.y);
	ret *= 1.0 - smoothstep(topRight.y-d, topRight.y+d, r.y);
	ret *= 1.0 - smoothstep(topRight.x-d, topRight.x+d, r.x);
	return ret;
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
	vec2 p = vec2(fragCoord.xy / iResolution.xy);
	vec2 r =  2.0*vec2(fragCoord.xy - 0.5*iResolution.xy)/iResolution.y;
	float xMax = iResolution.x/iResolution.y;	
	
	vec3 bgCol = vec3(0.3);
	vec3 col1 = vec3(0.216, 0.471, 0.698); // blue
	vec3 col2 = vec3(1.00, 0.329, 0.298); // yellow
	vec3 col3 = vec3(0.867, 0.910, 0.247); // red
	
	vec3 ret;
	
	if(p.x < 1./3.) { // Part I
		ret = texture2D(iChannel1, p).xyz;
	} 
	else if(p.x < 2./3.) { // Part II
		ret = texture2D(iChannel1, 4.*p+vec2(0.,iTime)).xyz;
	} 
	else if(p.x < 3./3.) { // Part III
		r = r - vec2(xMax*2./3., 0.);
		float angle = iTime;
		mat2 rotMat = mat2(cos(angle), -sin(angle),
        	               sin(angle),  cos(angle));
		vec2 q = rotMat*r;
		vec3 texA = texture2D(iChannel1, q).xyz;
		
		angle = -iTime;
		rotMat = mat2(cos(angle), -sin(angle),
        	               sin(angle),  cos(angle));
		q = rotMat*r;  
	    
	vec3 texB = texture2D(iChannel2, q).xyz;
		ret = mix(texA, texB, rect(q, vec2(-0.3, -0.3), vec2(.3, .3)) );
		
	}
	
	vec3 pixel = ret;
	fragColor = vec4(pixel, 1.0);
}

