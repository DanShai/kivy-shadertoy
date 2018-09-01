mat3 m = mat3( 0.00,  0.80,  0.60,
              -0.80,  0.36, -0.48,
              -0.60, -0.48,  0.64 );

// the backbone of any noise, or really any chaotic/natural/random looking
// shader. hash basically maps an input value n to a random location in [0..1]
// this function does have a period of TWO_PI but because the scaling factor
// is so large there's significant differences between e.g. hash(0) and hash(TWO_PI)
// the float data-type is not precise enough to be able to show the pattern even
// in minute scales
// and we're sampling with n ranging in the hundreds and thousands - it's basically
// a reproducable random
float hash( float n )
{
    return fract(sin(n)*43758.5453123);
}


// some random noise function that i can't really parse
// most noise functions are basically chaotic but
// still continuous mappings whose behavior is complex enough
// that humans can't see the pattern
float noise( in vec3 x )
{
    vec3 p = floor(x);
    vec3 f = fract(x);

    f = f*f*(3.0-2.0*f);

    float n = p.x + p.y*57.0 + 113.0*p.z;

    float res = mix(mix(mix( hash(n+  0.0), hash(n+  1.0),f.x),
                        mix( hash(n+ 57.0), hash(n+ 58.0),f.x),f.y),
                    mix(mix( hash(n+113.0), hash(n+114.0),f.x),
                        mix( hash(n+170.0), hash(n+171.0),f.x),f.y),f.z);
    return res;
}




// return an interpolated height and position for the given input

// height algorithm:
// partition 2d space into a set of 1x1 squares
// each square has 4 corners; each corner's coordinate is associated
// with a random height (and with a variable a-d), such that the same corner on two different squares has
// the same value. Interpolate between the corners
// depending on where in the 1x1 square you are. Linear interpolation
// creates discontinuities at the edges, instead use a cubic hermite spline with slope 0 at the tangents - this ensures smoothness
// of 2 degrees.
/*
      x+           
 +------------>   
 |                
 |  a            b
y|   +----------+ 
+|   |          | 
 |   |          | 
 v   |          | 
     |          | 
     |          | 
     +----------+ 
    c            d
*/
vec3 noised( in vec2 x )
{
    vec2 p = floor(x);
    vec2 f = fract(x);

    vec2 u = f*f*(3.0-2.0*f);

    float n = p.x + p.y*54.0;

    // heights of the four corners
    float a = hash(n+  0.0);
    float b = hash(n+  1.0);
    float c = hash(n+ 54.0);
    float d = hash(n+ 55.0);
    
    return vec3(a+(b-a)*u.x+(c-a)*u.y+(a-b-c+d)*u.x*u.y,
                30.0*f*f*(f*(f-2.0)+1.0)*(vec2(b-a,c-a)+(a-b-c+d)*u.yx));

                // scalar function: f*f*(f*(f-2.0)+1.0) = f^2*(f-1)^2 = hump shape from [0..1] (*30 = goes up to 1.875 in the middle)
                // any function can serve as the scalar as long as it 1) goes to 0 at the edges, and 2) is continuous (and preferably is smooth as well)
                // the scalar affects how smooth the terrain is; a higher value will make the mountains more sharp
                
                // the actual yz vec2 is another returned value that to add more flavor to the noise. 
                // You can use it as the basis of another noise, or (in the case of the caller here), 
                // modify the .x with the .yz.
                // the vec2 function should reference a,b,c,d such that the function evaluates to the
                // same value on either side of the edge of the 1x1 square
                
                /* 
				 * if the formula is F(x), the following invariants should hold:
				 * (1) F(<x+, y>).y = F(<x-, y>).y, x is an integer
				 * (2) F(<x, y+>).x = F(<x, y->).x, y is an integer
				 * in (1), the scalar makes the x component go to 0, so only the y components must
				 * be equal. Similarly in (2), the y component is multiplied by 0, so only the x
				 * components should be equal.
				 * With the invariants, transitioning between two cells of the 1x1 grid will be continuous
				 */

}

