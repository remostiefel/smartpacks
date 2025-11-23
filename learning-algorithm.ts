import { storage } from './storage';
import { PaeckchenType, PAECKCHEN_TEMPLATES } from './paeckchen-library';
import type { PackageVariant } from '@shared/schema';

interface Selection {
  variantId: string;
  selected: boolean;
  rating?: number;
  feedback?: string;
}

interface PreferencePattern {
  errorType: Record<string, {
    preferredTypes: PaeckchenType[];
    avoidedTypes: PaeckchenType[];
    contextualRules: any[];
  }>;
  numberRanges: Record<string, any>;
  combinations: {
    rules: ConditionalPreference[];
  };
}

interface ConditionalPreference {
  condition: {
    errorType?: string;
    numberRange?: [number, number];
    difficulty?: string;
  };
  preferredTypes: PaeckchenType[];
  weight: number;
  evidenceCount: number;
}

interface PreferenceWeights {
  paeckchenTypeWeights: Record<string, number>;
  numberPatternWeights: Record<string, number>;
  difficultyPreferences: Record<string, number>;
}

const LEARNING_RATE = 0.15; // How fast the network adapts
const POSITIVE_REWARD = 1.0; // Reward for selected variants
const NEGATIVE_REWARD = -0.3; // Penalty for rejected variants
const RATING_MULTIPLIER = 0.2; // How much ratings affect learning

/**
 * Main function to update preference network based on training selections
 */
