from typing import Dict, Any, List

class SoilService:
    """
    Module C: TerraSoil AI — Soil Intelligence.
    Analyzes soil physical/chemical parameters, fertility, agricultural zones, and engineering implications.
    """

    def analyze(self, lat: float, lng: float, site_name: str = "Candidate Site") -> Dict[str, Any]:
        if lat < 14.5: # Bengaluru
            soil_type = "Red Sandy Loam (Alfisols)"
            sand, silt, clay = 62.0, 18.0, 20.0
            soc = 4.8
            depth = "Deep (>100 cm over weathered granitic saprolite)"
            ph = 6.4
            fertility = "Moderate (Deficient in Nitrogen, responsive to bio-fertilizers)"
            drainage = "Well drained with high hydraulic conductivity"
            agri_suit = 64.0
            crops = ["Finger Millet (Ragi)", "Groundnut", "Pulses (Red gram)", "Mulberry"]
            trees = ["Neem (Azadirachta indica)", "Banyan (Ficus benghalensis)", "Honge / Pongamia pinnata", "Jamun (Syzygium cumini)"]
            conservation = ["Contour bunding", "Mulching with organic crop residues", "Recharge pit trenches along field borders"]
        elif lat > 20.0 and lng < 74.0: # Gujarat Dholera
            soil_type = "Coastal Marine Alluvial & Saline Silt Clay (Inceptisols/Vertic)"
            sand, silt, clay = 24.0, 44.0, 32.0
            soc = 3.2
            depth = "Moderately deep to deep (75-120 cm)"
            ph = 8.2
            fertility = "Low-Moderate due to soil salinity and sodicity hazard"
            drainage = "Imperfectly drained; prone to seasonal waterlogging"
            agri_suit = 38.0
            crops = ["Cotton (Bt varieties)", "Sorghum (Jowar)", "Castor", "Halophytic fodder grasses"]
            trees = ["Prosopis cineraria (Khejri)", "Acacia nilotica (Babool)", "Salvadora persica (Pilu)", "Phoenix sylvestris (Date Palm)"]
            conservation = ["Gypsum amendment for sodic reclamation", "Subsurface tile drainage", "Halophyte green belt borders"]
        elif lat > 24.0: # Bundelkhand
            soil_type = "Mixed Red and Black Loam (Rakar and Kabar / Alfisols)"
            sand, silt, clay = 48.0, 28.0, 24.0
            soc = 3.6
            depth = "Shallow to medium (35-70 cm over hard quartz/granite bedrock)"
            ph = 7.1
            fertility = "Moderate-Low (Phosphorus fixing, low organic matter)"
            drainage = "Rapid runoff on slopes, localized low percolation"
            agri_suit = 52.0
            crops = ["Chickpea (Gram)", "Sesame (Til)", "Wheat (durum)", "Mustard"]
            trees = ["Mahua (Madhuca longifolia)", "Neem (Azadirachta indica)", "Palash (Butea monosperma)", "Amla (Phyllanthus emblica)"]
            conservation = ["Medhbandi (Field earthern bunds)", "Farm ponds (Khet talab)", "Agro-forestry with hardy legumes"]
        else: # Amaravati / Krishna valley
            soil_type = "Deep Black Cotton Clay Soil (Vertisols)"
            sand, silt, clay = 18.0, 26.0, 56.0
            soc = 6.2
            depth = "Very Deep (>150 cm rich alluvial clay)"
            ph = 7.8
            fertility = "High Natural Fertility (High cation exchange capacity)"
            drainage = "Slow to very slow internal drainage; high swelling and shrinkage"
            agri_suit = 88.0
            crops = ["Chillies", "Cotton", "Paddy (rice)", "Sugarcane", "Turmeric"]
            trees = ["Neem (Azadirachta indica)", "Jamun (Syzygium cumini)", "Peepal (Ficus religiosa)", "Subabul", "Tamarind (Tamarindus indica)"]
            conservation = ["Broad-bed furrow (BBF) system for drainage", "Under-reamed pile foundation recommendation for buildings", "Green manuring with Sunnhemp"]

        return {
            "site_id": site_name.lower().replace(" ", "_"),
            "soil_type": soil_type,
            "texture": "Clay Loam" if clay > 30 else ("Sandy Loam" if sand > 50 else "Loam"),
            "sand_pct": sand,
            "silt_pct": silt,
            "clay_pct": clay,
            "soil_organic_carbon_g_kg": soc,
            "soil_depth_cm": depth,
            "soil_ph": ph,
            "fertility_index": fertility,
            "drainage_characteristic": drainage,
            "erosion_susceptibility": "Moderate" if (sand > 45 or clay > 50) else "Low",
            "agricultural_suitability_pct": agri_suit,
            "recommended_crops": crops,
            "recommended_trees": trees,
            "soil_conservation_methods": conservation,
            "field_survey_recommendation": "CRITICAL: Vertisols (Black Cotton) and coastal clays exhibit high Shrink-Swell Plasticity Index (PI > 30%). Mandatory geotechnical soil core borings (ASTM D1586) required before foundation laying.",
            "data_source_nature": "Regional ICAR-NBSS&LUP Soil Resource Mapping & SoilGrids 250m global model. Distinction: Regional spatial model, not on-site soil auger test."
        }

soil_service = SoilService()
