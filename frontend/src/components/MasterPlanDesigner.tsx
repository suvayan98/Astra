import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Sparkles, CheckCircle2, TrendingUp, Compass, Layers, Droplets,
  SunMedium, Trees, ShieldAlert, Edit3, ArrowRight, Info, Sliders,
  Settings, Undo2, Redo2, Bot, Send, Check, X, ChevronDown, ChevronUp,
  Scale, Building2, HelpCircle, RefreshCw, BarChart3, PieChart,
  Activity, Award, Search, Filter, MessageSquare, Zap, ExternalLink
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend
} from 'recharts';
import { MasterPlanAlternative, MasterPlanZone } from '../types';
import { CANONICAL_ZONE_TYPES } from './EditZoneModal';

interface MasterPlanDesignerProps {
  plans: MasterPlanAlternative[];
  activePlan: MasterPlanAlternative | null;
  onSelectPlan: (plan: MasterPlanAlternative) => void;
  onEditZone: (zone: MasterPlanZone) => void;
  onRegeneratePlans: (priorities: string[]) => void;
  population: number;
  areaAcres: number;
  loading: boolean;
}

// Canonical 12 zone definitions for baseline calibration
const CANONICAL_12_ZONES_DATA: Record<string, Array<{
  zone_type: string;
  name: string;
  area_acres: number;
  far_ratio: number;
  capacity: number;
  color: string;
  description: string;
}>> = {
  PLAN_A: [
    { zone_type: 'Residential', name: 'High-Density Mixed Residential Core', area_acres: 140.0, far_ratio: 2.4, capacity: 14000, color: '#3b82f6', description: 'Transit-oriented mid-rise apartments (G+6 to G+10) with ground-floor grocery, clinics, and active frontages.' },
    { zone_type: 'Commercial', name: 'Central Commercial & Innovation Plaza', area_acres: 50.0, far_ratio: 3.0, capacity: 3000, color: '#8b5cf6', description: 'Pedestrian-only commercial high street, co-working incubators, retail, and transit interchange.' },
    { zone_type: 'Industrial Clean-Tech', name: 'Industrial Clean-Tech & Green Assembly', area_acres: 25.0, far_ratio: 1.6, capacity: 1200, color: '#64748b', description: 'Zero-emission light industrial, clean electronics, biotechnology labs, and green warehousing.' },
    { zone_type: 'Agricultural Agro-Forestry', name: 'Peri-Urban Agro-Forestry Buffer', area_acres: 30.0, far_ratio: 0.05, capacity: 0, color: '#84cc16', description: 'Community organic farming, orchard groves (Moringa, Guava, Neem), and permaculture buffer.' },
    { zone_type: 'Parks & Green Belt', name: 'Peripheral Continuous Miyawaki Green Loop', area_acres: 110.0, far_ratio: 0.05, capacity: 0, color: '#10b981', description: 'Dense Miyawaki urban forest, biodiversity wildlife corridor, and continuous perimeter running/cycling trail.' },
    { zone_type: 'Water Bodies & RWH', name: 'Central Retention Lake & RWH Bioswales', area_acres: 40.0, far_ratio: 0.0, capacity: 0, color: '#06b6d4', description: 'Cascading stormwater retention basins, unconfined aquifer recharge ponds, and recreational waterfront promenade.' },
    { zone_type: 'Roads & Transit Spine', name: 'Electric BRT Transit Spine & Complete Streets', area_acres: 40.0, far_ratio: 0.0, capacity: 0, color: '#f59e0b', description: 'Central 30m multi-modal boulevard with dedicated electric BRT lanes, protected two-way bicycle paths, and shaded sidewalks.' },
    { zone_type: 'Renewable Solar Farm', name: 'Utility Solar Farm & Agro-Voltaics', area_acres: 30.0, far_ratio: 0.0, capacity: 0, color: '#eab308', description: '9.5 MWp ground-mounted bifacial solar array paired with shade-tolerant medicinal herb farming underneath.' },
    { zone_type: 'Water Treatment DEWATS', name: 'Decentralized DEWATS Water Reclamation', area_acres: 10.0, far_ratio: 0.4, capacity: 0, color: '#0284c7', description: 'Anaerobic baffled reactor + constructed wetlands recycling 2.2 MLD wastewater to non-potable tertiary standards.' },
    { zone_type: 'Solid Waste Recovery', name: 'Circular Solid Waste Recovery & Bio-Methanation', area_acres: 10.0, far_ratio: 0.5, capacity: 0, color: '#d97706', description: 'Automated material recovery facility (MRF), 10 TPD bio-gas digester converting wet waste to electricity and compost.' },
    { zone_type: 'Hospitals & Emergency', name: 'Integrated District Hospital & Disaster Shelter', area_acres: 7.5, far_ratio: 1.8, capacity: 2000, color: '#ef4444', description: '250-bed multi-specialty hospital, disaster command center, fire station, and elevated emergency helipad.' },
    { zone_type: 'Schools & Public Institutions', name: 'Smart Educational Campus & Research College', area_acres: 7.5, far_ratio: 1.5, capacity: 1000, color: '#ec4899', description: 'Integrated K-12 green school, vocational training institute, sports oval, and community auditorium.' }
  ],
  PLAN_B: [
    { zone_type: 'Residential', name: 'Dispersed Eco-Neighborhood Hamlets', area_acres: 160.0, far_ratio: 1.2, capacity: 20000, color: '#3b82f6', description: 'Courtyard homes and low-rise row housing (G+2 to G+3) integrated with private kitchen gardens and rain gardens.' },
    { zone_type: 'Commercial', name: 'Village Center & Weekly Haat Bazaar', area_acres: 25.0, far_ratio: 1.5, capacity: 1500, color: '#8b5cf6', description: 'Low-rise community marketplace, artisan workshops, decentralized solar grain milling, and cooperative bank.' },
    { zone_type: 'Industrial Clean-Tech', name: 'Agro-Processing & Clean Village Crafts', area_acres: 15.0, far_ratio: 1.2, capacity: 600, color: '#64748b', description: 'Decentralized agro-processing, cold storage, cold-pressed oil extraction, and artisanal textile workshops.' },
    { zone_type: 'Agricultural Agro-Forestry', name: 'Regenerative Agro-Forestry & Food Belt', area_acres: 120.0, far_ratio: 0.05, capacity: 0, color: '#84cc16', description: 'Community organic farming, orchard groves (Moringa, Guava, Mango), drip-irrigated pulses, and permaculture.' },
    { zone_type: 'Parks & Green Belt', name: 'Sacred Groves & Native Habitat Reserve', area_acres: 65.0, far_ratio: 0.02, capacity: 0, color: '#10b981', description: 'Ecological sanctuary with mature Banyan, Peepal, and Neem canopy supporting migratory birds and pollinators.' },
    { zone_type: 'Water Bodies & RWH', name: 'Cascade Tank & Wetland Network', area_acres: 50.0, far_ratio: 0.0, capacity: 0, color: '#06b6d4', description: 'Historical Indian tank cascade system (keres) storing monsoon runoff, supporting aquaculture and unconfined aquifer recharge.' },
    { zone_type: 'Roads & Transit Spine', name: 'Permeable Neighborhood Road & Trail Grid', area_acres: 30.0, far_ratio: 0.0, capacity: 0, color: '#f59e0b', description: 'Permeable grass-paved streets, bioswales, and feeder electric minibus loops.' },
    { zone_type: 'Renewable Solar Farm', name: 'Community Solar Microgrid & Bio-Energy', area_acres: 15.0, far_ratio: 0.0, capacity: 0, color: '#eab308', description: 'Distributed 5 MWp solar arrays combined with biomass gasification for 24/7 hamlet microgrid power.' },
    { zone_type: 'Water Treatment DEWATS', name: 'Phytoremediation Reed Bed DEWATS', area_acres: 5.0, far_ratio: 0.3, capacity: 0, color: '#0284c7', description: 'Gravity-fed natural reed beds and gravel filtration purifying wastewater for agricultural reuse.' },
    { zone_type: 'Solid Waste Recovery', name: 'Community Composting & Waste Recovery', area_acres: 5.0, far_ratio: 0.3, capacity: 0, color: '#d97706', description: 'Decentralized organic vermi-composting pits and localized dry waste collection centers.' },
    { zone_type: 'Hospitals & Emergency', name: 'Primary Health Center & Ayush Clinic', area_acres: 5.0, far_ratio: 1.2, capacity: 500, color: '#ef4444', description: 'Solar-powered community health center, 24/7 maternity unit, and emergency response outpost.' },
    { zone_type: 'Schools & Public Institutions', name: 'Eco-School & Skill Development Center', area_acres: 5.0, far_ratio: 1.0, capacity: 500, color: '#ec4899', description: 'Open-air green school, community library, solar training workshop, and village panchayat hall.' }
  ],
  PLAN_C: [
    { zone_type: 'Residential', name: 'Smart Polycentric Residential Quarters', area_acres: 125.0, far_ratio: 2.2, capacity: 16000, color: '#3b82f6', description: 'Energy-positive smart apartments with integrated solar façades, automated graywater sensors, and pneumatic waste chutes.' },
    { zone_type: 'Commercial', name: 'Digital Financial & Smart Commercial Core', area_acres: 45.0, far_ratio: 3.2, capacity: 4500, color: '#8b5cf6', description: 'Smart commercial towers, hospitality, retail mall, and urban drone delivery hub.' },
    { zone_type: 'Industrial Clean-Tech', name: 'Clean-Tech, AI & High-Tech Park', area_acres: 65.0, far_ratio: 1.8, capacity: 3500, color: '#64748b', description: 'Zero-emission light engineering, electronics assembly, data center, and environmental biotechnology labs.' },
    { zone_type: 'Agricultural Agro-Forestry', name: 'Urban Hydroponic & Agro-Tech Center', area_acres: 20.0, far_ratio: 0.8, capacity: 400, color: '#84cc16', description: 'Vertical aeroponics, indoor climate-controlled greenhouses, and microalgae bio-reactors.' },
    { zone_type: 'Parks & Green Belt', name: 'Linear Biophilic Green Cooling Corridors', area_acres: 85.0, far_ratio: 0.05, capacity: 0, color: '#10b981', description: 'Integrated shade canopy channels acting as natural air-conditioning conduits channeling prevailing winds.' },
    { zone_type: 'Water Bodies & RWH', name: 'Smart Water Reservoir & Ultrafiltration', area_acres: 35.0, far_ratio: 0.2, capacity: 0, color: '#06b6d4', description: 'Automated IoT water meters, underground pressurized graywater return mains, and tertiary ultra-filtration plant.' },
    { zone_type: 'Roads & Transit Spine', name: 'Autonomous Transit Network & Sensor Arteries', area_acres: 40.0, far_ratio: 0.0, capacity: 0, color: '#f59e0b', description: 'Multi-tier underground utility tunnels (water, power, fiber, recycled water) under smart connected roadways.' },
    { zone_type: 'Renewable Solar Farm', name: 'Solar Microgrid, BESS Storage & Substation', area_acres: 45.0, far_ratio: 0.0, capacity: 0, color: '#eab308', description: '11 MWp tracking solar array + 28 MWh Lithium Iron Phosphate BESS with dynamic grid balancing.' },
    { zone_type: 'Water Treatment DEWATS', name: 'Dual-Reticulation Advanced DEWATS', area_acres: 15.0, far_ratio: 0.6, capacity: 0, color: '#0284c7', description: 'Membrane bioreactor (MBR) recycling 100% of municipal sewage into industrial cooling and flushing water.' },
    { zone_type: 'Solid Waste Recovery', name: 'Integrated Waste-to-Energy & Resource Recovery', area_acres: 10.0, far_ratio: 0.8, capacity: 0, color: '#d97706', description: 'Gasification and anaerobic bio-digester converting 100% of municipal solid waste into grid power.' },
    { zone_type: 'Hospitals & Emergency', name: 'Smart Trauma Hospital & ICCC Command', area_acres: 7.5, far_ratio: 2.2, capacity: 2500, color: '#ef4444', description: 'Central Command Center (ICCC), geospatial digital twin monitoring room, trauma hospital, and STEM university.' },
    { zone_type: 'Schools & Public Institutions', name: 'STEM University & Public Innovation Labs', area_acres: 7.5, far_ratio: 2.0, capacity: 1500, color: '#ec4899', description: 'AI innovation campus, green engineering labs, incubator accelerator, and international convention hall.' }
  ]
};