float noise( in vec2 x )
{
    vec2 p = floor(x);
    vec2 f = fract(x);

    f = f*f*(3.0-2.0*f);

    float n = p.x + p.y*57.0;

    float res = mix(mix( hash(n+  0.0), hash(n+  1.0),f.x),
                    mix( hash(n+ 57.0), hash(n+ 58.0),f.x),f.y);

    return res;
}

float fbm( vec3 p )
{
    float f = 0.0;

    f += 0.5000*noise( p ); p = m*p*2.02;
    f += 0.2500*noise( p ); p = m*p*2.03;
    f += 0.1250*noise( p ); p = m*p*2.01;
    f += 0.0625*noise( p );

    return f/0.9375;
}

mat2 m2 = mat2(1.6,-1.2,1.2,1.6);

// fbm is a more complex noise, again harmonic
// that takes several layers of noise at differing
// scales and adds them up -- basically a more interesting
// noise
float fbm( vec2 p )
{
    float f = 0.0;

    f += 0.5000*noise( p ); p = m2*p*2.02;
    f += 0.2500*noise( p ); p = m2*p*2.03;
    f += 0.1250*noise( p ); p = m2*p*2.01;
    f += 0.0625*noise( p );

    return f/0.9375;
}

// the height of the terrain at the given xy location
float terrain( in vec2 x )
{
    // scale world coordinates down a lot
    vec2  p = x*0.003;
    float a = 0.0;
    float b = 1.0;
    vec2  d = vec2(0.0);
    // sample a base noise at different locations 5 times
    // and accumulate the sample into the final height
    // this is the technique of taking a simple noise
    // and making more interesting noise out of it by
    // doing harmonic sampling? is that what it's called
    for(int i=0;i<5; i++)
    {
        // random n
        vec3 n = noised(p);
        // d represents some "distance" away from some origin
        d += n.yz;
        // b is the octave attenuation (1, 0.5, 0.25, etc)
        // add this octave, which is scaled by the attenuation
        // factor and also by the distance factor
        a += b*n.x/(1.0+dot(d,d));
        b *= 0.5;
        // not sure what how this matrix acts on p
        // i believe it's more or less a twist + expand
        p=m2*p;
    }

    return 140.0*a;
}

// same as terrain but go for 9 more iterations
// this produces a much more fine-grained terrain function
// that has goes deeper into the smaller scales of the terrain
// so if terrain( x ) returned some value like 100,
// terrain2( x ) returns a slightly more detailed value like 100.125
// or something - it's a purturbed version of normal terrain
// but the purtubations also exhibit the fractal landscape behavior
// that is characterstic of the land
float terrain2( in vec2 x )
{
    vec2  p = x*0.003;
    float a = 0.0;
    float b = 1.0;
    vec2  d = vec2(0.0);
    for(int i=0;i<14; i++)
    {
        vec3 n = noised(p);
        d += n.yz;
        a += b*n.x/(1.0+dot(d,d));
        b *= 0.5;
        p=m2*p;
    }

    return 140.0*a;
}


// takes in a world location and returns how vertically
// far away you are from the terrain there
// when used within raymarching this means that as the ray 
// is marching, since the map is continuous, you'll eventually
// get within some small epsilon value of the actual terrain,
// at which point you can count it as a hit
float map( in vec3 p )
{
    // the height of the terrain at the location's xz plane
    float h = terrain(p.xz);

    // some sort of postprocessing of the height here
    // to give it more jagged edges

    // not sure how it really works yet
    float ss = 0.03;
    float hh = h*ss;
    // scale the height down a lot, decompose it into its fractional
    // and whole parts
    float fh = fract(hh);
    float ih = floor(hh);
    // transform fh by pushing it up towards its sqrt
    // by some amount depending on the height of the terrain you're at
    // fh corresponds to a height of ~33 in the terrain
    // the effect of this is that regularly at 33 pixel intervals,
    // the middle area of the interval gets pushed up towards the top
    // this creates more of a plateau effect which is more realistic
    // of actual terrain
    fh = mix( sqrt(fh), fh, smoothstep(50.0,140.0,h) );
    
    // reconstruct h with the new fractional part
    h = (ih+fh)/ss;

    return p.y - h;
}

