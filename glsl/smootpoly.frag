/* Created by Vinicius Graciano Santos - vgs/2015 
 * This is a tutorial that explains the polynomial smooth minimum.
 *
 * Read my blog post at http://viniciusgraciano.com/blog/smin/ 
 * for a complete description including all the maths!
 * 
 * This function is a polynomial approximation to the min function,
 * and it is widely used by "shadertoyers" to do smooth unions of 
 * distance functions that represent objects in raymarchers.
 * There are some nice, simple, and beautiful mathematical ideas in it!
 *
 * Polynomial smin was introduced by iq in the following article:
 * http://iquilezles.org/www/articles/smin/smin.htm
 */

// Polynomial smooth min (for copying and pasting into your shaders)
float smin(float a, float b, float k) {
    float h = clamp(0.5 + 0.5*(a-b)/k, 0.0, 1.0);
    return mix(a, b, h) - k*h*(1.0-h);
}

// Polynomial smooth min (commented version)
// @input a: first value
// @input b: second value
// @float k: 'Smoothness value', usually in the range (0,1].
//           Values close to zero makes smin converge to min.
//           Warning: the function is NOT defined at k = 0!
//           Tip: negative values turn the funtion into smooth max!
float sminExplained(float a, float b, float k) {
    
    // Compute the difference between the two values.
    // This is used to interpolate both values inside the range (-k, k).
    // Smaller ranges give a better approximation of the min function.
    float h = a - b;
    
    // The interval [-k, k] is mapped to [0, 1],
    // and clamping takes place only after this transformation.
    
    // Map [-k, k] to [0, 1] and clamp if outside the latter.
    h = clamp(0.5 + 0.5*h/k, 0.0, 1.0);    
    
    // Linearly interpolate the input values using h inside (0, 1).
    // The second term ensures continuous derivatives at the boundaries of [0,1],
    // but this is not completely obvious! See my blog post for details.
    return mix(a, b, h) - k*h*(1.0-h);    
}

// Only rendering functions below this line...
vec2 gradsmin(vec2 p, float k);
vec3 plot(vec2 uv, vec2 st) {     
    float a = cos(uv.x), b = exp(-uv.x);
    
    // Distance estimate to f(x) = sin(x)
    float d1 = abs(uv.y - a) / length(vec2(1.0, sin(uv.x)));
    
    // Distance estimate to g(x) = exp(-x)
    float d2 = abs(uv.y - b) / length(vec2(1.0, -b));
    
    // Distance estimate to h(x) = smin(f(x), g(x))    
    float k = 0.5*(cos(iTime)+1.0)+0.01;
    float d3 = abs(uv.y - smin(a, b, k)) / length(gradsmin(uv, k));        
    
    // Background    
    vec3 col = vec3(1.0);
    col *= 0.1 + 0.9*pow(st.x*st.y*(1.0-st.x)*(1.0-st.y), 0.85);
    
    // Mix graphs with background
    const vec3 blue = vec3(29. , 115., 170.)/255.;
	const vec3 yellow = vec3(140., 188., 79.)/255.;
    const vec3 red = vec3(196., 68., 65.)/255.;    
    float eps = 8.0/min(iResolution.x, iResolution.y) + 0.008;
    col = mix(blue, col, smoothstep(0.0, eps, d1));
    col = mix(yellow, col, smoothstep(0.0, eps, d2));
    col = mix(red, col, smoothstep(0.0, 1.25*eps, d3));
        
    return col;
}

vec2 gradsmin(vec2 p, float k) {
    const float eps = 0.01;
    float dy = smin(cos(p.x+eps), exp(-(p.x+eps)), k)
    		 - smin(cos(p.x-eps), exp(-(p.x-eps)), k);
    return vec2(1.0, 0.5*dy/eps);
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
	vec2 st = fragCoord.xy / iResolution.xy;    
    vec2 uv = vec2(-1.07, -0.75) + vec2(10.0, 1.5)*st;
    uv.y *= iResolution.x / iResolution.y;
    
    vec3 col = plot(uv, st);
    col = pow(col, vec3(0.45));
    col = smoothstep(0.0, 1.0, col);
    
	fragColor = vec4(col,1.0);
}