import React from 'react';
import {
  Activity,
  GitCompare,
  TrendingUp,
  Database,
  FileText,
} from 'lucide-react';
import {
  SiteScorecard,
  CompareResult,
  StressTestResponse,
  ProvenanceRecord,
  CandidateSite,
  PriorityPreset,
  ScenarioPreset,
  Region,
} from '../types';
import { ScorecardTab } from './ScorecardTab';
import { CompareTab } from './CompareTab';
import { StressTestTab } from './StressTestTab';
import { SourcesTab } from './SourcesTab';
import { ReportTab } from './ReportTab';

export type RightPanelTab = 'scorecard' | 'compare' | 'stress' | 'sources' | 'report';

interface RightPanelProps {
  currentRegion: Region;
  candidateSites: CandidateSite[];
  selectedSiteCode: 'A' | 'B' | 'C';
  onSelectSiteCode: (code: 'A' | 'B' | 'C') => void;
  scorecards: Record<string, SiteScorecard>;
  compareResult: CompareResult;
  stressTestResult: StressTestResponse;
  provenanceRecords: ProvenanceRecord[];
  priorityPreset: PriorityPreset;
  scenarioPreset: ScenarioPreset;
  targetPopulation: number;
  horizon: 2035 | 2050;
  activeTab: RightPanelTab;
  onChangeTab: (tab: RightPanelTab) => void;
}

export const RightPanel: React.FC<RightPanelProps> = ({
  currentRegion,
  candidateSites,
  selectedSiteCode,
  onSelectSiteCode,
  scorecards,
  compareResult,
  stressTestResult,
  provenanceRecords,
  priorityPreset,
  scenarioPreset,
  targetPopulation,
  horizon,
  activeTab,
  onChangeTab,
}) => {
  const tabs = [
    { id: 'scorecard' as RightPanelTab, label: 'Scorecard', icon: Activity },
    {
      id: 'compare' as RightPanelTab,
      label: 'Compare',
      icon: GitCompare,
      badge: compareResult.isTie ? 'Tie Check' : undefined,
    },
    {
      id: 'stress' as RightPanelTab,
      label: 'Stress Test',
      icon: TrendingUp,
      badge: `${stressTestResult.stressIndex.toFixed(2)}`,
    },
    { id: 'sources' as RightPanelTab, label: 'Sources', icon: Database },
    { id: 'report' as RightPanelTab, label: 'Report', icon: FileText },
  ];

  return (
    <aside className="right-panel w-[480px] xl:w-[540px] h-full bg-white border-l border-slate-200 flex flex-col shrink-0 overflow-hidden shadow-sm z-20">
      {/* Floating Pill Tabs Bar (Directly inspired by screenshot) */}
      <div className="right-panel-tabs no-print px-4 py-3 bg-white border-b border-slate-100 shrink-0">
        <div className="bg-slate-100/90 p-1 rounded-full border border-slate-200/80 flex items-center justify-between gap-1 shadow-xs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onChangeTab(tab.id)}
                className={`flex-1 flex items-center justify-center space-x-1.5 py-2 px-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60 font-semibold'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`ml-1 px-1.5 py-0.2 text-[9px] rounded-full font-mono font-bold ${
                      isActive
                        ? 'bg-blue-800 text-blue-100'
                        : tab.badge === 'Tie Check'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content Body */}
      <div className="flex-1 overflow-y-auto p-5 bg-slate-50/50">
        {activeTab === 'scorecard' && (
          <ScorecardTab
            scorecards={scorecards}
            candidateSites={candidateSites}
            selectedSiteCode={selectedSiteCode}
            onSelectSiteCode={onSelectSiteCode}
            priorityPreset={priorityPreset}
          />
        )}

        {activeTab === 'compare' && (
          <CompareTab
            compareResult={compareResult}
            priorityPreset={priorityPreset}
            regionId={currentRegion.id}
          />
        )}

        {activeTab === 'stress' && <StressTestTab stressData={stressTestResult} />}

        {activeTab === 'sources' && <SourcesTab provenanceRecords={provenanceRecords} />}

        {activeTab === 'report' && (
          <ReportTab
            currentRegion={currentRegion}
            candidateSites={candidateSites}
            scorecards={scorecards}
            compareResult={compareResult}
            stressTestResult={stressTestResult}
            priorityPreset={priorityPreset}
            scenarioPreset={scenarioPreset}
            targetPopulation={targetPopulation}
            horizon={horizon}
          />
        )}
      </div>
    </aside>
  );
};
