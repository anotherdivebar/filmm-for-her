"use client";

import { MeshReflectorMaterial, RoundedBox, useProgress, useTexture } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { Bloom, EffectComposer, Noise, Vignette } from "@react-three/postprocessing";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { BlendFunction } from "postprocessing";
import * as THREE from "three";

const photoSources = [
  "/marissa-portrait.png",
  "/wichita-city.png",
  "/parking-structure.png",
  "/city-riders.png",
  "/kansas-prairie.png",
] as const;

photoSources.forEach((source) => useTexture.preload(source));

function createFeatherTexture(size = 128, feather = 0.16) {
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

  const texture = new THREE.DataTexture(pixels, size, size, THREE.RGBAFormat);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
  return texture;
}

const featherTexture = createFeatherTexture();
const corridorDepths = [4, -4, -12, -20, -28, -36, -44];

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
  scale,
}: {
  url: string;
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
    <mesh scale={scale}>
      <planeGeometry args={[1, 1, 24, 24]} />
      <meshStandardMaterial
        map={texture}
        alphaMap={featherTexture}
        transparent
        opacity={0.98}
        depthWrite={false}
        emissive="#9f9384"
        emissiveMap={texture}
        emissiveIntensity={0.14}
        roughness={0.68}
        metalness={0.02}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

function PhotoPortal({
  url,
  position,
  rotation = [0, 0, 0],
  scale,
  light = "#d9cfbc",
}: {
  url: string;
  position: [number, number, number];
  rotation?: [number, number, number];
  scale: [number, number, number];
  light?: string;
}) {
  return (
    <group position={position} rotation={rotation}>
      <RoundedBox
        args={[scale[0] * 1.03, scale[1] * 1.03, 0.16]}
        radius={0.04}
        smoothness={3}
        position={[0, 0, -0.16]}
      >
        <meshStandardMaterial color="#181612" roughness={0.84} metalness={0.16} />
      </RoundedBox>
      <PhotoPlane url={url} scale={scale} />
      <pointLight position={[0, 0.2, 1.8]} intensity={3.2} distance={8} decay={2} color={light} />
    </group>
  );
}

function Dust({ compact, reducedMotion }: { compact: boolean; reducedMotion: boolean }) {
  const points = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const count = compact ? 90 : 220;
    const values = new Float32Array(count * 3);

    for (let index = 0; index < count; index += 1) {
      const seed = index + 1;
      values[index * 3] = Math.sin(seed * 12.9898) * 6.4;
      values[index * 3 + 1] = Math.cos(seed * 4.1414) * 4;
      values[index * 3 + 2] = -((seed * 3.17) % 54) + 7;
    }

    return values;
  }, [compact]);

  useFrame(({ clock }) => {
    if (!points.current || reducedMotion) return;
    points.current.rotation.y = clock.elapsedTime * 0.006;
    points.current.position.y = Math.sin(clock.elapsedTime * 0.14) * 0.05;
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#d8d1c2"
        size={compact ? 0.014 : 0.019}
        opacity={0.22}
        transparent
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  );
}

function GalleryShell({ compact }: { compact: boolean }) {
  return (
    <group>
      <mesh position={[0, -2.8, -20]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[14, 62]} />
        <MeshReflectorMaterial
          resolution={compact ? 256 : 512}
          blur={compact ? [90, 34] : [280, 96]}
          mixBlur={1.4}
          mixStrength={compact ? 0.12 : 0.26}
          roughness={0.88}
          depthScale={0.28}
          minDepthThreshold={0.35}
          maxDepthThreshold={1.3}
          color="#171510"
          metalness={0.16}
        />
      </mesh>

      <mesh position={[-7, 1, -20]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[62, 8]} />
        <meshStandardMaterial color="#211e19" roughness={0.92} metalness={0.04} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[7, 1, -20]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[62, 8]} />
        <meshStandardMaterial color="#211e19" roughness={0.92} metalness={0.04} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 4.8, -20]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[14, 62]} />
        <meshStandardMaterial color="#171511" roughness={0.94} side={THREE.DoubleSide} />
      </mesh>

      {corridorDepths.map((depth, index) => (
        <group key={depth} position={[0, 0, depth]}>
          <mesh position={[0, 4.18, 0]}>
            <boxGeometry args={[7.4, 0.045, 0.14]} />
            <meshStandardMaterial
              color="#d8cfbd"
              emissive="#d8cfbd"
              emissiveIntensity={index % 2 === 0 ? 4.2 : 2.6}
              toneMapped={false}
            />
          </mesh>
          <pointLight
            position={[index % 2 === 0 ? -1.8 : 1.8, 3.4, 0.8]}
            intensity={compact ? 1.4 : 2.5}
            distance={9}
            decay={2}
            color={index % 3 === 0 ? "#c8a18f" : "#dfd6c6"}
          />
          <RoundedBox args={[1.1, 7.2, 1.1]} radius={0.08} smoothness={2} position={[-6.05, 0.55, 0]}>
            <meshStandardMaterial color="#28241e" roughness={0.86} metalness={0.08} />
          </RoundedBox>
          <RoundedBox args={[1.1, 7.2, 1.1]} radius={0.08} smoothness={2} position={[6.05, 0.55, 0]}>
            <meshStandardMaterial color="#28241e" roughness={0.86} metalness={0.08} />
          </RoundedBox>
        </group>
      ))}
    </group>
  );
}

