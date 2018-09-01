
// highlight parameters
const float waveHeight = 0.5;
const float waveSpeed = 0.5;
const float wavePause = 0.8;
const vec3 highlightCol = vec3(0.7, 0.7, 0.9);

// scene parameters
const float highlightRadius = 0.43;
const float sRadius = 0.4;

const vec3 lightPos = vec3(1.3, 1.4, 2.5);
const vec3 viewerPos = vec3(0., 0., 4.);
const vec3 ambientCol = vec3(0.2, 0.2, 0.4);
const vec3 lightCol = vec3(0.35, 0.2, 0.2);

vec3 computeSpherePos(vec2 p, vec2 center, float r)
{
    vec2 local = p - center;
    return vec3(local, sqrt(r * r - dot(local, local)));
}

vec2 computeSphereMapCoord(vec3 c, float r)
{
    return vec2(atan(c.z, c.x), acos(c.y / r));   
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
	vec2 p = fragCoord / iResolution.xy;
    p.x *= iResolution.x / iResolution.y;
 
    vec2 sCenter = 0.5 * vec2(iResolution.x/iResolution.y, 1.);
    
    vec3 sPos = computeSpherePos(p, sCenter, sRadius);
    vec3 sNorm = normalize(sPos);
    vec3 lightDir = normalize(lightPos - sPos);
    
    float cosIncidence = dot(lightDir, sNorm);
    float diffuse = clamp(cosIncidence, 0., 1.);
    
    vec3 refl = reflect(lightDir, sNorm);
    vec3 viewDir = normalize(sPos - viewerPos);

    float specularTerm = clamp(dot(viewDir, refl), 0., 1.);
    float specular = pow(specularTerm, 4.);

    vec3 map = texture2D(iChannel0, computeSphereMapCoord(sPos, sRadius)).xyz;
    vec3 col = ambientCol * map + lightCol * (diffuse + specular);

    float inBackground = dot(p - sCenter, p - sCenter) - sRadius * sRadius;
    col *= inBackground > 0.0 ? vec3(0.66, 0.83, 0.55) : vec3(1);

    vec3 highlightPos = computeSpherePos(p, sCenter, highlightRadius);
    float wave = mod(highlightPos.y - iTime * waveSpeed, waveHeight + wavePause); // [0, h+p]
	wave = max(0., wave - wavePause) / waveHeight; // [0, 1]

	if (dot(p - sCenter, p - sCenter) < highlightRadius * highlightRadius) {
        col = mix(col, highlightCol, wave / 3.);
    }
 
    fragColor = vec4(col, 1.0);
}
