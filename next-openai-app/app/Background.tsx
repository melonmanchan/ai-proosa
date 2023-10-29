"use client";

import { useRef, useEffect } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";

import { BadTVShader } from "./shaders/tv-shader";
import { StaticShader } from "./shaders/static-shader";
import { FilmShader } from "./shaders/film-shader";

const loader = new GLTFLoader();

async function loadModel(filename: string) {
  const model = await loader.loadAsync(filename);
  return model;
}

async function init(canvas: HTMLCanvasElement) {
  THREE.ColorManagement.enabled = false;
  const eyeBallModel = await loadModel("./eye_blend.glb");

  const scene = new THREE.Scene();

  eyeBallModel.scene.scale.set(0.01, 0.01, 0.01);

  eyeBallModel.scene.rotation.x = Math.PI / 2;
  eyeBallModel.scene.rotation.y = 0;

  scene.add(eyeBallModel.scene);

  const clock = new THREE.Clock();

  const camera = new THREE.PerspectiveCamera(
    50,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );

  const directionalLight = new THREE.DirectionalLight("white", 1);
  scene.add(directionalLight);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });

  renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
  renderer.setClearColor("blue");

  renderer.setSize(window.innerWidth, window.innerHeight);

  const controls = new OrbitControls(camera, renderer.domElement);

  const composer = new EffectComposer(renderer);

  const renderPass = new RenderPass(scene, camera);
  const badTVPass = new ShaderPass(BadTVShader);
  const staticPass = new ShaderPass(StaticShader);
  const filmPass = new ShaderPass(FilmShader);

  composer.addPass(renderPass);
  composer.addPass(badTVPass);
  composer.addPass(staticPass);
  composer.addPass(filmPass);

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

  camera.position.z = 1;
  camera.position.x = 0;
  camera.position.y = 5;

  camera.updateProjectionMatrix();

  controls.update();

  controls.enableZoom = true;

  const render = function () {
    const delta = clock.getDelta();
    requestAnimationFrame(render);

    controls.update();

    badTVPass.uniforms["time"].value = delta;
    staticPass.uniforms["time"].value = delta;
    filmPass.uniforms["time"].value = delta;

    composer.render(delta);
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
