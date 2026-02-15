from dataclasses import dataclass
from datetime import datetime
from journal.types import FeelingType, DayPeriod
from typing import List
from utils.logger import select_powertools_logger

logger = select_powertools_logger("aws-helpers-dynamo")


@dataclass
class JournalTableObject:
    """
    Class to ensure journal objects conform to DynamoDB syntax.
    Implements serialization/deserialization for DynamoDB.
    
    PK = user e.g. sophia
    SK = date(DD-MM-YYYY)#morning  e.g. 12-02-2025#morning
    """
    user: str
    feeling: FeelingType
    energy: int
    thoughts: str
    tags: List[str]
    date: datetime
    time: DayPeriod

    def _get_pk(self) -> str:
        return self.user

    def _get_sk(self) -> str:
        return f"{self.date.strftime('%d-%m-%Y')}#{self.time.value}"  # DD-MM-YYYY format

    def _to_dynamo_representation(self) -> dict:
        """
        Converts this object to a dictionary suitable for DynamoDB.
        """
        return {
            "user": self._get_pk(),
            "date": self._get_sk(),
            "feeling": self.feeling.value,
            "energy": self.energy,
            "thoughts": self.thoughts,
            "tags": self.tags
        }

    # -------------------------
    # Deserialisation
    # -------------------------
    @classmethod
    def _from_dynamo_representation(cls, item: dict) -> "JournalTableObject":
        """
        Creates a JournalTableObject from a DynamoDB item.
        """
        try:
            date_part, period_part = item["date"].split("#")
            return cls(
                user=item["user"],
                feeling=FeelingType(item["feeling"]),
                energy=int(item["energy"]),
                thoughts=item["thoughts"],
                tags=item["tags"],
                date=datetime.strptime(date_part, "%d-%m-%Y"),
                time=DayPeriod(period_part)
            )
        except Exception as e:
            logger.error(f"Failed to deserialise DynamoDB item: {e}")
            raise