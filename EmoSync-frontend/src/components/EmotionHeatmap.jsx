import React, { useRef, useEffect } from "react";
import * as THREE from "three";

/**
 * React 版 3D 情绪热力图（球体 + 螺旋分布柱状图）
 *
 * 预期数据结构（对应后端 DataAnalyticsResponseDTO.EmotionHeatmapData）：
 * heatmapData = {
 *   gridData: [ // 7 x 24
 *     [ { x, y, value, avgMoodScore, dominantEmotion }, ... 24 ],
 *     ...
 *   ],
 *   emotionDistribution: { "开心": 10, "难过": 4, ... },
 *   peakEmotionTime: "14:00",
 *   dateRange: "2025-11-01 至 2025-11-30"
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

  // 情绪颜色映射（同一情绪固定颜色）
  const emotionColorMapRef = useRef({});

  /** 初始化 Three.js 场景，只在首次 mount 时执行 */
  useEffect(() => {
    initScene();
    animate();

    return () => {
      cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** heatmapData 变化时，重建柱状图 */
  useEffect(() => {
    if (!sceneRef.current || !heatmapData) return;
    buildBarsFromData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [heatmapData]);

  /** 初始化场景、相机、灯光、球体等 */
  const initScene = () => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 450;

    // 场景
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#020617"); // 类似 bg-slate-950
    sceneRef.current = scene;

    // 相机
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 2000);
    camera.position.set(0, 120, 320);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // 渲染器
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio || 1);
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 半透明球体作为视觉中心
    const sphereGeom = new THREE.SphereGeometry(100, 64, 64);
    const sphereMat = new THREE.MeshPhongMaterial({
      color: 0x1e293b, // slate-800-ish
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

    // 柱状图 group（方便统一管理）
    const barsGroup = new THREE.Group();
    scene.add(barsGroup);
    barsGroupRef.current = barsGroup;

    // 环境光
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // 主方向光
    const mainLight = new THREE.DirectionalLight(0xffffff, 1.5);
    mainLight.position.set(100, 160, 120);
    mainLight.castShadow = true;
    scene.add(mainLight);

    // 补光
    const fillLight = new THREE.DirectionalLight(0x93c5fd, 0.6);
    fillLight.position.set(-80, 80, -60);
    scene.add(fillLight);

    // 背景星点粒子
    createParticles(scene);

    // 自适应
    window.addEventListener("resize", handleResize);
  };

  /** 创建背景粒子 */
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

  /** 根据 heatmapData 构建柱状图（螺旋分布在球体表面） */
  const buildBarsFromData = () => {
    const scene = sceneRef.current;
    const barsGroup = barsGroupRef.current;
    if (!scene || !barsGroup) return;

    // 先清理旧的 bar
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

    const radius = 100; // 球体半径
    const totalPoints = 7 * 24; // 7 天 * 24 小时
    const goldenAngle = Math.PI * (3 - Math.sqrt(5)); // 黄金角度

    // 遍历 7x24 grid
    for (let dayIndex = 0; dayIndex < gridData.length; dayIndex++) {
      const dayRow = gridData[dayIndex] || [];
      for (let hourIndex = 0; hourIndex < dayRow.length; hourIndex++) {
        const point = dayRow[hourIndex];
        if (!point || !point.value || point.value <= 0) continue;

        const currentIndex = dayIndex * 24 + hourIndex;

        // 球面上的螺旋分布坐标（贴近你 Vue 的算法思想）
        const y = 1 - (currentIndex / (totalPoints - 1)) * 2; // 1 → -1
        const r = Math.sqrt(1 - y * y); // 当前纬度的半径
        const theta = goldenAngle * currentIndex;

        const sphereX = radius * r * Math.cos(theta);
        const sphereY = radius * y;
        const sphereZ = radius * r * Math.sin(theta);

        const direction = new THREE.Vector3(sphereX, sphereY, sphereZ).normalize();

        // 柱子的长度与情绪强度相关
        const valueRatio = point.value / safeMax;
        const barLength = 20 + valueRatio * 60; // 最短 20，最长 ~80

        // 柱子几何
        const geometry = new THREE.CylinderGeometry(1.6, 2.0, barLength, 10);

        // 颜色根据情绪 + 强度
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

        // 让柱子朝外
        const up = new THREE.Vector3(0, 1, 0);
        const quaternion = new THREE.Quaternion();
        quaternion.setFromUnitVectors(up, direction);
        bar.quaternion.copy(quaternion);

        bar.userData = {
          dayIndex,
          hourIndex,
          value: point.value,
          avgMoodScore: point.avgMoodScore,
          dominantEmotion: point.dominantEmotion || "未知",
          phase: Math.random() * Math.PI * 2, // 呼吸动画相位
          isBar: true,
        };

        barsGroup.add(bar);
      }
    }
  };

  /** 获取情绪对应的颜色（固定情绪映射 + HSL 随机） */
  const getEmotionColor = (emotion, intensity = 1) => {
    const map = emotionColorMapRef.current;
    if (!emotion) emotion = "默认";

    if (!map[emotion]) {
      // 随机 h，但让颜色整体偏暖/柔和一点
      const hue = Math.random(); // 0~1
      const saturation = 0.55 + Math.random() * 0.3; // 0.55~0.85
      const lightness = 0.45 + Math.random() * 0.25; // 0.45~0.7

      const baseColor = new THREE.Color();
      baseColor.setHSL(hue, saturation, lightness);
      map[emotion] = baseColor;
    }

    const base = map[emotion].clone();
    // 根据强度稍微调亮一点
    const factor = 0.8 + intensity * 0.4; // 0.8~1.2
    base.multiplyScalar(factor);
    return base;
  };

  /** 自适应窗口尺寸 */
  const handleResize = () => {
    const container = mountRef.current;
    if (!container || !cameraRef.current || !rendererRef.current) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 450;

    cameraRef.current.aspect = width / height;
    cameraRef.current.updateProjectionMatrix();
    rendererRef.current.setSize(width, height);
  };

  /** 动画循环 */
  const animate = () => {
    animationFrameRef.current = requestAnimationFrame(animate);

    const scene = sceneRef.current;
    const camera = cameraRef.current;
    const renderer = rendererRef.current;
    const barsGroup = barsGroupRef.current;
    const sphere = sphereRef.current;

    if (!scene || !camera || !renderer) return;

    const time = Date.now() * 0.001;

    // 整体缓慢旋转
    if (scene) {
      scene.rotation.y = Math.sin(time * 0.15) * 0.12;
    }

    // 球体微微旋转
    if (sphere) {
      sphere.rotation.y += 0.0015;
    }

    // 柱子“呼吸”动画
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

  /** 清理 Three.js 资源 */
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
  
      {/* Three.js 挂载容器 */}
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
