
// Ray Marching With Soft Shadows
// By: Brandon Fogerty
// bfogerty at gmail dot com
// xdpixel.com


#define TopColor            vec3( 0.35, 0.4, 0.8 )
#define MiddleColor         vec3( 0.8, 0.8, 0.8 )
#define BottomColor         vec3( 0.55, 0.2, 0.6 )

const float EPS = 0.01;
const int MAXI = 100;

struct HitObject
{
    float distance;
    vec3 color;
    vec3 hitPos;
};

//--------------------------------------------------------------------------------
vec3 BackGroundGradient( vec2 uv )
{
    uv.y *= -1.0;

    vec3 color = vec3(0.0);
    if( uv.y <= 0.0 )
    {
        color = mix( TopColor, MiddleColor, uv.y + 1.0 );
    }
    else
    {
        color = mix( MiddleColor, BottomColor, uv.y );
    }

    return color;
}

//--------------------------------------------------------------------------------
vec3 Sun( vec2 uv, vec2 pos, float size, float strength )
{
    float t = pow( abs( 1.0/(length( uv + pos) * size) ), strength );
    return t * vec3( 5.0, 3.0, 2.0 );
}

//--------------------------------------------------------------------------------
vec3 Background( vec2 uv )
{
    vec3 color = BackGroundGradient(uv);

    float sunStrength = mix( 2.8, 3.0, sin( iTime ) * 0.5 + 0.5 );
    color += Sun( uv, vec2( -1.4, -0.6 ), 10.0, sunStrength );

    return color;
}

//--------------------------------------------------------------------------------
mat4 Transpose( mat4 m )
{
    mat4 t = mat4( vec4( m[0][0], m[1][0], m[2][0], m[3][0] ),
                   vec4( m[0][1], m[1][1], m[2][1], m[3][1] ),
                   vec4( m[0][2], m[1][2], m[2][2], m[3][2] ),
                   vec4( m[0][3], m[1][3], m[2][3], m[3][3] ) );
    return t;
}

//--------------------------------------------------------------------------------
HitObject Torus( vec3 ray, vec2 size, vec3 color, mat4 transform )
{
    vec3 rayPrime = vec3(Transpose( transform ) * vec4(ray,1));
    vec2 q = vec2(length(rayPrime.xz)-size.x,rayPrime.y);
    float d = length(q)-size.y;

    HitObject hitObject;
    hitObject.distance = d;
    hitObject.color = color;

    return hitObject;
}

//--------------------------------------------------------------------------------
HitObject RoundedCube( vec3 ray, vec3 size, float radius, vec3 color, mat4 transform )
{
    vec3 rayPrime = vec3(Transpose( transform ) * vec4(ray,1));
    float d = length(max(abs(rayPrime)-size,0.0))-radius;

    HitObject hitObject;
    hitObject.distance = d;
    hitObject.color = color;

    return hitObject;
}

//--------------------------------------------------------------------------------
HitObject Scene( vec3 ray )
{
    float t = iTime;
    float c = cos( t );
    float s = sin( t );

    mat4 rotX = mat4(      vec4(1,0,0,0),
                           vec4(0,c,-s,0),
                           vec4(0,s,c,0),
                           vec4(0,0,0,1) );

    mat4 rotY = mat4(      vec4(c,0,-s,0),
                           vec4(0,1,0,0),
                           vec4(s,0,c,0),
                           vec4(0,0,0,1) );

    mat4 rotZ = mat4(      vec4(c,s,0,0),
                           vec4(-s,c,0,0),
                           vec4(0,0,1,0),
                           vec4(0,0,0,1) );

    mat4 transform = rotY * rotZ;
    HitObject objA = RoundedCube( ray, vec3(0.5,0.5,0.5), 0.15, vec3( 0.8, 0.3, 0.2 ), transform );
    HitObject objB = Torus( ray, vec2(0.8,0.2), vec3( 0.8, 0.8, 0.2 ), transform );

    float morphT = sin( iTime * 0.5 ) * 0.5 + 0.5;
    //morphT = 1.0;
    HitObject obj1;
    obj1.distance = mix( objA.distance, objB.distance, morphT);
    obj1.color = mix( objA.color, objB.color, morphT);

    transform = mat4(       vec4(1,0,0,0),
                            vec4(0,1,0,-2.0),
                            vec4(0,0,1,0),
                            vec4(0,0,0,1) );

    HitObject obj2 = RoundedCube( ray, vec3(5.0,0.1,5.0), 0.1, vec3( 0.2, 0.4, 0.5 ), transform );



    if( obj1.distance < obj2.distance )
    {
        return obj1;
    }


    return obj2;
}

