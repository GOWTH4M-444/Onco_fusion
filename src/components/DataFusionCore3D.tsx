import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Layers, RotateCcw, Sparkles, Eye, Info } from 'lucide-react';

interface ModalityLayerInfo {
  name: string;
  category: string;
  plainEnglish: string;
  colorHex: string;
  sampleMarkers: string[];
}

const LAYERS_INFO: ModalityLayerInfo[] = [
  {
    name: 'Clinical Health History',
    category: 'Phenotype',
    plainEnglish: 'Patient age, tumor stage, and everyday physical performance score.',
    colorHex: '#8C7B6B',
    sampleMarkers: ['Age', 'Stage I–IV', 'Karnofsky 60–100%'],
  },
  {
    name: 'mRNA Gene Expression',
    category: 'Active Signals',
    plainEnglish: 'The active genetic instructions driving cellular division and tumor growth.',
    colorHex: '#5B7065',
    sampleMarkers: ['MKI67 (Ki-67)', 'TP53', 'CD8A T-cells', 'EGFR'],
  },
  {
    name: 'microRNA Regulators',
    category: 'Volume Dials',
    plainEnglish: 'Tiny regulatory molecules that turn down or silence specific gene messages.',
    colorHex: '#7C6578',
    sampleMarkers: ['miR-21 (OncomiR)', 'miR-34a (Suppressor)', 'let-7a'],
  },
  {
    name: 'DNA Methylation',
    category: 'Epigenetic Locks',
    plainEnglish: 'Chemical tags on DNA that permanently silence tumor-fighting genes.',
    colorHex: '#A6634B',
    sampleMarkers: ['MGMT Promoter', 'CDKN2A Promoter', 'BRCA1 CpG'],
  },
];

