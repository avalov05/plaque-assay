import React, { useEffect } from 'react';
import * as THREE from 'three';
import './LandingPage.css';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import wells from '../assets/wells.glb';

function LandingPage() {

  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.set(4, 5, 11);
    camera.lookAt(0, 0, 0);

    const canvas = document.getElementById("myThreeJSCanvas");

    const renderer = new THREE.WebGLRenderer
    ({
      canvas,
      antialias: true
    });

    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const spotLight = new THREE.SpotLight(0xffffff, 3, 100, 0.2, 0.5);
    spotLight.position.set(0, 25, 0);
    scene.add(spotLight);
    const loader = new GLTFLoader(); 
    loader.load(wells, (gltf) => {

      scene.add(gltf.scene);
    },
    );

    const animate = () => {
      renderer.render(scene, camera);
      window.requestAnimationFrame(animate);
    };
    animate();
    }, []);

  return (
    <div className="landing-container">
      <div className="content-left">
        <h1 className="main-title">Plaque Assays<br />Made Easier</h1>
        <button className="get-started-btn">Get Started</button>
      </div>
      
      <div className="model-container">
        <canvas id = "myThreeJSCanvas"></canvas>
      </div>
    </div>
  );
}

export default LandingPage;