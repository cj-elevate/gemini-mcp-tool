@echo off
REM Wrapper to run Gemini with access to E:/ drive (full E:\ read access)
REM Usage: gemini_e [gemini args...]
cd /d E:\
gemini %*
