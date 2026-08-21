# Dockerfile for PhD Position Hunter
FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    TZ=UTC

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    tzdata \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy script and application code
COPY phd_hunter.py .
COPY .env.example .

# Create volume mount point for persistent SQLite database & logs
VOLUME ["/app/data"]
ENV DB_PATH="/app/data/phd_positions.db"

# Run the hunter script
CMD ["python", "phd_hunter.py"]
