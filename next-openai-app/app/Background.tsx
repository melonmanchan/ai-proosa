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

const loader = new GLTFLoader();
loader.setDRACOLoader(dracoLoader);

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

  const scene = new THREE.Scene();

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
  moonModel.scene.children[0].material.color.r = 10;
  moonModel.scene.children[0].material.color.g = 10;

  // Iris is red
  eyeBallModel.scene.children[0].material.color.r = 100;
  eyeBallModel.scene.children[1].material.color.r = 3;
  eyeBallModel.scene.children[1].material.color.g = 3;
  eyeBallModel.scene.children[1].material.color.b = 3;

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
  bloomPass.threshold = 1;
  bloomPass.strength = 0.8; //intensity of glow
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
  filmPass.uniforms.grayscale.value = 0;
  // Initialize tv shader parameters
  badTVPass.renderToScreen = true;
  badTVPass.uniforms["distortion"].value = 0;
  badTVPass.uniforms["distortion2"].value = 0;
  badTVPass.uniforms["speed"].value = 0.01;
  badTVPass.uniforms["rollSpeed"].value = 0;

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

  const render = function () {
    requestAnimationFrame(render);
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
