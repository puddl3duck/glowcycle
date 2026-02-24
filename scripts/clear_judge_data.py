"""
Script to clear judge setup data from DynamoDB
This allows judges to fill in their own information when they log in
"""
import boto3
import sys

# Initialize DynamoDB
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('GlowCycleTable')

# Judge usernames to clear
judges = [
    'Rada Stanic',
    'Luke Anderson', 
    'Sarah Basset',
    'Team',
    'test'  # Also clear test user
]

def clear_judge_data(username):
    """Clear all data for a judge user"""
    try:
        print(f"Clearing data for: {username}")
        
        # Query all items for this user
        response = table.query(
            KeyConditionExpression='#user = :username',
            ExpressionAttributeNames={'#user': 'user'},
            ExpressionAttributeValues={':username': username}
        )
        
        items = response.get('Items', [])
        print(f"  Found {len(items)} items to delete")
        
        # Delete each item
        for item in items:
            table.delete_item(
                Key={
                    'user': item['user'],
                    'date': item['date']
                }
            )
            print(f"  Deleted: {item['date']}")
        
        print(f"✅ Cleared all data for {username}\n")
        return True
        
    except Exception as e:
        print(f"❌ Error clearing data for {username}: {str(e)}\n")
        return False

def main():
    print("=" * 60)
    print("CLEARING JUDGE DATA FROM DYNAMODB")
    print("=" * 60)
    print("\nThis will delete all data for the following users:")
    for judge in judges:
        print(f"  - {judge}")
    
    print("\nThey will be able to fill in their own information when they log in.")
    
    response = input("\nAre you sure you want to continue? (yes/no): ")
    
    if response.lower() != 'yes':
        print("Operation cancelled.")
        sys.exit(0)
    
    print("\nStarting cleanup...\n")
    
    success_count = 0
    for judge in judges:
        if clear_judge_data(judge):
            success_count += 1
    
    print("=" * 60)
    print(f"CLEANUP COMPLETE: {success_count}/{len(judges)} users cleared")
    print("=" * 60)
    print("\nJudges can now log in with their credentials and fill in their own data:")
    print("  - Rada Stanic / glowcycle2026")
    print("  - Luke Anderson / glowcycle2026")
    print("  - Sarah Basset / glowcycle2026")
    print("  - Team / glowcycle2026")

if __name__ == '__main__':
    main()
