import math
from typing import Dict, Any, List

class EnergyService:
    """
    Module F: TerraEnergy AI — Renewable Energy Intelligence.
    Calculates solar PV, wind turbine resource potentials, battery storage (BESS), and microgrid trade-offs.
    """

    def analyze(self, lat: float, lng: float, area_acres: float = 500.0, population: int = 20000) -> Dict[str, Any]:
        # 1. Solar Irradiance baseline (NASA POWER / ISRO VEDAS Solar Atlas)
        # India typically receives 5.0 to 6.2 kWh/m²/day GHI
        if lat > 20.0 and lng < 74.0: # Gujarat Dholera - world-class solar
            ghi = 5.85
            dni = 6.20
            wind_50m = 6.8 # Good wind corridor
            wind_100m = 7.9
        elif lat > 24.0: # Bundelkhand
            ghi = 5.60
            dni = 5.80
            wind_50m = 4.8
            wind_100m = 5.6
        elif lat < 14.5: # Bengaluru
            ghi = 5.25
            dni = 5.10
            wind_50m = 5.2
            wind_100m = 6.1
        else: # Coastal Andhra
            ghi = 5.45
            dni = 5.50
            wind_50m = 5.5
            wind_100m = 6.4

        # 2. Land Allocation for Clean Power
        # Dedicate 30 acres (~6% of 500 acres) for Ground-Mount Solar + 40 acres Rooftop Solar
        ground_solar_acres = 25.0
        # Standard: 1 MWp solar requires approx 4 acres (with modern 550W+ bifacial mono-PERC modules)
        ground_solar_mw = round(ground_solar_acres / 4.0, 1) # ~6.2 MWp
        
        # Rooftop Solar PV:
        # 20,000 population in 4,500 dwellings + commercial = ~90,000 m² usable rooftop = ~9.0 MWp
        rooftop_solar_mw = 9.0
        total_solar_mw = round(ground_solar_mw + rooftop_solar_mw, 1) # ~15.2 MWp

        # Wind Turbine Potential:
        # Micro wind or boundary wind farm: 2 modern 2.5 MW turbines = 5.0 MW
        wind_turbines_count = 2 if wind_100m >= 6.0 else 0
        wind_mw = round(wind_turbines_count * 2.5, 1)

        # 3. Annual Energy Generation (GWh)
        # Solar Capacity Utilization Factor (CUF): 19% - 22%
        solar_cuf = 0.205
        annual_solar_gwh = round(total_solar_mw * 8760 * solar_cuf / 1000.0, 2) # ~27.3 GWh/yr

        # Wind CUF: 24% - 28%
        wind_cuf = 0.26 if wind_turbines_count > 0 else 0.0
        annual_wind_gwh = round(wind_mw * 8760 * wind_cuf / 1000.0, 2)

        total_re_gwh = round(annual_solar_gwh + annual_wind_gwh, 2)

        # 4. Projected City Electricity Demand (CEA / BEE Urban Benchmark)
        # Indian smart settlement per-capita electrical consumption: ~1,400 kWh/person/year (inclusive of residential, street lighting, STP/WTP, commercial, EV charging)
        per_capita_kwh = 1400.0
        total_city_demand_gwh = round((population * per_capita_kwh) / 1_000_000.0, 2) # ~28.0 GWh/yr

        # Renewable Share %
        re_share_pct = round(min(100.0, (total_re_gwh / total_city_demand_gwh) * 100.0), 1)

        # 5. Battery Energy Storage System (BESS)
        # Night-time / peak shifting: 4 hours of average municipal load (~3.2 MW load * 4h = 12.8 MWh)
        bess_mwh = round((total_city_demand_gwh * 1000.0 / 365.0) * (4.0 / 24.0), 1)

        # Monthly Generation Profile
        months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        monthly_profile = []
        for i, m in enumerate(months):
            # Cloud cover dips generation in July-Aug monsoons; summer peaks in March-May
            cloud_factor = 0.72 if i in [6, 7] else (1.18 if i in [2, 3, 4] else 0.95)
            s_gen = round((annual_solar_gwh / 12.0) * cloud_factor, 2)
            w_gen = round((annual_wind_gwh / 12.0) * (1.35 if i in [5, 6, 7] else 0.8), 2)
            dem = round(total_city_demand_gwh / 12.0 * (1.2 if i in [3, 4, 5] else 0.9), 2)
            monthly_profile.append({
                "month": m,
                "solar_gwh": s_gen,
                "wind_gwh": w_gen,
                "total_re_gwh": round(s_gen + w_gen, 2),
                "demand_gwh": dem
            })

        return {
            "site_id": f"energy_site_{int(lat*100)}_{int(lng*100)}",
            "solar_ghi_kwh_m2_day": ghi,
            "solar_dni_kwh_m2_day": dni,
            "wind_speed_50m_mps": wind_50m,
            "wind_speed_100m_mps": wind_100m,
            "solar_pv_potential_mw": total_solar_mw,
            "wind_potential_mw": wind_mw,
            "annual_solar_generation_gwh": annual_solar_gwh,
            "annual_wind_generation_gwh": annual_wind_gwh,
            "total_renewable_generation_gwh": total_re_gwh,
            "projected_city_demand_gwh": total_city_demand_gwh,
            "renewable_share_pct": re_share_pct,
            "battery_bess_mwh_required": bess_mwh,
            "microgrid_recommendations": [
                "Islandable 11kV municipal microgrid ring with smart fault isolation",
                f"Lithium Iron Phosphate (LFP) BESS of {bess_mwh} MWh capacity for peak shaving and nighttime critical facility backup (Hospitals, STP, Water Pumps)",
                "Solar carports and bi-directional V2G (Vehicle-to-Grid) chargers across public transit hubs",
                "Mandatory rooftop solar on all civic, commercial, and multi-family residential structures with Net Metering"
            ],
            "monthly_generation_profile": monthly_profile,
            "assumptions_summary": [
                f"Solar PV: Bifacial Mono-PERC 550Wp modules at 15° fixed tilt, performance ratio (PR) 78%, CUF {solar_cuf*100}%.",
                f"Wind: 2.5 MW class-III turbines at 100m hub height (cut-in 3.0 m/s, rated 10.5 m/s).",
                f"Demand: 1,400 kWh/person/year based on Central Electricity Authority (CEA) smart city urban standard.",
                "Storage: 4-hour depth of discharge (DoD 90%) round-trip efficiency 86%."
            ]
        }

energy_service = EnergyService()
