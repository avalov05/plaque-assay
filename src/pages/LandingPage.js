import React, { useEffect } from 'react';
import * as THREE from 'three';
import './LandingPage.css';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import wells from '../assets/wells.STL';

function LandingPage() {

  useEffect(() => {
    const container = document.getElementById('canvas-container');
    const width = (window.innerWidth * 2) / 3; // 2/3 of window width
    const height = window.innerHeight; // Full height

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xe9e7ea);
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(100, 100, 200);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 2);
    scene.add(ambientLight);

    const spotLight = new THREE.SpotLight(0xffffff, 3, 300, 0.2, 10);
    spotLight.position.set(0, 25, 0);
    scene.add(spotLight);
    const loader = new STLLoader();
    loader.load(
      wells,
      (geometry) => {
        const glassMaterial = new THREE.MeshPhysicalMaterial({
          color: new THREE.Color(0xffffff), // Light blue tint for the glass
          // metalness: 0.1,
          // roughness: 0.5,
          transparent: true,
          opacity: 0.7,  // Slight transparency for glass
          refractionRatio: 0.98, // Simulate glass refraction
          // clearcoat: 1.0,
          // clearcoatRoughness: 0.0,
          metalness: 0.0,
          roughness: 0.0,
          transmission: 1,
          ior: 1.5,
        });

        // Create mesh from STL geometry
        const plate = new THREE.Mesh(geometry, glassMaterial);
        scene.add(plate);

        const boundingBox = new THREE.Box3().setFromObject(plate);
        const center = boundingBox.getCenter(new THREE.Vector3());
        plate.position.sub(center);


        // Start animation
        const animate = () => {
          renderer.render(scene, camera);
          plate.rotation.x += 0.01;
          plate.rotation.y += 0.01;
          window.requestAnimationFrame(animate);
        };
        animate();
      },
      (xhr) => {
        console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
      },
      (error) => {
        console.error('An error occurred loading the STL:', error);
      }
    );

    // Add window resize handler
    const handleResize = () => {
      const newWidth = (window.innerWidth * 2) / 3;
      const newHeight = window.innerHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      container.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div style={{
      display: 'flex',
      width: '100vw',
      height: '100vh',
      overflow: 'hidden'
    }}>
      <div style={{
        width: '33.33%',
        padding: '2rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
      }}>
        <h1>Your Title Here</h1>
        <p>Your subtitle or additional content here</p>
      </div>
      <div 
        id="canvas-container"
        style={{
          width: '66.67%',
          height: '100%'
        }}
      />
    </div>
  );
}

export default LandingPage;