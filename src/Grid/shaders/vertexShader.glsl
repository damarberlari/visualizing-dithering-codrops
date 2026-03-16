uniform vec2 uZPositionRange; // Range for z position animation (start and end)
uniform float uAnimationProgress; // Animation progress (0.0 to 1.0) to control the z position animation
uniform float uAnimationMaxDelay; // Maxium delay for the animation.

attribute float aRowIdNormalized; // Normalized row ID attribute
attribute float aColumnIdNormalized; // Normalized column ID attribute
attribute float aCellIdNormalized; // Normalized cell ID attribute

float random (vec2 st) {
    return fract(sin(dot(st.xy,
                         vec2(12.9898,78.233)))*
        43758.5453123);
}

void main() {
    //Calculate delay index based on the selected delay type
    #ifdef DELAY_TYPE
        #if DELAY_TYPE == 1
            // Cell Index - based delay
            float delayFactor = aCellIdNormalized;
        #elif DELAY_TYPE == 2
            // Row-based delay
            float delayFactor = aRowIdNormalized;
        #elif DELAY_TYPE == 3
            // Column-based delay
            float delayFactor = aColumnIdNormalized;   
        #elif DELAY_TYPE == 4
            // random-based delay
            float delayFactor = random(vec2(aColumnIdNormalized, aRowIdNormalized));
        #elif DELAY_TYPE == 5
            // delay based on distance from the top-left corner;
            float delayFactor = distance(vec2(aRowIdNormalized, aColumnIdNormalized), vec2(0, 0));
            delayFactor = smoothstep(0.0, 1.42, delayFactor);
        #else
            // No delay
            float delayFactor = 0.0;
        #endif
    #else
        // Default to no delay if DELAY_TYPE is not defined
        float delayFactor = 0.0;
    #endif
    
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