// same as map but using terrain2
float map2( in vec3 p )
{
    float h = terrain2(p.xz);


    float ss = 0.03;
    float hh = h*ss;
    float fh = fract(hh);
    float ih = floor(hh);
    fh = mix( sqrt(fh), fh, smoothstep(50.0,140.0,h) );
    h = (ih+fh)/ss;

    return p.y - h;
}

// return whether the ray starting at rO and pointing at rD
// hit the map or not. If it did, the distance from the origin to the hit
// will be stored in resT
// assumes rD is normalized
bool jinteresct(in vec3 rO, in vec3 rD, out float resT )
{
    float h = 0.0;
    float t = 0.0;
    // march the ray forward 120 times
    for( int j=0; j<50; j++ )
    {
        //if( t>2000.0 ) break;

        vec3 p = rO + t*rD;
        // break out of the iteration if you've passed some vertical
        // plane which guarantees you won't hit the map
        // (assumes the map is below 300); it's for performance i think?
        
        if( p.y>300.0 ) break;
        
        h = map( p );

        // if you're within .1 units, count that as a hit on the terrain
        if( h<0.1 )
        {
            resT = t;
            return true;
        }
        // t controls where your ray has been marched to
        // what iq is saying here is that if the height is
        // still large (that is, the ray is still quite vertically
        // away from hitting the terrain), you can jump the
        // ray much farther forward
        // the invariant here is that the terrain's slope is less than 2
        // the invariant is broken sometimes which is where the strange
        // aliased banding that moves with the camera comes from
        // this is really cool -- you're dynamically sampling the terrain
        // based on how far away you are from it
        t += max(0.1,0.5*h);
    }

    // if you've reached here, you've gone 120 iterations and still
    // not hit the terrain, OR you've hit y = 300
    // if you're within 5 units of the floor, just say you hit
    // not sure why he does this
    if( h<5.0 )
    {
        resT = t;
        return true;
    }
    return false;
}

// this is called starting at the original ray's intersection point + 20*light1, in the direction of light1
// it calculates a long-range shadow with a soft-edge
float sinteresct(in vec3 rO, in vec3 rD )
{
    float res = 1.0;
    float t = 0.0;
    for( int j=0; j<50; j++ )
    {
        //if( t>1000.0 ) break;
        // cast a ray towards the light
        vec3 p = rO + t*rD;

        // track how far from the ground you are
        float h = map( p );

        // if you've hit the ground, you're completely in the shadow
        if( h<0.1 )
        {
            return 0.0;
        }
        // 16 * h/t?
        // 16 is an arbitrary scalar
        // h/t is the difference in height divided by the distance the ray has travelled
        res = min( res, 16.0*h/t );
        // adding h is another performance gain - move the ray based on how far you away you are now
        // because the terrain is mostly smooth
        // you can basically analyze this as t will at some point get placed very near the actual minimum distance
        // away between the ray and the terrain
        // at that point, res will be set to h/t -- so farther-away terrains will cast shadows with a larger gradient
        // basically emulates the diffusive quality of light, also realy cool
        t += h;

    }

    return clamp( res, 0.0, 1.0 );
}

// approximate the gradient of the terrain at pos by
// moving in a small epsilon in each of the three directions
// the epsilon is scaled by t, the distance of the point from
// the camera. This means that points farther away
// have a smoother normal calculation
// the choice of epsilon has a massive effect on the percieved
// detail of the terrain
// the difference is clearly noticable if you have a small epsilon
// on faraway points - there is a lot of aliasing since the effective
// distance between two adjacent pixels that are both far away
// is quite large. This achieves the same effect as mip-mapping in terms
// of detail. You do in fact want to scale by `t` otherwise pixels far away
// don't look connected
vec3 calcNormal( in vec3 pos, float t )
{
    float e = 0.001 * t;
    vec3  eps = vec3(e,0.0,0.0);
    vec3 nor;
    nor.x = map2(pos+eps.xyy) - map2(pos-eps.xyy);
    nor.y = map2(pos+eps.yxy) - map2(pos-eps.yxy);
    nor.z = map2(pos+eps.yyx) - map2(pos-eps.yyx);
    return normalize(nor);
}

