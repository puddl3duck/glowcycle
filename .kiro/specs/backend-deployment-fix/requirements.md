# Backend Deployment Fix - Requirements

## Problem Statement
The Glow Cycle application is experiencing 500 errors when fetching period data from the backend. The error message is: "Object of type Decimal is not JSON serializable"

## Root Cause
DynamoDB returns numeric values as Python `Decimal` objects, which cannot be directly serialized to JSON. While the local code has been updated with `DecimalEncoder` to handle this, the AWS Lambda functions are still running the old code without this fix.

## User Stories

### 1. As a user, I want to view my period history without errors
**Acceptance Criteria:**
- When I navigate to the cycle tracking page, I should see my saved period entries
- The page should load without 500 errors from the backend
- All numeric fields (cycle_length, user_age) should display correctly

### 2. As a developer, I want to deploy backend changes to AWS Lambda
**Acceptance Criteria:**
- Updated handler.py files with DecimalEncoder should be deployed to Lambda
- All three Lambda functions (period, journal, wellness) should have the fix
- Deployment should be verifiable through CloudWatch logs

### 3. As a user, I want the application to handle DynamoDB Decimal types correctly
**Acceptance Criteria:**
- All API responses should properly serialize Decimal values to int or float
- No "Decimal is not JSON serializable" errors should occur
- Data integrity should be maintained (whole numbers as int, decimals as float)

## Technical Requirements

### Backend Changes (Already Implemented Locally)
1. `backend/period/handler.py` - Has DecimalEncoder class and convert_decimals helper
2. `backend/utils/lambda_utils.py` - Has DecimalEncoder in error handler decorator
3. `backend/journal/handler.py` - Has DecimalEncoder import

### Deployment Requirements
1. Package updated Python code for Lambda deployment
2. Deploy to AWS Lambda functions:
   - PeriodHandler Lambda
   - JournalHandler Lambda
   - WellnessHandler Lambda (if exists)
3. Verify deployment through testing

## Success Metrics
- Zero "Decimal is not JSON serializable" errors in CloudWatch logs
- Successful GET requests to /periods endpoint returning 200 status
- Frontend cycle tracking page loads period data without errors
- All numeric values display correctly in the UI

## Out of Scope
- Database schema changes
- Frontend modifications (already working correctly)
- New feature development
