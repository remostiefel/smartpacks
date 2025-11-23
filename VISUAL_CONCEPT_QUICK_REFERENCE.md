# Visual Concept Quick Reference

**For Developers Working on SmartPacks**

---

## 📍 Component Locations

### Core Icon Library
```typescript
import { 
  // Math Error Icons
  BridgeIcon, ComplementaryPairsIcon, SymbolsConfusedIcon,
  
  // Spelling Strategy Icons  
  EarIcon, RuleBookIcon, PuzzleIcon, BrainIcon,
  
  // Vocabulary Mode Icons
  FlashcardIcon, MatchingIcon, PenIcon,
  
  // Self-Concept Icons
  TargetIcon, MuscleIcon, LightSwitchIcon, FlameIcon,
  
  // Creative Category Icons
  SportsIcon, ArtIcon, MusicIcon, NatureIcon
} from '@/components/smartpacks-icons';
```

### Data Visualizations
```typescript
import { NumberHeatmap } from '@/components/number-heatmap';
import { ErrorTimeline } from '@/components/error-timeline';
import { VocabularyPlantCard } from '@/components/vocabulary-plant-card';
import { DifficultyMountainCard } from '@/components/difficulty-mountain-card';
```

### UI Components
```typescript
import { LikertScale, StarRating } from '@/components/assessment-scales';
import { LoadingPulse, SuccessCheckmark } from '@/components/micro-interactions';
```

---

## 🎨 Icon Mappings

### Math Error Categories
| Error Type | Icon | Component |
|------------|------|-----------|
| `crossing_tens` | 🌉 Bridge | `BridgeIcon` |
| `complementary_pairs` | 🔄 Pairs | `ComplementaryPairsIcon` |
| `calculation_facts` | ❓ Confused | `SymbolsConfusedIcon` |
| `subtraction_borrowing` | ➕➖ Operations | `OperationsIcon` |
| `number_reversal` | 🔃 Reversal | `NumberReversalIcon` |
| `pattern_continuation` | 📊 Pattern Break | `PatternBreakIcon` |
| `place_value` | 🧊 Cubes | `CubesIcon` |

### Spelling Strategies
| Strategy | Icon | Component |
|----------|------|-----------|
| `lautgetreu` | 👂 Ear | `EarIcon` |
| `regelgeleitet` | 📖 Rule Book | `RuleBookIcon` |
| `morphematisch` | 🧩 Puzzle | `PuzzleIcon` |
| `merkwörter` | 🧠 Brain | `BrainIcon` |

### Self-Concept Dimensions
| Dimension | Icon | Component |
|-----------|------|-----------|
| `zielorientierung` | 🎯 Target | `TargetIcon` |
| `faehigkeitsselbstkonzept` | 💪 Muscle | `MuscleIcon` |
| `selbstwirksamkeit` | 💡 Light Switch | `LightSwitchIcon` |
| `engagement` | 🔥 Flame | `FlameIcon` |
| `lernstrategien` | 🧰 Toolbox | `ToolboxIcon` |
| `pruefungsangst` | 💓 Heart Pulse | `HeartPulseIcon` |
| `soziale_einbettung` | 👥 People Group | `PeopleGroupIcon` |
| `arbeitsvermeidung` | 🐌🐰 Snail Rabbit | `SnailRabbitIcon` |

---

## 🔧 Usage Patterns

### Basic Icon Usage
```typescript
import { BridgeIcon } from '@/components/smartpacks-icons';

// With default styling
<BridgeIcon className="w-6 h-6" />

// With custom colors
<BridgeIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
```

### Data Visualization with Lazy Loading
```typescript
import { lazy, Suspense } from 'react';

const NumberHeatmap = lazy(() => import('@/components/number-heatmap'));

// In component
{studentErrors.length > 0 && (
  <Suspense fallback={<Skeleton className="h-64 w-full" />}>
    <NumberHeatmap errors={studentErrors} />
  </Suspense>
)}
```

### Assessment Scales
```typescript
import { LikertScale } from '@/components/assessment-scales';

<LikertScale
  value={3}
  onChange={(val) => console.log(val)}
  label="How confident do you feel?"
/>
```

---

## 🎯 Integration Examples

### Math Tab
```typescript
// In StudentDetail Math Tab
import { NumberHeatmap, ErrorTimeline } from '@/components/...';

const MathTab = ({ studentId }) => {
  const { data: errors } = useQuery({ 
    queryKey: ['/api/students', studentId, 'errors'] 
  });

  return (
    <>
      {errors?.length > 0 && (
        <>
          <Suspense fallback={<Skeleton className="h-64" />}>
            <NumberHeatmap errors={errors} />
          </Suspense>
          
          <Suspense fallback={<Skeleton className="h-64" />}>
            <ErrorTimeline errors={errors} />
          </Suspense>
        </>
      )}
    </>
  );
};
```

