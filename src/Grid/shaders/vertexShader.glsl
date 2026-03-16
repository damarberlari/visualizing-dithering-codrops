uniform vec2 uZPositionRange; // Range for z position animation (start and end)
uniform float uAnimationProgress; // Animation progress (0.0 to 1.0) to control the z position animation

void main() {
    vec3 cellLocalPosition = vec3(position);

    vec4 cellWorldPosition = modelMatrix * instanceMatrix * vec4(cellLocalPosition, 1.0);
    
    // Calculate the z position start and end position based on the uniform values
    float zPositionStart = uZPositionRange.x;
    float zPositionEnd = uZPositionRange.y;
    
    // Smoothen the z position animation progress using smoothstep
    float zPositionAnimationProgress = smoothstep(0.0, 1.0, uAnimationProgress);
    
    // Update the world z position of the cell based on the zPositionAnimationProgress value
    cellWorldPosition.z += mix(zPositionStart, zPositionEnd, zPositionAnimationProgress);

    gl_Position = projectionMatrix * viewMatrix * cellWorldPosition;
}