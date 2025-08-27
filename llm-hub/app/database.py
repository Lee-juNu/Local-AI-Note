import os
from sqlalchemy import create_engine, text

DB_USER = os.getenv("DB_USER", "lan_user")
DB_PASSWORD = os.getenv("DB_PASSWORD", "lan_password")
DB_HOST = os.getenv("DB_HOST", "localhost") 
DB_PORT = os.getenv("DB_PORT", "5432")
DB_NAME = os.getenv("DB_NAME", "local_ai_note")

DATABASE_URL = f"postgresql+psycopg://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
engine = create_engine(DATABASE_URL, future=True)

def db_health_ok() -> bool:
    with engine.connect() as conn:
        return conn.execute(text("SELECT 1")).scalar() == 1
