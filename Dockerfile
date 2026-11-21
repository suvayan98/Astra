# Multi-Stage Production Dockerfile for TerraCity AI
# Stage 1: Build the React 19 / TypeScript / Vite frontend
FROM node:20-slim AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm install

COPY frontend ./
RUN npm run build

# Stage 2: Python 3.11 Backend Runtime with GIS & FastAPI
FROM python:3.11-slim
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Install system utilities
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies (rasterio, shapely, pyproj use precompiled binary wheels)
COPY backend/requirements.txt /app/backend/requirements.txt
RUN pip install --no-cache-dir -r /app/backend/requirements.txt

# Copy backend application, regional spatial data caches, and configs
COPY backend /app/backend
COPY data /app/data
COPY config /app/config
COPY .env.example /app/.env.example

# Copy compiled frontend from Stage 1 into the backend static mount directory
COPY --from=frontend-builder /app/frontend/dist /app/frontend/dist

# Default port (Render/Railway override this via $PORT)
ENV PORT=8000
EXPOSE 8000

# Start Uvicorn ASGI server
CMD ["sh", "-c", "uvicorn backend.app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
