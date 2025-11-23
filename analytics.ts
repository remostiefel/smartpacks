
import { StudentError } from "@shared/schema";
import { classifyErrors, type ErrorCategory } from "./math-pedagogy";

// Simple in-memory cache with TTL
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCached<T>(key: string): T | null {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data as T;
  }
  cache.delete(key);
  return null;
}

function setCache(key: string, data: any): void {
  cache.set(key, { data, timestamp: Date.now() });
}

// Zeitstrahl-Daten
export interface ErrorTimeline {
  weekNumber: number;
  errorCount: number;
  errorsByType: Record<ErrorCategory, number>;
  improvement: number; // Prozent
}

// Zahlenraum-Heatmap
export interface NumberHeatmap {
  num1: number;
  num2: number;
  operation: 'addition' | 'subtraction';
  errorCount: number;
  lastError: Date;
}

// Facetten-Erfolg
export interface FacettenSuccess {
  studentId: string;
  errorCategory: ErrorCategory;
  basisSuccess: number;    // 0-100%
  anwendenSuccess: number; // 0-100%
  verknuepfenSuccess: number; // 0-100%
}

// Päckchen-Wirksamkeit
export interface PaeckchenEffectiveness {
  paeckchenType: string;
  errorCategory: ErrorCategory;
  assignedCount: number;
  improvementRate: number; // Prozent
  avgTimeToImprovement: number; // Tage
}

export function generateErrorTimeline(errors: StudentError[]): ErrorTimeline[] {
  const cacheKey = `timeline_${errors.map(e => e.id).join('_')}`;
  const cached = getCached<ErrorTimeline[]>(cacheKey);
  if (cached) return cached;

  const errorsByWeek = new Map<number, StudentError[]>();
  
  errors.forEach(error => {
    const weekNumber = getWeekNumber(new Date(error.createdAt || Date.now()));
    if (!errorsByWeek.has(weekNumber)) {
      errorsByWeek.set(weekNumber, []);
    }
    errorsByWeek.get(weekNumber)!.push(error);
  });

  const timeline: ErrorTimeline[] = [];
  const sortedWeeks = Array.from(errorsByWeek.keys()).sort((a, b) => a - b);

  sortedWeeks.forEach((week, index) => {
    const weekErrors = errorsByWeek.get(week)!;
    const classified = classifyErrors(weekErrors);
    
    const errorsByType: Record<string, number> = {};
    classified.forEach(c => {
      errorsByType[c.category] = c.errors.length;
    });

    const improvement = index > 0 
      ? ((errorsByWeek.get(sortedWeeks[index - 1])!.length - weekErrors.length) / 
         errorsByWeek.get(sortedWeeks[index - 1])!.length) * 100
      : 0;

    timeline.push({
      weekNumber: week,
      errorCount: weekErrors.length,
      errorsByType: errorsByType as Record<ErrorCategory, number>,
      improvement
    });
  });

  setCache(cacheKey, timeline);
  return timeline;
}

export function generateNumberHeatmap(errors: StudentError[]): NumberHeatmap[] {
  const cacheKey = `heatmap_${errors.map(e => e.id).join('_')}`;
  const cached = getCached<NumberHeatmap[]>(cacheKey);
  if (cached) return cached;

  const heatmapMap = new Map<string, NumberHeatmap>();

  errors.forEach(error => {
    const key = `${error.num1}-${error.num2}-${error.operation}`;
    
    if (!heatmapMap.has(key)) {
      heatmapMap.set(key, {
        num1: error.num1,
        num2: error.num2,
        operation: error.operation as 'addition' | 'subtraction',
        errorCount: 0,
        lastError: new Date(error.createdAt || Date.now())
      });
    }

    const entry = heatmapMap.get(key)!;
    entry.errorCount++;
    const errorDate = new Date(error.createdAt || Date.now());
    if (errorDate > entry.lastError) {
      entry.lastError = errorDate;
    }
  });

  const result = Array.from(heatmapMap.values())
    .sort((a, b) => b.errorCount - a.errorCount);
  
  setCache(cacheKey, result);
  return result;
}

export function analyzeCognitiveLead(
  studentErrors: StudentError[],
  taskNum1: number,
  taskNum2: number,
  operation: 'addition' | 'subtraction'
): 'easy' | 'optimal' | 'hard' {
  // Analyse basierend auf Fehlerhistorie
  const similarErrors = studentErrors.filter(e => 
    e.operation === operation &&
    Math.abs(e.num1 - taskNum1) <= 2 &&
    Math.abs(e.num2 - taskNum2) <= 2
  );

  if (similarErrors.length === 0) return 'easy';
  if (similarErrors.length <= 2) return 'optimal';
  return 'hard';
}

function getWeekNumber(date: Date): number {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}
