from typing import Dict, Any, List
from backend.models.schemas import VegetationIntelligenceResult, NativeSpeciesRecommendation

class VegetationService:
    """
    Vegetation and Green City Planning Service.
    Integrates ISRO VEDAS vegetation indices, Indian agro-ecological zone botany,
    and Miyawaki urban afforestation standards.
    """

    NATIVE_SPECIES_CATALOG = [
        NativeSpeciesRecommendation(
            common_name="Neem",
            botanical_name="Azadirachta indica",
            category="Shade & Microclimate Cooling",
            canopy_spread_m=12.0,
            water_requirement="Low (Drought tolerant)",
            soil_affinity="Tolerates saline, rocky, clayey soils (Vertisols & Inceptisols)",
            carbon_sequestration_potential="High (28 kg CO2/tree/year)"
        ),
        NativeSpeciesRecommendation(
            common_name="Peepal (Sacred Fig)",
            botanical_name="Ficus religiosa",
            category="Urban Keystone / Oxygen Generator",
            canopy_spread_m=18.0,
            water_requirement="Medium",
            soil_affinity="Deep alluvial & well-drained loams",
            carbon_sequestration_potential="Very High (35 kg CO2/tree/year, high nocturnal O2)"
        ),
        NativeSpeciesRecommendation(
            common_name="Jamun (Java Plum)",
            botanical_name="Syzygium cumini",
            category="Riparian & Waterway Buffer",
            canopy_spread_m=14.0,
            water_requirement="Medium to High",
            soil_affinity="River banks, moist soils, retention pond fringes",
            carbon_sequestration_potential="High (Water table stabilizing root system)"
        ),
        NativeSpeciesRecommendation(
            common_name="Karanja (Indian Beech)",
            botanical_name="Pongamia pinnata",
            category="Avenue & Bio-drainage",
            canopy_spread_m=10.0,
            water_requirement="Low",
            soil_affinity="Sandy loams, black cotton Vertisols, waterlogged margins",
            carbon_sequestration_potential="High (Nitrogen-fixing leguminous tree)"
        ),
        NativeSpeciesRecommendation(
            common_name="Arjun",
            botanical_name="Terminalia arjuna",
            category="Riverine Buffer & Soil Stabilization",
            canopy_spread_m=16.0,
            water_requirement="Medium to High",
            soil_affinity="Alluvial river valleys and wet basins",
            carbon_sequestration_potential="Very High (Prevents stream bank erosion)"
        ),
        NativeSpeciesRecommendation(
            common_name="Banyan",
            botanical_name="Ficus benghalensis",
            category="Civic Park Keystone & Avian Habitat",
            canopy_spread_m=28.0,
            water_requirement="Medium",
            soil_affinity="Alluvial and loamy soils",
            carbon_sequestration_potential="Very High (Massive sprawling canopy biomass)"
        ),
        NativeSpeciesRecommendation(
            common_name="Tamarind (Imli)",
            botanical_name="Tamarindus indica",
            category="Windbreak & Urban Boulevard",
            canopy_spread_m=14.0,
            water_requirement="Low",
            soil_affinity="Deep loams, red soils (Alfisols), dry semi-arid plains",
            carbon_sequestration_potential="High (Durable wind-resistant wood)"
        )
    ]

    @classmethod
    def analyze_vegetation(
        cls,
        veg_data: Dict[str, Any] = None,
        area_acres: float = 500.0
    ) -> VegetationIntelligenceResult:
        if veg_data is None:
            veg_data = {
                "ndvi_mean": 0.38,
                "ndvi_min": 0.15,
                "ndvi_max": 0.68,
                "evi_mean": 0.28,
                "canopy_pct": 14.5
            }

        ndvi_mean = veg_data.get("ndvi_mean", 0.38)
        canopy = veg_data.get("canopy_pct", 14.5)

        # Urban forestry targets:
        # A sustainable smart city should allocate minimum 30% to 35% to contiguous green buffer
        proposed_green_target = 35.0
        urban_forest_acres = (area_acres * proposed_green_target) / 100.0 # ~175 acres
        miyawaki_pockets = max(4, int(area_acres / 100.0) * 2) # ~10 pockets

        crop_patterns = [
            "Agro-forestry multi-tier: Moringa, Papaya and Millet understory",
            "Permaculture food forests providing local vegetable self-sufficiency",
            "Drip-irrigated pulse and legume rotation to revitalize soil nitrogen"
        ]

        return VegetationIntelligenceResult(
            satellite_ndvi_mean=ndvi_mean,
            satellite_ndvi_min=veg_data.get("ndvi_min", 0.12),
            satellite_ndvi_max=veg_data.get("ndvi_max", 0.72),
            satellite_evi_mean=veg_data.get("evi_mean", 0.28),
            existing_canopy_cover_pct=canopy,
            proposed_green_cover_target_pct=proposed_green_target,
            urban_forest_area_acres=round(urban_forest_acres, 1),
            miyawaki_pockets_recommended=miyawaki_pockets,
            native_species_list=cls.NATIVE_SPECIES_CATALOG,
            biodiversity_corridor_connectivity="Continuous peripheral ecological green loop connected through central pedestrian spine",
            recommended_crop_patterns=crop_patterns,
            satellite_observation_source="ISRO VEDAS Temporal NDVI & Sentinel-2 Surface Reflectance (10m Resolution)"
        )
