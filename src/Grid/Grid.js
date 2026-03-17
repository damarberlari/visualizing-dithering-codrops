import * as THREE from "three";
import vertexShader from "./shaders/vertexShader.glsl";
import fragmentShader from "./shaders/fragmentShader.glsl";

class Grid {
  constructor(gridProperties) {
    this.drawn = false; // Whether the grid has been initialized and drawn
    this.shown = false; // Whether the grid is currently added to the scene

    this.gridProperties = gridProperties;

    this.thresholdMaps = [
      {
        id: "bayer4x4",
        name: "Bayer 4x4",
        rows: 4,
        columns: 4,
        data: [
          0, 8, 2, 10,
          12, 4, 14, 6,
          3, 11, 1, 9,
          15, 7, 13, 5
        ]
      },
      {
        id: "halftone",
        name: "Halftone",
        rows: 8,
        columns: 8,
        data: [
          24, 10, 12, 26, 35, 47, 49, 37,
          8, 0, 2, 14, 45, 59, 61, 51,
          22, 6, 4, 16, 43, 57, 63, 53,
          30, 20, 18, 28, 33, 41, 55, 39,
          34, 46, 48, 36, 25, 11, 13, 27,
          44, 58, 60, 50, 9, 1, 3, 15,
          42, 56, 62, 52, 23, 7, 5, 17,
          32, 40, 54, 38, 31, 21, 19, 29
        ]
      },
      {
        id: "bayer8x8",
        name: "Bayer 8x8",
        rows: 8,
        columns: 8,
        data: [
          0, 32, 8, 40, 2, 34, 10, 42,
          48, 16, 56, 24, 50, 18, 58, 26,
          12, 44, 4, 36, 14, 46, 6, 38,
          60, 28, 52, 20, 62, 30, 54, 22,
          3, 35, 11, 43, 1, 33, 9, 41,
          51, 19, 59, 27, 49, 17, 57, 25,
          15, 47, 7, 39, 13, 45, 5, 37,
          63, 31, 55, 23, 61, 29, 53, 21
        ]
      },
      {
        id: "voidAndCluster",
        name: "Void and Cluster",
        rows: 14,
        columns: 14,
        data: [
          131, 187, 8, 78, 50, 18, 134, 89, 155, 102, 29, 95, 184, 73,
          22, 86, 113, 171, 142, 105, 34, 166, 9, 60, 151, 128, 40, 110,
          168, 137, 45, 28, 64, 188, 82, 54, 124, 189, 80, 13, 156, 56,
          7, 61, 186, 121, 154, 6, 108, 177, 24, 100, 38, 176, 93, 123,
          83, 148, 96, 17, 88, 133, 44, 145, 69, 161, 139, 72, 30, 181,
          115, 27, 163, 47, 178, 65, 164, 14, 120, 48, 5, 127, 153, 52,
          190, 58, 126, 81, 116, 21, 106, 77, 173, 92, 191, 63, 99, 12,
          76, 144, 4, 185, 37, 149, 192, 39, 135, 23, 117, 31, 170, 132,
          35, 172, 103, 66, 129, 79, 3, 97, 57, 159, 70, 141, 53, 94,
          114, 20, 49, 158, 19, 146, 169, 122, 183, 11, 104, 180, 2, 165,
          152, 87, 182, 118, 91, 42, 67, 25, 84, 147, 43, 85, 125, 68,
          16, 136, 71, 10, 193, 112, 160, 138, 51, 111, 162, 26, 194, 46,
          174, 107, 41, 143, 33, 74, 1, 101, 195, 15, 75, 140, 109, 90,
          32, 62, 157, 98, 167, 119, 179, 59, 36, 130, 175, 55, 0, 150
        ]
      },
    ]

    this.cellProperties = this.calculateCellProperties(gridProperties);
  }

