import OpenAI from 'openai';
import * as dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.OPENAI_API_KEY;

async function generateIdeas() {
  console.log('**[JARVIS] →** Analyse des projets GTR-Team en cours...');
  
  if (!apiKey || apiKey === 'your_api_key_here') {
    console.log('**[JARVIS] →** Clé API manquante. Activation du mode Simulation pour le test initial.');
    return simulateIdeas();
  }

  const openai = new OpenAI({ apiKey });
  
  const prompt = `
    En tant que Jarvis, spécialiste IA de la GTR-Team, propose 3 à 5 idées de fonctionnalités innovantes pour l'écosystème GTR-Team (projets actuels: Bar Personnel Manager, GTR Agents).
    
    Pour chaque idée, fournis :
    - Nom : Titre court
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
    console.log('**[JARVIS] →** Idées générées avec succès.');
    console.log(content);
    return content;
  } catch (error) {
    console.error('**[JARVIS] →** Erreur lors de la génération :', error);
    return simulateIdeas();
  }
}

function simulateIdeas() {
  return `
### Idée 1 : Dashboard de Performance Alcool 📊
**Description** : Un tableau de bord visuel montrant les bouteilles les plus utilisées et les plus rentables pour le Bar Manager.
**Temps estimé** : 04:00
**Impact Business** : High
**Complexité** : Moyen

### Idée 2 : Commande Vocale "Jarvis, prépare-moi un Negroni" 🎙️
**Description** : Intégration de la reconnaissance vocale pour chercher des recettes et gérer les stocks sans quitter ses mains des bouteilles.
**Temps estimé** : 06:00
**Impact Business** : High
**Complexité** : Avancé

### Idée 3 : Optimiseur de Stock Intelligent 🤖
**Description** : Algorithme prédisant les ruptures de stock à venir basées sur l'historique de consommation.
**Temps estimé** : 03:00
**Impact Business** : High
**Complexité** : Moyen
    `;
}

generateIdeas();
