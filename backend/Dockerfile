FROM python:3.10-slim

WORKDIR /app

# Install system dependencies needed for compiling postgres drivers or crypto libraries (just in case)
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

# Install dependencies including psycopg2-binary for postgres connection inside docker
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install --no-cache-dir psycopg2-binary==2.9.9

COPY . .

EXPOSE 5000

CMD ["gunicorn", "-b", "0.0.0.0:5000", "run:app"]
