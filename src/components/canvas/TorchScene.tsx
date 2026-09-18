'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';

interface TorchSceneProps {
  currentSection: number;
  onSectionChange?: (index: number) => void;
}

interface TorchState {
  id: number;
  mesh: THREE.Group;
  flameMesh: THREE.Mesh;
  light: THREE.PointLight;
  isLit: boolean;
  flameIntensity: number;
  smokeParticles: THREE.Points;
  basePosition: THREE.Vector3;
  targetPosition: THREE.Vector3;
  rotation: THREE.Euler;
  targetRotation: THREE.Euler;
}

export default function TorchScene({ currentSection }: TorchSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cycloneActive, setCycloneActive] = useState(false);
  const [pokeCount, setPokeCount] = useState(0);
  const [handStateNotice, setHandStateNotice] = useState<string | null>(null);

  // References for render loop & state management
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const torchesRef = useRef<TorchState[]>([]);
  const handRef = useRef<THREE.Group | null>(null);
  const windowDoorsRef = useRef<{ left: THREE.Group; right: THREE.Group } | null>(null);
  const rainRef = useRef<THREE.Points | null>(null);
  const cycloneMeshRef = useRef<THREE.Mesh | null>(null);

  // Mouse & gesture tracking
  const mouseRef = useRef({
    x: 0,
    y: 0,
    prevX: 0,
    prevY: 0,
    vx: 0,
    vy: 0,
    speed: 0,
    worldPos: new THREE.Vector3(),
    screenX: 0,
    screenY: 0,
  });

  const cycloneTrackerRef = useRef({
    history: [] as { x: number; y: number; time: number }[],
    totalAngle: 0,
    lastAngle: 0,
    revolutions: 0,
    active: false,
    scale: 1,
    lastActiveTime: 0,
  });

  const handStateRef = useRef({
    status: 'idle' as 'idle' | 'igniting' | 'poked' | 'retreating' | 'cooldown',
    pokes: 0,
    cooldownUntil: 0,
    targetTorchId: null as number | null,
    progress: 0,
    recoilProgress: 0,
  });

  const sectionTimeRef = useRef({
    section2StartTime: 0,
    lightningTimer: 0,
    lightningIntensity: 0,
    stackTimer: 0,
  });

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    // --- 1. Scene, Camera, Renderer Setup ---
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x050608);
    scene.fog = new THREE.FogExp2(0x050608, 0.045);

    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    camera.position.set(0, 3.4, 7.8);
    camera.lookAt(0, 1.4, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      powerPreference: 'high-performance',
      alpha: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    rendererRef.current = renderer;

    // --- 2. Lighting ---
    const ambientLight = new THREE.AmbientLight(0x1a202c, 1.3);
    scene.add(ambientLight);

    const moonLight = new THREE.DirectionalLight(0x4a6984, 0.9);
    moonLight.position.set(5, 10, 5);
    scene.add(moonLight);

    // --- 3. Windowsill & Ground Architecture ---
    const stoneGeo = new THREE.BoxGeometry(18, 0.8, 7);
    const stoneMat = new THREE.MeshStandardMaterial({
      color: 0x14161b,
      roughness: 0.85,
      metalness: 0.15,
    });
    const windowsill = new THREE.Mesh(stoneGeo, stoneMat);
    windowsill.position.set(0, -0.4, 0);
    windowsill.receiveShadow = true;
    scene.add(windowsill);



    // --- 4. Flame Geometry (50% Larger, Anchored at Base) ---
    // Cone: radius 0.27, height 0.82 (50% larger than 0.18, 0.55)
    // Shift geometry up by height/2 so the anchor point is at the cone base (y = 0)
    const flameRadius = 0.27;
    const flameHeight = 0.82;
    const flameGeo = new THREE.ConeGeometry(flameRadius, flameHeight, 18);
    flameGeo.translate(0, flameHeight / 2, 0);

    const createFlameMaterial = (colorHex: number) => {
      return new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uColor: { value: new THREE.Color(colorHex) },
          uCoreColor: { value: new THREE.Color(0xffffff) },
          uIntensity: { value: 1.0 },
        },
        vertexShader: `
          uniform float uTime;
          uniform float uIntensity;
          varying vec2 vUv;
          void main() {
            vUv = uv;
            vec3 pos = position;
            float wave = sin(uTime * 8.0 + pos.y * 5.0) * 0.06 * (pos.y / 0.82);
            float waveZ = cos(uTime * 7.0 + pos.y * 4.5) * 0.05 * (pos.y / 0.82);
            pos.x += wave * uIntensity;
            pos.z += waveZ * uIntensity;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
          }
        `,
        fragmentShader: `
          uniform vec3 uColor;
          uniform vec3 uCoreColor;
          uniform float uIntensity;
          varying vec2 vUv;
          void main() {
            float grad = 1.0 - vUv.y;
            vec3 fireColor = mix(uColor, uCoreColor, pow(grad, 2.5));
            float alpha = (1.0 - pow(vUv.y, 1.4)) * uIntensity;
            if (alpha < 0.05) discard;
            gl_FragColor = vec4(fireColor * 1.5, alpha);
          }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
    };

    // --- 5. Smoke Particle System for Extinguished Torches ---
    const smokeCount = 30;
    const smokeGeo = new THREE.BufferGeometry();
    const smokePos = new Float32Array(smokeCount * 3);
    for (let i = 0; i < smokeCount; i++) {
      smokePos[i * 3 + 0] = (Math.random() - 0.5) * 0.15;
      smokePos[i * 3 + 1] = Math.random() * 0.5;
      smokePos[i * 3 + 2] = (Math.random() - 0.5) * 0.15;
    }
    smokeGeo.setAttribute('position', new THREE.BufferAttribute(smokePos, 3));

    const smokeMat = new THREE.PointsMaterial({
      color: 0x666677,
      size: 0.15,
      transparent: true,
      opacity: 0.0,
      depthWrite: false,
    });

    // --- 6. Consistent 50% Larger Torch Dimensions ---
    // The chalice cup top rim is at y = 1.78.
    // The flame is placed at y = 1.62 (lowered by 2 cm / 0.16 units so it is sitting firmly inside the bowl).
    const flameAnchorY = 1.62;

    const createProceduralTorchMesh = () => {
      const g = new THREE.Group();
      g.name = 'altarModel';

      // Stone base (50% larger)
      const baseGeo = new THREE.CylinderGeometry(0.52, 0.65, 0.42, 16);
      const baseMat = new THREE.MeshStandardMaterial({ color: 0x272a31, roughness: 0.9 });
      const base = new THREE.Mesh(baseGeo, baseMat);
      base.position.y = 0.21;
      g.add(base);

      // Chiseled pillar (50% larger)
      const pillarGeo = new THREE.CylinderGeometry(0.3, 0.42, 1.15, 16);
      const pillar = new THREE.Mesh(pillarGeo, baseMat);
      pillar.position.y = 0.98;
      g.add(pillar);

      // Gold chalice cup (50% larger)
      const cupGeo = new THREE.CylinderGeometry(0.62, 0.22, 0.55, 16);
      const cupMat = new THREE.MeshStandardMaterial({
        color: 0xc89d42,
        metalness: 0.75,
        roughness: 0.35,
      });
      const cup = new THREE.Mesh(cupGeo, cupMat);
      cup.position.y = 1.68;
      g.add(cup);

      // Wick inside bowl
      const wickGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.18, 8);
      const wickMat = new THREE.MeshBasicMaterial({ color: 0x111111 });
      const wick = new THREE.Mesh(wickGeo, wickMat);
      wick.position.y = 1.65;
      g.add(wick);

      return g;
    };

    // --- 7. Instantiate Torches in Grid ---
    const torchConfigs = [
      { x: -5.2, z: -0.6 },
      { x: -3.8, z: 0.5 },
      { x: -2.5, z: -0.8 },
      { x: -1.2, z: 0.3 },
      { x: 0.0, z: -0.7 },
      { x: 1.2, z: 0.3 },
      { x: 2.5, z: -0.8 },
      { x: 3.8, z: 0.5 },
      { x: 5.2, z: -0.6 },
      // Midground accents
      { x: -3.2, z: 1.3 },
      { x: -1.1, z: 1.5 },
      { x: 1.1, z: 1.5 },
      { x: 3.2, z: 1.3 },
    ];

    const torches: TorchState[] = [];
    torchConfigs.forEach((cfg, idx) => {
      const torchRoot = new THREE.Group();
      torchRoot.position.set(cfg.x, 0, cfg.z);
      scene.add(torchRoot);

      // Add 50% larger altar model
      const model = createProceduralTorchMesh();
      torchRoot.add(model);

      // Flame sitting down inside the cup
      const flame = new THREE.Mesh(flameGeo, createFlameMaterial(0xff7700));
      flame.position.set(0, flameAnchorY, 0);
      torchRoot.add(flame);

      // Point Light
      const light = new THREE.PointLight(0xff7700, 2.6, 5.0, 1.8);
      light.position.set(0, flameAnchorY + 0.3, 0);
      torchRoot.add(light);

      // Smoke emitter
      const smoke = new THREE.Points(smokeGeo.clone(), smokeMat.clone());
      smoke.position.set(0, flameAnchorY + 0.1, 0);
      torchRoot.add(smoke);

      torches.push({
        id: idx,
        mesh: torchRoot,
        flameMesh: flame,
        light,
        isLit: true,
        flameIntensity: 1.0,
        smokeParticles: smoke,
        basePosition: new THREE.Vector3(cfg.x, 0, cfg.z),
        targetPosition: new THREE.Vector3(cfg.x, 0, cfg.z),
        rotation: new THREE.Euler(0, 0, 0),
        targetRotation: new THREE.Euler(0, 0, 0),
      });
    });
    torchesRef.current = torches;

    // Load actual OBJ model asynchronously with matching 50% larger scale and exact base offset
    const objLoader = new OBJLoader();
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(
      '/models/Free_Altar_torch/textures/hungary001.jpg',
      (texture) => {
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        const realMat = new THREE.MeshStandardMaterial({
          map: texture,
          roughness: 0.8,
          metalness: 0.25,
        });

        objLoader.load(
          '/models/Free_Altar_torch/obj/objAltar.obj',
          (obj) => {
            obj.traverse((child) => {
              if ((child as THREE.Mesh).isMesh) {
                (child as THREE.Mesh).material = realMat;
                child.castShadow = true;
                child.receiveShadow = true;
              }
            });

            // The OBJ has height 3.34 and minY at -0.135.
            // Scale 0.55 gives height 1.84 (50% larger, perfectly matching the chalice cup).
            const scaleFactor = 0.55;
            obj.scale.set(scaleFactor, scaleFactor, scaleFactor);
            // Offset Y by +0.135 * scaleFactor so base sits firmly on the windowsill at y = 0
            obj.position.y = 0.135 * scaleFactor;

            torches.forEach((t) => {
              const oldModel = t.mesh.getObjectByName('altarModel');
              if (oldModel) {
                t.mesh.remove(oldModel);
              }
              const cloneObj = obj.clone();
              cloneObj.name = 'altarModel';
              t.mesh.add(cloneObj);
            });
          },
          undefined,
          (err) => {
            console.warn('Procedural altar active (fallback):', err);
          }
        );
      },
      undefined,
      () => {}
    );

    // --- 8. Stylized 3D Match Hand (Igniter) ---
    const handGroup = new THREE.Group();
    const armGeo = new THREE.CylinderGeometry(0.14, 0.18, 1.4, 12);
    armGeo.rotateZ(Math.PI / 4);
    const handMat = new THREE.MeshStandardMaterial({
      color: 0x1f242d,
      roughness: 0.4,
      metalness: 0.8,
    });
    const arm = new THREE.Mesh(armGeo, handMat);
    arm.position.set(0.7, 0.7, 0);
    handGroup.add(arm);

    const palmGeo = new THREE.BoxGeometry(0.35, 0.18, 0.4);
    const palm = new THREE.Mesh(palmGeo, handMat);
    handGroup.add(palm);

    const stickGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.7, 8);
    stickGeo.rotateX(Math.PI / 2);
    const stickMat = new THREE.MeshStandardMaterial({ color: 0x966f33 });
    const stick = new THREE.Mesh(stickGeo, stickMat);
    stick.position.set(-0.18, -0.05, 0.3);
    handGroup.add(stick);

    const headGeo = new THREE.SphereGeometry(0.05, 8, 8);
    const headMat = new THREE.MeshBasicMaterial({ color: 0xff4400 });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.set(-0.18, -0.05, 0.65);
    handGroup.add(head);

    const matchFlameGeo = new THREE.ConeGeometry(0.07, 0.2, 8);
    matchFlameGeo.translate(0, 0.1, 0);
    const matchFlame = new THREE.Mesh(matchFlameGeo, createFlameMaterial(0xffaa00));
    matchFlame.position.set(-0.18, 0, 0.65);
    handGroup.add(matchFlame);

    const matchLight = new THREE.PointLight(0xffaa22, 2.0, 3.0);
    matchLight.position.set(-0.18, 0.12, 0.65);
    handGroup.add(matchLight);

    handGroup.position.set(0, -5, 0);
    scene.add(handGroup);
    handRef.current = handGroup;

    // --- 9. Cyclone Cursor Vortex Geometry ---
    const cycloneGeo = new THREE.CylinderGeometry(0.85, 0.05, 2.0, 24, 8, true);
    cycloneGeo.translate(0, 1.0, 0);
    const cycloneShaderMat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color(0x88ccff) },
        uOpacity: { value: 0.38 },
      },
      vertexShader: `
        uniform float uTime;
        varying vec2 vUv;
        void main() {
          vUv = uv;
          vec3 pos = position;
          float twist = pos.y * 3.5 - uTime * 9.0;
          float c = cos(twist);
          float s = sin(twist);
          mat2 rot = mat2(c, -s, s, c);
          pos.xz = rot * pos.xz;
          pos.x += sin(uTime * 10.0 + pos.y * 4.0) * 0.08;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        uniform float uOpacity;
        varying vec2 vUv;
        void main() {
          float rim = pow(1.0 - abs(vUv.x - 0.5) * 2.0, 1.5);
          float heightAlpha = smoothstep(0.0, 0.2, vUv.y) * (1.0 - smoothstep(0.8, 1.0, vUv.y));
          float alpha = rim * heightAlpha * uOpacity;
          gl_FragColor = vec4(uColor, alpha);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const cycloneMesh = new THREE.Mesh(cycloneGeo, cycloneShaderMat);
    cycloneMesh.visible = false;
    scene.add(cycloneMesh);
    cycloneMeshRef.current = cycloneMesh;

    // --- 10. Fine Rain Drops Particle System (Section 2) ---
    // Increased density to 7500 particles and drop size by ~5% (0.022 * 1.05 = 0.0231 -> 0.0235) with crisp glistening cyan-white
    const rainCount = 7500;
    const rainGeo = new THREE.BufferGeometry();
    const rainPositions = new Float32Array(rainCount * 3);
    for (let i = 0; i < rainCount; i++) {
      rainPositions[i * 3 + 0] = (Math.random() - 0.5) * 22;
      rainPositions[i * 3 + 1] = Math.random() * 11;
      rainPositions[i * 3 + 2] = (Math.random() - 0.5) * 12;
    }
    rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPositions, 3));
    const rainMat = new THREE.PointsMaterial({
      color: 0xb8e2ff,
      size: 0.0235,
      transparent: true,
      opacity: 0.0,
      depthWrite: false,
    });
    const rainPoints = new THREE.Points(rainGeo, rainMat);
    scene.add(rainPoints);
    rainRef.current = rainPoints;

    // --- 11. Pointer Event Handlers & Poke Raycasting ---
    const raycaster = new THREE.Raycaster();
    const planeZ = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);

    const onPointerMove = (e: MouseEvent) => {
      const now = performance.now();
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;

      const normX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const normY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

      mouseRef.current.prevX = mouseRef.current.x;
      mouseRef.current.prevY = mouseRef.current.y;
      mouseRef.current.x = normX;
      mouseRef.current.y = normY;
      mouseRef.current.screenX = e.clientX;
      mouseRef.current.screenY = e.clientY;

      const dx = normX - mouseRef.current.prevX;
      const dy = normY - mouseRef.current.prevY;
      mouseRef.current.vx = dx;
      mouseRef.current.vy = dy;
      mouseRef.current.speed = Math.sqrt(dx * dx + dy * dy);

      raycaster.setFromCamera(new THREE.Vector2(normX, normY), camera);
      const intersection = new THREE.Vector3();
      raycaster.ray.intersectPlane(planeZ, intersection);
      mouseRef.current.worldPos.copy(intersection);

      // Cyclone Detection Logic (>5 spins)
      const tracker = cycloneTrackerRef.current;
      tracker.history.push({ x: normX, y: normY, time: now });
      tracker.history = tracker.history.filter((pt) => now - pt.time < 1500);

      if (tracker.history.length >= 8) {
        let avgX = 0;
        let avgY = 0;
        for (const pt of tracker.history) {
          avgX += pt.x;
          avgY += pt.y;
        }
        avgX /= tracker.history.length;
        avgY /= tracker.history.length;

        const currentAngle = Math.atan2(normY - avgY, normX - avgX);
        if (tracker.lastAngle !== 0) {
          let delta = currentAngle - tracker.lastAngle;
          if (delta > Math.PI) delta -= Math.PI * 2;
          if (delta < -Math.PI) delta += Math.PI * 2;

          tracker.totalAngle += Math.abs(delta);
          const revs = tracker.totalAngle / (Math.PI * 2);
          tracker.revolutions = revs;

          if (revs >= 5) {
            tracker.active = true;
            tracker.scale = Math.min(1 + (revs - 5) * 0.45, 4.0);
            tracker.lastActiveTime = now;
            setCycloneActive(true);
          }
        }
        tracker.lastAngle = currentAngle;
      }
    };

    const onPointerDown = () => {
      if (handRef.current && handStateRef.current.status !== 'retreating') {
        const handBBox = new THREE.Box3().setFromObject(handRef.current);
        const mouseWorld = mouseRef.current.worldPos;
        const dist = handBBox.distanceToPoint(mouseWorld);

        if (dist < 1.5) {
          const nextPokes = handStateRef.current.pokes + 1;
          handStateRef.current.pokes = nextPokes;
          handStateRef.current.status = 'poked';
          handStateRef.current.recoilProgress = 1.0;
          setPokeCount(nextPokes);

          if (nextPokes >= 3) {
            handStateRef.current.status = 'retreating';
            handStateRef.current.cooldownUntil = performance.now() + 3000;
            setHandStateNotice('Hand retreated! Returning in 3s...');
          } else {
            setHandStateNotice(`Poked hand! (${nextPokes}/3)`);
          }
        }
      }
    };

    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('pointerdown', onPointerDown);

    const onResize = () => {
      if (!cameraRef.current || !rendererRef.current) return;
      cameraRef.current.aspect = window.innerWidth / window.innerHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onResize);

    // --- 12. Animation Loop ---
    let animId = 0;
    let clock = new THREE.Clock();
    const currentCamLookAt = new THREE.Vector3(0, 1.4, 0);

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();
      const now = performance.now();

      // Cyclone decay
      const tracker = cycloneTrackerRef.current;
      if (tracker.active && now - tracker.lastActiveTime > 750) {
        tracker.totalAngle *= 0.88;
        tracker.revolutions = tracker.totalAngle / (Math.PI * 2);
        if (tracker.revolutions < 4.5) {
          tracker.active = false;
          setCycloneActive(false);
        }
      }

      // Cyclone mesh updates
      if (cycloneMeshRef.current) {
        if (tracker.active) {
          cycloneMeshRef.current.visible = true;
          cycloneMeshRef.current.position.copy(mouseRef.current.worldPos);
          cycloneMeshRef.current.position.y = 1.0;
          const s = tracker.scale;
          cycloneMeshRef.current.scale.set(s, s * 1.2, s);
          (cycloneMeshRef.current.material as THREE.ShaderMaterial).uniforms.uTime.value = elapsedTime;
        } else {
          cycloneMeshRef.current.visible = false;
        }
      }

      // Wind from mouse speed or cyclone blowing out torches
      const blowRadius = tracker.active ? 3.8 * tracker.scale : mouseRef.current.speed > 0.05 ? 1.6 : 0.8;
      if (mouseRef.current.speed > 0.03 || tracker.active) {
        torchesRef.current.forEach((torch) => {
          if (torch.isLit && (currentSection === 0 || currentSection === 1)) {
            const d = torch.mesh.position.distanceTo(mouseRef.current.worldPos);
            if (d < blowRadius) {
              torch.isLit = false;
            }
          }
        });
      }

      // --- 12a. Smooth Camera Glide between sections ---
      const targetCamPos = new THREE.Vector3(0, 3.4, 7.8);
      const targetCamLook = new THREE.Vector3(0, 1.4, 0);

      if (currentSection === 1) {
        targetCamPos.set(0, 3.15, 7.3);
        targetCamLook.set(0, 1.3, 0);
      } else if (currentSection === 2) {
        targetCamPos.set(0, 3.85, 8.2);
        targetCamLook.set(0, 1.5, 0);
      } else if (currentSection === 3) {
        targetCamPos.set(0.65, 3.55, 7.6);
        targetCamLook.set(0, 1.65, 0);
      } else if (currentSection === 4) {
        targetCamPos.set(0, 3.4, 7.8);
        targetCamLook.set(0, 1.4, 0);
      }

      camera.position.lerp(targetCamPos, 0.035);
      currentCamLookAt.lerp(targetCamLook, 0.035);
      camera.lookAt(currentCamLookAt);

      // --- 12b. Smooth Environmental Lighting & Fog Transitions ---
      let targetAmbientIntensity = 1.3;
      let targetAmbientColor = new THREE.Color(0x1a202c);
      let targetFogColor = new THREE.Color(0x050608);
      let targetFogDensity = 0.045;

      if (currentSection === 1) {
        targetAmbientIntensity = 1.4;
        targetAmbientColor = new THREE.Color(0x281216);
        targetFogColor = new THREE.Color(0x0a0507);
        targetFogDensity = 0.042;
      } else if (currentSection === 2) {
        if (now > sectionTimeRef.current.lightningTimer) {
          sectionTimeRef.current.lightningIntensity = 3.5;
          sectionTimeRef.current.lightningTimer = now + 3000 + Math.random() * 3500;
        }
        sectionTimeRef.current.lightningIntensity *= 0.85;
        targetAmbientIntensity = 0.95 + sectionTimeRef.current.lightningIntensity;
        targetAmbientColor = new THREE.Color(0x142033);
        targetFogColor = new THREE.Color(0x08101d);
        targetFogDensity = 0.055;
      } else if (currentSection === 3) {
        targetAmbientIntensity = 1.35;
        targetAmbientColor = new THREE.Color(0x181e28);
        targetFogColor = new THREE.Color(0x05070c);
        targetFogDensity = 0.045;
      }

      ambientLight.intensity = THREE.MathUtils.lerp(ambientLight.intensity, targetAmbientIntensity, 0.04);
      ambientLight.color.lerp(targetAmbientColor, 0.035);
      if (scene.fog) {
        scene.fog.color.lerp(targetFogColor, 0.035);
        (scene.fog as THREE.FogExp2).density = THREE.MathUtils.lerp(
          (scene.fog as THREE.FogExp2).density,
          targetFogDensity,
          0.035
        );
      }

      // --- 12c. Section 2: Storm & Rain - Smooth and Gradual Fade In & Out ---
      const targetRainOpacity = currentSection === 2 ? 0.85 : 0.0;
      if (rainRef.current) {
        const mat = rainRef.current.material as THREE.PointsMaterial;
        mat.opacity = THREE.MathUtils.lerp(mat.opacity, targetRainOpacity, 0.035);

        // Keep simulating falling rain drops as long as particles are visible
        if (mat.opacity > 0.005) {
          const rPos = rainRef.current.geometry.attributes.position.array as Float32Array;
          for (let i = 0; i < rainCount; i++) {
            rPos[i * 3 + 1] -= 0.24;
            rPos[i * 3 + 0] -= 0.038;
            if (rPos[i * 3 + 1] < -0.5) {
              rPos[i * 3 + 1] = 10.5;
              rPos[i * 3 + 0] = (Math.random() - 0.5) * 22;
            }
          }
          rainRef.current.geometry.attributes.position.needsUpdate = true;
        }
      }

      if (currentSection === 2) {
        if (sectionTimeRef.current.section2StartTime === 0) {
          sectionTimeRef.current.section2StartTime = now;
        }
        const timeSinceS2 = (now - sectionTimeRef.current.section2StartTime) / 1000;
        // Blowout all torches sequentially within 3 seconds
        const blowoutFraction = Math.min(timeSinceS2 / 3.0, 1.0);
        const torchesToBlow = Math.floor(blowoutFraction * torchesRef.current.length);
        for (let i = 0; i < torchesToBlow; i++) {
          torchesRef.current[i].isLit = false;
        }
      } else {
        sectionTimeRef.current.section2StartTime = 0;
      }

      // Flame & Light colors per section
      const targetFlameColor = currentSection === 1 ? new THREE.Color(0xff1133) : new THREE.Color(0xff7700);
      const targetLightColor = new THREE.Color(currentSection === 1 ? 0xff002b : 0xff7700);

      // Section 3: Kinetic Stacking Hands
      if (currentSection === 3) {
        torchesRef.current.forEach((t) => (t.isLit = false));
        sectionTimeRef.current.stackTimer += 0.016;
        const stackPhase = Math.floor(sectionTimeRef.current.stackTimer * 0.4) % 3;

        torchesRef.current.forEach((torch, idx) => {
          if (stackPhase === 0) {
            const towerIdx = idx % 3;
            const height = Math.floor(idx / 3) * 1.8;
            torch.targetPosition.set((towerIdx - 1) * 2.4, height, -0.4);
            torch.targetRotation.set(0, idx * 0.4, 0);
          } else if (stackPhase === 1) {
            const wobble = Math.sin(elapsedTime * 4.0 + idx) * 0.25;
            torch.targetPosition.y = Math.max(0, torch.targetPosition.y - 0.08);
            torch.targetRotation.z = wobble;
          } else {
            torch.targetPosition.copy(torch.basePosition);
            torch.targetRotation.set(0, 0, 0);
          }
          torch.mesh.position.lerp(torch.targetPosition, 0.08);
          torch.mesh.rotation.x = THREE.MathUtils.lerp(torch.mesh.rotation.x, torch.targetRotation.x, 0.08);
          torch.mesh.rotation.y = THREE.MathUtils.lerp(torch.mesh.rotation.y, torch.targetRotation.y, 0.08);
          torch.mesh.rotation.z = THREE.MathUtils.lerp(torch.mesh.rotation.z, torch.targetRotation.z, 0.08);
        });
      } else if (currentSection !== 4) {
        // In Section 0, 1, 2: The torch altars are firmly anchored on the windowsill.
        // Blown out torches remain exactly in place without sitting up!
        torchesRef.current.forEach((torch) => {
          torch.mesh.position.copy(torch.basePosition);
          torch.mesh.rotation.set(0, 0, 0);
        });
      }

      // Section 4: Pure video backdrop (fade 3D canvas out so video is 100% visible)
      if (canvasRef.current) {
        canvasRef.current.style.opacity = currentSection === 4 ? '0' : '1';
        canvasRef.current.style.transition = 'opacity 1.0s cubic-bezier(0.4, 0, 0.2, 1)';
      }

      if (currentSection === 4) {
        torchesRef.current.forEach((t) => {
          t.isLit = false;
        });
      }

      // Torch Flames & Smoke lerp
      torchesRef.current.forEach((torch) => {
        const targetIntensity = torch.isLit ? 1.0 : 0.0;
        torch.flameIntensity = THREE.MathUtils.lerp(torch.flameIntensity, targetIntensity, 0.09);

        const fMat = torch.flameMesh.material as THREE.ShaderMaterial;
        fMat.uniforms.uTime.value = elapsedTime;
        fMat.uniforms.uIntensity.value = torch.flameIntensity;
        fMat.uniforms.uColor.value.lerp(targetFlameColor, 0.04);

        // Scale flame down cleanly to 0 into the wick
        torch.flameMesh.scale.set(torch.flameIntensity, torch.flameIntensity, torch.flameIntensity);
        torch.light.intensity = torch.flameIntensity * 2.6;
        torch.light.color.lerp(targetLightColor, 0.04);

        const sMat = torch.smokeParticles.material as THREE.PointsMaterial;
        sMat.opacity = THREE.MathUtils.lerp(sMat.opacity, torch.isLit ? 0.0 : 0.35, 0.05);
      });

      // Match Hand Igniter
      const hand = handRef.current;
      const hState = handStateRef.current;

      if (hand) {
        if (hState.status === 'retreating' && now >= hState.cooldownUntil) {
          hState.status = 'igniting';
          hState.pokes = 0;
          setPokeCount(0);
          setHandStateNotice('Hand returned to light the flames.');
        }

        if (currentSection <= 1) {
          const unlitTorch = torchesRef.current.find((t) => !t.isLit);

          if (hState.status === 'poked') {
            hand.position.y += Math.sin(hState.recoilProgress * Math.PI) * 0.18;
            hand.position.z += 0.09;
            hState.recoilProgress -= 0.08;
            if (hState.recoilProgress <= 0) {
              hState.status = 'igniting';
            }
          } else if (hState.status === 'retreating') {
            hand.position.lerp(new THREE.Vector3(0, -5, 0), 0.08);
          } else if (unlitTorch) {
            hState.status = 'igniting';
            const targetPos = unlitTorch.mesh.position.clone().add(new THREE.Vector3(0.2, flameAnchorY + 0.3, 0.3));
            hand.position.lerp(targetPos, 0.07);

            if (hand.position.distanceTo(targetPos) < 0.5) {
              unlitTorch.isLit = true;
            }
          } else {
            hand.position.lerp(new THREE.Vector3(6.5, -3, 0), 0.05);
          }
        } else {
          hand.position.lerp(new THREE.Vector3(0, -6, 0), 0.1);
        }
      }

      renderer.render(scene, camera);
    };

    animId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
    };
  }, [currentSection]);

  return (
    <div ref={containerRef} className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <canvas ref={canvasRef} className="w-full h-full pointer-events-auto cursor-default" />

      {/* Cyclone Cursor HUD Badge */}
      {cycloneActive && (
        <div className="absolute bottom-10 left-10 pointer-events-none z-50 flex items-center gap-3 bg-cyan-950/80 border border-cyan-400/50 backdrop-blur-md px-5 py-2.5 rounded-full text-cyan-300 font-mono text-xs uppercase tracking-widest shadow-[0_0_25px_rgba(6,182,212,0.4)] animate-pulse">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
          <span>VORTEX CYCLONE ACTIVE // EXPANDED BLOWOUT RADIUS</span>
        </div>
      )}

      {/* Hand Igniter & Poke Status Notification */}
      {handStateNotice && (
        <div className="absolute top-20 right-8 pointer-events-none z-50 flex items-center gap-2 bg-neutral-900/80 border border-amber-500/40 backdrop-blur-md px-4 py-2 rounded-full text-amber-300 font-mono text-xs uppercase tracking-wider shadow-lg">
          <span>{handStateNotice}</span>
          {pokeCount > 0 && <span className="text-red-400 font-bold">[{pokeCount}/3 Pokes]</span>}
        </div>
      )}
    </div>
  );
}
