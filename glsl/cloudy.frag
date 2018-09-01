void mainImage(out vec4 O,in vec2 xx){
    vec2 x=xx.xy;
    vec4 p,d=vec4(.8,0,x/iResolution.y-.8),c=vec4(.6,.7,d);
    O=c-d.w;
    for(float f,s,t=200. + sin(dot(x,x));--t>0.; p=.05*t*d){
        p.xz+=iGlobalTime;
        s=2.;
        float T = texture2D( iChannel0, (s*p.zw + ceil(s*p.x) )/200. ).y /s *4.;
        s += 2. ;
        f=p.w+1.-T-T-T-T;
    	if (f < 0.) 
            O += (O-1. -f*c.zyxw )*f *.4 ;

    }
}