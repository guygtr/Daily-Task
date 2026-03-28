import { Octokit } from 'octokit';
import * as dotenv from 'dotenv';

dotenv.config();

/**
 * Service pour interagir avec l'API GitHub.
 * @author Altair (GTR-Team)
 */
export class GitHubService {
  private octokit: Octokit;

  constructor() {
    const token = process.env.GITHUB_TOKEN;
    const isPlaceholder = !token || token.includes('your_') || token.includes('token_here') || token === '';
    
    if (isPlaceholder) {
      console.warn('**[ALTAIR] →** GITHUB_TOKEN manquant ou invalide (placeholder). Mode Simulation activé.');
    }
    this.octokit = new Octokit({ auth: token });
  }

  /**
   * Crée une issue dans un dépôt GTR-Team.
   * @param owner Propriétaire du dépôt (ex: 'guygtr')
   * @param repo Nom du dépôt (ex: 'bar-manager')
   * @param title Titre de l'idée
   * @param body Description détaillée de l'idée
   */
  async createIssue(owner: string, repo: string, title: string, body: string): Promise<boolean> {
    const token = process.env.GITHUB_TOKEN;
    const isPlaceholder = !token || token.includes('your_') || token.includes('token_here') || token === '';

    if (isPlaceholder) {
      console.log(`**[ALTAIR] → [SIMULATION]** Création d'issue dans ${owner}/${repo} : ${title}`);
      return true;
    }

    try {
      await this.octokit.rest.issues.create({
        owner,
        repo,
        title,
        body,
        labels: ['daily-ideation', 'innovation']
      });
      console.log(`**[ALTAIR] →** Issue créée avec succès dans ${owner}/${repo}.`);
      return true;
    } catch (error) {
      console.error(`**[ALTAIR] →** Erreur lors de la création de l'issue dans ${owner}/${repo} :`, error);
      return false;
    }
  }
}