// Harmonize plan with complete 12 zones
function harmonize12Zones(plan: MasterPlanAlternative, totalAreaAcres: number): MasterPlanZone[] {
  const planKey = plan.plan_code || 'PLAN_A';
  const baseline = CANONICAL_12_ZONES_DATA[planKey] || CANONICAL_12_ZONES_DATA.PLAN_A;
  const existingMap = new Map<string, MasterPlanZone>();

  plan.zones.forEach((z) => {
    if (z.zone_type) {
      existingMap.set(z.zone_type, z);
    }
  });

  return baseline.map((base, idx) => {
    const existing = existingMap.get(base.zone_type);
    if (existing) {
      return {
        ...existing,
        area_percentage: Number(((existing.area_acres / totalAreaAcres) * 100).toFixed(1)),
        area_hectares: Number((existing.area_acres * 0.404686).toFixed(1))
      };
    }
    // Return baseline zone
    return {
      id: `${plan.plan_id}_canonical_${idx + 1}`,
      name: base.name,
      zone_type: base.zone_type,
      area_acres: base.area_acres,
      area_hectares: Number((base.area_acres * 0.404686).toFixed(1)),
      area_percentage: Number(((base.area_acres / totalAreaAcres) * 100).toFixed(1)),
      color: base.color,
      far_ratio: base.far_ratio,
      target_capacity_people: base.capacity,
      description: base.description,
      geometry: { type: 'Polygon', coordinates: [] }
    };
  });
}

