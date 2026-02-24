import json
import sys
import os

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from user.handler import create_user, authenticate_user, complete_setup

def lambda_handler(event, context):
    """Main Lambda handler for user management"""
    
    # Handle CORS preflight requests
    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'POST, OPTIONS'
            },
            'body': ''
        }
    
    # Route based on resource path
    resource_path = event.get('resource', '')
    http_method = event.get('httpMethod', '')
    
    if resource_path == '/user/create' and http_method == 'POST':
        return create_user(event, context)
    elif resource_path == '/user/authenticate' and http_method == 'POST':
        return authenticate_user(event, context)
    elif resource_path == '/user/complete-setup' and http_method == 'POST':
        return complete_setup(event, context)
    else:
        return {
            'statusCode': 404,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'POST, OPTIONS'
            },
            'body': json.dumps({'error': 'Not found'})
        }