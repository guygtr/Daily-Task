import OpenAI from 'openai';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { z } from 'zod';
import { GitHubService } from './github-service';

const isGitHubAction = process.env.GITHUB_ACTIONS === 'true';

if (!isGitHubAction) {
  const centralTokenPath = path.join(__dirname, '../../GTR-Team/.tokens/gtr-tokens.env');
  if (fs.existsSync(centralTokenPath)) {
    dotenv.config({ path: centralTokenPath, override: true });
    console.error(`**[MARIO] →** Coffre-fort des tokens chargé avec succès depuis ${centralTokenPath}.`);
  } else {
    console.error(`**[MARIO] →** Coffre-fort local ${centralTokenPath} introuvable. Utilisation du contexte système.`);
  }
} else {
  console.error('**[MARIO] →** Environnement Cloud (GitHub Actions) détecté. Utilisation des Secrets GitHub.');
}

/**
 * Schémas de validation GTR-Team 2026
 * @author Mario (Architect)
 */
const ProjectSchema = z.object({
  name: z.string(),
  description: z.string(),
  repo_owner: z.string().default('guygtr'),
  github_repo: z.string(),
  disk_folder: z.string()
});

const IdeaSchema = z.object({
  title: z.string(),
  project_name: z.string(),
  description: z.string(),
  estimated_time: z.string(),
  business_impact: z.enum(['High', 'Medium', 'Low']),
  complexity: z.enum(['Facile', 'Moyen', 'Avancé'])
});

const IdeasResponseSchema = z.object({
  ideas: z.array(IdeaSchema)
});

type Project = z.infer<typeof ProjectSchema>;
type Idea = z.infer<typeof IdeaSchema>;

