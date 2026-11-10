import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Dna, RotateCcw, Sparkles, TrendingUp, TrendingDown, Info, X } from 'lucide-react';

interface NetworkNodeData {
  id: string;
  name: string;
  type: 'Gene mRNA' | 'microRNA' | 'DNA Methylation' | 'Genomics' | 'Pathology';
  direction: 'adverse' | 'protective';
  hazardRatio: number;
  plainRole: string;
  pos: [number, number, number];
  color: number;
}

const NETWORK_NODES: NetworkNodeData[] = [
  {
    id: 'mki67',
    name: 'MKI67 (Ki-67)',
    type: 'Gene mRNA',
    direction: 'adverse',
    hazardRatio: 1.45,
    plainRole: 'Cell Division Engine: High levels indicate tumors with rapid mitotic growth.',
    pos: [1.6, 1.2, 0.4],
    color: 0xA6634B, // Terracotta (Adverse)
  },
  {
    id: 'tp53',
    name: 'TP53 Mutation',
    type: 'Gene mRNA',
    direction: 'adverse',
    hazardRatio: 1.41,
    plainRole: 'Broken Guardian: Mutated p53 fails to stop damaged cells from multiplying.',
    pos: [0.8, 1.8, -0.6],
    color: 0xA6634B,
  },
  {
    id: 'mir_21',
    name: 'miR-21 OncomiR',
    type: 'microRNA',
    direction: 'adverse',
    hazardRatio: 1.38,
    plainRole: 'Invasion Booster: Silences natural tumor-suppressing brakes in tissue.',
    pos: [-1.4, 1.3, 0.8],
    color: 0xA6634B,
  },
  {
    id: 'egfr',
    name: 'EGFR Receptor',
    type: 'Gene mRNA',
    direction: 'adverse',
    hazardRatio: 1.30,
    plainRole: 'Growth Signal Antenna: Sends non-stop signals to feed and expand tumor cells.',
    pos: [2.1, -0.4, -0.8],
    color: 0xA6634B,
  },
  {
    id: 'cdkn2a',
    name: 'CDKN2A Methylation',
    type: 'DNA Methylation',
    direction: 'adverse',
    hazardRatio: 1.34,
    plainRole: 'Chemical Silencer: Chemically turns off the cell cycle brake p16.',
    pos: [1.2, -1.5, 0.6],
    color: 0xA6634B,
  },
  {
    id: 'til_density',
    name: 'TIL Density (Immune)',
    type: 'Pathology',
    direction: 'protective',
    hazardRatio: 0.68,
    plainRole: 'Immune Patrol: High numbers of white blood cells actively fighting the cancer.',
    pos: [-1.8, -0.6, 0.9],
    color: 0x5B7065, // Muted Sage (Protective)
  },
  {
    id: 'mgmt',
    name: 'MGMT Methylation',
    type: 'DNA Methylation',
    direction: 'protective',
    hazardRatio: 0.55,
    plainRole: 'Drug Doorway: Makes brain tumors highly sensitive to chemotherapy.',
    pos: [-0.9, -1.6, -0.7],
    color: 0x5B7065,
  },
  {
    id: 'cd8a',
    name: 'CD8A T-Cells',
    type: 'Gene mRNA',
    direction: 'protective',
    hazardRatio: 0.74,
    plainRole: 'Targeted Killers: Flags cancer cells for elimination by the immune system.',
    pos: [-2.0, 0.8, -0.5],
    color: 0x5B7065,
  },
  {
    id: 'tmb',
    name: 'TMB (Mutation Count)',
    type: 'Genomics',
    direction: 'protective',
    hazardRatio: 0.71,
    plainRole: 'Immunotherapy Flag: Produces abnormal tags that help immunotherapy drugs find tumors.',
    pos: [-0.5, 0.2, 1.8],
    color: 0x5B7065,
  },
  {
    id: 'mir_34a',
    name: 'miR-34a Suppressor',
    type: 'microRNA',
    direction: 'protective',
    hazardRatio: 0.78,
    plainRole: 'Calming Dial: Suppresses dangerous growth signals across neighboring pathways.',
    pos: [0.3, -0.8, -1.7],
    color: 0x5B7065,
  },
];

// Translucent interaction links between biological nodes
const NETWORK_EDGES: [number, number][] = [
  [0, 1], // MKI67 <-> TP53
  [1, 2], // TP53 <-> miR-21
  [0, 3], // MKI67 <-> EGFR
  [1, 4], // TP53 <-> CDKN2A
  [5, 7], // TIL <-> CD8A
  [5, 8], // TIL <-> TMB
  [7, 8], // CD8A <-> TMB
  [1, 9], // TP53 <-> miR-34a
  [6, 4], // MGMT <-> CDKN2A
  [2, 0], // miR-21 <-> MKI67
  [3, 7], // EGFR <-> CD8A (cross talk)
];

