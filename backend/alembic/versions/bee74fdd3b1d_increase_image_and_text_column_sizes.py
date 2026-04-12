"""increase_image_and_text_column_sizes

Revision ID: bee74fdd3b1d
Revises: 98763009b716
Create Date: 2026-04-12 00:59:23.951727

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'bee74fdd3b1d'
down_revision: Union[str, None] = '98763009b716'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Update products table
    op.alter_column('products', 'image',
               existing_type=sa.String(length=500),
               type_=sa.Text(),
               existing_nullable=False)
    op.alter_column('products', 'description',
               existing_type=sa.String(length=1000),
               type_=sa.Text(),
               existing_nullable=True)
    
    # Update stores table
    op.alter_column('stores', 'logo',
               existing_type=sa.String(length=500),
               type_=sa.Text(),
               existing_nullable=True)
    op.alter_column('stores', 'banner',
               existing_type=sa.String(length=500),
               type_=sa.Text(),
               existing_nullable=True)
    op.alter_column('stores', 'address',
               existing_type=sa.String(length=500),
               type_=sa.Text(),
               existing_nullable=True)


def downgrade() -> None:
    # Update products table
    op.alter_column('products', 'image',
               existing_type=sa.Text(),
               type_=sa.String(length=500),
               existing_nullable=False)
    op.alter_column('products', 'description',
               existing_type=sa.Text(),
               type_=sa.String(length=1000),
               existing_nullable=True)
    
    # Update stores table
    op.alter_column('stores', 'logo',
               existing_type=sa.Text(),
               type_=sa.String(length=500),
               existing_nullable=True)
    op.alter_column('stores', 'banner',
               existing_type=sa.Text(),
               type_=sa.String(length=500),
               existing_nullable=True)
    op.alter_column('stores', 'address',
               existing_type=sa.Text(),
               type_=sa.String(length=500),
               existing_nullable=True)
