


#define AA 0

struct bound3
{
    vec3 mMin;
    vec3 mMax;
};

//---------------------------------------------------------------------------------------
// bounding box for a disk (http://iquilezles.org/www/articles/diskbbox/diskbbox.htm)
//---------------------------------------------------------------------------------------
bound3 DiskAABB( in vec3 cen, in vec3 nor, float rad )  // disk: center, normal, radius
{
    vec3 e = rad*sqrt( 1.0 - nor*nor );
    return bound3( cen-e, cen+e );
}


// ray-disk intersection
float iDisk( in vec3 ro, in vec3 rd,               // ray: origin, direction
             in vec3 cen, in vec3 nor, float rad ) // disk: center, normal, radius
{
	vec3  q = ro - cen;
    float t = -dot(nor,q)/dot(rd,nor);
    if( t<0.0 ) return -1.0;
    vec3 d = q + rd*t;
    if( dot(d,d)>(rad*rad) ) return -1.0;
    return t;
}


// ray-box intersection (simplified)
vec2 iBox( in vec3 ro, in vec3 rd, in vec3 cen, in vec3 rad ) 
{
	// ray-box intersection in box space
    vec3 m = 1.0/rd;
    vec3 n = m*(ro-cen);
    vec3 k = abs(m)*rad;
	
    vec3 t1 = -n - k;
    vec3 t2 = -n + k;

	float tN = max( max( t1.x, t1.y ), t1.z );
	float tF = min( min( t2.x, t2.y ), t2.z );
	
	if( tN > tF || tF < 0.0) return vec2(-1.0);

	return vec2( tN, tF );
}

float hash1( in vec2 p )
{
    return fract(sin(dot(p, vec2(12.9898, 78.233)))*43758.5453);
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    vec3 tot = vec3(0.0);
	vec2 p = 1. * fragCoord.xy / iResolution.xy - 0.5;
	p.x *= iResolution.x / iResolution.y;


    // camera position
	vec3 ro = vec3( -0.5, 0.4, 1.5 );
    vec3 ta = vec3( 0.0, 0.0, 0.0 );
    // camera matrix
    vec3 ww = normalize( ta - ro );
    //vec3 uu = normalize( cross(ww,vec3(0.0,1.0,0.0) ) );
    vec3 uu = normalize( vec3(-ww.y,ww.x,0. ) );
    vec3 vv = normalize( cross(uu,ww));
	// create view ray
	vec3 rd = normalize( p.x*uu + p.y*vv + 1.5*ww );

    // disk animation
    float iTime = iGlobalTime;
	vec3  disk_center = 0.3*sin(iTime*vec3(1.11,1.27,1.47)+vec3(2.0,5.0,6.0));
	vec3  disk_axis = normalize( sin(iTime*vec3(1.23,1.41,1.07)+vec3(0.0,1.0,3.0)) );
    float disk_radius = 0.4 + 0.2*sin(iTime*1.3+0.5);

    // render
   	vec3 col = vec3(0.4)*(1.0-0.3*length(p));

    // raytrace disk
    float t = iDisk( ro, rd, disk_center, disk_axis, disk_radius );
	float tmin = 1e10;
    if( t>0.0 )
	{
    	tmin = t;
		col = vec3(1.0,0.75,0.3)*(0.7+0.2*abs(disk_axis.y));
	}

    // compute bounding box for disk
    bound3 bbox = DiskAABB( disk_center, disk_axis, disk_radius );

    
    // raytrace bounding box
    vec3 bcen = 0.5*(bbox.mMin+bbox.mMax);
    vec3 brad = 0.5*(bbox.mMax-bbox.mMin);
	vec2 tbox = iBox( ro, rd, bcen, brad );
	if( tbox.x>0.0 )
	{
        // back face
        if( tbox.y < tmin )
        {
            vec3 pos = ro + rd*tbox.y;
            vec3 e = smoothstep( brad-0.03, brad-0.02, abs(pos-bcen) );
            float al = 1.0 - (1.0-e.x*e.y)*(1.0-e.y*e.z)*(1.0-e.z*e.x);
            col = mix( col, vec3(0.0), 0.25 + 0.75*al );
        }
        // front face
        if( tbox.x < tmin )
        {
            vec3 pos = ro + rd*tbox.x;
            vec3 e = smoothstep( brad-0.03, brad-0.02, abs(pos-bcen) );
            float al = 1.0 - (1.0-e.x*e.y)*(1.0-e.y*e.z)*(1.0-e.z*e.x);
            col = mix( col, vec3(0.0), 0.15 + 0.85*al );
        }
	}
	
        // no gamma required here, it's done in line 118

        tot += col;
#if AA>1
    }
    tot /= float(AA*AA);
#endif

    // dithering
    tot += ((hash1(fragCoord.xy)+hash1(fragCoord.yx+13.1))/2.0-0.5)/256.0;

	fragColor = vec4( tot, 1.0 );
}