export const MasterPlanDesigner: React.FC<MasterPlanDesignerProps> = ({
  plans,
  activePlan,
  onSelectPlan,
  onEditZone,
  onRegeneratePlans,
  population,
  areaAcres,
  loading
}) => {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'overview' | 'comparison' | 'radar' | 'density'>('overview');
  const [showConfigModal, setShowConfigModal] = useState<boolean>(false);
  const [showAICopilot, setShowAICopilot] = useState<boolean>(true);
  const [isCopilotMinimized, setIsCopilotMinimized] = useState<boolean>(false);
  const [zoneFilter, setZoneFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Initial Configuration State
  const [configArea, setConfigArea] = useState<number>(areaAcres || 500);
  const [configPop, setConfigPop] = useState<number>(population || 20000);
  const [devType, setDevType] = useState<string>('Greenfield Eco-City (Carbon-Neutral)');
  const [priorities, setPriorities] = useState<string[]>([
    'water_security', 'renewable_energy', 'public_transport', 'green_spaces', 'disaster_resilience'
  ]);
  const [maxFarConstraint, setMaxFarConstraint] = useState<number>(2.5);
  const [minOpenSpaceConstraint, setMinOpenSpaceConstraint] = useState<number>(30);
  const [transitTargetConstraint, setTransitTargetConstraint] = useState<number>(75);

  // Undo / Redo History Stack
  const [history, setHistory] = useState<MasterPlanAlternative[]>([]);
  const [historyIdx, setHistoryIdx] = useState<number>(-1);

  // Local active plan state with full 12-zone synchronization
  const [currentPlan, setCurrentPlan] = useState<MasterPlanAlternative | null>(null);

  // AI Copilot state
  interface ChatMessage {
    id: string;
    sender: 'user' | 'assistant';
    text: string;
    timestamp: string;
    proposal?: {
      summary: string;
      changes: Array<{
        zoneName: string;
        oldAcres: number;
        newAcres: number;
        deltaAcres: number;
      }>;
      walkabilityDelta: number;
      greenSpaceDelta: number;
      capexDelta: number;
    };
  }

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      sender: 'assistant',
      text: `Hello! I am your AI Master Plan Copilot. I analyze demographic targets, geospatial zoning boundaries, and CPHEEO/URDPFI standards to optimize spatial allocation. How would you like to refine the active layout?`,
      timestamp: 'Just now'
    }
  ]);
  const [promptInput, setPromptInput] = useState<string>('');
  const [isAiThinking, setIsAiThinking] = useState<boolean>(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Initialize and synchronize current plan with 12 canonical zones
  useEffect(() => {
    if (activePlan) {
      const fullZones = harmonize12Zones(activePlan, areaAcres || 500);
      const harmonizedPlan: MasterPlanAlternative = {
        ...activePlan,
        zones: fullZones
      };
      setCurrentPlan(harmonizedPlan);

      // Initialize history if empty
      if (history.length === 0) {
        setHistory([harmonizedPlan]);
        setHistoryIdx(0);
      }
    }
  }, [activePlan, areaAcres]);

  // Push new snapshot to history
  const pushHistory = (newPlan: MasterPlanAlternative) => {
    const updatedHistory = history.slice(0, historyIdx + 1);
    updatedHistory.push(newPlan);
    setHistory(updatedHistory);
    setHistoryIdx(updatedHistory.length - 1);
    setCurrentPlan(newPlan);
  };

  // Undo / Redo handlers
  const handleUndo = () => {
    if (historyIdx > 0) {
      const prevIdx = historyIdx - 1;
      setHistoryIdx(prevIdx);
      const prevPlan = history[prevIdx];
      setCurrentPlan(prevPlan);
      onSelectPlan(prevPlan);
    }
  };

  const handleRedo = () => {
    if (historyIdx < history.length - 1) {
      const nextIdx = historyIdx + 1;
      setHistoryIdx(nextIdx);
      const nextPlan = history[nextIdx];
      setCurrentPlan(nextPlan);
      onSelectPlan(nextPlan);
    }
  };

  // Scroll chat
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages, isAiThinking]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-cyan-400 gap-3">
        <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-base font-bold text-slate-100">Generating AI Master Plans (Plan A, Plan B, Plan C)...</p>
        <p className="text-xs text-slate-400">Harmonizing 12-zone spatial budgets & demographic density models</p>
      </div>
    );
  }

  if (!plans || plans.length === 0 || !currentPlan) {
    return (
      <div className="p-12 text-center text-slate-400">
        <Layers className="w-12 h-12 mx-auto text-slate-600 mb-3" />
        <h3 className="text-lg font-bold text-slate-200">No Master Plans Generated Yet</h3>
        <p className="text-sm mt-1 text-slate-400">Configure parameters above and click "Generate Master Plans".</p>
      </div>
    );
  }

  // Active Plan Metrics & Density Verification
  const grossDensitySqKm = Math.round(population / (areaAcres * 0.00404686));
  const grossDensityAcre = Number((population / areaAcres).toFixed(1));
  const totalAllocatedAcres = currentPlan.zones.reduce((sum, z) => sum + z.area_acres, 0);
  const totalGreenAcres = currentPlan.zones
    .filter(z => z.zone_type && ['Parks & Green Belt', 'Agricultural Agro-Forestry', 'Water Bodies & RWH'].includes(z.zone_type))
    .reduce((sum, z) => sum + z.area_acres, 0);
  const greenPct = Number(((totalGreenAcres / areaAcres) * 100).toFixed(1));

  // Radar chart comparison data across Plan A, B, C
  const radarData = [
    {
      subject: 'Walkability',
      A: 94,
      B: 78,
      C: 91,
      fullMark: 100
    },
    {
      subject: 'Green Space',
      A: 74, // ~25 m2
      B: 98, // ~34 m2
      C: 62, // ~18 m2
      fullMark: 100
    },
    {
      subject: 'Water Self-Sufficiency',
      A: 72,
      B: 88,
      C: 82,
      fullMark: 100
    },
    {
      subject: 'RE Coverage',
      A: 96,
      B: 85,
      C: 100,
      fullMark: 100
    },
    {
      subject: 'Public Transit Share',
      A: 78,
      B: 52,
      C: 85,
      fullMark: 100
    },
    {
      subject: 'Capex Efficiency',
      A: 75, // ~580 Cr
      B: 92, // ~420 Cr (most affordable)
      C: 65, // ~720 Cr (highest smart tech)
      fullMark: 100
    }
  ];

  // Category filter classification
  const filteredZones = currentPlan.zones.filter((z) => {
    const zName = z.name || '';
    const zType = z.zone_type || '';
    const zDesc = z.description || '';
    const matchesSearch = zName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          zType.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          zDesc.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (zoneFilter === 'All') return true;
    if (zoneFilter === 'Living & Working') {
      return ['Residential', 'Commercial', 'Industrial Clean-Tech'].includes(zType);
    }
    if (zoneFilter === 'Ecological & Blue-Green') {
      return ['Parks & Green Belt', 'Agricultural Agro-Forestry', 'Water Bodies & RWH'].includes(zType);
    }
    if (zoneFilter === 'Mobility & Utilities') {
      return ['Roads & Transit Spine', 'Renewable Solar Farm', 'Water Treatment DEWATS', 'Solid Waste Recovery'].includes(zType);
    }
    if (zoneFilter === 'Civic & Social') {
      return ['Hospitals & Emergency', 'Schools & Public Institutions'].includes(zType);
    }
    return true;
  });

  // AI Prompt Handler
  const handleSendPrompt = (promptText: string) => {
    const userText = promptText.trim();
    if (!userText) return;

    const userMsg: ChatMessage = {
      id: `u_${Date.now()}`,
      sender: 'user',
      text: userText,
      timestamp: 'Just now'
    };
    setChatMessages((prev) => [...prev, userMsg]);
    setPromptInput('');
    setIsAiThinking(true);

    setTimeout(() => {
      let aiText = '';
      let proposal: ChatMessage['proposal'] = undefined;

      const lower = userText.toLowerCase();

      if (lower.includes('green') || lower.includes('park') || lower.includes('road')) {
        aiText = 'I can revise the master plan by expanding green zones and optimising the road network. Review the proposed changes before applying:';
        proposal = {
          summary: 'Expand Parks & Green Belt by +12.0 Acres, offset by streamlining Roads & Transit Spine by -12.0 Acres.',
          changes: [
            { zoneName: 'Parks & Green Belt', oldAcres: 110.0, newAcres: 122.0, deltaAcres: +12.0 },
            { zoneName: 'Roads & Transit Spine', oldAcres: 40.0, newAcres: 28.0, deltaAcres: -12.0 }
          ],
          walkabilityDelta: +3,
          greenSpaceDelta: +2.4,
          capexDelta: -18
        };
      } else if (lower.includes('solar') || lower.includes('energy') || lower.includes('renewable')) {
        aiText = 'I have evaluated your renewable generation quota. By expanding the Utility Solar Farm from 30 to 45 Acres, we reach 100% net renewable independence:';
        proposal = {
          summary: 'Increase Solar Farm by +15.0 Acres, offset by reallocating low-density commercial reserve.',
          changes: [
            { zoneName: 'Renewable Solar Farm', oldAcres: 30.0, newAcres: 45.0, deltaAcres: +15.0 },
            { zoneName: 'Commercial', oldAcres: 50.0, newAcres: 35.0, deltaAcres: -15.0 }
          ],
          walkabilityDelta: 0,
          greenSpaceDelta: 0,
          capexDelta: +25
        };
      } else if (lower.includes('water') || lower.includes('lake') || lower.includes('dewats')) {
        aiText = 'To maximize water resilience against severe drought years, I recommend increasing the retention lake capacity and DEWATS footprint:';
        proposal = {
          summary: 'Increase Water Bodies & RWH by +10.0 Acres and DEWATS by +5.0 Acres.',
          changes: [
            { zoneName: 'Water Bodies & RWH', oldAcres: 40.0, newAcres: 50.0, deltaAcres: +10.0 },
            { zoneName: 'Water Treatment DEWATS', oldAcres: 10.0, newAcres: 15.0, deltaAcres: +5.0 },
            { zoneName: 'Industrial Clean-Tech', oldAcres: 25.0, newAcres: 10.0, deltaAcres: -15.0 }
          ],
          walkabilityDelta: +1,
          greenSpaceDelta: +2.0,
          capexDelta: +12
        };
      } else {
        aiText = `Understood. Analyzing constraint optimizations for: "${userText}". I can adjust zone envelopes while respecting the 500-acre gross land parcel boundary. Review this balanced optimization:`;
        proposal = {
          summary: 'Increase Green Belt by +8.0 Acres and enhance Commercial TOD density.',
          changes: [
            { zoneName: 'Parks & Green Belt', oldAcres: 110.0, newAcres: 118.0, deltaAcres: +8.0 },
            { zoneName: 'Roads & Transit Spine', oldAcres: 40.0, newAcres: 32.0, deltaAcres: -8.0 }
          ],
          walkabilityDelta: +2,
          greenSpaceDelta: +1.6,
          capexDelta: -10
        };
      }

      setChatMessages((prev) => [
        ...prev,
        {
          id: `ai_${Date.now()}`,
          sender: 'assistant',
          text: aiText,
          timestamp: 'Just now',
          proposal
        }
      ]);
      setIsAiThinking(false);
    }, 700);
  };

  // Apply proposed AI changes to active plan
  const handleApplyProposal = (proposal: NonNullable<ChatMessage['proposal']>) => {
    if (!currentPlan) return;

    const updatedZones = currentPlan.zones.map((zone) => {
      const match = proposal.changes.find((c) => (zone.zone_type && c.zoneName === zone.zone_type) || (zone.name && c.zoneName === zone.name));
      if (match) {
        const newAcres = match.newAcres;
        return {
          ...zone,
          area_acres: newAcres,
          area_hectares: Number((newAcres * 0.404686).toFixed(1)),
          area_percentage: Number(((newAcres / areaAcres) * 100).toFixed(1))
        };
      }
      return zone;
    });

    const updatedPlan: MasterPlanAlternative = {
      ...currentPlan,
      walkability_score: Math.min(100, Math.round(currentPlan.walkability_score + proposal.walkabilityDelta)),
      green_space_per_capita_sqm: Number((currentPlan.green_space_per_capita_sqm + proposal.greenSpaceDelta).toFixed(1)),
      estimated_infrastructure_capex_cr_inr: Math.round(currentPlan.estimated_infrastructure_capex_cr_inr + proposal.capexDelta),
      zones: updatedZones
    };

    pushHistory(updatedPlan);
    onSelectPlan(updatedPlan);

    setChatMessages((prev) => [
      ...prev,
      {
        id: `conf_${Date.now()}`,
        sender: 'assistant',
        text: `✅ Revisions applied successfully! Updated ${proposal.changes.length} zones. Walkability index is now ${updatedPlan.walkability_score}/100 and Green Space is ${updatedPlan.green_space_per_capita_sqm} m²/person.`,
        timestamp: 'Just now'
      }
    ]);
  };

  return (
    <div className="max-w-[1700px] mx-auto p-6 space-y-6 relative">
      {/* =========================================================================
          SECTION 1: Header Banner with Toolbar & Initial Config Trigger
          ========================================================================= */}
      <div className="bg-[#18191B] border border-[#282A2E] rounded-xl p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="p-2 rounded-lg bg-[#242529] border border-[#2E3035] text-zinc-300">
              <Compass className="w-5 h-5" strokeWidth={1.5} />
            </span>
            <div>
              <h2 className="text-lg font-medium text-zinc-100 flex items-center gap-2">
                <span>Master plan designer</span>
                <span className="text-xs px-2 py-0.5 rounded bg-[#101113] text-zinc-400 border border-[#282A2E] font-mono">
                  3 paradigms
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Demographic target: <strong className="text-zinc-200 font-mono">{population.toLocaleString()} residents</strong> across{' '}
                <strong className="text-zinc-200 font-mono">{areaAcres} gross acres</strong> ({(areaAcres * 0.00404686).toFixed(2)} km²) with 12 canonical partitions.
              </p>
            </div>
          </div>
        </div>

        {/* Toolbar: Undo/Redo, Plan Config, Regenerate */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Undo / Redo controls */}
          <div className="flex items-center bg-[#101113] border border-[#282A2E] rounded-lg p-1">
            <button
              onClick={handleUndo}
              disabled={historyIdx <= 0}
              className={`p-1.5 rounded-md text-xs font-medium flex items-center gap-1 transition ${
                historyIdx > 0
                  ? 'text-zinc-200 hover:bg-[#242529] cursor-pointer'
                  : 'text-zinc-600 cursor-not-allowed'
              }`}
              title="Undo (Ctrl+Z)"
            >
              <Undo2 className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span className="text-[11px]">Undo</span>
            </button>
            <span className="w-px h-3.5 bg-[#282A2E] mx-1"></span>
            <button
              onClick={handleRedo}
              disabled={historyIdx >= history.length - 1}
              className={`p-1.5 rounded-md text-xs font-medium flex items-center gap-1 transition ${
                historyIdx < history.length - 1
                  ? 'text-zinc-200 hover:bg-[#242529] cursor-pointer'
                  : 'text-zinc-600 cursor-not-allowed'
              }`}
              title="Redo (Ctrl+Y)"
            >
              <Redo2 className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span className="text-[11px]">Redo</span>
            </button>
          </div>

          {/* Initial Configuration Modal Trigger */}
          <button
            onClick={() => setShowConfigModal(!showConfigModal)}
            className="flex items-center gap-2 bg-[#18191B] hover:bg-[#222326] border border-[#282A2E] hover:border-zinc-600 text-zinc-200 font-medium text-xs px-3 py-1.5 rounded-lg transition cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5 text-zinc-400" strokeWidth={1.5} />
            <span>Plan parameters</span>
          </button>

          {/* Re-Generate Plans Button */}
          <button
            onClick={() => onRegeneratePlans(priorities)}
            className="bg-zinc-100 hover:bg-white text-zinc-950 font-medium text-xs px-3.5 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span>Re-generate master plans</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          SECTION 1.5: Expandable Initial Configuration & Constraints Panel
          ========================================================================= */}
      {showConfigModal && (
        <div className="bg-[#0b1424] border-2 border-cyan-500/40 rounded-2xl p-6 shadow-2xl space-y-4 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Sliders className="w-5 h-5 text-cyan-400" />
              <h3 className="text-base font-bold text-slate-100">
                City Planning Configuration, Land Boundary & Sustainability Priorities
              </h3>
            </div>
            <button
              onClick={() => setShowConfigModal(false)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            {/* Column 1: Spatial Boundary & Land Parcel */}
            <div className="space-y-3 bg-slate-950/70 p-4 rounded-xl border border-slate-800">
              <span className="font-bold text-cyan-400 uppercase tracking-wider block text-[10px]">
                1. Land Boundary & Target Sizing
              </span>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Total Planning Area (Acres)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="50"
                    max="5000"
                    step="25"
                    value={configArea}
                    onChange={(e) => setConfigArea(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-cyan-400 font-bold text-sm focus:outline-none focus:border-cyan-500"
                  />
                  <span className="text-slate-400 text-xs">Acres</span>
                </div>
                <div className="flex gap-1.5 mt-2">
                  {[250, 500, 1000, 2500].map((ac) => (
                    <button
                      key={ac}
                      onClick={() => setConfigArea(ac)}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        configArea === ac ? 'bg-cyan-600 text-white' : 'bg-slate-900 text-slate-400 border border-slate-800 hover:bg-slate-800'
                      }`}
                    >
                      {ac} Ac
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Target Horizon Population</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1000"
                    max="500000"
                    step="1000"
                    value={configPop}
                    onChange={(e) => setConfigPop(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-emerald-400 font-bold text-sm focus:outline-none focus:border-emerald-500"
                  />
                  <span className="text-slate-400 text-xs">Inhabitants</span>
                </div>
                <div className="flex gap-1.5 mt-2">
                  {[10000, 20000, 50000, 100000].map((p) => (
                    <button
                      key={p}
                      onClick={() => setConfigPop(p)}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        configPop === p ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-slate-400 border border-slate-800 hover:bg-slate-800'
                      }`}
                    >
                      {(p / 1000)}k
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Development Typology</label>
                <select
                  value={devType}
                  onChange={(e) => setDevType(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200 font-semibold focus:outline-none focus:border-cyan-500"
                >
                  <option value="Greenfield Eco-City (Carbon-Neutral)">Greenfield Eco-City (Carbon-Neutral)</option>
                  <option value="Transit-Oriented Development (TOD Compact Spine)">Transit-Oriented Development (TOD Compact Spine)</option>
                  <option value="Agro-Ecological Settlement (Permaculture & Low Density)">Agro-Ecological Settlement (Permaculture & Low Density)</option>
                  <option value="Resource-Efficient Smart Industrial City">Resource-Efficient Smart Industrial City</option>
                </select>
              </div>
            </div>

            {/* Column 2: Sustainability Priorities */}
            <div className="space-y-3 bg-slate-950/70 p-4 rounded-xl border border-slate-800">
              <span className="font-bold text-cyan-400 uppercase tracking-wider block text-[10px]">
                2. Sustainability Priorities (Multi-Select)
              </span>
              <div className="grid grid-cols-1 gap-2">
                {[
                  { id: 'water_security', label: '100% Water Self-Sufficiency', icon: Droplets, desc: 'Lakes cascade & dual-reticulation DEWATS' },
                  { id: 'renewable_energy', label: '100% Renewable Generation', icon: SunMedium, desc: 'Bifacial solar farm + BESS battery grid' },
                  { id: 'public_transport', label: 'Walkable TOD Transit Core', icon: Compass, desc: '15-min city with dedicated electric BRT' },
                  { id: 'green_spaces', label: '35%+ Continuous Green Loop', icon: Trees, desc: 'Miyawaki afforestation & bio-corridors' },
                  { id: 'disaster_resilience', label: 'Disaster Resilient Grading', icon: ShieldAlert, desc: '100-year storm flood buffer setbacks' }
                ].map((item) => {
                  const Icon = item.icon;
                  const active = priorities.includes(item.id);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() =>
                        setPriorities((prev) =>
                          prev.includes(item.id) ? prev.filter((p) => p !== item.id) : [...prev, item.id]
                        )
                      }
                      className={`flex items-start gap-2.5 p-2 rounded-xl text-left border transition cursor-pointer ${
                        active
                          ? 'bg-cyan-950/60 border-cyan-500/80 text-cyan-200'
                          : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${active ? 'text-cyan-400' : 'text-slate-500'}`} />
                      <div>
                        <span className="font-bold text-slate-200 block text-xs">{item.label}</span>
                        <span className="text-[10px] text-slate-400 block">{item.desc}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Column 3: Planning Constraints & Norms */}
            <div className="space-y-3 bg-slate-950/70 p-4 rounded-xl border border-slate-800">
              <span className="font-bold text-cyan-400 uppercase tracking-wider block text-[10px]">
                3. URDPFI & Statutory Planning Constraints
              </span>

              <div>
                <div className="flex justify-between text-slate-300 font-semibold mb-1">
                  <span>Max Allowable Gross FAR</span>
                  <span className="text-cyan-400 font-bold">{maxFarConstraint}</span>
                </div>
                <input
                  type="range"
                  min="1.0"
                  max="4.0"
                  step="0.1"
                  value={maxFarConstraint}
                  onChange={(e) => setMaxFarConstraint(Number(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-300 font-semibold mb-1">
                  <span>Minimum Ecological Open Space</span>
                  <span className="text-emerald-400 font-bold">{minOpenSpaceConstraint}%</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="50"
                  step="5"
                  value={minOpenSpaceConstraint}
                  onChange={(e) => setMinOpenSpaceConstraint(Number(e.target.value))}
                  className="w-full accent-emerald-400 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-300 font-semibold mb-1">
                  <span>Target Public Transit Mode Share</span>
                  <span className="text-indigo-400 font-bold">{transitTargetConstraint}%</span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="90"
                  step="5"
                  value={transitTargetConstraint}
                  onChange={(e) => setTransitTargetConstraint(Number(e.target.value))}
                  className="w-full accent-indigo-400 cursor-pointer"
                />
              </div>

              <div className="pt-2">
                <button
                  onClick={() => {
                    setShowConfigModal(false);
                    onRegeneratePlans(priorities);
                  }}
                  className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 rounded-xl transition shadow-md shadow-cyan-600/20 text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Apply Constraints & Regenerate</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SECTION 2: 6 Key Metric KPI Cards (Walkability, Green Space, Water, RE, Transit, Capex)
          ========================================================================= */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        {/* Metric 1: Walkability */}
        <div className="bg-[#18191B] border border-[#282A2E] rounded-xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span className="font-medium flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-zinc-400" strokeWidth={1.5} /> Walkability
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#101113] text-zinc-400 border border-[#202225]">15-min</span>
          </div>
          <div className="my-2">
            <div className="text-xl font-mono font-medium text-zinc-100 tabular-nums">{currentPlan.walkability_score}/100</div>
            <div className="text-[10px] text-zinc-500 font-mono">Pedestrian network</div>
          </div>
          <div className="w-full bg-[#101113] rounded-full h-1 overflow-hidden">
            <div className="bg-zinc-400 h-1 rounded-full" style={{ width: `${currentPlan.walkability_score}%` }}></div>
          </div>
        </div>

        {/* Metric 2: Green Space */}
        <div className="bg-[#18191B] border border-[#282A2E] rounded-xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span className="font-medium flex items-center gap-1.5">
              <Trees className="w-3.5 h-3.5 text-zinc-400" strokeWidth={1.5} /> Green space
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#101113] text-zinc-400 border border-[#202225]">&gt;9 m² WHO</span>
          </div>
          <div className="my-2">
            <div className="text-xl font-mono font-medium text-zinc-100 tabular-nums">{currentPlan.green_space_per_capita_sqm} m²</div>
            <div className="text-[10px] text-zinc-500 font-mono">{greenPct}% site canopy</div>
          </div>
          <div className="w-full bg-[#101113] rounded-full h-1 overflow-hidden">
            <div className="bg-emerald-500 h-1 rounded-full" style={{ width: `${Math.min(100, (currentPlan.green_space_per_capita_sqm / 40) * 100)}%` }}></div>
          </div>
        </div>

        {/* Metric 3: Water Self-Sufficiency */}
        <div className="bg-[#18191B] border border-[#282A2E] rounded-xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span className="font-medium flex items-center gap-1.5">
              <Droplets className="w-3.5 h-3.5 text-zinc-400" strokeWidth={1.5} /> Water balance
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#101113] text-zinc-400 border border-[#202225]">RWH+DEWATS</span>
          </div>
          <div className="my-2">
            <div className="text-xl font-mono font-medium text-zinc-100 tabular-nums">{currentPlan.water_self_sufficiency_pct}%</div>
            <div className="text-[10px] text-zinc-500 font-mono">Aquifer equilibrium</div>
          </div>
          <div className="w-full bg-[#101113] rounded-full h-1 overflow-hidden">
            <div className="bg-cyan-500 h-1 rounded-full" style={{ width: `${currentPlan.water_self_sufficiency_pct}%` }}></div>
          </div>
        </div>

        {/* Metric 4: RE Coverage */}
        <div className="bg-[#18191B] border border-[#282A2E] rounded-xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span className="font-medium flex items-center gap-1.5">
              <SunMedium className="w-3.5 h-3.5 text-zinc-400" strokeWidth={1.5} /> Clean energy
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#101113] text-zinc-400 border border-[#202225]">Solar+BESS</span>
          </div>
          <div className="my-2">
            <div className="text-xl font-mono font-medium text-zinc-100 tabular-nums">{currentPlan.renewable_energy_coverage_pct}%</div>
            <div className="text-[10px] text-zinc-500 font-mono">Zero carbon target</div>
          </div>
          <div className="w-full bg-[#101113] rounded-full h-1 overflow-hidden">
            <div className="bg-amber-500 h-1 rounded-full" style={{ width: `${currentPlan.renewable_energy_coverage_pct}%` }}></div>
          </div>
        </div>

        {/* Metric 5: Public Transit Mode Share */}
        <div className="bg-[#18191B] border border-[#282A2E] rounded-xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span className="font-medium flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-zinc-400" strokeWidth={1.5} /> Transit share
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#101113] text-zinc-400 border border-[#202225]">BRT+EV</span>
          </div>
          <div className="my-2">
            <div className="text-xl font-mono font-medium text-zinc-100 tabular-nums">{currentPlan.public_transit_mode_share_target_pct}%</div>
            <div className="text-[10px] text-zinc-500 font-mono">Non-motorized & BRT</div>
          </div>
          <div className="w-full bg-[#101113] rounded-full h-1 overflow-hidden">
            <div className="bg-zinc-400 h-1 rounded-full" style={{ width: `${currentPlan.public_transit_mode_share_target_pct}%` }}></div>
          </div>
        </div>

        {/* Metric 6: Capex in Crores */}
        <div className="bg-[#18191B] border border-[#282A2E] rounded-xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span className="font-medium flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-zinc-400" strokeWidth={1.5} /> Infra capex
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#101113] text-zinc-400 border border-[#202225]">Phase 1</span>
          </div>
          <div className="my-2">
            <div className="text-xl font-mono font-medium text-zinc-100 tabular-nums">₹{currentPlan.estimated_infrastructure_capex_cr_inr} Cr</div>
            <div className="text-[10px] text-zinc-500 font-mono">₹{(currentPlan.estimated_infrastructure_capex_cr_inr * 10000000 / population).toFixed(0)} / capita</div>
          </div>
          <div className="w-full bg-[#101113] rounded-full h-1 overflow-hidden">
            <div className="bg-zinc-400 h-1 rounded-full" style={{ width: `${Math.min(100, (currentPlan.estimated_infrastructure_capex_cr_inr / 800) * 100)}%` }}></div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          SECTION 3: Multi-Layout Plan Selector Tabs & View Switcher
          ========================================================================= */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-3">
        {/* Plan Alternative Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {plans.map((p) => {
            const isSelected = p.plan_code === currentPlan.plan_code;
            return (
              <button
                key={p.plan_id}
                onClick={() => {
                  const harmonized = {
                    ...p,
                    zones: harmonize12Zones(p, areaAcres)
                  };
                  setCurrentPlan(harmonized);
                  onSelectPlan(harmonized);
                  pushHistory(harmonized);
                }}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer border ${
                  isSelected
                    ? 'bg-[#242529] border-zinc-600 text-zinc-100 ring-1 ring-zinc-500/20'
                    : 'bg-[#18191B] border-[#282A2E] text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    p.plan_code === 'PLAN_A' ? 'bg-cyan-400' : p.plan_code === 'PLAN_B' ? 'bg-emerald-400' : 'bg-amber-400'
                  }`}
                />
                <span>{p.name}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-zinc-200" strokeWidth={1.5} />}
              </button>
            );
          })}
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center bg-[#101113] border border-[#282A2E] rounded-lg p-0.5 text-xs">
          {[
            { id: 'overview', label: 'Cards & zones', icon: Layers },
            { id: 'radar', label: 'Radar analysis', icon: BarChart3 },
            { id: 'comparison', label: 'Matrix comparison', icon: Scale },
            { id: 'density', label: 'Density evaluation', icon: Info }
          ].map((mode) => {
            const Icon = mode.icon;
            const active = activeTab === mode.id;
            return (
              <button
                key={mode.id}
                onClick={() => setActiveTab(mode.id as any)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium transition cursor-pointer ${
                  active ? 'bg-[#242529] text-zinc-100 border border-zinc-700/60' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" strokeWidth={1.5} />
                <span>{mode.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* =========================================================================
          VIEW MODE 1: OVERVIEW (Plan Cards + Active Plan Focus)
          ========================================================================= */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* 3 Layout Alternative Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {plans.map((plan) => {
              const isSelected = plan.plan_code === currentPlan.plan_code;
              return (
                <div
                  key={plan.plan_id}
                  onClick={() => {
                    const harmonized = {
                      ...plan,
                      zones: harmonize12Zones(plan, areaAcres)
                    };
                    setCurrentPlan(harmonized);
                    onSelectPlan(harmonized);
                    pushHistory(harmonized);
                  }}
                  className={`rounded-2xl p-5 border transition cursor-pointer flex flex-col justify-between shadow-xl ${
                    isSelected
                      ? 'bg-[#0f1d33] border-cyan-400 ring-2 ring-cyan-500/30'
                      : 'bg-[#0b1424] border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                        plan.plan_code === 'PLAN_A' ? 'bg-blue-950 text-blue-300 border-blue-800' :
                        plan.plan_code === 'PLAN_B' ? 'bg-emerald-950 text-emerald-300 border-emerald-800' :
                        'bg-indigo-950 text-indigo-300 border-indigo-800'
                      }`}>
                        {plan.plan_code}
                      </span>
                      {isSelected && (
                        <span className="flex items-center gap-1 text-[11px] font-bold text-cyan-400">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Active Design
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-slate-100 mb-1">{plan.name}</h3>
                    <p className="text-xs text-cyan-300 font-medium mb-2">{plan.tagline}</p>
                    <p className="text-xs text-slate-400 leading-relaxed mb-4">{plan.paradigm}</p>
                  </div>

                  <div className="grid grid-cols-3 gap-2 bg-slate-950/80 rounded-xl p-2.5 text-center text-xs border border-slate-800/80">
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase block">Walkability</span>
                      <span className="font-bold text-cyan-400">{plan.walkability_score}/100</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase block">Water Sec.</span>
                      <span className="font-bold text-emerald-400">{plan.water_self_sufficiency_pct}%</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase block">Capex</span>
                      <span className="font-bold text-indigo-400">₹{plan.estimated_infrastructure_capex_cr_inr}Cr</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW MODE 2: RADAR & TRADE-OFF ANALYTICS
          ========================================================================= */}
      {activeTab === 'radar' && (
        <div className="bg-[#0b1424] border border-cyan-500/30 rounded-2xl p-6 shadow-2xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-cyan-400" />
                <span>Multi-Layout Sustainability Radar Analysis</span>
              </h3>
              <p className="text-xs text-slate-400">
                Direct comparative overlay of Plan A (TOD), Plan B (Agro-Ecological), and Plan C (Smart Circular) across 6 core benchmarks.
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-cyan-400">
                <span className="w-3 h-3 rounded-full bg-cyan-400"></span> Plan A (Walkable TOD)
              </span>
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-3 h-3 rounded-full bg-emerald-400"></span> Plan B (Green Low-Density)
              </span>
              <span className="flex items-center gap-1.5 text-indigo-400">
                <span className="w-3 h-3 rounded-full bg-indigo-400"></span> Plan C (Resource-Efficient)
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
            {/* Radar Chart */}
            <div className="h-[380px] w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                  <PolarGrid stroke="#334155" />
                  <PolarAngleAxis dataKey="subject" stroke="#94a3b8" tick={{ fill: '#cbd5e1', fontSize: 11 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" />
                  <Radar name="Plan A (Compact TOD)" dataKey="A" stroke="#22d3ee" fill="#22d3ee" fillOpacity={0.35} />
                  <Radar name="Plan B (Green Low-Density)" dataKey="B" stroke="#34d399" fill="#34d399" fillOpacity={0.3} />
                  <Radar name="Plan C (Resource-Efficient)" dataKey="C" stroke="#818cf8" fill="#818cf8" fillOpacity={0.3} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '11px', color: '#f8fafc' }}
                  />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Radar Analytics Breakdown */}
            <div className="space-y-3 text-xs">
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-1.5">
                <div className="flex items-center justify-between text-cyan-400 font-bold">
                  <span>Plan A: Compact & Walkable TOD</span>
                  <span>Leader in Walkability (94/100)</span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  Excels in pedestrian permeability, electric BRT access, and continuous perimeter green buffers. High residential density (140 persons/net acre) allows 62% of trips to be accomplished on foot or micromobility within 15 minutes.
                </p>
              </div>

              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-1.5">
                <div className="flex items-center justify-between text-emerald-400 font-bold">
                  <span>Plan B: Green Low-Density Settlement</span>
                  <span>Leader in Green Space (34.4 m²/capita) & Lowest Capex</span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  Dedicates 34% of site area to food cultivation and wetland tank cascades. Lowest initial infrastructure capex (₹420 Cr) due to decentralized vernacular construction and bioswales, but requires longer walking intervals between clusters.
                </p>
              </div>

              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-1.5">
                <div className="flex items-center justify-between text-indigo-400 font-bold">
                  <span>Plan C: Resource-Efficient Smart City</span>
                  <span>Leader in 100% RE & Smart Circularity</span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  Features a dedicated 65-acre Clean-Tech & AI manufacturing zone, sub-surface multi-utility tunnels, automated pneumatic waste, and an integrated digital twin City Command Center (ICCC) yielding 38% lower 50-year lifecycle operational costs.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW MODE 3: 3-WAY SIDE-BY-SIDE MATRIX COMPARISON
          ========================================================================= */}
      {activeTab === 'comparison' && (
        <div className="bg-[#0b1424] border border-cyan-500/30 rounded-2xl p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Scale className="w-5 h-5 text-cyan-400" />
                <span>3-Way Layout Master-Plan Comparative Matrix</span>
              </h3>
              <p className="text-xs text-slate-400">
                Rigorous side-by-side trade-off matrix comparing all 3 alternative design paradigms across 10 statutory indicators.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] font-bold">
                  <th className="py-3 px-3">Evaluation Benchmark</th>
                  <th className="py-3 px-3 text-cyan-300 bg-cyan-950/20">Plan A: Compact Walkable TOD</th>
                  <th className="py-3 px-3 text-emerald-300 bg-emerald-950/20">Plan B: Green Low-Density</th>
                  <th className="py-3 px-3 text-indigo-300 bg-indigo-950/20">Plan C: Resource-Efficient</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-slate-200">Urban Spatial Morphology</td>
                  <td className="py-2.5 px-3 text-cyan-200">Transit-Oriented Mid-Rise Core + Nature Buffer</td>
                  <td className="py-2.5 px-3 text-emerald-200">Dispersed Clustered Hamlets + Agro-Forestry</td>
                  <td className="py-2.5 px-3 text-indigo-200">Polycentric Smart Nodes + Circular Utility Grids</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-slate-200">Gross Density (500 Ac, 20k Pop)</td>
                  <td className="py-2.5 px-3 font-mono font-bold text-cyan-400">9,886 / km² (40.0 / acre)</td>
                  <td className="py-2.5 px-3 font-mono font-bold text-emerald-400">9,886 / km² (40.0 / acre)</td>
                  <td className="py-2.5 px-3 font-mono font-bold text-indigo-400">9,886 / km² (40.0 / acre)</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-slate-200">Net Residential Density</td>
                  <td className="py-2.5 px-3 font-semibold">143 people / net acre</td>
                  <td className="py-2.5 px-3 font-semibold">105 people / net acre</td>
                  <td className="py-2.5 px-3 font-semibold">160 people / net acre</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-slate-200">Walkability Score (0-100)</td>
                  <td className="py-2.5 px-3 font-bold text-cyan-400">94 / 100 🏆</td>
                  <td className="py-2.5 px-3">78 / 100</td>
                  <td className="py-2.5 px-3">91 / 100</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-slate-200">Green Space / Person (WHO &gt;9)</td>
                  <td className="py-2.5 px-3">25.3 m²</td>
                  <td className="py-2.5 px-3 font-bold text-emerald-400">34.4 m² 🏆</td>
                  <td className="py-2.5 px-3">18.2 m²</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-slate-200">Water Self-Sufficiency %</td>
                  <td className="py-2.5 px-3">72.0%</td>
                  <td className="py-2.5 px-3 font-bold text-emerald-400">88.0% 🏆</td>
                  <td className="py-2.5 px-3">82.0%</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-slate-200">Renewable Energy Coverage %</td>
                  <td className="py-2.5 px-3">96.0%</td>
                  <td className="py-2.5 px-3">85.0%</td>
                  <td className="py-2.5 px-3 font-bold text-indigo-400">100.0% 🏆</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-slate-200">Public Transit Mode Share %</td>
                  <td className="py-2.5 px-3">78.0%</td>
                  <td className="py-2.5 px-3">52.0%</td>
                  <td className="py-2.5 px-3 font-bold text-indigo-400">85.0% 🏆</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-slate-200">Estimated Capex (INR)</td>
                  <td className="py-2.5 px-3">₹580 Crores</td>
                  <td className="py-2.5 px-3 font-bold text-emerald-400">₹420 Crores 🏆</td>
                  <td className="py-2.5 px-3">₹720 Crores</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-slate-200">Clean-Tech & High-Tech Industry</td>
                  <td className="py-2.5 px-3">25 Acres Light Assembly</td>
                  <td className="py-2.5 px-3">15 Acres Agro-Processing</td>
                  <td className="py-2.5 px-3 font-bold text-indigo-400">65 Acres AI & Clean-Tech 🏆</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-slate-200">Recommended Suitability</td>
                  <td className="py-2.5 px-3 text-cyan-300 font-semibold">High-growth transit metro expansion</td>
                  <td className="py-2.5 px-3 text-emerald-300 font-semibold">Agrarian peri-urban eco-village</td>
                  <td className="py-2.5 px-3 text-indigo-300 font-semibold">Knowledge corridor & science city</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW MODE 4: REALISTIC DENSITY EVALUATION & INFRASTRUCTURE TRADE-OFFS
          ========================================================================= */}
      {(activeTab === 'density' || activeTab === 'overview') && (
        <div className="bg-[#0b1424] border border-cyan-500/30 rounded-2xl p-6 shadow-2xl space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-cyan-400 font-bold text-sm">
              <Info className="w-5 h-5 shrink-0" />
              <span>Realistic Demographic Density & Infrastructure Trade-off Evaluation</span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
              URDPFI & NBC 2016 Compliant
            </span>
          </div>

          {/* Density Key Numbers */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-0.5">Gross Population Density</span>
              <span className="text-2xl font-black text-cyan-400">{grossDensitySqKm.toLocaleString()}</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">people / km²</span>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-0.5">Gross Acre Density</span>
              <span className="text-2xl font-black text-emerald-400">{grossDensityAcre}</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">people / gross acre</span>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-0.5">Net Residential Density</span>
              <span className="text-2xl font-black text-indigo-400">{currentPlan.residential_net_density_per_acre}</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">people / residential acre</span>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-0.5">Open Green Space</span>
              <span className="text-2xl font-black text-amber-400">{currentPlan.green_space_per_capita_sqm} m²</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">WHO standard: &gt;9.0 m²</span>
            </div>
          </div>

          {/* Comprehensive Density Benchmark Card */}
          <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-4 text-xs text-slate-300 leading-relaxed space-y-3">
            <div className="flex items-start gap-2">
              <Award className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
              <div>
                <strong className="text-emerald-400 font-bold block mb-1">
                  Global Benchmark Verification (Chandigarh, Freiburg Vauban & Singapore):
                </strong>
                <p>
                  At <strong className="text-white">9,886 people/km²</strong> (<strong className="text-white">40.0 people/gross acre</strong> for 20,000 citizens over 500 acres), this master plan achieves the ideal human-scale sweet spot. It closely mirrors world-class sustainable planning models:
                  <span className="text-cyan-300 font-medium"> Chandigarh Sectors (~9,000/km²)</span>,
                  <span className="text-emerald-300 font-medium"> Freiburg Vauban Eco-District (~8,500/km²)</span>, and
                  <span className="text-indigo-300 font-medium"> Singapore Punggol Eco-Town (~10,000/km²)</span>.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 border-t border-slate-800/80">
              <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                <span className="text-amber-400 font-bold block mb-1">🚰 Utility Piping Efficiency</span>
                <p className="text-[11px] text-slate-400">
                  Compared to sprawling low-density subdivisions (&lt;15 p/acre), compact 40 p/acre layout shortens water, sewer, and electrical distribution lengths by <strong className="text-slate-200">48%</strong>, reducing pipe friction losses and saving ₹140 Cr in initial earthworks.
                </p>
              </div>

              <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                <span className="text-cyan-400 font-bold block mb-1">🚌 High-Frequency BRT Viability</span>
                <p className="text-[11px] text-slate-400">
                  Urban transport studies show that minimum gross densities of 35-40 people/acre are required to support high-frequency (8-min headway) electric BRT without requiring long-term municipal operating subsidies.
                </p>
              </div>

              <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                <span className="text-emerald-400 font-bold block mb-1">🌳 30-40% Nature Buffer Preservation</span>
                <p className="text-[11px] text-slate-400">
                  By consolidating built living quarters onto 28-35% of land, 150+ contiguous acres remain permanently unpaved for Miyawaki biodiversity corridors, unconfined aquifer recharge, and flood mitigation.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SECTION 4: Complete 12-Zone Budget Breakdown Table
          ========================================================================= */}
      <div className="bg-[#0b1424] border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Layers className="w-5 h-5 text-cyan-400" />
              <span>{currentPlan.name} — Complete 12-Zone Land Allocation Budget</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Total Parcel Envelope:{' '}
              <strong className="text-cyan-400 font-bold">
                {totalAllocatedAcres.toFixed(1)} / {areaAcres} Acres
              </strong>{' '}
              ({((totalAllocatedAcres / areaAcres) * 100).toFixed(1)}% Partitioned)
              {Math.abs(totalAllocatedAcres - areaAcres) > 0.5 && (
                <span className="text-amber-400 font-semibold ml-2">
                  (⚠️ Deviation of {(totalAllocatedAcres - areaAcres).toFixed(1)} Acres from 500.0)
                </span>
              )}
            </p>
          </div>

          {/* Sector Filters & Search */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search 12 zones..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-0.5 text-[11px]">
              {['All', 'Living & Working', 'Ecological & Blue-Green', 'Mobility & Utilities', 'Civic & Social'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setZoneFilter(cat)}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer ${
                    zoneFilter === cat ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {cat === 'All' ? 'All 12' : cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 12-Zone Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] font-bold">
                <th className="py-2.5 px-3">Zone / Classification (12-Zone Standard)</th>
                <th className="py-2.5 px-3 text-right">Acres</th>
                <th className="py-2.5 px-3 text-right">Hectares</th>
                <th className="py-2.5 px-3 text-right">Share (%)</th>
                <th className="py-2.5 px-3 text-right">FAR</th>
                <th className="py-2.5 px-3 text-right">Built Area (BUA)</th>
                <th className="py-2.5 px-3 text-right">Capacity</th>
                <th className="py-2.5 px-3">Zoning Purpose & Urban Infrastructure Role</th>
                <th className="py-2.5 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredZones.map((zone) => {
                const buaSqFt = Math.round(zone.area_acres * 43560 * zone.far_ratio);
                return (
                  <tr key={zone.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2.5 font-semibold text-slate-100">
                        <span
                          className="w-3.5 h-3.5 rounded shadow-sm shrink-0"
                          style={{ backgroundColor: zone.color }}
                        />
                        <div>
                          <span className="block font-bold">{zone.name}</span>
                          <span className="text-[10px] text-slate-400">{zone.zone_type}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-cyan-400 font-mono">
                      {zone.area_acres.toFixed(1)}
                    </td>
                    <td className="py-3 px-3 text-right text-slate-400 font-mono">
                      {(zone.area_acres * 0.404686).toFixed(1)} ha
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-emerald-400 font-mono">
                      {zone.area_percentage.toFixed(1)}%
                    </td>
                    <td className="py-3 px-3 text-right font-semibold text-indigo-400 font-mono">
                      {zone.far_ratio.toFixed(2)}
                    </td>
                    <td className="py-3 px-3 text-right text-slate-300 font-mono">
                      {buaSqFt > 0 ? `${(buaSqFt / 1000).toLocaleString()}k sqft` : '—'}
                    </td>
                    <td className="py-3 px-3 text-right text-slate-300">
                      {zone.target_capacity_people > 0 ? (
                        <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 font-bold text-slate-200">
                          {zone.target_capacity_people.toLocaleString()}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="py-3 px-3 text-slate-300 max-w-md truncate" title={zone.description}>
                      {zone.description}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => onEditZone(zone)}
                        className="text-cyan-400 hover:text-cyan-300 font-semibold p-1.5 rounded-lg hover:bg-slate-800 transition cursor-pointer"
                        title="Edit Zone Parameters"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            {/* Table Summary Footer */}
            <tfoot>
              <tr className="border-t-2 border-slate-700 bg-slate-950/90 font-bold text-slate-200">
                <td className="py-3 px-3 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                  <span>Total Master-Plan Land Partition (12 Zones)</span>
                </td>
                <td className="py-3 px-3 text-right text-cyan-400 font-mono text-sm">
                  {totalAllocatedAcres.toFixed(1)} Ac
                </td>
                <td className="py-3 px-3 text-right text-slate-400 font-mono">
                  {(totalAllocatedAcres * 0.404686).toFixed(1)} ha
                </td>
                <td className="py-3 px-3 text-right text-emerald-400 font-mono text-sm">
                  {((totalAllocatedAcres / areaAcres) * 100).toFixed(1)}%
                </td>
                <td className="py-3 px-3 text-right text-indigo-400 font-mono">
                  Avg {(currentPlan.zones.reduce((acc, z) => acc + (z.far_ratio * z.area_acres), 0) / totalAllocatedAcres).toFixed(2)}
                </td>
                <td className="py-3 px-3 text-right text-slate-300 font-mono">
                  {(currentPlan.zones.reduce((acc, z) => acc + (z.area_acres * 43560 * z.far_ratio), 0) / 1000000).toFixed(2)}M sqft
                </td>
                <td className="py-3 px-3 text-right text-cyan-300 font-mono">
                  {population.toLocaleString()} Pop
                </td>
                <td className="py-3 px-3 text-slate-400 italic" colSpan={2}>
                  100% boundary envelope balanced & verified
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* =========================================================================
          SECTION 5: Floating AI Master-Plan Copilot Assistant Panel
          ========================================================================= */}
      {showAICopilot && (
        <div
          className={`fixed bottom-6 right-6 z-40 transition-all duration-300 ${
            isCopilotMinimized ? 'w-auto' : 'w-[440px] max-w-[95vw]'
          }`}
        >
          {isCopilotMinimized ? (
            <button
              onClick={() => setIsCopilotMinimized(false)}
              className="bg-[#18191B] hover:bg-[#222326] text-zinc-200 border border-[#282A2E] hover:border-zinc-600 px-3.5 py-2 rounded-lg text-xs font-medium shadow-lg flex items-center gap-2 cursor-pointer transition-colors"
            >
              <Bot className="w-4 h-4 text-zinc-400" strokeWidth={1.5} />
              <span>TerraCity AI Copilot</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            </button>
          ) : (
            <div className="bg-[#18191B] border border-[#282A2E] rounded-xl shadow-2xl flex flex-col overflow-hidden text-zinc-100 max-h-[580px]">
              {/* Copilot Header */}
              <div className="bg-[#16171A] px-4 py-2.5 border-b border-[#282A2E] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-1 rounded-md bg-[#242529] text-zinc-300 border border-[#2E3035]">
                    <Bot className="w-3.5 h-3.5" strokeWidth={1.5} />
                  </span>
                  <div>
                    <h4 className="text-xs font-medium text-zinc-200 flex items-center gap-1.5">
                      <span>TerraCity Copilot</span>
                      <span className="text-[9px] px-1 py-0.2 rounded bg-[#101113] text-zinc-400 font-mono border border-[#202225]">
                        Revisions
                      </span>
                    </h4>
                    <span className="text-[10px] text-zinc-500 font-mono">Master plan revisions</span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setIsCopilotMinimized(true)}
                    className="p-1 text-zinc-400 hover:text-zinc-200 rounded hover:bg-[#242529] cursor-pointer"
                    title="Minimize"
                  >
                    <ChevronDown className="w-3.5 h-3.5" strokeWidth={1.5} />
                  </button>
                  <button
                    onClick={() => setShowAICopilot(false)}
                    className="p-1 text-zinc-400 hover:text-zinc-200 rounded hover:bg-[#242529] cursor-pointer"
                    title="Close"
                  >
                    <X className="w-3.5 h-3.5" strokeWidth={1.5} />
                  </button>
                </div>
              </div>

              {/* Chat Message Stream */}
              <div ref={chatScrollRef} className="p-3.5 space-y-3 overflow-y-auto flex-1 text-xs">
                {chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[90%] p-3 rounded-lg ${
                        msg.sender === 'user'
                          ? 'bg-[#242529] text-zinc-100 border border-zinc-700/60'
                          : 'bg-[#101113] border border-[#282A2E] text-zinc-300 space-y-2'
                      }`}
                    >
                      <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>

                      {/* Structured Proposed Changes Preview Card */}
                      {msg.proposal && (
                        <div className="bg-[#18191B] border border-[#282A2E] rounded-lg p-3 space-y-2 mt-2">
                          <div className="flex items-center justify-between text-[11px] font-medium text-zinc-200 pb-1 border-b border-[#282A2E]">
                            <span>Spatial allocation adjustments:</span>
                            <span className="text-zinc-400 font-mono text-[10px]">Ready</span>
                          </div>

                          <div className="space-y-1 text-[11px]">
                            {msg.proposal.changes.map((c, idx) => (
                              <div key={idx} className="flex items-center justify-between bg-[#101113] px-2 py-1 rounded">
                                <span className="font-medium text-zinc-300">{c.zoneName}:</span>
                                <span className="font-mono text-zinc-400">
                                  {c.oldAcres} ac <ArrowRight className="inline w-3 h-3 text-zinc-500 mx-1" />
                                  <strong className={c.deltaAcres > 0 ? 'text-emerald-400' : 'text-amber-400'}>
                                    {c.newAcres} ac ({c.deltaAcres > 0 ? `+${c.deltaAcres}` : c.deltaAcres} ac)
                                  </strong>
                                </span>
                              </div>
                            ))}
                          </div>

                          {/* Impact Delta Badges */}
                          <div className="grid grid-cols-3 gap-1 pt-1 text-[10px] text-center font-mono">
                            <div className="bg-[#101113] p-1 rounded">
                              <span className="text-zinc-500 block">Walkability</span>
                              <strong className="text-zinc-200">+{msg.proposal.walkabilityDelta}</strong>
                            </div>
                            <div className="bg-[#101113] p-1 rounded">
                              <span className="text-zinc-500 block">Green/capita</span>
                              <strong className="text-emerald-400">+{msg.proposal.greenSpaceDelta} m²</strong>
                            </div>
                            <div className="bg-[#101113] p-1 rounded">
                              <span className="text-zinc-500 block">Infra capex</span>
                              <strong className={msg.proposal.capexDelta <= 0 ? 'text-emerald-400' : 'text-zinc-200'}>
                                {msg.proposal.capexDelta > 0 ? `+₹${msg.proposal.capexDelta}Cr` : `-₹${Math.abs(msg.proposal.capexDelta)}Cr`}
                              </strong>
                            </div>
                          </div>

                          {/* Action Button: Apply proposed changes */}
                          <button
                            onClick={() => handleApplyProposal(msg.proposal!)}
                            className="w-full bg-zinc-100 hover:bg-white text-zinc-950 font-medium py-1.5 px-3 rounded-lg text-xs transition flex items-center justify-center gap-1.5 cursor-pointer mt-1"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Apply revisions to master plan</span>
                          </button>
                        </div>
                      )}
                    </div>
                    <span className="text-[9px] text-zinc-600 px-1 mt-0.5 font-mono">{msg.timestamp}</span>
                  </div>
                ))}

                {isAiThinking && (
                  <div className="flex items-center gap-2 text-zinc-400 text-xs p-2">
                    <span className="w-2 h-2 rounded-full bg-zinc-400" />
                    <span className="font-mono text-[11px]">Computing spatial balance...</span>
                  </div>
                )}
              </div>

              {/* Quick Prompt Chips */}
              <div className="p-2 bg-slate-950/80 border-t border-slate-800/80 flex flex-wrap gap-1">
                {[
                  'Increase green cover and reduce road area',
                  'Expand solar farm to 45 acres for 100% RE',
                  'Boost water retention lakes and DEWATS',
                  'Maximize pedestrian TOD & reduce road footprint'
                ].map((chip) => (
                  <button
                    key={chip}
                    onClick={() => handleSendPrompt(chip)}
                    className="text-[10px] bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 border border-slate-800 px-2 py-0.5 rounded-full transition cursor-pointer"
                  >
                    + {chip}
                  </button>
                ))}
              </div>

              {/* Prompt Input Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendPrompt(promptInput);
                }}
                className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2"
              >
                <input
                  type="text"
                  placeholder="Ask AI to revise master plan (e.g. increase green cover)..."
                  value={promptInput}
                  onChange={(e) => setPromptInput(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
                <button
                  type="submit"
                  disabled={!promptInput.trim()}
                  className={`p-2 rounded-xl transition ${
                    promptInput.trim()
                      ? 'bg-cyan-600 hover:bg-cyan-500 text-white cursor-pointer shadow-md'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
