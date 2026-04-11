from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from app.database import get_db
from app.models.product import Product
from app.schemas.product import ProductCreate, ProductResponse

router = APIRouter(prefix="/products", tags=["products"])


class CategoryResponse:
    id: int
    name: str
    slug: str
    productCount: int


@router.get("/categories")
def get_categories(db: Session = Depends(get_db)):
    """Get all categories with product counts"""
    # Define the category mapping with Arabic names and slugs
    category_mapping = {
        'إلكترونيات': 'electronics',
        'ملابس': 'clothing',
        'منزل': 'home',
        'رياضة': 'sports',
        'أكسسوارات': 'accessories',
        'أخرى': 'other',
    }
    
    # Query products grouped by category
    category_counts = db.query(
        Product.category,
        func.count(Product.id).label('count')
    ).group_by(Product.category).all()
    
    # Build the response with real counts
    categories = []
    category_dict = {row.category: row.count for row in category_counts}
    
    for idx, (name, slug) in enumerate(category_mapping.items(), start=1):
        categories.append({
            'id': idx,
            'name': name,
            'slug': slug,
            'productCount': category_dict.get(name, 0)
        })
    
    return categories


@router.get("", response_model=List[ProductResponse])
def get_products(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get all products"""
    products = db.query(Product).offset(skip).limit(limit).all()
    return products


@router.get("/{product_id}", response_model=ProductResponse)
def get_product(product_id: int, db: Session = Depends(get_db)):
    """Get a single product by ID"""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.post("", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
def create_product(product: ProductCreate, db: Session = Depends(get_db)):
    """Create a new product"""
    db_product = Product(
        name=product.name,
        price=product.price,
        image=product.image,
        category=product.category,
        description=product.description,
        original_price=product.original_price,
        store_id=product.store_id,
    )
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product


@router.put("/{product_id}", response_model=ProductResponse)
def update_product(product_id: int, product: ProductCreate, db: Session = Depends(get_db)):
    """Update a product"""
    db_product = db.query(Product).filter(Product.id == product_id).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")

    db_product.name = product.name
    db_product.price = product.price
    db_product.image = product.image
    db_product.category = product.category
    db_product.description = product.description
    db_product.original_price = product.original_price
    db_product.store_id = product.store_id

    db.commit()
    db.refresh(db_product)
    return db_product


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(product_id: int, db: Session = Depends(get_db)):
    """Delete a product"""
    db_product = db.query(Product).filter(Product.id == product_id).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    db.delete(db_product)
    db.commit()
    return None
