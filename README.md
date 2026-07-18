# restaurant-staff-scheduling-system

## Backend Docker

Build the backend image from the backend folder:

```bash
cd backend
docker build -t restaurant-staff-backend .
```

Run the API container on port `8000` and persist TinyDB data to a local folder:

```bash
cd backend
mkdir -p backend-data
docker run --rm -p 8000:8000 \
	-e TINYDB_PATH=/data/staff_db.json \
	-v "$PWD/backend-data:/data" \
	restaurant-staff-backend
```

The backend will then be available at `http://127.0.0.1:8000`.

## Backend Docker Compose

Start the backend with Docker Compose:

```bash
cd backend
docker compose up --build
```

This uses `docker-compose.yml`, persists TinyDB data in `backend-data`, and serves the API on `http://127.0.0.1:8000` by default.

If port `8000` is already in use, override it when starting Compose:

```bash
cd backend
BACKEND_PORT=8001 docker compose up --build
```
