@echo off
title Iniciar Ngrok

:: Abrir la primera ventana de ngrok
start cmd /k "cd %USERPROFILE%/Desktop && ngrok start --config "%USERPROFILE%/AppData/Local/ngrok/ngrok1.yml" frontend backend1 backend2"

:: Esperar para asegurarse de que los túneles de la primera ventana estén listos
echo Esperando que se inicialicen los túneles de la primera ventana...
timeout /t 5

:: Abrir la segunda ventana de ngrok
start cmd /k "cd %USERPROFILE%/Desktop && ngrok start --config "%USERPROFILE%/AppData/Local/ngrok/ngrok2.yml" backend3 backend4"

:: Esperar para asegurarse de que los túneles de la segunda ventana estén listos
echo Esperando que se inicialicen los túneles de la segunda ventana...
timeout /t 5

:: Ejecutar el script Python
echo Ejecutando scriptngrok.py...
timeout /t 2
python "%USERPROFILE%\Desktop\scriptngrok.py"

echo Ngrok iniciado en dos ventanas y script Python ejecutado.
echo Para cerrar todas las instancias de ngrok, cierre las ventanas de comando.
pause
