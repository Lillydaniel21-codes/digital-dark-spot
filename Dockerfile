# Stage 1: Build Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package.json ./
RUN npm install --no-audit
COPY frontend/ ./
RUN npm run build

# Stage 2: Backend & Production Server
FROM python:3.11-slim
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies
COPY backend/requirements.txt ./backend/requirements.txt
RUN pip install --no-cache-dir -r ./backend/requirements.txt

# Copy backend code
COPY backend ./backend

# Copy built frontend assets
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Environment variables
ENV PORT=8000
ENV DATABASE_URL=sqlite:///./digital_dark_spot.db

EXPOSE 8000

# Run uvicorn
CMD ["uvicorn", "app.main:app", "--app-dir", "backend", "--host", "0.0.0.0", "--port", "8000"]
