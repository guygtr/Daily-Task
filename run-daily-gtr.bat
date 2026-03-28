@echo off
echo **[YODA] →** Décollage de la routine quotidienne GTR-Team...

cd /d "d:\GTR-Team-Project\Daily-Task"

echo **[JANITOR] →** Nettoyage et Automations...
call npm run routine

echo **[JARVIS] →** Génération des idées de génie...
call npm run generate

echo **[C-3PO] →** Opération terminée avec succès. 🚀☀️
pause
