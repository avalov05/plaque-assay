'use client';
import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';

export default function Scene() {
  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <Suspense fallback={null}>
        <Canvas>
        </Canvas>
      </Suspense>
    </div>
  );
}