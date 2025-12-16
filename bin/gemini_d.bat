@echo off
REM Wrapper to run Gemini with access to D:/ drive (full D:\ read access)
REM Usage: gemini_d [gemini args...]
REM For C:\ access, use gemini_c.bat
cd /d D:\
gemini %*
