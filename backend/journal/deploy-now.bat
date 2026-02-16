@echo off
echo ========================================
echo Deploying Journal Lambda to AWS
echo ========================================
echo.
echo IMPORTANT: Update the function name below with your Lambda function name
echo Get it from: AWS Console → Lambda → Functions
echo.

cd /d "%~dp0\.."

echo [1/4] Cleaning old deployment package...
if exist journal\function.zip del journal\function.zip

echo [2/4] Creating deployment package with correct structure...
powershell -Command "Compress-Archive -Path journal,utils -DestinationPath journal\function.zip -Force"

if not exist journal\function.zip (
    echo ERROR: Failed to create function.zip
    pause
    exit /b 1
)

echo [3/4] Updating Lambda function...
echo NOTE: Update the function name in this script with your actual Lambda function name
aws lambda update-function-code ^
    --function-name YOUR-LAMBDA-FUNCTION-NAME ^
    --zip-file fileb://journal/function.zip ^
    --region YOUR-AWS-REGION

if %ERRORLEVEL% EQU 0 (
    echo.
    echo [4/4] Waiting for Lambda to be ready...
    timeout /t 5 /nobreak >nul
    echo.
    echo ========================================
    echo SUCCESS! Lambda deployed successfully
    echo ========================================
    echo.
    echo Your app should work now. Refresh the browser!
) else (
    echo.
    echo ========================================
    echo ERROR: Deployment failed
    echo ========================================
)

echo.
pause
