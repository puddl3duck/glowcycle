import json
from botocore.exceptions import ClientError

class NotFoundError(Exception):
    pass

class ServerError(Exception):
    pass

def handle_error_response(func):
    """
    Decorator for Lambda functions to handle errors and format API responses.
    """
    def wrapper(event, context):
        try:
            response = func(event, context)
            return {
                "statusCode": 200,
                "body": json.dumps(response)
            }
        except ClientError as e:
            return {
                "statusCode": 400,
                "body": json.dumps({"error": str(e)})
            }
        except NotFoundError as e:
            return {
                "statusCode": 404,
                "body": json.dumps({"error": str(e)})
            }
        except ServerError as e:
            return {
                "statusCode": 500,
                "body": json.dumps({"error": str(e)})
            }
        except Exception as e:
            return {
                "statusCode": 500,
                "body": json.dumps({"error": str(e)})
            }
    return wrapper
