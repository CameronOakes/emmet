import { Controller } from "@hotwired/stimulus"
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { makeNoise2D, makeNoise3D } from "open-simplex-noise";
import seedrandom from "seedrandom";
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";

// TODO: fix the path to the GLB file

// Connects to data-controller="logo"
export default class extends Controller {
  connect() {
    console.log("Logo controller connected");
    this.initScene()
    this.initCamera();

    // Use a public path relative to your Rails public directory or assets pipeline
    let objToRender = '/tgs.glb'; // Default object to render
    let object;
    const loader = new GLTFLoader();
    loader.load(
      `${objToRender}`,
      (gltf) => {
        //If the file is loaded, add it to the scene
        object = gltf.scene;
        console.log("GLTF model loaded:", gltf);

        object.traverse((child) => {
          if (child.isMesh) {
            const mat = child.material;
            console.log("Material:", mat);

            // Check if material is valid
            if (!mat || typeof mat.onBeforeRender !== 'function') {
              console.warn("Replacing invalid material with basic material");
              child.material = new THREE.MeshStandardMaterial({ color: 0xff00ff });
            }
          }
        });
        this.scene.add(object);
      },
      function (xhr) {
        //While it is loading, log the progress
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
      },
      function (error) {
        //If there is an error, log it
        console.error(error);
      }
    )
    this.initRenderer();

    this.element.appendChild(this.renderer.domElement);

    this.initLights();

    this.animate();
  }

  initScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x000000);
    this.scene.add(new THREE.AmbientLight(0xffffff, 0.5));
  }
  initCamera() {
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.set(0, 0, 5);
  }

  initRenderer() {
    this.renderer = new THREE.WebGLRenderer({ alpha: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
  }

  initLights() {
    this.directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    this.directionalLight.position.set(500, 500, 500);
    this.directionalLight.castShadow = true;
    this.scene.add(this.directionalLight);
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this));
    if (this.controls) {
      this.controls.update(1.0);
    }
    this.renderer.render(this.scene, this.camera);
  }
}
