import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import './LandingPage.css';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';

import wells from '../assets/wells2.stl';

function LandingPage() {
  const [materialProps, setMaterialProps] = React.useState({
    roughness: 0.3,          // Keep completely smooth
    transparent: true,
    opacity: 0.2,            // Reduced for more transparency in flat areas
    metalness: 0.0,          // Keep non-metallic
    transmission: 0.95,      // Slightly reduced to allow for more visible edges
    thickness: 2.0,          // Increased significantly to enhance edge effects
    ior: 1.52,              // Adjusted to match real glass more closely
    clearcoat: 1.0,         // Increased for stronger edge highlights
    clearcoatRoughness: 0.1, // Slight roughness for more natural look
    attenuationDistance: 0.5,// Reduced dramatically for stronger edge effects
    attenuationColor: 0xffffff,  // Slight blue tint for more realistic glass
    envMapIntensity: 2.5     // Increased for stronger environmental reflections
  });

  const materialRef = useRef(null);

  useEffect(() => {
    const container = document.getElementById('canvas-container');
    const width = window.innerWidth;
    const height = window.innerHeight;

    const scene = new THREE.Scene();
    
    // Replace the image texture with video texture
    // const video = document.createElement('video');
    // video.src = videoB; // Update this path to your video
    // video.loop = true;
    // video.muted = true;
    // video.playsInline = true;
    // video.play();

    // const videoTexture = new THREE.VideoTexture(video);
    // videoTexture.minFilter = THREE.LinearFilter;
    // videoTexture.magFilter = THREE.LinearFilter;
    // videoTexture.format = THREE.RGBFormat;
    
    // scene.background = videoTexture;

    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(3, 3, 3);
    camera.lookAt(0, -0.3, -1);

    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true  // Add this to ensure transparency works
    });
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0); // Make sure background is clear
    container.appendChild(renderer.domElement);

    // HDR environment setup
    // const rgbeLoader = new RGBELoader();
    // rgbeLoader.load(
    //   '../assets/dusk2.hdr', // Put your HDR environment map in your public folder
    //   function(texture) {
    //     texture.mapping = THREE.EquirectangularReflectionMapping;
    //     scene.background = texture;
    //     scene.environment = texture;
    //   },
    //   undefined,
    //   (error) => {
    //     console.error('An error occurred loading the HDR texture:', error);
    //   }
    // );

    const ambientLight = new THREE.AmbientLight(0xffffff, 20);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 10);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    const Eloader = new THREE.TextureLoader();
    const envMap = Eloader.load('../assets/dusk2.png');
    envMap.mapping = THREE.EquirectangularReflectionMapping;

    const loader = new STLLoader();
    loader.load(
      wells,
      (geometry) => {
        // Create a canvas for the patchy texture
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 512;
        canvas.height = 512;

        // Fill with base purple color
        ctx.fillStyle = '#6a428d';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Add random white patches (plaques) - more numerous but smaller
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        
        // Add main plaques
        for (let i = 0; i < 2000; i++) { // Increased from 1200 to 2000
          const x = Math.random() * canvas.width;
          const y = Math.random() * canvas.height;
          const radius = Math.random() * 2 + 0.8; // Reduced size range (0.8-2.8 instead of 1.5-5.5)
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fill();
          
          // Add more satellite spots around each plaque
          const numSatellites = Math.floor(Math.random() * 5) + 3; // 3-7 satellites
          for (let j = 0; j < numSatellites; j++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = radius * (Math.random() * 0.4 + 0.4); // Slightly tighter spread
            const satelliteX = x + Math.cos(angle) * distance;
            const satelliteY = y + Math.sin(angle) * distance;
            const satelliteRadius = radius * (Math.random() * 0.2 + 0.1); // Smaller satellites
            ctx.beginPath();
            ctx.arc(satelliteX, satelliteY, satelliteRadius, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // Add smaller background patches
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        for (let i = 0; i < 1500; i++) { // Increased from 800 to 1500
          const x = Math.random() * canvas.width;
          const y = Math.random() * canvas.height;
          const radius = Math.random() * 0.8 + 0.3; // Reduced size
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fill();
        }

        // Add very tiny dots for texture
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        for (let i = 0; i < 2000; i++) { // Increased from 1000 to 2000
          const x = Math.random() * canvas.width;
          const y = Math.random() * canvas.height;
          const radius = Math.random() * 0.4 + 0.1; // Reduced size
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fill();
        }

        const patchyTexture = new THREE.CanvasTexture(canvas);
        patchyTexture.needsUpdate = true;
        // Use NearestFilter for sharp pixels
        patchyTexture.minFilter = THREE.NearestFilter;
        patchyTexture.magFilter = THREE.NearestFilter;

        // Create a purple material for well bottoms with sharp texture
        const wellBottomMaterial = new THREE.MeshPhysicalMaterial({
          color: new THREE.Color(0x6a428d),
          metalness: 0.2,
          roughness: 0.3,          // Reduced for sharper appearance
          opacity: 0.8,
          transparent: false,
          side: THREE.DoubleSide,
          envMap: envMap,
          map: patchyTexture,
          thickness: 0.5,
          clearcoat: 0.2,          // Reduced clearcoat
          clearcoatRoughness: 0.2  // Reduced for sharper appearance
        });

        // Create the glass material with perfect clarity
        const glassMaterial = new THREE.MeshPhysicalMaterial({
          color: new THREE.Color(0xffffff),
          roughness: 0.0,
          transparent: true,
          opacity: 0.1,            // Reduced opacity for more clarity
          metalness: 0.0,
          transmission: 1.0,       // Maximum transmission
          thickness: 0.5,          // Reduced thickness
          ior: 1.45,              // Adjusted for clearer glass
          clearcoat: 0.0,         // Removed clearcoat
          attenuationDistance: 1000, // Minimal attenuation
          attenuationColor: 0xffffff,
          envMapIntensity: 1.0,    // Reduced reflection
          side: THREE.DoubleSide,
          envMap: envMap
        });

        // First rotate the geometry to align it correctly
        geometry.rotateX(-Math.PI / 2);
        
        // Clone the geometry for the bottom faces
        const bottomGeometry = geometry.clone();
        
        // Filter faces based on normal direction and position
        const normalAttribute = bottomGeometry.getAttribute('normal');
        const positionAttribute = bottomGeometry.getAttribute('position');
        const indices = [];
        
        // Find the bounding box to determine well bottom height
        geometry.computeBoundingBox();
        const minY = geometry.boundingBox.min.y;
        const maxY = geometry.boundingBox.max.y;
        const totalHeight = maxY - minY;
        const lowerThreshold = minY + (totalHeight * 0.15); // 1% from bottom
        const upperThreshold = minY + (totalHeight * 0.20); // 15% from bottom
        
        // Collect indices of bottom-facing triangles that are near the bottom
        for (let i = 0; i < normalAttribute.count; i += 3) {
          const ny = normalAttribute.getY(i);
          const y = positionAttribute.getY(i);
          
          // Check if face is pointing downward AND is within the desired height range
          if (ny < -0.95 && y > lowerThreshold && y < upperThreshold) {
            indices.push(i, i + 1, i + 2);
          }
        }
        
        // Create the main plate with glass material
        const plate = new THREE.Mesh(geometry, glassMaterial);
        
        // Create bottom faces with purple material
        if (indices.length > 0) {
          const bottomPositions = new Float32Array(indices.length * 3);
          const bottomNormals = new Float32Array(indices.length * 3);
          const uvs = new Float32Array(indices.length * 2); // Add UVs for texture mapping
          
          for (let i = 0; i < indices.length; i++) {
            const index = indices[i];
            bottomPositions[i * 3] = positionAttribute.getX(index);
            bottomPositions[i * 3 + 1] = positionAttribute.getY(index);
            bottomPositions[i * 3 + 2] = positionAttribute.getZ(index);
            
            bottomNormals[i * 3] = normalAttribute.getX(index);
            bottomNormals[i * 3 + 1] = normalAttribute.getY(index);
            bottomNormals[i * 3 + 2] = normalAttribute.getZ(index);
            
            // Generate UV coordinates
            uvs[i * 2] = (bottomPositions[i * 3] - geometry.boundingBox.min.x) / 
                         (geometry.boundingBox.max.x - geometry.boundingBox.min.x);
            uvs[i * 2 + 1] = (bottomPositions[i * 3 + 2] - geometry.boundingBox.min.z) / 
                             (geometry.boundingBox.max.z - geometry.boundingBox.min.z);
          }
          
          const bottomGeometry = new THREE.BufferGeometry();
          bottomGeometry.setAttribute('position', new THREE.BufferAttribute(bottomPositions, 3));
          bottomGeometry.setAttribute('normal', new THREE.BufferAttribute(bottomNormals, 3));
          bottomGeometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
          
          const bottomMesh = new THREE.Mesh(bottomGeometry, wellBottomMaterial);
          plate.add(bottomMesh);
        }

        // Position the plate
        plate.position.set(1, -2, -5);
        scene.add(plate);

        // Create water droplet material
        const dropletMaterial = new THREE.MeshPhysicalMaterial({
          color: 0xffffff,
          metalness: 0.0,
          roughness: 0.0,
          transmission: 1.0,
          transparent: true,
          opacity: 0.7,
          ior: 1.33,        // Water's index of refraction
          thickness: 2.0,
          clearcoat: 1.0,
          clearcoatRoughness: 0.0,
          envMap: envMap,
          envMapIntensity: 1.5
        });

        // Function to create a random droplet
        function createDroplet(position, scale = 1.0) {
          const dropletGeometry = new THREE.SphereGeometry(0.05 * scale, 60, 60);
          dropletGeometry.translate(position.x, position.y, position.z);
          const droplet = new THREE.Mesh(dropletGeometry, dropletMaterial);
          
          // Add slight random rotation
          droplet.rotation.x = Math.random() * Math.PI;
          droplet.rotation.y = Math.random() * Math.PI;
          droplet.rotation.z = Math.random() * Math.PI;
          
          return droplet;
        }

        // Add droplets around each well with much wider distribution
        const wellCenters = [];
        const wellRadius = 1.0; // Assuming a default well radius
        for (let i = 0; i < 10; i++) {
          const angle = Math.random() * Math.PI * 2;
          const radius = wellRadius + Math.random() * 0.5; // Random radius around the well
          const x = Math.cos(angle) * radius;
          const z = Math.sin(angle) * radius;
          const y = minY + totalHeight * (0.3 + Math.random() * 0.4); // Around middle height
          wellCenters.push({ x, y, z });
        }
        
        // Modify droplet creation with even larger sizes
        wellCenters.forEach(center => {
          const numDroplets = Math.floor(Math.random() * 15) + 40; // 40-55 droplets per well
          
          for (let i = 0; i < numDroplets; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = wellRadius + 1.0 + Math.random() * 8.0;
            const x = center.x + Math.cos(angle) * radius;
            const z = center.z + Math.sin(angle) * radius;
            
            const y = minY + totalHeight * (0.2 + Math.random() * 0.6);
            const scale = 0.6 + Math.random() * 1.4; // Increased from 0.4-1.6 to 0.6-2.0
            
            const droplet = createDroplet({ x, y, z }, scale);
            plate.add(droplet);
          }
        });

        // Add fewer but larger condensation droplets
        for (let i = 0; i < 400; i++) {
          const angle = Math.random() * Math.PI * 2;
          const radius = 3.0 + Math.random() * 10.0;
          const x = Math.cos(angle) * radius;
          const z = Math.sin(angle) * radius;
          const y = minY + totalHeight * (0.15 + Math.random() * 0.7);
          
          const scale = 0.45 + Math.random() * 0.6; // Increased from 0.3-0.8 to 0.45-1.05
          
          const droplet = createDroplet({ x, y, z }, scale);
          plate.add(droplet);
        }

        // Add random larger droplets in wide area
        for (let i = 0; i < 200; i++) {
          const x = (Math.random() - 0.5) * 28;
          const z = (Math.random() - 0.5) * 20;
          const y = minY + totalHeight * (0.2 + Math.random() * 0.6);
          
          const scale = 0.5 + Math.random() * 0.8; // Increased from 0.35-0.95 to 0.5-1.3
          
          const droplet = createDroplet({ x, y, z }, scale);
          plate.add(droplet);
        }

        // Modify the animate function to include rotation
        const animate = () => {
          requestAnimationFrame(animate);
          plate.rotation.y += 0.005;
          plate.rotation.x += 0.005;
          renderer.render(scene, camera);
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
      const newWidth = window.innerWidth;
      const newHeight = window.innerHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div>
      <div className="title" id="title">
        <h1>Plaque Assays</h1>
        <h1>Made Easy</h1>
      </div>
      <div className="canvas-container" id="canvas-container">
      </div>
    </div>
  );
}

export default LandingPage;