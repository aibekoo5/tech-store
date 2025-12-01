# Backend (FastAPI)

This backend provides an onion-architecture FastAPI API for the online store frontend. Layers are separated into domain schema models, repositories, services, and presentation (routes) with a unit-of-work coordinating database access.

## Project structure

- `api/` – FastAPI routers and dependency wiring
- `db/` – async SQLAlchemy engine and session factory
- `models/` – SQLAlchemy ORM models with `to_read_model` helpers
- `repositories/` – persistence adapters built on a shared repository base
- `schemas/` – Pydantic request/response models
- `services/` – application use-cases orchestrating repositories
- `utils/` – configuration, security, repository base, and unit of work
- `main.py` – FastAPI entrypoint and router registration
- `requirements.txt` – backend dependencies

## Running locally

1. Copy `.env.example` to `.env` and update credentials/secrets.
2. Ensure PostgreSQL is running and the configured database exists.
3. Install dependencies: `pip install -r backend/requirements.txt`.
4. Start the API: `uvicorn backend.main:app --reload --env-file backend/.env --app-dir backend`.

OpenAPI docs are available at `http://localhost:8000/docs`.

## Database

SQLAlchemy models live under `models/`. Tables are created automatically on startup via `Base.metadata.create_all`; for production, replace this with migrations (e.g., Alembic).
