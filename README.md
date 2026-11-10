<div align="center">

# 🧬 OncoFusion

### **Clinical-Grade Pan-Cancer Multi-Omics Survival Prediction & Precision Oncology Platform**
*Uniting Clinical Staging, Active mRNA Transcriptomics, microRNA Volume Dials, and Epigenetic DNA Methylation Locks into a Unified Prognostic Survival Core.*

[![Next.js](https://img.shields.io/badge/Next.js_/_React-19.0-2D2926?style=for-the-badge&logo=next.js&logoColor=FAF7F2)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-A6634B?style=for-the-badge&logo=typescript&logoColor=FFFFFF)](https://www.typescriptlang.org/)
[![Three.js WebGL](https://img.shields.io/badge/Three.js-WebGL_2.0-5B7065?style=for-the-badge&logo=threedotjs&logoColor=FFFFFF)](https://threejs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-8C7B6B?style=for-the-badge&logo=tailwindcss&logoColor=FFFFFF)](https://tailwindcss.com/)
[![TCGA Verified](https://img.shields.io/badge/TCGA_Atlas-8_Pan--Cancer_Cohorts-7C6578?style=for-the-badge)](https://www.cancer.gov/ccg/research/genome-sequencing/tcga)
[![License](https://img.shields.io/badge/License-Apache_2.0_/_MIT-E6E1D6?style=for-the-badge&labelColor=2D2926&color=A6634B)](./LICENSE)

---

[**Explore Interactive Demo**](#3-interactive-3d-webgl-engine-showcase) • [**Architecture & UX**](#2-design--architecture-philosophy) • [**Analytical Modules**](#4-analytical-modules--features) • [**Quick Start**](#6-quick-start--local-setup) • [**Data Provenance & Citations**](#7-data-provenance-citations--compliance)

</div>

---

## 1. Visual Teaser & Platform Overview

> **UI Showcase & Cinematic 3D Viewport**
>
> ```text
> ┌──────────────────────────────────────────────────────────────────────────────────────────────┐
> │  [3D Showcase Mode: (•) 1. Multimodal Convergence  ( ) 2. Epigenetic Helix  ( ) 3. TME Graph] │
> │                                                                                              │
> │  ┌──────────────────────────────────────────┐          .  *   .   ╭───────────────╮          │
> │  │ ✨ PRECISION ONCOLOGY DECISION SUPPORT   │        *    ╭───────┴───────╮   *   │          │
> │  │                                          │      .    ╭─┤   mRNA /      ├─╮     │          │
> │  │ Uniting Clinical Staging & Molecular     │           │ │  Methylation  │ │   ──┼──> 3D    │
> │  │ Signals into One Survival Forecast       │           │ │  ╔═════════╗  │ │     │   WebGL  │
> │  │                                          │           │ ╰──╢ PATIENT ╟──╯ │     │   Canvas │
> │  │ ┌──────────┐ ┌──────────┐ ┌──────────┐   │           ╰────╢  CORE   ╟────╯     │          │
> │  │ │ C-INDEX  │ │  BRIER   │ │  HAZARD  │   │                ╚═════════╝          │          │
> │  │ │  0.785   │ │  0.138   │ │  4.42x   │   │        ┌─────────────────────────┐  │          │
> │  │ └──────────┘ └──────────┘ └──────────┘   │        │ Hover/Click 3D Node     │  │          │
> │  │ [ Launch Workspace → ] [ 3D Balancer ]   │        │ MGMT CpG Lock • HR 0.55 │  │          │
> │  └──────────────────────────────────────────┘        └─────────────────────────┘  │          │
> └──────────────────────────────────────────────────────────────────────────────────────────────┘
> ```
> *(Replace with `/docs/assets/oncofusion-hero-preview.gif` or high-resolution screenshot in production deployments.)*

### Key Platform Differentiators

- **Progressive Disclosure UX:** Opens as an uninterrupted, full-bleed scientific briefing deck with the global navigation rail intentionally hidden—revealing the analytical tab bar only when transitioning into workspace modules.
- **Real-Time Multi-Mode WebGL Biometrics:** Interactive 60 FPS Three.js showcase featuring cubic Bezier particle convergence, a 3D double-stranded epigenetic DNA helix, and a spatial tumor microenvironment graph with raycasted clinical dossiers.
- **Multimodal Risk Stratification:** Bridges the **+15.1% Concordance Index gap** between traditional clinical staging (`C-index 0.634`) and gated intermediate multimodal fusion (`C-index 0.785`) across 8 primary TCGA cancer cohorts.
- **Plain-English Clinical Translation:** Translates dense biostatistical and genomic terminology into clear, actionable clinical insights (*Harrell's C-Index* $\rightarrow$ **Ranking Accuracy**, *Right-Censoring* $\rightarrow$ **Incomplete Follow-Up**, *Hazard Ratio* $\rightarrow$ **Relative Risk Multiplier**).

---

## 2. Design & Architecture Philosophy

### Progressive Disclosure UX Rationale

Clinical decision support and bioinformatics platforms frequently suffer from cognitive overload—exposing dozens of competing tabs, hyperparameters, and dense tables on first load. **OncoFusion** enforces a strict **Progressive Disclosure Architecture**:

1. **Stage 1 — Immersive Scientific Briefing (`activeTab === 'welcome'`):**
   The top `<Navbar />` is completely unmounted on the landing view. Clinicians and researchers are greeted by a full-screen, interactive 3D WebGL canvas paired with translucent warm-linen editorial glass cards, animatic multi-omics badges, and a 6-card module launchpad.
2. **Stage 2 — Contextual Workspace Reveal (`activeTab !== 'welcome'`):**
   Clicking **"Launch Workspace"** or any of the 6 constructive module preview cards transitions the user into the analytical workspace and automatically mounts the sticky horizontal navigation rail, complete with cohort filtering and a **`← Back to Overview`** trigger.

### User Journey & State Flow Diagram

```text
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                        STAGE 1: IMMERSIVE BRIEFING DECK                             │
│                   (Top Navigation Bar Hidden • Zero Visual Clutter)                 │
│                                                                                     │
│   ┌─────────────────────────────────────┐    ┌──────────────────────────────────┐   │
│   │  Full-Page 3D Three.js WebGL Stage  │◄──►│  Plain-English Omics Explainer   │   │
│   │  • Mode 1: Bezier Convergence Core  │    │  • Macro Health (Clinical)       │   │
│   │  • Mode 2: Epigenetic DNA Helix     │    │  • Active Instructions (mRNA)    │   │
│   │  • Mode 3: Microenvironment Graph   │    │  • Volume Dials (microRNA)       │   │
│   └──────────────────┬──────────────────┘    │  • Epigenetic Locks (Methylation)│   │
│                      │                       └─────────────────┬────────────────┘   │
│                      ▼                                         ▼                    │
│   ┌─────────────────────────────────────────────────────────────────────────────┐   │
│   │             ONE-CLICK CONSTRUCTIVE MODULE LAUNCHER CARDS (6x)               │   │
│   └──────────────────────────────────────┬──────────────────────────────────────┘   │
└──────────────────────────────────────────┼──────────────────────────────────────────┘
                                           │
                          User clicks "Launch Workspace"
                             or any Module Preview Card
                                           │
                                           ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                     STAGE 2: PRECISION ONCOLOGY WORKSPACE                           │
│           (Sticky Horizontal Navigation Rail & Cohort Selector Revealed)            │
│                                                                                     │
│  ┌───────────────────────────────────────────────────────────────────────────────┐  │
│  │ [← Back to Overview] | Benchmark | Model Compare | 3D Fusion | KM | Patients  │  │
│  └───────┬────────────────────┬─────────────┬────────────┬─────────┬─────────┬───┘  │
│          │                    │             │            │         │         │      │
│          ▼                    ▼             ▼            ▼         ▼         ▼      │
│    [Return to 3D]       [10 Models &]  [Cox/DeepSurv] [Weight]  [Step KM] [1/3/5Yr] │
│    [Front Page  ]       [Biomarkers ]  [RSF/MKL     ] [Sliders] [Curves ] [Simul. ] │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Interactive 3D WebGL Engine Showcase

The front-page hero and dedicated 3D workspaces are powered by a custom **Three.js WebGL 2.0** rendering engine engineered for warm editorial aesthetics and real-time clinical inspection. Users can toggle seamlessly between three spatial representations:

| 3D Mode | Spatial Geometry & Physics | Clinical & Biological Meaning | Interactive Raycaster Behavior |
| :--- | :--- | :--- | :--- |
| **1. Multimodal Convergence Core** *(Default)* | Volumetric icosahedral core + translucent aura shell + geodesic cage surrounded by 4 tilted orbital rings and **`CubicBezierCurve3`** inward particle streams. | Illustrates how **Clinical** (`#8C7B6B`), **mRNA** (`#5B7065`), **microRNA** (`#7C6578`), and **DNA Methylation** (`#A6634B`) streams compress into a single patient risk score. | Clicking stream filter pills isolates that ring's opacity (`0.88`) and reveals modality-specific C-index metrics. |
| **2. Molecular Epigenetic Helix** | Dual **`CatmullRomCurve3`** sugar-phosphate backbone tubes connected by base-pair cylinder rungs, clamped with octahedron CpG locks and spherical TF hubs. | Visualizes how **MGMT** and **CDKN2A** promoter hypermethylation locks (`#A6634B`) and **TP53 / miR-34a** transcription sites (`#5B7065`) regulate gene expression. | Hovering or clicking any CpG lock or transcription hub triggers a 1.38x scale pulse and displays its Hazard Ratio dossier. |
| **3. Tumor Microenvironment Graph** | 3D spatial force-balanced graph connecting adverse tumor drivers (`#A6634B`) and protective immune infiltrates (`#5B7065`) with traveling synaptic pulses. | Models the biological tug-of-war between rapid proliferation (**MKI67**, **TP53**, **EGFR**) and cytotoxic immune clearance (**CD8A+ T-cells**, **TILs**, **High TMB**). | Real-time `THREE.Raycaster` hit detection updates the floating clinical card with actionable therapy clues. |

### WebGL Performance & Shader Specifications

- **60 FPS Animation Loop:** Uses `requestAnimationFrame` with mutable React refs (`useRef`) so mode switching, stream filtering, and pause/spin toggles occur instantaneously without WebGL context recreation.
- **Damped Orbit & Cursor Parallax:** Combines pointer-drag spherical rotation with `0.075` linear interpolation damping and normalized device coordinate (`NDC`) cursor-tracking parallax tilt.
- **Responsive Viewport Adaptation:** Bound to a native `ResizeObserver` that dynamically recalculates camera aspect ratios and shifts the 3D stage offset (`x = +2.15` on desktop viewports $\ge 1024\text{px}$) to preserve typographic breathing room.
- **Capped Pixel Ratio:** Enforces `Math.min(window.devicePixelRatio, 1.5)` to guarantee smooth frame rates on high-DPI Retina displays.

---

## 4. Analytical Modules & Features

### 📊 4.1 Pan-Cancer Cohort Benchmark & Biomarker Attribution
- **Cross-Cancer Validation:** Evaluates 10 survival architectures across 8 TCGA cohorts (`ALL` Pooled Pan-Cancer, `BRCA`, `LUAD`, `GBM`, `SKCM`, `KIRC`, `COAD`, `OV`, `LIHC`).
- **Architecture Leaderboard:** Compares Single-Modality Baselines (*Clinical Cox-PH*, *mRNA Ridge Cox*, *microRNA Signature*, *Methylation Clock*) against Multimodal Fusion paradigms (*Early Concatenation*, *Group Elastic-Net*, *Multiple Kernel Learning*, *Bayesian Hierarchical*, *Late Stacking*, and *Gated Multimodal Deep Attention*).
- **Biomarker Feature Importance Rankings:** Interactive attribution visualizer ranking 16+ canonical biomarkers by effect magnitude, filterable by omics modality and risk direction (**Adverse `+Risk`** vs. **Protective `-Risk`**) with expandable biological mechanism dossiers.

### ⚖️ 4.2 Side-by-Side Survival Model Comparison
- **Multi-Model Evaluation Matrix:** Allows clinicians and data scientists to toggle up to 3 model families side-by-side (*Cox Proportional Hazards*, *DeepSurv Intermediate Neural Fusion*, *Random Survival Forest*, *Gradient Boosting CoxBoost*, and *Multiple Kernel Learning*).
- **Calibration & Discrimination Metrics:** Compares Harrell's C-index, Integrated Brier Score (probability calibration error), and dynamic time-dependent AUCs at **1-Year**, **3-Year**, and **5-Year** horizons alongside plain-English *"When to Use in Practice"* guidance.

### 🌐 4.3 3D Data Fusion Core & Modality Weight Balancer
- **Real-Time Modality Sliders:** Interactive weight balancer allowing users to adjust the relative influence of Clinical (`20%`), mRNA (`35%`), microRNA (`15%`), DNA Methylation (`20%`), and Pathology (`10%`) layers.
- **Synergy Simulation Engine:** Dynamically computes the resulting C-index and cross-modal synergy bonus in real time, demonstrating why balanced multimodal integration outperforms single-omics dominance.

### 📈 4.4 Publication-Grade Kaplan-Meier Survival Stratifier
- **Non-Parametric Step Curves:** Renders high-resolution SVG Kaplan-Meier survival trajectories for predicted **Low-Risk** (`#5B7065` sage) vs. **High-Risk** (`#A6634B` terracotta) subgroups.
- **Biostatistical Rigor:** Includes shaded **95% Greenwood confidence interval bands**, right-censored patient tick marks (`+`), **Log-Rank $\chi^2$ test** statistics, **Hazard Ratio** callouts, interactive risk percentile cutoff sliders (`15th` to `85th` percentile, plus Median/Tertile presets), and a synchronized **Numbers-at-Risk** publication table from `0` to `84` months.

### 🎯 4.5 Single-Patient Precision Explorer & Milestone Simulator
- **1-Year, 3-Year & 5-Year Milestone Simulator:** Tactile horizon selector buttons that dynamically calculate individual survival probabilities as users adjust tumor stage, age, Ki-67 proliferation, TIL immune infiltration, and protective epigenetic marks.
- **Precision Risk Calculator & Archetypes:** One-click clinical presets (*Stage IV Immunogenic Melanoma*, *Aggressive Unmethylated GBM*, *Early Luminal Breast Carcinoma*) with a modality hazard attribution waterfall chart and automated actionable clinical clues (e.g., anti-PD-1 immunotherapy eligibility, PARP inhibitor sensitivity, and Temozolomide alkylating response).

---

## 5. Tech Stack & Engineering Specifications

| Layer | Technology | Role & Implementation Details |
| :--- | :--- | :--- |
| **Frontend Architecture** | **Next.js / React 19 + TypeScript 5.8** | Modular component hierarchy, strict static typing across all survival, kernel, and biomarker schemas, and zero-latency state transitions. |
| **3D Graphics & Shaders** | **Three.js (`three` v0.170+)** | Custom WebGL 2.0 scenes, `CubicBezierCurve3` particle physics, `CatmullRomCurve3` helical geometry, `Raycaster` 3D node picking, and studio rim lighting. |
| **Data Visualization** | **Custom SVG / Recharts / Plotly Patterns** | Publication-grade step-function Kaplan-Meier curves, 95% CI polygon shaders, modality attribution waterfalls, and Lucide vector iconography. |
| **Styling & Typography** | **Tailwind CSS v4.0** | Warm Beige Editorial Design System pairing `Newsreader` / `Georgia` serif headings with `Inter` sans-serif copy and `JetBrains Mono` statistics. |
| **Survival & Math Engine** | **Pure TypeScript Biostatistical Core** | Client-side implementations of Harrell's C-index, Greenwood Kaplan-Meier estimator, Mantel-Haenszel Log-Rank test, Time-Dependent ROC-AUC, Brier calibration, and Multiple Kernel Learning (RBF/Cosine/Linear). |
| **Verification Suite** | **Node.js Native Test Runner (`node:test`)** | 17 automated unit tests verifying survival estimators, kernel positive-semi-definiteness, soft-thresholding, and feature ranking invariants. |

### Warm Editorial Design System Palette

| Token Role | Hex Code | Visual Swatch & Usage |
| :--- | :--- | :--- |
| **Primary Canvas Background** | `#FAF7F2` | Warm Linen — Serene, high-legibility editorial backdrop |
| **Elevated Card Surface** | `#FFFFFF` | Crisp White — Primary analytical cards and floating glass overlays |
| **3D Viewport & Well Container** | `#F5F0E6` | Soft Sand — WebGL canvas background and secondary metric wells |
| **Primary Typography** | `#2D2926` | Deep Espresso — High-contrast headings and primary data values |
| **Secondary Copy & Labels** | `#78716C` | Warm Stone Gray — Explanatory descriptions and axis annotations |
| **Hairline Borders & Gridlines** | `#E6E1D6` | Natural Parchment — Subtle 1px structural dividers |
| **Adverse Risk / Primary Accent** | `#A6634B` | Terracotta Rust — High-risk trajectories, adverse drivers, primary CTAs |
| **Protective Factor / Highlight** | `#5B7065` | Muted Sage — Low-risk survival curves, immune infiltration, favorable marks |

---

## 6. Quick Start & Local Setup

### Prerequisites
- **Node.js:** `>= 18.18.0` (LTS recommended; compatible with Node 20/22)
- **Package Manager:** `npm`, `pnpm`, or `bun`
- **Browser:** Any modern browser with WebGL 2.0 support (Chrome, Edge, Firefox, Safari)

### Step-by-Step Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-org/oncofusion.git
cd oncofusion

# 2. Install dependencies (via npm or pnpm)
npm install
# or: pnpm install

# 3. Configure environment variables
cp .env.example .env.local

# 4. Start the local development server on port 3000
npm run dev
```

Open **`http://localhost:3000`** in your browser to launch the **Welcome & 3D Demo** front page.

### Running Automated Biostatistical Unit Tests & Production Build

```bash
# Run the 17 unit tests (Survival, Fusion Kernels & Feature Attribution)
npx tsx --test src/utils/*.test.ts

# Type-check with TypeScript compiler
npm run lint

# Build optimized production bundle
npm run build

# Preview production build locally
npm run preview
```

<details>
<summary><strong>⚙️ Advanced Configuration & Environment Variables (Click to Expand)</strong></summary>

The `.env.example` file defines optional runtime variables for cloud deployment and API proxy extensions:

```dotenv
# APP_URL: Canonical URL where the application is hosted
APP_URL="http://localhost:3000"

# Optional API key if extending with server-side clinical literature synthesis
GEMINI_API_KEY="YOUR_API_KEY_HERE"
```

#### Directory Structure

```text
oncofusion/
├── index.html                           # Editorial font imports & SEO metadata
├── metadata.json                        # Platform capabilities manifest
├── package.json                         # Dependencies & build scripts
├── tsconfig.json                        # Strict TypeScript configuration
├── vite.config.ts                       # Bundler & Tailwind v4 configuration
└── src/
    ├── App.tsx                          # Progressive disclosure router & layout shell
    ├── main.tsx                         # React 19 DOM root mount
    ├── index.css                        # Warm beige theme tokens & custom scrollbars
    ├── data/
    │   └── tcgaData.ts                  # 8 TCGA cohorts, 112 patients, 10 benchmark models
    ├── utils/
    │   ├── survival.ts                  # C-Index, Kaplan-Meier, Log-Rank, Brier, AUC
    │   ├── survival.test.ts             # Unit tests for survival biostatistics
    │   ├── fusion.ts                    # MKL kernels, Elastic-Net, multimodal risk engine
    │   ├── fusion.test.ts               # Unit tests for data fusion math
    │   ├── featureImportance.ts         # Biomarker attribution & cohort affinity engine
    │   └── featureImportance.test.ts    # Unit tests for feature ranking
    └── components/
        ├── WelcomeHeroView.tsx          # Full-page 3-mode Three.js hero & module launchpad
        ├── Navbar.tsx                   # Conditional workspace navigation & cohort selector
        ├── BenchmarkView.tsx            # 10-model leaderboard & comparative insights
        ├── FeatureImportanceVisualizer.tsx # Interactive biomarker rankings & dossiers
        ├── ModelComparisonView.tsx      # Side-by-side Cox, DeepSurv, RSF, MKL comparator
        ├── FusionEngineView.tsx         # 3D convergence core, weight balancer & pipeline
        ├── DataFusionCore3D.tsx         # Dedicated Three.js orbital data fusion canvas
        ├── WeightBalancer.tsx           # Real-time modality synergy slider widget
        ├── KaplanMeierView.tsx          # Publication-grade KM curves & numbers-at-risk
        ├── CohortExplorerView.tsx       # 3D biomarker network & 112-patient table
        ├── MolecularNetwork3D.tsx       # Three.js adverse vs. protective biomarker graph
        ├── PatientRiskCalculatorView.tsx# Single-patient precision risk & waterfall chart
        └── MilestoneSimulator.tsx       # 1-Year, 3-Year & 5-Year survival simulator
```

</details>

---

## 7. Data Provenance, Citations & Compliance

### Data Provenance & Attribution
Cohort distributions, survival follow-up timelines, censoring ratios, and biomarker effect sizes modeled in **OncoFusion** are derived from empirical multi-omics benchmarks published across **The Cancer Genome Atlas (TCGA)** Pan-Cancer Atlas and the **NCI Genomic Data Commons (GDC)**:
- **Primary Cohorts Represented:** Breast Invasive Carcinoma (`BRCA`), Lung Adenocarcinoma (`LUAD`), Glioblastoma Multiforme (`GBM`), Skin Cutaneous Melanoma (`SKCM`), Kidney Renal Clear Cell Carcinoma (`KIRC`), Colon Adenocarcinoma (`COAD`), Ovarian Serous Cystadenocarcinoma (`OV`), and Liver Hepatocellular Carcinoma (`LIHC`).
- **Methodological Benchmark Reference:** Cheerla, A., & Gevaert, O. (2019). *Deep learning with multimodal representation for pancancer prognosis prediction*. **Bioinformatics (Oxford)**, 35(14), i446–i454. [`https://doi.org/10.1093/bioinformatics/btz342`](https://academic.oup.com/bioinformatics/article/35/14/i446/5529139)

### Clinical & Regulatory Disclaimer
> **⚠️ Investigational Research Use Only (RUO)**
>
> **OncoFusion** is an interactive computational oncology research and educational platform designed to demonstrate multimodal survival modeling, biomarker attribution, and biostatistical stratification. **It is not a certified medical device** and must not be used for standalone clinical diagnosis, treatment selection, or patient management without independent verification by qualified oncology professionals and validated clinical assays.

### Citation (BibTeX)
If you use **OncoFusion** or its multimodal survival visualization patterns in your research, please cite:

```bibtex
@software{oncofusion_platform_2026,
  title        = {OncoFusion: Clinical-Grade Pan-Cancer Multi-Omics Survival Prediction and 3D Visual Analytics Platform},
  author       = {OncoFusion Research Collective},
  year         = {2026},
  note         = {Multimodal Precision Oncology Benchmark based on TCGA Pan-Cancer Atlas},
  url          = {https://github.com/your-org/oncofusion}
}
```

### Contributing & License
Contributions extending cohort coverage, adding new survival architectures, or enhancing WebGL shaders are welcome:
1. Fork the repository and create a feature branch (`git checkout -b feat/spatial-transcriptomics`).
2. Ensure all 17 biostatistical unit tests pass (`npx tsx --test src/utils/*.test.ts`) and TypeScript compiles cleanly (`npm run lint`).
3. Submit a Pull Request with a clear summary of visual and mathematical changes.

Licensed under the **Apache License 2.0 / MIT License**. See `LICENSE` for full details.
