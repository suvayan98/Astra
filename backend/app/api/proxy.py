"""Proxy endpoints for Bhuvan and VEDAS web services.

Protects upstream API credentials (e.g. VEDAS_API_KEY, Bhuvan login) from browser exposure,
provides caching headers, and falls back to clean synthetic tiles when offline or upstream is unreachable.
"""

import os
from fastapi import APIRouter, Response, Request, HTTPException
import httpx

router = APIRouter()

# 1x1 transparent PNG fallback for offline/missing tiles
TRANSPARENT_PNG = (
    b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01"
    b"\x08\x06\x00\x00\x00\x1f\x15c4\x00\x00\x00\nIDATx\x9cc\x00\x01\x00\x00\x05\x00\x01\r\n-\xb4\x00\x00\x00\x00IEND\xaeB`\x82"
)


@router.get("/proxy/bhuvan/{path:path}", tags=["Proxy"])
async def proxy_bhuvan(path: str, request: Request):
    """Proxy requests to Bhuvan WMS / Tile services with caching and security protection."""
    offline_mode = os.getenv("OFFLINE_MODE", "true").lower() in ("true", "1", "yes")

    if offline_mode:
        # Return transparent PNG with caching headers in offline mode
        return Response(
            content=TRANSPARENT_PNG,
            media_type="image/png",
            headers={
                "Cache-Control": "public, max-age=86400",
                "X-TerraCity-Proxy": "offline-fixture"
            }
        )

    # In live mode, proxy to upstream Bhuvan
    upstream_base = os.getenv("BHUVAN_WMS_URL", "https://bhuvan-vec2.nrsc.gov.in/bhuvan")
    upstream_url = f"{upstream_base}/{path}"
    query_params = dict(request.query_params)

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(upstream_url, params=query_params)
            return Response(
                content=resp.content,
                status_code=resp.status_code,
                media_type=resp.headers.get("content-type", "image/png"),
                headers={"Cache-Control": "public, max-age=86400"}
            )
    except Exception:
        # Graceful fallback to transparent PNG on upstream network error
        return Response(
            content=TRANSPARENT_PNG,
            media_type="image/png",
            headers={"X-TerraCity-Proxy": "fallback-transparent"}
        )


@router.get("/proxy/vedas/wms", tags=["Proxy"])
async def proxy_vedas_wms(request: Request):
    """Proxy requests to VEDAS WMS service, injecting VEDAS_API_KEY server-side."""
    offline_mode = os.getenv("OFFLINE_MODE", "true").lower() in ("true", "1", "yes")

    if offline_mode:
        return Response(
            content=TRANSPARENT_PNG,
            media_type="image/png",
            headers={
                "Cache-Control": "public, max-age=86400",
                "X-TerraCity-Proxy": "offline-fixture"
            }
        )

    vedas_url = os.getenv("VEDAS_WMS_URL", "https://vedas.sac.gov.in/vconsole/wms")
    api_key = os.getenv("VEDAS_API_KEY", "")

    query_params = dict(request.query_params)
    if api_key:
        query_params["api_key"] = api_key

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(vedas_url, params=query_params)
            return Response(
                content=resp.content,
                status_code=resp.status_code,
                media_type=resp.headers.get("content-type", "image/png"),
                headers={"Cache-Control": "public, max-age=86400"}
            )
    except Exception:
        return Response(
            content=TRANSPARENT_PNG,
            media_type="image/png",
            headers={"X-TerraCity-Proxy": "fallback-transparent"}
        )
