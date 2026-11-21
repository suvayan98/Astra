"""Unit tests for narrative generation and guarded LLM verification (Milestone M5).

Verifies Section 10:
- Deterministic template text generation with top-3 pillar drivers.
- Tie-check sensitivity note (< 5.0 pts).
- Disqualification explanations.
- Guarded LLM numeric hallucination detector:
  - Permits numbers grounded in input scorecards / scenarios.
  - Detects ungrounded / hallucinated numbers and triggers fallback to deterministic template.
  - Handles LLM exceptions with automatic template fallback.
"""

import pytest

from backend.app.models import IndicatorValue, SourceInfo
from backend.app.narrative import (
    generate_comparison_narrative,
    generate_guarded_narrative,
    verify_numeric_hallucinations,
    extract_numbers_from_text,
    build_ground_truth_numbers,
)
from backend.app.scoring import score_site, compare_sites


def make_ind(name: str, val: any) -> IndicatorValue:
    return IndicatorValue(
        indicator=name,
        value=val,
        source=SourceInfo(portal="TestPortal", dataset="TestDataset"),
        confidence="high"
    )


def test_deterministic_narrative_generation():
    inds1 = {
        "slope_buildable_share": make_ind("slope_buildable_share", 0.90),
        "rainfall_mean_annual": make_ind("rainfall_mean_annual", 950.0),
        "road_access": make_ind("road_access", 1.5),
    }
    inds2 = {
        "slope_buildable_share": make_ind("slope_buildable_share", 0.60),
        "rainfall_mean_annual": make_ind("rainfall_mean_annual", 400.0),
        "road_access": make_ind("road_access", 12.0),
    }

    sc1 = score_site("site_a", "Site A", inds1)
    sc2 = score_site("site_b", "Site B", inds2)

    cmp_res = compare_sites([sc1, sc2], preset="balanced")
    narrative = cmp_res.narrative

    assert "Executive Site Selection Summary" in narrative
    assert "Rank #1: Site A" in narrative
    assert "Site B" in narrative
    assert "Strategic Recommendation" in narrative


def test_narrative_tie_check_note():
    inds1 = {
        "slope_buildable_share": make_ind("slope_buildable_share", 0.85),
        "rainfall_mean_annual": make_ind("rainfall_mean_annual", 900.0),
        "road_access": make_ind("road_access", 2.0),
    }
    inds2 = {
        "slope_buildable_share": make_ind("slope_buildable_share", 0.84),
        "rainfall_mean_annual": make_ind("rainfall_mean_annual", 895.0),
        "road_access": make_ind("road_access", 2.1),
    }

    sc1 = score_site("site_1", "Site 1", inds1)
    sc2 = score_site("site_2", "Site 2", inds2)

    cmp_res = compare_sites([sc1, sc2], preset="balanced")
    assert cmp_res.tie_detected is True
    assert "Tie-Check Alert" in cmp_res.tie_note or "< 5.0 pt threshold" in cmp_res.tie_note
    assert "Advisory Notice" in cmp_res.narrative


def test_numeric_extraction():
    sample_text = "Site A scored 82.5 points with 150000 residents and 67.5 MLD demand in 2050."
    nums = extract_numbers_from_text(sample_text)
    # 2050 is ignored as a calendar year
    assert 82.5 in nums
    assert 150000.0 in nums
    assert 67.5 in nums
    assert 2050 not in nums


def test_guarded_llm_accepts_grounded_numbers():
    inds = {"slope_buildable_share": make_ind("slope_buildable_share", 0.85)}
    sc = score_site("site_a", "Site A", inds)
    cmp_res = compare_sites([sc])

    # LLM output that only cites true numbers (overall score, rank)
    score_val = sc.overall_score
    def mock_clean_llm(prompt: str) -> str:
        return f"Site A attained rank 1 with an overall score of {score_val:.1f} points."

    narrative, used_llm, hallucinated = generate_guarded_narrative(
        rankings=cmp_res.rankings,
        scorecards=[sc],
        preset="balanced",
        llm_callable=mock_clean_llm
    )

    assert used_llm is True
    assert len(hallucinated) == 0
    assert f"overall score of {score_val:.1f}" in narrative


def test_guarded_llm_rejects_hallucinated_numbers_and_falls_back():
    inds = {"slope_buildable_share": make_ind("slope_buildable_share", 0.85)}
    sc = score_site("site_a", "Site A", inds)
    cmp_res = compare_sites([sc])

    # LLM invents fake numbers not found anywhere in scorecard
    def mock_hallucinating_llm(prompt: str) -> str:
        return "Site A scored 99.4 points with 842.7 hectares of protected forest."

    narrative, used_llm, hallucinated = generate_guarded_narrative(
        rankings=cmp_res.rankings,
        scorecards=[sc],
        preset="balanced",
        llm_callable=mock_hallucinating_llm
    )

    # Must reject LLM output and fall back to deterministic template text!
    assert used_llm is False
    assert len(hallucinated) > 0
    assert 99.4 in hallucinated or 842.7 in hallucinated
    assert "Executive Site Selection Summary" in narrative


def test_guarded_llm_handles_exception_with_fallback():
    inds = {"slope_buildable_share": make_ind("slope_buildable_share", 0.85)}
    sc = score_site("site_a", "Site A", inds)
    cmp_res = compare_sites([sc])

    def mock_failing_llm(prompt: str) -> str:
        raise ConnectionError("LLM API endpoint timeout")

    narrative, used_llm, hallucinated = generate_guarded_narrative(
        rankings=cmp_res.rankings,
        scorecards=[sc],
        preset="balanced",
        llm_callable=mock_failing_llm
    )

    assert used_llm is False
    assert "Executive Site Selection Summary" in narrative
