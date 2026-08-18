import { Controller } from "@hotwired/stimulus"
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

// Connects to data-controller="logo"
export default class extends Controller {
  connect() {
    console.log("Logo controller connected");
    this.initScene();
    this.initCamera();

    this.mouse = [.5, .5];

    let objToRender = '/tgs.glb';
    const loader = new GLTFLoader();
    loader.load(
      `${objToRender}`,
      (gltf) => {
        const object = gltf.scene;
        console.log("GLTF model loaded:", gltf);

        // Blue color palette for the logo + its glow
        const baseColor = new THREE.Color(0x1e6fff);     // core blue
        const glowColor = new THREE.Color(0x66ccff);     // lighter blue glow

        object.traverse((child) => {
          if (child.isMesh) {
            child.material = new THREE.MeshStandardMaterial({
              color: baseColor,
              emissive: glowColor,
              emissiveIntensity: 1.2,
              metalness: 0.3,
              roughness: 0.35,
            });
          }
        });

        this.scene.add(object);
      },
      (xhr) => {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
      },
      (error) => {
        console.error(error);
      }
    );

    window.addEventListener('mousemove', this.onMouseMove.bind(this));

    this.initRenderer();
    this.element.appendChild(this.renderer.domElement);

    this.initLights();
    this.initBloom();
    this.initTextOverlay();

    this.animate();
  }

  onMouseMove(event) {
    this.mouse[0] = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse[1] = -(event.clientY / window.innerHeight) * 2 + 1;
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
    this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableZoom = false;
  }

  initLights() {
    this.directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    this.directionalLight.position.set(500, 500, 500);
    this.directionalLight.castShadow = true;
    this.scene.add(this.directionalLight);

    // Blue-tinted point lights to reinforce the glow
    const pointLight1 = new THREE.PointLight(0x3399ff, 2, 50);
    pointLight1.position.set(2, 3, 4);
    this.scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x66ccff, 2, 50);
    pointLight2.position.set(-2, -3, 4);
    this.scene.add(pointLight2);
  }

  initBloom() {
    // Post-processing bloom pass — this is what makes the emissive
    // material actually "glow" rather than just look bright.
    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));

    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      1.2,   // strength
      0.6,   // radius
      0.15   // threshold
    );
    this.composer.addPass(bloomPass);
  }

  initTextOverlay() {
    // Simple HTML overlay for the "EMMET" text — cheaper and crisper
    // than 3D text geometry, and sits on top of the canvas.
    const label = document.createElement('div');
    label.textContent = 'EMMET';
    Object.assign(label.style, {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      fontFamily: 'sans-serif',
      fontWeight: '700',
      fontSize: '3rem',
      letterSpacing: '0.2em',
      color: '#eaf6ff',
      textShadow: '0 0 10px #66ccff, 0 0 20px #3399ff, 0 0 40px #1e6fff',
      pointerEvents: 'none',
      userSelect: 'none',
      zIndex: '10',
    });

    // Make sure the container can position this absolutely
    this.element.style.position = this.element.style.position || 'relative';
    this.element.appendChild(label);
    this.textLabel = label;
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this));

    this.camera.position.x = this.mouse[0] * -10;
    this.camera.position.y = this.mouse[1] * -10;
    this.camera.lookAt(0, 0, 0);

    if (this.controls) {
      this.controls.update(1.0);
    }

    if (this.composer) {
      this.composer.render();
    } else {
      this.renderer.render(this.scene, this.camera);
    }
  }
}
