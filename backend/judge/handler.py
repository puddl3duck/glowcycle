"""
Judge Setup Handler
Manages judge account setup completion status in DynamoDB
"""
import json
import boto3
import logging
import os

logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Initialize DynamoDB
dynamodb = boto3.resource('dynamodb')
table_name = os.environ.get('DYNAMODB_TABLE_NAME', 'GlowCycleTable')
table = dynamodb.Table(table_name)


def lambda_handler(event, context):
    """
    Handle judge setup operations
    GET: Check if judge has completed setup
    POST: Mark judge setup as complete
    """
    try:
        method = event.get('httpMethod', '')
        
        # CORS preflight
        if method == 'OPTIONS':
            return {
                'statusCode': 200,
                'headers': {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type'
                },
                'body': ''
            }
        
        if method == 'GET':
            return check_setup(event)
        elif method == 'POST':
            return save_setup(event)
        else:
            return {
                'statusCode': 405,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': f'Method not allowed: {method}'})
            }
            
    except Exception as e:
        logger.error(f'Error in lambda_handler: {str(e)}')
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': str(e)})
        }


def check_setup(event):
    """
    GET /judge/setup?user=username
    Check if judge has completed setup
    """
    try:
        params = event.get('queryStringParameters') or {}
        username = params.get('user')
        
        if not username:
            raise ValueError('Missing user parameter')
        
        logger.info(f'Checking setup for judge: {username}')
        
        # Query DynamoDB
        # PK = user, SK = JUDGE_SETUP
        response = table.get_item(
            Key={
                'user': username,
                'date': 'JUDGE_SETUP'
            }
        )
        
        item = response.get('Item')
        has_completed = item is not None and item.get('completed') == True
        
        logger.info(f'Judge {username} setup completed: {has_completed}')
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'user': username,
                'setupCompleted': has_completed
            })
        }
        
    except ValueError as e:
        logger.error(f'Validation error: {str(e)}')
        return {
            'statusCode': 400,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': str(e)})
        }
    except Exception as e:
        logger.error(f'Error checking setup: {str(e)}')
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': str(e)})
        }


def save_setup(event):
    """
    POST /judge/setup
    Body: { "user": "username", "profileData": {...} }
    Mark judge setup as complete and save profile data
    """
    try:
        body = json.loads(event.get('body', '{}'))
        username = body.get('user')
        profile_data = body.get('profileData', {})
        
        if not username:
            raise ValueError('Missing user in request body')
        
        logger.info(f'Saving setup for judge: {username}')
        
        # Save to DynamoDB
        # PK = user, SK = JUDGE_SETUP
        item = {
            'user': username,
            'date': 'JUDGE_SETUP',
            'completed': True,
            'profileData': profile_data,
            'timestamp': profile_data.get('timestamp', '')
        }
        
        table.put_item(Item=item)
        
        logger.info(f'Setup saved successfully for judge: {username}')
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'status': 'success',
                'user': username,
                'message': 'Setup completed successfully'
            })
        }
        
    except ValueError as e:
        logger.error(f'Validation error: {str(e)}')
        return {
            'statusCode': 400,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': str(e)})
        }
    except Exception as e:
        logger.error(f'Error saving setup: {str(e)}')
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': str(e)})
        }
