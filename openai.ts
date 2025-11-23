// Referenced from javascript_openai blueprint
import OpenAI from "openai";
import type { StudentError } from "@shared/schema";
import { generateHomeworkExercises, classifyErrors, type HomeworkExercise, type PaeckchenExercise } from "./math-pedagogy";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface ErrorPattern {
  errorType: string;
  description: string;
  suggestedExercises: string[];
}

export interface HomeworkContent {
  title: string;
  exercises: Exercise[];
}

export interface Exercise {
  type: string;
  title: string;
  instructions: string;
  problems?: string[];
  fillInBlanks?: string[];
  explanation?: string;
  patternHint?: string;
  sentenceStems?: string[];
}

export async function analyzeErrorPattern(errors: StudentError[]): Promise<ErrorPattern> {
  const errorDescriptions = errors.map(e => 
    `${e.num1} ${e.operation === 'addition' ? '+' : '-'} ${e.num2} = ${e.incorrectAnswer} (korrekt: ${e.correctAnswer})`
  ).join('\n');

  const response = await openai.chat.completions.create({
    model: "gpt-5",
    messages: [
      {
        role: "system",
        content: `Du bist ein Experte für Mathematikdidaktik und die "SmartPacks Power-Packs" Methodik. 
Analysiere Rechenfehler von Primarschülern im Zahlenraum bis 20 und identifiziere Fehlermuster.

Häufige Fehlermuster:
- Zehnerübergang (z.B. bei 5+8, 13-9)
- Vertauschen von Zahlen
- Grundlegende Rechenoperationen

Antworte in JSON mit: {"errorType": "...", "description": "...", "suggestedExercises": ["...", "..."]}`,
      },
      {
        role: "user",
        content: `Analysiere diese Rechenfehler:\n${errorDescriptions}`,
      },
    ],
    response_format: { type: "json_object" },
    max_completion_tokens: 2048,
  });

  return JSON.parse(response.choices[0].message.content || "{}");
}

export async function generateHomeworkContent(
  studentName: string,
  errors: StudentError[],
  pageCount: number
): Promise<HomeworkContent> {
  const classified = classifyErrors(errors);
  const homeworkExercises = generateHomeworkExercises(errors, pageCount);
  
  const errorCategories = classified.map(c => c.description).join(', ');
  const title = classified.length > 0 
    ? `Power-Packs für ${studentName}` 
    : `Rechenübungen für ${studentName}`;

  const allExercises: Exercise[] = [];
  
  for (const hw of homeworkExercises) {
    for (const ex of hw.exercises) {
      allExercises.push({
        type: ex.type,
        title: ex.title,
        instructions: ex.instructions,
        problems: ex.problems,
        fillInBlanks: ex.fillInBlanks,
        explanation: ex.explanation,
        patternHint: ex.patternHint,
        sentenceStems: ex.sentenceStems
      });
    }
  }

  return {
    title,
    exercises: allExercises
  };
}
