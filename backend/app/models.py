"""Pydantic v2 data models and schemas for TerraCity AI.

Covers:
- Indicator values with source provenance and confidence
- Multi-Criteria Analysis (MCA) scorecards and pillar breakdown
- Deal-breaker rule checks and spatial deal-breaker zones
- Multi-site comparison rankings and tie detection
- Physical water balance scenarios and stress test time-series
- Report generation schemas
"""

from typing import Any, Dict, List, Literal, Optional, Union
from pydantic import BaseModel, Field, ConfigDict


class SourceInfo(BaseModel):
    """Provenance metadata tracking the 4-portal Indian spatial data sources."""
    model_config = ConfigDict(extra="ignore")

    portal: str = Field(description="ISRO/Indian/Global portal (Bhoonidhi, MOSDAC, VEDAS, Bhuvan, OpenStreetMap)")
    dataset: str = Field(description="Dataset name (e.g. CartoDEM 30m, INSAT-3D, Sentinel-2 NDVI)")
    resolution: str = Field(default="Unknown", description="Spatial resolution (e.g. 30m, 4km, 10m, Vector)")
    vintage: str = Field(default="2023-2024", description="Observation or publication year/vintage")
    method: str = Field(default="Zonal Extraction", description="Derivation method (Direct WMS, Zonal stats, HAND proxy)")


class IndicatorValue(BaseModel):
    """Standardized single indicator measurement with provenance and confidence."""
    model_config = ConfigDict(extra="ignore")

    indicator: str = Field(description="Unique indicator identifier matching config/scoring.yaml")
    value: Optional[Union[float, int, str, bool]] = Field(default=None, description="Raw extracted value")
    unit: str = Field(default="", description="Engineering/scientific unit (%, mm/yr, km, index)")
    score: Optional[float] = Field(default=None, description="Normalized suitability score (0.0 to 100.0)")
    source: SourceInfo = Field(default_factory=lambda: SourceInfo(portal="Default", dataset="Generic"))
    confidence: str = Field(default="high", description="Data confidence tier: 'high', 'medium', or 'low'")
    confidence_score: Optional[float] = Field(default=None, description="Numeric confidence (0.0 - 1.0)")


class PillarScore(BaseModel):
    """Aggregate score for one of the 5 evaluation pillars."""
    model_config = ConfigDict(extra="ignore")

    id: str = Field(description="Pillar ID (terrain_and_land, water_security, etc.)")
    name: str = Field(description="Pillar human-readable display name")
    weight: float = Field(description="Assigned weight percentage (summing to 100 across 5 pillars)")
    raw_score: float = Field(description="Pillar raw score (0.0 - 100.0) based on indicator performance")
    weighted_score: float = Field(description="Weighted contribution: raw_score * weight / 100.0")
    indicators: Dict[str, IndicatorValue] = Field(default_factory=dict, description="Component indicators")


class DealBreakerResult(BaseModel):
    """Result of hard-stop disqualification rule evaluation."""
    model_config = ConfigDict(extra="ignore")

    rule_id: str = Field(description="Rule identifier from config/dealbreakers.yaml")
    rule_name: str = Field(description="Human readable rule title")
    description: str = Field(description="Explanation of threshold violation")
    triggered: bool = Field(default=False, description="True if deal-breaker condition was met")
    message: str = Field(default="", description="Verdict summary text")
    severity: str = Field(default="CRITICAL", description="Severity level")
    layer_key: Optional[str] = Field(default=None, description="Raster/vector layer key associated with rule")


