/* Distance Field Ray Marching
 * Made by Icohedron
 *
 * I'm still learnin'.
 * The journey is more important than what you get in the end.
 *
 * Big thanks to Inigo Quilez's excellent articles and presentations
 * http://www.iquilezles.org/www/material/nvscene2008/rwwtt.pdf
 * http://www.iquilezles.org/www/articles/rmshadows/rmshadows.htm
 * http://www.iquilezles.org/www/articles/distfunctions/distfunctions.htm
 *
 * I do not claim ownership for any of the code used below. (Variations of it have been used soooo many times already so...)
 * Feel free to use it yourself.

 * Tips? Tricks? Feedback is highly appreciated!
 */

#define FOV 90.0
#define MAX_STEPS 64
#define STEP_PRECISION 0.001
#define NORMAL_PRECISION  0.001
#define SHININESS 8.0
#define CLIP_FAR 32.0
#define AO_SAMPLES 5.0
#define SHADOW_ITERATIONS 32
#define FOG_MULTIPLIER 0.08

//// Primitive Shapes / Distance Fields ////

float udRoundBox(vec3 p, vec3 b, float r) {
	return length(max(abs(p)-b,0.0))-r;
}

float sdSphere(vec3 p, float r) {
	return length(p) - r;
}

float sdPlaneXZ(vec3 p) {
	return p.y;
}

// 3D Fractal - "Mandebulb"
float mandelbulb(vec3 p) {
	vec3 z = p;
	float dr = 1.0;
	float r = 0.0;
	for (int i = 0; i < 32 ; i++) {
		r = length(z);
		if (r>2.0) break;
		
		// convert to polar coordinates
		float theta = acos(z.z/r);
		float phi = atan(z.y,z.x);
		dr =  pow( r, 8.0-1.0)*8.0*dr + 1.0;
		
		// scale and rotate the point
		float zr = pow( r,8.0);
		theta = theta*8.0;
		phi = phi*8.0;
		
		// convert back to cartesian coordinates
		z = zr*vec3(sin(theta)*cos(phi), sin(phi)*sin(theta), cos(theta));
		z+=p;
	}
	return 0.5*log(r)*r/dr;
}

//// The Scene / Combined Distance Fields ////

float map(vec3 p) {
    float dist = sdPlaneXZ(p - vec3(1.0, -1.0, 0.0));
    dist = min(dist, udRoundBox(p - vec3(-1.0, 0.0, 0.75), vec3(0.8), 0.1));
    dist = min(dist, sdSphere(p - vec3(1.5, 0.0, 0.75), 1.0));
    dist = min(dist, mandelbulb(p - vec3(0.0, 0.0, -1.5)));
    return dist;
}

//// Distance Field Ray Marching ////

float march(vec3 rOrigin, vec3 rDirection) {
    float totalDistance = 0.0;
    for (int i = 0; i < MAX_STEPS; i++) {
        vec3 p = rOrigin + rDirection * totalDistance;
        float dist = map(p);
        totalDistance += dist;
        if (dist < STEP_PRECISION) break;
    }
    return totalDistance;
}

//// Calculate Surface Normal ////

vec3 getNormal(vec3 p) {
    return normalize(vec3(
        map(p + vec3(NORMAL_PRECISION, 0.0, 0.0)) - map(p - vec3(NORMAL_PRECISION, 0.0, 0.0)),
        map(p + vec3(0.0, NORMAL_PRECISION, 0.0)) - map(p - vec3(0.0, NORMAL_PRECISION, 0.0)),
        map(p + vec3(0.0, 0.0, NORMAL_PRECISION)) - map(p - vec3(0.0, 0.0, NORMAL_PRECISION))
    ));
}

//// Ambient Occlusion ////

float calcAmbientOcclusion(vec3 p, vec3 surfaceNormal) {
   float r = 0.0;
   float w = 1.0;
   for (float i = 0.0; i <= AO_SAMPLES; i++)
   {
      float d0 = i / AO_SAMPLES;
      r += w * (d0 - map(p + surfaceNormal * d0));
      w *= 0.3;
   }
   return 1.0 - clamp(r, 0.0, 1.0);
}

//// Soft Shadows ////

float softShadow(vec3 rOrigin, vec3 rDirection, float start, float end, float k) {
	float shade = 1.0;
    float dist = start;
    float stepDistance = end / float(SHADOW_ITERATIONS);
    for(int i = 0; i < SHADOW_ITERATIONS; i++) {
		float h = map(rOrigin + rDirection * dist);
        shade = min(shade, k * h / dist);
        dist += clamp(h, 0.02, 0.1);
        if (h < 0.001 || dist > end) break;
    }
    return clamp(shade, 0.0, 1.0);
}

//// Fog ////

void applyFog(inout vec3 color, vec3 fogColor, float dist) {
    float fogFactor = 1.0 - exp(-dist * FOG_MULTIPLIER);
    color = mix(color, fogColor, fogFactor);
}

//// Phong Lighting /////

void calcLighting(inout vec3 color, vec3 surfacePos, vec3 cameraPos) {
    vec3 lightPos = vec3(3.0 * cos(0.75 * iTime), 2.0, 3.0 * sin(0.75 * iTime));
    vec3 lightColor = vec3(0.9, 0.8, 0.75);
    float lightIntensity = 2.0;
    
    vec3 surfaceNormal = getNormal(surfacePos);
    vec3 lightVector = lightPos - surfacePos;
    float distanceToLight = length(lightVector);
    float attenuation = lightIntensity * min(1.0 / distanceToLight, 1.0);
    lightVector = normalize(lightVector);
    vec3 viewDirection = normalize(cameraPos - surfacePos);
    
    float NdotL = max(0.0, dot(surfaceNormal, lightVector));
    float ambient = 0.1;
    float diffuse = NdotL;
    float specular = NdotL * pow(max(0.0, dot(reflect(-lightVector, surfaceNormal), viewDirection)), SHININESS);
    
    float ambientOcclusion = calcAmbientOcclusion(surfacePos, surfaceNormal);
    float shadow = softShadow(surfacePos, lightVector, 0.02, distanceToLight, 16.0);
    
    color = max((ambient + ((diffuse + specular) * attenuation * lightColor)) * ambientOcclusion * shadow * color, ambient * ambientOcclusion * color);
}

//// MAIN FUNCTION ////

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
	vec2 uv = fragCoord.xy / iResolution.xy;
    uv = uv * 2.0 - 1.0;
    uv.x *= iResolution.x / iResolution.y;
    
    vec3 cLookAt = vec3(0.0, 0.0, 0.0);
    vec3 cPosition = normalize(vec3(sin(0.5 * iTime), 1.0, cos(0.5 * iTime))) * 4.0;
    
    vec3 cForward = normalize(cLookAt - cPosition);
    vec3 cRight = normalize(cross(cForward, vec3(0.0, 1.0, 0.0)));
    vec3 cUp = normalize(cross(cForward, -cRight));
    
    float fovFactor = tan(radians(FOV / 2.0));
    
    vec3 cROrigin = cPosition;
    vec3 cRDirection = normalize(cForward + cRight * uv.x * fovFactor + cUp * uv.y * fovFactor);
    
    float dist = march(cROrigin, cRDirection);
    
    vec3 fogColor = vec3(0.0);
    if (dist >= CLIP_FAR) {
        fragColor = vec4(fogColor, 0.0);
        return;
    }
    
    vec3 color = vec3(1.0);
    calcLighting(color, cROrigin + cRDirection * dist, cPosition);
    applyFog(color, fogColor, dist);
    
	fragColor = vec4(color, 1.0);
}