async function generateIdeas() {
  console.error('**[JARVIS] →** Analyse des projets GTR-Team en cours...');
  
  const github = new GitHubService();
  const apiKey = process.env.OPENAI_API_KEY || process.env.GROK_API_KEY;
  const isGrok = !process.env.OPENAI_API_KEY && !!process.env.GROK_API_KEY;

  // 1. Chargement et Validation des Projets
  let projects: Project[] = [];
  try {
    const projectsPath = path.join(__dirname, '../projects.json');
    const projectsData = fs.readFileSync(projectsPath, 'utf-8');
    const rawProjects = JSON.parse(projectsData);
    projects = z.array(ProjectSchema).parse(rawProjects);
    console.error(`**[MARIO] →** ${projects.length} projets validés avec succès.`);
  } catch (error) {
    console.error('**[MARIO] →** Erreur de structure dans projects.json :', error);
    process.exit(1);
  }

  // 2. Chargement de l'Historique (Jarvis Memory)
  let history: { ideas: Idea[] } = { ideas: [] };
  const historyPath = path.join(__dirname, '../history.json');
  try {
    if (fs.existsSync(historyPath)) {
      const historyData = fs.readFileSync(historyPath, 'utf-8');
      history = JSON.parse(historyData);
    }
  } catch (error) {
    console.error('**[JARVIS] →** Erreur lors de la lecture de l\'historique. On part à neuf.');
  }

  // 3. Génération des Idées (IA ou Simulation)
  let generatedContent: { ideas: Idea[] };

  if (!apiKey || apiKey === 'your_api_key_here') {
    console.error('**[JARVIS] →** Mode Simulation activé (Clé API manquante).');
    generatedContent = simulateIdeas();
  } else {
    const openai = new OpenAI({ 
      apiKey,
      baseURL: isGrok ? "https://api.x.ai/v1" : undefined
    });
    
    if (isGrok) {
      console.error('**[JARVIS] →** Mode xAI (Grok) activé.');
    }

    const projectsList = projects.map((p, i) => `${i + 1}. ${p.name} : ${p.description}`).join('\n');
    const pastIdeasTitles = history.ideas.map(i => i.title).join(', ');

    const prompt = `
      En tant que Jarvis (GTR-Team), propose exactement une (1) idée innovante pour CHACUN des projets suivants. 
      C'est une mission CRITIQUE : n'oublie aucun projet.

      PROJETS À ANALYSER :
      ${projectsList}
      
      CONTRAINTES DE VARIÉTÉ :
      Voici les titres des idées déjà proposées récemment : [${pastIdeasTitles}].
      Tu DOIS proposer des idées TOTALEMENT DIFFÉRENTES et originales. Ne te répète pas.

      CONTRAINTES DE PERTINENCE :
      - Pour "Bar Personnel Manager" : Focus sur la mixologie, le stock physique et l'expérience utilisateur.
      - Pour "Recettes familiales" : Focus sur la transmission, le scan OCR et l'organisation culinaire.
      - Pour "GTR Agents" : Focus sur l'automatisation, les workflows inter-projets et l'infrastructure technique. Ne propose PAS d'idées de cocktails pour ce projet.

      FORMAT DE RÉPONSE (JSON STRICT) :
      {
        "ideas": [
          {
            "title": "Nom de l'idée",
            "project_name": "Nom exact du projet",
            "description": "Explication détaillée (pourquoi c'est nouveau et utile)",
            "estimated_time": "HH:MM",
            "business_impact": "High" | "Medium" | "Low",
            "complexity": "Facile" | "Moyen" | "Avancé"
          }
        ]
      }
    `;

    try {
      const response = await openai.chat.completions.create({
        model: isGrok ? "grok-4-1-fast-reasoning" : "gpt-4-turbo-preview",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" }
      });

      const rawContent = JSON.parse(response.choices[0].message.content || '{}');
      generatedContent = IdeasResponseSchema.parse(rawContent);
      console.error('**[JARVIS] →** Idées générées et validées par Zod.');
    } catch (error) {
      console.error('**[JARVIS] →** Échec de la génération/validation IA. Fallback Simulation.', error);
      generatedContent = simulateIdeas();
    }
  }

  // 4. Publication et Sauvegarde de l'Historique
  console.error('**[ALTAIR] →** Traitement des idées...');
  
  const newHistoryIdeas = [...history.ideas];

  for (const idea of generatedContent.ideas) {
    const project = projects.find(p => p.name === idea.project_name);
    if (project) {
      const body = `
### 💡 Nouvelle Idée : ${idea.title}

**Impact Business** : ${idea.business_impact}
**Complexité** : ${idea.complexity}
**Temps estimé** : ${idea.estimated_time}

#### 📝 Description
${idea.description}

---
*Généré automatiquement par Daily-Task (Jarvis v3.2)*
      `;
      
      const success = await github.createIssue(project.repo_owner, project.github_repo, `[IDEA] ${idea.title}`, body);
      if (success) {
        newHistoryIdeas.push(idea);
      }
    } else {
      console.warn(`**[ALTAIR] →** Projet non trouvé pour l'idée : ${idea.title} (${idea.project_name})`);
    }
  }

  // Garder seulement les 50 dernières idées pour ne pas saturer le prompt
  const updatedHistory = {
    ideas: newHistoryIdeas.slice(-50)
  };

  try {
    fs.writeFileSync(historyPath, JSON.stringify(updatedHistory, null, 2));
    console.error('**[JARVIS] →** Historique mis à jour.');
  } catch (error) {
    console.error('**[JARVIS] →** Erreur lors de la sauvegarde de l\'historique.');
  }

  // 5. Notification Discord (Distincte par idée)
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (webhookUrl && webhookUrl.startsWith('http')) {
    console.error('**[C-3PO] →** Préparation des notifications Discord...');
    
    try {
      // 1. Message d'en-tête
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: `🧠 **GTR-Team : ${generatedContent.ideas.length} nouvelles idées de fonctionnalités proposées !**`,
          username: "Jarvis (GTR-Team)",
          avatar_url: "https://mesagents.gtrtechnologies.com/logo.jpg"
        })
      });

      // 2. Un message par idée
      for (const idea of generatedContent.ideas) {
        let ideaMessage = `📌 **${idea.title}** (${idea.project_name})\n\n> ${idea.description}\n\n*Impact : ${idea.business_impact} | Complexité : ${idea.complexity} | Temps estimé : ${idea.estimated_time}*`;
        
        if (ideaMessage.length > 2000) {
          ideaMessage = ideaMessage.substring(0, 1990) + "...";
        }

        const response = await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: ideaMessage,
            username: "Jarvis (GTR-Team)",
            avatar_url: "https://mesagents.gtrtechnologies.com/logo.jpg"
          })
        });
        
        if (response.ok) {
          console.error(`**[C-3PO] →** Notification envoyée pour : ${idea.title}`);
        } else {
          console.error(`**[C-3PO] →** Erreur Discord pour ${idea.title} (Status: ${response.status})`);
        }
      }
    } catch (error) {
      console.error('**[C-3PO] →** Erreur de connexion lors de l\'envoi Discord.');
    }
  }

  console.error('**[JARVIS] →** Mission terminée.');
}

function simulateIdeas(): { ideas: Idea[] } {
  // Sélection aléatoire de prefixes pour varier un peu même en simulation
  const prefixes = ["Optimisation", "Automatisation", "Nouveau module", "Amélioration UI", "Sécurité"];
  const rand = () => prefixes[Math.floor(Math.random() * prefixes.length)];
  const timestamp = new Date().toLocaleTimeString();

  return {
    ideas: [
      {
        title: `${rand()} : Tableau de Bord`,
        project_name: "Bar Personnel Manager",
        description: `Analyse automatique du coût par cocktail (Généré à ${timestamp}).`,
        estimated_time: "04:00",
        business_impact: "High",
        complexity: "Moyen"
      },
      {
        title: `${rand()} : Scan OCR`,
        project_name: "Recettes familiales",
        description: `Transcription ultra-précise de vieilles recettes (Généré à ${timestamp}).`,
        estimated_time: "06:00",
        business_impact: "High",
        complexity: "Avancé"
      },
      {
        title: `${rand()} : Hub GTR`,
        project_name: "GTR Agents",
        description: `Workflow centralisé de déploiement (Généré à ${timestamp}).`,
        estimated_time: "03:00",
        business_impact: "Medium",
        complexity: "Moyen"
      }
    ]
  };
}

generateIdeas();
