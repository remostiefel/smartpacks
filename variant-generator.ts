import {
  PaeckchenType,
  PAECKCHEN_TEMPLATES,
  selectPaeckchenTypeForError,
  GeneratedPaeckchen,
  generateConstantSumPaeckchen,
  generateDecompositionPaeckchen,
  generateInverseTasksPaeckchen,
  generateExchangeTasksPaeckchen,
  generateErrorResearchPaeckchen,
  generatePatternAnalysisPaeckchen,
  generateDigitDetectivePaeckchen,
  generateContinuationChallengePaeckchen,
  generateOperationContrastPaeckchen,
} from './paeckchen-library';

export interface ErrorContext {
  errorType: string;
  targetNumbers: number[];
  studentContext?: {
    level?: 'low' | 'medium' | 'high';
    age?: number;
  };
}

export interface PackageVariantData {
  paeckchenType: PaeckchenType;
  generatedContent: GeneratedPaeckchen;
  generationParams: {
    numbers: number[];
    strategy: string;
    variations: Record<string, any>;
  };
  difficulty: 'easy' | 'medium' | 'hard';
}

/**
 * Generates 6-8 different package variants for a given error context
 * This is the core of the training system - it creates diverse options for teachers to choose from
 */
export function generatePackageVariants(context: ErrorContext): PackageVariantData[] {
  const variants: PackageVariantData[] = [];
  const { errorType, targetNumbers } = context;
  
  // Get recommended package types for this error
  const recommendedTypes = selectPaeckchenTypeForError(errorType);
  
  // Extract primary numbers for generation
  const primaryNumber = targetNumbers[0] || 8;
  const secondaryNumber = targetNumbers[1] || 5;
  const sum = primaryNumber + secondaryNumber;
  
  // Strategy 1: Generate variants using recommended types with different numbers
  for (let i = 0; i < Math.min(3, recommendedTypes.length); i++) {
    const type = recommendedTypes[i];
    const variant = generateVariantForType(type, primaryNumber, secondaryNumber, sum);
    if (variant) {
      variants.push(variant);
    }
  }
  
  // Strategy 2: Generate variants with different number combinations
  if (targetNumbers.length >= 2) {
    const altNumber1 = targetNumbers[1] || primaryNumber + 1;
    const altNumber2 = targetNumbers[0] || Math.max(1, secondaryNumber - 1);
    const altSum = altNumber1 + altNumber2;
    
    // Use first recommended type with alternative numbers
    if (recommendedTypes[0]) {
      const variant = generateVariantForType(recommendedTypes[0], altNumber1, altNumber2, altSum);
      if (variant) {
        variant.generationParams.strategy = 'alternative_numbers';
        variants.push(variant);
      }
    }
  }
  
  // Strategy 3: Generate variants with different difficulty levels
  if (recommendedTypes.length > 1) {
    // Easier variant (smaller numbers)
    const easyNum1 = Math.max(2, Math.floor(primaryNumber * 0.7));
    const easyNum2 = Math.max(2, Math.floor(secondaryNumber * 0.7));
    const easyVariant = generateVariantForType(recommendedTypes[1], easyNum1, easyNum2, easyNum1 + easyNum2);
    if (easyVariant) {
      easyVariant.difficulty = 'easy';
      easyVariant.generationParams.strategy = 'simplified';
      variants.push(easyVariant);
    }
    
    // Harder variant (larger numbers)
    const hardNum1 = Math.min(20, Math.ceil(primaryNumber * 1.3));
    const hardNum2 = Math.min(20, Math.ceil(secondaryNumber * 1.3));
    const hardVariant = generateVariantForType(recommendedTypes[0], hardNum1, hardNum2, hardNum1 + hardNum2);
    if (hardVariant) {
      hardVariant.difficulty = 'hard';
      hardVariant.generationParams.strategy = 'increased_complexity';
      variants.push(hardVariant);
    }
  }
  
  // Strategy 4: Add complementary types (not just recommended ones)
  const complementaryTypes = getComplementaryTypes(errorType, recommendedTypes);
  for (const type of complementaryTypes.slice(0, 2)) {
    const variant = generateVariantForType(type, primaryNumber, secondaryNumber, sum);
    if (variant) {
      variant.generationParams.strategy = 'complementary_approach';
      variants.push(variant);
    }
  }
  
  // Ensure we have 6-8 variants
  while (variants.length < 6 && recommendedTypes.length > 0) {
    const randomType = recommendedTypes[Math.floor(Math.random() * recommendedTypes.length)];
    const randomNum1 = Math.floor(Math.random() * 10) + 5;
    const randomNum2 = Math.floor(Math.random() * 10) + 3;
    const variant = generateVariantForType(randomType, randomNum1, randomNum2, randomNum1 + randomNum2);
    if (variant && !variants.some(v => areVariantsSimilar(v, variant))) {
      variants.push(variant);
    }
  }
  
  return variants.slice(0, 8);
}

