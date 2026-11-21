import React, { useEffect, useRef, useState } from 'react';
import {
  Globe2,
  Sparkles,
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

  // Canvas 3D Geospatial & Satellite Animation
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

    // Particle nodes for geospatial mesh
    const numNodes = 45;
    const nodes: Array<{
      x: number;
      y: number;
      z: number;
      vx: number;
      vy: number;
      elevation: number;
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
        z: Math.random() * 50 + 10,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        elevation: Math.sin(i) * 20 + 30,
        type: types[i % types.length]
      });
    }

    let angle = 0;
    let mouseX = width / 2;
    let mouseY = height / 2;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    };
    canvas.addEventListener('mousemove', handleMouseMove);

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      angle += 0.008;

      // Draw subtle topographic isometric grid lines
      ctx.lineWidth = 0.5;
      const gridStep = 45;
      ctx.strokeStyle = 'rgba(34, 211, 238, 0.07)';

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

      // Draw Topographic Elevation Contours (animated sine waves)
      ctx.lineWidth = 1;
      for (let c = 1; c <= 4; c++) {
        ctx.strokeStyle = `rgba(52, 211, 153, ${0.12 - c * 0.02})`;
        ctx.beginPath();
        const baseRadius = 140 + c * 40;
        for (let a = 0; a <= Math.PI * 2; a += 0.1) {
          const r =
            baseRadius +
            Math.sin(a * 4 + angle * 2) * 12 +
            Math.cos(a * 2 - angle) * 8;
          const px = width * 0.55 + Math.cos(a) * r * 1.3;
          const py = height * 0.5 + Math.sin(a) * r * 0.7;
          if (a === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.stroke();
      }

      // Draw interconnected network nodes
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        n.x += n.vx;
        n.y += n.vy;

        if (n.x < 0 || n.x > width) n.vx *= -1;
        if (n.y < 0 || n.y > height) n.vy *= -1;

        // Draw connections
        for (let j = i + 1; j < nodes.length; j++) {
          const n2 = nodes[j];
          const dist = Math.hypot(n.x - n2.x, n.y - n2.y);
          if (dist < 110) {
            const alpha = (1 - dist / 110) * 0.22;
            ctx.strokeStyle = `rgba(34, 211, 238, ${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(n.x, n.y);
            ctx.lineTo(n2.x, n2.y);
            ctx.stroke();
          }
        }

        // Draw node points
        let nodeColor = '#22D3EE';
        if (n.type === 'green') nodeColor = '#34D399';
        if (n.type === 'water') nodeColor = '#60A5FA';
        if (n.type === 'energy') nodeColor = '#FBBF24';
        if (n.type === 'transit') nodeColor = '#F87171';

        ctx.fillStyle = nodeColor;
        ctx.beginPath();
        ctx.arc(n.x, n.y, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw Orbiting Satellite
      const centerX = width * 0.55;
      const centerY = height * 0.48;
      const orbitRx = 230;
      const orbitRy = 110;

      // Orbit ring
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(-0.25);
      ctx.strokeStyle = 'rgba(96, 165, 250, 0.25)';
      ctx.setLineDash([6, 6]);
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.ellipse(0, 0, orbitRx, orbitRy, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Satellite position on orbit
      const satX = Math.cos(angle * 1.5) * orbitRx;
      const satY = Math.sin(angle * 1.5) * orbitRy;

      // Sensor beam from satellite to ground
      ctx.strokeStyle = 'rgba(34, 211, 238, 0.4)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(satX, satY);
      ctx.lineTo(0, 40);
      ctx.stroke();

      // Satellite body
      ctx.fillStyle = '#22D3EE';
      ctx.beginPath();
      ctx.arc(satX, satY, 5, 0, Math.PI * 2);
      ctx.fill();

      // Satellite Solar Panels
      ctx.fillStyle = '#60A5FA';
      ctx.fillRect(satX - 12, satY - 2, 8, 4);
      ctx.fillRect(satX + 4, satY - 2, 8, 4);

      // Satellite ping ring
      const pingR = ((angle * 25) % 30) + 5;
      ctx.strokeStyle = `rgba(34, 211, 238, ${Math.max(0, 1 - pingR / 30)})`;
      ctx.beginPath();
      ctx.arc(satX, satY, pingR, 0, Math.PI * 2);
      ctx.stroke();

      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const steps = [
    {
      step: '01',
      title: 'Boundary & Ingestion',
      subtitle: 'Spatial Polygon Vectorization',
      desc: 'Upload standard GeoJSON/SHP or draw interactive parcel boundaries directly over high-res Indian satellite maps with auto acreage & perimeter calculation.',
      icon: Layers,
      color: 'from-cyan-500 to-blue-600',
      badge: 'GIS Ingest'
    },
    {
      step: '02',
      title: 'Geospatial & Space Sync',
      subtitle: 'ISRO STAC & Earth Observation',
      desc: 'Automated retrieval of Cartosat DEM 10m contours, Bhuvan 50K LULC, VEDAS seasonal NDVI, MOSDAC rainfall, and CGWB aquifer stress levels.',
      icon: Satellite,
      color: 'from-blue-500 to-indigo-600',
      badge: 'Live Feeds'
    },
    {
      step: '03',
      title: 'AI Generative Zoning',
      subtitle: 'Multi-Criteria URDPFI Compliance',
      desc: 'Our genetic algorithm evaluates slope, hydrology, and solar exposure to synthesize 3 optimal master plans (Plan A Walkable TOD, Plan B Eco-Village, Plan C Smart City).',
      icon: Sparkles,
      color: 'from-emerald-500 to-cyan-500',
      badge: '12 Zones'
    },
    {
      step: '04',
      title: 'Multi-Decadal Simulation',
      subtitle: '100-Year Climate & Infrastructure Stress',
      desc: 'Simulate population surges, monsoon shifts, groundwater drawdown, and microgrid loads across 10, 20, 50, and 100-year forecast horizons with executive export.',
      icon: Clock,
      color: 'from-amber-500 to-rose-500',
      badge: 'Forecasting'
    }
  ];

  return (
    <div className="relative min-h-screen bg-[#07111F] text-[#F1F5F9] overflow-x-hidden selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* ========================================================================= */}
      {/* SECTION 1: HERO SECTION */}
      {/* ========================================================================= */}
      <section className="relative min-h-[92vh] flex items-center justify-center pt-8 pb-20 px-4 sm:px-6 lg:px-8 border-b border-[#1E2D42]/60 overflow-hidden">
        {/* Interactive 3D Canvas Background */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-auto opacity-75 z-0"
        />

        {/* Ambient Glows */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/3 right-1/4 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Hero Left: Copy & CTAs */}
          <div className="lg:col-span-7 space-y-6 text-left">
            {/* National Space & Geospatial Policy Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#111F30]/90 border border-[#22D3EE]/30 backdrop-blur-md shadow-lg shadow-cyan-500/10 animate-fade-in">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#34D399] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#34D399]"></span>
              </span>
              <span className="text-[11px] font-mono font-semibold text-cyan-300">
                ISRO Space Portals • URDPFI & CPHEEO Compliant
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl tracking-tight text-white leading-[1.1]">
              Plan the{' '}
              <span className="bg-gradient-to-r from-[#22D3EE] via-[#60A5FA] to-[#34D399] bg-clip-text text-transparent">
                Cities of Tomorrow
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-[#94A3B8] font-normal leading-relaxed max-w-2xl">
              Transform satellite intelligence, geospatial data, and artificial intelligence into
              sustainable urban master plans. Designed specifically for India's greenfield smart
              cities, industrial corridors, and regenerative regional growth.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={onStartPlanning}
                className="group relative flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#22D3EE] via-cyan-500 to-[#34D399] hover:from-cyan-400 hover:to-emerald-400 text-[#07111F] font-bold text-sm tracking-wide shadow-xl shadow-cyan-500/25 transition-all duration-200 transform hover:-translate-y-0.5 cursor-pointer"
              >
                <span>Start Planning</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>

              <button
                onClick={() => {
                  const el = document.getElementById('how-it-works');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#111F30]/90 hover:bg-[#17283A] text-white border border-[#1E2D42] hover:border-[#22D3EE]/50 text-sm font-semibold transition backdrop-blur-md cursor-pointer"
              >
                <Play className="w-4 h-4 text-[#22D3EE]" />
                <span>Explore Platform</span>
              </button>
            </div>

            {/* Live Orbit Status Indicator */}
            <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-[#94A3B8] font-mono">
              <div className="flex items-center gap-2">
                <Satellite className="w-4 h-4 text-[#22D3EE]" />
                <span>CARTOSAT-3 & SENTINEL-2 SYNCED</span>
              </div>
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-[#34D399]" />
                <span>BHUVAN WMS LIVE</span>
              </div>
            </div>
          </div>

          {/* Hero Right: Interactive 3D Holographic Card */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl bg-gradient-to-b from-[#111F30]/90 to-[#07111F]/90 border border-[#22D3EE]/30 p-5 shadow-2xl backdrop-blur-xl">
              {/* Card Header */}
              <div className="flex items-center justify-between pb-4 border-b border-[#1E2D42]">
                <div className="flex items-center gap-2.5">
                  <div className="w-3 h-3 rounded-full bg-[#F87171]" />
                  <div className="w-3 h-3 rounded-full bg-[#FBBF24]" />
                  <div className="w-3 h-3 rounded-full bg-[#34D399]" />
                  <span className="ml-2 font-mono text-xs text-[#94A3B8]">
                    Dholera SIR Greenfield (500 Acres)
                  </span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-800 text-cyan-300">
                  REAL-TIME FAR: 2.1
                </span>
              </div>

              {/* Holographic Plan Preview */}
              <div className="py-4 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#94A3B8]">Plan Synthesis:</span>
                  <span className="text-white font-bold font-mono">Plan A • Compact TOD</span>
                </div>

                {/* Land Budget Progress Bars */}
                <div className="space-y-2 text-[11px] font-mono">
                  <div>
                    <div className="flex justify-between text-[#94A3B8] mb-1">
                      <span>Residential & Civic (TOD)</span>
                      <span className="text-[#22D3EE] font-bold">145 Acres (29.0%)</span>
                    </div>
                    <div className="h-1.5 w-full bg-[#0D1928] rounded-full overflow-hidden">
                      <div className="h-full bg-[#22D3EE] rounded-full w-[29%]" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[#94A3B8] mb-1">
                      <span>Parks, Green Belt & Miyawaki</span>
                      <span className="text-[#34D399] font-bold">115 Acres (23.0%)</span>
                    </div>
                    <div className="h-1.5 w-full bg-[#0D1928] rounded-full overflow-hidden">
                      <div className="h-full bg-[#34D399] rounded-full w-[23%]" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[#94A3B8] mb-1">
                      <span>Solar Microgrid & DEWATS</span>
                      <span className="text-[#FBBF24] font-bold">50 Acres (10.0%)</span>
                    </div>
                    <div className="h-1.5 w-full bg-[#0D1928] rounded-full overflow-hidden">
                      <div className="h-full bg-[#FBBF24] rounded-full w-[10%]" />
                    </div>
                  </div>
                </div>

                {/* Score Summary Metrics */}
                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[#1E2D42]">
                  <div className="p-2.5 rounded-xl bg-[#07111F] border border-[#1E2D42] text-center">
                    <span className="text-[10px] text-[#94A3B8] block">Suitability</span>
                    <span className="font-display font-bold text-sm text-[#34D399]">
                      84.2 / 100
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#07111F] border border-[#1E2D42] text-center">
                    <span className="text-[10px] text-[#94A3B8] block">Water Balance</span>
                    <span className="font-display font-bold text-sm text-[#22D3EE]">
                      +1.18 MLD
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#07111F] border border-[#1E2D42] text-center">
                    <span className="text-[10px] text-[#94A3B8] block">Clean Energy</span>
                    <span className="font-display font-bold text-sm text-[#FBBF24]">100% RE</span>
                  </div>
                </div>

                {/* Quick Action Button on Preview */}
                <button
                  onClick={() => onSelectModule('master_plan')}
                  className="w-full mt-2 py-2.5 rounded-xl bg-[#17283A] hover:bg-[#1E2D42] text-cyan-300 font-semibold text-xs transition border border-[#22D3EE]/30 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#22D3EE]" />
                  <span>Launch Master Plan Designer</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Platform Metric Strip */}
        <div className="absolute bottom-0 left-0 right-0 bg-[#0D1928]/80 border-t border-[#1E2D42] py-3.5 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
            <div>
              <span className="font-display font-extrabold text-xl text-white block">500+ Acres</span>
              <span className="text-[11px] text-[#94A3B8] font-mono">Greenfield Parcels</span>
            </div>
            <div>
              <span className="font-display font-extrabold text-xl text-[#22D3EE] block">12 Modules</span>
              <span className="text-[11px] text-[#94A3B8] font-mono">Geospatial AI Suite</span>
            </div>
            <div>
              <span className="font-display font-extrabold text-xl text-[#34D399] block">4 Space Hubs</span>
              <span className="text-[11px] text-[#94A3B8] font-mono">Bhoonidhi, Bhuvan, MOSDAC</span>
            </div>
            <div>
              <span className="font-display font-extrabold text-xl text-[#FBBF24] block">100-Year</span>
              <span className="text-[11px] text-[#94A3B8] font-mono">Multi-Decadal Forecast</span>
            </div>
            <div className="col-span-2 md:col-span-1">
              <span className="font-display font-extrabold text-xl text-[#60A5FA] block">100% Compliant</span>
              <span className="text-[11px] text-[#94A3B8] font-mono">URDPFI & CPHEEO</span>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 2: HOW IT WORKS (4-Step Pipeline) */}
      {/* ========================================================================= */}
      <section id="how-it-works" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#22D3EE] bg-cyan-950/60 border border-cyan-800/60 px-3 py-1 rounded-full">
            Autonomous Urban Planning Pipeline
          </span>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-white">
            How TerraAI Plans a Smart City
          </h2>
          <p className="text-sm sm:text-base text-[#94A3B8]">
            From raw satellite telemetry to legal urban master plans in minutes, adhering to the
            highest international and Indian urban development guidelines.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((st, idx) => {
            const Icon = st.icon;
            const isCurrent = activeStep === idx;
            return (
              <div
                key={st.step}
                onClick={() => setActiveStep(idx)}
                className={`relative rounded-2xl p-6 bg-[#0D1928] border transition-all duration-300 cursor-pointer ${
                  isCurrent
                    ? 'border-[#22D3EE] shadow-xl shadow-cyan-500/10 -translate-y-1'
                    : 'border-[#1E2D42] hover:border-[#1E2D42]/80 hover:bg-[#111F30]'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-xs font-bold text-[#94A3B8]">{st.step}</span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#17283A] text-cyan-300 border border-[#1E2D42]">
                    {st.badge}
                  </span>
                </div>

                <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${st.color} p-0.5 mb-4`}>
                  <div className="w-full h-full bg-[#07111F] rounded-[10px] flex items-center justify-center">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>

                <h3 className="font-display font-bold text-lg text-white mb-1">{st.title}</h3>
                <span className="text-xs font-mono text-[#22D3EE] block mb-2">{st.subtitle}</span>
                <p className="text-xs text-[#94A3B8] leading-relaxed">{st.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 3: INTELLIGENT SITE SELECTION */}
      {/* ========================================================================= */}
      <section className="py-20 bg-[#0D1928]/60 border-y border-[#1E2D42]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-5 text-left">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#34D399] bg-emerald-950/60 border border-emerald-800/60 px-3 py-1 rounded-full">
              Analytical Hierarchy Process (AHP)
            </span>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-white">
              Intelligent Site Suitability & Exclusion Zoning
            </h2>
            <p className="text-sm text-[#94A3B8] leading-relaxed">
              Every parcel undergoes a rigorous 12-factor Analytical Hierarchy Process (AHP).
              Topography, geological fault lines, 50-year flood lines, coastal regulation zones
              (CRZ), and eco-sensitive corridors are identified to prevent irreversible planning
              mistakes.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#34D399] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-white">Topographic Slope Categorization</h4>
                  <p className="text-xs text-[#94A3B8]">
                    Slopes &gt;15% automatically flagged as non-buildable exclusion zones. Slopes
                    &lt;5% prioritized for cost-effective foundation capex.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#34D399] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-white">50-Year Flood & Inundation Buffer</h4>
                  <p className="text-xs text-[#94A3B8]">
                    Calculates extreme storm return periods with MOSDAC rainfall data, ensuring 100m
                    mandatory hydrological buffers around water bodies.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#34D399] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-white">Soil Bearing & ICAR Lithology</h4>
                  <p className="text-xs text-[#94A3B8]">
                    Integration with ICAR Soil Texture Triangle to evaluate shrink-swell potential
                    and high-bearing strata for vertical infrastructure.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-3">
              <button
                onClick={() => onSelectModule('suitability')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#17283A] hover:bg-[#1E2D42] text-[#34D399] border border-[#34D399]/40 text-xs font-semibold transition cursor-pointer"
              >
                <Compass className="w-4 h-4" />
                <span>Explore Site Suitability Engine</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="p-6 rounded-2xl bg-[#111F30] border border-[#1E2D42] shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-[#1E2D42] pb-3">
                <span className="font-display font-bold text-sm text-white">
                  12-Factor AHP Matrix Breakdown
                </span>
                <span className="text-xs font-mono text-[#34D399]">Score: 84.2% (Tier A)</span>
              </div>

              <div className="space-y-3">
                {[
                  { factor: 'Slope & Relief (<5%)', score: 92, weight: '15%' },
                  { factor: 'Groundwater Depth (CGWB Safe)', score: 85, weight: '15%' },
                  { factor: 'Flood Inundation Safety', score: 80, weight: '12%' },
                  { factor: 'Transport Corridor Proximity', score: 88, weight: '10%' },
                  { factor: 'Soil Bearing Capacity', score: 78, weight: '10%' },
                  { factor: 'Solar & Wind Exposure', score: 94, weight: '8%' }
                ].map((item) => (
                  <div key={item.factor}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-[#F1F5F9]">{item.factor}</span>
                      <span className="font-mono text-[#94A3B8]">
                        {item.score}/100 • Wt: {item.weight}
                      </span>
                    </div>
                    <div className="h-2 w-full bg-[#07111F] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 rounded-full"
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
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-left">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#60A5FA] bg-blue-950/60 border border-blue-800/60 px-3 py-1 rounded-full">
            Space Data Architecture
          </span>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-white">
            Multi-Spectral Satellite Intelligence
          </h2>
          <p className="text-sm sm:text-base text-[#94A3B8]">
            Directly tapping into Indian Space Research Organisation (ISRO) constellations and
            global earth observation satellites for micro-level urban accuracy.
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
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  isActive
                    ? 'bg-[#22D3EE] text-[#07111F] shadow-lg shadow-cyan-500/20'
                    : 'bg-[#111F30] text-[#94A3B8] hover:text-white border border-[#1E2D42]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Display */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-[#0D1928] border border-[#1E2D42] rounded-3xl p-6 sm:p-8">
          <div className="lg:col-span-7 space-y-4">
            {activeSatelliteTab === 'cartosat' && (
              <>
                <div className="inline-block px-2.5 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-[10px] font-mono text-cyan-300">
                  CARTOSAT-3 STEREO OPTICAL DEM
                </div>
                <h3 className="font-display font-bold text-2xl text-white">
                  10-Meter Precision Elevation & Terrain Roughness
                </h3>
                <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
                  Cartosat stereo DEM models the precise micro-drainage channels, ridge lines, and
                  flow directions. By extracting contours at 1-meter intervals, the platform
                  determines cut-and-fill grading volumes before ground is broken.
                </p>
                <div className="grid grid-cols-2 gap-4 pt-2 font-mono text-xs">
                  <div className="p-3 bg-[#111F30] rounded-xl border border-[#1E2D42]">
                    <span className="text-[#94A3B8] block text-[10px]">Spatial Resolution</span>
                    <span className="text-[#22D3EE] font-bold">10 Meters Stereo</span>
                  </div>
                  <div className="p-3 bg-[#111F30] rounded-xl border border-[#1E2D42]">
                    <span className="text-[#94A3B8] block text-[10px]">Vertical Accuracy</span>
                    <span className="text-[#34D399] font-bold">± 1.2 Meters LE90</span>
                  </div>
                </div>
              </>
            )}

            {activeSatelliteTab === 'sentinel' && (
              <>
                <div className="inline-block px-2.5 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-[10px] font-mono text-emerald-300">
                  SENTINEL-2 MULTISPECTRAL INSTRUMENT (MSI)
                </div>
                <h3 className="font-display font-bold text-2xl text-white">
                  Normalized Difference Vegetation Index (NDVI) & Canopy Health
                </h3>
                <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
                  Red and Near-Infrared (NIR) band ratios compute seasonal vegetation vitality.
                  Guarantees that green spaces are situated over natural vegetative corridors to
                  maintain local biodiversity pathways.
                </p>
                <div className="grid grid-cols-2 gap-4 pt-2 font-mono text-xs">
                  <div className="p-3 bg-[#111F30] rounded-xl border border-[#1E2D42]">
                    <span className="text-[#94A3B8] block text-[10px]">Spectral Bands</span>
                    <span className="text-[#34D399] font-bold">B4 (Red) & B8 (NIR)</span>
                  </div>
                  <div className="p-3 bg-[#111F30] rounded-xl border border-[#1E2D42]">
                    <span className="text-[#94A3B8] block text-[10px]">Revisit Frequency</span>
                    <span className="text-[#22D3EE] font-bold">Every 5 Days</span>
                  </div>
                </div>
              </>
            )}

            {activeSatelliteTab === 'bhuvan' && (
              <>
                <div className="inline-block px-2.5 py-0.5 rounded bg-blue-950 border border-blue-800 text-[10px] font-mono text-blue-300">
                  BHUVAN ISRO GEOPORTAL LULC
                </div>
                <h3 className="font-display font-bold text-2xl text-white">
                  Land Use & Land Cover Classification (1:50,000)
                </h3>
                <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
                  Official National Remote Sensing Centre (NRSC) land-use categorization. Ensures
                  prime agricultural land is spared and uncultivated wasteland is allocated for
                  solar farms and industrial parks.
                </p>
                <div className="grid grid-cols-2 gap-4 pt-2 font-mono text-xs">
                  <div className="p-3 bg-[#111F30] rounded-xl border border-[#1E2D42]">
                    <span className="text-[#94A3B8] block text-[10px]">Classification Scale</span>
                    <span className="text-[#60A5FA] font-bold">1:50,000 Cadastral</span>
                  </div>
                  <div className="p-3 bg-[#111F30] rounded-xl border border-[#1E2D42]">
                    <span className="text-[#94A3B8] block text-[10px]">WMS Service</span>
                    <span className="text-[#34D399] font-bold">OGC Compliant EPSG:4326</span>
                  </div>
                </div>
              </>
            )}

            {activeSatelliteTab === 'mosdac' && (
              <>
                <div className="inline-block px-2.5 py-0.5 rounded bg-amber-950 border border-amber-800 text-[10px] font-mono text-amber-300">
                  MOSDAC METEOROLOGICAL & OCEANOGRAPHIC DATA
                </div>
                <h3 className="font-display font-bold text-2xl text-white">
                  INSAT-3D/3DR Extreme Weather & Solar Insolation
                </h3>
                <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
                  Meteorological satellite telemetry powers extreme rainfall forecasts, heatwave
                  vulnerability maps, and Global Horizontal Irradiance (GHI) metrics for renewable
                  energy sizing.
                </p>
                <div className="grid grid-cols-2 gap-4 pt-2 font-mono text-xs">
                  <div className="p-3 bg-[#111F30] rounded-xl border border-[#1E2D42]">
                    <span className="text-[#94A3B8] block text-[10px]">Solar GHI Mean</span>
                    <span className="text-[#FBBF24] font-bold">5.82 kWh/m²/day</span>
                  </div>
                  <div className="p-3 bg-[#111F30] rounded-xl border border-[#1E2D42]">
                    <span className="text-[#94A3B8] block text-[10px]">Storm Peak</span>
                    <span className="text-[#F87171] font-bold">186 mm / 24 hr Return</span>
                  </div>
                </div>
              </>
            )}

            <div className="pt-2">
              <button
                onClick={() => onSelectModule('map')}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#22D3EE]/10 hover:bg-[#22D3EE]/20 text-[#22D3EE] border border-[#22D3EE]/40 text-xs font-semibold transition cursor-pointer"
              >
                <Layers className="w-4 h-4" />
                <span>Open GIS Satellite Map Workspace</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="relative rounded-2xl bg-[#07111F] border border-[#1E2D42] p-4 overflow-hidden">
              <div className="h-48 w-full bg-gradient-to-br from-cyan-950/40 via-slate-900 to-emerald-950/40 rounded-xl flex items-center justify-center relative">
                <div className="absolute inset-0 bg-topo-pattern opacity-40" />
                <Satellite className="w-16 h-16 text-[#22D3EE] animate-pulse relative z-10" />
                <div className="absolute bottom-2 left-2 text-[10px] font-mono text-[#94A3B8] bg-[#07111F]/80 px-2 py-0.5 rounded">
                  LAT: 22.2530° N • LON: 72.1920° E
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 5: MASTER PLAN GENERATOR */}
      {/* ========================================================================= */}
      <section className="py-24 bg-[#0D1928]/40 border-t border-[#1E2D42]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#FBBF24] bg-amber-950/60 border border-amber-800/60 px-3 py-1 rounded-full">
              Generative Urban Design
            </span>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-white">
              AI Master Plan Generator: 3 Alternative Paradigms
            </h2>
            <p className="text-sm sm:text-base text-[#94A3B8]">
              Instantly generate, evaluate, and fine-tune 3 legally balanced master plans across 12
              distinct land-use zones with live FAR budgeting and population density balancing.
            </p>
          </div>

          {/* Plan Selector Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
                badge: 'Max Green',
                walkScore: 78,
                greenCapita: 34.5,
                capex: '₹540 Cr'
              },
              {
                id: 'C',
                name: 'Plan C: Smart Clean-Tech Hub',
                desc: 'Industrial-tech synergy, high solar farm allocation, zero-liquid-discharge (ZLD) microgrid.',
                badge: 'Economic Engine',
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
                  className={`rounded-2xl p-6 bg-[#0D1928] border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-[#22D3EE] shadow-xl shadow-cyan-500/10 bg-[#111F30]'
                      : 'border-[#1E2D42] hover:border-[#1E2D42]/80'
                  }`}
                >
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-mono text-xs font-bold text-[#22D3EE]">PLAN {p.id}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                      {p.badge}
                    </span>
                  </div>
                  <h3 className="font-display font-bold text-base text-white mb-2">{p.name}</h3>
                  <p className="text-xs text-[#94A3B8] mb-4 leading-relaxed">{p.desc}</p>

                  <div className="grid grid-cols-3 gap-2 font-mono text-[11px] pt-3 border-t border-[#1E2D42]">
                    <div>
                      <span className="text-[#94A3B8] block text-[9px]">Walkability</span>
                      <span className="text-white font-bold">{p.walkScore}/100</span>
                    </div>
                    <div>
                      <span className="text-[#94A3B8] block text-[9px]">Green/Person</span>
                      <span className="text-[#34D399] font-bold">{p.greenCapita} m²</span>
                    </div>
                    <div>
                      <span className="text-[#94A3B8] block text-[9px]">Est. Capex</span>
                      <span className="text-[#FBBF24] font-bold">{p.capex}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 12-Zone Allocation Table Overview */}
          <div className="rounded-2xl bg-[#0D1928] border border-[#1E2D42] p-6 text-left">
            <div className="flex flex-wrap items-center justify-between pb-4 border-b border-[#1E2D42] gap-2">
              <div>
                <h4 className="font-display font-bold text-base text-white">
                  URDPFI 12-Zone Land Allocation Budget (Plan {activeLayoutPlan})
                </h4>
                <p className="text-xs text-[#94A3B8]">
                  Total Planning Boundary: 500 Acres • Target Population: 20,000 People
                </p>
              </div>
              <button
                onClick={() => onSelectModule('master_plan')}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold shadow-md transition cursor-pointer"
              >
                Open Full Zone Editor
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-4 text-xs font-mono">
              {[
                { name: 'Residential', acres: 125, color: '#22D3EE', far: '2.5' },
                { name: 'Commercial & Mixed', acres: 45, color: '#38BDF8', far: '3.0' },
                { name: 'Parks & Green Belt', acres: 115, color: '#34D399', far: '0.0' },
                { name: 'Water Bodies & RWH', acres: 40, color: '#60A5FA', far: '0.0' },
                { name: 'Transit & Roads', acres: 70, color: '#94A3B8', far: 'N/A' },
                { name: 'Solar Microgrid', acres: 35, color: '#FBBF24', far: 'N/A' },
                { name: 'Clean-Tech Industry', acres: 30, color: '#A78BFA', far: '1.5' },
                { name: 'Hospitals & Health', acres: 10, color: '#F87171', far: '2.0' },
                { name: 'Schools & Edu', acres: 15, color: '#FB923C', far: '1.8' },
                { name: 'DEWATS Wastewater', acres: 5, color: '#4ADE80', far: 'N/A' },
                { name: 'Solid Waste Facility', acres: 5, color: '#E879F9', far: 'N/A' },
                { name: 'Agricultural Buffer', acres: 5, color: '#A3E635', far: 'N/A' }
              ].map((z) => (
                <div key={z.name} className="p-3 rounded-xl bg-[#111F30] border border-[#1E2D42]">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: z.color }} />
                    <span className="text-white font-medium truncate">{z.name}</span>
                  </div>
                  <div className="flex justify-between text-[#94A3B8] text-[10px]">
                    <span>{z.acres} Acres</span>
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
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-left">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-5">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#34D399] bg-emerald-950/60 border border-emerald-800/60 px-3 py-1 rounded-full">
              Long-Term Resilience Engine
            </span>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-white">
              100-Year Climate & Infrastructure Simulation
            </h2>
            <p className="text-sm text-[#94A3B8] leading-relaxed">
              Urban planning often fails because master plans remain static while cities evolve.
              TerraAI models multi-decadal growth trajectories at 10, 20, 50, and 100-year intervals,
              stress-testing water tables, electricity grid capacity, solid waste, and heat island
              expansion.
            </p>

            <div className="grid grid-cols-2 gap-4 font-mono text-xs">
              <div className="p-4 rounded-xl bg-[#0D1928] border border-[#1E2D42]">
                <Clock className="w-5 h-5 text-[#22D3EE] mb-2" />
                <h4 className="font-bold text-white mb-1">Decadal Growth Waves</h4>
                <p className="text-[#94A3B8] text-[11px]">
                  Simulates population expansion from 20,000 to 120,000 residents with automatic FAR
                  densification triggers.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#0D1928] border border-[#1E2D42]">
                <Droplets className="w-5 h-5 text-[#60A5FA] mb-2" />
                <h4 className="font-bold text-white mb-1">Aquifer Depletion Guard</h4>
                <p className="text-[#94A3B8] text-[11px]">
                  Monitors CGWB groundwater stress to ensure natural extraction never surpasses
                  recharge potential.
                </p>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => onSelectModule('simulation')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#17283A] hover:bg-[#1E2D42] text-cyan-300 border border-[#22D3EE]/40 text-xs font-semibold transition cursor-pointer"
              >
                <Activity className="w-4 h-4 text-[#22D3EE]" />
                <span>Launch Future Simulation Engine</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="p-6 rounded-2xl bg-[#0D1928] border border-[#1E2D42] shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-[#1E2D42] pb-3">
                <span className="font-display font-bold text-sm text-white">
                  Trajectory: 2026 → 2126 Projections
                </span>
                <span className="text-xs font-mono text-cyan-300">Scenario: Resilient TOD</span>
              </div>

              <div className="space-y-3 font-mono text-xs">
                {[
                  { yr: 'Year 10 (2036)', pop: '35,000', water: '5.67 MLD', re: '100% RE', stress: 'Low' },
                  { yr: 'Year 20 (2046)', pop: '58,000', water: '9.39 MLD', re: '98% RE', stress: 'Balanced' },
                  { yr: 'Year 50 (2076)', pop: '95,000', water: '15.39 MLD', re: '95% RE', stress: 'Managed' },
                  { yr: 'Year 100 (2126)', pop: '140,000', water: '22.68 MLD', re: '92% RE', stress: 'Resilient' }
                ].map((s) => (
                  <div
                    key={s.yr}
                    className="flex items-center justify-between p-3 rounded-xl bg-[#111F30] border border-[#1E2D42]"
                  >
                    <div>
                      <span className="font-bold text-white block">{s.yr}</span>
                      <span className="text-[10px] text-[#94A3B8]">Pop: {s.pop}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[#22D3EE] font-bold block">{s.water}</span>
                      <span className="text-[10px] text-[#34D399]">{s.re} • {s.stress}</span>
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
      <section className="py-24 bg-[#0D1928]/80 border-y border-[#1E2D42] text-left">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-400 bg-indigo-950/60 border border-indigo-800/60 px-3 py-1 rounded-full">
              National Space Infrastructure
            </span>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-white">
              ISRO Space Portals Deep Integration
            </h2>
            <p className="text-sm sm:text-base text-[#94A3B8]">
              Direct architectural conduits to the 4 flagship space and remote sensing portals of
              the Department of Space, Government of India.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                id: 'bhoonidhi',
                name: 'Bhoonidhi STAC',
                agency: 'NRSC / ISRO',
                desc: 'Open SpatioTemporal Asset Catalog for direct raw multispectral imagery retrieval (Oceansat, Cartosat, Resourcesat).',
                status: 'Connected',
                color: 'border-cyan-500/40 text-cyan-400',
                badge: 'STAC API'
              },
              {
                id: 'bhuvan',
                name: 'Bhuvan Geoportal',
                agency: 'ISRO Geospatial',
                desc: '1:50,000 Land Use Land Cover (LULC), cadastral boundary overlays, and Indian geoportal WMS tile services.',
                status: 'Active WMS',
                color: 'border-blue-500/40 text-blue-400',
                badge: 'WMS / WFS'
              },
              {
                id: 'mosdac',
                name: 'MOSDAC',
                agency: 'SAC / ISRO',
                desc: 'Meteorological & oceanographic satellite telemetry: INSAT-3D rainfall estimates, cyclone tracking, and solar insolation.',
                status: 'Live Stream',
                color: 'border-amber-500/40 text-amber-400',
                badge: 'Weather INSAT'
              },
              {
                id: 'vedas',
                name: 'VEDAS',
                agency: 'SAC / ISRO',
                desc: 'Visualisation of Earth observation Data and Archival System: vegetation dynamics, desertification, and soil moisture.',
                status: 'Synchronized',
                color: 'border-emerald-500/40 text-emerald-400',
                badge: 'Spectral Indices'
              }
            ].map((portal) => (
              <div
                key={portal.id}
                className="rounded-2xl p-6 bg-[#07111F] border border-[#1E2D42] hover:border-indigo-500/50 transition-all space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                    {portal.badge}
                  </span>
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#34D399]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#34D399] animate-ping" />
                    <span>{portal.status}</span>
                  </div>
                </div>

                <h3 className="font-display font-bold text-lg text-white">{portal.name}</h3>
                <span className="text-xs font-mono text-[#94A3B8] block">{portal.agency}</span>
                <p className="text-xs text-[#94A3B8] leading-relaxed">{portal.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <button
              onClick={() => onSelectModule('isro_hub')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/20 transition cursor-pointer"
            >
              <Cpu className="w-4 h-4" />
              <span>Enter ISRO Space Data Command Center</span>
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 8: SUSTAINABILITY & BENCHMARKS IMPACT */}
      {/* ========================================================================= */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-left">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#34D399] bg-emerald-950/60 border border-emerald-800/60 px-3 py-1 rounded-full">
            Regenerative Urban Benchmarks
          </span>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-white">
            Sustainability & Statutory Compliance
          </h2>
          <p className="text-sm sm:text-base text-[#94A3B8]">
            TerraAI bakes statutory Indian urban standards directly into the optimization loss
            function, guaranteeing zero regulatory friction.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-2xl bg-[#0D1928] border border-[#1E2D42] space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#22D3EE]/20 flex items-center justify-center text-[#22D3EE] mb-2">
              <Droplets className="w-5 h-5" />
            </div>
            <h3 className="font-display font-bold text-lg text-white">CPHEEO Water Benchmark</h3>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Enforces 135 LPCD domestic + 27 LPCD civic demand (162 LPCD total). Mandates 100%
              decentralized wastewater treatment (DEWATS) for civic reuse and groundwater recharge.
            </p>
            <div className="pt-2 text-xs font-mono text-[#22D3EE]">162 LPCD • 100% Reclaimed</div>
          </div>

          <div className="p-6 rounded-2xl bg-[#0D1928] border border-[#1E2D42] space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#FBBF24]/20 flex items-center justify-center text-[#FBBF24] mb-2">
              <SunMedium className="w-5 h-5" />
            </div>
            <h3 className="font-display font-bold text-lg text-white">100% Clean Microgrid</h3>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Allocates ground-mounted solar utility farms coupled with rooftop PV and 4-hour
              Battery Energy Storage Systems (BESS) for peak evening load shedding.
            </p>
            <div className="pt-2 text-xs font-mono text-[#FBBF24]">35 MW Solar + 65 MWh BESS</div>
          </div>

          <div className="p-6 rounded-2xl bg-[#0D1928] border border-[#1E2D42] space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#34D399]/20 flex items-center justify-center text-[#34D399] mb-2">
              <Trees className="w-5 h-5" />
            </div>
            <h3 className="font-display font-bold text-lg text-white">Miyawaki Afforestation</h3>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Synthesizes high-density native tree corridors (300 trees per 100 m²) with Neem,
              Peepal, and Banyan species for rapid microclimate cooling and dust suppression.
            </p>
            <div className="pt-2 text-xs font-mono text-[#34D399]">300 Native Trees / 100 m²</div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 9: FOOTER */}
      {/* ========================================================================= */}
      <footer className="bg-[#07111F] border-t border-[#1E2D42] pt-16 pb-12 text-left">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
            {/* Col 1: Brand Info */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#22D3EE] to-[#34D399] p-0.5 flex items-center justify-center">
                  <div className="w-full h-full bg-[#07111F] rounded-[6px] flex items-center justify-center">
                    <Globe2 className="w-4 h-4 text-[#22D3EE]" />
                  </div>
                </div>
                <span className="font-display font-bold text-xl text-white">TerraAI</span>
              </div>
              <p className="text-xs text-[#94A3B8] leading-relaxed max-w-sm">
                Next-generation spatial intelligence platform for sustainable city planning,
                integrating ISRO remote sensing, generative urban AI, and multi-decadal predictive
                modeling.
              </p>
              <div className="text-[11px] text-[#94A3B8] font-mono">
                National Geospatial Policy (2022) Aligned
              </div>
            </div>

            {/* Col 2: Studio Modules */}
            <div>
              <h4 className="font-display font-bold text-xs uppercase text-white tracking-wider mb-4">
                Core Studio
              </h4>
              <ul className="space-y-2 text-xs text-[#94A3B8]">
                <li>
                  <button
                    onClick={() => onSelectModule('map')}
                    className="hover:text-cyan-300 transition"
                  >
                    GIS Map & Zoning
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onSelectModule('master_plan')}
                    className="hover:text-cyan-300 transition"
                  >
                    AI Master Plan Designer
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onSelectModule('suitability')}
                    className="hover:text-cyan-300 transition"
                  >
                    Site Suitability (AHP)
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onSelectModule('terrain_soil')}
                    className="hover:text-cyan-300 transition"
                  >
                    Terrain & Soil Geotech
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onSelectModule('climate')}
                    className="hover:text-cyan-300 transition"
                  >
                    Climate & Disaster Risk
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onSelectModule('vegetation')}
                    className="hover:text-cyan-300 transition"
                  >
                    Green City & Miyawaki
                  </button>
                </li>
              </ul>
            </div>

            {/* Col 3: Intelligence & Space */}
            <div>
              <h4 className="font-display font-bold text-xs uppercase text-white tracking-wider mb-4">
                Space & Intelligence
              </h4>
              <ul className="space-y-2 text-xs text-[#94A3B8]">
                <li>
                  <button
                    onClick={() => onSelectModule('water')}
                    className="hover:text-cyan-300 transition"
                  >
                    Water & CGWB Hydrology
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onSelectModule('energy')}
                    className="hover:text-cyan-300 transition"
                  >
                    Renewable Microgrid
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onSelectModule('isro_hub')}
                    className="hover:text-cyan-300 transition"
                  >
                    ISRO Space Hub
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onSelectModule('simulation')}
                    className="hover:text-cyan-300 transition"
                  >
                    100-Year Simulation
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onSelectModule('advisor')}
                    className="hover:text-cyan-300 transition"
                  >
                    TerraAdvisor AI Studio
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onSelectModule('reports')}
                    className="hover:text-cyan-300 transition"
                  >
                    Executive Dossier & Reports
                  </button>
                </li>
              </ul>
            </div>

            {/* Col 4: Compliance & Guidelines */}
            <div>
              <h4 className="font-display font-bold text-xs uppercase text-white tracking-wider mb-4">
                Standards
              </h4>
              <ul className="space-y-2 text-xs text-[#94A3B8]">
                <li>MoHUA URDPFI Guidelines</li>
                <li>CPHEEO Water Benchmarks</li>
                <li>CGWB Groundwater Atlas</li>
                <li>ISRO Bhoonidhi STAC v1.0</li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-[#1E2D42] flex flex-wrap items-center justify-between text-xs text-[#94A3B8] gap-4">
            <p>© {new Date().getFullYear()} TerraAI Geospatial. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <span>ISRO • NRSC • SAC • MOSDAC Data Attribution</span>
              <button onClick={onStartPlanning} className="text-[#22D3EE] font-bold hover:underline">
                Launch Platform →
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
