import json
import boto3
import logging
import decimal
from datetime import datetime
from typing import Optional

logger = logging.getLogger()
logger.setLevel(logging.INFO)

dynamodb = boto3.resource("dynamodb")
skin_table = dynamodb.Table("GlowCycleTable")

class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, decimal.Decimal):
            return int(obj) if obj % 1 == 0 else float(obj)
        return super().default(obj)
    
def save_skin_analysis(event):
    """
    POST - Save skin analysis result to DynamoDB.
    PK = user, SK = SKIN#DD-MM-YYYY#HH-MM-SS
    """
    try:
        body = json.loads(event.get("body", "{}"))

        required_fields = ["user", "analysis"]
        missing_fields = [f for f in required_fields if f not in body]
        if missing_fields:
            raise ValueError(f"Missing required fields: {', '.join(missing_fields)}")

        user = body["user"]
        analysis = body["analysis"]
        now = datetime.now()
        date_str = now.strftime("%d-%m-%Y")
        time_str = now.strftime("%H-%M-%S")
        sk = f"SKIN#{date_str}#{time_str}"

        item = {
            "user": user,
            "date": sk,
            "created_at": now.isoformat(),
            "summary": analysis.get("summary", ""),
            "overall_skin_health": analysis.get("overall_skin_health"),
            "metrics": analysis.get("metrics", {}),
            "concerns_detected": analysis.get("concerns_detected", []),
            "am_routine": analysis.get("am_routine", []),
            "pm_routine": analysis.get("pm_routine", []),
            "tips": analysis.get("tips", []),
            "cycle_day": analysis.get("cycleDay"),    
            "cycle_phase": analysis.get("cyclePhase"),
            "face_data": analysis.get("face_data"),
            "disclaimer": analysis.get("disclaimer", "This analysis is for informational purposes only.")
        }

        logger.info(f"Saving skin analysis for user: {user}, sk: {sk}")
        skin_table.put_item(Item=item)

        return {
            "statusCode": 200,
            "headers": {"Content-Type": "application/json", "Access-Control-Allow-Origin": "*"},
            "body": json.dumps({
                "status": "success",
                "user": user,
                "date": sk,
                "message": "Skin analysis saved successfully"
            },cls=DecimalEncoder)
        }

    except ValueError as e:
        logger.error(f"Validation error: {str(e)}")
        raise
    except Exception as e:
        logger.error(f"Error saving skin analysis: {str(e)}")
        raise


def get_skin_analyses(event):
    """
    GET - Retrieve skin analysis history for a user.
    """
    try:
        from boto3.dynamodb.conditions import Key

        params = event.get("queryStringParameters") or {}
        user = params.get("user")

        if not user:
            raise ValueError("Missing user parameter")

        logger.info(f"Fetching skin analyses for user: {user}")
        response = skin_table.query(
            KeyConditionExpression=Key("user").eq(user) & Key("date").begins_with("SKIN#"),
            ScanIndexForward=False  # newest first
        )

        items = response.get("Items", [])
        logger.info(f"Found {len(items)} skin analyses for user: {user}")

        return {
            "statusCode": 200,
            "headers": {"Content-Type": "application/json", "Access-Control-Allow-Origin": "*"},
            "body": json.dumps({
                "analyses": items,
            },cls=DecimalEncoder)
        }

    except ValueError as e:
        logger.error(f"Validation error: {str(e)}")
        raise
    except Exception as e:
        logger.error(f"Error fetching skin analyses: {str(e)}")
        raise


def lambda_handler(event, context):
    try:
        method = event.get("httpMethod", "")

        if method == "OPTIONS":
            return {
                "statusCode": 200,
                "headers": {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
                    "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
                },
                "body": ""
            }
        if method == "POST":
            return save_skin_analysis(event)
        if method == "GET":
            return get_skin_analyses(event)

        return {
            "statusCode": 405,
            "headers": {"Content-Type": "application/json", "Access-Control-Allow-Origin": "*"},
            "body": json.dumps({"error": f"Unsupported method: {method}"}, cls=DecimalEncoder)
        }
    except Exception as e:
        logger.error(f"Lambda handler error: {str(e)}")
        return {
            "statusCode": 500,
            "headers": {"Content-Type": "application/json", "Access-Control-Allow-Origin": "*"},
            "body": json.dumps({"error": str(e)},cls=DecimalEncoder)
        }