class SiteScorecard(BaseModel):
    """Complete Multi-Criteria Analysis (MCA) scorecard for a candidate urban site."""
    model_config = ConfigDict(extra="ignore")

    site_id: str = Field(description="Unique candidate site identifier (e.g. site_a, site_b)")
    site_name: str = Field(description="Descriptive candidate site name")
    region_id: str = Field(default="up_jewar", description="Regional analysis study area ID")
    area_km2: float = Field(default=0.0, description="Candidate site footprint area in sq km")
    area_ha: float = Field(default=0.0, description="Candidate site footprint area in hectares")
    overall_score: float = Field(description="Composite suitability score (0.0 - 100.0)")
    verdict: str = Field(description="Suitability recommendation: 'SUITABLE', 'CONDITIONALLY SUITABLE', 'DISQUALIFIED'")
    preset_used: str = Field(default="balanced", description="Weight preset used (balanced, climate_resilient, infra_first)")
    is_disqualified: bool = Field(default=False, description="True if any hard deal-breaker triggered")
    disqualification_reasons: List[str] = Field(default_factory=list, description="List of triggered deal breaker names")
    deal_breakers: List[DealBreakerResult] = Field(default_factory=list, description="All deal breaker evaluations")
    deal_breaker_zones: Optional[Dict[str, Any]] = Field(default=None, description="GeoJSON FeatureCollection of spatial violation masks")
    pillars: Dict[str, PillarScore] = Field(default_factory=dict, description="5 Evaluation pillars")
    indicators: Dict[str, IndicatorValue] = Field(default_factory=dict, description="All raw & normalized indicators")
    site_confidence_pct: float = Field(default=100.0, description="Overall data completeness & reliability confidence %")
    site_confidence_label: str = Field(default="High", description="'High', 'Medium', or 'Low'")
    missing_indicators: List[str] = Field(default_factory=list, description="Indicators with missing/null data")
    renormalized_weights: Dict[str, float] = Field(default_factory=dict, description="Active weights after missing-data adjustment")
    geometry: Optional[Dict[str, Any]] = Field(default=None, description="GeoJSON Polygon geometry of site")


class SiteComparisonRank(BaseModel):
    """Ranked summary entry for comparative decision matrix."""
    model_config = ConfigDict(extra="ignore")

    rank: int = Field(description="Rank position (1 = highest suitability)")
    site_id: str = Field(description="Site identifier")
    site_name: str = Field(description="Site name")
    overall_score: float = Field(description="Suitability score (0.0 - 100.0)")
    verdict: str = Field(description="Suitability verdict")
    is_disqualified: bool = Field(default=False)
    pillar_scores: Dict[str, float] = Field(default_factory=dict, description="Raw scores per pillar")
    top_drivers: List[str] = Field(default_factory=list, description="Top positive or differentiating pillar drivers")
    key_advantages: List[str] = Field(default_factory=list, description="Primary strengths")
    key_risks: List[str] = Field(default_factory=list, description="Identified constraints or vulnerabilities")


class CompareResponse(BaseModel):
    """Comparative multi-site ranking analysis response."""
    model_config = ConfigDict(extra="ignore")

    region_id: str = Field(default="up_jewar")
    preset_used: str = Field(default="balanced")
    rankings: List[SiteComparisonRank] = Field(default_factory=list)
    tie_detected: bool = Field(default=False, description="True if top candidate difference < 5.0 points")
    tie_note: Optional[str] = Field(default=None, description="Tie sensitivity advisory note")
    narrative: str = Field(description="Deterministic executive comparison narrative")
    pillar_comparison_matrix: Dict[str, Dict[str, float]] = Field(default_factory=dict, description="Pillar -> {site_id: score}")
    sites: Dict[str, SiteScorecard] = Field(default_factory=dict, description="Full scorecards per site")


