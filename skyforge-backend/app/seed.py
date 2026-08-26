from __future__ import annotations

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.product import Brand, Category

SEED_BRANDS = [
    ("DJI", "dji"),
    ("Autel", "autel"),
    ("Skydio", "skydio"),
    ("Parrot", "parrot"),
    ("Holy Stone", "holy-stone"),
    ("FPV Freedom", "fpv-freedom"),
]

SEED_CATEGORIES = [
    ("Drones", "drones"),
    ("Batteries", "batteries"),
    ("Chargers", "chargers"),
    ("Propellers/Fins", "propellers-fins"),
    ("Controllers", "controllers"),
]


def run_seed(db: Session) -> None:
    if db.scalar(select(func.count()).select_from(Brand)) == 0:
        db.add_all([Brand(name=n, slug=s) for n, s in SEED_BRANDS])
    if db.scalar(select(func.count()).select_from(Category)) == 0:
        db.add_all([Category(name=n, slug=s) for n, s in SEED_CATEGORIES])
    db.commit()
