# restaurant-staff-scheduling-system

## Frontend

Start the React frontend from the `spa` folder:

```bash
cd spa
npm install
npm start
```

The frontend will then be available at `http://127.0.0.1:3000`.

## Backend Docker

Build the backend image from the backend folder:

```bash
cd backend
docker build -t restaurant-staff-backend .
```

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
