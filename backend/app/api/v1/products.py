from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from app.database import get_db
from app.models.product import Product, ProductView, Order
from app.schemas.product import (
    ProductCreate, 
    ProductUpdate, 
    ProductResponse,
    PopularProductResponse,
    BestSellingProductResponse,
    OrderCreate,
    OrderResponse,
)
from app.core.dependencies import get_current_user
from app.models.user import User
from typing import Annotated

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
def get_products(
    skip: int = 0,
    limit: int = 100,
    store_id: Optional[int] = Query(None),
    category: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Get all products with optional store, category, and search filters"""
    query = db.query(Product)

    # Filter by store_id if provided
    if store_id:
        query = query.filter(Product.store_id == store_id)

    # Filter by category if provided
    if category:
        query = query.filter(Product.category == category)

    # Search by product name if provided
    if search:
        query = query.filter(Product.name.ilike(f"%{search}%"))

    products = query.offset(skip).limit(limit).all()
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
def update_product(product_id: int, product: ProductUpdate, db: Session = Depends(get_db)):
    """Update a product"""
    db_product = db.query(Product).filter(Product.id == product_id).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")

    update_data = product.model_dump(exclude_unset=True)
    
    for key, value in update_data.items():
        setattr(db_product, key, value)

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


@router.post("/{product_id}/view", status_code=status.HTTP_204_NO_CONTENT)
def track_product_view(
    product_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(get_db)
):
    """Track a product view"""
    # Check if product exists
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # Record the view
    view = ProductView(
        product_id=product_id,
        user_id=current_user.id
    )
    db.add(view)
    db.commit()
    return None


@router.get("/popular", response_model=List[PopularProductResponse])
def get_popular_products(
    skip: int = 0,
    limit: int = 10,
    db: Session = Depends(get_db)
):
    """Get most popular products based on view count"""
    popular_products = (
        db.query(
            Product,
            func.count(ProductView.id).label('view_count')
        )
        .outerjoin(ProductView, Product.id == ProductView.product_id)
        .group_by(Product.id)
        .order_by(func.count(ProductView.id).desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

    result = []
    for product, view_count in popular_products:
        result.append({
            'id': product.id,
            'name': product.name,
            'price': product.price,
            'image': product.image,
            'category': product.category,
            'description': product.description,
            'original_price': product.original_price,
            'store_id': product.store_id,
            'created_at': product.created_at,
            'updated_at': product.updated_at,
            'view_count': view_count,
        })
    
    return result


@router.get("/best-selling", response_model=List[BestSellingProductResponse])
def get_best_selling_products(
    skip: int = 0,
    limit: int = 10,
    db: Session = Depends(get_db)
):
    """Get best selling products based on completed orders"""
    best_selling = (
        db.query(
            Product,
            func.count(Order.id).label('order_count')
        )
        .outerjoin(Order, Product.id == Order.product_id)
        .filter(Order.status == 'completed')
        .group_by(Product.id)
        .order_by(func.count(Order.id).desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

    result = []
    for product, order_count in best_selling:
        result.append({
            'id': product.id,
            'name': product.name,
            'price': product.price,
            'image': product.image,
            'category': product.category,
            'description': product.description,
            'original_price': product.original_price,
            'store_id': product.store_id,
            'created_at': product.created_at,
            'updated_at': product.updated_at,
            'order_count': order_count,
        })
    
    return result


@router.post("/orders", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def create_order(
    order: OrderCreate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(get_db)
):
    """Create a new order (completed purchase)"""
    # Check if product exists
    product = db.query(Product).filter(Product.id == order.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # Create the order
    db_order = Order(
        user_id=current_user.id,
        product_id=order.product_id,
        quantity=order.quantity,
        total_price=order.total_price,
        status='completed'
    )
    db.add(db_order)
    db.commit()
    db.refresh(db_order)
    
    return db_order
