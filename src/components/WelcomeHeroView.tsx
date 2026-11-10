import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  Sparkles,
  Activity,
  GitCompare,
  Layers,
  TrendingDown,
  Users,
  Calculator,
  ArrowRight,
  Dna,
  Play,
  Pause,
  Info,
  CheckCircle2,
  Sliders,
  Share2,
  Orbit,
} from 'lucide-react';
import { ActiveTab } from './Navbar';

interface WelcomeHeroViewProps {
  onLaunchTab: (tab: ActiveTab) => void;
}

export type Hero3DMode = 'convergence' | 'helix' | 'microenvironment';

interface Interactive3DNodeInfo {
  id: string;
  label: string;
  category: string;
  effect: 'adverse' | 'protective' | 'core';
  hazardText: string;
  plainNote: string;
  colorHex: string;
}

interface OmicsStreamSpec {
  id: 'all' | 'clinical' | 'mrna' | 'mirna' | 'methylation';
  label: string;
  analogyBadge: string;
  plainTitle: string;
  plainDescription: string;
  exampleBiomarkers: string[];
  colorHex: string;
  threeColor: number;
  cIndexAlone: string;
}

const OMICS_STREAMS: OmicsStreamSpec[] = [
  {
    id: 'clinical',
    label: 'Clinical Records',
    analogyBadge: 'Macro Health Picture',
    plainTitle: 'Everyday Physical & Staging Baseline',
    plainDescription:
      'Captures patient age, anatomic tumor stage (Stage I–IV), and daily physical stamina (Karnofsky score). Essential foundation, but misses microscopic cell behavior.',
    exampleBiomarkers: ['Anatomic Stage I–IV', 'Patient Age', 'Karnofsky Stamina (60–100%)'],
    colorHex: '#8C7B6B',
    threeColor: 0x8C7B6B,
    cIndexAlone: '0.634',
  },
  {
    id: 'mrna',
    label: 'mRNA Expression',
    analogyBadge: 'Active Gene Instructions',
    plainTitle: 'Real-Time Cellular Activity Signals',
    plainDescription:
      'Measures which genes are actively broadcasting instructions right now—revealing whether tumor cells are rapidly dividing or if immune T-cells are attacking the tumor.',
    exampleBiomarkers: ['MKI67 (Cell Division)', 'TP53 (Guardian)', 'CD8A (Immune T-Cells)', 'EGFR'],
    colorHex: '#5B7065',
    threeColor: 0x5B7065,
    cIndexAlone: '0.696',
  },
  {
    id: 'mirna',
    label: 'microRNA Dials',
    analogyBadge: 'Cellular Volume Dials',
    plainTitle: 'Post-Transcriptional Volume Switches',
    plainDescription:
      'Tiny non-coding RNA molecules that act like dimmer switches, turning down or silencing specific gene messages before they can build proteins.',
    exampleBiomarkers: ['miR-21 (Adverse OncomiR)', 'miR-34a (Suppressor Dial)', 'let-7a (Guardian)'],
    colorHex: '#7C6578',
    threeColor: 0x7C6578,
    cIndexAlone: '0.668',
  },
  {
    id: 'methylation',
    label: 'DNA Methylation',
    analogyBadge: 'Epigenetic Locks',
    plainTitle: 'Chemical Locks on DNA Promoters',
    plainDescription:
      'Chemical tags attached directly to DNA that lock gene switches shut—either silencing protective tumor brakes (adverse) or disabling tumor DNA repair (chemo-sensitive).',
    exampleBiomarkers: ['MGMT Promoter Lock', 'CDKN2A (p16) Lock', 'BRCA1 CpG Island'],
    colorHex: '#A6634B',
    threeColor: 0xA6634B,
    cIndexAlone: '0.675',
  },
];

