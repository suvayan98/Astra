from typing import Dict, Any, List
from backend.models.schemas import RenewableEnergyResult, MonthlyEnergyData

class EnergyService:
    """
    Renewable Energy Intelligence Service.
    Integrates Global Solar Atlas, NASA POWER, and Global Wind Atlas methodologies.
    Estimates solar PV, wind generation, battery storage (BESS), and net-zero balancing.
    """

    @classmethod
    def calculate_energy_potential(
        cls,
        population: int = 20000,
        area_acres: float = 500.0,
        solar_ghi: float = 5.5,
        wind_speed_50m: float = 5.5,
        wind_wpd: float = 180.0
    ) -> RenewableEnergyResult:
        # 1. Urban Electricity Demand Modeling
        # Typical Indian smart city consumption: ~1,350 kWh per capita per year
        # Includes residential, commercial, street lighting, EV transit, and water pumping
        annual_electricity_demand_gwh = (population * 1350.0) / 1_000_000.0 # ~27.0 GWh/yr

        # 2. Ground-Mounted Solar Farm Sizing
        # 35 acres allocated to utility solar farm + agro-voltaic dual use
        # Rule of thumb: ~1 MWp requires ~3.5 to 4.0 acres of ground area
        solar_farm_acres = 35.0
        solar_farm_capacity_mwp = solar_farm_acres / 3.8 # ~9.2 MWp

        # 3. Rooftop Solar Potential
        # For 20,000 population in 500 acres, estimated residential/commercial building footprint is ~45 acres
        # 35% rooftop availability for solar PV = ~15.75 acres (~63,700 m2)
        # Standard 21% mono-PERC module yields ~180 Wp/m2 -> ~11.5 MWp
        rooftop_solar_mwp = 11.5
        total_solar_mwp = solar_farm_capacity_mwp + rooftop_solar_mwp # ~20.7 MWp

        # Solar Generation Yield
        # PVOUT: Specific yield in India typically 1,550 to 1,680 kWh/kWp/year
        specific_yield_kwh_kwp = round(solar_ghi * 295.0, 1) # ~1,620 kWh/kWp
        annual_solar_gen_gwh = (total_solar_mwp * 1000.0 * specific_yield_kwh_kwp) / 1_000_000.0 # ~33.5 GWh/yr

        # 4. Wind Energy Potential
        # If wind speed > 5.0 m/s, install 3 medium-scale 2.0 MW smart urban-edge turbines
        if wind_speed_50m >= 5.0:
            turbines_count = 3
            wind_cap_mw = turbines_count * 2.0 # 6.0 MW
            # Capacity factor in Indian Class III/IV wind sites ~24%
            capacity_factor = 0.24 + (0.02 * (wind_speed_50m - 5.0))
            annual_wind_gen_gwh = wind_cap_mw * 8760.0 * capacity_factor / 1000.0 # ~13.8 GWh
        else:
            turbines_count = 1
            wind_cap_mw = 1.5
            annual_wind_gen_gwh = wind_cap_mw * 8760.0 * 0.18 / 1000.0 # ~2.3 GWh

        total_re_gen_gwh = annual_solar_gen_gwh + annual_wind_gen_gwh
        re_share_pct = min(100.0, round((total_re_gen_gwh / annual_electricity_demand_gwh) * 100.0, 1))

        # 5. Battery Energy Storage System (BESS) Sizing
        # To shift daytime solar surplus to 4-hour evening peak (6 PM to 10 PM)
        # Daily city consumption: 27 GWh / 365 = ~74 MWh/day
        # 4-hour peak requires ~30% of daily demand = ~22 MWh storage
        bess_mwh = round(annual_electricity_demand_gwh * (1000.0 / 365.0) * 0.35, 1) # ~26 MWh

        # Monthly breakdown
        months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        solar_monthly_factors = [0.88, 0.95, 1.12, 1.18, 1.22, 0.92, 0.78, 0.75, 0.88, 1.05, 0.94, 0.85]
        wind_monthly_factors = [0.80, 0.75, 0.85, 1.10, 1.35, 1.45, 1.40, 1.30, 1.05, 0.75, 0.70, 0.75]

        monthly_data = []
        for i, m in enumerate(months):
            s_ghi = round(solar_ghi * solar_monthly_factors[i], 2)
            w_spd = round(wind_speed_50m * wind_monthly_factors[i], 2)
            gen = round((total_solar_mwp * 1000 * s_ghi * 30 * 0.80) / 1000.0, 1) # MWh
            monthly_data.append(MonthlyEnergyData(
                month=m,
                solar_kwh_m2_day=s_ghi,
                wind_speed_ms=w_spd,
                estimated_solar_gen_mwh=gen
            ))

        assumptions = {
            "per_capita_electricity_kwh_year": 1350.0,
            "solar_pv_module_efficiency": "21.2% Monocrystalline Tier-1 Mono-PERC",
            "solar_inverter_derating_factor": 0.82,
            "optimal_panel_tilt": "Latitude - 2° southward fixed tilt (seasonal bifacial)",
            "rooftop_utilization_ratio": "35% of total building envelope",
            "bess_technology": "Lithium Iron Phosphate (LFP) 4-Hour C-rate 0.25C",
            "microgrid_redundancy": "N-1 substation transformer criteria with islanding capability"
        }

        return RenewableEnergyResult(
            solar_ghi_kwh_m2_day=solar_ghi,
            solar_dni_kwh_m2_day=round(solar_ghi * 1.05, 2),
            mean_wind_speed_50m_ms=wind_speed_50m,
            wind_power_density_wm2=wind_wpd,
            recommended_solar_farm_area_acres=solar_farm_acres,
            recommended_solar_farm_capacity_mwp=round(solar_farm_capacity_mwp, 1),
            estimated_rooftop_solar_capacity_mwp=round(rooftop_solar_mwp, 1),
            total_solar_installed_mwp=round(total_solar_mwp, 1),
            annual_solar_generation_gwh=round(annual_solar_gen_gwh, 2),
            potential_wind_turbines_count=turbines_count,
            potential_wind_capacity_mw=round(wind_cap_mw, 1),
            annual_wind_generation_gwh=round(annual_wind_gen_gwh, 2),
            annual_settlement_electricity_demand_gwh=round(annual_electricity_demand_gwh, 2),
            total_renewable_generation_gwh=round(total_re_gen_gwh, 2),
            renewable_energy_share_pct=re_share_pct,
            recommended_bess_capacity_mwh=bess_mwh,
            monthly_breakdown=monthly_data,
            assumptions_log=assumptions
        )
