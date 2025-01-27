import React from 'react';

export default function Model() {

    const {nodes} = useGLTF('../assets/model.glb');
    return (
        <group>
            <mesh>
            </mesh>
        </group>
    )
}