class ScenarioRunRequest(BaseModel):
    """Request payload for running 2026-2050 physical water balance scenarios."""
    model_config = ConfigDict(extra="ignore")

    site_ids: List[str] = Field(default_factory=list, description="Candidate site IDs to model")
    region_id: str = Field(default="up_jewar", description="Study region")
    start_year: int = Field(default=2026, description="Modeling start year")
    horizon_year: int = Field(default=2050, description="Planning horizon (e.g. 2035 or 2050)")
    target_population: int = Field(default=500000, description="Target urban population at horizon")
    pop_growth_rate: Optional[float] = Field(default=None, description="Optional custom annual CAGR")
    climate_scenario: str = Field(default="baseline", description="'baseline', 'moderate_warming', 'high_stress_dry'")
    lpcd: float = Field(default=135.0, description="Litres per capita per day standard")
    custom_external_supply_mld: Optional[float] = Field(default=None, description="Optional override for external piped supply (MLD)")
    catchment_area_multiplier: float = Field(default=3.0, description="Catchment footprint multiplier relative to site area")


class YearlyWaterBalance(BaseModel):
    """Annual point on the 2026-2050 physical water balance trajectory."""
    model_config = ConfigDict(extra="ignore")

    year: int = Field(description="Calendar year")
    population: int = Field(description="Projected urban population")
    demand_mld: float = Field(description="Total domestic & municipal demand (MLD)")
    local_supply_mld: float = Field(description="Local rainwater/aquifer harvest supply (MLD)")
    external_supply_mld: float = Field(description="External municipal/canal supply allocation (MLD)")
    total_supply_mld: float = Field(description="Total available supply: local + external (MLD)")
    balance_mld: float = Field(description="Surplus or deficit: total_supply_mld - demand_mld")
    stress_index: float = Field(description="Water Stress Index: demand_mld / total_supply_mld")
    demand_low_mld: float = Field(description="Conservation uncertainty lower bound (MLD)")
    demand_high_mld: float = Field(description="High-demand uncertainty upper bound (MLD)")
    supply_low_mld: float = Field(description="Dry year supply lower bound (MLD)")
    supply_high_mld: float = Field(description="Wet year supply upper bound (MLD)")


class SiteScenarioResult(BaseModel):
    """Stress test projection output for a candidate site."""
    model_config = ConfigDict(extra="ignore")

    site_id: str = Field(description="Site ID")
    site_name: str = Field(description="Site name")
    horizon_year: int = Field(description="Horizon year (2035 or 2050)")
    final_population: int = Field(description="Population at horizon year")
    final_demand_mld: float = Field(description="Demand at horizon year (MLD)")
    final_supply_mld: float = Field(description="Supply at horizon year (MLD)")
    final_stress_index: float = Field(description="Stress index at horizon year")
    stress_band: str = Field(description="'Low Stress', 'Moderate Stress', 'High Stress', 'Severe Deficit'")
    qualitative_flood_stress_band: str = Field(description="'Low Flood Risk', 'Moderate Flood Risk', 'Critical Inundation Risk'")
    deficit_year: Optional[int] = Field(default=None, description="First year when stress_index > 1.0 (demand > supply)")
    time_series: List[YearlyWaterBalance] = Field(default_factory=list, description="Yearly projection series")


class ScenarioRunResponse(BaseModel):
    """Response envelope for stress scenario execution."""
    model_config = ConfigDict(extra="ignore")

    scenario_name: str = Field(description="Climate scenario name")
    horizon_year: int = Field(description="Planning horizon year")
    results: Dict[str, SiteScenarioResult] = Field(default_factory=dict, description="Results keyed by site_id")
    summary_narrative: str = Field(description="Executive interpretation of water security trajectory")


class ReportGenerateRequest(BaseModel):
    """Request to generate standalone HTML or export bundle."""
    model_config = ConfigDict(extra="ignore")

    site_ids: List[str] = Field(default_factory=list)
    region_id: str = Field(default="up_jewar")
    preset: str = Field(default="balanced")
    scenario: str = Field(default="baseline")
    include_geojson: bool = Field(default=True)


class ReportResponse(BaseModel):
    """Printable report generation response."""
    model_config = ConfigDict(extra="ignore")

    html: str = Field(description="Standalone self-contained printable HTML document")
    generated_at: str = Field(description="ISO 8601 generation timestamp")
    site_count: int = Field(description="Number of sites in report")
