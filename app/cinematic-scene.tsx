"use client";

import { MeshReflectorMaterial, RoundedBox, Sky, useProgress, useTexture } from "@react-three/drei";
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
const reelFrames = [
  ["Wichita Study I", "35mm / Double exposure", "A familiar skyline held between two exposures."],
  ["Understructure", "35mm / Architecture", "Structure, interruption, and the soft geometry of daylight."],
  ["Passing Figures", "35mm / Street", "A passing gesture preserved before the street settles again."],
  ["Prairie Line", "35mm / Landscape", "Infrastructure meeting the open distance of the Kansas prairie."],
] as const;

const cameraCurve = new THREE.CatmullRomCurve3(
  [
    new THREE.Vector3(0, 0.25, 10),
    new THREE.Vector3(1.5, 0.18, 5),
    new THREE.Vector3(-2.9, 0.72, -9),
    new THREE.Vector3(2.6, 0.18, -17.5),
    new THREE.Vector3(-2.45, 0.58, -26),
    new THREE.Vector3(2.1, 0.2, -34.5),
    new THREE.Vector3(-0.6, 0.35, -44),
    new THREE.Vector3(0, 0.28, -52),
  ],
  false,
  "catmullrom",
  0.42,
);

const targetCurve = new THREE.CatmullRomCurve3(
  [
    new THREE.Vector3(2.1, 0, 0),
    new THREE.Vector3(2.2, 0, -0.5),
    new THREE.Vector3(-1.6, 0, -15),
    new THREE.Vector3(1.35, 0, -23),
    new THREE.Vector3(-1.15, 0, -31),
    new THREE.Vector3(1.25, 0, -39),
    new THREE.Vector3(0, 0, -50),
    new THREE.Vector3(0, 0, -59),
  ],
  false,
  "catmullrom",
  0.42,
);

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
        emissive="#d8c9b6"
        emissiveMap={texture}
        emissiveIntensity={0.1}
        roughness={0.64}
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
        <meshPhysicalMaterial
          color="#eee3d1"
          transparent
          opacity={0.16}
          roughness={0.38}
          metalness={0.04}
          side={THREE.DoubleSide}
        />
      </RoundedBox>
      <PhotoPlane url={url} scale={scale} />
      <pointLight position={[0, 0.2, 1.8]} intensity={2.6} distance={9} decay={2} color={light} />
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

function OpenSet({ compact }: { compact: boolean }) {
  return (
    <group>
      <Sky
        distance={450000}
        sunPosition={[18, 7, -28]}
        turbidity={7.5}
        rayleigh={1.25}
        mieCoefficient={0.007}
        mieDirectionalG={0.81}
      />

      <mesh position={[0, -3, -22]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[90, 112]} />
        <MeshReflectorMaterial
          resolution={compact ? 256 : 512}
          blur={compact ? [80, 28] : [240, 84]}
          mixBlur={1.2}
          mixStrength={compact ? 0.08 : 0.2}
          roughness={0.92}
          depthScale={0.18}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.4}
          color="#777f7d"
          metalness={0.06}
        />
      </mesh>

      <RoundedBox args={[17, 0.8, 5.5]} radius={0.32} smoothness={3} position={[-10, -2.65, -15]} rotation={[0, -0.16, 0]}>
        <meshStandardMaterial color="#aaa9a2" roughness={0.9} />
      </RoundedBox>
      <RoundedBox args={[19, 0.5, 4]} radius={0.24} smoothness={3} position={[9, -2.72, -34]} rotation={[0, 0.12, 0]}>
        <meshStandardMaterial color="#b6ada1" roughness={0.88} />
      </RoundedBox>

      <RoundedBox args={[3.6, 12, 2.8]} radius={0.22} smoothness={4} position={[-11, 2.8, -8]} rotation={[0, 0.18, -0.025]}>
        <meshStandardMaterial color="#9fa8a6" roughness={0.82} metalness={0.04} />
      </RoundedBox>
      <RoundedBox args={[4.6, 8.8, 2.6]} radius={0.2} smoothness={4} position={[10.5, 1.4, -22]} rotation={[0, -0.2, 0.018]}>
        <meshStandardMaterial color="#c47b69" roughness={0.84} metalness={0.03} />
      </RoundedBox>
      <RoundedBox args={[3.2, 14, 3]} radius={0.22} smoothness={4} position={[-11.5, 3.8, -37]} rotation={[0, 0.14, -0.018]}>
        <meshStandardMaterial color="#b9b5aa" roughness={0.86} metalness={0.04} />
      </RoundedBox>
      <RoundedBox args={[5.2, 10, 2.4]} radius={0.22} smoothness={4} position={[11.2, 2, -49]} rotation={[0, -0.12, 0.02]}>
        <meshStandardMaterial color="#7c8f98" roughness={0.82} metalness={0.05} />
      </RoundedBox>

      {[-10, -26, -42].map((depth, index) => (
        <group key={depth} position={[index % 2 === 0 ? 5.8 : -5.8, 0.3, depth]}>
          <mesh rotation={[0, index % 2 === 0 ? -0.12 : 0.12, 0]}>
            <boxGeometry args={[0.08, 8.2, 3.8]} />
            <meshStandardMaterial
              color={index === 1 ? "#e2a475" : "#e9dfcb"}
              emissive={index === 1 ? "#d77c51" : "#f1d8ad"}
              emissiveIntensity={compact ? 0.7 : 1.5}
              toneMapped={false}
            />
          </mesh>
          <pointLight
            position={[index % 2 === 0 ? -1.2 : 1.2, 1.2, 0]}
            intensity={compact ? 2 : 4}
            distance={12}
            decay={2}
            color={index === 1 ? "#e98b65" : "#ffd9a4"}
          />
        </group>
      ))}
    </group>
  );
}

