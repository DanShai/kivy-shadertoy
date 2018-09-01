#define A 0.005
float lineSegment(vec2 p, vec2 a, vec2 b) {
    vec2 pa = p - a, ba = b - a;
    float h = clamp( dot(pa,ba)/dot(ba,ba), 0.0, 1.0 );
    return 1.0-smoothstep(0.0, 2.0 / iResolution.x, length(pa - ba*h));
}


float circle(vec2 u, vec2 p, float r) {
	return 1.-smoothstep(r,r+A,distance(u,p));
}


void mainImage( out vec4 O, in vec2 U )
{
    vec2 R = iResolution.xy;
	U = (U - R* .5) / R.y;
    
    
    float T0 = iTime * 0.5;
    float T1 = iTime * 0.123;
    //vec2 p0=vec2(0.5,0.2),p1=vec2(-0.2,-0.4);
    vec2 p0 = vec2(cos(T0),sin(T0))*0.25, p1 = vec2(cos(T1),sin(T1))*0.25;
    
    vec2 d0 = U - p0, d1 = p1 - p0;
    
    float h = clamp(dot(d0,d1)/dot(d1,d1), 0.0, 1.0 );
  
    O=vec4(
        dot(d0,d1),
        dot(d1,d1),
        length(d0-d1*h),
        1.);
        
    
    O=vec4(
        0.,
        0,
        0,
        1.);
    
    
 
   O=max(O,circle(U,p0,0.01));
    O=max(O,circle(U,p1,0.01));
    O=max(O,lineSegment(U,p0,p1));
    
    
}