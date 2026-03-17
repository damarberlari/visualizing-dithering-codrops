varying vec3 vColor; // Varying to receive the color from the vertex shader

void main() {
    vec3 color = vColor; // Use the color passed from the vertex shader
    
    gl_FragColor = vec4(color, 1.0);
}