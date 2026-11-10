/**
 * Feature Importance & Biomarker Attribution Engine for Multi-Omics Survival Prediction.
 * Calculates normalized attribution rankings, hazard ratio effects, and cross-modality contributions.
 */

export type FeatureModality = 'Clinical' | 'mRNA' | 'microRNA' | 'DNA Methylation' | 'Genomics' | 'Pathology';

export interface FeatureImportanceItem {
  id: string;
  name: string;
  symbol: string;
  modality: FeatureModality;
  direction: 'adverse' | 'protective';
  importanceScores: {
    deep_attention_fusion: number; // 0.0 to 1.0 normalized
    early_concat: number;
    mrna_only?: number;
    methylation_only?: number;
    clinical_only?: number;
  };
  hazardRatio: number; // HR per standard deviation or binary state (>1.0 adverse, <1.0 protective)
  hrCiLower: number;
  hrCiUpper: number;
  pValue: number;
  biologicalFunction: string;
  cohortAffinity: string[]; // e.g. ['ALL', 'BRCA', 'LUAD']
  badgeColor: string;
}

export const TCGA_FEATURE_IMPORTANCES: FeatureImportanceItem[] = [
  {
    id: 'stage',
    name: 'Pathologic Tumor Stage (TNM)',
    symbol: 'Stage I–IV',
    modality: 'Clinical',
    direction: 'adverse',
    importanceScores: {
      deep_attention_fusion: 0.92,
      early_concat: 0.88,
      clinical_only: 0.98,
    },
    hazardRatio: 1.62,
    hrCiLower: 1.41,
    hrCiUpper: 1.86,
    pValue: 0.000001,
    biologicalFunction: 'Anatomical tumor dissemination, regional lymph node metastasis, and distant invasion.',
    cohortAffinity: ['ALL', 'BRCA', 'LUAD', 'COAD', 'KIRC', 'SKCM', 'LIHC'],
    badgeColor: 'border-blue-500/40 text-blue-400 bg-blue-500/10',
  },
  {
    id: 'mki67',
    name: 'MKI67 (Ki-67 Proliferation Marker)',
    symbol: 'MKI67 mRNA',
    modality: 'mRNA',
    direction: 'adverse',
    importanceScores: {
      deep_attention_fusion: 0.89,
      early_concat: 0.81,
      mrna_only: 0.95,
    },
    hazardRatio: 1.45,
    hrCiLower: 1.28,
    hrCiUpper: 1.64,
    pValue: 0.000008,
    biologicalFunction: 'Nuclear protein expressed in active cell cycle phases (G1, S, G2, M); indicates high mitotic rate.',
    cohortAffinity: ['ALL', 'BRCA', 'LUAD', 'OV', 'LIHC'],
    badgeColor: 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10',
  },
  {
    id: 'mir_21',
    name: 'miR-21 (Primary OncomiR)',
    symbol: 'hsa-miR-21-5p',
    modality: 'microRNA',
    direction: 'adverse',
    importanceScores: {
      deep_attention_fusion: 0.84,
      early_concat: 0.74,
    },
    hazardRatio: 1.38,
    hrCiLower: 1.22,
    hrCiUpper: 1.56,
    pValue: 0.000025,
    biologicalFunction: 'Post-transcriptionally silences PTEN, PDCD4, and RECK tumor suppressors, driving invasion.',
    cohortAffinity: ['ALL', 'BRCA', 'GBM', 'COAD', 'LUAD'],
    badgeColor: 'border-purple-500/40 text-purple-400 bg-purple-500/10',
  },
  {
    id: 'til_density',
    name: 'Tumor-Infiltrating Lymphocyte (TIL) Density',
    symbol: 'TIL % (WSI)',
    modality: 'Pathology',
    direction: 'protective',
    importanceScores: {
      deep_attention_fusion: 0.87,
      early_concat: 0.76,
    },
    hazardRatio: 0.68,
    hrCiLower: 0.58,
    hrCiUpper: 0.80,
    pValue: 0.000012,
    biologicalFunction: 'Spatial density of cytotoxic CD8+ immune infiltration within the tumor core; indicates active anti-tumor immunity.',
    cohortAffinity: ['ALL', 'SKCM', 'BRCA', 'LUAD', 'COAD'],
    badgeColor: 'border-cyan-500/40 text-cyan-400 bg-cyan-500/10',
  },
  {
    id: 'mgmt_meth',
    name: 'MGMT Promoter CpG Hypermethylation',
    symbol: 'MGMT_promoter',
    modality: 'DNA Methylation',
    direction: 'protective',
    importanceScores: {
      deep_attention_fusion: 0.85,
      early_concat: 0.70,
      methylation_only: 0.94,
    },
    hazardRatio: 0.55,
    hrCiLower: 0.44,
    hrCiUpper: 0.69,
    pValue: 0.000004,
    biologicalFunction: 'Epigenetic silencing of O6-methylguanine-DNA methyltransferase; confers chemosensitivity to alkylating agents in gliomas.',
    cohortAffinity: ['GBM', 'ALL', 'COAD'],
    badgeColor: 'border-amber-500/40 text-amber-400 bg-amber-500/10',
  },
  {
    id: 'tp53',
    name: 'TP53 Mutation & Expression Dysregulation',
    symbol: 'TP53 (R273H/R175H)',
    modality: 'mRNA',
    direction: 'adverse',
    importanceScores: {
      deep_attention_fusion: 0.82,
      early_concat: 0.78,
      mrna_only: 0.88,
    },
    hazardRatio: 1.41,
    hrCiLower: 1.24,
    hrCiUpper: 1.60,
    pValue: 0.000035,
    biologicalFunction: 'Disrupts canonical p53 DNA damage response, apoptosis, and chromosomal stability checkpoints.',
    cohortAffinity: ['ALL', 'OV', 'LUAD', 'LIHC', 'BRCA'],
    badgeColor: 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10',
  },
  {
    id: 'cd8a',
    name: 'CD8A Cytotoxic T-Cell Transcript',
    symbol: 'CD8A mRNA',
    modality: 'mRNA',
    direction: 'protective',
    importanceScores: {
      deep_attention_fusion: 0.80,
      early_concat: 0.72,
      mrna_only: 0.82,
    },
    hazardRatio: 0.74,
    hrCiLower: 0.64,
    hrCiUpper: 0.85,
    pValue: 0.000062,
    biologicalFunction: 'Cell-surface glycoprotein mediating TCR-antigen recognition on tumor-reactive cytotoxic T lymphocytes.',
    cohortAffinity: ['ALL', 'SKCM', 'LUAD', 'KIRC'],
    badgeColor: 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10',
  },
  {
    id: 'cdkn2a_meth',
    name: 'CDKN2A (p16INK4a) Promoter Methylation',
    symbol: 'CDKN2A_promoter',
    modality: 'DNA Methylation',
    direction: 'adverse',
    importanceScores: {
      deep_attention_fusion: 0.77,
      early_concat: 0.69,
      methylation_only: 0.86,
    },
    hazardRatio: 1.34,
    hrCiLower: 1.18,
    hrCiUpper: 1.52,
    pValue: 0.00014,
    biologicalFunction: 'Epigenetic silencing of cyclin-dependent kinase inhibitor 2A, releasing CDK4/6 to drive unconstrained Rb phosphorylation.',
    cohortAffinity: ['ALL', 'KIRC', 'GBM', 'LUAD'],
    badgeColor: 'border-amber-500/40 text-amber-400 bg-amber-500/10',
  },
  {
    id: 'tmb',
    name: 'Tumor Mutational Burden (TMB)',
    symbol: 'TMB (mut/Mb)',
    modality: 'Genomics',
    direction: 'protective',
    importanceScores: {
      deep_attention_fusion: 0.79,
      early_concat: 0.67,
    },
    hazardRatio: 0.71,
    hrCiLower: 0.61,
    hrCiUpper: 0.83,
    pValue: 0.000085,
    biologicalFunction: 'Generates diverse neoantigen peptides recognizable by host immune system, sensitizing patients to immune checkpoint therapy.',
    cohortAffinity: ['ALL', 'SKCM', 'LUAD', 'COAD'],
    badgeColor: 'border-rose-500/40 text-rose-400 bg-rose-500/10',
  },
  {
    id: 'erbb2',
    name: 'ERBB2 (HER2 Receptor Tyrosine Kinase)',
    symbol: 'ERBB2 mRNA/Amp',
    modality: 'mRNA',
    direction: 'adverse',
    importanceScores: {
      deep_attention_fusion: 0.76,
      early_concat: 0.71,
      mrna_only: 0.84,
    },
    hazardRatio: 1.32,
    hrCiLower: 1.15,
    hrCiUpper: 1.51,
    pValue: 0.00021,
    biologicalFunction: 'Constitutive activation of downstream MAPK and PI3K/Akt pro-survival cascades; adverse in un-targeted settings.',
    cohortAffinity: ['BRCA', 'ALL'],
    badgeColor: 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10',
  },
  {
    id: 'mir_34a',
    name: 'miR-34a (p53-Regulated Tumor Suppressor)',
    symbol: 'hsa-miR-34a-5p',
    modality: 'microRNA',
    direction: 'protective',
    importanceScores: {
      deep_attention_fusion: 0.73,
      early_concat: 0.65,
    },
    hazardRatio: 0.78,
    hrCiLower: 0.68,
    hrCiUpper: 0.90,
    pValue: 0.00045,
    biologicalFunction: 'Directly represses oncogenes including MET, MYC, BCL2, and CD44, enforcing cellular senescence.',
    cohortAffinity: ['ALL', 'BRCA', 'LUAD', 'OV'],
    badgeColor: 'border-purple-500/40 text-purple-400 bg-purple-500/10',
  },
  {
    id: 'hrd_score',
    name: 'Homologous Recombination Deficiency (HRD)',
    symbol: 'HRD Genomic Scar',
    modality: 'Genomics',
    direction: 'protective',
    importanceScores: {
      deep_attention_fusion: 0.75,
      early_concat: 0.66,
    },
    hazardRatio: 0.76,
    hrCiLower: 0.65,
    hrCiUpper: 0.89,
    pValue: 0.00038,
    biologicalFunction: 'Quantifies loss of heterozygosity, telomeric allelic imbalance, and large-scale transitions; predicts PARP inhibitor response.',
    cohortAffinity: ['OV', 'BRCA', 'ALL'],
    badgeColor: 'border-rose-500/40 text-rose-400 bg-rose-500/10',
  },
  {
    id: 'karnofsky',
    name: 'Karnofsky Performance Score',
    symbol: 'KPS (60–100%)',
    modality: 'Clinical',
    direction: 'protective',
    importanceScores: {
      deep_attention_fusion: 0.71,
      early_concat: 0.75,
      clinical_only: 0.88,
    },
    hazardRatio: 0.80,
    hrCiLower: 0.70,
    hrCiUpper: 0.91,
    pValue: 0.00062,
    biologicalFunction: 'Functional operational stamina; high functional reserve tolerates multi-agent systemic therapies.',
    cohortAffinity: ['ALL', 'GBM', 'LUAD', 'LIHC'],
    badgeColor: 'border-blue-500/40 text-blue-400 bg-blue-500/10',
  },
  {
    id: 'let_7a',
    name: 'let-7a MicroRNA Differentiation Guardian',
    symbol: 'hsa-let-7a-5p',
    modality: 'microRNA',
    direction: 'protective',
    importanceScores: {
      deep_attention_fusion: 0.69,
      early_concat: 0.61,
    },
    hazardRatio: 0.82,
    hrCiLower: 0.71,
    hrCiUpper: 0.94,
    pValue: 0.0012,
    biologicalFunction: 'Targeted silencing of KRAS and HMGA2 oncogenic transcription factors.',
    cohortAffinity: ['LUAD', 'ALL'],
    badgeColor: 'border-purple-500/40 text-purple-400 bg-purple-500/10',
  },
  {
    id: 'egfr',
    name: 'EGFR Expression / L858R Driver',
    symbol: 'EGFR mRNA',
    modality: 'mRNA',
    direction: 'adverse',
    importanceScores: {
      deep_attention_fusion: 0.74,
      early_concat: 0.68,
      mrna_only: 0.81,
    },
    hazardRatio: 1.30,
    hrCiLower: 1.13,
    hrCiUpper: 1.49,
    pValue: 0.00051,
    biologicalFunction: 'Epidermal growth factor receptor hyperactivation driving cell motility, neoangiogenesis, and chemoresistance.',
    cohortAffinity: ['LUAD', 'GBM', 'ALL'],
    badgeColor: 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10',
  },
  {
    id: 'stroma_ratio',
    name: 'Histopathologic Stroma-to-Tumor Ratio',
    symbol: 'Stroma %',
    modality: 'Pathology',
    direction: 'adverse',
    importanceScores: {
      deep_attention_fusion: 0.66,
      early_concat: 0.58,
    },
    hazardRatio: 1.25,
    hrCiLower: 1.09,
    hrCiUpper: 1.43,
    pValue: 0.0021,
    biologicalFunction: 'Dense desmoplastic reactive stroma creating physical barrier to immune infiltration and drug delivery.',
    cohortAffinity: ['ALL', 'COAD', 'BRCA'],
    badgeColor: 'border-cyan-500/40 text-cyan-400 bg-cyan-500/10',
  },
];