export const MolecularNetwork3D: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedNode, setSelectedNode] = useState<NetworkNodeData | null>(NETWORK_NODES[0]);
  const [filterDirection, setFilterDirection] = useState<'all' | 'adverse' | 'protective'>('all');

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 340;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xF5F0E6);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 1.0, 6.2);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xfff8f0, 1.5);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffeedd, 1.2);
    dirLight.position.set(6, 6, 6);
    scene.add(dirLight);

    const networkGroup = new THREE.Group();
    scene.add(networkGroup);

    // Build Node Meshes
    const nodeMeshes: THREE.Mesh[] = [];
    NETWORK_NODES.forEach((node) => {
      const geo = new THREE.SphereGeometry(0.24, 24, 24);
      const mat = new THREE.MeshStandardMaterial({
        color: node.color,
        roughness: 0.3,
        metalness: 0.15,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(...node.pos);
      mesh.userData = { nodeData: node };
      networkGroup.add(mesh);
      nodeMeshes.push(mesh);
    });

    // Build Connecting Edges
    const lineMat = new THREE.LineBasicMaterial({
      color: 0xB8B0A2,
      transparent: true,
      opacity: 0.45,
      linewidth: 1.5,
    });

    NETWORK_EDGES.forEach(([fromIdx, toIdx]) => {
      const p1 = new THREE.Vector3(...NETWORK_NODES[fromIdx].pos);
      const p2 = new THREE.Vector3(...NETWORK_NODES[toIdx].pos);
      const lineGeo = new THREE.BufferGeometry().setFromPoints([p1, p2]);
      const line = new THREE.Line(lineGeo, lineMat);
      networkGroup.add(line);
    });

    // Raycasting for node hover / click
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onPointerDown = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(nodeMeshes);

      if (intersects.length > 0) {
        const clickedData = intersects[0].object.userData.nodeData as NetworkNodeData;
        if (clickedData) {
          setSelectedNode(clickedData);
        }
      }
    };

    renderer.domElement.addEventListener('click', onPointerDown);

    // Drag interaction
    let isDragging = false;
    let prevX = 0;
    let prevY = 0;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevX = e.clientX;
      prevY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - prevX;
      const dy = e.clientY - prevY;

      networkGroup.rotation.y += dx * 0.008;
      networkGroup.rotation.x += dy * 0.008;

      prevX = e.clientX;
      prevY = e.clientY;
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const canvas = renderer.domElement;
    canvas.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // Animation Loop
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      // Gentle floating drift
      if (!isDragging) {
        networkGroup.rotation.y += 0.004;
        networkGroup.position.y = Math.sin(t * 1.2) * 0.08;
      }

      // Pulse selected node
      nodeMeshes.forEach((mesh) => {
        const d = mesh.userData.nodeData as NetworkNodeData;
        if (selectedNode && d.id === selectedNode.id) {
          const s = 1.25 + Math.sin(t * 4.0) * 0.1;
          mesh.scale.set(s, s, s);
        } else {
          mesh.scale.set(1.0, 1.0, 1.0);
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: nw, height: nh } = entry.contentRect;
        if (nw > 0 && nh > 0) {
          camera.aspect = nw / nh;
          camera.updateProjectionMatrix();
          renderer.setSize(nw, nh);
        }
      }
    });
    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      canvas.removeEventListener('mousedown', onMouseDown);
      canvas.removeEventListener('click', onPointerDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);

      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      lineMat.dispose();
    };
  }, [selectedNode]);

  return (
    <div className="bg-white border border-[#E6E1D6] rounded-2xl p-6 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E6E1D6]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-[#FAF7F2] border border-[#E6E1D6] text-[#5B7065]">
              <Dna className="w-4 h-4" />
            </span>
            <h3 className="font-serif text-lg font-semibold text-[#2D2926]">
              3D Molecular & Biomarker Network
            </h3>
          </div>
          <p className="text-xs text-[#78716C]">
            Explore interconnected genes and cell markers. Terracotta nodes accelerate disease progression, while sage nodes protect and support survival.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#A6634B]" />
            <span className="text-[#2D2926] font-medium">Adverse Risk Factors</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#5B7065]" />
            <span className="text-[#2D2926] font-medium">Protective Factors</span>
          </div>
        </div>
      </div>

      {/* 3D Canvas */}
      <div className="relative w-full h-[320px] rounded-xl overflow-hidden bg-[#F5F0E6] border border-[#E6E1D6] shadow-inner">
        <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

        <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-[#E6E1D6] text-[11px] text-[#78716C] shadow-xs pointer-events-none">
          Click any sphere to inspect plain-English biomarker role
        </div>
      </div>

      {/* Selected Node Details Card */}
      {selectedNode && (
        <div className="bg-[#FAF7F2] border border-[#E6E1D6] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: selectedNode.direction === 'adverse' ? '#A6634B' : '#5B7065' }}
              />
              <span className="font-bold text-sm text-[#2D2926] font-serif">{selectedNode.name}</span>
              <span className="px-2 py-0.5 rounded text-[10px] bg-white border border-[#E6E1D6] text-[#78716C]">
                {selectedNode.type}
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                  selectedNode.direction === 'adverse'
                    ? 'bg-[#F6EDE9] text-[#A6634B] border-[#A6634B]/30'
                    : 'bg-[#EEF2F0] text-[#5B7065] border-[#5B7065]/30'
                }`}
              >
                {selectedNode.direction === 'adverse' ? 'Higher Risk (Adverse)' : 'Protective Factor'}
              </span>
            </div>
            <p className="text-[#78716C] leading-relaxed max-w-xl">{selectedNode.plainRole}</p>
          </div>

          <div className="bg-white px-4 py-2.5 rounded-xl border border-[#E6E1D6] text-right shrink-0">
            <span className="text-[10px] uppercase font-mono text-[#78716C] block">Risk Multiplier</span>
            <div className="flex items-baseline gap-1 justify-end mt-0.5">
              <span
                className={`font-mono font-bold text-lg ${
                  selectedNode.direction === 'adverse' ? 'text-[#A6634B]' : 'text-[#5B7065]'
                }`}
              >
                {selectedNode.hazardRatio.toFixed(2)}x
              </span>
            </div>
            <span className="text-[10px] text-[#78716C]">
              {selectedNode.direction === 'adverse' ? 'Elevated hazard rate' : 'Reduced hazard rate'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
