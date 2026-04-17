@echo off
echo 반찬가게 앱 시작중...

:: ngrok 설치 (이미 있으면 스킵)
npm list -g ngrok >nul 2>&1
if %errorlevel% neq 0 (
    echo ngrok 설치중...
    npm install -g ngrok
)

:: vite 개발서버 새 창에서 실행
start "반찬앱 서버" cmd /k "cd /d "%~dp0" && npm run dev"

:: 5초 대기
timeout /t 5 /nobreak >nul

:: ngrok 터널 새 창에서 실행
start "ngrok 터널" cmd /k "ngrok http 5173"

echo.
echo 두 창이 열렸습니다.
echo ngrok 창에서 https://xxxx.ngrok-free.app 주소를 확인하세요.
echo 그 주소를 핸드폰에서 열면 됩니다!
pause
