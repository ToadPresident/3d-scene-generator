FROM python:3.11-slim

WORKDIR /app

# Install system dependencies for SHARP
RUN apt-get update && apt-get install -y \
    git \
    build-essential \
    cmake \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create necessary directories
RUN mkdir -p static temp

# Expose port
EXPOSE 7860

# Run the application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]
