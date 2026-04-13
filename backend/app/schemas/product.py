from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ProductBase(BaseModel):
    name: str
    price: float
    image: str
    category: str
    description: Optional[str] = None
    original_price: Optional[float] = None
    store_id: Optional[int] = None


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    price: Optional[float] = None
    image: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    original_price: Optional[float] = None
    store_id: Optional[int] = None


class ProductResponse(ProductBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class OrderCreate(BaseModel):
    product_id: int
    quantity: int = 1
    total_price: float


class OrderResponse(BaseModel):
    id: int
    user_id: int
    product_id: int
    quantity: int
    total_price: float
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class PopularProductResponse(ProductResponse):
    view_count: int

    class Config:
        from_attributes = True


class BestSellingProductResponse(ProductResponse):
    order_count: int

    class Config:
        from_attributes = True
