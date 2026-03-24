// BMI Calculator — Pure scoring functions and clinical content
// Formula: BMI = weight (kg) / [height (m)]²

export interface BmiCategory {
  label: string
  minBmi: number
  maxBmi: number
  severity: 'info' | 'normal' | 'mild' | 'moderate' | 'severe'
}

export interface BmiResult {
  bmi: number
  category: BmiCategory
  idealWeightMin: number
  idealWeightMax: number
}

export interface WeightPlanPoint {
  week: number
  weight: number
}

export interface WeightPlanResult {
  startWeight: number
  targetWeight: number
  weeks: number
  weeklyChange: number
  points: WeightPlanPoint[]
}

// WHO BMI classification (Danish labels)
export const BMI_CATEGORIES: BmiCategory[] = [
  { label: 'Undervægtig', minBmi: 0, maxBmi: 18.5, severity: 'info' },
  { label: 'Normalvægtig', minBmi: 18.5, maxBmi: 25.0, severity: 'normal' },
  { label: 'Overvægtig', minBmi: 25.0, maxBmi: 30.0, severity: 'mild' },
  { label: 'Fedme, klasse I', minBmi: 30.0, maxBmi: 35.0, severity: 'moderate' },
  { label: 'Fedme, klasse II', minBmi: 35.0, maxBmi: 40.0, severity: 'severe' },
  { label: 'Fedme, klasse III', minBmi: 40.0, maxBmi: 10000, severity: 'severe' },
]

export function calculateBmi(heightCm: number, weightKg: number): number {
  if (heightCm <= 0) return 0
  return weightKg / (heightCm * heightCm / 10000)
}

export function getBmiCategory(bmi: number): BmiCategory {
  for (const cat of BMI_CATEGORIES) {
    if (bmi >= cat.minBmi && bmi < cat.maxBmi) {
      return cat
    }
  }
  return BMI_CATEGORIES[BMI_CATEGORIES.length - 1]
}

export function calculateIdealWeight(heightCm: number): { min: number, max: number } {
  const heightM2 = heightCm * heightCm / 10000
  return {
    min: Number((18.5 * heightM2).toFixed(1)),
    max: Number((25.0 * heightM2).toFixed(1)),
  }
}

export function calculateBmiResult(heightCm: number, weightKg: number): BmiResult {
  const bmi = calculateBmi(heightCm, weightKg)
  const category = getBmiCategory(bmi)
  const ideal = calculateIdealWeight(heightCm)
  return {
    bmi,
    category,
    idealWeightMin: ideal.min,
    idealWeightMax: ideal.max,
  }
}

export function calculateWeightPlan(
  currentWeight: number,
  weightChange: number,
  weeks: number
): WeightPlanResult {
  const targetWeight = currentWeight + weightChange
  const weeklyChange = weeks > 0 ? weightChange / weeks : 0
  const points: WeightPlanPoint[] = []

  for (let i = 0; i <= weeks; i++) {
    points.push({
      week: i,
      weight: Number((currentWeight + i * weeklyChange).toFixed(1)),
    })
  }

  return { startWeight: currentWeight, targetWeight, weeks, weeklyChange, points }
}

export function formatBmiRange(cat: BmiCategory): string {
  if (cat.maxBmi >= 10000) return `${cat.minBmi.toFixed(1)} +`
  return `${cat.minBmi.toFixed(1)} – ${cat.maxBmi.toFixed(1)}`
}

export const bmiConfig = {
  name: 'Body Mass Index',
  shortName: 'BMI',
  defaultHeight: 177,
  defaultWeight: 77,
  defaultWeightChange: -3,
  defaultWeeks: 10,
  minHeight: 100,
  maxHeight: 220,
  minWeight: 10,
  maxWeight: 200,
  minWeightChange: -150,
  maxWeightChange: 50,
  minWeeks: 1,
  maxWeeks: 52,
}
