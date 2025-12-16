@echo off
REM Wrapper to run Gemini with access to C:/ drive (full C:\ read access)
REM Usage: gemini_c [gemini args...]
REM For D:\ access, use gemini_d.bat
cd /d C:\
gemini %*
