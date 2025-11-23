
// Feature Flags für schrittweises Rollout
export const featureFlags = {
  livingLifeModule: process.env.ENABLE_LIVING_LIFE === 'true',
  newGeneratorTraining: process.env.ENABLE_NEW_GENERATOR === 'true',
  // weitere Features...
};

export function isFeatureEnabled(feature: keyof typeof featureFlags): boolean {
  return featureFlags[feature] ?? false;
}
