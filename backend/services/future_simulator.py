import math
from typing import Dict, Any, List
from backend.models.schemas import ScenarioSimulationResult, FutureYearProjection, SimulationRequest

class FutureSimulatorService:
    """
    Long-Term City Simulation Engine (TerraFuture AI).
    Simulates multi-decade urban trajectories over 10, 20, 50, and 100 years
    evaluating demographic compounding, water security, aquifer pressure,
    energy transition, solid waste, and climate stress.
    """

    SCENARIOS = {
        "Sustainable Development": {
            "name": "Sustainable Development (Circular Smart City)",
            "description": "Planned demographic growth with mandatory dual water recycling, 100% renewable microgrid, active modal transit, and zero waste to landfill.",
            "growth_rate": 1.8,
            "water_reduction_trend": 0.90, # water efficiency improves by 10%
            "re_expansion_trend": 1.25,
            "green_canopy_trend": 1.15
        },
        "Business as Usual": {
            "name": "Business as Usual (Linear Urban Expansion)",
            "description": "Uncontrolled vehicular growth, conventional fossil grid reliance, single-pass water consumption, and progressive urban heat island effect.",
            "growth_rate": 2.2,
            "water_reduction_trend": 1.05,
            "re_expansion_trend": 1.05,
            "green_canopy_trend": 0.85
        },
        "High Growth": {
            "name": "High Population Explosion (Boomtown Stress)",
            "description": "Rapid industrial migration accelerating population influx beyond design targets, putting severe strain on civic utilities and aquifer reserves.",
            "growth_rate": 3.4,
            "water_reduction_trend": 1.10,
            "re_expansion_trend": 1.10,
            "green_canopy_trend": 0.75
        },
        "Water Stressed": {
            "name": "Severe Climate & Water-Stressed Future",
            "description": "Monsoon variability decreases annual precipitation by 25%, groundwater table drops, testing decentralized rainwater buffers and circular resilience.",
            "growth_rate": 1.5,
            "water_reduction_trend": 0.85,
            "re_expansion_trend": 1.15,
            "green_canopy_trend": 0.90
        },
        "Resilient": {
            "name": "Net-Zero Climate-Resilient Sanctuary",
            "description": "Maximum biophilic greening, passive architectural standards, hyper-efficient circular water loops, and total municipal energy independence.",
            "growth_rate": 1.6,
            "water_reduction_trend": 0.78,
            "re_expansion_trend": 1.40,
            "green_canopy_trend": 1.35
        }
    }

    @classmethod
    def run_simulation(cls, req: SimulationRequest) -> ScenarioSimulationResult:
        scenario_key = "Sustainable Development"
        for k in cls.SCENARIOS:
            if k.lower() in req.scenario_type.lower():
                scenario_key = k
                break

        cfg = cls.SCENARIOS[scenario_key]
        growth_rate = req.annual_population_growth_rate or cfg["growth_rate"]
        base_pop = req.base_population
        base_lpcd = req.per_capita_water_consumption_lpcd
        rain_var = req.rainfall_variation_pct # e.g. -15% or +10%

        milestones = [10, 20, 50, 100]
        base_year = 2026
        projections: List[FutureYearProjection] = []

        # Baseline metrics
        initial_water_demand_mld = (base_pop * base_lpcd * 1.20) / 1_000_000.0 # ~3.24 MLD
        initial_re_gen_mwh = req.renewable_capacity_mw * 4.4 # ~110 MWh/day

        for offset in milestones:
            cal_year = base_year + offset
            # Compound demographic growth formula: P(t) = P0 * (1 + r)^t
            proj_pop = int(base_pop * math.pow(1.0 + (growth_rate / 100.0), offset))
            
            # Water demand projection
            eff_factor = math.pow(cfg["water_reduction_trend"], offset / 20.0)
            proj_lpcd = base_lpcd * eff_factor
            proj_water_mld = round((proj_pop * proj_lpcd * 1.20) / 1_000_000.0, 2)
            
            # Climate rain impact on RWH & deficit
            rain_factor = 1.0 + (rain_var / 100.0)
            if scenario_key == "Water Stressed":
                rain_factor *= 0.75

            sustainable_local_yield_mld = 3.5 * rain_factor
            annual_water_deficit_mcm = round((proj_water_mld - sustainable_local_yield_mld) * 0.365, 2)
            
            # Groundwater extraction stage %
            if scenario_key in ["Business as Usual", "High Growth"]:
                gw_stage = min(195.0, round(65.0 + (offset * 1.2), 1))
            elif scenario_key == "Water Stressed":
                gw_stage = min(175.0, round(70.0 + (offset * 0.9), 1))
            else: # Sustainable / Resilient
                gw_stage = round(max(45.0, 68.0 - (offset * 0.2)), 1)

            # Energy demand (kWh/person/day ~3.7 kWh)
            proj_energy_mwh = round((proj_pop * 3.8) / 1000.0, 1)
            re_growth = math.pow(cfg["re_expansion_trend"], offset / 25.0)
            proj_re_gen_mwh = round(initial_re_gen_mwh * re_growth, 1)

            # Solid waste (0.45 kg/capita/day in Indian urban settlements)
            waste_tpd = round((proj_pop * 0.48) / 1000.0, 1)

            # CO2 offset in kilotonnes
            co2_kt = round((proj_re_gen_mwh * 365 * 0.75 * offset) / 1000.0, 1)

            # Green canopy %
            base_green = 32.0
            green_cover = round(min(58.0, max(12.0, base_green * math.pow(cfg["green_canopy_trend"], offset / 30.0))), 1)

            # Infrastructure stress index
            pop_ratio = proj_pop / base_pop
            if scenario_key == "High Growth":
                stress = min(100.0, round(35.0 * pop_ratio, 1))
            elif scenario_key == "Business as Usual":
                stress = min(95.0, round(30.0 * pop_ratio * 0.85, 1))
            else:
                stress = min(65.0, round(25.0 + (pop_ratio * 7.5), 1))

            projections.append(FutureYearProjection(
                year_offset=offset,
                calendar_year=cal_year,
                projected_population=proj_pop,
                daily_water_demand_mld=proj_water_mld,
                annual_water_deficit_or_surplus_mcm=annual_water_deficit_mcm,
                groundwater_extraction_stage_pct=gw_stage,
                daily_energy_demand_mwh=proj_energy_mwh,
                renewable_generation_mwh=proj_re_gen_mwh,
                solid_waste_generated_tpd=waste_tpd,
                cumulative_co2_offset_kt=co2_kt,
                green_canopy_cover_pct=green_cover,
                infrastructure_stress_index=stress
            ))

        milestone_notes = [
            f"Year 10 ({base_year + 10}): Population expands to {projections[0].projected_population:,}. Core transit and initial RWH capacity absorb demographic growth smoothly.",
            f"Year 20 ({base_year + 20}): Population reaches {projections[1].projected_population:,}. Demands smart utility tunnel expansion and dual-reticulation scaling to avoid groundwater draw.",
            f"Year 50 ({base_year + 50}): Long-term horizon reaches {projections[2].projected_population:,}. Renewable microgrid and localized circular economy stabilize per-capita resource consumption.",
            f"Year 100 ({base_year + 100}): Century mark at {projections[3].projected_population:,} inhabitants. City operates as a mature zero-waste, net-positive urban ecosystem."
        ]

        return ScenarioSimulationResult(
            scenario_id=f"sim_{scenario_key.lower().replace(' ', '_')}",
            scenario_name=cfg["name"],
            description=cfg["description"],
            population_growth_rate_pct=growth_rate,
            projections=projections,
            critical_milestone_notes=milestone_notes
        )
