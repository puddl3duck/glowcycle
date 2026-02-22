import json
from datetime import datetime, timedelta
from boto3.dynamodb.conditions import Key
from utils.dynamo_client import get_dynamodb_client
from utils.bedrock_client import generate_wellness_support
from utils.lambda_utils import handle_error_response
from utils.logger import select_powertools_logger
import os

logger = select_powertools_logger("wellness-lambda")

DYNAMODB_TABLE_NAME = os.environ.get("DYNAMODB_TABLE_NAME", "GlowCycleTable")
dynamodb = get_dynamodb_client()
table = dynamodb.Table(DYNAMODB_TABLE_NAME)


def calculate_cycle_phase(cycle_day: int, cycle_length: int = 28) -> str:
    """Calculate current cycle phase based on day"""
    if cycle_day <= 5:
        return "menstrual"
    elif cycle_day <= int(cycle_length * 0.43):
        return "follicular"
    elif cycle_day <= int(cycle_length * 0.57):
        return "ovulation"
    else:
        return "luteal"


def get_user_context(user: str) -> dict:
    """
    Gather comprehensive user context from DynamoDB
    Returns cycle info, recent journal entries, and skin data
    """
    try:
        # Query all user data
        response = table.query(
            KeyConditionExpression=Key("user").eq(user),
            ScanIndexForward=False,
            Limit=20  # Get recent data
        )
        
        items = response.get("Items", [])
        
        # Separate data types
        periods = [item for item in items if item.get("date", "").startswith("PERIOD#")]
        journals = [item for item in items if item.get("feeling") and not item.get("date", "").startswith("PERIOD#")]
        skin_data = [item for item in items if item.get("skin_analysis")]
        
        # Calculate cycle info
        cycle_phase = "follicular"  # Default to a positive phase
        cycle_day = 14
        cycle_length = 28
        
        if periods and len(periods) > 0:
            try:
                # Get most recent period
                latest_period = periods[0]
                period_date_str = latest_period.get("period_date", "")
                
                if period_date_str:
                    # Parse DD-MM-YYYY
                    day, month, year = period_date_str.split('-')
                    period_date = datetime(int(year), int(month), int(day))
                    today = datetime.now()
                    
                    days_since = (today - period_date).days
                    
                    # Get cycle length if available
                    if len(periods) >= 2:
                        try:
                            prev_period = periods[1]
                            prev_date_str = prev_period.get("period_date", "")
                            if prev_date_str:
                                p_day, p_month, p_year = prev_date_str.split('-')
                                prev_date = datetime(int(p_year), int(p_month), int(p_day))
                                cycle_length = (period_date - prev_date).days
                                if cycle_length < 21 or cycle_length > 40:
                                    cycle_length = 28  # Reset to default if unrealistic
                        except:
                            pass
                    
                    cycle_day = (days_since % cycle_length) + 1
                    cycle_phase = calculate_cycle_phase(cycle_day, cycle_length)
            except Exception as e:
                logger.warning(f"Error calculating cycle info: {str(e)}")
        
        # Get most recent journal entry
        latest_journal = journals[0] if journals else {}
        
        # Get most recent skin analysis
        latest_skin = skin_data[0] if skin_data else {}
        
        # Analyse recent patterns (last 7 days)
        recent_journals = journals[:7] if journals else []
        feelings_count = {}
        energy_levels = []
        common_tags = {}
        
        for journal in recent_journals:
            feeling = journal.get("feeling", "")
            if feeling:
                feelings_count[feeling] = feelings_count.get(feeling, 0) + 1
            
            energy = journal.get("energy")
            if energy is not None:
                try:
                    energy_levels.append(int(energy))
                except:
                    pass
            
            tags = journal.get("tags", [])
            if tags:
                for tag in tags:
                    common_tags[tag] = common_tags.get(tag, 0) + 1
        
        avg_energy = sum(energy_levels) / len(energy_levels) if energy_levels else 70
        dominant_feeling = max(feelings_count.items(), key=lambda x: x[1])[0] if feelings_count else "calm"
        top_tags = sorted(common_tags.items(), key=lambda x: x[1], reverse=True)[:3]
        
        return {
            "cycle_phase": cycle_phase,
            "cycle_day": cycle_day,
            "cycle_length": cycle_length,
            "feeling": latest_journal.get("feeling", "calm"),
            "energy": int(latest_journal.get("energy", 70)),
            "thoughts": latest_journal.get("thoughts", ""),
            "tags": latest_journal.get("tags", []),
            "skin_condition": latest_skin.get("skin_analysis", {}),
            "recent_patterns": {
                "avg_energy_7d": round(avg_energy, 1),
                "dominant_feeling_7d": dominant_feeling,
                "top_concerns": [tag[0] for tag in top_tags],
                "entries_count": len(recent_journals)
            }
        }
    
    except Exception as e:
        logger.error(f"Error gathering user context: {str(e)}")
        import traceback
        traceback.print_exc()
        # Return safe defaults
        return {
            "cycle_phase": "follicular",
            "cycle_day": 14,
            "cycle_length": 28,
            "feeling": "calm",
            "energy": 70,
            "thoughts": "",
            "tags": [],
            "skin_condition": {},
            "recent_patterns": {
                "avg_energy_7d": 70,
                "dominant_feeling_7d": "calm",
                "top_concerns": [],
                "entries_count": 0
            }
        }


def generate_support(event):
    """
    Generate AI wellness support based on user context
    GET /wellness?user=username
    """
    try:
        params = event.get("queryStringParameters") or {}
        user = params.get("user")
        
        if not user:
            raise ValueError("Missing user parameter")
        
        logger.info(f"Generating wellness support for user: {user}")
        
        # Gather comprehensive user context
        user_context = get_user_context(user)
        logger.info(f"User context: {json.dumps(user_context, default=str)}")
        
        # Generate AI support using Bedrock
        wellness_response = generate_wellness_support(user_context)
        
        # Add metadata
        wellness_response["generated_at"] = datetime.now().isoformat()
        wellness_response["user_context"] = {
            "cycle_phase": user_context["cycle_phase"],
            "cycle_day": user_context["cycle_day"],
            "energy": user_context["energy"],
            "feeling": user_context["feeling"]
        }
        
        logger.info("Successfully generated wellness support")
        
        return {
            "status": "success",
            "wellness": wellness_response
        }
    
    except ValueError as e:
        logger.error(f"Validation error: {str(e)}")
        raise
    except Exception as e:
        logger.error(f"Error generating support: {str(e)}")
        raise


@handle_error_response
def lambda_handler(event, context):
    """
    Main Lambda handler for AI wellness support
    """
    try:
        method = event.get("httpMethod", "")
        logger.info(f"Received {method} request for wellness support")
        
        if method == "OPTIONS":
            return {"status": "ok", "message": "CORS preflight"}
        
        if method == "GET":
            return generate_support(event)
        
        raise ValueError(f"Unsupported HTTP method: {method}")
    
    except Exception as e:
        logger.error(f"Lambda handler error: {str(e)}")
        raise
