/**
 * Utility functions for gender display
 */

export type GenderValue = 'male' | 'female';

/**
 * Gender display mapping for Danish UI
 */
export const genderDisplayMap = {
  'male': 'Mand',
  'female': 'Kvinde'
} as const;

/**
 * Child gender display mapping for Danish UI
 */
export const childGenderDisplayMap = {
  'male': 'Dreng', 
  'female': 'Pige'
} as const;

/**
 * Get Danish gender label for display
 * @param gender - The gender value ('male' | 'female')
 * @param isChild - Whether this is for a child (≤16 years old)
 * @returns Danish gender label
 */
export function getGenderLabel(gender: GenderValue, isChild: boolean = false): string {
  if (isChild) {
    return childGenderDisplayMap[gender] || gender;
  }
  return genderDisplayMap[gender] || gender;
}

/**
 * Get Danish gender label for display with age check
 * @param gender - The gender value ('male' | 'female')
 * @param age - The age to determine if child labels should be used
 * @returns Danish gender label
 */
export function getGenderLabelByAge(gender: GenderValue, age: number | null | undefined): string {
  return getGenderLabel(gender, typeof age === 'number' ? age <= 16 : false);
}
}