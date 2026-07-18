"""TinyDB + FastAPI backend for staff users and shifts.

Run:
    python3 -m venv .venv
    source .venv/bin/activate
    pip install -r requirements.txt
    uvicorn tinydb_app:app --reload
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from tinydb import TinyDB


class TinyDBManager:
    def __init__(self, db_path: str = "staff_db.json") -> None:
        self.db = TinyDB(db_path)
        self.users = self.db.table("users")
        self.shifts = self.db.table("shifts")

    def add_user(self, name: str, email: str, phone: str, role: str) -> int:
        return self.users.insert(
            {
                "name": name,
                "email": email,
                "phone": phone,
                "role": role,
            }
        )

    def add_shift(self, user_id: int, day: str, start_time: str, end_time: str) -> int:
        return self.shifts.insert(
            {
                "user_id": user_id,
                "day": day,
                "start_time": start_time,
                "end_time": end_time,
            }
        )

    def user_exists(self, user_id: int) -> bool:
        return self.users.get(doc_id=user_id) is not None

    def get_users(self) -> list[dict]:
        return [{"id": doc.doc_id, **dict(doc)} for doc in self.users.all()]

    def get_shifts(self) -> list[dict]:
        return [{"id": doc.doc_id, **dict(doc)} for doc in self.shifts.all()]


class UserCreate(BaseModel):
    name: str
    email: str
    phone: str
    role: str


class ShiftCreate(BaseModel):
    user_id: int
    day: str
    start_time: str
    end_time: str


app = FastAPI(title="Restaurant Staff Scheduling API")
db = TinyDBManager()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/users")
def add_user(payload: UserCreate) -> dict:
    user_id = db.add_user(payload.name, payload.email, payload.phone, payload.role)
    return {
        "id": user_id,
        "name": payload.name,
        "email": payload.email,
        "phone": payload.phone,
        "role": payload.role,
    }


@app.post("/shifts")
def add_shift(payload: ShiftCreate) -> dict:
    if not db.user_exists(payload.user_id):
        raise HTTPException(status_code=404, detail="User not found")

    shift_id = db.add_shift(
        user_id=payload.user_id,
        day=payload.day,
        start_time=payload.start_time,
        end_time=payload.end_time,
    )
    return {
        "id": shift_id,
        "user_id": payload.user_id,
        "day": payload.day,
        "start_time": payload.start_time,
        "end_time": payload.end_time,
    }


@app.get("/users")
def get_users() -> list[dict]:
    return db.get_users()


@app.get("/shifts")
def get_shifts() -> list[dict]:
    return db.get_shifts()
