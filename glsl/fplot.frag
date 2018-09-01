// IMPLICIT f[x] plotter!
// Fork of https://www.shadertoy.com/view/4tB3WV

#define RGB_DARK  vec3(.1, .1, .1)
#define RGB_RED   vec3(1., .4, .4)
#define RGB_GREEN vec3(.3, .7, .6)
#define RGB_BLUE  vec3(.0, .5, 1.)
#define RGB_PURP  vec3(.8, .6, 1.)
#define RGB_PINK  vec3(1., .4, .8)

#define SCALE 2.    // Range for the smallest axis!
#define THICK 4.    // Line thickness
#define THICK_GRID 3.
#define THICK_AXES 8.
#define GRID_WLENGTH 1.  // Wavelength for the grid lines!

// ---------------------------------------------------------------------------------------------------
// Drawing machinery!

// This is the numerical approximation of the 2D derivative, aka. the gradient, aka. the vector of partial derivatives.
// It computes Δf / Δx
const vec2 EPS = vec2(.001, 0);
#define GRAD(f, p)  (vec2(f(p + EPS.xy) - f(p), f(p + EPS.yx) - f(p)) / EPS.xx)

// PLOT_IMPLICIT(function, pixel coordinate, color0, color1)
#define PLOT_IMPLICIT(f, p, c0, c1)  mix(c0, c1, smoothstep(.0, (THICK * SCALE / iResolution.y), abs(f(p) / length(GRAD(f, p)))))

// ---------------------------------------------------------------------------------------------------
float implicit_sine(vec2 uv){  // (Trivial example.) A curve whose implicit representation is explicit!
  return uv.y - sin(sin(iTime) * uv.x);
}

float implicit_circle(vec2 uv){  // Implicit representation of a circle!
  float a = (.25 + (1. - .25) * .5 * (sin(iTime) + 1.));
  float b = 1.;
  return a * uv.x * uv.x + b * uv.y * uv.y - 1.;
}

float implicit_elliptic_curve(vec2 uv){  // Implicit representation of an elliptic curve!
  float a = sin(iTime);
  float b = 0.;
  return uv.y * uv.y - (uv.x * uv.x * uv.x + a * uv.x + b);  // Polynomial-like representation of the curve!
}

float implicit_line(vec2 uv){  // Implicit representation of a line!
  float b = 1.;
  float m = sin(iTime);
  return uv.y - (m * uv.x + b);
}

float implicit_twisted_edwards(vec2 uv){  // Implicit representation of a Twisted Edwards curve, of cryptographic fame!
  float a = 1.;
  float d = 256. * sin(.5 * iTime);
  float sq_x = uv.x * uv.x;
  float sq_y = uv.y * uv.y;
  return a * sq_x + sq_y - (1. + d * sq_x * sq_y);
}

// ---------------------------------------------------------------------------------------------------
float grid(vec2 p){
  vec2 uv = mod(p, GRID_WLENGTH);
  float halfScale = GRID_WLENGTH / 2.;

  float gridRad = THICK_GRID / iResolution.y * SCALE;
  float grid = halfScale - max(abs(uv.x - halfScale), abs(uv.y - halfScale));
  grid = smoothstep(.0, gridRad, grid);

  float axisRad = THICK_AXES / iResolution.y * SCALE;
  float axis = min(abs(p.x), abs(p.y));
  axis = smoothstep(.0, axisRad, axis);

  return min(grid, axis);
}

// ---------------------------------------------------------------------------------------------------
void mainImage(out vec4 fragColor, in vec2 fragCoord){
  vec2 uv = SCALE * (2. * fragCoord - iResolution.xy) / iResolution.y;
  //uv = inverse(mat2(cos(iTime), sin(iTime), -sin(iTime), cos(iTime))) * uv;

  vec3 color = (1. - vec3(grid(uv)) * (1. - RGB_DARK));

  color = PLOT_IMPLICIT(implicit_sine,            uv, RGB_RED,   color);
  color = PLOT_IMPLICIT(implicit_circle,          uv, RGB_GREEN, color);
  color = PLOT_IMPLICIT(implicit_elliptic_curve,  uv, RGB_BLUE,  color);
  color = PLOT_IMPLICIT(implicit_line,            uv, RGB_PURP,  color);
  color = PLOT_IMPLICIT(implicit_twisted_edwards, uv, RGB_PINK,  color);

  fragColor.rgb = color;
}
