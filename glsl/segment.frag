// Fork of https://www.shadertoy.com/view/lsBSDz
// A very pretty line segment primitive, with vignette

// This is an awesome, robust, scalable, beautiful way of adjusting thickness
#define LINE_THICKNESS .001

float clamp01(float value){
    return clamp(value, .0, 1.);
}

// The vector-projection of vec_a to vec_b is always a scalar multiple of vec_b
// (namely, a vector in the direction of vec_b, or, equivalently,
// a vector in the 1-dimensional subspace spanned by vec_b).
// This function computes that scalar multiple!
float vector_projection_scalar(vec2 vec_a, vec2 vec_b){
	return dot(vec_a, vec_b) / dot(vec_b, vec_b);
}

// To specify a line segment, we give 2 vertices vert0 and vert1 (you could also easily
// give a vertex and a displacement vector, since we will compute that displacement vector
// anyway, but I feel 2 vertices is more intuitive).
// A vertex is the same as a position vector and also the same as a "point".
// The difference of 2 vertices (aka. position vectors, aka. points)
// is a displacement vector (aka. affine vector).
// Here we try to make the distinction very explicit, since vector spaces are already
// confusing enough, what with all the closely related (some equivalent, some not) notions of
// vector, position vector, displacement vector, point, vertex, affine vector, co-vector,
// dual vector, 1-form, linear functional, row vector, column vector, basis vector,
// covariant vector, contravariant vector, pseudovector, paravector, multivector, 1-vector, 2-vector,
// blade, 1-blade, 2-blade, tensor, (p,q)-tensor, bra-vector, ket-vector,
// tangent vector, cotangent vector, etc.
// For example, the cross product of 2 vectors is not a (proper) vector, but a pseudovector!
// And the exterior product of 2 vectors is not a vector, but a 2-vector, which is Hodge-dual
// (in 3D space) to the cross product.
// Understanding all this jargon in necessary to gain a deep understanding of vector spaces,
// which, I'm learning, are not so simple and innocent as one would think! They ARE sexy, though
float df_segment(vec2 uv, vec2 vert0, vec2 vert1){
    vec2 dvec_0p = uv - vert0;  // Displacement vector from vert0 to current point
    vec2 dvec_01 = vert1 - vert0;  // Displacement vector from vert0 to vert1
    float vproj_scalar_0p_01 = clamp01(vector_projection_scalar(dvec_0p, dvec_01));  // Without clamp, we'd get a line!
    vec2 vproj_0p_01 = vproj_scalar_0p_01 * dvec_01;  // As promised, a scalar multiple of dvec_01
    float dist_segment = distance(dvec_0p, vproj_0p_01) - LINE_THICKNESS;  // Distance field! This is IT!
    return smoothstep(.0, 5. / iResolution.y, dist_segment);  // Now we just smoothen the field
}

// To specify a line, we give 2 vertices vert0 and vert1 (you could also easily
// give a vertex and a displacement vector, since we will compute that displacement vector
// anyway, but I feel 2 vertices is more intuitive).
float df_line(vec2 uv, vec2 vec_a, vec2 vec_b){
    vec2 dvec_ap =    uv - vec_a;  // Displacement vector from vec_a to current pixel
    vec2 dvec_ab = vec_b - vec_a;  // Displacement vector from vec_a to vec_b
    vec2 vproj_ap_ab = dvec_ab * vector_projection_scalar(dvec_ap, dvec_ab);  // Standard linear algebra vector projection!
    float line = distance(dvec_ap, vproj_ap_ab) - LINE_THICKNESS;
    return smoothstep(0., 5. / iResolution.y, line);
}

// @uv must be in the 2-box [0;1] x [0;1]
float draw_vignette(vec2 uv){
    return 0.5 + 1.5 * pow(uv.x * uv.y * (1. - uv.x) * (1. - uv.y), .3);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
	vec2 uv0 = fragCoord / iResolution.xy;  // Map pixel coordinates to [0;1] x [0;1]
    float vignette = draw_vignette(uv0);  // Vignette requires [0;1] coordinates

    vec2 uv = (2.*fragCoord - iResolution.xy) / iResolution.y;  // Map pixel y-coordinates to [-1;1]

    float segment0 = df_segment(uv, vec2(.0, .0), vec2(.4, .4));
    float segment1 = df_segment(uv, vec2(.1, .0), vec2(.5, .4));
    float line0 = df_line(uv, vec2(-.2, .0), 2.*iMouse.xy/iResolution.xy - 1.);

    float geometry = segment0;
    geometry = min(geometry, segment1);
    geometry = min(geometry, line0);

    float rgb = geometry * vignette;
    rgb = pow(rgb, .4);  // Gamma correction?
	fragColor.rgb = vec3(rgb);
}
