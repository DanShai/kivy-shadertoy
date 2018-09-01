#define pi 3.14159

float glow(float x, float str, float dist){
    return dist / pow(x, str);
}

// Sinus Signed Distance Function (distance field)
float sinSDF(vec2 st, float A, float offset, float f, float phi){
    return abs((st.y - offset) + sin(st.x * f + phi) * A);
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    vec3 col = vec3(0.0);
    float time = iTime/2.0;
    vec2 uv = fragCoord/iResolution.xy;
    vec2 st = vec2((uv.x-0.5) * (iResolution.x/iResolution.y) + 0.5, uv.y);
    float str = 0.6; // Strength of the light
    float dist = 0.02; // Light propagation distance
    float nSin = 4.0; // Number of sinus functions drawn
  
    
    float timeHalfInv = -time*((0.5-step(st.x,0.5))*2.0);
    float am = sin(st.x*3.0+pi/2.0); // Amplitude modulation
    for(float i = 0.0; i<nSin ; i++){
        col += vec3(glow(sinSDF(st, am*0.2, 0.5+sin(st.x*12.0+time)*am*0.05, 6.0, timeHalfInv+i*2.0*pi/nSin), str, dist));
    }
    
    // Reverse the color on one half of the screen
    float cut = st.x+((cos(st.y*6.0-time)+cos(st.y*12.0+time)+cos(st.y*18.0-time))*0.5)*0.03;
    col = abs(smoothstep(cut,cut-0.02,0.5) - clamp(col,0.0,1.0));
	
    
    // Output to screen
    fragColor = vec4(col,1.0);
    
    //----------------------------------------------
    
    // Test glow function with a circle distance field
    	/*
        float circleSDF = length(st-0.5);
        fragColor = vec4(vec3(glow(circleSDF, 1.0, 0.02)), 1.0);
		*/
    
    // Test sinus distance field function
        // fragColor = vec4(vec3(sinSDF(st, 0.1, 0.5, 10.0, 0.0)),1.0); // horizontal
        // fragColor = vec4(vec3(sinSDF(st.yx, 0.1, 0.5, 10.0, 0.0)),1.0); // vertical
}