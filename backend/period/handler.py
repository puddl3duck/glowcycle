from datetime import datetime
from dataclasses import dataclass
import json
from typing import List, Optional
import boto3
from boto3.dynamodb.conditions import Key
from decimal import Decimal
import os

DYNAMODB_TABLE_NAME = os.environ.get("DYNAMODB_TABLE_NAME", "GlowCycleTable")
dynamodb = boto3.resource('dynamodb')
period_table = dynamodb.Table(DYNAMODB_TABLE_NAME)


# Custom JSON encoder for Decimal objects
class DecimalEncoder(json.JSONEncoder):
    """JSON encoder that converts Decimal to int or float"""
    def default(self, obj):
        if isinstance(obj, Decimal):
            return int(obj) if obj % 1 == 0 else float(obj)
        return super(DecimalEncoder, self).default(obj)


# Helper function to convert Decimal to int/float for JSON serialization
def decimal_to_number(obj):
    """Convert Decimal objects to int or float for JSON serialization"""
    if isinstance(obj, Decimal):
        return int(obj) if obj % 1 == 0 else float(obj)
    return obj


def convert_decimals(data):
    """Recursively convert all Decimal objects in a data structure"""
    if isinstance(data, list):
        return [convert_decimals(item) for item in data]
    elif isinstance(data, dict):
        return {key: convert_decimals(value) for key, value in data.items()}
    elif isinstance(data, Decimal):
        return decimal_to_number(data)
    return data

@dataclass
class PeriodEntry:
    user: str
    period_date: str  # DD-MM-YYYY
    cycle_length: Optional[int] = None
    notes: Optional[str] = None

def period_entry_to_dict(entry: PeriodEntry) -> dict:
    return {
        "user": entry.user,
        "period_date": entry.period_date,
        "cycle_length": entry.cycle_length,
        "notes": entry.notes
    }

# Save period entry logic (POST)
def save_period(event):
    """
    Handles POST requests from API Gateway.
    Expects JSON body:
    {
        "user": "Sofia",
        "period_date": "15-02-2026",
        "user_age": 28,
        "cycle_length": 28
    }
    """
    try:
        body = json.loads(event.get("body", "{}"))
        
        # Validate required fields
        required_fields = ["user", "period_date"]
        missing_fields = [field for field in required_fields if field not in body]
        if missing_fields:
            print(f"Missing required fields: {missing_fields}")
            raise ValueError(f"Missing required fields: {', '.join(missing_fields)}")
        
        user = body["user"]
        period_date = body["period_date"]  # DD-MM-YYYY
        user_age = body.get("user_age")  # Optional
        cycle_length = body.get("cycle_length")  # Optional but useful
        
        # Validate date format
        try:
            date_parts = period_date.split('-')
            if len(date_parts) != 3:
                raise ValueError("Invalid date format")
            datetime(int(date_parts[2]), int(date_parts[1]), int(date_parts[0]))
        except:
            raise ValueError("Invalid date format. Expected DD-MM-YYYY")
        
        # Create DynamoDB item
        # PK = user, SK = PERIOD#DD-MM-YYYY
        item = {
            "user": user,
            "date": f"PERIOD#{period_date}",
            "period_date": period_date,
            "created_at": datetime.now().isoformat()
        }
        
        # Add optional fields only if provided
        if user_age:
            item["user_age"] = user_age
        if cycle_length:
            item["cycle_length"] = cycle_length
        
        print(f"Saving period for user: {user}, date: {period_date}")
        period_table.put_item(Item=item)

        return {
            "status": "success",
            "user": user,
            "period_date": period_date,
            "message": "Period saved successfully"
        }
    except ValueError as e:
        print(f"Validation error: {str(e)}")
        raise
    except Exception as e:
        print(f"Error saving period: {str(e)}")
        raise


