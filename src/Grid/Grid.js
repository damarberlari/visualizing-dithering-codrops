import * as THREE from "three";
import vertexShader from "./shaders/vertexShader.glsl";
import fragmentShader from "./shaders/fragmentShader.glsl";

class Grid {
  constructor(gridProperties) {
    this.drawn = false; // Whether the grid has been initialized and drawn
    this.shown = false; // Whether the grid is currently added to the scene

    this.gridProperties = gridProperties;
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

      // Assign row and column based on index
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

    }

    return properties;
  }

  init() {
    const cellSize = this.gridProperties.cellSize || 1;
    const cellThickness = this.gridProperties.cellThickness || 1;

    const geometry = new THREE.BoxGeometry(cellSize, cellSize, cellThickness);

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
    });

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