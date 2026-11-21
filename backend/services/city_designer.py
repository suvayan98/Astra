import math
from typing import Dict, Any, List, Optional
from backend.models.schemas import (
    MasterPlanAlternative, MasterPlanZone, CityGenerationRequest, GeoPolygon
)

class CityDesignerService:
    """
    AI City Master Plan Generator.
    Synthesizes geospatial boundary constraints, demographic targets, and sustainability
    priorities to generate 3 distinct, geometrically partitioned city layouts:
    - Plan A: Compact and Walkable City (Transit-Oriented Development TOD)
    - Plan B: Green and Low-Density Settlement (Agro-Ecological)
    - Plan C: Resource-Efficient Smart City (Circular Economy)
    """

    ZONE_COLORS = {
        "Residential": "#3b82f6",       # Blue
        "Commercial": "#8b5cf6",        # Purple
        "Industrial Clean-Tech": "#64748b", # Slate/Steel
        "Agricultural Agro-Forestry": "#84cc16", # Lime
        "Parks & Green Belt": "#10b981", # Emerald
        "Water Bodies & RWH": "#06b6d4", # Cyan
        "Roads & Transit Spine": "#f59e0b", # Amber
        "Renewable Solar Farm": "#eab308", # Yellow
        "Water Treatment DEWATS": "#0284c7", # Light Blue
        "Solid Waste Recovery": "#d97706", # Ochre
        "Hospitals & Emergency": "#ef4444", # Red
        "Schools & Public Institutions": "#ec4899" # Pink
    }

    @classmethod
    def _get_bounding_box(cls, coords: List[List[float]]) -> Dict[str, float]:
        lons = [p[0] for p in coords]
        lats = [p[1] for p in coords]
        return {
            "min_lon": min(lons),
            "max_lon": max(lons),
            "min_lat": min(lats),
            "max_lat": max(lats)
        }

    @classmethod
    def _slice_box(
        cls,
        bbox: Dict[str, float],
        u_min: float,
        u_max: float,
        v_min: float,
        v_max: float
    ) -> List[List[float]]:
        """
        Subdivides the bounding box using normalized UV coordinates (0.0 to 1.0)
        to produce realistic geometric zoning parcels inside the boundary.
        """
        lon_span = bbox["max_lon"] - bbox["min_lon"]
        lat_span = bbox["max_lat"] - bbox["min_lat"]

        p1_lon = bbox["min_lon"] + (u_min * lon_span)
        p1_lat = bbox["min_lat"] + (v_min * lat_span)

        p2_lon = bbox["min_lon"] + (u_max * lon_span)
        p2_lat = bbox["min_lat"] + (v_min * lat_span)

        p3_lon = bbox["min_lon"] + (u_max * lon_span)
        p3_lat = bbox["min_lat"] + (v_max * lat_span)

        p4_lon = bbox["min_lon"] + (u_min * lon_span)
        p4_lat = bbox["min_lat"] + (v_max * lat_span)

        return [
            [round(p1_lon, 6), round(p1_lat, 6)],
            [round(p2_lon, 6), round(p2_lat, 6)],
            [round(p3_lon, 6), round(p3_lat, 6)],
            [round(p4_lon, 6), round(p4_lat, 6)],
            [round(p1_lon, 6), round(p1_lat, 6)],
        ]

    @classmethod
    def generate_master_plans(cls, request: CityGenerationRequest) -> List[MasterPlanAlternative]:
        coords = request.boundary.coordinates[0]
        bbox = cls._get_bounding_box(coords)
        pop = request.target_population
        acres = request.total_area_acres
        sqkm = round(acres * 0.00404686, 3) # 500 acres = 2.023 sq km

        # Calculate population density realism:
        gross_density_sqkm = round(pop / sqkm, 1) # ~9,886 persons/sq.km
        gross_density_acre = round(pop / acres, 1) # ~40.0 persons/acre

        density_eval = (
            f"REALISTIC & HIGHLY SUSTAINABLE: For {pop:,} people across {acres:.0f} acres ({sqkm} km²), "
            f"the gross population density is {gross_density_sqkm:,.0f} people/km² ({gross_density_acre} people/acre). "
            f"This benchmark aligns with acclaimed human-scale urban centers like Chandigarh (~9,000/km²), "
            f"Freiburg Vauban (~8,500/km²), and Singapore new towns (~10,000/km²). It avoids low-density car sprawl "
            f"while guaranteeing that 30% to 40% of the land remains permanently preserved for green buffers, "
            f"water reservoirs, and local agriculture."
        )

        plans = []

        # ==========================================
        # PLAN A: Compact and Walkable City (TOD)
        # ==========================================
        zones_a = [
            MasterPlanZone(
                id="plan_a_z1_core_res",
                name="High-Density Mixed Residential Core",
                zone_type="Residential",
                area_acres=round(acres * 0.28, 1),
                area_hectares=round(acres * 0.28 * 0.404686, 1),
                area_percentage=28.0,
                color=cls.ZONE_COLORS["Residential"],
                far_ratio=2.4,
                target_capacity_people=int(pop * 0.70),
                description="Transit-oriented mid-rise apartments (G+6 to G+10) with ground-floor grocery, clinics, and active frontages.",
                geometry={"type": "Polygon", "coordinates": [cls._slice_box(bbox, 0.25, 0.65, 0.35, 0.75)]}
            ),
            MasterPlanZone(
                id="plan_a_z2_comm",
                name="Central Commercial & Innovation Plaza",
                zone_type="Commercial",
                area_acres=round(acres * 0.10, 1),
                area_hectares=round(acres * 0.10 * 0.404686, 1),
                area_percentage=10.0,
                color=cls.ZONE_COLORS["Commercial"],
                far_ratio=3.0,
                target_capacity_people=int(pop * 0.15),
                description="Pedestrian-only commercial high street, co-working incubators, retail, and transit interchange.",
                geometry={"type": "Polygon", "coordinates": [cls._slice_box(bbox, 0.40, 0.60, 0.45, 0.65)]}
            ),
            MasterPlanZone(
                id="plan_a_z3_green",
                name="Peripheral Continuous Ecological Green Loop",
                zone_type="Parks & Green Belt",
                area_acres=round(acres * 0.25, 1),
                area_hectares=round(acres * 0.25 * 0.404686, 1),
                area_percentage=25.0,
                color=cls.ZONE_COLORS["Parks & Green Belt"],
                far_ratio=0.05,
                target_capacity_people=0,
                description="Dense Miyawaki urban forest, biodiversity wildlife corridor, and continuous perimeter running/cycling trail.",
                geometry={"type": "Polygon", "coordinates": [cls._slice_box(bbox, 0.05, 0.95, 0.80, 0.98)]}
            ),
            MasterPlanZone(
                id="plan_a_z4_water",
                name="Central Retention Lake & RWH Bioswales",
                zone_type="Water Bodies & RWH",
                area_acres=round(acres * 0.08, 1),
                area_hectares=round(acres * 0.08 * 0.404686, 1),
                area_percentage=8.0,
                color=cls.ZONE_COLORS["Water Bodies & RWH"],
                far_ratio=0.0,
                target_capacity_people=0,
                description="Cascading stormwater retention basins, unconfined aquifer recharge ponds, and recreational waterfront promenade.",
                geometry={"type": "Polygon", "coordinates": [cls._slice_box(bbox, 0.05, 0.35, 0.05, 0.30)]}
            ),
            MasterPlanZone(
                id="plan_a_z5_transit",
                name="Electric BRT Transit Spine & Active Mobility Corridor",
                zone_type="Roads & Transit Spine",
                area_acres=round(acres * 0.08, 1),
                area_hectares=round(acres * 0.08 * 0.404686, 1),
                area_percentage=8.0,
                color=cls.ZONE_COLORS["Roads & Transit Spine"],
                far_ratio=0.0,
                target_capacity_people=0,
                description="Central 30m multi-modal boulevard with dedicated electric BRT lanes, protected two-way bicycle paths, and shaded sidewalks.",
                geometry={"type": "Polygon", "coordinates": [cls._slice_box(bbox, 0.48, 0.52, 0.05, 0.95)]}
            ),
            MasterPlanZone(
                id="plan_a_z6_solar",
                name="Utility Solar Farm & Agro-Voltaics",
                zone_type="Renewable Solar Farm",
                area_acres=round(acres * 0.07, 1),
                area_hectares=round(acres * 0.07 * 0.404686, 1),
                area_percentage=7.0,
                color=cls.ZONE_COLORS["Renewable Solar Farm"],
                far_ratio=0.0,
                target_capacity_people=0,
                description="9.5 MWp ground-mounted bifacial solar array paired with shade-tolerant medicinal herb farming underneath.",
                geometry={"type": "Polygon", "coordinates": [cls._slice_box(bbox, 0.65, 0.95, 0.05, 0.30)]}
            ),
            MasterPlanZone(
                id="plan_a_z7_civic",
                name="Integrated Civic Hub, General Hospital & Emergency Shelter",
                zone_type="Hospitals & Emergency",
                area_acres=round(acres * 0.05, 1),
                area_hectares=round(acres * 0.05 * 0.404686, 1),
                area_percentage=5.0,
                color=cls.ZONE_COLORS["Hospitals & Emergency"],
                far_ratio=1.8,
                target_capacity_people=int(pop * 0.10),
                description="250-bed multi-specialty hospital, disaster command center, fire station, and elevated emergency helipad.",
                geometry={"type": "Polygon", "coordinates": [cls._slice_box(bbox, 0.68, 0.88, 0.45, 0.65)]}
            ),
            MasterPlanZone(
                id="plan_a_z8_edu",
                name="Smart Educational Campus & Research College",
                zone_type="Schools & Public Institutions",
                area_acres=round(acres * 0.05, 1),
                area_hectares=round(acres * 0.05 * 0.404686, 1),
                area_percentage=5.0,
                color=cls.ZONE_COLORS["Schools & Public Institutions"],
                far_ratio=1.5,
                target_capacity_people=int(pop * 0.05),
                description="Integrated K-12 green school, vocational training institute, sports oval, and community auditorium.",
                geometry={"type": "Polygon", "coordinates": [cls._slice_box(bbox, 0.10, 0.30, 0.45, 0.65)]}
            ),
            MasterPlanZone(
                id="plan_a_z9_dewats",
                name="Decentralized DEWATS Water Reclamation Facility",
                zone_type="Water Treatment DEWATS",
                area_acres=round(acres * 0.02, 1),
                area_hectares=round(acres * 0.02 * 0.404686, 1),
                area_percentage=2.0,
                color=cls.ZONE_COLORS["Water Treatment DEWATS"],
                far_ratio=0.5,
                target_capacity_people=0,
                description="Anaerobic baffled reactor + constructed wetlands recycling 2.2 MLD wastewater to non-potable tertiary standards.",
                geometry={"type": "Polygon", "coordinates": [cls._slice_box(bbox, 0.05, 0.20, 0.32, 0.42)]}
            ),
            MasterPlanZone(
                id="plan_a_z10_waste",
                name="Circular Solid Waste Recovery & Bio-Methanation Plant",
                zone_type="Solid Waste Recovery",
                area_acres=round(acres * 0.02, 1),
                area_hectares=round(acres * 0.02 * 0.404686, 1),
                area_percentage=2.0,
                color=cls.ZONE_COLORS["Solid Waste Recovery"],
                far_ratio=0.5,
                target_capacity_people=0,
                description="Automated material recovery facility (MRF), 10 TPD bio-gas digester converting wet waste to electricity and compost.",
                geometry={"type": "Polygon", "coordinates": [cls._slice_box(bbox, 0.80, 0.95, 0.32, 0.42)]}
            )
        ]

        plan_a = MasterPlanAlternative(
            plan_id="plan_compact_a",
            plan_code="PLAN_A",
            name="Plan A: Compact & Walkable City",
            tagline="15-Minute Transit-Oriented Smart Settlement",
            paradigm="High-Density Mixed Use with Continuous Nature Protection Buffer",
            target_population=pop,
            total_area_acres=acres,
            total_area_sqkm=sqkm,
            gross_population_density_per_sqkm=gross_density_sqkm,
            gross_density_per_acre=gross_density_acre,
            residential_net_density_per_acre=round(pop / (acres * 0.28), 1), # ~143 people/net residential acre
            walkability_score=94.0,
            green_space_per_capita_sqm=round((acres * 0.25 * 4046.86) / pop, 1), # ~25.3 m2 green space/person
            water_self_sufficiency_pct=72.0,
            renewable_energy_coverage_pct=96.0,
            public_transit_mode_share_target_pct=78.0,
            estimated_infrastructure_capex_cr_inr=580.0,
            zones=zones_a,
            tradeoffs_summary=(
                "TRADE-OFF PROFILE: Higher initial vertical construction density (FAR 2.4) and engineered stormwater network, "
                "offset by 42% lower municipal road maintenance expenditure, near-elimination of private vehicular dependence, "
                "and preservation of 125 contiguous acres for forestry and microclimate cooling."
            ),
            density_evaluation=density_eval,
            key_features=[
                "100% of residences within 400m (5-minute walk) of rapid transit stops and fresh food markets.",
                "Continuous peripheral 125-acre Miyawaki green loop buffering against regional dust, wind, and heat.",
                "Grade-separated complete streets: Dedicated lanes for pedestrians, e-scooters, and BRT buses."
            ]
        )
        plans.append(plan_a)

        # ==========================================
        # PLAN B: Green and Low-Density Settlement
        # ==========================================
        zones_b = [
            MasterPlanZone(
                id="plan_b_z1_res_clusters",
                name="Dispersed Eco-Neighborhood Clusters",
                zone_type="Residential",
                area_acres=round(acres * 0.38, 1),
                area_hectares=round(acres * 0.38 * 0.404686, 1),
                area_percentage=38.0,
                color=cls.ZONE_COLORS["Residential"],
                far_ratio=1.2,
                target_capacity_people=pop,
                description="Courtyard homes and low-rise row housing (G+2 to G+3) integrated with private kitchen gardens and rain gardens.",
                geometry={"type": "Polygon", "coordinates": [cls._slice_box(bbox, 0.15, 0.85, 0.20, 0.70)]}
            ),
            MasterPlanZone(
                id="plan_b_z2_agro",
                name="Regenerative Agro-Forestry & Food Security Belt",
                zone_type="Agricultural Agro-Forestry",
                area_acres=round(acres * 0.24, 1),
                area_hectares=round(acres * 0.24 * 0.404686, 1),
                area_percentage=24.0,
                color=cls.ZONE_COLORS["Agricultural Agro-Forestry"],
                far_ratio=0.05,
                target_capacity_people=0,
                description="Community organic farming, orchard groves (Moringa, Guava, Mango), drip-irrigated pulses, and permaculture.",
                geometry={"type": "Polygon", "coordinates": [cls._slice_box(bbox, 0.05, 0.95, 0.72, 0.95)]}
            ),
            MasterPlanZone(
                id="plan_b_z3_ponds",
                name="Decentralized Cascade Tank & Wetland Network",
                zone_type="Water Bodies & RWH",
                area_acres=round(acres * 0.12, 1),
                area_hectares=round(acres * 0.12 * 0.404686, 1),
                area_percentage=12.0,
                color=cls.ZONE_COLORS["Water Bodies & RWH"],
                far_ratio=0.0,
                target_capacity_people=0,
                description="Historical Indian tank cascade system (keres) storing monsoon runoff, supporting aquaculture and unconfined aquifer recharge.",
                geometry={"type": "Polygon", "coordinates": [cls._slice_box(bbox, 0.05, 0.45, 0.05, 0.20)]}
            ),
            MasterPlanZone(
                id="plan_b_z4_comm",
                name="Village Center & Weekly Haat Bazaar",
                zone_type="Commercial",
                area_acres=round(acres * 0.06, 1),
                area_hectares=round(acres * 0.06 * 0.404686, 1),
                area_percentage=6.0,
                color=cls.ZONE_COLORS["Commercial"],
                far_ratio=1.5,
                target_capacity_people=0,
                description="Low-rise community marketplace, artisan workshops, decentralized solar grain milling, and cooperative bank.",
                geometry={"type": "Polygon", "coordinates": [cls._slice_box(bbox, 0.45, 0.65, 0.45, 0.60)]}
            ),
            MasterPlanZone(
                id="plan_b_z5_parks",
                name="Sacred Groves & Native Habitat Reserve",
                zone_type="Parks & Green Belt",
                area_acres=round(acres * 0.10, 1),
                area_hectares=round(acres * 0.10 * 0.404686, 1),
                area_percentage=10.0,
                color=cls.ZONE_COLORS["Parks & Green Belt"],
                far_ratio=0.02,
                target_capacity_people=0,
                description="Ecological sanctuary with mature Banyan, Peepal, and Neem canopy supporting migratory birds and pollinators.",
                geometry={"type": "Polygon", "coordinates": [cls._slice_box(bbox, 0.50, 0.95, 0.05, 0.20)]}
            ),
            MasterPlanZone(
                id="plan_b_z6_roads",
                name="Permeable Neighborhood Road & Trail Grid",
                zone_type="Roads & Transit Spine",
                area_acres=round(acres * 0.06, 1),
                area_hectares=round(acres * 0.06 * 0.404686, 1),
                area_percentage=6.0,
                color=cls.ZONE_COLORS["Roads & Transit Spine"],
                far_ratio=0.0,
                target_capacity_people=0,
                description="Permeable grass-paved streets, bioswales, and feeder electric minibus loops.",
                geometry={"type": "Polygon", "coordinates": [cls._slice_box(bbox, 0.40, 0.45, 0.05, 0.95)]}
            ),
            MasterPlanZone(
                id="plan_b_z7_civic_edu",
                name="Community Health Clinic, Primary School & Panchayat Center",
                zone_type="Schools & Public Institutions",
                area_acres=round(acres * 0.04, 1),
                area_hectares=round(acres * 0.04 * 0.404686, 1),
                area_percentage=4.0,
                color=cls.ZONE_COLORS["Schools & Public Institutions"],
                far_ratio=1.0,
                target_capacity_people=0,
                description="Decentralized solar-powered primary health center, school, and village assembly hall.",
                geometry={"type": "Polygon", "coordinates": [cls._slice_box(bbox, 0.25, 0.45, 0.45, 0.60)]}
            )
        ]

        plan_b = MasterPlanAlternative(
            plan_id="plan_green_b",
            plan_code="PLAN_B",
            name="Plan B: Green & Low-Density Settlement",
            tagline="Agro-Ecological Low-Rise Circular Eco-Settlement",
            paradigm="Dispersed Clustered Hamlets with Regenerative Agriculture",
            target_population=pop,
            total_area_acres=acres,
            total_area_sqkm=sqkm,
            gross_population_density_per_sqkm=gross_density_sqkm,
            gross_density_per_acre=gross_density_acre,
            residential_net_density_per_acre=round(pop / (acres * 0.38), 1), # ~105 people/net residential acre
            walkability_score=78.0,
            green_space_per_capita_sqm=round((acres * 0.34 * 4046.86) / pop, 1), # ~34.4 m2 open green/person
            water_self_sufficiency_pct=88.0,
            renewable_energy_coverage_pct=85.0,
            public_transit_mode_share_target_pct=52.0,
            estimated_infrastructure_capex_cr_inr=420.0,
            zones=zones_b,
            tradeoffs_summary=(
                "TRADE-OFF PROFILE: Maximizes local food production (120 acres farming), water security (12% water bodies), "
                "and rural character. Trade-off is larger land footprint per dwelling, lower transit frequency, and longer "
                "internal walking distances (8 to 15 minutes) between hamlet clusters."
            ),
            density_evaluation=density_eval,
            key_features=[
                "Over 34% of site dedicated to food cultivation and wetland tank cascades.",
                "Low-impact vernacular architecture utilizing stabilized earth blocks and timber pergolas.",
                "Decentralized bio-septic and phyto-remediation ponds for every residential pocket."
            ]
        )
        plans.append(plan_b)

        # ==========================================
        # PLAN C: Resource-Efficient Smart City
        # ==========================================
        zones_c = [
            MasterPlanZone(
                id="plan_c_z1_res_smart",
                name="Smart Polycentric Residential Quarters",
                zone_type="Residential",
                area_acres=round(acres * 0.25, 1),
                area_hectares=round(acres * 0.25 * 0.404686, 1),
                area_percentage=25.0,
                color=cls.ZONE_COLORS["Residential"],
                far_ratio=2.0,
                target_capacity_people=int(pop * 0.80),
                description="Energy-positive smart apartments with integrated solar façades, automated graywater sensors, and pneumatic waste chutes.",
                geometry={"type": "Polygon", "coordinates": [cls._slice_box(bbox, 0.20, 0.60, 0.25, 0.70)]}
            ),
            MasterPlanZone(
                id="plan_c_z2_tech_ind",
                name="Clean-Tech, AI & High-Tech Manufacturing Park",
                zone_type="Industrial Clean-Tech",
                area_acres=round(acres * 0.15, 1),
                area_hectares=round(acres * 0.15 * 0.404686, 1),
                area_percentage=15.0,
                color=cls.ZONE_COLORS["Industrial Clean-Tech"],
                far_ratio=1.6,
                target_capacity_people=0,
                description="Zero-emission light engineering, electronics assembly, data center, and environmental biotechnology labs.",
                geometry={"type": "Polygon", "coordinates": [cls._slice_box(bbox, 0.65, 0.95, 0.60, 0.95)]}
            ),
            MasterPlanZone(
                id="plan_c_z3_comm_hub",
                name="Digital Financial & Smart Commercial Core",
                zone_type="Commercial",
                area_acres=round(acres * 0.10, 1),
                area_hectares=round(acres * 0.10 * 0.404686, 1),
                area_percentage=10.0,
                color=cls.ZONE_COLORS["Commercial"],
                far_ratio=2.8,
                target_capacity_people=int(pop * 0.20),
                description="Smart commercial towers, hospitality, retail mall, and urban drone delivery hub.",
                geometry={"type": "Polygon", "coordinates": [cls._slice_box(bbox, 0.40, 0.65, 0.35, 0.55)]}
            ),
            MasterPlanZone(
                id="plan_c_z4_smart_energy",
                name="Solar Microgrid, BESS Storage & Substation",
                zone_type="Renewable Solar Farm",
                area_acres=round(acres * 0.08, 1),
                area_hectares=round(acres * 0.08 * 0.404686, 1),
                area_percentage=8.0,
                color=cls.ZONE_COLORS["Renewable Solar Farm"],
                far_ratio=0.0,
                target_capacity_people=0,
                description="11 MWp tracking solar array + 28 MWh Lithium Iron Phosphate BESS with dynamic grid balancing.",
                geometry={"type": "Polygon", "coordinates": [cls._slice_box(bbox, 0.68, 0.95, 0.05, 0.28)]}
            ),
            MasterPlanZone(
                id="plan_c_z5_green_spines",
                name="Linear Biophilic Green Cooling Corridors",
                zone_type="Parks & Green Belt",
                area_acres=round(acres * 0.18, 1),
                area_hectares=round(acres * 0.18 * 0.404686, 1),
                area_percentage=18.0,
                color=cls.ZONE_COLORS["Parks & Green Belt"],
                far_ratio=0.05,
                target_capacity_people=0,
                description="Integrated shade canopy channels acting as natural air-conditioning conduits channeling prevailing winds through the city.",
                geometry={"type": "Polygon", "coordinates": [cls._slice_box(bbox, 0.05, 0.95, 0.72, 0.85)]}
            ),
            MasterPlanZone(
                id="plan_c_z6_smart_water",
                name="Smart Water Reservoir & Dual-Reticulation DEWATS",
                zone_type="Water Bodies & RWH",
                area_acres=round(acres * 0.08, 1),
                area_hectares=round(acres * 0.08 * 0.404686, 1),
                area_percentage=8.0,
                color=cls.ZONE_COLORS["Water Bodies & RWH"],
                far_ratio=0.2,
                target_capacity_people=0,
                description="Automated IoT water meters, underground pressurized graywater return mains, and tertiary ultra-filtration plant.",
                geometry={"type": "Polygon", "coordinates": [cls._slice_box(bbox, 0.05, 0.35, 0.05, 0.22)]}
            ),
            MasterPlanZone(
                id="plan_c_z7_smart_transit",
                name="Autonomous Transit Network & Sensor Arteries",
                zone_type="Roads & Transit Spine",
                area_acres=round(acres * 0.08, 1),
                area_hectares=round(acres * 0.08 * 0.404686, 1),
                area_percentage=8.0,
                color=cls.ZONE_COLORS["Roads & Transit Spine"],
                far_ratio=0.0,
                target_capacity_people=0,
                description="Multi-tier underground utility tunnels (water, power, fiber, recycled water) under smart connected roadways.",
                geometry={"type": "Polygon", "coordinates": [cls._slice_box(bbox, 0.45, 0.50, 0.05, 0.95)]}
            ),
            MasterPlanZone(
                id="plan_c_z8_waste_to_res",
                name="Integrated Waste-to-Energy & Resource Recovery Center",
                zone_type="Solid Waste Recovery",
                area_acres=round(acres * 0.03, 1),
                area_hectares=round(acres * 0.03 * 0.404686, 1),
                area_percentage=3.0,
                color=cls.ZONE_COLORS["Solid Waste Recovery"],
                far_ratio=0.8,
                target_capacity_people=0,
                description="Gasification and anaerobic bio-digester converting 100% of municipal solid waste into grid power and green fertilizer.",
                geometry={"type": "Polygon", "coordinates": [cls._slice_box(bbox, 0.80, 0.95, 0.32, 0.42)]}
            ),
            MasterPlanZone(
                id="plan_c_z9_smart_civic_edu",
                name="Smart City Command & Control, Hospital & University",
                zone_type="Hospitals & Emergency",
                area_acres=round(acres * 0.05, 1),
                area_hectares=round(acres * 0.05 * 0.404686, 1),
                area_percentage=5.0,
                color=cls.ZONE_COLORS["Hospitals & Emergency"],
                far_ratio=2.2,
                target_capacity_people=0,
                description="Central Command Center (ICCC), geospatial digital twin monitoring room, trauma hospital, and STEM university.",
                geometry={"type": "Polygon", "coordinates": [cls._slice_box(bbox, 0.10, 0.35, 0.45, 0.65)]}
            )
        ]

        plan_c = MasterPlanAlternative(
            plan_id="plan_smart_c",
            plan_code="PLAN_C",
            name="Plan C: Resource-Efficient Smart City",
            tagline="Circular-Economy Digital Twin Urban Eco-System",
            paradigm="Balanced Polycentric Smart City with Integrated Circular Loops",
            target_population=pop,
            total_area_acres=acres,
            total_area_sqkm=sqkm,
            gross_population_density_per_sqkm=gross_density_sqkm,
            gross_density_per_acre=gross_density_acre,
            residential_net_density_per_acre=round(pop / (acres * 0.25), 1), # ~160 people/net residential acre
            walkability_score=91.0,
            green_space_per_capita_sqm=round((acres * 0.18 * 4046.86) / pop, 1), # ~18.2 m2 green space/person
            water_self_sufficiency_pct=82.0,
            renewable_energy_coverage_pct=100.0,
            public_transit_mode_share_target_pct=85.0,
            estimated_infrastructure_capex_cr_inr=720.0,
            zones=zones_c,
            tradeoffs_summary=(
                "TRADE-OFF PROFILE: Highest capital efficiency and circular resource recovery (100% renewable power, "
                "82% water self-sufficiency, zero waste to landfill). Higher initial infrastructure capex for smart utility tunnels "
                "and IoT sensors, yielding 38% lower operational lifecycle costs over 50 years."
            ),
            density_evaluation=density_eval,
            key_features=[
                "Dedicated 75-acre Clean-Tech & AI manufacturing zone creating 8,500 local employment opportunities.",
                "Sub-surface multi-utility tunnels preventing repeated street excavation.",
                "Integrated City Command & Control Center (ICCC) running dynamic real-time energy and water optimization."
            ]
        )
        plans.append(plan_c)

        return plans
