@echo off
echo ========================================
echo Pushing MERN Sales Dashboard to GitHub
echo ========================================
echo.

REM Check if git is initialized
if not exist .git (
    echo Initializing git repository...
    git init
    echo.
)

REM Add all files
echo Adding all files...
git add .
echo.

REM Commit
echo Committing changes...
git commit -m "Initial commit: MERN Sales Dashboard with full features"
echo.

echo ========================================
echo Next Steps:
echo 1. Create a repository on GitHub.com
echo 2. Copy the repository URL
echo 3. Run these commands:
echo    git remote add origin YOUR_REPO_URL
echo    git branch -M main
echo    git push -u origin main
echo ========================================
echo.
pause

