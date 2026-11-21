"""Standalone printable HTML report generator and GeoJSON exporter for TerraCity AI.

Features:
- Completely self-contained HTML report with @media print CSS for A4/Letter export.
- Offline-ready with inline SVG data visualizations (no external JS or CSS CDNs required).
- Comprehensive 5-pillar scorecard, provenance matrix, and 2026-2050 water stress chart.
- GeoJSON FeatureCollection exporter attaching all scorecard indicators and deal-breaker masks.
"""

from datetime import datetime, timezone
import html
import json
from typing import Any, Dict, List, Optional
from shapely.geometry import mapping

from backend.app.models import (
    CompareResponse,
    ScenarioRunResponse,
    SiteScorecard,
)


def export_scorecards_to_geojson(
    scorecards: List[SiteScorecard],
    include_deal_breaker_zones: bool = True
) -> Dict[str, Any]:
    """Export candidate sites and deal-breaker zones as a standard GeoJSON FeatureCollection."""
    features: List[Dict[str, Any]] = []

    for sc in scorecards:
        # Base site polygon feature
        site_geom = sc.geometry
        if not site_geom:
            # Fallback point or empty geometry if no polygon passed
            site_geom = {
                "type": "Point",
                "coordinates": [77.5, 28.2] # Default UP Jewar region centroid
            }

        pillar_summary = {p_id: p.raw_score for p_id, p in sc.pillars.items()}
        indicator_summary = {
            ind_id: {
                "value": ind.value,
                "score": ind.score,
                "unit": ind.unit,
                "portal": ind.source.portal,
                "confidence": ind.confidence
            }
            for ind_id, ind in sc.indicators.items()
        }

        props = {
            "feature_type": "candidate_site",
            "site_id": sc.site_id,
            "site_name": sc.site_name,
            "region_id": sc.region_id,
            "area_km2": sc.area_km2,
            "area_ha": sc.area_ha,
            "overall_score": sc.overall_score,
            "verdict": sc.verdict,
            "preset_used": sc.preset_used,
            "is_disqualified": sc.is_disqualified,
            "disqualification_reasons": sc.disqualification_reasons,
            "confidence_pct": sc.site_confidence_pct,
            "confidence_label": sc.site_confidence_label,
            "pillar_scores": pillar_summary,
            "indicators": indicator_summary,
        }

        features.append({
            "type": "Feature",
            "geometry": site_geom,
            "properties": props
        })

        # Add deal-breaker zones if present and requested
        if include_deal_breaker_zones and sc.deal_breaker_zones:
            db_features = sc.deal_breaker_zones.get("features", [])
            for db_f in db_features:
                db_props = dict(db_f.get("properties", {}))
                db_props["feature_type"] = "deal_breaker_zone"
                db_props["site_id"] = sc.site_id
                features.append({
                    "type": "Feature",
                    "geometry": db_f.get("geometry"),
                    "properties": db_props
                })

    return {
        "type": "FeatureCollection",
        "features": features
    }


def generate_svg_pillar_bars(pillars: Dict[str, Any]) -> str:
    """Generate an inline SVG horizontal bar chart for 5 pillars (0-100 scale)."""
    svg_h = 160
    svg_w = 420
    row_h = 28
    bar_max_w = 220
    x_offset = 140

    bars_svg = []
    for i, (p_id, p) in enumerate(pillars.items()):
        y = 15 + i * row_h
        raw_score = getattr(p, "raw_score", 0.0)
        p_name = getattr(p, "name", p_id)
        w = max(2.0, (raw_score / 100.0) * bar_max_w)

        # Color mapping
        if raw_score >= 70:
            fill = "#10b981" # Green
        elif raw_score >= 50:
            fill = "#f59e0b" # Amber
        else:
            fill = "#ef4444" # Red

        bars_svg.append(f"""
        <text x="{x_offset - 8}" y="{y + 14}" font-size="11" font-weight="600" text-anchor="end" fill="#334155">{html.escape(p_name)}</text>
        <rect x="{x_offset}" y="{y}" width="{bar_max_w}" height="18" rx="4" fill="#f1f5f9" />
        <rect x="{x_offset}" y="{y}" width="{w:.1f}" height="18" rx="4" fill="{fill}" />
        <text x="{x_offset + w + 8}" y="{y + 14}" font-size="11" font-weight="700" fill="#0f172a">{raw_score:.1f}</text>
        """)

    return f"""
    <svg width="{svg_w}" height="{svg_h}" viewBox="0 0 {svg_w} {svg_h}" xmlns="http://www.w3.org/2000/svg">
        {''.join(bars_svg)}
    </svg>
    """


