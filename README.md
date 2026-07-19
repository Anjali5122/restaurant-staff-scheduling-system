# restaurant-staff-scheduling-system

<img width="861" height="837" alt="Screenshot 2026-07-19 at 12 03 02 AM" src="https://github.com/user-attachments/assets/c26ace6f-490c-462d-a113-91eaa736cdee" />

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
docker compose up --build
```

This uses `docker-compose.yml`, persists TinyDB data in `backend-data`, and serves the API on `http://127.0.0.1:8000` by default.

If port `8000` is already in use, override it when starting Compose:

```bash
cd backend
BACKEND_PORT=8001 docker compose up --build
```
