import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  Filter,
  Eye,
  Dna,
  HeartPulse,
  Activity,
  Layers,
  Sparkles,
  ChevronRight,
  X,
  Share2,
} from 'lucide-react';
import { TCGA_PATIENT_COHORT, PatientRecord, CANCER_COHORTS } from '../data/tcgaData';
import { MolecularNetwork3D } from './MolecularNetwork3D';

interface CohortExplorerViewProps {
  selectedCohort: string;
}

export const CohortExplorerView: React.FC<CohortExplorerViewProps> = ({ selectedCohort }) => {
  const [viewMode, setViewMode] = useState<'network' | 'patients'>('network');
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState('ALL');
  const [vitalFilter, setVitalFilter] = useState('ALL');
  const [selectedPatient, setSelectedPatient] = useState<PatientRecord | null>(null);

  const cohortPatients = useMemo(() => {
    let list = TCGA_PATIENT_COHORT;
    if (selectedCohort !== 'ALL') {
      list = list.filter((p) => p.cancerType === selectedCohort);
    }
    return list;
  }, [selectedCohort]);

  const filteredPatients = useMemo(() => {
    return cohortPatients.filter((p) => {
      const matchQuery =
        p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.cancerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.genomics.driverMutations.some((m) => m.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchStage = stageFilter === 'ALL' || p.stage === stageFilter;
      const matchVital =
        vitalFilter === 'ALL' ||
        (vitalFilter === 'DECEASED' && p.event === 1) ||
        (vitalFilter === 'ALIVE' && p.event === 0);

      return matchQuery && matchStage && matchVital;
    });
  }, [cohortPatients, searchQuery, stageFilter, vitalFilter]);

  return (
    <div className="space-y-6">
      {/* Header and Filter Controls */}
      <div className="bg-white border border-[#E6E1D6] rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="p-1.5 rounded-lg bg-[#FAF7F2] border border-[#E6E1D6] text-[#A6634B]">
                <Users className="w-4 h-4" />
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#78716C]">
                Clinical & Molecular Explorer
              </span>
            </div>
            <h2 className="font-serif text-2xl font-bold text-[#2D2926] tracking-tight">
              Patient Cohort & 3D Biomarker Network
            </h2>
            <p className="text-xs text-[#78716C] mt-1 max-w-2xl leading-relaxed">
              Explore 3D molecular pathways connecting adverse driver mutations with protective immune markers, or inspect individual patient multi-omics profiles.
            </p>
          </div>

          {/* Toggle between 3D Network and Patient Table */}
          <div className="flex items-center gap-1.5 bg-[#FAF7F2] border border-[#E6E1D6] p-1.5 rounded-xl">
            <button
              onClick={() => setViewMode('network')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                viewMode === 'network'
                  ? 'bg-white text-[#A6634B] border border-[#E6E1D6] shadow-2xs font-semibold'
                  : 'text-[#78716C] hover:text-[#2D2926]'
              }`}
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>3D Biomarker Network</span>
            </button>
            <button
              onClick={() => setViewMode('patients')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                viewMode === 'patients'
                  ? 'bg-white text-[#A6634B] border border-[#E6E1D6] shadow-2xs font-semibold'
                  : 'text-[#78716C] hover:text-[#2D2926]'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Patient Records ({filteredPatients.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3D Molecular Network View */}
      {viewMode === 'network' && (
        <div className="space-y-6">
          <MolecularNetwork3D />
        </div>
      )}

      {/* Patient Table View */}
      {viewMode === 'patients' && (
        <div className="space-y-4">
          {/* Search & Filters */}
          <div className="bg-white border border-[#E6E1D6] rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3 flex-1 min-w-[240px]">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-[#78716C] absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search patient ID, cancer type, driver mutation (e.g. TP53, BRAF)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#FAF7F2] text-xs text-[#2D2926] border border-[#E6E1D6] rounded-lg pl-9 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#A6634B]/30"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="text-[#78716C]">Stage:</span>
                <select
                  value={stageFilter}
                  onChange={(e) => setStageFilter(e.target.value)}
                  className="bg-[#FAF7F2] border border-[#E6E1D6] rounded-lg px-2.5 py-1.5 text-xs text-[#2D2926] font-medium"
                >
                  <option value="ALL">All Stages</option>
                  <option value="Stage I">Stage I</option>
                  <option value="Stage II">Stage II</option>
                  <option value="Stage III">Stage III</option>
                  <option value="Stage IV">Stage IV</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-[#78716C]">Outcome:</span>
                <select
                  value={vitalFilter}
                  onChange={(e) => setVitalFilter(e.target.value)}
                  className="bg-[#FAF7F2] border border-[#E6E1D6] rounded-lg px-2.5 py-1.5 text-xs text-[#2D2926] font-medium"
                >
                  <option value="ALL">All Outcomes</option>
                  <option value="ALIVE">Alive / Censored</option>
                  <option value="DECEASED">Deceased</option>
                </select>
              </div>
            </div>
          </div>

          {/* Patients Table */}
          <div className="bg-white border border-[#E6E1D6] rounded-2xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF7F2] text-[#78716C] uppercase tracking-wider text-[11px] border-b border-[#E6E1D6]">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Patient ID</th>
                    <th className="py-3 px-3 font-semibold">Cancer Cohort</th>
                    <th className="py-3 px-3 font-semibold">Stage</th>
                    <th className="py-3 px-3 font-semibold">Age</th>
                    <th className="py-3 px-3 font-semibold">Follow-Up</th>
                    <th className="py-3 px-3 font-semibold">Status</th>
                    <th className="py-3 px-3 font-semibold">Predicted Risk</th>
                    <th className="py-3 px-3 font-semibold text-center">Inspect</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E6E1D6]/60">
                  {filteredPatients.slice(0, 25).map((p) => {
                    const isHigh = p.modelRiskScores.deep_attention_fusion > 0.3;
                    return (
                      <tr
                        key={p.id}
                        onClick={() => setSelectedPatient(p)}
                        className="hover:bg-[#FAF7F2] transition-colors cursor-pointer"
                      >
                        <td className="py-2.5 px-4 font-mono font-semibold text-[#2D2926]">
                          {p.id}
                        </td>
                        <td className="py-2.5 px-3 text-[#2D2926]">
                          <span className="font-semibold">{p.cancerType}</span>
                          <span className="text-[#78716C] ml-1.5 hidden sm:inline">({p.cancerName})</span>
                        </td>
                        <td className="py-2.5 px-3 text-[#78716C]">{p.stage}</td>
                        <td className="py-2.5 px-3 font-mono text-[#2D2926]">{p.age}</td>
                        <td className="py-2.5 px-3 font-mono text-[#78716C]">{p.survivalMonths} mo</td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              p.event === 1
                                ? 'bg-[#F6EDE9] text-[#A6634B]'
                                : 'bg-[#EEF2F0] text-[#5B7065]'
                            }`}
                          >
                            {p.event === 1 ? 'Deceased' : 'Alive (Censored)'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`font-mono text-xs font-bold ${
                              isHigh ? 'text-[#A6634B]' : 'text-[#5B7065]'
                            }`}
                          >
                            {p.modelRiskScores.deep_attention_fusion.toFixed(2)}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <button className="p-1 rounded-md bg-[#FAF7F2] text-[#78716C] hover:text-[#A6634B] border border-[#E6E1D6]">
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Patient Detail Modal */}
      {selectedPatient && (
        <div className="fixed inset-0 bg-[#2D2926]/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-[#E6E1D6] rounded-2xl max-w-xl w-full p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#E6E1D6]">
              <div>
                <span className="text-xs font-mono text-[#A6634B] font-semibold">{selectedPatient.id}</span>
                <h3 className="font-serif text-lg font-bold text-[#2D2926]">
                  {selectedPatient.cancerName} ({selectedPatient.cancerType})
                </h3>
              </div>
              <button
                onClick={() => setSelectedPatient(null)}
                className="p-1.5 rounded-lg text-[#78716C] hover:text-[#2D2926] hover:bg-[#FAF7F2]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-[#FAF7F2] p-3 rounded-xl border border-[#E6E1D6]">
                <span className="text-[#78716C] block">Age & Stage</span>
                <span className="font-bold text-[#2D2926] mt-0.5 block">
                  {selectedPatient.age} yrs • {selectedPatient.stage}
                </span>
              </div>
              <div className="bg-[#FAF7F2] p-3 rounded-xl border border-[#E6E1D6]">
                <span className="text-[#78716C] block">Survival Follow-Up</span>
                <span className="font-bold text-[#2D2926] mt-0.5 block">
                  {selectedPatient.survivalMonths} months ({selectedPatient.event === 1 ? 'Deceased' : 'Alive'})
                </span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <span className="font-bold uppercase tracking-wider text-[#78716C] block">
                Genomics & Biomarkers
              </span>
              <div className="bg-[#FAF7F2] p-3 rounded-xl border border-[#E6E1D6] space-y-1">
                <div>
                  <span className="text-[#78716C]">Driver Mutations: </span>
                  <span className="font-mono text-[#2D2926] font-semibold">
                    {selectedPatient.genomics.driverMutations.join(', ') || 'None identified'}
                  </span>
                </div>
                <div>
                  <span className="text-[#78716C]">Tumor Mutational Burden: </span>
                  <span className="font-mono text-[#2D2926] font-semibold">
                    {selectedPatient.genomics.tmb} mut/Mb
                  </span>
                </div>
                <div>
                  <span className="text-[#78716C]">TIL Density: </span>
                  <span className="font-mono text-[#2D2926] font-semibold">
                    {selectedPatient.pathology.tilDensity}%
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedPatient(null)}
                className="px-4 py-2 rounded-xl bg-[#FAF7F2] border border-[#E6E1D6] text-xs font-medium text-[#2D2926] hover:bg-[#F5F0E6]"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
