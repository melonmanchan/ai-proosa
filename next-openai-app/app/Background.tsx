"use client";

import { useRef, useEffect } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";

import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";

import { BadTVShader } from "./shaders/tv-shader";
import { StaticShader } from "./shaders/static-shader";
import { FilmShader } from "./shaders/film-shader";

const dracoLoader = new DRACOLoader();

dracoLoader.setDecoderConfig({ type: "js" });
dracoLoader.setDecoderPath("https://www.gstatic.com/draco/v1/decoders/");

dracoLoader.preload();
const textureLoader = new THREE.TextureLoader();

const loader = new GLTFLoader();
loader.setDRACOLoader(dracoLoader);

function randomFloatInRange(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

async function loadModel(filename: string) {
  const model = await loader.loadAsync(filename);
  return model;
}

async function init(canvas: HTMLCanvasElement) {
  THREE.ColorManagement.enabled = false;
  const [eyeBallModel, moonModel] = await Promise.all([
    // loadModel("./eye_blend.glb"),
    loadModel("./eye_blend_optimized.glb"),
    loadModel("./kuu2.glb"),
  ]);

  const bg = await textureLoader.loadAsync("./star-pattern-2.jpg");

  bg.repeat.set(2, 1); // Adjust the tiling by changing the values (here: 2x2)

  bg.wrapS = THREE.RepeatWrapping;
  bg.wrapT = THREE.RepeatWrapping;

  const starMaterial = new THREE.MeshBasicMaterial({ map: bg });

  const planeGeometry = new THREE.PlaneGeometry(35, 20); // You can adjust the size as needed

  const plane = new THREE.Mesh(planeGeometry, starMaterial);

  plane.rotateX(-Math.PI / 2);
  plane.material.side = THREE.DoubleSide;

  plane.position.y = -6;
  const scene = new THREE.Scene();

  scene.add(plane);
  eyeBallModel.scene.scale.set(0.01, 0.01, 0.01);

  eyeBallModel.scene.rotation.x = Math.PI / 2;
  eyeBallModel.scene.rotation.y = 0;

  moonModel.scene.scale.set(0.8, 0.8, 0.8);
  moonModel.scene.rotation.x = Math.PI / 2;
  moonModel.scene.rotation.z = 6;

  scene.add(eyeBallModel.scene);
  scene.add(moonModel.scene);

  const clock = new THREE.Clock();

  const camera = new THREE.PerspectiveCamera(
    50,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );

  // This also controls intensity of glow
  (moonModel.scene.children[0] as any).material.color.r = 15;
  (moonModel.scene.children[0] as any).material.color.g = 15;

  // Iris is red
  (eyeBallModel.scene.children[0] as any).material.color.r = 100;
  (eyeBallModel.scene.children[1] as any).material.color.r = 5;
  (eyeBallModel.scene.children[1] as any).material.color.g = 5;
  (eyeBallModel.scene.children[1] as any).material.color.b = 5;

  const directionalLight = new THREE.DirectionalLight("white", 1);
  scene.add(directionalLight);

  const renderer = new THREE.WebGLRenderer({ canvas });

  renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
  renderer.setClearColor("blue");

  renderer.setSize(window.innerWidth, window.innerHeight);

  const controls = new OrbitControls(camera, renderer.domElement);

  const composer = new EffectComposer(renderer);

  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    1.5,
    0.4,
    0.85
  );
  // Ths controls the intensity of the glow
  bloomPass.threshold = 1.5;
  bloomPass.strength = 1; //intensity of glow
  bloomPass.radius = 0;

  const renderPass = new RenderPass(scene, camera);
  const badTVPass = new ShaderPass(BadTVShader);
  const staticPass = new ShaderPass(StaticShader);
  const filmPass = new ShaderPass(FilmShader);

  composer.addPass(renderPass);
  composer.addPass(badTVPass);
  composer.addPass(staticPass);
  composer.addPass(filmPass);
  composer.addPass(bloomPass);

  //set shader uniforms
  filmPass.uniforms.grayscale.value = 1;
  // Initialize tv shader parameters
  badTVPass.renderToScreen = true;
  badTVPass.uniforms["distortion"].value = 0;
  badTVPass.uniforms["distortion2"].value = 0;
  badTVPass.uniforms["speed"].value = 0.01;
  badTVPass.uniforms["rollSpeed"].value = 0.1;

  staticPass.uniforms["amount"].value = 0.05;
  staticPass.uniforms["size"].value = 5;

  filmPass.uniforms["sCount"].value = 400;
  filmPass.uniforms["sIntensity"].value = 0.5;
  filmPass.uniforms["nIntensity"].value = 10;

  camera.position.z = 0;
  camera.position.x = 0;
  camera.position.y = 8;

  camera.updateProjectionMatrix();

  controls.update();
  controls.enableZoom = true;

  const radius = 4; // Radius of the circle
  const speed = 0.003; // Speed of rotation

  let angle = 0;
  let moonAngle = 2;

  moonModel.scene.rotation.y = randomFloatInRange(0, 2 * Math.PI);
  moonModel.scene.rotation.x = randomFloatInRange(0, 2 * Math.PI);

  eyeBallModel.scene.rotation.y = randomFloatInRange(0, 2 * Math.PI);
  eyeBallModel.scene.rotation.x = randomFloatInRange(0, 2 * Math.PI);

  let currentState: "INTRO" | "ACTIVE" = "INTRO";

  // by default nothing is visible
  eyeBallModel.scene.visible = false;
  moonModel.scene.visible = false;
  plane.visible = false;

  const render = function () {
    requestAnimationFrame(render);

    if ((window as any).hasBeenClicked === true && currentState === "INTRO") {
      eyeBallModel.scene.visible = true;
      moonModel.scene.visible = true;
      plane.visible = true;
      filmPass.uniforms.grayscale.value = 0;
      currentState = "ACTIVE";
    }

    if ((window as any).hasBeenClicked === false && currentState === "ACTIVE") {
      eyeBallModel.scene.visible = false;
      moonModel.scene.visible = false;
      plane.visible = false;
      filmPass.uniforms.grayscale.value = 1;
      currentState = "INTRO";
    }

    const delta = clock.getDelta();

    composer.render(delta);
    controls.update();

    badTVPass.uniforms["time"].value = delta;
    staticPass.uniforms["time"].value = delta;
    filmPass.uniforms["time"].value = delta;

    // Update the angle
    angle += speed;
    moonAngle += speed;

    // Eye
    eyeBallModel.scene.position.x = radius * Math.cos(angle);
    eyeBallModel.scene.position.y = radius * Math.sin(angle);
    eyeBallModel.scene.rotation.y += 0.005;
    eyeBallModel.scene.rotation.x += 0.001;

    // Moon
    moonModel.scene.position.x = radius * Math.cos(moonAngle);
    moonModel.scene.position.y = radius * Math.sin(moonAngle);
    moonModel.scene.rotation.z += 0.005;
    moonModel.scene.rotation.x += 0.001;
  };

  render();

  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.updateProjectionMatrix();
  });
}

const Background = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) {
      return;
    }

    init(canvasRef.current);
  }, [canvasRef]);

  return <canvas ref={canvasRef}></canvas>;
};

export default Background;
