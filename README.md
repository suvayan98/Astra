# TerraCity AI

> **Space-Driven Greenfield Urban Site Screening & Resilience Stress-Testing**  
> *ASTRA 2026 Hackathon (ANTERiX, VIT Bhopal — Theme: Space)*

[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688.svg?style=flat&logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19-61DAFB.svg?style=flat&logo=react)](https://reactjs.org)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB.svg?style=flat&logo=python)](https://python.org)
[![ISRO Portals](https://img.shields.io/badge/ISRO_Portals-4_Active-FF9933.svg?style=flat)](https://www.isro.gov.in)
[![Offline Mode](https://img.shields.io/badge/Offline_Demo-100%25_Ready-green.svg?style=flat)](#offline-mode)

---

## Overview

TerraCity AI is an explainable decision-support web platform that empowers state urban planning agencies and infrastructure developers to screen candidate land parcels for new greenfield cities or industrial townships across India. Powered by datasets from **four Indian Earth Observation portals**, TerraCity AI evaluates land capability across 5 pillars, detects fatal spatial deal-breakers, ranks sites with sensitivity weight toggles, and stress-tests water balance and flood risk through the year 2050.

---

## Four-Portal Space Provenance

TerraCity AI integrates real data from four official Indian space portals:

```
+-----------------------------------------------------------------------------------------+
|                                    TERRACITY AI                                         |
+-------------------+--------------------+--------------------+---------------------------+
|    BHOONIDHI      |       BHUVAN       |      MOSDAC        |          VEDAS            |
|   (NRSC/ISRO)     |    (NRSC/ISRO)     |    (SAC/ISRO)      |        (SAC/ISRO)         |
+-------------------+--------------------+--------------------+---------------------------+
| CartoDEM 30m DEM  | LULC 1:50k &       | INSAT-3D/3DR Daily | Sentinel-2 Multi-Temporal |
| Stereo-Derived    | Historical Flood   | Precipitation      | NDVI (10m) Time-Series    |
| Surface Model     | Hazard Zonation    | Climatology        | & Vegetation Health       |
+-------------------+--------------------+--------------------+---------------------------+
| • Mean Slope      | • Land Cover Class | • Annual Mean Rain | • Mean NDVI               |
| • Buildable Share | • Wetland Overlap  | • Rainfall CV      | • Multi-Year Trend        |
| • Roughness (TRI) | • Flood Frequency  | • Dry Month Count  | • Ecological Sensitivity  |
| • HAND Proxy      | • Groundwater Pot. | • Drought Exposure |   (LULC Cross-Validated)  |
+-------------------+--------------------+--------------------+---------------------------+
```

---

## Key Features

1. **Hybrid Map Site Selection**:
   - 1-click **"Load Candidate Sites (A, B, C)"** button per demo region.
   - Freehand interactive polygon drawing and live shape editing via `@geoman-io/leaflet-geoman-free`.
2. **Sub-150ms Dynamic Zonal Analysis**:
   - Live in-memory raster masking (`rasterio.mask` + `shapely` + `numpy`) calculates real zonal metrics for arbitrary custom drawn polygons.
3. **5-Pillar Multi-Criteria Scorecard**:
   - *Terrain & Land* (20%), *Water Security* (25%), *Hazard Risk* (30%), *Environmental Impact* (10%), *Infrastructure Access* (15%).
   - Interactive Planner Priority Presets: **Balanced**, **Climate-Resilient**, and **Infra-First**.
   - Dynamic weight renormalization if any regional layer is absent.
4. **Spatial Deal-Breakers**:
   - Automatic disqualification for hard hazards: >50% high Bhuvan flood inundation, >15% wetland encroachment, >30% slope >30%, or Seismic Zone V + high landslide risk.
   - Offending raster cells are polygonized and rendered in **translucent red** inside site boundaries on the map canvas.
5. **Calibrated 2026–2050 Water Stress Simulation**:
   - Tracks Phase-1 population (150,000) scaling to 500,000 by 2050 against CPHEEO 135 lpcd standard.
   - Models local rainfall harvesting, catchment runoff (3.0x multiplier), and external canal supply.
   - Identifies the exact deficit crossing year under *Baseline*, *Moderate Warming*, and *High-Growth + Dry* climate trajectories.
6. **Printable HTML Reports & GeoJSON Export**:
   - Standalone `@media print` styled executive report ready for A4 PDF export.
   - GeoJSON FeatureCollection with all scores, verdicts, and provenance attached for QGIS/ArcGIS.

---

## Architecture & Tech Stack

- **Backend**: Python 3.11+, FastAPI, Pydantic v2, rasterio, shapely, pyproj, numpy, SQLite analysis store, pyyaml, httpx, pytest.
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Leaflet + Geoman, Recharts, Lucide Icons.
- **Data Caching**: Regional COG rasters and GeoJSON vectors stored in `data/cache/regions/` and `data/fixtures/` for 100% offline operation.

---

## Quickest 1-Click Launch (Unified Server & Web UI)

The frontend is pre-built into `frontend/dist` and directly served by the FastAPI application. You can launch the complete website and backend with a single command:

```powershell
python start_app.py
```
*(Or on Windows, simply double-click **`start_app.bat`**).*

This will start the unified server on **[http://localhost:8000](http://localhost:8000)** and automatically pop open your default web browser to the interactive website!

---

## Local Run Instructions (Development Mode)

### Prerequisites
- Python 3.11+
- Node.js 18+ (with `npm` or `npm.cmd` on Windows)

### 1. Quick Start via Windows PowerShell

Open a PowerShell terminal in the repository root:

```powershell
# Copy environment template
Copy-Item .env.example .env

# Install backend dependencies
python -m pip install -r backend/requirements.txt

# Run backend tests
python -m pytest backend/tests -v

# Start FastAPI backend server (Port 8000)
python -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```

In a second PowerShell terminal:

```powershell
# Navigate to frontend and install dependencies
cd frontend
npm.cmd install

# Start Vite development server (Port 5173)
npm.cmd run dev
```

Open your browser to:
- **Frontend App**: [http://localhost:5173](http://localhost:5173)
- **FastAPI OpenAPI Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **API Health Check**: [http://localhost:8000/api/health](http://localhost:8000/api/health)

### 2. Quick Start via Makefile (Linux / macOS / Git Bash)

```bash
# Setup both backend and frontend
make setup

# Run test suite
make test

# Start backend server
make run-backend

# In another terminal: start frontend
make run-frontend
```

---

## 3-Minute Live Demo Script

Follow this script for a flawless hackathon jury demonstration:

| Time | Segment | Actions to Perform | What to Highlight |
| :---: | :--- | :--- | :--- |
| **0:00 - 0:30** | **Load & Draw** | 1. Select **UP Jewar** from the region selector.<br/>2. Click **"Load Candidate Sites (A, B, C)"** in 1 click.<br/>3. Draw a custom polygon freehand on the map canvas using the draw tool. | Show that preset candidate sites load instantly and live custom-drawn polygons run real spatial zonal math dynamically in < 150 ms offline. |
| **0:30 - 1:05** | **Scorecard & Provenance** | 1. Click **Analyse All Sites**.<br/>2. Select **Site A** to view its 5-pillar scorecard and Recharts radar gauge.<br/>3. Click on the **Bhoonidhi** and **MOSDAC** indicator source badges. | Point out honest 4-portal provenance metadata: exact dataset name, resolution (30m / 4km), vintage (2021-2024), and confidence tier. |
| **1:05 - 1:50** | **Compare, Deal-Breakers & Sensitivity** | 1. Switch to the **Compare** tab.<br/>2. Observe **Site B** flagged with a **Red Deal-Breaker Banner** (Severe Flood Hazard).<br/>3. Notice the **translucent red floodplain mask** overlaid on the map.<br/>4. Toggle from **Balanced** to **Climate-Resilient** and **Infra-First** priority presets. | Demonstrate live MCA rank shifts. Point out deterministic "why" explanations generated from top-3 numeric pillar drivers, and the tie-check advisory. |
| **1:50 - 2:25** | **2026–2050 Stress Test** | 1. Open the **Stress Test** tab.<br/>2. View the 2026–2050 water demand vs supply area chart for Site A under Baseline (< 0.8 stress).<br/>3. Switch scenario to **High Growth + Dry**.<br/>4. Point out the water stress index visibly crossing 1.0 (water deficit year detected). | Explain the calibrated physical water balance: 500,000 × 135 lpcd = 67.5 MLD demand, local rainwater harvest yield, and uncertainty bands. |
| **2:25 - 3:00** | **Four-Portal Proof & Export** | 1. Open the **Sources** tab to display the 4-portal verification matrix.<br/>2. Optionally switch region to **Dholera** to showcase the transparent **CartoDEM HAND flood proxy fallback**.<br/>3. Click **Print Report** (clean print CSS preview).<br/>4. Click **Download GeoJSON**. | Reiterate that all four Indian space portals supply active indicators. Demonstrate GIS interoperability with instant GeoJSON download. |

---

## Honest Positioning & Non-Goals

- **Targeted Gap**: Early-stage greenfield site screening across terrain, water, and hazards using Indian satellite data.
- **Not in Scope**: Master planning, internal zoning, street network design, or 100-year survival predictions.
- **Existing Systems**: We complement—rather than replace—PM GatiShakti (national transport corridor logistics), AMRUT 2.0 (brownfield city master plans), and VEDAS Urban Sprawl (historical sprawl monitoring).

---

## License

Built for the **ASTRA 2026 Hackathon**. Open-source under the [MIT License](LICENSE).
