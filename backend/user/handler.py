"""
User Management Handler
Handles user registration, authentication, and setup
"""
import json
import boto3
import hashlib
import logging
import os

logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Initialize DynamoDB
dynamodb = boto3.resource('dynamodb')
table_name = os.environ.get('DYNAMODB_TABLE_NAME', 'GlowCycleTable')
table = dynamodb.Table(table_name)


def hash_password(password):
    """Hash password using SHA256"""
    return hashlib.sha256(password.encode()).hexdigest()


def create_user(event, context):
    """
    POST /user/create
    Body: { "username": "user", "displayName": "User Name", "password": "pass" }
    Create a new user account
    """
    try:
        body = json.loads(event.get('body', '{}'))
        username = body.get('username', '').lower().strip()
        display_name = body.get('displayName', '').strip()
        password = body.get('password', '')
        
        if not username or not display_name or not password:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Missing required fields'})
            }
        
        logger.info(f'Creating user: {username}')
        
        # Check if user already exists
        response = table.get_item(
            Key={
                'user': username,
                'date': 'USER_PROFILE'
            }
        )
        
        if 'Item' in response:
            return {
                'statusCode': 409,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'User already exists'})
            }
        
        # Create user
        password_hash = hash_password(password)
        
        item = {
            'user': username,
            'date': 'USER_PROFILE',
            'displayName': display_name,
            'passwordHash': password_hash,
            'setupCompleted': False
        }
        
        table.put_item(Item=item)
        
        logger.info(f'User created successfully: {username}')
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'status': 'success',
                'username': username,
                'displayName': display_name
            })
        }
        
    except Exception as e:
        logger.error(f'Error creating user: {str(e)}')
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Internal server error'})
        }


def authenticate_user(event, context):
    """
    POST /user/authenticate
    Body: { "username": "user", "password": "pass" }
    Authenticate user and return profile
    """
    try:
        body = json.loads(event.get('body', '{}'))
        username = body.get('username', '').lower().strip()
        password = body.get('password', '')
        
        if not username or not password:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Missing username or password'})
            }
        
        logger.info(f'Authenticating user: {username}')
        
        # Get user from DynamoDB
        response = table.get_item(
            Key={
                'user': username,
                'date': 'USER_PROFILE'
            }
        )
        
        item = response.get('Item')
        
        if not item:
            return {
                'statusCode': 401,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Invalid username or password'})
            }
        
        # Verify password
        password_hash = hash_password(password)
        
        if item.get('passwordHash') != password_hash:
            return {
                'statusCode': 401,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Invalid username or password'})
            }
        
        logger.info(f'User authenticated successfully: {username}')
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'status': 'success',
                'username': username,
                'displayName': item.get('displayName', username),
                'setupCompleted': item.get('setupCompleted', False)
            })
        }
        
    except Exception as e:
        logger.error(f'Error authenticating user: {str(e)}')
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Internal server error'})
        }


def complete_setup(event, context):
    """
    POST /user/complete-setup
    Body: { "username": "user" }
    Mark user setup as complete
    """
    try:
        body = json.loads(event.get('body', '{}'))
        username = body.get('username', '').lower().strip()
        
        if not username:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Missing username'})
            }
        
        logger.info(f'Completing setup for user: {username}')
        
        # Update user
        table.update_item(
            Key={
                'user': username,
                'date': 'USER_PROFILE'
            },
            UpdateExpression='SET setupCompleted = :val',
            ExpressionAttributeValues={
                ':val': True
            }
        )
        
        logger.info(f'Setup completed for user: {username}')
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'status': 'success',
                'username': username
            })
        }
        
    except Exception as e:
        logger.error(f'Error completing setup: {str(e)}')
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Internal server error'})
        }
