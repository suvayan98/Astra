# TerraAI — AI-Powered Sustainable Smart City Planning Platform


[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React_18_TypeScript-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![Leaflet](https://img.shields.io/badge/GIS-Leaflet_1.9-199900?logo=leaflet&logoColor=white)](https://leafletjs.com)
[![ISRO](https://img.shields.io/badge/Satellite_Data-ISRO_Bhoonidhi_|_Bhuvan_|_MOSDAC_|_VEDAS-FF9933?logo=satellites&logoColor=white)](https://isro.gov.in)
[![CGWB](https://img.shields.io/badge/Groundwater-CGWB_IN--GRES-0284c7)](http://cgwb.gov.in)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind_CSS_3.4-38B2AC?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)

**TerraAI** is a geospatial intelligence and AI platform designed for urban planners, geospatial engineers, researchers, and government agencies. It enables users to select land boundaries (e.g., 500 acres / 2.02 km²), analyze terrain, soil, groundwater, climate hazards, and renewable energy, and synthesize AI-generated master plans with editable zoning polygons, 10-to-100-year future simulations, and conversational planning guidance.

---

## Key Modules & Architecture

```
                                  +------------------------------------+
                                  |     TerraAI Web Application        |
                                  | React 18 + TypeScript + Vite + GIS |
                                  +-----------------+------------------+
                                                    | (REST / GeoJSON)
                                  +-----------------v------------------+
                                  |       FastAPI Geospatial Backend   |
                                  +-----------------+------------------+
                                                    |
          +-----------------------+-----------------+----------------------+----------------------+
          |                       |                                        |                      |
+---------v----------+  +---------v----------+                  +----------v---------+  +---------v----------+
|  ISRO Space Hub    |  |  Hydrology & Water |                  |  Terrain & Soil    |  |  Master Plan AI    |
| • Bhoonidhi (STAC) |  | • CGWB IN-GRES     |                  | • NASA SRTM 30m    |  | • Plan A (Compact) |
| • Bhuvan (WMS LULC)|  | • CPHEEO (135 LPCD)|                  | • ICAR Soil Orders |  | • Plan B (AgroEco) |
| • MOSDAC (Weather) |  | • RWH Yield Model  |                  | • Geotech Advisory |  | • Plan C (Circular)|
| • VEDAS (NDVI)     |  | • DEWATS Recycling |                  | • Contours & Flow  |  | • 12 GeoJSON Zones |
+--------------------+  +--------------------+                  +--------------------+  +--------------------+
```

### 1. Core Modules Breakdown

- **Module A: TerraSite AI — Intelligent Site Selection**: 12-factor Analytical Hierarchy Process (AHP) scoring methodology with transparent factor weighting, exclusion zone identification (wetlands, floodplains, steep slopes), and benchmark candidate site comparisons across India.
- **Module B: TerraTerrain AI — Terrain & Geological Intelligence**: 30m NASA SRTM / Copernicus elevation profiles, slope distribution (<5% flat, 5-15% moderate, >15% steep), aspect, terrain roughness index, flow accumulation vectors, and prominent geotechnical engineering compliance warnings.
- **Module C: TerraSoil AI — Soil Intelligence**: ICAR Indian soil taxonomy (Vertisols, Alfisols, Inceptisols, Entisols), sand/silt/clay texture ratios, soil organic carbon (SOC %), shrink-swell expansiveness, agricultural capability, and compulsory on-site testing protocols (SPT N-values, soaked CBR, Atterberg limits).
- **Module D: TerraWater AI — Water Intelligence & CGWB**: CPHEEO urban standards (135 LPCD domestic + 27 LPCD civic = 162 LPCD for 20,000 people = 3.24 MLD). Official CGWB block groundwater assessments (recharge MCM, draft MCM, stage of extraction %, pre/post water table mbgl). Rainwater harvesting (RWH) potential ($A \times R \times C$) and DEWATS wastewater recycling balance.
- **Module E: TerraClimate AI — Climate & Disaster Intelligence**: MOSDAC Hydro-Estimator extreme 24-hr precipitation (50-year return storm), heatwave hazard index, flood susceptibility zoning, multi-purpose disaster relief shelters, and emergency evacuation corridors.
- **Module F: TerraEnergy AI — Renewable Energy Intelligence**: Global Solar Atlas GHI insolation, utility solar farm sizing (35 acres $\rightarrow$ 9.2 MWp), rooftop PV potential (11.5 MWp), annual clean generation vs 27.0 GWh settlement demand, and Lithium Iron Phosphate (LFP) BESS storage sizing (24-28 MWh) for evening peak shifting.
- **Module G: TerraVegetation AI — Green City Planner**: VEDAS 15-day composite NDVI & EVI temporal progression curves, agro-climatic native tree species catalog (*Azadirachta indica*, *Ficus religiosa*, *Syzygium cumini*, *Pongamia pinnata*, *Terminalia arjuna*), and Miyawaki ultra-dense afforestation standards.
- **Module H: TerraCity Designer — AI Master Plan Generator**: Synthesizes 3 distinct paradigms:
  - **Plan A: Compact & Walkable City (TOD)**: 15-minute city, FAR 2.4, continuous peripheral 125-acre green loop, 78% transit mode share.
  - **Plan B: Green & Low-Density Settlement**: Agro-ecological hamlets, 120-acre organic farming zone, cascade tank (kere) wetlands, FAR 1.2.
  - **Plan C: Resource-Efficient Smart City**: Circular economy, 75-acre clean-tech park, smart microgrid, dual-reticulation graywater recycling.
  - **Realism & Density Verification**: Evaluates 20,000 people across 500 acres ($2.02\text{ km}^2$) yielding gross density of 9,886 people/km² (~40 people/acre) with comprehensive density and infrastructure trade-off analysis.
  - **Interactive Zone Editor**: Inspect, resize, re-classify, and edit any zone polygon in real-time.
- **Module I: TerraFuture AI — Long-Term Multi-Decade Simulation**: Simulates urban evolution over 10, 20, 50, and 100 years under 5 scenarios (Sustainable Development, Business as Usual, High Growth Boomtown, Severe Water Stress, Net-Zero Resilient) with interactive sliders for population growth, water LPCD, rainfall variance, and renewable MW.
- **Module J: TerraAdvisor AI — Conversational Planning Assistant**: Grounded AI assistant answering natural language questions citing CPHEEO, CGWB, MOSDAC, VEDAS, and exact formulas.
- **Module 4: ISRO Space Data Hub (ASTRA Feature)**: Dedicated dashboard displaying metadata, acquisition dates, ground sampling distance, and live query runners for:
  1. **BHOONIDHI (ISRO / NRSC)**: STAC API v1.0.0 search for Cartosat-3, Resourcesat-2A LISS-IV, Sentinel-2, RISAT-1A SAR.
  2. **BHUVAN (ISRO / NRSC)**: OGC WMS thematic layers (LULC 50K, Geomorphology, Lithology, Lineaments, Waterbodies).
  3. **MOSDAC (ISRO / SAC)**: Meteorological products (Hydro-Estimator rainfall, TIR brightness temperature, wind vectors).
  4. **VEDAS (ISRO / SAC)**: Multi-temporal NDVI/EVI 15-day composites and land degradation atlases.

---

## Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Leaflet 1.9, Recharts, Lucide Icons |
| **Backend** | Python 3.14 / 3.11+, FastAPI, Pydantic v2, Uvicorn, Requests, HTTPX |
| **Geospatial & Math** | Shapely, PyProj, Rasterio, NumPy, SciPy, Pandas |
| **Space Data Adapters** | ISRO Bhoonidhi STAC, ISRO Bhuvan WMS, ISRO MOSDAC, ISRO VEDAS |
| **Hydrology & Climate** | CGWB IN-GRES Groundwater Assessment, NASA POWER, NASA SRTM 30m DEM |

---

## Quickstart & Installation

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/terra-ai.git
cd terra-ai
```

### 2. Backend Setup (FastAPI)
Make sure Python is installed on your system.
```bash
# Create and activate virtual environment (optional)
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install fastapi uvicorn pydantic pydantic-settings shapely pyproj rasterio numpy scipy pandas httpx python-dotenv

# Run the FastAPI server
uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```
The backend API documentation is available interactively at `http://127.0.0.1:8000/docs`.

### 3. Frontend Setup (React + Vite)
In a separate terminal:
```bash
cd frontend

# Install npm dependencies
npm install

# Start development server
npm run dev
```
Open `http://localhost:3000` in your web browser.

---

## Environment Variables Configuration

Copy `.env.example` to `.env` in the root directory:
```bash
cp .env.example .env
```
Key variables:
- `BHOONIDHI_API_KEY`: ISRO Bhoonidhi STAC Bearer Token
- `BHUVAN_TOKEN`: ISRO Bhuvan Thematic Gateway Token
- `MOSDAC_USER` / `MOSDAC_KEY`: ISRO MOSDAC credentials
- `VEDAS_API_KEY`: ISRO VEDAS Temporal API Key
- `DEMO_MODE=True`: Automatically utilizes verified authentic sample space data cache when live credentials are unconfigured.

---

## Demonstration Workflow: 500-Acre Smart Settlement

1. **Launch Workspace**: Open `http://localhost:3000`. The map workspace initializes with the **Dholera Greenfield Industrial Smart Zone** preset (500 acres / 2.02 km² for 20,000 people).
2. **Review Suitability**: Switch to the **Site Suitability** tab to inspect the 12-factor radar profile (Score: 84.5 / 100), exclusion buffers along low swales, and transparent AHP methodology.
3. **Inspect Terrain & Soil**: Review the elevation range (6.5m to 14.2m), gentle gradient (1.2°), shrink-swell clay expansiveness in Vertisols, and the compulsory geotechnical borehole engineering disclaimer.
4. **Water Security Audit**: Observe the 3.24 MLD daily municipal demand, CGWB semi-critical extraction stage (82.6%), 2.2 MLD rainwater harvesting capture, and 2.1 MLD DEWATS graywater recovery.
5. **AI Master Plan Designer**:
   - Compare **Plan A (Compact TOD)**, **Plan B (Green Eco-Settlement)**, and **Plan C (Resource-Efficient Smart City)**.
   - Verify gross population density ($9,886\text{ people/km}^2$) and per-capita public green space ($25.3\text{ m}^2$).
   - Click any zone in the table to modify its area or FAR in the interactive modal.
6. **Future Multi-Decadal Simulation**: Move sliders on the **Future Simulation** tab to project water deficits, aquifer stress %, and solid waste over 10, 20, 50, and 100 years.
7. **ISRO Space Data Hub**: Open the ISRO Hub to view live status for Bhoonidhi, Bhuvan, MOSDAC, and VEDAS, and execute a STAC query on the active AOI bounding box.
8. **Consult TerraAdvisor AI**: Open the AI drawer and ask questions like *"How much water will 20,000 people require?"* or *"Compare Plan A and Plan B"* to receive grounded engineering responses.
9. **Export Master Plan Report**: Click **Report** to print the executive dossier or download the complete Master Plan as GeoJSON and Markdown.

---

## License
MIT License. Developed for sustainable geospatial urban intelligence.