export const WelcomeHeroView: React.FC<WelcomeHeroViewProps> = ({ onLaunchTab }) => {
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  const [heroMode, setHeroMode] = useState<Hero3DMode>('convergence');
  const [selectedStream, setSelectedStream] = useState<'all' | 'clinical' | 'mrna' | 'mirna' | 'methylation'>('all');
  const [isSpinning, setIsSpinning] = useState<boolean>(true);
  const [activeConceptIdx, setActiveConceptIdx] = useState<number>(0);
  const [inspected3DNode, setInspected3DNode] = useState<Interactive3DNodeInfo>({
    id: 'fusion_core',
    label: 'Unified Patient Risk Core',
    category: 'Multimodal Bottleneck',
    effect: 'core',
    hazardText: 'C-Index 0.785 (+15.1%)',
    plainNote:
      'Combines Clinical staging, mRNA gene expression, microRNA volume dials, and DNA methylation locks into a single calibrated survival forecast.',
    colorHex: '#A6634B',
  });

  // Mutable refs for 60fps animation loop synchronization
  const heroModeRef = useRef<Hero3DMode>('convergence');
  const selectedStreamRef = useRef<'all' | 'clinical' | 'mrna' | 'mirna' | 'methylation'>('all');
  const isSpinningRef = useRef<boolean>(true);

  useEffect(() => {
    heroModeRef.current = heroMode;
    if (heroMode === 'convergence') {
      setInspected3DNode({
        id: 'fusion_core',
        label: 'Unified Patient Risk Core',
        category: 'Multimodal Convergence',
        effect: 'core',
        hazardText: 'C-Index 0.785 (+15.1%)',
        plainNote:
          'Bezier particle streams from Clinical, mRNA, microRNA, and Methylation layers converge into a central prognostic survival core.',
        colorHex: '#A6634B',
      });
    } else if (heroMode === 'helix') {
      setInspected3DNode({
        id: 'mgmt_lock',
        label: 'MGMT CpG Epigenetic Lock',
        category: 'DNA Methylation Site',
        effect: 'protective',
        hazardText: 'HR 0.55x (Chemo-Sensitive)',
        plainNote:
          'Chemical methylation tags clamped onto the DNA helix silence tumor DNA repair, making cancer cells highly sensitive to chemotherapy.',
        colorHex: '#5B7065',
      });
    } else {
      setInspected3DNode({
        id: 'cd8a_tils',
        label: 'CD8A+ Cytotoxic T-Cell Hub',
        category: 'Tumor Microenvironment',
        effect: 'protective',
        hazardText: 'HR 0.68x (Protective Immune)',
        plainNote:
          'Active killer T-cells infiltrating the tumor microenvironment counteract adverse driver mutations like TP53 and MKI67.',
        colorHex: '#5B7065',
      });
    }
  }, [heroMode]);

  useEffect(() => {
    selectedStreamRef.current = selectedStream;
  }, [selectedStream]);

  useEffect(() => {
    isSpinningRef.current = isSpinning;
  }, [isSpinning]);

  useEffect(() => {
    const container = canvasContainerRef.current;
    if (!container) return;

    const width = container.clientWidth || 1100;
    const height = container.clientHeight || 620;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xF5F0E6);

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(0, 1.5, 9.2);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Warm editorial studio & rim lighting
    const ambientLight = new THREE.AmbientLight(0xFAF7F2, 0.95);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xFFFDF9, 1.35);
    keyLight.position.set(6, 9, 7);
    scene.add(keyLight);

    const warmRimLight = new THREE.DirectionalLight(0xA6634B, 0.55);
    warmRimLight.position.set(-7, 4, -5);
    scene.add(warmRimLight);

    const sageFillLight = new THREE.DirectionalLight(0x5B7065, 0.45);
    sageFillLight.position.set(4, -6, -4);
    scene.add(sageFillLight);

    // Master stage shifted right on desktop so the left editorial overlay has clear room
    const masterGroup = new THREE.Group();
    const updateMasterOffset = (w: number) => {
      masterGroup.position.x = w >= 1024 ? 2.15 : 0;
      masterGroup.position.y = w >= 1024 ? 0.12 : -0.25;
    };
    updateMasterOffset(width);
    scene.add(masterGroup);

    // Interactive raycasting registry across all 3 modes
    const interactiveMeshes: THREE.Mesh[] = [];

    // =========================================================================
    // MODE 1: MULTIMODAL CONVERGENCE CORE (Bezier Particle Streams + Volumetric Core)
    // =========================================================================
    const convergenceGroup = new THREE.Group();
    masterGroup.add(convergenceGroup);

    // Volumetric Core: Inner solid + Middle glowing aura + Outer geodesic frame
    const coreGeo = new THREE.IcosahedronGeometry(0.78, 3);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0xA6634B,
      roughness: 0.22,
      metalness: 0.15,
      emissive: 0xA6634B,
      emissiveIntensity: 0.28,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    coreMesh.userData = {
      mode: 'convergence',
      info: {
        id: 'fusion_core',
        label: 'Unified Patient Risk Core',
        category: 'Multimodal Convergence',
        effect: 'core',
        hazardText: 'C-Index 0.785 (+15.1%)',
        plainNote:
          'Synthesizes Clinical staging, mRNA expression, microRNA dials, and DNA methylation locks into a single calibrated survival score.',
        colorHex: '#A6634B',
      } as Interactive3DNodeInfo,
    };
    convergenceGroup.add(coreMesh);
    interactiveMeshes.push(coreMesh);

    const auraGeo = new THREE.SphereGeometry(0.98, 24, 24);
    const auraMat = new THREE.MeshBasicMaterial({
      color: 0xA6634B,
      transparent: true,
      opacity: 0.14,
    });
    const auraMesh = new THREE.Mesh(auraGeo, auraMat);
    convergenceGroup.add(auraMesh);

    const cageGeo = new THREE.IcosahedronGeometry(1.18, 2);
    const cageMat = new THREE.MeshBasicMaterial({
      color: 0x2D2926,
      wireframe: true,
      transparent: true,
      opacity: 0.14,
    });
    const cageMesh = new THREE.Mesh(cageGeo, cageMat);
    convergenceGroup.add(cageMesh);

    const ringSpecs = [
      {
        id: 'clinical',
        radius: 1.85,
        color: 0x8C7B6B,
        colorHex: '#8C7B6B',
        tiltX: 0.42,
        tiltZ: 0.18,
        speed: 0.38,
        nodes: 6,
        nodeLabel: 'Clinical TNM Stage & Age',
        hazardText: 'HR 1.62x (Baseline C: 0.634)',
        plainNote: 'Macro physical baseline combining patient age, tumor stage I–IV, and Karnofsky stamina.',
      },
      {
        id: 'mrna',
        radius: 2.38,
        color: 0x5B7065,
        colorHex: '#5B7065',
        tiltX: -0.36,
        tiltZ: 0.48,
        speed: -0.31,
        nodes: 8,
        nodeLabel: 'mRNA Transcriptomic Stream',
        hazardText: 'Active Gene Signals (C: 0.696)',
        plainNote: 'Broadcasts active cellular instructions including MKI67 proliferation and CD8A T-cell immunity.',
      },
      {
        id: 'mirna',
        radius: 2.9,
        color: 0x7C6578,
        colorHex: '#7C6578',
        tiltX: 0.58,
        tiltZ: -0.28,
        speed: 0.25,
        nodes: 7,
        nodeLabel: 'microRNA Regulatory Dials',
        hazardText: 'Volume Switches (C: 0.668)',
        plainNote: 'Post-transcriptional volume dials like miR-21 and miR-34a that silence or amplify gene output.',
      },
      {
        id: 'methylation',
        radius: 3.42,
        color: 0xA6634B,
        colorHex: '#A6634B',
        tiltX: -0.22,
        tiltZ: -0.44,
        speed: -0.2,
        nodes: 9,
        nodeLabel: 'DNA Methylation CpG Locks',
        hazardText: 'Epigenetic Locks (C: 0.675)',
        plainNote: 'Chemical tags on DNA promoters (MGMT, CDKN2A) that lock tumor suppressor or repair genes shut.',
      },
    ];

    interface ConvergenceRingEntry {
      id: string;
      group: THREE.Group;
      torusMat: THREE.MeshBasicMaterial;
      nodeMat: THREE.MeshStandardMaterial;
      speed: number;
    }
    const convergenceRings: ConvergenceRingEntry[] = [];

    interface BezierParticle {
      mesh: THREE.Mesh;
      curve: THREE.CubicBezierCurve3;
      t: number;
      speed: number;
      streamId: string;
    }
    const bezierParticles: BezierParticle[] = [];

    ringSpecs.forEach((cfg) => {
      const rGroup = new THREE.Group();
      rGroup.rotation.x = cfg.tiltX;
      rGroup.rotation.z = cfg.tiltZ;

      const torusGeo = new THREE.TorusGeometry(cfg.radius, 0.018, 14, 72);
      const torusMat = new THREE.MeshBasicMaterial({
        color: cfg.color,
        transparent: true,
        opacity: 0.48,
      });
      const torus = new THREE.Mesh(torusGeo, torusMat);
      torus.rotation.x = Math.PI / 2;
      rGroup.add(torus);

      const nodeGeo = new THREE.SphereGeometry(0.1, 16, 16);
      const nodeMat = new THREE.MeshStandardMaterial({
        color: cfg.color,
        roughness: 0.25,
        metalness: 0.12,
        emissive: cfg.color,
        emissiveIntensity: 0.1,
      });

      for (let i = 0; i < cfg.nodes; i++) {
        const angle = (i / cfg.nodes) * Math.PI * 2;
        const nx = Math.cos(angle) * cfg.radius;
        const nz = Math.sin(angle) * cfg.radius;
        const node = new THREE.Mesh(nodeGeo, nodeMat);
        node.position.set(nx, 0, nz);
        node.userData = {
          mode: 'convergence',
          info: {
            id: `${cfg.id}_node_${i}`,
            label: cfg.nodeLabel,
            category: cfg.id.toUpperCase(),
            effect: cfg.id === 'mrna' ? 'protective' : 'adverse',
            hazardText: cfg.hazardText,
            plainNote: cfg.plainNote,
            colorHex: cfg.colorHex,
          } as Interactive3DNodeInfo,
        };
        rGroup.add(node);
        interactiveMeshes.push(node);

        // Create smooth CubicBezierCurve3 from this orbital node curving inward to the central core
        if (i % 2 === 0) {
          const startPt = new THREE.Vector3(nx, 0, nz);
          const ctrl1 = new THREE.Vector3(nx * 0.65, (i % 4 === 0 ? 1 : -1) * 0.55, nz * 0.65);
          const ctrl2 = new THREE.Vector3(-nz * 0.25, (i % 4 === 0 ? -0.35 : 0.35), nx * 0.25);
          const endPt = new THREE.Vector3(0, 0, 0);
          const bCurve = new THREE.CubicBezierCurve3(startPt, ctrl1, ctrl2, endPt);

          // Subtle guide filament line
          const curvePts = bCurve.getPoints(24);
          const lineGeo = new THREE.BufferGeometry().setFromPoints(curvePts);
          const lineMat = new THREE.LineBasicMaterial({
            color: cfg.color,
            transparent: true,
            opacity: 0.18,
          });
          rGroup.add(new THREE.Line(lineGeo, lineMat));

          // Particle traveling along Bezier curve
          const pGeo = new THREE.SphereGeometry(0.052, 10, 10);
          const pMesh = new THREE.Mesh(pGeo, nodeMat);
          rGroup.add(pMesh);
          bezierParticles.push({
            mesh: pMesh,
            curve: bCurve,
            t: (i / cfg.nodes) % 1,
            speed: 0.0045 + (i % 3) * 0.001,
            streamId: cfg.id,
          });
        }
      }

      convergenceGroup.add(rGroup);
      convergenceRings.push({
        id: cfg.id,
        group: rGroup,
        torusMat,
        nodeMat,
        speed: cfg.speed,
      });
    });

    // =========================================================================
    // MODE 2: MOLECULAR EPIGENETIC HELIX (3D Double Helix + CpG Locks + TF Sites)
    // =========================================================================
    const helixGroup = new THREE.Group();
    helixGroup.visible = false;
    helixGroup.rotation.z = 0.22;
    masterGroup.add(helixGroup);

    const helixTurns = 2.6;
    const helixHeight = 5.2;
    const helixRadius = 1.15;
    const strand1Pts: THREE.Vector3[] = [];
    const strand2Pts: THREE.Vector3[] = [];

    for (let i = 0; i <= 80; i++) {
      const frac = i / 80;
      const y = (frac - 0.5) * helixHeight;
      const theta = frac * Math.PI * 2 * helixTurns;
      strand1Pts.push(new THREE.Vector3(Math.cos(theta) * helixRadius, y, Math.sin(theta) * helixRadius));
      strand2Pts.push(
        new THREE.Vector3(Math.cos(theta + Math.PI) * helixRadius, y, Math.sin(theta + Math.PI) * helixRadius)
      );
    }

    const curve1 = new THREE.CatmullRomCurve3(strand1Pts);
    const curve2 = new THREE.CatmullRomCurve3(strand2Pts);

    const tubeMat1 = new THREE.MeshStandardMaterial({
      color: 0x8C7B6B,
      roughness: 0.3,
      metalness: 0.15,
    });
    const tubeMat2 = new THREE.MeshStandardMaterial({
      color: 0x5B7065,
      roughness: 0.3,
      metalness: 0.15,
    });

    helixGroup.add(new THREE.Mesh(new THREE.TubeGeometry(curve1, 80, 0.065, 12, false), tubeMat1));
    helixGroup.add(new THREE.Mesh(new THREE.TubeGeometry(curve2, 80, 0.065, 12, false), tubeMat2));

    // Base-pair rungs + glowing CpG methylation locks & transcription factor binding sites
    const rungCount = 18;
    const helixPulseMeshes: THREE.Mesh[] = [];

    const helixBiomarkerCatalog: Interactive3DNodeInfo[] = [
      {
        id: 'mgmt_cpg',
        label: 'MGMT Promoter CpG Lock',
        category: 'DNA Methylation Lock',
        effect: 'protective',
        hazardText: 'HR 0.55x (Favorable Chemo Response)',
        plainNote:
          'Methylation lock on the MGMT promoter prevents tumor cells from repairing chemotherapy damage, boosting survival.',
        colorHex: '#5B7065',
      },
      {
        id: 'cdkn2a_cpg',
        label: 'CDKN2A (p16) Hypermethylation',
        category: 'Epigenetic Brake Lock',
        effect: 'adverse',
        hazardText: 'HR 1.34x (Silenced Tumor Suppressor)',
        plainNote:
          'Chemical lock that shuts off the p16 cell-cycle brake, allowing tumor cells to divide unchecked.',
        colorHex: '#A6634B',
      },
      {
        id: 'tp53_tf',
        label: 'TP53 Transcription Binding Hub',
        category: 'mRNA Transcription Factor',
        effect: 'adverse',
        hazardText: 'HR 1.41x (Mutated Guardian)',
        plainNote:
          'When TP53 binding is disrupted by mutation, damaged DNA is no longer halted before cell division.',
        colorHex: '#A6634B',
      },
      {
        id: 'mir34a_site',
        label: 'miR-34a Promoter Binding Site',
        category: 'microRNA Transcription Hub',
        effect: 'protective',
        hazardText: 'HR 0.78x (Tumor Suppressor Dial)',
        plainNote:
          'Active transcription of miR-34a dials down oncogenic growth signals and supports apoptosis.',
        colorHex: '#5B7065',
      },
    ];

    for (let r = 1; r < rungCount; r++) {
      const frac = r / rungCount;
      const p1 = curve1.getPointAt(frac);
      const p2 = curve2.getPointAt(frac);

      const dir = new THREE.Vector3().subVectors(p2, p1);
      const len = dir.length();
      const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);

      const rungGeo = new THREE.CylinderGeometry(0.025, 0.025, len, 8);
      const rungMat = new THREE.MeshStandardMaterial({
        color: 0xD6CFBE,
        roughness: 0.4,
      });
      const rungMesh = new THREE.Mesh(rungGeo, rungMat);
      rungMesh.position.copy(mid);
      rungMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
      helixGroup.add(rungMesh);

      // Attach glowing CpG lock or Transcription Factor node on every 2nd rung
      if (r % 2 === 0) {
        const spec = helixBiomarkerCatalog[(r / 2) % helixBiomarkerCatalog.length];
        const isAdverse = spec.effect === 'adverse';
        const markerColor = isAdverse ? 0xA6634B : 0x5B7065;

        const markerGeo = isAdverse
          ? new THREE.OctahedronGeometry(0.18, 1)
          : new THREE.SphereGeometry(0.16, 18, 18);
        const markerMat = new THREE.MeshStandardMaterial({
          color: markerColor,
          roughness: 0.2,
          metalness: 0.15,
          emissive: markerColor,
          emissiveIntensity: 0.28,
        });
        const markerMesh = new THREE.Mesh(markerGeo, markerMat);
        markerMesh.position.copy(r % 4 === 0 ? p1 : mid);
        markerMesh.userData = {
          mode: 'helix',
          info: spec,
        };
        helixGroup.add(markerMesh);
        helixPulseMeshes.push(markerMesh);
        interactiveMeshes.push(markerMesh);
      }
    }

    // =========================================================================
    // MODE 3: BIOMARKER TUMOR MICROENVIRONMENT (Spatial Network + Synaptic Pulses)
    // =========================================================================
    const microGroup = new THREE.Group();
    microGroup.visible = false;
    masterGroup.add(microGroup);

    const microNodesData: {
      pos: [number, number, number];
      radius: number;
      info: Interactive3DNodeInfo;
    }[] = [
      {
        pos: [0, 0.1, 0],
        radius: 0.34,
        info: {
          id: 'tme_hub',
          label: 'Tumor Microenvironment Balance',
          category: 'Spatial Interaction Core',
          effect: 'core',
          hazardText: 'Adverse Drivers vs. Immune Defense',
          plainNote:
            'Patient survival depends on the tug-of-war between aggressive tumor drivers (terracotta) and infiltrating immune defenses (sage).',
          colorHex: '#8C7B6B',
        },
      },
      {
        pos: [-1.75, 1.15, 0.55],
        radius: 0.25,
        info: {
          id: 'mki67_node',
          label: 'MKI67 (Ki-67 Proliferation)',
          category: 'Adverse mRNA Driver',
          effect: 'adverse',
          hazardText: 'HR 1.45x (Rapid Cell Division)',
          plainNote: 'High Ki-67 expression marks aggressive mitotic division across breast, lung, and brain tumors.',
          colorHex: '#A6634B',
        },
      },
      {
        pos: [1.65, 1.25, -0.45],
        radius: 0.26,
        info: {
          id: 'tp53_node',
          label: 'TP53 Driver Mutation',
          category: 'Adverse Genomic Driver',
          effect: 'adverse',
          hazardText: 'HR 1.41x (Lost DNA Guardian)',
          plainNote: 'Inactivated p53 fails to arrest damaged cells, accelerating genomic instability.',
          colorHex: '#A6634B',
        },
      },
      {
        pos: [-1.85, -1.05, -0.5],
        radius: 0.23,
        info: {
          id: 'mir21_node',
          label: 'miR-21 OncomiR Hub',
          category: 'Adverse microRNA',
          effect: 'adverse',
          hazardText: 'HR 1.38x (Silences PTEN Brakes)',
          plainNote: 'Overactive miR-21 dials down natural tumor suppressor genes and promotes tissue invasion.',
          colorHex: '#A6634B',
        },
      },
      {
        pos: [1.9, -0.95, 0.65],
        radius: 0.23,
        info: {
          id: 'egfr_node',
          label: 'EGFR Growth Receptor',
          category: 'Adverse mRNA Driver',
          effect: 'adverse',
          hazardText: 'HR 1.30x (Continuous Growth Signal)',
          plainNote: 'Hyperactive cell-surface antenna sending constant proliferation signals into the tumor.',
          colorHex: '#A6634B',
        },
      },
      {
        pos: [0.25, 1.85, 0.95],
        radius: 0.26,
        info: {
          id: 'cd8a_node',
          label: 'CD8A+ Cytotoxic T-Cells',
          category: 'Protective Immune Factor',
          effect: 'protective',
          hazardText: 'HR 0.74x (Active T-Cell Clearance)',
          plainNote: 'Killer T-cells that recognize and eliminate malignant tumor cells, extending patient survival.',
          colorHex: '#5B7065',
        },
      },
      {
        pos: [-0.45, -1.8, 0.85],
        radius: 0.26,
        info: {
          id: 'til_node',
          label: 'TIL Immune Cell Density',
          category: 'Protective Pathology Marker',
          effect: 'protective',
          hazardText: 'HR 0.68x (Strong Immune Infiltration)',
          plainNote: 'High density of tumor-infiltrating lymphocytes on pathology slides predicts strong checkpoint response.',
          colorHex: '#5B7065',
        },
      },
      {
        pos: [1.15, 0.15, 1.65],
        radius: 0.23,
        info: {
          id: 'mgmt_node',
          label: 'MGMT Promoter Methylation',
          category: 'Protective Epigenetic Lock',
          effect: 'protective',
          hazardText: 'HR 0.55x (Alkylating Sensitivity)',
          plainNote: 'Locks DNA repair enzymes in glioblastoma and melanoma, sensitizing tumors to chemotherapy.',
          colorHex: '#5B7065',
        },
      },
      {
        pos: [-1.15, 0.2, -1.6],
        radius: 0.22,
        info: {
          id: 'tmb_node',
          label: 'High TMB Neoantigens',
          category: 'Protective Genomic Scar',
          effect: 'protective',
          hazardText: 'HR 0.71x (Immunotherapy Target)',
          plainNote: 'Elevated mutation burden exposes foreign neoantigens that alert the patient’s immune system.',
          colorHex: '#5B7065',
        },
      },
    ];

    const microMeshList: THREE.Mesh[] = [];
    microNodesData.forEach((nd) => {
      const col =
        nd.info.effect === 'adverse'
          ? 0xA6634B
          : nd.info.effect === 'protective'
          ? 0x5B7065
          : 0x8C7B6B;

      const geo = new THREE.SphereGeometry(nd.radius, 24, 24);
      const mat = new THREE.MeshStandardMaterial({
        color: col,
        roughness: 0.24,
        metalness: 0.14,
        emissive: col,
        emissiveIntensity: 0.22,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(...nd.pos);
      mesh.userData = {
        mode: 'microenvironment',
        info: nd.info,
      };
      microGroup.add(mesh);
      microMeshList.push(mesh);
      interactiveMeshes.push(mesh);
    });

    // Synaptic Connections + Traveling Synaptic Pulses
    const synapticEdges: [number, number][] = [
      [0, 1],
      [0, 2],
      [0, 3],
      [0, 4],
      [0, 5],
      [0, 6],
      [0, 7],
      [0, 8],
      [1, 5],
      [2, 5],
      [3, 6],
      [4, 7],
      [1, 8],
      [2, 7],
    ];

    interface SynapticPulse {
      mesh: THREE.Mesh;
      pStart: THREE.Vector3;
      pEnd: THREE.Vector3;
      t: number;
      speed: number;
    }
    const synapticPulses: SynapticPulse[] = [];

    synapticEdges.forEach(([iA, iB], eIdx) => {
      const pA = microMeshList[iA].position;
      const pB = microMeshList[iB].position;

      const lineGeo = new THREE.BufferGeometry().setFromPoints([pA, pB]);
      const isProtectiveEdge = microNodesData[iB].info.effect === 'protective';
      const edgeColor = isProtectiveEdge ? 0x5B7065 : 0xA6634B;

      const lineMat = new THREE.LineBasicMaterial({
        color: edgeColor,
        transparent: true,
        opacity: 0.32,
      });
      microGroup.add(new THREE.Line(lineGeo, lineMat));

      const pulseGeo = new THREE.SphereGeometry(0.048, 8, 8);
      const pulseMat = new THREE.MeshBasicMaterial({
        color: edgeColor,
      });
      const pulseMesh = new THREE.Mesh(pulseGeo, pulseMat);
      microGroup.add(pulseMesh);

      synapticPulses.push({
        mesh: pulseMesh,
        pStart: pA.clone(),
        pEnd: pB.clone(),
        t: (eIdx * 0.19) % 1,
        speed: 0.006 + (eIdx % 3) * 0.0015,
      });
    });

    // Subtle ambient floating particles in background
    const dustCount = 42;
    const dustGeo = new THREE.BufferGeometry();
    const dustPositions = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount; i++) {
      dustPositions[i * 3] = (Math.random() - 0.5) * 14;
      dustPositions[i * 3 + 1] = (Math.random() - 0.5) * 8;
      dustPositions[i * 3 + 2] = (Math.random() - 0.5) * 8 - 2;
    }
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
    const dustMat = new THREE.PointsMaterial({
      color: 0xA6634B,
      size: 0.055,
      transparent: true,
      opacity: 0.26,
    });
    const dustPoints = new THREE.Points(dustGeo, dustMat);
    scene.add(dustPoints);

    // =========================================================================
    // ORBIT CONTROLS WITH DAMPING INERTIA + PARALLAX + RAYCASTER HOVER/CLICK
    // =========================================================================
    const raycaster = new THREE.Raycaster();
    const pointerNDC = new THREE.Vector2();

    let isDragging = false;
    let pointerDownPos = { x: 0, y: 0 };
    let prevX = 0;
    let prevY = 0;
    let targetRotY = 0.35;
    let targetRotX = 0.14;
    let parallaxX = 0;
    let parallaxY = 0;
    let hoveredMesh: THREE.Mesh | null = null;

    const domElem = renderer.domElement;

    const onPointerDown = (e: PointerEvent) => {
      isDragging = true;
      pointerDownPos = { x: e.clientX, y: e.clientY };
      prevX = e.clientX;
      prevY = e.clientY;
    };

    const onPointerMove = (e: PointerEvent) => {
      const rect = domElem.getBoundingClientRect();
      const normX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const normY = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      // Subtle cursor-tracking parallax tilt
      parallaxX = normX * 0.12;
      parallaxY = normY * 0.08;

      if (isDragging) {
        const dx = e.clientX - prevX;
        const dy = e.clientY - prevY;
        targetRotY += dx * 0.0065;
        targetRotX = Math.max(-0.75, Math.min(0.75, targetRotX + dy * 0.0065));
        prevX = e.clientX;
        prevY = e.clientY;
        return;
      }

      // Raycast hover detection on active mode's 3D nodes
      pointerNDC.set(normX, normY);
      raycaster.setFromCamera(pointerNDC, camera);
      const currentMode = heroModeRef.current;
      const activeTargets = interactiveMeshes.filter((m) => m.userData?.mode === currentMode);
      const hits = raycaster.intersectObjects(activeTargets, false);

      if (hits.length > 0) {
        const hitMesh = hits[0].object as THREE.Mesh;
        hoveredMesh = hitMesh;
        domElem.style.cursor = 'pointer';
        if (hitMesh.userData?.info) {
          setInspected3DNode(hitMesh.userData.info);
        }
      } else {
        hoveredMesh = null;
        domElem.style.cursor = 'grab';
      }
    };

    const onPointerUp = (e: PointerEvent) => {
      const moveDist = Math.hypot(e.clientX - pointerDownPos.x, e.clientY - pointerDownPos.y);
      isDragging = false;
      domElem.style.cursor = 'grab';

      // If it was a clean click (not a drag), check raycast hit
      if (moveDist < 6) {
        const rect = domElem.getBoundingClientRect();
        pointerNDC.set(
          ((e.clientX - rect.left) / rect.width) * 2 - 1,
          -((e.clientY - rect.top) / rect.height) * 2 + 1
        );
        raycaster.setFromCamera(pointerNDC, camera);
        const currentMode = heroModeRef.current;
        const activeTargets = interactiveMeshes.filter((m) => m.userData?.mode === currentMode);
        const hits = raycaster.intersectObjects(activeTargets, false);
        if (hits.length > 0) {
          const hitMesh = hits[0].object as THREE.Mesh;
          if (hitMesh.userData?.info) {
            setInspected3DNode(hitMesh.userData.info);
          }
        }
      }
    };

    domElem.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    let reqId: number;
    let clockTime = 0;

    const animate = () => {
      reqId = requestAnimationFrame(animate);
      clockTime += 0.016;

      const currentMode = heroModeRef.current;
      convergenceGroup.visible = currentMode === 'convergence';
      helixGroup.visible = currentMode === 'helix';
      microGroup.visible = currentMode === 'microenvironment';

      if (!isDragging && isSpinningRef.current) {
        targetRotY += 0.0024;
      }

      // Smooth camera/stage inertia damping + cursor parallax
      const desiredY = targetRotY + parallaxX;
      const desiredX = targetRotX - parallaxY;
      masterGroup.rotation.y += (desiredY - masterGroup.rotation.y) * 0.075;
      masterGroup.rotation.x += (desiredX - masterGroup.rotation.x) * 0.075;

      // Mode 1: Convergence animations
      if (currentMode === 'convergence') {
        const pulse = 1 + Math.sin(clockTime * 2.5) * 0.045;
        coreMesh.scale.set(pulse, pulse, pulse);
        auraMesh.scale.set(1 + Math.sin(clockTime * 2.5 - 0.5) * 0.07, 1 + Math.sin(clockTime * 2.5 - 0.5) * 0.07, 1 + Math.sin(clockTime * 2.5 - 0.5) * 0.07);
        cageMesh.rotation.y -= 0.0035;
        cageMesh.rotation.z += 0.0025;

        const activeStream = selectedStreamRef.current;
        convergenceRings.forEach((re) => {
          if (isSpinningRef.current) {
            re.group.rotation.y += re.speed * 0.012;
          }
          const isHighlighted = activeStream === 'all' || activeStream === re.id;
          const targetOpacity = isHighlighted ? (activeStream === re.id ? 0.88 : 0.48) : 0.12;
          re.torusMat.opacity += (targetOpacity - re.torusMat.opacity) * 0.1;
          re.nodeMat.emissiveIntensity = isHighlighted && activeStream === re.id ? 0.35 : 0.1;
        });

        bezierParticles.forEach((bp) => {
          if (isSpinningRef.current) {
            bp.t += bp.speed;
            if (bp.t > 1) bp.t = 0;
          }
          const pt = bp.curve.getPoint(bp.t);
          bp.mesh.position.copy(pt);
        });
      }

      // Mode 2: Molecular Epigenetic Helix animations
      if (currentMode === 'helix') {
        helixPulseMeshes.forEach((hm, idx) => {
          const isHovered = hoveredMesh === hm;
          const s = isHovered ? 1.38 : 1 + Math.sin(clockTime * 3 + idx) * 0.1;
          hm.scale.set(s, s, s);
          hm.rotation.y += 0.02;
        });
      }

      // Mode 3: Biomarker Tumor Microenvironment animations
      if (currentMode === 'microenvironment') {
        microMeshList.forEach((mm, idx) => {
          const isHovered = hoveredMesh === mm;
          const s = isHovered ? 1.32 : 1 + Math.sin(clockTime * 2.2 + idx * 0.8) * 0.06;
          mm.scale.set(s, s, s);
        });

        synapticPulses.forEach((sp) => {
          if (isSpinningRef.current) {
            sp.t += sp.speed;
            if (sp.t > 1) sp.t = 0;
          }
          sp.mesh.position.lerpVectors(sp.pStart, sp.pEnd, sp.t);
        });
      }

      dustPoints.rotation.y = clockTime * 0.018;

      renderer.render(scene, camera);
    };

    animate();

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = entry.contentRect.width;
        const h = entry.contentRect.height;
        if (w > 0 && h > 0) {
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h);
          updateMasterOffset(w);
        }
      }
    });
    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(reqId);
      resizeObserver.disconnect();
      domElem.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      renderer.dispose();
    };
  }, []);

  const plainEnglishConcepts = [
    {
      title: 'Ranking Accuracy (Harrell’s C-Index)',
      badge: '0.50 Coin Flip → 1.00 Perfect Order',
      summary:
        'Measures whether patients with higher predicted risk scores actually experience earlier clinical events.',
      detail:
        'Clinical staging alone achieves a 0.634 C-index. By fusing clinical data with mRNA, microRNA, and DNA methylation, OncoFusion reaches 0.785 (+15.1% gain).',
      accent: 'text-[#A6634B] bg-[#F6EDE9] border-[#A6634B]/30',
    },
    {
      title: 'Incomplete Follow-Up (Right-Censoring)',
      badge: 'Patient Still Alive at Study Close',
      summary:
        'Honors partial patient timelines when a clinical study ends while the patient is still healthy and active.',
      detail:
        'Ordinary machine learning fails when follow-up times are incomplete. Survival models evaluate active risk sets at every milestone without discarding living patients.',
      accent: 'text-[#5B7065] bg-[#EEF2F0] border-[#5B7065]/30',
    },
    {
      title: 'Relative Risk Multiplier (Hazard Ratio)',
      badge: 'Instantaneous Progression Speed',
      summary:
        'Compares a patient’s immediate risk rate against the median pan-cancer baseline.',
      detail:
        'A 2.0x multiplier means disease progression occurs at twice the average speed, whereas a 0.65x protective multiplier indicates strong immune or epigenetic defense.',
      accent: 'text-[#8C7B6B] bg-[#FAF7F2] border-[#E6E1D6]',
    },
  ];

  const tabLaunchers: {
    id: ActiveTab;
    badge: string;
    title: string;
    subtitle: string;
    description: string;
    icon: React.ElementType;
    accentColor: string;
    previewType: 'benchmark' | 'comparison' | 'fusion' | 'km' | 'network' | 'milestones';
  }[] = [
    {
      id: 'benchmark',
      badge: 'C-Index 0.785',
      title: 'Pan-Cancer Benchmark',
      subtitle: 'Head-to-head model comparison & C-index scores',
      description:
        'Compare 10 single-modality baselines and multimodal architectures across 8 TCGA cohorts, plus inspect top-contributing biomarker rankings.',
      icon: Activity,
      accentColor: '#A6634B',
      previewType: 'benchmark',
    },
    {
      id: 'model_comparison',
      badge: '5 Model Families',
      title: 'Model Comparison',
      subtitle: 'Cox, DeepSurv, RSF, and MKL evaluation',
      description:
        'Toggle up to 3 survival models side-by-side to compare ranking accuracy (C-index), probability calibration (Brier score), and 1/3/5-year AUCs.',
      icon: GitCompare,
      accentColor: '#5B7065',
      previewType: 'comparison',
    },
    {
      id: 'fusion',
      badge: 'Live Synergy',
      title: '3D Fusion & Weights',
      subtitle: 'Interactive modality weight balancers & 3D convergence core',
      description:
        'Adjust real-time sliders for Clinical, mRNA, microRNA, Methylation, and Pathology layers to observe immediate shifts in simulated C-index performance.',
      icon: Layers,
      accentColor: '#8C7B6B',
      previewType: 'fusion',
    },
    {
      id: 'kaplan_meier',
      badge: 'Log-Rank p < 0.0001',
      title: 'Kaplan-Meier Curves',
      subtitle: 'Publication-grade survival trajectory graphs',
      description:
        'Visualize step-function survival trajectories with 95% confidence bands, censored patient ticks (+), dynamic percentile cutoffs, and Numbers-at-Risk tables.',
      icon: TrendingDown,
      accentColor: '#A6634B',
      previewType: 'km',
    },
    {
      id: 'cohort',
      badge: '3D Graph + 112 Patients',
      title: 'Patient Explorer',
      subtitle: 'Interactive 3D molecular networks & patient cohorts',
      description:
        'Orbit a floating 3D biomarker network separating adverse drivers from protective immune factors, or search individual TCGA patient dossiers.',
      icon: Users,
      accentColor: '#5B7065',
      previewType: 'network',
    },
    {
      id: 'calculator',
      badge: '1, 3 & 5-Yr Horizons',
      title: 'Risk & Milestones',
      subtitle: 'Individual 1, 3, and 5-year survival probability simulators',
      description:
        'Simulate individual patient prognosis with tactile 1-year, 3-year, and 5-year milestone timeline buttons and clinical archetype presets.',
      icon: Calculator,
      accentColor: '#7C6578',
      previewType: 'milestones',
    },
  ];

  return (
    <div className="space-y-10">
      {/* 1. UPGRADED NEXT-LEVEL 3D THREE.JS LANDING HERO */}
      <section className="relative w-full min-h-[630px] lg:min-h-[660px] rounded-3xl overflow-hidden border border-[#E6E1D6] bg-[#F5F0E6] shadow-xs flex flex-col justify-between">
        {/* Full-Bleed Responsive Three.js WebGL Canvas Background */}
        <div
          ref={canvasContainerRef}
          className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing z-0"
          aria-label="Interactive 3D Multi-Omics Showcase Canvas"
        />

        {/* Top Floating Controls: Multi-Model 3D Mode Selector Pill Bar */}
        <div className="relative z-10 p-4 sm:p-6 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
          {/* Multi-Model Interactive Mode Selector */}
          <div
            className="pointer-events-auto flex flex-wrap items-center gap-1.5 bg-white/92 backdrop-blur-md border border-[#E6E1D6] p-1.5 rounded-2xl shadow-xs"
            role="tablist"
            aria-label="3D Visualization Mode Selector"
          >
            <span className="text-[11px] font-semibold text-[#78716C] px-2.5 hidden xl:inline">
              3D Showcase Mode:
            </span>

            <button
              role="tab"
              aria-selected={heroMode === 'convergence'}
              onClick={() => setHeroMode('convergence')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                heroMode === 'convergence'
                  ? 'bg-[#A6634B] text-white font-semibold shadow-2xs'
                  : 'text-[#2D2926] hover:bg-[#FAF7F2]'
              }`}
            >
              <Orbit className="w-3.5 h-3.5" />
              <span>1. Multimodal Convergence Core</span>
            </button>

            <button
              role="tab"
              aria-selected={heroMode === 'helix'}
              onClick={() => setHeroMode('helix')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                heroMode === 'helix'
                  ? 'bg-[#A6634B] text-white font-semibold shadow-2xs'
                  : 'text-[#2D2926] hover:bg-[#FAF7F2]'
              }`}
            >
              <Dna className="w-3.5 h-3.5" />
              <span>2. Molecular Epigenetic Helix</span>
            </button>

            <button
              role="tab"
              aria-selected={heroMode === 'microenvironment'}
              onClick={() => setHeroMode('microenvironment')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                heroMode === 'microenvironment'
                  ? 'bg-[#A6634B] text-white font-semibold shadow-2xs'
                  : 'text-[#2D2926] hover:bg-[#FAF7F2]'
              }`}
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>3. Biomarker Microenvironment</span>
            </button>
          </div>

          {/* Right Top Pill: Stream Filter (in Convergence Mode) + Spin Toggle */}
          <div className="pointer-events-auto flex items-center gap-1.5 bg-white/92 backdrop-blur-md border border-[#E6E1D6] p-1.5 rounded-2xl shadow-xs">
            {heroMode === 'convergence' && (
              <>
                <button
                  onClick={() => setSelectedStream('all')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    selectedStream === 'all'
                      ? 'bg-[#2D2926] text-white font-semibold'
                      : 'text-[#78716C] hover:text-[#2D2926]'
                  }`}
                >
                  All Streams
                </button>
                {OMICS_STREAMS.map((stream) => (
                  <button
                    key={stream.id}
                    onClick={() => setSelectedStream(stream.id)}
                    className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                      selectedStream === stream.id
                        ? 'bg-[#FAF7F2] text-[#2D2926] border border-[#A6634B]/40 font-semibold'
                        : 'text-[#78716C] hover:text-[#2D2926]'
                    }`}
                  >
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: stream.colorHex }}
                    />
                    <span>{stream.label.split(' ')[0]}</span>
                  </button>
                ))}
                <div className="h-4 w-[1px] bg-[#E6E1D6] mx-1 hidden md:block" />
              </>
            )}

            <button
              onClick={() => setIsSpinning((prev) => !prev)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-[#78716C] hover:text-[#2D2926] hover:bg-[#FAF7F2] cursor-pointer"
              title={isSpinning ? 'Pause 3D Animation' : 'Resume 3D Animation'}
            >
              {isSpinning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isSpinning ? 'Pause' : 'Spin'}</span>
            </button>
          </div>
        </div>

        {/* Center/Left Editorial Glass Overlay Card + Right Floating 3D Node Dossier */}
        <div className="relative z-10 px-4 sm:px-8 py-4 grid grid-cols-1 lg:grid-cols-12 gap-6 items-end pointer-events-none">
          <div className="lg:col-span-6 pointer-events-auto bg-white/92 backdrop-blur-md border border-[#E6E1D6] rounded-2xl p-6 sm:p-7 shadow-sm space-y-5">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#A6634B]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Precision Oncology Clinical Decision Support</span>
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl lg:text-[34px] font-bold text-[#2D2926] tracking-tight leading-[1.16]">
                Uniting Clinical Staging &amp; Molecular Signals into One Survival Forecast
              </h1>
              <p className="text-xs sm:text-sm text-[#78716C] leading-relaxed">
                Standard clinical staging only sees a tumor’s physical size. <strong>OncoFusion</strong> integrates clinical records with active gene instructions (<strong>mRNA</strong>), volume dials (<strong>microRNA</strong>), and epigenetic locks (<strong>DNA methylation</strong>) into a unified patient risk score—raising survival ranking accuracy from <strong>0.634</strong> to <strong>0.785</strong>.
              </p>
            </div>

            {/* Key Benchmark Stat Strip */}
            <div className="grid grid-cols-3 gap-2.5">
              <div className="bg-[#FAF7F2] border border-[#E6E1D6] rounded-xl p-3">
                <span className="text-[10px] uppercase tracking-wider text-[#78716C] font-semibold block">
                  Ranking Accuracy
                </span>
                <span className="font-serif text-xl sm:text-2xl font-bold text-[#2D2926] mt-0.5 block">
                  0.785
                </span>
                <span className="text-[10px] text-[#5B7065] font-semibold">
                  +15.1% vs Clinical
                </span>
              </div>

              <div className="bg-[#FAF7F2] border border-[#E6E1D6] rounded-xl p-3">
                <span className="text-[10px] uppercase tracking-wider text-[#78716C] font-semibold block">
                  Calibration Error
                </span>
                <span className="font-serif text-xl sm:text-2xl font-bold text-[#2D2926] mt-0.5 block">
                  0.138
                </span>
                <span className="text-[10px] text-[#78716C]">
                  Brier Score (Lower=Better)
                </span>
              </div>

              <div className="bg-[#FAF7F2] border border-[#E6E1D6] rounded-xl p-3">
                <span className="text-[10px] uppercase tracking-wider text-[#78716C] font-semibold block">
                  Risk Separation
                </span>
                <span className="font-serif text-xl sm:text-2xl font-bold text-[#A6634B] mt-0.5 block">
                  4.42x
                </span>
                <span className="text-[10px] text-[#78716C]">
                  Hazard Multiplier
                </span>
              </div>
            </div>

            {/* Quick Launch CTAs */}
            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <button
                onClick={() => onLaunchTab('benchmark')}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#A6634B] hover:bg-[#8E523D] text-white text-xs font-semibold transition-colors shadow-xs cursor-pointer"
              >
                <Activity className="w-3.5 h-3.5" />
                <span>Launch Workspace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => onLaunchTab('fusion')}
                className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] hover:bg-[#F5F0E6] text-[#2D2926] border border-[#E6E1D6] text-xs font-semibold transition-colors cursor-pointer"
              >
                <Sliders className="w-3.5 h-3.5 text-[#5B7065]" />
                <span>3D Weight Balancer</span>
              </button>

              <button
                onClick={() => onLaunchTab('calculator')}
                className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] hover:bg-[#F5F0E6] text-[#2D2926] border border-[#E6E1D6] text-xs font-semibold transition-colors cursor-pointer"
              >
                <Calculator className="w-3.5 h-3.5 text-[#A6634B]" />
                <span>1/3/5-Yr Simulator</span>
              </button>
            </div>
          </div>

          {/* Right Side Floating Interactive 3D Node Clinical Tooltip */}
          <div className="lg:col-span-6 flex flex-col items-end justify-end">
            <div className="pointer-events-auto max-w-sm w-full bg-white/92 backdrop-blur-md border border-[#E6E1D6] rounded-2xl p-4 shadow-sm space-y-2 transition-all">
              <div className="flex items-center justify-between gap-2">
                <span
                  className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full text-white"
                  style={{ backgroundColor: inspected3DNode.colorHex }}
                >
                  {inspected3DNode.category}
                </span>
                <span className="font-mono text-[11px] font-bold text-[#2D2926]">
                  {inspected3DNode.hazardText}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <h3 className="font-serif font-bold text-sm text-[#2D2926]">
                  {inspected3DNode.label}
                </h3>
                <span className="text-[10px] text-[#78716C]">Hover/Click 3D Nodes</span>
              </div>
              <p className="text-xs text-[#78716C] leading-relaxed">
                {inspected3DNode.plainNote}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Overlay Legend Bar */}
        <div className="relative z-10 p-4 sm:px-6 flex flex-wrap items-center justify-between gap-3 bg-white/88 backdrop-blur-md border-t border-[#E6E1D6] text-xs">
          <div className="flex flex-wrap items-center gap-4">
            <span className="font-semibold text-[#2D2926] flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#A6634B]" />
              <span>Adverse Risk / Methylation Lock (#A6634B)</span>
            </span>
            <span className="text-[#E6E1D6]">|</span>
            <span className="font-semibold text-[#2D2926] flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#5B7065]" />
              <span>Protective Immune / Active mRNA (#5B7065)</span>
            </span>
            <span className="text-[#E6E1D6] hidden sm:inline">|</span>
            <span className="text-[#78716C] hidden sm:inline">
              Mode:{' '}
              <strong className="text-[#2D2926]">
                {heroMode === 'convergence'
                  ? 'Multimodal Bezier Convergence'
                  : heroMode === 'helix'
                  ? '3D Epigenetic Double Helix'
                  : 'Tumor Microenvironment Network'}
              </strong>
            </span>
          </div>

          <span className="text-[11px] text-[#78716C] font-medium">
            Drag to orbit with inertia • Hover or click any 3D node for clinical notes
          </span>
        </div>
      </section>

      {/* 2. PLAIN-ENGLISH EXPLAINER & ANIMATIC VISUAL BADGES */}
      <section className="bg-white border border-[#E6E1D6] rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#E6E1D6] pb-5">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#A6634B] mb-1">
              <Info className="w-3.5 h-3.5" />
              <span>Plain-English Multimodal Explainer</span>
            </div>
            <h2 className="font-serif text-2xl font-bold text-[#2D2926]">
              How Disparate Medical Data Becomes One Prognostic Score
            </h2>
          </div>
          <p className="text-xs text-[#78716C] max-w-md leading-relaxed">
            Click any biological badge below to isolate its stream in the 3D Convergence Core above and see how each layer contributes to survival forecasting.
          </p>
        </div>

        {/* Animatic 4-Stream -> Intermediate Fusion -> Risk Score Pipeline */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {OMICS_STREAMS.map((stream) => {
            const isSelected = heroMode === 'convergence' && selectedStream === stream.id;
            return (
              <div
                key={stream.id}
                onClick={() => {
                  setHeroMode('convergence');
                  setSelectedStream(isSelected ? 'all' : stream.id);
                }}
                className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-4 ${
                  isSelected
                    ? 'bg-[#FAF7F2] border-[#A6634B] ring-1 ring-[#A6634B]/30 shadow-xs'
                    : 'bg-[#FAF7F2]/60 border-[#E6E1D6] hover:bg-[#FAF7F2] hover:border-[#D6CFBE]'
                }`}
              >
                <div className="space-y-2.5">
                  {/* Animatic Visual Badge */}
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-white shadow-2xs"
                      style={{ backgroundColor: stream.colorHex }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                      {stream.analogyBadge}
                    </span>
                    <span className="font-mono text-[11px] font-bold text-[#2D2926]">
                      C: {stream.cIndexAlone}
                    </span>
                  </div>

                  <h3 className="font-serif font-bold text-base text-[#2D2926]">
                    {stream.label}
                  </h3>
                  <p className="text-xs text-[#78716C] leading-relaxed">
                    {stream.plainDescription}
                  </p>
                </div>

                {/* Animated Signal Bar & Example Markers */}
                <div className="space-y-2 pt-2 border-t border-[#E6E1D6]">
                  <div className="flex items-center justify-between text-[10px] text-[#78716C]">
                    <span>Key Signals</span>
                    <span className="font-mono font-semibold text-[#A6634B]">
                      {isSelected ? 'Highlighted in 3D' : 'Click to Focus'}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {stream.exampleBiomarkers.slice(0, 2).map((marker) => (
                      <span
                        key={marker}
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-white border border-[#E6E1D6] text-[#2D2926]"
                      >
                        {marker}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Plain-English Biostatistics Glossary Strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {plainEnglishConcepts.map((concept, idx) => {
            const isOpen = activeConceptIdx === idx;
            return (
              <div
                key={concept.title}
                onClick={() => setActiveConceptIdx(idx)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  isOpen
                    ? 'bg-white border-[#A6634B]/40 shadow-xs'
                    : 'bg-[#FAF7F2] border-[#E6E1D6] hover:bg-white'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span
                    className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${concept.accent}`}
                  >
                    {concept.badge}
                  </span>
                  <CheckCircle2
                    className={`w-3.5 h-3.5 ${
                      isOpen ? 'text-[#A6634B]' : 'text-[#E6E1D6]'
                    }`}
                  />
                </div>
                <h4 className="font-serif font-bold text-sm text-[#2D2926]">
                  {concept.title}
                </h4>
                <p className="text-xs text-[#78716C] mt-1 leading-relaxed">
                  {concept.summary}
                </p>
                <p className="text-[11px] text-[#2D2926] mt-2 pt-2 border-t border-[#E6E1D6]/80 leading-relaxed">
                  {concept.detail}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. ONE-CLICK CONSTRUCTIVE TAB LAUNCHERS */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 px-1">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#A6634B] block">
              Direct Workspace Navigation
            </span>
            <h2 className="font-serif text-2xl font-bold text-[#2D2926]">
              Explore Interactive Precision Oncology Modules
            </h2>
          </div>
          <p className="text-xs text-[#78716C]">
            Click any card below to launch its dedicated module and reveal the full workspace navigation bar.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {tabLaunchers.map((card) => {
            const Icon = card.icon;
            return (
              <button
                key={card.id}
                onClick={() => onLaunchTab(card.id)}
                className="group text-left bg-white hover:bg-[#FAF7F2] border border-[#E6E1D6] hover:border-[#A6634B]/50 rounded-2xl p-6 shadow-xs transition-all flex flex-col justify-between cursor-pointer"
              >
                <div className="space-y-4">
                  {/* Top Icon & Metric Badge */}
                  <div className="flex items-center justify-between gap-2">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center border border-[#E6E1D6] bg-[#FAF7F2] group-hover:scale-105 transition-transform"
                      style={{ color: card.accentColor }}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="font-mono text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-[#FAF7F2] border border-[#E6E1D6] text-[#2D2926]">
                      {card.badge}
                    </span>
                  </div>

                  {/* Title & Subtitle */}
                  <div>
                    <h3 className="font-serif font-bold text-lg text-[#2D2926] group-hover:text-[#A6634B] transition-colors">
                      {card.title}
                    </h3>
                    <p className="text-xs font-medium text-[#A6634B] mt-0.5">
                      {card.subtitle}
                    </p>
                  </div>

                  {/* Mini Visual Preview Graphic inside Card */}
                  <div className="bg-[#FAF7F2] border border-[#E6E1D6] rounded-xl p-3">
                    {card.previewType === 'benchmark' && (
                      <div className="space-y-1.5 text-[10px] font-mono">
                        <div className="flex items-center justify-between">
                          <span className="text-[#2D2926] font-semibold">Multimodal Deep Fusion</span>
                          <span className="text-[#A6634B] font-bold">0.785</span>
                        </div>
                        <div className="h-1.5 bg-[#E6E1D6] rounded-full overflow-hidden">
                          <div className="h-full bg-[#A6634B] rounded-full w-[86%]" />
                        </div>
                        <div className="flex items-center justify-between pt-0.5">
                          <span className="text-[#78716C]">Clinical Baseline (Cox)</span>
                          <span className="text-[#78716C]">0.634</span>
                        </div>
                        <div className="h-1.5 bg-[#E6E1D6] rounded-full overflow-hidden">
                          <div className="h-full bg-[#8C7B6B] rounded-full w-[52%]" />
                        </div>
                      </div>
                    )}

                    {card.previewType === 'comparison' && (
                      <div className="grid grid-cols-3 gap-1.5 text-center font-mono text-[10px]">
                        <div className="bg-white p-1.5 rounded border border-[#E6E1D6]">
                          <span className="text-[#78716C] block text-[9px]">Cox-PH</span>
                          <span className="font-bold text-[#2D2926]">0.634</span>
                        </div>
                        <div className="bg-[#F6EDE9] p-1.5 rounded border border-[#A6634B]/30">
                          <span className="text-[#A6634B] block text-[9px] font-bold">DeepSurv</span>
                          <span className="font-bold text-[#A6634B]">0.785</span>
                        </div>
                        <div className="bg-white p-1.5 rounded border border-[#E6E1D6]">
                          <span className="text-[#5B7065] block text-[9px]">RSF Tree</span>
                          <span className="font-bold text-[#2D2926]">0.752</span>
                        </div>
                      </div>
                    )}

                    {card.previewType === 'fusion' && (
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[10px] text-[#78716C]">
                          <span>Modality Synergy Blend</span>
                          <span className="font-mono font-bold text-[#5B7065]">mRNA 35% • Meth 20%</span>
                        </div>
                        <div className="h-2.5 w-full rounded-full overflow-hidden flex border border-[#E6E1D6]">
                          <div className="bg-[#8C7B6B] w-[20%]" />
                          <div className="bg-[#5B7065] w-[35%]" />
                          <div className="bg-[#7C6578] w-[15%]" />
                          <div className="bg-[#A6634B] w-[20%]" />
                          <div className="bg-[#2D2926] w-[10%]" />
                        </div>
                      </div>
                    )}

                    {card.previewType === 'km' && (
                      <div className="flex items-center justify-between gap-3">
                        <svg viewBox="0 0 120 36" className="w-28 h-8 overflow-visible">
                          <path
                            d="M 0 4 L 35 4 L 35 10 L 75 10 L 75 15 L 120 15"
                            fill="none"
                            stroke="#5B7065"
                            strokeWidth="2.2"
                          />
                          <path
                            d="M 0 4 L 20 4 L 20 16 L 50 16 L 50 26 L 85 26 L 85 33 L 120 33"
                            fill="none"
                            stroke="#A6634B"
                            strokeWidth="2.2"
                          />
                        </svg>
                        <div className="text-right font-mono text-[10px]">
                          <span className="text-[#5B7065] block font-bold">Low Risk</span>
                          <span className="text-[#A6634B] block font-bold">High Risk (5.0x)</span>
                        </div>
                      </div>
                    )}

                    {card.previewType === 'network' && (
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#F6EDE9] text-[#A6634B] font-mono font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#A6634B]" /> MKI67 • TP53
                        </span>
                        <span className="text-[#78716C]">↔</span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#EEF2F0] text-[#5B7065] font-mono font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#5B7065]" /> CD8A • MGMT
                        </span>
                      </div>
                    )}

                    {card.previewType === 'milestones' && (
                      <div className="grid grid-cols-3 gap-1.5 text-center font-mono text-[10px]">
                        <div className="bg-white p-1 rounded border border-[#E6E1D6]">
                          <span className="text-[#78716C] block text-[9px]">1-Yr</span>
                          <span className="font-bold text-[#5B7065]">91%</span>
                        </div>
                        <div className="bg-white p-1 rounded border border-[#A6634B]/40">
                          <span className="text-[#A6634B] block text-[9px] font-bold">3-Yr</span>
                          <span className="font-bold text-[#2D2926]">73%</span>
                        </div>
                        <div className="bg-white p-1 rounded border border-[#E6E1D6]">
                          <span className="text-[#78716C] block text-[9px]">5-Yr</span>
                          <span className="font-bold text-[#A6634B]">58%</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-xs text-[#78716C] leading-relaxed">
                    {card.description}
                  </p>
                </div>

                {/* Launch Footer */}
                <div className="pt-4 mt-4 border-t border-[#E6E1D6] flex items-center justify-between text-xs font-semibold text-[#A6634B]">
                  <span>Launch {card.title}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
};
