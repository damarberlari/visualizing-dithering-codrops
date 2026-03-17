import './css/style.css';
import './css/base.css';
import imageUrl from './image/dithering_object.jpg';

import * as THREE from "three";
import Grid from "./Grid/Grid.js";
import { Pane } from 'tweakpane';
import * as EssentialsPlugin from '@tweakpane/plugin-essentials';

//Setup scene
const scene = new THREE.Scene();
scene.background = new THREE.Color("#6171E5");

//Setup camera
const camera = new THREE.OrthographicCamera();

camera.position.set(0, 0, 400);
camera.lookAt(0, 0, 0);
camera.near = 0.01;
camera.far = 1000;

const cameraAnchor = new THREE.Group();
cameraAnchor.name = "cameraAnchor";
cameraAnchor.add(camera);
scene.add(cameraAnchor);

//Set camera zoom and update projection matrix
camera.zoom = 0.9;
camera.updateProjectionMatrix();

//Set camera rotation
//Camera shot from above and a bit from the side 
cameraAnchor.rotation.reorder("YXZ");
cameraAnchor.rotation.y = Math.PI * 0.25;
cameraAnchor.rotation.x = -Math.PI * 0.15;

//Setup renderer
const canvas = document.querySelector("canvas.webgl");
const renderer = new THREE.WebGLRenderer({
  canvas,
  preserveDrawingBuffer: true,
  antialias: true
});


//Setup resize function
const resize = (width, height, pixelRatio) => {
  const boundingBoxSize = 400;
  const aspectRatio = width / height;

  //Resize camera
  if (aspectRatio < 1) {
    camera.left = -boundingBoxSize / 2;
    camera.right = boundingBoxSize / 2;
    camera.top = boundingBoxSize / 2 / aspectRatio;
    camera.bottom = -boundingBoxSize / 2 / aspectRatio;
  } else {
    camera.left = (-boundingBoxSize / 2) * aspectRatio;
    camera.right = (boundingBoxSize / 2) * aspectRatio;
    camera.top = boundingBoxSize / 2;
    camera.bottom = -boundingBoxSize / 2;
  }

  camera.aspect = aspectRatio;
  camera.updateProjectionMatrix();

  //Resize renderer
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(pixelRatio, 2));

};

//Init resize function for the 1st time
resize(window.innerWidth, window.innerHeight, window.devicePixelRatio);

//Init grid and show it on the scene
const grid = new Grid({
  name: "grid",
  rowCount: 400,
  columnCount: 400,
  cellSize: 1,
  cellThickness: 0.5,
  gridType: 1,
  image: imageUrl, // Path to the image to be used in the grid
  zPositionRange: new THREE.Vector2(20, -20),
});
grid.showAt(scene);

const thresholdMapGrid = new Grid({
  name: "thresholdMapGrid",
  rowCount: 400,
  columnCount: 400,
  cellSize: 1,
  cellThickness: 0.1,
  gridType: 2,
  zPositionRange: new THREE.Vector2(0, 0),
});
thresholdMapGrid.showAt(scene);



// Set animation Loop to render the scene
const animateLoop = () => {
  renderer.render(scene, camera);
  requestAnimationFrame(animateLoop);
};
animateLoop();

// Init Tweakpane
const pane = new Pane({ title: 'Settings', expanded: true });
pane.registerPlugin(EssentialsPlugin);

// Create Image Grid Settings Folder
const imageGridFolder = pane.addFolder({ title: 'Image Grid' });

const showImageGrid = imageGridFolder.addBinding({show: true}, 'show', {
  label: 'Show',
});

showImageGrid.on('change', (ev) => {
  if (ev.value) {
    grid.showAt(scene);
  } else {
    grid.hideFrom(scene);
  }
});

// Create Threshold Map Grid Settings Folder
const thresholdMapGridFolder = pane.addFolder({ title: 'Threshold Map Grid' });

const showThresholdMapGrid = thresholdMapGridFolder.addBinding({show: true}, 'show', {
  label: 'Show',
});

showThresholdMapGrid.on('change', (ev) => {
  if (ev.value) {
    thresholdMapGrid.showAt(scene);
  } else {
    thresholdMapGrid.hideFrom(scene);
  }
});


// Create Dithering Folder
const ditheringFolder = pane.addFolder({ title: 'Dithering' });

const activeThresholdMaps = {
  value: 'bayer4x4',
};

const ditheringThresholdController = ditheringFolder.addBinding(activeThresholdMaps, 'value', {
  view: 'radiogrid',
  groupName: 'ditheringThreshold',
  size: [2, 2],
  cells: (x, y) => ({
    title: `${grid.thresholdMaps[y * 2 + x].name}`,
    value: grid.thresholdMaps[y * 2 + x].id,
  }),
  label: 'Threshold Map',
})

ditheringThresholdController.on('change', (ev) => {
  grid.geometry.setAttribute("aDitheringThreshold", grid.attributes.aDitheringThresholds[ev.value]);
  thresholdMapGrid.geometry.setAttribute("aDitheringThreshold", thresholdMapGrid.attributes.aDitheringThresholds[ev.value]);
});


// Create Animation Folder
const animationFolder = pane.addFolder({ title: 'Animation' });

//Add Dropdown to select delay type
const delayTypeController = animationFolder.addBlade({
  view: 'list',
  label: 'Delay Type',
  options: {
    'Cell by Cell': 1,
    'Row by Row': 2,
    'Column by Column': 3,
    'Random': 4,
    'Corner to Corner': 5,
  },
  value: grid.material.defines.DELAY_TYPE,
});

delayTypeController.on('change', (ev) => {
  grid.material.defines.DELAY_TYPE = ev.value;
  grid.material.needsUpdate = true;
});

// Add Progress Slider to control animation progress
const animationDelay = animationFolder.addBlade({
  view: 'slider',
  label: 'Max Delay',
  value: grid.material.uniforms.uAnimationMaxDelay.value,
  min: 0.05,
  max: 1,
  step: 0.01,
});
animationDelay.on('change', (ev) => {
  grid.material.uniforms.uAnimationMaxDelay.value = ev.value;
});

const progressSlider = animationFolder.addBlade({
  view: 'slider',
  label: 'Progress',
  value: 0,
  min: 0,
  max: 1,
  step: 0.01,
});
progressSlider.on('change', (ev) => {
  // Update the shader uniform with the new animation progress value
  grid.material.uniforms.uAnimationProgress.value = ev.value;
});



//Reinit resize function on window resize
window.addEventListener("resize", () => {
  resize(window.innerWidth, window.innerHeight, window.devicePixelRatio);
});