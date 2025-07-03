import scoreDataJson from './score2_data.json';

interface ScoreData {
  "female": GenderData;
  "male": GenderData;
}

interface GenderData {
  "Ikke-ryger": SmokingData;
  'Ryger': SmokingData;
}

interface SmokingData {
  "LDL-kolesterol": {
    [key: string]: AgeGroupData;
  };
}

interface AgeGroupData {
  [key: string]: BloodPressureData;
}

interface BloodPressureData {
  "160-179": number;
  "140-159": number;
  "120-139": number;
  "100-119": number;
}

const scoreData: ScoreData = scoreDataJson as ScoreData;

function getAgeGroup(age: number): string {
  if (age >= 85) return '85-89';
  if (age >= 80) return '80-84';
  if (age >= 75) return '75-79';
  if (age >= 70) return '70-74';
  if (age >= 65) return '65-69';
  if (age >= 60) return '60-64';
  if (age >= 55) return '55-59';
  if (age >= 50) return '50-54';
  if (age >= 45) return '45-49';
  return '40-44';
}

function getBPGroup(sysBP: number): '160-179' | '140-159' | '120-139' | '100-119' {
  if (sysBP >= 160) return '160-179';
  if (sysBP >= 140) return '140-159';
  if (sysBP >= 120) return '120-139';
  return '100-119';
}

function getLDLGroup(ldl: number): string {
  if (ldl >= 5.2) return '5.2-6.1';
  if (ldl >= 4.2) return '4.2-5.1';
  if (ldl >= 3.2) return '3.2-4.1';
  return '2.2-3.1';
}

function getSmokingGroup(smoking: boolean): 'Ikke-ryger' | 'Ryger' {
  return (smoking) ? 'Ryger' : 'Ikke-ryger';
 
}

export function filterByAgeGroup(
  gender: 'male' | 'female',
  smokerStatus: 'Ikke-ryger' | 'Ryger',
  ageGroup: string
): { [ldlRange: string]: BloodPressureData } | undefined {
  const genderData = scoreData[gender];
  if (!genderData) return undefined;

  const smokerData = genderData[smokerStatus];
  if (!smokerData) return undefined;

  const filteredData: { [ldlRange: string]: BloodPressureData } = {};

  for (const ldlRange in smokerData["LDL-kolesterol"]) {
    const ldlData = smokerData["LDL-kolesterol"][ldlRange];
    if (ldlData && ldlData[ageGroup]) {
      filteredData[ldlRange] = ldlData[ageGroup];
    }
  }

  return filteredData;
}

export function calculateRisk(gender: 'female' | 'male', age: number, smoker: boolean, sysBP: number, ldl: number): number {
  const ageGroup = getAgeGroup(age);
  const bpGroup = getBPGroup(sysBP);
  const ldlGroup = getLDLGroup(ldl);
  const smokingGroup = getSmokingGroup(smoker);

  if (
    scoreData[gender] &&
    scoreData[gender][smokingGroup] &&
    scoreData[gender][smokingGroup]['LDL-kolesterol'][ldlGroup] &&
    scoreData[gender][smokingGroup]['LDL-kolesterol'][ldlGroup][ageGroup]
  ) {
    return scoreData[gender][smokingGroup]['LDL-kolesterol'][ldlGroup][ageGroup][bpGroup];
  } else {
    return -1;
  }
}
