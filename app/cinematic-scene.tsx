"use client";

import { useProgress, useTexture } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

function createFeatherTexture(size = 128, feather = 0.17) {
  const pixels = new Uint8Array(size * size * 4);

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const horizontal = Math.min((x + 0.5) / size, 1 - (x + 0.5) / size);
      const vertical = Math.min((y + 0.5) / size, 1 - (y + 0.5) / size);
      const distance = Math.min(horizontal, vertical);
      const normalized = Math.min(distance / feather, 1);
      const opacity = normalized * normalized * (3 - 2 * normalized);
      const value = Math.round(opacity * 255);
      const offset = (y * size + x) * 4;

      pixels[offset] = value;
      pixels[offset + 1] = value;
      pixels[offset + 2] = value;
      pixels[offset + 3] = 255;
    }
  }

  const texture = new THREE.DataTexture(
    pixels,
    size,
    size,
    THREE.RGBAFormat,
  );
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
  return texture;
}

const featherTexture = createFeatherTexture();

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
        alphaMap={featherTexture}
        transparent
        opacity={0.98}
        depthWrite={false}
        emissive="#9d9182"
        emissiveMap={texture}
        emissiveIntensity={0.16}
        roughness={0.7}
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
      <color attach="background" args={["#0e0d0b"]} />
      <fog attach="fog" args={["#0e0d0b", 7.5, 18]} />
      <ambientLight intensity={0.23} color="#9d927f" />
      <spotLight
        ref={keyLight}
        position={[3.5, 4.5, 6]}
        angle={0.42}
        penumbra={0.85}
        intensity={48}
        color="#f3eadc"
        distance={22}
      />
      <pointLight position={[-4, -1, 3]} intensity={10} color="#7c2732" distance={14} />
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
          <meshStandardMaterial color="#13110f" roughness={0.92} />
        </mesh>
        <mesh position={[4.2, 0.1, -8.8]} rotation={[0, -0.31, 0]} scale={[1.8, 7, 1]}>
          <planeGeometry />
          <meshStandardMaterial color="#141210" roughness={0.92} />
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
            gl.toneMappingExposure = 1.06;
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
