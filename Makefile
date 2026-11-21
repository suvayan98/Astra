# TerraCity AI - Automation & Build Makefile

.PHONY: setup test run run-backend run-frontend clean build check-coverage

# Setup python environment and node packages
setup:
	python -m pip install -r backend/requirements.txt
	cd frontend && npm install

# Run backend unit and integration test suite
test:
	pytest backend/tests -v

# Run the backend FastAPI server on port 8000
run: run-backend

run-backend:
	python -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload

# Run frontend development server
run-frontend:
	cd frontend && npm run dev

# Build production bundle for frontend
build:
	cd frontend && npm run build

# Check data coverage across the 4 Indian portals
check-coverage:
	python scripts/check_coverage.py

# Clean Python bytecode and caches
clean:
	python -c "import shutil, pathlib; [shutil.rmtree(p) for p in pathlib.Path('.').rglob('__pycache__')]"
	python -c "import shutil, pathlib; [shutil.rmtree(p) for p in pathlib.Path('.').rglob('.pytest_cache')]"