export const DataFusionCore3D: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeLayer, setActiveLayer] = useState<ModalityLayerInfo | null>(LAYERS_INFO[1]);
  const [isRotating, setIsRotating] = useState<boolean>(true);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Dimensions
    const width = container.clientWidth || 600;
    const height = container.clientHeight || 360;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xF5F0E6); // Warm soft sand background

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 2.2, 7.5);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.shadowMap.enabled = false;
    container.appendChild(renderer.domElement);

    // Warm ambient and directional lighting matching the linen/terracotta theme
    const ambientLight = new THREE.AmbientLight(0xfff8f0, 1.4);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffeedd, 1.2);
    dirLight1.position.set(5, 8, 6);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xddeeff, 0.6);
    dirLight2.position.set(-6, -4, -4);
    scene.add(dirLight2);

    // Central Convergence Core (Patient Risk Score)
    const coreGroup = new THREE.Group();
    scene.add(coreGroup);

    // Inner glowing core
    const coreGeo = new THREE.IcosahedronGeometry(0.7, 2);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0xA6634B, // Terracotta
      roughness: 0.3,
      metalness: 0.1,
      wireframe: false,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    coreGroup.add(coreMesh);

    // Outer wireframe cage
    const cageGeo = new THREE.IcosahedronGeometry(0.95, 1);
    const cageMat = new THREE.MeshBasicMaterial({
      color: 0x2D2926, // Deep espresso wireframe
      wireframe: true,
      transparent: true,
      opacity: 0.25,
    });
    const cageMesh = new THREE.Mesh(cageGeo, cageMat);
    coreGroup.add(cageMesh);

    // Converging Modality Rings & Streams
    const ringGroup = new THREE.Group();
    scene.add(ringGroup);

    const ringMeshes: THREE.Mesh[] = [];
    const ringYPositions = [1.6, 0.55, -0.55, -1.6];
    const ringColors = [0x8C7B6B, 0x5B7065, 0x7C6578, 0xA6634B];

    ringYPositions.forEach((yPos, i) => {
      const radius = 2.4 - Math.abs(yPos) * 0.45;
      const ringGeo = new THREE.TorusGeometry(radius, 0.045, 16, 64);
      const ringMat = new THREE.MeshStandardMaterial({
        color: ringColors[i],
        roughness: 0.4,
        metalness: 0.2,
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = Math.PI / 2 + (i % 2 === 0 ? 0.15 : -0.15);
      ringMesh.position.y = yPos;
      ringGroup.add(ringMesh);
      ringMeshes.push(ringMesh);

      // Add 4 orbiting marker nodes per ring
      for (let k = 0; k < 4; k++) {
        const angle = (k / 4) * Math.PI * 2;
        const sphereGeo = new THREE.SphereGeometry(0.09, 12, 12);
        const sphereMat = new THREE.MeshStandardMaterial({
          color: ringColors[i],
          roughness: 0.2,
        });
        const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
        sphereMesh.position.set(Math.cos(angle) * radius, yPos, Math.sin(angle) * radius);
        ringGroup.add(sphereMesh);
      }
    });

    // Converging Particle Streams (flowing from outer rings to central core)
    const particleCount = 120;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const particleSpeeds = new Float32Array(particleCount);
    const particleOffsets = new Float32Array(particleCount);
    const particleColors = new Float32Array(particleCount * 3);

    for (let p = 0; p < particleCount; p++) {
      const ringIdx = p % 4;
      const c = new THREE.Color(ringColors[ringIdx]);
      particleColors[p * 3] = c.r;
      particleColors[p * 3 + 1] = c.g;
      particleColors[p * 3 + 2] = c.b;

      particleSpeeds[p] = 0.008 + Math.random() * 0.012;
      particleOffsets[p] = Math.random(); // Progress 0 to 1 along curve

      // Initial dummy position
      positions[p * 3] = 0;
      positions[p * 3 + 1] = 0;
      positions[p * 3 + 2] = 0;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.14,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);

    // Mouse drag interaction
    let isDragging = false;
    let previousMouseX = 0;
    let previousMouseY = 0;
    let targetRotationY = 0;
    let targetRotationX = 0;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      previousMouseX = e.clientX;
      previousMouseY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - previousMouseX;
      const deltaY = e.clientY - previousMouseY;

      targetRotationY += deltaX * 0.008;
      targetRotationX += deltaY * 0.008;

      previousMouseX = e.clientX;
      previousMouseY = e.clientY;
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const canvasDom = renderer.domElement;
    canvasDom.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Core gentle pulsing & rotation
      const pulse = 1.0 + Math.sin(elapsed * 2.5) * 0.06;
      coreGroup.scale.set(pulse, pulse, pulse);
      coreMesh.rotation.y += 0.012;
      coreMesh.rotation.x += 0.006;
      cageMesh.rotation.y -= 0.008;

      // Group rotation
      if (isRotating && !isDragging) {
        ringGroup.rotation.y += 0.006;
      } else {
        ringGroup.rotation.y += (targetRotationY - ringGroup.rotation.y) * 0.1;
        ringGroup.rotation.x += (targetRotationX - ringGroup.rotation.x) * 0.1;
      }

      // Update converging particle positions
      const posAttr = particleGeo.attributes.position as THREE.BufferAttribute;
      for (let p = 0; p < particleCount; p++) {
        particleOffsets[p] += particleSpeeds[p];
        if (particleOffsets[p] > 1.0) particleOffsets[p] = 0.0;

        const progress = particleOffsets[p];
        const ringIdx = p % 4;
        const startY = ringYPositions[ringIdx];
        const radius = (2.4 - Math.abs(startY) * 0.45) * (1.0 - progress);
        const angle = ((p * 7) % 360) * (Math.PI / 180) + elapsed * 0.5;

        const x = Math.cos(angle) * radius;
        const y = startY * (1.0 - progress * 0.85);
        const z = Math.sin(angle) * radius;

        posAttr.setXYZ(p, x, y, z);
      }
      posAttr.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    // Resize Observer
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: newW, height: newH } = entry.contentRect;
        if (newW > 0 && newH > 0) {
          camera.aspect = newW / newH;
          camera.updateProjectionMatrix();
          renderer.setSize(newW, newH);
        }
      }
    });
    resizeObserver.observe(container);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      canvasDom.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);

      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }

      renderer.dispose();
      coreGeo.dispose();
      coreMat.dispose();
      cageGeo.dispose();
      cageMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
    };
  }, [isRotating]);

  return (
    <div className="bg-white border border-[#E6E1D6] rounded-2xl p-6 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E6E1D6]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-[#FAF7F2] border border-[#E6E1D6] text-[#A6634B]">
              <Layers className="w-4 h-4" />
            </span>
            <h3 className="font-serif text-lg font-semibold text-[#2D2926]">
              Interactive 3D Data Fusion Core
            </h3>
          </div>
          <p className="text-xs text-[#78716C]">
            Watch multiple biological data streams converge into a central, unified patient survival score. Click any layer below to explore.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsRotating(!isRotating)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FAF7F2] hover:bg-[#F5F0E6] text-[#2D2926] text-xs font-medium border border-[#E6E1D6]"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#78716C]" />
            <span>{isRotating ? 'Pause Spin' : 'Auto Spin'}</span>
          </button>
        </div>
      </div>

      {/* 3D Canvas Area */}
      <div className="relative w-full h-[340px] rounded-xl overflow-hidden bg-[#F5F0E6] border border-[#E6E1D6] shadow-inner">
        <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

        {/* Floating Controls Overlay */}
        <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-[#E6E1D6] text-[11px] text-[#78716C] flex items-center gap-2 shadow-xs pointer-events-none">
          <Eye className="w-3.5 h-3.5 text-[#A6634B]" />
          <span>Click & drag to orbit 3D view</span>
        </div>

        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-[#E6E1D6] text-[11px] text-[#2D2926] font-medium shadow-xs pointer-events-none flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#A6634B] animate-pulse" />
          <span>Central Convergence Core</span>
        </div>
      </div>

      {/* Layer Selector Chips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
        {LAYERS_INFO.map((layer) => {
          const isSelected = activeLayer?.name === layer.name;
          return (
            <button
              key={layer.name}
              onClick={() => setActiveLayer(layer)}
              className={`p-3 rounded-xl border text-left transition-all ${
                isSelected
                  ? 'bg-white border-[#A6634B] shadow-sm ring-1 ring-[#A6634B]/30'
                  : 'bg-[#FAF7F2] border-[#E6E1D6] hover:bg-white hover:border-[#D9D2C5]'
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: layer.colorHex }}
                />
                <span className="font-semibold text-xs text-[#2D2926] truncate">{layer.name}</span>
              </div>
              <span className="text-[10px] uppercase font-mono tracking-wider text-[#78716C] block">
                {layer.category}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Layer Plain-English Card */}
      {activeLayer && (
        <div className="bg-[#FAF7F2] border border-[#E6E1D6] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#2D2926]">{activeLayer.name}</span>
              <span className="px-2 py-0.5 rounded text-[10px] bg-white border border-[#E6E1D6] text-[#78716C]">
                {activeLayer.category}
              </span>
            </div>
            <p className="text-[#78716C] leading-relaxed">{activeLayer.plainEnglish}</p>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap sm:justify-end shrink-0">
            {activeLayer.sampleMarkers.map((m) => (
              <span
                key={m}
                className="px-2 py-1 rounded-md bg-white border border-[#E6E1D6] font-mono text-[11px] text-[#2D2926]"
              >
                {m}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
