import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import './LandingPage.css';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import logo from '../assets/mol_logo_black_512.png'; // Adjust path as needed
import '../components/fonts/square.ttf';
import '../components/fonts/inter.otf';
import background from '../assets/gradient.jpg';

import wells from '../assets/wells2.stl';

// Add these constants before the STL loader
const PHASE_DURATION = 600; // Duration for each animation phase

function LandingPage() {
  const [materialProps, setMaterialProps] = React.useState({
    roughness: 0.0,          // Keep completely smooth
    transparent: true,
    opacity: 0.7,            // Reduced for more transparency in flat areas
    metalness: 0.3,          // Keep non-metallic
    transmission: 0.99,      // Slightly reduced to allow for more visible edges
    thickness: 2.0,          // Increased significantly to enhance edge effects
    ior: 1.52,              // Adjusted to match real glass more closely
    clearcoat: 1.0,         // Increased for stronger edge highlights
    clearcoatRoughness: 0.9, // Slight roughness for more natural look
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
    
    // Add background texture
    const textureLoader = new THREE.TextureLoader();
    const backgroundTexture = textureLoader.load(background);
    scene.background = backgroundTexture;

    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(3, 3, 3);
    camera.lookAt(0, 0, 0);

    // Enhance lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 20); // Increased intensity
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5); // Increased intensity
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    // Add point lights for better visibility
    const pointLight1 = new THREE.PointLight(0xffffff, 5);
    pointLight1.position.set(5, -5, 5);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xffffff, 5);
    pointLight2.position.set(-5, 5, -5);
    scene.add(pointLight2);

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
    //   '../assets/dusk2.png', // Put your HDR environment map in your public folder
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

    const Eloader = new THREE.TextureLoader();
    const envMap = Eloader.load('../assets/dusk2.png');
    envMap.mapping = THREE.EquirectangularReflectionMapping;

    const loader = new STLLoader();
    loader.load(
      wells,
      (geometry) => {
        let activeParticles = [];

        // Helper function to create a droplet with varied purple colors
        function createDroplet(position, size, distance) {
          const geometry = new THREE.SphereGeometry(size, 8, 8);
          
          // Color varies based on distance from source
          const hue = 0.75 + (Math.random() * 0.1 - 0.05); // Base purple
          const saturation = 0.7 - (distance * 0.2); // Fade saturation with distance
          const lightness = 0.4 + (distance * 0.1); // Lighten with distance
          const color = new THREE.Color().setHSL(hue, saturation, lightness);
          
          const material = new THREE.MeshPhysicalMaterial({
            color: color,
            transparent: true,
            opacity: 1 - (distance * 0.3), // More transparent with distance
            metalness: 0.1,
            roughness: 0.2,
            emissive: color.multiplyScalar(0.2),
          });
          
          const droplet = new THREE.Mesh(geometry, material);
          droplet.position.set(position.x, position.y, position.z);
          return droplet;
        }

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

        // Position and add the plate to the scene
        plate.position.set(12, 0, 0);  // Moved further right to center in right two-thirds
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
        
        // Modify droplet creation around wells
        wellCenters.forEach(center => {
          const numDroplets = Math.floor(Math.random() * 8) + 12; // Reduced from 40-55 to 12-20 droplets per well
          
          for (let i = 0; i < numDroplets; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = wellRadius + 1.0 + Math.random() * 6.0; // Reduced spread from 8.0 to 6.0
            const x = center.x + Math.cos(angle) * radius;
            const z = center.z + Math.sin(angle) * radius;
            
            const y = minY + totalHeight * (0.2 + Math.random() * 0.6);
            const scale = 0.8 + Math.random() * 1.2; // Slightly larger droplets to compensate for fewer number
            
            const droplet = createDroplet({ x, y, z }, scale);
            plate.add(droplet);
          }
        });

        // Reduce condensation droplets
        for (let i = 0; i < 150; i++) { // Reduced from 400 to 150
          const angle = Math.random() * Math.PI * 2;
          const radius = 3.0 + Math.random() * 8.0; // Reduced from 10.0 to 8.0
          const x = Math.cos(angle) * radius;
          const z = Math.sin(angle) * radius;
          const y = minY + totalHeight * (0.15 + Math.random() * 0.7);
          
          const scale = 0.6 + Math.random() * 0.6; // Slightly larger average size
          
          const droplet = createDroplet({ x, y, z }, scale);
          plate.add(droplet);
        }

        // Reduce random larger droplets
        for (let i = 0; i < 80; i++) { // Reduced from 200 to 80
          const x = (Math.random() - 0.5) * 24; // Reduced spread from 28 to 24
          const z = (Math.random() - 0.5) * 16; // Reduced spread from 20 to 16
          const y = minY + totalHeight * (0.2 + Math.random() * 0.6);
          
          const scale = 0.7 + Math.random() * 0.8; // Slightly larger to maintain visual impact
          
          const droplet = createDroplet({ x, y, z }, scale);
          plate.add(droplet);
        }

        // In the STL loader callback, after creating the plate and water droplets
        const waterDroplets = addWaterDroplets();
        waterDroplets.position.x = 12;  // Match plate position
        scene.add(waterDroplets);

        let time = 0;
        let phaseTime = 0;

        // Add these state variables at the start of the animation
        let prevCameraPos = new THREE.Vector3(27, 8, 0);  // Adjusted starting position
        let prevLookAtPos = new THREE.Vector3(12, 0, 0);  // Look at the plate's new center
        let targetCameraPos = new THREE.Vector3();
        let targetLookAtPos = new THREE.Vector3();

        const animate = () => {
          requestAnimationFrame(animate);
          time += 0.002;
          phaseTime++;

          // Reset phases after complete cycle
          if (phaseTime >= PHASE_DURATION * 4) {
            phaseTime = 0;
          }

          // Animate water droplets
          waterDroplets.children.forEach((droplet) => {
            droplet.position.y = droplet.userData.initialY + 
              Math.sin(time * droplet.userData.floatSpeed + droplet.userData.floatOffset) * 0.1;
            
            droplet.rotation.x += 0.001;
            droplet.rotation.y += 0.001;
          });

          const cycleDuration = Math.PI * 2;
          const cycleProgress = (time % cycleDuration) / cycleDuration;

          const easeInOutQuint = t => t < 0.5 ? 16 * t * t * t * t * t : 1 - Math.pow(-2 * t + 2, 5) / 2;

          // Calculate target positions based on current phase
          if (cycleProgress < 0.33) {  // First third: Fly low across the plate
            const t = cycleProgress * 3;
            const easeT = easeInOutQuint(t);
            
            targetCameraPos.set(
              27 - easeT * 12,  // Start further right
              8 - easeT * 6,
              -8 * easeT
            );
            
            targetLookAtPos.set(
              12,  // Always look at plate's new center
              -2 * easeT,
              0
            );
          } 
          else if (cycleProgress < 0.67) {
            const t = (cycleProgress - 0.33) * 3;
            const easeT = easeInOutQuint(t);
            
            const angle = easeT * Math.PI;
            const radius = 3;
            
            targetCameraPos.set(
              12 + radius * Math.cos(angle),  // Orbit around new center
              2,
              radius * Math.sin(angle)
            );
            
            targetLookAtPos.set(
              12,  // Look at plate's new center
              -2,
              0
            );
          }
          else {
            const t = (cycleProgress - 0.67) * 3;
            const easeT = easeInOutQuint(t);
            
            const angle = Math.PI + (easeT * Math.PI);
            const radius = 3 + (easeT * 12);
            
            targetCameraPos.set(
              12 + radius * Math.cos(angle),  // Spiral around new center
              2 + (easeT * 6),
              radius * Math.sin(angle)
            );
            
            targetLookAtPos.set(
              12,  // Look at plate's new center
              -2 + (easeT * 2),
              0
            );
          }

          // Smoothly interpolate between current and target positions
          const lerpFactor = 0.02; // Adjust this value to control smoothness (lower = smoother)
          
          prevCameraPos.lerp(targetCameraPos, lerpFactor);
          prevLookAtPos.lerp(targetLookAtPos, lerpFactor);

          camera.position.copy(prevCameraPos);
          camera.lookAt(prevLookAtPos);

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

  const addWaterDroplets = () => {
    const droplets = new THREE.Group();
    const numDroplets = 20;  // Reduced from 40 to 20
    
    const waterMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      metalness: 0.0,
      roughness: 0.0,
      transmission: 1.0,
      thickness: 0.5,
      transparent: true,
      opacity: 0.3,
      envMapIntensity: 0.8,
      ior: 1.33,
      clearcoat: 0.5,
      clearcoatRoughness: 0.0
    });

    // Create droplets with better spacing
    for (let i = 0; i < numDroplets; i++) {
      const angle = (i / numDroplets) * Math.PI * 2 + Math.random() * 0.5; // More even angular distribution
      const radius = 2.5 + Math.random() * 1.5; // Slightly tighter radius range
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = 0.2 + Math.random() * 1.0; // Lower height range
      
      // Slightly larger size range to compensate for fewer droplets
      const size = 0.02 + Math.random() * 0.03;
      const dropletGeometry = new THREE.SphereGeometry(size, 12, 12); // Reduced segments
      const droplet = new THREE.Mesh(dropletGeometry, waterMaterial);
      
      droplet.position.set(x, y, z);
      droplet.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
      
      droplet.userData.initialY = y;
      droplet.userData.floatSpeed = 0.2 + Math.random() * 0.3; // Slightly slower animation
      droplet.userData.floatOffset = Math.random() * Math.PI * 2;
      
      droplets.add(droplet);
    }
    
    return droplets;
  };

  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative' }}>
      <div className="title" id="title">
        <h1>Plaque Assays</h1>
        <h1>Made Easy</h1>
      </div>
      <div className="canvas-container" id="canvas-container">
        <img 
          src={logo} 
          alt="Logo" 
          className="logo"
        />
      </div>
    </div>
  );
}

export default LandingPage;