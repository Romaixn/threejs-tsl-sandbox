import * as THREE from 'three/webgpu';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Pane } from 'tweakpane';
import { sin, positionLocal, time, vec2, vec3, vec4, uv, uniform, color, fog, rangeFogFactor } from 'three/tsl';

class App {
  #threejs_ = null;
  #camera_ = null;
  #scene_ = null;
  #clock_ = null;
  #controls_ = null;
  #fogColor_ = null;

  constructor() {
  }

  async initialize() {
    this.#clock_ = new THREE.Clock(true);

    window.addEventListener('resize', () => {
      this.#onWindowResize_();
    }, false);

    await this.#setupProject_();

    this.#onWindowResize_();
    this.#raf_();
  }

  async #setupProject_() {
    // Create debug pane
    const pane = new Pane({
      title: 'Settings',
      expanded: true
    });

    this.#setupThreejs_();
    this.#setupBasicScene_(pane);
  }

  #setupThreejs_() {
    this.#threejs_ = new THREE.WebGPURenderer({
      antialias: true,
      forceWebGL: false
    });
    document.body.appendChild(this.#threejs_.domElement);

    const fov = 25;
    const aspect = window.innerWidth / window.innerHeight;
    const near = 0.1;
    const far = 100;
    this.#camera_ = new THREE.PerspectiveCamera(fov, aspect, near, far);
    this.#camera_.position.set(6, 3, 10);

    this.#controls_ = new OrbitControls(this.#camera_, this.#threejs_.domElement);
    this.#controls_.enableDamping = true;
    this.#controls_.update();

    this.#scene_ = new THREE.Scene();
    this.#fogColor_ = uniform(color('#ffffff'));
    this.#scene_.fogNode = fog(this.#fogColor_, rangeFogFactor(10, 15));
    this.#threejs_.setClearColor(this.#fogColor_.value);
  }

  #setupBasicScene_(pane) {
    // Material
    const material = new THREE.MeshBasicNodeMaterial();

    // Uniforms
    const timeFrequency = uniform(0.5);
    const positionFrequency = uniform(2);
    const intensityFrequency = uniform(0.5);

    // Position
    const oscillation = sin(time.mul(timeFrequency).add(positionLocal.y.mul(positionFrequency))).mul(intensityFrequency);
    material.positionNode = vec3(
      positionLocal.x.add(oscillation),
      positionLocal.y,
      positionLocal.z
    );

    // Color
    material.colorNode = vec4(
      uv().mul(vec2(32, 8)).fract(),
      1,
      1
    );

    // Mesh
    const mesh = new THREE.Mesh(new THREE.TorusKnotGeometry(1, 0.35, 128, 32), material);
    this.#scene_.add(mesh);

    // Tweaks
    const dummyFolder = pane.addFolder({ title: 'Dummy' });
    dummyFolder.addBinding(timeFrequency, 'value', {
      min: 0,
      max: 5,
      label: 'timeFrequency'
    });
    dummyFolder.addBinding(positionFrequency, 'value', {
      min: 0,
      max: 5,
      label: 'positionFrequency'
    });
    dummyFolder.addBinding(intensityFrequency, 'value', {
      min: 0,
      max: 5,
      label: 'intensityFrequency'
    });
  }

  #onWindowResize_() {
    // Update sizes
    const width = window.innerWidth;
    const height = window.innerHeight;

    // Update camera
    this.#camera_.aspect = width / height;
    this.#camera_.updateProjectionMatrix();

    // Update renderer
    this.#threejs_.setSize(width, height);
    this.#threejs_.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  #raf_() {
    this.#threejs_.setAnimationLoop(() => {
      this.#step_(this.#clock_.getDelta());
      this.#render_();
    });
  }

  #render_() {
    this.#threejs_.renderAsync(this.#scene_, this.#camera_);
  }

  #step_(timeElapsed) {
    this.#controls_.update();
  }
}

let APP_ = null;

window.addEventListener('DOMContentLoaded', async () => {
  APP_ = new App();
  await APP_.initialize();
});