//--------------------------------------------------------------------------------
float SceneDist( vec3 ray )
{
    return Scene( ray ).distance;
}

//--------------------------------------------------------------------------------
vec3 GetNormal(vec3 pos)
{
    vec2 eps = vec2(0.0, EPS);
    return normalize(vec3(
                SceneDist(pos + eps.yxx) - SceneDist(pos - eps.yxx),
                SceneDist(pos + eps.xyx) - SceneDist(pos - eps.xyx),
                SceneDist(pos + eps.xxy) - SceneDist(pos - eps.xxy))
            );
}

//--------------------------------------------------------------------------------
float Shadow( vec3 hitPos, vec3 normal, vec3 lightPos )
{
    HitObject hitObject;

    vec3 rayDir = normalize( -vec3( lightPos - hitPos ) );

    hitPos = hitPos + (rayDir * 0.1);

    hitObject = Scene( hitPos );
        float dist = hitObject.distance;
    float total = dist;


    float shadowFactor = 1.0;

    for(int i=0; i < MAXI; ++i)
    {
        HitObject tempHitObject = Scene( hitPos + rayDir * total );
        dist = tempHitObject.distance;

        if( dist <= 0.01 )
        {
            return 0.00;
        }

        shadowFactor = min( shadowFactor, (8.0*dist)/float(i));
        total += dist;
    }

    shadowFactor = clamp( shadowFactor, 0.00, 1.0 );

    return shadowFactor;
}

//--------------------------------------------------------------------------------
vec3 Lighting( vec3 lightPos, vec3 hitPos, vec3 camPos, vec3 normal, vec3 diffuseColor )
{
    vec3 fromHitPosToLight = lightPos - hitPos;
    vec3 lightDir = normalize( fromHitPosToLight );
    vec3 viewDir = normalize( camPos - hitPos );
    vec3 lightAmbientColor = vec3(0.1);
    vec3 lightSpecularColor = vec3(1,1,1);

    float lightDiffuseIntensity = 1.0-clamp( dot( normal, lightDir ) * 0.5 + 0.5, 0.00, 1.0);
    vec3 halfDir = normalize(viewDir + lightDir);
    float lightSpecularIntensity = pow( clamp(dot( normal, reflect(lightDir, normal )), 0.0, 1.0), 80.0 );

    lightSpecularIntensity *= pow( length(fromHitPosToLight), 0.1 );

    float shadowFactor = Shadow(hitPos, normal, lightPos);

    return lightAmbientColor + ((lightDiffuseIntensity * diffuseColor) + (lightSpecularIntensity * lightSpecularColor)) * shadowFactor;

}

//--------------------------------------------------------------------------------
vec3 RenderScene( vec2 uv )
{
    vec3 color = vec3(0,0,0);

    vec3 lightPos = vec3(7.0,30,7.0);

    vec3 camPos = vec3(0.0, 0.0, -3.0);
    vec3 camTarget = vec3(0.0, 0.0, 0.0);
    vec3 camUp = vec3(0,1.0,0);
    vec3 camFwd = normalize( camTarget - camPos );
    vec3 camRight = normalize( cross( camUp, camFwd ) );
    camUp = normalize( cross( camRight, camFwd ) );

    HitObject hitObject;
    hitObject = Scene( camPos );

    float dist = hitObject.distance;
    float total = dist;
    vec3 rayDir = vec3( normalize( camFwd + camRight * uv.x + camUp * uv.y ) );

    for(int i=0; i < MAXI; ++i)
    {
        HitObject tempHitObject = Scene( camPos + rayDir * total );
        dist = tempHitObject.distance;
        total += dist;

        if( dist <= EPS )
        {
            hitObject = tempHitObject;
            break;
        }
    }

    vec3 dest = camPos + rayDir * total;
    if( dist <= EPS )
    {
        vec3 hitPos = camPos + rayDir * total;
        vec3 normal = GetNormal( dest );
        vec3 diffuse = hitObject.color;
        color = Lighting( lightPos, hitPos, camPos, normal, diffuse );
    }
    else
    {
        color = Background( uv );
    }

    return color;
}

void mainImage(out vec4 fragColor , in vec2 fragCoord){

    vec2 uv = ( fragCoord.xy / iResolution.xy ) * 2.0 - 1.0;
    uv.x *= iResolution.x / iResolution.y;

    vec3 finalColor = RenderScene( uv );

    fragColor = vec4( finalColor, 1.0 );

}
