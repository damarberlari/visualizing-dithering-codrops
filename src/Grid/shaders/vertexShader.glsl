void main() {
    vec3 cellLocalPosition = vec3(position);

    vec4 cellWorldPosition = modelMatrix * instanceMatrix * vec4(cellLocalPosition, 1.0);
    
    gl_Position = projectionMatrix * viewMatrix * cellWorldPosition;
}