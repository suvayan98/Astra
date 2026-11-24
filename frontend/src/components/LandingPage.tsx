import React, { useEffect, useRef, useState } from 'react';
import {
  Globe2,
  ArrowRight,
  ShieldCheck,
  Compass,
  Layers,
  Droplets,
  SunMedium,
  Trees,
  Clock,
  Cpu,
  FileText,
  Activity,
  CheckCircle2,
  Zap,
  Building2,
  MapPin,
  BarChart3,
  ChevronRight,
  Database,
  Radio,
  Satellite,
  Waves,
  Maximize2,
  TrendingUp,
  Award,
  Play
} from 'lucide-react';

interface LandingPageProps {
  onStartPlanning: () => void;
  onSelectModule: (moduleId: string) => void;
  onOpenIsroModal?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartPlanning,
  onSelectModule,
  onOpenIsroModal
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [activeLayoutPlan, setActiveLayoutPlan] = useState<'A' | 'B' | 'C'>('A');
  const [activeSatelliteTab, setActiveSatelliteTab] = useState<'cartosat' | 'sentinel' | 'bhuvan' | 'mosdac'>('cartosat');

  // Canvas Geospatial Topographic Mesh & Telemetry Orbit
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 800);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 600);

    const handleResize = () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener('resize', handleResize);

    // Cadastral mesh nodes
    const numNodes = 40;
    const nodes: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      type: 'res' | 'green' | 'water' | 'energy' | 'transit';
    }> = [];

    const types: Array<'res' | 'green' | 'water' | 'energy' | 'transit'> = [
      'res',
      'green',
      'water',
      'energy',
      'transit'
    ];

    for (let i = 0; i < numNodes; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        type: types[i % types.length]
      });
    }

    let angle = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      angle += 0.005;

      // Subtle neutral coordinate grid
      ctx.lineWidth = 0.5;
      const gridStep = 48;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';

      for (let x = 0; x < width; x += gridStep) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridStep) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Calm topographic contour lines
      ctx.lineWidth = 1;
      for (let c = 1; c <= 4; c++) {
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.05 - c * 0.008})`;
        ctx.beginPath();
        const baseRadius = 140 + c * 44;
        for (let a = 0; a <= Math.PI * 2; a += 0.1) {
          const r =
            baseRadius +
            Math.sin(a * 4 + angle * 2) * 10 +
            Math.cos(a * 2 - angle) * 6;
          const px = width * 0.58 + Math.cos(a) * r * 1.3;
          const py = height * 0.5 + Math.sin(a) * r * 0.7;
          if (a === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.stroke();
      }

      // Interconnected network nodes
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        n.x += n.vx;
        n.y += n.vy;

        if (n.x < 0 || n.x > width) n.vx *= -1;
        if (n.y < 0 || n.y > height) n.vy *= -1;

        // Connections
        for (let j = i + 1; j < nodes.length; j++) {
          const n2 = nodes[j];
          const dist = Math.hypot(n.x - n2.x, n.y - n2.y);
          if (dist < 100) {
            const alpha = (1 - dist / 100) * 0.08;
            ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.lineWidth = 0.7;
            ctx.beginPath();
            ctx.moveTo(n.x, n.y);
            ctx.lineTo(n2.x, n2.y);
            ctx.stroke();
          }
        }

        // Quiet node points
        ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.beginPath();
        ctx.arc(n.x, n.y, 1.8, 0, Math.PI * 2);
        ctx.fill();
      }

      // Orbiting Satellite Track
      const centerX = width * 0.58;
      const centerY = height * 0.48;
      const orbitRx = 240;
      const orbitRy = 110;

      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(-0.2);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.setLineDash([4, 6]);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(0, 0, orbitRx, orbitRy, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      const satX = Math.cos(angle * 1.4) * orbitRx;
      const satY = Math.sin(angle * 1.4) * orbitRy;

      // Telemetry beam
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.2)';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(satX, satY);
      ctx.lineTo(0, 30);
      ctx.stroke();

      // Satellite body
      ctx.fillStyle = '#E4E4E7';
      ctx.beginPath();
      ctx.arc(satX, satY, 3.5, 0, Math.PI * 2);
      ctx.fill();

      // Solar arrays
      ctx.fillStyle = '#71717A';
      ctx.fillRect(satX - 10, satY - 1.5, 6, 3);
      ctx.fillRect(satX + 4, satY - 1.5, 6, 3);

      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const steps = [
    {
      step: '01',
      title: 'Boundary & Parcel Intake',
      subtitle: '500-Acre Cadastral Selection',
      desc: 'Draw or upload land boundaries anywhere across India. Compute precise geodesic surface area in acres, hectares, and square kilometers.',
      icon: MapPin,
      badge: 'GIS intake'
    },
    {
      step: '02',
      title: '12-Factor Multi-Criteria Analysis',
      subtitle: 'AHP Suitability Scoring',
      desc: 'Evaluate topography, slope grading, geological faults, soil bearing, flood lines, and aquifer depth with verified exclusion zones.',
      icon: Compass,
      badge: 'AHP engine'
    },
    {
      step: '03',
      title: 'Generative Master Plan Synthesis',
      subtitle: '12-Zone Statutory Budgeting',
      desc: 'Synthesize three distinct planning paradigms (Plans A, B, C) allocating residential, commercial, solar, green belts, and DEWATS facilities.',
      icon: Building2,
      badge: 'URDPFI code'
    },
    {
      step: '04',
      title: 'Multi-Decadal Simulation',
      subtitle: '100-Year Climate & Infrastructure Stress',
      desc: 'Simulate population surges, monsoon shifts, groundwater drawdown, and microgrid loads across 10, 20, 50, and 100-year forecast horizons.',
      icon: Clock,
      badge: 'Forecasting'
    }
  ];

  return (
    <div className="relative min-h-screen bg-[#101113] text-[#F4F4F5] overflow-x-hidden selection:bg-zinc-700 selection:text-white">
      {/* ========================================================================= */}
      {/* SECTION 1: HERO SECTION */}
      {/* ========================================================================= */}
      <section className="relative min-h-[88vh] flex items-center justify-center pt-10 pb-20 px-4 sm:px-6 lg:px-8 border-b border-[#282A2E] overflow-hidden">
        {/* Subtle Canvas Background */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none opacity-80 z-0"
        />

        <div className="relative z-10 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Hero Left: Copy & CTAs */}
          <div className="lg:col-span-7 space-y-6 text-left">
            {/* Status Metadata Tag */}
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#18191B] border border-[#282A2E] text-xs font-mono text-zinc-300">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <span>ISRO space portals • URDPFI and CPHEEO compliant</span>
            </div>

            {/* Main Headline - Plain Crisp White */}
            <h1 className="font-display font-medium text-4xl sm:text-5xl lg:text-6xl tracking-tight text-zinc-100 leading-[1.08]">
              Plan the cities of tomorrow
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-zinc-400 font-normal leading-relaxed max-w-2xl">
              Transform satellite intelligence, geospatial data, and multi-criteria optimization into
              sustainable urban master plans. Designed for India's greenfield smart settlements,
              industrial corridors, and regional planning authorities.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                onClick={onStartPlanning}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 font-medium text-sm transition-colors duration-150 cursor-pointer"
              >
                <span>Start planning</span>
                <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
              </button>

              <button
                onClick={() => {
                  const el = document.getElementById('how-it-works');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#18191B] hover:bg-[#222326] text-zinc-200 border border-[#282A2E] hover:border-zinc-600 text-sm font-medium transition-colors duration-150 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 text-zinc-400" strokeWidth={1.5} />
                <span>Explore platform</span>
              </button>
            </div>

            {/* Telemetry Status Line */}
            <div className="pt-3 flex flex-wrap items-center gap-6 text-xs text-zinc-500 font-mono">
              <div className="flex items-center gap-2">
                <Satellite className="w-3.5 h-3.5 text-zinc-400" strokeWidth={1.5} />
                <span>Cartosat-3 & Sentinel-2 active</span>
              </div>
              <div className="flex items-center gap-2">
                <Radio className="w-3.5 h-3.5 text-zinc-400" strokeWidth={1.5} />
                <span>Bhuvan WMS 1:50,000 synced</span>
              </div>
            </div>
          </div>

          {/* Hero Right: Precision Cadastral Card (The Moment) */}
          <div className="lg:col-span-5 relative">
            <div className="rounded-xl bg-[#18191B] border border-[#282A2E] p-5 shadow-lg">
              {/* Card Header */}
              <div className="flex items-center justify-between pb-3.5 border-b border-[#282A2E]">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  <span className="font-mono text-xs text-zinc-300">
                    Dholera SIR greenfield (500 acres)
                  </span>
                </div>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#222326] border border-[#2E3035] text-zinc-300">
                  Real-time FAR: 2.1
                </span>
              </div>

              {/* Master Plan Breakdown */}
              <div className="py-4 space-y-3.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-400">Synthesis model</span>
                  <span className="text-zinc-200 font-medium font-mono">Plan A • Compact TOD</span>
                </div>

                {/* Land Budget Progress Bars */}
                <div className="space-y-2.5 text-[11px] font-mono">
                  <div>
                    <div className="flex justify-between text-zinc-400 mb-1">
                      <span>Residential & civic core</span>
                      <span className="text-zinc-200 tabular-nums">145 acres (29.0%)</span>
                    </div>
                    <div className="h-1.5 w-full bg-[#101113] rounded-full overflow-hidden">
                      <div className="h-full bg-cyan-600 rounded-full w-[29%]" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-zinc-400 mb-1">
                      <span>Green loop & Miyawaki forest</span>
                      <span className="text-zinc-200 tabular-nums">115 acres (23.0%)</span>
                    </div>
                    <div className="h-1.5 w-full bg-[#101113] rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-600 rounded-full w-[23%]" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-zinc-400 mb-1">
                      <span>Solar microgrid & DEWATS</span>
                      <span className="text-zinc-200 tabular-nums">50 acres (10.0%)</span>
                    </div>
                    <div className="h-1.5 w-full bg-[#101113] rounded-full overflow-hidden">
                      <div className="h-full bg-amber-600 rounded-full w-[10%]" />
                    </div>
                  </div>
                </div>

                {/* Score Summary Metrics */}
                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[#282A2E]">
                  <div className="p-2.5 rounded-lg bg-[#101113] border border-[#202225] text-center">
                    <span className="text-[10px] text-zinc-500 block">Suitability</span>
                    <span className="font-mono font-medium text-xs text-zinc-200 tabular-nums">
                      84.2 / 100
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#101113] border border-[#202225] text-center">
                    <span className="text-[10px] text-zinc-500 block">Water balance</span>
                    <span className="font-mono font-medium text-xs text-cyan-400 tabular-nums">
                      +1.18 MLD
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#101113] border border-[#202225] text-center">
                    <span className="text-[10px] text-zinc-500 block">Clean energy</span>
                    <span className="font-mono font-medium text-xs text-zinc-200 tabular-nums">
                      100% RE
                    </span>
                  </div>
                </div>

                {/* Direct Action on Preview */}
                <button
                  onClick={() => onSelectModule('master_plan')}
                  className="w-full mt-2 py-2 rounded-lg bg-[#222326] hover:bg-[#282A2E] text-zinc-200 font-medium text-xs transition-colors duration-150 border border-[#2E3035] flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Open master plan designer</span>
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-400" strokeWidth={1.5} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Platform Metric Strip */}
        <div className="absolute bottom-0 left-0 right-0 bg-[#16171A] border-t border-[#282A2E] py-3">
          <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
            <div>
              <span className="font-mono font-medium text-base text-zinc-200 tabular-nums block">500 acres</span>
              <span className="text-[11px] text-zinc-500 font-mono">Standard planning block</span>
            </div>
            <div>
              <span className="font-mono font-medium text-base text-zinc-200 tabular-nums block">12 modules</span>
              <span className="text-[11px] text-zinc-500 font-mono">Spatial intelligence suite</span>
            </div>
            <div>
              <span className="font-mono font-medium text-base text-zinc-200 tabular-nums block">4 space hubs</span>
              <span className="text-[11px] text-zinc-500 font-mono">Bhoonidhi, Bhuvan, MOSDAC, VEDAS</span>
            </div>
            <div>
              <span className="font-mono font-medium text-base text-zinc-200 tabular-nums block">100-year</span>
              <span className="text-[11px] text-zinc-500 font-mono">Multi-decadal horizon</span>
            </div>
            <div className="col-span-2 md:col-span-1">
              <span className="font-mono font-medium text-base text-zinc-200 tabular-nums block">100% aligned</span>
              <span className="text-[11px] text-zinc-500 font-mono">URDPFI and CPHEEO</span>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 2: HOW IT WORKS (4-Step Pipeline) */}
      {/* ========================================================================= */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-2">
          <span className="text-xs font-mono text-zinc-400 bg-[#18191B] border border-[#282A2E] px-2.5 py-1 rounded-md">
            Planning pipeline
          </span>
          <h2 className="font-display font-medium text-3xl sm:text-4xl text-zinc-100">
            How TerraAI plans a smart settlement
          </h2>
          <p className="text-sm text-zinc-400">
            From raw satellite telemetry to statutory urban master plans, adhering to national and
            international urban development norms.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {steps.map((st, idx) => {
            const Icon = st.icon;
            const isCurrent = activeStep === idx;
            return (
              <div
                key={st.step}
                onClick={() => setActiveStep(idx)}
                className={`rounded-xl p-5 border transition-colors duration-150 cursor-pointer ${
                  isCurrent
                    ? 'bg-[#222326] border-zinc-600'
                    : 'bg-[#18191B] border-[#282A2E] hover:bg-[#202124]'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-xs text-zinc-500">{st.step}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#101113] text-zinc-400 border border-[#202225]">
                    {st.badge}
                  </span>
                </div>

                <div className="w-8 h-8 rounded-lg bg-[#242529] border border-[#2E3035] flex items-center justify-center text-zinc-300 mb-3">
                  <Icon className="w-4 h-4" strokeWidth={1.5} />
                </div>

                <h3 className="font-display font-medium text-base text-zinc-100 mb-1">{st.title}</h3>
                <span className="text-xs font-mono text-zinc-400 block mb-2">{st.subtitle}</span>
                <p className="text-xs text-zinc-400 leading-relaxed">{st.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 3: INTELLIGENT SITE SELECTION */}
      {/* ========================================================================= */}
      <section className="py-20 bg-[#16171A] border-y border-[#282A2E]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-4 text-left">
            <span className="text-xs font-mono text-zinc-400 bg-[#18191B] border border-[#282A2E] px-2.5 py-1 rounded-md">
              Analytical hierarchy process (AHP)
            </span>
            <h2 className="font-display font-medium text-3xl sm:text-4xl text-zinc-100">
              Site suitability & exclusion zoning
            </h2>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Every parcel undergoes a rigorous 12-factor Analytical Hierarchy Process. Topography,
              geological fault lines, 50-year flood lines, coastal regulation zones, and eco-sensitive
              corridors are flagged to prevent irreversible infrastructure conflicts.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" strokeWidth={1.5} />
                <div>
                  <h4 className="text-sm font-medium text-zinc-200">Topographic slope grading</h4>
                  <p className="text-xs text-zinc-400">
                    Slopes &gt;15% automatically flagged as non-buildable conservation zones. Slopes
                    &lt;5% prioritized for cost-effective foundation capex.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" strokeWidth={1.5} />
                <div>
                  <h4 className="text-sm font-medium text-zinc-200">50-year flood & inundation buffer</h4>
                  <p className="text-xs text-zinc-400">
                    Calculates extreme storm return periods with MOSDAC rainfall records, enforcing
                    hydrological setback buffers around water bodies.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" strokeWidth={1.5} />
                <div>
                  <h4 className="text-sm font-medium text-zinc-200">Soil bearing & ICAR lithology</h4>
                  <p className="text-xs text-zinc-400">
                    Integration with ICAR Soil Texture Triangle to evaluate shrink-swell potential
                    and recommend pile vs shallow foundation requirements.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => onSelectModule('suitability')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#242529] hover:bg-[#2C2E33] text-zinc-200 border border-[#2E3035] text-xs font-medium transition-colors duration-150 cursor-pointer"
              >
                <Compass className="w-3.5 h-3.5 text-zinc-400" strokeWidth={1.5} />
                <span>Explore site suitability engine</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="p-6 rounded-xl bg-[#18191B] border border-[#282A2E] space-y-4">
              <div className="flex items-center justify-between border-b border-[#282A2E] pb-3">
                <span className="font-display font-medium text-sm text-zinc-200">
                  12-factor AHP matrix breakdown
                </span>
                <span className="text-xs font-mono text-zinc-400">Score: 84.2% (Tier A)</span>
              </div>

              <div className="space-y-3">
                {[
                  { factor: 'Slope & relief (<5%)', score: 92, weight: '15%' },
                  { factor: 'Groundwater depth (CGWB safe)', score: 85, weight: '15%' },
                  { factor: 'Flood inundation safety', score: 80, weight: '12%' },
                  { factor: 'Transport corridor proximity', score: 88, weight: '10%' },
                  { factor: 'Soil bearing capacity', score: 78, weight: '10%' },
                  { factor: 'Solar & wind exposure', score: 94, weight: '8%' }
                ].map((item) => (
                  <div key={item.factor}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-zinc-300">{item.factor}</span>
                      <span className="font-mono text-zinc-500 tabular-nums">
                        {item.score}/100 • Wt: {item.weight}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-[#101113] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-zinc-400 rounded-full"
                        style={{ width: `${item.score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 4: SATELLITE ANALYSIS (ISRO / Earth Observation) */}
      {/* ========================================================================= */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-left">
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-2">
          <span className="text-xs font-mono text-zinc-400 bg-[#18191B] border border-[#282A2E] px-2.5 py-1 rounded-md">
            Earth observation
          </span>
          <h2 className="font-display font-medium text-3xl sm:text-4xl text-zinc-100">
            Multi-spectral satellite telemetry
          </h2>
          <p className="text-sm text-zinc-400">
            Directly querying Indian Space Research Organisation (ISRO) constellations and
            earth observation satellites for parcel-level urban accuracy.
          </p>
        </div>

        {/* Satellite Tabs */}
        <div className="flex justify-center gap-2 mb-8 overflow-x-auto">
          {[
            { id: 'cartosat', label: 'Cartosat DEM 10m', icon: Globe2 },
            { id: 'sentinel', label: 'Sentinel-2 MSI (NDVI)', icon: Trees },
            { id: 'bhuvan', label: 'Bhuvan LULC 1:50,000', icon: Layers },
            { id: 'mosdac', label: 'MOSDAC INSAT-3DR', icon: Waves }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSatelliteTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSatelliteTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-zinc-100 text-zinc-950'
                    : 'bg-[#18191B] text-zinc-400 hover:text-zinc-200 border border-[#282A2E]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" strokeWidth={1.5} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Display */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-[#18191B] border border-[#282A2E] rounded-xl p-6 sm:p-8">
          <div className="lg:col-span-7 space-y-4">
            {activeSatelliteTab === 'cartosat' && (
              <>
                <div className="inline-block px-2 py-0.5 rounded bg-[#101113] border border-[#282A2E] text-[10px] font-mono text-zinc-300">
                  Cartosat-3 stereo optical DEM
                </div>
                <h3 className="font-display font-medium text-2xl text-zinc-100">
                  10-meter precision elevation & terrain slope
                </h3>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                  Cartosat stereo DEM models micro-drainage channels, ridge lines, and natural flow
                  directions. By extracting contours at 1-meter intervals, the platform estimates cut-and-fill
                  grading volumes prior to civil works.
                </p>
                <div className="grid grid-cols-2 gap-3 pt-2 font-mono text-xs">
                  <div className="p-3 bg-[#101113] rounded-lg border border-[#282A2E]">
                    <span className="text-zinc-500 block text-[10px]">Spatial resolution</span>
                    <span className="text-zinc-200 font-medium tabular-nums">10 meters stereo</span>
                  </div>
                  <div className="p-3 bg-[#101113] rounded-lg border border-[#282A2E]">
                    <span className="text-zinc-500 block text-[10px]">Vertical accuracy</span>
                    <span className="text-zinc-200 font-medium tabular-nums">± 1.2 meters LE90</span>
                  </div>
                </div>
              </>
            )}

            {activeSatelliteTab === 'sentinel' && (
              <>
                <div className="inline-block px-2 py-0.5 rounded bg-[#101113] border border-[#282A2E] text-[10px] font-mono text-zinc-300">
                  Sentinel-2 multispectral instrument (MSI)
                </div>
                <h3 className="font-display font-medium text-2xl text-zinc-100">
                  Normalized Difference Vegetation Index (NDVI) & canopy health
                </h3>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                  Red and Near-Infrared band ratios compute seasonal vegetation vitality. Guarantees
                  that green spaces are situated over natural vegetative corridors to maintain local
                  biodiversity pathways.
                </p>
                <div className="grid grid-cols-2 gap-3 pt-2 font-mono text-xs">
                  <div className="p-3 bg-[#101113] rounded-lg border border-[#282A2E]">
                    <span className="text-zinc-500 block text-[10px]">Spectral bands</span>
                    <span className="text-zinc-200 font-medium">B4 (Red) & B8 (NIR)</span>
                  </div>
                  <div className="p-3 bg-[#101113] rounded-lg border border-[#282A2E]">
                    <span className="text-zinc-500 block text-[10px]">Revisit cycle</span>
                    <span className="text-zinc-200 font-medium tabular-nums">Every 5 days</span>
                  </div>
                </div>
              </>
            )}

            {activeSatelliteTab === 'bhuvan' && (
              <>
                <div className="inline-block px-2 py-0.5 rounded bg-[#101113] border border-[#282A2E] text-[10px] font-mono text-zinc-300">
                  Bhuvan ISRO geoportal LULC
                </div>
                <h3 className="font-display font-medium text-2xl text-zinc-100">
                  Land use & land cover classification (1:50,000)
                </h3>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                  National Remote Sensing Centre (NRSC) land-use categorization. Ensures prime
                  agricultural land is conserved and non-forest scrubland is allocated for civic
                  infrastructure and clean energy.
                </p>
                <div className="grid grid-cols-2 gap-3 pt-2 font-mono text-xs">
                  <div className="p-3 bg-[#101113] rounded-lg border border-[#282A2E]">
                    <span className="text-zinc-500 block text-[10px]">Classification scale</span>
                    <span className="text-zinc-200 font-medium tabular-nums">1:50,000</span>
                  </div>
                  <div className="p-3 bg-[#101113] rounded-lg border border-[#282A2E]">
                    <span className="text-zinc-500 block text-[10px]">OGC service</span>
                    <span className="text-zinc-200 font-medium">WMS / EPSG:4326</span>
                  </div>
                </div>
              </>
            )}

            {activeSatelliteTab === 'mosdac' && (
              <>
                <div className="inline-block px-2 py-0.5 rounded bg-[#101113] border border-[#282A2E] text-[10px] font-mono text-zinc-300">
                  MOSDAC meteorological data
                </div>
                <h3 className="font-display font-medium text-2xl text-zinc-100">
                  INSAT-3D/3DR extreme weather & solar insolation
                </h3>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                  Meteorological satellite telemetry powers extreme rainfall forecasts, heatwave
                  vulnerability maps, and Global Horizontal Irradiance (GHI) metrics for renewable
                  energy microgrid sizing.
                </p>
                <div className="grid grid-cols-2 gap-3 pt-2 font-mono text-xs">
                  <div className="p-3 bg-[#101113] rounded-lg border border-[#282A2E]">
                    <span className="text-zinc-500 block text-[10px]">Solar GHI mean</span>
                    <span className="text-zinc-200 font-medium tabular-nums">5.82 kWh/m²/day</span>
                  </div>
                  <div className="p-3 bg-[#101113] rounded-lg border border-[#282A2E]">
                    <span className="text-zinc-500 block text-[10px]">Storm peak (50-yr)</span>
                    <span className="text-zinc-200 font-medium tabular-nums">186 mm / 24 hr</span>
                  </div>
                </div>
              </>
            )}

            <div className="pt-2">
              <button
                onClick={() => onSelectModule('map')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#242529] hover:bg-[#2C2E33] text-zinc-200 border border-[#2E3035] text-xs font-medium transition-colors duration-150 cursor-pointer"
              >
                <Layers className="w-3.5 h-3.5 text-zinc-400" strokeWidth={1.5} />
                <span>Open GIS map workspace</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="rounded-xl bg-[#101113] border border-[#282A2E] p-4 text-center">
              <div className="h-44 w-full bg-[#18191B] rounded-lg border border-[#202225] flex flex-col items-center justify-center relative">
                <Satellite className="w-10 h-10 text-zinc-400 mb-2" strokeWidth={1.5} />
                <span className="text-xs font-mono text-zinc-300">Cartographic viewport</span>
                <span className="text-[10px] font-mono text-zinc-500 mt-1 tabular-nums">
                  22.2530° N, 72.1920° E • 500 acres
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 5: MASTER PLAN GENERATOR */}
      {/* ========================================================================= */}
      <section className="py-20 bg-[#16171A] border-t border-[#282A2E]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14 space-y-2">
            <span className="text-xs font-mono text-zinc-400 bg-[#18191B] border border-[#282A2E] px-2.5 py-1 rounded-md">
              Generative zoning
            </span>
            <h2 className="font-display font-medium text-3xl sm:text-4xl text-zinc-100">
              Master plan generator: 3 alternative paradigms
            </h2>
            <p className="text-sm text-zinc-400">
              Instantly evaluate and adjust three balanced master plans across 12 distinct land-use
              zones with FAR budgeting and population density balancing.
            </p>
          </div>

          {/* Plan Selector Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
            {[
              {
                id: 'A',
                name: 'Plan A: Compact & Walkable TOD',
                desc: 'High-density transit-oriented core, 15-minute pedestrian catchment, 42.4% open space.',
                badge: 'Recommended',
                walkScore: 92,
                greenCapita: 23.3,
                capex: '₹480 Cr'
              },
              {
                id: 'B',
                name: 'Plan B: Green Eco-Settlement',
                desc: 'Low-density biophilic layout, continuous urban forest buffers, and agricultural preservation.',
                badge: 'Max green',
                walkScore: 78,
                greenCapita: 34.5,
                capex: '₹540 Cr'
              },
              {
                id: 'C',
                name: 'Plan C: Smart Clean-Tech Hub',
                desc: 'Industrial-tech synergy, high solar farm allocation, zero-liquid-discharge microgrid.',
                badge: 'Industrial',
                walkScore: 84,
                greenCapita: 20.1,
                capex: '₹510 Cr'
              }
            ].map((p) => {
              const isSelected = activeLayoutPlan === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => setActiveLayoutPlan(p.id as any)}
                  className={`rounded-xl p-5 border transition-colors duration-150 cursor-pointer ${
                    isSelected
                      ? 'bg-[#222326] border-zinc-600 ring-1 ring-zinc-500/30'
                      : 'bg-[#18191B] border-[#282A2E] hover:bg-[#202124]'
                  }`}
                >
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-mono text-xs font-medium text-zinc-400">Plan {p.id}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#101113] text-zinc-300 border border-[#202225]">
                      {p.badge}
                    </span>
                  </div>
                  <h3 className="font-display font-medium text-base text-zinc-100 mb-2">{p.name}</h3>
                  <p className="text-xs text-zinc-400 mb-4 leading-relaxed">{p.desc}</p>

                  <div className="grid grid-cols-3 gap-2 font-mono text-[11px] pt-3 border-t border-[#282A2E]">
                    <div>
                      <span className="text-zinc-500 block text-[9px]">Walkability</span>
                      <span className="text-zinc-200 tabular-nums">{p.walkScore}/100</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block text-[9px]">Green/capita</span>
                      <span className="text-emerald-400 tabular-nums">{p.greenCapita} m²</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block text-[9px]">Est. capex</span>
                      <span className="text-zinc-200 tabular-nums">{p.capex}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 12-Zone Allocation Table Overview */}
          <div className="rounded-xl bg-[#18191B] border border-[#282A2E] p-6 text-left">
            <div className="flex flex-wrap items-center justify-between pb-4 border-b border-[#282A2E] gap-2">
              <div>
                <h4 className="font-display font-medium text-base text-zinc-100">
                  URDPFI 12-zone land allocation budget (Plan {activeLayoutPlan})
                </h4>
                <p className="text-xs text-zinc-400">
                  Planning boundary: 500 acres • Target population: 20,000 residents
                </p>
              </div>
              <button
                onClick={() => onSelectModule('master_plan')}
                className="px-3.5 py-1.5 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-medium transition-colors duration-150 cursor-pointer"
              >
                Open zone editor
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-4 text-xs font-mono">
              {[
                { name: 'Residential', acres: 125, color: '#3B82F6', far: '2.5' },
                { name: 'Commercial', acres: 45, color: '#6366F1', far: '3.0' },
                { name: 'Parks & green belt', acres: 115, color: '#10B981', far: '0.0' },
                { name: 'Water bodies & RWH', acres: 40, color: '#06B6D4', far: '0.0' },
                { name: 'Transit & roads', acres: 70, color: '#71717A', far: 'N/A' },
                { name: 'Solar microgrid', acres: 35, color: '#F59E0B', far: 'N/A' },
                { name: 'Clean industry', acres: 30, color: '#8B5CF6', far: '1.5' },
                { name: 'Hospitals & health', acres: 10, color: '#EF4444', far: '2.0' },
                { name: 'Schools & civic', acres: 15, color: '#F97316', far: '1.8' },
                { name: 'DEWATS recycling', acres: 5, color: '#059669', far: 'N/A' },
                { name: 'Solid waste recovery', acres: 5, color: '#D97706', far: 'N/A' },
                { name: 'Agro buffer', acres: 5, color: '#84CC16', far: 'N/A' }
              ].map((z) => (
                <div key={z.name} className="p-3 rounded-lg bg-[#101113] border border-[#282A2E]">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: z.color }} />
                    <span className="text-zinc-200 font-medium truncate">{z.name}</span>
                  </div>
                  <div className="flex justify-between text-zinc-500 text-[10px] tabular-nums">
                    <span>{z.acres} acres</span>
                    <span>FAR: {z.far}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 6: MULTI-DECADAL SIMULATIONS (10-100 YRS) */}
      {/* ========================================================================= */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-left">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-4">
            <span className="text-xs font-mono text-zinc-400 bg-[#18191B] border border-[#282A2E] px-2.5 py-1 rounded-md">
              Long-term resilience
            </span>
            <h2 className="font-display font-medium text-3xl sm:text-4xl text-zinc-100">
              100-year infrastructure simulation
            </h2>
            <p className="text-sm text-zinc-400 leading-relaxed">
              TerraAI models multi-decadal growth trajectories at 10, 20, 50, and 100-year intervals,
              stress-testing water tables, electricity grid capacity, solid waste, and heat island
              expansion.
            </p>

            <div className="grid grid-cols-2 gap-3 font-mono text-xs">
              <div className="p-4 rounded-xl bg-[#18191B] border border-[#282A2E]">
                <Clock className="w-4 h-4 text-zinc-400 mb-2" strokeWidth={1.5} />
                <h4 className="font-medium text-zinc-200 mb-1">Decadal growth waves</h4>
                <p className="text-zinc-500 text-[11px]">
                  Simulates population growth with automatic FAR densification triggers.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#18191B] border border-[#282A2E]">
                <Droplets className="w-4 h-4 text-zinc-400 mb-2" strokeWidth={1.5} />
                <h4 className="font-medium text-zinc-200 mb-1">Aquifer depletion guard</h4>
                <p className="text-zinc-500 text-[11px]">
                  Monitors CGWB groundwater stress to ensure extraction never surpasses recharge.
                </p>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => onSelectModule('simulation')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#242529] hover:bg-[#2C2E33] text-zinc-200 border border-[#2E3035] text-xs font-medium transition-colors duration-150 cursor-pointer"
              >
                <Activity className="w-3.5 h-3.5 text-zinc-400" strokeWidth={1.5} />
                <span>Launch simulation engine</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="p-6 rounded-xl bg-[#18191B] border border-[#282A2E] space-y-4">
              <div className="flex items-center justify-between border-b border-[#282A2E] pb-3">
                <span className="font-display font-medium text-sm text-zinc-200">
                  Trajectory: 2026 → 2126 projections
                </span>
                <span className="text-xs font-mono text-zinc-400">Scenario: Resilient TOD</span>
              </div>

              <div className="space-y-2.5 font-mono text-xs">
                {[
                  { yr: 'Year 10 (2036)', pop: '35,000', water: '5.67 MLD', re: '100% RE', stress: 'Low' },
                  { yr: 'Year 20 (2046)', pop: '58,000', water: '9.39 MLD', re: '98% RE', stress: 'Balanced' },
                  { yr: 'Year 50 (2076)', pop: '95,000', water: '15.39 MLD', re: '95% RE', stress: 'Managed' },
                  { yr: 'Year 100 (2126)', pop: '140,000', water: '22.68 MLD', re: '92% RE', stress: 'Resilient' }
                ].map((s) => (
                  <div
                    key={s.yr}
                    className="flex items-center justify-between p-3 rounded-lg bg-[#101113] border border-[#282A2E]"
                  >
                    <div>
                      <span className="font-medium text-zinc-200 block">{s.yr}</span>
                      <span className="text-[10px] text-zinc-500 tabular-nums">Pop: {s.pop}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-zinc-200 font-medium tabular-nums block">{s.water}</span>
                      <span className="text-[10px] text-zinc-500">{s.re} • {s.stress}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 7: ISRO SPACE INTEGRATION HUB */}
      {/* ========================================================================= */}
      <section className="py-20 bg-[#16171A] border-y border-[#282A2E] text-left">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14 space-y-2">
            <span className="text-xs font-mono text-zinc-400 bg-[#18191B] border border-[#282A2E] px-2.5 py-1 rounded-md">
              National space infrastructure
            </span>
            <h2 className="font-display font-medium text-3xl sm:text-4xl text-zinc-100">
              ISRO space portals integration
            </h2>
            <p className="text-sm text-zinc-400">
              Direct conduits to the 4 flagship space and remote sensing portals of the Department
              of Space, Government of India.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                id: 'bhoonidhi',
                name: 'Bhoonidhi STAC',
                agency: 'NRSC / ISRO',
                desc: 'Open SpatioTemporal Asset Catalog for direct multispectral imagery retrieval (Oceansat, Cartosat, Resourcesat).',
                status: 'Connected',
                badge: 'STAC API'
              },
              {
                id: 'bhuvan',
                name: 'Bhuvan Geoportal',
                agency: 'ISRO Geospatial',
                desc: '1:50,000 Land Use Land Cover (LULC), cadastral boundary overlays, and Indian geoportal WMS tile services.',
                status: 'Active WMS',
                badge: 'WMS / WFS'
              },
              {
                id: 'mosdac',
                name: 'MOSDAC',
                agency: 'SAC / ISRO',
                desc: 'Meteorological satellite telemetry: INSAT-3D rainfall estimates, storm return modeling, and solar insolation.',
                status: 'Live stream',
                badge: 'Weather INSAT'
              },
              {
                id: 'vedas',
                name: 'VEDAS',
                agency: 'SAC / ISRO',
                desc: 'Visualisation of Earth observation Data and Archival System: vegetation dynamics and multi-temporal NDVI.',
                status: 'Synchronized',
                badge: 'Spectral indices'
              }
            ].map((portal) => (
              <div
                key={portal.id}
                className="rounded-xl p-5 bg-[#18191B] border border-[#282A2E] hover:border-zinc-600 transition-colors duration-150 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#101113] text-zinc-400 border border-[#202225]">
                    {portal.badge}
                  </span>
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-zinc-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>{portal.status}</span>
                  </div>
                </div>

                <h3 className="font-display font-medium text-base text-zinc-100">{portal.name}</h3>
                <span className="text-xs font-mono text-zinc-500 block">{portal.agency}</span>
                <p className="text-xs text-zinc-400 leading-relaxed">{portal.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <button
              onClick={() => onSelectModule('isro_hub')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#242529] hover:bg-[#2C2E33] text-zinc-200 border border-[#2E3035] text-xs font-medium transition-colors duration-150 cursor-pointer"
            >
              <Cpu className="w-3.5 h-3.5 text-zinc-400" strokeWidth={1.5} />
              <span>Enter ISRO space data hub</span>
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 8: SUSTAINABILITY & STATUTORY BENCHMARKS */}
      {/* ========================================================================= */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-left">
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-2">
          <span className="text-xs font-mono text-zinc-400 bg-[#18191B] border border-[#282A2E] px-2.5 py-1 rounded-md">
            Statutory compliance
          </span>
          <h2 className="font-display font-medium text-3xl sm:text-4xl text-zinc-100">
            Sustainability & statutory benchmarks
          </h2>
          <p className="text-sm text-zinc-400">
            TerraAI integrates statutory Indian urban planning standards directly into master plan
            allocations, ensuring compliance with local and national regulations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 rounded-xl bg-[#18191B] border border-[#282A2E] space-y-3">
            <div className="w-8 h-8 rounded-lg bg-[#242529] border border-[#2E3035] flex items-center justify-center text-zinc-300 mb-1">
              <Droplets className="w-4 h-4" strokeWidth={1.5} />
            </div>
            <h3 className="font-display font-medium text-base text-zinc-100">CPHEEO water benchmark</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Enforces 135 LPCD domestic + 27 LPCD civic demand (162 LPCD total). Mandates 100%
              decentralized wastewater treatment (DEWATS) for civic reuse and groundwater recharge.
            </p>
            <div className="pt-2 text-xs font-mono text-zinc-400 tabular-nums">162 LPCD • 100% reclaimed</div>
          </div>

          <div className="p-5 rounded-xl bg-[#18191B] border border-[#282A2E] space-y-3">
            <div className="w-8 h-8 rounded-lg bg-[#242529] border border-[#2E3035] flex items-center justify-center text-zinc-300 mb-1">
              <SunMedium className="w-4 h-4" strokeWidth={1.5} />
            </div>
            <h3 className="font-display font-medium text-base text-zinc-100">Clean microgrid</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Allocates ground-mounted solar utility farms coupled with rooftop PV and 4-hour
              Battery Energy Storage Systems (BESS) for evening load dispatch.
            </p>
            <div className="pt-2 text-xs font-mono text-zinc-400 tabular-nums">35 MW solar + 65 MWh BESS</div>
          </div>

          <div className="p-5 rounded-xl bg-[#18191B] border border-[#282A2E] space-y-3">
            <div className="w-8 h-8 rounded-lg bg-[#242529] border border-[#2E3035] flex items-center justify-center text-zinc-300 mb-1">
              <Trees className="w-4 h-4" strokeWidth={1.5} />
            </div>
            <h3 className="font-display font-medium text-base text-zinc-100">Miyawaki afforestation</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Synthesizes high-density native tree corridors (300 trees per 100 m²) with Neem,
              Peepal, and Banyan species for microclimate cooling and dust suppression.
            </p>
            <div className="pt-2 text-xs font-mono text-zinc-400 tabular-nums">300 native trees / 100 m²</div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 9: FOOTER */}
      {/* ========================================================================= */}
      <footer className="bg-[#101113] border-t border-[#282A2E] pt-14 pb-12 text-left">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
            {/* Col 1: Brand Info */}
            <div className="lg:col-span-2 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-[#242529] border border-[#2E3035] flex items-center justify-center">
                  <Globe2 className="w-3.5 h-3.5 text-zinc-300" strokeWidth={1.5} />
                </div>
                <span className="font-display font-medium text-lg text-zinc-100">TerraAI</span>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed max-w-sm">
                Geospatial intelligence platform for sustainable city planning, integrating ISRO
                remote sensing, generative urban design, and multi-decadal predictive modeling.
              </p>
              <div className="text-[11px] text-zinc-500 font-mono">
                National Geospatial Policy (2022) aligned
              </div>
            </div>

            {/* Col 2: Studio Modules */}
            <div>
              <h4 className="font-display font-medium text-xs text-zinc-300 mb-3">
                Core studio
              </h4>
              <ul className="space-y-2 text-xs text-zinc-400">
                <li>
                  <button onClick={() => onSelectModule('map')} className="hover:text-zinc-200 transition-colors">
                    GIS map & zoning
                  </button>
                </li>
                <li>
                  <button onClick={() => onSelectModule('master_plan')} className="hover:text-zinc-200 transition-colors">
                    AI master plan designer
                  </button>
                </li>
                <li>
                  <button onClick={() => onSelectModule('suitability')} className="hover:text-zinc-200 transition-colors">
                    Site suitability (AHP)
                  </button>
                </li>
                <li>
                  <button onClick={() => onSelectModule('terrain_soil')} className="hover:text-zinc-200 transition-colors">
                    Terrain & soil geotech
                  </button>
                </li>
                <li>
                  <button onClick={() => onSelectModule('climate')} className="hover:text-zinc-200 transition-colors">
                    Climate & disaster risk
                  </button>
                </li>
              </ul>
            </div>

            {/* Col 3: Intelligence & Space */}
            <div>
              <h4 className="font-display font-medium text-xs text-zinc-300 mb-3">
                Space & intelligence
              </h4>
              <ul className="space-y-2 text-xs text-zinc-400">
                <li>
                  <button onClick={() => onSelectModule('water')} className="hover:text-zinc-200 transition-colors">
                    Water & CGWB hydrology
                  </button>
                </li>
                <li>
                  <button onClick={() => onSelectModule('energy')} className="hover:text-zinc-200 transition-colors">
                    Renewable microgrid
                  </button>
                </li>
                <li>
                  <button onClick={() => onSelectModule('isro_hub')} className="hover:text-zinc-200 transition-colors">
                    ISRO space hub
                  </button>
                </li>
                <li>
                  <button onClick={() => onSelectModule('simulation')} className="hover:text-zinc-200 transition-colors">
                    100-year simulation
                  </button>
                </li>
                <li>
                  <button onClick={() => onSelectModule('advisor')} className="hover:text-zinc-200 transition-colors">
                    TerraAdvisor AI studio
                  </button>
                </li>
              </ul>
            </div>

            {/* Col 4: Compliance & Guidelines */}
            <div>
              <h4 className="font-display font-medium text-xs text-zinc-300 mb-3">
                Standards
              </h4>
              <ul className="space-y-2 text-xs text-zinc-400">
                <li>MoHUA URDPFI guidelines</li>
                <li>CPHEEO water benchmarks</li>
                <li>CGWB groundwater atlas</li>
                <li>ISRO Bhoonidhi STAC v1.0</li>
              </ul>
            </div>
          </div>

          <div className="pt-6 border-t border-[#282A2E] flex flex-wrap items-center justify-between text-xs text-zinc-500 gap-4">
            <p>© {new Date().getFullYear()} TerraAI Geospatial. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <span>ISRO • NRSC • SAC • MOSDAC data attribution</span>
              <button onClick={onStartPlanning} className="text-zinc-300 font-medium hover:text-white transition-colors">
                Launch platform →
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
