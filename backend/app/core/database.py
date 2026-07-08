"""SQLAlchemy async database engine and session factory — PostgreSQL/asyncpg only."""
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from app.core.config import get_settings

settings = get_settings()

engine = create_async_engine(
    settings.database_url,
    echo=False,
    future=True,
    pool_pre_ping=True,   # detect stale connections
    pool_size=10,
    max_overflow=20,
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


class Base(DeclarativeBase):
    pass


async def get_db():
    async with AsyncSessionLocal() as session:
        yield session


async def init_db():
    """
    Create the pgcrypto extension (needed for gen_random_uuid()) and all tables.
    Only used in development / testing. Production uses Alembic migrations.
    """
    from sqlalchemy import text
    # Import all models to register them with Base.metadata
    from app.models import (  # noqa: F401
        user, zone, crowd_reading, crowd_prediction, conversation, knowledge_chunk
    )
    async with engine.begin() as conn:
        await conn.execute(text('CREATE EXTENSION IF NOT EXISTS pgcrypto'))
        await conn.run_sync(Base.metadata.create_all)
