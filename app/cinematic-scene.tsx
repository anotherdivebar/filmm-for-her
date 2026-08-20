"use client";

import { useProgress, useTexture } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    const update = () => setMatches(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, [query]);

  return matches;
}

function PhotoPlane({
  url,
  position,
  rotation = [0, 0, 0],
  scale,
}: {
  url: string;
  position: [number, number, number];
  rotation?: [number, number, number];
  scale: [number, number, number];
}) {
  const sourceTexture = useTexture(url);
  const texture = useMemo(() => {
    const preparedTexture = sourceTexture.clone();
    preparedTexture.colorSpace = THREE.SRGBColorSpace;
    preparedTexture.anisotropy = 4;
    preparedTexture.needsUpdate = true;
    return preparedTexture;
  }, [sourceTexture]);

  useEffect(() => {
    return () => texture.dispose();
  }, [texture]);

  return (
    <mesh position={position} rotation={rotation} scale={scale}>
      <planeGeometry args={[1, 1, 16, 16]} />
      <meshStandardMaterial
        map={texture}
        roughness={0.76}
        metalness={0.02}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

function Dust({ compact }: { compact: boolean }) {
  const points = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const count = compact ? 120 : 260;
    const values = new Float32Array(count * 3);

    for (let index = 0; index < count; index += 1) {
      const seed = index + 1;
      values[index * 3] = Math.sin(seed * 12.9898) * 8.5;
      values[index * 3 + 1] = Math.cos(seed * 4.1414) * 5;
      values[index * 3 + 2] = -((seed * 1.731) % 15) + 5;
    }

    return values;
  }, [compact]);

  useFrame(({ clock }) => {
    if (!points.current) return;
    points.current.rotation.y = clock.elapsedTime * 0.012;
    points.current.position.y = Math.sin(clock.elapsedTime * 0.17) * 0.08;
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#d8d1c2"
        size={compact ? 0.018 : 0.024}
        opacity={0.3}
        transparent
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  );
}

function DirectedSequence() {
  const rig = useRef<THREE.Group>(null);
  const keyLight = useRef<THREE.SpotLight>(null);
  const compact = useMediaQuery("(max-width: 700px)");
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");

  useFrame(({ camera, pointer, clock }) => {
    if (!rig.current) return;

    const scrollable = Math.max(
      document.documentElement.scrollHeight - window.innerHeight,
      1,
    );
    const progress = Math.min(Math.max(window.scrollY / scrollable, 0), 1);
    const desiredZ = reducedMotion ? progress * 9.4 : progress * 12.2;
    const ease = reducedMotion ? 1 : 0.045;

    rig.current.position.z = THREE.MathUtils.lerp(
      rig.current.position.z,
      desiredZ,
      ease,
    );
    rig.current.rotation.y = THREE.MathUtils.lerp(
      rig.current.rotation.y,
      compact ? 0 : pointer.x * 0.035 + Math.sin(progress * Math.PI) * 0.025,
      0.03,
    );

    camera.position.x = THREE.MathUtils.lerp(
      camera.position.x,
      compact ? 0 : pointer.x * 0.16,
      0.035,
    );
    camera.position.y = THREE.MathUtils.lerp(
      camera.position.y,
      compact ? 0 : pointer.y * 0.08,
      0.035,
    );
    camera.lookAt(0, 0, 0);

    if (keyLight.current && !reducedMotion) {
      keyLight.current.position.x = 3.5 + Math.sin(clock.elapsedTime * 0.18) * 0.45;
    }
  });

  return (
    <>
      <color attach="background" args={["#050504"]} />
      <fog attach="fog" args={["#050504", 6, 15]} />
      <ambientLight intensity={0.11} color="#81796a" />
      <spotLight
        ref={keyLight}
        position={[3.5, 4.5, 6]}
        angle={0.42}
        penumbra={0.85}
        intensity={36}
        color="#f3eadc"
        distance={22}
      />
      <pointLight position={[-4, -1, 3]} intensity={7} color="#681e29" distance={12} />
      <Dust compact={compact} />
      <group ref={rig}>
        <PhotoPlane
          url="/marissa-portrait.png"
          position={compact ? [0.75, -0.1, 0] : [2.25, -0.1, 0]}
          rotation={[0, compact ? -0.04 : -0.11, 0]}
          scale={compact ? [4.3, 4.3, 1] : [5.1, 5.1, 1]}
        />
        <PhotoPlane
          url="/wichita-city.png"
          position={compact ? [-0.35, 0.15, -5.7] : [-1.7, 0.25, -5.7]}
          rotation={[0, compact ? 0.02 : 0.1, -0.01]}
          scale={compact ? [5.2, 3.45, 1] : [6.7, 4.45, 1]}
        />
        <PhotoPlane
          url="/parking-structure.png"
          position={compact ? [0.25, 0, -11.8] : [1.55, 0.15, -11.8]}
          rotation={[0, compact ? -0.02 : -0.08, 0]}
          scale={compact ? [5.3, 3.5, 1] : [6.8, 4.5, 1]}
        />
        <mesh position={[-3.8, -0.2, -3.1]} rotation={[0, 0.34, 0]} scale={[1.6, 7, 1]}>
          <planeGeometry />
          <meshStandardMaterial color="#090908" roughness={0.92} />
        </mesh>
        <mesh position={[4.2, 0.1, -8.8]} rotation={[0, -0.31, 0]} scale={[1.8, 7, 1]}>
          <planeGeometry />
          <meshStandardMaterial color="#0a0a09" roughness={0.92} />
        </mesh>
      </group>
    </>
  );
}

function CinematicLoader() {
  const { progress } = useProgress();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (progress < 99) return;
    const timeout = window.setTimeout(() => setVisible(false), 700);
    return () => window.clearTimeout(timeout);
  }, [progress]);

  return (
    <div className={`cinematic-loader ${visible ? "is-visible" : "is-ready"}`} aria-hidden={!visible}>
      <div className="loader-copy">
        <span>FILMM/FORHER</span>
        <strong>{Math.round(progress).toString().padStart(3, "0")}</strong>
      </div>
      <div className="loader-exposure" />
    </div>
  );
}

export function CinematicScene() {
  return (
    <>
      <div className="cinematic-fallback" aria-hidden="true" />
      <div className="cinematic-canvas" aria-hidden="true">
        <Canvas
          camera={{ fov: 42, near: 0.1, far: 45, position: [0, 0, 8] }}
          dpr={[1, 1.45]}
          gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
          onCreated={({ gl }) => {
            gl.toneMapping = THREE.ACESFilmicToneMapping;
            gl.toneMappingExposure = 0.82;
          }}
        >
          <Suspense fallback={null}>
            <DirectedSequence />
          </Suspense>
        </Canvas>
      </div>
      <CinematicLoader />
      <div className="film-treatment" aria-hidden="true" />
    </>
  );
}