vec3 camPath( float time )
{
    vec2 p = 600.0*vec2( cos(1.4+0.37*time),
                         cos(3.2+0.31*time) );

    return vec3( p.x, 0.0, p.y );
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
 
	vec2 uv = 1. * fragCoord.xy / iResolution.xy - .5;
	uv.x *= iResolution.x / iResolution.y;
 
    // maps screen from (-1, -1) on bottom-left to (1, 1) on top-right
    //vec2 xy = -1.0 + 2.0*fragCoord.xy / iResolution.xy;

    // correct aspect ratio; y goes from -1 to 1, x goes from -1.75 to 1.75 (the aspect ratio is hard-coded to be 1.75)
    vec2 s = uv;//xy*vec2(1.75,1.0);

    float time = iGlobalTime*0.15;

    // diretional light coming down from the top
    vec3 light1 = normalize( vec3(  0.4, 0.22,  0.6 ) );

    // a second light, probably directional
    vec3 light2 = vec3( -0.707, 0.000, -0.707 );

    // camera position is set using two cosines at different speeds
    vec3 campos = camPath( time );
    // target's always looking forward -- this is cool
    vec3 camtar = camPath( time + 3.0 );
    campos.y = terrain( campos.xz ) + 15.0;
    // the eye is always just looking down
    camtar.y = campos.y*0.5;

    // roll the camera
    float roll = 0.1*cos(0.1*time);
    // cp is an upwards pointing vector in world space that wiggles slightly
    // it controls the up vector of the camera
    vec3 cp = vec3(sin(roll), cos(roll),0.0);

    // the direction the camera's pointing at
    vec3 cw = normalize(camtar-campos);
    // points to the "right" in the camera
    vec3 cu = normalize(cross(cw,cp));
    // points "up" in the camera, basically cp projected onto the camera's
    // viewing plane
    vec3 cv = normalize(cross(cu,cw));
    // direction of the ray to cast for this pixel
    // it's made of 3 components in camera space -
    // an amount to go horizontally,
    // an amount to go vertically,
    // and an amount to go outwards
    // that cw vector is needed otherwise the rays are always
    // perpendicular to the camera's viewing angle
    // the cw factor more or less controls the fov
    // (a large factor zooms the whole frustum in, a small factor
    // expands the fov out)
    // this is shoddily recreating a frustum, i don't
    // believe this is the right way to do this
    vec3 rd = normalize( s.x*cu + s.y*cv + 1.6*cw );

    float sundot = clamp(dot(rd,light1),0.0,1.0);
    vec3 col;
    float t;
    // if your ray doesn't hit the ground, this pixel is hitting
    // the sky instead -- render the sky
    if( !jinteresct(campos,rd,t) )
    {
        // sky is very light blue scaled by the ray's y position,
        // which is how high up the ray is; higher up means higher up
        // in the sky means a darker blue;
        // the y never goes past some small threshold
        // so the sky always looks *mostly* blue, but you can still see
        // the gradient
        col = 0.9*vec3(0.97,.99,1.0)*(1.0-0.3*rd.y);

        // this line adds a small amount of red-orangish color
        // mostly in a ring shape around where the "sun" would be
        col += 0.2*vec3(0.8,0.7,0.5)*pow( sundot, 4.0 );
    }
    else
    {
        // here's where you hit
        vec3 pos = campos + t*rd;

        // the terrain normal at this location
        vec3 nor = calcNormal( pos, t );

        //basic diffuse light calculation
        float dif1 = clamp( dot( light1, nor ), 0.0, 1.0 );
        // i think this basically produces some ambient light as well?
        float dif2 = clamp( 0.2 + 0.8*dot( light2, nor ), 0.0, 1.0 );
        
        // shadow factor -- 1 = no long-range shadow, 0 = completely in shadow
        float sh = 1.0;
        // if light1 hits me
        if( dif1>0.001 )
            sh = sinteresct(pos+light1*20.0,light1);

        // dif1v is the color contribution of the diffuse of the first light source
        vec3 dif1v = vec3(dif1);
        // sh = iMouse.x / iResolution.x;
        // soft-shadow has a red coloring to it
        dif1v *= vec3( sh, sh*sh*0.5+0.5*sh, sh*sh );

        // apply a simple random noise factor on the base ground color
        // just to give it a bit more flavor
        float r = noise( 7.0*pos.xz );

        // here we begin coloring the terrain. The base color mixes between
        // a dark brown base color and a slightly more colorful brown at the top
        // terrain2 is used here as just another random noise function whose input scales
        // are on the same magnitude as the position; it's used to give the vertical bands
        // in the terrain
        float heightMix = clamp(terrain2( vec2(pos.x,pos.y*48.0))/200.0,0.0,1.0);
        col = (r*0.25+0.75)*0.9*mix( vec3(0.10,0.05,0.03), vec3(0.13,0.10,0.08), heightMix );
        // mix the color with a more reddish hue if the normal points more up (how flat it is)
        col = mix( col, 0.17*vec3(0.5,.23,0.04)*(0.50+0.50*r),smoothstep(0.70,0.9,nor.y) );
        // and if they're *really* flat, give it some green for grass
        col = mix( col, 0.10*vec3(0.2,.30,0.00)*(0.25+0.75*r),smoothstep(0.95,1.0,nor.y) );
        col *= 0.75;
         // snow
        #if 1
        // height factor -- higher places have more snow (h=1), lower places have no snow (h=0)
        float h = smoothstep(55.0,80.0,pos.y + 25.0*fbm(0.01*pos.xz) );
        // normal+cliff factor -- land that is flatter gets more snow, cliff-like land doesn't get much snow
        // normal+cliff factor is also scaled by height, aka higher up the slope factor is stronger
        float e = smoothstep(1.0-0.5*h,1.0-0.1*h,nor.y);
        // wind directional factor -- if you have a high x slope, put less snow.
        // so hilly terrain that is going up in one direction will have snow,
        // going down on the other side will have no snow
        float o = 0.3 + 0.7*smoothstep(0.0,0.1,nor.x+h*h);
        float s = h*e*o;
        s = smoothstep( 0.1, 0.9, s );
        // mix color with dark grey color for snow
        col = mix( col, 0.4*vec3(0.6,0.65,0.7), s );
        #endif


        // final light calculation
        
        // start with a slope factor -- cliffs will be shaded slightly darker
        // this is most apparent when the cliff meets the ground; emulates ambient occlusion
        // a little bit
        vec3 brdf  = 2.0*vec3(0.17,0.19,0.20)*clamp(nor.y,0.0,1.0);
        // most of the lighting comes from dif1
             brdf += 6.0*vec3(1.00,0.95,0.80)*dif1v;
        // a bit from dif2, which is just a small ambient secondary light to complement the first
             brdf += 2.0*vec3(0.20,0.20,0.20)*dif2;

       	// add all of the light
        col *= brdf;

        // fog factor - 0 at close distances, goes to 1. Has a slightly s shaped curve
        float fo = 1.0-exp(-pow(0.0015*t,1.5));
        // fog color -- base 0.7; if you're looking towards the sun, make the fog the color of the sun
        // when there's a lot of fog in the distance, the fog carries the color of the sun and blends
        // it in with the actual surface color. This emulates that behavior
        vec3 fco = vec3(0.7) + 0.6*vec3(0.8,0.7,0.5)*pow( sundot, 4.0 );
        col = mix( col, fco, fo );
    }

    // postprocess filter; basically a sqrt color curve that helps the dark parts look brighter
    // a bit like a compressor audio effect; makes things a bit warmer in general
    col = sqrt(col);

    // (0, 0) to (1, 1)
    vec2 uv2 = uv*0.5+0.5;
    //create a slight inset shadow on the top corners
    col *= 0.7 + 0.3*pow(16.0*uv2.x*uv2.y*(1.0-uv2.x)*(1.0-uv2.y),0.1);

    // and we're done!
    fragColor=vec4(col,1.0);
}
