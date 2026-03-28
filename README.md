# Daily-Task 🧠🚀

**GTR-Team v3.0 - Daily-Task** est un système autonome conçu pour stimuler l'innovation au sein de l'écosystème GTR-Team.

## 🌟 Mission
Chaque matin à **9h (Québec)**, le système analyse les projets existants et propose **3 à 5 idées de fonctionnalités** innovantes, réalistes et sécurisées.

## 🏗️ Architecture (Mario)
Le projet suit une architecture stricte en **3 couches** :

1.  **Couche de Déclenchement (Trigger)** : Gérée par GitHub Actions via un planning `cron`.
2.  **Couche Logique (Logic)** : Script TypeScript piloté par Jarvis, validé par **Zod** pour garantir l'intégrité des données.
3.  **Couche de Sortie (Output)** : Publication automatique via **Octokit (API GitHub)** sous forme de GitHub Issues.

## 👥 La GTR-Team impliquée
- **Elon** : Vision globale.
- **Jarvis** : Cerveau IA.
- **Mario** : Architecte garant des schémas Zod.
- **Altair** : Expert API et intégration GitHub.
- **Starship** : Automatisation.
- **Luke** : Gardien de la sécurité (secrets GITHUB_TOKEN/OPENAI_API_KEY).
- **C-3PO** : Responsable de la clarté et de la documentation.

## 🚀 Comment ça marche ? (Pour débutant)
C'est très simple :
1. Un "robot" (GitHub Action) se réveille à 9h.
2. Il demande à Jarvis "Qu'est-ce qu'on pourrait améliorer aujourd'hui ?".
3. Jarvis analyse les projets (Bar Manager, etc.).
4. Le robot crée une nouvelle tâche (Issue) dans ce projet pour présenter les idées.

---
*GTR-Team v3.0 - Innover chaque jour.*
