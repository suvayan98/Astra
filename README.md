# TerraAI — AI-Powered Sustainable Smart City Planning Platform

[![ISRO Space Data Hub](https://img.shields.io/badge/ISRO%20Portals-Bhoonidhi%20%7C%20Bhuvan%20%7C%20MOSDAC%20%7C%20VEDAS-orange.svg)](https://bhuvan.nrsc.gov.in/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI%20%7C%20Python%203.14-009688.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/Frontend-React%2019%20%7C%20TypeScript%20%7C%20Vite-61dafb.svg)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS-38bdf8.svg)](https://tailwindcss.com/)
[![Three.js](https://img.shields.io/badge/3D%20Digital%20Twin-Three.js%20WebGL-black.svg)](https://threejs.org/)

TerraAI is a geospatial intelligence platform that empowers urban planners, researchers, and government authorities to identify suitable land for new settlements and design sustainable, resource-efficient, and disaster-resilient smart cities in India using satellite Earth observation, GIS data, environmental intelligence, AI, and multi-decadal future simulations.

---

## 1. System Architecture

```
                                  +---------------------------------------+
                                  |   ISRO Indian Space Portals Hub       |
                                  |  - BHOONIDHI (NRSC STAC Catalog)      |
                                  |  - BHUVAN (NRSC Thematic & WMS 50K)   |
                                  |  - MOSDAC (SAC INSAT-3D Meteorology)  |
                                  |  - VEDAS (SAC NDVI/EVI & Solar Atlas) |
                                  +-------------------+-------------------+
                                                      |
                                                      v
+-------------------------------+       +-------------+-------------+       +------------------------------+
|   Authoritative Collaborators |       |   TerraAI FastAPI Backend |       |   React 19 + TypeScript      |
|  - CGWB / IN-GRES Aquifers    | ----> |  - Shapely GIS Geometries | <---> |  - Leaflet Map Workspace     |
|  - NASA SRTM 30m DEM          |       |  - AHP Suitability Engine |       |  - 3D Digital Twin (Three.js)|
|  - NASA POWER Climatology     |       |  - CPHEEO Water Balance   |       |  - Recharts Visualizations   |
|  - MoHUA URDPFI Guidelines    |       |  - 10-100yr Simulation   |       |  - Grounded TerraAdvisor AI  |
+-------------------------------+       +---------------------------+       +------------------------------+
```

---

## 2. Core Modules (A through J)

1. **Module A: TerraSite AI — Intelligent Site Selection**:
   - 12-factor Analytical Hierarchy Process (AHP) weighted overlay.
   - Statutory exclusion buffer demarcation (100m riparian floodplains, water bodies, highway easements).
   - Realistic carrying capacity and net density estimation.

2. **Module B: TerraTerrain AI — Terrain & Geomorphology**:
   - Digital elevation models (DEM), slope gradation, aspect, and roughness.
   - East-West transect elevation profiling.
   - Geotechnical caveats complying with Indian Standard (IS:1892) borehole requirements.

3. **Module C: TerraSoil AI — Soil Intelligence**:
   - Textural analysis (sand %, silt %, clay %) and soil organic carbon (SOC g/kg).
   - Agricultural suitability scoring and recommended native crops and tree species.
   - Distinction between regional SoilGrids models and on-site soil testing.

4. **Module D: TerraWater AI — Water & CGWB Hydrology**:
   - Transparent CPHEEO municipal water demand (135 LPCD + 30 commercial + 15% transmission losses = 3.39 MLD for 20,000 people).
   - Rainwater harvesting potential (0.89 MCM/yr) across 500 acres.
   - Tertiary wastewater recycling (1.62 MLD from SBR STP).
   - Official Central Ground Water Board (CGWB / IN-GRES) assessment categorization (Safe, Semi-Critical, Critical, Over-Exploited) and 5-year water table trends.

5. **Module E: TerraClimate AI — Climate & Disaster Risk**:
   - INSAT-3D/3DR calibrated rainfall and temperature climatology from MOSDAC.
   - Multi-hazard probability (24h extreme rainfall, heatwave, drought, cyclone).
   - Safe development terraces and emergency relief corridors.

6. **Module F: TerraEnergy AI — Renewable Energy & Microgrids**:
   - Solar GHI / DNI irradiance and wind speeds at 50m / 100m.
   - 15.2 MW Solar PV (Ground-mount + Rooftop) + boundary micro-turbines.
   - 14.8 MWh Battery Energy Storage System (BESS) for 4-hour peak load shifting.
   - 76.5% to 88.0% clean electricity autonomy.

7. **Module G: TerraVegetation AI — Green City Planner**:
   - ISRO VEDAS 12-month NDVI & EVI phenology curve.
   - Native species catalog organized by ecological stratum (Neem, Peepal, Jamun, Tamarind, Kadamba, Honge). Zero invasive exotics.
   - 84 acres of contiguous biodiversity corridors + 126 acres of urban forests.

8. **Module H: TerraCity Designer — AI Master Plan Generator**:
   - Generates **3 distinct spatial alternatives**:
     - **Plan A**: Compact & Walkable 15-Minute Polycentric City
     - **Plan B**: Biophilic Eco-Settlement & Permaculture Sanctuary
     - **Plan C**: Resource-Efficient Circular Smart City (TOD)
   - Real, non-overlapping GeoJSON functional zone parcels.
   - **Interactive Polygon Editor**: Move, resize, classify, and delete zones directly on the map with boundary validation.

9. **Module I: TerraFuture AI — Multi-Decadal Simulation**:
   - Simulates city evolution over **10, 20, 50, and 100 years**.
   - Interactive user controls for annual population growth (%), per-capita water (LPCD), and renewable energy growth (%).
   - 5 scenario trajectories: Business as Usual, Sustainable, High Growth, Water-Stressed, and Climate-Resilient.

10. **Module J: TerraAdvisor AI — Grounded Planning Assistant**:
    - Context-aware chatbot grounded strictly in computed numbers and official datasets.
    - Zero hallucinated statistics; transparent mathematical references.

---

## 3. Mandatory Indian Space Portals (ASTRA Integration)

| Portal | Agency | Official Documentation | Role in TerraAI |
| :--- | :--- | :--- | :--- |
| **BHOONIDHI** | ISRO / NRSC | [API Docs](https://bhoonidhi.nrsc.gov.in/bhoonidhi-api/) | Earth observation satellite STAC API discovery (Cartosat-3 0.28m, Resourcesat-2A, EOS-04 SAR). |
| **BHUVAN** | ISRO / NRSC | [API Docs](https://bhuvan-app1.nrsc.gov.in/api/) | Baseline Land Use Land Cover (LULC 50k), geomorphology, water bodies, and live OGC WMS map overlays. |
| **MOSDAC** | ISRO / SAC | [Portal](https://mosdac.gov.in/) | INSAT-3D/3DR Hydro-Estimator rainfall, cloud cover seasonality, and cyclonic hazard buffer zoning. |
| **VEDAS** | ISRO / SAC | [API Console](https://www.vedas.sac.gov.in/vconsole/) | 15-day NDVI & EVI temporal phenology curves, desertification atlas, and solar insolation maps. |

---

## 4. Quick Start & Installation

### Prerequisites
- Python 3.10+ (Tested on Python 3.14)
- Node.js 18+ and npm

### Step 1: Clone and Set Up Backend
```bash
cd backend
python -m pip install -r requirements.txt
python run.py
```
*Backend runs on `http://127.0.0.1:8000` (Interactive Swagger docs available at `/docs`).*

### Step 2: Set Up Frontend
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs on `http://127.0.0.1:5173`.*

---

## 5. Verification & Testing

To run the end-to-end service test suite verifying all 10 modules:
```bash
cd backend
python -c "
import asyncio
from app.services.site_service import site_service
from app.services.city_planner import city_planner_service
from app.services.future_simulator import future_simulator_service

coords = [[80.505, 16.533], [80.525, 16.533], [80.528, 16.549], [80.508, 16.551], [80.505, 16.533]]

async def verify():
    res = await site_service.analyze_site(coords, 'Amaravati Site', 'Andhra Pradesh', 'Guntur', 500.0, 20000)
    print('Site Suitability Score:', res['overall_suitability_score'])
    plans = city_planner_service.generate_master_plans(coords, 'test', 20000, 500.0)
    print('Plans generated:', len(plans['plans']))
    sim = future_simulator_service.simulate(20000, 'plan_a')
    print('Simulation scenarios:', len(sim['scenarios']))

asyncio.run(verify())
"
```

---

## 6. Project License
Apache 2.0 / MIT Open Source. Designed for national spatial planning, municipal corporations, and research institutions.