### English Tab
```typescript
import { VocabularyPlantCard } from '@/components/vocabulary-plant-card';

const EnglishTab = ({ studentId }) => {
  const { data: vocabulary } = useQuery({ 
    queryKey: ['/api/students', studentId, 'vocabulary'] 
  });

  return (
    <Suspense fallback={<Skeleton className="h-80" />}>
      <VocabularyPlantCard vocabulary={vocabulary || []} />
    </Suspense>
  );
};
```

---

## 🎨 Color Palettes (Colorblind-Friendly)

### Available Palettes
```typescript
import { colorblindPalettes } from '@/components/accessibility-patterns';

// Default palette
colorblindPalettes.default // Blue-orange

// Other options
colorblindPalettes.deuteranopia // Teal-gold
colorblindPalettes.protanopia // Blue-yellow
colorblindPalettes.tritanopia // Magenta-lime
```

### Usage in Charts
```typescript
import { Recharts } from 'recharts';

<Bar dataKey="value" fill={colorblindPalettes.default[0]} />
```

---

## 📊 Data Transformation Patterns

### StudentError → TimelineError
```typescript
interface TimelineError {
  id: string;
  date: Date;
  errorType: string;
  task: string;
  isCorrect: boolean;
}

const transformToTimeline = (errors: StudentError[]): TimelineError[] => {
  return errors.map(error => ({
    id: error.id,
    date: new Date(error.createdAt),
    errorType: error.errorType,
    task: error.task,
    isCorrect: error.isCorrect
  }));
};
```

### Vocabulary → Plant Stages
```typescript
const getPlantStage = (vocabulary: VocabularyWord) => {
  const daysSinceCreation = differenceInDays(new Date(), vocabulary.createdAt);
  
  if (daysSinceCreation < 1) return 'seed';
  if (daysSinceCreation < 3) return 'sprout';
  if (daysSinceCreation < 7) return 'plant';
  if (daysSinceCreation < 14) return 'flower';
  return 'tree';
};
```

---

## ⚡ Performance Tips

1. **Always use lazy loading for visualizations**
   ```typescript
   const Chart = lazy(() => import('./chart'));
   ```

2. **Memoize expensive calculations**
   ```typescript
   const processedData = useMemo(() => {
     return transformData(rawData);
   }, [rawData]);
   ```

3. **Conditional rendering to avoid empty states**
   ```typescript
   {data.length > 0 && <Visualization data={data} />}
   ```

4. **Use Suspense with meaningful fallbacks**
   ```typescript
   <Suspense fallback={<Skeleton className="h-64 w-full" />}>
     <Component />
   </Suspense>
   ```

---

## 🚫 Common Pitfalls to Avoid

### ❌ DON'T
```typescript
// Don't use emojis
<span>🎯</span>

// Don't hardcode colors without dark mode
<div className="bg-blue-500">

// Don't skip accessibility
<button>Click me</button>

// Don't use non-existent icons
import { PowerIcon } from '@/components/smartpacks-icons';
```

### ✅ DO
```typescript
// Use SVG icons
<TargetIcon className="w-6 h-6" />

// Include dark mode variants
<div className="bg-blue-500 dark:bg-blue-600">

// Add proper labels
<button data-testid="button-submit" aria-label="Submit form">
  Click me
</button>

// Use correct icon names
import { LightSwitchIcon } from '@/components/smartpacks-icons';
```

---

## 📝 Accessibility Checklist

- [ ] All interactive elements have `data-testid` attributes
- [ ] Icons have proper ARIA labels when standalone
- [ ] Color is not the only means of conveying information
- [ ] Charts include text alternatives or data tables
- [ ] Animations respect `prefers-reduced-motion`
- [ ] Keyboard navigation works for all interactions
- [ ] Contrast ratios meet WCAG AA standards

---

## 🔍 Debugging Tips

### Check Icon Mapping
```typescript
// Verify icon exists
import { mathErrorIcons } from '@/components/smartpacks-icons';
console.log(mathErrorIcons['crossing_tens']); // Should be BridgeIcon
```

### Verify Data Format
```typescript
// Check data structure
console.log('Errors:', errors);
console.log('Transformed:', transformToTimeline(errors));
```

### Test Lazy Loading
```typescript
// Monitor component loading
<Suspense fallback={<div>Loading... (check this renders)</div>}>
  <Component />
</Suspense>
```

---

## 📚 Further Reading

- **Main Documentation**: `replit.md` (Visual Concept System section)
- **Implementation Summary**: `Visual_Konzept_Implementation_Summary.md`
- **Original Spec**: `Visual_Konzept_Bilder_Icons.md`

---

**Last Updated**: October 14, 2025  
**Status**: Production Ready ✅
