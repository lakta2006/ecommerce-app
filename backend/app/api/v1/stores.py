from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from app.database import get_db
from app.models.store import Store
from app.schemas.store import StoreCreate, StoreUpdate, StoreResponse
import uuid

router = APIRouter(prefix="/stores", tags=["stores"])


def generate_slug(name: str) -> str:
    """Generate a URL-friendly slug from store name"""
    # Convert Arabic/special characters to a readable format
    slug = name.strip().lower()
    # Replace spaces with hyphens
    slug = slug.replace(' ', '-')
    # Remove special characters (keep Arabic letters, English letters, numbers, and hyphens)
    import re
    slug = re.sub(r'[^\w\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF-]', '', slug)
    # Add unique ID to avoid conflicts
    unique_id = str(uuid.uuid4())[:8]
    return f"{slug}-{unique_id}"


@router.get("", response_model=List[StoreResponse])
def get_stores(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get all stores"""
    stores = db.query(Store).offset(skip).limit(limit).all()
    return stores


@router.get("/active", response_model=List[StoreResponse])
def get_active_stores(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get all active stores"""
    stores = db.query(Store).filter(Store.is_active == 1).offset(skip).limit(limit).all()
    return stores


@router.get("/{store_id}", response_model=StoreResponse)
def get_store(store_id: int, db: Session = Depends(get_db)):
    """Get a single store by ID"""
    store = db.query(Store).filter(Store.id == store_id).first()
    if not store:
        raise HTTPException(status_code=404, detail="Store not found")
    return store


@router.get("/slug/{slug}", response_model=StoreResponse)
def get_store_by_slug(slug: str, db: Session = Depends(get_db)):
    """Get a single store by slug"""
    store = db.query(Store).filter(Store.slug == slug).first()
    if not store:
        raise HTTPException(status_code=404, detail="Store not found")
    return store


@router.post("", response_model=StoreResponse, status_code=status.HTTP_201_CREATED)
def create_store(store: StoreCreate, db: Session = Depends(get_db)):
    """Create a new store"""
    # Generate slug if not provided
    slug = store.slug if store.slug else generate_slug(store.name)
    
    # Check if slug already exists
    existing = db.query(Store).filter(Store.slug == slug).first()
    if existing:
        raise HTTPException(status_code=400, detail="Store slug already exists")
    
    db_store = Store(
        name=store.name,
        slug=slug,
        description=store.description,
        logo=store.logo,
        banner=store.banner,
        phone=store.phone,
        email=store.email,
        address=store.address,
    )
    db.add(db_store)
    db.commit()
    db.refresh(db_store)
    return db_store


@router.put("/{store_id}", response_model=StoreResponse)
def update_store(store_id: int, store: StoreUpdate, db: Session = Depends(get_db)):
    """Update a store"""
    db_store = db.query(Store).filter(Store.id == store_id).first()
    if not db_store:
        raise HTTPException(status_code=404, detail="Store not found")

    update_data = store.model_dump(exclude_unset=True)
    
    # Convert is_active boolean to int
    if 'is_active' in update_data:
        update_data['is_active'] = 1 if update_data['is_active'] else 0
    
    for key, value in update_data.items():
        setattr(db_store, key, value)

    db.commit()
    db.refresh(db_store)
    return db_store


@router.delete("/{store_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_store(store_id: int, db: Session = Depends(get_db)):
    """Delete a store"""
    db_store = db.query(Store).filter(Store.id == store_id).first()
    if not db_store:
        raise HTTPException(status_code=404, detail="Store not found")

    db.delete(db_store)
    db.commit()
    return None