function DirectedSequence({ compact, reducedMotion }: { compact: boolean; reducedMotion: boolean }) {
  const cameraLight = useRef<THREE.PointLight>(null);
  const desiredPosition = useRef(new THREE.Vector3(0, 0, 10));
  const desiredTarget = useRef(new THREE.Vector3(2, 0, 0));
  const reelElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    reelElement.current = document.querySelector<HTMLElement>(".immersive-reel");
  }, []);

  useFrame(({ camera, pointer }, delta) => {
    const reel = reelElement.current;
    const scrollY = window.scrollY;
    const documentTravel = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
    let progress = Math.min(Math.max(scrollY / documentTravel, 0), 1);

    if (reel) {
      const reelStart = reel.offsetTop;
      const reelTravel = Math.max(reel.offsetHeight - window.innerHeight, 1);

      if (scrollY < reelStart) {
        progress = Math.min(scrollY / Math.max(reelStart, 1), 1) * 0.18;
      } else if (scrollY <= reelStart + reelTravel) {
        progress = 0.18 + ((scrollY - reelStart) / reelTravel) * 0.68;
      } else {
        const afterTravel = Math.max(documentTravel - reelStart - reelTravel, 1);
        progress = 0.86 + Math.min((scrollY - reelStart - reelTravel) / afterTravel, 1) * 0.14;
      }
    }

    const easedProgress = progress * progress * (3 - 2 * progress);
    cameraCurve.getPointAt(easedProgress, desiredPosition.current);
    targetCurve.getPointAt(easedProgress, desiredTarget.current);

    const pointerX = compact ? 0 : pointer.x * 0.18;
    const pointerY = compact ? 0 : pointer.y * 0.08;
    const damping = reducedMotion ? 28 : 2.7;

    camera.position.x = THREE.MathUtils.damp(camera.position.x, desiredPosition.current.x + pointerX, damping, delta);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, desiredPosition.current.y + pointerY, damping, delta);
    camera.position.z = THREE.MathUtils.damp(camera.position.z, desiredPosition.current.z, damping, delta);
    camera.lookAt(desiredTarget.current);
    camera.rotation.z = THREE.MathUtils.damp(
      camera.rotation.z,
      reducedMotion ? 0 : Math.sin(progress * Math.PI * 5) * 0.008,
      3.2,
      delta,
    );

    if (cameraLight.current) {
      cameraLight.current.position.set(camera.position.x - 1.2, camera.position.y + 1.7, camera.position.z + 1.8);
    }
  });

  return (
    <>
      <color attach="background" args={["#a9b5b3"]} />
      <fog attach="fog" args={["#9aa9a7", 18, 64]} />
      <ambientLight intensity={0.62} color="#d6dbe0" />
      <hemisphereLight intensity={1.15} color="#bed3dd" groundColor="#756f68" />
      <directionalLight position={[11, 12, 4]} intensity={2.8} color="#ffe0ad" />
      <pointLight ref={cameraLight} intensity={3.8} distance={16} decay={2} color="#f6cfa2" />
      <pointLight position={[-5, 1, -17]} intensity={3.6} distance={14} color="#df7664" />
      <pointLight position={[5, 1, -34]} intensity={3.2} distance={15} color="#91b8c7" />

      <OpenSet compact={compact} />
      <Dust compact={compact} reducedMotion={reducedMotion} />

      <PhotoPortal
        url="/marissa-portrait.png"
        position={compact ? [0.8, -0.1, 0] : [2.25, -0.05, 0]}
        rotation={[0, compact ? -0.03 : -0.1, 0]}
        scale={compact ? [4.2, 4.2, 1] : [5, 5, 1]}
      />
      <PhotoPortal
        url="/wichita-city.png"
        position={compact ? [-0.4, 0.05, -15] : [-1.65, 0.12, -15]}
        rotation={[0, compact ? 0.02 : 0.09, -0.01]}
        scale={compact ? [5.2, 3.45, 1] : [6.5, 4.3, 1]}
        light="#d7b7a6"
      />
      <PhotoPortal
        url="/parking-structure.png"
        position={compact ? [0.35, 0, -23] : [1.45, 0.08, -23]}
        rotation={[0, compact ? -0.02 : -0.08, 0]}
        scale={compact ? [5.2, 3.45, 1] : [6.4, 4.25, 1]}
      />
      <PhotoPortal
        url="/city-riders.png"
        position={compact ? [-0.25, -0.05, -31] : [-1.3, -0.08, -31]}
        rotation={[0, compact ? 0.02 : 0.08, 0]}
        scale={compact ? [5.15, 3.45, 1] : [6.35, 4.25, 1]}
        light="#d8ad96"
      />
      <PhotoPortal
        url="/kansas-prairie.png"
        position={compact ? [0.35, 0.05, -39] : [1.4, 0.12, -39]}
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
          <Bloom intensity={0.18} luminanceThreshold={0.78} luminanceSmoothing={0.8} mipmapBlur />
          <Noise blendFunction={BlendFunction.SOFT_LIGHT} opacity={0.018} premultiply />
          <Vignette eskil={false} offset={0.18} darkness={0.28} />
        </EffectComposer>
      ) : null}
    </>
  );
}

