import uuid
from datetime import datetime
from sqlalchemy import Integer, DateTime, ForeignKey, Numeric, Text, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base


class CrowdPrediction(Base):
    __tablename__ = "crowd_predictions"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid()
    )
    zone_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("zones.id", ondelete="CASCADE"), nullable=False, index=True
    )
    predicted_overcapacity_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    minutes_until_overcapacity: Mapped[int | None] = mapped_column(Integer)
    recommended_action: Mapped[str | None] = mapped_column(Text)
    confidence: Mapped[float | None] = mapped_column(Numeric(3, 2))
    severity: Mapped[str] = mapped_column(String(16), nullable=False, default="normal")  # normal|watch|alert
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), index=True
    )

    zone: Mapped["Zone"] = relationship("Zone", back_populates="predictions")


from app.models.zone import Zone  # noqa: E402
