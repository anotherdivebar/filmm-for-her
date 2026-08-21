"use client";

import { RoundedBox, useProgress, useTexture } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
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

function createConcreteTexture(size = 192) {
  const pixels = new Uint8Array(size * size * 4);

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const seed = Math.sin((x + 1) * 12.9898 + (y + 1) * 78.233) * 43758.5453;
      const grain = seed - Math.floor(seed);
      const banding = Math.sin(y * 0.14) * 8;
      const value = Math.max(0, Math.min(255, Math.round(122 + grain * 96 + banding)));
      const offset = (y * size + x) * 4;

      pixels[offset] = value;
      pixels[offset + 1] = value;
      pixels[offset + 2] = value;
      pixels[offset + 3] = 255;
    }
  }

  const texture = new THREE.DataTexture(pixels, size, size, THREE.RGBAFormat);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2.5, 5);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
  return texture;
}

const concreteTexture = createConcreteTexture();
const reelFrames = [
  ["Wichita Study I", "35mm / Double exposure", "A familiar skyline held between two exposures."],
  ["Understructure", "35mm / Architecture", "Structure, interruption, and the soft geometry of daylight."],
  ["Passing Figures", "35mm / Street", "A passing gesture preserved before the street settles again."],
  ["Prairie Line", "35mm / Landscape", "Infrastructure meeting the open distance of the Kansas prairie."],
] as const;
const reelFrameStarts = [0, 0.28, 0.57, 0.86] as const;

const cameraCurve = new THREE.CatmullRomCurve3(
  [
    new THREE.Vector3(0, 0.25, 10),
    new THREE.Vector3(0.8, 0.18, 5),
    new THREE.Vector3(-1.2, 0.45, -9),
    new THREE.Vector3(1.1, 0.2, -17.5),
    new THREE.Vector3(-1, 0.4, -26),
    new THREE.Vector3(0.95, 0.22, -34.5),
    new THREE.Vector3(-0.35, 0.35, -44),
    new THREE.Vector3(0, 0.28, -52),
  ],
  false,
  "catmullrom",
  0.42,
);

const targetCurve = new THREE.CatmullRomCurve3(
  [
    new THREE.Vector3(2.1, 0, 0),
    new THREE.Vector3(2, 0, -0.5),
    new THREE.Vector3(-1.45, 0, -15),
    new THREE.Vector3(1.25, 0, -23),
    new THREE.Vector3(-1.05, 0, -31),
    new THREE.Vector3(1.15, 0, -39),
    new THREE.Vector3(0, 0, -50),
    new THREE.Vector3(0, 0, -59),
  ],
  false,
  "catmullrom",
  0.42,
);

const reelStops = [
  [0, 0.18],
  [0.14, 0.25],
  [0.38, 0.42],
  [0.62, 0.59],
  [0.86, 0.75],
  [1, 0.79],
] as const;

function mapReelProgress(progress: number) {
  const clampedProgress = THREE.MathUtils.clamp(progress, 0, 1);

  for (let index = 0; index < reelStops.length - 1; index += 1) {
    const [scrollStart, pathStart] = reelStops[index];
    const [scrollEnd, pathEnd] = reelStops[index + 1];

    if (clampedProgress <= scrollEnd) {
      const localProgress = (clampedProgress - scrollStart) / Math.max(scrollEnd - scrollStart, 0.001);
      const easedProgress = localProgress * localProgress * (3 - 2 * localProgress);
      return THREE.MathUtils.lerp(pathStart, pathEnd, easedProgress);
    }
  }

  return reelStops[reelStops.length - 1][1];
}

function getActiveReelFrame(progress: number) {
  let activeFrame = 0;

  for (let index = 1; index < reelFrameStarts.length; index += 1) {
    if (progress >= reelFrameStarts[index]) activeFrame = index;
  }

  return activeFrame;
}

function getDocumentTop(element: HTMLElement) {
  return element.getBoundingClientRect().top + window.scrollY;
}

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
        smoothness={6}
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

function ArchitecturalMonolith({
  args,
  position,
  rotation,
  color,
  detail = "#eee2d2",
}: {
  args: [number, number, number];
  position: [number, number, number];
  rotation: [number, number, number];
  color: string;
  detail?: string;
}) {
  const [width, height, depth] = args;

  return (
    <group position={position} rotation={rotation}>
      <RoundedBox args={args} radius={0.22} smoothness={8}>
        <meshStandardMaterial
          color={color}
          roughness={0.82}
          roughnessMap={concreteTexture}
          bumpMap={concreteTexture}
          bumpScale={0.028}
          metalness={0.035}
        />
      </RoundedBox>

      {[-0.28, 0.02, 0.32].map((ratio) => (
        <mesh key={ratio} position={[0, height * ratio, depth / 2 + 0.08]}>
          <boxGeometry args={[width * 0.76, 0.028, 0.045]} />
          <meshStandardMaterial color={detail} transparent opacity={0.38} roughness={0.5} />
        </mesh>
      ))}

      <mesh position={[width * 0.34, 0, depth / 2 + 0.08]}>
        <boxGeometry args={[0.035, height * 0.74, 0.045]} />
        <meshStandardMaterial color={detail} transparent opacity={0.3} roughness={0.5} />
      </mesh>
    </group>
  );
}

