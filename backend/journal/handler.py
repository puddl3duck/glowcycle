from datetime import datetime
from dataclasses import dataclass
import json
from typing import List
from utils.dynamo_client import get_dynamodb_client
from utils.dynamo_helper import JournalTableObject
from utils.lambda_utils import handle_error_response
from journal.types import FeelingType, DayPeriod
from boto3.dynamodb.conditions import Key
from utils.logger import select_powertools_logger
import os

logger = select_powertools_logger("journal-lambda")

DYNAMODB_TABLE_NAME = os.environ.get("DYNAMODB_TABLE_NAME", "GlowCycleTable")
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

# save journal entry logic (post)
def save_entry(event):
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
    try:
        body = json.loads(event.get("body", "{}"))
        
        # Validate required fields
        required_fields = ["user", "feeling", "energy", "thoughts", "tags", "date", "night"]
        missing_fields = [field for field in required_fields if field not in body]
        if missing_fields:
            logger.error(f"Missing required fields: {missing_fields}")
            raise ValueError(f"Missing required fields: {', '.join(missing_fields)}")
        
        # Validate feeling type
        if body["feeling"] not in [f.value for f in FeelingType]:
            raise ValueError(f"Invalid feeling type: {body['feeling']}")
        
        # Parse date and add current time for unique entries
        date_str = body["date"]  # DD-MM-YYYY
        current_time = datetime.now()
        # Combine date from body with current time
        date_parts = date_str.split('-')
        date_obj = datetime(
            year=int(date_parts[2]),
            month=int(date_parts[1]),
            day=int(date_parts[0]),
            hour=current_time.hour,
            minute=current_time.minute,
            second=current_time.second
        )
        
        period = DayPeriod.from_bool(body["night"])
        feeling_enum = FeelingType(body["feeling"])

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
        logger.info(f"Saving entry for user: {item['user']}, date: {item['date']}")
        journal_table.put_item(Item=item)

        return {
            "status": "success",
            "user": item["user"],
            "date": item["date"],
            "message": "Entry saved successfully"
        }
    except ValueError as e:
        logger.error(f"Validation error: {str(e)}")
        raise
    except Exception as e:
        logger.error(f"Error saving entry: {str(e)}")
        raise


# get historic journal entries (GET)
def get_entries(event):
    try:
        params = event.get("queryStringParameters") or {}
        user = params.get("user")

        if not user:
            logger.error("Missing user parameter in GET request")
            raise ValueError("Missing user parameter")

        logger.info(f"Fetching entries for user: {user}")
        response = journal_table.query(
            KeyConditionExpression=Key("user").eq(user),
            ScanIndexForward=False  # newest first
        )

        items = response.get("Items", [])
        logger.info(f"Found {len(items)} entries for user: {user}")

        entries = [
            JournalTableObject._from_dynamo_representation(item).to_dict()
            for item in items
        ]

        return {
            "entries": entries,
            "count": len(entries)
        }
    except ValueError as e:
        logger.error(f"Validation error: {str(e)}")
        raise
    except Exception as e:
        logger.error(f"Error fetching entries: {str(e)}")
        raise



@handle_error_response
def lambda_handler(event, context):
    """
    Main Lambda handler for journal operations.
    Supports GET (retrieve entries) and POST (save entry) methods.
    """
    try:
        method = event.get("httpMethod", "")
        logger.info(f"Received {method} request")

        if method == "OPTIONS":
            logger.info("Handling OPTIONS request for CORS")
            return {"status": "ok", "message": "CORS preflight"}

        if method == "POST":
            return save_entry(event)

        if method == "GET":
            return get_entries(event)

        logger.warning(f"Unsupported HTTP method: {method}")
        raise ValueError(f"Unsupported HTTP method: {method}")
    
    except Exception as e:
        logger.error(f"Lambda handler error: {str(e)}")
        raise
