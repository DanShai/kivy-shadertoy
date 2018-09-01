// "ShaderToy Tutorial - CameraSystem" 
// by Martijn Steinrucken aka BigWings/CountFrolic - 2017
// License Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License.
//
// This shader is part of my ongoing tutorial series on how to ShaderToy
// For an explanation go here: 
// https://www.youtube.com/watch?v=PBxuVlp7nuM

float DistLine(vec3 ro, vec3 rd, vec3 p) {
	return length(cross(p-ro, rd))/length(rd);
}

float DrawPoint(vec3 ro, vec3 rd, vec3 p) {
	float d = DistLine(ro, rd, p);
    d = smoothstep(.06, .05, d);
    return d;
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
	float t = iGlobalTime;
    
    vec2 uv =  fragCoord.xy / iResolution.xy ;
	uv = 2.*uv - 1. ; //remap to -1  1	
    uv.x *= iResolution.x/iResolution.y ;    // to make it square screen
    

    vec3 ro = vec3(3.*sin(t), 2., -3.*cos(t));
    
    vec3 lookat = vec3(.5);
    
    float zoom = 1.;
    
    vec3 f = normalize(lookat-ro);
    //vec3 r = normalize(vec3(-f.y,f.x,0)) ; 
    vec3 r = cross(vec3(0., 1., 0.), f);
    vec3 u = normalize( cross(f, r) );
    r = cross(u, f);
    
    vec3 c = ro + f*zoom;
    vec3 i = c + uv.x*r + uv.y*u;
    vec3 rd = i-ro;
    
   
    
    float d = 0.;
    
    d += DrawPoint(ro, rd, vec3(0., 0., 0.));
    d += DrawPoint(ro, rd, vec3(0., 0., 1.));
    d += DrawPoint(ro, rd, vec3(0., 1., 0.));
    d += DrawPoint(ro, rd, vec3(0., 1., 1.));
    d += DrawPoint(ro, rd, vec3(1., 0., 0.));
    d += DrawPoint(ro, rd, vec3(1., 0., 1.));
    d += DrawPoint(ro, rd, vec3(1., 1., 0.));
    d += DrawPoint(ro, rd, vec3(1., 1., 1.));
    
    
	fragColor = vec4(d);
}