import json
from botocore.exceptions import ClientError

class NotFoundError(Exception):
    pass

class ServerError(Exception):
    pass

def handle_error_response(func):
    """
    Decorator for Lambda functions to handle errors and format API responses.
    Includes CORS headers for frontend access.
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
                "body": json.dumps(response)
            }
        except ClientError as e:
            return {
                "statusCode": 400,
                "headers": headers,
                "body": json.dumps({"error": str(e)})
            }
        except NotFoundError as e:
            return {
                "statusCode": 404,
                "headers": headers,
                "body": json.dumps({"error": str(e)})
            }
        except ServerError as e:
            return {
                "statusCode": 500,
                "headers": headers,
                "body": json.dumps({"error": str(e)})
            }
        except Exception as e:
            return {
                "statusCode": 500,
                "headers": headers,
                "body": json.dumps({"error": str(e)})
            }
    return wrapper