  calculateCellProperties(gridProperties) {
    const rowCount = gridProperties.rowCount || 1;
    const columnCount = gridProperties.columnCount || 1;
    const cellSpacing = gridProperties.cellSize || 1;

    const objectCount = rowCount * columnCount;
    const properties = new Array(objectCount);


    for (let i = 0; i < objectCount; i++) {
      properties[i] = {};
      properties[i].cellIdNormalized = i / (objectCount - 1); // Normalize cellId to [0, 1] range

      const rowId = Math.floor(i / columnCount);
      const columnId = i % columnCount;

      // Place the cell on the grid based on its row and column, then centering the grid around the origin
      const x = (columnId - (columnCount - 1) / 2) * cellSpacing;
      const y = (-rowId + (rowCount - 1) / 2) * cellSpacing;
      const z = 0;

      // Store the calculated position in the properties array
      properties[i].x = x;
      properties[i].y = y;
      properties[i].z = z;
      properties[i].rowIdNormalized = rowId / (rowCount - 1);
      properties[i].columnIdNormalized = columnId / (columnCount - 1);
      properties[i].thresholdMaps = {}; // Prepare an object to hold threshold map values for this cell

      this.thresholdMaps.forEach(config => {
            const { data, rows: matrixRowSize, columns: matrixColumnSize } = config;
            const matrixSize = data.length;
            const matrixRow = rowId % matrixRowSize;
            const matrixColumn = columnId % matrixColumnSize;
            const index = matrixColumn + matrixRow * matrixColumnSize;

            const thresholdValue = data[index] / matrixSize; // Normalize threshold to [0, 1]

            properties[i].thresholdMaps[config.id] = thresholdValue;
      });

    }

    return properties;
  }

  init() {
    const cellSize = this.gridProperties.cellSize || 1;
    const cellThickness = this.gridProperties.cellThickness || 1;

    const geometry = new THREE.BoxGeometry(cellSize, cellSize, cellThickness);

    const attributes = {
      aCellIdNormalized: new THREE.InstancedBufferAttribute(
        new Float32Array(this.cellProperties.map((prop) => prop.cellIdNormalized)),
        1
      ),
      aRowIdNormalized: new THREE.InstancedBufferAttribute(
        new Float32Array(this.cellProperties.map((prop) => prop.rowIdNormalized)),
        1
      ),
      aColumnIdNormalized: new THREE.InstancedBufferAttribute(
        new Float32Array(this.cellProperties.map((prop) => prop.columnIdNormalized)),
        1
      ),
      aDitheringThresholds: {} // Prepare an object to hold threshold map attributes
    };

    this.thresholdMaps.forEach(config => {
      attributes.aDitheringThresholds[config.id] = new THREE.InstancedBufferAttribute(
        new Float32Array(this.cellProperties.map((prop) => prop.thresholdMaps[config.id])),
        1
      );
    });


    geometry.setAttribute("aCellIdNormalized", attributes.aCellIdNormalized);
    geometry.setAttribute("aRowIdNormalized", attributes.aRowIdNormalized);
    geometry.setAttribute("aColumnIdNormalized", attributes.aColumnIdNormalized);
    geometry.setAttribute("aDitheringThreshold", attributes.aDitheringThresholds.bayer4x4); // Using bayer4x4 as the default threshold map for now

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      defines: {
        DELAY_TYPE: 1,
        GRID_TYPE: this.gridProperties.gridType ?? 1,
      },
      uniforms: {
        uZPositionRange: { value: this.gridProperties.zPositionRange ?? new THREE.Vector2(0, 0) },
        uAnimationProgress: { value: 0 },
        uAnimationMaxDelay: { value: 0.9 }, // Maxium delay for the animation in % of duration.
        uTexture: { value: null }, // Placeholder for texture uniform
      },
    });

    // Load image to material.uniforms.uTexture if the image path is provided
    if (this.gridProperties.image) {
      const textureLoader = new THREE.TextureLoader();
      textureLoader.load(
        this.gridProperties.image,
        (texture) => {
          texture.colorSpace = THREE.SRGBColorSpace;
          material.uniforms.uTexture.value = texture;
          material.needsUpdate = true;
        }
      );
    }

    const mesh = new THREE.InstancedMesh(
      geometry,
      material,
      this.cellProperties.length // Number of instances
    );

    //Update Cell Position and Size for each instance
    for (let i = 0; i < this.cellProperties.length; i++) {
      const { x, y, z } = this.cellProperties[i];

      const objectRef = new THREE.Object3D();
      objectRef.position.set(x, y, z);
      objectRef.updateMatrix();

      mesh.setMatrixAt(i, objectRef.matrix);
    }

    mesh.instanceMatrix.needsUpdate = true;

    // Create a group to hold the mesh
    const group = new THREE.Group();
    group.add(mesh);

    // Store references for later use
    this.group = group;
    this.geometry = geometry;
    this.attributes = attributes; // Store attributes for later use
    this.material = material;
    this.instance = mesh;
    this.drawn = true;
  }

  showAt(scene) {
    if (!this.drawn) {
      this.init();
    }

    if (!this.shown) {
      scene.add(this.group);
      this.shown = true;
    }
  }

  hideFrom(scene) {
    if (this.shown) {
      scene.remove(this.group);
      this.shown = false;
    }
  }
}

export default Grid;