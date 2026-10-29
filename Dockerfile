# ==========================================
# STAGE 1: Build Next.js Static Export
# ==========================================
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
# Changed from 'RUN npm ci' to 'RUN npm install'
RUN npm install

COPY frontend/ ./
RUN npm run build

# ==========================================
# STAGE 2: Production Python Backend + UI
# ==========================================
FROM python:3.11-slim AS production

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt ./
RUN pip install --upgrade pip && pip install -r requirements.txt

# Copy backend code
COPY backend/app ./app

# Copy compiled Next.js static assets from Stage 1 into /app/static
COPY --from=frontend-builder /app/frontend/out ./static

# Render injects $PORT (defaults to 10000 on Render, 8000 locally)
ENV PORT=10000
EXPOSE ${PORT}

CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-10000}"]
