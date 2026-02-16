import boto3
import os
from botocore.config import Config
from utils.logger import select_powertools_logger

logger = select_powertools_logger("aws-helpers-dynamo")

def get_dynamodb_client(resource: bool = True, region_name: str = None):
    """
    Returns a DynamoDB client or resource.
    
    Parameters:
    - resource: bool, if True returns boto3.resource, else boto3.client
    - region_name: AWS region (defaults to AWS_DEFAULT_REGION env var or us-east-1)
    
    """
    if region_name is None:
        region_name = os.environ.get("AWS_DEFAULT_REGION", "us-east-1")
    
    try:
        config = Config(
            retries={
                "max_attempts": 10,
                "mode": "standard"
            }
        )
        if resource:
            dynamodb = boto3.resource("dynamodb", region_name=region_name, config=config)
        else:
            dynamodb = boto3.client("dynamodb", region_name=region_name, config=config)

        # Optional: test call to ensure connection
        dynamodb.meta.client.describe_limits() if resource else dynamodb.list_tables()

        return dynamodb
    except Exception as e:
        logger.error(f"Failed to create DynamoDB client/resource: {e}")
        raise
