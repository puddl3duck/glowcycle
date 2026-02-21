# Backend Deployment Fix - Tasks

## Task List

- [ ] 1. Pre-Deployment Verification
  - [ ] 1.1 Verify DecimalEncoder exists in backend/period/handler.py
  - [ ] 1.2 Verify DecimalEncoder exists in backend/utils/lambda_utils.py
  - [ ] 1.3 Verify DecimalEncoder exists in backend/journal/handler.py
  - [ ] 1.4 Check current CloudWatch logs for error frequency

- [ ] 2. Choose Deployment Method
  - [ ] 2.1 Determine which deployment method to use (CDK/Console/CLI)
  - [ ] 2.2 Verify required tools are installed

- [ ] 3. Deploy Using AWS CDK (Option 1 - Recommended)
  - [ ] 3.1 Navigate to infrastructure directory
  - [ ] 3.2 Run `npm install` to install dependencies
  - [ ] 3.3 Run `npm run build` to compile TypeScript
  - [ ] 3.4 Run `cdk deploy` to deploy stack
  - [ ] 3.5 Confirm deployment in AWS console

- [ ] 4. Deploy Using AWS Console (Option 2 - Manual)
  - [ ] 4.1 Create deployment package (zip backend folder)
  - [ ] 4.2 Upload to PeriodHandler Lambda function
  - [ ] 4.3 Upload to JournalHandler Lambda function
  - [ ] 4.4 Upload to WellnessHandler Lambda function (if exists)
  - [ ] 4.5 Verify upload success in console

- [ ] 5. Deploy Using AWS CLI (Option 3 - Scripted)
  - [ ] 5.1 Create deployment package: `zip -r function.zip backend/`
  - [ ] 5.2 Update PeriodHandler: `aws lambda update-function-code --function-name <name> --zip-file fileb://function.zip`
  - [ ] 5.3 Update JournalHandler: `aws lambda update-function-code --function-name <name> --zip-file fileb://function.zip`
  - [ ] 5.4 Update WellnessHandler: `aws lambda update-function-code --function-name <name> --zip-file fileb://function.zip`

- [ ] 6. Post-Deployment Verification
  - [ ] 6.1 Test GET /periods endpoint with test user
  - [ ] 6.2 Check CloudWatch logs for successful responses
  - [ ] 6.3 Verify no "Decimal is not JSON serializable" errors
  - [ ] 6.4 Test frontend cycle tracking page loads data
  - [ ] 6.5 Verify numeric fields display correctly

- [ ] 7. Monitoring and Validation
  - [ ] 7.1 Monitor CloudWatch logs for 1 hour
  - [ ] 7.2 Check error rate metrics
  - [ ] 7.3 Perform user acceptance testing
  - [ ] 7.4 Document deployment success

## Notes
- Only complete ONE deployment method (Task 3, 4, or 5)
- Task 1 and 6 are required regardless of deployment method
- If deployment fails, check rollback plan in design.md
