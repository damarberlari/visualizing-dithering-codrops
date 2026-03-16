uniform vec2 uZPositionRange; // Range for z position animation (start and end)
uniform float uAnimationProgress; // Animation progress (0.0 to 1.0) to control the z position animation
uniform float uAnimationMaxDelay; // Maxium delay for the animation.

attribute float aCellIdNormalized; // Normalized cell ID attribute

void main() {
    //Calculate delay and duration for each cube animation
    float delayFactor = aCellIdNormalized; 
    float animationStart = delayFactor * uAnimationMaxDelay;
    float animationDuration = 1.0 - uAnimationMaxDelay;
    float animationEnd = animationStart + animationDuration;

    vec3 cellLocalPosition = vec3(position);

    vec4 cellWorldPosition = modelMatrix * instanceMatrix * vec4(cellLocalPosition, 1.0);
    
    // Calculate the z position start and end position based on the uniform values
    float zPositionStart = uZPositionRange.x;
    float zPositionEnd = uZPositionRange.y;
    
    // Smoothen the z position animation progress using smoothstep
    // Animations will start at animationStart and end at animationEnd value for each cube
    float zPositionAnimationProgress = smoothstep(animationStart, animationEnd, uAnimationProgress);
    
    // Update the world z position of the cell based on the zPositionAnimationProgress value
    cellWorldPosition.z += mix(zPositionStart, zPositionEnd, zPositionAnimationProgress);

    gl_Position = projectionMatrix * viewMatrix * cellWorldPosition;
}