function DirectedSequence({ compact, reducedMotion }: { compact: boolean; reducedMotion: boolean }) {
  const cameraLight = useRef<THREE.PointLight>(null);
  const lookTarget = useRef(new THREE.Vector3(0, 0, 0));

  useFrame(({ camera, pointer }, delta) => {
    const scrollable = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
    const progress = Math.min(Math.max(window.scrollY / scrollable, 0), 1);
    const desiredZ = 8 - progress * 52;
    const desiredX = compact
      ? Math.sin(progress * Math.PI * 4) * 0.12
      : Math.sin(progress * Math.PI * 4) * 0.5 + pointer.x * 0.2;
    const desiredY = compact ? 0 : pointer.y * 0.09 + Math.sin(progress * Math.PI * 2) * 0.08;
    const damping = reducedMotion ? 28 : 2.7;

    camera.position.z = THREE.MathUtils.damp(camera.position.z, desiredZ, damping, delta);
    camera.position.x = THREE.MathUtils.damp(camera.position.x, desiredX, damping, delta);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, desiredY, damping, delta);

    lookTarget.current.set(camera.position.x * 0.15, -0.04, camera.position.z - 7.5);
    camera.lookAt(lookTarget.current);

    if (cameraLight.current) {
      cameraLight.current.position.set(camera.position.x - 1.4, camera.position.y + 1.6, camera.position.z + 1.4);
    }
  });

  return (
    <>
      <color attach="background" args={["#0e0d0b"]} />
      <fog attach="fog" args={["#0e0d0b", 8, 23]} />
      <ambientLight intensity={0.26} color="#9f9585" />
      <hemisphereLight intensity={0.38} color="#d9d0c0" groundColor="#201a17" />
      <pointLight ref={cameraLight} intensity={5.8} distance={13} decay={2} color="#decfba" />
      <pointLight position={[-4, 0, -17]} intensity={5} distance={12} color="#7d2c36" />
      <pointLight position={[4, 0, -31]} intensity={4.5} distance={12} color="#967160" />

      <GalleryShell compact={compact} />
      <Dust compact={compact} reducedMotion={reducedMotion} />

      <PhotoPortal
        url="/marissa-portrait.png"
        position={compact ? [0.8, -0.1, 0] : [2.3, -0.05, 0]}
        rotation={[0, compact ? -0.03 : -0.1, 0]}
        scale={compact ? [4.2, 4.2, 1] : [5, 5, 1]}
      />
      <PhotoPortal
        url="/wichita-city.png"
        position={compact ? [-0.4, 0.05, -18] : [-1.7, 0.12, -18]}
        rotation={[0, compact ? 0.02 : 0.09, -0.01]}
        scale={compact ? [5.2, 3.45, 1] : [6.5, 4.3, 1]}
        light="#d7b7a6"
      />
      <PhotoPortal
        url="/parking-structure.png"
        position={compact ? [0.35, 0, -25] : [1.5, 0.08, -25]}
        rotation={[0, compact ? -0.02 : -0.08, 0]}
        scale={compact ? [5.2, 3.45, 1] : [6.4, 4.25, 1]}
      />
      <PhotoPortal
        url="/city-riders.png"
        position={compact ? [-0.25, -0.05, -32] : [-1.35, -0.08, -32]}
        rotation={[0, compact ? 0.02 : 0.08, 0]}
        scale={compact ? [5.15, 3.45, 1] : [6.35, 4.25, 1]}
        light="#d8ad96"
      />
      <PhotoPortal
        url="/kansas-prairie.png"
        position={compact ? [0.35, 0.05, -39] : [1.45, 0.12, -39]}
        rotation={[0, compact ? -0.02 : -0.08, 0]}
        scale={compact ? [5.2, 3.45, 1] : [6.4, 4.25, 1]}
        light="#c8c1a8"
      />
    </>
  );
}

function CinematicWorld() {
  const compact = useMediaQuery("(max-width: 700px)");
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");

  return (
    <>
      <DirectedSequence compact={compact} reducedMotion={reducedMotion} />
      {!compact && !reducedMotion ? (
        <EffectComposer multisampling={0} enableNormalPass={false}>
          <Bloom intensity={0.3} luminanceThreshold={0.82} luminanceSmoothing={0.74} mipmapBlur />
          <Noise blendFunction={BlendFunction.SOFT_LIGHT} opacity={0.035} premultiply />
          <Vignette eskil={false} offset={0.22} darkness={0.58} />
        </EffectComposer>
      ) : null}
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
  const [webglReady, setWebglReady] = useState(false);

  useEffect(() => {
    if (!webglReady) return;
    document.documentElement.classList.add("webgl-ready");
    return () => document.documentElement.classList.remove("webgl-ready");
  }, [webglReady]);

  return (
    <>
      <div className="cinematic-fallback" aria-hidden="true" />
      <div className="cinematic-canvas" aria-hidden="true">
        <Canvas
          camera={{ fov: 43, near: 0.1, far: 80, position: [0, 0, 8] }}
          dpr={[1, 1.4]}
          gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
          onCreated={({ gl }) => {
            gl.toneMapping = THREE.ACESFilmicToneMapping;
            gl.toneMappingExposure = 1.02;
            gl.outputColorSpace = THREE.SRGBColorSpace;
            setWebglReady(true);
          }}
        >
          <Suspense fallback={null}>
            <CinematicWorld />
          </Suspense>
        </Canvas>
      </div>
      <CinematicLoader />
      <div className="film-treatment" aria-hidden="true" />
    </>
  );
}
