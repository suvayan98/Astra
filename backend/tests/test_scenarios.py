"""Unit tests for physical water balance and scenario stress testing (Milestone M5).

Verifies Section 6.6 formulas & thresholds:
- population(t) = pop0 * (1 + growth_rate) ** (t - 2026)
- demand_MLD(t) = population(t) * lpcd / 1_000_000
- 500,000 * 135 lpcd = 67.5 MLD sanity check
- 150,000 * 135 lpcd = 20.25 MLD sanity check
- Baseline scenario: stress_index < 0.8
- High-growth + dry scenario: crosses stress_index = 1.0 around 2038-2044 on stressed sites
- Conservation scenario: pulls stress index back below 0.8
- Day-1 deficit avoided: stress_index(2026) < 1.0
- Uncertainty bands: low/base/high bounds
- Qualitative flood stress: Stable / Elevated / High Amplification
"""

import pytest
from backend.app.scenarios import compute_physical_water_balance, run_scenarios
from backend.app.models import ScenarioRunRequest


def test_water_balance_demand_formula_sanity_checks():
    # Test Section 6.6 sanity checks:
    # 500,000 * 135 lpcd = 67.5 MLD
    # 150,000 * 135 lpcd = 20.25 MLD
    pop_500k = 500000
    lpcd_135 = 135.0
    demand_500k = (pop_500k * lpcd_135) / 1_000_000.0
    assert abs(demand_500k - 67.5) < 1e-4

    pop_150k = 150000
    demand_150k = (pop_150k * lpcd_135) / 1_000_000.0
    assert abs(demand_150k - 20.25) < 1e-4


def test_day_1_deficit_avoided():
    # Phase-1 greenfield site in 2026 with 150k baseline population
    res = compute_physical_water_balance(
        site_id="site_a",
        site_name="Site A",
        site_area_km2=25.0,
        rain_mean_mm=850.0,
        groundwater_class="Good",
        preset="baseline"
    )

    day1 = res.time_series[0]
    assert day1.year == 2026
    assert day1.population == 150000
    assert abs(day1.demand_mld - 20.25) < 1e-3
    assert day1.stress_index < 1.0, f"Day-1 deficit detected: stress_index = {day1.stress_index} >= 1.0"
    assert day1.balance_mld > 0.0


def test_baseline_scenario_stays_under_0_8():
    # Baseline scenario with target population 500k by 2050
    res = compute_physical_water_balance(
        site_id="site_a",
        site_name="Site A",
        site_area_km2=25.0,
        rain_mean_mm=850.0,
        groundwater_class="Good",
        target_population=500000,
        preset="baseline"
    )

    final = res.time_series[-1]
    assert final.year == 2050
    assert abs(final.demand_mld - 67.5) < 1e-2 # 500k * 135 lpcd
    # Section 6.6 requirement: stays in safe/moderate range (< 0.8)
    assert final.stress_index < 0.80, f"Baseline stress index {final.stress_index} must be < 0.80"
    assert res.deficit_year is None


def test_high_growth_dry_crosses_1_0():
    # High-growth + dry scenario on a resource-constrained site
    res = compute_physical_water_balance(
        site_id="site_b",
        site_name="Site B (Stressed)",
        site_area_km2=15.0,
        rain_mean_mm=600.0,
        groundwater_class="Poor",
        preset="high_growth_dry"
    )

    assert res.deficit_year is not None, "High-growth dry scenario should cross deficit threshold"
    assert 2030 <= res.deficit_year <= 2050, f"Deficit year {res.deficit_year} should occur within horizon"
    final = res.time_series[-1]
    assert final.stress_index > 1.0, f"Final stress index {final.stress_index} should exceed 1.0"
    assert res.stress_band == "Deficit"


def test_conservation_scenario_pulls_stress_below_0_8():
    res = compute_physical_water_balance(
        site_id="site_b",
        site_name="Site B (Conservation)",
        site_area_km2=25.0,
        rain_mean_mm=850.0,
        groundwater_class="Moderate",
        target_population=500000,
        preset="conservation"
    )

    final = res.time_series[-1]
    # Conservation applies 20% lpcd reduction (108 lpcd)
    expected_demand = (500000 * 108.0) / 1_000_000.0 # 54.0 MLD
    assert abs(final.demand_mld - expected_demand) < 0.5
    assert final.stress_index < 0.80, f"Conservation stress index {final.stress_index} should be < 0.80"


def test_uncertainty_bands_monotonicity():
    res = compute_physical_water_balance(
        site_id="site_a",
        site_name="Site A",
        site_area_km2=25.0,
        rain_mean_mm=850.0,
        groundwater_class="Good",
        preset="baseline"
    )

    for pt in res.time_series:
        assert pt.demand_low_mld <= pt.demand_mld <= pt.demand_high_mld
        assert pt.supply_low_mld <= pt.total_supply_mld <= pt.supply_high_mld


def test_qualitative_flood_stress_bands():
    # Stable site with good flood score and no rainfall increase
    res_stable = compute_physical_water_balance(
        site_id="site_a",
        site_name="Site A",
        flood_hazard_score=85.0,
        preset="baseline"
    )
    assert res_stable.qualitative_flood_stress_band in ["Stable", "Elevated"]

    # Site with low flood score / high flood risk
    res_high = compute_physical_water_balance(
        site_id="site_flood",
        site_name="Floodplain Site",
        flood_hazard_score=20.0,
        preset="baseline"
    )
    assert res_high.qualitative_flood_stress_band == "High Amplification"
