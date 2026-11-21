from typing import Dict, Any, List
from backend.models.schemas import SoilAnalysisResult

class SoilService:
    """
    Soil Intelligence Service.
    Integrates ICAR Indian Soil Classification, SoilGrids, and Land Capability Classifications.
    """

    @classmethod
    def analyze_soil(cls, soil_data: Dict[str, Any] = None) -> SoilAnalysisResult:
        if soil_data is None:
            soil_data = {
                "order": "Vertisols (Deep Black Cotton & Saline Alluvial)",
                "texture": "Clay Loam",
                "sand_pct": 28.0,
                "silt_pct": 34.0,
                "clay_pct": 38.0,
                "soc_pct": 0.55,
                "depth_cm": 110.0,
                "drainage": "Moderately drained",
                "agri_class": "Class II (High to Moderate Agricultural Capability)"
            }

        clay = soil_data.get("clay_pct", 35.0)
        sand = soil_data.get("sand_pct", 30.0)
        silt = soil_data.get("silt_pct", 35.0)
        soc = soil_data.get("soc_pct", 0.55)
        depth = soil_data.get("depth_cm", 110.0)

        # Shrink-swell and geotechnical characteristics
        if "vertisol" in soil_data.get("order", "").lower() or clay > 35.0:
            shrink_swell = "High (Expansive Montmorillonite Clay - Black Cotton Soil)"
            cbr_note = "Low soaked CBR (2 - 3%); under-reamed pile or raft foundations mandatory."
            fertility = "High Cation Exchange Capacity (CEC), rich in calcium and magnesium."
        elif "alfisol" in soil_data.get("order", "").lower() or sand > 45.0:
            shrink_swell = "Low (Stable Kaolinite Clay - Red Loam)"
            cbr_note = "Moderate to High soaked CBR (5 - 8%); conventional shallow spread footings suitable."
            fertility = "Moderate; slightly acidic to neutral, responds well to organic composting."
        else:
            shrink_swell = "Moderate (Alluvial Inceptisols)"
            cbr_note = "Medium CBR (4 - 6%); requires compaction testing."
            fertility = "High alluvial fertility; optimal for multi-tier agro-forestry."

        conservation = [
            "Maintain bio-swales and vegetative silt traps along perimeter stormwater drains.",
            "Incorporate green manure (Sesbania / Crotalaria) and vermicompost to elevate Soil Organic Carbon > 0.8%.",
            "Implement deep subsoiling with mulch layers in designated urban farming zones to combat compaction.",
            "Establish contour bunding and vetiver grass hedges along natural drainage gradients."
        ]

        testing_protocols = [
            "Mandatory Core Penetration & SPT N-value testing at 50m grid intervals across proposed high-rise sectors.",
            "Liquid Limit (LL), Plastic Limit (PL), and Plasticity Index (PI) testing for expansive clay swell pressure determination.",
            "Standard Proctor Compaction and soaked California Bearing Ratio (CBR) tests for arterial road subgrades.",
            "Chemical soil testing for electrical conductivity (EC), pH, and soluble sulfates to specify sulfate-resistant cement if needed."
        ]

        return SoilAnalysisResult(
            soil_order=soil_data.get("order", "Vertisols"),
            texture_class=soil_data.get("texture", "Clay Loam"),
            sand_pct=sand,
            silt_pct=silt,
            clay_pct=clay,
            soil_organic_carbon_pct=soc,
            estimated_soil_depth_cm=depth,
            soil_fertility_index=fertility,
            drainage_characteristic=soil_data.get("drainage", "Moderately well drained"),
            shrink_swell_potential=shrink_swell,
            agricultural_suitability_class=soil_data.get("agri_class", "Class II"),
            recommended_agro_zones_pct=22.0 if clay > 30 else 18.0,
            soil_conservation_measures=conservation,
            field_testing_protocols_needed=testing_protocols
        )
