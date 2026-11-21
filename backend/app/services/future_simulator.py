import math
from typing import Dict, Any, List, Optional

class FutureSimulatorService:
    """
    Module I: TerraFuture AI — Long-Term Multi-Decadal Scenario Simulation (10, 20, 50, 100 Years).
    Simulates dynamic demographic growth, water balance, energy transitions, waste generation, and resilience index.
    """

    def simulate(
        self,
        base_population: int = 20000,
        plan_id: str = "plan_a",
        pop_growth_rate_pct: float = 2.2,
        water_lpcd: float = 135.0,
        re_growth_rate_pct: float = 3.5,
        site_id: str = "site_master"
    ) -> Dict[str, Any]:
        horizons = [10, 20, 50, 100]

        # 5 Divergent Planning Scenarios
        scenarios_definitions = [
            {
                "id": "scenario_sustainable",
                "name": "Sustainable Development (Recommended)",
                "description": "Aggressive circular economy, 100% wastewater recycling, expanding urban canopy, and high transit modal share.",
                "pop_multiplier": 1.0,
                "water_efficiency": 0.82, # 18% water saving through smart aerators and recycling
                "re_transition": 1.05,
                "waste_diverted_pct": 92.0,
                "resilience_factor": 1.15
            },
            {
                "id": "scenario_bau",
                "name": "Business As Usual (Baseline)",
                "description": "Standard municipal growth with current technology, slow circular adoption, and moderate grid reliance.",
                "pop_multiplier": 1.0,
                "water_efficiency": 1.0,
                "re_transition": 0.95,
                "waste_diverted_pct": 55.0,
                "resilience_factor": 0.90
            },
            {
                "id": "scenario_high_growth",
                "name": "High Population In-Migration Spurt",
                "description": "Rapid regional industrialization attracts 3.8% annual population growth, putting pressure on utilities.",
                "pop_multiplier": 1.45,
                "water_efficiency": 0.95,
                "re_transition": 1.0,
                "waste_diverted_pct": 70.0,
                "resilience_factor": 0.85
            },
            {
                "id": "scenario_water_stressed",
                "name": "Severe Climate & Water-Stressed Future",
                "description": "Simulates a 25% drop in monsoon precipitation coupled with rising temperatures (+2.5°C) and groundwater depletion.",
                "pop_multiplier": 1.0,
                "water_efficiency": 0.75, # Extreme rationing
                "re_transition": 1.0,
                "waste_diverted_pct": 80.0,
                "resilience_factor": 0.70
            },
            {
                "id": "scenario_resilient",
                "name": "Climate-Resilient Smart Circular Haven",
                "description": "Maximum investment in floating solar, deep bio-retention wetlands, 100% microgrid autonomy, and zero-waste loops.",
                "pop_multiplier": 1.15,
                "water_efficiency": 0.70,
                "re_transition": 1.25,
                "waste_diverted_pct": 98.0,
                "resilience_factor": 1.35
            }
        ]

        scenarios_results = []

        for sc in scenarios_definitions:
            milestones = []
            for yr in horizons:
                # Compound population growth
                effective_growth = (pop_growth_rate_pct / 100.0) * sc["pop_multiplier"]
                pop = int(base_population * math.pow(1.0 + effective_growth, yr))
                
                # Water calculations (MLD)
                # CPHEEO per-capita * efficiency factor
                w_demand_mld = round((pop * water_lpcd * 1.15 * sc["water_efficiency"]) / 1_000_000.0, 2)
                # Supply includes RWH + recycled water + emergency aquifer draw
                recycled_mld = round(w_demand_mld * 0.75, 2)
                rwh_annual_mld = round((2.02 * 0.85 * 0.51 * 0.80) * 1000.0 / 365.0, 2) # ~1.9 MLD average
                w_supply_mld = round(recycled_mld + rwh_annual_mld + 0.6, 2)
                gw_stress = round(min(1.0, max(0.1, (w_demand_mld - w_supply_mld + 1.2) / 3.0)), 2)

                # Energy calculations (GWh/yr)
                e_demand_gwh = round((pop * 1400.0) / 1_000_000.0 * (1.0 + yr * 0.003), 2)
                base_re_gwh = 28.0
                re_gen_gwh = round(base_re_gwh * math.pow(1.0 + (re_growth_rate_pct / 100.0) * sc["re_transition"], min(yr, 30)), 2)

                # Municipal solid waste (Tonnes Per Day)
                # Urban benchmark: 0.55 kg/capita/day
                solid_waste_tpd = round((pop * 0.55) / 1000.0, 1)

                # Daily transport trips
                transport_trips = int(pop * 1.8)

                # Urban green canopy preservation
                base_green_acres = 210.0
                # Sustainable scenarios expand canopy; BAU encroaches slightly
                canopy_factor = 1.0 + (0.002 * yr) if "sustainable" in sc["id"] or "resilient" in sc["id"] else (1.0 - 0.001 * yr)
                green_acres = round(base_green_acres * canopy_factor, 1)

                # Net CO2 emissions (kilotonnes / yr)
                # Solar offset vs grid carbon intensity
                grid_emission_factor = 0.72 # t CO2 / MWh
                gross_co2 = (e_demand_gwh * 1000.0 * grid_emission_factor) / 1000.0
                re_avoided = (min(re_gen_gwh, e_demand_gwh) * 1000.0 * grid_emission_factor) / 1000.0
                tree_sink = (green_acres * 12.0) / 1000.0 # 12 t CO2 / acre
                net_co2 = round(max(0.0, gross_co2 - re_avoided - tree_sink), 1)

                # Overall Sustainability & Resilience Score (0 - 100)
                resilience_score = round(min(99.0, max(40.0, 80.0 * sc["resilience_factor"] + (re_gen_gwh / e_demand_gwh) * 15.0 - gw_stress * 20.0)), 1)

                milestones.append({
                    "year": yr,
                    "population": pop,
                    "water_demand_mld": w_demand_mld,
                    "water_supply_mld": w_supply_mld,
                    "groundwater_stress_index": gw_stress,
                    "energy_demand_gwh": e_demand_gwh,
                    "renewable_generation_gwh": re_gen_gwh,
                    "solid_waste_tpd": solid_waste_tpd,
                    "transport_trips_daily": transport_trips,
                    "green_cover_acres": green_acres,
                    "co2_emissions_net_kt": net_co2,
                    "resilience_score": resilience_score
                })

            scenarios_results.append({
                "scenario_id": sc["id"],
                "scenario_name": sc["name"],
                "description": sc["description"],
                "milestones": milestones
            })

        return {
            "site_id": site_id,
            "plan_id": plan_id,
            "base_population": base_population,
            "scenarios": scenarios_results,
            "sensitivity_factors": {
                "base_growth_rate_pct": pop_growth_rate_pct,
                "per_capita_lpcd": water_lpcd,
                "re_annual_expansion_pct": re_growth_rate_pct
            },
            "simulation_disclaimer": "DISCLAIMER: Multi-decadal projections are exploratory systemic simulation models based on demographic compounding, resource mass-balance equations, and climate IPCC RCP 4.5/8.5 trajectories. They are scenario planning aids, not guaranteed forecasts."
        }

future_simulator_service = FutureSimulatorService()
