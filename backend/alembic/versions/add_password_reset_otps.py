"""add password reset otp table

Revision ID: add_password_reset_otps
Revises: add_products_table
Create Date: 2026-04-09

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'add_password_reset_otps'
down_revision = 'add_products_table'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create password_reset_otps table
    op.create_table(
        'password_reset_otps',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('otp_code', sa.String(length=6), nullable=False),
        sa.Column('expires_at', sa.DateTime(), nullable=False),
        sa.Column('used', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('attempts', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create indexes
    op.create_index(op.f('ix_password_reset_otps_id'), 'password_reset_otps', ['id'], unique=False)
    op.create_index(op.f('ix_password_reset_otps_user_id'), 'password_reset_otps', ['user_id'], unique=False)
    op.create_index(op.f('ix_password_reset_otps_email'), 'password_reset_otps', ['email'], unique=False)


def downgrade() -> None:
    # Drop indexes
    op.drop_index(op.f('ix_password_reset_otps_email'), table_name='password_reset_otps')
    op.drop_index(op.f('ix_password_reset_otps_user_id'), table_name='password_reset_otps')
    op.drop_index(op.f('ix_password_reset_otps_id'), table_name='password_reset_otps')
    
    # Drop table
    op.drop_table('password_reset_otps')
