import boto3
import json

def get_secret(secret_name: str):
    client = boto3.client("secretsmanager")
    response = client.get_secret_value(SecretId=secret_name)
    secret = response.get("SecretString")
    if secret:
        return json.loads(secret)
    return None


#Use like
SECRET_NAME = "glow-cycle-backend"

secret_values = get_secret(SECRET_NAME)
s3_key = secret_values.get("s3_access_key")
dynamo_pass = secret_values.get("dynamodb_password")