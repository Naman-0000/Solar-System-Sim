import React, { useRef, useState, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars, Sphere, Html, Trail } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";

const Comet = () => {
  const ref = useRef();
  const [active, setActive] = useState(false);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (Math.sin(t * 0.1) > 0.95) setActive(true);
    if (active && ref.current) {
      ref.current.position.x -= 3;
      ref.current.position.y -= 1;
      if (ref.current.position.x < -600) {
        ref.current.position.set(600, 150, Math.random() * 300);
        setActive(false);
      }
    }
  });
  return active ? (
    <group ref={ref} position={[600, 150, 0]}>
      <Trail width={3} length={15} color="#00ffff" attenuation={(t) => t * t}>
        <Sphere args={[0.6, 16, 16]}><meshBasicMaterial color="#fff" /></Sphere>
      </Trail>
    </group>
  ) : null;
};

const Planet = ({ distance, speed, size, textureUrl, color, name, hasRings }) => {
  const meshRef = useRef();
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    meshRef.current.position.set(Math.cos(t * speed) * distance, 0, Math.sin(t * speed) * distance);
    meshRef.current.rotation.y += 0.01;
  });

  return (
    <group>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[distance - 0.2, distance + 0.2, 128]} />
        <meshBasicMaterial color={color} opacity={0.15} transparent side={THREE.DoubleSide} />
      </mesh>
      <group ref={meshRef}>
        <Sphere args={[size, 64, 64]}>
          <meshStandardMaterial map={textureUrl ? new THREE.TextureLoader().load(textureUrl) : null} color={color} />
        </Sphere>
        {hasRings && (
          <mesh rotation={[Math.PI / 2.5, 0, 0]}>
            <ringGeometry args={[size * 1.3, size * 2.3, 64]} />
            <meshStandardMaterial color="#C5AB6E" side={THREE.DoubleSide} transparent opacity={0.5} />
          </mesh>
        )}
        {/* Mobile-Friendly Label */}
        <Html distanceFactor={50} position={[0, -size - 5, 0]}>
          <div style={{ color: 'white', fontFamily: 'monospace', fontSize: '10px', textAlign: 'center', pointerEvents: 'none', textShadow: '0 0 5px black', width: '100px' }}>
            {name.toUpperCase()}
          </div>
        </Html>
      </group>
    </group>
  );
};

const EarthSystem = () => {
  const earthRef = useRef();
  const moonRef = useRef();
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    earthRef.current.position.set(Math.cos(t * 0.2) * 135, 0, Math.sin(t * 0.2) * 135);
    moonRef.current.position.set(Math.cos(t * 2) * 10, 0, Math.sin(t * 2) * 10);
    earthRef.current.rotation.y += 0.01;
  });
  return (
    <group>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[134.8, 135.2, 128]} />
        <meshBasicMaterial color="#2271B3" opacity={0.15} transparent side={THREE.DoubleSide} />
      </mesh>
      <group ref={earthRef}>
        <Sphere args={[3.2, 64, 64]}><meshStandardMaterial map={new THREE.TextureLoader().load("https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg")} /></Sphere>
        <Html distanceFactor={40} position={[0, -7, 0]}><div style={{ color: 'white', fontFamily: 'monospace', fontSize: '10px' }}>EARTH</div></Html>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[9.9, 10.1, 64]} />
          <meshBasicMaterial color="#fff" opacity={0.1} transparent side={THREE.DoubleSide} />
        </mesh>
        <Sphere ref={moonRef} args={[0.8, 32, 32]}><meshStandardMaterial color="#888" /></Sphere>
      </group>
    </group>
  );
};

export default function App() {
  return (
    <div style={{ width: "100vw", height: "100vh", background: "#000", overflow: "hidden" }}>
      <Canvas camera={{ position: [0, 500, 800], fov: 45 }}>
        <Stars radius={300} depth={60} count={25000} factor={7} saturation={1} fade speed={2} />
        <ambientLight intensity={0.4} />
        <pointLight position={[0, 0, 0]} intensity={12000} color="#fff" />
        <Comet />
        <Sphere args={[25, 64, 64]}><meshBasicMaterial color="#ffcc00" /></Sphere>

        <Planet distance={60} speed={0.5} size={1.5} color="#A5A5A5" name="Mercury" />
        <Planet distance={95} speed={0.3} size={2.8} color="#E3BB76" name="Venus" />
        <EarthSystem />
        <Planet distance={175} speed={0.15} size={2.2} color="#E27B58" name="Mars" />
        <Planet distance={260} speed={0.08} size={9.5} color="#d39c7e" name="Jupiter" textureUrl="https://upload.wikimedia.org/wikipedia/commons/e/e2/Jupiter.jpg" />
        <Planet distance={350} speed={0.06} size={8.0} color="#C5AB6E" name="Saturn" hasRings />

        <EffectComposer><Bloom luminanceThreshold={1} intensity={1.5} radius={0.4} /></EffectComposer>
        
        {/* MOBILE OPTIMIZED CONTROLS */}
        <OrbitControls 
          makeDefault 
          enableDamping={true} 
          dampingFactor={0.05}
          maxDistance={2000} 
          minDistance={50}
          rotateSpeed={0.5} // Slower for touch screens
        />
      </Canvas>
    </div>
  );
}