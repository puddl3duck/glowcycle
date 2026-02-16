import boto3
from utils.logger import select_powertools_logger

# Handles S3 trigger when a selfie is uploaded
# Calls AWS Rekognition directly from S3
# Returns / logs skin analysis

logger = select_powertools_logger(service="skin")

rekognition = boto3.client("rekognition")


def handler(event, context):
    """
    Triggered by S3 PutObject event
    """

    try:
        record = event["Records"][0]

        bucket = record["s3"]["bucket"]["name"]
        key = record["s3"]["object"]["key"]

        logger.info(f"Processing selfie from S3: {bucket}/{key}")

        # Rekognition pulls directly from S3 (BEST PRACTICE)
        rekognition_response = rekognition.detect_faces(
            Image={
                "S3Object": {
                    "Bucket": bucket,
                    "Name": key,
                }
            },
            Attributes=["ALL"],
        )

        face_details = rekognition_response.get("FaceDetails", [])

        logger.info(
            {
                "message": "Selfie processed successfully",
                "faces_detected": len(face_details),
                "s3_key": key,
            }
        )

        return {
            "statusCode": 200,
            "body": {
                "message": "Selfie processed",
                "faces_detected": len(face_details),
                "faces": face_details,
            },
        }

    except Exception as e:
        logger.exception("Selfie processing failed")

        return {
            "statusCode": 500,
            "body": {"error": str(e)},
        }
