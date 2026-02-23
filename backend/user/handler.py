import json
import boto3
import hashlib
from botocore.exceptions import ClientError
from utils.dynamo_client import get_dynamo_client
from utils.logger import get_logger

logger = get_logger(__name__)

def create_user(event, context):
    """Create a new user account"""
    try:
        # Parse request body
        body = json.loads(event.get('body', '{}'))
        username = body.get('username', '').strip()
        password = body.get('password', '').strip()
        display_name = body.get('displayName', '').strip()
        
        # Validate inputs
        if not username or not password or not display_name:
            return {
                'statusCode': 400,
                'headers': {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type',
                    'Access-Control-Allow-Methods': 'POST, OPTIONS'
                },
                'body': json.dumps({
                    'error': 'Username, password, and display name are required'
                })
            }
        
        if len(password) < 4:
            return {
                'statusCode': 400,
                'headers': {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type',
                    'Access-Control-Allow-Methods': 'POST, OPTIONS'
                },
                'body': json.dumps({
                    'error': 'Password must be at least 4 characters long'
                })
            }
        
        # Normalize username (lowercase, no spaces)
        normalized_username = username.lower().replace(' ', '')
        
        # Hash password
        password_hash = hashlib.sha256(password.encode()).hexdigest()
        
        # Get DynamoDB client
        dynamodb = get_dynamo_client()
        table_name = 'GlowCycleTable'
        
        # Check if user already exists
        try:
            response = dynamodb.get_item(
                TableName=table_name,
                Key={
                    'PK': {'S': normalized_username},
                    'SK': {'S': 'USER_PROFILE'}
                }
            )
            
            if 'Item' in response:
                return {
                    'statusCode': 409,
                    'headers': {
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Headers': 'Content-Type',
                        'Access-Control-Allow-Methods': 'POST, OPTIONS'
                    },
                    'body': json.dumps({
                        'error': 'Username already exists'
                    })
                }
        except ClientError as e:
            logger.error(f"Error checking existing user: {e}")
        
        # Create user profile
        try:
            dynamodb.put_item(
                TableName=table_name,
                Item={
                    'PK': {'S': normalized_username},
                    'SK': {'S': 'USER_PROFILE'},
                    'displayName': {'S': display_name},
                    'passwordHash': {'S': password_hash},
                    'createdAt': {'S': context.aws_request_id},
                    'setupCompleted': {'BOOL': False}
                }
            )
            
            logger.info(f"User created successfully: {normalized_username}")
            
            return {
                'statusCode': 201,
                'headers': {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type',
                    'Access-Control-Allow-Methods': 'POST, OPTIONS'
                },
                'body': json.dumps({
                    'message': 'User created successfully',
                    'username': normalized_username,
                    'displayName': display_name
                })
            }
            
        except ClientError as e:
            logger.error(f"Error creating user: {e}")
            return {
                'statusCode': 500,
                'headers': {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type',
                    'Access-Control-Allow-Methods': 'POST, OPTIONS'
                },
                'body': json.dumps({
                    'error': 'Failed to create user'
                })
            }
            
    except Exception as e:
        logger.error(f"Unexpected error in create_user: {e}")
        return {
            'statusCode': 500,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'POST, OPTIONS'
            },
            'body': json.dumps({
                'error': 'Internal server error'
            })
        }