/**
 * Filter and rank features based on selected cohort, modality, model architecture, and sort criteria.
 */
export function rankFeatures(
  cohortCode: string,
  modalityFilter: string,
  modelId: string,
  sortMode: 'absolute' | 'adverse' | 'protective'
): FeatureImportanceItem[] {
  let list = [...TCGA_FEATURE_IMPORTANCES];

  // Cohort filtering (boost items with affinity for specific cohort)
  if (cohortCode !== 'ALL') {
    list = list.filter((item) => item.cohortAffinity.includes(cohortCode) || item.cohortAffinity.includes('ALL'));
  }

  // Modality filtering
  if (modalityFilter !== 'ALL') {
    list = list.filter((item) => item.modality === modalityFilter);
  }

  // Direction filtering or sorting
  if (sortMode === 'adverse') {
    list = list.filter((item) => item.direction === 'adverse');
  } else if (sortMode === 'protective') {
    list = list.filter((item) => item.direction === 'protective');
  }

  // Sorting
  list.sort((a, b) => {
    const scoresA = a.importanceScores as any;
    const scoresB = b.importanceScores as any;
    const valA = scoresA[modelId] ?? scoresA.deep_attention_fusion ?? 0;
    const valB = scoresB[modelId] ?? scoresB.deep_attention_fusion ?? 0;
    return valB - valA;
  });

  return list;
}
