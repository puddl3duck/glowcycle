from datetime import datetime
from dataclasses import dataclass
import json
from typing import List
from utils.dynamo_client import get_dynamodb_client
from utils.dynamo_helper import JournalTableObject
from utils.lambda_utils import handle_error_response
from journal.types import FeelingType, DayPeriod
#from utils.logger import select_powertools_logger

# Todo: Generates journal prompts using Bedrock
# Todo: Returns prompts or stored entries

#ToDo: fix loggers logger = select_powertools_logger("journal-lambda")

DYNAMODB_TABLE_NAME = "GlowCycleTable"
dynamodb = get_dynamodb_client()
journal_table = dynamodb.Table(DYNAMODB_TABLE_NAME)

@dataclass
class JournalEntry:
    feeling: FeelingType 
    energy: int
    thoughts: str
    tags: List[str]
    date: datetime
    night: bool
    user: str

def journal_entry_to_dict(user: str, entry: JournalEntry) -> dict:
    return {
        "user": user,
        "feeling": entry.feeling.value,
        "energy": entry.energy,
        "thoughts": entry.thoughts,
        "tags": entry.tags,
        "date": entry.date,
        "night": entry.night
    }

# Saves journal entries to DynamoDB via post http request
@handle_error_response
def lambda_handler(event, context):
    """
    Handles POST requests from API Gateway.
    Expects JSON body:
    {
        "feeling": "happy",
        "user": "Sophia",
        "energy": 7,
        "thoughts": "Today was good",
        "tags": ["work","fitness","friends"],
        "date": "15-02-2025",
        "night": True
    }
    """
    body = json.loads(event.get("body", "{}"))

    date_obj = datetime.strptime((body["date"]),"%d-%m-%Y") 
    period = DayPeriod.from_bool(body["night"])
    feeling_enum = FeelingType(body["feeling"])

    # Create JournalTableObject
    entry_obj = JournalTableObject(
        user=body["user"],
        feeling=feeling_enum,
        energy=int(body["energy"]),
        thoughts=body["thoughts"],
        tags=body["tags"],
        date=date_obj,
        time=period
    )

    # Convert to DynamoDB item
    item = entry_obj._to_dynamo_representation()

    journal_table.put_item(Item=item)
    #logger.info(f"Saved journal entry {item['user']} {item['date']} to DynamoDB")

    return {"status": "success", "user": item["user"], "date": item["date"]}