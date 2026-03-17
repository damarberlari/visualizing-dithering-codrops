uniform vec2 uZPositionRange; // Range for z position animation (start and end)
uniform float uAnimationProgress; // Animation progress (0.0 to 1.0) to control the z position animation
uniform float uAnimationMaxDelay; // Maxium delay for the animation.
uniform sampler2D uTexture; // Texture uniform to sample the image color

attribute float aRowIdNormalized; // Normalized row ID attribute
attribute float aColumnIdNormalized; // Normalized column ID attribute
attribute float aCellIdNormalized; // Normalized cell ID attribute
attribute float aDitheringThreshold; // Dithering threshold attribute for each cell

varying vec3 vColor; // Varying to pass the color to the fragment shader

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

    // Sample the texture to get the color for the current cell
    float imageColor = texture2D(uTexture, vec2(aColumnIdNormalized, 1.0 - aRowIdNormalized)).r;
    // Compare the image color with the dithering threshold to determine if the cell should be "white" or "black"
    float ditheringThreshold = aDitheringThreshold;
    float ditheredColor = step(ditheringThreshold, imageColor);

    // Calculate the progress of the color animation for each cell
    float colorAnimationProgress = smoothstep(animationStart, animationEnd, uAnimationProgress);
    
    // Change the color of the cell based on the calculated animation progress,
    float finalColor = mix(imageColor, ditheredColor, colorAnimationProgress);

    //Add border
    float borderThreshold = 0.005; // Adjust this value to control the thickness of the border
    float borderX = step(aColumnIdNormalized, borderThreshold) + step(1.0 - borderThreshold, aColumnIdNormalized);
    float borderY = step(aRowIdNormalized, borderThreshold) + step(1.0 - borderThreshold, aRowIdNormalized);
    float isBorder = clamp(borderX + borderY, 0.0, 1.0);
    finalColor = mix(finalColor, 0.0, isBorder);

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

    vColor = vec3(finalColor);
}