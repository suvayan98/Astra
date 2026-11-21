from typing import Dict, Any, List
from app.adapters.vedas_adapter import vedas_adapter

class VegetationService:
    """
    Module G: TerraVegetation AI — Green City Planner & Biodiversity Intelligence.
    Synthesizes ISRO VEDAS vegetation indices with ecological native tree selections and urban biophilic zoning.
    """

    async def analyze(self, lat: float, lng: float, area_acres: float = 500.0) -> Dict[str, Any]:
        vedas_data = await vedas_adapter.get_vegetation_time_series(lat, lng)
        
        # Native species matrix by Indian ecological region
        if lat < 14.5: # Bengaluru / Southern Deccan
            native_species = [
                {"name": "Honge (Pongamia pinnata)", "stratum": "Canopy", "eco_service": "Nitrogen-fixing, high drought tolerance, biodiesel seed oil, ideal roadside avenue tree"},
                {"name": "Neem (Azadirachta indica)", "stratum": "Canopy", "eco_service": "Air purifying (PM10/2.5 capture), natural bio-pesticide, shade tree"},
                {"name": "Banyan (Ficus benghalensis)", "stratum": "Keystone", "eco_service": "Avian nesting, deep soil anchoring, urban microclimate cooling"},
                {"name": "Jamun (Syzygium cumini)", "stratum": "Sub-canopy", "eco_service": "Fruit for birds and urban fauna, high water-table buffer"},
                {"name": "Sampige (Magnolia champaca)", "stratum": "Ornamental", "eco_service": "Aromatic, pollinator attractant, cultural heritage"},
                {"name": "Bamboo (Bambusa bambos)", "stratum": "Buffer", "eco_service": "Rapid carbon sequestration, storm barrier, riparian stream stabilizer"}
            ]
        elif lat > 20.0 and lng < 74.0: # Gujarat Dholera / Coastal Saline
            native_species = [
                {"name": "Khejri (Prosopis cineraria)", "stratum": "Keystone", "eco_service": "Kalpavriksha of arid zones, fixes nitrogen in saline sands, deep taproot"},
                {"name": "Babool (Acacia nilotica)", "stratum": "Canopy", "eco_service": "Halotolerant, binds loose soil, excellent bird habitat"},
                {"name": "Pilu (Salvadora persica)", "stratum": "Sub-canopy", "eco_service": "High salt tolerance, sand dune stabilization, traditional toothbrush tree"},
                {"name": "Guggul (Commiphora wightii)", "stratum": "Shrub", "eco_service": "Endangered medicinal arid shrub, thrives in nutrient-poor gravel"},
                {"name": "Date Palm (Phoenix sylvestris)", "stratum": "Canopy", "eco_service": "Tolerates brackish water, windbreak barrier, bio-drainage"}
            ]
        elif lat > 24.0: # Bundelkhand Rocky
            native_species = [
                {"name": "Mahua (Madhuca longifolia)", "stratum": "Keystone", "eco_service": "Deciduous canopy, non-timber forest produce, sacred grove tree"},
                {"name": "Palash / Flame of the Forest (Butea monosperma)", "stratum": "Sub-canopy", "eco_service": "Survives rocky exposed terrain, intense spring flowering for native bees"},
                {"name": "Amla (Phyllanthus emblica)", "stratum": "Orchard", "eco_service": "Rich vitamin C, high carbon density in dryland soils"},
                {"name": "Khair (Acacia catechu)", "stratum": "Canopy", "eco_service": "Rocky slope soil anchor, drought-hardy"},
                {"name": "Teak (Tectona grandis)", "stratum": "Timber / Corridor", "eco_service": "Deciduous timber canopy for secondary perimeter zones"}
            ]
        else: # Amaravati Krishna Alluvial Basin
            native_species = [
                {"name": "Neem (Azadirachta indica)", "stratum": "Canopy", "eco_service": "High resilience in Vertisols, intense urban cooling, pest repellant"},
                {"name": "Peepal (Ficus religiosa)", "stratum": "Keystone", "eco_service": "Round-the-clock oxygen emission, avian sanctuary, immense shade canopy"},
                {"name": "Jamun (Syzygium cumini)", "stratum": "Canopy", "eco_service": "Tolerates clay waterlogging during monsoons, edible fruit"},
                {"name": "Tamarind (Tamarindus indica)", "stratum": "Avenue", "eco_service": "Extremely long-lived avenue shade, acidic fruit, wind deflection"},
                {"name": "Kadamba (Neolamarckia cadamba)", "stratum": "Riparian", "eco_service": "Rapid growing riparian tree along lake and water harvesting margins"}
            ]

        # Green zoning breakdown for 500 acres
        green_open_pct = 42.0 # 42% dedicated open/green space
        green_acres = round(area_acres * (green_open_pct / 100.0), 1) # 210 acres
        corridors_acres = round(green_acres * 0.40, 1) # 84 acres
        urban_forests_acres = round(green_acres * 0.60, 1) # 126 acres

        return {
            "site_id": f"veg_site_{int(lat*100)}_{int(lng*100)}",
            "mean_ndvi": vedas_data["mean_ndvi"],
            "mean_evi": vedas_data["mean_evi"],
            "canopy_cover_pct": vedas_data["canopy_cover_pct"],
            "degraded_land_pct": round(100.0 - vedas_data["canopy_cover_pct"] - 35.0, 1),
            "recommended_native_species": native_species,
            "biodiversity_corridors_acres": corridors_acres,
            "urban_forest_parks_acres": urban_forests_acres,
            "green_cover_ratio_pct": green_open_pct,
            "ndvi_time_series": vedas_data["time_series"],
            "urban_greening_recommendations": [
                "Establish a continuous 150m wide ecological biodiversity corridor connecting the site's natural drainage to external rural forests",
                "Deploy the Japanese Miyawaki high-density native afforestation technique in pocket parks for 10x faster micro-forest canopy growth",
                "Implement a 3-tier vertical green wall and rooftop sedum garden policy for all commercial and institutional facades",
                "Strict ban on invasive non-native species such as Conocarpus, Eucalyptus, and Prosopis juliflora that deplete groundwater"
            ]
        }

vegetation_service = VegetationService()