function CinematicHud() {
  const hud = useRef<HTMLDivElement>(null);
  const [activeFrame, setActiveFrame] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let animationFrame = 0;

    const update = () => {
      animationFrame = 0;
      const reel = document.querySelector<HTMLElement>(".immersive-reel");
      if (!reel) return;

      const reelStart = reel.offsetTop;
      const reelTravel = Math.max(reel.offsetHeight - window.innerHeight, 1);
      const progress = Math.min(Math.max((window.scrollY - reelStart) / reelTravel, 0), 1);
      const nextFrame = Math.min(Math.floor(progress * reelFrames.length), reelFrames.length - 1);
      const shouldShow =
        window.scrollY >= reelStart - window.innerHeight * 0.12 &&
        window.scrollY <= reelStart + reelTravel + window.innerHeight * 0.12;

      hud.current?.style.setProperty("--reel-progress", progress.toString());
      setActiveFrame(nextFrame);
      setVisible(shouldShow);
    };

    const scheduleUpdate = () => {
      if (animationFrame) return;
      animationFrame = window.requestAnimationFrame(update);
    };

    scheduleUpdate();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
    };
  }, []);

  const frame = reelFrames[activeFrame];

  return (
    <div ref={hud} className={`cinematic-hud ${visible ? "is-visible" : ""}`} aria-hidden="true">
      <div className="hud-frame">
        <p>Selected work / {String(activeFrame + 1).padStart(2, "0")}</p>
        <h3>{frame[0]}</h3>
        <span>{frame[1]}</span>
      </div>
      <p className="hud-note">{frame[2]}</p>
      <div className="hud-progress"><i /></div>
    </div>
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
            gl.toneMappingExposure = 1.12;
            gl.outputColorSpace = THREE.SRGBColorSpace;
            setWebglReady(true);
          }}
        >
          <Suspense fallback={null}>
            <CinematicWorld />
          </Suspense>
        </Canvas>
      </div>
      <CinematicHud />
      <CinematicLoader />
      <div className="film-treatment" aria-hidden="true" />
    </>
  );
}
