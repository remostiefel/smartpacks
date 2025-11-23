import type { CreativeTask, StudentCreativeProfile } from "@shared/schema";

interface TaskRecommendation {
  task: CreativeTask;
  score: number;
  matchReasons: string[];
}

interface CreativityType {
  visualVerbal?: number;
  practicalFantasy?: number;
  structuredExperimental?: number;
  soloCollaborative?: number;
  detailOverview?: number;
}

/**
 * Smart-Match-Algorithmus für personalisierte Aufgaben-Empfehlungen
 * 
 * Berücksichtigt:
 * - Schüler-Interessen (Tiere, Weltraum, Sport, etc.)
 * - Stärken (Zeichnen, Geschichten erfinden, etc.)
 * - Kreativitäts-Typ (Visuell/Verbal, Praktisch/Fantasievoll)
 * - Bereits zugewiesene Aufgaben (werden ausgeschlossen)
 */
export function matchTasksToStudent(
  allTasks: CreativeTask[],
  profile: StudentCreativeProfile | null | undefined,
  assignedTaskIds: string[]
): TaskRecommendation[] {
  if (!allTasks || allTasks.length === 0) {
    return [];
  }

  // Filter out already assigned tasks
  const availableTasks = allTasks.filter(task => task && task.id && !assignedTaskIds.includes(task.id));

  if (availableTasks.length === 0) {
    return [];
  }

  // If no profile exists, return random tasks with low scores
  if (!profile) {
    return availableTasks.slice(0, 5).map(task => ({
      task: {
        id: task.id,
        title: task.title || 'Unbekannte Aufgabe',
        description: task.description || '',
        category: task.category || 'Allgemein',
        ageGroup: task.ageGroup || '7-11 Jahre'
      },
      score: 50,
      matchReasons: ['Allgemeine Empfehlung - erstelle ein Profil für bessere Vorschläge']
    }));
  }

  const recommendations: TaskRecommendation[] = availableTasks
    .filter(task => {
      if (!task) return false;
      if (!task.id) return false;
      if (!task.title) return false;
      if (!task.description) return false;
      return true;
    })
    .map(task => {
      let score = 0;
      const reasons: string[] = [];

      // Interest matching (highest priority)
      const interests = Array.isArray(profile.interests) ? profile.interests : [];
      const taskText = `${task.title} ${task.description}`.toLowerCase();

      interests.forEach(interest => {
        if (interest && taskText.includes(interest.toLowerCase())) {
          score += 30;
          reasons.push(`Passt zu Interesse: ${interest}`);
        }
      });

      // Strength matching
      const strengths = Array.isArray(profile.strengths) ? profile.strengths : [];
      strengths.forEach(strength => {
        if (!strength) return;
        const strengthLower = strength.toLowerCase();

        // Map strengths to task characteristics
        if ((strengthLower.includes('zeichnen') || strengthLower.includes('malen')) && 
            (taskText.includes('zeichne') || taskText.includes('male') || taskText.includes('bild'))) {
          score += 20;
          reasons.push(`Nutzt Stärke: ${strength}`);
        }

        if ((strengthLower.includes('schreiben') || strengthLower.includes('geschichten')) && 
            (taskText.includes('schreib') || taskText.includes('erzähl') || taskText.includes('geschichte'))) {
          score += 20;
          reasons.push(`Nutzt Stärke: ${strength}`);
        }

        if (strengthLower.includes('kreativ') && taskText.includes('erfinde')) {
          score += 20;
          reasons.push(`Nutzt Stärke: ${strength}`);
        }

        if (strengthLower.includes('fantasie') && 
            (taskText.includes('stell dir vor') || taskText.includes('fantasie'))) {
          score += 20;
          reasons.push(`Nutzt Stärke: ${strength}`);
        }
      });

      // Creativity type matching
      if (profile.creativityType) {
        const { visualVerbal, practicalFantasy } = profile.creativityType;

        // Visual (<-0.3) or Verbal (>0.3)
        if (visualVerbal !== undefined && visualVerbal !== null) {
          if (visualVerbal < -0.3 && (taskText.includes('zeichne') || taskText.includes('male'))) {
            score += 15;
            reasons.push('Passt zu visuellem Lerntyp');
          }
          if (visualVerbal > 0.3 && (taskText.includes('schreib') || taskText.includes('erzähl'))) {
            score += 15;
            reasons.push('Passt zu verbalem Lerntyp');
          }
        }

        // Practical (<-0.3) or Fantasy (>0.3)
        if (practicalFantasy !== undefined && practicalFantasy !== null) {
          if (practicalFantasy < -0.3 && (taskText.includes('bau') || taskText.includes('experiment'))) {
            score += 15;
            reasons.push('Passt zu praktischem Lerntyp');
          }
          if (practicalFantasy > 0.3 && (taskText.includes('stell dir vor') || taskText.includes('fantasie'))) {
            score += 15;
            reasons.push('Passt zu fantasievollem Lerntyp');
          }
        }
      }

      // Category diversity bonus
      const assignedCategories = new Set(
        allTasks
          .filter(t => t && t.id && assignedTaskIds.includes(t.id))
          .map(t => t.category)
      );

      if (task.category && !assignedCategories.has(task.category)) {
        score += 10;
        reasons.push('Neue Kategorie zum Entdecken');
      }

      return {
        task: {
          id: task.id,
          title: task.title || 'Unbekannte Aufgabe',
          description: task.description || '',
          category: task.category || 'Allgemein',
          ageGroup: task.ageGroup || '7-11 Jahre'
        },
        score: Math.max(0, score),
        matchReasons: reasons.length > 0 ? reasons : ['Könnte interessant sein']
      };
    });

  // Sort by score and return top 5, ensure we have valid recommendations
  return recommendations
    .filter(rec => rec && rec.task && rec.task.id)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
}

/**
 * Erklärt die Empfehlung in menschenlesbarer Form
 */
export function explainRecommendation(recommendation: TaskRecommendation): string {
  const { task, score, matchReasons } = recommendation;

  let explanation = `**${task.title}** (${task.category})\n`;
  explanation += `Score: ${score}\n`;
  explanation += `Warum: ${matchReasons.join(' • ')}\n`;
  explanation += `\n${task.description}`;

  return explanation;
}