import os
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from sqlalchemy.orm import declarative_base

# Default to SQLite for local MVP if Postgres isn't provided, but expect postgres connection string.
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./trendpilot.db")

engine = create_async_engine(DATABASE_URL, echo=True)
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)

Base = declarative_base()

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
