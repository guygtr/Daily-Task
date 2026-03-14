import OpenAI from 'openai';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config();

const apiKey = process.env.OPENAI_API_KEY;

interface Project {
  name: string;
  description: string;
}

async function generateIdeas() {
  console.error('**[JARVIS] →** Analyse des projets GTR-Team en cours...');
  
  // Charger les projets depuis le fichier JSON
  let projects: Project[] = [];
  try {
    const projectsPath = path.join(__dirname, '../projects.json');
    const projectsData = fs.readFileSync(projectsPath, 'utf-8');
    projects = JSON.parse(projectsData);
  } catch (error) {
    console.error('**[JARVIS] →** Erreur lors de la lecture de projects.json :', error);
    // Fallback si le fichier est manquant
    projects = [
      { name: "Bar Personnel Manager", description: "Gestion de bar et cocktails" },
      { name: "GTR Agents", description: "Dépôt central des agents" }
    ];
  }

  if (!apiKey || apiKey === 'your_api_key_here') {
    console.error('**[JARVIS] →** Clé API manquante. Activation du mode Simulation pour le test initial.');
    const simulation = simulateIdeas();
    console.log(simulation);
    return simulation;
  }

  const openai = new OpenAI({ apiKey });
  
  const projectsList = projects.map((p, i) => `${i + 1}. ${p.name} (${p.description})`).join('\n    ');

  const prompt = `
    En tant que Jarvis, spécialiste IA de la GTR-Team, propose 3 à 5 idées de fonctionnalités innovantes pour l'écosystème GTR-Team.
    
    IMPORTANT : Tu DOIS proposer au moins une nouvelle idée pertinente pour CHACUN des projets suivants listés ci-dessous :
    ${projectsList}
    
    Pour chaque idée, fournis :
    - Nom : Titre court
    - Projet : Le nom du projet concerné
    - Description : Pourquoi c'est utile
    - Temps estimé : HH:MM
    - Impact Business : High/Medium/Low
    - Complexité : Facile/Moyen/Avancé
    
    Réponds en Français, format Markdown.
  `;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [{ role: "user", content: prompt }],
    });

    const content = response.choices[0].message.content;
    console.error('**[JARVIS] →** Idées générées avec succès.');
    console.log(content);
    return content;
  } catch (error) {
    console.error('**[JARVIS] →** Erreur lors de la génération :', error);
    const simulation = simulateIdeas();
    console.log(simulation);
    return simulation;
  }
}

function simulateIdeas() {
  return `
### Idée 1 : Dashboard de Performance Alcool 📊
**Projet** : Bar Personnel Manager
**Description** : Un tableau de bord visuel montrant les bouteilles les plus utilisées et les plus rentables pour le Bar Manager.
**Temps estimé** : 04:00
**Impact Business** : High
**Complexité** : Moyen

### Idée 2 : Commande Vocale "Jarvis, prépare-moi un Negroni" 🎙️
**Projet** : Bar Personnel Manager
**Description** : Intégration de la reconnaissance vocale pour chercher des recettes et gérer les stocks sans quitter ses mains des bouteilles.
**Temps estimé** : 06:00
**Impact Business** : High
**Complexité** : Avancé

### Idée 3 : Optimiseur de Stock Intelligent 🤖
**Projet** : GTR Agents
**Description** : Algorithme prédisant les ruptures de stock à venir basées sur l'historique de consommation.
**Temps estimé** : 03:00
**Impact Business** : High
**Complexité** : Moyen
    `;
}

generateIdeas();
