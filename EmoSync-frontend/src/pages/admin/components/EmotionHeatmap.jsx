import React, { useRef, useEffect } from "react";
import * as THREE from "three";

/**
 * React version 3D Emotion Heatmap (sphere + spiral distributed bar chart)
 *
 * Expected data structure (corresponding to backend DataAnalyticsResponseDTO.EmotionHeatmapData):
 * heatmapData = {
 *   gridData: [ // 7 x 24
 *     [ { x, y, value, avgMoodScore, dominantEmotion }, ... 24 ],
 *     ...
 *   ],
 *   emotionDistribution: { "Happy": 10, "Sad": 4, ... },
 *   peakEmotionTime: "14:00",
 *   dateRange: "2025-11-01 to 2025-11-30"
 * }
 */
const EmotionHeatmap = ({ heatmapData }) => {
  const mountRef = useRef(null);

  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const animationFrameRef = useRef(null);
  const sphereRef = useRef(null);
  const barsGroupRef = useRef(null);

  // Emotion color mapping (fixed color for each emotion)
  const emotionColorMapRef = useRef({});

  /** Initialize Three.js scene, only execute on first mount */
  useEffect(() => {
    initScene();
    animate();

    return () => {
      cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Rebuild bar chart when heatmapData changes */
  useEffect(() => {
    if (!sceneRef.current || !heatmapData) return;
    buildBarsFromData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [heatmapData]);

  /** Initialize scene, camera, lights, sphere, etc. */
  const initScene = () => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 450;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#020617"); 
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 2000);
    camera.position.set(0, 120, 320);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio || 1);
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Semi-transparent sphere as visual center
    const sphereGeom = new THREE.SphereGeometry(100, 64, 64);
    const sphereMat = new THREE.MeshPhongMaterial({
      color: 0x1e293b, 
      opacity: 0.18,
      transparent: true,
      shininess: 80,
      emissive: new THREE.Color(0x020617),
    });
    const sphere = new THREE.Mesh(sphereGeom, sphereMat);
    sphere.castShadow = true;
    sphere.receiveShadow = true;
    scene.add(sphere);
    sphereRef.current = sphere;

    // Bar chart group (for unified management)
    const barsGroup = new THREE.Group();
    scene.add(barsGroup);
    barsGroupRef.current = barsGroup;

    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // Main directional light
    const mainLight = new THREE.DirectionalLight(0xffffff, 1.5);
    mainLight.position.set(100, 160, 120);
    mainLight.castShadow = true;
    scene.add(mainLight);

    // Fill light
    const fillLight = new THREE.DirectionalLight(0x93c5fd, 0.6);
    fillLight.position.set(-80, 80, -60);
    scene.add(fillLight);

    // Background star particles
    createParticles(scene);

    // Responsive
    window.addEventListener("resize", handleResize);
  };

  /** Create background particles */
  const createParticles = (scene) => {
    const particleCount = 120;
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 600; // x
      positions[i * 3 + 1] = Math.random() * 400; // y
      positions[i * 3 + 2] = (Math.random() - 0.5) * 600; // z
    }

    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3)
    );

    const particleMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 2,
      transparent: true,
      opacity: 0.35,
      sizeAttenuation: true,
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);
  };

  /** Build bar chart based on heatmapData (spiral distribution on sphere surface) */
  const buildBarsFromData = () => {
    const scene = sceneRef.current;
    const barsGroup = barsGroupRef.current;
    if (!scene || !barsGroup) return;

    // Clean up old bars first
    while (barsGroup.children.length) {
      const obj = barsGroup.children.pop();
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        if (Array.isArray(obj.material)) {
          obj.material.forEach((m) => m.dispose());
        } else {
          obj.material.dispose();
        }
      }
    }

    const gridData = heatmapData?.gridData || [];
    if (!gridData.length) return;

    const flat = gridData.flat();
    const maxValue = flat.reduce(
      (max, p) => (p && typeof p.value === "number" && p.value > max ? p.value : max),
      0
    );
    const safeMax = maxValue || 1;

    const radius = 100; // Sphere radius
    const totalPoints = 7 * 24; // 7 days * 24 hours
    const goldenAngle = Math.PI * (3 - Math.sqrt(5)); // Golden angle

    // Iterate through 7x24 grid
    for (let dayIndex = 0; dayIndex < gridData.length; dayIndex++) {
      const dayRow = gridData[dayIndex] || [];
      for (let hourIndex = 0; hourIndex < dayRow.length; hourIndex++) {
        const point = dayRow[hourIndex];
        if (!point || !point.value || point.value <= 0) continue;

        const currentIndex = dayIndex * 24 + hourIndex;

        // Spiral distribution coordinates on sphere surface
        const y = 1 - (currentIndex / (totalPoints - 1)) * 2; // 1 → -1
        const r = Math.sqrt(1 - y * y); 
        const theta = goldenAngle * currentIndex;

        const sphereX = radius * r * Math.cos(theta);
        const sphereY = radius * y;
        const sphereZ = radius * r * Math.sin(theta);

        const direction = new THREE.Vector3(sphereX, sphereY, sphereZ).normalize();

        // Bar length relates to emotion intensity
        const valueRatio = point.value / safeMax;
        const barLength = 20 + valueRatio * 60; // Min 20, Max ~80

        // Bar geometry
        const geometry = new THREE.CylinderGeometry(1.6, 2.0, barLength, 10);

        // Color based on emotion + intensity
        const color = getEmotionColor(point.dominantEmotion, valueRatio);

        const material = new THREE.MeshStandardMaterial({
          color,
          emissive: color.clone().multiplyScalar(0.3),
          transparent: true,
          opacity: 0.9,
          roughness: 0.25,
          metalness: 0.4,
        });

        const bar = new THREE.Mesh(geometry, material);
        bar.castShadow = true;
        bar.receiveShadow = true;

        const startDistance = radius + 4;
        const centerPos = direction
          .clone()
          .multiplyScalar(startDistance + barLength / 2);
        bar.position.copy(centerPos);

        // Make bar point outward
        const up = new THREE.Vector3(0, 1, 0);
        const quaternion = new THREE.Quaternion();
        quaternion.setFromUnitVectors(up, direction);
        bar.quaternion.copy(quaternion);

        bar.userData = {
          dayIndex,
          hourIndex,
          value: point.value,
          avgMoodScore: point.avgMoodScore,
          dominantEmotion: point.dominantEmotion || "Unknown",
          phase: Math.random() * Math.PI * 2, // Breathing animation phase
          isBar: true,
        };

        barsGroup.add(bar);
      }
    }
  };

  /** Get emotion color (fixed emotion mapping + HSL random) */
  const getEmotionColor = (emotion, intensity = 1) => {
    const map = emotionColorMapRef.current;
    if (!emotion) emotion = "Default";

    if (!map[emotion]) {
      // Random h, but make colors overall warmer/softer
      const hue = Math.random(); // 0~1
      const saturation = 0.55 + Math.random() * 0.3; // 0.55~0.85
      const lightness = 0.45 + Math.random() * 0.25; // 0.45~0.7

      const baseColor = new THREE.Color();
      baseColor.setHSL(hue, saturation, lightness);
      map[emotion] = baseColor;
    }

    const base = map[emotion].clone();
    // Brighten slightly based on intensity
    const factor = 0.8 + intensity * 0.4; // 0.8~1.2
    base.multiplyScalar(factor);
    return base;
  };

  /** Responsive to window size */
  const handleResize = () => {
    const container = mountRef.current;
    if (!container || !cameraRef.current || !rendererRef.current) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 450;

    cameraRef.current.aspect = width / height;
    cameraRef.current.updateProjectionMatrix();
    rendererRef.current.setSize(width, height);
  };

  /** Animation loop */
  const animate = () => {
    animationFrameRef.current = requestAnimationFrame(animate);

    const scene = sceneRef.current;
    const camera = cameraRef.current;
    const renderer = rendererRef.current;
    const barsGroup = barsGroupRef.current;
    const sphere = sphereRef.current;

    if (!scene || !camera || !renderer) return;

    const time = Date.now() * 0.001;

    // Overall slow rotation
    if (scene) {
      scene.rotation.y = Math.sin(time * 0.15) * 0.12;
    }

    // Sphere slight rotation
    if (sphere) {
      sphere.rotation.y += 0.0015;
    }

    // Bar "breathing" animation
    if (barsGroup) {
      barsGroup.children.forEach((obj) => {
        if (obj.userData && obj.userData.isBar) {
          const baseScale = 1.0;
          const phase = obj.userData.phase || 0;
          const breathing =
            Math.sin(time * 0.8 + phase + obj.position.length() * 0.005) * 0.04;
          obj.scale.set(baseScale, baseScale + breathing, baseScale);
        }
      });
    }

    renderer.render(scene, camera);
  };

  /** Clean up Three.js resources */
  const cleanup = () => {
    cancelAnimationFrame(animationFrameRef.current);

    window.removeEventListener("resize", handleResize);

    const renderer = rendererRef.current;
    const scene = sceneRef.current;

    if (renderer) {
      renderer.dispose();
    }

    if (scene) {
      scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) {
            obj.material.forEach((m) => m.dispose());
          } else {
            obj.material.dispose();
          }
        }
      });
    }

    if (mountRef.current) {
      mountRef.current.innerHTML = "";
    }

    sceneRef.current = null;
    cameraRef.current = null;
    rendererRef.current = null;
    sphereRef.current = null;
    barsGroupRef.current = null;
  };

  return (
    <div className="emotion-heatmap-container w-full rounded-xl">
  
      {/* Three.js mount container */}
      <div className="p-4 bg-slate-900 rounded-b-2xl">
        <div
          ref={mountRef}
          style={{
            width: "100%",
            height: "460px",
            borderRadius: "12px",
            overflow: "hidden",
          }}
        />
      </div>
    </div>
  );
};

export default EmotionHeatmap;
