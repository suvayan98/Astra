"""TerraCity AI — 1-Click Launch Script.

Starts the unified TerraCity AI web server on http://localhost:8000
(serving both the React 19 web interface and FastAPI backend APIs)
and automatically opens your browser.
"""

import sys
import time
import webbrowser
import threading
import uvicorn

def open_browser():
    """Wait for server to bind then open browser."""
    time.sleep(1.5)
    url = "http://localhost:8000"
    print(f"\n>>> Opening TerraCity AI web interface at {url} ...\n")
    webbrowser.open(url)

if __name__ == "__main__":
    print("=" * 70)
    print("  TerraCity AI — Autonomous Space-Driven Greenfield Urban Screening")
    print("  ASTRA 2026 Hackathon (ANTERiX, VIT Bhopal — Theme: Space)")
    print("=" * 70)
    print("\nStarting unified server at http://localhost:8000 ...")
    print("Serving interactive UI and REST APIs.\n")

    threading.Thread(target=open_browser, daemon=True).start()

    uvicorn.run(
        "backend.app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=False,
        log_level="info"
    )
