import json
from decimal import Decimal
from botocore.exceptions import ClientError


# Custom JSON encoder for Decimal objects
class DecimalEncoder(json.JSONEncoder):
    """JSON encoder that converts Decimal to int or float"""
    def default(self, obj):
        if isinstance(obj, Decimal):
            return int(obj) if obj % 1 == 0 else float(obj)
        return super(DecimalEncoder, self).default(obj)


class NotFoundError(Exception):
    pass

class ServerError(Exception):
    pass

def handle_error_response(func):
    """
    Decorator for Lambda functions to handle errors and format API responses.
    Includes CORS headers for frontend access.
    Uses DecimalEncoder to handle DynamoDB Decimal types.
    """
    def wrapper(event, context):
        headers = {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With"
        }
        
        try:
            response = func(event, context)
            return {
                "statusCode": 200,
                "headers": headers,
                "body": json.dumps(response, cls=DecimalEncoder)
            }
        except ClientError as e:
            return {
                "statusCode": 400,
                "headers": headers,
                "body": json.dumps({"error": str(e)}, cls=DecimalEncoder)
            }
        except NotFoundError as e:
            return {
                "statusCode": 404,
                "headers": headers,
                "body": json.dumps({"error": str(e)}, cls=DecimalEncoder)
            }
        except ServerError as e:
            return {
                "statusCode": 500,
                "headers": headers,
                "body": json.dumps({"error": str(e)}, cls=DecimalEncoder)
            }
        except Exception as e:
            return {
                "statusCode": 500,
                "headers": headers,
                "body": json.dumps({"error": str(e)}, cls=DecimalEncoder)
            }
    return wrapper
