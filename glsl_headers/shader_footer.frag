
vec2 fix_screen (in vec4 fc) {
	vec2 canvas_pos = iResolution.zw;
	vec2 uv = fc.xy ; 
    uv.y -= canvas_pos.y ;
	return uv ;
}
void main(void){
    vec2 gfc = fix_screen(gl_FragCoord) ;  
    //vec2 tfc = fix_tscreen(tex_coord0) ;  
    mainImage(gl_FragColor, gfc );

}