/**
 * Generates a single variant for a specific package type
 */
function generateVariantForType(
  type: PaeckchenType,
  num1: number,
  num2: number,
  sum: number
): PackageVariantData | null {
  let generatedContent: GeneratedPaeckchen;
  const template = PAECKCHEN_TEMPLATES[type];
  
  try {
    switch (type) {
      case 'constant_sum':
        generatedContent = generateConstantSumPaeckchen(sum, num1);
        break;
      
      case 'opposing_change':
        generatedContent = generateOpposingChangePaeckchen(num1, num2);
        break;
      
      case 'same_direction':
        generatedContent = generateSameDirectionPaeckchen(num1, num2);
        break;
      
      case 'crossing_tens':
        generatedContent = generateCrossingTensPaeckchen(num1);
        break;
      
      case 'decomposition_steps':
        generatedContent = generateDecompositionPaeckchen(sum, num2);
        break;
      
      case 'inverse_tasks':
        generatedContent = generateInverseTasksPaeckchen(num1, num2);
        break;
      
      case 'exchange_tasks':
        generatedContent = generateExchangeTasksPaeckchen([[num1, num2], [num2, num1]]);
        break;
      
      case 'error_research':
        const problems = [
          `${num1}+${num2}=___`, 
          `${num1+1}+${Math.max(0, num2-1)}=___`, 
          `${num1+2}+${Math.max(0, num2-2)}=___`
        ];
        generatedContent = generateErrorResearchPaeckchen(problems, sum);
        break;
      
      case 'pattern_analysis':
        const patternProblems = [
          `${num1}+${num2}=${sum}`, 
          `${num1+1}+${Math.max(0, num2-1)}=${sum}`, 
          `${num1+2}+${Math.max(0, num2-2)}=${sum}`
        ];
        generatedContent = generatePatternAnalysisPaeckchen(patternProblems, true);
        break;
      
      case 'digit_detective':
        generatedContent = generateDigitDetectivePaeckchen(sum);
        break;
      
      case 'continuation_challenge':
        const challengeProblems = [`${num1}+${num2}=___`, `${num1+1}+${num2+1}=___`];
        generatedContent = generateContinuationChallengePaeckchen(challengeProblems);
        break;
      
      case 'operation_contrast':
        generatedContent = generateOperationContrastPaeckchen(num1, num2);
        break;
      
      case 'number_reversal_demo':
        generatedContent = {
          title: 'Reihenfolge beachten!',
          instructions: 'Bei Subtraktion ist die Reihenfolge wichtig.',
          problems: [`${num1} - ${num2} = ___`, `${num2} - ${num1} = ???`],
          reflectionQuestions: ['Warum sind die Ergebnisse unterschiedlich?'],
          sentenceStems: template.languagePatterns,
        };
        break;
      
      default:
        return null;
    }
    
    return {
      paeckchenType: type,
      generatedContent,
      generationParams: {
        numbers: [num1, num2, sum],
        strategy: 'standard',
        variations: {
          baseNumber: num1,
          secondNumber: num2,
          targetSum: sum,
        },
      },
      difficulty: template.difficulty,
    };
  } catch (error) {
    console.error(`Error generating variant for type ${type}:`, error);
    return null;
  }
}

/**
 * Gets complementary package types that aren't in the recommended list
 * but might provide useful alternative perspectives
 */
function getComplementaryTypes(errorType: string, recommendedTypes: PaeckchenType[]): PaeckchenType[] {
  const allTypes: PaeckchenType[] = [
    'constant_sum',
    'opposing_change',
    'same_direction',
    'crossing_tens',
    'decomposition_steps',
    'inverse_tasks',
    'exchange_tasks',
    'error_research',
    'pattern_analysis',
    'digit_detective',
    'continuation_challenge',
    'operation_contrast',
    'number_reversal_demo',
  ];
  
  // Filter out recommended types
  const complementary = allTypes.filter(t => !recommendedTypes.includes(t));
  
  // Prioritize certain types based on error category
  const priorityMap: Record<string, PaeckchenType[]> = {
    zehnuebergang_addition: ['inverse_tasks', 'exchange_tasks'],
    zehnuebergang_subtraction: ['inverse_tasks', 'decomposition_steps'],
    complementary_pairs: ['crossing_tens', 'same_direction'],
    calculation_facts: ['error_research', 'pattern_analysis'],
    number_reversal: ['operation_contrast', 'number_reversal_demo'],
    operation_confusion: ['operation_contrast', 'inverse_tasks'],
  };
  
  const priorityTypes = priorityMap[errorType] || [];
  const prioritized = priorityTypes.filter(t => complementary.includes(t));
  const remaining = complementary.filter(t => !prioritized.includes(t));
  
  return [...prioritized, ...remaining];
}

