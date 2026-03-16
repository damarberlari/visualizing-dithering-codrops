import './css/style.css';
import './css/base.css';

import * as THREE from "three";

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


// Set animation Loop to render the scene
const animateLoop = () => {
  renderer.render(scene, camera);
  requestAnimationFrame(animateLoop);
};
animateLoop();



//Reinit resize function on window resize
window.addEventListener("resize", () => {
  resize(window.innerWidth, window.innerHeight, window.devicePixelRatio);
});