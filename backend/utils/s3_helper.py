from __future__ import annotations
import boto3
import json
from typing import Optional
from copy import copy
import os
from enum import Enum

from utils.logger import select_powertools_logger

logger = select_powertools_logger("aws-helpers-s3")


class ContentType(str, Enum):
    json_content = "application/json"
    jpeg_content = "image/jpeg"


class S3Location:
    bucket: str
    file_name: str
    location: str

    @classmethod
    def from_location(cls, location: str):
        bucket, file_name = location.split("/")[0], "/".join(location.split("/")[1:])
        return cls(bucket=bucket, file_name=file_name)

    def __init__(self, bucket: str, file_name: str) -> None:
        self.bucket = bucket
        self.file_name = file_name
        self.location = f"{self.bucket}/{self.file_name}"

    def serialise(self):
        return copy(vars(self))


class S3:
    client: boto3.client

    def __init__(
        self,
        client: Optional[boto3.client] = None,
        resource: Optional[boto3.resource] = None,
    ) -> None:
        self.client = client if client else self._get_client()
        self.resource = (
            resource
            if resource
            else boto3.resource("s3", region_name=os.environ["AWS_DEFAULT_REGION"])
        )

    def _get_client(self) -> boto3.client:
        region_name = os.environ["AWS_DEFAULT_REGION"]
        return boto3.client("s3", region_name=region_name)

    # ---------- JSON ----------

    def put_json_object(self, bucket_name: str, file_name: str, obj: dict):
        return self.client.put_object(
            Body=json.dumps(obj),
            Bucket=bucket_name,
            Key=file_name,
            ContentType=ContentType.json_content.value,
        )

    def get_object(self, bucket_name: str, file_name: str):
        response = self.client.get_object(Bucket=bucket_name, Key=file_name)
        return json.loads(response["Body"].read())

    # ---------- JPG ----------

    def save_jpg_to_s3(self, content: bytes, s3_location: S3Location):
        """
        Save JPG image to S3 (no compression).
        """
        try:
            return self.client.put_object(
                Body=content,
                Bucket=s3_location.bucket,
                Key=s3_location.file_name,
                ContentType=ContentType.jpeg_content.value,
            )
        except Exception as e:
            logger.exception(f"Failed to save jpg to s3 due to {e}")
            return None

    def get_jpg_from_s3(self, bucket: str, file_name: str) -> bytes:
        """
        Retrieve JPG bytes from S3.
        """
        response = self.client.get_object(Bucket=bucket, Key=file_name)
        return response["Body"].read()

    # ---------- Rekognition Helper ----------

    def to_rekognition_s3_object(self, bucket: str, file_name: str) -> dict:
        """
        Build Rekognition S3Object payload.
        """
        return {
            "S3Object": {
                "Bucket": bucket,
                "Name": file_name,
            }
        }

    # ---------- Presigned URL ----------

    def get_presigned_url(
        self,
        bucket_name: str,
        file_name: str,
        expires_in: int = 3600,
    ):
        return self.client.generate_presigned_url(
            "get_object",
            Params={
                "Bucket": bucket_name,
                "Key": file_name,
            },
            ExpiresIn=expires_in,
        )
