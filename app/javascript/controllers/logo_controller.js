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

    this.mouse = [.5, .5]; // Default mouse position

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

    window.addEventListener('mousemove', this.onMouseMove.bind(this));

    this.initRenderer();

    this.element.appendChild(this.renderer.domElement);

    this.initLights();

    this.animate();
  }

  onMouseMove(event) {
    this.mouse[0] = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse[1] = -(event.clientY / window.innerHeight) * 2 + 1;
    console.log("Mouse moved:", this.mouse);
  }

  initScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x050505);
    this.scene.fog = new THREE.FogExp2(0x050505, 0.1);
    this.scene.add(new THREE.AmbientLight(0x404040, 2));
  }
  initCamera() {
    this.camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.set(0, 0, 5);
  }

  initRenderer() {
    this.renderer = new THREE.WebGLRenderer({ alpha: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableZoom = false;

  }

  initLights() {
    this.directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    this.directionalLight.position.set(500, 500, 500);
    this.directionalLight.castShadow = true;
    this.scene.add(this.directionalLight);

    const pointLight1 = new THREE.PointLight(0x00f3ff, 2, 50);
    pointLight1.position.set(2, 3, 4);
    this.scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xff00ff, 2, 50);
    pointLight2.position.set(-2, -3, 4);
    this.scene.add(pointLight2);
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this));

    this.camera.position.x = this.mouse[0] * -10;
    this.camera.position.y = this.mouse[1] * -10;
    this.camera.lookAt(0, 0, 0);

    if (this.controls) {
      this.controls.update(1.0);
    }
    this.renderer.render(this.scene, this.camera);
  }
}
