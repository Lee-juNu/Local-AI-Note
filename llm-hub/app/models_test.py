from typing import Optional
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy import String, DateTime, func

class Base(DeclarativeBase):
    pass

class User(Base):
    __tablename__ = "users"
    
    id: Mapped[str] = mapped_column("id", String, primary_key=True)
    email: Mapped[str] = mapped_column("email", String, unique=True, nullable=False)
    name: Mapped[Optional[str]] = mapped_column("name", String, nullable=True)
    created_at: Mapped["DateTime"] = mapped_column(
        "createdAt",
        DateTime(timezone=True),
        server_default=func.now()
    )
