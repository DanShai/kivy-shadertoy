
#define zoom 3.
#define S(v) smoothstep(pixels,0.,v)
float f(float x){
	return exp(x) ;
}
float df(float x){
	return (f(x+0.001)-f(x-0.001))*500.;
}

void mainImage( out vec4 fragColor, in vec2 fragCoord ){
    vec2 R=iResolution.xy,
	uv=zoom*(2.*fragCoord-R)/R.y,
    m=zoom*(2.*iMouse.xy-R)/R.y;
	m += sin(iTime) ;   
    float pixels=3./R.y*(zoom);
    
	vec3 col=vec3(0,0,1)*S(abs(f(uv.x)-uv.y));
	col+=vec3(1,0,0)* ( S(abs((uv.x-m.x)*df(m.x)+f(m.x)-uv.y)) ) ;
	col+=0.3*S(abs(uv.x));
    col+=0.3*S(abs(uv.y));
	col+=0.2*S(abs(fract(abs(uv.x)-0.5)-0.5));
    col+=0.2*S(abs(fract(abs(uv.y)-0.5)-0.5));
    col+=0.1*S(abs(fract(abs(uv.x)*10.-0.5)-0.5)/10.);
    col+=0.1*S(abs(fract(abs(uv.y)*10.-0.5)-0.5)/10.);
    fragColor = vec4(col,1.0);
}
