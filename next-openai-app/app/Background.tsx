"use client";

import { useRef, useEffect } from "react";
import * as THREE from "three";

import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";

import { BadTVShader } from "./shaders/tv-shader";
import { StaticShader } from "./shaders/static-shader";
import { FilmShader } from "./shaders/film-shader";

function init(canvas: HTMLCanvasElement) {
  console.log(canvas, THREE);
  const scene = new THREE.Scene();
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshBasicMaterial({ color: "black" });
  const cube = new THREE.Mesh(geometry, material);
  //  scene.add(cube);

  const clock = new THREE.Clock();

  const camera = new THREE.PerspectiveCamera(
    50,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });

  renderer.setClearColor("blue");

  renderer.setSize(window.innerWidth, window.innerHeight);

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

  camera.lookAt(cube.position);

  camera.updateProjectionMatrix();

  const render = function () {
    const delta = clock.getDelta();
    requestAnimationFrame(render);

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
