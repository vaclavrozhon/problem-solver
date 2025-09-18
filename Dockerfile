FROM python:3.11-slim

# Install system dependencies including Node.js
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Set work directory
WORKDIR /app

# Install Python dependencies
COPY requirements.txt ./
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy frontend package files first (for better caching)
COPY frontend/package*.json frontend/
RUN cd frontend && npm install

# Copy all application code
COPY . .

# Build frontend with production API URL
RUN cd frontend && VITE_API_BASE=https://automatic-researcher-production.up.railway.app npm run build

# Runtime environment
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# Use our railway-start.py script
CMD ["python3", "railway-start.py"]

