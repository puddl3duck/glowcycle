import boto3
import base64
import os
import json
from utils.logger import select_powertools_logger
from utils.s3_helper import S3, S3Location

# Handles S3 trigger when a selfie is uploaded
# Calls AWS Rekognition directly from S3
# Returns / logs skin analysis

logger = select_powertools_logger(service_name="skin")


rekognition = boto3.client("rekognition")
s3_helper = S3()
BUCKET_NAME = "glowcycle-assets"



# Lambda handler for API Gateway POST (upload selfie)
def lambda_handler(event, context):
    """
    Handles POST requests from API Gateway to upload a selfie image to S3.
    Expects multipart/form-data or base64-encoded body with fields:
      - user: username (string)
      - date: date string (YYYY-MM-DD or similar)
      - file: image file (binary, base64, or multipart)
    """
    try:
        method = event.get("httpMethod", "")
        cors_headers = {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "*",
        }
        if method == "OPTIONS":
            return {
                "statusCode": 200,
                "headers": cors_headers,
                "body": json.dumps({"message": "CORS preflight"})
            }
        if method != "POST":
            return {
                "statusCode": 405,
                "headers": cors_headers,
                "body": json.dumps({"error": "Method not allowed"})
            }

        # Parse body (assume base64-encoded file in JSON for simplicity)
        body = event.get("body", "")
        is_base64 = event.get("isBase64Encoded", False)
        if is_base64:
            body = base64.b64decode(body)
            body = body.decode("utf-8")
        try:
            data = json.loads(body)
        except Exception:
            return {"statusCode": 400, "body": json.dumps({"error": "Invalid JSON body"})}

        user = data.get("user")
        date = data.get("date")
        image_b64 = data.get("file")
        if not (user and date and image_b64):
            return {
                "statusCode": 400,
                "headers": cors_headers,
                "body": json.dumps({"error": "Missing user, date, or file"})
            }

        # Decode image
        try:
            image_bytes = base64.b64decode(image_b64)
        except Exception:
            return {
                "statusCode": 400,
                "headers": cors_headers,
                "body": json.dumps({"error": "Invalid image encoding"})
            }

        # Save to S3 as selfies/{user}#{date}.jpeg
        s3_key = f"selfies/{user}#{date}.jpeg"
        s3_location = S3Location(bucket=BUCKET_NAME, file_name=s3_key)
        s3_helper.save_jpg_to_s3(image_bytes, s3_location)

        return {
            "statusCode": 200,
            "headers": cors_headers,
            "body": json.dumps({"message": "Selfie uploaded", "s3_key": s3_key}),
        }
    except Exception as e:
        logger.exception("Selfie upload failed")
        return {
            "statusCode": 500,
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "*",
            },
            "body": json.dumps({"error": str(e)})
        }