function OpenSet({ compact }: { compact: boolean }) {
  return (
    <group>
      <mesh position={[0, 14, -20]} scale={80}>
        <sphereGeometry args={[1, 48, 24]} />
        <meshBasicMaterial color="#b7c3c1" side={THREE.BackSide} fog={false} />
      </mesh>

      <mesh position={[0, -3, -22]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[90, 112]} />
        <meshStandardMaterial color="#777f7d" roughness={0.92} metalness={0.04} />
      </mesh>

      <RoundedBox args={[17, 0.8, 5.5]} radius={0.32} smoothness={6} position={[-10, -2.65, -15]} rotation={[0, -0.16, 0]}>
        <meshStandardMaterial color="#aaa9a2" roughness={0.9} />
      </RoundedBox>
      <RoundedBox args={[19, 0.5, 4]} radius={0.24} smoothness={6} position={[9, -2.72, -34]} rotation={[0, 0.12, 0]}>
        <meshStandardMaterial color="#b6ada1" roughness={0.88} />
      </RoundedBox>

      <ArchitecturalMonolith args={[3.6, 12, 2.8]} position={[-11, 2.8, -8]} rotation={[0, 0.18, -0.025]} color="#9fa8a6" />
      <ArchitecturalMonolith args={[4.6, 8.8, 2.6]} position={[10.5, 1.4, -22]} rotation={[0, -0.2, 0.018]} color="#c47b69" detail="#f1c8ad" />
      <ArchitecturalMonolith args={[3.2, 14, 3]} position={[-11.5, 3.8, -37]} rotation={[0, 0.14, -0.018]} color="#b9b5aa" />
      <ArchitecturalMonolith args={[5.2, 10, 2.4]} position={[11.2, 2, -49]} rotation={[0, -0.12, 0.02]} color="#7c8f98" detail="#c8e0de" />

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
  const invalidate = useThree((state) => state.invalidate);
  const cameraLight = useRef<THREE.PointLight>(null);
  const desiredPosition = useRef(new THREE.Vector3(0, 0, 10));
  const desiredTarget = useRef(new THREE.Vector3(2, 0, 0));
  const smoothedTarget = useRef(new THREE.Vector3(2, 0, 0));
  const smoothedProgress = useRef(0);
  const reelElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    reelElement.current = document.querySelector<HTMLElement>(".immersive-reel");

    const requestFrame = () => invalidate();
    window.addEventListener("scroll", requestFrame, { passive: true });
    window.addEventListener("resize", requestFrame);
    requestFrame();

    return () => {
      window.removeEventListener("scroll", requestFrame);
      window.removeEventListener("resize", requestFrame);
    };
  }, [invalidate]);

  useFrame(({ camera }, delta) => {
    const reel = reelElement.current;
    const scrollY = window.scrollY;
    const documentTravel = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
    let rawProgress = Math.min(Math.max(scrollY / documentTravel, 0), 1);

    if (reel) {
      const reelStart = getDocumentTop(reel);
      const reelTravel = Math.max(reel.offsetHeight - window.innerHeight, 1);

      if (scrollY < reelStart) {
        rawProgress = Math.min(scrollY / Math.max(reelStart, 1), 1) * 0.18;
      } else if (scrollY <= reelStart + reelTravel) {
        rawProgress = mapReelProgress((scrollY - reelStart) / reelTravel);
      } else {
        const afterTravel = Math.max(documentTravel - reelStart - reelTravel, 1);
        rawProgress = 0.79 + Math.min((scrollY - reelStart - reelTravel) / afterTravel, 1) * 0.21;
      }
    }

    smoothedProgress.current = THREE.MathUtils.damp(
      smoothedProgress.current,
      rawProgress,
      reducedMotion ? 30 : 1.65,
      delta,
    );
    const easedProgress = smoothedProgress.current;
    cameraCurve.getPointAt(easedProgress, desiredPosition.current);
    targetCurve.getPointAt(easedProgress, desiredTarget.current);

    const damping = reducedMotion ? 28 : 3.2;

    camera.position.x = THREE.MathUtils.damp(camera.position.x, desiredPosition.current.x, damping, delta);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, desiredPosition.current.y, damping, delta);
    camera.position.z = THREE.MathUtils.damp(camera.position.z, desiredPosition.current.z, damping, delta);
    smoothedTarget.current.x = THREE.MathUtils.damp(smoothedTarget.current.x, desiredTarget.current.x, reducedMotion ? 30 : 3.4, delta);
    smoothedTarget.current.y = THREE.MathUtils.damp(smoothedTarget.current.y, desiredTarget.current.y, reducedMotion ? 30 : 3.4, delta);
    smoothedTarget.current.z = THREE.MathUtils.damp(smoothedTarget.current.z, desiredTarget.current.z, reducedMotion ? 30 : 3.4, delta);
    camera.lookAt(smoothedTarget.current);
    camera.rotation.z = THREE.MathUtils.damp(
      camera.rotation.z,
      reducedMotion ? 0 : Math.sin(easedProgress * Math.PI * 5) * 0.005,
      3.2,
      delta,
    );

    if (cameraLight.current) {
      cameraLight.current.position.set(camera.position.x - 1.2, camera.position.y + 1.7, camera.position.z + 1.8);
    }

    const cameraIsSettling = camera.position.distanceToSquared(desiredPosition.current) > 0.000004;
    const targetIsSettling = smoothedTarget.current.distanceToSquared(desiredTarget.current) > 0.000004;
    const progressIsSettling = Math.abs(smoothedProgress.current - rawProgress) > 0.00002;

    if (!reducedMotion && (cameraIsSettling || targetIsSettling || progressIsSettling)) invalidate();
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
    <DirectedSequence compact={compact} reducedMotion={reducedMotion} />
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

      const reelStart = getDocumentTop(reel);
      const reelTravel = Math.max(reel.offsetHeight - window.innerHeight, 1);
      const progress = Math.min(Math.max((window.scrollY - reelStart) / reelTravel, 0), 1);
      const nextFrame = getActiveReelFrame(progress);
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
          frameloop="demand"
          camera={{ fov: 43, near: 0.1, far: 80, position: [0, 0, 8] }}
          dpr={[1, 1.65]}
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