# Get period history (GET)
def get_periods(event):
    """
    Handles GET requests to retrieve period history for a user.
    Query parameter: user
    """
    try:
        params = event.get("queryStringParameters") or {}
        user = params.get("user")

        if not user:
            print("Missing user parameter in GET request")
            raise ValueError("Missing user parameter")

        print(f"Fetching periods for user: {user}")
        
        # Query all items for user that start with PERIOD#
        response = period_table.query(
            KeyConditionExpression=Key("user").eq(user) & Key("date").begins_with("PERIOD#"),
            ScanIndexForward=False  # newest first
        )

        items = response.get("Items", [])
        print(f"Found {len(items)} period entries for user: {user}")

        # Format the response, skipping any malformed entries
        periods = []
        for item in items:
            try:
                # Ensure period_date exists
                if "period_date" not in item:
                    print(f"Skipping entry without period_date: {item.get('date', 'unknown')}")
                    continue
                
                # Convert all Decimals in the item
                item = convert_decimals(item)
                
                period_data = {
                    "period_date": item.get("period_date"),
                    "created_at": item.get("created_at", "")
                }
                
                # Add optional fields only if they exist
                if "user_age" in item and item.get("user_age") is not None:
                    period_data["user_age"] = item.get("user_age")
                
                if "cycle_length" in item and item.get("cycle_length") is not None:
                    period_data["cycle_length"] = item.get("cycle_length")
                
                periods.append(period_data)
            except Exception as e:
                print(f"Skipping malformed period entry: {item.get('date', 'unknown')}, error: {str(e)}")
                import traceback
                traceback.print_exc()
                continue

        return {
            "periods": periods,
            "count": len(periods)
        }
    except ValueError as e:
        print(f"Validation error: {str(e)}")
        raise
    except Exception as e:
        print(f"Error fetching periods: {str(e)}")
        raise


# Delete period entry (DELETE)
def delete_period(event):
    """
    Handles DELETE requests to remove a period entry.
    Expects JSON body:
    {
        "user": "Sofia",
        "period_date": "15-02-2026"
    }
    """
    try:
        body = json.loads(event.get("body", "{}"))
        
        user = body.get("user")
        period_date = body.get("period_date")
        
        if not user or not period_date:
            raise ValueError("Missing user or period_date")
        
        print(f"Deleting period for user: {user}, date: {period_date}")
        
        period_table.delete_item(
            Key={
                "user": user,
                "date": f"PERIOD#{period_date}"
            }
        )
        
        return {
            "status": "success",
            "message": "Period deleted successfully"
        }
    except ValueError as e:
        print(f"Validation error: {str(e)}")
        raise
    except Exception as e:
        print(f"Error deleting period: {str(e)}")
        raise


def lambda_handler(event, context):
    """
    Main Lambda handler for period operations.
    Supports GET (retrieve periods), POST (save period), and DELETE (remove period) methods.
    """
    try:
        method = event.get("httpMethod", "")
        print(f"Received {method} request for period tracking")

        if method == "OPTIONS":
            print("Handling OPTIONS request for CORS")
            return {
                "statusCode": 200,
                "headers": {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "GET,POST,DELETE,OPTIONS",
                    "Access-Control-Allow-Headers": "Content-Type"
                },
                "body": json.dumps({"status": "ok", "message": "CORS preflight"}, cls=DecimalEncoder)
            }

        result = None
        if method == "POST":
            result = save_period(event)
        elif method == "GET":
            result = get_periods(event)
        elif method == "DELETE":
            result = delete_period(event)
        else:
            print(f"Unsupported HTTP method: {method}")
            raise ValueError(f"Unsupported HTTP method: {method}")

        return {
            "statusCode": 200,
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET,POST,DELETE,OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type"
            },
            "body": json.dumps(result, cls=DecimalEncoder)
        }
    
    except ValueError as e:
        print(f"Validation error in lambda_handler: {str(e)}")
        return {
            "statusCode": 400,
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type"
            },
            "body": json.dumps({"error": str(e)}, cls=DecimalEncoder)
        }
    except Exception as e:
        print(f"Lambda handler error: {str(e)}")
        import traceback
        traceback.print_exc()
        return {
            "statusCode": 500,
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type"
            },
            "body": json.dumps({"error": "Internal server error", "details": str(e)}, cls=DecimalEncoder)
        }
