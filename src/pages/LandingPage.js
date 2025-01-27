import React, { useEffect } from 'react';
import * as THREE from 'three';
import './LandingPage.css';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';


import wells from '../assets/wells2.stl';


function LandingPage() {
  // Add state for material properties
  const [materialProps, setMaterialProps] = React.useState({
    metalness: 0.1,
    roughness: 0.0,
    transparent: true,
    opacity: 0.7,
    refractionRatio: 0.98,
    clearcoat: 1.0,
    clearcoatRoughness: 0.0,
    transmission: 2,
    ior: 1.5,
    thickness: 1.0,
    attenuationDistance: 5.0,
    attenuationColor: '#ffffff'
  });

  // Add ref for the material
  const materialRef = React.useRef(null);

  useEffect(() => {
    const container = document.getElementById('canvas-container');
    const width = (window.innerWidth * 2) / 3; // 2/3 of window width
    const height = window.innerHeight; // Full height

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xe9e7ea);
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(5, 5, 5);
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
          color: new THREE.Color(0xffffff),
          ...materialProps,
          attenuationColor: new THREE.Color(materialProps.attenuationColor)
        });
        
        materialRef.current = glassMaterial;
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

  // Effect to update material properties when sliders change
  useEffect(() => {
    if (materialRef.current) {
      Object.keys(materialProps).forEach(prop => {
        if (prop === 'attenuationColor') {
          materialRef.current[prop] = new THREE.Color(materialProps[prop]);
        } else {
          materialRef.current[prop] = materialProps[prop];
        }
      });
    }
  }, [materialProps]);

  const handleSliderChange = (property, value) => {
    setMaterialProps(prev => ({
      ...prev,
      [property]: value
    }));
  };

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
      <div style={{ display: 'flex', flexDirection: 'column', width: '66.67%' }}>
        <div style={{
          padding: '1rem',
          background: 'rgba(255, 255, 255, 0.9)',
          borderRadius: '8px',
          margin: '1rem',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          {Object.entries(materialProps).map(([prop, value]) => (
            prop !== 'attenuationColor' && (
              <div key={prop} style={{ marginBottom: '0.5rem' }}>
                <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  {prop}: {value}
                  <input
                    type="range"
                    min={0}
                    max={prop === 'transmission' ? 2 : prop === 'attenuationDistance' ? 20 : 1}
                    step={0.01}
                    value={value}
                    onChange={(e) => handleSliderChange(prop, parseFloat(e.target.value))}
                    style={{ width: '60%' }}
                  />
                </label>
              </div>
            )
          ))}
          <div style={{ marginBottom: '0.5rem' }}>
            <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              Attenuation Color:
              <input
                type="color"
                value={materialProps.attenuationColor}
                onChange={(e) => handleSliderChange('attenuationColor', e.target.value)}
              />
            </label>
          </div>
        </div>
        <div 
          id="canvas-container"
          style={{
            flex: 1
          }}
        />
      </div>
    </div>
  );
}

export default LandingPage;