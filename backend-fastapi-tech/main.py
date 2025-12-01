import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.api.routers import all_routers
from backend.db.db import Base, engine
from backend.utils.config import get_settings

# Import models so metadata is populated
from backend.models import orders, products, users  # noqa: F401

settings = get_settings()

app = FastAPI(title="Online Store API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def on_startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


for router in all_routers:
    app.include_router(router)


if __name__ == "__main__":
    uvicorn.run(app="backend.main:app", host="0.0.0.0", port=8000, reload=True)
