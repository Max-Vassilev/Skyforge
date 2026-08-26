from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import Base, SessionLocal, engine
from app.routers import auth, cart, catalog, orders
from app.seed import run_seed


def create_app() -> FastAPI:
    application = FastAPI(title="Skyforge API", version="1.0.0")

    application.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    application.include_router(auth.router)
    application.include_router(catalog.router)
    application.include_router(cart.router)
    application.include_router(orders.router)

    @application.get("/api/health", tags=["health"])
    def health():
        return {"status": "ok"}

    @application.on_event("startup")
    def on_startup() -> None:
        Base.metadata.create_all(bind=engine)
        with SessionLocal() as db:
            run_seed(db)

    return application


app = create_app()
