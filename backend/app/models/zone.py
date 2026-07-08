import uuid
from sqlalchemy import String, Integer, Float, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base


class Zone(Base):
    __tablename__ = "zones"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid()
    )
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    zone_type: Mapped[str] = mapped_column(String(32), nullable=False)  # gate|concourse|section|facility
    capacity: Mapped[int] = mapped_column(Integer, nullable=False)
    latitude: Mapped[float | None] = mapped_column(Float)
    longitude: Mapped[float | None] = mapped_column(Float)

    readings: Mapped[list["CrowdReading"]] = relationship(
        "CrowdReading", back_populates="zone", lazy="noload"
    )
    predictions: Mapped[list["CrowdPrediction"]] = relationship(
        "CrowdPrediction", back_populates="zone", lazy="noload"
    )


from app.models.crowd_reading import CrowdReading  # noqa: E402
from app.models.crowd_prediction import CrowdPrediction  # noqa: E402