export async function updatePreferenceNetwork(
  teacherId: string,
  sessionId: string,
  selections: Selection[]
): Promise<void> {
  try {
    // Get current network or create new one
    let network = await storage.getPreferenceNetwork(teacherId);
    
    if (!network) {
      // Initialize new network
      network = await storage.upsertPreferenceNetwork({
        teacherId,
        patterns: {
          errorType: {},
          numberRanges: {},
          combinations: { rules: [] },
        },
        weights: {
          paeckchenTypeWeights: {},
          numberPatternWeights: {},
          difficultyPreferences: {},
        },
        trainingCount: 0,
      });
    }

    // Get session data
    const session = await storage.getTrainingSession(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    // Get all variants for this session
    const allVariants = await storage.getSessionVariants(sessionId);
    
    // Extract patterns and update weights
    const updatedPatterns = await extractPatterns(
      session.errorContext as any,
      allVariants,
      selections,
      network.patterns as any
    );
    
    const updatedWeights = await updateWeights(
      allVariants,
      selections,
      network.weights as any
    );

    // Save updated network
    await storage.updateNetworkWeights(
      teacherId,
      updatedPatterns,
      updatedWeights
    );
  } catch (error) {
    console.error('Error updating preference network:', error);
    throw error;
  }
}

/**
 * Extracts patterns from selections and updates pattern database
 */
async function extractPatterns(
  errorContext: { errorType: string; targetNumbers: number[] },
  variants: PackageVariant[],
  selections: Selection[],
  currentPatterns: PreferencePattern
): Promise<PreferencePattern> {
  const { errorType, targetNumbers } = errorContext;
  
  // Initialize error type patterns if not exists
  if (!currentPatterns.errorType[errorType]) {
    currentPatterns.errorType[errorType] = {
      preferredTypes: [],
      avoidedTypes: [],
      contextualRules: [],
    };
  }

  // Track selected and rejected types
  const selectedTypes: PaeckchenType[] = [];
  const rejectedTypes: PaeckchenType[] = [];
  
  for (const selection of selections) {
    const variant = variants.find(v => v.id === selection.variantId);
    if (!variant) continue;
    
    if (selection.selected) {
      selectedTypes.push(variant.paeckchenType as PaeckchenType);
    } else {
      rejectedTypes.push(variant.paeckchenType as PaeckchenType);
    }
  }

  // Update preferred types (with frequency tracking)
  const errorTypePattern = currentPatterns.errorType[errorType];
  
  for (const type of selectedTypes) {
    if (!errorTypePattern.preferredTypes.includes(type)) {
      errorTypePattern.preferredTypes.push(type);
    }
  }
  
  // Update avoided types
  for (const type of rejectedTypes) {
    if (!errorTypePattern.avoidedTypes.includes(type) && 
        !errorTypePattern.preferredTypes.includes(type)) {
      errorTypePattern.avoidedTypes.push(type);
    }
  }

  // Extract conditional rules
  const numberRange = `${Math.min(...targetNumbers)}-${Math.max(...targetNumbers)}`;
  
  // Find or create rule for this context
  let rule = currentPatterns.combinations.rules.find(r =>
    r.condition.errorType === errorType &&
    r.condition.numberRange &&
    r.condition.numberRange[0] === Math.min(...targetNumbers) &&
    r.condition.numberRange[1] === Math.max(...targetNumbers)
  );

  if (!rule) {
    rule = {
      condition: {
        errorType,
        numberRange: [Math.min(...targetNumbers), Math.max(...targetNumbers)],
      },
      preferredTypes: [],
      weight: 0.5,
      evidenceCount: 0,
    };
    currentPatterns.combinations.rules.push(rule);
  }

  // Update rule with new evidence
  for (const type of selectedTypes) {
    if (!rule.preferredTypes.includes(type)) {
      rule.preferredTypes.push(type);
    }
  }
  
  rule.evidenceCount += selections.length;
  rule.weight = Math.min(1.0, rule.weight + (selectedTypes.length / selections.length) * 0.1);

  return currentPatterns;
}

/**
 * Updates numerical weights based on selections
 */
async function updateWeights(
  variants: PackageVariant[],
  selections: Selection[],
  currentWeights: PreferenceWeights
): Promise<PreferenceWeights> {
  
  for (const selection of selections) {
    const variant = variants.find(v => v.id === selection.variantId);
    if (!variant) continue;

    const type = variant.paeckchenType;
    const difficulty = variant.difficulty;
    
    // Calculate reward
    let reward = selection.selected ? POSITIVE_REWARD : NEGATIVE_REWARD;
    
    // Adjust reward based on rating
    if (selection.rating) {
      reward *= (1 + (selection.rating - 3) * RATING_MULTIPLIER);
    }

    // Update paeckchen type weights
    if (!currentWeights.paeckchenTypeWeights[type]) {
      currentWeights.paeckchenTypeWeights[type] = 0;
    }
    
    currentWeights.paeckchenTypeWeights[type] += LEARNING_RATE * reward;
    
    // Clamp weights between -1 and 1
    currentWeights.paeckchenTypeWeights[type] = Math.max(
      -1,
      Math.min(1, currentWeights.paeckchenTypeWeights[type])
    );

    // Update difficulty preferences
    if (!currentWeights.difficultyPreferences[difficulty]) {
      currentWeights.difficultyPreferences[difficulty] = 0;
    }
    
    currentWeights.difficultyPreferences[difficulty] += LEARNING_RATE * reward * 0.5;
    currentWeights.difficultyPreferences[difficulty] = Math.max(
      -1,
      Math.min(1, currentWeights.difficultyPreferences[difficulty])
    );

    // Update number pattern weights
    const params = variant.generationParams as any;
    if (params.numbers) {
      const avgNumber = params.numbers.reduce((a: number, b: number) => a + b, 0) / params.numbers.length;
      const rangeKey = avgNumber < 10 ? 'small' : avgNumber < 15 ? 'medium' : 'large';
      
      if (!currentWeights.numberPatternWeights[rangeKey]) {
        currentWeights.numberPatternWeights[rangeKey] = 0;
      }
      
      currentWeights.numberPatternWeights[rangeKey] += LEARNING_RATE * reward * 0.3;
      currentWeights.numberPatternWeights[rangeKey] = Math.max(
        -1,
        Math.min(1, currentWeights.numberPatternWeights[rangeKey])
      );
    }
  }

  return currentWeights;
}

/**
 * Scores variants based on learned preferences (used for future predictions)
 */
export async function scoreVariantsWithPreferences(
  teacherId: string,
  variants: PackageVariant[],
  errorContext: { errorType: string; targetNumbers: number[] }
): Promise<Map<string, number>> {
  const network = await storage.getPreferenceNetwork(teacherId);
  const scores = new Map<string, number>();
  
  if (!network) {
    // No preferences yet, return neutral scores
    variants.forEach(v => scores.set(v.id, 0));
    return scores;
  }

  const patterns = network.patterns as any as PreferencePattern;
  const weights = network.weights as any as PreferenceWeights;

  for (const variant of variants) {
    let score = 0;
    
    // Base score from type weights
    const typeWeight = weights.paeckchenTypeWeights[variant.paeckchenType] || 0;
    score += typeWeight * 3; // Scale up for visibility

    // Score from difficulty preferences
    const diffWeight = weights.difficultyPreferences[variant.difficulty] || 0;
    score += diffWeight;

    // Score from conditional rules
    const matchingRules = patterns.combinations.rules.filter(rule => {
      if (rule.condition.errorType !== errorContext.errorType) return false;
      if (!rule.condition.numberRange) return true;
      
      const [min, max] = rule.condition.numberRange;
      return errorContext.targetNumbers.some(n => n >= min && n <= max);
    });

    for (const rule of matchingRules) {
      if (rule.preferredTypes.includes(variant.paeckchenType as PaeckchenType)) {
        score += rule.weight * 2;
      }
    }

    // Score from error type patterns
    const errorPattern = patterns.errorType[errorContext.errorType];
    if (errorPattern) {
      if (errorPattern.preferredTypes.includes(variant.paeckchenType as PaeckchenType)) {
        score += 2;
      }
      if (errorPattern.avoidedTypes.includes(variant.paeckchenType as PaeckchenType)) {
        score -= 2;
      }
    }

    scores.set(variant.id, score);
  }

  return scores;
}

/**
 * Gets recommendations based on learned preferences
 */
export async function getRecommendedVariants(
  teacherId: string,
  errorContext: { errorType: string; targetNumbers: number[] },
  limit: number = 3
): Promise<{ type: PaeckchenType; confidence: number }[]> {
  const network = await storage.getPreferenceNetwork(teacherId);
  
  if (!network) {
    return [];
  }

  const patterns = network.patterns as any as PreferencePattern;
  const errorPattern = patterns.errorType[errorContext.errorType];
  
  if (!errorPattern) {
    return [];
  }

  const recommendations: { type: PaeckchenType; confidence: number }[] = [];
  
  for (const type of errorPattern.preferredTypes) {
    const confidence = (network.weights as any).paeckchenTypeWeights[type] || 0;
    recommendations.push({ type, confidence });
  }

  return recommendations
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, limit);
}
