"""change avatar column to text type

Revision ID: 004_change_avatar_to_text
Revises: add_password_reset_otps
Create Date: 2026-04-10
"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '004_change_avatar_to_text'
down_revision = 'add_password_reset_otps'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Change avatar column from VARCHAR(500) to TEXT to support base64 encoded images
    op.alter_column('users', 'avatar',
                    existing_type=sa.String(500),
                    type_=sa.Text(),
                    existing_nullable=True)


def downgrade() -> None:
    # Revert avatar column back to VARCHAR(500)
    op.alter_column('users', 'avatar',
                    existing_type=sa.Text(),
                    type_=sa.String(500),
                    existing_nullable=True)