def authenticate_user(event, context):
    """Authenticate user login"""
    try:
        # Parse request body
        body = json.loads(event.get('body', '{}'))
        username = body.get('username', '').strip()
        password = body.get('password', '').strip()
        
        # Validate inputs
        if not username or not password:
            return {
                'statusCode': 400,
                'headers': {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type',
                    'Access-Control-Allow-Methods': 'POST, OPTIONS'
                },
                'body': json.dumps({
                    'error': 'Username and password are required'
                })
            }
        
        # Normalize username
        normalized_username = username.lower().replace(' ', '')
        
        # Hash provided password
        password_hash = hashlib.sha256(password.encode()).hexdigest()
        
        # Get DynamoDB client
        dynamodb = get_dynamo_client()
        table_name = 'GlowCycleTable'
        
        # Get user profile
        try:
            response = dynamodb.get_item(
                TableName=table_name,
                Key={
                    'PK': {'S': normalized_username},
                    'SK': {'S': 'USER_PROFILE'}
                }
            )
            
            if 'Item' not in response:
                return {
                    'statusCode': 401,
                    'headers': {
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Headers': 'Content-Type',
                        'Access-Control-Allow-Methods': 'POST, OPTIONS'
                    },
                    'body': json.dumps({
                        'error': 'Invalid username or password'
                    })
                }
            
            user = response['Item']
            stored_password_hash = user.get('passwordHash', {}).get('S', '')
            
            # Verify password
            if password_hash != stored_password_hash:
                return {
                    'statusCode': 401,
                    'headers': {
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Headers': 'Content-Type',
                        'Access-Control-Allow-Methods': 'POST, OPTIONS'
                    },
                    'body': json.dumps({
                        'error': 'Invalid username or password'
                    })
                }
            
            # Authentication successful
            display_name = user.get('displayName', {}).get('S', username)
            setup_completed = user.get('setupCompleted', {}).get('BOOL', False)
            
            logger.info(f"User authenticated successfully: {normalized_username}")
            
            return {
                'statusCode': 200,
                'headers': {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type',
                    'Access-Control-Allow-Methods': 'POST, OPTIONS'
                },
                'body': json.dumps({
                    'message': 'Authentication successful',
                    'username': normalized_username,
                    'displayName': display_name,
                    'setupCompleted': setup_completed
                })
            }
            
        except ClientError as e:
            logger.error(f"Error authenticating user: {e}")
            return {
                'statusCode': 500,
                'headers': {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type',
                    'Access-Control-Allow-Methods': 'POST, OPTIONS'
                },
                'body': json.dumps({
                    'error': 'Authentication failed'
                })
            }
            
    except Exception as e:
        logger.error(f"Unexpected error in authenticate_user: {e}")
        return {
            'statusCode': 500,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'POST, OPTIONS'
            },
            'body': json.dumps({
                'error': 'Internal server error'
            })
        }

def complete_setup(event, context):
    """Mark user setup as completed"""
    try:
        # Parse request body
        body = json.loads(event.get('body', '{}'))
        username = body.get('username', '').strip()
        
        if not username:
            return {
                'statusCode': 400,
                'headers': {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type',
                    'Access-Control-Allow-Methods': 'POST, OPTIONS'
                },
                'body': json.dumps({
                    'error': 'Username is required'
                })
            }
        
        # Normalize username
        normalized_username = username.lower().replace(' ', '')
        
        # Get DynamoDB client
        dynamodb = get_dynamo_client()
        table_name = 'GlowCycleTable'
        
        # Update setup status
        try:
            dynamodb.update_item(
                TableName=table_name,
                Key={
                    'PK': {'S': normalized_username},
                    'SK': {'S': 'USER_PROFILE'}
                },
                UpdateExpression='SET setupCompleted = :completed',
                ExpressionAttributeValues={
                    ':completed': {'BOOL': True}
                }
            )
            
            logger.info(f"Setup completed for user: {normalized_username}")
            
            return {
                'statusCode': 200,
                'headers': {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type',
                    'Access-Control-Allow-Methods': 'POST, OPTIONS'
                },
                'body': json.dumps({
                    'message': 'Setup completed successfully'
                })
            }
            
        except ClientError as e:
            logger.error(f"Error completing setup: {e}")
            return {
                'statusCode': 500,
                'headers': {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type',
                    'Access-Control-Allow-Methods': 'POST, OPTIONS'
                },
                'body': json.dumps({
                    'error': 'Failed to complete setup'
                })
            }
            
    except Exception as e:
        logger.error(f"Unexpected error in complete_setup: {e}")
        return {
            'statusCode': 500,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'POST, OPTIONS'
            },
            'body': json.dumps({
                'error': 'Internal server error'
            })
        }