/**
 * Checks if two variants are too similar (to avoid duplicates)
 */
function areVariantsSimilar(v1: PackageVariantData, v2: PackageVariantData): boolean {
  if (v1.paeckchenType !== v2.paeckchenType) {
    return false;
  }
  
  const nums1 = v1.generationParams.numbers;
  const nums2 = v2.generationParams.numbers;
  
  // Check if numbers are very similar (within 2)
  return nums1.every((n, i) => Math.abs(n - (nums2[i] || 0)) < 2);
}

/**
 * Scores a variant based on context preferences (used later by learning algorithm)
 */
export function scoreVariant(
  variant: PackageVariantData,
  context: ErrorContext,
  preferences?: any
): number {
  let score = 0;
  
  // Base score from template difficulty matching student level
  const studentLevel = context.studentContext?.level || 'medium';
  if (variant.difficulty === 'easy' && studentLevel === 'low') score += 3;
  if (variant.difficulty === 'medium' && studentLevel === 'medium') score += 3;
  if (variant.difficulty === 'hard' && studentLevel === 'high') score += 3;
  
  // Additional scoring based on preferences (will be populated by learning algorithm)
  if (preferences?.paeckchenTypeWeights?.[variant.paeckchenType]) {
    score += preferences.paeckchenTypeWeights[variant.paeckchenType];
  }
  
  return score;
}

// Helper functions for additional package types not exported from paeckchen-library

function generateOpposingChangePaeckchen(minuend: number, startSubtrahend: number): GeneratedPaeckchen {
  const problems: string[] = [];
  
  for (let i = 0; i < 5; i++) {
    const subtrahend = Math.max(0, startSubtrahend - i);
    const result = minuend - subtrahend;
    if (result >= 0) {
      problems.push(`${minuend} - ${subtrahend} = ___`);
    }
  }
  
  return {
    title: 'Gegensinnige Veränderung',
    instructions: 'Die erste Zahl bleibt gleich. Was passiert mit dem Ergebnis?',
    problems,
    patternHint: 'Erste Zahl =, zweite Zahl ↓-1 → Ergebnis ↑+1',
    reflectionQuestions: [
      'Was passiert mit dem Ergebnis, wenn die zweite Zahl kleiner wird?',
      'Warum wird das Ergebnis größer?'
    ],
    sentenceStems: PAECKCHEN_TEMPLATES.opposing_change.languagePatterns,
  };
}

function generateSameDirectionPaeckchen(startNum1: number, startNum2: number): GeneratedPaeckchen {
  const problems: string[] = [];
  
  const safeStartNum1 = Math.max(0, startNum1);
  const safeStartNum2 = Math.max(0, startNum2);
  
  for (let i = 0; i < 5; i++) {
    const num1 = safeStartNum1 + i;
    const num2 = safeStartNum2 + i;
    const sum = num1 + num2;
    problems.push(`${num1} + ${num2} = ___`);
  }
  
  return {
    title: 'Gleichsinnige Veränderung',
    instructions: 'Beide Zahlen werden größer. Was passiert mit der Summe?',
    problems,
    patternHint: 'Beide ↑+1 → Summe ↑+2',
    reflectionQuestions: [
      'Um wie viel wird das Ergebnis größer?',
      'Was passiert, wenn beide Zahlen um 1 wachsen?'
    ],
    sentenceStems: PAECKCHEN_TEMPLATES.same_direction.languagePatterns,
  };
}

function generateCrossingTensPaeckchen(baseNum: number): GeneratedPaeckchen {
  const problems: string[] = [];
  const safeBaseNum = Math.max(0, Math.min(9, baseNum));
  const complement = 10 - safeBaseNum;
  
  for (let i = 0; i <= 5; i++) {
    const addend = complement + i;
    if (addend >= 0 && addend <= 20) {
      problems.push(`${safeBaseNum} + ${addend} = ___`);
    }
  }
  
  return {
    title: 'Zehnerübergang meistern',
    instructions: 'Rechne über den Zehner. Nutze die Zerlegung zur 10.',
    problems,
    patternHint: `Erste zur 10: ${baseNum} + ${complement} = 10, dann weiter`,
    reflectionQuestions: [
      'Wie hilft dir die 10 beim Rechnen?',
      `Wie zerlegst du ${complement + 3}, um über die 10 zu kommen?`
    ],
    sentenceStems: PAECKCHEN_TEMPLATES.crossing_tens.languagePatterns,
  };
}