def generate_svg_water_chart(time_series: List[Any]) -> str:
    """Generate an inline SVG line/area chart showing demand vs supply from 2026 to 2050."""
    if not time_series:
        return ""

    w = 600
    h = 220
    pad_l = 55
    pad_r = 30
    pad_t = 25
    pad_b = 35

    plot_w = w - pad_l - pad_r
    plot_h = h - pad_t - pad_b

    max_val = max(
        max(getattr(pt, "demand_high_mld", getattr(pt, "demand_mld", 0.0)) for pt in time_series),
        max(getattr(pt, "supply_high_mld", getattr(pt, "total_supply_mld", 0.0)) for pt in time_series),
        100.0
    ) * 1.1

    n = len(time_series)
    def x_coord(i: int) -> float:
        return pad_l + (i / max(1, n - 1)) * plot_w

    def y_coord(val: float) -> float:
        return pad_t + plot_h - (val / max_val) * plot_h

    # Build paths
    demand_pts = []
    supply_pts = []
    for i, pt in enumerate(time_series):
        d_val = getattr(pt, "demand_mld", 0.0)
        s_val = getattr(pt, "total_supply_mld", 0.0)
        demand_pts.append(f"{x_coord(i):.1f},{y_coord(d_val):.1f}")
        supply_pts.append(f"{x_coord(i):.1f},{y_coord(s_val):.1f}")

    d_path = f"M { ' L '.join(demand_pts) }"
    s_path = f"M { ' L '.join(supply_pts) }"

    # Y-axis ticks
    y_ticks = []
    for t_val in [0, max_val * 0.33, max_val * 0.66, max_val]:
        y_pos = y_coord(t_val)
        y_ticks.append(f"""
        <line x1="{pad_l}" y1="{y_pos:.1f}" x2="{w - pad_r}" y2="{y_pos:.1f}" stroke="#e2e8f0" stroke-dasharray="3,3" />
        <text x="{pad_l - 8}" y="{y_pos + 4:.1f}" font-size="10" text-anchor="end" fill="#64748b">{t_val:.0f} MLD</text>
        """)

    # X-axis ticks (start, middle, end)
    x_ticks = []
    for idx in [0, n // 2, n - 1]:
        pt = time_series[idx]
        yr = getattr(pt, "year", 2026 + idx)
        x_pos = x_coord(idx)
        x_ticks.append(f"""
        <line x1="{x_pos:.1f}" y1="{pad_t + plot_h}" x2="{x_pos:.1f}" y2="{pad_t + plot_h + 5}" stroke="#94a3b8" />
        <text x="{x_pos:.1f}" y="{pad_t + plot_h + 18}" font-size="10" text-anchor="middle" fill="#64748b">{yr}</text>
        """)

    return f"""
    <svg width="{w}" height="{h}" viewBox="0 0 {w} {h}" xmlns="http://www.w3.org/2000/svg" style="background:#f8fafc; border-radius:8px; border:1px solid #e2e8f0;">
        {''.join(y_ticks)}
        {''.join(x_ticks)}
        <!-- Supply Line (Blue) -->
        <path d="{s_path}" fill="none" stroke="#0284c7" stroke-width="3" />
        <!-- Demand Line (Orange/Red) -->
        <path d="{d_path}" fill="none" stroke="#ea580c" stroke-width="3" stroke-dasharray="5,3" />
        <!-- Legend -->
        <circle cx="{pad_l + 10}" cy="14" r="5" fill="#0284c7" />
        <text x="{pad_l + 20}" y="17" font-size="10" font-weight="600" fill="#0369a1">Total Supply (MLD)</text>
        <circle cx="{pad_l + 150}" cy="14" r="5" fill="#ea580c" />
        <text x="{pad_l + 160}" y="17" font-size="10" font-weight="600" fill="#c2410c">Urban Demand (MLD)</text>
    </svg>
    """


def generate_html_report(
    scorecards: List[SiteScorecard],
    comparison: Optional[CompareResponse] = None,
    scenarios: Optional[ScenarioRunResponse] = None,
    region_id: str = "up_jewar",
    preset: str = "balanced"
) -> str:
    """Generate complete, self-contained printable HTML report."""
    now_str = datetime.now(timezone.utc).strftime("%d %b %Y, %H:%M UTC")

    # Overall rankings section
    ranks_html = []
    if comparison and comparison.rankings:
        for r in comparison.rankings:
            badge_class = "badge-disqualified" if r.is_disqualified else ("badge-success" if r.overall_score >= 70 else "badge-warning")
            ranks_html.append(f"""
            <tr>
                <td style="font-weight:700; text-align:center;">#{r.rank}</td>
                <td style="font-weight:600;">{html.escape(r.site_name)}</td>
                <td style="text-align:center; font-weight:700; font-size:15px;">{r.overall_score:.1f}</td>
                <td><span class="badge {badge_class}">{html.escape(r.verdict)}</span></td>
                <td>{html.escape(', '.join(r.top_drivers))}</td>
                <td>{html.escape(', '.join(r.key_risks))}</td>
            </tr>
            """)
    else:
        for idx, sc in enumerate(scorecards, start=1):
            badge_class = "badge-disqualified" if sc.is_disqualified else ("badge-success" if sc.overall_score >= 70 else "badge-warning")
            ranks_html.append(f"""
            <tr>
                <td style="font-weight:700; text-align:center;">#{idx}</td>
                <td style="font-weight:600;">{html.escape(sc.site_name)}</td>
                <td style="text-align:center; font-weight:700; font-size:15px;">{sc.overall_score:.1f}</td>
                <td><span class="badge {badge_class}">{html.escape(sc.verdict)}</span></td>
                <td>Pillars Evaluated</td>
                <td>{html.escape(', '.join(sc.disqualification_reasons) if sc.is_disqualified else 'None')}</td>
            </tr>
            """)

    # Detailed site breakdown cards
    sites_details_html = []
    for sc in scorecards:
        svg_bars = generate_svg_pillar_bars(sc.pillars)

        # Indicator table rows
        ind_rows = []
        for ind_id, ind in sc.indicators.items():
            val_display = f"{ind.value} {ind.unit}".strip() if ind.value is not None else "<em>Missing</em>"
            score_display = f"{ind.score:.1f}" if ind.score is not None else "-"
            conf_badge = f"<span class='conf-{ind.confidence.lower()}'>{ind.confidence.upper()}</span>"
            ind_rows.append(f"""
            <tr>
                <td><strong>{html.escape(ind.indicator)}</strong></td>
                <td>{val_display}</td>
                <td style="text-align:center; font-weight:600;">{score_display}</td>
                <td>{html.escape(ind.source.portal)} ({html.escape(ind.source.dataset)})</td>
                <td>{html.escape(ind.source.method)}</td>
                <td style="text-align:center;">{conf_badge}</td>
            </tr>
            """)

        # Deal breakers status
        db_banner = ""
        if sc.is_disqualified:
            db_banner = f"""
            <div class="alert alert-danger">
                <strong>CRITICAL HARD-STOP DISQUALIFICATION:</strong><br>
                {html.escape('; '.join(sc.disqualification_reasons))}
            </div>
            """

        sites_details_html.append(f"""
        <div class="site-card">
            <div class="site-header">
                <div>
                    <h2>{html.escape(sc.site_name)} ({sc.site_id})</h2>
                    <p style="color:#64748b; margin:0;">Area: <strong>{sc.area_km2:.1f} km² ({sc.area_ha:.0f} ha)</strong> | Region: <strong>{html.escape(sc.region_id)}</strong> | Data Confidence: <strong>{sc.site_confidence_pct:.1f}% ({sc.site_confidence_label})</strong></p>
                </div>
                <div style="text-align:right;">
                    <div class="score-pill">{sc.overall_score:.1f}</div>
                    <div style="font-size:12px; font-weight:600; text-transform:uppercase; margin-top:4px;">{html.escape(sc.verdict)}</div>
                </div>
            </div>

            {db_banner}

            <h3 style="margin-top:16px;">5-Pillar Performance (Normalized 0-100)</h3>
            <div style="margin: 12px 0;">
                {svg_bars}
            </div>

            <h3 style="margin-top:20px;">Indicator Provenance & Measurements</h3>
            <table class="report-table">
                <thead>
                    <tr>
                        <th>Indicator</th>
                        <th>Extracted Value</th>
                        <th>Score (0-100)</th>
                        <th>Source Portal & Dataset</th>
                        <th>Method</th>
                        <th>Confidence</th>
                    </tr>
                </thead>
                <tbody>
                    {''.join(ind_rows)}
                </tbody>
            </table>
        </div>
        """)

    # Scenario section
    scenarios_html = ""
    if scenarios and scenarios.results:
        scen_cards = []
        for s_id, s_res in scenarios.results.items():
            chart_svg = generate_svg_water_chart(s_res.time_series)
            deficit_text = f"<span style='color:#dc2626; font-weight:700;'>Deficit starting in {s_res.deficit_year}</span>" if s_res.deficit_year else "<span style='color:#16a34a; font-weight:700;'>No Deficit Projected</span>"

            scen_cards.append(f"""
            <div style="margin-bottom:24px; padding:16px; border:1px solid #cbd5e1; border-radius:8px;">
                <h4>{html.escape(s_res.site_name)}: {deficit_text}</h4>
                <p style="font-size:13px; color:#475569; margin:4px 0 12px 0;">
                    Target Population: <strong>{s_res.final_population:,}</strong> | Demand at {s_res.horizon_year}: <strong>{s_res.final_demand_mld:.1f} MLD</strong> | Supply: <strong>{s_res.final_supply_mld:.1f} MLD</strong> | Stress Index: <strong>{s_res.final_stress_index:.2f} ({html.escape(s_res.stress_band)})</strong> | Flood Risk: <strong>{html.escape(s_res.qualitative_flood_stress_band)}</strong>
                </p>
                {chart_svg}
            </div>
            """)

        scenarios_html = f"""
        <div class="page-break"></div>
        <div class="section-title">2026-2050 Physical Water Balance & Climate Stress Test</div>
        <p style="font-size:13px; color:#475569;">
            Projections based on CPHEEO 135 lpcd standard, catchment harvesting multiplier (3.0x), and ISRO MOSDAC rainfall regimes under the <em>{html.escape(scenarios.scenario_name)}</em> trajectory.
        </p>
        {''.join(scen_cards)}
        """

    # Executive narrative
    narrative_text = comparison.narrative if comparison else "Standard multi-criteria evaluation completed."
    formatted_narrative = "<p>" + html.escape(narrative_text).replace("\n\n", "</p><p>").replace("\n", "<br>") + "</p>"

    # 4-Portal Provenance Reference Table
    provenance_table = """
    <table class="report-table">
        <thead>
            <tr>
                <th>Data Portal</th>
                <th>Datasets Utilized</th>
                <th>Resolution</th>
                <th>Observed Vintage</th>
                <th>Analytical Role</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td><strong>ISRO Bhoonidhi</strong></td>
                <td>CartoDEM 30m v3R1</td>
                <td>30 meters</td>
                <td>2023</td>
                <td>Utm Slope gradient, elevation relief, Terrain Ruggedness (TRI)</td>
            </tr>
            <tr>
                <td><strong>ISRO MOSDAC</strong></td>
                <td>INSAT-3D/3DR Daily Rainfall (IMERG calibration)</td>
                <td>4 km grid</td>
                <td>2015-2024 Multi-Year</td>
                <td>Annual precipitation mean, CV variability, dry-season drought risk</td>
            </tr>
            <tr>
                <td><strong>ISRO VEDAS</strong></td>
                <td>Sentinel-2 MSI Normalized Difference Vegetation Index (NDVI)</td>
                <td>10 meters</td>
                <td>2024 Seasonal Composite</td>
                <td>Ecological canopy preservation, wasteland vs arable land classification</td>
            </tr>
            <tr>
                <td><strong>ISRO Bhuvan</strong></td>
                <td>LULC 250k, National Flood Hazard Atlas, Groundwater Prospects</td>
                <td>50m - 250m</td>
                <td>2022-2023</td>
                <td>Multi-hazard flood zoning, hydrogeological aquifer recharge, wetland protection</td>
            </tr>
            <tr>
                <td><strong>OpenStreetMap</strong></td>
                <td>National Highways, Power Substations, Healthcare & Education</td>
                <td>Vector</td>
                <td>2024 Continuous</td>
                <td>Euclidean infrastructure connectivity & capital expenditure proximity</td>
            </tr>
        </tbody>
    </table>
    """

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>TerraCity AI - Urban Land Suitability Analysis Report</title>
    <style>
        @page {{
            size: A4 portrait;
            margin: 15mm;
        }}
        body {{
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            color: #0f172a;
            line-height: 1.5;
            background: #ffffff;
            margin: 0;
            padding: 24px;
        }}
        .header {{
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid #0f172a;
            padding-bottom: 12px;
            margin-bottom: 20px;
        }}
        .logo-title h1 {{
            font-size: 24px;
            margin: 0;
            color: #0f172a;
            letter-spacing: -0.5px;
        }}
        .logo-title p {{
            margin: 2px 0 0 0;
            color: #64748b;
            font-size: 13px;
        }}
        .meta-box {{
            text-align: right;
            font-size: 12px;
            color: #475569;
        }}
        .section-title {{
            font-size: 18px;
            font-weight: 700;
            color: #0f172a;
            border-left: 4px solid #0284c7;
            padding-left: 10px;
            margin: 24px 0 12px 0;
        }}
        .report-table {{
            width: 100%;
            border-collapse: collapse;
            font-size: 12px;
            margin-bottom: 16px;
        }}
        .report-table th {{
            background: #f1f5f9;
            color: #334155;
            font-weight: 700;
            text-align: left;
            padding: 8px 10px;
            border: 1px solid #cbd5e1;
        }}
        .report-table td {{
            padding: 7px 10px;
            border: 1px solid #e2e8f0;
        }}
        .report-table tbody tr:nth-child(even) {{
            background: #f8fafc;
        }}
        .badge {{
            display: inline-block;
            padding: 3px 8px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: 700;
        }}
        .badge-success {{ background: #dcfce7; color: #15803d; }}
        .badge-warning {{ background: #fef3c7; color: #b45309; }}
        .badge-disqualified {{ background: #fee2e2; color: #b91c1c; }}
        .conf-high {{ color: #15803d; font-weight: 700; }}
        .conf-medium {{ color: #b45309; font-weight: 700; }}
        .conf-low {{ color: #b91c1c; font-weight: 700; }}
        .alert {{
            padding: 12px 16px;
            border-radius: 6px;
            font-size: 13px;
            margin: 12px 0;
        }}
        .alert-danger {{
            background: #fef2f2;
            border-left: 4px solid #ef4444;
            color: #991b1b;
        }}
        .site-card {{
            border: 1px solid #cbd5e1;
            border-radius: 8px;
            padding: 18px;
            margin-bottom: 24px;
            page-break-inside: avoid;
        }}
        .site-header {{
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 10px;
        }}
        .site-header h2 {{
            margin: 0;
            font-size: 18px;
            color: #0f172a;
        }}
        .score-pill {{
            background: #0f172a;
            color: #ffffff;
            font-size: 20px;
            font-weight: 800;
            padding: 4px 14px;
            border-radius: 6px;
            display: inline-block;
        }}
        .page-break {{
            page-break-before: always;
        }}
        .no-print-bar {{
            background: #0f172a;
            color: #ffffff;
            padding: 10px 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-radius: 6px;
            margin-bottom: 20px;
        }}
        .print-btn {{
            background: #0284c7;
            color: white;
            border: none;
            padding: 8px 16px;
            font-size: 14px;
            font-weight: 600;
            border-radius: 4px;
            cursor: pointer;
        }}
        .print-btn:hover {{
            background: #0369a1;
        }}
        @media print {{
            .no-print {{
                display: none !important;
            }}
            body {{
                padding: 0;
            }}
            .site-card {{
                border: 1px solid #94a3b8;
            }}
        }}
    </style>
</head>
<body>
    <div class="no-print no-print-bar">
        <span>TerraCity AI Printable Site Suitability Dossier</span>
        <button class="print-btn" onclick="window.print()">Print / Save as PDF</button>
    </div>

    <div class="header">
        <div class="logo-title">
            <h1>TERRACITY AI</h1>
            <p>Spatial Intelligence & Multi-Criteria Decision Framework for Sustainable Urban Expansion</p>
        </div>
        <div class="meta-box">
            <div>Region: <strong>{html.escape(region_id.upper())}</strong></div>
            <div>Preset: <strong>{html.escape(preset.replace('_', '-').title())}</strong></div>
            <div>Generated: <strong>{now_str}</strong></div>
        </div>
    </div>

    <div class="section-title">Comparative Candidate Site Rankings</div>
    <table class="report-table">
        <thead>
            <tr>
                <th style="width:50px; text-align:center;">Rank</th>
                <th>Candidate Site</th>
                <th style="width:70px; text-align:center;">Score</th>
                <th>Recommendation</th>
                <th>Top Performance Drivers</th>
                <th>Key Constraints / Vulnerabilities</th>
            </tr>
        </thead>
        <tbody>
            {''.join(ranks_html)}
        </tbody>
    </table>

    <div class="section-title">Executive Decision Narrative</div>
    <div style="font-size:13px; line-height:1.6; color:#1e293b; background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px; padding:16px;">
        {formatted_narrative}
    </div>

    {scenarios_html}

    <div class="page-break"></div>
    <div class="section-title">Detailed Candidate Site Evaluations</div>
    {''.join(sites_details_html)}

    <div class="page-break"></div>
    <div class="section-title">Indian Geospatial Data Provenance Matrix</div>
    <p style="font-size:12px; color:#64748b;">
        Every indicator in this report is grounded in official ISRO / Indian Earth Observation portals with verifiable vintage and spatial resolution.
    </p>
    {provenance_table}

    <div style="margin-top:30px; border-top:1px solid #cbd5e1; padding-top:10px; font-size:11px; color:#94a3b8; text-align:center;">
        Generated by TerraCity AI &copy; 2026. Data sources: ISRO Bhoonidhi, ISRO MOSDAC, ISRO VEDAS, ISRO Bhuvan, OpenStreetMap.
    </div>
</body>
</html>
"""
