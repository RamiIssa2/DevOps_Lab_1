FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install dependencies first (for better caching)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt \
    -f https://download.pytorch.org/whl/torch_stable.html

# Copy only app source code
COPY app.py .
COPY init_db.py .

# Create non-root user and switch to it
RUN useradd -m appuser
USER appuser

# Expose backend port
EXPOSE 5000

# Run application
CMD ["python", "app.py"]
